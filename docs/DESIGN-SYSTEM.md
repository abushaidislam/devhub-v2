# Design system

DevHub uses a restrained Geist application language drawn from `referances/DESIGN-vercel (1).md`. The goal is a light ink-on-canvas system with hairline cards, not a pixel copy of Vercel and not a black canvas.

## Brand mark

- The product mark is the silver "D." app icon: a rounded silver square with a white "D" and a trailing dot.
- Canonical assets: `public/icon.png` (512px, any purpose), `public/icon-maskable.png` (black full-bleed safe-zone variant), `public/apple-icon.png` (180px), and `public/favicon.png` (64px). All are rendered from the master "D." artwork.
- The sidebar/header wordmark renders the icon at 18×18 next to the "DevHub" text; the Open Graph image uses a matching "D." chip.
- Do not recolor, skew, or restyle the mark. When the master artwork changes, regenerate all three SVG assets together in the same PR.

## Typography

- Sans: Geist (self-hosted via `next/font/google`, CSS variable `--font-geist`, fallback `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`)
- Monospace: Geist Mono (CSS variable `--font-geist-mono`, fallback `"SFMono-Regular", Consolas, monospace`)
- Friendly CSS variables: `--sans: var(--font-geist, Arial), sans-serif`; `--mono: var(--font-geist-mono, Menlo), monospace`
- Font-feature-settings: `"rlig" 1, "calt" 1, "ss01" 1, "ss06" 1` on body
- Body: `-webkit-font-smoothing: antialiased`, base 14–15px / 1.5
- Primary navigation: 14px / 20px, weight 500
- Active navigation: weight 600
- Category navigation: 14px / 20px, weight 500
- Nested tool navigation: 13px / 18px, weight 500
- Workspace identity: 14px / 20px, weight 600
- Metadata/counts: 10–11px, monospace, weight 500–600
- Page title: 13px / 18px, weight 600, centered in the application topbar
- Primary content titles: 12–16px, weight 600–650
- Meaningful descriptions: 11–12px, weight 450–500
- Landing hero H1: `clamp(52px, 7vw, 92px)`, line-height .98
- Landing/section H2: 36px, line-height 1.15

### Letter-spacing register (Geist Vercel/Geist register: 14px / 20px / -0.3px)

| Element | Value |
| --- | --- |
| Body text | `-0.011em` (body) / `-0.012em` (vercel-typography.css) |
| Desktop nav, buttons, search, cards, tabs, sidebar, filter, crumbs, page title | `-0.3px` |
| Hero H1 | `-0.065em` |
| Page-hero H1 | `-0.05em` |
| Section H2 | `-0.03em` / `-.035em` |
| H1 (generic) | `-0.045em` |
| H3, H4 | `-0.018em` |
| Tool card titles | `-0.005em` |
| Paragraph body | `-0.006em` |
| Uppercase monospace label/badge | `+0.05em … +0.12em` |
| kbd/code/pre/mono metadata | `0` (natural mono tracking) |

Headings H1–H4 use `text-wrap: balance`. Body uses the default. Uppercase monospace labels appear only in conjunction with explicit weight 500–700.

Do not globally increase font weight to solve contrast. Emphasis must follow information hierarchy.

## Core colors

Source: `referances/DESIGN-vercel (1).md` (Geist marketing/app analysis). The application now uses the light ink-on-canvas system, not a black canvas.

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#fafafa` | Page and workspace background |
| Elevated | `#ffffff` | Cards, inputs, menus, editors |
| Ink | `#171717` | Headings, primary CTAs, focus ring |
| Body | `#4d4d4d` | Paragraphs, nav, secondary copy |
| Mute | `#8f8f8f` | Captions, metadata |
| Faint | `#a1a1a1` | Placeholders |
| Hairline | `#ebebeb` | Cards, inputs, dividers |
| Hairline-soft | `#f2f2f2` | Hover wells and inset fills |
| Link | `#0070f3` | Links, selected options, accent |
| Cyan | `#50e3c2` | Local-processing status |
| Error | `#ee0000` | User-facing processing errors |
| Warning | `#f5a623` | Caution states |

