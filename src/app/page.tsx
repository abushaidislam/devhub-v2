import Link from "next/link";
import { ArrowRight, Github, LockKeyhole, Gauge, Blocks } from "lucide-react";
import { SiteHeader } from "@/components/core/site-header";
import { ToolCard } from "@/components/tools/tool-card";
import { categories, tools } from "@/lib/tools";
import { SiteFooter } from "@/components/core/site-footer";
import { LandingCtaSection } from "@/components/marketing/landing-cta-section";
import { LandingBentoGrid } from "@/components/marketing/landing-bento-grid";
import { LandingComparison } from "@/components/marketing/landing-comparison";
import { HeroWorkbench } from "@/components/marketing/hero-workbench";

export default function HomePage() {
  const featured = tools.filter((tool) => tool.featured).slice(0, 6);
  return (
    <main id="main-content" tabIndex={-1}>
      <SiteHeader />
      <section className="hero">
        <div className="hero-grid" />
        <div className="container hero-inner">
          <div className="eyebrow"><span className="pulse" />Local-first sandbox · 30 tools · 0ms network</div>
          <h1 className="type-display">Developer tools,<br /><span>engineered for speed.</span></h1>
          <p className="hero-copy">The zero-latency developer workbench. Paste messy payloads, auto-detect schemas, and transform data in your browser&apos;s memory without data ever leaving your machine.</p>
          <div className="hero-actions">
            <Link className="button primary large" href="/tools">Browse all tools <ArrowRight size={16} /></Link>
            <Link className="button secondary large" href="/dashboard">Open workspace</Link>
            <a className="button secondary large" href="https://github.com/abushaidislam/devhub-v2" target="_blank" rel="noreferrer"><Github size={15} /> Source</a>
          </div>
          <HeroWorkbench />
        </div>
      </section>
      <section className="trust-strip" aria-label="DevHub product principles">
        <div className="container trust-strip-inner">
          <article>
            <span className="trust-icon"><LockKeyhole size={16} /></span>
            <span className="trust-copy"><span className="trust-kicker">01 / privacy</span><strong>Local-first</strong><small>Deterministic tools run in your browser.</small></span>
          </article>
          <article>
            <span className="trust-icon"><Gauge size={16} /></span>
            <span className="trust-copy"><span className="trust-kicker">02 / speed</span><strong>Keyboard-ready</strong><small>Search and move through tools quickly.</small></span>
          </article>
          <article>
            <span className="trust-icon"><Blocks size={16} /></span>
            <span className="trust-copy"><span className="trust-kicker">03 / repeatable</span><strong>Reusable workflows</strong><small>Save definitions without storing run values.</small></span>
          </article>
        </div>
      </section>

      {/* Abstract & Clean Capabilities Bento Grid */}
      <LandingBentoGrid />

      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="label">Popular tools</span>
              <h2 className="type-heading-lg">Everything you reach for. Instantly.</h2>
            </div>
            <Link href="/tools">View all tools <ArrowRight size={15} /></Link>
          </div>
          <div className="tools-grid">{featured.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div>
        </div>
      </section>

      {/* Architectural Philosophy / Comparison Matrix */}
      <LandingComparison />

      <section className="section" id="categories">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="label">Categories</span>
              <h2 className="type-heading-lg">One home for every workflow.</h2>
            </div>
          </div>
          <div className="category-list">
            {categories.map((category) => (
              <Link key={category} href={`/categories/${category.toLowerCase()}`}>
                <span>{category}</span>
                <small>{tools.filter((tool) => tool.category === category).length} tools</small>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <LandingCtaSection />
      <SiteFooter />
    </main>
  );
}
