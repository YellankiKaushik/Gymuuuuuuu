# Fitness OS design system

Fitness OS makes source-backed knowledge approachable and optional local tracking
understandable. Its visual voice is calm, practical and precise. A person should
recognize the next action, the evidence limitations and where their records live.
This document governs presentation; AGENTS.md governs engineering and data safety.

## References and decisions

The [project repository](https://github.com/YellankiKaushik/Gymuuuuuuu) was inspected
alongside [awesome-design-md](https://github.com/VoltAgent/awesome-design-md).
The latter supplies third-party website analyses, not official company systems or
a React component library. These are influences for original Fitness OS work:

| Reference                                                                                                       | Adopted principle                                                       | Fitness OS interpretation                                                                                             |
| --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [NerdWallet](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/nerdwallet/DESIGN.md) — primary | Green hierarchy, mint surfaces, restrained corners and flat comparisons | Keep forest/sage identity; one clear lead action; use rules and surface changes instead of floating cards.            |
| [IBM](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/ibm/DESIGN.md) — data and forms        | Orderly fields, explicit states and disciplined data layouts            | Native labelled controls, visible focus, strong control borders, readable values and clear destructive confirmations. |
| [Oura](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/oura/DESIGN.md) — wellness            | Warm neutrals and generous editorial pacing                             | Warm ownership panels and breathing room around Home and recovery content; keep dense tracking forms practical.       |

Resolve conflicts in that order. Fitness OS retains its system fonts, Lucide icons,
navigation and existing responsive behavior. Company names, marks, proprietary
fonts, photography, marketing language and exact brand palettes are not assets for
this project. The supplied research report is background analysis, not a separate
instruction source. Its proposed roadmap and numerical ratings are not requirements.

## Canonical tokens

`src/styles/foundation.css` owns base colors. `shell.css` extends those tokens;
`visual-system.css` applies shared presentation after feature styles. Keep Tailwind
and existing named CSS classes. Add no second theme provider or styling framework.

| Token                | Light     | Dark      | Role                                       |
| -------------------- | --------- | --------- | ------------------------------------------ |
| `--canvas`           | `#f7f8f4` | `#12231b` | Page background                            |
| `--surface`          | `#ffffff` | `#1b2f24` | Cards and controls                         |
| `--surface-soft`     | `#f0f3ed` | `#223a2c` | Headers and quiet groupings                |
| `--text`             | `#20372c` | `#eaf0e8` | Primary text                               |
| `--muted`            | `#5e6b63` | `#a7b7ac` | Supporting text, never disabled by default |
| `--line`             | `#e0e6dc` | `#35483b` | Decorative dividers                        |
| `--control-line`     | `#7e8c81` | `#829788` | Visible form boundaries                    |
| `--accent`           | `#285a3c` | `#b6d69c` | Main actions, selection                    |
| `--on-accent`        | `#ffffff` | `#12231b` | Text on filled accent buttons              |
| `--accent-soft`      | `#e8f0df` | `#30482a` | Selection and icon backgrounds             |
| `--wellness-surface` | `#f4f0e7` | `#2b3429` | Warm informational panels                  |
| `--info`             | `#2c6e9e` | `#89b7d3` | Methodology and information                |
| `--warning`          | `#8d5510` | `#dab064` | Cautions                                   |
| `--danger`           | `#ad3535` | `#ef8d8d` | Errors and destructive actions             |

Home's introductory band uses `--intro-surface`, `--intro-text` and
`--intro-muted` as a separate contrast pair in each theme. Never reuse a light
surface token as button text merely because it currently looks white.

Use 6px control corners (`--radius-sm`), 10px data-card corners (`--radius-md`)
and 14px wellness/panel corners (`--radius-lg`). Circular icon buttons and existing
specialized controls may retain their geometry. Default cards have no shadow;
dialogs and navigation overlays retain elevation. Spacing follows 4/8/12/16/24/32/48px;
`--space-card` is 24px and `--space-section` is 32px. Compact mobile panels use 16–24px.

## Typography and hierarchy

Keep Segoe UI, Helvetica Neue, Arial and sans-serif fallbacks; no font requests.
Body text is 16px, with 14px supporting copy and 12px metadata. Keep essential
values readable rather than shrinking them to fit. Use 1.5–1.7 line height for
reading and 1.12–1.25 for headings. Home display text scales from 30px to 46px,
weight 600, with natural wrapping. Ordinary page headings follow the existing
30px mobile / 36px desktop scale. Keep body and form text in the sans stack.

Use one h1 per page, descriptive section headings, and short labels. Eyebrows
provide context, not instructions. Use tabular numerals for data cells; always
show units and missing-value labels. Underline prose links and hoverable actions;
an arrow alone must never carry the accessible name.

## Components and state

- **Home:** preserve all six areas and their destinations. Use the dark forest
  introduction for the two entry actions, a warm adjacent ownership explanation,
  then flat module cards. State that tracking is optional. Explain browser storage
  and backup using ordinary language; implementation terms belong in technical docs.
- **Buttons:** retain a minimum 44px target. Use filled accent for the principal
  action, bordered secondary controls and explicit danger treatment for deletion.
  Dark-theme button text uses `--on-accent`. Hover must not move the layout.
- **Cards and comparisons:** quiet surfaces, one-pixel rules, consistent internal
  spacing, visible headings. Comparison field labels are muted; values have full
  text contrast. Preserve field order, units, source links and provenance.
- **Tables:** semantic captions/headers, left-aligned readable content, tabular
  values and visible row separation. Keep existing mobile card layouts and local
  scroll wrappers; never hide unavailable or uncertain values to simplify a view.
- **Forms:** native controls with associated labels and persistent helper/error
  text. A control border uses `--control-line`, not a decorative divider. Retain
  browser validation. Style `aria-invalid=true` as an error where provided, without
  changing validation logic or treating every unfilled required field as an error.
- **Feedback:** `StatusBadge` and `InfoCallout` retain their typed tone variants.
  Border emphasis accompanies existing text/icons; color is supplementary. Keep
  saved, preview-only, incomplete, unavailable and failed states distinct.
- **Local data:** keep backup/restore/reset actions separate. Preview and validate
  before writes, retain conflict explanations and destructive confirmations, and
  keep save feedback visible. No display change may alter those behaviors.
- **Recovery and Progress:** calmer spacing and warm surfaces support reading;
  measurements remain literal records. Do not invent scores, trends, streaks,
  benchmarks, recommended targets or personal statistics for visual completeness.

## Responsive, themes and accessibility

Preserve the shell's existing 1024px desktop sidebar and 640px mobile navigation
boundaries. Home uses three columns at 1280px+, two at 540–1279px, and one below
540px; its introduction stacks below 768px. Keep navigation destinations, Escape
behavior, focus restoration, search shortcuts and hydration-disabled controls.

Verify 320px mobile, tablet and 1440px desktop layouts. Reflow text and controls;
let wide data regions scroll locally. Avoid page-level horizontal scrolling.
Keep 44px targets, visible focus and labelled controls. Target WCAG 2.2 AA,
including 4.5:1 normal-text and 3:1 control/focus contrast against adjacent surfaces.
Never remove outlines, keyboard controls, live save feedback or equivalent tables.

Light, Dark and Auto (System) share semantic roles. Keep the existing preference
schema and pre-paint theme behavior. Reduced motion disables animation and card
movement. Print must remain legible without background printing; the Home band
explicitly switches to white with dark text.

## Change discipline

Make presentation changes inside existing React/strict TypeScript/CSS components.
Preserve TanStack routing, IndexedDB schemas, import validation, content IDs,
canonical units, source/review metadata and SSR privacy boundaries. No external
runtime APIs, fonts, cloud storage, UI kit or second icon library are needed.

Record scope decisions in `docs/decisions` and update the phase checklist/handoff.
Run formatting, lint, strict typecheck, foundation/unit tests and the production
build, then relevant desktop/mobile, keyboard, theme, accessibility and local-data
journeys. Retain current-run evidence separately from historical release claims.
