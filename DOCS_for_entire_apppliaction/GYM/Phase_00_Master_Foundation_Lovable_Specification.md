# Phase 00 — Master Foundation and Lovable Operating Specification

**Project:** Fitness Knowledge and Tracking Application  
**Version:** 1.0  
**Status:** Baseline for phased Lovable implementation  
**Prepared:** 4 August 2026  
**Primary owner:** Kaushik  
**Working product name:** Fitness OS (temporary)

> This document is the controlling specification for all later phase documents. Later phases may add detail, but they must not silently contradict this foundation.

## Document purpose

This phase converts the product idea into a stable implementation contract for Lovable. It defines what the application is, what it is not, how data is stored, how modules connect, how content is governed, how Lovable must work phase by phase, and what must exist before feature development begins.

## How to use this package in Lovable

1. Create a new Lovable project and attach this Markdown or DOCX file as context.
2. Paste the separate Phase 00 Project Knowledge text into Project settings → Knowledge.
3. Switch to Plan mode and send the provided Phase 00 Plan prompt.
4. Review and edit Lovable’s plan. Reject any authentication, Supabase, cloud database or premature feature implementation.
5. Approve the plan, switch to Agent mode and send the Phase 00 implementation prompt.
6. Connect GitHub after the foundation is stable and preserve a checkpoint before Phase 01.
7. Do not upload or implement the next phase until every Phase 00 acceptance criterion passes.

## 1. Product charter

### 1.1 Product vision

Create a comprehensive, evidence-aware fitness application that makes fragmented information usable: muscles, exercises, workout science, programs, foods, nutrients, diet planning, recipes, recovery, mobility, supplements, optional logs, calculators and progress analytics in one coherent system.

### 1.2 Primary outcome

A person should be able to learn what to do, understand why, execute a workout or nutrition plan, optionally record results and review progress without creating an account or sending personal records to a server.

### 1.3 Problem statement

Fitness and nutrition information exists, but it is fragmented, inconsistently structured, difficult to compare and frequently mixed with weak claims. Existing apps often separate education from execution or lock useful tracking behind accounts and subscriptions. This product consolidates curated knowledge and practical personal tools while keeping the owner’s records local and portable.

### 1.4 Product classification

- Knowledge platform: muscles, exercises, foods, nutrients, training, recovery and supplement references.
- Planning platform: workout programs, meal structures, routines and calculators.
- Execution platform: workout workspace, timers, checklists and optional logs.
- Analytics platform: progress, adherence, strength, nutrition and recovery trends.
- Not a medical, diagnostic, treatment, rehabilitation or emergency system.

## 2. User and data model

- Primary user: the owner, using the app for long-term personal fitness management.
- Public visitor: any person opening the deployed application can use public knowledge and tools.
- No identity model: the application does not know who a visitor is and does not require an account.
- Device-local personal space: each browser profile has its own saved items and tracking records.
- No automatic cross-device synchronization in the initial product.
- Portability: users move data between devices through explicit JSON backup/restore and CSV export.

**Consequence:** two people using the same public URL on different devices see the same knowledge base but separate local records. Two people sharing the same browser profile also share the same local records.

## 3. Non-negotiable product principles

- Knowledge first: the app remains valuable without tracking.
- Optional tracking: users choose what to record; no forced onboarding questionnaire.
- Local-first privacy: personal records remain in the browser unless the user exports them.
- Evidence visibility: important factual claims and numerical data show sources and review dates.
- No fabricated data: missing or uncertain values are labelled, not invented.
- Progressive complexity: beginner-friendly summaries with expandable technical detail.
- Connected information: muscles link to exercises, exercises to programs, foods to nutrients, and logs to analytics.
- Mobile-first execution: workout and food logging must be practical on a phone.
- Long-term ownership: code, content and backups remain exportable and repository-owned.
- Incremental construction: each phase is scoped, tested and frozen before the next phase.

## 4. Scope

### 4.1 In scope

- Public fitness and nutrition knowledge pages.
- Muscle/anatomy, exercise, workout science and program modules.
- Cardio, mobility, warm-up, cooldown, recovery and sleep modules.
- Food, nutrient, recipe, diet-planning and supplement modules.
- Optional workout, cardio, nutrition, sleep, recovery and body-progress logs.
- Calculators, comparisons, search, filters, favourites and saved plans.
- Local browser persistence, data migrations, backup, restore and CSV export.
- Responsive design, accessibility, SEO for public content and deployability.
- GitHub synchronization and Vercel deployment.

