import type {Metadata} from "next";
import {TrustPage} from "@/components/marketing/trust-page";

export const metadata: Metadata = {
  title: "Changelog",
  description: "Verified DevHub product changes.",
  alternates: {canonical: "/changelog"},
  openGraph: {
    type: "website",
    url: "/changelog",
    title: "Changelog — DevHub",
    description: "Verified DevHub product changes.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Changelog — DevHub" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Changelog — DevHub",
    description: "Verified DevHub product changes.",
    images: ["/opengraph-image"],
  },
};

export default function Page() {
  return (
    <TrustPage
      title="Changelog"
      intro="Only verified repository changes are listed here."
      sections={[
        {
          title: "August 2026 — v0.6.2",
          body: "Improved accessible copy-button states and button types across the tool runtime. The release includes 24 local-first developer tools, typed workflow engines, saved local recipes, smart input detection, PWA/offline support, and optional BYOK AI assistance.",
        },
        {
          title: "August 2026 — v0.6.1",
          body: "Resolved end-to-end test locator ambiguities in core browser flows while preserving the shared runtime, favorites workspace, and local-first data boundaries.",
        },
        {
          title: "August 2026 — v0.6.0",
          body: "Added the current distribution of developer tools and strengthened smart input detection with bounded local processing. The repository release metadata and package version are maintained through Release Please.",
        },
        {
          title: "July 2026 — Workflow foundation",
          body: "Added deterministic local tool engines, typed engine registration, workflow schema and compatibility validation, sequential workflow execution, curated built-in recipes, saved recipe storage, explicit reruns, local transfer, privacy-controlled recent activity, and recommended next actions.",
        },
        {
          title: "July 2026 — Trust and AI assistance",
          body: "Added public privacy, security, AI-data, documentation, accessibility, and changelog surfaces. BYOK AI assistance supports workflow planning, bounded error explanation, and consent-gated per-tool assistance through user-configured providers; DevHub does not host provider keys.",
        },
      ]}
    />
  );
}
