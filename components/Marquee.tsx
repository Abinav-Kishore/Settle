"use client";

import { useEffect, useRef } from "react";

const WORDS = [
  "PURCHASE ORDERS",
  "INVOICES",
  "DELIVERY NOTES",
  "EMAIL THREADS",
  "PAYMENT RECORDS",
  "CONTRACTS",
];

export default function Marquee() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let x = 0;
    let lastY = window.scrollY;
    let vel = 0;
    let half = 1;

    const measure = () => {
      half = Math.max(1, track.scrollWidth / 2);
    };

    const tick = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      lastY = y;
      vel = vel * 0.9 + dy * 0.1;

      // scroll velocity drives the strip; slow ambient drift at rest
      const dir = vel >= 0 ? 1 : -1;
      const speed = 0.4 + Math.min(9, Math.abs(vel) * 0.55) * dir;
      x -= speed;
      // keep x within one track width (wraps seamlessly)
      x = ((x % half) + half) % half;
      track.style.transform = `translate3d(${-x}px, 0, 0)`;
      raf = requestAnimationFrame(tick);
    };

    measure();
    window.addEventListener("resize", measure);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const row = (key: string, ariaHidden: boolean) => (
    <div key={key} className="flex shrink-0 items-center" aria-hidden={ariaHidden}>
      {WORDS.map((w, i) => (
        <span key={`${key}-${i}`} className="flex items-center">
          <span className="font-display px-6 text-[12px] font-normal tracking-[0.3em] whitespace-nowrap text-white/22 uppercase">
            {w}
          </span>
          <span className="h-1 w-1 rotate-45 bg-violet/40" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="marquee relative z-10 border-y border-white/5 py-4" data-cursor>
      <div ref={trackRef} className="marquee-track">
        {row("a", false)}
        {row("b", true)}
      </div>
    </div>
  );
}
