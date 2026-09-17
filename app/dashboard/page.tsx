import type { Metadata } from "next";
import DashboardView from "@/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "SETTLE — Case Dashboard",
  description:
    "Reconstructed payment cases with their evidence trail, deterministic financial facts, policy evaluation and the permitted next action.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
