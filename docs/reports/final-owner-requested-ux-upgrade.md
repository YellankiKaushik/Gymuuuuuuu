# Fitness OS — final owner-requested UX upgrade

## 1. Executive summary

Implemented the owner's bounded redesign and both confirmed Progress defects. Home is a six-area application map; the desktop sidebar keeps primary destinations visible at normal laptop heights; Light/Dark/Auto share the existing provider, tokens and storage contract. Original workflow figures and unchanged reviewed local exercise SVGs explain ten high-value visual areas. No factual records, 900-item backlog, architecture or backup schemas were expanded.

Tested execution-tree SHA-256 (UTF-8 text CRLF normalized to LF; binary bytes unchanged): `b5d6203cc332002f9ecba4a326694abc606033c468cf1aabd1760599b9da4820`. Local raw evidence was captured before the implementation commit and names its base HEAD; the original local fingerprint below identifies that working tree. Current hosted records bind the current execution fingerprint. GitHub/Vercel records and the final owner handoff identify the containing release commit; this document does not invent a future self-hash or a deployment result.

The original local execution fingerprint was ea2b21d422e36e3df9c9ef4dd958cb92a702af6979deeb96f0aab307467181c2. At 535e2840b92b2a00117477d649747b66b422ff33, CI scheduling changed only the two workflow files; application, asset, script, dependency and test trees were identical to the implementation commit, as recorded in the JSON proof. Subsequent named Firefox corrections, if any, are distinguished in browser results.

## 2. Owner request mapping

