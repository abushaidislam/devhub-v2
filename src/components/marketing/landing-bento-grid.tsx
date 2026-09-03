"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Cpu,
  Layers,
  Lock,
  ShieldCheck,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react";
import styles from "./landing-bento-grid.module.css";

interface FormatSample {
  name: string;
  filename: string;
  bytes: string;
  speed: string;
  prefix: string;
  highlight: string;
  suffix: string;
  tool: string;
  match: string;
  toolHref: string;
}

const FORMAT_SAMPLES: Record<string, FormatSample> = {
  JWT: {
    name: "JWT",
    filename: "input.raw",
    bytes: "1,420 bytes",
    speed: "0ms ingest",
    prefix: "ey",
    highlight: "JhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9",
    suffix: ".eyJzdWIiOiIxMjM0NTY3ODkwIi...",
    tool: "JWT Decoder",
    match: "99.8% match",
    toolHref: "/tools/jwt-decoder",
  },
  JSON: {
    name: "JSON",
    filename: "payload.json",
    bytes: "68 bytes",
    speed: "0ms ingest",
    prefix: "{\n  \"",
    highlight: "status",
    suffix: "\": \"healthy\", \"nodes\": 8\n}",
    tool: "JSON Formatter",
    match: "100% match",
    toolHref: "/tools/json-formatter",
  },
  Base64: {
    name: "Base64",
    filename: "encoded.txt",
    bytes: "44 bytes",
    speed: "0ms ingest",
    prefix: "V2Vs",
    highlight: "Y29tZSB0byBEZXZIdWI",
    suffix: "gLSBMb2NhbC1maXJzdA==",
    tool: "Base64 Converter",
    match: "99.4% match",
    toolHref: "/tools/base64",
  },
  YAML: {
    name: "YAML",
    filename: "config.yaml",
    bytes: "58 bytes",
    speed: "0ms ingest",
    prefix: "version: '3.8'\n",
    highlight: "services:",
    suffix: " app: image: node",
    tool: "YAML Formatter",
    match: "98.9% match",
    toolHref: "/tools/yaml-formatter",
  },
  SQL: {
    name: "SQL",
    filename: "query.sql",
    bytes: "78 bytes",
    speed: "0ms ingest",
    prefix: "SELECT ",
    highlight: "id, name, email",
    suffix: " FROM users WHERE active = 1",
    tool: "SQL Formatter",
    match: "99.1% match",
    toolHref: "/tools/sql-formatter",
  },
  Cron: {
    name: "Cron",
    filename: "schedule.cron",
    bytes: "16 bytes",
    speed: "0ms ingest",
    prefix: "*/15 ",
    highlight: "0-6 * * 1-5",
    suffix: " (Mon-Fri 00:00-06:59)",
    tool: "Cron Parser",
    match: "97.8% match",
    toolHref: "/tools/cron-parser",
  },
  XML: {
    name: "XML",
    filename: "dataset.xml",
    bytes: "57 bytes",
    speed: "0ms ingest",
    prefix: "<response><status ",
    highlight: 'code="200"',
    suffix: " /><record id=\"42\"/></response>",
    tool: "XML Formatter",
    match: "98.6% match",
    toolHref: "/tools/xml-formatter",
  },
};

