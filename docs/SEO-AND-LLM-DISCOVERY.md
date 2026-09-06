# SEO and LLM discovery

## Canonical indexable surfaces

- `/` — product landing page
- `/tools` — canonical public tool directory
- `/categories/[slug]` — category discovery pages
- `/tools/[slug]` — canonical individual tool pages

Application state surfaces are intentionally excluded from search indexing:

- `/dashboard` uses `/tools` as canonical and is `noindex,follow`.
- `/favorites` is local user state and is `noindex,follow`.

Do not add application-state pages to the sitemap.

## Metadata requirements

Every indexable route needs:

- Unique title
- Accurate description
- Canonical URL
- Open Graph title, description, and URL where appropriate
- Semantic H1
- Internal navigation from an indexable page

Root metadata defines the title template, default robots policy, Open Graph defaults, Twitter card, icons, and large preview permissions.

## Sitemap and robots

The sitemap includes only canonical HTML discovery pages. Do not set `lastModified` to the current request time; omit it unless an accurate content modification time exists.

`robots.txt` allows public crawling, declares the sitemap, and identifies the canonical host. Use page-level `noindex` for crawlable application-state pages so crawlers can read the directive.

## Structured data

Root layout emits:

- `WebSite`
- `WebApplication`

Individual tool pages emit:

- `SoftwareApplication` — application identity, category, and pricing ($0 / free).
- `BreadcrumbList` — hierarchically scoped breadcrumbs (`Home > Tools > Category > Tool Name`).
- `FAQPage` — dynamic question-and-answer pairs sourced from `src/lib/tool-knowledge.ts` for Google rich snippet eligibility and LLM citation clarity.

JSON-LD must reflect shipped behavior and must not claim reviews, ratings, downloads, AI, security, or pricing evidence that does not exist.

## LLM discovery files

Canonical paths:

- `/llms.txt` — concise product summary, categories, and canonical tool links.
- `/llms-full.txt` — expanded product architecture, privacy doctrine, and deep per-tool context (canonical URLs, 100% client-side execution boundaries, key capabilities, developer use cases, step-by-step instructions, technical FAQs, and recommended tool chaining).

The files are generated dynamically from `src/lib/tools.ts` and `src/lib/tool-knowledge.ts`, so tool inventory is never manually duplicated. They use `text/plain; charset=utf-8` and are statically pre-rendered (`export const dynamic = "force-static"`).

Important: `llms.txt` is an emerging convention, not a guaranteed ranking factor or universal crawler standard. It supplements—but never replaces—semantic HTML, metadata, structured data, sitemap, robots, documentation, and authoritative content.

## Accuracy rules

- Describe roadmap features as planned, not shipped.
- State JWT and hashing limitations.
- Do not describe all processing as local after a network or AI tool is introduced.
- Update both LLM route handlers when architecture or privacy boundaries materially change.
- Keep canonical origin controlled by `NEXT_PUBLIC_SITE_URL` through `src/lib/site.ts`.

## Validation

After SEO changes verify:

```text
/
/robots.txt
/sitemap.xml
/manifest.webmanifest
/opengraph-image
/llms.txt
/llms-full.txt
```

Also inspect rendered canonical, robots, Open Graph, Twitter, JSON-LD, status code, and content type for representative landing, category, tool, dashboard, and favorites routes.
