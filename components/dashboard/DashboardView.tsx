"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ArrowLeft, Bell, Search, Sparkles } from "lucide-react";
import CountUp from "../Fx/CountUp";
import CasePanel from "./CasePanel";
import { CASES, inr, outstanding } from "./data";

const TABS = ["All", "Overdue", "Awaiting", "Disputed"] as const;
type Tab = (typeof TABS)[number];

export default function DashboardView() {
  const [tab, setTab] = useState<Tab>("All");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(CASES[0].id);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return CASES.filter((c) => (tab === "All" ? true : c.status === tab)).filter((c) =>
      q ? `${c.id} ${c.buyer}`.toLowerCase().includes(q) : true
    );
  }, [tab, query]);

  const activeCase = rows.find((c) => c.id === selectedId) ?? rows[0] ?? CASES[0];

  const kpis = useMemo(() => {
    const total = CASES.reduce((sum, c) => sum + outstanding(c), 0);
    const late = CASES.filter((c) => c.overdueDays > 30);
    return [
      {
        label: "Total outstanding",
        value: total,
        format: inr,
        note: `${CASES.length} open cases`,
      },
      {
        label: "Past 30 days",
        value: late.reduce((sum, c) => sum + outstanding(c), 0),
        format: inr,
        note: `${late.length} cases at risk`,
      },
      {
        label: "Evidence linked",
        value: CASES.reduce((sum, c) => sum + c.evidence.length, 0),
        format: (v: number) => String(Math.round(v)),
        note: "across PO, invoice, email, payment",
      },
      {
        label: "Actions pending",
        value: CASES.filter((c) => c.action !== "WAIT").length,
        format: (v: number) => String(Math.round(v)),
        note: "policy-permitted next steps",
      },
    ];
  }, []);

  return (
    <div className="relative min-h-screen bg-ink pb-24">
      <div className="fx-spotlight" aria-hidden />
      <div className="fx-vignette" aria-hidden />

      {/* ——— Top bar ——— */}
      <header className="sticky top-0 z-50 border-b border-white/8 bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-6 py-4 lg:px-10">
          <a
            href="/"
            data-cursor
            className="nav-link inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[0.2em] text-mist uppercase transition-colors hover:text-white"
          >
            <ArrowLeft size={13} />
            <span className="hidden sm:inline">Back to site</span>
          </a>

          <a href="/" className="ml-2 flex items-center gap-2.5" data-cursor>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#f2f1f3" />
            </svg>
            <span className="font-display text-[14px] tracking-[0.18em] text-white">SETTLE</span>
          </a>

          <span className="hidden rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] tracking-[0.18em] text-fog uppercase md:inline">
            Case Dashboard
          </span>

          <div className="ml-auto flex items-center gap-3">
            <label className="hidden items-center gap-2 rounded-full border border-white/10 px-3.5 py-2 focus-within:border-violet/45 md:flex">
              <Search size={13} className="text-mist" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search cases or buyers"
                className="w-52 bg-transparent text-[12.5px] text-white placeholder:text-mist focus:outline-none"
              />
            </label>
            <button
              type="button"
              data-cursor
              aria-label="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-full border border-white/10"
            >
              <Bell size={14} className="text-fog" />
              <span className="status-dot absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-violethi" />
            </button>
            <div className="grid h-9 w-9 place-items-center rounded-full border border-violet/40 bg-violet/15 font-mono text-[10.5px] text-violethi">
              AV
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 pt-10 lg:px-10">
        {/* ——— Greeting ——— */}
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <div className="eyebrow mb-3">
              <span className="tick">/</span>&nbsp;&nbsp;Reconstructed Cases
            </div>
            <h1 className="font-display text-[clamp(24px,3.2vw,38px)] tracking-[0.02em] text-white uppercase">
              Know what&apos;s due.
            </h1>
            <p className="lead mt-2.5 max-w-xl text-[13px]">
              Every case below was rebuilt from scattered documents, traced back to
              its evidence, and evaluated against policy. Amounts are computed, not
              guessed.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-violet/35 bg-violet/8 px-3.5 py-2 font-mono text-[10px] tracking-[0.18em] text-violethi uppercase">
            <Sparkles size={12} />
            Demo workspace
          </span>
        </div>

        {/* ——— KPIs ——— */}
        <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((k, i) => (
            <div
              key={k.label}
              className="dash-card stat-card dash-field p-5"
              style={{ "--i": i } as CSSProperties}
            >
              <div className="relative z-10">
                <div className="font-mono text-[9.5px] tracking-[0.24em] text-mist uppercase">
                  {k.label}
                </div>
                <CountUp
                  value={k.value}
                  format={k.format}
                  className="font-display mt-3 block text-[clamp(20px,2.2vw,28px)] leading-none text-white"
                />
                <div className="mt-3 font-mono text-[10.5px] text-mist">{k.note}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ——— Case list + detail ——— */}
        <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
          <div className="dash-card h-fit p-5">
            <div className="flex flex-wrap gap-2">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  data-cursor
                  className={`tab-pill rounded-full border border-white/10 px-3.5 py-1.5 font-mono text-[10px] tracking-[0.16em] uppercase ${
                    tab === t ? "is-on" : "text-mist"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-2.5">
              {rows.map((c, i) => {
                const isOn = c.id === activeCase.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedId(c.id)}
                    data-cursor
                    style={{ "--i": i } as CSSProperties}
                    className={`dash-row block w-full p-4 text-left ${isOn ? "is-selected" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] tracking-[0.18em] text-mist">{c.id}</span>
                      <span
                        className={`rounded-full border px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] uppercase ${
                          c.status === "Disputed"
                            ? "border-[#e0c48a]/35 text-[#e0c48a]"
                            : c.status === "Overdue"
                              ? "border-violet/45 text-violethi"
                              : "border-white/12 text-mist"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <div className="mt-2 text-[13px] text-white">{c.buyerShort}</div>
                    <div className="mt-2 flex items-center justify-between font-mono text-[10.5px]">
                      <span className="text-fog">{inr(outstanding(c))}</span>
                      <span className="text-mist">
                        {c.overdueDays > 0 ? `${c.overdueDays}d overdue` : "not due"}
                      </span>
                    </div>
                    <div className="tile-meter mt-3" aria-hidden>
                      <span style={{ width: `${Math.round(c.confidence * 100)}%`, transform: "none" }} />
                    </div>
                  </button>
                );
              })}

              {!rows.length ? (
                <p className="py-8 text-center font-mono text-[11px] text-mist">
                  No cases match this filter.
                </p>
              ) : null}
            </div>
          </div>

          <CasePanel key={activeCase.id} caseData={activeCase} />
        </div>

        <p className="mt-10 text-center font-mono text-[10.5px] text-mist">
          Dummy workspace data — the production pipeline writes these cases from S3 documents,
          Qwen extraction, OpenSearch retrieval and Cedar policy.
        </p>
      </main>
    </div>
  );
}
