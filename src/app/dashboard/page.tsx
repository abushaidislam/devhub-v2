import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardToolGrid } from "@/components/dashboard/dashboard-tool-grid";
import { SmartInputDetector } from "@/components/tools/smart-input-detector";
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
        <div className={styles.introLeft}>
          <span className="label">Developer toolkit</span>
          <span className={styles.dot} aria-hidden="true">·</span>
          <p className={styles.desc}>{tools.length} offline-first developer utilities</p>
        </div>
        <Badge className={styles.total} variant="gray" size="sm">
          {tools.length} tools
        </Badge>
      </header>
      <SmartInputDetector />
      <DashboardToolGrid />
    </DashboardShell>
  );
}
