"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * SETTLE — GSAP layer.
 *
 * anime.js handles micro-interactions (hover, staggers, counters); GSAP
 * ScrollTrigger handles scroll-scrubbed and sticky-driven sequences.
 *
 * Lenis stays the single scroll authority — SmoothScroll feeds its scroll
 * events into ScrollTrigger.update so the two never disagree.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // Webfonts change text metrics after first paint, which shifts every
  // trigger's start/end. Re-measure once they land.
  if (typeof document !== "undefined" && "fonts" in document) {
    document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
  }
}

export { gsap, ScrollTrigger };

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const range = (n: number) => Array.from({ length: n }, (_, i) => i);
