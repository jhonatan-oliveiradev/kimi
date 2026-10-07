"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { CHAPTERS } from "@/lib/config";

interface Props {
  open: boolean;
  onClose: () => void;
  onNavigate: (progress: number) => void;
}

export default function MenuOverlay({ open, onClose, onNavigate }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const links = el.querySelectorAll(".menu-link");
    const meta = el.querySelectorAll(".menu-meta");
    const branches = el.querySelectorAll<SVGPathElement>(".menu-branch");
    branches.forEach((b) => {
      const len = b.getTotalLength();
      b.style.strokeDasharray = String(len);
      b.style.strokeDashoffset = String(len);
    });

    const tl = gsap.timeline({ paused: true });
    tl.set(el, { visibility: "visible" })
      .fromTo(
        el,
        { clipPath: "inset(0 0 100% 0)" },
        { clipPath: "inset(0 0 0% 0)", duration: 0.85, ease: "power4.inOut" }
      )
      .fromTo(
        links,
        { yPercent: 120, rotate: 2 },
        { yPercent: 0, rotate: 0, duration: 0.8, stagger: 0.06, ease: "power3.out" },
        "-=0.35"
      )
      .fromTo(
        meta,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" },
        "-=0.6"
      )
      .to(branches, { strokeDashoffset: 0, duration: 1.4, stagger: 0.15, ease: "power2.inOut" }, "-=0.9");

    tl.eventCallback("onReverseComplete", () => {
      gsap.set(el, { visibility: "hidden" });
    });
    tlRef.current = tl;
    return () => {
      tl.kill();
    };
  }, []);

  useEffect(() => {
    const tl = tlRef.current;
    if (!tl) return;
    if (open) {
      tl.timeScale(1).play();
    } else {
      tl.timeScale(1.6).reverse();
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={rootRef}
      className="invisible fixed inset-0 z-[60] bg-[#F2ECFA]"
      role="dialog"
      aria-modal="true"
      aria-label="Fragrance chapters menu"
    >
      {/* botanical line composition */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path className="menu-branch" d="M940 1000 C900 780 820 640 700 540 C600 458 540 380 520 260" stroke="#B99AD8" strokeWidth="1.4" fill="none" />
        <path className="menu-branch" d="M700 540 C640 520 580 530 520 580 M700 540 C720 470 770 430 840 410 M520 260 C480 220 460 170 470 110 M520 260 C570 230 630 230 680 260" stroke="#B99AD8" strokeWidth="1.1" fill="none" />
        <path className="menu-branch" d="M60 1000 C110 800 190 700 300 620 C380 560 420 480 430 380" stroke="#D8C7EC" strokeWidth="1.4" fill="none" />
        <path className="menu-branch" d="M300 620 C350 590 410 590 460 620 M300 620 C280 550 230 510 160 500" stroke="#D8C7EC" strokeWidth="1.1" fill="none" />
      </svg>

      <div className="relative flex h-full flex-col justify-between px-6 pb-8 pt-24 md:px-14 md:pt-28">
        <nav aria-label="Fragrance chapters">
          <ul className="flex flex-col gap-1 md:gap-2">
            {CHAPTERS.map((c) => (
              <li key={c.id} className="type-reveal overflow-hidden">
                <button
                  data-hover
                  onClick={() => onNavigate(c.from + 0.001)}
                  className="menu-link group flex items-baseline gap-4 text-left md:gap-8"
                >
                  <span className="font-sans text-[10px] tracking-[0.4em] text-[#8B63B5] md:text-xs">
                    {String(c.index).padStart(2, "0")}
                  </span>
                  <span className="font-serif text-[11vw] leading-[1.02] text-[#281A35] transition-all duration-500 group-hover:translate-x-3 group-hover:text-[#5B367E] group-hover:italic md:text-[7.5vw]">
                    {c.label}
                  </span>
                  <span className="hidden font-jp text-lg text-[#B99AD8] transition-opacity duration-500 group-hover:opacity-100 md:block md:opacity-40">
                    {c.jp}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-end justify-between">
          <div className="menu-meta font-sans text-[10px] uppercase leading-relaxed tracking-[0.35em] text-[#5B367E]">
            <p>ORIMAE · Between nature and skin</p>
            <p className="text-[#8B63B5]">Eau de Parfum · Nº 01 · 50 ml</p>
          </div>
          <button
            data-hover
            onClick={onClose}
            className="menu-meta group flex min-h-[44px] items-center gap-3 font-sans text-xs uppercase tracking-[0.4em] text-[#281A35]"
          >
            Close
            <span className="block h-px w-10 bg-[#281A35] transition-all duration-500 group-hover:w-16 group-hover:bg-[#8B63B5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
