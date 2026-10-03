# Pickle Studio — Visual Website Builder

> **The high-precision visual web compiler by Pickle Corp™**

**Pickle Studio** is the flagship web-based visual website builder engineered by **Pickle Corp™** (founded by **Kaiser & Thanvi**). Built strictly for human-controlled, code-free visual design where visual canvas elements carry authentic semantic HTML meaning, Pickle Studio combines Figma-grade spatial manipulation with Webflow-grade production code generation — completely free of AI fluff, vendor lock-in, or subscription paywalls. Cash declined. Zero fiat. $0.00 invoices. Studio Mascot: **Gummy** (a flat mint gumdrop appointed to management).

---

## Highlights & Capabilities

- **Automatic Multi-Breakpoint Responsive Engine**: Design once, and the editor automatically reflows across **Desktop (1200px)**, **Laptop (1024px)**, **Tablet (768px)**, and **Phone (390px)**.
  - Multi-column sections automatically stack into clean single-column flows on mobile viewports.
  - Headings and typography gracefully scale to prevent awkward line breaks.
  - Canvas height dynamically expands to fit reflowed content.
  - Per-breakpoint manual overrides: `auto`, `keep-position`, `stack`, `full-width`, or `hide`.
- **Figma-Style Smart Snapping & Measurement**:
  - Sibling object edge-to-edge and center-to-center magnetic snapping with visual guide lines.
  - Artboard center-X and middle-Y alignment snapping.
  - Draggable horizontal and vertical ruler guides.
  - Equal spacing distribution detection with live gap badges.
  - **Alt / Option Key Distance Measurement**: Hold `Alt`/`Option` to inspect pixel distances between elements or to canvas boundaries in real time.
- **Marquee Multi-Selection & Batch Operations**:
  - Drag-to-select rubberband marquee box.
  - Batch alignment: Left, Center, Right, Top, Middle, Bottom.
  - Batch distribution: Distribute horizontally and vertically.
  - Container Grouping (`Cmd/Ctrl + G`) and Ungrouping (`Cmd/Ctrl + Shift + G`).
- **Semantic Role & Behavior Layer**:
  - Visual rectangles carry true semantic roles (`button`, `heading-h1..h3`, `card`, `navigation`, `form`, `dialog`, `input`, `badge`, `blockquote`, etc.).
  - Over 25 triggerable actions: URL navigation, page transition, smooth scroll to section, modal trigger, alert toast, copy to clipboard, sound effects, confetti burst, dark mode toggle, WhatsApp chat, and Stripe checkout.
- **Interactive Element States**:
  - Live editing and styling of `:hover`, `:active`, and `:focus` states.
  - Preview state changes in real time and automatically export them as native CSS pseudo-classes.
- **Motion, Physics & Scrollytelling Engine**:
  - 16 motion animation presets (Fade In, Slide Up/Down/Left/Right, Zoom In/Out, Pop In, Bounce, Flip Up, Float, Pulse, Shimmer, Spin, Blur In).
  - Physics easing curves including spring overshoot and snappy cubic bezier profiles.
  - Scroll-triggered animations with configurable trigger thresholds and cascade delay staggering for child elements.
  - Sticky pinning sections for cinematic scrollytelling experiences.
- **Interactive Forms & Lead Management**:
  - Semantic inputs, textareas, dropdowns, and checkboxes with client validation.
  - Built-in lead capture engine backed by local and cloud databases.
  - Leads management modal with 1-click CSV export.
- **E-Commerce & Mini-Storefront Engine**:
  - Ready-to-use product card widgets with price, compare-at pricing, badges, and variant selectors.
  - Slide-over Cart Drawer with real-time state management, quantity updates, subtotal, and tax calculation.
  - Stripe checkout integration and dispatch triggers.
- **Rich Interactive Widgets**:
  - Embedded Video Player (YouTube, Vimeo, and MP4 HTML5 video) with automatic URL parsing.
  - Animated Number Counters with easing, custom prefixes, and suffixes.
  - Collapsible FAQ Accordion widget.
  - Responsive Carousel / Image Slider with autoplay and navigation indicators.
  - Vector Lottie Animation widget with autoplay, loop, hover, and scroll triggers.
  - Page Reading Progress Bar.
- **Real-Time SEO Audit & Analytics Command Center**:
  - Automated 8-point SEO audit scoring (meta title, description, OpenGraph tags, heading hierarchy, image alt attributes, viewport, favicon, performance).
  - 1-Click automated SEO auto-fixer boosting scores to 90+ (Grade A).
  - Analytics dashboard tracking page views, unique visitors, form leads, and GMV revenue.
- **Dual-Layer Cloud Persistence & Version History**:
  - Debounced local persistence via `localStorage` paired with an SQLite / Supabase cloud backend.
  - Multi-page project manager with point-in-time revision snapshots and 1-click restore/rollback.
- **1-Click Publishing Pipeline**:
  - Slug generation and live availability validation.
  - Deterministic vector SVG QR Code generation for instant mobile previews.
  - OpenGraph social media sharing cards and responsive embed snippets.
- **Clean Production Code Export**:
  - Generates standalone, clean semantic HTML5 and vanilla CSS with embedded keyframes, responsive `@media` queries, and zero external dependencies.
  - Full Next.js 15 & React Tailwind ZIP export for production developer workflows.
- **Anti-Slop Design Compliance**:
  - Evaluated against the `pols.dev` anti-slop design law with zero generic AI purple gradient soup, no fake window chrome decorations, bespoke workbench chassis, calibrated typography, and high-density dark UI.

---

