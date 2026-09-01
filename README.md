# DevHub Toolkit v2

A free, local-first developer workflow workspace for recurring API-debugging and data-transformation tasks. DevHub helps you detect, transform, chain, and reuse common developer-data operations without sending conventional tool inputs to a DevHub server.

**Current release:** <!-- x-release-please-version --> `v0.15.0`

**License:** MIT

**Homepage:** [devlove.flinkeo.online](https://devlove.flinkeo.online)

## What DevHub does

DevHub is built for the work between the work: inspecting JSON and JWTs, decoding Base64 and URLs, formatting SQL, comparing text, converting data, generating hashes or passwords, and turning repeatable transformations into local workflow recipes.

The core deterministic tools run in the browser. Favorites use local browser storage, opt-in recent activity and saved recipe definitions use bounded IndexedDB storage, and runtime tool inputs and outputs are not persisted by default. Optional AI assistance is BYOK: requests go directly from the browser to the provider configured by the user and require per-action consent before selected content is sent.

## Current features

- **24 local-first developer tools** with one shared interactive runtime.
- **Smart input detection** for JSON, JWT, URL, Base64, SQL, cron, six-digit HEX, and Markdown samples. Detection is deterministic, bounded, ephemeral, and local-only.
- **Typed engine registry** with explicit input/output value types and processing boundaries.
- **Workflow compatibility validation** before a chain runs, including type checks and per-step diagnostics.
- **Sequential workflow runner** with step results, warnings, timing, safe failures, and cooperative cancellation.
- **Saved local recipes** stored as validated, versioned definitions in IndexedDB; runtime payloads are excluded.
- **Built-in recipes, recommended next actions, favorites, opt-in recent activity, and local import/export.**
- **PWA and offline app-shell support** with a service worker that caches pages and static assets, never tool payloads.
- **BYOK AI assistance** for workflow planning, error explanation, and bounded per-tool assistance through OpenAI, OpenRouter, Google Gemini, Ollama, or a custom OpenAI-compatible endpoint.
- **Keyboard-first navigation** with command search, responsive desktop/mobile layouts, accessibility and privacy documentation, sitemap, robots, manifest, and machine-readable `llms.txt` routes.

## Implemented tools

All tools below are registered in [`src/lib/tools.ts`](./src/lib/tools.ts) and connected to processing engines through [`src/lib/engine-registry.ts`](./src/lib/engine-registry.ts).

| Category | Tools |
| --- | --- |
| **Converters** | Base64, URL Encoder, Timestamp Converter, JSON to CSV, CSV to JSON, JSON to YAML, Number Base Converter |
| **Formatters** | JSON Formatter, SQL Formatter |
| **Security** | JWT Decoder, Hash Generator, Password Generator |
| **Generators** | UUID Generator, QR Generator |
| **Text** | Regex Tester, Case Converter, Slug Generator, Text Diff, Text Statistics, HTML Entities, Query String Parser |
| **Design** | Color Converter |
| **Editors** | Markdown Preview |
| **Reference** | Cron Parser |

### Tool details

1. **JSON Formatter** — format, validate, and inspect JSON.
2. **Base64** — encode and decode text locally.
3. **JWT Decoder** — inspect token headers and payloads locally; signature verification is not implied.
4. **UUID Generator** — generate UUIDs in bulk.
5. **Regex Tester** — test expressions with live match details.
6. **QR Generator** — generate PNG QR codes locally.
7. **Color Converter** — convert HEX, RGB, and HSL colors.
8. **Markdown Preview** — preview Markdown beside its rendered output.
9. **Hash Generator** — generate SHA hashes with Web Crypto.
10. **SQL Formatter** — format common SQL statements.
11. **Cron Parser** — describe five-field cron expressions.
12. **URL Encoder** — encode and decode URL components.
13. **Timestamp Converter** — convert Unix timestamps and ISO dates.
14. **Case Converter** — convert between camel, snake, kebab, and title case.
15. **Slug Generator** — turn headings or text into URL slugs.
16. **Text Diff** — compare text versions line by line.
17. **Text Statistics** — count characters, words, lines, and reading time.
18. **JSON to CSV** — convert a JSON array of objects to CSV rows.
19. **CSV to JSON** — convert CSV with a header row to structured JSON.
20. **JSON to YAML** — render JSON as readable YAML.
21. **Number Base Converter** — convert decimal, hexadecimal, octal, and binary values.
22. **HTML Entities** — encode and decode HTML entities.
23. **Query String Parser** — parse URL query strings into structured parameters.
24. **Password Generator** — generate strong passwords with Web Crypto randomness.

## Workflow and storage model

The workflow system uses a versioned definition containing ordered engine IDs and JSON-safe options. Before execution, DevHub validates the schema, the initial input type, and compatibility between adjacent engines. Each step reports its input/output type, local/network/AI boundary, warnings, and duration.

Saved recipes contain metadata and validated workflow definitions only. They do not contain runtime input, runtime output, clipboard content, or execution results. Recipe import/export is local, explicit, bounded, and payload-free. Recent activity is opt-in and stores only tool slugs and timestamps.

## AI assistance and data disclosure

DevHub does not host an AI key. Users configure their own provider, model, endpoint, and key in the browser. Supported presets include OpenAI, OpenRouter, Google Gemini, Ollama, and custom OpenAI-compatible endpoints. Hosted-provider requests go directly from the browser to the selected provider; Ollama can target a model running on the user's machine.

AI workflow planning never auto-executes a proposed workflow. Error explanation sends only the bounded tool identifier and error message. Inline tool assistance is bounded and requires a per-request consent action that names the destination provider or host. Provider configuration is stored in this browser's local storage as documented in [`/ai-data-policy`](https://devlove.flinkeo.online/ai-data-policy).

## Routes and workspaces

- `/` — marketing landing page.
- `/tools` — canonical public tool directory.
- `/tools/[slug]` — canonical interactive tool workspaces.
- `/categories/[slug]` — category discovery pages.
- `/dashboard` — All Tools workspace with smart input detection.
- `/favorites` — local favorites workspace.
- `/recent` — opt-in local recent-activity workspace.
- `/recipes` — saved local recipe workspace with explicit reruns.
- `/assistant` — BYOK workflow planner and error explainer.
- `/offline` — offline fallback page.
- `/privacy`, `/security`, `/ai-data-policy`, `/docs`, `/accessibility`, `/changelog` — public trust and documentation surfaces.
- `/llms.txt` and `/llms-full.txt` — machine-readable product context.

## Stack

- Next.js 15 App Router and React 19.
- Strict TypeScript.
- Geist and Geist Mono through `next/font`.
- CSS Modules with global product tokens.
- Lucide icons and QR generation through `qrcode`.
- Server Components by default; client components only where browser state, events, storage, or browser APIs are required.
- Vercel Analytics with an allowlisted, payload-free event model in production builds.

## Start locally

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_SITE_URL` to the production origin before deploying.

## Quality gates

Run the focused checks during development:

```bash
npm run context:check
npm run release:validate
npm run typecheck
npm run lint
npm run test
npm run build
```

Run the standard repository check:

```bash
npm run check
```

The Playwright browser suite is available separately:

```bash
npx playwright install --with-deps chromium
npm run test:e2e
```

## Repository architecture

- `src/app` — routes, metadata, SEO, public trust pages, workspaces, and tool pages.
- `src/components` — shared shell, command palette, cards, favorites, workflow UI, and tool runtime.
- `src/lib/tools.ts` — canonical tool identity registry.
- `src/lib/tool-engines.ts` — pure deterministic transformation functions.
- `src/lib/engine-registry.ts` — typed mapping from tool identity to executable engine.
- `src/lib/detection.ts` — bounded, deterministic smart input detection.
- `src/lib/workflows` — versioned workflow types, validation, compatibility, runner, recipes, storage, and transfer.
- `src/lib/ai` — BYOK provider configuration, browser client, planner, error explanation, and bounded tool assistance.
- `public/sw.js` and `src/lib/pwa.ts` — versioned offline app-shell behavior.
- `docs` — architecture, design, product strategy, trust, testing, roadmap, release, and handoff documentation.

## Working with AI agents

Start with [`AGENTS.md`](./AGENTS.md), then follow the routing in [`docs/README.md`](./docs/README.md). The repository documents current state, architectural invariants, quality gates, known gaps, and the next recommended task so agents do not depend on chat history.

## Product boundaries

DevHub keeps the deterministic core free and local-first. It does not claim that JWT decoding verifies signatures, that hashing is password hashing, or that an AI request is local when it is sent to a hosted provider. Sensitive inputs are not persisted by default, and analytics must never include raw tool inputs or outputs.

The current distribution phase is intentionally limited. Browser extension, VS Code extension, and CLI integrations remain separate follow-up work that should be validated against repeat usage before implementation.

## License

The package is published under the MIT license as declared in `package.json`.

## Links

- [Production homepage](https://devlove.flinkeo.online)
- [GitHub repository](https://github.com/abushaidislam/devhub-v2)
- [Issue tracker](https://github.com/abushaidislam/devhub-v2/issues)
- [Product strategy](./docs/PRODUCT-STRATEGY.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Trust and privacy](./docs/TRUST-AND-PRIVACY.md)
- [Roadmap](./docs/ROADMAP.md)
- [Changelog](./CHANGELOG.md)