### 4.2 Explicitly out of scope

- Authentication, user accounts, roles, profiles or password recovery.
- Cloud synchronization, server-side personal records or multi-user collaboration.
- Payments, subscriptions, advertisements or commercial trainer marketplace.
- Community posts, comments, direct messages, followers, leaderboards or social feeds.
- Medical diagnosis, injury diagnosis, rehabilitation prescriptions or emergency advice.
- Automated camera-based exercise-form diagnosis in the initial roadmap.
- Wearable integrations and live third-party APIs in the initial roadmap.
- AI-generated scientific facts or nutrient values without verified sources.
- An admin CMS requiring a backend; repository data files are the initial content-management method.

## 5. Capability domains

| Domain | Includes |
| --- | --- |
| Learn | Muscles, exercises, training science, nutrients, recovery, mobility and supplement education. |
| Train | Programs, planner, workout execution, cardio and timers. |
| Eat | Foods, nutrients, diet planning, recipes, meal templates and nutrition logging. |
| Recover | Sleep, soreness, fatigue, deloading, stress, mobility and rest-day guidance. |
| Track | Workout history, nutrition totals, body metrics, sleep and recovery records. |
| Analyze | Progress dashboard, trends, adherence, personal records and comparisons. |
| Tools | Calculators, unit conversion, plate calculator, timers and food/exercise comparison. |
| System | Search, favourites, settings, backup, restore, export, offline behavior and citations. |

## 6. Phased documentation roadmap

| Phase | Document | Purpose | Completion output |
| --- | --- | --- | --- |
| 00 | Master foundation and Lovable operating specification | Lock product identity, scope, stack, data rules, design principles and phased delivery method. | Foundation baseline accepted. |
| 01 | Application shell, navigation and design system | Create responsive app frame, route structure, global navigation, theme, reusable UI primitives and placeholder module pages. | Stable shell with no feature logic. |
| 02 | Muscle and functional anatomy library | Create body-region taxonomy, muscle catalogue, muscle detail pages and exercise relationships. | Browsable, sourced muscle knowledge module. |
| 03 | Exercise encyclopedia | Create exercise catalogue, filters, technique pages, variations, substitutions, media and evidence fields. | Core exercise knowledge library. |
| 04 | Training science and workout methods | Explain volume, intensity, frequency, overload, RPE/RIR, set methods, deloading and programming principles. | Structured training knowledge hub. |
| 05 | Workout programs and planner | Create program templates, weekly schedules, progression rules, substitutions and local plan saving. | Actionable plans from beginner to advanced. |
| 06 | Workout session tracker | Log sessions, sets, reps, load, RPE/RIR, rest, notes, history and personal records locally. | Reliable offline-capable workout logging. |
| 07 | Cardio and conditioning | Cover modalities, intensity zones, sessions, progression and optional cardio logging. | Cardio education and tracking. |
| 08 | Food encyclopedia | Create structured food catalogue with per-100-g and serving views, source metadata and comparisons. | Curated food composition knowledge base. |
| 09 | Nutrient encyclopedia | Cover macronutrients, vitamins, minerals, functions, sources, intake guidance and limitations. | Linked nutrient reference system. |
| 10 | Diet planning and calculators | Provide calorie, protein, macro, fibre and hydration estimates with transparent formulas and caveats. | Optional planning tools without medical claims. |
| 11 | Meals, recipes and meal-plan templates | Create ingredient-based recipes, calculated nutrition, substitutions, grocery lists and plan templates. | Practical meal execution layer. |
| 12 | Nutrition tracker | Log foods and quantities, compute daily totals and display optional macro/micronutrient summaries. | Local nutrition tracking. |
| 13 | Recovery and sleep | Cover sleep, soreness, fatigue, deloads, rest days, stress and optional recovery logging. | Recovery education and trends. |
| 14 | Mobility, flexibility, warm-up and cooldown | Create routines by joint, goal, time and training session; explain safe execution. | Movement-preparation library. |
| 15 | Supplements evidence library | Present evidence levels, use cases, risks, interactions, quality concerns and references. | Careful supplement education only. |
| 16 | Body progress and analytics dashboard | Track weight, measurements, photos, adherence, volume and performance trends locally. | Unified progress dashboard. |
| 17 | Global search, favourites and comparison | Provide indexed search, saved items, recent items and comparison views across modules. | Fast cross-module discovery. |
| 18 | Local data, backup, restore and offline support | Formalize IndexedDB schema, migrations, JSON backup, CSV export, import validation and PWA/offline behavior. | Durable personal-data layer. |
| 19 | Content operations and dataset expansion | Define source registry, review workflow, deduplication, versioning, broken-link checks and bulk content import. | Repeatable content-maintenance pipeline. |
| 20 | Quality assurance, GitHub and Vercel deployment | Run accessibility, responsive, browser, performance and data tests; connect GitHub and deploy to Vercel. | Production-ready release and maintenance guide. |

