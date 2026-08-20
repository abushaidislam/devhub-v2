import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard-shell";
import { DashboardToolGrid } from "@/components/dashboard-tool-grid";
import { SmartInputDetector } from "@/components/smart-input-detector";
import { Badge } from "@/components/ui/badge";
import { tools } from "@/lib/tools";
import styles from "./dashboard.module.css";

export const metadata: Metadata = {
  title: "All Tools Workspace",
  description: "Browse, detect, and open local-first developer utilities in DevHub.",
  alternates: { canonical: "/tools" },
  robots: { index: false, follow: true },
};

export default function DashboardPage() {
  return (
    <DashboardShell>
      <header className={styles.intro}>
        <div>
          <span className="label">Developer toolkit</span>
          <p>Paste structured data for a local match, or browse {tools.length} focused utilities.</p>
        </div>
        <Badge className={styles.total} variant="gray" size="md">{tools.length} tools</Badge>
      </header>
      <SmartInputDetector />
      <DashboardToolGrid />
    </DashboardShell>
  );
}
