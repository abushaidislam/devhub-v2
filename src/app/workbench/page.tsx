import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DualWorkbench } from "@/components/workbench/dual-workbench";

export const metadata: Metadata = {
  title: "Dual Split Workbench",
  description:
    "Run two local-first developer tools side-by-side with real-time data pipelining and presets.",
  alternates: { canonical: "/workbench" },
  robots: { index: false, follow: true },
};

export default function WorkbenchPage() {
  return (
    <DashboardShell>
      <DualWorkbench />
    </DashboardShell>
  );
}