## 7. Information architecture and route contract

Routes are a semantic contract, not an instruction to build every screen in Phase 00. Phase 00 creates placeholders and shared structure only; feature documents later define final screen behavior.

| Route | Screen | Purpose |
| --- | --- | --- |
| / | Home | Entry point, today/continue cards, module shortcuts and optional local summaries. |
| /learn | Learn hub | Muscles, exercises, training science, nutrients, recovery and supplement education. |
| /muscles | Muscle library | Browse and filter muscle groups. |
| /muscles/$slug | Muscle detail | Anatomy, function, movements, exercises and citations. |
| /exercises | Exercise library | Search, filter, compare and save exercises. |
| /exercises/$slug | Exercise detail | Technique, cues, muscles, variations, mistakes, media and guidance. |
| /training-science | Training science | Programming principles and training-method articles. |
| /programs | Workout programs | Template catalogue and filters. |
| /programs/$slug | Program detail | Schedule, exercises, progression and substitutions. |
| /workout | Workout workspace | Start, resume or repeat a workout. |
| /workout/history | Workout history | Session list, detail and exports. |
| /cardio | Cardio hub | Education, plans and optional logs. |
| /foods | Food encyclopedia | Food search, nutrient filters and categories. |
| /foods/$slug | Food detail | Per-100-g and per-serving composition, aliases and source quality. |
| /nutrients | Nutrient encyclopedia | Macro, vitamin and mineral catalogue. |
| /nutrients/$slug | Nutrient detail | Functions, sources, intake guidance and evidence. |
| /diet | Diet planning | Goal-based planning tools and educational templates. |
| /recipes | Recipes | Recipe catalogue, filters and nutrition. |
| /recipes/$slug | Recipe detail | Ingredients, method, servings and calculated nutrients. |
| /nutrition-log | Nutrition tracker | Optional daily food logging. |
| /recovery | Recovery hub | Sleep, fatigue, soreness and rest guidance. |
| /mobility | Mobility hub | Warm-ups, cooldowns, mobility and flexibility routines. |
| /supplements | Supplement library | Evidence-focused supplement catalogue. |
| /progress | Progress dashboard | Body, workout, nutrition and adherence trends. |
| /tools | Tools hub | Calculators, timers, converters and comparisons. |
| /saved | Saved items | Local favourites and saved plans. |
| /settings | Local settings | Units, theme, backup, restore, reset and privacy explanation. |
| /about/sources | Sources and methodology | Source hierarchy, citations, update dates and disclaimers. |

## 8. Core user journeys

### 8.1 Learn an exercise

1. Open exercise catalogue.
2. Search or filter by muscle, equipment, goal or difficulty.
3. Open exercise detail.
4. Read setup, execution, cues, mistakes, safety notes and variations.
5. View related muscles, programs and demonstration links.
6. Optionally save the exercise or start a workout containing it.

### 8.2 Follow a workout program

1. Browse programs by experience, days, goal, equipment and session duration.
2. Inspect weekly schedule, exercises, progression and substitutions.
3. Save a program locally.
4. Start today’s session.
5. Log sets, reps, load and effort.
6. Review history and progression.

### 8.3 Understand a food

1. Search foods or browse a category.
2. Open food detail.
3. Switch between per-100-g and serving views.
4. Inspect calories, macros, micronutrients, state, serving mass and source quality.
5. Compare with another food.
6. Optionally add a quantity to the nutrition log.

### 8.4 Plan intake without tracking

1. Open diet tools.
2. Enter only the inputs required for the chosen calculation.
3. Review estimated energy and nutrient ranges with assumptions.
4. Open suggested meal structures and food options.
5. Leave without saving any data, or explicitly save the result locally.

### 8.5 Backup personal records

1. Open Settings → Data.
2. See what is stored on this device and the last backup date.
3. Export a versioned JSON backup.
4. Optionally export module-specific CSV files.
5. On another browser/device, validate and import the backup.
6. Show imported record counts and any rejected records.

