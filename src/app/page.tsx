import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Braces,
  Check,
  Command,
  Gauge,
  LockKeyhole,
  Terminal,
  Zap,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ToolCard } from "@/components/tool-card";
import { categories, tools } from "@/lib/tools";

const principles = [
  {
    icon: Zap,
    eyebrow: "01 / instant",
    title: "Fast by default",
    copy: "Focused bundles and server-first rendering keep every interaction close to immediate.",
  },
  {
    icon: LockKeyhole,
    eyebrow: "02 / private",
    title: "Private by design",
    copy: "Deterministic transformations run in your browser, so sensitive payloads stay with you.",
  },
  {
    icon: Command,
    eyebrow: "03 / keyboard",
    title: "Keyboard native",
    copy: "Jump from tool to tool, run workflows, and keep your hands on the keyboard.",
  },
  {
    icon: Blocks,
    eyebrow: "04 / reusable",
    title: "Built to scale",
    copy: "Compose repeatable recipes from typed tools without storing the values you run.",
  },
];

export default function HomePage() {
  const featured = tools.filter((tool) => tool.featured).slice(0, 6);

  return (
    <main id="main-content" tabIndex={-1}>
      <SiteHeader />

      <section className="hero landing-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="landing-hero-glow" aria-hidden="true" />
        <div className="container landing-hero-inner">
          <div className="landing-hero-copy">
            <div className="eyebrow landing-eyebrow">
              <span className="pulse" />
              A calmer workspace for developer data
            </div>
            <h1 className="type-display">
              Clean data.
              <br />
              <span>Ship faster.</span>
            </h1>
            <p className="hero-copy">
              One focused toolkit for the messy work between request and release.
              Detect, transform, and reuse your everyday developer workflows locally.
            </p>
            <div className="hero-actions">
              <Link className="button primary large" href="/dashboard">
                Open toolkit <ArrowRight size={16} />
              </Link>
              <Link className="button secondary large" href="/tools">
                Explore all tools
              </Link>
            </div>
            <div className="landing-proof" aria-label="DevHub product highlights">
              <span><Check size={14} /> 24 focused tools</span>
              <span><Check size={14} /> Runs in your browser</span>
              <span><Check size={14} /> No account required</span>
            </div>
          </div>

          <div className="hero-console" aria-label="Example DevHub workflow preview">
            <div className="console-topbar">
              <div className="console-dots" aria-hidden="true"><i /><i /><i /></div>
              <span>DEVHUB / WORKSPACE</span>
              <span className="console-status"><span /> READY</span>
            </div>
            <div className="console-body">
              <div className="console-sidebar">
                <span className="console-label">TOOLKIT</span>
                <span className="console-nav active"><Braces size={14} /> JSON Formatter</span>
                <span className="console-nav"><Terminal size={14} /> Base64</span>
                <span className="console-nav"><Gauge size={14} /> Regex Tester</span>
                <span className="console-nav"><LockKeyhole size={14} /> JWT Decoder</span>
                <span className="console-label console-label-bottom">WORKFLOWS</span>
                <span className="console-nav"><Blocks size={14} /> API cleanup</span>
              </div>
              <div className="console-main">
                <div className="console-heading">
                  <div>
                    <span className="console-label">FORMATTERS / JSON</span>
                    <strong>Make messy JSON readable.</strong>
                  </div>
                  <span className="console-kbd"><Command size={11} /> K</span>
                </div>
                <div className="console-panels">
                  <div className="code-panel">
                    <span className="panel-label">INPUT</span>
                    <code>{`{"status":"ok","items":[1,2,3]}`}</code>
                  </div>
                  <div className="code-panel output">
                    <span className="panel-label">OUTPUT</span>
                    <code>{`{
  "status": "ok",
  "items": [1, 2, 3]
}`}</code>
                  </div>
                </div>
                <div className="console-footer">
                  <span><Check size={13} /> Processed locally in 4ms</span>
                  <span className="console-action">Copy output <ArrowRight size={13} /></span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container landing-scroll-hint"><span>Scroll to explore</span><span className="scroll-line" /></div>
      </section>

      <section className="trust-strip" aria-label="DevHub product principles">
        <div className="container trust-strip-inner">
          <div><LockKeyhole size={16} /><span><strong>Local-first</strong><small>Deterministic tools run in your browser.</small></span></div>
          <div><Gauge size={16} /><span><strong>Keyboard-ready</strong><small>Search and move through tools quickly.</small></span></div>
          <div><Blocks size={16} /><span><strong>Reusable workflows</strong><small>Save definitions without storing run values.</small></span></div>
        </div>
      </section>

      <section className="section landing-tools-section">
        <div className="container">
          <div className="section-heading landing-section-heading">
            <div>
              <span className="label">THE TOOLKIT</span>
              <h2 className="type-heading-lg">The tools you reach for most.</h2>
              <p>Small utilities, thoughtfully composed into one dependable workspace.</p>
            </div>
            <Link href="/dashboard">View dashboard <ArrowRight size={15} /></Link>
          </div>
          <div className="tools-grid">{featured.map((tool) => <ToolCard key={tool.slug} tool={tool} />)}</div>
        </div>
      </section>

      <section className="section muted landing-principles-section" id="principles">
        <div className="container">
          <div className="section-heading landing-section-heading">
            <div>
              <span className="label">WHY DEVHUB</span>
              <h2 className="type-heading-lg">A better default for developer work.</h2>
            </div>
          </div>
          <div className="principles landing-principles">
            {principles.map(({ icon: Icon, eyebrow, title, copy }) => (
              <article key={title}>
                <div className="principle-topline"><Icon size={18} /><span>{eyebrow}</span></div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section landing-categories-section" id="categories">
        <div className="container landing-category-layout">
          <div className="landing-category-intro">
            <span className="label">FIND YOUR FLOW</span>
            <h2 className="type-heading-lg">Every task has a starting point.</h2>
            <p>Go straight to the kind of work you are doing, then keep the useful parts of the workflow for next time.</p>
            <Link className="text-link" href="/categories/formatters">Browse categories <ArrowRight size={15} /></Link>
          </div>
          <div className="category-list">{categories.map((category) => <Link key={category} href={`/categories/${category.toLowerCase()}`}><span>{category}</span><small>{tools.filter((tool) => tool.category === category).length} tools</small><ArrowRight size={16} /></Link>)}</div>
        </div>
      </section>

      <section className="cta landing-cta">
        <div className="container cta-inner">
          <div>
            <span className="label">READY WHEN YOU ARE</span>
            <h2 className="type-heading-lg">Less searching. More shipping.</h2>
            <p>Open the toolkit and make your next developer task feel lighter.</p>
          </div>
          <Link className="button primary large" href="/dashboard">Open toolkit <ArrowRight size={16} /></Link>
        </div>
      </section>

      <footer>
        <div className="container footer-inner">
          <strong><span className="footer-mark">▲</span> DevHub</strong>
          <span>Developer utilities for focused work.</span>
          <div><Link href="/dashboard">Dashboard</Link><Link href="/tools">Tools</Link><a href="https://github.com/Sayed-Saa-new/devhub-toolkit-v2">GitHub</a></div>
        </div>
      </footer>
    </main>
  );
}