| Request                  | Implementation                                                                                                                         | Files                                                                                                                       | Tests                                                                                                        | Result                           |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------- |
| PROG-001                 | Local calendar/time defaults across four Progress forms; existing ISO editing retained                                                 | src/features/progress/local-time.ts; src/features/progress/workspace.tsx                                                    | progress-correctness unit and owner-ux timezone/save/edit/reload cases                                       | Implemented; gate evidence below |
| PROG-002                 | Schema-valid newest active height by measuredAt, with defined ties and future exclusion                                                | src/features/progress/domain.ts; src/features/progress/workspace.tsx                                                        | progress-correctness ordering/invalid/deleted/future/tie/reopen tests; owner-ux BMI test                     | Implemented; gate evidence below |
| Navigation/sidebar       | Eight persistent destinations, compact footer, one secondary panel, Escape/opener focus, short-height fallback                         | src/components/app-shell/navigation.tsx; src/styles/visual-system.css                                                       | owner-ux seven sizes; shell keyboard/tablet/mobile tests; closure device/zoom cases                          | Implemented; gate evidence below |
| Light / Dark / Auto      | Retain provider and storage schema; Auto label and header cycle; pre-paint recovery on invalid/inaccessible storage                    | src/routes/__root.tsx; src/components/app-shell/shell.tsx; src/features/settings/page.tsx                                   | owner-ux runtime changes/manual overrides/reloads/pre-hydration theme tests; shell; print closure            | Implemented; gate evidence below |
| Homepage                 | Six-area map, useful quick actions, explicit public/local boundaries and backup path                                                   | src/components/home.tsx                                                                                                     | owner-ux seven widths/two themes/axe; owner-ux unit link validation; route audit                             | Implemented; gate evidence below |
| Design references        | Inspected both live sites and repositories; adapted action hierarchy, grouped capability cards and explanatory workflow composition    | src/components/home.tsx; src/components/common/information-path.tsx                                                         | Browser reference screenshots in ignored artifacts; no code/branding imported                                | Implemented; gate evidence below |
| Visual foundation        | Reusable semantic workflow figures, token-based surfaces and legible icons                                                             | src/components/common/information-path.tsx; src/components/common/module-diagram.tsx; src/styles/visual-system.css          | owner-ux module accessibility and responsive tests                                                           | Implemented; gate evidence below |
| Anatomy/body             | Existing approximate front/back map gains distinct orientation cues and selected-region caption; equivalent text controls retained     | src/features/muscles/body-selector.tsx                                                                                      | owner-ux keyboard/front-back/mirrored-list case; muscles suite                                               | Implemented; gate evidence below |
| Exercise visuals         | Reviewed local SVG previews in card discovery; detail media and source instructions retained                                           | src/features/exercises/catalogue.tsx                                                                                        | owner-ux local image/alt/load case; exercise suite; route audit                                              | Implemented; gate evidence below |
| Programs/workouts        | Template → actual session → history workflow with direct entry links                                                                   | src/features/programs/pages.tsx; src/components/common/module-diagram.tsx                                                   | owner-ux program diagram; programs/workout regression                                                        | Implemented; gate evidence below |
| Nutrition/diet           | Food composition → chosen plan → actual diary; missing values distinct from zero                                                       | src/features/diet-planning/pages.tsx; src/components/common/module-diagram.tsx                                              | owner-ux diet diagram; diet/nutrition regression                                                             | Implemented; gate evidence below |
| Recovery/sleep           | Separate sleep diary, subjective check-in and mobility tools without a composite score                                                 | src/features/recovery/pages.tsx; src/components/common/module-diagram.tsx                                                   | owner-ux recovery/sleep diagrams; recovery regression                                                        | Implemented; gate evidence below |
| Cardio                   | Activity, duration/effort and history workflow; no new intensity prescription                                                          | src/features/cardio/pages.tsx; src/components/common/module-diagram.tsx                                                     | owner-ux cardio diagram; cardio regression                                                                   | Implemented; gate evidence below |
| Supplement evidence      | Question → evidence → limitations; population/formulation context, no invented score                                                   | src/features/supplements/info-pages.tsx; src/components/common/module-diagram.tsx                                           | owner-ux evidence diagram; supplement regression                                                             | Implemented; gate evidence below |
| Progress charts          | Actual daily median scatter in selected calendar window; gaps unfilled, dates/kg labels, keyboard-scrollable plot and equivalent table | src/features/progress/weight-chart.tsx; src/features/progress/workspace.tsx                                                 | owner-ux chart/BMI browser case; owner-ux truthful chart unit; progress suite                                | Implemented; gate evidence below |
| Backup/data flow         | Local records → exported copy → validated restore, including scope/media reminder                                                      | src/features/data-management/page.tsx; src/components/home.tsx; src/components/common/module-diagram.tsx                    | owner-ux data diagram; backup/privacy/closure regression                                                     | Implemented; gate evidence below |
| Provenance/licenses      | Manifest records every new/reused visual; original diagrams, 32 unchanged SVGs and existing licensed icon system                       | docs/assets/owner-ux-visual-manifest.json; public/licenses/lucide.txt                                                       | owner-ux manifest/file/license unit test; no external imagery                                                | Implemented; gate evidence below |
| Accessibility/responsive | Semantic links/figures/headings, text alternatives, focus and existing reduced motion/print tokens                                     | Changed UI and styles                                                                                                       | Full browser/a11y/route/closure gates; all specified widths and laptop heights                               | Implemented; gate evidence below |
| Performance/privacy      | No chart dependency, remote imagery, analytics, cloud database, factual expansion or backup format change                              | Existing stack and budgets retained                                                                                         | check/coverage/privacy/audit/build/performance; network/SSR closure monitoring                               | Implemented; gate evidence below |
| Prior CI warnings        | Hydration/layout readiness; independent nutrient/recipe a11y cases; short isolated persistent profiles; no relaxed assertions/timeouts | tests/browser/test.ts; tests/browser/nutrients.spec.ts; tests/browser/recipes.spec.ts; tests/closure/final-closure.spec.ts  | Full current regressions and closure; Windows Firefox launch result separately recorded                      | Implemented; gate evidence below |
| Hosted failure follow-up | Isolate confirmed read-only scan loops, shard CI within existing deadlines, and fix Firefox/Linux sidebar font-metric overflow         | src/styles/visual-system.css; .github/workflows/ci.yml; .github/workflows/cross-browser.yml; named test files in section 17 | 17 successful jobs; 893 unique cases per engine; 561 dedicated a11y; 72 focused cases; 336 responsive states | Implemented; gate evidence below |
| Integrity/release        | No tracked deletions/renames/moves; normal main push; existing Vercel Git-source deployment only after gates                           | docs/decisions/owner-requested-ux-upgrade.md; final reports                                                                 | Git diff/source fingerprint; hosted run records; final deployment/production handoff                         | Implemented; gate evidence below |

