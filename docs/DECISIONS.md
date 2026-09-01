# Decision records

Do not rewrite accepted decisions to hide history. Append a superseding decision when direction changes.

## ADR-001 — Next.js App Router

**Status:** Accepted  
Use Next.js App Router with Server Components by default and small Client Components for interaction.

## ADR-002 — Typed tool registry

**Status:** Accepted  
`src/lib/tools.ts` is the canonical tool inventory and route source. Names are display values; slugs are stable identity.

## ADR-003 — Local-first deterministic processing

**Status:** Accepted  
Conventional tools execute in the browser. Network and AI tools require explicit classification and disclosure.

## ADR-004 — Shared runtime and shell

**Status:** Accepted  
Dynamic tool routes reuse `ToolRuntime`; application pages reuse `DashboardShell`. Duplicated per-tool pages or dashboards are not allowed.

## ADR-005 — Favorites storage

**Status:** Accepted  
Favorites store only tool slugs in localStorage under `devhub:favorites` and synchronize through `devhub:favorites:changed`.

## ADR-006 — Vercel-inspired, not copied

**Status:** Accepted  
Use a restrained black/gray Geist design language and familiar application hierarchy without copying proprietary assets or product-specific interface content.

## ADR-007 — Independent implementation

**Status:** Accepted  
Competitors may inform capability and workflow research. GPL implementation source must not be copied into this repository.

## ADR-008 — Free core product

**Status:** Accepted  
Core tools and local workflows remain free. AI must be sustainable through BYOK, local models, or explicit cost controls. Ads are not part of the product strategy.

## ADR-009 — Workflow before catalogue expansion

**Status:** Accepted  
The next differentiation milestone is smart detection, real history, tool chaining, and saved recipes—not a larger shallow tool count.

## ADR-010 — Privacy-safe measurement

**Status:** Accepted  
Measure feature adoption and retention without collecting tool payloads, clipboard data, secrets, or generated content.

## ADR-011 — Opt-in bounded local history

**Status:** Accepted  
Recent history defaults off, stores only tool slug and visit timestamp in versioned IndexedDB, retains the 50 newest records, and provides a clear-data control. Storage failures fail closed; inputs and outputs are outside the schema.

## ADR-012 — Deterministic ephemeral detection

**Status:** Accepted  
Smart detection uses bounded local heuristics with ranked reasons. Samples exist only in React memory and are never persisted, placed in URLs, sent to analytics, or transmitted. Detection suggests a tool; it does not silently execute or transfer input.

## ADR-013 — Explicit in-memory detection handoff

**Status:** Accepted  
When a user explicitly opens a detector suggestion, the current sample may be handed to that tool through a single-use in-memory module store (`src/lib/detection-handoff.ts`). The handoff never touches localStorage, IndexedDB, URLs, logs, analytics, or the network; it survives only client-side navigation within the current session and is consumed exactly once by the matching tool. Detection still never executes or transfers input without an explicit user action, so ADR-012 remains in force.

## ADR-014 — Versioned local workspace export

**Status:** Accepted  
Favorites can be exported to and imported from a local JSON file with `format: "devhub-workspace"` and an explicit schema version. The file contains tool slugs and export metadata only and declares `containsUserInputs: false`; tool inputs, outputs, and history entries are never exported. Imports are size-bounded, validated, filtered to known slugs, deduplicated, and merged additively — an import never silently deletes existing favorites. The transfer is entirely local: no upload, download service, or network path.

## ADR-015 — Deterministic local recommendations

**Status:** Accepted  
Recommended next actions are computed by a React-independent engine (`src/lib/next-actions.ts`) from a curated registry pairing map plus, when present, this browser's favorites and opt-in history slugs. Ranking priority is fixed: current-tool pairings, recent-activity pairings, saved favorites, then featured registry order. Signals are validated against the registry, deduplicated, and bounded. Recommendations are computed in memory on render: nothing new is persisted, no tool input or output is read, and nothing is transmitted or model-generated. Every recommendation shows a human-readable reason.

## ADR-016 — Hand-written app-shell service worker

**Status:** Accepted  
PWA install and offline behavior use a hand-written service worker (`public/sw.js`) with a versioned cache and no build plugin or new dependency. The worker precaches the app shell — core routes, all canonical tool pages, the `/offline` fallback, and static icons — from a contract defined in `src/lib/pwa.ts` and enforced by tests. Navigations are network-first with a cache-then-offline-fallback chain; hashed static assets are cache-first. Only same-origin GET requests are handled. Cache Storage holds pages and static assets only: tool inputs, outputs, favorites, and history are never written to it, and the worker adds no network path beyond the requests the page already makes. Registration happens in production builds only through `src/components/service-worker-registration.tsx`.

## ADR-017 — Allowlisted activation events

