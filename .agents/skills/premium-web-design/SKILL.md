---
name: premium-web-design
description: Design engineering rules, tokens, and micro-interaction patterns for building ultra-premium web applications inspired by Vercel, Linear, Stripe, and Apple. Covers Geist/Linear color ladders, whisper elevations, tactile button states, tightly tracked typography, mesh gradients, and bento layouts.
---

# Premium Web Design & Polish Skill

> A comprehensive design engineering manual for crafting state-of-the-art, top-tier web interfaces matching the visual polish of **Vercel, Linear, Stripe, Raycast, and Apple**.

---

## 1. Core Philosophy: The Subtractive Aesthetic

Top-tier developer tools and modern web products avoid noisy colors, cartoonish illustrations, and heavy drop shadows. They achieve elegance through **restraint, precision typography, and tactile micro-interactions**.

* **Near-Zero Chromatic Chrome**: Chrome (headers, sidebars, cards, borders) uses an ink-and-canvas ladder. Color is reserved solely for status accents (Cyan for local, Green for success, Orange for warning) or subtle ambient mesh lighting in hero sections.
* **Hairline Boundaries**: Structural division relies on `1px hairline borders` (`#ebebeb` on light, `rgba(255, 255, 255, 0.08)` or `#262626` on dark), not heavy contrast shifts.
* **Documentation-Grade Confidence**: The page reads like an engineered spec sheet that happens to be beautiful — exact, confident, and crisp.

---

## 2. Color & Surface Hierarchy

Use semantic tokens rather than hardcoded hex values. Maintain clear elevation boundaries between canvas and card layers.

### Light Theme (Ink on Canvas)
| Token | Hex | Use Case |
|---|---|---|
| `--canvas` | `#fafafa` | Main page and application background |
| `--canvas-elevated` | `#ffffff` | Cards, modals, toolbars, and inputs |
| `--surface-bright` | `#ffffff` | Hover state lift on elevated cards |
| `--hairline` | `#ebebeb` | 1px borders, card dividers |
| `--hairline-soft` | `#f2f2f2` | Inset wells, tags, hover fills |
| `--ink` | `#171717` | High-contrast headings, primary CTA fill, active text |
| `--body-copy` | `#4d4d4d` | Descriptions, readable body paragraphs |
| `--mute` | `#8f8f8f` | Metadata, captions, secondary timestamps |
| `--border-hover` | `#d4d4d4` | Card & button border hover transition |

### Dark Theme (Deep Contrast)
| Token | Hex / Value | Use Case |
|---|---|---|
| `--canvas` | `#000000` | True-black canvas background |
| `--canvas-elevated` | `#0a0a0a` / `#0d0d0d` | Elevated cards, dialogs, inputs |
| `--surface-bright` | `#141414` | Hover lift on elevated surfaces |
| `--hairline` | `#262626` / `rgba(255,255,255,0.08)` | Hairline borders and dividers |
| `--hairline-soft` | `#171717` | Monospace tags, inset wells |
| `--ink` | `#ededed` | Primary headings, active icon glyphs |
| `--body-copy` | `#a1a1a1` | Paragraphs and primary descriptions |
| `--mute` | `#737373` | Monospace metadata and secondary hints |
| `--border-hover` | `#404040` / `#525252` | Hover brightening on borders |

---

## 3. Layered Whisper Shadows (Elevation)

Never use a single harsh black shadow (`box-shadow: 0 4px 10px rgba(0,0,0,0.3)`). Real surfaces cast multiple soft, low-alpha shadow layers.

```css
/* Level 0: Rest (Hairline only or faint whisper) */
--shadow-whisper: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 1px rgba(0, 0, 0, 0.02);

/* Level 1: Float (On Hover) */
--shadow-float: 0 12px 32px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04);

/* Level 2: Press (On Active Click) */
--shadow-press: inset 0 1px 2px rgba(0, 0, 0, 0.08);

/* Dark theme overrides */
[data-theme="dark"] {
  --shadow-whisper: 0 0 0 1px rgba(255, 255, 255, 0.04);
  --shadow-float: 0 12px 36px -8px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08);
  --shadow-press: inset 0 1px 2px rgba(0, 0, 0, 0.5);
}
```

---

## 4. Typography & Tracking Register

High-end developer platforms pair **Geist Sans / Inter** for tightly tracked headlines with **Geist Mono / JetBrains Mono** for technical metadata.