## 3. PROG-001 — local timestamp defaults

UTC ISO digits were displayed as a local wall clock, then interpreted locally on save. Local numeric year/month/day/hour/minute formatting now supplies datetime-local defaults in weight, height, circumference and external-composition forms; local-date defaults use the same formatter. Saving converts the intended local minute to an ISO instant. Existing JSON edits preserve explicit timestamp offsets and validation. Historical timestamps are not automatically shifted: original intent cannot be inferred safely. If an owner accepted the former default, they can review known affected records against their own notes and use the validated editor.

Focused units: UTC, Asia/Kolkata (+05:30), America/Los_Angeles (negative offset), both midnight/day boundaries, edited instants and database reopen. Browser regressions cover UTC, Kolkata, Los Angeles and Kolkata local midnight, actual save/edit/reload. All pass in the exact browser totals below. Initial focused Progress run: 14/14 tests; final units include all regressions.

## 4. PROG-002 — chronological height selection

IndexedDB getAll key order was treated as recency by taking the last height. Schema-valid active records now sort by measurement instant descending. Deleted/invalid records are excluded. Future records stay stored and become eligible on the next read/render after their instant. Equal measuredAt instants prefer latest updatedAt, latest createdAt, then stable code-point ID order only as a final tie. No storage-order dependence remains.

Tests deliberately reverse ID/date order, compare equivalent offset timestamps, exercise ties/invalid/deleted/future rows, edit and reopen the database. The synthetic 80 kg / older 160 cm / newer 180 cm browser scenario renders 24.7 kg/m² after reload. The UI identifies the selected height and its date.

## 5. Navigation

Previously, branding/privacy/footer spacing and expanded child links enlarged a separately scrolling sidebar. At 1440×700 the old navigation had 890px of scrollable content; the new primary sidebar fits its 700px viewport. Eight primary destinations now remain in a compact rail. Only one secondary group panel opens adjacent to it, with a labelled group, keyboard links and Escape/opener focus. WebKit pointer activation explicitly focuses the opener. Sources, Settings, collapse and local-data guidance remain available. Below 700px height, necessary sidebar scrolling is allowed. At 1440×700, 1280×720 and 1024×768 there is no primary-sidebar overflow. Existing mobile bottom navigation and More/tablet dialogs retain destinations and focus restoration.

## 6. Theme

Light and Dark override system preference and persist in the existing preference record. Auto (System) retains the stored system enum and follows runtime prefers-color-scheme changes. The header cycles all three choices. The nonce-bearing early script applies theme before hydration and recovers from malformed/inaccessible storage. Tests intentionally block hydration and verify manual Light/Dark and malformed-storage/system-Dark first paint. Existing print tokens and reduced-motion support are retained. No independent route theme system was added.

## 7. Homepage

A concise purpose/quick-action panel leads to six grouped cards: Learn, Train, Eat, Recover, Progress and Tools/data. Direct module links cover anatomy, exercises, science, nutrients, evidence, programs, workout/cardio, foods/diary/diet/recipes/meal plans, sleep/mobility, weight/measurements/photos/dashboard, search/saved/comparison and backup/restore/export. Public repository knowledge is distinct from IndexedDB personal records. The backup figure explains export custody and validation before writes. No fake statistics or personalized health claims are shown.

The owner's [Criscris](https://criscris-inception.vercel.app/) and [SchemeSeva](https://scheme-seva-agent.vercel.app/) sites and repositories were inspected for action hierarchy, grouped cards and workflow/data-boundary explanations. No code, branding or architecture was transplanted. Before/reference screenshots remain in ignored artifacts.

## 8. Visual improvements

