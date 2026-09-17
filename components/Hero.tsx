"use client";

import type { CSSProperties } from "react";
import ParticleField from "./Fx/ParticleField";

const LETTERS = ["S", "E", "T", "T", "L", "E"];

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-24">
      {/* ambient glows — scroll parallax layers */}
      <div
        data-parallax="-70"
        className="hero-glow-a pointer-events-none absolute -top-40 right-[-10%] h-[560px] w-[560px] rounded-full"
      />
      <div
        data-parallax="90"
        className="hero-glow-b pointer-events-none absolute top-1/3 left-[-12%] h-[420px] w-[420px] rounded-full"
      />

      <div className="relative mx-auto max-w-[1240px] px-6 lg:px-10">
        {/* ——— Giant embossed title, per-letter for scroll spread ——— */}
        <div className="hero-copy pointer-events-none relative z-0 text-center select-none">
          <h1 className="title-emboss" aria-label="SETTLE">
            {LETTERS.map((ch, i) => (
              <span
                key={i}
                data-letter
                data-letter-index={i}
                style={{ "--li": i } as CSSProperties}
                className="inline-block will-change-transform"
              >
                {ch}
              </span>
            ))}
          </h1>
        </div>

        {/* ——— Purple handwritten overlays — drift on scroll ——— */}
        <span className="script script-left" data-drift="-40" aria-hidden>
          Delayed.
        </span>
        <span className="script script-right" data-drift="46" aria-hidden>
          Resolved.
        </span>

        {/* ——— Centerpiece: particle morph field ——— */}
        <div
          className="hero-scene rise-in relative z-10"
          style={{ marginTop: "clamp(-190px, -13vw, -70px)", animationDelay: "0.3s" }}
        >
          <div className="script-tag rise-in mb-2 ml-[4%]" style={{ animationDelay: "0.55s" }}>
            created for your cash flow
          </div>
          <ParticleField />
        </div>

        {/* ——— Bottom info row: left copy block + right card ——— */}
        <div
          className="rise-in relative z-20 -mt-8 grid grid-cols-1 items-end gap-10 md:grid-cols-[1fr_auto] lg:-mt-12"
          style={{ animationDelay: "0.75s" }}
        >
          <div className="max-w-[260px]">
            <div className="font-display text-[15px] tracking-[0.08em] text-white uppercase">
              Delayed payments, decided
            </div>
            <p className="lead mt-3 text-[12.5px] leading-relaxed">
              SETTLE turns scattered records into a clear, evidence-backed
              payment case — so you know what&apos;s owed and what happens next.
            </p>
            <a
              href="#problem"
              className="mt-5 inline-block font-mono text-[11px] font-medium tracking-[0.22em] text-fog uppercase transition-colors hover:text-white"
            >
              See how it works →
            </a>
          </div>

          <aside
            className="glass rise-in w-full max-w-[250px] p-5 md:justify-self-end"
            style={{ animationDelay: "0.9s" }}
          >
            <div className="font-display text-[14px] tracking-[0.06em] text-white uppercase">
              Evidence
              <br />
              first. Always.
            </div>
            <p className="mt-3 text-[11.5px] leading-relaxed text-mist">
              Every claim traces back to its source document. No opaque
              guesses — policy-gated actions only.
            </p>
            <a
              href="#provenance"
              className="mt-4 inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[0.18em] text-fog uppercase transition-colors hover:text-white"
            >
              Trace a claim
              <span className="grid h-5 w-5 place-items-center rounded-full border border-white/25 text-[9px]">
                →
              </span>
            </a>
          </aside>
        </div>
      </div>
    </section>
  );
}
