# Phase 01 — Application Shell, Navigation and Design System

**Project:** Fitness Knowledge and Tracking Application  
**Working product name:** Fitness OS  
**Document type:** Lovable implementation specification  
**Phase:** 01 of 20  
**Version:** 1.0  
**Date:** 4 August 2026  
**Status:** Ready for Lovable Plan mode

---

## Document purpose

This document tells Lovable exactly how to create the stable application shell, navigation architecture and reusable visual system for the complete fitness application. It converts the permanent rules from Phase 00 into an implemented responsive interface without building the domain-heavy modules that belong to later phases.

Phase 01 is successful only when later modules can be added without redesigning the navigation, duplicating visual primitives or breaking responsive behavior. The output must feel like the foundation of a serious fitness and health product, not a temporary landing page or a generic admin dashboard.

## How to use this document in Lovable

1. Create or open the project established by Phase 00.
2. Confirm the Phase 00 Project Knowledge is still present in **Project settings → Knowledge**.
3. Attach the Phase 00 Master Foundation document and this Phase 01 document.
4. Use the Plan-mode prompt in Section 32 before permitting code changes.
5. Inspect Lovable’s plan for exact file impact, protected areas and acceptance criteria.
6. Approve the plan only after it matches this specification.
7. Run the Agent-mode prompt in Section 33.
8. Run the verification prompt in Section 34 and manually test the matrix in Section 28.
9. Fix every Phase 01 defect before beginning Phase 02.
10. Create a stable GitHub checkpoint named `phase-01-shell-complete`.

---

## 1. Phase objective

Create a polished, accessible and responsive application frame that supports every planned fitness module while remaining useful before the detailed datasets exist.

The phase must establish:

- A reusable app shell for mobile, tablet and desktop.
- A stable route contract and navigation manifest.
- A working home screen that introduces the product without fake data.
- Accessible desktop sidebar, top bar, mobile navigation and “More” menu.
- A route-aware global search shell for navigation.
- Breadcrumbs, page headers and section-navigation patterns.
- Light and dark semantic design tokens.
- Shared typography, spacing, elevation, icon, motion and layout rules.
- Reusable loading, empty, unavailable and error states.
- Placeholder route screens for all future modules.
- Technical primitives that later phases must reuse rather than replace.

## 2. Phase dependencies and assumptions

### 2.1 Required Phase 00 outputs

Phase 01 assumes the project already contains or is prepared to contain:

- The native Lovable scaffold.
- TypeScript strict mode.
- Tailwind styling.
- Shared source, unit and value-status types.
- Basic route placeholders or a route contract.
- Global loading, empty and error primitives.
- `AGENTS.md` with permanent project constraints.
- `docs/phases/` and decision-record folders.
- No authentication, backend or cloud personal-data dependency.

If any foundation item is missing, Lovable must add the minimum required implementation and report it explicitly rather than silently changing architecture.

### 2.2 Working product name

Use **Fitness OS** as a temporary working name. Store it in one configuration or constants file and reuse that value. Do not hard-code the name across components. A later branding decision must be possible through one controlled change.

### 2.3 Native framework rule

Keep the existing Lovable-native framework. New Lovable applications created after 13 May 2026 use TanStack Start with server-side rendering except where the current workspace uses a different supported scaffold. Do not migrate frameworks during this phase.

### 2.4 No final domain data

Phase 01 may use only a small, clearly labelled navigation manifest and neutral placeholder copy. It must not generate fake exercise records, foods, nutrient values, workout programs, personal statistics or health recommendations.

## 3. Required deliverables

Lovable must produce all of the following:

1. Responsive application shell.
2. Desktop navigation sidebar with expanded and collapsed modes.
3. Tablet navigation behavior.
4. Mobile top bar, bottom navigation and accessible “More” sheet.
5. Route-aware global search/command dialog.
6. Home screen foundation.
7. Placeholder screens for the complete route contract.
8. Breadcrumbs and standard page-header component.
9. Reusable module, metric, status and callout primitives.
10. Semantic light and dark themes.
11. Shared design-token documentation.
12. Navigation manifest and typed navigation models.
13. Accessible 404 and route-error screens.
14. Shell tests and responsive verification.
15. Updated project documentation describing the shell and design system.

## 4. Scope boundaries

### 4.1 Build in this phase

- Shell layout and navigation.
- Route registration and neutral placeholders.
- Home screen introduction and module entry cards.
- Theme switching and device-local UI preferences.
- Navigation-only global search.
- Reusable page composition components.
- Accessible feedback states.
- Design tokens and component conventions.
- Minimal route metadata and public-page SEO defaults.
- Development/test documentation.

### 4.2 Do not build in this phase

- Authentication, profiles, avatars or account menus.
- Supabase, Lovable Cloud, Firebase or another database.
- Workout logging or exercise-set forms.
- Food logging, calorie totals or diet calculations.
- Charts containing fabricated progress.
- Muscle, exercise, food, nutrient, recipe or supplement datasets.
- AI coaching or recommendations.
- Final global entity search.
- Favourites, recent entities or comparisons beyond navigation placeholders.
- Final offline/PWA caching strategy.
- Final media or video integrations.
- Marketing pricing, testimonials, newsletter capture or conversion funnels.

## 5. Shell conceptual model

The interface must support five high-level activities:

| Activity | User intent | Main destinations |
| --- | --- | --- |
| Learn | Understand the body, exercises and health concepts. | Muscles, exercises, training science, nutrients, supplements. |
| Train | Choose, perform and eventually track training. | Programs, workout workspace, cardio. |
| Eat | Understand foods and optionally plan or record intake. | Foods, diet, recipes, nutrition log. |
| Recover | Improve sleep, mobility and recovery practices. | Recovery and mobility. |
| Progress | Review optional locally stored results. | Progress dashboard and history routes. |

The shell must not imply that tracking is mandatory. Public knowledge and navigation remain useful with no personal records.

## 6. Navigation architecture

### 6.1 Canonical navigation groups