Color is confined to the landing hero mesh gradient (cyan / blue / violet / magenta / amber) and small status accents. Do not fill chrome with accent colors.

## Dark theme

Dark mode inverts the Geist ink-on-canvas system using `data-theme="dark"` on `<html>`. Tokens live in `src/app/globals.css`; preference is stored in `localStorage` (`devhub:theme`) and defaults to the system `prefers-color-scheme` until the user toggles light or dark from the landing header or workspace topbar.

| Token | Dark value | Use |
| --- | --- | --- |
| Canvas | `#000000` | Page and workspace background |
| Elevated | `#0a0a0a` | Cards, inputs, menus, editors |
| Ink | `#ededed` | Headings, primary CTAs, focus ring |
| Body | `#a1a1a1` | Paragraphs, nav, secondary copy |
| Hairline | `#262626` | Cards, inputs, dividers |
| Hairline-soft | `#1a1a1a` | Hover wells and inset fills |
| Surface bright | `#141414` | Hover lift on elevated cards |

Primary buttons in dark mode use a white fill with black text on hover, matching Vercel's inverted CTA treatment. The hero mesh gradient remains but is toned down.

## Content hierarchy

| Token | Value | Use |
| --- | --- | --- |
| Canvas | `#000000` | Main background |
| Primary text | `#ededed` | Titles and active text |
| Strong text | `#ffffff` / `#f5f5f5` | Primary entity names and headings |
| Content text | `#b5b5b5` | Meaningful descriptions and guidance |
| Secondary text | `#a1a1a1` | Metadata and lower-priority content |
| Muted text | `#8f8f8f` | Passive counts and chrome |
| Border | `#262626` | Sidebar and structural borders |
| Content border | `#303030` | Cards, panels, and editor surfaces |
| Hover border | `#555555` | Interactive content hover |
| Hover | `#1a1a1a` | Hovered rows and controls |
| Selected | `#1f1f1f` | Active rows |
| Success | `#50e3c2` | Positive activity status and local confidence |
| Error | `#ff8a7d` | User-facing processing errors |

## Content hierarchy

Application content uses stronger contrast than passive chrome while keeping the sidebar hierarchy intact:

- Primary entity titles use `#ffffff` or `#f5f5f5` at weight 600–650.
- Descriptions use `#b5b5b5` at weight 450–500; meaningful guidance must not use dim passive gray.
- Metadata uses `#a1a1a1` at weight 500–600 and remains subordinate to titles.
- Labels may use weight 700 only when they are compact uppercase context markers.
- Dense editor data uses bright monospace text without making every label bold.
- Interactive surfaces brighten border, background, and text together on hover.
- The sidebar keeps its established navigation weights and colors; content hierarchy changes must not flatten sidebar states.

## Sidebar geometry

- Desktop width: 256px
- Workspace header: 64px
- Primary row: 40px
- Category row: 40px
- Nested tool row: 36px
- Footer: 64px
- Row radius: 5–6px
- Internal scrollbar: 4px

The first category is expanded on the All Tools workspace. On a tool page, the active category is expanded. The sidebar search was intentionally removed; topbar search and `Cmd/Ctrl + K` are the canonical search entry points.

## Application topbar

- Height: 58px with a sticky blurred canvas and bottom hairline.
- Layout is a three-column grid (`1fr / auto / 1fr`) so the semantic H1 stays centered without overlapping the crumb or actions.
- Breadcrumb/navigation controls remain left-aligned and global actions remain right-aligned.
- Search is a flex field (max 240px) that drops the `⌘K` hint below 1100px, hides the landing-page control below 780px, and collapses to a 36px icon below 620px. Touch targets grow to 44px below 480px.
- Center titles truncate rather than collide with left or right controls.
- Workspace pages must not repeat the page title as a large content H1; use a compact context row for label, description, counts, or filters.

## Main content