### Letter-Spacing Rules
* **Hero Display H1** (`48px – 72px`): `letter-spacing: -0.055em` to `-0.065em`, `line-height: 1.02`
* **Section H2** (`28px – 36px`): `letter-spacing: -0.035em` to `-0.04em`, `line-height: 1.15`
* **Card Titles H3** (`16px – 20px`): `letter-spacing: -0.015em`, `font-weight: 600`
* **Paragraph Body** (`14px – 16px`): `letter-spacing: -0.005em`, `line-height: 1.55`
* **Technical Eyebrows & Badges**: Monospace, `10px – 11px`, `letter-spacing: 0.04em`, uppercase or lowercase

```css
h1, h2, h3 {
  text-wrap: balance;
  font-feature-settings: "rlig" 1, "calt" 1, "ss01" 1, "ss06" 1;
}
```

---

## 5. Micro-Interactions & Tactile Physics

Interfaces must feel responsive, physical, and alive under the cursor.

### 1. The Apple/Vercel Dual Button Rule
* **Marketing CTA Buttons**: Fully rounded pills (`border-radius: 9999px` or `100px`) with high contrast (white on dark, dark on light).
* **In-App / Form Controls**: Tight 6px square corners (`border-radius: 6px`) to signal structured application utility.

### 2. Tactile Feedback Matrix
```css
/* Card & Button Hover / Active Physics */
.interactive-card, .btn {
  transition: 
    transform 0.16s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.16s cubic-bezier(0.16, 1, 0.3, 1),
    box-shadow 0.16s cubic-bezier(0.16, 1, 0.3, 1),
    background-color 0.16s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Hover: Lift by 1px and brighten border */
.interactive-card:hover {
  transform: translateY(-1px);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-float);
}

/* Active: Press in slightly (tactile click) */
.interactive-card:active, .btn:active {
  transform: translateY(0) scale(0.985);
  box-shadow: var(--shadow-press);
}
```

### 3. Keycaps & Keyboard Indicators
* Use `<kbd>` tags styled as miniature physical keys:
```css
kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border: 1px solid var(--hairline);
  border-radius: 4px;
  background: var(--hairline-soft);
  color: var(--ink);
  font: 500 10px/1 var(--mono);
  box-shadow: 0 1px 0 var(--hairline);
}
```

---

## 6. Ambient Mesh Lighting (The Vercel/Stripe Glow)

Confine vivid color to soft, blurred multi-stop radial gradients situated behind the hero or key conversion anchors.

```css
.hero-glow {
  position: absolute;
  width: min(920px, 100vw);
  height: 480px;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -50%);
  background:
    radial-gradient(closest-side at 30% 40%, rgba(0, 124, 240, 0.25), transparent 70%),
    radial-gradient(closest-side at 60% 35%, rgba(121, 40, 202, 0.22), transparent 70%),
    radial-gradient(closest-side at 50% 65%, rgba(80, 227, 194, 0.2), transparent 65%);
  filter: blur(48px);
  opacity: 0.85;
  animation: ambientGlow 8s ease-in-out infinite alternate;
  pointer-events: none;
}

[data-theme="dark"] .hero-glow {
  opacity: 0.55;
}

@keyframes ambientGlow {
  0% { transform: translate(-50%, -50%) scale(0.96); opacity: 0.7; }
  100% { transform: translate(-50%, -50%) scale(1.04); opacity: 0.95; }
}
```

---

## 7. Bento Grids & Concrete Content

Avoid generic marketing cards with vague text and generic stock illustrations. High-end tools showcase **real, tangible artifacts**:

* **Asymmetric Columns**: Use 12-column grids with spans like `7 + 5` on row 1 and `4 + 4 + 4` on row 2.
* **Mini Terminal Mockups**: Render window title bars (`input.raw`), byte sizes (`1,420 bytes`), and syntax-highlighted code.
* **Concrete Telemetry**: Display real metrics (`<0.2ms latency`, `0 bytes network egress`, `100% in-browser`).
* **Interactive Tabs**: Allow users to click through live sample states without leaving the page.

---

## 8. Accessibility & Reduced Motion (Mandatory)

A design is not premium if it stutters, causes motion sickness, or ignores keyboard users.

1. **Visible Focus Rings**:
   ```css
   :focus-visible {
     outline: 2px solid var(--focus-ring, #0070f3);
     outline-offset: 2px;
   }
   ```
2. **Strict Reduced Motion**:
   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       animation-iteration-count: 1 !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
     .interactive-card:hover, .btn:hover {
       transform: none !important;
     }
   }
   ```
3. **Mobile Touch Targets**: All clickable links, buttons, and switches must maintain a minimum `44px` touch dimension on viewports `<680px`.
