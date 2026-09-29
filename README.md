# Craft Visual Website Builder

> **Design it. Define it. Ship it.**

A modern, web-based visual website builder where visual canvas elements carry true semantic meaning. Built strictly for human-controlled, code-free visual design without AI clutter.

---

## Key Differentiators

- **Automatic Responsive Layout Engine**: Design once, and the editor automatically adapts the layout across **Desktop (1200px)**, **Laptop (1024px)**, **Tablet (768px)**, and **Phone (390px)**.
  - Multi-column sections automatically stack into clean single-column flows on mobile devices.
  - Headings and typography gracefully scale for smaller screens without awkward word wraps.
  - Canvas height dynamically expands to fit stacked content.
  - Child elements inside cards and navigation containers automatically maintain their spatial alignment.
- **Semantic Role Layer**: Visual shapes aren't mere rectangles. A container can be defined as a `Button`, `Link`, `Card`, `Navigation`, or `Input`.
- **True Behavior Engine**: Assign click actions (`Navigate to URL`, `Navigate to Page`, `Trigger Alert/Toast`, `Scroll to Top`) and rich hover interactions.
- **Strict Element Locking**: Elements can be locked (`🔒 Lock`) to prevent accidental movement, resizing, or style changes while remaining selectable for quick unlocking.
- **Zero AI in Core Editor**: 100% human-controlled visual canvas with immediate, deterministic feedback.
- **Live Preview & Device Switcher**: Test how your website behaves and looks across Desktop, Laptop, Tablet, and Mobile views in both Design and Preview modes.
- **Standalone Responsive Code Export**: Generates pure semantic HTML & CSS with built-in `@media` queries for laptops, tablets, and phones.
- **Local Persistence**: State automatically saves to browser `localStorage` and persists across page reloads.

---

## Device Layouts

| Viewport | Target Width | Layout Behavior |
| :--- | :--- | :--- |
| **Desktop** | `1200px` | Full multi-column visual canvas with pixel-level positioning. |
| **Laptop** | `1024px` | Proportional width adjustment and bounds constraint fitting. |
| **Tablet** | `768px` | Smart reflow; wide containers adapt to screen margins; 2-column or stacked layouts. |
| **Phone** | `390px` | Single-column vertical reflow; full-width cards; scaled typography; dynamic canvas height expansion. |

---

## Milestone 1 Workflow Verification

Follow this workflow to test the editor:

1. **Launch the application**: Open [http://localhost:5174/](http://localhost:5174/).
2. **Start with a blank canvas**: Click the **Blank** button in the top header (or explore the rich starter template).
3. **Add a container**: In the left sidebar under **Elements**, click **Container**.
4. **Move and resize**: Drag the container to reposition it, and drag any of the 8 resize handles to adjust dimensions.
5. **Change its appearance**: In the right sidebar:
   - Pick a background color (e.g. Blue `#2563eb`).
   - Adjust border radius (e.g. `8px` or `pill`).
   - Customize border, opacity, or shadow.
6. **Define Semantic Role**:
   - In the **Semantics** section of the right sidebar, change Role to **Button**.
7. **Add button text**:
   - In **Appearance**, set button label (or double-click the element directly on the canvas).
8. **Configure Click Action**:
   - In **Behaviour**, choose **Trigger Alert / Toast** and input your custom message: `Button successfully clicked!`.
   - Optionally set hover scale to `1.02x` or customize hover background color.
9. **Lock the element**:
   - Click **Lock** (either on the floating selection badge or in the right sidebar under **Advanced**).
   - Verify the lock indicator appears (`🔒 Locked`), handles hide, and properties become protected.
10. **Test Device Viewports**:
    - Click **Laptop (1024px)**, **Tablet (768px)**, or **Phone (390px)** in the top header bar.
    - Notice how the layout automatically adjusts its widths, columns, and typography!
11. **Enter Preview mode**:
    - Click **Preview** in the top header.
    - Sidebars and editor controls hide; the page renders as a real interactive website.
12. **Interact with the button**:
    - Hover over the button to see hover effects.
    - Click the button to see the configured alert toast trigger.
13. **Refresh the browser**:
    - Reload the page (`Cmd+R` / `F5`).
    - The project and your locked button remain intact, loaded seamlessly from local storage.

---

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Dev Server**: Vite
- **Styling**: Modern Vanilla CSS with customized design tokens and smooth animations
- **Icons**: Lucide React
- **Storage**: Browser LocalStorage with automatic debounced sync
- **Linting**: Oxlint

---

## Getting Started

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### Run Automated Workflow & Responsive Tests
```bash
npm test
```
# builder
