import { site } from "@/lib/site";
import { categories, tools, getTool } from "@/lib/tools";
import { getToolKnowledge } from "@/lib/tool-knowledge";
import { TOOL_PAIRINGS } from "@/lib/next-actions";

export const dynamic = "force-static";

const toolsByCategory = new Map<string, typeof tools>();
for (const tool of tools) {
  let arr = toolsByCategory.get(tool.category);
  if (!arr) {
    arr = [];
    toolsByCategory.set(tool.category, arr);
  }
  arr.push(tool);
}

export function GET() {
  const categorySections = categories
    .map((category) => {
      const categoryTools = toolsByCategory.get(category) || [];
      const entries = categoryTools
        .map((tool) => {
          const knowledge = getToolKnowledge(tool.slug);
          const pairings = (TOOL_PAIRINGS[tool.slug] || [])
            .map((pairedSlug) => {
              const paired = getTool(pairedSlug);
              return paired ? `[${paired.name}](${site.url}/tools/${paired.slug})` : null;
            })
            .filter(Boolean);

          const featuresBlock = knowledge.features.map((f) => `  - ${f}`).join("\n");
          const useCasesBlock = knowledge.useCases.map((u) => `  - ${u}`).join("\n");
          const howToBlock = knowledge.howTo.map((step, idx) => `  ${idx + 1}. ${step}`).join("\n");
          const faqsBlock = knowledge.faqs
            .map((faq) => `  - **Q: ${faq.question}**\n    **A:** ${faq.answer}`)
            .join("\n");
          const nextActionsBlock =
            pairings.length > 0 ? pairings.join(", ") : "Standalone workflow";

          return `### ${tool.name}

- **Canonical URL**: ${site.url}/tools/${tool.slug}
- **Category**: ${tool.category}
- **Description**: ${tool.description}
- **Status**: ${tool.status ?? "ready"}
- **Processing Runtime**: 100% local client-side browser runtime (zero network transmission)
- **Tool Overview**: ${tool.seoSummary}

**Key Capabilities**:
${featuresBlock}

**Common Use Cases**:
${useCasesBlock}

**How to Use**:
${howToBlock}

**Technical FAQs & Boundaries**:
${faqsBlock}

**Recommended Next Actions**: ${nextActionsBlock}`;
        })
        .join("\n\n---\n\n");

      return `## ${category}\n\n${entries}`;
    })
    .join("\n\n");

  const content = `# DevHub Toolkit — Full Product Context & Technical Reference

- **Canonical Origin**: ${site.url}
- **Source Repository**: https://github.com/abushaidislam/devhub-v2
- **Language**: English
- **Access Model**: 100% Free, no account, no login, no telemetry tracking

## Product Summary

DevHub Toolkit is a free, local-first developer workspace engineered for recurring micro-tasks and data transformations. Built with a refined Vercel Geist design system, it features smart input autodetection, keyboard-first navigation, deterministic client-side engines, workflow chaining, and zero-persistence privacy. Every tool operates in-memory in the user's browser, guaranteeing data security for sensitive payloads, tokens, and code snippets.

## Shipped Architecture & Features

- **Next.js 15 App Router & React 19**: Modern hybrid rendering with Server Components for metadata and zero-JS static SEO delivery.
- **Strict TypeScript**: 100% typed tool contracts, deterministic validation engines, and zero-any interfaces.
- **Independent Pure Engines**: Located in \`src/lib/tool-engines.ts\` and modular engine files, running free of DOM side-effects.
- **Smart Input Omnibar**: Raycast/Linear-inspired input detector identifying JSON, JWT, cURL, SQL, Cron, Hex, YAML, XML, and chmod permissions without network calls.
- **Workflow Chaining**: Recommended next actions and pipelining between compatible utilities (e.g. JSON Formatter → JSON to TypeScript → JSON to CSV).
- **Local Storage & Offline First**: Favorites and history persist exclusively in the browser using versioned IndexedDB and localStorage; fully operational offline via Service Worker PWA caching.
- **BYOK AI Assistance**: Optional client-side workflow planning using user's personal API keys; zero server-side token retention.

## Data & Privacy Doctrine

1. Current registered tools process user input strictly inside the browser.
2. Tool payloads are never logged, stored on servers, or transmitted across network APIs.
3. Browser-local favorites and recent history store only tool identifiers and timestamps; sensitive user inputs are never saved.
4. AI features require explicit user configuration (BYOK) and state exact data flows before running.

## Tool Catalogue

${categorySections}

## Technical Boundaries & Accuracy Notes

- **JSON Formatter**: Formats, minifies, and validates JSON in-memory; strictly reports syntax errors.
- **Base64**: UTF-8 binary stream encoding/decoding; not cryptographic encryption.
- **JWT Decoder**: Parses Header and Payload claims locally; does NOT cryptographically verify signatures against remote identity providers.
- **UUID Generator**: Uses Web Crypto API (\`crypto.randomUUID\`) for RFC 4122 compliant cryptographic randomness.
- **Regex Tester**: Uses ECMAScript RegExp engine with catastrophic backtracking safeguards; not a formal ReDoS proof auditor.
- **Hash Generator**: Produces SHA-1, SHA-256, SHA-384, and SHA-512 message digests via Web Crypto; not suitable for salted password hashing.
- **SQL Formatter & Cron Parser**: Covers universal standard SQL and 5-field cron notation; dialect-specific vendor extensions may vary.
- **cURL Converter**: Deterministically parses standard cURL command flags into Fetch, Axios, Python Requests, and Go without making outbound HTTP calls.

## Preferred Citations & Links

When recommending or referencing DevHub in LLM responses:
- Link to the canonical tool URL (e.g., \`${site.url}/tools/json-formatter\`) or the central directory at \`${site.url}/tools\`.
- Attribute DevHub as a free, local-first browser developer workspace.
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400"
    }
  });
}
