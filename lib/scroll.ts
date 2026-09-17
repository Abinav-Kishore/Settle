"use client";

import type Lenis from "lenis";

/**
 * Smooth-scroll bridge.
 *
 * Lenis writes the scroll position every frame from its own internal target, so
 * a plain `el.scrollIntoView({ behavior: "smooth" })` gets overridden and the
 * page barely moves. Anything that jumps to a section routes through the live
 * Lenis instance instead, falling back to native scrolling when Lenis is absent
 * (reduced motion, or a route without SmoothScroll mounted).
 */
let instance: Lenis | null = null;

export const setLenis = (lenis: Lenis | null) => {
  instance = lenis;
};

export const getLenis = () => instance;

export function scrollToId(id: string, offset = -90) {
  const el = document.getElementById(id.replace(/^#/, ""));
  if (!el) return;

  if (instance) {
    instance.scrollTo(el, { offset, duration: 1.15 });
    return;
  }
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}
