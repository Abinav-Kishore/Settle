"use client";

import { useEffect, useRef } from "react";
import SectionHead from "./SectionHead";
import Reveal from "./Reveal";
import CountUp from "./Fx/CountUp";
import { tilt3d } from "@/lib/motion";

const inr = (v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`;
const days = (v: number) => `${Math.round(v)} days`;

const SNAPSHOT = [
  {
    value: 480000,
    format: inr,
    label: "Outstanding",
    source: "Invoice · Page 1",
  },
  {
    value: 45,
    format: days,
    label: "Overdue",
    source: "PO · 30-day terms",
  },
  {
    value: 6,
    format: (v: number) => String(Math.round(v)),
    label: "Evidence sources",
    source: "PO · Invoice · Delivery · Email · Payment",
  },
  {
    value: 1,
    format: (v: number) => String(Math.round(v)),
    label: "Permitted action",
    source: "Cedar · escalate",
  },
];

export default function StatsSection() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const cleanups = Array.from(grid.querySelectorAll<HTMLElement>(".stat-card")).map((el) =>
      tilt3d(el, 5)
    );
    return () => cleanups.forEach((fn) => fn?.());
  }, []);

  return (
    <section id="snapshot" className="relative py-24">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <SectionHead
          eyebrow="Case Snapshot"
          title="One case, reconstructed."
          accent="fragments into figures"
        >
          The same records you already have — pulled into a single payment case
          with the number, the age, and the evidence behind them.
        </SectionHead>

        <div ref={gridRef} className="mt-14">
          <Reveal className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4" staggerMs={110} y={44}>
            {SNAPSHOT.map((s) => (
              <div
                key={s.label}
                data-cursor
                className="stat-card glass tilt-card flex flex-col justify-between p-6"
              >
                <div className="relative z-10">
                  <div className="font-mono text-[10px] tracking-[0.28em] text-mist uppercase">
                    {s.label}
                  </div>
                  <CountUp
                    value={s.value}
                    format={s.format}
                    className="font-display mt-4 block text-[clamp(24px,2.6vw,34px)] leading-none text-white"
                  />
                </div>
                <div className="relative z-10 mt-6 flex items-center gap-2 border-t border-white/8 pt-4 font-mono text-[10.5px] text-mist">
                  <span className="text-violet">→</span>
                  <span className="truncate">{s.source}</span>
                </div>
              </div>
            ))}
          </Reveal>
        </div>

        <p className="mt-8 text-center font-mono text-[11px] text-mist">
          Illustrative case — Meridian Traders Pvt Ltd · values computed by the SETTLE Case Engine
        </p>
      </div>
    </section>
  );
}
