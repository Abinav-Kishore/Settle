"use client";

import { useEffect } from "react";

/**
 * Global scroll-driven FX engine.
 * - Top progress bar fed by --scroll-progress (set by SmoothScroll/Lenis)
 * - Viewport-relative parallax via [data-parallax="maxDriftPx"] (sign flips direction)
 * - Velocity skew via [data-skew]
 * - .fx-divider draw-in when entering viewport
 * - Hero copy/scene fade + drift as it scrolls away
 *
 * All transforms run in a single rAF tick so they compose with Lenis.
 */
export default function ScrollFx() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const progressEl = document.getElementById("scroll-progress-bar");
    const parallaxEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]")
    );
    const skewEls = Array.from(document.querySelectorAll<HTMLElement>("[data-skew]"));
    const dividers = Array.from(document.querySelectorAll<HTMLElement>(".fx-divider"));
    const heroCopy = document.querySelector<HTMLElement>(".hero-copy");
    const heroScene = document.querySelector<HTMLElement>(".hero-scene");
    const letters = Array.from(document.querySelectorAll<HTMLElement>("[data-letter]"));
    const driftEls = Array.from(document.querySelectorAll<HTMLElement>("[data-drift]"));

    // Per-letter scroll spread: outer letters travel furthest
    const letterPlan = letters.map((el) => {
      const i = parseInt(el.dataset.letterIndex || "0", 10);
      const mid = (letters.length - 1) / 2;
      return { el, spread: i - mid };
    });

    type Para = { el: HTMLElement; drift: number; top: number; height: number };
    let paras: Para[] = [];

    const measure = () => {
      paras = parallaxEls.map((el) => {
        // strip transform so we measure the layout position, not the drifted one
        const prev = el.style.transform;
        el.style.transform = "";
        const r = el.getBoundingClientRect();
        el.style.transform = prev;
        return {
          el,
          drift: parseFloat(el.dataset.parallax || "0"),
          top: r.top + window.scrollY,
          height: r.height,
        };
      });
    };

    let raf = 0;
    let ticking = false;
    let lastY = window.scrollY;
    let velSm = 0;

    const clamp = (v: number, min: number, max: number) =>
      Math.min(max, Math.max(min, v));

    const tick = () => {
      ticking = false;
      const y = window.scrollY;
      const vh = window.innerHeight;

      // smoothed scroll velocity (px/frame)
      const vel = y - lastY;
      lastY = y;
      velSm = velSm * 0.85 + vel * 0.15;
      const skew = clamp(velSm * 0.05, -3.5, 3.5);

      // 1) Progress bar (reads the --scroll-progress var Lenis sets)
      if (progressEl) {
        const p = parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--scroll-progress")
        );
        progressEl.style.transform = `scaleX(${isNaN(p) ? 0 : p})`;
      }

      // 2) Parallax — viewport-relative: 0 when entering, ±drift px across the pass-through
      for (const { el, drift, top, height } of paras) {
        const progress = (y + vh - top) / (vh + height); // 0 → 1
        const offset = (progress - 0.5) * 2 * drift;
        el.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
      }

      // 3) Velocity skew
      if (Math.abs(skew) > 0.02) {
        for (const el of skewEls) {
          el.style.transform = `skewY(${skew.toFixed(3)}deg)`;
        }
      } else if (velSm !== 0) {
        velSm = 0;
        for (const el of skewEls) {
          el.style.transform = "skewY(0deg)";
        }
      }

      // 4) Divider draw-in
      for (const d of dividers) {
        if (!d.classList.contains("in-view")) {
          const r = d.getBoundingClientRect();
          if (r.top < vh * 0.96) d.classList.add("in-view");
        }
      }

      // 5) Hero wordmark stays fully legible as it scrolls away — the letters
      // only fan out slightly, and the particle stage eases back.
      const hp = Math.min(1, y / (vh * 0.85));
      if (heroCopy) {
        heroCopy.style.opacity = "1";
      }
      for (const { el, spread } of letterPlan) {
        const sx = spread * hp * 18;
        el.style.transform = `translate3d(${sx.toFixed(1)}px, ${(hp * 14).toFixed(1)}px, 0)`;
      }
      if (heroScene) {
        heroScene.style.opacity = String(1 - hp * 0.55);
        heroScene.style.transform = `translateY(${(hp * 26).toFixed(1)}px)`;
      }

      // 6) data-drift elements slide horizontally as hero scrolls away
      for (const el of driftEls) {
        const d = parseFloat(el.dataset.drift || "0");
        el.style.translate = `${(hp * d).toFixed(1)}px ${(hp * -14).toFixed(1)}px`;
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", measure);
    tick();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", measure);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div id="scroll-progress-bar" className="scroll-progress" aria-hidden />;
}