export function LandingBentoGrid() {
  const [selectedFormat, setSelectedFormat] = useState<string>("JWT");
  const [tsCopied, setTsCopied] = useState<boolean>(false);

  const activeFormat = FORMAT_SAMPLES[selectedFormat] || FORMAT_SAMPLES.JWT;

  const handleTsCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        `interface UserResponse {\n  id: number;\n  email: string;\n  verified: boolean;\n}`
      );
      setTsCopied(true);
      setTimeout(() => setTsCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

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
          <article className={`${styles.card} ${styles.cardDetection} relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 ring-1 ring-black/5 rounded-2xl overflow-hidden`}>
            <div className={styles.cardMeta}>
              <span className={`${styles.kicker} text-[11px] font-mono font-medium uppercase tracking-wider text-neutral-500`}>01 / Dual-Stage Detection</span>
              <span className={styles.tag}>Heuristic Engine</span>
            </div>
            <h3 className={`${styles.cardHeading} text-lg font-semibold tracking-tight text-neutral-900 dark:text-white leading-snug`}>Sub-millisecond smart routing</h3>
            <p className={`${styles.cardCopy} text-sm font-medium tracking-normal text-neutral-500 dark:text-neutral-400 leading-relaxed`}>
              Paste any raw blob—JSON, JWT, SQL, Cron, YAML, or Base64. Bounded O(1) fast-guards inspect syntax patterns and route to the exact tool with confidence scoring in under 1ms.
            </p>

            {/* Interactive Visual Graphic */}
            <div className={styles.previewWindow}>
              <div className={styles.windowBar}>
                <div className={styles.windowTitle}>
                  <Terminal size={12} />
                  <span>{activeFormat.filename}</span>
                </div>
                <div className={styles.windowStats}>
                  <span>{activeFormat.bytes}</span>
                  <span className={styles.statusLive}>{activeFormat.speed}</span>
                </div>
              </div>

              <div className={styles.codeLine} key={activeFormat.name}>
                <code>
                  <span className={styles.tokenMuted}>{activeFormat.prefix}</span>
                  <span className={styles.tokenHighlight}>{activeFormat.highlight}</span>
                  <span className={styles.tokenMuted}>{activeFormat.suffix}</span>
                </code>
              </div>

              <Link href={activeFormat.toolHref} className={styles.detectedRow} title={`Open ${activeFormat.tool}`}>
                <div className={styles.detectedMatch}>
                  <span className={styles.cyanDot} />
                  <strong>{activeFormat.tool}</strong>
                  <span className={styles.matchScore}>{activeFormat.match}</span>
                </div>
                <div className={styles.actionHint}>
                  <span>Press</span>
                  <kbd>⌘</kbd>
                  <kbd>↵</kbd>
                  <span>to jump</span>
                  <ArrowRight size={11} className={styles.jumpArrow} />
                </div>
              </Link>

              {/* Interactive Format Pills */}
              <div className={styles.formatPills} role="tablist" aria-label="Detection format samples">
                {Object.keys(FORMAT_SAMPLES).map((fmt) => {
                  const isActive = fmt === selectedFormat;
                  return (
                    <button
                      key={fmt}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`${styles.formatPillBtn} ${isActive ? styles.activePill : ""}`}
                      onClick={() => setSelectedFormat(fmt)}
                    >
                      {fmt}
                    </button>
                  );
                })}
              </div>
            </div>
          </article>

          {/* Card 2: Zero-Egress Privacy Sandbox (Span 5) */}
          <article className={`${styles.card} ${styles.cardPrivacy} relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 ring-1 ring-black/5 rounded-2xl overflow-hidden`}>
            <div className={styles.cardMeta}>
              <span className={`${styles.kicker} text-[11px] font-mono font-medium uppercase tracking-wider text-neutral-500`}>02 / Memory Boundary</span>
              <span className={styles.tag}>Zero Egress</span>
            </div>
            <h3 className={`${styles.cardHeading} text-lg font-semibold tracking-tight text-neutral-900 dark:text-white leading-snug`}>Zero-egress privacy sandbox</h3>
            <p className={`${styles.cardCopy} text-sm font-medium tracking-normal text-neutral-500 dark:text-neutral-400 leading-relaxed`}>
              Deterministic processing runs strictly in your browser&apos;s V8 memory. No server uploads, no backend telemetry, and zero payload retention.
            </p>

            {/* Visual Graphic */}
            <div className={styles.privacyVisual}>
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
          <article className={`${styles.card} ${styles.cardRecipes} relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 ring-1 ring-black/5 rounded-2xl overflow-hidden`}>
            <div className={styles.cardMeta}>
              <span className={`${styles.kicker} text-[11px] font-mono font-medium uppercase tracking-wider text-neutral-500`}>03 / Workflow Pipelines</span>
              <Workflow size={15} className={styles.metaIcon} />
            </div>
            <h3 className={`${styles.cardHeading} text-lg font-semibold tracking-tight text-neutral-900 dark:text-white leading-snug`}>Composable recipe pipelines</h3>
            <p className={`${styles.cardCopy} text-sm font-medium tracking-normal text-neutral-500 dark:text-neutral-400 leading-relaxed`}>
              Pipe transformations sequentially. Compose reusable developer recipes and export schema definitions without storing sensitive run values.
            </p>

            {/* Visual Graphic */}
            <div className={styles.pipelineVisual}>
              <div className={styles.pipelineSteps}>
                <div className={styles.pipelineStep} title="Step 1: Raw JSON">
                  <span className={styles.stepNum}>1</span>
                  <span className={styles.stepName}>Raw JSON</span>
                </div>
                <div className={styles.pipelineConnector} />
                <div className={styles.pipelineStep} title="Step 2: YAML Parse">
                  <span className={styles.stepNum}>2</span>
                  <span className={styles.stepName}>YAML Parse</span>
                </div>
                <div className={styles.pipelineConnector} />
                <div className={styles.pipelineStep} title="Step 3: SHA-256">
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
          <article className={`${styles.card} ${styles.cardInference} relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 ring-1 ring-black/5 rounded-2xl overflow-hidden`}>
            <div className={styles.cardMeta}>
              <span className={`${styles.kicker} text-[11px] font-mono font-medium uppercase tracking-wider text-neutral-500`}>04 / Type Inference</span>
              <Layers size={15} className={styles.metaIcon} />
            </div>
            <h3 className={`${styles.cardHeading} text-lg font-semibold tracking-tight text-neutral-900 dark:text-white leading-snug`}>Live interface extraction</h3>
            <p className={`${styles.cardCopy} text-sm font-medium tracking-normal text-neutral-500 dark:text-neutral-400 leading-relaxed`}>
              Transform chaotic API responses into strictly typed TypeScript interfaces, Markdown tables, or CSV datasets in a single keystroke.
            </p>

            {/* Visual Graphic */}
            <div className={styles.inferenceVisual}>
              <div className={`${styles.miniEditor} rounded-lg bg-neutral-950 border border-white/10 shadow-2xl shadow-black/40 ring-1 ring-white/5 overflow-hidden`}>
                <div className={styles.editorHead}>
                  <div className={styles.editorHeadTitle}>
                    <span>JSON Payload</span>
                    <ArrowRight size={11} />
                    <span>TypeScript</span>
                  </div>
                  <button
                    type="button"
                    className={`${styles.miniCopyBtn} ${tsCopied ? styles.miniCopyBtnCopied : ""}`}
                    onClick={handleTsCopy}
                    aria-label="Copy TypeScript interface"
                  >
                    {tsCopied ? <Check size={11} className={styles.checkIcon} /> : <Copy size={11} />}
                    <span>{tsCopied ? "Copied" : "Copy"}</span>
                  </button>
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
          <article className={`${styles.card} ${styles.cardVelocity} relative bg-white/50 dark:bg-black/50 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg shadow-black/5 ring-1 ring-black/5 rounded-2xl overflow-hidden`}>
            <div className={styles.cardMeta}>
              <span className={`${styles.kicker} text-[11px] font-mono font-medium uppercase tracking-wider text-neutral-500`}>05 / Speed &amp; Ergonomics</span>
              <Zap size={15} className={styles.metaIcon} />
            </div>
            <h3 className={`${styles.cardHeading} text-lg font-semibold tracking-tight text-neutral-900 dark:text-white leading-snug`}>Instant keyboard velocity</h3>
            <p className={`${styles.cardCopy} text-sm font-medium tracking-normal text-neutral-500 dark:text-neutral-400 leading-relaxed`}>
              Trigger any tool in milliseconds with ⌘K, switch operations via tactile shortcuts, and work uninterrupted with full offline Service Worker caching.
            </p>

            {/* Visual Graphic */}
            <div className={styles.velocityVisual}>
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
            Explore all 30 local tools in DevHub <ArrowRight size={14} className={styles.exploreArrow} />
          </Link>
        </div>
      </div>
    </section>
  );
}
