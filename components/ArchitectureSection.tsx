"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Boxes, Cpu, Gavel, Quote, ShieldCheck } from "lucide-react";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import { drawPaths, revealUp } from "@/lib/motion";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const LAYERS = [
  { name: "Amazon S3", role: "Document store" },
  { name: "Qwen 2.5 7B", role: "Document understanding" },
  { name: "OpenSearch", role: "Evidence retrieval" },
  { name: "Strands", role: "Agent orchestration" },
  { name: "SETTLE Case Engine", role: "Deterministic calculations" },
  { name: "Cedar", role: "Policy evaluation" },
];

const CHAIN = [
  {
    icon: Cpu,
    name: "AI",
    role: "Interprets",
    note: "Reads documents and identifies what matters — amounts, terms, dates, acknowledgements.",
    cannot: "Cannot decide what is owed or what to do about it.",
  },
  {
    icon: Boxes,
    name: "Case Engine",
    role: "Calculates",
    note: "Computes deterministic facts: outstanding balance, overdue period, payment and delivery status.",
    cannot: "Does not read prose or infer intent.",
  },
  {
    icon: ShieldCheck,
    name: "Evidence",
    role: "Supports",
    note: "Every important claim is linked to the source document and the page it came from.",
    cannot: "Cannot be rewritten by the model — provenance is recorded, not generated.",
  },
  {
    icon: Gavel,
    name: "Cedar",
    role: "Permits",
    note: "Evaluates whether a proposed action is allowed under your business policies.",
    cannot: "Never permits an action outside the written policy set.",
  },
];

const STATEMENT =
  "AI can interpret evidence. It should not be the source of truth for financial calculations or authorization.";

const TABS = ["Pipeline", "Responsibilities"] as const;

