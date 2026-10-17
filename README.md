# Fitness OS

Presentation follows the project-specific [DESIGN.md](DESIGN.md). Engineering and
local-data safety rules remain in [AGENTS.md](AGENTS.md).

Fitness OS brings fitness education, training, nutrition, recovery and optional personal tracking into one application. Public knowledge is checked into the repository; personal records stay in the user's browser. You can browse the libraries without creating an account or keeping a diary.

Built with **TanStack Start, React, strict TypeScript, Tailwind CSS, Vite and Nitro**. There are no accounts, authentication, cloud personal storage, payments, social features, admin CMS, analytics, telemetry or external runtime fitness APIs.

[Application](https://kaush-ka-gym.vercel.app) · [Historical release evidence](docs/reports/final-maximum-autonomy-closure.md) · [Remaining owner checks](docs/reports/final-owner-required-minimal-checklist.md) · [Deployment runbook](docs/runbooks/vercel-owner-deployment.md)

## Project status

Phases 00–18 are implemented, followed by Phase 19 verified-content work and release hardening. The current release publishes a frozen subset of verified content; **900 unpublished identities remain future content backlog** and are excluded from public search.

The owner-requested UX upgrade adds a six-area Home map, compact desktop navigation, Light/Dark/Auto controls, informative workflow figures, reviewed exercise previews and a recorded-weight chart. Progress defaults use local time, and BMI uses the newest valid active measured height. See the [UX upgrade report](docs/reports/final-owner-requested-ux-upgrade.md) for current verification and release binding. The checkpoint below remains historical.

The annotated Git tag `fitness-os-maximum-autonomy-complete` records the October 12, 2026 checkpoint:

- Repository commit: `976b4b291ed7e33bb3872401fb9be5e73fd9124d`.
- Deployed runtime commit: `6ac581aa07d0480679cc3762aee05d4d9962fe1b`. Subsequent changes at that checkpoint affect tests, tooling and documentation.
- Required CI and Linux Chromium, Firefox and WebKit jobs passed; their run IDs are retained in the tag annotation.
- All 43 automated checkpoints passed. Nine physical-device or human checks remain, including real mobile hardware, screen-reader experience, native file pickers and private backup custody.

These are recorded results for that release, not a claim that every future checkout, device or planned content record has been verified. Source verification and automated validation do not constitute independent human or clinical review. See the [closure report](docs/reports/final-maximum-autonomy-closure.md) for the evidence and its limits.

Automatic Vercel Git deployment is disabled in `vercel.json`. Releases remain owner-controlled.

## What the application includes

Primary navigation offers Home, Learn, Train, Eat, Recover, Progress, Tools and Saved, with Sources and Settings available in the sidebar. Home maps the six major working areas and explains public knowledge, local records and backups. Modules live in `src/features` and are exposed through file-based routes in `src/routes`.

| Area                        | Implemented features                                                                                                                         | Entry routes                                    |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Anatomy                     | Muscle catalogue, body-region selector, filters, joint actions, related records and source-labelled detail pages                             | `/muscles`                                      |
| Exercises                   | Exercise catalogue, equipment/movement filters, instructions, sources and available movement diagrams                                        | `/exercises`                                    |
| Workout science             | Training topics, glossary, related content and source limitations                                                                            | `/learn/workout-science`                        |
| Programs                    | Program finder, versioned public programs and local instances with immutable snapshots                                                       | `/programs`                                     |
| Workout tracking            | Custom exercises, session/set editing, rest timers, pause/resume, history, compatible exercise records and module backup                     | `/workout`, `/workout/history`                  |
| Foods                       | Food catalogue, preparation-specific composition, explicit servings, filters and comparison                                                  | `/foods`                                        |
| Nutrients                   | Nutrient education, food rankings, comparisons, reference-framework information and methodology                                              | `/nutrients`                                    |
| Diet planning               | Adult eligibility/consent checks, energy and macro estimates, meal distribution and saved versioned plans                                    | `/diet-planning`                                |
| Nutrition tracking          | Food/hydration diaries, gram-based snapshots, custom foods, favourites, totals and entry editing                                             | `/nutrition`                                    |
| Recipes and meals           | Public recipes/collections, local copies, scaling, ingredient snapshots, meal-plan editing and diary logging                                 | `/recipes`, `/meal-plans`                       |
| Recovery                    | Recovery check-ins, sleep diaries/history, public and custom mobility/warm-up routines and routine sessions                                  | `/recovery`, `/sleep`, `/mobility`, `/warm-ups` |
| Cardio and conditioning     | Education, public/custom plans, conditioning routines, session player/history, pace/speed and labelled intensity tools                       | `/cardio`, `/conditioning`                      |
| Supplements                 | Ingredient/claim evidence, safety/quality information, local product-label versions, intake logs, trials and suspected adverse-event records | `/supplements`                                  |
| Body progress and analytics | Weight, circumference, external body-composition reports, private photos, goals, dashboard and method-labelled analytics                     | `/dashboard`, `/progress`, `/analytics`         |
| Search and saved items      | Verified public search, optional local private indexing/history, favourites, collections and comparisons of two to four compatible items     | `/search`, `/saved`, `/compare`, `/recent`      |
| Settings and data           | Theme/unit preferences, backup/restore, CSV export, storage inventory, data health, recovery history and confirmed clearing                  | `/settings`, `/settings/data`                   |
| Sources                     | Public source/provenance reference pages                                                                                                     | `/about/sources`                                |

Unknown or unsupported results remain explicit. The application does not invent missing food values, body-fat measurements, calorie burn, VO₂max, one-repetition-max estimates or a composite recovery score. Calculations expose their methods and distinguish estimates from measurements.

## Run locally

Use **Node.js 24.16.0** and **npm 11.9.0**, matching `.nvmrc`, `packageManager` and CI. `package.json` allows Node `>=24.16.0 <25` and npm `>=11.9.0 <12`. Keep `package-lock.json` and use npm.

From the repository root:

```sh
npm ci
npm run dev
```

Open **http://127.0.0.1:3000**, the development server's configured address. Use the same origin consistently if you save personal records.

For a local production build:

```sh
npm run build
npm start
```

If the development browser reports an `AsyncLocalStorage` externalization error, use the production build/server commands above. This development-toolchain limitation was observed during UX verification; it does not describe the tested production server.

`build` automatically validates content and checks search-index freshness before Vite builds the application. `start` runs Nitro's `.output/server/index.mjs`; it requires a completed build.

### Public configuration

The only application setting in `.env.example` is:

```dotenv
VITE_PUBLIC_APP_ORIGIN=http://localhost:3000
```

Copy `.env.example` to `.env` if you need to configure it. For local work at the address above, use `http://127.0.0.1:3000`; for production, use the chosen stable HTTPS origin. The value supplies public canonical metadata and must be an HTTP(S) origin without credentials, a path, query or fragment. It does not transfer browser data or configure the server's listening address. Without it, canonical metadata defaults to `http://localhost:3000`.

No API keys or personal-data service credentials are needed. Never put secrets in `VITE_*` variables or commit private environment files.

## Personal data and backups

Structured personal records live in **IndexedDB**. Small preferences use **localStorage**. Public pages may render on the server; personal records are loaded in the browser and must stay out of SSR output, server logs, metadata and request payloads.

The global data manager recognizes seven owning databases: `fitness-os`, `fitness-os-local`, `fitness-os-diet-planning`, `fitness-os-recipes-meal-plans`, `fitness-os-recovery-sleep-mobility`, `fitness-os-cardio-conditioning` and `fitness-os-supplements-evidence`. Module code owns its schema and migrations.

**Browser storage is not a backup.** Records are isolated by origin, browser profile and device. `localhost`, `127.0.0.1`, another port, a preview URL and production each have separate storage. Clearing site data, private browsing or OS eviction can remove records. There is no automatic cloud sync.

Use `/settings/data` to manage data:

1. **Backup:** export portable JSON, optional gzip, selected modules or explicitly selected full media. Portable backups exclude binary photos; derived caches and transient timers are also excluded. Backup files are not encrypted.
2. **Restore:** in a fresh profile, choose **Prepare local storage** first so each module creates/migrates its own stores. Select a backup and review the validated preview; preview writes no imported canonical records. Choose keep-existing or confirmed replacement after reviewing the result.
3. **Recovery:** multi-database restore uses a journal and before-images, with resume/rollback controls on the data-health screen. Separate IndexedDB databases cannot share one globally atomic transaction.
4. **CSV:** export spreadsheet-safe rows; global export includes database, store, record ID and JSON-encoded record values. A raw mode is available. CSV is an inspection/export format; use a backup archive for restoration.
5. **Storage and reset:** inspect browser-reported usage, request persistent storage where supported, review backup receipts and clear data using the required confirmation.

Imports validate format, integrity, owning schemas, relationships and media before canonical writes. Both selected files and decompressed input are bounded to **100 MiB**. Invalid imports must preserve existing records. Encryption, ZIP archives, globally atomic restore and cross-module import-as-copy are unsupported.

Keep an independent private backup before changing origins, browsers or devices. Verify restoration in a disposable profile before removing the original data. A browser download starting is not proof that a file was successfully saved.

## Public content and evidence policy

The frozen inventory is recorded in the [content completion audit](docs/reports/content-completion.md) and its [machine-readable inventory](docs/reports/content-completion.json).

| Content family               | Published identities | Planned identities | Unpublished backlog |
| ---------------------------- | -------------------: | -----------------: | ------------------: |
| Muscles                      |                   70 |                 70 |                   0 |
| Exercises                    |                   32 |                184 |                 152 |
| Workout science              |                   32 |                 98 |                  66 |
| Workout programs             |                    4 |                 50 |                  46 |
| Foods                        |                  264 |                342 |                  78 |
| Nutrients                    |                   51 |                 51 |                   0 |
| Recipes                      |                   24 |                 24 |                   0 |
| Meal collections             |                    3 |                  3 |                   0 |
| Recovery, sleep and mobility |                   15 |                124 |                 109 |
| Cardio and conditioning      |                   13 |                202 |                 189 |
| Supplements                  |                   12 |                272 |                 260 |
| **Total**                    |              **520** |          **1,420** |             **900** |

There are **273 food preparation profiles**, **35 FDA label-reference rows** and **648 public search documents**, including navigation entries. Identity counts, preparation profiles and search documents are different inventories.

Factual entities retain stable IDs/slugs, ID-based relationships, sources and review metadata. Current factual publication uses `published_personal_use`: source verification and automated validation, with no independent human or clinical review claimed. `published_reviewed` requires actual human attestation. Draft identities must not silently become published facts.

- **Foods:** checked-in USDA FoodData Central snapshots retain dataset hashes, exact descriptions/preparations and source-reported serving masses. April 2026 Foundation data is preferred, with a labelled April 2018 SR Legacy fallback. Composition is per 100 g; zero, trace, estimated, not measured and not available stay distinct.
- **Anatomy and exercises:** historical Gray's 1918 anatomy is labelled historical. NIA/NHS/ACE exercise material retains scope and attribution. Original movement SVGs are cues rather than complete demonstrations.
- **Science and supplements:** source populations, outcomes, forms, uncertainty and safety limitations remain visible. No personal supplement dosing or current WADA verdict is inferred.
- **Recipes and meals:** original recipes retain immutable ingredient snapshots and explicitly estimated ingredient-mass yield. No measured yield, retention factor or raw/cooked conversion is invented. Collections do not claim to be nutritionally complete daily diets.
- **References and programs:** FDA Daily Values are a label framework, not personal RDA/EAR/UL targets. Program versions are pinned; unknown rest or duration stays unavailable. The program finder includes unknown-duration templates only after an explicit no-time-limit choice.

Restricted source material is not bulk reproduced without documented rights. Content imports and source fetching are maintainer tooling, not runtime fitness API calls. Public assets load from the application origin. Source links and explicitly loaded external demonstrations can contact third parties; the media UI explains this before playback.

## Repository guide

Start with the [documentation index](docs/README.md), [repository map](docs/repository-map.md), [script index](scripts/README.md) and [test index](tests/README.md). Original specifications and duplicate historical copies are preserved in the [phase archive](docs/archive/original-specifications/README.md).

```text
src/
  routes/          TanStack file-based pages, loaders and route metadata
  features/        Module UI, domain logic, schemas, repositories and local storage
  components/      App shell, navigation and shared accessible UI
  content/         Knowledge records, taxonomies, source snapshots and provenance
  data/            Navigation definitions and generated public search assets
  domain/          Shared types, schemas and unit formatting
  storage/         IndexedDB adapters/migrations, preferences and backup contracts
  config/          Public application configuration and validation setup
  lib/             Shared metadata and navigation helpers
  styles/          Application styles and theme tokens
  start.ts         Request middleware, CSRF protection and nonce-based CSP
  client.tsx       Client hydration bootstrap
  router.tsx       Router configuration and CSP nonce integration
public/            Static assets, local exercise visuals and license notices
scripts/           Content import/compilation, audits and release/performance tooling
tests/             Unit/component tests, fixtures, browser, route and closure suites
docs/
  README.md        Documentation hub and current/historical guidance
  features/        Subject index for existing module documentation
  phases/          Phase plans, checklists and handoff history
  decisions/       Specification and implementation decisions
  reports/         Commit-bound inventories, verification and release evidence
  runbooks/        Operational and owner deployment instructions
  security/        Threat model and security documentation
  archive/original-specifications/
                   Original phase requirements, schemas, reference data and duplicates
.github/workflows/ CI, accessibility, cross-browser and release-evidence jobs
```

`src/routeTree.gen.ts` is generated by TanStack. Content assets, schema companions and search outputs have associated compiler/verification scripts; follow those pipelines instead of independently changing generated output. Build artifacts, local imports, private environment files and test outputs are ignored by Git.

## Development and verification

| Command                                                         | Purpose                                                                                                         |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                                                   | Development server at `127.0.0.1:3000`                                                                          |
| `npm run build` / `npm start`                                   | Validate and build / serve the production output                                                                |
| `npm run typecheck`                                             | Strict application/test types and the separate content-tooling project                                          |
| `npm run lint` / `npm run format:check`                         | ESLint / configured Prettier file set                                                                           |
| `npm test` / `npm run test:coverage`                            | Vitest unit/component tests / single-worker coverage                                                            |
| `npm run validate:content` / `npm run validate:data`            | Content compilation/source/schema checks / additional repository audit                                          |
| `npm run content:build:search`                                  | Regenerate public search assets from publication adapters                                                       |
| `npm run content:audit`                                         | Recompute content-completion reports                                                                            |
| `npm run test:privacy`                                          | Static privacy/runtime-policy audit                                                                             |
| `npm run test:performance` / `npm run test:content-performance` | Built JavaScript / public-data budgets                                                                          |
| `npm run check`                                                 | Combined formatting, lint, types, data/search validation, unit tests, privacy, build, budgets and content audit |
| `npm run test:browser`                                          | Browser suite against the development server                                                                    |
| `npm run test:e2e`                                              | Chromium suite against an existing production build                                                             |
| `npm run test:e2e:cross-browser`                                | Production suite in Chromium, Firefox and WebKit                                                                |
| `npm run test:a11y`                                             | Production Chromium tests tagged `@a11y`                                                                        |
| `npm run test:routes` / `npm run test:route-report`             | Public route audit / require passing current-build audit evidence                                               |
| `npm run test:closure`                                          | Persistence, backup/media, failure, print and desktop/mobile-emulation flows                                    |

A typical full verification sequence is:

```sh
git diff --check
npm ci
npm run check
npm run test:coverage
npm audit --audit-level=high
npx playwright install chromium firefox webkit
npm run test:e2e:cross-browser
npm run test:a11y
npm run test:closure
npm run test:routes
npm run test:route-report
```

Production browser tests require the build created by `check` or `build`. Regression suites use port 3000; the route audit owns a separate production server on port 3100. Run these suites sequentially for release verification. Route tests generate evidence needed by `test:route-report`; do not substitute an older build's report.

GitHub Actions run verification and a separate accessibility job, plus Linux Chromium/Firefox/WebKit regression and closure projects. Local Windows Firefox has a documented mozglue/SideBySide limitation; Linux supplies that release gate. Mobile emulation, axe checks and synthetic storage-failure tests do not certify physical hardware, auditory screen-reader experience or OS storage behavior over time.

Some validation/compilation and audit commands regenerate outputs or reports. Inspect `git diff` afterward and retain only intended changes. Historical test counts and coverage percentages belong to their recorded commits; use fresh output to assess a changed checkout.

## Working on the project

Follow [AGENTS.md](AGENTS.md). Implement one authorized phase at a time, read its documents/schemas/data before coding, preserve completed modules and pass the phase checks before advancing. Record specification changes in `docs/decisions` and update the owning phase checklist/handoff.

Keep strict TypeScript without unbounded `any`, immutable factual identities, explicit source/review metadata and validated ID-based relationships. Retain the canonical-unit policy (`g`, `kcal`, `s`, `m`, `kg`, `cm`) and each existing schema's explicit unit contract when working with stored records. Do not fabricate facts, dates, sources or personal metrics.

Preserve browser-only personal storage and validate imports before writes. Destructive actions require confirmation. Use semantic HTML, labelled forms, visible keyboard focus, reduced-motion support and consistent light/dark tokens, targeting WCAG 2.2 AA. Run build, strict typecheck, lint, foundation tests and relevant desktop/mobile checks at each implementation checkpoint.

The frozen release has no authorized Phase 20 or automatic content expansion. Use the [minimal owner checklist](docs/reports/final-owner-required-minimal-checklist.md) for the remaining physical/human work and the [owner deployment runbook](docs/runbooks/vercel-owner-deployment.md) for future releases. Earlier phase reports retain historical evidence; the verified release tag and latest closure reports define the current checkpoint.
