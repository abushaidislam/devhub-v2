# AI handoff

## Working branch

- `feat/markdown-preview-upgrade` — includes the v0.13.0 baseline, Markdown Preview upgrades, layout fixes, and the first batch expansion to 30 local tools.

## Stable branch state

- `main` includes automated release metadata at `v0.6.2`.
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
- Engine registry (`src/lib/engine-registry.ts`) mapping all 30 tool slugs to processing logic.
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
- `package-lock.json` is committed; `bun.lock` is also present. Reproducible installs use `npm ci` via CI.
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


## Latest UI/design-system handoff — P0/P1

### Branch and scope

The current UI foundation work is on `feat/p1-geist-components`, branched from `feat/p0-geist-foundation`. P0 introduced semantic color, radius, typography, line-height, tracking, and weight tokens in `src/app/globals.css`, plus formal `.type-*` roles and the lowercase label direction. P1 extends that foundation with reusable Geist-inspired component primitives.

### P1 completed

- Added material presets in `src/app/globals.css`: base, small, medium, large, tooltip, menu, modal, and fullscreen surfaces.
- Added `src/components/ui/button.tsx` and `button.module.css` with Button/ButtonLink variants, sizes, shapes, prefix/suffix slots, disabled behavior, loading state, and visible focus treatment.
- Added `src/components/ui/search-input.tsx` and `search-input.module.css` with shortcut, clear, Escape-to-clear, focus-within, disabled, and error states.
- Added `src/components/ui/badge.tsx` and `badge.module.css` with semantic color variants, contrast modes, sizes, and StatusDot states.
- Migrated the shared header CTA and GitHub action to ButtonLink, tool lifecycle metadata to Badge, and the tools-page search/filter surface to SearchInput and Badge.
- Updated command-palette material, metadata, result selection, and lowercase token usage.
- Added focused component coverage in `src/components/ui/__tests__/p1-components.test.tsx`.
- Updated `docs/DESIGN-SYSTEM.md` with the P1 component contracts and required states.

### Validation

- `npm run test`: **35 test files and 205 tests passed**.
- `npm run build`: **passed** after fixing the ButtonLink `prefix` prop collision; Next.js compiled, type-checked, generated 54 static pages, and finalized build traces.
- `git diff --check`: passed; only expected LF/CRLF normalization warnings remain on Windows.
- Source verification found **0 remaining `text-transform: uppercase` declarations** in the shared stylesheet and command palette.

### Review notes

The P1 files are currently modified/untracked on the feature branch because the remote commit shell timed out; the implementation itself is present and validated. Before merge, stage and commit the P1 files with a focused conventional commit, then run the repository’s documented release checks and perform desktop/mobile keyboard review for the new controls.

### Recommended next task

Review remaining ad-hoc controls in `dashboard-shell.module.css`, `smart-input-detector.module.css`, dashboard context-count pills, and dashboard card metadata. Migrate those consumers to the P1 Button, SearchInput, Badge, StatusDot, and material presets without changing product behavior or privacy claims.


## Latest P2 dashboard design-system handoff

### Branch and scope

The current dashboard migration work is on `feat/p2-dashboard-geist`, branched from the P1 component branch. This scope covers the dashboard shell, responsive drawer controls, detector panel, dashboard card grid, dashboard context count, and lowercase label cleanup.

### P2 completed

- Migrated DashboardShell mobile menu, drawer close, sidebar collapse, landing-page, and GitHub actions to the shared Button/ButtonLink primitives while preserving focus restoration and Escape-to-close behavior.
- Tokenized dashboard shell sidebar, topbar, drawer backdrop, active rows, focus outlines, and responsive touch-target states.
- Migrated SmartInputDetector local-only status to Badge plus StatusDot, sample chips and clear action to Button, confidence percentages to Badge, and panel/result materials to shared semantic tokens.
- Migrated DashboardToolGrid category metadata to Badge and the separate favorite toggle to Button without nesting interactive controls inside the card link.
- Migrated the dashboard total count to Badge and tokenized its context-row material.
- Removed all `text-transform: uppercase` declarations from the P2 dashboard shell, detector, dashboard-card, and dashboard-count styles.
- Updated `docs/DESIGN-SYSTEM.md` with the P2 workspace migration contracts and invariants.

### Validation

- `npm run test`: **35 test files and 205 tests passed**.
- `npm run build`: passed after fixing the shared Button native `prefix` prop type collision; TypeScript compiled, Next.js generated 54 static pages, and build traces finalized.
- `git diff --check`: passed with expected Windows LF/CRLF normalization warnings.
- Source audit: P2 shell, detector, dashboard card, and dashboard count styles each contain **0 uppercase-transform declarations**.

### Review notes

The P2 implementation is present on the feature branch but remains modified in the working tree because the remote commit shell timed out. No deployment or push was performed. Before merge, stage the P2 files and commit them with a focused conventional commit, then perform a visual desktop/mobile pass for the drawer, detector textarea, card favorite control, and keyboard focus rings.

### Remaining design-system consumers

