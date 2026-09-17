import { animate, stagger, utils } from "animejs";

/**
 * SETTLE — anime.js v4 motion system.
 * Kinetic reveals, counters, SVG path draws, parallax, magnetic pulls,
 * 3D tilt and float loops. Every helper is defensive: falls back to
 * visible static content if animation fails.
 */

export function revealUp(
  targets: ArrayLike<Element> | string,
  opts: { delay?: number; staggerMs?: number; y?: number; duration?: number } = {}
) {
  const { delay = 0, staggerMs = 70, y = 34, duration = 850 } = opts;
  try {
    return animate(targets as never, {
      opacity: [0, 1],
      translateY: [y, 0],
      filter: ["blur(8px)", "blur(0px)"],
      ease: "out(3)",
      duration,
      delay: stagger(staggerMs, { start: delay }),
    });
  } catch {
    list(targets).forEach((el) => {
      (el as HTMLElement).style.opacity = "1";
    });
  }
}

export function splitLinesReveal(el: HTMLElement, delay = 0) {
  try {
    const words = el.querySelectorAll<HTMLElement>("[data-word]");
    return animate(words, {
      opacity: [0, 1],
      translateY: ["0.85em", "0em"],
      rotateX: [-55, 0],
      ease: "out(4)",
      duration: 800,
      delay: stagger(38, { start: delay }),
    });
  } catch {
    el.style.opacity = "1";
  }
}

export function kineticCounter(
  el: HTMLElement,
  end: number,
  formatter?: (v: number) => string,
  duration = 1500
) {
  try {
    const obj = { v: 0 };
    return animate(obj, {
      v: end,
      ease: "outExpo",
      duration,
      onRender: () => {
        el.textContent = formatter
          ? formatter(obj.v)
          : Math.round(obj.v).toLocaleString("en-IN");
      },
    });
  } catch {
    el.textContent = formatter ? formatter(end) : String(end);
  }
}

export function drawPaths(targets: ArrayLike<Element> | string, duration = 1600, delay = 0) {
  try {
    return animate(targets as never, {
      strokeDashoffset: [1000, 0],
      ease: "inOut(2)",
      duration,
      delay: stagger(120, { start: delay }),
    });
  } catch {
    /* static fallback */
  }
}

export function floatLoop(targets: ArrayLike<Element> | string, amps: number[] = [10, 14, 8]) {
  try {
    const els = list(targets);
    els.forEach((el, i) => {
      const amp = amps[i % amps.length];
      animate(el as never, {
        translateY: [-amp, amp],
        translateX: [amp * 0.4, -amp * 0.4],
        rotate: [-1.4, 1.4],
        duration: 5200 + i * 350,
        ease: "inOutSine",
        alternate: true,
        loop: true,
      });
    });
  } catch {
    /* static fallback */
  }
}

export function parallax(targets: ArrayLike<Element> | string, strength = 40) {
  try {
    const els = list(targets) as HTMLElement[];
    els.forEach((el) => {
      const sp = parseFloat(el.dataset.depth || String(strength / 100));
      animate(el as never, {
        translateY: () => window.scrollY * sp * -0.1,
        ease: "linear",
        duration: 120,
      });
    });
  } catch {
    /* static fallback */
  }
}

export function magnetic(el: HTMLElement, strength = 0.35) {
  const onMove = (e: MouseEvent) => {
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    animate(el, {
      translateX: dx * strength,
      translateY: dy * strength * 0.8,
      duration: 320,
      ease: "out(3)",
    });
  };
  const onLeave = () => {
    animate(el, { translateX: 0, translateY: 0, duration: 600, ease: "outElastic(1, .5)" });
  };
  el.addEventListener("mousemove", onMove);
  el.addEventListener("mouseleave", onLeave);
  return () => {
    el.removeEventListener("mousemove", onMove);
    el.removeEventListener("mouseleave", onLeave);
  };
}

export function tilt3d(el: HTMLElement, max = 10) {
  const onMove = (e: MouseEvent) => {
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--gx", `${(px + 0.5) * 100}%`);
    el.style.setProperty("--gy", `${(py + 0.5) * 100}%`);
    animate(el, {
      rotateY: px * max,
      rotateX: -py * max,
      duration: 300,
      ease: "out(2)",
    });
  };
  const onLeave = () => {
    animate(el, { rotateX: 0, rotateY: 0, duration: 700, ease: "outElastic(1, .55)" });
  };
  el.addEventListener("mousemove", onMove);
  el.addEventListener("mouseleave", onLeave);
  return () => {
    el.removeEventListener("mousemove", onMove);
    el.removeEventListener("mouseleave", onLeave);
  };
}

export function pulseOnce(el: HTMLElement) {
  try {
    animate(el, {
      boxShadow: [
        "0 0 0 0 rgba(168,85,247,0.55)",
        "0 0 0 18px rgba(168,85,247,0)",
      ],
      duration: 900,
      ease: "out(2)",
    });
  } catch {
    /* no-op */
  }
}

export function shuffleIn(targets: ArrayLike<Element> | string, delay = 0) {
  try {
    const els = list(targets);
    els.forEach((el) => utils.set(el as never, { opacity: 0, translateY: 22 }));
    return animate(els as never, {
      opacity: [0, 1],
      translateY: [22, 0],
      ease: "out(3)",
      duration: 700,
      delay: stagger(55, { start: delay, from: "last" }),
    });
  } catch {
    list(targets).forEach((el) => {
      (el as HTMLElement).style.opacity = "1";
    });
  }
}

function list(targets: ArrayLike<Element> | string): Element[] {
  if (typeof targets === "string") return Array.from(document.querySelectorAll(targets));
  return Array.from(targets as ArrayLike<Element>);
}