**Status:** Accepted  
Activation and retention measurement (ADR-010) is implemented through `src/lib/analytics.ts` with a fixed allowlist of event names: tool opened, tool run succeeded, tool run failed, favorite added, favorite removed, and command palette opened. The only property an event may carry is a tool slug validated against the registry; unknown names, unknown slugs, and any extra fields are dropped by a pure sanitizer before sending, so raw input, output, URLs, clipboard content, detector samples, and history contents are structurally excluded. Events are transmitted to Vercel Analytics in production builds only — development and test builds send nothing — and transmission failures are swallowed without affecting the tool.

## ADR-018 — Typed engine registry and value types

**Status:** Accepted  
The tool runtime (Phase 2) is built on a typed `ToolEngine` interface defined in `src/lib/engine-types.ts`. Every engine declares an `id` (matching the tool slug), the `ToolValueType` values it `accepts` and `produces`, a `sensitivity` level (`local` | `network` | `ai`), and an async `run(input, options?)` method. All 24 tools are registered in `src/lib/engine-registry.ts`, which replaces the slug `if/else` chain in `ToolRuntime` with a single `getEngine(slug).run(input, options)` call. The registry is the only mapping from slug to processing logic; the tool registry (`tools.ts`) remains the only mapping from slug to identity and metadata. Value types (`text`, `json`, `binary`, `image`) enable a future workflow runner to validate step compatibility before execution. Pure engine functions in `tool-engines.ts` are preserved as the underlying implementation and continue to be tested directly.

## ADR-019 — Versioned workflow definitions

**Status:** Accepted  
Local workflow definitions use schema version `1` and contain an ordered list of one to 50 steps. Each step stores only a registered engine ID and optional JSON-serializable options; runtime user input and engine output are deliberately outside the schema. `validateWorkflow` is deterministic, non-mutating, and local: it rejects unsupported versions, malformed or oversized definitions, unknown engines, unsafe options, and adjacent engine type mismatches before any engine executes. The initial input type, execution results, persistence, and sharing remain separate concerns for later Phase 2 deliveries.

## ADR-020 — Structured workflow compatibility preflight

**Status:** Accepted  
Workflow execution must be preceded by a deterministic local compatibility preflight. `validateWorkflowCompatibility` reuses the versioned schema validator, validates the actual initial `ToolValueType`, and returns ordered per-step diagnostics containing input type, accepted types, produced type, processing boundary, and compatibility. It collects all declared-chain mismatches without running engines. Preflight does not store or transmit payloads, emit analytics, or create a network path; future runners must reject incompatible plans before execution.

## ADR-021 — Sequential in-memory workflow execution

**Status:** Accepted  
`runWorkflow` executes only after a successful full-chain compatibility preflight and runs registered engines in declaration order. Typed outputs are copied into the next step, checked against each engine's declared contract, and returned with per-step metadata, warnings, duration, and processing boundary. Execution stops on the first error or cooperative cancellation; completed results remain in caller-owned memory. The runner does not persist, log, transmit, or instrument workflow payloads, and current cancellation occurs before or between engine calls rather than interrupting a synchronous engine mid-call.

## ADR-022 — Curated immutable built-in recipes

**Status:** Accepted  
Built-in recipes are a small curated registry of independently defined, versioned multi-step workflows rather than a broad catalogue. Every recipe has a stable ID, clear user-facing metadata, an explicit initial value type, and a representative example. Definitions are compatibility-validated at module load, deeply frozen, and exercised through the sequential runner in tests. The registry stores definitions and non-sensitive examples only; it adds no persistence, telemetry, user payload retention, or network behavior.

## ADR-023 — Bounded payload-free saved recipe workspace

**Status:** Accepted  
Saved recipes use a separate version-1 IndexedDB database capped at 50 records. Records contain bounded user-facing metadata, an initial value type, optional built-in source identity, versioned engine steps/options, and timestamps only. Create/update fail before writing unless schema and full-chain compatibility pass; invalid stored records are ignored. Runtime input/output, examples, results, clipboard content, and analytics remain outside the storage contract. The noindex `/recipes` workspace provides explicit save, delete, clear, loading, empty, unavailable, and error states inside the shared application shell.

## ADR-024 — Explicit ephemeral saved recipe re-run

**Status:** Accepted  
Saved recipe execution is an explicit, compatibility-gated action in an expandable workspace panel. The panel shows every declared step type and processing boundary before execution, caps runtime input at 100,000 characters, delegates to the existing sequential runner, and supports cooperative cancellation. Input, output, per-step results, warnings, errors, timing, and controller state exist only while the panel is mounted; closing it clears all runtime state. Re-run adds no persistence, URL payload, export, logging, analytics, cache write, or new network path.

## ADR-025 — Geist light canvas (Vercel analysis)

**Status:** Accepted (supersedes the black-canvas reading of ADR-006)  
Visual language follows `referances/DESIGN-vercel (1).md`: near-white canvas (`#fafafa`), ink (`#171717`), hairline borders (`#ebebeb`), marketing pill CTAs vs 6px app controls, and a hero-only mesh gradient. Proprietary Vercel assets and product copy are still not copied (ADR-006 remainder). The product remains independently implemented.
