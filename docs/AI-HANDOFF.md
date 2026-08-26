# AI handoff

## Working branch

- `main` — includes the v0.6.2 release with 24 local tools, Phase 2 workflows, and Phase 3 AI assistance.

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


## Global dropdown styling checkpoint

### Scope completed

Created the focused `feat/global-dropdown-style` branch and updated both native dropdown consumers: the runtime operation selector in `src/components/tool-runtime.tsx` and the AI error tool selector in `src/components/error-explainer.tsx`. Both now use a polished dark control treatment with a custom chevron, semantic surface/border/text tokens, selected-option color, visible focus ring, hover and disabled states, native keyboard behavior, and 44px mobile sizing. The shared `--select-selected` token and dropdown contract were added to `src/app/globals.css` and `docs/DESIGN-SYSTEM.md`.

### Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed with the repository’s existing six warnings and zero errors.
- `npm test`: 36 test files and 210 tests passed.
- `npm run build`: passed; Next.js compiled, type-checked, generated 54 static pages, and finalized build traces.
- `git diff --check`: passed.
- Desktop browser review of `/tools/hash-generator`: closed and open native dropdown states are aligned, readable, dark-themed, and show the selected SHA-256 option with a blue highlight.

### Review notes

The change is visual and behavior-preserving; no new dependency, processing logic, network call, or persistence behavior was added. The native option menu remains browser-rendered, so exact option-menu rendering may vary slightly by browser while the closed control and accessibility behavior remain consistent.

### Next step

Review and push `feat/global-dropdown-style` through the normal pull-request flow when ready.


## Dropdown cascade fix checkpoint

### Scope completed

Refined `feat/global-dropdown-style` after reproducing a repeated-chevron issue in Chromium. The runtime module no longer applies legacy `.toolbar select` rules to the native dropdown, preventing the higher-specificity cascade from overriding the control geometry. Both the runtime operation selector and the Assistant error-tool selector now render one wrapper-based CSS chevron instead of a `background-image`, while keeping their context-local layout and native `<select>` behavior.

The design-system wording now documents the context-local approach and the browser-specific option-menu limitation rather than implying a global selector. Temporary visual-review notes were used during QA and should remain untracked.

### Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed with the repository’s existing six warnings and zero errors.
- `npm test`: 36 test files and 210 tests passed.
- `npm run build`: passed; Next.js generated 54 static pages.
- `npm run test:e2e`: 8 passed and 2 skipped across Chromium desktop and mobile projects after installing the missing Playwright browser binary.
- Browser review: runtime dropdown shows one clean chevron and a readable native option menu; Assistant Tool dropdown shows the same single-chevron treatment within its own full-width form layout.

### Review notes

An initial Assistant preview failure was unrelated to the UI change: running the development server concurrently with `next build` raced on `.next` build-manifest files. The preview was restarted cleanly on a separate port for verification.


## Premium dropdown polish checkpoint

### Scope completed

Refined the context-local dropdown styles in `src/components/tool-runtime.module.css` and `src/components/workflow-planner.module.css`. Runtime and Assistant dropdowns now use a restrained dark vertical gradient, inset highlight, shallow depth shadow, brighter hover border and chevron, tactile active state, layered keyboard focus halo, dark native-menu hint via `color-scheme: dark`, and muted disabled chevron behavior. The Assistant disabled-chevron selector was kept scoped to the wrapper pseudo-element.

Updated `docs/DESIGN-SYSTEM.md` with the premium hover, active, focus, and disabled-state contract. No global dropdown selector, dependency, processing behavior, or persistence behavior was added.

### Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed with the repository’s existing six warnings and zero errors.
- `npm test`: 36 test files and 210 tests passed.
- `npm run build`: passed; Next.js generated 54 static pages.
- Live preview on `/tools/base64`: dark gradient, inset/depth shadow, single chevron, and native option menu verified.
- Programmatic focus check: `:focus-visible` active with white outline, 3px offset, bright border, and layered focus shadow.
- Existing Playwright desktop/mobile validation remains green at 8 passed and 2 skipped.

## Project-wide button polish checkpoint

### Scope completed

Extended the Encode/Decode-style premium control language across the web button families without flattening hierarchy. The shared `Button`/`ButtonLink` primitive now provides dark gradient secondary controls, white gradient primary controls, variant-aware error and warning surfaces, hover lift, tactile press feedback, layered keyboard focus halos, and disabled-state treatment. Local native button families in the Assistant, provider settings, workflow planner, runtime toolbar, tool assist, workspace transfer, recent workspace, recipe runner, saved recipes, dashboard cards, smart-input detector, dashboard shell, favorite control, and command palette close action were updated to match the same system. Menu rows, switches, navigation active states, and primary CTAs retain their specialized semantics.

Updated `docs/DESIGN-SYSTEM.md` with the button tier, hover, active, focus, disabled, and primary-action contracts. No product behavior, network request, persistence, or dependency changes were made.

### Validation