| Area                | Informative visual                                                   | Accessibility and provenance                                                        |
| ------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Home                | Six icon-led module cards and backup path                            | Semantic sections/links; existing licensed icon system                              |
| Anatomy             | Distinct front/back cues and selected-region caption on existing map | Approximate original silhouette; mirrored keyboard text list                        |
| Exercises           | 32 reviewed repository SVGs reused in discovery                      | Existing alt/source/license records; lazy-loaded; full detail instructions retained |
| Programs/workout    | Template → recorded session → history                                | Original semantic figure/list; direct links                                         |
| Nutrition/diet      | Composition → chosen plan → actual intake                            | Original figure; unknown/not-measured distinct from zero                            |
| Recovery/sleep      | Separate diary/check-in/mobility tools                               | Original figure; no composite score                                                 |
| Cardio              | Activity → duration/effort record → history                          | Original figure; measurement methods retained, no new prescription                  |
| Supplement evidence | Question → claim evidence → limitations                              | Original interpretation workflow; no invented evidence score                        |
| Progress            | Real daily median scatter with date/kg axes                          | No gap filling/predictions; textual summary, scroll region and table                |
| Backup/data         | Local inventory → export → validated restore                         | Original figure; record/media scope and local ownership explained                   |

## 9. Asset licensing/provenance

Manifest: [owner-ux-visual-manifest.json](../assets/owner-ux-visual-manifest.json). Every new code-native visual and every reused exercise SVG is listed with file, purpose, source, author, license, source URL, attribution and modified state. New external images: 0. New raster/SVG image files: 0. Existing Lucide ISC/underlying Feather MIT notices are retained in public/licenses/lucide.txt (3,208 bytes). Original diagrams are repository work; no separate third-party image license is claimed. Existing exercise media files are byte-unchanged. No hotlinks or unknown-license imagery were added.

## 10. Accessibility

Current hosted dedicated accessibility: 561 passed. Original local dedicated gate: chromium: 198 passed / 0 failed. Full regression and route gates additionally retain all axe assertions. Automated scans use the existing WCAG A/AA tags, including applicable 2.1/2.2 checks. New controls have accessible names, visible focus, semantic button/link behavior and textual chart alternatives. Keyboard/front-back/mirrored-region and mobile focus tests pass. This is automated evidence, not a claim of human assistive-technology certification.

## 11. Responsive testing

New Home/nav cases pass in Chromium and WebKit at 320×800, 375×812, 393×852, 768×1024, 1024×768, 1280×720 and 1440×700, in Light and Dark. Auto runtime behavior is independently tested. No page-wide overflow or unnecessary normal-height desktop sidebar overflow. The closure suite adds mobile/tablet/desktop configurations, portrait/landscape, zoom/large text and print. Small charts have a keyboard-scrollable plot and an equivalent table rather than illegible axis labels.

Current-build detailed layout probe: 336 states across 12 changed routes, all seven widths, both themes and both engines; 0 overflows.

## 12. Performance

| Measurement                      |    Before |     After |                Unchanged limit |
| -------------------------------- | --------: | --------: | -----------------------------: |
| Browser JS gzip                  | 701,549 B | 704,566 B |                      716,800 B |
| Largest JS chunk gzip            | 168,570 B | 168,650 B |                      204,800 B |
| Public JSON gzip (97 assets)     | 429,517 B | 429,517 B |                      524,288 B |
| CSS gzip (2 assets)              |  18,111 B |  19,220 B | Existing architecture retained |
| New raster/SVG image asset bytes |         0 |         0 |             No new image files |

JS change: +3,017 B gzip; CSS: +1,109 B gzip. The 32 reused exercise SVGs total 39,776 B raw / 16,390 B gzip across unique existing files, now lazily discoverable as card previews. No chart library or runtime remote asset dependency. The existing raw chunk >500 kB advisory remains; no missing/broken-asset warning and both gzip budgets pass.

## 13. Automated tests

