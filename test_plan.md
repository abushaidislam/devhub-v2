1. **Create Hook:** `src/lib/use-badge-visibility.ts`. A custom hook to handle the 3-day expiration logic of the "New" badge using `localStorage`.
2. **Update Component:** `src/components/dashboard/dashboard-shell.tsx`. Import the `useBadgeVisibility` hook. Create a sub-component `SidebarToolLink` to encapsulate the hook so it is called for each tool item individually.
3. **Fix CSS/Tailwind:** Ensure the container `Link` uses `min-w-0`, the name `span` uses `truncate flex-1 min-w-0` to truncate if needed, and the badge `span` uses `shrink-0` to prevent clipping. Since styles are in `dashboard-shell.module.css`, I will also verify the flex layout there, and add classes in TSX.
4. **Pre-commit checks**: Run `pnpm run check` and vitest `pnpm test`.
