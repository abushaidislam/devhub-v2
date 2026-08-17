# AI handoff

## Working branch

- `main` — includes the v0.5.0 release with 24 local tools, Phase 2 workflows, and Phase 3 AI assistance.

## Stable branch state

- `main` includes automated release metadata at `v0.5.0`.
- Production: `https://devhub-toolkit-v2.vercel.app`

## Current delivery

All Phases 0–3 are implemented. Phase 4 (Distribution) is planned but not started.

### Completed overall

**Phase 0 — Foundation and truth**

- Typed tool registry (`src/lib/tools.ts`) with 24 tools, 7 categories.
- Shared `ToolRuntime` client component.
- `DashboardShell` app shell with sidebar, mobile drawer, centered semantic page titles.
- Favorites localStorage store with event sync.
- Command palette (`Cmd/Ctrl + K`) with keyboard navigation.
- Responsive Vercel-inspired black/gray Geist design.
- Agent context, handoff system, and 13 documentation files under `docs/`.
- Vitest + React Testing Library + Playwright foundations; CI workflows in `.github/workflows/`.
- Public trust routes: `/privacy`, `/security`, `/ai-data-policy`, `/docs`, `/accessibility`, `/changelog`.

**Phase 1 — Habit and retention**

- Real opt-in local history in versioned IndexedDB (`devhub-history`, schema v1, 50-entry cap).
- `/recent` workspace with history toggle, clear-data control, and search.
- Workspace import/export (`src/lib/workspace-transfer.ts`): `format: "devhub-workspace"`, version 1, contains favorite slugs only, declares `containsUserInputs: false`.
- Deterministic smart input detector (`src/lib/detection.ts`) with 100,000-char cap, 8 detection rules, human-readable reasons, single-use in-memory handoff (`src/lib/detection-handoff.ts`).
- Deterministic recommended next actions engine (`src/lib/next-actions.ts`).
- Hand-written service worker (`public/sw.js`) with versioned precache contract in `src/lib/pwa.ts`; `/offline` fallback; PWA manifest.
- Allowlisted payload-free analytics (`src/lib/analytics.ts`) → Vercel Analytics in production builds only.

**Phase 2 — Workflow differentiation**

- Typed `ToolEngine` interface (`src/lib/engine-types.ts`) with `ToolValueType = "text" | "json" | "binary" | "image"`, sensitivity `local | network | ai`.
- Engine registry (`src/lib/engine-registry.ts`) mapping all 24 tool slugs to processing logic.
- Versioned workflow schema (`Workflow = { version: 1; steps[] }`), 1–50 step limit.
- `validateWorkflow` and `validateWorkflowCompatibility` preflight.
- Sequential `runWorkflow` runner with per-step metadata, warnings, duration, `AbortSignal` cancellation.
- 4 curated frozen built-in recipes in `src/lib/workflows/built-in-recipes.ts` (Base64→URL, URL→Base64, Markdown→SHA-256, SQL→SHA-256).
- Saved recipe workspace (IndexedDB `devhub-recipes`, schema v1, 50 records) with schema + compatibility preflight on write.
- `/recipes` page with CRUD, load/empty/error/unavailable states, and expandable explicit re-run panel (`RecipeRunnerPanel`).
- Bounded local recipe transfer (`src/lib/workflows/transfer.ts`): `format: "devhub-recipe"`, version 1, 32 KB size cap, payload-free, local download + file import only (no hosted share service).

**Phase 3 — AI assistance (BYOK, browser-only)**

- Provider config (`src/lib/ai/provider-config.ts`): presets for OpenAI, OpenRouter, Ollama, and custom OpenAI-compatible endpoints; browser `localStorage` persistence only; change event.
- Direct browser-to-provider chat completion client (`src/lib/ai/client.ts`): mapped auth/credit/rate-limit/network errors, no DevHub server involved.
- Deterministic engine catalog + planner/explainer prompts (`src/lib/ai/catalog.ts`) derived from the canonical registry.
- Workflow planner (`src/lib/ai/planner.ts`): parses model reply into a workflow proposal → runs `validateWorkflowCompatibility` before show → never auto-executes.
- Error explainer (`src/lib/ai/explain-error.ts`): sends only tool id + 400-char-bounded engine error message.
- Inline per-tool AI assist (`src/lib/ai/assist-tool.ts` + `src/components/tool-ai-assist.tsx`): sends bounded 1200-char input snippet + optional error, only after explicit per-request consent naming the destination model/host.
- `/assistant` route with provider settings panel, workflow planner, and error explainer; Assistant entry in the shared workspace sidebar.
- Rewrote `/ai-data-policy` to describe the BYOK data flow, browser-only key storage, and per-action consent model.
- Unit tests for config, client, catalog, planner, explainer, and assist; component tests for consent gate, assistant settings, and tool-runtime assist panel.

### New tools added since the 12-tool baseline

13. Timestamp Converter (Unix ↔ ISO dates)
14. Case Converter (camel/snake/kebab/title)
15. Slug Generator
16. Text Diff (line-by-line compare)
17. Text Statistics (chars/words/lines/reading time)
18. JSON to CSV
19. CSV to JSON
20. JSON to YAML
21. Number Base Converter (dec/hex/oct/bin)
22. HTML Entities Encode/Decode
23. Query String Parser
24. Password Generator (Web Crypto randomness)

### Validation

- `npm run typecheck`, `npm run build`, and `npm run test` pass.
- No dependency, server endpoint, upload, or hosted share service was added.
- AI requests originate directly from the user's browser to the endpoint they configured.
- Provider keys are stored unencrypted in browser `localStorage`, as disclosed in the settings panel and `/ai-data-policy`.

## Known gaps

- AI requests are not yet cancellable mid-flight and are not streamed.
- No URL or hosted share link exists; recipe exchange uses the bounded local JSON file.
- `npm.lock` is committed; `bun.lock` is also present. Reproducible installs use `npm ci` via CI.
- Imported recipes are additive and may duplicate an existing recipe; import does not auto-deduplicate names.

## Next recommended task

Phase 3 is implemented. Recommended next work in order:

1. Add streaming + cancellable planner/assist requests with visible progress and `AbortController`.
2. Inline "explain this error" action already wired inside `ToolRuntime` via `ToolAiAssist` — add one-click "generate a workflow from the current tool result" as an explicit, consent-gated action.
3. Phase 4 distribution validation: confirm repeat-usage retention evidence before building the browser extension, VS Code extension, or CLI.
4. Lift test coverage thresholds once new-tool and AI-assist tests are stabilized; add more Playwright coverage for `/recipes` and `/assistant` flows.

Keep the BYOK boundary: never ship a DevHub-hosted key and never send full tool input or output to a provider without the explicit per-action consent checkbox and destination disclosure.

## Durable constraints

- Transfer only definitions and bounded metadata; never runtime values.
- Keep import explicit, local, additive, and validated before storage.
- Require compatibility preflight and an explicit Run action after import.
- Do not add hosted sharing or analytics payloads for recipe definitions.
- `src/lib/tools.ts` is the canonical tool inventory; never create a parallel list.
