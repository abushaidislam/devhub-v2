## 2026-08-18 - Accessible dynamic copy button feedback
**Learning:** Action buttons in workspace tool runtimes need clear visual and screen-reader accessible feedback when copying content, along with explicit `type="button"` attributes to guarantee predictable behavior across layouts.
**Action:** Always provide `aria-label={copied ? "Copied output to clipboard" : "Copy output to clipboard"}` and explicit `type="button"` for interactive clipboard buttons.

## 2026-09-12 - Disable spellcheck on data inputs
**Learning:** Browser spellcheck on inputs intended for code, JSON, SQL, or other structured data causes noisy red squiggly lines that look like errors.
**Action:** Add `spellCheck={false}` to textareas and inputs that accept code or structured data to prevent false-positive visual noise.
