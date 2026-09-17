"use client";

import { useEffect, useRef } from "react";

/**
 * ParticleField — hero centerpiece.
 *
 * ~1400 canvas particles drift as scattered chaos, then converge into an
 * invoice fragment (the evidence SETTLE reads first), dissolve back into
 * drift, and reform as the SETTLE monogram mark. Loops forever.
 *
 * The giant embossed SETTLE wordmark stays behind the particles — the dots
 * never spell the brand name themselves.
 *
 * Mouse repels particles; scroll velocity tints them violet.
 *
 * Sample points are rendered offscreen and read via getImageData.
 */

type P = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  size: number;
  phase: 0 | 1 | 2; // 0 drift → 1 invoice → 2 mark
  jitter: number;
};

const COLORS = {
  dust: "rgba(226, 222, 232, OPACITY)",
  ink: "rgba(167, 139, 250, OPACITY)",
};

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0;
    let H = 0;
    let particles: P[] = [];
    let raf = 0;
    let running = true;

    // pointer state (page coords → canvas coords)
    let mx = -9999;
    let my = -9999;

    // scroll velocity → violet tint
    let lastScroll = window.scrollY;
    let velAcc = 0;
    let tint = 0; // 0..1

    // morph cycle state
    let mode: 0 | 1 | 2 = 0;
    let modeUntil = 0;

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, Math.floor(r.width));
      H = Math.max(1, Math.floor(r.height));
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const sampleShape = (draw: (octx: CanvasRenderingContext2D) => void, gap: number) => {
      const off = document.createElement("canvas");
      off.width = W;
      off.height = H;
      const octx = off.getContext("2d");
      if (!octx) return [];
      octx.fillStyle = "#fff";
      octx.strokeStyle = "#fff";
      octx.lineJoin = "round";
      octx.lineCap = "round";
      draw(octx);
      const data = octx.getImageData(0, 0, W, H).data;
      const pts: Array<{ x: number; y: number }> = [];
      for (let y = 0; y < H; y += gap) {
        for (let x = 0; x < W; x += gap) {
          if (data[(y * W + x) * 4 + 3] > 128) {
            pts.push({ x, y });
          }
        }
      }
      return pts;
    };

    /** An invoice fragment — page outline, header block, line items, total bar. */
    const drawInvoice = (octx: CanvasRenderingContext2D) => {
      const w = Math.min(W * 0.44, 300);
      const h = Math.min(H * 0.74, 330);
      const x = (W - w) / 2;
      const y = (H - h) / 2;
      const r = Math.min(18, w * 0.08);
      const pad = w * 0.14;

      octx.lineWidth = 5;
      octx.beginPath();
      octx.moveTo(x + r, y);
      octx.lineTo(x + w - r, y);
      octx.quadraticCurveTo(x + w, y, x + w, y + r);
      octx.lineTo(x + w, y + h - r);
      octx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      octx.lineTo(x + r, y + h);
      octx.quadraticCurveTo(x, y + h, x, y + h - r);
      octx.lineTo(x, y + r);
      octx.quadraticCurveTo(x, y, x + r, y);
      octx.closePath();
      octx.stroke();

      // header block + mark
      octx.beginPath();
      octx.rect(x + pad, y + h * 0.15, w * 0.34, h * 0.1);
      octx.stroke();

      octx.lineWidth = 4;
      for (let i = 0; i < 5; i++) {
        const ly = y + h * (0.4 + i * 0.1);
        octx.beginPath();
        octx.moveTo(x + pad, ly);
        octx.lineTo(x + w - pad - (i % 2 === 0 ? 0 : w * 0.14), ly);
        octx.stroke();
      }

      // total bar
      octx.lineWidth = 6;
      octx.beginPath();
      octx.moveTo(x + pad, y + h - pad);
      octx.lineTo(x + w - pad, y + h - pad);
      octx.stroke();
    };

    /** The SETTLE monogram — same angular mark as the wordmark. */
    const drawMark = (octx: CanvasRenderingContext2D) => {
      const size = Math.min(W * 0.4, H * 0.64);
      const s = size / 24;
      const path = new Path2D("M13 2 4 14h6l-1 8 9-12h-6l1-8Z");
      octx.save();
      octx.translate((W - 24 * s) / 2, (H - 24 * s) / 2);
      octx.scale(s, s);
      octx.fill(path);
      octx.restore();
    };

    const spawn = (n: number) => {
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        tx: 0,
        ty: 0,
        vx: 0,
        vy: 0,
        size: 0.8 + Math.random() * 1.6,
        phase: 0 as const,
        jitter: Math.random() * Math.PI * 2,
      }));
    };

    const assignTargets = (rawPts: Array<{ x: number; y: number }>) => {
      if (!rawPts.length) return;

      // Outline shapes sample to far more points than we have particles, which
      // would leave the shape full of gaps. Thin the point list evenly first.
      let pts = rawPts;
      if (rawPts.length > particles.length) {
        const stride = rawPts.length / particles.length;
        pts = Array.from({ length: particles.length }, (_, i) => rawPts[Math.floor(i * stride)]);
      }

      // farthest-point-ish assignment: shuffle particles, map to shuffled pts
      const idx = particles.map((_, i) => i);
      for (let i = idx.length - 1; i > 0; i--) {
        const j = (Math.random() * (i + 1)) | 0;
        [idx[i], idx[j]] = [idx[j], idx[i]];
      }
      particles.forEach((p, i) => {
        const pt = pts[idx[i] % pts.length];
        p.tx = pt.x;
        p.ty = pt.y;
      });
    };

    const step = (t: number) => {
      if (!running) return;

      // scroll velocity → tint
      const y = window.scrollY;
      velAcc = velAcc * 0.9 + (y - lastScroll) * 0.1;
      lastScroll = y;
      const targetTint = Math.min(1, Math.abs(velAcc) / 40);
      tint += (targetTint - tint) * 0.08;

      // cycle: drift 3.4s → invoice 4.2s → drift 2.6s → mark 4.6s
      if (t > modeUntil) {
        if (mode === 0) {
          mode = 1;
          modeUntil = t + 4200;
          assignTargets(sampleShape(drawInvoice, 4));
        } else if (mode === 1) {
          mode = 0;
          modeUntil = t + 2600;
        } else if (mode === 2) {
          mode = 0;
          modeUntil = t + 3400;
        } else {
          mode = 2;
          modeUntil = t + 4600;
          assignTargets(sampleShape(drawMark, 4));
        }
      }

      ctx.clearRect(0, 0, W, H);

      const gathering = mode !== 0;
      for (const p of particles) {
        if (gathering) {
          const dx = p.tx - p.x;
          const dy = p.ty - p.y;
          p.vx += dx * 0.016;
          p.vy += dy * 0.016;
        } else {
          p.jitter += 0.004;
          p.vx += Math.sin(p.jitter) * 0.012;
          p.vy += Math.cos(p.jitter * 0.9) * 0.012;
        }

        // mouse repulsion
        const mdx = p.x - mx;
        const mdy = p.y - my;
        const md2 = mdx * mdx + mdy * mdy;
        if (md2 < 10000) {
          const d = Math.sqrt(md2) || 1;
          const f = (100 - d) / 100;
          p.vx += (mdx / d) * f * 1.6;
          p.vy += (mdy / d) * f * 1.6;
        }

        // damping + clamp speed
        p.vx *= 0.9;
        p.vy *= 0.9;
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 7) {
          p.vx = (p.vx / sp) * 7;
          p.vy = (p.vy / sp) * 7;
        }

        p.x += p.vx;
        p.y += p.vy;

        // soft wrap
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        const inked = tint > 0.25 ? tint * 0.85 : 0;
        const baseOp = gathering ? 0.85 : 0.5;
        const col = (inked > 0.3 ? COLORS.ink : COLORS.dust).replace(
          "OPACITY",
          String(Math.min(0.95, baseOp + inked * 0.3))
        );
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
    };

    resize();
    spawn(Math.min(1500, Math.floor((W * H) / 420)));
    modeUntil = performance.now() + 3400;
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(step);

    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(step);
    };
    document.addEventListener("visibilitychange", onVis);

    if (reduced) {
      // static dusting of dots, no loop
      resize();
      spawn(Math.floor((W * H) / 900));
      ctx.fillStyle = "rgba(226, 222, 232, 0.28)";
      for (const p of particles) {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      return () => {
        window.removeEventListener("resize", resize);
      };
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div className="particle-stage" aria-hidden>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