- `git diff --check`: passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed with the repository’s existing six warnings and zero errors.
- `npm test`: 36 test files and 210 tests passed.
- `npm run build`: passed; Next.js generated 54 static pages.
- Live dashboard review: smart-input sample controls, card favorite actions, search controls, and shell controls show the premium dark treatment.
- Live Assistant review: primary and secondary actions preserve hierarchy; provider, workflow, and error actions render with updated surfaces and states.
- A temporary preview failure was traced to the known concurrent Next.js `.next` build-manifest race; a clean preview on a separate port rendered successfully.

## Button cascade cleanup checkpoint

Removed accidental overlap between legacy and premium button styles. Runtime toolbar and Run-button legacy visual overrides were reduced to layout-only rules, runtime error actions now have one semantic red-control owner, Assistant primary/secondary actions are consolidated into one block, duplicate dashboard shell migration blocks were removed, and the old dashboard card focus outline was removed in favor of the premium favorite focus halo. Global landing CTA classes now own their premium primary/secondary treatment without a competing flat hover rule.

Validation after cleanup: `git diff --check`, typecheck, lint, 36 test files / 210 tests, and production build all passed. The live production preview on port 3004 rendered the dashboard with consistent premium control surfaces. No product behavior or data boundary changed.

## Favorite heart icon checkpoint

### Scope completed

Replaced the filled Lucide star/heart treatment in the standalone `FavoriteButton` and dashboard card favorite controls with the reusable `src/components/ui/animated-heart.tsx` component. The default state is outline-only (`fill="none"`), the selected state uses `fill="currentColor"`, and a real favorite toggle runs a restrained Heroicons Animated-style scale sequence. The wrapper is decorative with `aria-hidden="true"`; the parent button continues to own the accessible label, `aria-pressed` state, persistence, and toggle behavior.

Added the `motion` dependency and attribution for the MIT Heroicons Animated reference. Added regression assertions for outline/filled SVG states and retained favorite persistence coverage. The empty favorites illustration remains decorative and unchanged.

### Validation

- `npm run typecheck`: passed.
- Focused favorite/dashboard tests: 4 passed.
- `npm run lint`: passed with the repository’s existing six warnings and zero errors.
- `npm run build`: passed; Next.js generated 54 static pages.
- Full E2E desktop/mobile suite: 8 passed, 2 skipped.
- Live production preview: default favorite confirmed `fill="none"`; selected favorite confirmed `fill="currentColor"`; a real click sampled at 100ms showed an active scale transform (`matrix(1.15305, 0, 0, 1.15305, 0, 0)`).
- Repository remains local-first; no favorite persistence or product behavior changed.

## Vercel frozen-lockfile repair checkpoint

Vercel was failing before compilation because `package.json` contained `motion@^13.1.1` while `pnpm-lock.yaml` did not. Regenerated the lockfile with pnpm 10.34.5, matching Vercel’s detected package-manager family; the diff adds the motion dependency graph without unrelated version churn. Added `pnpm-workspace.yaml` build approvals for `esbuild`, `sharp`, and `unrs-resolver` so non-interactive pnpm installs can run required native build scripts safely.

Validation completed with the Vercel-compatible path: `npx pnpm@10.34.5 install --frozen-lockfile` passed, production build passed with 54 generated pages, 36 unit-test files / 210 tests passed, and desktop/mobile E2E passed with 8 passed and 2 skipped. The branch remains clean after commit and push.

## Favorite active-surface correction checkpoint

The active favorite state no longer turns the entire button white. Dashboard card and tool-page favorite controls now retain the dark premium gradient, while the selected heart remains filled and white through `currentColor`. Active hover keeps the same dark surface with brighter border/depth, so the heart is the only white selected visual rather than a white icon button.

Validation: pnpm frozen install, typecheck, focused favorite/dashboard tests (4 passed), lint, unit suite (36 files / 210 tests), and production build (54 pages) passed. Live dashboard verification confirmed selected background `linear-gradient(rgb(24, 24, 24), rgb(16, 16, 16))`, white control color, `fill="currentColor"`, and the same dark surface on hover.
## Project-wide UI audit checkpoint
Audited all 41 application routes represented by the route inventory, including the landing page, workspace pages, category pages, all generated tool pages, assistant, recipes, recent, favorites, and policy/documentation pages at 1280×900 desktop and 412×915 mobile sizes. The final machine audit covered 82 route/viewport combinations: all returned HTTP 200, no page errors, no document-level horizontal overflow, no visible interactive element outside the viewport, no empty buttons, no genuinely unnamed form controls, and no non-decorative images missing alt text. Visual contact-sheet review found the shared shell, public reading pages, dashboard cards, assistant sections, and stacked mobile tool editor layouts consistent.

Two real issues were fixed during the audit. The closed mobile navigation drawer is now inert and `aria-hidden` while off-canvas, preventing keyboard focus from reaching hidden links while preserving open/close focus return. The tools index no longer shows a dead Filter button with no handler; the category filters remain visible and now wrap on narrow screens instead of extending beyond the viewport.

Validation after the audit fixes: typecheck passed; lint passed with the repository’s existing warnings and zero errors; full unit suite passed with 36 files / 210 tests; production build passed and generated 54 pages; existing desktop/mobile E2E passed with 8 passed and 2 skipped; focused mobile navigation check confirmed correct focus return to `Open navigation`; final route audit reported 0 genuine issue rows.
