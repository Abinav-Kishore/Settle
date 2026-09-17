"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import {
  CircleCheck,
  Clock,
  Gavel,
  Info,
  Send,
  TriangleAlert,
  UserCheck,
  Users,
  Zap,
} from "lucide-react";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import { inr } from "./dashboard/data";
import { pulseOnce, revealUp, tilt3d } from "@/lib/motion";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";

const ACTIONS = [
  {
    icon: Clock,
    title: "WAIT",
    note: "Nothing due yet — hold steady and keep the evidence warm.",
    when: "Payment is not yet due, or the reminder cool-off window is still open.",
    requires: ["not_overdue", "cooloff_open"],
    blocked: ["escalation_threshold"],
    example: "Nova Interiors · 6 days past due · holding inside the first-reminder window",
  },
  {
    icon: Send,
    title: "FOLLOW UP",
    note: "Payment is overdue. Send a structured reminder with the case attached.",
    when: "Overdue, obligation evidenced, and still below the escalation threshold.",
    requires: ["obligation_is_evidenced", "payment_is_overdue", "cooloff_elapsed"],
    blocked: ["escalation_threshold"],
    example: "Kalyani Steel · ₹6,50,000 balance · part payment already received",
  },
  {
    icon: Zap,
    title: "ESCALATE",
    note: "Acknowledged debt, stalled responses. Trigger the escalation workflow.",
    when: "Acknowledged, long overdue, above threshold, and no dispute on record.",
    requires: ["obligation_is_evidenced", "buyer_acknowledged", "escalation_threshold", "no_open_dispute"],
    blocked: ["auto_escalation"],
    example: "Meridian Traders · ₹4,80,000 · 45 days overdue · 2 reminders ignored",
    tone: "hot",
  },
  {
    icon: UserCheck,
    title: "HUMAN REVIEW",
    note: "Disputed or ambiguous case. Route to a person for judgment.",
    when: "An active dispute, contradictory sources, or an amount mismatch across records.",
    requires: ["active_dispute", "evidence_contradiction"],
    blocked: ["auto_escalation"],
    example: "Sunrise Logistics · buyer disputes 2 line items on the delivery record",
  },
];

type Facts = {
  amount: number;
  days: number;
  reminders: number;
  acknowledged: boolean;
  dispute: boolean;
};

const THRESHOLD = 200000;
const BASE: Facts = { amount: 480000, days: 45, reminders: 2, acknowledged: true, dispute: false };

/** Deterministic evaluator — mirrors the Case Engine + Cedar pair in production. */
function evaluate(f: Facts) {
  const overdue = f.days > 0;
  const aboveThreshold = f.amount >= THRESHOLD;

  const rules = [
    { id: "obligation_is_evidenced", ok: true, detail: "PO, invoice and delivery note all resolved" },
    { id: "payment_is_overdue", ok: overdue, detail: overdue ? `${f.days} days past the due date` : "not yet due" },
    {
      id: "cooloff_elapsed",
      ok: f.days > 10 || f.reminders > 0,
      detail: f.days > 10 ? "outside the first-reminder window" : "still inside the reminder window",
    },
    {
      id: "escalation_threshold",
      ok: aboveThreshold,
      detail: `${inr(f.amount)} against a ${inr(THRESHOLD)} threshold`,
    },
    {
      id: "buyer_acknowledged",
      ok: f.acknowledged,
      detail: f.acknowledged ? "balance acknowledged in writing" : "no acknowledgement on record",
    },
    { id: "no_open_dispute", ok: !f.dispute, detail: f.dispute ? "buyer dispute open" : "no dispute raised" },
  ];

  let action: "WAIT" | "FOLLOW UP" | "ESCALATE" | "HUMAN REVIEW" = "WAIT";
  let reason = "Nothing is due yet — hold and keep the evidence warm.";

  if (f.dispute) {
    action = "HUMAN REVIEW";
    reason = "An open dispute makes automated escalation unsafe, so the case routes to a person.";
  } else if (!overdue || f.days <= 10) {
    action = "WAIT";
    reason = "The payment is inside the reminder cool-off window, so no follow-up is permitted yet.";
  } else if (aboveThreshold && f.acknowledged && f.reminders >= 1) {
    action = "ESCALATE";
    reason = "Acknowledged, well overdue and above threshold with reminders already sent.";
  } else {
    action = "FOLLOW UP";
    reason = aboveThreshold
      ? "Overdue above threshold, but the acknowledgement or reminder condition is missing — follow up first."
      : "Overdue but below the escalation threshold, so a structured reminder is the allowed step.";
  }

  return { rules, action, reason };
}

