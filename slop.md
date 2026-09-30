# The Anti-Slop Design Law (`slop.md`)

> **Source:** Distilled from [the pols.dev anti-slop design law](https://pols.dev/slop.md)  
> **Purpose:** Eliminate generic, machine-made AI aesthetic clichés ("AI slop") and build distinctive, opinionated, production-grade web interfaces.  
> **Core Law:** Dodging the tell catalog is not enough. A page with zero tells and no signature is unfinished work wearing restraint as an alibi.

---

## 1. The Six Absolute Rules

Six non-negotiable execution laws. Any violation is an automatic **critical tell**, failing the page and capping the overall design score at 69 (Grade C max).

| # | Absolute Rule | Catalog ID | Requirement |
|---|---------------|------------|-------------|
| 1 | **Content visible by default** | `M1` | No content gated on scroll or entrance animations (`opacity: 0` + reveal). If JS or observers fail, content must still be readable. |
| 2 | **Clear the cut** | `X2`, `X11` | No text, icon, or control sliced by clip-path, notches, `overflow: hidden`, or rigid fixed containers. |
| 3 | **Parallel alignment** | `X3` | Comparable columns share baseline grids; card action buttons are pinned to matching bottom baselines. |
| 4 | **Real centering** | `X1` | Everything intended to be centered is verified both mathematically and optically (especially SVG glyphs and pills). |
| 5 | **Legible contrast** | `X5` | Every string clears its background with high-contrast ratio; zero text washed out against its backdrop. |
| 6 | **Controls work** | `M8` | Every interactive-looking button, tab, accordion, or toggle must respond to user input; no fake decorative controls. |

---

## 2. Complete Catalog of Slop Tells

Each tell carries a unique ID, severity (`crit`, `major`, `minor`), and concrete evidence requirements.

### C — Color & Light (Axis 1)

| ID | Tell | Sev | Description & Evidence |
|----|------|-----|------------------------|
| **C1** | Blue→purple gradient | `major` | The quintessential AI tell: soft blue-to-purple anywhere (backgrounds, buttons, borders, avatars). Any glowy two-adjacent-hue gradient. |
| **C2** | Purple default palette | `minor` | Purple as the unexamined default brand hue; upgrades to C1 when gradiated with blue. |
| **C3** | Pastel candy gradient | `major` | Butter-yellow→peach→strawberry-milk (`#ffe6a8`→`#ffc0da`), mint-to-lavender, or sherbet washes filling a page/section. |
| **C4** | Drifting aurora blobs | `major` | 2–4 blurred radial blobs at ~0.5 opacity, often `mix-blend-mode: multiply` + `blur()`, melting into an aurora behind content. |
| **C5** | Radial glow halo | `major` | Concentric bloom centered behind a hero object. Real light comes from a directional source or not at all. |
| **C6** | Cool blue-charcoal dark | `major` | The slate-indigo "serious dark product" base (`#0c0e15`), bluer panels, and lilac/periwinkle accents chosen on autopilot. |
| **C7** | Cream/beige "editorial" | `minor` | Warm cream/bone as the reflexive "tasteful premium" fallback. Major when it blankets the entire brand uniformly. |
| **C8** | Slop gray (UI-kit neutral) | `minor` | Tailored `gray-100/200` (`#f3f4f6`, `#eceef2`) as footer bands or card fills — wireframes left at defaults. |
| **C9** | Saturated accent sprayed | `major` | One vivid mid-saturation hue on eyebrow dots, accents, buttons, and badges at once without tonal variation. |
| **C10** | Colliding / muddy wash | `major` | Two saturated unrelated hues fighting; dim brown/gray-beige envelopes underneath refined components. |
| **C11** | Hard color seams | `major` | A gradient or glow that dies abruptly at a section boundary instead of smoothly resolving into the next section. |
| **C12** | Background glow blob | `minor` | Soft radial accent bleeding from a corner or edge of a dark section for generic "atmosphere". |
| **C13** | Gradient-filled headline | `major` | `background-clip: text` pouring magenta-purple-cyan or blue-cyan into display type. |
| **C14** | Banded gradient | `minor` | Large color transitions showing visible stepping without grain or dithering. |
| **C15** | Full-page graph paper | `major` | Faint module grid or blueprint squares laid under the whole page. |

---

### T — Typography & W — Copy (Axis 2)

| ID | Tell | Sev | Description & Evidence |
|----|------|-----|------------------------|
| **T1** | Google-shelf signature face | `major` | Brand identity carried by free Google defaults: Inter, Space Grotesk, Sora, Syne, Archivo, Figtree, Fraunces, Bodoni, JetBrains Mono. (Inter as body is fine; Inter as the signature display face is the tell). |
| **T2** | Recognizable slop pairing | `major` | Fraunces + Work Sans, Space Grotesk + Inter, Sora + JetBrains Mono, or generic serif display + geometric sans combos. |
| **T3** | Didone-as-luxury reflex | `major` | Bodoni, Didot, or Playfair reached for on autopilot to fake luxury, usually letterspaced all-caps. |
| **T4** | Mono as house voice | `minor` | Monospace on copyright lines, eyebrows, captions, and labels to fake a "technical" vibe. |
| **T5** | Uniform label treatment | `minor` | Tracked-out caps or mono costume applied identically across eyebrows, buttons, nav, and colophons. |
| **T6** | Letterspaced serif wordmark | `minor` | Brand name in wide-tracked all-caps serif and nothing else. |
| **T7** | Multi-line dangling accent | `major` | Display line wrapping 3–4 rows with a single colored/italicized accent word stranded on the final line. |
| **T8** | Cramped display type | `major` | Giant numbers or words with excessive negative letter-spacing causing glyphs to collide. |
| **T9** | "Tasteful" safe font swap | `minor` | Reaching for Clash Display, General Sans, or Bricolage simply because they are reputed "safe picks". |
| **T10** | Novelty rounded display | `major` | Bubbly display faces (Baloo, Fredoka, Chewy) carrying titles over system-ui body fonts. |
| **W1** | Em dashes as AI voice | `minor` | Overuse of em-dashes (`—`) in copy. Replace with hyphens, colons, or concise sentence splits. |
| **W2** | Wall of copy | `minor` | Blocks of filler text where hierarchy, layout, and visual artifacts should carry meaning. |
| **W3** | Fabricated metrics | `major` | Invented social proof ("velocity jumped 340%", "trusted by 10,000+ teams" with fictional logos). |

---

### K — Components & Ornament (Axis 3)

| ID | Tell | Sev | Description & Evidence |
|----|------|-----|------------------------|
| **K1** | Icon-pack icons everywhere | `minor` | Lucide or Feather thin-line icons stamped on every single feature and card without custom drawing. |
| **K2** | Pill / eyebrow badge | `minor` | Tiny capsule badge with a sparkling icon and kicker text centered above the hero title. |
| **K3** | Glowy pill buttons | `major` | Fully-rounded (`border-radius: 9999px`) gradient-filled buttons with a blurred drop glow beneath. |
| **K4** | Oversized icon in colored tile | `major` | Big generic icon centered in a squircle or rounded tile as a feature card hero. |
| **K5** | Floating/bobbing cards | `minor` | Cards hovering around a hero on infinite loop translateY keyframes. |
| **K6** | Kitchen-sink card | `major` | A single card cramming an icon tile + category pill + divider + price + glowing CTA button. |
| **K7** | Fake macOS / app window | `major` | CSS window with 3 traffic-light dots (red/yellow/green) holding toy kanban boards or avatar stacks. |
| **K8** | Gradient pill with icon + text | `major` | Rounded pill with blue-purple background holding an icon and uppercase label. |
| **K9** | Default CTA pair | `major` | Solid gradient primary button with trailing arrow beside a ghost outlined button ("Learn more"). |
| **K10** | Testimonial quote card | `major` | Generic card with giant decorative quote marks, centered italic quote, avatar, name, and fake title. |
| **K11** | Initials avatar circle | `minor` | Two-letter initials on a gradient circle standing in for real user photos. |
| **K12** | Logo lockup tile | `major` | Abstract geometric icon inside a gradient squircle next to a standard geometric sans font. |
| **K13** | Hairline borders everywhere | `minor` | `1px solid rgba(255,255,255,0.1)` on every card. Use tonal elevation and self-colored borders instead. |
| **K14** | Artificial countdown timer | `minor` | Days/Hours/Mins/Secs ticking down urgency when no real sale or deadline exists. |
| **K15** | Accent-bar card edge | `minor` | Dark rectangle with a single 2px colored stripe down the left edge. |
| **K16** | Fake code-snippet window | `major` | Rounded dark box, traffic lights, fake `quickstart.ts`, and syntax-highlighted toy snippet. |
| **K17** | Floating tags on images | `minor` | Small floating metadata badges pinned to corners of photography or cards. |
| **K18** | Pulsing live dot | `minor` | Glowing green or amber dot with an infinite expanding ring animation. |
| **K19** | Dot under active nav | `minor` | Lone circular dot beneath the active navigation link. |
| **K20** | Eyebrow tick | `minor` | 30px hairline rule drawn beside a kicker label to make it feel "designed". |
| **K21** | Unrounded hairline rules | `minor` | Square-capped lines used as decorative list dividers and rails. |
| **K22** | Metadata pills everywhere | `minor` | Every status, category, tag, or badge rendered as a colored pill. |
| **K23** | Faked customer logos | `major` | Invented brand logos, monochrome fictional company marks as client proof. |
| **K24** | Icon or logo in a box | `minor` | Every icon parked inside its own circular or square container. |
| **K25** | Botched glassmorphism | `major` | Blurry backdrop banding, washed-out milkiness, and glow halos leaking beneath flat elements. |
| **K26** | Grain over content | `minor` | Noise texture overlay sitting on top of text and controls instead of on the deep background substrate. |
| **K27** | AI-brand convergence kit | `minor` | Orbital ring logo + corporate blue + geometric sans font (often named *-AI* or *-ly*). |

---

### L — Layout & Composition (Axis 4)

*Rule:* 3 or more major layout tells on one page triggers the **Compounding Cap**, capping Axis 4 at 40 max.

| ID | Tell | Sev | Description & Evidence |
|----|------|-----|------------------------|
| **L1** | Default hero stack | `major` | Eyebrow badge → giant headline → 2-line subhead → primary button + ghost link, centered down the middle. |
| **L2** | Split hero | `major` | Left text stack (kicker, title, subline, 2 buttons, stats) + right-side floating UI mockup. |
| **L3** | Three-tier pricing preset | `major` | Free / Pro / Enterprise cards with glowing "MOST POPULAR" pill in the middle. |
| **L4** | Pre-footer CTA slab | `major` | Full-width rounded box with centered headline, "no credit card required" note, and dual buttons. |
| **L5** | Kicker + serif-H2 head | `minor` | Tiny uppercase kicker ("HOW IT WORKS") above a medium serif H2 opening every section. |
| **L6** | Small-label-over-heading | `minor` | Uppercase kicker above large heading used mechanically as the opener for every section. |
| **L7** | Big serif statement block | `minor` | Kicker + single large serif statement with one italicized accent word. |
| **L8** | Inset enquire island | `minor` | Floated card with kicker, heading, lead copy, and contact form as default closer. |
| **L9** | Email-pill + button form | `minor` | Long pill input box touching a pill submit button. |
| **L10** | Image card with overlay caption | `minor` | Card with dark gradient overlay, uppercase tag, serif title, and arrow link. |
| **L11** | Atmospheric hero into flat void | `major` | Rich textured hero followed immediately by flat, dead, boxy gray/black sections below the fold. |
| **L12** | Numbered steps on vertical rail | `minor` | `01 / 02 / 03` items anchored along a vertical rule. |
| **L13** | Solid + ghost button pair | `major` | Solid filled button beside an outlined transparent button used universally. |
| **L14** | Standard template footer | `minor` | Logo + tagline, hairline rule, 4 columns of uppercase links, rule, copyright. |
| **L15** | SaaS meta-skeleton | `major` | The Stripe/Linear clone: Hero → 3 Feature Cards → Tab Switcher → Pricing → FAQ → CTA Slab → Footer. |
| **L16** | Hero fails fold ownership | `major` | Hero shorter than 100vh with subsequent section peeking awkwardly above the bottom edge. |
| **L17** | Content flung to far edges | `minor` | Layout clusters slammed to viewport rims with a hollow chasm in between. |
| **L18** | Fixed background trailing scroll | `minor` | Static background sheet pinned with `position: fixed` dragging behind scrolling sections. |
| **L19** | Recycled house style | `major` | Re-skinning identical layouts across different clients and briefs. |
| **L20** | Botched oversized footer wordmark | `major` | Giant brand wordmark clipped, off-center, or clashing with background graphics. |
| **L21** | Repeated section template | `major` | 3 or more sections in a row using identical 3-column card layouts with only icons swapped. |

---

### M — Motion & Interaction (Axis 5)

| ID | Tell | Sev | Description & Evidence |
|----|------|-----|------------------------|
| **M1** | Invisible-content trap | **crit** | Elements initialized with `opacity: 0` or `translate` waiting for JS scroll events. (Absolute Rule 1 violation). |
| **M2** | Hover boop | `minor` | Buttons that translate upwards (`translateY(-2px)`) or scale up on hover. |
| **M3** | Underline-fill hover | `minor` | Expanding or wiping underline animations on links and ghost buttons. |
| **M4** | Default card hover-lift | `minor` | `translateY(-4px)` + diffuse drop shadow bloom on card hover. |
| **M5** | Sun/Moon theme toggle | `minor` | Stock sliding toggle with generic sun and moon icons. |
| **M6** | Botched fill animation | `major` | Distorted radii, jittery spring easings, or incomplete progress tracks. |
| **M7** | Dead page | `major` | Zero interactive feedback, no hover states, no subtle life or responsiveness. |
| **M8** | Dead controls | **crit** | Buttons, tabs, dropdowns, or accordions that look active but do nothing when clicked. (Absolute Rule 6 violation). |

---

### X — Execution & Craft (Axis 6)

| ID | Tell | Sev | Description & Evidence |
|----|------|-----|------------------------|
| **X1** | Nothing actually centered | **crit** | Text floating high in pills, icons off-center in tiles, bad SVG `dominant-baseline`. (Absolute Rule 4 violation). |
| **X2** | Content sliced by edge | **crit** | Glyphs shaved flat, button labels truncated, descenders clipped by `overflow: hidden`. (Absolute Rule 2 violation). |
| **X3** | Ragged comparison columns | **crit** | Pricing cards with mismatched heights, unaligned prices, or misaligned buttons. (Absolute Rule 3 violation). |
| **X4** | Text jammed against edges | `major` | Typography touching viewport edges with zero margin or padding. |
| **X5** | Unreadable contrast | **crit** | Low-contrast text washing into its background. (Absolute Rule 5 violation). |
| **X6** | Default all-around shadow | `major` | Symmetric blurry black shadows (`box-shadow: 0 0 20px rgba(0,0,0,0.5)`). |
| **X7** | Fake shadow offset box | `major` | An offset colored duplicate rectangle used to simulate depth. |
| **X8** | Hard-edged shadow box | `major` | Shadows with harsh, un-feathered geometric edges. |
| **X9** | Bloom = blurred self-copy | `major` | Glows created by copying the element, blurring it, and placing it underneath. |
| **X10** | Off-center strike line | `major` | Strike-through price line floating above or below the optical glyph center. |
| **X11** | Clipped at section overlap | **crit** | Overlapping layers guillotining children with `overflow: hidden`. (Absolute Rule 2 violation). |
| **X12** | Cut-off glow edge | `major` | Radial lighting or glow clipped by a container boundary in a sharp flat line. |
| **X13** | Hard image seams | `major` | Unmasked full-bleed photography ending abruptly against colored sections. |
| **X14** | Focus states stripped | `major` | `outline: none` or `:focus { outline: none; }` without an authored accessible replacement. |

---

## 3. The Positive Rubric: Signature & Cohesion

Dodging tells only brings a design to neutral zero. Distinction is built through **Axis 7 (Signature)** and **Axis 8 (Cohesion)**.

### Axis 7 — Signature & Uniqueness Formula

Score each element **0** (absent), **50** (attempted/weak), or **100** (strong).  
*Gate:* If Axis 7 average is `< 40`, the entire page is capped at **59** (Grade C max).

```
Uniqueness = (S1 + S2 + S3 + S4 + S5 + S6 + S7) / 7
```

1. **S1: Signature Artifact** — A custom, bespoke focal object (crafted SVG scene, authentic high-fidelity product interface, or bespoke illustration) that could only belong to this brand.
2. **S2: Atmosphere** — Composed lighting, physical texture, noise grain, or tonal depth sustained throughout the entire page (not dying at the hero fold).
3. **S3: Layered Depth** — Visual planes (background scene, midground artifact, foreground copy) that overlap and interact organically across boundaries.
4. **S4: Character Display Face** — An opinionated, curated display typeface matched to the brand brief, rather than default geometric sans from a UI library.
5. **S5: Bespoke Silhouette** — An unmistakable custom shape or geometry signing the system (notched cards, custom brackets, invented dividers, or tailored contours).
6. **S6: Treated Navigation** — A deliberate, thoughtfully positioned navigation experience (floating dock, integrated pill, custom brand architecture) that belongs to the system.
7. **S7: Real Specificity** — Genuine copy, authentic data, real product screenshots, and credible brand attributes rather than lorem ipsum or placeholder text.

### Axis 8 — Cohesion System

Score each check **0**, **50**, or **100**.

```
Cohesion = (H1 + H2 + H3 + H4) / 4
```

1. **H1: One Palette, Held with Discipline** — A tightly calibrated color scheme where sections transition with tonal harmony rather than disparate accent clashes.
2. **H2: One Type Voice** — A disciplined typographic hierarchy with one display voice and a quiet, highly legible neutral partner.
3. **H3: One System** — Uniform radii logic, consistent border treatment, matching arrow icons, and unified depth rules across every component.
4. **H4: Composed from the Brief** — Layouts engineered directly for the specific subject matter, rather than generic SaaS template stencils.

---

## 4. Slop → Premium Conversion Pairs

| Element | The Slop Version | The Premium Craft Version |
|---------|------------------|---------------------------|
| **Glass** | Milk-white blur box with blue glow bleeding underneath (`K25`) | Crisp backdrop filter with subtle edge highlights, 1px top-lip glare, directional lighting, and physical depth. |
| **Borders** | Harsh 1px white/gray line on every card (`K13`) | Self-colored borders: subtle tonal value shifts, low-opacity matching borders, inner highlights. |
| **Accent Bar** | Straight colored line stamped on card edge (`K15`) | Custom geometry: chamfered corners, custom brackets, or architectural notches. |
| **Icons** | Stock icon-pack glyphs inside colored circles (`K1`, `K4`) | Tailored iconography matching the typography weight, corner radius, and grid. |
| **Shadows** | Fluffy diffuse black halos on all 4 sides (`X6`) | Tight, directional, low-offset shadows tinted with the ambient substrate color. |
| **Glows** | Symmetrical blue/purple radial bloom (`C1`, `C5`) | Directional rake of light from a discernible source with soft quadratic falloff. |
| **Grid** | Generic graph paper or blueprint grid across the page (`C15`) | Micro-grid texture reserved for a single technical focal card or instrument panel. |
| **Gradient** | Banded, plastic 2-color transitions (`C14`) | Dithered, multi-stop gradients infused with fine substrate noise. |
| **Mockup Window**| Empty gray box with 3 colored dots (`K7`) | Fully articulated, interactive or detailed product view showcasing genuine workflows. |
| **Motion** | Hidden content fading in on scroll (`M1`), generic boops (`M2`) | Fluid, physics-based micro-interactions, responsive states, content visible immediately. |

---

## 5. Adding Soul by Axis

- **Color & Light:** Choose an unexpected, intentional hero tone (e.g., warm terracotta, rich moss, deep obsidian bronze) instead of default slate/indigo.
- **Typography:** Pair an expressive display typeface with a crisp, neutral reading font. Give copy an authentic human voice with varied sentence rhythms.
- **Components:** Design functional, tactile components with bespoke details (e.g., custom tab indicators, distinctive toggle switches).
- **Layout:** Break standard 3-card templates with rhythmic asymmetry: wide hero callouts, anchor points, and intentional whitespace.
- **Motion:** Replace generic scroll fades with organic hover depth, magnetic cursors, or responsive tactile button depressions.
- **Execution:** Perfect alignment, ensure optical baseline centering, and maintain strict accessibility focus rings (`:focus-visible`).

---

## 6. Scoring Formula & Grade Scale

### Axis Score Calculation
For tell-counted axes (Axes 1–6):
$$\text{Score} = \max(0, 100 - (30 \times \text{crit}) - (15 \times \text{major}) - (5 \times \text{minor}))$$

### Overall Weighted Score
$$\text{Overall} = \frac{2A_1 + 2A_2 + 1A_3 + 2A_4 + 1A_5 + 2A_6 + 3A_7 + 2A_8}{15}$$

### Gating Caps
- If any **Critical Tell** (`M1`, `M8`, `X1`, `X2`, `X3`, `X5`, `X11`) is confirmed: Overall capped at **69** max.
- If **Axis 7 (Signature)** is `< 40`: Overall capped at **59** max.
- If **Layout & Composition (Axis 4)** has $\ge 3$ major tells: Axis 4 capped at **40** max.

$$\text{Slop Index} = 100 - \text{Overall}$$

| Grade | Overall Score | Slop Index | Verdict |
|-------|---------------|------------|---------|
| **A** | 80 – 100 | 0 – 20 | **Premium** — Deliberate, signed, masterfully executed |
| **B** | 60 – 79 | 21 – 40 | **Considered** — Thoughtful, few defaults, clean |
| **C** | 40 – 59 | 41 – 60 | **Generic** — Clean but templated, lack of signature |
| **D** | 20 – 39 | 61 – 80 | **Slop** — Assembled from known AI presets |
| **F** | 0 – 19 | 81 – 100 | **Pure Slop** — Default-heavy, broken execution |