Clean npm ci; complete npm run check (format, lint, strict application/content TypeScript, content/search, units, privacy, production build, original performance/public-data budgets and content audit); coverage; dependency audit: all passed. The complete check is repeated after the confirmed Linux corrections. Units: 371/371 across 97 files. Original local coverage: 73.22% statements, 65.03% branches, 67.65% functions, 77.15% lines; unchanged coverage configuration. Current hosted coverage is separately recorded per completed job in JSON. npm vulnerabilities: 0. Exact commands/statuses/durations are in the JSON report and ignored gate logs.

## 14. Browser results

Original comprehensive local regressions: chromium: 328 passed / 0 failed; webkit: 328 passed / 0 failed. The initial 656-case matrix is retained separately: chromium: 328 passed / 0 failed; webkit: 326 passed / 2 failed. After the two diagnosed harness corrections, the entire 328-case WebKit engine was rerun; targeted portability (2/2) and food retry (1/1) also passed. No application code changed for those harness findings. Original closure: closure-chromium: 8 passed / 0 failed; closure-webkit: 8 passed / 0 failed; android-chromium: 8 passed / 0 failed; iphone-webkit: 8 passed / 0 failed; ipad-webkit: 8 passed / 0 failed; android-tablet-chromium: 8 passed / 0 failed. Current exact-build route audit: chromium: 702 passed / 0 failed. The initial route matrix recorded chromium: 701 passed / 1 failed; its one shared-bundle ERR_NO_BUFFER_SPACE observation passed an unchanged fresh-browser recheck (703 executions for that original build). The post-Linux-correction build reruns all 702 routes and their separate current-build validator. Original dedicated local accessibility: chromium: 198 passed / 0 failed. No omitted failing cases are counted as passes.

Current-build initial route execution: chromium: 701 passed / 1 failed. Its restore-route shared-index Windows ERR_NO_BUFFER_SPACE observation passes an unchanged fresh-browser replay (1 rechecked failures); the independent validator accepts all 702 current-build records. The raw failure remains in JSON and its trace is preserved. This build has 703 route executions including the replay.

Complete hosted diagnosis then exposed cumulative scan deadlines and real Firefox/Linux 1440×700 sidebar overflow. The latter is fixed by 16px less unused spacing, preserving all text sizes and targets; scrolling is available below 700px. Confirmed read-only scan loops are isolated by route/viewport with every original state and assertion retained. The former 180/240-second aggregates now use the stricter default 30 seconds per isolated case. Cases consequently increase from 328 to 893, and dedicated accessibility from 198 to 561; the 179 published routes still receive exactly 1,074 viewport/theme scans. The current local check and all 72 focused correction cases pass. Raw 535e284 results (12 jobs passed, four failed; Firefox 319/328 and WebKit 327/328) remain in the JSON and ignored evidence; complete current hosted counts below supersede those failures.

Hosted Linux status: CI 38921593094: success; Cross-browser regression 38921593025: success. Windows Firefox fails to launch with spawn UNKNOWN before app navigation; this is separately classified as an environment limitation. Hosted commit: 87ac86920b37930c6e3e1b9184f5ff181b0b285c.

| Hosted engine | Regression passes | Closure passes |
| ------------- | ----------------: | -------------: |
| chromium      |               893 |             24 |
| firefox       |               893 |              8 |
| webkit        |               893 |             24 |

CI independently verifies 893 Chromium cases and 561 dedicated accessibility cases. All 17 jobs across both required workflows passed; exact per-shard counts, job IDs and coverage are retained in JSON. The containing documentation-only release commit retains the identical runtime and test trees; its own required workflows are checked again before deployment. Exact final-SHA job IDs and the live release receipt are supplied in the final owner handoff.

Initial targeted development run failed at hydration (AsyncLocalStorage externalization). Production-mode targeted Chromium passed 16/16 and then 22/22. Initial WebKit targeted run passed 35/39; three Escape-focus failures were corrected in product code, and a theme/reload timing case gained a real state-readiness assertion. Stable WebKit targeted recheck passed 28/28. Earlier evidence is retained; these intermediate counts are not substituted for the final full gates.

