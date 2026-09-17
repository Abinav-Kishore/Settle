"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Clock, FileText, FileSearch, FolderOpen } from "lucide-react";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import { pulseOnce, revealUp } from "@/lib/motion";

const FRAGMENTS = [
  {
    icon: FileText,
    title: "Fragmented Records",
    note: "Purchase orders, contracts, invoices, delivery notes, emails and payment records live in different systems — and none of them know about the others.",
  },
  {
    icon: FolderOpen,
    title: "No Single Case",
    note: "To understand one delayed payment, someone rebuilds the timeline by hand: what was agreed, what shipped, what was acknowledged.",
  },
  {
    icon: FileSearch,
    title: "Unverifiable Claims",
    note: "A balance you cannot point at a source for is hard to pursue and easy to dispute. Evidence is what makes a claim defensible.",
  },
  {
    icon: Clock,
    title: "Undecided Next Step",
    note: "Wait, remind, or escalate? Without the facts in one place, the decision stalls until the payment is already badly late.",
  },
];

const QUESTIONS = [
  { q: "What was agreed in the purchase order?", source: "Purchase Order · Page 2" },
  { q: "What amount was invoiced?", source: "Invoice · Page 1" },
  { q: "When was the payment due?", source: "Purchase Order · 30-day terms" },
  { q: "Was the product or service delivered?", source: "Delivery record · DN-2291" },
  { q: "Did the buyer acknowledge the balance?", source: "Email · Thread 17" },
  { q: "Has any payment been received?", source: "Bank statement · Feb 2026" },
  { q: "Were reminders already sent?", source: "Follow-up log · 18 Feb, 02 Mar" },
  { q: "Is there enough evidence to escalate?", source: "Case Engine · policy check" },
];