## 9. Global functional requirements

- All public modules must work without onboarding, login or personal inputs.
- All catalogue pages must support search, filters, sorting, pagination or virtualisation where needed, empty states and URL-shareable public filters where practical.
- All detail pages must expose canonical title, aliases, category, source metadata, review date and related entities.
- All tracking operations must support create, view, edit and delete with explicit confirmation for destructive actions.
- All personal-data writes must provide immediate success/error feedback.
- All saved plans, favourites and logs must be recoverable through backup/restore.
- All calculators must display input units, assumptions, formula/method, estimated result and limitation text.
- All media must include attribution/ownership data where applicable and accessible text alternatives.
- All charts must have text summaries or accessible data-table equivalents.
- All modules must define loading, empty, unavailable-data, validation-error and unexpected-error states.

## 10. Global design and UX system

### 10.1 Visual direction

A serious performance and health product—not a bodybuilding poster, neon gaming interface or generic SaaS dashboard. Use restrained athletic energy: strong typography, clean grid, dense but readable information, clear hierarchy and limited accent colour.

- Primary palette: deep neutral/forest tones with one restrained green accent.
- Light and dark themes using the same semantic tokens.
- Generous tap targets and readable contrast.
- Cards used for grouping, not for every line of content.
- Tables on desktop; stacked labelled rows on narrow screens.
- Charts use consistent axes, units, time ranges and accessible summaries.
- Images support understanding; they do not replace instructions or alt text.
- Avoid motivational clutter, fake testimonials, pricing UI and account avatars.

### 10.2 Responsive structure

- Mobile: bottom or compact primary navigation, sticky session controls, full-width forms and horizontally safe data presentation.
- Tablet: adaptive two-column layouts and persistent secondary navigation where space allows.
- Desktop: left navigation or top navigation plus content rail; optional contextual sidebar for related items.
- No required horizontal scrolling for core actions; comparison tables may use labelled horizontal scroll with frozen identity column.

### 10.3 Shared component families

- Application shell, module header, breadcrumbs and section navigation.
- Search input, filter drawer, filter chips, sort control and result count.
- Entity cards for exercise, muscle, food, nutrient, program, recipe and article.
- Source citation, evidence/data-quality badge and last-reviewed label.
- Unit/serving toggle, quantity input and comparison selector.
- Set logger, rest timer, numeric stepper and workout summary.
- Metric cards, line/bar charts, accessible data table and time-range controls.
- Empty state, unavailable-data state, loading skeleton, inline validation and error recovery.
- Backup/export/import controls and destructive-action confirmation.

## 11. Content and data architecture

### 11.1 Repository-owned knowledge

The first production architecture stores public knowledge in version-controlled repository files. This avoids runtime API dependency, makes content reviewable, and keeps the application usable even if external services change.

- Use JSON or typed TypeScript for structured entities.
- Use Markdown/MDX for long educational content where rich structure is required.
- Use a shared source registry rather than duplicating full source details inside every record.
- Generate search indexes at build time or in the client from canonical data.
- Images belong in the repository/public assets only when licensing permits; otherwise store reviewed external links and attribution.

### 11.2 Canonical identity

- Every entity has an immutable ID and a human-readable slug.
- Names may change; IDs must not.
- Aliases and regional names map to one canonical entity.
- Relationships use IDs, never copied display names.
- Duplicate records must be merged through an explicit migration rather than silently deleted.

### 11.3 Shared source metadata

- sourceId, publisher, title, URL and source type.
- publication or dataset version date where available.
- accessed/reviewed date.
- licence or usage note.
- evidence/data-quality classification.
- fields supported by the source and known limitations.
- reviewer status: draft, verified, needs review, deprecated.

### 11.4 Units and missing values

- Store mass in grams, energy in kilocalories plus optional kilojoule display, time in seconds, distance in metres, load in kilograms and body measurements in centimetres as canonical internal units.
- Allow user-selected display units where relevant; conversions occur at the presentation boundary.
- Food composition defaults to per 100 g. Serving values must state exact serving mass.
- Use explicit value status: measured, calculated, estimated, trace, not measured, not available.
- Never treat null/missing as zero. Never average conflicting source values without documenting the method.

## 12. Cross-module relationship model

