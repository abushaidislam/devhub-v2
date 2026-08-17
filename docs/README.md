# Documentation map

These documents are the durable source of truth for people and AI agents. Read only the documents routed to the task, then verify current code.

| Document | Purpose |
| --- | --- |
| `../AGENTS.md` | Mandatory agent workflow and repository invariants |
| `ARCHITECTURE.md` | Current routes, components, data flow, state, and storage |
| `DESIGN-SYSTEM.md` | Visual tokens, typography, sidebar geometry, and interaction rules |
| `TOOL-CONTRACT.md` | Tool registry, engine, runtime, validation, and future pipeline contract |
| `PRODUCT-STRATEGY.md` | Positioning, differentiation, retention loop, and AI role |
| `TRUST-AND-PRIVACY.md` | Local-processing claims, AI consent, storage, and public trust requirements |
| `RECIPE-TRANSFER.md` | Versioned payload-free saved-recipe export/import contract |
| `SEO-AND-LLM-DISCOVERY.md` | Canonicals, indexing, sitemap, structured data, and LLM text routes |
| `TESTING.md` | Quality gates, unit/component/E2E expectations, and release checklist |
| `RELEASE-RUNBOOK.md` | Semantic versioning, changelog automation, release permissions, artifacts, and rollback |
| `DECISIONS.md` | Accepted architectural and product decisions |
| `ROADMAP.md` | Ordered delivery plan and explicit non-goals |
| `AI-HANDOFF.md` | Current project checkpoint for the next agent |

## Maintenance rule

When code changes a documented behavior, update the relevant document in the same pull request. When a major decision changes, append a new decision record; do not silently rewrite history.
