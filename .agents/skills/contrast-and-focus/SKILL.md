---
name: contrast-and-focus
description: >-
  Design engineering manual and skill for mastering visual contrast, luminance ladders,
  surface elevation, atmospheric dimming, and high-visibility focus states. Used to eliminate
  washed-out, blurry, or low-contrast interfaces and build crisp, hyper-focusable developer
  workspaces inspired by Linear, Vercel, Stripe, Raycast, and Apple.
---

# Contrast & Visual Focus Engineering Skill

> A definitive engineering guide for mastering **Visual Hierarchy, Luminance Contrast, Surface Elevation, and Focusability** in modern web applications and developer tools.

---

## 1. Core Problem & Philosophy: The "Foggy UI" Trap

Most developer interfaces suffer from one of two extremes:
1. **The Foggy/Washed-Out Trap**: Excessive use of low opacities (`opacity: 0.3` or `0.4`), washed-out grey text on dark backgrounds, and borderless surfaces. The eye has nowhere to rest, and reading causes severe eye strain.
2. **The High-Contrast Cacophony**: Everything is 100% bright white with neon colors everywhere. The user is blinded and visual hierarchy is completely lost.

### The Golden Rule: Deliberate Luminance & Restraint
Great interfaces (Vercel, Linear, Apple, Stripe) look crisp, deep, and focusable because **contrast is strictly tiered, backgrounds are calibrated with surface-to-canvas gaps, and focus is guided through lighting**.

---

## 2. The 4-Tier Text Luminance Ladder

Never choose arbitrary text colors or opacities. Every piece of text must belong to one of four strict contrast tiers:

### Tier 1: Peak Luminance (`--ink` / 100% Contrast)
- **Dark Mode**: `#ededed` or `#ffffff` (`rgba(255, 255, 255, 1)`)
- **Light Mode**: `#171717` (`rgba(0, 0, 0, 0.92)`)
- **Role**: Headlines, primary CTA labels, active tab text, current values, and highlighted keywords.
- **Rule**: Maximize scannability. Must meet **WCAG AAA (7:1)** contrast against its surface.

### Tier 2: Readable Body (`--body-copy` / 72% – 76% Contrast)
- **Dark Mode**: `#a1a1a1` or `rgba(255, 255, 255, 0.74)`
- **Light Mode**: `#4d4d4d` or `rgba(0, 0, 0, 0.70)`
- **Role**: Descriptions, explainer paragraphs, documentation copy, input placeholder text.
- **Rule**: Must be effortlessly readable over long periods without eye fatigue. Must meet **WCAG AA (4.5:1)**.

### Tier 3: Metadata & Muted Captions (`--mute` / 45% – 50% Contrast)
- **Dark Mode**: `#737373` or `rgba(255, 255, 255, 0.48)`
- **Light Mode**: `#8f8f8f` or `rgba(0, 0, 0, 0.45)`
- **Role**: Time units (ms, bytes, timestamps), non-critical labels, keyboard shortcut hints, breadcrumb slashes.
- **STRICT FLOOR RULE**: **Never go below 45% opacity for any readable alphanumeric character**. Anything below 40% turns into invisible "digital fog."

### Tier 4: Structural Separation (`--hairline` / 8% – 14% Alpha)
- **Dark Mode**: `rgba(255, 255, 255, 0.08)` to `rgba(255, 255, 255, 0.12)` (or `#262626`)
- **Light Mode**: `rgba(0, 0, 0, 0.08)` to `rgba(0, 0, 0, 0.10)` (or `#ebebeb`)
- **Role**: Card borders, table dividers, panel splitters.
- **Rule**: Use alpha transparency, not solid grey, so lines naturally harmonize with underlying ambient lights.

---

## 3. Surface-to-Canvas Elevation Contrast (Dark Mode Depth)

In dark mode, standard drop shadows (`box-shadow: 0 10px 30px rgba(0,0,0,0.5)`) are invisible against a black canvas. To make surfaces distinct and focusable, use **The Triad of Surface Elevation**:

### 1. The Canvas-to-Surface Gap
- **Page Canvas**: True pitch black (`#000000` / `hsl(0, 0%, 0%)`).
- **Card Surface**: Deep carbon (`#0a0a0a` or `#0e0e0e` / `hsl(0, 0%, 5.5%)`).
- **Elevated Hover**: Slate carbon (`#141414` / `hsl(0, 0%, 8%)`).

### 2. The Linear Top-Edge Inset Highlight (Chiseled Edge)
Give cards a subtle chiseled 3D edge by simulating an overhead light source:
```css
.card {
  background: var(--canvas-elevated);
  border: 1px solid var(--hairline);
  /* Top-edge 1px whisper highlight */
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.09);
}

.card:hover {
  border-color: var(--border-hover);
  box-shadow: 
    inset 0 1px 0 0 rgba(255, 255, 255, 0.18),
    0 8px 24px -4px rgba(0, 0, 0, 0.6);
}
```

---

## 4. Atmospheric Dimming & Focus Techniques ("Dim & Illuminate")

When a user interacts with a grid of cards or tools, guiding their gaze is paramount:

