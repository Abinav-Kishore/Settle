"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, FileText } from "lucide-react";
import SectionHead from "./SectionHead";
import { drawPaths, pulseOnce, revealUp } from "@/lib/motion";

const CLAIMS = [
  {
    claim: "₹4,80,000 outstanding",
    kind: "Invoice",
    source: "INV-3382 · Page 1",
    confidence: 98,
    excerpt: ["Total payable ......... ₹4,80,000", "Terms ................. 30 days", "Due ................... 04 Feb 2026"],
    why: "This is the amount the case engine computes from. If the invoice disagrees with the purchase order, the case is flagged rather than guessed at.",
  },
  {
    claim: "30-day payment terms",
    kind: "Purchase Order",
    source: "PO-8841 · Page 2",
    confidence: 96,
    excerpt: ["Clause 4 — Payment", "Net 30 days from delivery", "Owner: Meridian Traders Pvt Ltd"],
    why: "The due date comes from here, not from the invoice. Terms in the PO override a shorter date printed on the invoice.",
  },
  {
    claim: "Buyer acknowledgement",
    kind: "Email",
    source: "Thread 17",
    confidence: 91,
    excerpt: ['"We have noted the pending amount."', '"Release expected after internal approval."', "From: accounts@meridian.example"],
    why: "A written acknowledgement is strong evidence that the balance is owed. It also changes which actions policy will permit.",
  },
  {
    claim: "Delivered in full",
    kind: "Delivery",
    source: "DN-2291",
    confidence: 94,
    excerpt: ["14 units dispatched", "Received and signed for", "No shortfall recorded"],
    why: "Delivery evidence closes the most common defence against a claim — that the goods or services never arrived.",
  },
];

const TONE: Record<string, string> = {
  Invoice: "border-violet/45 text-violethi",
  "Purchase Order": "border-white/14 text-fog",
  Email: "border-white/14 text-fog",
  Delivery: "border-white/14 text-fog",
};

export default function ProvenanceSection() {
  const svgRef = useRef<SVGSVGElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const claim = CLAIMS[active];

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const paths = svg.querySelectorAll<SVGPathElement>("path.connector-base");
    paths.forEach((p) => {
      const total = p.getTotalLength();
      p.style.strokeDasharray = String(total);
      p.style.strokeDashoffset = String(total);
    });

    let liveTimer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          drawPaths(paths, 1200, 250);
          liveTimer = setTimeout(() => svg.classList.add("live-run"), 1500);
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(svg);
    return () => {
      if (liveTimer) clearTimeout(liveTimer);
      io.disconnect();
    };
  }, []);

  // animate the preview swapping between sources
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const lines = Array.from(panel.querySelectorAll<HTMLElement>("[data-ex-line]"));
    revealUp([panel], { staggerMs: 0, y: 12, duration: 460 });
    revealUp(lines, { staggerMs: 55, y: 12, delay: 60, duration: 460 });
    pulseOnce(panel);
  }, [active]);

  return (
    <section id="provenance" className="relative py-28">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <SectionHead
          eyebrow="Evidence Trail"
          title="Every claim points back"
          accent="to its source."
        >
          Understand not just what SETTLE says — but why it says it. Select a
          claim to open the record behind it.
        </SectionHead>

        <div className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px]">
          {/* claim rows + drawn connectors */}
          <div className="relative">
            <svg
              ref={svgRef}
              className="pointer-events-none absolute inset-0 z-0 h-full w-full"
              aria-hidden
            >
              {CLAIMS.map((_, i) => (
                <path
                  key={`base-${i}`}
                  className="connector-base"
                  d={`M 26 ${37 + i * 86} C 120 ${37 + i * 86}, 160 ${37 + i * 86}, 230 ${37 + i * 86}`}
                  fill="none"
                  stroke={i === active ? "rgba(183,154,236,0.65)" : "rgba(168,85,247,0.3)"}
                  strokeWidth="1.2"
                  style={{ transition: "stroke 400ms ease" }}
                />
              ))}
              {CLAIMS.map((_, i) => (
                <path
                  key={`live-${i}`}
                  className="connector-live"
                  d={`M 26 ${37 + i * 86} C 120 ${37 + i * 86}, 160 ${37 + i * 86}, 230 ${37 + i * 86}`}
                  fill="none"
                  stroke="rgba(183,154,236,0.8)"
                  strokeWidth="1.4"
                />
              ))}
            </svg>

            <div className="relative z-10 space-y-3">
              {CLAIMS.map((c, i) => {
                const on = i === active;
                return (
                  <button
                    key={c.claim}
                    type="button"
                    onClick={() => setActive(i)}
                    data-cursor
                    aria-pressed={on}
                    className={`claim-row glass flex h-auto w-full flex-col gap-2 p-5 text-left sm:h-[74px] sm:flex-row sm:items-center sm:justify-between ${
                      on ? "is-selected" : ""
                    }`}
                  >
                    <span className="flex items-center gap-4">
                      <span className="claim-dot h-2 w-2 rounded-full bg-violet shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
                      <span className="text-[14px] font-medium text-white">{c.claim}</span>
                    </span>
                    <span className="flex items-center gap-2 font-mono text-[11px] text-mist">
                      <span className="text-violet">→</span>
                      <span
                        className={`source-chip rounded-full border px-2.5 py-1 ${TONE[c.kind] ?? "border-white/10"}`}
                      >
                        {c.source}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* source preview */}
          <div className="lg:sticky lg:top-28 lg:h-fit">
            <div ref={panelRef} className="dash-card relative overflow-hidden p-6">
              <span className="tile-scan" aria-hidden />
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-mist uppercase">
                    <FileText size={12} />
                    {claim.kind}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-violet/40 bg-violet/10 px-2.5 py-1 font-mono text-[9.5px] tracking-[0.14em] text-violethi uppercase">
                    <BadgeCheck size={11} />
                    verified
                  </span>
                </div>

                <h3 className="font-display mt-5 text-[15px] tracking-[0.05em] text-white uppercase">
                  {claim.source}
                </h3>

                <div className="mt-4 space-y-2 rounded-xl border border-white/8 bg-black/25 p-4">
                  {claim.excerpt.map((line) => (
                    <div key={line} data-ex-line className="font-mono text-[11px] text-fog">
                      {line}
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between font-mono text-[9.5px] tracking-[0.2em] text-mist uppercase">
                    <span>Extraction confidence</span>
                    <span className="text-violethi">{claim.confidence}%</span>
                  </div>
                  <div className="tile-meter mt-2.5" aria-hidden>
                    <span style={{ width: `${claim.confidence}%`, transform: "none" }} />
                  </div>
                </div>

                <p className="lead mt-5 border-t border-white/8 pt-4 text-[12.5px]">
                  <span className="font-mono text-[10px] tracking-[0.18em] text-violethi uppercase">
                    why it matters ·{" "}
                  </span>
                  {claim.why}
                </p>
              </div>
            </div>

            <p className="mt-4 font-mono text-[10.5px] text-mist">
              Source excerpts are illustrative. In production they are retrieved from
              OpenSearch and rendered from the original document in S3.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