Use one typed navigation manifest as the source of truth. Desktop, mobile, breadcrumbs and route search must derive their labels and route relationships from the same manifest.

| Group | Primary route | Children |
| --- | --- | --- |
| Home | `/` | None. |
| Learn | `/learn` | Muscles, Exercises, Training science, Nutrients, Supplements. |
| Train | `/programs` | Programs, Workout, Workout history, Cardio. |
| Eat | `/foods` | Foods, Diet planning, Recipes, Nutrition log. |
| Recover | `/recovery` | Recovery, Mobility. |
| Progress | `/progress` | Progress dashboard. |
| Tools | `/tools` | Calculators, timers and comparison tools placeholder. |
| Saved | `/saved` | Saved items placeholder. |
| Settings | `/settings` | Appearance, units, local data and privacy placeholder. |
| Sources | `/about/sources` | Evidence, methodology and source standards placeholder. |

### 6.2 Canonical route list

The following routes must exist after Phase 01. Dynamic detail routes may display a neutral “content not yet available” state when no valid item exists.

| Route | Page label | Navigation exposure | Phase 01 behavior |
| --- | --- | --- | --- |
| `/` | Home | Primary | Implemented shell home. |
| `/learn` | Learn | Primary/desktop | Module overview placeholder. |
| `/muscles` | Muscles | Learn child | Catalogue placeholder. |
| `/muscles/$slug` | Muscle detail | Contextual only | Safe not-found/unavailable template. |
| `/exercises` | Exercises | Learn child | Catalogue placeholder. |
| `/exercises/$slug` | Exercise detail | Contextual only | Safe not-found/unavailable template. |
| `/training-science` | Training science | Learn child | Article-hub placeholder. |
| `/programs` | Workout programs | Train primary | Programme catalogue placeholder. |
| `/programs/$slug` | Program detail | Contextual only | Safe not-found/unavailable template. |
| `/workout` | Workout | Train child | Optional tracker introduction placeholder. |
| `/workout/history` | Workout history | Train child | No-records placeholder. |
| `/cardio` | Cardio | Train child | Module placeholder. |
| `/foods` | Foods | Eat primary | Catalogue placeholder. |
| `/foods/$slug` | Food detail | Contextual only | Safe not-found/unavailable template. |
| `/nutrients` | Nutrients | Learn child | Catalogue placeholder. |
| `/nutrients/$slug` | Nutrient detail | Contextual only | Safe not-found/unavailable template. |
| `/diet` | Diet planning | Eat child | Educational tools placeholder. |
| `/recipes` | Recipes | Eat child | Catalogue placeholder. |
| `/recipes/$slug` | Recipe detail | Contextual only | Safe not-found/unavailable template. |
| `/nutrition-log` | Nutrition log | Eat child | Optional tracker introduction placeholder. |
| `/recovery` | Recovery | Primary/More | Module placeholder. |
| `/mobility` | Mobility | Recover child | Module placeholder. |
| `/supplements` | Supplements | Learn child | Evidence-library placeholder. |
| `/progress` | Progress | Primary/mobile | No-records dashboard foundation. |
| `/tools` | Tools | Secondary/More | Tools catalogue placeholder. |
| `/saved` | Saved | Secondary/More | No-saved-items state. |
| `/settings` | Settings | Secondary/More | Basic appearance/preferences shell. |
| `/about/sources` | Sources and methodology | Footer/More | Source-governance placeholder. |

### 6.3 Navigation labels

- Use sentence case: “Training science,” not “Training Science.”
- Keep primary labels short enough for mobile.
- Use “Workout” for the active session workspace and “Workout history” for past sessions.
- Use “Nutrition log,” not “Diet tracker.”
- Use “Progress,” not “Analytics,” in user-facing primary navigation.
- Use “Sources,” not “Scientific proof.”

## 7. Desktop application shell

### 7.1 Layout

At desktop widths of 1024 px and above:

- Show a persistent left sidebar.
- Show a top bar aligned to the content region.
- Render main content inside a centred fluid container.
- Permit an optional contextual right rail on future detail pages without changing shell width rules.
- Keep the sidebar fixed while the main content scrolls.
- Do not make the entire application a grid of dashboard cards.

### 7.2 Sidebar dimensions

- Expanded width: 272 px.
- Collapsed width: 80 px.
- Minimum viewport height: full dynamic viewport.
- Use a subtle border or background distinction, not a heavy shadow.
- Persist expanded/collapsed preference locally.
- Collapsed icons require tooltips and accessible names.

### 7.3 Sidebar composition

From top to bottom:

1. Brand/home link.
2. Primary navigation groups.
3. Flexible spacer.
4. Secondary links: Tools, Saved and Sources.
5. Settings link.
6. Collapse/expand control.

There must be no account avatar, sign-in button, upgrade button or notification bell.

### 7.4 Group behavior

- Home, Progress, Tools, Saved and Settings are direct links.
- Learn, Train, Eat and Recover may expand to expose children.
- The current group should remain expanded.
- Expanded states may persist locally but must not override current-route visibility.
- Parent items remain navigable even when they expose children.
- The active route must be visually obvious without depending only on colour.

## 8. Tablet application shell

At widths from 640 px through 1023 px:

- Use a compact top bar.
- Use a temporary slide-over navigation drawer instead of a permanently wide sidebar.
- Preserve breadcrumb and page-header hierarchy.
- Allow two-column module-card layouts where content fits.
- Do not compress desktop tables into unreadable widths.
- Core actions require at least 44 × 44 px touch targets.
- Navigation drawer must trap focus, close on Escape and restore focus to the trigger.

## 9. Mobile application shell

### 9.1 Mobile top bar

Below 640 px:

- Show the product mark/name on the left.
- Show global-search trigger and “More” trigger on the right.
- Keep the bar compact and sticky where it does not obstruct content.
- Do not show account controls.

### 9.2 Mobile bottom navigation

Use five visible destinations:

1. Home
2. Learn
3. Train
4. Eat
5. Progress

Requirements:

- Use both icon and text label.
- Respect device safe-area insets.
- Minimum tap target 48 px high.
- Active destination uses shape, weight and colour—not colour alone.
- Hide the bottom bar only during future focused workout-session modes when a later phase explicitly requires it.
- Avoid animated bouncing or attention-grabbing badges.

### 9.3 Mobile “More” sheet

The “More” action opens an accessible bottom sheet or drawer containing:

- Recover
- Mobility
- Tools
- Saved
- Settings
- Sources

The sheet must:

- Have a visible title.
- Trap focus while open.
- Close on Escape, overlay click and explicit close action.
- Restore focus to the trigger.
- Remain fully usable at 320 px width.

## 10. Global top bar

Desktop and tablet top bars must support:

- Current section/page context.
- Global search trigger.
- Theme toggle.
- Optional contextual action slot for later phases.

Rules:

- Height target: 64 px desktop/tablet.
- Do not show fabricated alerts, profile controls or cloud-sync status.
- Search trigger should show the keyboard hint on desktop where space allows.
- The theme toggle must have an explicit accessible label and state.
- Contextual actions must not be embedded directly into the shell; use a typed slot/prop.

## 11. Breadcrumbs and page hierarchy

### 11.1 Breadcrumb rules

- Show breadcrumbs on detail pages and nested utility routes.
- Omit breadcrumbs on Home.
- On mobile, allow compact truncation while retaining the current page.
- Use semantic navigation with an accessible label.
- Never generate breadcrumb labels by title-casing raw slugs.
- Derive labels from route/entity metadata.

Examples:

```text
Learn / Exercises
Learn / Exercises / Barbell back squat
Eat / Foods / Spinach, raw
Train / Workout history
```

### 11.2 Standard page header

Create one reusable `PageHeader` pattern with:

- Eyebrow or section label, optional.
- Page title.
- Concise description.
- Optional metadata/status row.
- Optional primary and secondary actions.
- Optional tabs or section navigation below.

The component must support simple text pages and data-heavy pages without forcing every page into a card.

## 12. Global search shell

### 12.1 Phase 01 functionality

Implement navigation search only. It should search route names, descriptions and aliases from the typed navigation manifest.

Examples:

- Searching “calorie” returns Diet planning and Tools.
- Searching “vitamin” returns Nutrients.
- Searching “sleep” returns Recovery.
- Searching “log workout” returns Workout.

### 12.2 Interaction

- Open with the search button.
- Open with `Ctrl+K` on Windows/Linux and `Cmd+K` on macOS.
- `/` may open search only when focus is not inside an editable field.
- Arrow keys move through results.
- Enter opens the highlighted result.
- Escape closes the dialog.
- Results must announce changes to assistive technologies.

### 12.3 Search states

- Initial: show major destinations and keyboard guidance.
- Query with matches: grouped result list.
- Query with no matches: neutral no-results state and clear query action.
- Future entity search groups must have reserved component support but remain unpopulated.

### 12.4 Prohibited behavior

- Do not call an external search API.
- Do not fabricate exercise or food results.
- Do not store search queries outside the device.
- Do not implement engagement-based ranking.

## 13. Phase 01 home screen

The home screen is an orientation page, not the final personal dashboard.

### 13.1 Required sections

1. **Product introduction**
   - Working product name.
   - One concise sentence explaining that the app combines training, nutrition, recovery and optional tracking.
   - No marketing superlatives or fake user counts.

2. **Primary activity cards**
   - Learn
   - Train
   - Eat
   - Recover
   - Progress

3. **Core principles callout**
   - No account required.
   - Knowledge pages work without personal data.
   - Optional records remain on this device until exported.

4. **Explore by module**
   - Muscles
   - Exercises
   - Programs
   - Foods
   - Nutrients
   - Recovery
   - Tools

5. **Sources and methodology link**
   - Explain that detailed content will show sources and review information.

### 13.2 Home-screen rules

- No fabricated “today’s workout.”
- No zero-filled charts.
- No fake streak, calories, body weight or personal-record cards.
- If no personal modules exist yet, use useful navigation rather than empty analytics.
- Keep the reading order logical on mobile.

## 14. Placeholder page standard

Every future module route must render a consistent placeholder that includes:

- Correct page title and description.
- Appropriate section icon.
- Neutral explanation of what the module will contain.
- Links to related available routes.
- No fake list items or sample health claims.
- No technical “Phase 07” language in the user-facing interface.

Recommended copy pattern:

> This section will bring together structured [topic] information and tools. The application foundation is ready, but verified content has not been added yet.

For local-tracking routes, use:

> Tracking is optional. When this module is enabled, records will stay on this device and can be exported for backup.

## 15. Not-found and unavailable behavior

### 15.1 Unknown route

Create a branded, accessible 404 page with:

- “Page not found” title.
- Short explanation.
- Home, search and back actions.
- No blame language.

### 15.2 Unknown dynamic slug

For a route such as `/exercises/unknown-item`:

- Do not crash.
- Show “Exercise not available” or the correct entity label.
- Explain that the record could not be found.
- Link back to the catalogue.
- Do not use the raw slug as verified content.

### 15.3 Route error boundary

- Show a safe recovery message.
- Include retry and return-home actions where appropriate.
- Do not expose stack traces or environment details to users.
- Preserve non-sensitive diagnostics for development.

## 16. Design-system foundation

### 16.1 Visual character

The product must feel:

- Serious
- Calm
- Athletic
- Evidence-aware
- Dense enough for reference use
- Comfortable for repeated daily use

It must not feel:

- Like a neon bodybuilding poster
- Like a gaming dashboard
- Like a medical hospital system
- Like a cryptocurrency product
- Like a generic corporate admin panel
- Like a social-media feed

### 16.2 Semantic colour tokens

Use semantic tokens, not direct colours inside individual components. Lovable may translate these values into the theme format used by the existing scaffold.

#### Light theme

