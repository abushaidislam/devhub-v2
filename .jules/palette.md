## 2026-08-18 - Accessible dynamic copy button feedback
**Learning:** Action buttons in workspace tool runtimes need clear visual and screen-reader accessible feedback when copying content, along with explicit `type="button"` attributes to guarantee predictable behavior across layouts.
**Action:** Always provide `aria-label={copied ? "Copied output to clipboard" : "Copy output to clipboard"}` and explicit `type="button"` for interactive clipboard buttons.
## 2023-10-27 - Icon-Only Button Tooltips
**Learning:** Found multiple icon-only buttons (like Theme Toggle, Sidebar Collapse, and Clear Search) that had `aria-label` attributes for screen readers but lacked visual tooltips for mouse users.
**Action:** When adding or auditing icon-only buttons, always ensure a `title` attribute is present alongside `aria-label` so that sighted users can see a tooltip explaining the action.