- Muscle → exercises that primarily or secondarily train it.
- Exercise → muscles, equipment, movement pattern, variations, substitutions and programs.
- Program → sessions → exercises → set prescriptions.
- Food → nutrients and dietary classifications.
- Nutrient → foods rich in it and relevant educational articles.
- Recipe → ingredients → foods → calculated nutrients.
- Recovery topic → related training concepts, mobility routines and warning signs.
- Logs → canonical knowledge IDs so history remains connected after wording changes.
- Source → every supported factual record and content section.

## 13. Local-first personal data architecture

IndexedDB is the primary browser storage for structured personal records. localStorage is limited to small preferences such as theme, unit choice and last-opened screen. Browser storage is not treated as a backup.

### 13.1 Planned local record groups

- workout sessions and set entries.
- saved workout plans and exercise substitutions.
- cardio sessions.
- nutrition days and food entries.
- body measurements and progress-photo metadata/local references where supported.
- sleep and recovery entries.
- favourites, recent items and user-created notes.
- calculator presets and app preferences.
- backup metadata and schema-migration history.

### 13.2 Data portability

- One versioned JSON envelope for complete backup and restore.
- Module-specific CSV exports for human inspection and spreadsheet use.
- Import validation before any write.
- Dry-run import summary: version, record counts, conflicts and rejected records.
- Explicit merge versus replace choice where safe.
- Automatic pre-import backup when records already exist.
- Clear statement that clearing browser/site data can erase local records.

### 13.3 SSR/client boundary

- Public content may render on the server using the native Lovable stack.
- IndexedDB, localStorage, File APIs and browser-only code run only on the client.
- No browser global access during server rendering.
- Initial server-rendered views must remain valid before local data hydrates.
- Personal metrics must not be embedded in public HTML or server logs.

## 14. Search, filters, favourites and comparisons

- One global search entry point plus module-specific search.
- Index canonical names, aliases, regional names, categories, equipment, muscles, nutrients and article keywords.
- Filters must be deterministic, combinable and removable individually.
- Show active-filter count and clear-all action.
- Persist recent searches and favourites locally; provide clear controls to delete them.
- Comparison tools must normalise units and clearly identify basis (per 100 g, per serving, prescribed set range, etc.).
- Do not rank scientific truth by popularity. Default sort should be relevance or canonical order, not engagement.

## 15. Calculator governance

- Every calculator has a named method or formula and a version identifier.
- Inputs have units, allowed ranges and validation messages.
- Outputs use ranges where precision is not justified.
- Assumptions and limitations appear beside the result, not hidden only in a disclaimer page.
- Calculated values are not stored unless the user explicitly saves them.
- Formula changes require tests and a migration/version note.
- No calculator diagnoses a deficiency, disease, injury or eating disorder.

## 16. Evidence, safety and content governance

- Use a source hierarchy: government datasets/guidelines, professional bodies, systematic reviews/peer-reviewed research, academic institutions, qualified practitioner material and carefully reviewed demonstrations.
- Keep composition data separate from intake guidance and separate both from personalised medical advice.
- Label disagreement, uncertainty and population limitations.
- Exercise instructions require common-error and stop/seek-help guidance where material.
- Supplement pages require evidence level, risks, interactions, quality concerns and prohibited medical claims.
- YouTube links are reviewed external demonstrations; do not download or republish videos without permission.
- Every record can be marked deprecated without breaking historical logs.

## 17. Technical foundation

### 17.1 Framework rule

Use the native framework generated by the current Lovable project. New Lovable projects are expected to use TanStack Start with React, TypeScript and Tailwind. Do not force a migration to Next.js or an older Vite-only architecture. The code must remain portable through GitHub and deployable to Vercel.

### 17.2 Engineering standards

- TypeScript strict mode; no unbounded any.
- Feature-oriented folders with shared domain types and utilities.
- Schema validation for repository data and imported backups.
- Reusable components; no duplicated parsing, unit conversion or calculation logic.
- No secrets in frontend code or client-exposed environment variables.
- No runtime external API dependency for core knowledge in the initial product.
- No cloud personal-data persistence.
- Automated tests for data parsing, calculators, migrations and critical tracking flows.
- Build and type-check must pass before every phase checkpoint.

### 17.3 Proposed repository structure

The exact native framework paths may differ; Lovable must preserve its scaffold while implementing equivalent responsibilities.

