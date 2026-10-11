# Final live Vercel verification

Result: **PASS — ready for owner-led manual testing.**

Verified 2026-10-11T11:03:06.813Z. Production project gymuuuuuuu; deployment `dpl_JD7GorUhs1CTSSroEArjs8r4zG8i`; environment production; origin https://kaush-ka-gym.vercel.app; exact live commit `80f06ab2b6b1f6d4da252455efcc71a1daecde09`. Created 2026-10-11T10:36:27.145Z; ready 2026-10-11T10:37:11.634Z; Node 24.x; framework tanstack-start; build READY. The documentation checkpoint does not change the running application.

## Production health and security

All 14 routes loaded directly and reloaded with HTTP 200, a visible heading and hydrated search control: `/`, `/exercises`, `/programs`, `/workout`, `/foods`, `/nutrition`, `/diet-planning`, `/recipes`, `/recovery`, `/cardio`, `/supplements`, `/progress`, `/search`, `/settings/data/backup`. 16 SSR/header requests passed. HTTPS, nonce-based CSP and nonce rotation, object-src none, frame-ancestors none, same-origin connect/form policy, nosniff, DENY, Referrer-Policy, Permissions-Policy and HSTS passed. No localhost metadata. Public canonicals use the production origin; recipes/recovery/cardio/supplements roots intentionally exclude canonical metadata and remain noindex local workspaces.

Application console errors: 0; uncaught application errors: 0; failed required assets: 0; unexpected CSP violations: 0. Intentional unpublished-food 404s: 0; cancelled navigation requests: 0. No runtime error clusters found over 1h and no warning/error/fatal logs in the scoped 30m deployment query. A 1h individual-log query exceeded plan retention; no all-time claim is made.

Production environment contains only VITE_PUBLIC_APP_ORIGIN=https://kaush-ka-gym.vercel.app; no unexpected or hidden production variables were reported. No secret values were recorded.

## Privacy

8407 browser requests observed in the latest passing execution of each of 33 targeted cases, including separate restore/photo contexts. Unexpected remote requests: 0; synthetic personal-marker leaks: 0; SSR marker leaks: 0 across 27 SSR probes. Header/SSR API requests and 134 performance asset fetches are counted separately. Diagnostic attempts are excluded from the successful-cohort count. Public search queries may appear in same-origin URLs under the approved model; private queries/records remained local. No external video was played.

## Functional smoke testing

| Module                            | Result | Evidence                                                                                                                                                                                                                                                     |
| --------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Workout                           | PASS   | Synthetic sets/load/reps, reload, pause/resume, finish, history, editing and backup/restore.                                                                                                                                                                 |
| Programs                          | PASS   | Published discovery/filtering, explicit duration choice, immutable selection, reload and confirmed clearing.                                                                                                                                                 |
| Foods                             | PASS   | Milkfish preparation/provenance, soy missing serving masses, draft exclusion, known and missing values.                                                                                                                                                      |
| Nutrition                         | PASS   | Reviewed food 150 g snapshot equals per-100-g values ×1.5; null nutrients remain null; reload/delete; custom food/quick-add/fluids/edit/undo and backup.                                                                                                     |
| Diet planning                     | PASS   | Synthetic adult calculation, consent, eligibility/unsafe-goal guards, source formulas/provenance, explicit save/current target/edit/restore and clearing transient inputs.                                                                                   |
| Recipes                           | PASS   | Public recipe source/ingredient/yield snapshot copied exactly, servings scaled, consumed snapshot logged; local versions/plans/leftovers/grocery snapshots.                                                                                                  |
| Recovery                          | PASS   | Sleep diary and check-ins, pain separate from soreness, illness and pain flags preserved when reopening saved entry after reload; routine resume and backup.                                                                                                 |
| Cardio                            | PASS   | Manual duration/distance/effort/HR, history, reload, routine/resume and backup; no calculated calorie or fitness estimates added.                                                                                                                            |
| Supplements                       | PASS   | Versioned product labels, zero versus unknown values, frozen intake snapshots, trials, urgent event, backup and privacy boundaries.                                                                                                                          |
| Progress                          | PASS   | 70.5 kg weight and circumference replicates 800/810/805 mm with median 805, compatible group and reload. No inferred body-fat or physique score.                                                                                                             |
| Search                            | PASS   | Published search, draft exclusion, public URL filters, private query separation and dialog keyboard focus.                                                                                                                                                   |
| Favourites/collections/comparison | PASS   | Persisted favourites, renamed/sorted/filtered collections and moved references; source-backed food/nutrient comparisons with missing values; incompatible-family button disabled and tray preserved.                                                         |
| Backup/export                     | PASS   | Spreadsheet-safe CSV and multi-module JSON export; standard backup omits binary photos.                                                                                                                                                                      |
| Restore                           | PASS   | Fresh-context prepare/preview, zero preview canonical writes, explicit confirmation, exact re-exported record equality including relationships/snapshots, corrupt/future/malformed rejection with existing data retained.                                    |
| Photos/media                      | PASS   | Disposable image with synthetic GPS metadata sanitized locally; metadata marker removed from ZIP and binary snapshot; explicit media backup restores exact sanitized bytes in fresh context; invalid signature rejected. Native picker UI deferred to owner. |

