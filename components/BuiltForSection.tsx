"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  Boxes,
  Calendars,
  Cloud,
  Cpu,
  Database,
  FileSearch,
  Gavel,
  Layers,
  Receipt,
  Rocket,
  Route,
  ShieldCheck,
  Store,
  Target,
  Terminal,
  Users,
} from "lucide-react";
import SectionHead from "./SectionHead";
import { revealUp } from "@/lib/motion";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const AUDIENCES = [
  { icon: Receipt, title: "B2B invoices", note: "Raised against a buyer with agreed terms." },
  { icon: Route, title: "Purchase orders", note: "The terms and scope the payment depends on." },
  { icon: Gavel, title: "Contractual payment terms", note: "Net-30, net-45, milestone or retention based." },
  { icon: Database, title: "Delayed receivables", note: "Money owed past its due date and still collecting." },
  { icon: Layers, title: "Manual payment follow-ups", note: "Reminders tracked in inboxes and spreadsheets." },
  { icon: FileSearch, title: "Fragmented business records", note: "Evidence spread across systems that do not talk." },
];

const STACK = [
  {
    icon: Cloud,
    name: "Amazon S3",
    role: "Document store",
    detail:
      "Holds every uploaded purchase order, invoice, delivery note and statement as the immutable original.",
  },
  {
    icon: Cpu,
    name: "Qwen 2.5 7B",
    role: "Document understanding",
    detail: "Reads the documents and extracts amounts, terms, dates, parties and acknowledgements.",
  },
  {
    icon: FileSearch,
    name: "Amazon OpenSearch",
    role: "Evidence retrieval",
    detail: "Finds the passages that support or contradict a claim across the whole document set.",
  },
  {
    icon: Boxes,
    name: "Strands",
    role: "Agent orchestration",
    detail: "Sequences the evidence-reasoning workflow: retrieve, reconcile, reconstruct, verify.",
  },
  {
    icon: Target,
    name: "SETTLE Case Engine",
    role: "Deterministic calculations",
    detail:
      "Computes outstanding amounts, overdue periods and case status from resolved facts — never from a model guess.",
  },
  {
    icon: ShieldCheck,
    name: "Cedar",
    role: "Policy evaluation",
    detail: "Decides whether a proposed action is permitted under the business policies you write.",
  },
];

const BUILD = [
  { name: "Frontend", note: "Motion-driven marketing site, dashboard shell", pct: 82 },
  { name: "Intelligence pipeline", note: "Qwen extraction + Strands orchestration", pct: 68 },
  { name: "Evidence processing", note: "Ingest, chunk, index into OpenSearch", pct: 61 },
  { name: "Case engine", note: "Deterministic financial facts and case state", pct: 74 },
  { name: "Policy workflow", note: "Cedar policies and permitted actions", pct: 57 },
];

const EVENT_ROWS = [
  { icon: Calendars, label: "Event", value: "First Commit 2026" },
  { icon: Users, label: "Organisers", value: "WeMakeDevs × AWS" },
  { icon: Terminal, label: "Status", value: "Frontend + pipeline" },
  { icon: Rocket, label: "Focus", value: "Evidence → action" },
];

const TABS = ["Built For", "Technology", "Status"] as const;

