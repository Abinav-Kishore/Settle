"use client";

import { useEffect } from "react";
import { ArrowRight } from "lucide-react";

const LINKS = [
  { label: "Problem", href: "#problem" },
  { label: "Approach", href: "#approach" },
  { label: "Flow", href: "#flow" },
  { label: "Evidence", href: "#provenance" },
  { label: "Architecture", href: "#architecture" },
];

export default function Header() {
  useEffect(() => {
    const header = document.getElementById("site-header");
    if (!header) return;

    let last = 0;
    const onScroll = () => {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 24);
      header.style.transform = y > 140 && y > last ? "translateY(-110%)" : "translateY(0)";
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="site-header"
      className="fixed inset-x-0 top-3 z-50 transition-all duration-500"
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 py-5 lg:px-10">
        {/* Logo */}
        <a href="#top" className="flex items-center gap-2.5" data-cursor>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="#f2f1f3" />
          </svg>
          <span className="font-display text-[15px] font-normal tracking-[0.18em] text-white">
            SETTLE
          </span>
        </a>

        {/* Nav — centered */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
          {LINKS.map((l, i) => (
            <a
              key={l.label}
              href={l.href}
              style={{ animationDelay: `${0.45 + i * 0.07}s` }}
              className="nav-link text-[13px] font-medium text-fog transition-colors hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* CTA — outlined pill */}
        <a
          href="/dashboard"
          className="btn-pill group inline-flex h-10 items-center gap-2 rounded-full px-5 text-[13px] font-medium"
          data-cursor
        >
          Get Started
          <ArrowRight
            size={14}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </a>
      </div>
    </header>
  );
}