- Maximum content width: 1220px
- Center with `margin-inline: auto`
- Desktop horizontal padding: 44px
- Tablet horizontal padding: 22px
- Mobile horizontal padding: 16px
- Content remains centered when the sidebar collapses

## Workspace context rows

All Tools, Favorites, Recent, and individual tool pages use a compact context row below the topbar:

- Separate the row from primary content with a `#292929` bottom border.
- Context labels use `#c7c7c7`, weight 700, and the shared uppercase label style.
- Descriptions use `#b5b5b5`, weight 500, and 1.5–1.6 line height.
- Counts use a `#0d0d0d` surface, `#3a3a3a` border, and 600-weight monospace text.
- Stack label, description, and actions vertically on narrow screens instead of shrinking text.

## Controls

### Switch

Use the shared `Switch` component for binary settings instead of native checkboxes styled ad hoc.

- Track: 32 × 18px with a fully rounded radius.
- Off: `#1f1f1f` track, `#3a3a3a` border, muted thumb.
- On: `#ededed` track and dark thumb.
- The visible label and `role="switch"` accessible name must describe the setting, not the current state.
- Required states: off, on, hover, `:focus-visible`, disabled, and reduced motion.
- Clicking the control requests a state change; the parent remains the source of truth.

### Buttons and form controls

- Secondary controls use a restrained dark vertical gradient over `--surface-1`, `--border-strong`, `--text-primary`, a one-pixel inset highlight, and a shallow depth shadow.
- Hover raises the surface to a lighter dark gradient, brightens the border to approximately `#686868`, lifts by one pixel, and adds a restrained shadow; disabled controls do not receive hover treatment.
- Active/press controls use a compact scale and inset shadow to feel tactile without causing layout shift.
- Primary run and CTA actions retain a white-to-soft-white gradient, black text, a bright border, and the strongest visual hierarchy.
- Every keyboard-operable button uses a 2px white `:focus-visible` outline with a 3px offset plus an inset highlight and soft outer halo.
- Disabled controls remain visible at approximately 40–45% opacity and use a `not-allowed` cursor where applicable.
- Inputs must expose a visible `:focus-visible` or `:focus-within` boundary, not only a caret.

### Dropdowns

Native dropdowns use context-local dark control treatments so each web surface can fit its own layout while still following the same visual principles. Use the semantic `--select-selected` token for the selected option, preserve native keyboard navigation, and render a single positioned chevron outside the `<select>` background to avoid browser-specific repeated-arrow artifacts.

- Surface: a restrained dark vertical gradient over `--surface-1` with `--border-strong`, 6px radius, a one-pixel inset highlight, and a shallow shadow for depth.
- Label/value: `--text-primary`, 13px, semibold; reserve trailing space for the chevron.
- Hover: a slightly lifted dark gradient, `#686868` border, brighter chevron, and restrained shadow; do not apply hover styling when disabled.
- Active/press: `--surface-active` with an inset shadow so the control feels tactile without shifting layout.
- Focus: a 2px white outline with a 3px offset, bright border, inset highlight, and a soft outer halo; keyboard focus must remain clearly distinct from hover.
- Selected option: `--select-selected` with white text; option menus retain a dark surface where the browser allows styling.
- Disabled: approximately 45% opacity, `not-allowed` cursor, muted chevron, and no hover treatment.
- Touch target: 44px minimum height below 480px; the field must remain full-width inside stacked form labels.

## Tool cards

- Use one flat grid on All Tools; categories remain metadata and sidebar navigation.
- Three columns desktop, two tablet, one mobile.
- Default surface: elevated white, `#ebebeb` hairline, no shadow (Geist level 0).
- Hover: same white surface, `#d4d4d4` border, one-pixel lift, and `--shadow-float` (layered low-alpha stack). Do not use heavy black drop shadows.
- Active/press on the card link: lift cancelled, `--shadow-press` inset. Favorite clicks must not press the whole card.
- Keyboard focus: ink border plus a one-pixel outer ink ring; the card link must not show a competing second outline.
- Tool title: ink, weight 650.
- Description: `#4d4d4d`, weight 450, line height 1.55.
- Category metadata: `#a1a1a1`, weight 600.
- Tool icon: `#f2f2f2` well, `#ebebeb` hairline, ink glyph; hover brightens the well to white.
- Favorite remains a separate 44px interactive target with its own visible focus ring.
- Empty-state titles use strong text; empty-state guidance uses content text rather than passive gray.

