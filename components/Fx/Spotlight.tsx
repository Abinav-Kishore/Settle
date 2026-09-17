"use client";

import { useEffect } from "react";

/**
 * Global mouse spotlight: drives --mx/--my CSS vars consumed by .fx-spotlight
 * and by per-card mouse-position glows.
 */
export default function Spotlight() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let px = -600;
    let py = -600;

    const onMove = (e: MouseEvent) => {
      px = e.clientX;
      py = e.clientY;
    };

    const loop = () => {
      root.style.setProperty("--mx", px + "px");
      root.style.setProperty("--my", py + "px");
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
