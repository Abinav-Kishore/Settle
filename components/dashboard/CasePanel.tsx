"use client";

import { useState, type CSSProperties } from "react";
import {
  Banknote,
  CircleCheck,
  CircleX,
  Play,
  Receipt,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import CountUp from "../Fx/CountUp";
import { inr, outstanding, type Case as CaseData, type EvidenceItem, type PolicyCheck } from "./data";

const POLICY_META: Record<
  PolicyCheck["result"],
  { label: string; icon: typeof ShieldCheck; cls: string }
> = {
  permit: { label: "Permitted", icon: CircleCheck, cls: "text-violethi border-violet/45 bg-violet/10" },
  review: { label: "Needs review", icon: TriangleAlert, cls: "text-[#e0c48a] border-[#e0c48a]/35 bg-[#e0c48a]/10" },
  deny: { label: "Blocked", icon: CircleX, cls: "text-fog border-white/12 bg-white/4" },
};

const EVIDENCE_TONE: Record<EvidenceItem["status"], string> = {
  verified: "text-violethi border-violet/40 bg-violet/10",
  partial: "text-fog border-white/14 bg-white/4",
  unverified: "text-mist border-white/10",
};

type Fact = {
  label: string;
  value?: number;
  format?: (v: number) => string;
  suffix?: string;
  text?: string;
  highlight?: boolean;
};

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10px] tracking-[0.26em] text-mist uppercase">{children}</div>
  );
}