33 unique targeted cases passed on live Chromium. The first diagnostic run had 28 passes, four harness failures and one dependent skip; selectors, metadata expectations, valid synthetic identifiers and interaction readiness were corrected. Reopening saved recovery data and the incompatible comparison disabled guard were verified. All cases subsequently passed; no application source changes were made.

## Backup and restore evidence

Exported record count: 49; populated stores: 27; databases: 6. Fresh profile was explicitly prepared; preview reported zero writes and no weight record appeared before restore. After confirmation and navigation/reload, re-exported records matched every populated source store exactly, preserving IDs, relationships and snapshots. Corrupted hash, future version and malformed JSON were rejected and 70.5 kg remained. Detailed per-store counts are in the JSON report. Normal backup excluded photo blobs; explicit media backup restored one sanitized image byte-for-byte.

## Responsive and accessibility

Widths: 320, 375, 393, 768, 1024, 1280, 1440 px; height 900 px; both light and dark themes. Routes: `/`, `/search`, `/exercises/push-up`, `/workout`, `/foods`, `/nutrition`, `/diet-planning`, `/recipes/chickpea-cucumber-bowl`, `/recovery`, `/cardio`, `/supplements`, `/progress`, `/settings/data/backup`. 182 route/width/theme states passed without page horizontal overflow or clipped main buttons outside intentional scroll regions. Populated active workout additionally passed 10 states at 320/375/768/1024/1440 in both themes.

54 dedicated axe scans passed (13 routes × two widths 320/1440 × both themes, plus Food filters and Search dialogs), with zero violations. Populated workout/history added 11 passing scans; existing targeted food/comparison checks also passed. Search focus entry/escape return passed. Automation does not replace human keyboard, screen-reader, zoom, print or visual evaluation.

## Performance sanity

134 requested JavaScript assets returned 200. Observed gzip total 681411 bytes vs existing 716800-byte budget; largest 168441 bytes vs existing 204800-byte chunk budget. This samples live journeys rather than rebuilding the complete asset inventory. No required-asset failures or observed hydration errors; no new budgets introduced.

## Repository safety and checkpoint

No production defects requiring runtime code changes were found. Only the two final live reports are intended for the documentation commit, “Record final live Vercel verification”. Existing .gitignore owner changes are preserved, excluded from staging, with SHA256 5A22EF7D464EABAD8CD0D1B4129E4B415B815DFEC13CFA2FE3919C3DDC6439DB. Tracked files deleted: 0; renamed: 0; moved: 0. No cleanup or runtime edits. Readiness tag: fitness-os-owner-testing-ready; tag points to the report checkpoint and production remains the exact verified deployment commit above.

Local diagnostic/raw/browser evidence is retained under `artifacts/final-live-production-20261011`; historical repository reports and screenshots were preserved. Machine-readable assertions, route headers, case outcomes, restore counts and limitations are recorded in final-live-vercel-verification.json.

## Owner-only remaining testing

- physical Android
- physical iPhone
- physical iPad/tablet
- real desktop workflows
- human keyboard evaluation
- screen reader
- zoom
- print
- native OS file picker
- native photo picker
- real browser storage persistence/quota/eviction
- subjective UI/UX
- real personal-data workflow after synthetic testing is accepted

**Fitness OS production verification is complete. The deployed security-audited build is ready for owner-led final manual testing.**
