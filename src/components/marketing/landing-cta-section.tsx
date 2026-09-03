"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Layers3, ShieldCheck, Terminal, Zap } from "lucide-react";
import { categories, tools } from "@/lib/tools";
import styles from "./landing-cta-section.module.css";

const readyTools = tools.filter((tool) => tool.status === "ready").length;

const QUICK_LAUNCH_TOOLS = [
  { name: "JSON Formatter", href: "/tools/json-formatter", tag: "O(1)" },
  { name: "JWT Decoder", href: "/tools/jwt-decoder", tag: "Decoded" },
  { name: "Base64 Converter", href: "/tools/base64", tag: "Sub-ms" },
  { name: "Cron Parser", href: "/tools/cron-parser", tag: "Humanized" },
  { name: "SQL Formatter", href: "/tools/sql-formatter", tag: "Formatted" },
  { name: "UUID Generator", href: "/tools/uuid-generator", tag: "Crypto" },
];

export function LandingCtaSection() {
  return (
    <section className={styles.section} aria-labelledby="landing-cta-title">
      <div className={styles.ambientGlow} aria-hidden="true" />
      <div className={styles.container}>
        <div className={styles.ctaCard}>
          <div className={styles.cardHeader}>
            <div className={styles.badge}>
              <span className={styles.pulseDot} />
              <span>{tools.length} local tools · 0ms network egress</span>
            </div>
            <h2 id="landing-cta-title" className={styles.title}>
              Build with velocity.<br />
              Ship with <em>confidence.</em>
            </h2>
            <p className={styles.subtitle}>
              Stop stitching together ad-heavy, cloud-dependent web utility wrappers. DevHub brings your everyday developer transformations into a thoughtful, instant, local-first workspace.
            </p>
          </div>

          {/* Quick Launch Bar */}
          <div className={styles.quickLaunchBar}>
            <div className={styles.quickLaunchHead}>
              <Terminal size={13} className={styles.terminalIcon} />
              <span>Instant Tool Launcher</span>
            </div>
            <div className={styles.quickLaunchGrid}>
              {QUICK_LAUNCH_TOOLS.map((item) => (
                <Link key={item.name} href={item.href} className={styles.quickLaunchPill}>
                  <span>{item.name}</span>
                  <span className={styles.pillTag}>{item.tag}</span>
                  <ArrowRight size={12} className={styles.pillArrow} />
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <Link className="button primary large" href="/tools">
              <span>Browse all {tools.length} tools</span>
              <ArrowRight size={16} />
            </Link>
            <Link className="button secondary large" href="/dashboard">
              <Zap size={15} />
              <span>Open workspace</span>
            </Link>
          </div>

          <div className={styles.proofGrid} aria-label="DevHub product facts">
            <div className={styles.factCard}>
              <div className={styles.factIcon}>
                <Layers3 size={15} />
              </div>
              <div className={styles.factCopy}>
                <strong>{readyTools} ready tools</strong>
                <small>Available today in V8 memory</small>
              </div>
            </div>

            <div className={styles.factCard}>
              <div className={styles.factIcon}>
                <ShieldCheck size={15} />
              </div>
              <div className={styles.factCopy}>
                <strong>100% In-Browser Execution</strong>
                <small>Zero payload network egress</small>
              </div>
            </div>

            <div className={styles.factCard}>
              <div className={styles.factIcon}>
                <CheckCircle2 size={15} />
              </div>
              <div className={styles.factCopy}>
                <strong>{categories.length} focused categories</strong>
                <small>Built for real developer tasks</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
