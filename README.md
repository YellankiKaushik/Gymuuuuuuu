# Fitness OS

An evidence-aware, local-first fitness application built in phases from the supplied specifications. Stack: TanStack Start, React, strict TypeScript, Tailwind and Nitro. No account or backend personal-data store.

## Run

Node.js 24.16.0 and npm 11.9.0. `.nvmrc`, `.node-version`, `package.json` and CI share this toolchain.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For production: npm run build, then npm start.

## Verify

```sh
npm run check
npm run test:coverage
npx playwright install chromium
npm run test:e2e
npm run test:a11y
```

`npm run check` includes formatting for release and content tooling, lint, strict types, source-data validation, unit tests, privacy/repository audits, the production build, measured bundle-size budgets and a fresh completion audit. The coverage report is diagnostic; its current line coverage is about 75% and is not a correctness claim. GitHub Actions run the Chromium/Firefox/WebKit matrix on pull requests, the Phase 19 branch, main and the weekly schedule. `npm run test:routes` audits every route pattern and published factual link at mobile, tablet and desktop widths. `npm run test:route-report` rejects failed or unmeasured current-build routes; evidence from an older build or content index is excluded.

`VITE_PUBLIC_APP_ORIGIN` is a public HTTP(S) origin, not a secret. `.env.example` shows the local default. Keep the test origin stable: browser IndexedDB does not move between origins. Production deployment and domain connection remain disabled.

## Project

Requirements live in DOCS_for_entire_apppliaction/GYM. src/domain holds types and validation; src/data public content; src/features domain interfaces; src/storage client-only persistence. docs/phases records each completed gate and docs/decisions records intentional differences. Generated src/routeTree.gen.ts is managed by TanStack. Keep package-lock.json in version control.

Public content may render on the server; personal records remain in browser IndexedDB. Only small preferences use localStorage. Browser storage is not a backup. Export a backup regularly and before changing browsers, clearing site data or moving to another origin. Validate imports before writing; use the app's confirmation step for replacement or deletion.

Vercel configuration is prepared with Nitro, per-request CSP nonces and browser security headers. Automatic Git deployment is disabled. No production deployment, project link or production domain is authorized by this checkpoint.

## Verified content milestone

Phase 18 is integrated. Phase 19 is **in progress**, and this application is not yet certified as engineering/content complete. The generated [completion audit](docs/reports/content-completion.md) and its [JSON inventory](docs/reports/content-completion.json) list every identity, publication count and remaining content gap.

Current personal-use publications: muscles 70/70, exercises 20/184, workout science 23/98, programs 2/50, foods 256/342 (264 preparation profiles), nutrients 51/51 (35 FDA Daily Value rows), recovery 15/124, cardio 12/202 (9 articles, 2 modality guides and 1 complete source plan) and supplements 7/272. Twenty-four original recipes and three static lunch/snack meal-prep collections are available; they are not complete daily diets. Two NHS walking transitions and two NIA flexibility routines are available; conditioning routines remain unavailable. Supplement records include four outcome-specific beta-alanine and citrulline-malate claims alongside introductory caffeine and creatine education. Three NIH-scoped summaries add arginine, beetroot-derived nitrate and BCAAs, with unassessed confidence and no dose inferred. No personal protocols, product certification or current WADA-status verdicts are supplied.

Public search contains 483 factual entities alongside navigation and dashboard entries. Draft identities do not enter the public index. These counts are generated from actual production adapters, rather than the historical phase checklists.

## Source policy and review levels

Food composition comes from checked-in USDA FoodData Central snapshots. April 2026 Foundation Foods is preferred; April 2018 SR Legacy is a visibly labelled historical fallback. Explicit mappings retain exact source IDs, food states, per-100-g values, derivations, missing states and source-reported serving masses. Unmatched varieties remain unavailable. Nothing calls a fitness-data API at runtime.