```text
src/
  routes/
  components/
    app-shell/
    common/
    data-display/
    forms/
    tracking/
  features/
    muscles/
    exercises/
    programs/
    workout-log/
    foods/
    nutrients/
    diet/
    recipes/
    nutrition-log/
    recovery/
    mobility/
    supplements/
    progress/
    search/
    settings/
  data/
    entities/
    articles/
    sources/
    indexes/
  domain/
    types/
    schemas/
    units/
    calculators/
  storage/
    indexed-db/
    preferences/
    backup/
    migrations/
  lib/
  styles/
public/
  images/
  icons/
docs/
  phases/
  data-dictionary/
  decisions/
AGENTS.md
```

## 18. Accessibility, performance and SEO baseline

- Target WCAG 2.2 Level AA for user-facing experiences.
- All core actions operable by keyboard with visible focus.
- Form labels, instructions and errors programmatically associated.
- Semantic headings, landmarks, lists and tables.
- Charts include text summaries and accessible equivalents.
- Respect reduced-motion preferences.
- Optimise images and avoid loading large media on catalogue screens.
- Lazy-load non-critical routes/data where appropriate while keeping navigation predictable.
- Public detail pages require unique title, description, canonical URL and structured internal links.
- Do not expose personal local data in metadata, URLs or server-rendered HTML.

## 19. State requirements

| State | Required behavior |
| --- | --- |
| Loading | Use stable skeletons or progress; do not shift core layout excessively. |
| Empty catalogue result | Explain no matches, show active filters and provide clear reset. |
| No personal records | Explain optional tracking and provide primary start action without guilt language. |
| Missing nutrient value | Show explicit status and source limitation; never show zero by default. |
| Offline | Public cached content and local logs continue where implemented; show network-dependent media as unavailable. |
| Import error | Reject invalid records safely, preserve existing data and show exact reasons. |
| Storage failure | Show actionable error and encourage export; do not claim a save succeeded. |
| Unexpected application error | Provide recovery action, preserve unsaved form state where practical and log non-sensitive diagnostics. |

## 20. Lovable operating protocol

1. Attach only the Master Foundation plus the current phase document and required data files. Do not overload a prompt with all future phase files.
2. Keep stable constraints in Project Knowledge and repository-level AGENTS.md.
3. Use Plan mode first. Require file-level impact, risks, protected modules and acceptance criteria.
4. Edit the plan until it matches the phase; then approve.
5. Use Agent mode for implementation only after plan approval.
6. Build and test in separate prompts for major changes.
7. Inspect desktop and mobile views and all defined states.
8. Correct defects before the next phase.
9. Connect/sync GitHub and keep a stable checkpoint after each accepted phase.
10. Update documentation and decision records when implementation differs from the approved specification.

### 20.1 Permanent Lovable guardrail

Every later phase prompt must contain: **Preserve all completed modules. Do not refactor, redesign, delete or replace previous functionality unless this phase explicitly requires the change and the approved plan identifies the affected files.**

## 21. Phase 00 implementation scope

### 21.1 Build now

- Native Lovable project scaffold retained.
- Global design tokens and basic light/dark theme foundation.
- Accessible application layout primitives.
- Route placeholders matching the route contract.
- Shared TypeScript types for IDs, source metadata, unit values, value status and local record metadata.
- Data-validation and import/export envelope foundations.
- Client-only storage interfaces/adapters without final module stores.
- Global loading, empty and error components.
- AGENTS.md containing permanent project rules.
- Docs folder and phase/decision templates.
- Minimal tests and build/type-check/lint scripts.

### 21.2 Do not build now

- Final home/dashboard experience.
- Full exercise, muscle, food, nutrient or article datasets.
- Workout or nutrition logging user interfaces.
- Calculators, charts or final comparison tools.
- Authentication, cloud services or server persistence.
- Final SEO content, recipes, programs or supplement pages.

## 22. Phase 00 acceptance criteria

- [ ] Project runs using Lovable’s native framework; no framework migration was introduced.
- [ ] No authentication, Supabase, Lovable Cloud, Firebase, payment or social dependency exists.
- [ ] TypeScript strict checking passes.
- [ ] Global tokens support consistent light and dark themes.
- [ ] Core layout and route placeholders render on mobile and desktop.
- [ ] Browser-only storage access is isolated from server rendering.
- [ ] Shared source metadata, unit/value status and backup-envelope types exist and are validated.
- [ ] AGENTS.md and docs/phase structure exist.
- [ ] Global loading, empty and error-state primitives exist and are accessible.
- [ ] Build, lint/type-check and foundation tests pass.
- [ ] No large fabricated fitness/nutrition dataset was added.
- [ ] Lovable reports exact files changed and unresolved issues.
- [ ] A GitHub checkpoint can be created without generated secrets or private data.

