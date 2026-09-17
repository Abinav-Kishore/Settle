"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { magnetic, splitLinesReveal } from "@/lib/motion";

const WORDS = ["CHAOS", "EVIDENCE", "CONTEXT", "CLARITY", "ACTION"];

export default function CTASection() {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const wordRef = useRef<HTMLSpanElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const ioRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const btn = btnRef.current;
    const cleanup = btn ? magnetic(btn, 0.3) : undefined;

    // word-by-word headline reveal on scroll
    const words = headRef.current?.querySelectorAll<HTMLElement>("[data-word]");
    if (words?.length) {
      // hide words immediately so they don't flash before the reveal
      words.forEach((w) => {
        w.style.opacity = "0";
      });
      const io = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            splitLinesReveal(headRef.current as HTMLElement, 80);
            io.disconnect();
          }
        },
        { threshold: 0.4 }
      );
      ioRef.current = io;
      io.observe(headRef.current as HTMLElement);
    }

    // rotating CHAOS → ACTION word
    const el = wordRef.current;
    let idx = 0;
    const id = setInterval(() => {
      if (!el) return;
      idx = (idx + 1) % WORDS.length;
      el.style.opacity = "0";
      el.style.transform = "translateY(-12px)";
      setTimeout(() => {
        el.textContent = WORDS[idx];
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
      }, 260);
    }, 1700);

    return () => {
      cleanup?.();
      clearInterval(id);
      ioRef.current?.disconnect();
    };
  }, []);

  return (
    <section id="cta" className="relative overflow-hidden py-32">
      {/* breathing glow orb — outer div owns scroll parallax, inner div owns the breathe loop */}
      <div
        data-parallax="-60"
        className="pointer-events-none absolute top-[calc(50%-280px)] left-[calc(50%-280px)] h-[560px] w-[560px] rounded-full"
        aria-hidden
      >
        <div className="cta-orb h-full w-full rounded-full" />
      </div>
      <div className="relative z-10 mx-auto max-w-[1240px] px-6 text-center lg:px-10">
        <div className="eyebrow mb-6">
          <span className="tick">/</span>&nbsp;&nbsp;Design Philosophy
        </div>

        <h2 ref={headRef} className="h-display relative z-10 mx-auto max-w-4xl text-[clamp(30px,4.2vw,54px)]">
          <SplitWords text="Built to settle." />
        </h2>
        <div className="script-tag relative z-10 mt-1 text-[clamp(22px,2.6vw,32px)]">
          <span
            ref={wordRef}
            className="inline-block transition-all duration-300 will-change-transform"
            style={{ transitionProperty: "opacity, transform" }}
          >
            CHAOS
          </span>
        </div>

        <p className="lead mx-auto mt-6 max-w-md text-[14.5px]">
          SETTLE reconstructs the payment case so you can act with confidence —
          evidence first, policy always.
        </p>

        <div className="mt-10 flex justify-center">
          <a
            ref={btnRef}
            href="/dashboard"
            data-cursor
            className="btn-primary group relative z-10 inline-flex h-13 items-center gap-2.5 rounded-full px-8 text-[14px] font-semibold text-white"
          >
            <span className="btn-ring absolute inset-0 rounded-full" aria-hidden />
            <span className="relative">Get Started</span>
            <ArrowRight size={16} className="relative transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </section>
  );
}

function SplitWords({ text }: { text: string }) {
  return (
    <>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.08em] -mb-[0.08em]">
          <span data-word className="inline-block will-change-transform">
            {w}{"\u00A0"}
          </span>
        </span>
      ))}
    </>
  );
}