ICMR-NIN/IFCT data is not bulk reproduced without documented permission. OpenStax content is excluded because its current generative-AI terms require permission. Anatomical attachment summaries currently use a labelled historical public-domain book; they are not modern clinical or muscle-activation evidence. NHS exercise text retains its Open Government Licence attribution; the NIA March 2018 older-adult guide retains its public-domain text policy and population context. No source photograph or logo is imported. The SVG movement schematics and recipe instructions are original repository work; no third-party exercise photos are copied.

The completion layer distinguishes `draft`, `source_verified`, `machine_validated`, `human_review_pending`, `published_personal_use`, `published_reviewed` and `deprecated`. Current factual publications are `published_personal_use`: source provenance and automated validation are shown, with no independent human or clinical review claimed. `published_reviewed` requires a real human attestation. Internal legacy approval flags do not imply that review.

A static nine-week running plan retains all 27 source sessions, walking recoveries, five-minute warm-up/cooldown walks and rest-day guidance. Its optional tracker freezes the selected source week, identifies intensity as source text, and never turns timed targets into recorded duration, distance or calorie expenditure. Source dates unavailable on the original page remain unavailable.

Recipe nutrition uses immutable ingredient snapshots. Final yield is explicitly estimated, not measured. Missing nutrients remain missing; no retention factors or raw-to-cooked conversions are invented. FDA Daily Values remain a label framework, separate from personal targets, EARs, RDAs and ULs.

## Content and test commands

```sh
npm run content:import:foods
npm run content:compile:recipes
npm run content:compile:nih-nutrients
npm run content:compile:templates
npm run content:verify:reviews
npm run check
npm run test:coverage
npm run test:e2e
npm run test:a11y
npm run test:privacy
npm audit --audit-level=high
npx playwright install chromium firefox webkit
npm run test:e2e:cross-browser
```

Importers parse and validate the whole proposed release before writes. Release checks reject tampered food snapshots, unresolved sources, blocked rights, false human-review labels, duplicate IDs/slugs, broken relationships, future verification dates, stale generated recipes and stale search content. New content tooling is included in strict TypeScript checks. Recipe route loaders read immutable repository content only and accept no personal records.

## Manual application testing

After the engineering/content completion checkpoint is actually issued, run the production build locally and test with synthetic records. Check real-device keyboard/touch use, screen readers, reduced motion, light/dark themes, 320px layout, tablet and desktop, print output, save/edit/delete feedback and storage-disabled behavior. Export a backup, restore it in a separate test browser profile and compare records before attempting any destructive operation. Test CSV escaping and invalid imports. Verify personal records remain on the device and that sources and review levels are understandable.

Manual device and assistive-technology testing has not been performed. The local Windows Firefox runtime has a SideBySide/mozglue launch failure. The 157b407 checkpoint passed main CI and all three Linux browser jobs (Chromium, Firefox and WebKit); see docs/reports/phase19-ci-anatomy-checkpoint.json. A subsequent local dual-browser run passed 139/140 and exposed rapid-navigation WebKit hydration. The startup/CSP correction passed 146/146 local Chromium/WebKit checks. At b040705 Linux browsers each passed 72/73, identifying a missing keyboard focus target in the collection nutrition table; coverage also failed the large-recipe stress test under concurrent instrumentation. The table is corrected and coverage worker concurrency is bounded, with unchanged assertions and timeouts. A fresh complete regression of the final content build is still required. Do not connect a production domain or deploy production during this testing preparation.

The initial static strength template uses an explicitly original arrangement and NIA older-adult framework, with linked ACE technique. It requires learning all movements, including the intermediate bench-supported row. Its 30-minute figure is a source guideline allocation, not measured completion time; unspecified rests stay unavailable. Program versions are pinned and retained for local selections. Full milestone completion is still pending.

USDA dataset verification: download the exact archive in `src/content/provenance/sources.json`, extract its named JSON payload, then run `npm run content:verify:dataset -- usda_fdc_sr_legacy_2018 path/to/FoodData_Central_sr_legacy_food_json_2018-04.json` (or use `usda_fdc_foundation_2026_04` with its named payload). Dataset hashes pin uncompressed JSON; ZIP container hashes are recorded separately. This verifies every mapped snapshot against the complete source download, including its nutrient amounts and serving masses.