## Tool runtime and editors

- Runtime container uses a `#080808` surface, `#303030` border, and subtle inset highlight.
- Toolbar supporting text uses `#9a9a9a`; local-processing status uses `#50e3c2`, uppercase monospace, weight 600.
- Panel labels use `#d0d0d0`, weight 650; counts use `#949494`, 600-weight monospace.
- Input text uses `#f0f0f0`; output text uses `#dedede` at 13px / 1.7 monospace.
- Focused editor input brightens the surface and adds an inset `#505050` boundary.
- Markdown headings use white text and weight 700; inline code uses a raised dark surface and bright text.
- Processing errors use `#ff8a7d` and must remain readable without relying on color alone.
- Runtime actions retain all hover, focus, disabled, and mobile overflow states.
- Input and output/preview panes use a draggable vertical splitter on desktop. The input pane is constrained to 25–75% of the available width; pointer dragging, Arrow/Home/End keyboard controls, and double-click reset to an equal split are supported. The splitter has a visible focus treatment and is hidden below 780px, where the panes stack vertically.

## Detector panel

- Header mark is a 32px hairline well (`#f2f2f2` fill, `#ebebeb` border, ink glyph). Do not leave a dark `#111` chip on the light canvas.
- Keyboard hint `kbd` chips use the hairline-soft well, not a dark inset.
- Suggestion rows and sample chips follow the same hover/press contract as tool cards: hairline → float shadow + 1px lift → press inset.
- Use one bounded textarea with an explicit accessible label and character count.
- Display a visible local-only disclosure before input.
- Resolve suggestion identity and icons from the canonical tool registry.
- Pair every confidence percentage with a human-readable detection reason.
- The complete suggestion row is the navigation target and must have hover and visible keyboard-focus states.
- Empty and no-match states must be explicit.
- Collapse the two-column suggestion layout to one column below 680px.
- Example input chips use the secondary control surface with visible focus rings and comfortable targets.
- `/` focuses the detector when the user is not typing in another field; Escape clears; Ctrl/Cmd+Enter opens the top suggestion; clearing returns focus to the textarea.
- Keyboard hints render as compact monospace `kbd` chips and may be hidden below 680px.
- Oversized input is trimmed with a visible warning in the error color paired with explicit text.
- Detection reasons, counts, placeholder, and empty states use content and secondary text tokens (`#b5b5b5` / `#a1a1a1` / `#8f8f8f`), not passive dim gray.
- Screen readers receive a concise match-count status; suggestion cards are not re-announced on every keystroke.

## Command palette

- Dialog uses a `#0b0b0b` surface, `#484848` border, and strong modal shadow.
- Search input uses white text, weight 500, with an `#888888` placeholder.
- Result titles use `#f5f5f5`, weight 650; descriptions use `#9a9a9a`, weight 500.
- Selected results use a `#1a1a1a` surface and `#505050` border.
- Hover and selection are distinct but both preserve strong text contrast.
- Keyboard focus uses a two-pixel inset white outline so it stays visible inside the modal.
- Keyboard hints use 600-weight monospace and remain readable at compact sizes.

## Activity rows

Use deployment-inspired activity rows for chronological local history:

- Container surface uses `#070707` with a `#303030` border.
- Keep each event as one compact 58px row.
- Lead with entity icon and white 650-weight title, followed by status, action pill, identifier, and relative time.
- Descriptive row text uses `#b5b5b5`; identifiers use `#d0d0d0` monospace; time uses `#a1a1a1`.
- A green dot communicates successful local activity, but always pair it with visible status text.
- Hover raises the row to `#111111`; keyboard focus uses a two-pixel inset white outline.
- Hide lower-priority columns progressively on tablet and mobile; never hide the title or time.
- Search fields use `#3a3a3a` borders and brighten to a white boundary on focus-within.

