import Link from "next/link";
import { ArrowRight, Check, CircleDot, Layers3, LockKeyhole } from "lucide-react";
import { categories, tools } from "@/lib/tools";
import styles from "./landing-cta-section.module.css";

const readyTools = tools.filter((tool) => tool.status === "ready").length;

export function LandingCtaSection() {
  return (
    <section className={styles.section} aria-labelledby="landing-cta-title">
      <div className={styles.pattern} aria-hidden="true" />
      <div className={styles.content}>
        <div className={styles.badge}><CircleDot size={13} /> {tools.length} tools, one focused workspace</div>
        <h2 id="landing-cta-title">Build with clarity.<br />Ship with <em>confidence.</em></h2>
        <p>Stop stitching together one-off utilities. DevHub brings your everyday developer transformations into a thoughtful, local-first workspace.</p>
        <div className={styles.actions}>
          <Link className="button primary large" href="/tools">Browse all tools <ArrowRight size={16} /></Link>
          <Link className="button secondary large" href="/dashboard">Open workspace</Link>
        </div>
        <div className={styles.proof} aria-label="DevHub product facts">
          <div className={styles.fact}><span className={styles.factIcon}><Layers3 size={14} /></span><span><strong>{readyTools} ready tools</strong><small>Available today</small></span></div>
          <div className={styles.fact}><span className={styles.factIcon}><LockKeyhole size={14} /></span><span><strong>Runs locally</strong><small>In your browser</small></span></div>
          <div className={styles.fact}><span className={styles.factIcon}><Check size={14} /></span><span><strong>{categories.length} categories</strong><small>Built around real tasks</small></span></div>
        </div>
      </div>
    </section>
  );
}