export default function ArchitectureSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Pipeline");

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      if (tab === "Pipeline") {
        const spine = root.querySelector<HTMLElement>("[data-spine-fill]");
        if (spine) {
          gsap.fromTo(
            spine,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: "none",
              scrollTrigger: { trigger: root, start: "top 70%", end: "bottom 60%", scrub: true },
            }
          );
        }
      } else {
        gsap.fromTo(
          "[data-chain-node]",
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out" }
        );
        gsap.fromTo(
          "[data-chain-line]",
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            transformOrigin: "left center",
            scrollTrigger: { trigger: "[data-chain]", start: "top 80%", end: "bottom 70%", scrub: true },
          }
        );
      }
    }, root);

    return () => ctx.revert();
  }, [tab]);

  // pipeline connectors + node ignition (anime.js)
  useEffect(() => {
    if (tab !== "Pipeline") return;
    const svg = svgRef.current;
    if (!svg) return;

    const paths = svg.querySelectorAll<SVGPathElement>("path.connector-base");
    paths.forEach((p) => {
      const total = p.getTotalLength();
      p.style.strokeDasharray = String(total);
      p.style.strokeDashoffset = String(total);
    });

    const nodes = Array.from(rootRef.current?.querySelectorAll<HTMLElement>(".pipe-node") ?? []);

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          drawPaths(paths, 1400, 150);
          nodes.forEach((n) => n.classList.add("in"));
          io.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    io.observe(svg);
    return () => io.disconnect();
  }, [tab]);

  // scrubbed statement
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const words = Array.from(root.querySelectorAll<HTMLElement>("[data-arch-word]"));
    if (prefersReducedMotion()) {
      gsap.set(words, { opacity: 1 });
      return;
    }
    const ctx = gsap.context(() => {
      gsap.fromTo(
        words,
        { opacity: 0.14 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.4,
          scrollTrigger: {
            trigger: root.querySelector("[data-statement]"),
            start: "top 80%",
            end: "bottom 55%",
            scrub: true,
          },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  // deep links: #trust scrolls here and opens the responsibilities view
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash;
      if (hash === "#trust") setTab("Responsibilities");
      else if (hash === "#architecture") setTab("Pipeline");
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);

  // responsibilities tab enters on switch
  useEffect(() => {
    if (tab !== "Responsibilities") return;
    const root = rootRef.current;
    if (!root) return;
    revealUp(root.querySelectorAll("[data-chain-node]"), { staggerMs: 90, y: 26, duration: 620 });
  }, [tab]);

  return (
    <section id="architecture" className="relative scroll-mt-24 py-28">
      <div ref={rootRef} className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <SectionHead
          eyebrow="Architecture & Trust"
          title="AI interprets. Code decides."
          accent="separated on purpose"
        >
          Interpretation, deterministic computation and policy enforcement are kept in
          separate layers — so you can always see which one produced a number, and which
          one permitted an action.
        </SectionHead>

        <div id="trust" className="mt-12 flex scroll-mt-24 justify-center gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              data-cursor
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`tab-pill rounded-full border border-white/10 px-4 py-2 font-mono text-[10.5px] tracking-[0.18em] uppercase ${
                tab === t ? "is-on" : "text-mist"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Pipeline" ? (
          <div className="relative mt-14 max-w-2xl">
            <span
              className="pointer-events-none absolute top-0 left-[27px] z-0 h-full w-[2px] bg-white/8"
              aria-hidden
            >
              <span
                data-spine-fill
                className="block h-full w-full origin-top bg-gradient-to-b from-violet via-violetdeep to-violethi"
              />
            </span>
            <svg
              ref={svgRef}
              className="pointer-events-none absolute top-0 left-[27px] z-0 h-full w-[3px]"
              aria-hidden
            >
              <path
                className="connector-base"
                d="M 1.5 0 V 100%"
                fill="none"
                stroke="rgba(183,154,236,0.55)"
                strokeWidth="1.5"
              />
            </svg>

            <Reveal className="space-y-3" staggerMs={110} y={42}>
              {LAYERS.map((l, i) => (
                <div key={l.name} className="relative z-10 flex items-center gap-5">
                  <div
                    className="pipe-node relative grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-white/12 bg-panel font-mono text-[11px] text-violethi"
                    style={{ "--i": i } as CSSProperties}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="glass flex-1 px-5 py-4">
                    <div className="font-display text-[14px] tracking-[0.06em] text-white uppercase">
                      {l.name}
                    </div>
                    <div className="mt-0.5 text-[12px] text-mist">{l.role}</div>
                  </div>
                </div>
              ))}
            </Reveal>

            <div className="mt-6 flex items-center gap-5">
              <div className="h-14 w-14 shrink-0" />
              <div
                data-cursor
                className="relative rounded-2xl border border-violet/40 bg-violet/10 px-5 py-4 font-display text-[14px] tracking-[0.06em] text-violethi uppercase"
              >
                <span
                  className="absolute inset-0 animate-ping rounded-2xl border border-violet/30 [animation-duration:2.6s]"
                  aria-hidden
                />
                <span className="relative">Recommended Action</span>
              </div>
            </div>
          </div>
        ) : (
          <div data-chain className="relative mt-14 grid grid-cols-1 gap-4 lg:grid-cols-4">
            <span
              data-chain-line
              className="pointer-events-none absolute top-[54px] left-0 hidden h-px w-full origin-left bg-gradient-to-r from-violet/60 via-violet/30 to-transparent lg:block"
              aria-hidden
            />
            {CHAIN.map((c, i) => (
              <div
                key={c.name}
                data-chain-node
                style={{ "--i": i } as CSSProperties}
                className="glass group relative p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="step-badge grid h-11 w-11 place-items-center rounded-xl border border-white/12">
                    <c.icon size={17} strokeWidth={1.6} className="text-violethi" />
                  </span>
                  <span className="font-mono text-[9.5px] tracking-[0.2em] text-mist uppercase">
                    {c.role}
                  </span>
                </div>
                <div className="font-display mt-5 text-[15px] tracking-[0.06em] text-white uppercase">
                  {c.name}
                </div>
                <p className="mt-2.5 text-[12px] leading-relaxed text-mist">{c.note}</p>
                <p className="mt-4 border-t border-white/8 pt-3 font-mono text-[10.5px] text-fog">
                  {c.cannot}
                </p>
              </div>
            ))}
          </div>
        )}

        <blockquote
          data-statement
          className="relative mx-auto mt-16 max-w-4xl rounded-2xl border border-white/8 bg-white/2 px-6 py-8 lg:px-10 lg:py-10"
        >
          <Quote size={18} className="text-violet" />
          <p className="font-display mt-4 text-[clamp(19px,2.8vw,32px)] leading-[1.26] tracking-[0.01em] text-white uppercase">
            {STATEMENT.split(" ").map((w, i) => (
              <span key={`${w}-${i}`} data-arch-word className="inline-block">
                {w}
                {"\u00A0"}
              </span>
            ))}
          </p>
          <footer className="mt-5 font-mono text-[10.5px] tracking-[0.2em] text-mist uppercase">
            The SETTLE design principle
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
