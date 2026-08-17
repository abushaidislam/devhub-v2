# Architecture

## Stack

- Next.js 15 App Router
- React 19
- Strict TypeScript
- Geist and Geist Mono through `next/font`
- CSS Modules plus global product tokens
- Lucide icons
- QR generation through `qrcode`
- Vercel Analytics

## Route model

| Route | Responsibility | Indexing |
| --- | --- | --- |
| `/` | Marketing landing page | Index |
| `/dashboard` | All Tools workspace and local smart detection | Noindex; canonical `/tools` |
| `/favorites` | Favorite-only local workspace | Noindex |
| `/recent` | Opt-in local tool-visit activity | Noindex |
| `/recipes` | Local saved workflow definitions | Noindex |
| `/tools` | Canonical public tool directory | Index |
| `/tools/[slug]` | Interactive and canonical tool workspace | Index |
| `/categories/[slug]` | Category discovery page | Index |
| `/offline` | Service-worker offline fallback | Noindex |
| `/llms.txt` | Concise machine-readable product context | Text discovery |
| `/llms-full.txt` | Expanded machine-readable context | Text discovery |
| `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest` | SEO and install surfaces | Infrastructure |

`src/lib/tools.ts` drives tool routes, category derivation, metadata, sitemap entries, dashboard cards, command search, sidebar navigation, and LLM discovery output.

## Runtime flow

```text
src/lib/tools.ts (identity)
  + src/lib/engine-registry.ts (typed processing registry)
  → ToolRuntime(slug, name)
  → registered ToolEngine.run(ToolValue, options)
  → ToolResult { output, meta, warnings }
```

## Detection flow

```text
Ephemeral dashboard input
  → detectInput(input) in src/lib/detection.ts
  → bounded ordered Detection[] { slug, confidence, reason }
  → resolve display identity from src/lib/tools.ts
  → user explicitly opens a suggested tool
  → optional single-use in-memory handoff to the opened tool
```

Detection is synchronous, deterministic, local-only, capped at 100,000 characters, and never stores or transmits the sample. Explicit opens may hand the sample to the target tool through `src/lib/detection-handoff.ts`; the handoff is consumed once and never written to persistent storage or a URL.

## Server/client boundaries

Server by default:

- Route pages
- Metadata and JSON-LD
- Static tool/category discovery
- SEO and LLM text endpoints

Client only when needed:

- Dashboard sidebar interactions
- Smart detector input state
- Command palette
- Favorites
- Opt-in recent history and IndexedDB
- Saved recipe workspace and IndexedDB
- Tool and workflow runtime input/output state
- Clipboard, Web Crypto, localStorage, and QR generation
- Service worker registration

Do not convert a route to a Client Component merely to support one interactive child.

## Application shell

`DashboardShell` owns:

- Desktop sidebar visibility
- Mobile drawer state
- Command-palette visibility
- Active route/tool navigation
- Favorite counts and markers
- Semantic page title centered in the topbar
- Opt-in tool-visit recording trigger
- Centered content container

Do not create a second application shell for workflows, recents, settings, or future pages. `/recipes` composes its client workspace inside the shared shell. The `/offline` fallback remains the one deliberate standalone exception.

## Install and offline

```text
src/app/manifest.ts → installable identity
public/sw.js → hand-written versioned app-shell service worker
src/components/service-worker-registration.tsx → production registration
src/lib/pwa.ts → precache contract enforced by tests
```

- Core app routes, including `/recipes`, are precached; navigations remain network-first with cache and offline fallback.
- Only same-origin GET requests are handled.
- Cache Storage contains pages and static assets only — never tool inputs, outputs, favorites, recipes, or history.

## State and storage

Current:

- Favorites key: `devhub:favorites`
- Favorites change event: `devhub:favorites:changed`
- History preference key: `devhub:history-enabled`
- History database: `devhub-history`, schema version `1`, object store `entries`
- History change event: `devhub:history:changed`
- History record: `{ id, slug, visitedAt }`, capped at 50 newest entries
- Recipe database: `devhub-recipes`, schema version `1`, object store `recipes`
- Recipe change event: `devhub:saved-recipes:changed`
- Recipe record: name, description, initial value type, optional built-in source ID, versioned workflow steps/options, ID, and timestamps; capped at 50 records
- Command trigger event: `devhub:command`
- Detector samples and all workflow runtime values: React/module memory only
- Cache Storage: pages and static assets only

Recipe create/update validates the versioned workflow and full-chain compatibility before writing. Invalid stored records are ignored on read. Storage failures return safe failure results and do not fall back to a less appropriate storage mechanism. Neither recipe nor history storage includes tool/workflow input or output.

Target:

- localStorage: UI preferences, small flags, favorite IDs
- IndexedDB: versioned workflows and action history
- URL: explicitly shared non-sensitive recipe definitions
- Cloud: not required for the free core; any future sync must be encrypted and opt-in

Sensitive inputs must not be persisted by default.

## Workflow architecture

```text
ToolEngine accepts / produces / sensitivity
        ↓
Versioned Workflow definition
        ↓
Schema + compatibility validators
        ↓
Sequential in-memory runner
        ↓
Per-step result, warning, timing, and disclosure
        ↓
Bounded saved definition workspace (runtime values excluded)
```

Current modules:

```text
src/lib/workflows/types.ts
src/lib/workflows/validator.ts
src/lib/workflows/compatibility.ts
src/lib/workflows/runner.ts
src/lib/workflows/built-in-recipes.ts
src/lib/workflows/storage.ts
src/lib/workflows/use-saved-recipes.ts
```

## Performance rules

- Keep deterministic operations client-side.
- Bound detection and transformation input.
- Use Web Workers for CPU-heavy or large-file transformations.
- Dynamically import heavy optional libraries.
- Do not ship AI SDKs to routes that do not need them.
- Preserve static generation for tool and LLM routes where possible.
- Avoid storing large data URLs in React state longer than needed.

## Security boundaries

- Render user HTML only after robust sanitization; escaping is the current minimum.
- JWT decode does not imply signature verification.
- Hashing is not password hashing.
- Regex execution uses input and complexity guards but is not a formal ReDoS proof.
- Detection confidence is a heuristic, not validation or a security claim.
- AI/network operations require explicit per-action consent and provider disclosure.
