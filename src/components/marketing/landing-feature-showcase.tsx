import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Cpu,
  History,
  KeyRound,
  LockKeyhole,
  RotateCcw,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import styles from "./landing-feature-showcase.module.css";

interface FeatureItem {
  id: string;
  eyebrow: string;
  title: string;
  titleMuted: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  windowTitle: string;
  themeClass: string;
  imageLeft: boolean;
  ctaText: string;
  ctaHref: string;
  specs: { icon: React.ReactNode; text: string }[];
}

const features: FeatureItem[] = [
  {
    id: "dashboard",
    eyebrow: "01 / Zero-latency sandbox",
    title: "Smart input detection.",
    titleMuted: "Instant local workbench.",
    description:
      "Paste messy payloads, JSON strings, JWT tokens, or SQL blocks. DevHub parses schemas in browser memory and selects the optimal tool in 0ms without sending a single byte over the wire.",
    imageSrc: "/dashboard-real.png",
    imageAlt: "DevHub All Tools Dashboard with smart input detection",
    windowTitle: "DevHub — All Tools Workbench",
    themeClass: styles.themeCyan,
    imageLeft: false, // Image on Right
    ctaText: "Launch live dashboard",
    ctaHref: "/dashboard",
    specs: [
      {
        icon: <Zap size={14} />,
        text: "30 deterministic offline developer utilities",
      },
      {
        icon: <Cpu size={14} />,
        text: "Zero-latency regex & AST schema auto-detection",
      },
      {
        icon: <LockKeyhole size={14} />,
        text: "100% in-browser processing — zero network transmission",
      },
    ],
  },
  {
    id: "recipes",
    eyebrow: "02 / Composable pipelines",
    title: "Chain transformations.",
    titleMuted: "Save repeatable pipelines.",
    description:
      "Connect formatters, converters, and decoders into reusable sequential workflows. The output of one step seamlessly feeds the next, runnable anytime with one click.",
    imageSrc: "/recipes-real.png",
    imageAlt: "DevHub Saved Recipes interface with multi-step workflows",
    windowTitle: "DevHub — Saved Recipes",
    themeClass: styles.themeViolet,
    imageLeft: true, // Image on Left (Alternating!)
    ctaText: "Explore saved recipes",
    ctaHref: "/recipes",
    specs: [
      {
        icon: <Workflow size={14} />,
        text: "Compose multi-tool chains in browser memory",
      },
      {
        icon: <Blocks size={14} />,
        text: "Export & import portable recipe definitions as JSON",
      },
      {
        icon: <RotateCcw size={14} />,
        text: "Zero cloud state: recipes persist purely in local IndexedDB",
      },
    ],
  },
  {
    id: "assistant",
    eyebrow: "03 / BYOK AI assistance",
    title: "Think through the work.",
    titleMuted: "Keep control of the data.",
    description:
      "Optional AI tools for synthesizing multi-step tool pipelines and explaining complex parser errors. Powered strictly by your own API key or local Ollama model—nothing runs without explicit consent.",
    imageSrc: "/assistant-real.png",
    imageAlt: "DevHub AI Assistant interface with bring-your-own-key providers",
    windowTitle: "DevHub — AI Assistant",
    themeClass: styles.themeBlue,
    imageLeft: false, // Image on Right (Alternating!)
    ctaText: "Configure AI provider",
    ctaHref: "/assistant",
    specs: [
      {
        icon: <KeyRound size={14} />,
        text: "BYOK: Google Gemini, OpenAI, OpenRouter, or local Ollama",
      },
      {
        icon: <LockKeyhole size={14} />,
        text: "Strict consent barrier before any request leaves the browser",
      },
      {
        icon: <Sparkles size={14} />,
        text: "Turn unstructured goals into validated tool steps",
      },
    ],
  },
  {
    id: "history",
    eyebrow: "04 / Private activity",
    title: "Pick up where you left off.",
    titleMuted: "Zero server-side retention.",
    description:
      "Opt-in local history lets you quickly jump back to frequently used utilities. Stored strictly in local IndexedDB, capped at 50 entries, and stores only tool identifiers—never your sensitive payloads.",
    imageSrc: "/recent-real.png",
    imageAlt: "DevHub Recent Activity with local-only visit history",
    windowTitle: "DevHub — Recent Activity",
    themeClass: styles.themeAmber,
    imageLeft: true, // Image on Left (Alternating!)
    ctaText: "View recent activity",
    ctaHref: "/recent",
    specs: [
      {
        icon: <History size={14} />,
        text: "Bounded to 50 recent tool visits in local IndexedDB",
      },
      {
        icon: <LockKeyhole size={14} />,
        text: "Metadata only: tool slugs and timestamps, never payload values",
      },
      {
        icon: <RotateCcw size={14} />,
        text: "One-click instant purge and opt-out toggle",
      },
    ],
  },
];

export function LandingFeatureShowcase() {
  return (
    <div id="features" aria-label="Platform feature showcase">
      {features.map((feature, index) => (
        <section
          key={feature.id}
          id={feature.id}
          className={`${styles.section} ${index % 2 === 1 ? styles.sectionAlt : ""} ${feature.themeClass}`}
        >
          <div className={styles.container}>
            <div
              className={`${styles.layout} ${feature.imageLeft ? styles.imageLeft : ""}`}
            >
              {/* Copy Column */}
              <div className={styles.content}>
                <div className={styles.eyebrow}>
                  <span className={styles.pulseDot} />
                  {feature.eyebrow}
                </div>

                <h2 className={styles.title}>
                  {feature.title}
                  <span className={styles.titleMuted}>
                    {feature.titleMuted}
                  </span>
                </h2>

                <p className={styles.description}>{feature.description}</p>

                <div className={styles.specs}>
                  {feature.specs.map((spec, sIndex) => (
                    <div key={sIndex} className={styles.specItem}>
                      <span className={styles.specIcon}>{spec.icon}</span>
                      <span>{spec.text}</span>
                    </div>
                  ))}
                </div>

                <Link href={feature.ctaHref} className={styles.ctaLink}>
                  {feature.ctaText}
                  <ArrowRight size={15} />
                </Link>
              </div>

              {/* Mockup Window Column */}
              <div className={styles.mockupWrapper}>
                <div className={styles.glow} />

                <div className={styles.windowFrame}>
                  <div className={styles.windowBar}>
                    <div className={styles.macDots}>
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className={styles.windowTitle}>
                      {feature.windowTitle}
                    </div>
                  </div>

                  <div className={styles.imageWrapper}>
                    <Image
                      src={feature.imageSrc}
                      alt={feature.imageAlt}
                      width={1200}
                      height={750}
                      className={styles.image}
                      priority={index === 0}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
