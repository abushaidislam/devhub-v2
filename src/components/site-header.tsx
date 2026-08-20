import Link from "next/link";
import { Github, Search } from "lucide-react";
import { Logo } from "./logo";
import { ButtonLink } from "./ui/button";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Logo />
        <nav className="desktop-nav" aria-label="Primary">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/tools">Tools</Link>
          <Link href="/#categories">Categories</Link>
        </nav>
        <div className="nav-actions">
          <Link className="search-trigger" href="/dashboard">
            <Search size={15} />
            <span>Search tools</span>
            <kbd>⌘K</kbd>
          </Link>
          <ButtonLink
            href="https://github.com/Sayed-Saa-new/devhub-toolkit-v2"
            variant="tertiary"
            size="medium"
            shape="square"
            aria-label="GitHub repository"
            prefix={<Github size={17} />}
          />
          <ButtonLink href="/dashboard" variant="default">Open toolkit</ButtonLink>
        </div>
      </div>
    </header>
  );
}
