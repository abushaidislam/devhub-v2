## 2026-08-18 - Accessible dynamic copy button feedback
**Learning:** Action buttons in workspace tool runtimes need clear visual and screen-reader accessible feedback when copying content, along with explicit `type="button"` attributes to guarantee predictable behavior across layouts.
**Action:** Always provide `aria-label={copied ? "Copied output to clipboard" : "Copy output to clipboard"}` and explicit `type="button"` for interactive clipboard buttons.
