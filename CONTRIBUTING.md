# Contributing to DevHub Toolkit

## Before starting

1. Read `AGENTS.md`.
2. Follow the documentation routing in `docs/README.md`.
3. Inspect current code and open work before proposing an abstraction.
4. Use a focused branch from the latest `main`.

## Local setup

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_SITE_URL` to the intended origin when validating metadata and production behavior.

## Branches

Use:

- `feat/<name>` for product behavior
- `fix/<name>` for defects
- `docs/<name>` for documentation
- `chore/<name>` for tooling and maintenance

## Quality gate

```bash
npm run context:check
npm run typecheck
npm run lint
npm run build
```

When tests are added, include the relevant unit/component/E2E commands. A visible feature is not complete until mobile and keyboard behavior are checked.

## Adding a tool

Follow `docs/TOOL-CONTRACT.md`. New tools must be independently implemented, local-first when possible, validated, tested, documented, and connected through the canonical registry and shared runtime.

## Product boundaries

- Prefer workflows and depth over tool-count growth.
- Keep core functionality free.
- Use AI only when it improves a workflow and has an explicit data boundary.
- Never collect raw tool payloads in analytics.
- Never publish fabricated dates, metrics, security claims, or testimonials.

## Pull requests

Use the repository template. Keep PRs focused, include validation evidence, update documentation, and finish the handoff checkpoint.
