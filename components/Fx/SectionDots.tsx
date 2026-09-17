"use client";

import { useEffect, useState } from "react";
import { scrollToId } from "@/lib/scroll";

const SECTIONS = [
  { id: "top", label: "Intro" },
  { id: "problem", label: "Problem" },
  { id: "snapshot", label: "Snapshot" },
  { id: "flow", label: "Product Flow" },
  { id: "workflow", label: "Workflow" },
  { id: "provenance", label: "Evidence" },
  { id: "actions", label: "Next Actions" },
  { id: "architecture", label: "Architecture" },
  { id: "stack", label: "Platform" },
  { id: "faq", label: "Questions" },
  { id: "cta", label: "Get Started" },
];

export default function SectionDots() {
  const [available, setAvailable] = useState<typeof SECTIONS>([]);
  const [active, setActive] = useState("top");

  useEffect(() => {
    // Only show dots for sections that exist on the current page, so the
    // rail stays inert on routes like /dashboard.
    const present = SECTIONS.filter((s) => document.getElementById(s.id));
    setAvailable(present);
    if (!present.length) return;

    const els = present
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => !!el);

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  if (!available.length) return null;

  return (
    <nav
      className="section-dots fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-3 lg:flex"
      aria-label="Section navigation"
    >
      {available.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => scrollToId(s.id)}
          className="group relative grid h-4 w-4 place-items-center"
          aria-label={`Jump to ${s.label}`}
          aria-current={active === s.id}
          data-cursor
        >
          <span
            className={`block rounded-full transition-all duration-300 ${
              active === s.id
                ? "h-2.5 w-2.5 bg-violethi shadow-[0_0_10px_rgba(183,154,236,0.7)]"
                : "h-1.5 w-1.5 bg-white/25 group-hover:bg-white/70"
            }`}
          />
          <span className="pointer-events-none absolute right-7 rounded-full border border-white/10 bg-ink px-2.5 py-1 font-mono text-[9px] tracking-[0.18em] whitespace-nowrap text-fog uppercase opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {s.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
