# AI handoff

## Working branch

- `feat/ai-assistance-byok` — Phase 3 AI assistance (BYOK, local-only key storage).

## Stable branch state

- `main` includes the automated v0.3.1 release and release artifact workflow.
- Production: `https://devhub-toolkit-v2.vercel.app`

## Current delivery

Phase 3: optional BYOK AI assistance.

### Completed in this delivery

- Added `src/lib/ai/provider-config.ts`: provider presets (OpenAI, OpenRouter, Ollama, custom OpenAI-compatible), validation, and browser-only `localStorage` persistence with a change event.
- Added `src/lib/ai/client.ts`: direct browser-to-provider `POST /chat/completions` request with mapped auth, credit, rate-limit, and network errors. No DevHub server is involved.
- Added `src/lib/ai/catalog.ts`: deterministic engine catalog and bounded planner/explainer prompts derived from the canonical registry.
- Added `src/lib/ai/planner.ts`: parses a model reply into a workflow proposal and validates it with `validateWorkflowCompatibility` before it is shown. Nothing executes automatically.
- Added `src/lib/ai/explain-error.ts`: sends only the tool id and a 400-character-bounded error message.
- Added `/assistant` route with provider settings, workflow planner, and error explainer; added the Assistant entry to the workspace sidebar.
- Per-action consent checkbox naming the destination model and host; consent resets after every request.
- Rewrote `/ai-data-policy` to describe the actual BYOK data flow.
- Added unit tests for config, planner, explainer, and a component test for the consent gate.

### Validation

- `npm run typecheck`, `npm run build`, and `vitest run` (32 files, 187 tests) pass.
- Lint errors present in the repository are pre-existing; the new files raise only unused-parameter warnings in tests.
- No dependency, server endpoint, upload, analytics event, or automatic execution path was added.

## Known gaps

- No URL or hosted share link exists; users exchange the bounded local JSON file directly.
- No dependency lockfile is committed.
- Imported definitions are additive and may duplicate an existing recipe.
- AI requests are not yet cancellable and are not streamed.
- Provider keys are stored unencrypted in browser local storage, as disclosed in the settings panel.

## Next recommended task

Phase 3 is implemented. Next: streaming/cancellable planner requests, an inline "explain this error" action inside the tool runtime, and Phase 4 distribution work. Keep the BYOK boundary: never ship a DevHub-hosted key and never send tool input or output to a provider.

## Durable constraints

- Transfer only definitions and bounded metadata; never runtime values.
- Keep import explicit, local, additive, and validated before storage.
- Require compatibility preflight and an explicit Run action after import.
- Do not add hosted sharing or analytics payloads for recipe definitions.