export default function BuiltForSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Built For");
  const [openTech, setOpenTech] = useState(4);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const cards = Array.from(panel.querySelectorAll<HTMLElement>("[data-bf-card]"));
    revealUp(cards, { staggerMs: 55, y: 22, duration: 560 });
  }, [tab, openTech]);

  // status tab: progress bars fill as they enter view
  useEffect(() => {
    if (tab !== "Status") return;
    const root = rootRef.current;
    if (!root) return;
    const bars = Array.from(root.querySelectorAll<HTMLElement>("[data-bar]"));
    if (prefersReducedMotion()) {
      bars.forEach((b) => (b.style.transform = "none"));
      return;
    }
    const ctx = gsap.context(() => {
      bars.forEach((bar, i) => {
        gsap.fromTo(
          bar,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1,
            ease: "power2.out",
            delay: i * 0.08,
            scrollTrigger: { trigger: bar, start: "top 92%", once: true },
          }
        );
      });
    }, root);
    return () => ctx.revert();
  }, [tab]);

  const tech = STACK[openTech];

  return (
    <section id="stack" className="relative scroll-mt-24 py-28">
      <div ref={rootRef} className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <SectionHead
          eyebrow="Built For & Platform"
          title="Made for the way MSMEs get paid."
          accent="on top of what you already have"
        >
          SETTLE is not an accounting system. It sits over the evidence surrounding a
          payment and turns it into an actionable case.
        </SectionHead>

        <div className="mt-12 flex flex-wrap justify-center gap-2">
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

        <div ref={panelRef} className="mt-8">
          {tab === "Built For" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {AUDIENCES.map((a, i) => (
                <div
                  key={a.title}
                  data-bf-card
                  style={{ "--i": i } as CSSProperties}
                  className="glass group p-6"
                >
                  <a.icon size={18} strokeWidth={1.6} className="text-violethi" />
                  <div className="font-display mt-4 text-[14px] tracking-[0.06em] text-white uppercase">
                    {a.title}
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-mist">{a.note}</p>
                </div>
              ))}
            </div>
          ) : null}

          {tab === "Technology" ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {STACK.map((s, i) => (
                  <button
                    key={s.name}
                    type="button"
                    data-bf-card
                    data-cursor
                    onClick={() => setOpenTech(i)}
                    aria-pressed={i === openTech}
                    style={{ "--i": i } as CSSProperties}
                    className={`dash-row flex items-center gap-4 p-4 text-left ${
                      i === openTech ? "is-selected" : ""
                    }`}
                  >
                    <span className="step-badge grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/12">
                      <s.icon size={16} strokeWidth={1.6} className="text-violethi" />
                    </span>
                    <span>
                      <span className="block text-[13px] text-white">{s.name}</span>
                      <span className="mt-0.5 block font-mono text-[10px] tracking-[0.16em] text-mist uppercase">
                        {s.role}
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="dash-card p-6">
                <div className="flex items-center gap-3">
                  <Store size={14} className="text-violethi" />
                  <span className="font-mono text-[10px] tracking-[0.22em] text-mist uppercase">
                    {tech.name} · {tech.role}
                  </span>
                </div>
                <p className="lead mt-4 max-w-3xl text-[13px]">{tech.detail}</p>
                <p className="mt-5 inline-flex items-start gap-2 font-mono text-[10.5px] text-mist">
                  <Layers size={12} className="mt-0.5 shrink-0" />
                  AI interpretation, deterministic computation and policy enforcement stay in
                  separate layers — AWS and open-source parts of the real architecture, not an
                  afterthought.
                </p>
              </div>
            </div>
          ) : null}

          {tab === "Status" ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.15fr]">
              <div data-bf-card className="dash-card relative overflow-hidden p-6 lg:p-7">
                <span className="tile-scan" aria-hidden />
                <div className="relative z-10">
                  <span className="inline-flex items-center gap-2 rounded-full border border-violet/45 bg-violet/10 px-3 py-1.5 font-mono text-[10px] tracking-[0.18em] text-violethi uppercase">
                    <Rocket size={12} />
                    Active hackathon development
                  </span>

                  <h3 className="font-display mt-6 text-[clamp(20px,2.6vw,30px)] tracking-[0.02em] text-white uppercase">
                    Bharat Builds Tour
                    <br />
                    First Commit 2026
                  </h3>

                  <p className="lead mt-4 max-w-md text-[13px]">
                    Organised by WeMakeDevs and the AWS Builder Center. The build focuses on
                    using AWS and open-source technologies as meaningful parts of the product
                    architecture rather than as an add-on.
                  </p>

                  <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {EVENT_ROWS.map((row, i) => (
                      <div
                        key={row.label}
                        className="dash-field rounded-xl border border-white/8 bg-white/2 px-4 py-3"
                        style={{ "--i": i } as CSSProperties}
                      >
                        <div className="flex items-center gap-2 font-mono text-[9.5px] tracking-[0.2em] text-mist uppercase">
                          <row.icon size={11} />
                          {row.label}
                        </div>
                        <div className="mt-1.5 text-[12.5px] text-white">{row.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div data-bf-card className="dash-card p-6 lg:p-7">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] tracking-[0.22em] text-mist uppercase">
                    Components in development
                  </span>
                  <span className="font-mono text-[10px] text-mist">modular · backend-ready</span>
                </div>

                <div className="mt-7 space-y-6">
                  {BUILD.map((c) => (
                    <div key={c.name}>
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <div className="text-[13px] text-white">{c.name}</div>
                          <div className="mt-0.5 text-[11.5px] text-mist">{c.note}</div>
                        </div>
                        <div className="font-mono text-[11px] text-violethi">{c.pct}%</div>
                      </div>
                      <div className="prog-track mt-3">
                        <span data-bar className="prog-fill" style={{ width: `${c.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-7 border-t border-white/8 pt-5 text-[11.5px] leading-relaxed text-mist">
                  The frontend, intelligence pipeline, evidence processing, case engine and
                  policy workflow are developed as separate components so each can be swapped
                  or scaled independently.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
