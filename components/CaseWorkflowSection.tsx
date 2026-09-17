"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { CircleCheck, Gavel, RefreshCw, Scale } from "lucide-react";
import SectionHead from "./SectionHead";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const STAGES = [
  {
    tag: "Purchase Order",
    ref: "PO-8841 · Page 2",
    title: "30-day payment terms",
    note: "The obligation's clock is set here. Terms, value and the agreed scope all trace back to this document.",
    value: "Terms: net 30",
  },
  {
    tag: "Invoice",
    ref: "INV-3382 · Page 1",
    title: "Payment obligation established",
    note: "The invoice turns the agreement into a specific, dated amount owed by a named buyer.",
    value: "₹4,80,000",
  },
  {
    tag: "Delivery Record",
    ref: "DN-2291",
    title: "Fulfilment confirmed",
    note: "Delivery evidence closes the most common defence against a claim: that the goods or services never arrived.",
    value: "14 units received",
  },
  {
    tag: "Buyer Email",
    ref: "Thread 17",
    title: "Payment acknowledged",
    note: "An acknowledgement in writing is strong evidence. It removes ambiguity about whether the balance is owed.",
    value: "Balance noted",
  },
  {
    tag: "Payment Record",
    ref: "Bank statement · Feb 2026",
    title: "No payment received",
    note: "SETTLE checks the payment side too, so an overdue case is never built on a settlement that already happened.",
    value: "₹0 received",
  },
  {
    tag: "SETTLE",
    ref: "Case engine · Cedar",
    title: "The case is reconstructed",
    note: "Amounts and overdue days are computed deterministically, evidence is attached to every claim, and policy decides what is permitted next.",
    value: "ESCALATE",
    outcome: true,
  },
];

export default function CaseWorkflowSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    if (!root || !stage) return;

    const cards = Array.from(stage.querySelectorAll<HTMLElement>("[data-wf-card]"));
    const ticks = Array.from(stage.querySelectorAll<HTMLElement>("[data-wf-tick]"));

    if (prefersReducedMotion()) {
      gsap.set(cards, { autoAlpha: 0, y: 24 });
      gsap.set(cards[0], { autoAlpha: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(cards, { autoAlpha: 0, y: 34 });
      gsap.set(cards[0], { autoAlpha: 1, y: 0 });
      ticks.forEach((t, i) => t.classList.toggle("is-on", i === 0));

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            const idx = Math.min(STAGES.length - 1, Math.floor(self.progress * STAGES.length));
            ticks.forEach((t, i) => t.classList.toggle("is-on", i === idx));
            if (countRef.current) {
              countRef.current.textContent = String(idx + 1).padStart(2, "0");
            }
          },
        },
      });

      cards.forEach((card, i) => {
        if (i === 0) return;
        tl.to(cards[i - 1], { autoAlpha: 0, y: -30, duration: 0.45 }).to(
          card,
          { autoAlpha: 1, y: 0, duration: 0.45 },
          "<0.12"
        );
      });

      // progress rail fills across the whole walk-through
      const fill = stage.querySelector<HTMLElement>("[data-wf-fill]");
      if (fill) {
        gsap.fromTo(
          fill,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: true },
          }
        );
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section id="workflow" className="relative">
      <div className="mx-auto max-w-[1240px] px-6 pt-28 lg:px-10">
        <SectionHead
          eyebrow="Example Workflow"
          title="One case, five records."
          accent="then a decision"
        >
          A typical delayed payment is not one document — it is a chain. This is
          what SETTLE walks from end to end.
        </SectionHead>
      </div>

      {/* tall wrapper; the stage sticks while the timeline scrubs */}
      <div ref={rootRef} className="relative mt-6" style={{ height: `${STAGES.length * 44}vh` }}>
        <div ref={stageRef} className="sticky top-0 flex h-screen items-center overflow-hidden">
          <div className="mx-auto w-full max-w-[1240px] px-6 lg:px-10">
            {/* progress header */}
            <div className="flex items-center gap-4">
              <span className="font-display text-[34px] leading-none text-white" ref={countRef}>
                01
              </span>
              <span className="font-mono text-[11px] text-mist">
                / {String(STAGES.length).padStart(2, "0")}
              </span>
              <span className="relative ml-2 h-px flex-1 bg-white/8">
                <span
                  data-wf-fill
                  className="absolute inset-0 origin-left bg-gradient-to-r from-violet to-violethi"
                />
              </span>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[300px_1fr] lg:gap-16">
              {/* stage rail */}
              <ol className="hidden flex-col gap-4 lg:flex">
                {STAGES.map((s, i) => (
                  <li
                    key={s.tag}
                    data-wf-tick
                    className="wf-tick flex items-start gap-3 text-[12px]"
                    style={{ "--i": i } as CSSProperties}
                  >
                    <span className="wf-tick-dot mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/20" />
                    <span>
                      <span className="block font-mono text-[10px] tracking-[0.18em] text-mist uppercase">
                        {s.tag}
                      </span>
                      <span className="wf-tick-label mt-1 block text-mist">{s.title}</span>
                    </span>
                  </li>
                ))}
              </ol>

              {/* card stack — all cards occupy the same box, scrubbed one at a time */}
              <div className="relative min-h-[300px] sm:min-h-[280px]">
                {STAGES.map((s) => (
                  <article
                    key={s.tag}
                    data-wf-card
                    className={`glass absolute inset-0 flex flex-col justify-between p-7 ${
                      s.outcome ? "border-violet/45" : ""
                    }`}
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-mono text-[10px] tracking-[0.22em] text-mist uppercase">
                          {s.tag}
                        </span>
                        <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[9.5px] text-mist">
                          {s.ref}
                        </span>
                      </div>
                      <h3 className="font-display mt-5 text-[clamp(20px,2.6vw,30px)] tracking-[0.02em] text-white uppercase">
                        {s.title}
                      </h3>
                      <p className="lead mt-3 max-w-2xl text-[13.5px]">{s.note}</p>
                    </div>

                    {s.outcome ? (
                      <div className="mt-6 space-y-2.5">
                        {[
                          { icon: RefreshCw, text: "Payment is overdue — 45 days past the PO terms" },
                          { icon: Scale, text: "Case engine computed ₹4,80,000 outstanding from 5 records" },
                          { icon: Gavel, text: "Cedar evaluated the policy — escalation is permitted" },
                          { icon: CircleCheck, text: "Next action surfaced: ESCALATE with evidence attached" },
                        ].map((row, i) => (
                          <div
                            key={row.text}
                            className="dash-field flex items-center gap-3 rounded-lg border border-white/8 bg-white/2 px-3.5 py-2.5"
                            style={{ "--i": i } as CSSProperties}
                          >
                            <row.icon size={14} className="shrink-0 text-violethi" />
                            <span className="text-[12px] text-fog">{row.text}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <span className="font-display text-[clamp(16px,2vw,22px)] text-violethi uppercase">
                          {s.value}
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.18em] text-mist uppercase">
                          traced to source
                        </span>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </div>

            <p className="mt-8 font-mono text-[10.5px] text-mist">
              Illustrative case · Meridian Traders Pvt Ltd · keep scrolling
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
