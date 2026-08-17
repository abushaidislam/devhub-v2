# DevHub Toolkit v2

A free, local-first developer workflow workspace built with Next.js App Router, strict TypeScript, and a restrained Vercel-inspired design system.

## Product direction

DevHub helps developers detect, transform, and eventually automate recurring API-debugging and data-transformation tasks without sending conventional tool inputs away from the browser.

The product currently includes 12 independently implemented local-first tools, a shared interactive runtime, command search, All Tools and Favorites workspaces, and persistent local favorites. The next differentiation milestones are real history, smart input detection, typed tool chaining, and saved workflow recipes.

## Stack

- Next.js 15 and React 19
- Strict TypeScript
- Geist and Geist Mono
- Server Components by default
- CSS Modules and product tokens
- Vercel Analytics with no tool payload collection
- Route metadata, sitemap, robots, manifest, and dynamic social image

## Start

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_SITE_URL` to the production origin before deploying.

## Quality gate

```bash
npm run context:check
npm run typecheck
npm run lint
npm run build
```

Or run the complete gate:

```bash
npm run check
```

## Architecture

- `src/app` — routes, metadata, SEO, All Tools, Favorites, and tool workspaces
- `src/components` — shared shell, command palette, cards, favorites, and tool runtime
- `src/lib/tools.ts` — canonical typed tool registry
- `src/lib/tool-engines.ts` — independent deterministic engines
- `src/lib/use-favorites.ts` — local favorite state
- `docs` — architecture, product, trust, testing, roadmap, and handoff sources

## Working with AI agents

Start with [`AGENTS.md`](./AGENTS.md), then follow the routing in [`docs/README.md`](./docs/README.md). The repository documents current state, stable decisions, quality gates, known gaps, and the next recommended task so agents do not depend on chat history.

## Product rules

- Keep the core free and local-first.
- Prefer workflow depth and retention over increasing tool count.
- Use AI as optional workflow assistance with explicit data disclosure.
- Never copy competitor implementation source.
- Never claim privacy, security, performance, or customer evidence that is not verified.

See [`docs/PRODUCT-STRATEGY.md`](./docs/PRODUCT-STRATEGY.md) and [`docs/ROADMAP.md`](./docs/ROADMAP.md).
