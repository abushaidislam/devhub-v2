# Components — agent instructions

Read `../../AGENTS.md` and `../../docs/DESIGN-SYSTEM.md` before changing components.

## Rules

- Reuse `DashboardShell`, `CommandPalette`, `ToolRuntime`, favorite primitives, and existing card patterns.
- Do not duplicate state stores or browser events.
- Keep processing logic out of UI components.
- Visible controls must work, be explicitly disabled, or be removed.
- Preserve semantic HTML, accessible names, visible focus, keyboard interaction, and touch targets.
- CSS Modules own component-specific styling; global CSS owns only product-wide tokens and typography.
- Follow documented sidebar geometry and color tokens.
- Do not solve layout issues with arbitrary viewport-specific offsets.
- Do not nest interactive controls inside links.

## Required states

For interactive components, consider:

- Default
- Hover
- Focus-visible
- Active/selected
- Disabled
- Empty
- Loading
- Success
- Error
- Mobile/drawer

Update screenshots and `docs/DESIGN-SYSTEM.md` when intentionally changing stable visual tokens.