The next migration wave can cover RecentWorkspace, SavedRecipeWorkspace, assistant-page sections, and remaining ad-hoc dashboard context rows. These should reuse the existing P1 Button, SearchInput, Badge, StatusDot, and material presets rather than introducing additional local primitives.


## Markdown Preview upgrade checkpoint

### Scope completed

- Expanded the local Markdown renderer in `src/lib/tool-engines.ts` with H1–H6 headings, ordered/unordered/task lists, blockquotes, tables with alignment, horizontal rules, fenced code language metadata, links, strikethrough, and accessible image-alt placeholders.
- Preserved the 200,000-character bound and raw-HTML escaping. Unsafe link schemes are rejected as links, and images are never fetched.
- Added debounced live preview, accessible Preview/HTML tabs, Copy HTML labeling, and local HTML export to `ToolRuntime`.
- Refreshed the Markdown sample to demonstrate the richer blocks and updated the tool runtime styles for responsive preview presentation.
- Added engine and component coverage for the new renderer and live-preview interaction.

### Validation

- Focused Vitest coverage passed: 2 test files, 18 tests.
- TypeScript validation passed after the runtime handler fixes.
- ESLint passed with the repository's existing six warnings and zero errors.

### Privacy boundary

Markdown remains local-only. The renderer escapes raw HTML, does not fetch remote images, does not persist input/output, and the HTML export is generated as a local Blob download.


## Latest landing CTA block checkpoint

### Scope completed

Added `src/components/landing-cta-section.tsx` and its CSS module, adapting the user-provided CTASection pattern to DevHub. The block preserves the existing black/Vercel-inspired theme, Geist typography, focus treatment, and responsive behavior. Its proof row uses canonical project data from `src/lib/tools.ts` rather than fabricated testimonials or metrics: 24 registered tools, 24 ready tools, local browser execution, and 8 categories.

The old generic landing CTA was replaced with the new centered badge, highlighted two-line heading, supporting copy, functional dashboard/tools links, and verified product-facts row. No new dependency was added because the existing Lucide icon and ButtonLink patterns already satisfy the component needs. The referenced Watermelon registry URL currently returns HTML 404 content, so the provided CTA source was implemented independently from the user attachment while keeping its intended structure.

### Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed with the repository's pre-existing warnings only.
- `npm test`: 35 test files and 207 tests passed.
- `npm run build`: passed; Next.js compiled, type-checked, generated 54 static pages, and finalized build traces.
- Local preview confirmed the original hero and landing sections remain unchanged and the new CTA block renders before the footer.

### Next recommended task

Publish the feature branch through the repository's preferred review/deployment flow after confirming the CTA copy and visual density on 390px mobile and 1440px desktop.


## Favorite icon UX fix checkpoint

### Scope completed

- Updated `src/components/ui/button.tsx` so `Button` and `ButtonLink` omit the empty content wrapper when they are icon-only controls. This keeps the flex layout centered instead of shifting the icon toward the prefix side.
- Added regression coverage in `src/components/ui/__tests__/p1-components.test.tsx` for icon-only buttons and links.

### Validation

- Focused Vitest coverage: 2 files, 8 tests passed.
- Full Vitest suite: 35 files, 208 tests passed.
- TypeScript, lint, and production build passed; lint reported only the repository's existing unused-parameter warnings.
- Playwright desktop and mobile flows: 8 passed, 2 skipped.

### Review notes

The change preserves the existing 44px favorite touch target, accessible `aria-label`, `aria-pressed` state, hover treatment, focus ring, and active state. No product behavior or persistence logic changed.

### Working branch

- `fix/favorite-icon-ux`

### Next step

Push the focused branch and open a review request when ready.


## First batch developer tools checkpoint

The first proposed batch was scoped against the canonical registry. Timestamp Converter and Text Diff already existed, so they were retained rather than duplicated. Six genuinely new local-first tools were added: YAML Formatter, XML Formatter, Markdown Linter, URL Parser, Gitignore Generator, and JSON to TypeScript.

Each new tool has a pure bounded engine, typed registry entry, sample input, metadata, safe user-facing errors, and automatic route/navigation/sitemap participation through `src/lib/tools.ts`. Smart detection now recognizes YAML, XML, common gitignore patterns, URL parsing candidates, Markdown lint candidates, and JSON-to-TypeScript candidates. Curated next-action pairings connect the new tools to existing workflows.

The new engines intentionally avoid third-party dependencies and network requests. YAML formatting is conservative around indentation, XML formatting validates a single well-formed root, Markdown linting reports bounded line-based rules, URL parsing returns structured components, gitignore generation combines deduplicated built-in templates, and JSON-to-TypeScript emits inferred interfaces/types.

Validation completed for this batch: full Vitest suite, typecheck, lint, production build, and responsive layout rules passed. Automated coverage passed 36 test files and 228 tests; lint reported only six repository warnings and zero errors. My Browser was unavailable for a fresh new-tool screenshot, so visual validation for the new routes remains the only manual follow-up; prior Markdown Preview desktop QA and the shared runtime layout checks remain valid.