Prior warnings: Firefox nutrient/recipe a11y timeouts: **TEST_HARNESS** — All existing combinations retained as independent cases without increasing timeouts; current hosted outcome is recorded above.

Readiness/layout timing: **TEST_HARNESS** — Explicit hydration, fonts and frame readiness; no assertion or timeout removed.

Interrupted WebKit navigation: **RESOLVED** — Current regression and closure results supersede unconfirmed earlier observations for this execution tree.

Long Windows persistent profile paths: **ENVIRONMENT_LIMITATION** — Isolated short temporary profile directories preserve real restart/backup behavior.

Windows Firefox launch: **ENVIRONMENT_LIMITATION** — browserType.launch: spawn UNKNOWN

Development AsyncLocalStorage externalization: **ENVIRONMENT_LIMITATION** — Observed development client failure; production build/server verified. No unrelated toolchain change.

One route shared-bundle net::ERR_NO_BUFFER_SPACE: **ENVIRONMENT_LIMITATION** — Initial route evidence retained; the identical failed route passed in a fresh browser with every asset/axe/geometry assertion unchanged. The exact-build report validates all 702 current routes.

Current-build restore-route Windows socket buffer: **ENVIRONMENT_LIMITATION** — Initial 701/702 with shared-index net::ERR_NO_BUFFER_SPACE; identical fresh-browser restore route passes every original assertion. Raw failure/trace retained and separate validator accepts all 702 exact-build records.

Hosted whole-job deadlines: **ENVIRONMENT_LIMITATION** — Original and unchanged-repeat CI verification jobs reached 30 minutes; unsharded WebKit/Firefox reached 40 minutes. All cancelled evidence is retained and is not counted as passing. Firefox also printed five timeout and one failure markers, which require the separately recorded named-case diagnosis. Two dedicated CI Chromium shards and four shards per matrix engine retain every test and assertion, two workers, all thresholds/budgets and original job/test timeouts. Final complete results are recorded in hosted counts.

Fresh-profile file preview before hydration: **TEST_HARNESS** — The separate page bypassed the fixture; setInputFiles could set a disabled pre-hydration input. Added readyForUi after each separate-page navigation; both exact portability cases pass.

Food retry quantity before data readiness: **TEST_HARNESS** — Trace fill began at 862696ms while the retried asset completed at 862707ms. Three unchanged isolated runs passed; an explicit loaded-profile assertion and retained-quantity assertion now precede preview checks.

## 15. Privacy/security

397-source-file runtime/privacy audit passes. Browser-local architecture, existing validation-before-write, backup contracts, destructive confirmations, no-account behavior and security headers/CSP nonce remain. No remote tracking, analytics, personal cloud database, fitness API, new dependency or frontend secret was introduced. Closure monitoring covers 6349 requests across six persistent profiles, with 0 unexpected remote origins, private-marker leaks, page errors or failed assets. It also verifies 528 device states, 432 zoom states and 78 ARIA snapshots. SSR marker checks remain intact. Local two-engine visual smoke also reports no external requests, marker leaks, console/page errors or failed assets. No owner data was read or seeded.

## 16. Remaining limitations

WebKit screenshot preparation in Playwright inserts an unnonced empty body style to synchronize animation; the unchanged application CSP correctly rejects that tool injection. This was reproduced independently before/after screenshots and classified TEST_HARNESS. Representative images use Chromium. Normal Chromium/WebKit smoke runs without screenshot injection reject every console, request and asset error; no CSP policy was weakened. Before/after and module screenshots remain in ignored artifacts/ux-upgrade/local-after-ci-corrections; earlier captures remain in artifacts/ux-upgrade/visual-evidence and original references in artifacts/ux-upgrade.

- Windows Firefox cannot launch on this host; distinguish it from hosted Linux results.
- The development server exhibited a client AsyncLocalStorage bundling failure; production server is verified.
- The existing Vite raw chunk-size advisory remains; unchanged gzip budgets pass.
- Diagrams are approximate navigation/application workflows, not scientific anatomy or exercise technique.
- Physical-device, human assistive-technology and source-review boundaries remain those of the existing release; no new certification is claimed.
- Large Windows route crawls can encounter shared-asset ERR_NO_BUFFER_SPACE. Each observed case retains its raw failure, passes an unchanged fresh-browser replay, and must satisfy the complete current-build route-record validator.

