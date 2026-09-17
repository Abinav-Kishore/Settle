"use client";

import { useEffect, useRef } from "react";
import { kineticCounter } from "@/lib/motion";

/**
 * CountUp — animated figure that ticks up when it enters the viewport.
 * Falls back to the final value for reduced-motion users and when the
 * animation helper fails.
 */
export default function CountUp({
  value,
  format,
  duration = 1500,
  className,
}: {
  value: number;
  format?: (v: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const formatRef = useRef(format);
  formatRef.current = format;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fmt = (v: number) =>
      formatRef.current ? formatRef.current(v) : Math.round(v).toLocaleString("en-IN");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = fmt(value);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          kineticCounter(el, value, fmt, duration);
          io.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {format ? format(value) : Math.round(value).toLocaleString("en-IN")}
    </span>
  );
}