export default function ActionsSection() {
  const gridRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const labRef = useRef<HTMLDivElement>(null);
  const decisionRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(2);
  const [facts, setFacts] = useState<Facts>(BASE);
  const { rules, action, reason } = useMemo(() => evaluate(facts), [facts]);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cleanups = Array.from(grid.querySelectorAll<HTMLElement>(".action-tile")).map((el) =>
      tilt3d(el, 8)
    );
    return () => cleanups.forEach((fn) => fn?.());
  }, []);

  useEffect(() => {
    const el = detailRef.current;
    if (!el) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-detail-row]"));
    revealUp([el], { staggerMs: 0, y: 14, duration: 480 });
    revealUp(rows, { staggerMs: 70, y: 14, delay: 80, duration: 480 });
    pulseOnce(el);
  }, [open]);

  // evaluation trace enters on scroll
  useEffect(() => {
    const root = labRef.current;
    if (!root || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      ScrollTrigger.batch(".rule-row", {
        start: "top 88%",
        once: true,
        onEnter: (batch) =>
          gsap.fromTo(
            batch,
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power2.out", overwrite: true }
          ),
      });
    }, root);
    return () => ctx.revert();
  }, []);

  // every input change re-animates the decision
  useEffect(() => {
    const el = decisionRef.current;
    if (!el) return;
    const rows = Array.from(el.querySelectorAll<HTMLElement>("[data-out-row]"));
    revealUp([el], { staggerMs: 0, y: 10, duration: 420 });
    revealUp(rows, { staggerMs: 55, y: 10, delay: 60, duration: 420 });
    pulseOnce(el);
  }, [action, reason]);

  const action_ = ACTIONS[open];
  const set = <K extends keyof Facts>(key: K, value: Facts[K]) =>
    setFacts((f) => ({ ...f, [key]: value }));

  return (
    <section id="actions" className="relative py-28">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <SectionHead
          eyebrow="Next-Action Intelligence"
          title="Four actions. Zero guessing."
          accent="policy decides, not guesses"
        >
          Select an action to see the conditions behind it — then change the facts below
          and watch the permitted decision move. SETTLE never invents a step; it
          evaluates your rules and reports what is allowed.
        </SectionHead>

        <div ref={gridRef} className="mt-14">
          <Reveal className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" staggerMs={100} y={48}>
            {ACTIONS.map((a, i) => (
              <button
                key={a.title}
                type="button"
                onClick={() => setOpen(i)}
                aria-pressed={i === open}
                data-cursor
                style={{ "--i": i } as CSSProperties}
                className={`action-tile glass tilt-card relative p-6 text-left ${
                  a.tone === "hot" ? "tile-hot" : ""
                } ${i === open ? "is-selected" : ""}`}
              >
                <div className="glow-layer absolute inset-0 rounded-[18px]" />
                <span className="tile-scan" aria-hidden />
                <div className="relative z-10">
                  <div
                    className={`step-badge grid h-11 w-11 place-items-center rounded-xl border ${
                      a.tone === "hot" ? "border-violet/60 bg-violet/15" : "border-white/12 bg-white/4"
                    }`}
                  >
                    <a.icon size={18} strokeWidth={1.6} className="text-violethi" />
                  </div>
                  <div className="mt-6 font-display text-[15px] font-normal tracking-[0.08em] text-white uppercase">
                    {a.title}
                  </div>
                  <div className="mt-2.5 text-[12px] leading-relaxed text-mist">{a.note}</div>
                </div>
                <div className="tile-meter relative z-10 mt-5" aria-hidden>
                  <span />
                </div>
              </button>
            ))}
          </Reveal>
        </div>

        {/* rationale drawer */}
        <div ref={detailRef} className="dash-card relative mt-6 overflow-hidden p-6 lg:p-7">
          <span className="tile-scan" aria-hidden />
          <div className="relative z-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <Gavel size={14} className="text-violethi" />
                <span className="font-mono text-[10px] tracking-[0.22em] text-mist uppercase">
                  Why policy returns {action_.title}
                </span>
              </div>
              <p className="font-display mt-4 text-[clamp(18px,2.2vw,24px)] tracking-[0.02em] text-white uppercase">
                {action_.title}
              </p>
              <p className="lead mt-3 max-w-lg text-[13px]">{action_.when}</p>
              <p className="mt-5 rounded-xl border border-white/8 bg-white/2 px-4 py-3 font-mono text-[11px] text-fog">
                {action_.example}
              </p>
            </div>

            <div className="space-y-3">
              {[
                { head: "Required conditions", items: action_.requires, tone: "permit" },
                { head: "Must not be true", items: action_.blocked, tone: "deny" },
              ].map((group) => (
                <div key={group.head} data-detail-row>
                  <div className="font-mono text-[9.5px] tracking-[0.22em] text-mist uppercase">
                    {group.head}
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {group.items.map((r) => (
                      <span
                        key={r}
                        className={`rounded-full border px-3 py-1.5 font-mono text-[10.5px] ${
                          group.tone === "permit"
                            ? "border-violet/45 bg-violet/10 text-violethi"
                            : "border-white/12 text-fog"
                        }`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              <p data-detail-row className="pt-1 font-mono text-[10.5px] text-mist">
                Evaluated by Cedar against your policies · never by an autonomous model decision.
              </p>
            </div>
          </div>
        </div>

        {/* ——— Policy lab ——— */}
        <div id="policy" ref={labRef} className="scroll-mt-28 pt-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="eyebrow mb-3">
                <span className="tick">/</span>&nbsp;&nbsp;Policy Lab
              </div>
              <h3 className="font-display text-[clamp(20px,2.4vw,28px)] tracking-[0.02em] text-white uppercase">
                Change the facts, watch the decision move
              </h3>
              <p className="lead mt-3 max-w-xl text-[13px]">
                Evidence and arithmetic set the facts; your policies decide what is
                permitted. A failing rule is not an error — it removes an action from
                the permitted set.
              </p>
            </div>
            <button
              type="button"
              data-cursor
              onClick={() => setFacts(BASE)}
              className="btn-pill inline-flex h-10 items-center gap-2 rounded-full px-5 text-[12.5px] font-medium"
            >
              Reset to the demo case
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
            <div className="dash-card p-6">
              <div className="flex items-center gap-3">
                <Users size={14} className="text-violethi" />
                <span className="font-mono text-[10px] tracking-[0.22em] text-mist uppercase">
                  Case facts · Meridian Traders
                </span>
              </div>

              <div className="mt-7 space-y-7">
                <Field label="Outstanding amount" value={inr(facts.amount)}>
                  <input
                    type="range"
                    min={50000}
                    max={1000000}
                    step={10000}
                    value={facts.amount}
                    onChange={(e) => set("amount", Number(e.target.value))}
                    className="range"
                    aria-label="Outstanding amount"
                  />
                </Field>

                <Field label="Days past due" value={`${facts.days} days`}>
                  <input
                    type="range"
                    min={0}
                    max={90}
                    step={1}
                    value={facts.days}
                    onChange={(e) => set("days", Number(e.target.value))}
                    className="range"
                    aria-label="Days past due"
                  />
                </Field>

                <Field label="Reminders already sent" value={String(facts.reminders)}>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3].map((n) => (
                      <button
                        key={n}
                        type="button"
                        data-cursor
                        onClick={() => set("reminders", n)}
                        aria-pressed={facts.reminders === n}
                        className={`tab-pill h-9 w-9 rounded-lg border border-white/10 font-mono text-[11px] ${
                          facts.reminders === n ? "is-on" : "text-mist"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </Field>

                <Switch
                  label="Buyer acknowledged the balance"
                  checked={facts.acknowledged}
                  onChange={(v) => set("acknowledged", v)}
                />
                <Switch
                  label="Buyer dispute is open"
                  checked={facts.dispute}
                  onChange={(v) => set("dispute", v)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div ref={decisionRef} className="dash-card relative overflow-hidden p-6">
                <span className="tile-scan" aria-hidden />
                <div className="relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] text-mist uppercase">
                      <Gavel size={13} />
                      Permitted next action
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 font-mono text-[9.5px] tracking-[0.16em] uppercase ${
                        action === "ESCALATE"
                          ? "border-violet/50 bg-violet/12 text-violethi"
                          : action === "HUMAN REVIEW"
                            ? "border-[#e0c48a]/40 bg-[#e0c48a]/10 text-[#e0c48a]"
                            : "border-white/12 text-fog"
                      }`}
                    >
                      policy-gated
                    </span>
                  </div>

                  <div className="mt-5 flex flex-wrap items-end gap-4">
                    <span className="font-display text-[clamp(30px,4.4vw,52px)] leading-none text-white uppercase">
                      {action}
                    </span>
                    <Zap size={20} className="mb-2 text-violethi" />
                  </div>

                  <p data-out-row className="lead mt-4 max-w-xl text-[13px]">
                    {reason}
                  </p>
                  <p
                    data-out-row
                    className="mt-5 rounded-xl border border-white/8 bg-white/2 px-4 py-3 font-mono text-[11px] text-fog"
                  >
                    {inr(facts.amount)} outstanding · {facts.days} days overdue · {facts.reminders}{" "}
                    reminder{facts.reminders === 1 ? "" : "s"} ·{" "}
                    {facts.acknowledged ? "acknowledged" : "not acknowledged"} ·{" "}
                    {facts.dispute ? "disputed" : "undisputed"}
                  </p>
                </div>
              </div>

              <div className="dash-card p-6">
                <div className="flex items-center gap-3">
                  <CircleCheck size={14} className="text-violethi" />
                  <span className="font-mono text-[10px] tracking-[0.22em] text-mist uppercase">
                    Evaluation trace
                  </span>
                </div>
                <div className="mt-5 space-y-2">
                  {rules.map((r, i) => (
                    <div
                      key={r.id}
                      className="rule-row flex items-start justify-between gap-4 rounded-lg border border-white/7 px-3.5 py-2.5"
                      style={{ "--i": i } as CSSProperties}
                    >
                      <div>
                        <div className="font-mono text-[11.5px] text-white">{r.id}</div>
                        <div className="mt-0.5 text-[11px] text-mist">{r.detail}</div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[9.5px] tracking-[0.14em] uppercase ${
                          r.ok ? "border-violet/45 bg-violet/10 text-violethi" : "border-white/12 text-fog"
                        }`}
                      >
                        {r.ok ? "pass" : "fail"}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-5 inline-flex items-start gap-2 font-mono text-[10.5px] text-mist">
                  <Info size={12} className="mt-0.5 shrink-0" />
                  Every decision above is reproducible: same facts and same policies always
                  produce the same action.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-mist uppercase">
        <span>{label}</span>
        <span className="text-violethi">{value}</span>
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Switch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-cursor
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 text-left"
    >
      <span className="inline-flex items-center gap-2 text-[12.5px] text-fog">
        {checked ? (
          <CircleCheck size={13} className="text-violethi" />
        ) : (
          <TriangleAlert size={13} className="text-mist" />
        )}
        {label}
      </span>
      <span className={`switch ${checked ? "is-on" : ""}`} aria-hidden>
        <span className="switch-thumb" />
      </span>
    </button>
  );
}
