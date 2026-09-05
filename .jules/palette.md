## 2026-08-18 - Accessible dynamic copy button feedback
**Learning:** Action buttons in workspace tool runtimes need clear visual and screen-reader accessible feedback when copying content, along with explicit `type="button"` attributes to guarantee predictable behavior across layouts.
**Action:** Always provide `aria-label={copied ? "Copied output to clipboard" : "Copy output to clipboard"}` and explicit `type="button"` for interactive clipboard buttons.
## 2024-05-15 - Dashboard Shell Tooltips and ARIA State
**Learning:** Icon-only navigation buttons in the dashboard shell (like collapse and menu) had `aria-label` but lacked `title` tooltips for sighted users and `aria-expanded` state for screen readers.
**Action:** When creating toggle buttons or icon-only buttons, always ensure both visual tooltips (`title`) and stateful ARIA attributes (`aria-expanded`, `aria-pressed`) are applied alongside the descriptive `aria-label`.