| Token | Reference value | Purpose |
| --- | --- | --- |
| Background | `#F6F8F6` | Main page background. |
| Surface | `#FFFFFF` | Primary panels and dialogs. |
| Surface subtle | `#EEF2EF` | Secondary grouping and hover areas. |
| Text | `#17211B` | Primary text. |
| Text muted | `#5D6A62` | Secondary text. |
| Border | `#D8E0DA` | Dividers and component borders. |
| Accent | `#2F7D4A` | Primary actions and active states. |
| Accent hover | `#26683E` | Hover/pressed accent. |
| Accent soft | `#DCEFE3` | Selected backgrounds and information grouping. |
| Information | `#2C6E9E` | Neutral information status. |
| Warning | `#A96812` | Caution. |
| Danger | `#B33D3D` | Errors and destructive actions. |
| Focus | `#66A37A` | Focus ring reference. |

#### Dark theme

| Token | Reference value | Purpose |
| --- | --- | --- |
| Background | `#0E1511` | Main page background. |
| Surface | `#151E18` | Primary panels and dialogs. |
| Surface subtle | `#1E2A22` | Secondary grouping and hover areas. |
| Text | `#F2F6F3` | Primary text. |
| Text muted | `#AAB7AE` | Secondary text. |
| Border | `#334038` | Dividers and component borders. |
| Accent | `#65B77D` | Primary actions and active states. |
| Accent hover | `#7BC88F` | Hover/pressed accent. |
| Accent soft | `#183B25` | Selected backgrounds and information grouping. |
| Information | `#68A7CF` | Neutral information status. |
| Warning | `#D9A14C` | Caution. |
| Danger | `#E07474` | Errors and destructive actions. |
| Focus | `#8ED0A0` | Focus ring reference. |

Lovable must test actual text/background pairings for WCAG AA contrast. Reference values may be adjusted slightly to meet contrast, but the restrained forest/neutral character must remain.

### 16.3 Status colours

Status must never rely only on colour. Pair colour with text and, where useful, an icon.

- Success: completed, valid, saved locally.
- Information: explanatory status.
- Warning: incomplete, estimated or attention required.
- Danger: failed, destructive or invalid.
- Neutral: planned, unavailable or not measured.

### 16.4 Typography

Use a clean sans-serif stack available in the current project. Do not add a heavy font dependency solely for appearance.

