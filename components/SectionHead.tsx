"use client";

import { useEffect, useRef } from "react";
import { splitLinesReveal } from "@/lib/motion";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

export default function SectionHead({
  eyebrow,
  title,
  accent,
  children,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  children?: React.ReactNode;
  align?: "left" | "center";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Hide the headline words up front so the reveal doesn't flash at full
    // opacity before the observer fires.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll<HTMLElement>("[data-word]").forEach((w) => {
        w.style.opacity = "0";
      });
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          el.classList.add("in");
          splitLinesReveal(el, 80);
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);

    // GSAP scrub: every heading drifts gently against the scroll
    let ctx: gsap.Context | undefined;
    if (!prefersReducedMotion()) {
      ctx = gsap.context(() => {
        gsap.fromTo(
          el,
          { y: 30 },
          {
            y: -20,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });
    }

    return () => {
      io.disconnect();
      ctx?.revert();
    };
  }, []);

  const alignCls = align === "center" ? "text-center" : "text-left";

  return (
    <div ref={ref} className={`section-head relative ${alignCls}`}>
      <div className={`eyebrow mb-5 ${align === "center" ? "mx-auto" : ""}`}>
        <span className="tick">/</span>&nbsp;&nbsp;{eyebrow}
      </div>
      <h2 className="h-display text-[clamp(28px,3.6vw,44px)]">
        <SplitWords text={title} />
      </h2>
      {accent ? (
        <div className="script-tag mt-1 text-[clamp(20px,2.4vw,30px)]">{accent}</div>
      ) : null}
      {children ? (
        <div className={`lead mt-6 max-w-xl text-[14px] ${align === "center" ? "mx-auto" : ""}`}>
          {children}
        </div>
      ) : null}
    </div>
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
