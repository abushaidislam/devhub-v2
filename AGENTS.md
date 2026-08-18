# DevHub Toolkit — Agent Operating Manual

This file is the primary instruction source for AI agents working in this repository. Repository files, tests, and current code override chat history and assumptions.

## Product doctrine

DevHub is a **free, local-first developer workflow workspace**. It should become useful through reliable transformations, smart detection, reusable workflows, privacy, and speed—not through a large count of shallow tools.

Current product principles:

1. Keep deterministic processing in the browser whenever technically possible.
2. Never claim an operation is local if data leaves the browser.
3. AI is optional workflow assistance, not a collection of generic wrapper pages.
4. Preserve the typed tool registry and shared runtime architecture.
5. Prefer deeper workflows over adding unrelated tools.
6. Keep the core product free. Hosted AI must use BYOK, a local model, or explicit cost controls.
7. Do not copy GPL source from `it-tools` or other competitors. Independently implement behavior.
8. Accessibility, keyboard support, privacy disclosure, and mobile behavior are release requirements.

## Current verified state

- Next.js 15 App Router, React 19, strict TypeScript.
- 24 registered local-first tools in `src/lib/tools.ts`.
- Tool logic in `src/lib/tool-engines.ts`.
- Shared client runtime in `src/components/tool-runtime.tsx`.
- Vercel-inspired app shell in `src/components/dashboard-shell.tsx` with centered semantic page titles.
- Favorites persist locally through `src/lib/use-favorites.ts`.
- `/dashboard` is the flat All Tools workspace with deterministic smart input detection.
- `/favorites` is a dedicated favorites workspace.
- `/recent` is an opt-in local activity workspace. It stores at most 50 tool slugs and visit timestamps in IndexedDB; it never stores tool input/output.
- `src/lib/detection.ts` detects JSON, JWT, URL, Base64, SQL, cron, six-digit HEX, and Markdown without persistence or network calls.
- Command palette supports search and keyboard navigation.
- Workflow chaining, saved recipes, recommended next actions, and BYOK AI assistance are implemented; browser extension, VS Code extension, and CLI distribution remain planned.

## Mandatory startup sequence

Before changing code:

1. Read this file.
2. Read `docs/README.md` and every document routed to the task.
3. Inspect the current implementation and `package.json`; do not rely on stale summaries.
4. State the intended scope and identify affected invariants.
5. Reuse existing patterns before creating new abstractions.

## Documentation routing

| Task | Required reading |
| --- | --- |
| Architecture, routes, state, storage | `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` |
| UI, typography, sidebar, responsive behavior | `docs/DESIGN-SYSTEM.md` |
| Tool engines, registry, runtime | `docs/TOOL-CONTRACT.md`, `src/lib/AGENTS.md` |
| Product direction, AI, workflows, roadmap | `docs/PRODUCT-STRATEGY.md`, `docs/ROADMAP.md` |
| Privacy, AI data, claims, analytics | `docs/TRUST-AND-PRIVACY.md` |
| Tests and release validation | `docs/TESTING.md` |
| Route or SEO changes | `src/app/AGENTS.md`, `docs/ARCHITECTURE.md` |
| Component changes | `src/components/AGENTS.md`, `docs/DESIGN-SYSTEM.md` |
| Continuing previous agent work | `docs/AI-HANDOFF.md` |

## Architecture invariants

- `src/lib/tools.ts` is the source of truth for tool identity, route slug, name, description, category, icon, status, and featured state.
- A tool slug must be unique and stable.
- UI components must not contain reusable processing logic.
- Tool engines must not depend on React or browser DOM rendering.
- Detection rules must be deterministic, bounded, React-independent, local-only, non-persistent, and return human-readable reasons.
- Server Components are the default. Add `"use client"` only for browser state, events, storage, or browser APIs.
- Do not duplicate dashboard shells, tool registries, favorites stores, or command-palette state.
- Do not silently remove route, metadata, accessibility, or responsive behavior.
- `localStorage` is acceptable for small preferences and favorites; workflows/history use versioned IndexedDB storage.
- History remains opt-in, stores metadata only, is bounded, and must fail closed when browser storage is unavailable.
- Never store sensitive tool input by default.

## Required agent workflow

1. **Inspect** — read routed docs and current files.
2. **Plan** — define scope, files, risks, and validation.
3. **Implement** — make a small, focused change on a feature branch.
4. **Validate** — run formatting, typecheck, lint, tests, build, and relevant visual/keyboard checks.
5. **Document** — update docs when behavior, architecture, contracts, or decisions change.
6. **Handoff** — update `docs/AI-HANDOFF.md` with completed work, validation, risks, and next task.
7. **Review** — use the pull-request template and merge only after quality gates pass.

## Definition of done

A task is not complete until:

- Requirements and edge cases are implemented.
- TypeScript has no errors.
- Lint and production build pass.
- Tests are added or updated for behavior changes.
- Desktop, mobile, keyboard, focus, empty, loading, and error states are checked where relevant.
- Privacy copy matches actual data flow.
- Registry, metadata, sitemap, and docs are updated when relevant.
- No dead controls or decorative fake functionality remain.
- `docs/AI-HANDOFF.md` reflects the new repository state.

## Prohibited shortcuts

- Do not add fake testimonials, release history, metrics, or security claims.
- Do not call a feature AI-powered without a real provider and documented data path.
- Do not label all tools local if an individual tool uses a network service.
- Do not add a dependency before checking whether platform APIs or current dependencies solve the problem.
- Do not add new tools only to increase tool count.
- Do not copy competitor source or visual assets.
- Do not declare production readiness without running the documented checks.

## Branch and commit policy

- Branch names: `feat/...`, `fix/...`, `docs/...`, `chore/...`.
- Keep commits focused and written in imperative conventional style.
- Do not mix product features, broad refactors, and visual redesigns in one PR.
- Prefer a PR into `main`; do not stack branches unless the dependency is explicit.
- Update the handoff before requesting review.
