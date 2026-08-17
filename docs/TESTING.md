# Testing and release quality

## Installed stack

- Vitest — unit and component runner
- React Testing Library — accessible component interaction
- Testing Library user-event and jest-dom
- jsdom — browser-like component environment
- Playwright — Chromium desktop and mobile E2E
- V8 coverage — unit/component coverage reports

All selected packages use permissive licenses.

## Commands

```bash
npm run test
npm run test:watch
npm run test:coverage
npm run test:e2e
npm run test:e2e:ui
npm run typecheck
npm run lint
npm run build
npm run check
npm run release:validate
npm pack --dry-run --ignore-scripts
```

`prebuild` runs `context:check` and the Vitest suite, so a Vercel production/preview build cannot pass when the repository context contract or unit/component tests fail. `npm run check` runs typecheck, lint, then the production build and its prebuild gate.

`release:validate` checks package and Release Please metadata without publishing. CI also runs `npm pack --dry-run --ignore-scripts` so every pull request proves the release artifact can be assembled before a tag exists.

Playwright browsers must be installed once in a fresh local/CI environment:

```bash
npx playwright install chromium
```

## Current automated coverage

Engine tests cover all 12 current engine paths, including validation and security boundaries for Base64/JWT, Markdown, and Regex processing.

Component and storage tests cover favorites, command navigation, tool execution, local history, deterministic detection, workflow compatibility, and saved recipe behavior.

Playwright covers the landing-to-tool flow, favorites persistence, command navigation, desktop sidebar behavior, and mobile drawer navigation.

## Coverage thresholds

The configured initial thresholds are:

- Lines: 70%
- Functions: 70%
- Branches: 60%
- Statements: 70%

Increase thresholds only with stable additional coverage; never reduce them merely to make a PR pass without documenting why.

## Manual visual QA

Minimum viewports:

- 1440×900 desktop
- 1024×768 tablet
- 390×844 mobile

Check no horizontal overflow, clipped actions, focus loss, inaccessible controls, or regressions in empty/error/loading states.

## Release gate

A change must not merge if:

- Context check, release metadata validation, package dry run, tests, typecheck, lint, or build fails.
- A visible control is nonfunctional.
- A local/privacy claim is inaccurate.
- New behavior lacks proportionate tests.
- Mobile or keyboard access regresses.
- Documentation and handoff are stale.

For tagged-release behavior, verify the tag, generated notes, source archives, and attached `.tgz` file described in `RELEASE-RUNBOOK.md`.
