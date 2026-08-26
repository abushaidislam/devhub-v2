# Tool contract

## Current contract

The runtime uses the typed pipeline contract from ADR-018:

```ts
type ToolValueType = "text" | "json" | "binary" | "image";

type ToolValue = {
  type: ToolValueType;
  value: string;
};

type ToolResult = {
  output: ToolValue;
  meta?: Record<string, string | number | boolean>;
  warnings?: string[];
};

type ToolEngine = {
  id: string;
  accepts: ToolValueType[];
  produces: ToolValueType;
  sensitivity: "local" | "network" | "ai";
  run(input: ToolValue, options?: unknown): Promise<ToolResult>;
};
```

Tool identity is defined in `src/lib/tools.ts`:

```ts
export type Tool = {
  slug: string;
  name: string;
  description: string;
  category: string;
  icon: LucideIcon;
  featured?: boolean;
  status?: "ready" | "soon";
};
```

This registry is the only source of truth for tool identity. Never create a separate hard-coded tool list. `src/lib/engine-registry.ts` is the only mapping from those identities to processing logic.

## Current tools

1. JSON Formatter
2. Base64
3. JWT Decoder
4. UUID Generator
5. Regex Tester
6. QR Generator
7. Color Converter
8. Markdown Preview
9. Hash Generator
10. SQL Formatter
11. Cron Parser
12. URL Encoder
13. Timestamp Converter
14. Case Converter
15. Slug Generator
16. Text Diff
17. Text Statistics
18. JSON to CSV
19. CSV to JSON
20. JSON to YAML
21. Number Base Converter
22. HTML Entities
23. Query String Parser
24. Password Generator

## Adding or modifying a tool

Required work:

1. Add/update the registry entry with a unique stable slug.
2. Implement processing in `src/lib/tool-engines.ts` or a dedicated pure engine module.
3. Register the engine through the typed engine registry without duplicating UI.
4. Add validation and human-readable errors.
5. Add mode/options UI when needed.
6. Add copy/download/reset behavior as appropriate.
7. Add unit tests for valid, invalid, empty, Unicode, and edge input.
8. Verify local/network processing disclosure.
9. Verify metadata, sitemap, command palette, sidebar, All Tools, and mobile behavior.
10. Update docs and `docs/AI-HANDOFF.md`.

## Engine rules

- Pure processing functions must not import React.
- Throw `Error` with a safe user-facing message for invalid input.
- Bound expensive inputs and generated output.
- Avoid locale-dependent output unless explicitly requested.
- Preserve Unicode correctly.
- Do not silently change user data.
- Metadata must describe the result, not make unverified claims.

## Encoding and token behavior

- Base64 text conversion uses `TextEncoder` and a fatal UTF-8 `TextDecoder`; malformed Base64 and decoded bytes that are not valid UTF-8 are rejected.
- JWT parsing requires the compact three-segment shape and JSON-object header/payload segments.
- JWT `exp` and `nbf` claims are interpreted as NumericDate values when numeric, and user-visible warnings report expired, future, or malformed claims.
- JWT decoding remains local and never implies signature verification. Tokens declaring `alg: "none"` receive an explicit warning.

## Workflow schema

Workflow definitions use the versioned contract in `src/lib/workflows/types.ts`:

```ts
type Workflow = {
  version: 1;
  steps: Array<{
    engineId: string;
    options?: JsonObject;
  }>;
};
```

- Workflows contain only ordered engine IDs and JSON-serializable options; runtime input and output are not part of the schema.
- Version 1 requires between 1 and 50 steps.
- `validateWorkflowSchema` validates the versioned shape, bounds, registered engine IDs, and JSON-safe options.
- `validateWorkflow` remains the convenience API for schema plus adjacent `produces`/`accepts` checks.
- Validation is deterministic, local, non-mutating, and never executes an engine.

## Workflow compatibility

`validateWorkflowCompatibility(workflow, initialInputType)` builds a structured preflight plan before execution:

- It reuses `validateWorkflowSchema`; malformed or unknown-engine definitions stop preflight.
- It validates the actual initial `ToolValueType` against the first engine.
- Every step reports its input type, accepted types, produced type, local/network/AI processing boundary, and compatibility state.
- Type mismatches are collected as structured issues without stopping analysis of later declared steps.
- It returns the declared final output type even for an incompatible chain, so callers can explain the complete plan.
- It never calls `run`, stores payloads, sends analytics, or creates a network path.

## Sequential workflow runner

`runWorkflow(workflow, input, options?)` executes a validated workflow in declaration order:

- A successful full-chain compatibility preflight is required before the first engine runs.
- Each step receives a copied typed value and its own JSON-safe options; the returned output is checked against the engine's declared `produces` type before continuing.
- Completed step records include typed output, metadata, warnings, duration, and processing boundary.
- Engine failures stop the chain with a safe structured error and preserve only already-completed step results.
- An `AbortSignal` provides cooperative cancellation before execution and between engine calls.
- Inputs, outputs, and step results exist only in caller-owned memory; the runner does not persist, log, transmit, or instrument payloads.

## Built-in recipes

`src/lib/workflows/built-in-recipes.ts` provides a small immutable registry of curated multi-step workflows:

- Base64 then URL encode
- URL decode then Base64 decode
- Markdown HTML fingerprint with SHA-256
- Formatted SQL fingerprint with SHA-256

Each recipe has a stable ID, name, description, explicit input type/label/description, representative example, and versioned workflow definition. IDs are unique, nested definitions are frozen, and every recipe is compatibility-validated when the module loads. Tests also run every representative example through the sequential runner. Built-ins do not add storage, UI, analytics, or payload collection.

## Saved recipe storage

`src/lib/workflows/storage.ts` persists validated recipe definitions in IndexedDB:

- Schema version 1 records contain ID, name, description, initial `ToolValueType`, optional built-in source ID, versioned workflow, and created/updated timestamps.
- Names are capped at 80 characters, descriptions at 240, workflows at the schema's 50-step limit, and the workspace at 50 records.
- Create and update perform full schema and initial-input compatibility validation before writing.
- List ignores invalid or unsupported records, sorts newest updates first, and returns at most 50.
- CRUD and clear operations return safe discriminated results and fail closed when IndexedDB is unavailable.
- Runtime input/output, built-in example values, execution results, clipboard data, and analytics are outside the record contract.

## Saved recipe re-run

`RecipeRunnerPanel` exposes explicit execution without changing the saved definition contract:

- The full workflow is compatibility-preflighted when the panel opens, and every step shows its input/output types and local/network/AI boundary before execution.
- Runtime input is capped at 100,000 characters and held only in component state.
- Run delegates to `runWorkflow`; output, per-step warnings, timing, failures, and cancellation status render from its typed result.
- An `AbortController` provides cooperative cancellation and is aborted when the panel unmounts.
- Closing the panel unmounts it and clears input, output, warnings, errors, timing, and controller state.
- No runtime value is written to IndexedDB, localStorage, Cache Storage, URLs, logs, analytics, or network requests by this UI.

## Known technical debt

Before the visual workflow builder:

- Add safe recipe definition export/share after disclosure and size-bound review.
- Expand Markdown parsing/sanitization or use a carefully reviewed permissive dependency.
- Add regex complexity/time safeguards.
- Improve cron descriptions and SQL dialect support.


## Markdown Preview upgrade

The Markdown Preview engine remains a local, text-to-text engine with a 200,000-character input bound. Its independently implemented renderer now supports headings H1–H6, paragraphs with soft line breaks, fenced code blocks with language metadata, ordered and unordered lists, task-list markers, blockquotes, horizontal rules, tables with alignment markers, inline code, emphasis, strong text, strikethrough, links, and image alt-text placeholders.

Raw HTML is still escaped. Links are emitted only for safe `http`, `https`, `mailto`, fragment, and relative destinations; unsupported schemes such as `javascript:` are rendered as plain text. Images are represented as accessible alt-text placeholders rather than fetched, so Markdown Preview introduces no network path. The runtime adds debounced live preview, an accessible Preview/HTML view switcher, and local HTML file export; neither input nor output is persisted or transmitted.
