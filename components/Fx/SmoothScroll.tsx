"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/scroll";

/**
 * Lenis buttery smooth scrolling, wired to the GSAP ticker.
 *
 * Lenis stays the single scroll authority: GSAP's ticker drives its raf loop
 * and every Lenis scroll event updates ScrollTrigger, so scrubbed and sticky
 * sequences never disagree with the smoothed scroll position. Scroll progress
 * and velocity are published as CSS vars for the scroll-linked FX.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.4,
    });

    // expose the instance so buttons (not just anchor links) can jump smoothly
    setLenis(lenis);

    const onScroll = (e: { progress: number; velocity: number }) => {
      const p = Math.max(0, Math.min(1, e.progress || 0));
      const v = Math.max(-60, Math.min(60, e.velocity || 0));
      document.documentElement.style.setProperty("--scroll-progress", p.toFixed(4));
      document.documentElement.style.setProperty("--scroll-vel", v.toFixed(2));
    };
    lenis.on("scroll", onScroll);
    lenis.on("scroll", ScrollTrigger.update);

    // One loop for both: never drive lenis.raf from two places.
    const tickerFn = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tickerFn);
    gsap.ticker.lagSmoothing(0);

    // Anchor links route through lenis for buttery jumps
    const onClick = (ev: MouseEvent) => {
      const a = (ev.target as HTMLElement)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      ev.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -90 });
    };
    document.addEventListener("click", onClick);

    // Sections sized in vh need their trigger positions re-measured on resize
    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(tickerFn);
      setLenis(null);
      lenis.off("scroll", onScroll);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
    };
  }, []);

  return null;
}