## Device Viewports & Responsive Behavior

| Viewport | Target Width | Layout Behavior |
| :--- | :--- | :--- |
| **Desktop** | `1200px` | Full multi-column visual canvas with pixel-level positioning. |
| **Laptop** | `1024px` | Proportional width adjustment and bounds constraint fitting. |
| **Tablet** | `768px` | Smart reflow; wide containers adapt to screen margins; 2-column or stacked layouts. |
| **Phone** | `390px` | Single-column vertical reflow; full-width cards; scaled typography; dynamic canvas height expansion. |

---

## Keyboard Shortcuts Reference

Craft Studio features professional keyboard shortcuts to maximize design velocity:

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| `Cmd / Ctrl + Z` | **Undo** | Revert the last canvas action. |
| `Cmd / Ctrl + Shift + Z` | **Redo** | Redo the previously undone action. |
| `Cmd / Ctrl + C` | **Copy** | Copy selected element(s) to clipboard. |
| `Cmd / Ctrl + V` | **Paste** | Paste copied element(s) onto active canvas with offset. |
| `Cmd / Ctrl + D` | **Duplicate** | Duplicate selected element(s) in place. |
| `Cmd / Ctrl + G` | **Group** | Wrap selected elements into a flex/absolute Container. |
| `Cmd / Ctrl + Shift + G` | **Ungroup** | Dissolve container and retain child positions. |
| `Delete` / `Backspace` | **Delete** | Remove selected element(s) from canvas. |
| `Arrow Keys` | **Nudge (1px)** | Nudge selected element(s) by 1 pixel. |
| `Shift + Arrow Keys` | **Nudge (10px)** | Nudge selected element(s) by 10 pixels. |
| `Alt / Option (Hold)` | **Inspect Distances** | Display Figma-style pixel distance guides to other elements and canvas edges. |
| `Space (Hold) + Drag` | **Pan Canvas** | Grab and pan the infinite visual canvas. |
| `Cmd / Ctrl + K` | **Command Palette** | Open quick command palette to search tools, actions, and templates. |
| `Cmd / Ctrl + E` | **Export Code** | Open the code export modal. |
| `Cmd / Ctrl + P` | **Publish Site** | Open the 1-click publishing modal. |
| `P` | **Toggle Preview** | Toggle between Design Mode and Interactive Preview Mode. |
| `?` | **Shortcuts Modal** | Open the keyboard shortcuts cheat sheet. |
| `Escape` | **Deselect All** | Clear active selection and close open context menus. |

---

## Project Structure

```text
design/
├── src/
│   ├── components/
│   │   ├── Canvas/               # Visual canvas, smart guides, rulers, floating badges, resize handles
│   │   ├── Header/               # Viewport switchers, mode toggles, project title, export/publish CTAs
│   │   ├── Landing/              # Marketing presentation and onboarding flow
│   │   ├── Modals/               # Publish, Export, SEO Audit, Analytics, Leads, History, Database, Auth
│   │   ├── Navigation/           # Top navigation bar and command bar
│   │   ├── Preview/              # Real-time full-screen interactive preview engine
│   │   ├── SidebarLeft/          # Elements catalog, templates, layer tree, page navigator, quick dock
│   │   ├── SidebarRight/         # Properties panel, element states, motion physics, semantic role, behaviors
│   │   ├── Toast/                # Custom notification and feedback toasts
│   │   └── Widgets/              # Product cards, cart drawer, Lottie, video players, reading progress
│   ├── constants/                # Preset templates, color palettes, motion keyframes, design tokens
│   ├── context/                  # Editor context, state reducer, action dispatchers, persistence hooks
│   ├── services/                 # Supabase client, local SQLite bridge, lead capture, SEO analyzer
│   ├── types/                    # TypeScript interfaces for elements, styles, actions, animations, plans
│   ├── utils/                    # Export HTML/CSS generator, QR generator, geometry, snapping math
│   ├── App.tsx                   # Main studio chassis and error boundaries
│   ├── index.css                 # Studio design system tokens, typography, and dark-mode styles
│   └── main.tsx                  # Application mount point
├── public/                       # Static public assets, favicon, SVGs
├── server/                       # SQLite backend server and persistence handlers
├── docs/                         # Static build output for GitHub Pages
└── package.json                  # Dependencies, build scripts, and test runner
```

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite 8
- **Styling**: Modern Vanilla CSS with customized design tokens, glassmorphism, and hardware-accelerated animations
- **Icons**: Lucide React
- **Storage**: Dual-layer debounced `localStorage` + SQLite / Supabase backend
- **Linting**: Oxlint
- **Testing**: Automated end-to-end node/tsx test suite across all 20 subsystems

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/azanabdullah2752012-ui/builder.git
cd builder

# Install dependencies
npm install
```

### Running Locally

```bash
# Start Vite development server
npm run dev
```

The application will be accessible at [http://localhost:5174/](http://localhost:5174/) (or the port specified in terminal output).

### Building for Production

```bash
# Build the production bundle
npm run build
```

This compiles TypeScript, bundles the assets with Vite, and updates the `dist/` and `docs/` directories for deployment.

### Running Test Suite

Craft Studio includes 20 automated test suites verifying responsive reflow, hierarchy, snapping geometry, element states, motion physics, functional form submission, lead capture, cart drawer state machines, and code export fidelity:

```bash
npm test
```

To run only the responsive engine tests:

```bash
npm run test:responsive
```

---

## License & Ownership

© 2026 Pickle Corp. Kaiser & Thanvi.
Independent Freelance Studio. Paid Strictly in Favors. All rights reserved.
