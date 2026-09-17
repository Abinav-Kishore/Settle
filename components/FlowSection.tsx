"use client";

import { useEffect, useRef } from "react";
import SectionHead from "./SectionHead";
import { revealUp } from "@/lib/motion";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const FLOW = [
  { n: "01", title: "Collect", note: "Bring together the documents and records related to a payment." },
  { n: "02", title: "Connect", note: "Find relationships between documents, events, obligations and communications." },
  { n: "03", title: "Reconstruct", note: "Build a unified payment case from the available evidence." },
  { n: "04", title: "Verify", note: "Trace important facts back to their source documents." },
  { n: "05", title: "Evaluate", note: "Apply deterministic calculations and business policies." },
  { n: "06", title: "Act", note: "Surface the appropriate next step and prepare the workflow for execution." },
];

export default function FlowSection() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const items = Array.from(wrap.querySelectorAll<HTMLElement>(".flow-item"));
    const labels = Array.from(wrap.querySelectorAll<HTMLElement>(".flow-side"));
    const bar = wrap.querySelector<HTMLElement>("[data-rail-fill]");

    const setActive = (idx: number) => {
      items.forEach((el, i) => {
        const active = i === idx;
        el.style.opacity = active ? "1" : "0.3";
        el.style.filter = active ? "blur(0px)" : "blur(2px)";
        el.classList.toggle("is-active", active);
      });
      labels.forEach((el, i) => {
        const active = i === idx;
        el.style.borderColor = active ? "rgba(138,99,201,0.6)" : "rgba(255,255,255,0.1)";
        el.style.color = active ? "#c084fc" : "#6b6b76";
        el.classList.toggle("is-active", active);
      });
    };

    const ctx = gsap.context(() => {
      // the rail fill and the active step both track one scrub range
      if (bar) {
        gsap.fromTo(
          bar,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: wrap, start: "top 70%", end: "bottom 65%", scrub: true },
          }
        );
      }

      ScrollTrigger.create({
        trigger: wrap,
        start: "top 65%",
        end: "bottom 65%",
        onUpdate: (self) => {
          setActive(Math.min(FLOW.length - 1, Math.floor(self.progress * FLOW.length)));
        },
      });
    }, wrap);

    setActive(0);

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          revealUp(wrap.querySelectorAll(".flow-item"), { staggerMs: 80, y: 44 });
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(wrap);

    return () => {
      ctx.revert();
      io.disconnect();
    };
  }, []);

  return (
    <section id="flow" className="relative py-28">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10">
        <SectionHead
          eyebrow="Product Flow"
          title="From chaos to action."
          accent="six steps, one case"
        >
          Every delayed payment becomes a reconstructed case — collected,
          connected, verified, and turned into a defensible next step. Scroll to
          walk the pipeline.
        </SectionHead>

        <div ref={wrapRef} className="mt-16 grid grid-cols-1 gap-16 lg:grid-cols-[240px_1fr]">
          {/* sticky rail labels + scrub fill */}
          <div className="sticky top-32 hidden h-fit flex-col gap-5 lg:flex">
            <div className="relative pl-5">
              <span className="absolute top-2 bottom-2 left-[3px] w-px bg-white/8" aria-hidden />
              <span
                data-rail-fill
                className="absolute top-2 bottom-2 left-[3px] w-px origin-top bg-gradient-to-b from-violethi to-violet"
                aria-hidden
              />
              <div className="flex flex-col gap-5">
                {FLOW.map((f) => (
                  <div
                    key={f.n}
                    className="flow-side flex items-center gap-3 rounded-full border border-white/10 px-4 py-2.5 text-[12px] transition-all duration-300"
                    style={{ color: "#6b6b76" }}
                  >
                    <span className="font-mono text-[10px]">{f.n}</span>
                    {f.title}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* flow items — column carries the velocity skew; items dim/blur individually */}
          <div data-skew className="space-y-6">
            {FLOW.map((f) => (
              <div
                key={f.n}
                className="flow-item glass flex gap-6 p-7 transition-[opacity,filter] duration-500"
              >
                <div className="flow-num font-display text-[28px] font-normal text-violet/45">{f.n}</div>
                <div>
                  <div className="font-display text-[15px] tracking-[0.08em] text-white uppercase">{f.title}</div>
                  <div className="lead mt-2 max-w-lg text-[13.5px]">{f.note}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
