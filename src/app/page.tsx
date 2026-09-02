import Link from "next/link";
import { ArrowRight, Command, LockKeyhole, Gauge, Blocks } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ToolCard } from "@/components/tool-card";
import { categories, tools } from "@/lib/tools";
import { SiteFooter } from "@/components/site-footer";
import { LandingCtaSection } from "@/components/landing-cta-section";

export default function HomePage() {
  const featured = tools.filter((tool) => tool.featured).slice(0, 6);
  return (
    <main id="main-content" tabIndex={-1}>
      <SiteHeader />
      <section className="hero">
        <div className="hero-grid" />
        <div className="container hero-inner">
          <div className="eyebrow"><span className="pulse" />Built for the work between the work</div>
          <h1 className="type-display">Developer tools,<br /><span>engineered for speed.</span></h1>
          <p className="hero-copy">Paste messy API data, detect the right tool, transform it locally, and save the workflow for next time.</p>
          <div className="hero-actions">
            <Link className="button primary large" href="/tools">Browse all tools <ArrowRight size={16} /></Link>
            <a className="button secondary large" href="https://github.com/abushaidislam/devhub-v2">View source</a>
          </div>
          <Link className="command-preview" href="/tools" aria-label="Browse all developer tools">
            <Command size={17} />
            <span className="command-preview-copy"><strong>Jump to any tool</strong><small>Search the toolkit</small></span>
            <span className="command-preview-action">Browse tools <ArrowRight size={14} /></span>
            <span className="command-keys" aria-hidden="true"><kbd>⌘</kbd><kbd>K</kbd></span>
          </Link>
          <div className="workflow-preview" aria-label="Example local workflow">
            <span className="workflow-label">A typical DevHub flow</span>
            <div className="workflow-steps">
              <span>Paste JSON</span><ArrowRight size={13} />
              <span>Detect</span><ArrowRight size={13} />
              <span>Transform locally</span><ArrowRight size={13} />
              <span>Save recipe</span>
            </div>
          </div>
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
      <section className="section muted" id="principles">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="label">Designed with intent</span>
              <h2 className="type-heading-lg">Fast is a feature.</h2>
            </div>
          </div>
          <div className="principles">
            <article><Gauge /><h3>Instant by default</h3><p>Server-first rendering, focused bundles and interfaces with no waiting around.</p></article>
            <article><LockKeyhole /><h3>Private by design</h3><p>Local-first processing keeps sensitive payloads in your browser.</p></article>
            <article><Command /><h3>Keyboard native</h3><p>Search, navigate and run workflows without reaching for the mouse.</p></article>
            <article><Blocks /><h3>Built to scale</h3><p>Typed data and composable UI make every new tool consistent.</p></article>
          </div>
        </div>
      </section>
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