export default function CasePanel({ caseData }: { caseData: CaseData }) {
  const [queued, setQueued] = useState(false);
  const due = outstanding(caseData);

  const fields: Fact[] = [
    { label: "Invoiced", value: caseData.invoiced, format: inr },
    { label: "Received", value: caseData.received, format: inr },
    { label: "Outstanding", value: due, format: inr, highlight: true },
    { label: "Payment terms", value: caseData.terms, suffix: " days" },
    { label: "Due date", text: caseData.dueDate },
    { label: "Overdue", value: caseData.overdueDays, suffix: " days", highlight: true },
  ];

  return (
    <div className="space-y-6">
      {/* ——— Case header ——— */}
      <div className="dash-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-[240px] flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[10.5px] tracking-[0.2em] text-mist">{caseData.id}</span>
              <span className="rounded-full border border-violet/40 bg-violet/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] text-violethi uppercase">
                {caseData.status}
              </span>
              <span className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] text-mist uppercase">
                Demo data
              </span>
            </div>
            <h2 className="font-display mt-3 text-[clamp(20px,2.4vw,28px)] tracking-[0.02em] text-white uppercase">
              {caseData.buyer}
            </h2>
            <p className="lead mt-2.5 max-w-xl text-[13px]">{caseData.rationale}</p>
          </div>

          <div className="text-left sm:text-right">
            <Label>Outstanding</Label>
            <CountUp
              value={due}
              format={inr}
              className="font-display mt-2 block text-[clamp(22px,2.6vw,32px)] leading-none text-white"
            />
            <div className="mt-3 flex items-center gap-2 font-mono text-[10.5px] text-mist sm:justify-end">
              <span className="status-dot h-1.5 w-1.5 rounded-full bg-violethi" />
              {caseData.overdueDays} days past due
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.22em] text-mist uppercase">
            <span>Reconstructing case</span>
            <span>
              {caseData.evidence.length} sources · {Math.round(caseData.confidence * 100)}% confidence
            </span>
          </div>
          <div className="recon-bar mt-2.5">
            <span />
          </div>
        </div>
      </div>

      {/* ——— Deterministic financial facts ——— */}
      <div className="dash-card p-6">
        <div className="flex items-center justify-between">
          <Label>Financial facts · Case Engine</Label>
          <span className="font-mono text-[10px] text-mist">deterministic</span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {fields.map((f, i) => (
            <div
              key={f.label}
              className="dash-field rounded-xl border border-white/7 bg-white/2 p-4"
              style={{ "--i": i } as CSSProperties}
            >
              <div className="font-mono text-[9.5px] tracking-[0.22em] text-mist uppercase">{f.label}</div>
              {f.text ? (
                <div className="font-display mt-2.5 text-[16px] text-white">{f.text}</div>
              ) : (
                <CountUp
                  value={f.value ?? 0}
                  format={f.format ? f.format : (v) => `${Math.round(v)}${f.suffix ?? ""}`}
                  duration={1200}
                  className={`font-display mt-2.5 block text-[17px] ${f.highlight ? "text-violethi" : "text-white"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ——— Evidence + policy ——— */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="dash-card p-6">
          <div className="flex items-center justify-between">
            <Label>Evidence trail · OpenSearch</Label>
            <span className="font-mono text-[10px] text-mist">{caseData.evidence.length} linked</span>
          </div>
          <div className="mt-5 space-y-2.5">
            {caseData.evidence.map((e, i) => (
              <div
                key={e.source}
                className="dash-row flex items-start justify-between gap-4 p-3.5"
                style={{ "--i": i } as CSSProperties}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet shadow-[0_0_10px_rgba(168,85,247,0.7)]" />
                  <div>
                    <div className="text-[13px] text-white">{e.claim}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 font-mono text-[10.5px] text-mist">
                      <span className="text-violet">→</span>
                      <span className="rounded-full border border-white/10 px-2 py-0.5">{e.kind}</span>
                      <span>{e.source}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 font-mono text-[9.5px] tracking-[0.14em] uppercase ${EVIDENCE_TONE[e.status]}`}
                >
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-card p-6">
          <div className="flex items-center justify-between">
            <Label>Policy evaluation · Cedar</Label>
            <ShieldCheck size={15} className="text-mist" />
          </div>
          <div className="mt-5 space-y-2.5">
            {caseData.policy.map((p, i) => {
              const meta = POLICY_META[p.result];
              const Icon = meta.icon;
              return (
                <div
                  key={p.rule}
                  className="dash-row flex items-start justify-between gap-4 p-3.5"
                  style={{ "--i": i } as CSSProperties}
                >
                  <div>
                    <div className="font-mono text-[12px] text-white">{p.rule}</div>
                    <div className="mt-1 text-[11.5px] text-mist">{p.detail}</div>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9.5px] tracking-[0.14em] uppercase ${meta.cls}`}
                  >
                    <Icon size={11} />
                    {meta.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-white/8 pt-5">
            <Label>Next best action</Label>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="font-display text-[clamp(18px,2.2vw,24px)] tracking-[0.08em] text-white uppercase">
                {caseData.action}
              </span>
              <span className="rounded-full border border-violet/40 bg-violet/10 px-2.5 py-1 font-mono text-[9.5px] tracking-[0.16em] text-violethi uppercase">
                policy-gated
              </span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setQueued(true)}
                data-cursor
                className="btn-primary relative inline-flex h-10 items-center gap-2 rounded-full px-5 text-[12.5px] font-medium"
              >
                <Play size={13} />
                Approve &amp; run
              </button>
              <button
                type="button"
                data-cursor
                className="btn-pill inline-flex h-10 items-center gap-2 rounded-full px-5 text-[12.5px] font-medium"
              >
                Send to human review
              </button>
            </div>
            {queued ? (
              <p className="mt-4 inline-flex items-center gap-2 font-mono text-[10.5px] text-violethi">
                <CircleCheck size={12} />
                Action queued — workflow prepared for execution (demo only).
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* ——— Timeline ——— */}
      <div className="dash-card p-6">
        <div className="flex items-center justify-between">
          <Label>Case timeline</Label>
          <span className="inline-flex items-center gap-2 font-mono text-[10px] text-mist">
            <Receipt size={12} />
            {caseData.evidence.length} records
          </span>
        </div>
        <div className="relative mt-5 pl-5">
          <span className="absolute top-2 bottom-2 left-[5px] w-px bg-gradient-to-b from-violet/60 to-white/5" aria-hidden />
          <div className="space-y-4">
            {caseData.timeline.map((t, i) => (
              <div
                key={t.when + t.what}
                className="dash-field relative"
                style={{ "--i": i } as CSSProperties}
              >
                <span className="absolute top-[7px] -left-[19px] h-1.5 w-1.5 rounded-full bg-violethi" aria-hidden />
                <div className="font-mono text-[10px] tracking-[0.2em] text-mist uppercase">{t.when}</div>
                <div className="mt-1 text-[12.5px] text-fog">{t.what}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex items-center gap-2 border-t border-white/8 pt-4 font-mono text-[10.5px] text-mist">
          <Banknote size={12} />
          Amounts computed by the Case Engine — AI interpreted the sources, it did not do the math.
        </div>
      </div>
    </div>
  );
}