const RECORDS = [
  { tag: "PO-8841", rows: ["30-day terms", "₹4,80,000", "Signed 12 Jan"] },
  { tag: "INV-3382", rows: ["₹4,80,000 due", "Terms: 30 days", "Raised 12 Jan"] },
  { tag: "EMAIL #17", rows: ["Balance acknowledged", "Approval pending", "28 Feb"] },
  { tag: "PAYMENT", rows: ["₹0 received", "No UTR on record", "Checked 05 Mar"] },
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [answered, setAnswered] = useState<number[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const cards = Array.from(section.querySelectorAll<HTMLElement>(".frag-card"));
    if (!cards.length) return;

    // watch the card grid rather than the whole section, so the hairlines
    // draw in while the cards are actually on screen
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          cards.forEach((c) => c.classList.add("in"));
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    io.observe(cards[0].parentElement ?? section);
    return () => io.disconnect();
  }, []);

  const toggle = (i: number) => {
    setAnswered((prev) => (prev.includes(i) ? prev.filter((n) => n !== i) : [...prev, i]));
  };

  // animate the source chip of whichever question was just answered
  useEffect(() => {
    if (!answered.length || !gridRef.current) return;
    const i = answered[answered.length - 1];
    const chip = gridRef.current.querySelector<HTMLElement>(`[data-chip="${i}"]`);
    if (chip) {
      revealUp([chip], { staggerMs: 0, y: 10, duration: 520 });
      pulseOnce(chip);
    }
  }, [answered]);

  return (
    <section id="problem" ref={sectionRef} className="relative py-28">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <SectionHead
          eyebrow="The Problem"
          title="Delayed, not defensible."
          accent="know what you're owed"
        >
        For an MSME, a delayed payment is rarely just an unpaid invoice. The
          information needed to understand and pursue it is scattered across
          purchase orders, contracts, delivery records, emails and payment
          records. The problem is not a lack of information — it is that the
          information is fragmented.
        </SectionHead>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-[170px_1fr_170px] lg:gap-12">
          {/* left record fragments */}
          <div className="hidden flex-col gap-4 lg:flex">
            {RECORDS.slice(0, 2).map((r, i) => (
              <RecordFragment key={r.tag} {...r} drift={i === 0 ? -26 : 30} />
            ))}
          </div>

          {/* 2×2 problem grid */}
          <Reveal className="grid grid-cols-1 gap-x-14 gap-y-12 sm:grid-cols-2" staggerMs={90}>
            {FRAGMENTS.map((f, i) => (
              <div key={f.title} className="frag-card" style={{ "--i": i } as CSSProperties}>
                <div className="frag-icon inline-flex" style={{ "--i": i } as CSSProperties}>
                  <f.icon size={20} strokeWidth={1.6} className="text-fog" />
                </div>
                <div className="frag-title mt-4 font-display text-[14px] tracking-[0.06em] text-white uppercase">
                  {f.title}
                </div>
                <div className="frag-line mt-3 mb-3" />
                <p className="max-w-[320px] text-[12.5px] leading-relaxed text-mist">{f.note}</p>
              </div>
            ))}
          </Reveal>

          {/* right record fragments */}
          <div className="hidden flex-col gap-4 lg:flex">
            {RECORDS.slice(2).map((r, i) => (
              <RecordFragment key={r.tag} {...r} drift={i === 0 ? 30 : -26} />
            ))}
          </div>
        </div>

        {/* ——— Interactive: the eight facts a payment case needs ——— */}
        <div ref={gridRef} className="mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow mb-3">
                <span className="tick">/</span>&nbsp;&nbsp;What A Case Needs
              </div>
              <h3 className="font-display text-[clamp(20px,2.4vw,28px)] tracking-[0.02em] text-white uppercase">
                Eight questions, eight sources
              </h3>
              <p className="lead mt-3 max-w-xl text-[13px]">
                Tap a question to see which record answers it. SETTLE resolves
                all eight into one case — this is the checklist behind every
                reconstructed payment.
              </p>
            </div>
            <span
              data-counter
              className="rounded-full border border-white/10 px-3.5 py-2 font-mono text-[10.5px] tracking-[0.18em] text-fog uppercase"
            >
              {answered.length} / {QUESTIONS.length} answered
            </span>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {QUESTIONS.map((item, i) => {
              const on = answered.includes(i);
              return (
                <button
                  key={item.q}
                  type="button"
                  onClick={() => toggle(i)}
                  data-cursor
                  aria-pressed={on}
                  style={{ "--i": i } as CSSProperties}
                  className={`q-card dash-row flex flex-col justify-between gap-4 p-4 text-left ${
                    on ? "is-selected" : ""
                  }`}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-mono text-[10px] text-mist">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[9px] transition-colors duration-300 ${
                        on ? "border-violet/60 bg-violet/25 text-violethi" : "border-white/15 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </span>
                  <span className="text-[12.5px] leading-snug text-white">{item.q}</span>
                  <span
                    data-chip={i}
                    className={`rounded-lg border px-2.5 py-1.5 font-mono text-[10px] transition-colors duration-300 ${
                      on
                        ? "border-violet/45 bg-violet/10 text-violethi"
                        : "border-white/8 text-mist"
                    }`}
                  >
                    → {item.source}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function RecordFragment({
  tag,
  rows,
  drift,
}: {
  tag: string;
  rows: string[];
  drift: number;
}) {
  return (
    <div
      data-parallax={drift}
      className="glass relative overflow-hidden p-4"
      aria-hidden
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9.5px] tracking-[0.18em] text-violethi">{tag}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((r) => (
          <div key={r} className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-violet/60" />
            <span className="font-mono text-[10px] text-mist">{r}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 space-y-1.5">
        <span className="block h-[3px] w-full rounded-full bg-white/6" />
        <span className="block h-[3px] w-3/4 rounded-full bg-white/6" />
        <span className="block h-[3px] w-1/2 rounded-full bg-white/6" />
      </div>
    </div>
  );
}
