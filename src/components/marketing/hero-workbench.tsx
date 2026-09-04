"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Command,
  Copy,
  Sparkles,
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

const TABS = [
  { id: "overview", label: "✦ Overview" },
  ...SAMPLES.map((s) => ({ id: s.id, label: s.label })),
];

export function HeroWorkbench() {
  const [activeTabId, setActiveTabId] = useState<string>("overview");
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
        <div className={styles.tabsList} role="tablist" aria-label="Hero workspace views and transformations">
          {TABS.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTabId(tab.id)}
                type="button"
              >
                {tab.label}
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

      {/* Main Content: Overview Image Showcase OR Interactive Split Stage */}
      {activeTabId === "overview" ? (
        <div
          className={styles.showcaseStage}
          id="panel-overview"
          role="tabpanel"
          aria-labelledby="tab-overview"
        >
          <div className={styles.showcaseImageContainer}>
            <Image
              src="/Markiting image .png"
              alt="DevHub Toolkit multi-device workspace on desktop, tablet, and mobile with smart input detection and 30+ tools"
              width={1536}
              height={1024}
              priority
              className={styles.showcaseImage}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 960px"
            />
          </div>

          <div className={styles.showcaseFooter}>
            <div className={styles.showcaseMeta}>
              <span className={styles.pulseIndicator} />
              <span>30+ developer tools · 100% in-browser · Zero external requests</span>
            </div>
            <div className={styles.showcaseActions}>
              <button
                type="button"
                className={styles.sandboxQuickBtn}
                onClick={() => setActiveTabId("jwt")}
                aria-label="Switch to interactive code sandbox"
              >
                <Sparkles size={12} />
                <span>Try live sandbox</span>
              </button>
              <Link href="/dashboard" className={styles.launchBtn}>
                <span>Open workspace</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div
          key={activeSample.id}
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
                  className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ""}`}
                  onClick={handleCopy}
                  aria-label="Copy output to clipboard"
                >
                  {copied ? <Check size={12} className={styles.checkIcon} /> : <Copy size={12} />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </button>
                <Link href={activeSample.toolSlug} className={styles.openToolLink}>
                  <span>Open tool</span> <ArrowRight size={12} className={styles.openToolArrow} />
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
      )}

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
