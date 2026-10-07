"use client";

import { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import * as THREE from "three";
import { VERT, FRAG } from "@/lib/shaders";
import { FILM } from "@/lib/config";

export interface FilmHandle {
  /** seek to normalized progress 0..1 (frame-snapped) */
  setProgress: (p: number) => void;
  /** pointer position in uv space + activity strength */
  setPointer: (x: number, y: number, str: number) => void;
  /** smoothed scroll velocity */
  setVelocity: (v: number) => void;
  /** horizontal focal point 0..1 for cover crop */
  setFocus: (x: number) => void;
  ready: () => boolean;
}

interface Props {
  onLoadProgress: (ratio: number) => void;
  onReady: () => void;
  reducedMotion: boolean;
}

const FilmCanvas = forwardRef<FilmHandle, Props>(function FilmCanvas(
  { onLoadProgress, onReady, reducedMotion },
  ref
) {
  const holderRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const uniformsRef = useRef<Record<string, THREE.IUniform> | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const fallbackRef = useRef(false);
  const currentFrame = useRef(-1);
  const pointerTarget = useRef({ x: 0.5, y: 0.5, str: 0 });
  const pointerSmooth = useRef({ x: 0.5, y: 0.5, str: 0 });
  const velTarget = useRef(0);
  const velSmooth = useRef(0);
  const focusTarget = useRef(0.5);
  const focusSmooth = useRef(0.5);
  const readyFired = useRef(false);
  const loadCb = useRef(onLoadProgress);
  const readyCb = useRef(onReady);
  loadCb.current = onLoadProgress;
  readyCb.current = onReady;

  const setProgress = useCallback((p: number) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    const f = Math.round(THREE.MathUtils.clamp(p, 0, 1) * (FILM.frames - 1));
    if (f === currentFrame.current) return;
    currentFrame.current = f;
    const t = Math.min(f / FILM.fps, v.duration - 0.001);
    if (Math.abs(v.currentTime - t) > 0.0005) v.currentTime = t;
  }, []);

  const setPointer = useCallback((x: number, y: number, str: number) => {
    pointerTarget.current = { x, y, str };
  }, []);

  const setVelocity = useCallback((v: number) => {
    velTarget.current = THREE.MathUtils.clamp(v, -1, 1);
  }, []);

  const setFocus = useCallback((x: number) => {
    focusTarget.current = THREE.MathUtils.clamp(x, 0, 1);
  }, []);

  useImperativeHandle(ref, () => ({
    setProgress,
    setPointer,
    setVelocity,
    setFocus,
    ready: () => readyFired.current,
  }), [setProgress, setPointer, setVelocity, setFocus]);

  useEffect(() => {
    const holder = holderRef.current;
    if (!holder) return;
    const reduced =
      reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- video element (single source, never plays) ----------------------
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";
    video.poster = FILM.poster;
    const s1 = document.createElement("source");
    s1.src = FILM.mp4;
    s1.type = "video/mp4";
    const s2 = document.createElement("source");
    s2.src = FILM.webm;
    s2.type = "video/webm";
    video.appendChild(s1);
    video.appendChild(s2);
    videoRef.current = video;
    (window as unknown as { __filmVideo?: HTMLVideoElement }).__filmVideo = video;

    const onProgress = () => {
      try {
        if (video.duration && video.buffered.length) {
          loadCb.current(video.buffered.end(video.buffered.length - 1) / video.duration);
        }
      } catch { /* noop */ }
    };
    video.addEventListener("progress", onProgress);

    // ---- WebGL ------------------------------------------------------------
    let renderer: THREE.WebGLRenderer | null = null;
    let fallbackVideo: HTMLVideoElement | null = null;

    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: "high-performance",
      });
    } catch {
      fallbackRef.current = true;
    }
    if (renderer && !renderer.getContext()) {
      fallbackRef.current = true;
      renderer.dispose();
      renderer = null;
    }

    let cleanup: () => void = () => {};

    if (renderer) {
      rendererRef.current = renderer;
      const isMobile = window.matchMedia("(max-width: 768px)").matches;
      const dprCap = isMobile ? 1.5 : 1.75;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
      renderer.setClearColor(new THREE.Color("#FDFCFF"), 1);
      const canvas = renderer.domElement;
      canvas.style.position = "absolute";
      canvas.style.inset = "0";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      holder.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const texture = new THREE.VideoTexture(video);
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;

      const uniforms: Record<string, THREE.IUniform> = {
        uTex: { value: texture },
        uRes: { value: new THREE.Vector2(1, 1) },
        uVideoRes: { value: new THREE.Vector2(800, 448) },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uMouseStr: { value: 0 },
        uVel: { value: 0 },
        uTime: { value: 0 },
        uGrain: { value: reduced ? 0 : 0.018 },
        uReduced: { value: reduced ? 1 : 0 },
        uFocus: { value: new THREE.Vector2(0.5, 0.5) },
      };
      uniformsRef.current = uniforms;

      const mat = new THREE.ShaderMaterial({
        vertexShader: VERT,
        fragmentShader: FRAG,
        uniforms,
        depthTest: false,
        depthWrite: false,
      });
      const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
      scene.add(quad);

      const resize = () => {
        const w = holder.clientWidth || 1;
        const h = holder.clientHeight || 1;
        renderer!.setSize(w, h, false);
        uniforms.uRes.value.set(w * renderer!.getPixelRatio(), h * renderer!.getPixelRatio());
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(holder);

      let raf = 0;
      let last = performance.now();
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        const dt = Math.min((now - last) / 1000, 0.05);
        last = now;

        const ps = pointerSmooth.current;
        const pt = pointerTarget.current;
        ps.x += (pt.x - ps.x) * 0.08;
        ps.y += (pt.y - ps.y) * 0.08;
        ps.str += (pt.str - ps.str) * 0.06;
        // pointer activity decays on its own; target refreshed on move
        pt.str *= 0.985;

        velSmooth.current += (velTarget.current - velSmooth.current) * 0.08;
        velTarget.current *= 0.94; // settle when scrolling stops

        focusSmooth.current += (focusTarget.current - focusSmooth.current) * 0.05;
        uniforms.uFocus.value.set(focusSmooth.current, 0.5);

        uniforms.uMouse.value.set(ps.x, ps.y);
        uniforms.uMouseStr.value = ps.str;
        uniforms.uVel.value = velSmooth.current;
        uniforms.uTime.value += dt;

        renderer!.render(scene, camera);
      };
      raf = requestAnimationFrame(loop);

      const onVis = () => {
        if (document.hidden) {
          cancelAnimationFrame(raf);
        } else {
          last = performance.now();
          raf = requestAnimationFrame(loop);
        }
      };
      document.addEventListener("visibilitychange", onVis);

      const fireReady = () => {
        if (readyFired.current) return;
        readyFired.current = true;
        currentFrame.current = 0;
        video.currentTime = 0.001;
        readyCb.current();
      };
      const onData = () => fireReady();
      if (video.readyState >= 2) fireReady();
      else {
        video.addEventListener("loadeddata", onData, { once: true });
        video.addEventListener("canplay", onData, { once: true });
      }
      // safety: never trap the user on the preloader
      const safety = window.setTimeout(fireReady, 6000);

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        video.removeEventListener("progress", onProgress);
        video.removeEventListener("loadeddata", onData);
        video.removeEventListener("canplay", onData);
        window.clearTimeout(safety);
        texture.dispose();
        mat.dispose();
        quad.geometry.dispose();
        renderer!.dispose();
        canvas.remove();
      };
    } else {
      // ---- CSS fallback: hue-rotate the blue artwork toward violet --------
      fallbackVideo = video;
      video.style.position = "absolute";
      video.style.inset = "0";
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";
      video.style.filter = "hue-rotate(52deg) saturate(0.82) brightness(1.03)";
      holder.appendChild(video);
      const fireReady = () => {
        if (readyFired.current) return;
        readyFired.current = true;
        currentFrame.current = 0;
        video.currentTime = 0.001;
        readyCb.current();
      };
      if (video.readyState >= 2) fireReady();
      else video.addEventListener("canplay", fireReady, { once: true });
      const safety = window.setTimeout(fireReady, 9000);
      cleanup = () => {
        video.removeEventListener("progress", onProgress);
        window.clearTimeout(safety);
        video.remove();
      };
    }

    return () => cleanup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={holderRef} className="absolute inset-0" aria-hidden="true" />;
});

export default FilmCanvas;