## 23. Project Knowledge text

Use the separate text file supplied with this package. It is kept below the current Lovable Project Knowledge character limit and contains the permanent rules that should accompany every prompt.

```text
PROJECT: FITNESS KNOWLEDGE AND TRACKING APPLICATION

PURPOSE
Build a comprehensive, evidence-aware fitness web application that combines exercise education, muscle anatomy, workout programming, foods and nutrients, diet planning, recovery, optional tracking, calculators and progress analytics. It is primarily for the owner’s long-term personal use, but public knowledge pages may be used by any visitor.

NON-NEGOTIABLE PRODUCT RULES
- No sign-up, login, authentication, user accounts, roles, subscriptions, payments, comments, community or social feed.
- Do not add Lovable Cloud, Supabase, Firebase, a cloud database or server-side personal-data persistence unless a later approved phase explicitly changes this rule.
- Personal records are optional and device-local. Store structured logs in IndexedDB. Use localStorage only for small preferences.
- Every tracking module must work independently; knowledge pages must remain fully usable without entering personal data.
- Provide JSON backup/restore and CSV export before treating tracking as production-ready.
- Never place secrets, private keys or sensitive credentials in frontend code or VITE-prefixed variables.
- Preserve completed modules. Do not redesign, refactor or replace earlier work unless the current approved phase explicitly requires it.

STACK AND ARCHITECTURE
- Use the native stack generated by Lovable. For a new project, retain TanStack Start/React/TypeScript/Tailwind rather than migrating frameworks.
- Use TypeScript strict mode. Avoid any; use explicit domain types and validation.
- Public knowledge content must be repository-owned structured data: JSON/TypeScript data files and Markdown/MDX where appropriate.
- Use stable canonical IDs and slugs. Separate content data, UI components, local tracking, utilities and source metadata.
- Prefer reusable components and route-level composition. Do not duplicate layouts or business rules.
- Keep personal-data operations client-only. Guard browser-only APIs during SSR.

DESIGN
- Mobile-first, fast, focused and information-dense without being cluttered.
- Visual direction: modern performance/fitness product; deep neutral surfaces, restrained green accent, strong typography, clear cards, readable tables and charts.
- Support light and dark themes. Do not rely on color alone to communicate status.
- Use semantic HTML, visible focus states, keyboard support, labelled controls, accessible tables and text alternatives.
- Use realistic content. Do not use lorem ipsum.

CONTENT AND DATA
- Do not invent scientific facts, nutrient values, exercise claims or citations.
- Every factual record must support source metadata: source ID, publisher, title, URL, review date and evidence/data-quality note.
- Standard food composition basis is per 100 g; optional serving conversions must show the serving mass.
- Distinguish 0, trace, not measured, not available and estimated. Never convert missing values to zero.
- Store canonical units internally and convert only for display.
- All calculators must show formula, assumptions, units, result range and limitations.
- The application is educational and organizational, not a diagnostic, treatment or rehabilitation system.

GLOBAL UX
- Top-level domains: Home, Learn, Train, Eat, Recover, Track, Tools, Saved, Settings.
- Every catalogue requires search, filters, sorting, empty state and source visibility.
- Every detail page should link to related entities across modules.
- Tracking screens require explicit save feedback, history, edit/delete, backup awareness and error recovery.
- Show device-local data boundaries clearly in Settings and before destructive actions.

DEVELOPMENT METHOD
- Use Plan mode before each phase. Plan mode must identify changed files, dependencies, risks, acceptance criteria and protected files.
- Implement one phase at a time in Agent mode. Build first, then test in a separate follow-up step.
- Keep GitHub connected early. Use the default branch as the synced source of truth and create a stable checkpoint after every accepted phase.
- After each phase: run build, type-check, lint, relevant tests, mobile/desktop browser checks, accessibility review and regression checks.
- Do not start the next phase until the current phase’s acceptance checklist passes.
```

## 24. Phase 00 Plan-mode prompt