## Focus system

- Every keyboard-operable control requires a visible focus indicator.
- Default focus treatment is a two-pixel white outline with a two- or three-pixel offset.
- Full-row links and modal results may use an inset two-pixel outline to avoid clipping.
- Parent surfaces may use `:focus-within` to unify a card or search-field boundary.
- Never remove an element outline unless an equally visible parent focus treatment replaces it.
- Focus, hover, selected, and disabled states must remain visually distinct.

## Interaction states

Every interactive control requires:

- Default
- Hover
- `:focus-visible`
- Active/selected when applicable
- Disabled when applicable
- Mobile/touch target validation

Avoid inactive decorative buttons. If a control is visible, it must work or be explicitly disabled with an explanation.

## Motion and animation

Design principle: fast, subtle, Vercel/Geist-style feedback — never decorative motion that obscures content or makes the UI feel laggy.

### Global tokens

| Token | Value | Purpose |
| --- | --- | --- |
| `--ease` | `cubic-bezier(.4, 0, .2, 1)` | Standard ease-out (material register) |
| `--dur` | `.16s` / 150–200ms | Hover, focus, and color transitions |

These tokens are declared in `src/app/globals.css` and reused by every module. Do not introduce a second standard easing or base duration. The stylesheet also exposes semantic transition tokens: `--duration-micro` (80ms), `--duration-quick` (150ms), `--duration-fast` (250ms), `--duration-medium` (350ms), `--duration-slow` (400ms), and `--duration-very-slow` (500ms), alongside usage-specific easing, distance, scale, and blur tokens. Use the semantic token that matches the interaction rather than choosing the nearest raw value.

### Universal transition targets

The following elements receive the same uniform transition on `background-color`, `border-color`, `color`, `opacity`, `transform`, and `box-shadow`:

- Links, buttons, `.button`, `.icon-button`
- Search and filter triggers
- Category tabs and sidebar rows
- Tool cards, section links, category list rows

### Hover and press feedback

| Element | Hover | Active / Press |
| --- | --- | --- |
| `.button` / `.icon-button` | Surface `#0e0e0e → #151515`, border `#3a3a3a → #5a5a5a`, text → white | `transform: scale(.985)` |
| Tool card (dashboard grid) | Hairline `#ebebeb → #d4d4d4`, `translateY(-1px)`, `--shadow-float` | Card link press uses `--shadow-press` |
| Tool card (landing grid) | `translateY(-1px)`, border `#555`, inset highlight + shadow | `:focus-within` adds full white border + outer ring |
| Primary / category sidebar row | Background `#151515`, `translateX(2px)` (desktop) | Left 2px `#ededed` light-bar + inset box-shadow on active |
| Category list row | Background `#080808`, chevron `translateX(4px)` on landing, arrow `translateX(2px)` in activity | – |
| Switch thumb | Thumb translate 14px, track bg/border flip | – |
| Sidebar footer icon | `translateY(-1px)` | – |
| Tool arrow / card chevron | `opacity: 1`, `translate(2px,-2px)` | – |

### Page and section reveals

All reveals are enabled only when `@media (prefers-reduced-motion: no-preference)`:

| Animation | Keyframe | Duration | Stagger | Where |
| --- | --- | --- | --- | --- |
| `dh-rise` | `opacity 0→1`, `translateY(8px)→0` | 500ms | `.05s` step (hero children) | Landing hero inner |
| `dh-reveal` | `opacity 0→1`, `translateY(12px)→0` | 450–550ms | `.04s` step (tool cards 1–6) | Page hero, sections, CTA, footer, tool grids |
| Sidebar route stability | No mount animation; active, hover, and category-chevron transitions only | `.15s`–`.16s` | None | Workspace sidebar across route changes |
| `palette-in` | `opacity 0→1`, `translateY(-6px) scale(.985) → 1` | 180ms | None | Command-palette dialog on open |