Recommended stack:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif;
```

Type scale:

| Style | Desktop size | Mobile size | Weight | Use |
| --- | ---: | ---: | ---: | --- |
| Display | 48 px | 36 px | 700 | Rare home introduction. |
| H1 | 36 px | 30 px | 700 | Page title. |
| H2 | 30 px | 24 px | 650–700 | Major page section. |
| H3 | 24 px | 20 px | 650 | Subsection. |
| H4 | 20 px | 18 px | 600 | Card/section heading. |
| Body large | 18 px | 17 px | 400 | Introductory copy. |
| Body | 16 px | 16 px | 400 | Default text. |
| Body small | 14 px | 14 px | 400 | Supporting text. |
| Label | 13–14 px | 13–14 px | 600 | Field and navigation labels. |
| Caption | 12 px | 12 px | 500 | Metadata only. |

Rules:

- Body line height: approximately 1.55–1.7.
- Headings: approximately 1.15–1.3.
- Avoid uppercase paragraphs.
- Use tabular numerals for metrics and timers when later introduced.
- Do not use font weight as the only hierarchy signal.

### 16.5 Spacing system

Use a 4 px base scale:

```text
1 = 4 px
2 = 8 px
3 = 12 px
4 = 16 px
5 = 20 px
6 = 24 px
8 = 32 px
10 = 40 px
12 = 48 px
16 = 64 px
20 = 80 px
```

Standard patterns:

- Page horizontal padding: 16 px mobile, 24 px tablet, 32 px desktop.
- Page section gap: 40–64 px depending on density.
- Card padding: 16–24 px.
- Form-control vertical gap: 16 px.
- Inline metadata gap: 8–12 px.
- Do not use arbitrary one-off spacing values without documenting the need.

### 16.6 Width and grid

- Maximum shell content width: 1440 px, excluding expanded sidebar.
- Default information-page reading width: 760–840 px.
- Catalogue/grid width: up to 1200 px.
- Use 12-column desktop grid where complex layouts require it.
- Mobile layouts are single-column by default.
- Tablet module grids may use two columns.
- Desktop module grids may use three or four columns depending on content length.

### 16.7 Radius and elevation

| Token | Value | Use |
| --- | ---: | --- |
| Radius small | 8 px | Inputs, chips and compact controls. |
| Radius medium | 12 px | Cards and menus. |
| Radius large | 16 px | Dialogs and prominent panels. |
| Radius pill | 999 px | Chips only. |

- Use shadows sparingly.
- Prefer borders and background hierarchy for most cards.
- Dialogs and floating menus may use one subtle elevation token.
- Avoid glassmorphism, blurred neon glows and excessive gradients.

### 16.8 Icons

- Use one consistent line-icon family already available in the project, preferably Lucide.
- Default stroke should appear balanced at 16–24 px.
- Icons require accessible labels when no visible text is present.
- Do not use emoji as core navigation icons.
- Do not use anatomically inaccurate muscle icons as factual illustrations.

### 16.9 Motion

- Default transition duration: 120–200 ms.
- Use motion to clarify state changes, not decorate the interface.
- Respect `prefers-reduced-motion`.
- Avoid parallax, auto-playing animations, pulsing calls to action and looping decorative motion.
- Drawer/dialog animation must not block interaction after it is visually complete.

## 17. Shared component catalogue

Lovable must create or establish equivalent reusable primitives. Exact file names may follow the native scaffold, but responsibilities must remain clear.

| Component | Responsibility |
| --- | --- |
| `AppShell` | Overall responsive layout and content region. |
| `DesktopSidebar` | Expanded/collapsed desktop navigation. |
| `TabletNavDrawer` | Temporary tablet navigation. |
| `MobileTopBar` | Product mark, search and More actions. |
| `MobileBottomNav` | Five primary mobile destinations. |
| `MoreMenuSheet` | Secondary mobile destinations. |
| `TopBar` | Desktop/tablet context, search, theme and action slot. |
| `GlobalSearchDialog` | Keyboard-accessible navigation search. |
| `Breadcrumbs` | Semantic route/entity hierarchy. |
| `PageHeader` | Title, description, metadata, actions and tabs. |
| `SectionNav` | Local page tabs/anchors without duplicating global navigation. |
| `ModuleCard` | Entry card for a major capability. |
| `LinkCard` | Compact navigational card. |
| `StatusBadge` | Text-plus-colour status. |
| `InfoCallout` | Information, caution and limitation messages. |
| `EmptyState` | No data/no results with recovery action. |
| `UnavailableState` | Content not measured/not yet available. |
| `ErrorState` | Recoverable application error. |
| `LoadingSkeleton` | Stable loading layout. |
| `ThemeToggle` | Light/dark/system preference control. |
| `IconButton` | Accessible icon-only action. |
| `SkipLink` | Keyboard skip to main content. |

### 17.1 Component rules

- Components must accept content through props rather than embed route-specific copy.
- Avoid giant components with unrelated responsibilities.
- Avoid duplicate mobile and desktop page content trees; the shell may render different navigation controls around the same route content.
- Use semantic HTML before ARIA.
- Provide test identifiers only where user-facing queries are insufficient.
- Do not create a component abstraction for a single trivial wrapper unless it encodes a stable design rule.

## 18. Buttons, links, controls and cards

### 18.1 Button hierarchy

- Primary: one dominant action per region.
- Secondary: alternative action.
- Tertiary/ghost: navigation or low-emphasis action.
- Destructive: only for irreversible/local-data deletion actions.

Requirements:

- Use verbs: “Open exercises,” “Start workout,” “Export backup.”
- Avoid vague labels such as “Submit” or “Click here.”
- Disabled buttons require a reason when the reason is not obvious.
- Loading buttons preserve width and announce status.

### 18.2 Link behavior

- Use links for navigation and buttons for actions.
- External links must be visually identifiable and open according to a consistent policy.
- Do not force every link to open a new tab.
- Provide visible focus and underline or equivalent non-colour affordance in body text.

### 18.3 Card behavior

- Cards group related information or provide clear navigation.
- Do not wrap every sentence in a card.
- Entire clickable cards must remain keyboard accessible and avoid nested interactive conflicts.
- Card titles and descriptions must not truncate essential meaning.

## 19. Theme and UI preferences

### 19.1 Theme choices

Support:

- System
- Light
- Dark

Persist the preference locally. The initial render must avoid an obvious theme flash where supported by the native scaffold.

### 19.2 Sidebar preference

Persist desktop sidebar expanded/collapsed state locally. If stored state becomes invalid, fall back safely to expanded.

### 19.3 Future unit preference

Settings may display a non-functional or minimal unit preference shell only if Phase 00 types already support it. Do not implement final unit conversion behavior in Phase 01.

### 19.4 Privacy copy

Settings must clearly state:

- No application account is required.
- Current Phase 01 stores only interface preferences locally.
- Later optional tracking records will remain device-local unless exported.
- Clearing site data can remove local records after tracking modules exist.

## 20. Global application states

### 20.1 Loading

- Route loading must preserve layout dimensions where practical.
- Use skeletons that resemble expected content structure.
- Do not show indefinite spinners as the only feedback for full pages.

### 20.2 Empty

- State what is empty.
- Explain whether tracking is optional.
- Provide one useful next action.
- Avoid guilt or streak-loss language.

### 20.3 No search results

- Echo the query safely.
- Show active filters when future modules use them.
- Provide clear reset and related destination links.

### 20.4 Unavailable information

- Distinguish “not added yet,” “not measured,” “not available” and “failed to load.”
- Never substitute zero or invented copy.

### 20.5 Error

- State what failed in user terms.
- Preserve recoverable state where possible.
- Offer retry, back or home.
- Do not expose technical stack traces.

## 21. Content and interface copy rules

- Use direct, factual language.
- Use sentence case.
- Keep button labels concise.
- Explain technical fitness terms when they first appear in educational content.
- Avoid shaming, guilt, fear and appearance-based pressure.
- Avoid unsupported claims such as “best,” “perfect,” “guaranteed” or “scientifically proven.”
- Do not use motivational quotes as filler.
- Do not imply medical diagnosis or professional oversight.
- Use “estimated” whenever precision is not justified.
- Use “your device” rather than “your account.”

## 22. Accessibility requirements

Target WCAG 2.2 Level AA.

### 22.1 Structure

- Include one main landmark per page.
- Include semantic header, navigation and footer where applicable.
- Maintain logical heading order.
- Include a skip-to-content link.
- Set a meaningful document title for every route.

### 22.2 Keyboard

- Every action must be keyboard operable.
- Focus indicators must be visible in both themes.
- Dialogs, drawers and sheets trap focus and restore it correctly.
- No keyboard trap.
- Collapsed sidebar controls remain understandable.

### 22.3 Screen readers

- Icon-only controls have accessible names.
- Current navigation item exposes current-page state.
- Search result counts and selection changes are announced.
- Loading and error messages use appropriate live-region behavior without excessive interruption.

### 22.4 Visual

- Text contrast meets AA.
- Controls are distinguishable in high-contrast modes where practical.
- Touch targets meet at least 44 × 44 px; mobile primary controls should target 48 px.
- Zoom to 200% must not remove core actions.
- Do not encode status only by colour.

### 22.5 Motion

- Reduced-motion preference removes non-essential animation.
- No content flashes at unsafe frequencies.

## 23. Responsive requirements

Use the scaffold’s breakpoint system consistently. The following behavior contract matters more than exact breakpoint variable names.

| Width | Navigation | Grid | Page padding | Notes |
| --- | --- | --- | --- | --- |
| 320–639 px | Mobile top bar + bottom nav + More sheet | 1 column | 16 px | Must work at 320 px without horizontal page scroll. |
| 640–767 px | Tablet top bar + drawer or mobile pattern | 1–2 columns | 20–24 px | Avoid compressed sidebar. |
| 768–1023 px | Tablet drawer | 2 columns | 24 px | Contextual layouts may split. |
| 1024–1279 px | Desktop collapsed/expandable sidebar | 2–3 columns | 24–32 px | Stable content region. |
| 1280 px and above | Desktop sidebar | 3–4 columns | 32 px | Cap content widths. |

Additional rules:

- No unintentional horizontal page scrolling.
- Long route labels wrap or truncate with accessible full text.
- Dialogs fit the visual viewport and remain scrollable internally.
- Bottom navigation must not cover final content; reserve safe spacing.
- Landscape mobile must remain functional.

## 24. Performance requirements

- Keep the initial shell bundle lean.
- Do not preload large future datasets.
- Use route-level code splitting where supported by the native framework.
- Avoid large animation or chart libraries in this phase.
- Use inline or local icons from the chosen icon package rather than image files for navigation.
- Reserve media loading for later content phases.
- Avoid cumulative layout shift in top bar, sidebar and mobile navigation.
- Build and type-check must pass.

Recommended Phase 01 performance targets on a normal production build:

- No console errors during core navigation.
- Shell interaction remains responsive on a mid-range mobile viewport.
- Initial page should not ship fabricated content payloads.
- Accessibility and semantic correctness take priority over superficial animation scores.

## 25. SEO and document metadata baseline

Public routes need a metadata foundation even before final content exists.

- Unique route title pattern: `[Page] | Fitness OS`.
- Concise route descriptions from route metadata.
- One canonical application origin configuration, not duplicated strings.
- Noindex may be used for incomplete dynamic placeholder pages if supported and appropriate.
- Do not generate structured data for entities that do not exist yet.
- Do not include personal local data in metadata.
- Add meaningful social-preview defaults only if a licensed project image exists; otherwise use simple text metadata.

## 26. Technical implementation contract

### 26.1 Navigation manifest

Create a typed manifest similar in responsibility to:

```ts
export type NavVisibility = "primary" | "secondary" | "contextual";

