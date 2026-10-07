"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

interface Props {
  /** real loading ratio 0..1 coming from the video/fonts */
  ratio: number;
  done: boolean;
  onExited: () => void;
}

export default function Preloader({ ratio, done, onExited }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const shown = useRef(0);
  const exited = useRef(false);
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;

  // smooth percentage counter + botanical line drawing
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const target = done ? 100 : Math.min(ratio * 100, 92);
      shown.current += (target - shown.current) * 0.12;
      const v = Math.round(shown.current);
      if (numRef.current) {
        numRef.current.textContent = String(v).padStart(3, "0");
      }
      if (lineRef.current) {
        const len = lineRef.current.getTotalLength();
        lineRef.current.style.strokeDashoffset = String(len * (1 - shown.current / 100));
      }
      if (done && shown.current > 99 && !exited.current) {
        exited.current = true;
        cancelAnimationFrame(raf);
        const el = rootRef.current;
        if (!el) return onExitedRef.current();
        gsap.to(el, {
          clipPath: "inset(0 0 100% 0)",
          duration: 1.1,
          ease: "power4.inOut",
          delay: 0.35,
          onComplete: () => onExitedRef.current(),
        });
        gsap.to(el.querySelectorAll(".pl-inner"), {
          yPercent: -30,
          opacity: 0,
          duration: 0.7,
          ease: "power2.in",
        });
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [ratio, done]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-[#FDFCFF]"
      style={{ clipPath: "inset(0 0 0% 0)" }}
      role="status"
      aria-label="Loading"
    >
      <div className="pl-inner flex flex-col items-center gap-10">
        {/* botanical line that draws itself with progress */}
        <svg width="120" height="150" viewBox="0 0 120 150" fill="none" aria-hidden="true">
          <path
            ref={lineRef}
            d="M60 148 C60 110 58 92 60 66 C62 44 70 30 84 18 M60 96 C48 84 38 80 26 78 M60 66 C72 58 84 56 96 58 M60 118 C50 110 42 108 32 110 M84 18 C78 26 76 34 78 44 M84 18 C90 26 92 34 90 44 M60 40 C54 32 52 24 54 14"
            stroke="#5B367E"
            strokeWidth="1.1"
            strokeLinecap="round"
            style={{ strokeDasharray: 600, strokeDashoffset: 600 }}
          />
        </svg>

        <div className="flex items-baseline gap-3 font-serif text-[#281A35]">
          <span ref={numRef} className="text-5xl font-light tabular-nums tracking-tight md:text-6xl">
            000
          </span>
          <span className="text-xs uppercase tracking-[0.35em] text-[#8B63B5]">/ 100</span>
        </div>

        <p className="text-[10px] uppercase tracking-[0.5em] text-[#8B63B5]">
          ORIMAE · Nº 01 — MMXXVI
        </p>
      </div>
    </div>
  );
}
