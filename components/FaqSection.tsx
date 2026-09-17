"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import SectionHead from "./SectionHead";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const FAQ = [
  {
    q: "Is SETTLE an accounting system?",
    a: "No. SETTLE does not replace your accounting or ERP. It sits over the evidence surrounding a payment — purchase orders, contracts, invoices, delivery records, emails and payment records — and turns it into a reconstructed, actionable case.",
  },
  {
    q: "Does the AI decide what to do about a payment?",
    a: "No. Qwen reads and extracts information from documents. The Case Engine computes amounts, overdue periods and case status deterministically. Cedar evaluates whether a proposed action is permitted by your policies. The model never authorises a financial or escalation decision.",
  },
  {
    q: "Which records can I bring in?",
    a: "Anything that bears on the obligation: purchase orders, contracts, invoices, delivery and dispatch records, emails and payment commitments, bank and payment records, and follow-up history.",
  },
  {
    q: "How do I know a claim is actually supported?",
    a: "Every important claim is linked to the document and page it came from — the outstanding amount to the invoice, the terms to the purchase order, the acknowledgement to an email thread. You can open the source behind any figure before acting on it.",
  },
  {
    q: "What happens when the records disagree?",
    a: "Contradictions are surfaced, not smoothed over. If the delivery record contradicts the invoice, or the acknowledged amount does not match what was billed, the case is routed to human review instead of an automated escalation.",
  },
  {
    q: "Where does the data live?",
    a: "Documents are stored in Amazon S3 and indexed for retrieval in Amazon OpenSearch, with Strands orchestrating the evidence workflow. The architecture deliberately keeps interpretation, deterministic computation and policy enforcement in separate layers.",
  },
  {
    q: "What is the current project status?",
    a: "Active hackathon development for Bharat Builds Tour — First Commit 2026. The frontend, intelligence pipeline, evidence processing, case engine and policy workflow are being built as separate modular components so each stays independently testable and backend-ready.",
  },
];

export default function FaqSection() {
  const panelsRef = useRef<Array<HTMLDivElement | null>>([]);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    panelsRef.current.forEach((panel, i) => {
      if (!panel) return;
      const isOpen = i === open;
      if (reduced) {
        panel.style.height = isOpen ? "auto" : "0px";
        panel.style.opacity = isOpen ? "1" : "0";
        panel.style.visibility = isOpen ? "visible" : "hidden";
        return;
      }
      gsap.to(panel, {
        height: isOpen ? "auto" : 0,
        autoAlpha: isOpen ? 1 : 0,
        duration: 0.45,
        ease: "power2.inOut",
        overwrite: true,
      });
    });
  }, [open]);

  return (
    <section id="faq" className="relative py-28">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <SectionHead
          eyebrow="Questions"
          title="Before you trust it with a case."
          accent="the honest answers"
        />

        <div className="mx-auto mt-12 max-w-3xl">
          {FAQ.map((item, i) => {
            const isOpen = i === open;
            return (
              <div key={item.q} className="faq-item border-b border-white/8 first:border-t">
                <button
                  type="button"
                  data-cursor
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="faq-trigger flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-[10px] text-mist">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[14px] font-medium text-white">{item.q}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-mist transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-violethi" : ""
                    }`}
                  />
                </button>
                <div
                  ref={(el) => {
                    panelsRef.current[i] = el;
                  }}
                  className="faq-panel overflow-hidden"
                >
                  <p className="lead pr-10 pb-6 pl-9 text-[13px]">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