export interface AppNavigationItem {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: IconKey;
  groupId?: string;
  aliases?: string[];
  visibility: NavVisibility[];
  mobilePrimary?: boolean;
  order: number;
}
```

Requirements:

- IDs are stable and not derived from translated labels.
- Components receive icon keys rather than storing rendered elements in data.
- Route search indexes the same manifest.
- Breadcrumb hierarchy can reference manifest relationships.
- Dynamic entities will extend breadcrumb metadata in later phases.

### 26.2 App configuration

Create one application configuration source for:

- Product name.
- Short product description.
- Default metadata title format.
- Navigation behavior flags where genuinely needed.
- Public application origin placeholder/configuration.

Do not create environment-variable complexity for constants that are not secrets.

### 26.3 UI preference storage

Use a small, versioned local preference object for:

- Theme choice.
- Desktop-sidebar collapsed state.
- Optional last-expanded navigation groups.

Validate stored values and recover from malformed data. Do not use IndexedDB for these small shell preferences.

### 26.4 Client/server boundary

- Theme initialization and local preferences must not cause server-render failures.
- Browser APIs are accessed only inside safe client boundaries.
- Server-rendered navigation remains usable before local preference hydration.
- Do not embed local preference values into shared server logs.

### 26.5 Suggested file responsibilities

Preserve the native scaffold; use equivalent folders if names differ.

```text
src/
  components/
    app-shell/
      app-shell.tsx
      desktop-sidebar.tsx
      tablet-nav-drawer.tsx
      mobile-top-bar.tsx
      mobile-bottom-nav.tsx
      more-menu-sheet.tsx
      top-bar.tsx
    navigation/
      breadcrumbs.tsx
      global-search-dialog.tsx
      navigation-item.tsx
    common/
      page-header.tsx
      module-card.tsx
      info-callout.tsx
      status-badge.tsx
      empty-state.tsx
      unavailable-state.tsx
      error-state.tsx
      loading-skeleton.tsx
      skip-link.tsx
  config/
    app-config.ts
    navigation.ts
  hooks/
    use-ui-preferences.ts
    use-responsive-navigation.ts
  lib/
    navigation-search.ts
    route-metadata.ts
  routes/
    ...route files according to native router
  styles/
    tokens.css
    globals.css
  tests/
    shell/
docs/
  design-system.md
  navigation.md
  phases/phase-01.md
