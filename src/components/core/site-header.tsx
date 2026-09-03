"use client";

import Link from "next/link";
import { Github, Search } from "lucide-react";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { ButtonLink } from "../ui/button";
import styles from "./site-header.module.css";

export function SiteHeader() {
  return (
    <header className={`${styles.header} site-header`}>
      <div className={`${styles.headerInner} container nav-wrap`}>
        <div className={styles.brandGroup}>
          <Logo />
          <nav className={`${styles.nav} desktop-nav`} aria-label="Primary navigation">
            <Link href="/dashboard" className={styles.navLink}>
              Dashboard
            </Link>
            <Link href="/tools" className={styles.navLink}>
              Tools
            </Link>
            <Link href="/recipes" className={styles.navLink}>
              Recipes
            </Link>
            <Link href="/#categories" className={styles.navLink}>
              Categories
            </Link>
            <Link href="/assistant" className={styles.navLink}>
              AI Assist
            </Link>
          </nav>
        </div>

        <div className={`${styles.actions} nav-actions`}>
          <div className={styles.statusChip}>
            <span className={styles.pulseDot} />
            <span>0ms local V8</span>
          </div>

          <Link className={`${styles.searchTrigger} search-trigger`} href="/tools" aria-label="Search tools">
            <Search size={14} className={styles.searchIcon} />
            <span className={styles.searchLabel}>Search 30 tools...</span>
            <div className={styles.keycaps}>
              <kbd>⌘</kbd>
              <kbd>K</kbd>
            </div>
          </Link>

          <ThemeToggle size="medium" />

          <ButtonLink
            href="https://github.com/abushaidislam/devhub-v2"
            variant="tertiary"
            size="medium"
            shape="square"
            aria-label="GitHub repository"
            prefix={<Github size={16} />}
          />

          <ButtonLink href="/tools" variant="default" className={styles.primaryCta}>
            Browse tools
          </ButtonLink>
        </div>
      </div>
    </header>
  );
}
