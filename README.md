# Fitness OS

## Application status

Ready for owner manual testing at the `codex-first-manual-test-ready` checkpoint.
Production deployment remains disabled. This checkpoint provides the existing
verified content subset; it does not certify clinical review, real-device testing
or completion of every planned content identity.

## Installation and development

Use Node.js 24.16.0 and npm 11.9.0, matching the pinned toolchain and CI.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. To test the production build locally:

```sh
npm run build
npm start
```

Keep the browser origin stable: IndexedDB data does not move between localhost,
127.0.0.1, ports, browser profiles or devices. `VITE_PUBLIC_APP_ORIGIN` is a public
origin, not a secret. Never put secrets in frontend environment variables.

## Architecture and personal data

TanStack Start, React, strict TypeScript, Tailwind and Nitro are retained.
`src/features` contains module interfaces and domain logic; `src/storage` contains
client-only persistence; `src/content` and generated public assets hold static
knowledge. The generated route tree is managed by TanStack. Requirements and
phase history remain in `DOCS_for_entire_apppliaction/GYM` and `docs/phases`.

Public knowledge may render on the server. Personal records stay in browser
IndexedDB; localStorage holds small preferences. Tracking is optional. There are
no accounts, automatic cloud sync, runtime fitness APIs, analytics or telemetry.

**Browser storage is not a backup.** Export regularly and before clearing site
data, moving origins, browsers or devices. Backup files are not encrypted; keep
them private and outside the browser. Preview validates an import before record
writes. Multi-database restore is journaled, with recovery controls; independent
databases cannot form a globally atomic browser transaction. In a fresh profile,
open the owning modules first to initialize their versioned database schemas.
Portable backups exclude binary photos; explicitly select full media when needed.

## Frozen public content

Counts come from the current production adapters, not historical phase targets.

| Module | Published | Planned identities | Future backlog |
| --- | ---: | ---: | ---: |
| Muscles | 70 | 70 | 0 |
| Exercises | 32 | 184 | 152 |
| Workout science | 32 | 98 | 66 |
| Workout programs | 4 | 50 | 46 |
| Foods | 264 | 342 | 78 |
| Nutrients | 51 | 51 | 0 |
| Recipes | 24 | 24 | 0 |
| Meal collections | 3 | 3 | 0 |
| Recovery, sleep and mobility | 15 | 124 | 109 |
| Cardio and conditioning | 13 | 202 | 189 |
| Supplements | 12 | 272 | 260 |

There are **520 factual records**, **273 food preparation profiles**, 35 FDA label
reference rows and **648 public search documents** including navigation entries.
The 900 unpublished identities remain unavailable and excluded from public search.
They are future verified-content backlog, not a blocker for owner manual testing.
The [completion audit](docs/reports/content-completion.md) and
[JSON inventory](docs/reports/content-completion.json) retain individual reasons,
source coverage, numeric/media coverage, relationships and current-build evidence.

## Source policy and review levels

Factual records retain stable IDs/slugs, source IDs/URLs, version/date when known,
extraction dates, evidence type, review method and limitations. Current publication
state is `published_personal_use`: source verification and automated validation,
with **no independent human or clinical review claimed**. `published_reviewed`
requires an actual human attestation. Other states distinguish draft, verified,
validated, pending human review and deprecated records.

Food values are checked-in USDA FoodData Central snapshots, with pinned complete
dataset hashes, exact source descriptions/preparations, per-100-g amounts and
source-reported serving masses. April 2026 Foundation data is preferred; April
2018 SR Legacy is a labelled historical fallback. Missing, trace, estimated and
measured zero remain distinct. IFCT/ICMR-NIN data is not bulk reproduced without
documented rights. OpenStax material requiring additional AI permission is excluded.

Anatomy uses labelled historical public-domain Gray's 1918 passages, not modern
clinical or activation evidence. Exercise education retains NIA/NHS/ACE source
scope and attribution. Movement cues are original SVGs, not copied photographs
or complete demonstrations. Science retains populations, uncertainty and source
limits; no universal regimen is inferred. NIH ingredient records distinguish
outcomes, forms and safety without personal dosing or current WADA verdicts.

Original recipes use exact immutable ingredient snapshots and explicitly estimated
ingredient-mass yield. No retention factors, measured yields or raw/cooked
conversions are invented. Meal collections are not nutritionally complete daily
diets. FDA Daily Values remain a label framework, not individual RDA/EAR/UL targets.
Published program versions are pinned. Source time allocations are not measured
session durations; unknown duration/rest stays unavailable. Program Finder includes
unknown-duration templates only after an explicit no-time-limit choice.

## Automated verification

```sh
git diff --check
npm ci
npm run check
npm run test:coverage
npm audit --audit-level=high
npx playwright install chromium webkit
npm run test:e2e
npx playwright test --config=playwright.production.config.ts --project=webkit
npm run test:a11y
npm run test:privacy
npm run test:routes
npm run test:route-report
```

`check` includes formatting, lint, strict types, static compilation, schemas,
sources, duplicate/relationship checks, unit/migration/backup/search tests, privacy,
production build and unchanged JavaScript/public-data budgets. The final route
audit checks all registered routes and published links with mobile/tablet/desktop,
themes, automated accessibility, browser errors, assets and network checks.
Ordinary browser tests and the route audit own independent server ports and outputs.
Run them sequentially for the final gate. Do not run a full route audit after each
small change.

GitHub Actions run Linux Chromium, Firefox and WebKit plus a separate mandatory
accessibility job. Windows Firefox has a mozglue/SideBySide runtime limitation;
Linux supplies that gate. Final reports bind evidence to the tested code commit,
search manifest and build date/hash. Historical checkpoint reports certify only
their recorded commits. Coverage percentages are diagnostic, not proof of perfection.

## Owner manual testing

Start in a separate browser profile with synthetic records. Explore home,
navigation and search, then the libraries, programs, workout and nutrition logs,
diet calculator, recipes/meal plans, recovery/sleep/mobility, cardio, supplements,
progress/dashboard, favourites/comparisons and settings. Exercise save, reload,
edit/delete, undo, validation, keyboard flow and storage-disabled behavior.

Create records across several modules. Export a backup, initialize the owning
modules in a separate clean profile, preview without writes, restore and compare
records/references. Verify invalid files preserve existing data. Check CSV exports,
including formula-like text. Keep the original profile intact until verified.

Real Android, iPhone/iPad, human screen-reader use, print, actual personal workouts,
nutrition and backup/restore, and subjective visual preferences still need owner
testing. Automated viewports cover narrow mobile, tablet and desktop in both themes;
they do not substitute for those manual checks. No composite recovery score,
invented calorie burn/VO2max or inferred body-fat measurements are supplied.

Vercel Git deployment is disabled and repository-audited. No production domain is
connected. **Production deployment was NOT performed.** Future changes follow owner
feedback; no new content expansion or Phase 20 is part of this checkpoint.
