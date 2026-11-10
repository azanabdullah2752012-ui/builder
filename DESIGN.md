# Design System: Studio Obsidian & Electric Blue Precision

<!-- impeccable:design-schema 1 -->

## Domain & Archetype
- **Domain**: `SOFTWARE_EXPERIENCE` + `BRAND_EDITORIAL` (Spatial Web Canvas Workbench & Showcase)
- **Archetype**: Precision Obsidian, Titanium Studio & Electric Blue (Matching the official Pickle Corp Torch Blue Flame)
- **Motto**: "No AI. No Code. Spatial Precision."
- **Brand**: Pickle Corp™ (founded by Kaiser & Thanvi)

---

## 60-30-10 Color Architecture

### 60% Dominant Base Canvas
- **Deep Obsidian Canvas**: `#08090d`
- **Subtle Surface Deep**: `#0c0e14`
- **Sunken Stage Background**: `#090b10`
- **Ambient Directional Light Rake**: 135° radial gradient from top-left (`rgba(16, 118, 252, 0.12)` falloff into `#141826`).

### 30% Structural Panels & Borders
- **Panel Surface**: `#0f1118` (sidebars, toolbars, modal backgrounds)
- **Panel Surface Raised / Cards**: `#141722` (component items, cards)
- **Border Slate**: `#202536` (micro-hairline borders)
- **Border Highlight**: `#2d344d`
- **Soft White (Primary Text)**: `#f8fafc`
- **Muted Slate (Secondary Text)**: `#94a3b8`

### 10% High-Impact Accent
- **Studio Electric Blue**: `#1076fc` (Hover: `#2584ff`, Glow: `rgba(16, 118, 252, 0.35)`)
- **Usage**: Strictly reserved for primary CTAs, active telemetry badges, magnetic guide snaps, and high-contrast `:focus-visible` rings.

---

## Typography

### Signature Display Face
- **Primary Display**: `Cabinet Grotesk` (weights: 700, 800, 900; letter-spacing: `-0.035em`)
- **Editorial Flourish**: `Instrument Serif` (italic accents, quotes)

### Neutral Body Face
- **Body**: `Plus Jakarta Sans` (weights: 400, 500, 600, 700)
- **Reading Measure**: 45–75 characters per line (`max-w-prose`) with 1.6 line height.

### Telemetry & Technical Badges
- **Stamps & Status**: Tracked uppercase small-caps (`letter-spacing: 0.12em; text-transform: uppercase; font-feature-settings: 'tnum', 'zero';`).
- **Code & Rulers**: `JetBrains Mono` strictly for code blocks and canvas dimensions.

---

## Motion & Kinematics

### Snappy Exponential Deceleration
- Standard entrance curve: `cubic-bezier(0.16, 1, 0.3, 1)`
- Duration: `0.18s - 0.3s` for micro-interactions; zero rubbery bounce lerps.

---

## Absolute Execution Rules
1. **Content visible by default**: No entrance gating behind `opacity: 0`.
2. **Clear the cut**: No clipped text descenders or sliced controls.
3. **Parallel baseline alignment**: Equalized bottom-anchored actions across card grids.
4. **WCAG AA Compliance**: High-contrast ratios ($\ge 4.5:1$) across all body copy and interactive badges.
5. **No AI Slop Tells**: Zero purple gradient soup, zero generic pill buttons.
