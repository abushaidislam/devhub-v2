import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  Layers,
  Lock,
  ShieldCheck,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
import styles from "./landing-bento-grid.module.css";

export function LandingBentoGrid() {
  return (
    <section className={styles.section} id="capabilities" aria-labelledby="bento-title">
      <div className="container">
        <div className={styles.header}>
          <div className={styles.eyebrow}>
            <span className={styles.pulseDot} />
            Capabilities Architecture
          </div>
          <h2 id="bento-title" className={styles.title}>
            Engineered for velocity.
          </h2>
          <p className={styles.subtitle}>
            Every layer of DevHub is designed to eliminate developer friction. From sub-millisecond input heuristics to zero-network memory sandboxes.
          </p>
        </div>

        <div className={styles.grid}>
          {/* Card 1: Deterministic Smart Detection (Span 7) */}
          <article className={`${styles.card} ${styles.cardDetection}`}>
            <div className={styles.cardMeta}>
              <span className={styles.kicker}>01 / Dual-Stage Detection</span>
              <span className={styles.tag}>Heuristic Engine</span>
            </div>
            <h3 className={styles.cardHeading}>Sub-millisecond smart routing</h3>
            <p className={styles.cardCopy}>
              Paste any raw blob—JSON, JWT, SQL, Cron, YAML, or Base64. Bounded O(1) fast-guards inspect syntax patterns and route to the exact tool with confidence scoring in under 1ms.
            </p>

            {/* Abstract Visual Graphic */}
            <div className={styles.previewWindow} aria-hidden="true">
              <div className={styles.windowBar}>
                <div className={styles.windowTitle}>
                  <Terminal size={12} />
                  <span>input.raw</span>
                </div>
                <div className={styles.windowStats}>
                  <span>1,420 bytes</span>
                  <span className={styles.statusLive}>0ms ingest</span>
                </div>
              </div>

              <div className={styles.codeLine}>
                <code>
                  <span className={styles.tokenMuted}>ey</span>
                  <span className={styles.tokenHighlight}>JhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9</span>
                  <span className={styles.tokenMuted}>.eyJzdWIiOiIxMjM0NTY3ODkwIi...</span>
                </code>
              </div>

              <div className={styles.detectedRow}>
                <div className={styles.detectedMatch}>
                  <span className={styles.cyanDot} />
                  <strong>JWT Decoder</strong>
                  <span className={styles.matchScore}>99.8% match</span>
                </div>
                <div className={styles.actionHint}>
                  <span>Press</span>
                  <kbd>⌘</kbd>
                  <kbd>↵</kbd>
                  <span>to jump</span>
                </div>
              </div>

              <div className={styles.formatPills}>
                <span className={styles.activePill}>JWT</span>
                <span>JSON</span>
                <span>Base64</span>
                <span>YAML</span>
                <span>SQL</span>
                <span>Cron</span>
                <span>XML</span>
              </div>
            </div>
          </article>

          {/* Card 2: Zero-Egress Privacy Sandbox (Span 5) */}
          <article className={`${styles.card} ${styles.cardPrivacy}`}>
            <div className={styles.cardMeta}>
              <span className={styles.kicker}>02 / Memory Boundary</span>
              <span className={styles.tag}>Zero Egress</span>
            </div>
            <h3 className={styles.cardHeading}>Zero-egress privacy sandbox</h3>
            <p className={styles.cardCopy}>
              Deterministic processing runs strictly in your browser&apos;s V8 memory. No server uploads, no backend telemetry, and zero payload retention.
            </p>

            {/* Abstract Visual Graphic */}
            <div className={styles.privacyVisual} aria-hidden="true">
              <div className={styles.shieldLockup}>
                <div className={styles.shieldIcon}>
                  <ShieldCheck size={22} />
                </div>
                <div className={styles.shieldCopy}>
                  <strong>100% In-Browser Execution</strong>
                  <small>WebCrypto &amp; Pure TypeScript</small>
                </div>
              </div>

              <div className={styles.telemetryMatrix}>
                <div className={styles.telemetryRow}>
                  <span className={styles.telemetryLabel}>
                    <Cpu size={13} /> Local RAM Processing
                  </span>
                  <span className={styles.metricCyan}>&lt; 0.2ms latency</span>
                </div>
                <div className={styles.telemetryRow}>
                  <span className={styles.telemetryLabel}>
                    <Lock size={13} /> External Network Egress
                  </span>
                  <span className={styles.metricBlocked}>0 bytes sent</span>
                </div>
              </div>

              <div className={styles.complianceRow}>
                <span>Client-Only</span>
                <span>•</span>
                <span>No Cookies</span>
                <span>•</span>
                <span>Offline-Safe</span>
              </div>
            </div>
          </article>

          {/* Card 3: Multi-Step Recipe Pipelines (Span 4) */}
          <article className={`${styles.card} ${styles.cardRecipes}`}>
            <div className={styles.cardMeta}>
              <span className={styles.kicker}>03 / Workflow Pipelines</span>
              <Workflow size={15} className={styles.metaIcon} />
            </div>
            <h3 className={styles.cardHeading}>Composable recipe pipelines</h3>
            <p className={styles.cardCopy}>
              Pipe transformations sequentially. Compose reusable developer recipes and export schema definitions without storing sensitive run values.
            </p>

            {/* Abstract Visual Graphic */}
            <div className={styles.pipelineVisual} aria-hidden="true">
              <div className={styles.pipelineSteps}>
                <div className={styles.pipelineStep}>
                  <span className={styles.stepNum}>1</span>
                  <span className={styles.stepName}>Raw JSON</span>
                </div>
                <div className={styles.pipelineConnector} />
                <div className={styles.pipelineStep}>
                  <span className={styles.stepNum}>2</span>
                  <span className={styles.stepName}>YAML Parse</span>
                </div>
                <div className={styles.pipelineConnector} />
                <div className={styles.pipelineStep}>
                  <span className={styles.stepNum}>3</span>
                  <span className={styles.stepName}>SHA-256</span>
                </div>
              </div>
              <div className={styles.pipelineMeta}>
                <span>3 steps</span>
                <span>•</span>
                <span>Zero Payload Storage</span>
              </div>
            </div>
          </article>

          {/* Card 4: Type & Interface Inference (Span 4) */}
          <article className={`${styles.card} ${styles.cardInference}`}>
            <div className={styles.cardMeta}>
              <span className={styles.kicker}>04 / Type Inference</span>
              <Layers size={15} className={styles.metaIcon} />
            </div>
            <h3 className={styles.cardHeading}>Live interface extraction</h3>
            <p className={styles.cardCopy}>
              Transform chaotic API responses into strictly typed TypeScript interfaces, Markdown tables, or CSV datasets in a single keystroke.
            </p>

            {/* Abstract Visual Graphic */}
            <div className={styles.inferenceVisual} aria-hidden="true">
              <div className={styles.miniEditor}>
                <div className={styles.editorHead}>
                  <span>JSON Payload</span>
                  <ArrowRight size={11} />
                  <span>TypeScript</span>
                </div>
                <div className={styles.editorBody}>
                  <div className={styles.codeSnippetMono}>
                    <span className={styles.tokenKeyword}>interface</span>{" "}
                    <span className={styles.tokenType}>UserResponse</span> &#123;
                    <br />
                    &nbsp;&nbsp;<span className={styles.tokenProp}>id</span>:{" "}
                    <span className={styles.tokenKeyword}>number</span>;
                    <br />
                    &nbsp;&nbsp;<span className={styles.tokenProp}>email</span>:{" "}
                    <span className={styles.tokenKeyword}>string</span>;
                    <br />
                    &nbsp;&nbsp;<span className={styles.tokenProp}>verified</span>:{" "}
                    <span className={styles.tokenKeyword}>boolean</span>;
                    <br />
                    &#125;
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Card 5: Keyboard Ergonomics & Offline PWA (Span 4) */}
          <article className={`${styles.card} ${styles.cardVelocity}`}>
            <div className={styles.cardMeta}>
              <span className={styles.kicker}>05 / Speed &amp; Ergonomics</span>
              <Zap size={15} className={styles.metaIcon} />
            </div>
            <h3 className={styles.cardHeading}>Instant keyboard velocity</h3>
            <p className={styles.cardCopy}>
              Trigger any tool in milliseconds with ⌘K, switch operations via tactile shortcuts, and work uninterrupted with full offline Service Worker caching.
            </p>

            {/* Abstract Visual Graphic */}
            <div className={styles.velocityVisual} aria-hidden="true">
              <div className={styles.commandMockup}>
                <div className={styles.commandInputRow}>
                  <span className={styles.commandPrompt}>&gt;</span>
                  <span className={styles.commandText}>base64 encode</span>
                  <span className={styles.commandCursor} />
                </div>
                <div className={styles.commandResult}>
                  <span>Base64 String Converter</span>
                  <span className={styles.badgeSubtle}>0.4ms</span>
                </div>
              </div>

              <div className={styles.pwaRow}>
                <div className={styles.pwaStatus}>
                  <CheckCircle2 size={13} className={styles.pwaIcon} />
                  <span>Service Worker Precached</span>
                </div>
                <div className={styles.keycaps}>
                  <kbd>⌘</kbd>
                  <kbd>K</kbd>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div className={styles.footerLinkRow}>
          <Link href="/tools" className={styles.exploreLink}>
            Explore all 30 local tools in DevHub <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