```text
You are in PLAN MODE. Read the attached document “Phase 00 — Master Foundation and Lovable Operating Specification” completely before responding.

Do not modify code.

Produce a formal implementation plan for PHASE 00 ONLY. The purpose of this phase is to establish the project foundation, repository rules, type-safe architecture, design tokens, route placeholders and local-data interfaces. It is not to build the full fitness application or populate the exercise/nutrition datasets.

Your plan must include:
1. Confirmed interpretation of the product and all non-negotiable exclusions.
2. The native Lovable framework and current project structure you will retain.
3. Exact files to create, modify or protect.
4. Proposed folder structure and naming conventions.
5. Global design tokens and accessibility baseline.
6. Static content-data conventions and source metadata types.
7. Client-only personal-data boundary and IndexedDB/localStorage adapter interfaces.
8. Placeholder route map without final feature implementation.
9. Validation, error-boundary and import/export foundations.
10. Build, type-check, lint and browser-test steps.
11. Risks, assumptions and any conflicts you detect.
12. Acceptance criteria copied as a checkable list.

Guardrails:
- No authentication.
- No Supabase, Lovable Cloud, Firebase or external database.
- No payments, subscriptions, social features or admin dashboard.
- No invented fitness or nutrition content.
- Do not implement later phases.
- Do not replace the native Lovable framework.

Stop after presenting the plan. Wait for approval before implementation.
```

## 25. Phase 00 Agent-mode prompt

```text
Implement the approved Phase 00 plan exactly.

Build only the foundation defined in the approved plan and attached Phase 00 specification. Do not build full muscle, exercise, food, diet, recovery or tracking modules yet.

Mandatory outcomes:
- Retain Lovable’s native framework and TypeScript/Tailwind setup.
- Enable strict, typed domain models for shared metadata, sources, units and local records.
- Add repository-level instructions (AGENTS.md) containing the permanent guardrails.
- Create the agreed folder structure, design tokens, shared layout primitives and placeholder routes.
- Add client-safe storage interfaces for IndexedDB and localStorage without creating cloud persistence.
- Add data-validation utilities and typed import/export envelope definitions.
- Add global error, empty and loading-state primitives.
- Add basic accessible light/dark theme support.
- Include a minimal home/foundation screen that clearly states the project is under phased construction.
- Add automated checks/tests defined by the approved plan.

Prohibited:
- Authentication or profiles.
- Supabase, Lovable Cloud, Firebase, database tables or server-side user storage.
- Payments, social/community functionality or notifications.
- Final feature modules or large placeholder datasets.
- Framework migration or broad dependency churn.

After implementation, report:
1. Files changed.
2. Tests/checks run and results.
3. Acceptance criteria status.
4. Any unresolved issue.
5. A concise handoff note for Phase 01.

Do not begin Phase 01.
```

## 26. Phase 01 handoff

After Phase 00 passes, the next document is **Phase 01 — Application Shell, Navigation and Design System**. It will convert placeholders into the final responsive shell and define every global component/state before domain modules begin.

## 27. Platform assumptions verified for this baseline

- Lovable Project Knowledge supports persistent project-specific instructions and currently allows up to 10,000 characters.
- Plan mode does not modify code; an approved plan is used for Agent-mode implementation and the latest approved plan is stored in `.lovable/plan.md`.
- Lovable recommends small, testable increments, specific guardrails and version control.
- Lovable supports attaching files to prompts and two-way synchronization with the linked GitHub default branch.
- New Lovable apps created from 13 May 2026 use TanStack Start with SSR except Enterprise-specific behavior; older apps remain React + Vite.
- IndexedDB is suitable for significant amounts of structured browser-side data; browser storage still requires explicit backup strategy.
- WCAG 2.2 is the accessibility baseline.
- Vercel supports Git-triggered preview/production deployments and supports TanStack Start through Nitro configuration.

## References

- [R1] Lovable — Define workspace and project knowledge: https://docs.lovable.dev/features/knowledge
- [R2] Lovable — Brainstorm in Plan mode: https://docs.lovable.dev/features/plan-mode
- [R3] Lovable — Connect your project to GitHub: https://docs.lovable.dev/integrations/github
- [R4] Lovable — Best practices: https://docs.lovable.dev/tips-tricks/best-practice
- [R5] Lovable — FAQ / current technology stacks: https://docs.lovable.dev/introduction/faq
- [R6] Lovable — Dashboard overview / file attachments: https://docs.lovable.dev/introduction/dashboard-overview
- [R7] MDN — IndexedDB API: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- [R8] W3C — Web Content Accessibility Guidelines (WCAG) 2.2: https://www.w3.org/TR/WCAG22/
- [R9] Vercel — TanStack Start on Vercel: https://vercel.com/docs/frameworks/full-stack/tanstack-start
- [R10] Vercel — Deploying Git repositories: https://vercel.com/docs/git
- [R11] Lovable — Test and verify your app: https://docs.lovable.dev/features/testing
