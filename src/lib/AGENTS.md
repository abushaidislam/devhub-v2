# Library and engines — agent instructions

Read `../../AGENTS.md`, `../../docs/TOOL-CONTRACT.md`, and `../../docs/TRUST-AND-PRIVACY.md` before changing this directory.

## Rules

- `tools.ts` is the canonical tool registry.
- Slugs are stable IDs and must remain unique.
- Engine modules must be independent of React.
- Prefer pure deterministic functions with explicit inputs and outputs.
- Use Web Crypto and standard browser APIs where suitable.
- Validate and bound input before expensive processing.
- Preserve Unicode and document encoding behavior.
- Throw safe, actionable `Error` messages for invalid input.
- Do not claim verification, security, or privacy properties beyond implementation.
- Do not add a dependency before checking license, maintenance, bundle cost, and platform alternatives.
- Competitor code is research evidence, not an implementation source.

## Tool change checklist

- Registry
- Engine
- Runtime connection
- Validation/errors
- Tests
- Processing classification
- Metadata/navigation/sitemap
- Documentation/handoff

Before implementing workflows, migrate engines to the target typed registry described in `docs/TOOL-CONTRACT.md` with tests.
