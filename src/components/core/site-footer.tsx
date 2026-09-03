import Link from "next/link";
import { ArrowRight, ArrowUpRight, Cpu, Github, LockKeyhole, Terminal } from "lucide-react";
import styles from "./site-footer.module.css";

const navigation = [
  {
    kicker: "01 / Workspace",
    title: "Workspace",
    links: [
      { label: "Open workspace", href: "/dashboard" },
      { label: "All tools", href: "/tools" },
      { label: "Favorites", href: "/favorites" },
      { label: "Saved recipes", href: "/recipes" },
    ],
  },
  {
    kicker: "02 / Explore",
    title: "Explore",
    links: [
      { label: "Categories", href: "/#categories" },
      { label: "Documentation", href: "/docs" },
      { label: "Changelog", href: "/changelog" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
  {
    kicker: "03 / Trust",
    title: "Trust",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Security", href: "/security" },
      { label: "AI data policy", href: "/ai-data-policy" },
      { label: "Offline mode", href: "/offline" },
    ],
  },
];

const POPULAR_FOOTER_TOOLS = [
  { name: "JWT", href: "/tools/jwt-decoder" },
  { name: "JSON", href: "/tools/json-formatter" },
  { name: "Base64", href: "/tools/base64" },
  { name: "Cron", href: "/tools/cron-parser" },
  { name: "SQL", href: "/tools/sql-formatter" },
  { name: "UUID", href: "/tools/uuid-generator" },
  { name: "YAML", href: "/tools/yaml-formatter" },
  { name: "Diff", href: "/tools/text-diff" },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.topHairlineGradient} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <section className={styles.masthead} aria-labelledby="footer-heading">
          <div className={styles.mastheadCopy}>
            <div className={styles.status}>
              <span className={styles.statusDot} aria-hidden="true" />
              Local-first developer utilities
            </div>
            <h2 id="footer-heading">
              Make the next task<br />
              <em>feel lighter.</em>
            </h2>
            <p>
              A focused home for the small data transformations that keep your work moving. Private by default, running O(1) syntax O(1) O(1) in your browser&apos;s memory.
            </p>

            <div className={styles.mastheadActions}>
              <Link className={styles.primaryAction} href="/tools">
                <span>Browse all tools</span>
                <span className={styles.actionIcon} aria-hidden="true">
                  <ArrowRight size={15} />
                </span>
              </Link>
            </div>

            {/* Quick tool chips */}
            <div className={styles.quickChipsBar}>
              <div className={styles.chipsLabel}>
                <Terminal size={11} />
                <span>Quick Tools</span>
              </div>
              <div className={styles.chipsRow}>
                {POPULAR_FOOTER_TOOLS.map((t) => (
                  <Link key={t.name} href={t.href} className={styles.toolChip}>
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <nav className={styles.navigation} aria-label="Footer navigation">
            {navigation.map((group) => (
              <div className={styles.column} key={group.title}>
                <span className={styles.columnKicker}>{group.kicker}</span>
                <h3>{group.title}</h3>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>
                        <span>{link.label}</span>
                        <ArrowUpRight size={13} aria-hidden="true" className={styles.linkArrow} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </section>

        <div className={styles.divider} aria-hidden="true" />

        <section className={styles.meta} aria-label="DevHub information">
          <div className={styles.brandLockup}>
            <Link href="/" className={styles.brand} aria-label="DevHub home">
              <span className={styles.brandMark} aria-hidden="true">
                D<span>.</span>
              </span>
              <span>DevHub</span>
            </Link>
            <span className={styles.versionBadge}>v0.18.0 · Open Source</span>
          </div>

          <div className={styles.privacyNote}>
            <LockKeyhole size={13} aria-hidden="true" />
            <span>WebCrypto &amp; Pure TypeScript · 0 Bytes Network Egress</span>
          </div>

          <div className={styles.externalLinks}>
            <span className={styles.localStatusChip}>
              <Cpu size={12} />
              <span>All Systems Local</span>
            </span>
            <a href="https://github.com/abushaidislam/devhub-v2" target="_blank" rel="noreferrer" className={styles.githubLink}>
              <Github size={13} aria-hidden="true" />
              <span>GitHub</span>
            </a>
            <span className={styles.copyright}>© {new Date().getFullYear()} DevHub</span>
          </div>
        </section>
      </div>
    </footer>
  );
}
