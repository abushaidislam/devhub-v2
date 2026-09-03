import { Check, X, Globe } from "lucide-react";
import styles from "./landing-comparison.module.css";

interface ComparisonRow {
  dimension: string;
  traditional: {
    title: string;
    description: string;
  };
  devhub: {
    title: string;
    description: string;
  };
}

const comparisonData: ComparisonRow[] = [
  {
    dimension: "Execution Boundary",
    traditional: {
      title: "Remote Cloud Servers",
      description: "Data leaves your device and processes on third-party servers.",
    },
    devhub: {
      title: "100% In-Browser Sandbox",
      description: "Deterministic execution in your browser's V8 engine with pure TypeScript and WebCrypto.",
    },
  },
  {
    dimension: "Performance & Latency",
    traditional: {
      title: "500ms – 2,000ms Overhead",
      description: "Network latency, handshake delays, and remote queue processing.",
    },
    devhub: {
      title: "< 1ms Instantaneous",
      description: "Sub-millisecond execution with O(1) detection fast guards and instant transformations.",
    },
  },
  {
    dimension: "Telemetry & Privacy",
    traditional: {
      title: "Unverified Data Flow",
      description: "Server logs, cookies, analytics scripts, and potential payload retention.",
    },
    devhub: {
      title: "Zero Network Egress",
      description: "Zero analytics on payloads, zero tracking cookies, and strictly opt-in bounded history.",
    },
  },
  {
    dimension: "Workspace Workflow",
    traditional: {
      title: "Siloed & Ad-Cluttered",
      description: "Isolated tools requiring copy-pasting across tabs, surrounded by banner ads.",
    },
    devhub: {
      title: "Composable Pipelines",
      description: "Multi-step recipe chaining, saveable workflows, and distraction-free Geist design.",
    },
  },
  {
    dimension: "Offline Reliability",
    traditional: {
      title: "Requires Internet",
      description: "Completely non-functional on planes, trains, or unstable networks.",
    },
    devhub: {
      title: "True Offline PWA",
      description: "Precached Service Worker allows you to work seamlessly with no connection.",
    },
  },
];

export function LandingComparison() {
  return (
    <section className={styles.section} id="architecture-comparison" aria-labelledby="comparison-title">
      <div className="container">
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.dot} />
            Architectural Philosophy
          </div>
          <h2 id="comparison-title" className={styles.title}>
            Built different by definition.
          </h2>
          <p className={styles.subtitle}>
            Most online developer utilities are ad-heavy wrappers relaying data through remote servers. DevHub is engineered as an offline-capable, local-first workbench.
          </p>
        </div>

        <div className={styles.comparisonGrid}>
          {/* Traditional Utility Column */}
          <div className={`${styles.column} ${styles.columnTraditional}`}>
            <div className={styles.columnHeader}>
              <div className={styles.columnBadgeMuted}>
                <Globe size={13} />
                <span>Traditional Web Utilities</span>
              </div>
              <h3 className={styles.columnTitle}>Cloud-Dependent Wrappers</h3>
              <p className={styles.columnDesc}>Fragmented utility sites built around server-side processing and ad revenue.</p>
            </div>

            <div className={styles.featureList}>
              {comparisonData.map((row) => (
                <div key={row.dimension} className={styles.featureItem}>
                  <div className={styles.iconWrapperNegative}>
                    <X size={14} />
                  </div>
                  <div className={styles.featureCopy}>
                    <span className={styles.featureDimension}>{row.dimension}</span>
                    <strong className={styles.featureTitleNegative}>{row.traditional.title}</strong>
                    <p className={styles.featureText}>{row.traditional.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DevHub Column */}
          <div className={`${styles.column} ${styles.columnDevHub}`}>
            <div className={styles.columnHeader}>
              <div className={styles.columnBadgeActive}>
                <span className={styles.cyanPulse} />
                <span>DevHub Toolkit</span>
              </div>
              <h3 className={styles.columnTitle}>Local-First Workbench</h3>
              <p className={styles.columnDesc}>An integrated, distraction-free environment engineered for developer speed and privacy.</p>
            </div>

            <div className={styles.featureList}>
              {comparisonData.map((row) => (
                <div key={row.dimension} className={styles.featureItem}>
                  <div className={styles.iconWrapperPositive}>
                    <Check size={14} />
                  </div>
                  <div className={styles.featureCopy}>
                    <span className={styles.featureDimension}>{row.dimension}</span>
                    <strong className={styles.featureTitlePositive}>{row.devhub.title}</strong>
                    <p className={styles.featureText}>{row.devhub.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