```

### 26.6 Dependency rules

- Reuse current scaffold dependencies where adequate.
- Prefer existing accessible UI primitives.
- Add one icon package only if none exists.
- Do not add a global state library solely for theme/sidebar state.
- Do not add a backend SDK.
- Do not add an analytics SDK.
- Do not add a charting library in this phase.

## 27. Required automated tests

The exact test framework may follow the scaffold. Include tests for:

### 27.1 Navigation manifest

- Unique IDs.
- Unique canonical hrefs.
- Exactly five mobile-primary destinations.
- All mobile-primary destinations are valid routes.
- Parent/child references are valid.
- Search aliases map to expected routes.

### 27.2 Shell behavior

- Active navigation state reflects route.
- Sidebar collapse control updates preference.
- Invalid stored preference falls back safely.
- Theme selection persists.
- Mobile More sheet opens, closes and restores focus.
- Global search opens by keyboard and navigates to a result.

### 27.3 Accessibility

- Skip link reaches main content.
- Icon-only controls have accessible names.
- Dialog/drawer exposes correct accessible semantics.
- Current route is announced.
- Basic automated accessibility scan passes for shell routes.

### 27.4 Routing

- Every canonical route renders without a crash.
- Unknown route displays 404.
- Unknown dynamic slug displays safe unavailable state.
- Page title/metadata is set from route metadata.

## 28. Manual testing matrix

Lovable must test and report each item.

### 28.1 Viewports

- 320 × 568 mobile.
- 375 × 812 mobile.
- 390 × 844 mobile.
- 768 × 1024 tablet portrait.
- 1024 × 768 tablet/compact desktop.
- 1280 × 800 desktop.
- 1440 × 900 desktop.

### 28.2 Navigation tests

- Open every primary and secondary destination.
- Refresh on nested routes.
- Use browser back/forward.
- Collapse/expand sidebar.
- Open/close tablet drawer.
- Open/close mobile More sheet.
- Verify bottom-nav active state.
- Verify focus restoration.

### 28.3 Search tests

- Mouse/touch open.
- `Ctrl+K`/`Cmd+K` open.
- `/` open outside input.
- Arrow and Enter navigation.
- Escape close.
- No-result state.
- Query examples: exercise, sleep, calorie, vitamins, history.

### 28.4 Theme tests

- System theme.
- Manual light.
- Manual dark.
- Refresh persistence.
- No unreadable controls.
- Visible focus in both themes.

### 28.5 Content and overflow tests

- 200% browser zoom.
- Long navigation labels.
- Narrow mobile landscape.
- Keyboard-only navigation.
- Screen-reader landmarks/labels spot check.
- No horizontal body scrolling.

## 29. Lovable implementation sequence

Lovable should implement in this order:

1. Inspect the current scaffold, Phase 00 files and route setup.
2. Produce a file-impact plan and identify any Phase 00 gaps.
3. Create application configuration and typed navigation manifest.
4. Establish semantic design tokens and theme handling.
5. Build shared shell components.
6. Build desktop sidebar and top bar.
7. Build tablet drawer behavior.
8. Build mobile top bar, bottom navigation and More sheet.
9. Build breadcrumbs, PageHeader and reusable feedback states.
10. Build route-aware navigation search.
11. Register routes and neutral placeholders.
12. Build the Phase 01 home screen.
13. Add 404, dynamic unavailable and route-error handling.
14. Add tests.
15. Run build, type-check, tests and responsive inspection.
16. Update `docs/design-system.md`, `docs/navigation.md` and phase records.
17. Report exact files changed, test results and unresolved issues.

## 30. Protected boundaries

Lovable must preserve the following:

- No authentication or account UI.
- No cloud or backend integration.
- No personal server data.
- No fabricated fitness or nutrition content.
- No framework migration.
- No final tracker implementation.
- No final domain datasets.
- No external runtime dependency for core navigation.
- No replacement of Phase 00 domain/source/unit types without an approved documented reason.

Permanent guardrail:

> Preserve all completed modules. Do not refactor, redesign, delete or replace previous functionality unless this phase explicitly requires the change and the approved plan identifies the affected files.

## 31. Phase 01 acceptance criteria

### 31.1 Architecture

- [ ] Existing Lovable-native framework is retained.
- [ ] TypeScript strict checking passes.
- [ ] One typed navigation manifest drives desktop, mobile, breadcrumbs and route search.
- [ ] Product name is configured in one source, not hard-coded repeatedly.
- [ ] UI preferences are validated and stored locally only.
- [ ] No authentication, backend, database, payment or analytics SDK was introduced.

### 31.2 Navigation

- [ ] Desktop sidebar works expanded and collapsed.
- [ ] Tablet drawer is keyboard accessible and restores focus.
- [ ] Mobile bottom navigation has exactly five labelled destinations.
- [ ] Mobile More sheet exposes secondary destinations.
- [ ] Active route is clear without colour alone.
- [ ] Every canonical Phase 01 route renders.
- [ ] Browser refresh works on nested routes in the target deployment environment.

### 31.3 Search

- [ ] Global search opens by button and keyboard shortcut.
- [ ] Search uses navigation metadata only.
- [ ] Keyboard selection and Escape work.
- [ ] No-result state is accessible.
- [ ] No external search service is used.

### 31.4 Design system

- [ ] Light, dark and system themes work.
- [ ] Semantic tokens are used consistently.
- [ ] Typography, spacing, radius, elevation, icon and motion rules are documented.
- [ ] Core components remain readable at 320 px and 200% zoom.
- [ ] No neon/gaming/generic-SaaS visual direction was introduced.

### 31.5 Pages and states

- [ ] Home page provides useful module navigation without fake metrics.
- [ ] Placeholder pages contain correct, neutral descriptions.
- [ ] Unknown routes show a branded 404.
- [ ] Unknown dynamic entities show safe unavailable states.
- [ ] Loading, empty, unavailable and error primitives are implemented.

### 31.6 Accessibility and quality

- [ ] Skip link works.
- [ ] All shell actions are keyboard operable.
- [ ] Focus is visible and managed correctly.
- [ ] Automated shell accessibility checks pass or exceptions are documented.
- [ ] No console errors occur during the core route journey.
- [ ] Build, type-check and tests pass.
- [ ] Lovable reports exact files changed and outstanding limitations.

### 31.7 Documentation and checkpoint

- [ ] `docs/design-system.md` exists and matches implementation.
- [ ] `docs/navigation.md` exists and matches the route manifest.
- [ ] Phase 01 decision changes are recorded.
- [ ] A stable GitHub checkpoint can be created as `phase-01-shell-complete`.

## 32. Phase 01 Plan-mode prompt

Paste this prompt in Lovable Plan mode with Phase 00 and Phase 01 attached:

```text
Read the attached Phase 00 Master Foundation and Phase 01 Application Shell, Navigation and Design System specification completely. Do not modify code yet.

Inspect the current project and prepare a formal implementation plan for Phase 01 only.

The plan must:
1. Confirm the existing native framework, routing method, TypeScript settings, styling system, current dependencies and Phase 00 foundation files.
2. List every file that will be created, modified or intentionally left unchanged.
3. Define how one typed navigation manifest will drive desktop navigation, mobile navigation, breadcrumbs and navigation search.
4. Define the responsive behavior for desktop sidebar, tablet drawer, mobile top bar, five-item bottom navigation and More sheet.
5. Define the semantic light/dark design tokens and how theme preference will be safely initialized and stored locally.
6. Define the reusable shared components and prevent duplicated mobile/desktop page content.
7. Define route placeholders, home screen, 404, dynamic unavailable and route-error behavior without fabricating fitness or nutrition data.
8. Define keyboard, focus, WCAG 2.2 AA and reduced-motion behavior.
9. Define automated and manual tests mapped directly to the Phase 01 acceptance criteria.
10. Identify risks, conflicts with the existing codebase and any necessary deviation from the specification.

