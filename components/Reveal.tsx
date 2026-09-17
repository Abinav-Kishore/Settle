"use client";

import { useEffect, useRef } from "react";
import { revealUp } from "@/lib/motion";

/**
 * Scroll-triggered reveal. Animates direct children with anime.js
 * when the block enters the viewport.
 */
export default function Reveal({
  children,
  className = "",
  staggerMs = 70,
  delay = 0,
  y = 34,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  staggerMs?: number;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rootEl = ref.current;
    if (!rootEl) return;
    const kids = Array.from(rootEl.children);
    if (!kids.length) return;

    kids.forEach((k) => {
      (k as HTMLElement).style.opacity = "0";
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            revealUp(kids, { staggerMs, delay, y });
            if (once) io.disconnect();
          } else if (!once) {
            kids.forEach((k) => {
              (k as HTMLElement).style.opacity = "0";
            });
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(rootEl);
    return () => io.disconnect();
  }, [staggerMs, delay, y, once]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
