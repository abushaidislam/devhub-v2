# App routes — agent instructions

Read `../../AGENTS.md`, `../../docs/ARCHITECTURE.md`, `../../docs/TRUST-AND-PRIVACY.md`, and `../../docs/SEO-AND-LLM-DISCOVERY.md` before changing routes.

## Rules

- Route pages are Server Components by default.
- Move browser-only behavior into focused Client Components.
- Every public route needs accurate metadata and a canonical URL.
- Add canonical discoverable public routes to the sitemap when appropriate.
- Application-state and user-specific routes should normally be `noindex,follow` and excluded from the sitemap.
- Preserve semantic heading order and responsive landmarks.
- Route copy must not make privacy, security, AI, usage, or performance claims that code cannot verify.
- Dynamic tool pages derive from `src/lib/tools.ts`; do not create a parallel route inventory.
- Application routes use the shared `DashboardShell`.
- Keep `/llms.txt` and `/llms-full.txt` generated from the canonical tool registry.

## Route completion checklist

- Metadata and canonical
- Sitemap/robots/indexing decision
- Structured-data decision
- Server/client boundary
- Empty/loading/error/not-found behavior
- Mobile and keyboard verification
- Trust disclosure when data flow changes
- LLM context accuracy when product boundaries change
- Architecture and handoff documentation update