Non-negotiable constraints:
- No authentication, accounts, profiles, cloud backend, Supabase, Lovable Cloud, Firebase, payment, analytics SDK or server-side personal-data storage.
- Do not migrate frameworks.
- Do not generate exercise, muscle, food, nutrient, program, recipe or progress datasets.
- Do not build final trackers, calculators or charts.
- Preserve Phase 00 types, docs and constraints unless a change is explicitly justified in the plan.
- Preserve all completed modules. Do not refactor, redesign, delete or replace previous functionality unless Phase 01 explicitly requires it and the plan identifies the affected files.

End the plan with a checklist matching every Phase 01 acceptance criterion. Ask for approval before implementation.
```

## 33. Phase 01 Agent-mode implementation prompt

Use after approving the Plan-mode plan:

```text
Implement the approved Phase 01 plan exactly.

Build the responsive application shell, typed navigation system, design tokens, light/dark/system themes, desktop sidebar, tablet drawer, mobile top bar, five-item mobile bottom navigation, More sheet, top bar, breadcrumbs, PageHeader, navigation search, Phase 01 home screen, neutral module placeholders, loading/empty/unavailable/error primitives, 404 and safe dynamic-slug unavailable states.

Implementation rules:
- Retain the existing Lovable-native framework and strict TypeScript.
- Use one typed navigation manifest as the source of truth.
- Store only small UI preferences locally; validate malformed values.
- Keep browser APIs inside safe client boundaries.
- Use semantic HTML and accessible primitives.
- Meet the responsive and WCAG requirements in the specification.
- Do not add authentication, profiles, backend/database services, payments, analytics, final trackers, calculators, charts or fabricated domain data.
- Do not refactor Phase 00 foundations beyond the approved plan.
- Preserve all completed modules and report any unavoidable deviation before making it.

After implementation:
1. Run type-check, build, tests and the available accessibility checks.
2. Inspect the required mobile, tablet and desktop viewports.
3. Fix failures within Phase 01 scope.
4. Update docs/design-system.md, docs/navigation.md and docs/phases/phase-01.md.
5. Report exact files changed, commands/tests run, results, known limitations and the Phase 01 acceptance checklist status.
```

## 34. Phase 01 verification prompt

Run after Lovable says implementation is complete:

```text
Audit the current project against the attached Phase 01 specification. Do not add new features.

Verify every acceptance criterion and return a table with:
- criterion
- pass/fail
- evidence in the code or UI
- exact file(s)
- corrective action for any failure

Specifically inspect:
- no authentication/backend/payment/analytics dependencies
- route manifest uniqueness and route coverage
- desktop, tablet and mobile navigation behavior
- exactly five mobile-primary destinations
- search keyboard behavior and no-result state
- theme persistence and malformed-preference fallback
- 320 px width, 200% zoom and visible focus
- 404, dynamic unavailable and route-error states
- no fabricated exercises, foods, metrics or charts
- build, type-check, tests and console errors
- design-system and navigation documentation accuracy

Do not claim a pass without evidence. Fix only clear Phase 01 defects after listing them, then rerun the relevant checks and provide the final status.
```

## 35. Focused correction prompt

Use when a Phase 01 review finds defects:

```text
Fix only the Phase 01 defects listed below. Preserve all working behavior and do not redesign unrelated components.

For each defect:
1. Identify the root cause.
2. State the minimal files that must change.
3. Apply the smallest reliable fix.
4. Add or update a regression test where practical.
5. Re-run the relevant checks.

Do not introduce authentication, backend services, fabricated fitness/nutrition data, final tracking logic, new visual direction or framework changes.

Defects:
[PASTE VERIFIED DEFECT LIST]
```

## 36. Phase 02 handoff requirements

Phase 02 will implement the Muscle and Functional Anatomy Library. It may assume Phase 01 provides:

- Stable shell and route layout.
- `/muscles` and `/muscles/$slug` routes.
- Typed navigation metadata.
- PageHeader, breadcrumbs, ModuleCard, StatusBadge, InfoCallout, EmptyState, UnavailableState, ErrorState and LoadingSkeleton.
- Semantic light/dark tokens.
- Responsive catalogue/detail layout primitives.
- Route-level metadata foundation.
- No authentication or backend dependency.

Phase 02 must not replace shell components. It may extend them through documented props or composition slots.

## 37. Completion definition

Phase 01 is complete when:

- The application feels coherent on mobile and desktop.
- Every planned destination is reachable through a stable route.
- The interface clearly communicates the product’s purpose without inventing content.
- The shell is accessible and reusable.
- Theme and navigation preferences work locally.
- Later modules can focus on domain functionality rather than reconstructing basic UI.
- All acceptance criteria are verified.
- The code is checkpointed before Phase 02.

## References

1. Lovable Documentation, “Brainstorm in Plan mode.” https://docs.lovable.dev/features/plan-mode
2. Lovable Documentation, “Build in Agent mode.” https://docs.lovable.dev/features/agent-mode
3. Lovable Documentation, “Define workspace and project knowledge.” https://docs.lovable.dev/features/knowledge
4. Lovable Documentation, “Prompting best practices.” https://docs.lovable.dev/prompting/prompting-one
5. Lovable Documentation, “Best practices.” https://docs.lovable.dev/tips-tricks/best-practice
6. Lovable Documentation, “FAQ — What tech stacks does Lovable use?” https://docs.lovable.dev/introduction/faq
7. Lovable Documentation, “Optimize your app for SEO and AI search.” https://docs.lovable.dev/features/seo-aeo
8. W3C, “Web Content Accessibility Guidelines (WCAG) 2.2.” https://www.w3.org/TR/WCAG22/