Production release is a separate, authorized step after clean main push and hosted checks. This report makes no pre-deployment claim of READY. The final owner handoff and Vercel/GitHub records provide exact SHA/deployment/live verification evidence.

## 17. Files changed

- `.github/workflows/ci.yml`
- `.github/workflows/cross-browser.yml`
- `README.md`
- `docs/assets/owner-ux-visual-manifest.json`
- `docs/decisions/owner-requested-ux-upgrade.md`
- `docs/phases/phase-19.md`
- `docs/reports/final-owner-requested-ux-upgrade.json`
- `docs/reports/final-owner-requested-ux-upgrade.md`
- `package.json`
- `public/licenses/lucide.txt`
- `src/components/app-shell/navigation.tsx`
- `src/components/app-shell/shell.tsx`
- `src/components/common/information-path.tsx`
- `src/components/common/module-diagram.tsx`
- `src/components/home.tsx`
- `src/features/cardio/pages.tsx`
- `src/features/data-management/page.tsx`
- `src/features/diet-planning/pages.tsx`
- `src/features/exercises/catalogue.tsx`
- `src/features/muscles/body-selector.tsx`
- `src/features/programs/pages.tsx`
- `src/features/progress/domain.ts`
- `src/features/progress/local-time.ts`
- `src/features/progress/weight-chart.tsx`
- `src/features/progress/workspace.tsx`
- `src/features/recovery/pages.tsx`
- `src/features/settings/page.tsx`
- `src/features/supplements/info-pages.tsx`
- `src/routes/__root.tsx`
- `src/styles/app.css`
- `src/styles/visual-system.css`
- `tests/browser/cardio-plan.spec.ts`
- `tests/browser/cardio.spec.ts`
- `tests/browser/data-management.spec.ts`
- `tests/browser/diet-planning.spec.ts`
- `tests/browser/exercises.spec.ts`
- `tests/browser/final-security.spec.ts`
- `tests/browser/foods.spec.ts`
- `tests/browser/foundation.spec.ts`
- `tests/browser/hydration.spec.ts`
- `tests/browser/manual-test-ready.spec.ts`
- `tests/browser/muscles.spec.ts`
- `tests/browser/nutrients.spec.ts`
- `tests/browser/nutrition.spec.ts`
- `tests/browser/owner-ux.spec.ts`
- `tests/browser/phase19-cardio-education.spec.ts`
- `tests/browser/phase19-comparisons.spec.ts`
- `tests/browser/phase19-content.spec.ts`
- `tests/browser/phase19-recovery-public.spec.ts`
- `tests/browser/phase19-running-plan.spec.ts`
- `tests/browser/phase19-supplement-evidence.spec.ts`
- `tests/browser/pre-vercel-photo.spec.ts`
- `tests/browser/programs.spec.ts`
- `tests/browser/progress.spec.ts`
- `tests/browser/recipes.spec.ts`
- `tests/browser/recovery.spec.ts`
- `tests/browser/science.spec.ts`
- `tests/browser/search-phase16.spec.ts`
- `tests/browser/security-headers.spec.ts`
- `tests/browser/shell.spec.ts`
- `tests/browser/supplements.spec.ts`
- `tests/browser/test.ts`
- `tests/browser/workout.spec.ts`
- `tests/closure/final-closure.spec.ts`
- `tests/owner-ux.test.tsx`
- `tests/progress-correctness.test.ts`

## 18. Files deleted / renamed / moved

**0 / 0 / 0**. No git clean, hard reset, git rm, force push or history rewrite. Historical tracked reports/screenshots and frozen content were preserved. New test evidence remains under ignored artifacts/test-results/route-test-results/data-imports/coverage locations; isolated browser profiles use temporary directories.