### Pattern A: Peer Dimming (The Linear / Apple App Store Focus)
When hovering over one card in a grid, slightly dim the sibling cards so the target pops:
```css
/* Container */
.interactiveGrid {
  /* No special styles needed */
}

/* On hover over the grid, dim non-hovered siblings */
.interactiveGrid:hover .card:not(:hover) {
  opacity: 0.62;
  filter: grayscale(15%);
  transition: opacity 0.22s var(--ease), filter 0.22s var(--ease);
}

/* Hovered card stays 100% crisp and lifts */
.interactiveGrid .card:hover {
  opacity: 1;
  filter: none;
  transform: translateY(-2px);
  z-index: 2;
}
```

### Pattern B: Mouse-Tracking Border Spotlight
For cards, simulate an ambient radial glow following the cursor:
```css
.spotlightCard {
  position: relative;
  overflow: hidden;
  background: var(--canvas-elevated);
  border: 1px solid var(--hairline);
}

.spotlightCard::before {
  content: "";
  position: absolute;
  inset: -1px;
  background: radial-gradient(
    400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgba(255, 255, 255, 0.12),
    transparent 40%
  );
  border-radius: inherit;
  pointer-events: none;
  z-index: 1;
}
```

---

## 5. Keyboard Focusability & Focus-Visible Architecture

Never rely on the default browser focus ring (a fuzzy blue outline). A professional developer workbench must have an unmistakable, crisp focus anchor.

### The High-Contrast Offset Dual-Ring Rule
```css
:focus-visible {
  outline: 2px solid var(--focus-ring, var(--cyan));
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(80, 227, 194, 0.15);
}
```

### Input & Textarea Focus States
Form inputs should illuminate their border and cast a soft inward glow:
```css
.inputField {
  background: var(--canvas);
  border: 1px solid var(--hairline);
  color: var(--ink);
  transition: border-color 0.16s var(--ease), box-shadow 0.16s var(--ease);
}

.inputField:focus {
  outline: none;
  border-color: rgba(80, 227, 194, 0.6);
  box-shadow: 
    0 0 0 3px rgba(80, 227, 194, 0.12),
    inset 0 1px 2px rgba(0, 0, 0, 0.4);
}
```

---

## 6. Monochromatic Discipline with Selective Accent Pop

To make an interface feel premium, **95% of the UI should be monochromatic (black, white, greys)**. 

- **The Danger of Multi-Color**: Using red, blue, green, and purple all at once destroys hierarchy and looks like a toy.
- **The Selective Accent (DevHub Cyan `#50E3C2`)**:
  - Keep the frame, borders, and typography monochrome.
  - Use the single accent color (`var(--cyan)`) **exclusively** for:
    1. Active status indicators (`.pulse`, `.cyanDot`)
    2. Selected tabs or filters (`.activePill`)
    3. Match percentage chips (`99.8% match`)
    4. Successful action confirmations (the checkmark on copy)
    5. Keyboard focus rings (`:focus-visible`)

When color is rare, its presence commands instant user focus.

---

## 7. Anti-Patterns & Common Traps Checklist

| ❌ Anti-Pattern | Why it Fails | ✅ How to Fix |
| :--- | :--- | :--- |
| **The "Double-Mute" Trap** | Applying `opacity: 0.5` to an element that already uses a grey color (`#737373`). Compounding produces a washed-out 25% ghost. | Apply opacity **or** color, never both. Use semantic CSS variables (`var(--mute)`). |
| **Invisible Borders in Dark Mode** | Using `border: 1px solid #111` against a `#000` background. On low-brightness screens, the card vanishes. | Use `rgba(255, 255, 255, 0.08)` to `0.12` so light cuts cleanly into dark. |
| **Text with No Hierarchy** | Heading and body text both using the same white color. Reader cannot scan sections quickly. | Headings at 100% (`#fff`), body copy at 74% (`#a1a1a1`), kickers at 48% (`#737373`). |
| **Faint Buttons** | Secondary buttons with grey text and no border. Users think they are disabled. | Use `box-shadow: var(--shadow-whisper)` with a `1px solid var(--hairline)` and crisp `#ededed` text. |
| **Missing Focus-Visible** | Using `outline: none` without providing an alternative `:focus-visible` ring. Keyboard users get stranded. | Always define `:focus-visible` with a 2px high-contrast offset ring. |

---

## 8. Developer Quick-Reference Tokens

```css
/* Contrast & Focus Tokens */
:root {
  /* Luminance Hierarchy */
  --contrast-peak: #ededed;             /* Tier 1: 100% Headings, active values */
  --contrast-body: #a1a1a1;             /* Tier 2: 74% Readable copy */
  --contrast-mute: #737373;             /* Tier 3: 48% Metadata (Strict floor) */
  --contrast-hairline: rgba(255, 255, 255, 0.08); /* Tier 4: Structural boundary */

  /* Inset Lighting */
  --chiseled-highlight: inset 0 1px 0 0 rgba(255, 255, 255, 0.09);
  --chiseled-highlight-hover: inset 0 1px 0 0 rgba(255, 255, 255, 0.18);

  /* Focus Ring */
  --focus-ring-color: #50e3c2;
  --focus-ring-shadow: 0 0 0 3px rgba(80, 227, 194, 0.18);
}
```
