import Link from "next/link";
import { ArrowRight, ArrowUpRight, Github, LockKeyhole } from "lucide-react";
import styles from "./site-footer.module.css";

const navigation = [
  {
    title: "Workspace",
    links: [
      { label: "Open toolkit", href: "/dashboard" },
      { label: "All tools", href: "/tools" },
      { label: "Favorites", href: "/favorites" },
      { label: "Saved recipes", href: "/recipes" },
    ],
  },
  {
    title: "Explore",
    links: [
      { label: "Categories", href: "/#categories" },
      { label: "Documentation", href: "/docs" },
      { label: "Changelog", href: "/changelog" },
      { label: "Accessibility", href: "/accessibility" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Security", href: "/security" },
      { label: "AI data policy", href: "/ai-data-policy" },
      { label: "Offline mode", href: "/offline" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.inner}>
        <section className={styles.masthead} aria-labelledby="footer-heading">
          <div className={styles.mastheadCopy}>
            <div className={styles.status}>
              <span className={styles.statusDot} aria-hidden="true" />
              Local-first developer utilities
            </div>
            <h2 id="footer-heading">Make the next task<br /><em>feel lighter.</em></h2>
            <p>
              A focused home for the small transformations that keep your work moving.
              Private by default, ready when you are.
            </p>
            <Link className={styles.primaryAction} href="/dashboard">
              <span>Open the toolkit</span>
              <span className={styles.actionIcon} aria-hidden="true"><ArrowRight size={16} /></span>
            </Link>
          </div>

          <nav className={styles.navigation} aria-label="Footer navigation">
            {navigation.map((group) => (
              <div className={styles.column} key={group.title}>
                <h3>{group.title}</h3>
                <ul>
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href}>
                        <span>{link.label}</span>
                        <ArrowUpRight size={13} aria-hidden="true" />
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
              <span className={styles.brandMark} aria-hidden="true">D<span>.</span></span>
              <span>DevHub</span>
            </Link>
            <span className={styles.tagline}>Developer utilities for focused work.</span>
          </div>
          <div className={styles.privacyNote}>
            <LockKeyhole size={14} aria-hidden="true" />
            <span>Run locally in your browser. No input history by default.</span>
          </div>
          <div className={styles.externalLinks}>
            <a href="https://github.com/Sayed-Saa-new/devhub-toolkit-v2" target="_blank" rel="noreferrer">
              <Github size={14} aria-hidden="true" />
              <span>GitHub</span>
            </a>
            <span className={styles.copyright}>© {new Date().getFullYear()} DevHub</span>
          </div>
        </section>
      </div>
    </footer>
  );
}
