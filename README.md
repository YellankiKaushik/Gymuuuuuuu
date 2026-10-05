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

`npm run check` includes formatting for release and content tooling, lint, strict types, source-data validation, unit tests, privacy/repository audits, the production build, measured bundle-size budgets and a fresh completion audit. The coverage report is diagnostic; its current line coverage is about 74% and is not a correctness claim. GitHub Actions run the Chromium/Firefox/WebKit matrix on pull requests, the Phase 19 branch, main and the weekly schedule. `npm run test:routes` audits every route pattern and published factual link at mobile, tablet and desktop widths.

Set the public `VITE_PUBLIC_APP_ORIGIN` to the approved canonical domain in Vercel's Production environment. It must contain only the HTTP(S) origin (no path or query), and it is not a secret. Keep the same production origin before users save local data; browser IndexedDB does not move when origins change. `.env.example` shows the local default.

## Project

Requirements live in DOCS_for_entire_apppliaction/GYM. src/domain holds types and validation; src/data public content; src/features domain interfaces; src/storage client-only persistence. docs/phases records each completed gate and docs/decisions records intentional differences. Generated src/routeTree.gen.ts is managed by TanStack. Keep package-lock.json in version control.

Public content may render on the server; personal records remain in browser IndexedDB. Only small preferences use localStorage. Browser storage is not a backup. Export a backup regularly and before changing browsers, clearing site data or moving to another origin. Validate imports before writing; use the app's confirmation step for replacement or deletion.

Vercel configuration is prepared with Nitro, per-request CSP nonces and browser security headers. Automatic Git deployment is disabled. No production deployment, project link or production domain is authorized by this checkpoint.

## Verified content milestone

Phase 18 is integrated. Phase 19 is **in progress**, and this application is not yet certified as engineering/content complete. The generated [completion audit](docs/reports/content-completion.md) and its [JSON inventory](docs/reports/content-completion.json) list every identity, publication count and remaining content gap.

Current personal-use publications: muscles 3/70, exercises 1/184, workout science 3/98, programs 0/50, foods 46/342 (47 preparation profiles), nutrients 3/51 (3 FDA Daily Value rows), recovery 2/124, cardio 1/202 and supplements 2/272. Twelve original recipes are available; public meal templates and reviewed recovery/cardio routines remain unavailable. Supplement pages are introductory education, with no published research protocols, product certification or current WADA-status verdicts.

Public search contains 73 factual entities alongside navigation and dashboard entries. Draft identities do not enter the public index. These counts are generated from actual production adapters, rather than the historical phase checklists.

## Source policy and review levels

Food composition comes from checked-in USDA FoodData Central snapshots. April 2026 Foundation Foods is preferred; April 2018 SR Legacy is a visibly labelled historical fallback. Explicit mappings retain exact source IDs, food states, per-100-g values, derivations, missing states and source-reported serving masses. Unmatched varieties remain unavailable. Nothing calls a fitness-data API at runtime.

ICMR-NIN/IFCT data is not bulk reproduced without documented permission. OpenStax content is excluded because its current generative-AI terms require permission. Anatomical attachment summaries currently use a labelled historical public-domain book; they are not modern clinical or muscle-activation evidence. Public-sector exercise text retains its Open Government Licence attribution. The SVG movement cue and recipe instructions are original repository work; no third-party exercise photos are copied.

The completion layer distinguishes `draft`, `source_verified`, `machine_validated`, `human_review_pending`, `published_personal_use`, `published_reviewed` and `deprecated`. Current factual publications are `published_personal_use`: source provenance and automated validation are shown, with no independent human or clinical review claimed. `published_reviewed` requires a real human attestation. Internal legacy approval flags do not imply that review.

Recipe nutrition uses immutable ingredient snapshots. Final yield is explicitly estimated, not measured. Missing nutrients remain missing; no retention factors or raw-to-cooked conversions are invented. FDA Daily Values remain a label framework, separate from personal targets, EARs, RDAs and ULs.

## Content and test commands

```sh
npm run content:import:foods
npm run content:compile:recipes
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

Manual device and assistive-technology testing has not been performed. The local Windows Firefox runtime currently has a SideBySide/mozglue launch failure; that browser remains unverified until it runs successfully on a supported host. Do not connect a production domain or deploy production during this testing preparation.