### Ambient and status animations

| Animation | Shape | Duration | Notes |
| --- | --- | --- | --- |
| `dh-pulse` | Box-shadow halo on the status dot | 2400ms, infinite | Hero "Local-only" green dot (uses `#52d273`) |
| `dh-glow` | Hero radial blur: `opacity .45→.8`, `scale .92→1.06` | 8000ms, infinite alternate | Hero backdrop glow |
| `spin` | `rotate(360deg)` linear | 900ms, infinite | Loader2 spinners in AI planner / inline AI assist panels |
| `scroll-progress-fill` | `transform` linear | 12ms per frame | Fixed page scroll progress bar |

### Scroll and scrollbar

- `html { scroll-behavior: smooth }` (opt-out via reduced motion).
- Global scrollbar: `scrollbar-width: thin`, thumb `#3f3f46`, hover `#71717a`, padding-box clip + 3px transparent border + 999px radius.
- Sidebar scrollbar: width 4px, thumb `#3a3a3a` (independent of the global style).
- Sidebar category chevron: `rotate(0) → rotate(90deg)` on `<details open>` via `.chevron` at 150ms.

### Command palette extras

- Backdrop blur at 6–12px with a dark `#000a/0b` overlay.
- Result-row arrow icon is hidden by default (`opacity: 0`, `translateX(-3px)`) and revealed on hover / `aria-selected`.

### Reduced-motion policy

Every keyframe, transition, and smooth-scroll behavior has a `@media (prefers-reduced-motion: reduce)` override that sets:

- `animation: none !important` on keyframe targets.
- `transition: none !important` on all transitioned properties.
- `scroll-behavior: auto !important`.
- Hover `transform`s on sidebar rows, tool cards, and footer icons are disabled.
- Loader2 `spin` animations on spinners are disabled.

Never add motion that does not have a matching reduced-motion override. New card, shell, runtime-control, tab, and reveal motion must remain subtle, avoid layout shift, and use the semantic token scale above.

## Responsive rules

- Below 1050px, tool cards move from three columns to two.
- Below 900px, sidebar becomes an accessible drawer with a backdrop.
- Below 780px, runtime panels stack vertically.
- Below 700px, Recent settings, search, and lower-priority activity columns collapse.
- Below 680px, context rows and detector suggestions stack, and detector keyboard hints may hide.
- Below 650px, tool cards move to one column.
- Below 620px, topbar search collapses to an icon.
- Do not hide essential functionality; adapt its presentation.
- Validate 390px mobile, 1024px tablet, and 1440px desktop.

## Accessibility

- Keep visible focus rings.
- Provide accessible names for icon-only controls.
- Preserve semantic headings and landmarks.
- Avoid using color alone for state.
- Pair confidence, status, success, and error colors with text.
- Respect reduced motion.
- Maintain WCAG AA contrast for body/navigation text.

## Landing footer

The landing page footer is a distinct, high-contrast conversion and navigation surface. It uses a two-part hierarchy: a focused CTA masthead on the left and three grouped navigation columns on the right at desktop widths; below 900px the groups stack beneath the CTA, and below 620px they use a two-column layout with Trust spanning the full width.

- Footer surface: `#050505` with a `#292929` top rule; use the existing content width and responsive page padding.
- The local-first status chip pairs the green status dot with visible text; never rely on color alone for privacy or processing claims.
- The primary CTA is a functional link to `/dashboard`, with a 44px+ touch target, visible hover/active feedback, and a two-pixel keyboard focus ring.
- Navigation is a semantic `<nav aria-label="Footer navigation">` with sequential headings and real internal links. External GitHub navigation opens in a new tab with `rel="noreferrer"`.
- The lower metadata row pairs the DevHub mark with the existing privacy boundary: deterministic tools run in the browser and input history is not stored by default.
- Footer links reveal a subtle arrow on hover but remain fully readable and operable without hover. All reveals and transforms have a reduced-motion override.
- Validate at 1440×900, 1024×768, and 390×844 for no horizontal overflow, visible focus, readable contrast, and preserved link access.

