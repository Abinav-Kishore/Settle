import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import ProblemSection from "@/components/ProblemSection";
import StatsSection from "@/components/StatsSection";
import FlowSection from "@/components/FlowSection";
import CaseWorkflowSection from "@/components/CaseWorkflowSection";
import ProvenanceSection from "@/components/ProvenanceSection";
import ActionsSection from "@/components/ActionsSection";
import ArchitectureSection from "@/components/ArchitectureSection";
import BuiltForSection from "@/components/BuiltForSection";
import FaqSection from "@/components/FaqSection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative mx-auto mt-3 max-w-[1480px] overflow-hidden rounded-t-[26px] border border-b-0 border-white/6 bg-ink">
      {/* FX layers */}
      <div className="fx-grid" aria-hidden />
      <div className="fx-spotlight" aria-hidden />
      <div className="fx-vignette" aria-hidden />
      <div
        className="fx-noise"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
        }}
        aria-hidden
      />

      <Header />
      <Hero />
      <Marquee />

      <div className="fx-divider mx-auto max-w-[1240px]" />
      <ProblemSection />

      <div className="fx-divider mx-auto max-w-[1240px]" />
      <StatsSection />

      <div className="fx-divider mx-auto max-w-[1240px]" />
      <FlowSection />

      <div className="fx-divider mx-auto max-w-[1240px]" />
      <CaseWorkflowSection />

      <div className="fx-divider mx-auto max-w-[1240px]" />
      <ProvenanceSection />

      <div className="fx-divider mx-auto max-w-[1240px]" />
      <ActionsSection />

      <div className="fx-divider mx-auto max-w-[1240px]" />
      <ArchitectureSection />

      <div className="fx-divider mx-auto max-w-[1240px]" />
      <BuiltForSection />

      <div className="fx-divider mx-auto max-w-[1240px]" />
      <FaqSection />

      <div className="fx-divider mx-auto max-w-[1240px]" />
      <CTASection />
      <Footer />
    </main>
  );
}
