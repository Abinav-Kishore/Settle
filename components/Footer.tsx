import { Zap } from "lucide-react";

const COLS = [
  {
    head: "Product",
    links: [
      { label: "The Problem", href: "#problem" },
      { label: "Product Flow", href: "#flow" },
      { label: "Example Workflow", href: "#workflow" },
      { label: "Evidence Trail", href: "#provenance" },
      { label: "Next Actions", href: "#actions" },
      { label: "Policy Lab", href: "#policy" },
    ],
  },
  {
    head: "Platform",
    links: [
      { label: "Architecture", href: "#architecture" },
      { label: "Trust & Evidence", href: "#trust" },
      { label: "Built For", href: "#stack" },
      { label: "Technology", href: "#stack" },
      { label: "Questions", href: "#faq" },
    ],
  },
  {
    head: "Built For",
    links: [
      { label: "B2B Invoices", href: "#stack" },
      { label: "Purchase Orders", href: "#stack" },
      { label: "Payment Terms", href: "#stack" },
      { label: "Delayed Receivables", href: "#stack" },
      { label: "Fragmented Records", href: "#problem" },
    ],
  },
  {
    head: "Stack",
    links: [
      { label: "Amazon S3", href: "#architecture" },
      { label: "Amazon OpenSearch", href: "#architecture" },
      { label: "Qwen 2.5 7B", href: "#architecture" },
      { label: "Strands Agents", href: "#architecture" },
      { label: "Cedar Policies", href: "#architecture" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/8 pt-16">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <div className="grid grid-cols-1 gap-10 pb-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,0.7fr)]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-white/12 bg-white/6">
                <Zap size={15} className="text-violethi" fill="currentColor" />
              </span>
              <span className="font-display text-[16px] font-bold tracking-[0.32em] text-white">SETTLE</span>
            </div>
            <p className="mt-4 max-w-xs text-[12.5px] leading-relaxed text-mist">
              Know what&apos;s due. Know what to do. An evidence-to-action platform for
              MSMEs dealing with delayed payments.
            </p>
            <p className="mt-4 max-w-xs text-[12px] leading-relaxed text-mist">
              AI interprets the documents. The Case Engine does the arithmetic. Cedar
              decides what is permitted.
            </p>
            <a
              href="/dashboard"
              className="btn-pill mt-5 inline-flex h-9 items-center gap-2 rounded-full px-4 text-[12.5px] font-medium"
            >
              Open the dashboard →
            </a>
          </div>

          {COLS.map((c) => (
            <div key={c.head}>
              <div className="mb-4 font-mono text-[10px] tracking-[0.3em] text-mist uppercase">{c.head}</div>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="nav-link text-[13px] text-fog transition-colors hover:text-white"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="fx-divider" />

        <div className="flex flex-col items-center justify-between gap-3 py-6 text-[11.5px] text-mist md:flex-row">
          <span>© {new Date().getFullYear()} SETTLE — Built for Bharat Builds Tour · First Commit 2026</span>
          <span className="flex items-center gap-4">
            <span className="font-mono">WeMakeDevs × AWS Builder Center</span>
            <a href="/dashboard" className="nav-link text-fog transition-colors hover:text-white">
              Open dashboard
            </a>
          </span>
        </div>
      </div>

      {/* giant watermark — drifts up as you scroll into the footer */}
      <div className="pointer-events-none relative -mb-[2.5vw] flex justify-center overflow-hidden select-none">
        <span
          data-parallax="70"
          className="font-display inline-block text-[18vw] leading-[0.8] font-bold tracking-tight text-white/4"
        >
          SETTLE
        </span>
      </div>
    </footer>
  );
}
