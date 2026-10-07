"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import FilmCanvas, { type FilmHandle } from "./FilmCanvas";
import Preloader from "./Preloader";
import Cursor from "./Cursor";
import MenuOverlay from "./MenuOverlay";
import { CHAPTERS, FILM } from "@/lib/config";

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const [loadRatio, setLoadRatio] = useState(0);
  const [fontsReady, setFontsReady] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [exited, setExited] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const filmWrapRef = useRef<HTMLDivElement>(null);
  const behindRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const indNumRef = useRef<HTMLSpanElement>(null);
  const indLabelRef = useRef<HTMLSpanElement>(null);
  const indBarRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const uiBottomRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<FilmHandle>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const reducedRef = useRef(false);

  const done = videoReady && fontsReady;

  useEffect(() => {
    document.fonts.ready.then(() => setFontsReady(true));
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  // ---- hero entrance, right after the preloader wipes away ---------------
  const handleExited = useCallback(() => {
    setExited(true);
    const hero = heroRef.current;
    if (!hero) return;
    const lines = hero.querySelectorAll(".hero-line-inner");
    const meta = hero.querySelectorAll(".hero-meta");
    gsap.set(hero, { visibility: "visible" });
    gsap.fromTo(
      lines,
      { yPercent: 110 },
      { yPercent: 0, duration: 1.4, stagger: 0.12, ease: "power4.out", delay: 0.15 }
    );
    gsap.fromTo(
      meta,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power2.out", delay: 0.7 }
    );
  }, []);

  // ---- the scroll-driven film system --------------------------------------
  useEffect(() => {
    const scrollEl = scrollRef.current;
    const stage = stageRef.current;
    if (!scrollEl || !stage) return;

    const reduced = reducedRef.current;
    const lenis = new Lenis(
      reduced
        ? { lerp: 1, smoothWheel: false }
        : { lerp: 0.09, smoothWheel: true }
    );
    lenisRef.current = lenis;
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const rafLenis = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(rafLenis);
    gsap.ticker.lagSmoothing(0);

    const dist = () => scrollEl.scrollHeight - window.innerHeight;
    let targetP = 0;
    let smoothP = 0;

    const chapterFor = (p: number) => {
      for (let i = CHAPTERS.length - 1; i >= 0; i--) {
        if (p >= CHAPTERS[i].from) return CHAPTERS[i];
      }
      return CHAPTERS[0];
    };

    let currentChapter = -1;
    const ui = uiRef.current;

    const master = ScrollTrigger.create({
      trigger: scrollEl,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        targetP = self.progress;
        filmRef.current?.setVelocity(self.getVelocity() / 2600);
        if (indBarRef.current) {
          indBarRef.current.style.transform = `scaleX(${self.progress})`;
        }
        const ch = chapterFor(self.progress);
        if (ch.index !== currentChapter) {
          currentChapter = ch.index;
          filmRef.current?.setFocus(ch.focus);
          if (indNumRef.current) {
            indNumRef.current.textContent = `${String(ch.index).padStart(2, "0")} / 06`;
          }
          if (indLabelRef.current) {
            indLabelRef.current.textContent = `${ch.label} — ${ch.jp}`;
          }
          if (ui) {
            ui.dataset.tone = ch.dark ? "dark" : "light";
          }
        }
      },
    });

    // frame-accurate scrub: ease toward scroll target, seek on frame change
    const scrubLerp = reduced ? 0.4 : 0.16;
    const scrub = () => {
      smoothP += (targetP - smoothP) * scrubLerp;
      if (Math.abs(targetP - smoothP) < 1 / (FILM.frames * 4)) smoothP = targetP;
      filmRef.current?.setProgress(smoothP);
    };
    gsap.ticker.add(scrub);

    // pointer -> water-like shader bend (fine pointers only)
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      filmRef.current?.setPointer(
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height,
        1
      );
    };
    if (finePointer && !reduced) {
      stage.addEventListener("pointermove", onMove, { passive: true });
    }

    const ctx = gsap.context(() => {
      // -- hero exit: lines drift apart as the film begins ------------------
      const hero = heroRef.current;
      if (hero) {
        const lines = hero.querySelectorAll(".hero-line-inner");
        const metaEls = hero.querySelectorAll(".hero-meta");
        const hint = hero.querySelector(".hero-hint");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scrollEl,
            start: "top top",
            end: () => `top+=${0.11 * dist()} top`,
            scrub: true,
          },
        });
        tl.to(lines, { yPercent: -118, stagger: 0.08, ease: "power2.in" }, 0)
          .to(metaEls, { opacity: 0, y: -16, ease: "power1.in" }, 0)
          .to(hint, { opacity: 0, ease: "none" }, 0);
      }

      // -- chapter overlays --------------------------------------------------
      CHAPTERS.slice(1).forEach((ch) => {
        const el = stage.querySelector<HTMLElement>(`#ch-${ch.id}`);
        if (!el) return;
        const label = el.querySelector(".ch-label");
        const lines = el.querySelectorAll(".ch-line-inner");
        const note = el.querySelector(".ch-note");
        const isLast = ch.index === CHAPTERS.length;

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scrollEl,
            start: () => `top+=${ch.from * dist()} top`,
            end: () => `top+=${ch.to * dist()} top`,
            scrub: true,
          },
        });
        tl.set(el, { visibility: "visible" }, 0)
          .fromTo(label, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.18, ease: "power2.out" }, 0.04)
          .fromTo(
            lines,
            { yPercent: 115 },
            { yPercent: 0, duration: 0.3, stagger: 0.07, ease: "power3.out" },
            0.08
          )
          .fromTo(note, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.out" }, 0.3);

        if (!isLast) {
          tl.to(note, { opacity: 0, duration: 0.15, ease: "power1.in" }, 0.72)
            .to(lines, { yPercent: -115, duration: 0.28, stagger: 0.05, ease: "power2.in" }, 0.74)
            .to(label, { opacity: 0, y: -14, duration: 0.2, ease: "power1.in" }, 0.78);
        } else {
          // final chapter: text settles and stays with the last frame
          tl.to({}, { duration: 0.5 }, 0.5);
        }
        tl.set(el, { visibility: isLast ? "visible" : "hidden" }, 1);
      });

      // -- BLOOM: the film shrinks into the page, giant outline word behind --
      if (!reduced) {
        const bloom = CHAPTERS[3];
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: scrollEl,
            start: () => `top+=${(bloom.from + 0.02) * dist()} top`,
            end: () => `top+=${(bloom.to + 0.01) * dist()} top`,
            scrub: true,
          },
        });
        tl.to(filmWrapRef.current, { scale: 0.7, ease: "power2.inOut", duration: 0.3 }, 0)
          .fromTo(behindRef.current, { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" }, 0.06)
          .to({}, { duration: 0.4 })
          .to(filmWrapRef.current, { scale: 1, ease: "power2.inOut", duration: 0.3 }, 0.7)
          .to(behindRef.current, { opacity: 0, scale: 0.97, duration: 0.25, ease: "power2.in" }, 0.72);
      }

      // -- fade the chapter UI once the colophon takes over -----------------
      if (footerRef.current && uiBottomRef.current) {
        gsap.to(uiBottomRef.current, {
          autoAlpha: 0,
          duration: 0.45,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footerRef.current,
            start: "top 72%",
            toggleActions: "play none none reverse",
          },
        });
      }
    }, stage);

    ScrollTrigger.refresh();

    return () => {
      ctx.revert();
      master.kill();
      gsap.ticker.remove(scrub);
      gsap.ticker.remove(rafLenis);
      if (finePointer) stage.removeEventListener("pointermove", onMove);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // ---- menu ---------------------------------------------------------------
  const openMenu = useCallback(() => {
    setMenuOpen(true);
    lenisRef.current?.stop();
  }, []);
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    lenisRef.current?.start();
  }, []);
  const navigate = useCallback((progress: number) => {
    const scrollEl = scrollRef.current;
    setMenuOpen(false);
    lenisRef.current?.start();
    if (!scrollEl || !lenisRef.current) return;
    const dist = scrollEl.scrollHeight - window.innerHeight;
    lenisRef.current.scrollTo(progress * dist, {
      duration: reducedRef.current ? 0 : 2.2,
      easing: (t: number) => 1 - Math.pow(1 - t, 4),
    });
  }, []);

  return (
    <main className="relative bg-paper text-ink">
      {!exited && (
        <Preloader ratio={Math.max(loadRatio, fontsReady ? 0.25 : 0)} done={done} onExited={handleExited} />
      )}
      <Cursor />

      {/* fixed interface */}
      <div ref={uiRef} data-tone="light" className="ui-tone contents">
        <header className="fixed inset-x-0 top-0 z-40 flex items-start justify-between px-5 pt-5 md:px-10 md:pt-7">
          <a
            href="#"
            data-hover
            onClick={(e) => {
              e.preventDefault();
              navigate(0);
            }}
            className="tone-text link-line font-sans text-xs uppercase tracking-[0.45em] transition-colors duration-700"
          >
            MA&nbsp;—&nbsp;<span className="font-jp tracking-normal">間</span>
          </a>
          <button
            data-hover
            onClick={openMenu}
            aria-label="Open chapters menu"
            className="tone-text link-line min-h-[44px] font-sans text-xs uppercase tracking-[0.45em] transition-colors duration-700"
          >
            Menu
          </button>
        </header>

        <div ref={uiBottomRef}>
          <div className="pointer-events-none fixed bottom-0 left-0 z-40 px-5 pb-5 md:px-10 md:pb-7">
            <span
              ref={indLabelRef}
              className="tone-text font-sans text-[10px] uppercase tracking-[0.4em] transition-colors duration-700 md:text-xs"
            >
              Introduction — 序
            </span>
          </div>

          <div className="pointer-events-none fixed bottom-0 right-0 z-40 flex flex-col items-end gap-2 px-5 pb-5 md:px-10 md:pb-7">
            <span
              ref={indNumRef}
              className="tone-text font-sans text-[10px] tabular-nums tracking-[0.4em] transition-colors duration-700 md:text-xs"
            >
              01 / 06
            </span>
            <div className="tone-line h-px w-24 overflow-hidden bg-current opacity-30 transition-colors duration-700 md:w-32">
              <div ref={indBarRef} className="h-full w-full origin-left scale-x-0 bg-current" />
            </div>
          </div>
        </div>
      </div>

      {/* the scroll-driven film */}
      <div ref={scrollRef} className="relative" style={{ height: `${FILM.scrollVh}vh` }}>
        <div ref={stageRef} className="sticky top-0 h-svh overflow-hidden bg-paper">
          {/* giant word revealed when the film shrinks (BLOOM) */}
          <div
            ref={behindRef}
            aria-hidden="true"
            className="absolute inset-0 z-0 flex items-center justify-center opacity-0"
          >
            <span className="text-outline select-none whitespace-nowrap font-serif text-[42vw] leading-none tracking-tight md:text-[30vw]">
              BLOOM
            </span>
          </div>

          <div ref={filmWrapRef} className="absolute inset-0 z-10 origin-center will-change-transform">
            <FilmCanvas
              ref={filmRef}
              reducedMotion={false}
              onLoadProgress={setLoadRatio}
              onReady={() => setVideoReady(true)}
            />
          </div>

          {/* typographic overlays */}
          <div className="pointer-events-none absolute inset-0 z-20">
            {/* HERO / chapter 01 */}
            <div
              ref={heroRef}
              className="invisible absolute inset-0"
              style={{ textShadow: "0 0 26px rgba(253,252,255,0.9), 0 0 6px rgba(253,252,255,0.8)" }}
            >
              <p className="hero-meta absolute left-5 top-[16vh] font-sans text-[10px] uppercase tracking-[0.45em] text-deep md:left-10 md:text-xs">
                Visual study — MMXXVI
              </p>
              <p className="hero-meta absolute right-5 top-[16vh] hidden font-sans text-[10px] uppercase tracking-[0.45em] text-violet md:right-10 md:block md:text-xs">
                Scroll-driven film · 200 frames
              </p>
              <p
                aria-hidden="true"
                className="hero-meta writing-vertical absolute right-5 top-1/2 -translate-y-1/2 font-jp text-sm tracking-[0.6em] text-violet/80 md:right-10 md:text-base"
              >
                自然と形の間
              </p>

              <h1 className="absolute bottom-[14vh] left-5 font-serif leading-[0.92] tracking-tight text-ink md:left-10">
                <span className="block overflow-hidden">
                  <span className="hero-line-inner block text-[13.5vw] md:text-[11vw]">BETWEEN</span>
                </span>
                <span className="block overflow-hidden">
                  <span className="hero-line-inner block text-[13.5vw] italic font-light text-violet md:text-[11vw]">
                    NATURE
                  </span>
                </span>
                <span className="block overflow-hidden">
                  <span className="hero-line-inner block text-[13.5vw] md:text-[11vw]">
                    AND&nbsp;FORM
                  </span>
                </span>
              </h1>

              <div className="hero-hint absolute bottom-6 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
                <span className="font-sans text-[9px] uppercase tracking-[0.5em] text-deep">Scroll</span>
                <span className="scroll-drop block h-12 w-px bg-deep" />
              </div>
            </div>

            {/* chapters 02–06 */}
            {CHAPTERS.slice(1).map((ch) => (
              <div key={ch.id} id={`ch-${ch.id}`} className="invisible absolute inset-0">
                <div
                  style={
                    ch.dark
                      ? { textShadow: "0 0 28px rgba(40,26,53,0.65), 0 0 6px rgba(40,26,53,0.5)" }
                      : { textShadow: "0 0 30px rgba(253,252,255,0.95), 0 0 8px rgba(253,252,255,0.85)" }
                  }
                  className={[
                    "absolute flex flex-col gap-5 md:gap-7",
                    ch.align === "right"
                      ? "right-5 top-1/2 -translate-y-1/2 items-end text-right md:right-[7vw]"
                      : ch.align === "center"
                        ? ch.id === "convergence"
                          ? "left-5 bottom-[16vh] items-start text-left md:left-[7vw]"
                          : "left-1/2 top-[13vh] -translate-x-1/2 items-center text-center"
                        : "left-5 top-1/2 -translate-y-1/2 items-start text-left md:left-[7vw]",
                  ].join(" ")}
                >
                  <p
                    className={`ch-label font-sans text-[10px] uppercase tracking-[0.45em] md:text-xs ${
                      ch.dark ? "text-lavender" : "text-deep"
                    }`}
                  >
                    {String(ch.index).padStart(2, "0")} · {ch.label}
                    <span className="font-jp tracking-normal">&nbsp;{ch.jp}</span>
                  </p>
                  <h2
                    className={`font-serif leading-[0.95] tracking-tight ${
                      ch.dark ? "text-pale" : "text-ink"
                    }`}
                  >
                    {ch.lines.map((l, i) => (
                      <span key={i} className="block overflow-hidden">
                        <span
                          className={`ch-line-inner block text-[9.5vw] md:text-[5.6vw] ${
                            i % 2 === 1 ? "italic font-light " + (ch.dark ? "text-lilac" : "text-violet") : ""
                          }`}
                        >
                          {l}
                        </span>
                      </span>
                    ))}
                  </h2>
                  <p
                    className={`ch-note max-w-[40ch] font-sans text-[10px] uppercase leading-relaxed tracking-[0.3em] md:text-[11px] ${
                      ch.dark ? "text-lilac" : "text-violet"
                    }`}
                  >
                    {ch.note}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* colophon */}
      <footer
        ref={footerRef}
        className="relative z-10 border-t border-lavender/60 bg-paper px-5 pb-10 pt-16 md:px-10 md:pt-24"
      >
        <div className="flex flex-col gap-14 md:gap-20">
          <h2 className="font-serif leading-none tracking-tight text-ink">
            <span className="block text-[18vw] md:text-[12vw]">
              FIN<span className="text-violet">.</span>
            </span>
            <span className="mt-2 block font-jp text-[6vw] tracking-[0.4em] text-violet md:text-[3vw]">終</span>
          </h2>

          <dl className="grid grid-cols-1 gap-x-8 gap-y-8 border-t border-lavender/60 pt-8 sm:grid-cols-2 md:grid-cols-4">
            {[
              ["Film", "200 illustrated frames, scrubbed by hand"],
              ["Colour", "Blue remapped to lilac in real time — GLSL"],
              ["Type", "Cormorant Garamond · Space Grotesk · Noto Serif JP"],
              ["Motion", "Lenis · GSAP ScrollTrigger · WebGL"],
            ].map(([dt, dd]) => (
              <div key={dt} className="flex flex-col gap-2">
                <dt className="font-sans text-[10px] uppercase tracking-[0.4em] text-violet">{dt}</dt>
                <dd className="font-serif text-lg leading-snug text-ink">{dd}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-3 border-t border-lavender/60 pt-6 font-sans text-[10px] uppercase tracking-[0.35em] text-deep md:flex-row md:items-center md:justify-between">
            <p>
              MA&nbsp;—&nbsp;<span className="font-jp tracking-normal">間</span>&nbsp;· Between nature and form
            </p>
            <p>An interactive anime editorial · MMXXVI</p>
          </div>
        </div>
      </footer>

      <MenuOverlay open={menuOpen} onClose={closeMenu} onNavigate={navigate} />
    </main>
  );
}
