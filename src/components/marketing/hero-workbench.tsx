"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Command,
  Copy,
  Terminal,
  Zap,
} from "lucide-react";
import styles from "./hero-workbench.module.css";

interface SampleItem {
  id: string;
  label: string;
  rawTitle: string;
  rawContent: string;
  detectedTool: string;
  confidence: string;
  outputTitle: string;
  outputContent: string;
  toolSlug: string;
}

const SAMPLES: SampleItem[] = [
  {
    id: "jwt",
    label: "JWT Token",
    rawTitle: "input.raw",
    rawContent:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMW14OTgiLCJuYW1lIjoiQWxleCBWYW5jZSIsInJvbGUiOiJlbmdpbmVlciIsImlhdCI6MTczNjgwNDgwMCwiZXhwIjoxNzM2ODkxMjAwfQ.dHJ1c3RlZF9zaWduYXR1cmVfaGVyZQ",
    detectedTool: "JWT Decoder",
    confidence: "99.8%",
    outputTitle: "decoded_payload.json",
    outputContent: `// Header
{
  "alg": "RS256",
  "typ": "JWT"
}

// Payload
{
  "sub": "usr_1mx98",
  "name": "Alex Vance",
  "role": "engineer",
  "exp": "2026-09-03T18:00:00Z"
}`,
    toolSlug: "/tools/jwt-decoder",
  },
  {
    id: "json-ts",
    label: "JSON ➔ TypeScript",
    rawTitle: "api_response.json",
    rawContent: `{
  "id": 402,
  "service": "api-gateway",
  "active": true,
  "rateLimit": 1000,
  "tags": ["prod", "us-east"]
}`,
    detectedTool: "JSON to TypeScript",
    confidence: "98.5%",
    outputTitle: "schema.d.ts",
    outputContent: `export interface ApiGatewayResponse {
  id: number;
  service: string;
  active: boolean;
  rateLimit: number;
  tags: string[];
}`,
    toolSlug: "/tools/json-to-typescript",
  },
  {
    id: "base64",
    label: "Base64 String",
    rawTitle: "encoded_string.txt",
    rawContent:
      "V2VsY29tZSB0byBEZXZIdWIgLSBMb2NhbC1maXJzdCBkZXZlbG9wZXIgd29ya3NwYWNl",
    detectedTool: "Base64 Converter",
    confidence: "99.4%",
    outputTitle: "decoded_utf8.txt",
    outputContent: "Welcome to DevHub — Local-first developer workspace.",
    toolSlug: "/tools/base64",
  },
  {
    id: "cron",
    label: "Cron Parser",
    rawTitle: "schedule.cron",
    rawContent: "*/15 0-6 * * 1-5",
    detectedTool: "Cron Parser",
    confidence: "97.2%",
    outputTitle: "human_readable.txt",
    outputContent:
      "Every 15 minutes, between 12:00 AM and 06:59 AM, Monday through Friday.",
    toolSlug: "/tools/cron-parser",
  },
];

export function HeroWorkbench() {
  const [activeTabId, setActiveTabId] = useState<string>("jwt");
  const [copied, setCopied] = useState<boolean>(false);

  const activeSample =
    SAMPLES.find((s) => s.id === activeTabId) || SAMPLES[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeSample.outputContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback or ignore
    }
  };

  return (
    <div className={styles.workbench} aria-label="Interactive Hero Console">
      {/* Top Header / Bar */}
      <div className={styles.topBar}>
        <div className={styles.windowControls} aria-hidden="true">
          <span className={`${styles.dot} ${styles.dotRed}`} />
          <span className={`${styles.dot} ${styles.dotYellow}`} />
          <span className={`${styles.dot} ${styles.dotGreen}`} />
        </div>

        {/* Interactive Tabs */}
        <div className={styles.tabsList} role="tablist" aria-label="Sample transformations">
          {SAMPLES.map((sample) => {
            const isActive = sample.id === activeTabId;
            return (
              <button
                key={sample.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${sample.id}`}
                id={`tab-${sample.id}`}
                className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTabId(sample.id)}
                type="button"
              >
                {sample.label}
              </button>
            );
          })}
        </div>

        {/* Local-First Telemetry Chip */}
        <div className={styles.telemetryBadge} aria-label="Execution speed">
          <Zap size={12} className={styles.zapIcon} />
          <span>&lt;0.2ms latency · V8 RAM</span>
        </div>
      </div>

      {/* Main Split Stage */}
      <div
        className={styles.stage}
        id={`panel-${activeSample.id}`}
        role="tabpanel"
        aria-labelledby={`tab-${activeSample.id}`}
      >
        {/* Left: Ingest */}
        <div className={styles.paneLeft}>
          <div className={styles.paneHeader}>
            <div className={styles.fileLabel}>
              <Terminal size={12} />
              <span>{activeSample.rawTitle}</span>
            </div>
            <span className={styles.badgeInput}>Input (Pasted)</span>
          </div>

          <div className={styles.codeWrap}>
            <pre className={styles.codeBlock}>
              <code>{activeSample.rawContent}</code>
            </pre>
          </div>

          <div className={styles.detectionBanner}>
            <div className={styles.detectedInfo}>
              <span className={styles.pulseIndicator} />
              <span className={styles.detectedLabel}>Detected:</span>
              <strong>{activeSample.detectedTool}</strong>
              <span className={styles.confidencePill}>{activeSample.confidence}</span>
            </div>
          </div>
        </div>

        {/* Center Divider Indicator */}
        <div className={styles.centerDivider} aria-hidden="true">
          <div className={styles.dividerLine} />
          <div className={styles.transformPill}>
            <ArrowRight size={13} />
          </div>
          <div className={styles.dividerLine} />
        </div>

        {/* Right: Output */}
        <div className={styles.paneRight}>
          <div className={styles.paneHeader}>
            <div className={styles.fileLabel}>
              <span className={styles.cyanFileDot} />
              <span>{activeSample.outputTitle}</span>
            </div>
            <div className={styles.headerActions}>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={handleCopy}
                aria-label="Copy output to clipboard"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
              <Link href={activeSample.toolSlug} className={styles.openToolLink}>
                Open tool <ArrowRight size={12} />
              </Link>
            </div>
          </div>

          <div className={styles.codeWrap}>
            <pre className={styles.codeBlockOutput}>
              <code>{activeSample.outputContent}</code>
            </pre>
          </div>

          <div className={styles.outputFooter}>
            <span className={styles.outputMeta}>
              100% In-browser · Zero external requests
            </span>
          </div>
        </div>
      </div>

      {/* Integrated Command Footer */}
      <Link href="/tools" className={styles.bottomBar} aria-label="Search all 30 local developer tools">
        <div className={styles.bottomLeft}>
          <Command size={14} className={styles.commandIcon} />
          <span className={styles.bottomPrompt}>Jump to any tool instantly:</span>
          <span className={styles.bottomSample}>JSON, JWT, UUID, Regex, Hash, Diff...</span>
        </div>
        <div className={styles.bottomRight}>
          <span className={styles.keycap}>⌘</span>
          <span className={styles.keycap}>K</span>
          <span className={styles.browseAction}>Browse all 30 tools <ArrowRight size={12} /></span>
        </div>
      </Link>
    </div>
  );
}