## Change control

Any intentional change to the tokens, hierarchy, focus treatment, or geometry above must update this file in the same PR and include before/after screenshots when the visual behavior changes.


## P1 shared component primitives

P1 introduces reusable primitives for surfaces and high-frequency controls. CSS Modules own component-specific styling, while the shared semantic tokens remain in `src/app/globals.css`.

### Material presets

Use `.material-base`, `.material-small`, `.material-medium`, `.material-large`, `.material-tooltip`, `.material-menu`, `.material-modal`, and `.material-fullscreen` for bounded surfaces. These presets use the semantic surface, border, radius, and shadow tokens instead of literal per-component materials.

### Button and ButtonLink

`src/components/ui/button.tsx` provides `Button` and `ButtonLink` with `default`, `secondary`, `tertiary`, `error`, and `warning` variants; `tiny`, `small`, `medium`, and `large` sizes; optional `rounded`, `square`, and `circle` shapes; prefix/suffix icon slots; visible focus; disabled behavior; and an explicit loading state with `aria-busy`.

### SearchInput

`src/components/ui/search-input.tsx` provides small, medium, and large search fields with a visible focus-within boundary, optional label, keyboard shortcut hint, clear action, Escape-to-clear behavior, disabled styling, and an error message exposed with `role="alert"`.

### Badge and StatusDot

`src/components/ui/badge.tsx` provides semantic Badge colors (`gray`, `blue`, `green`, `teal`, `purple`, `amber`, `red`, and `pink`), low/inverted contrast modes, three sizes, and optional icons. `StatusDot` provides neutral, info, success, warning, and error states; a visible status label should accompany a dot when the status carries meaning.

### Current consumers

The shared header uses `ButtonLink`, tool cards use `Badge` for lifecycle metadata, and the tools page uses `SearchInput` for query, clear, and Escape behavior. The command palette now consumes the shared material, radius, typography, and lowercase metadata tokens.


## P2 workspace migration

The dashboard shell and primary dashboard workspace now consume the shared P1 primitives while preserving existing route, state, and privacy behavior.

`DashboardShell` uses the shared Button and ButtonLink primitives for mobile drawer close, menu, sidebar collapse, landing-page, and GitHub actions. The existing focus restoration remains intact: opening the drawer focuses its close control, closing it restores focus to the menu control, and Escape closes the drawer. Desktop and mobile touch-target rules remain in force.

`SmartInputDetector` now uses Badge and StatusDot for its local-only disclosure and confidence levels, Button for sample chips and the clear action, and semantic P2 surface tokens for its textarea, results, empty state, and keyboard hints. The detector remains local-only, bounded, deterministic, and keyboard-operable; Escape still clears and returns focus, while Cmd/Ctrl+Enter still opens the top match.

`DashboardToolGrid` uses Badge for category metadata and Button for the separate favorite control. The favorite control remains outside the card link so interactive elements are not nested. Default, hover, focus-within, active favorite, empty, starter-chip, tablet, and mobile states remain explicit.

The dashboard context count now uses Badge, and the shell, detector, dashboard cards, and dashboard count no longer contain uppercase text-transform declarations. Technical acronyms in visible content remain semantically uppercase where appropriate.


## Markdown Preview workspace

Markdown Preview uses the shared runtime surface with a Markdown-specific toolbar. The toolbar exposes the approved shared `Switch` primitive for **Live preview** and a local **Export HTML** action. Live rendering is debounced so typing remains responsive; turning it off restores explicit Run behavior.

The output header exposes accessible `Preview` and `HTML` tabs when a result exists. Preview content uses the runtime typography and surface tokens, with dedicated readable treatments for headings H1–H6, links, blockquotes, lists, task markers, fenced code, tables, horizontal rules, and safe image-alt placeholders. Tables scroll horizontally on small screens, runtime panels continue stacking below 780px, and all new controls retain visible focus, disabled, hover, and reduced-motion states.
