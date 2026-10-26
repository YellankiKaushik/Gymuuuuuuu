# Phase 20 — visual muscle education and personal workout builder

Implementation is present; **release is blocked** by the unchanged-lockfile dependency audit and incomplete Firefox/CI verification. Starting main: `9dd862cbad7fdc33ebcc0086e89ad1e8a19ffd3b`. This report binds to its containing commit; the post-push handoff supplies the exact SHA. Code fingerprint SHA-256: `aa80187f542edb483c6490c847a8804fce7a1447dcc93b02e66b25967ededd62`.

## 1. Executive summary

Twelve existing muscle location schematics, six user-controlled exercise guides and a local two-session personal-plan editor connect the existing learning and workout tracking modules. No factual inventory expansion, database migration, dependency upgrade or production deployment is included. Every requirement has a PASS / FAIL / NOT TESTED entry in the companion JSON and the matrix below.

## 2. Twelve muscles and visual coverage

| Immutable ID              | Muscle             | Status | Source access                                                |
| ------------------------- | ------------------ | ------ | ------------------------------------------------------------ |
| muscle_biceps_brachii     | Biceps brachii     | PASS   | [Repository records](../../src/content/muscles/records.json) |
| muscle_deltoid            | Deltoid            | PASS   | [Repository records](../../src/content/muscles/records.json) |
| muscle_rectus_femoris     | Rectus femoris     | PASS   | [Repository records](../../src/content/muscles/records.json) |
| muscle_vastus_lateralis   | Vastus lateralis   | PASS   | [Repository records](../../src/content/muscles/records.json) |
| muscle_vastus_medialis    | Vastus medialis    | PASS   | [Repository records](../../src/content/muscles/records.json) |
| muscle_vastus_intermedius | Vastus intermedius | PASS   | [Repository records](../../src/content/muscles/records.json) |
| muscle_gluteus_maximus    | Gluteus maximus    | PASS   | [Repository records](../../src/content/muscles/records.json) |
| muscle_latissimus_dorsi   | Latissimus dorsi   | PASS   | [Repository records](../../src/content/muscles/records.json) |
| muscle_pectoralis_major   | Pectoralis major   | PASS   | [Repository records](../../src/content/muscles/records.json) |
| muscle_triceps_brachii    | Triceps brachii    | PASS   | [Repository records](../../src/content/muscles/records.json) |
| muscle_gastrocnemius      | Gastrocnemius      | PASS   | [Repository records](../../src/content/muscles/records.json) |
| muscle_soleus             | Soleus             | PASS   | [Repository records](../../src/content/muscles/records.json) |

Each location uses the original code-native abstract body, broad highlighted zone, front/back orientation and dashed deep-structure cue where sourced. Existing anatomical region, actions, qualifiers, explicitly linked exercises and citations remain available. No parent action is inferred.

## 3. Six exercise guides

| Immutable ID                            | Guide                          | Existing difficulty | Status |
| --------------------------------------- | ------------------------------ | ------------------- | ------ |
| exercise_bodyweight_squat               | Bodyweight squat               | beginner            | PASS   |
| exercise_incline_push_up                | Incline push-up                | foundation          | PASS   |
| exercise_one_arm_dumbbell_row           | One-arm dumbbell row           | intermediate        | PASS   |
| exercise_seated_dumbbell_shoulder_press | Seated dumbbell shoulder press | foundation          | PASS   |
| exercise_dumbbell_curl                  | Dumbbell curl                  | foundation          | PASS   |
| exercise_standing_calf_raise            | Standing calf raise            | foundation          | PASS   |

SETUP → ACTION → RESET are explicit keyboard-operable buttons with pressed state and adjacent text. Existing equipment, setup, execution, checkpoints, common mistakes, muscle-role qualifiers, safety and citations remain below. The one-arm dumbbell row stays **intermediate**. RESET reuses the source-described starting-position geometry; there is no autoplay.

## 4. Source/provenance and visual limitations

[The visual manifest](../assets/visual-training-pilot-manifest.json) records all 30 documented states, owning record/version/fields, source IDs, origin, author, licensing and unperformed independent review. The 12 muscle records and 6 exercise records retain their original factual review metadata. There are 24 distinct geometric cues (12 locations plus 2 poses for each of 6 guides), presented in 30 states; zero image/media files were added. These are broad approximate cues, without exact muscle boundaries, scale, activation percentages, measured joint angles or a guarantee of technique. Unpictured details stay unspecified. Incline push-up uses the existing wall-supported instructions. No source image was copied or traced; no independent clinical/human review is claimed.

## 5. Personal-plan features

Create a named plan with A and optional B, add up to six unique allowlisted exercises per session, reorder/remove entries, edit nullable intended sets/repetitions/rest, save, reopen, edit, explicitly reload and confirm deletion. Rest uses seconds or minutes with canonical whole-second storage. Zero rest and unspecified rest differ. Empty saved drafts cannot start a workout. No sets, repetitions, loads or schedules are generated. Failed saves retain the draft; duplicate actions are guarded and stale changes are rejected atomically. Personal plans remain separate from published source programs and actual completed logs.

## 6. IndexedDB contract and migration decisions

[The compatibility decision](../decisions/phase-20-personal-plan-contract.md) documents fitness-os-local v1 / records, module plans, personal-workout-plan payload v1, stable IDs, ISO timestamps, positive revision and strict allowlisted references. No new database/store/migration is required. Existing unrelated generic records and backup envelopes remain compatible. Full-value compare-and-swap is one IDB transaction; restored key order is normalized. Plan writes and starts reuse the existing data-restore lock/operational fallback lease, and pending recovery journals block mutations. No personal records are written to localStorage.

## 7. Workout-tracker integration

Starting a saved nonempty A/B session verifies the saved revision, initializes existing tracker preferences through the owning API and calls the established newSession/newSet/createWorkout path. Names and targets are copied into a normal personal/ad_hoc workout with no canonical program reference. Unspecified intended sets create no prefilled sets. Actual repetitions/loads and recording mode remain editable through the existing tracker. The completed muscle → exercise → plan → save/reload → start → log/complete → history → edit-plan journey verifies that earlier workout targets remain unchanged. The tracker navigation returns to saved plans without putting private plan names/IDs in URLs.

## 8. Backup, restore and CSV

PASS: global portable JSON includes versioned plans; fresh-profile preparation and restore reconstruct both sessions and exercise references. Preview performs zero canonical writes. Correctly hashed future/malformed/unknown-exercise records fail before writes and preserve populated data. Interrupted restore resume/rollback and a later database quota fault exercise existing before-image safeguards. The global manager and original envelope formats are reused. Workout-only exports remain workout-only and the plan workspace links to full backup. Plan CSV uses existing quoting/formula neutralization and download helpers, includes plan/session/order/exercise/targets, and is explicitly an inspection format rather than restore.

## 9. Accessibility

Final browser sweep: **PASS** (1972 passed; 0 failed). New SVG titles/descriptions, semantic controls, named forms, keyboard-controlled states, visible focus, live save/error feedback, single main landmark and confirmations are checked. A real SSR title defect was fixed and covered by static-render assertions; error suppression/CSP weakening was not used. WCAG 2.2 AA axe checks are automated proxies, not aural screen-reader or physical accessibility certification.

## 10. Responsive results

New matrix: muscle, exercise guide and populated two-session builder at **320, 375, 393, 768, 1024, 1280 and 1440 px**, in Light, Dark, Auto/light OS and Auto/dark OS, with reduced motion. Auto uses the real preference/media-change path. Checks assert no horizontal page overflow, a single main landmark, labelled controls and zero scoped axe violations; existing tables scroll locally. Both available engines completing this matrix provide 168 screen/width/theme combinations. Chromium screenshots cover 320/768/1440 in both explicit themes; representative mobile/tablet/desktop views were visually inspected. Real hardware remains NOT TESTED.

## 11. Privacy and security

PASS: static runtime/privacy audit, SSR exclusion and synthetic browser network checks keep personal plan data out of server output, metadata, request payloads/headers, external origins and localStorage. No accounts, cloud personal storage, telemetry or runtime fitness API was introduced. Existing CSRF, nonce CSP and least-privilege workflow settings remain intact.

**FAIL — dependency audit:** the final unchanged-lockfile audit reports **3 high + 1 moderate affected packages, 0 critical**. Zod 4.6.5 is a production dependency; Vite 8.3.2, undici 8.11.2 (via jsdom) and fast-uri 3.1.8 (via AJV) also appear in the installed dependency graph. This is not a clean release audit. The owner explicitly prohibits dependency upgrades in this phase, so no audit fix, version override, dependency upgrade or security-gate bypass was applied. Exploitability in this application has not been certified.

Primary advisory evidence: [Zod collection validation](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), [Vite/launch-editor Windows check](https://github.com/advisories/GHSA-587h-7wmj-h5pm), [undici content-encoding error](https://github.com/advisories/GHSA-xjj6-f33q-929c), [fast-uri scheme normalization](https://github.com/advisories/GHSA-w74x-v6f9-j3xg). The JSON includes all advisories returned by npm audit, including lower-severity entries for the same packages.

## 12. Exact test results

| Gate                                          | Status / result                                                                                               | Evidence                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Clean npm ci                                  | PASS; lockfile unchanged; audit warnings retained                                                             | artifacts/phase20/final-npm-ci.log            |
| npm run check                                 | PASS; format, lint, strict types, content/search, 404 tests / 100 files, privacy, build and unchanged budgets | artifacts/phase20/final-check.log             |
| Targeted pilot unit tests                     | PASS; 33 tests / 3 files                                                                                      | artifacts/phase20/pilot-unit-stable.log       |
| Portability plus existing restore regressions | PASS; 47 tests at that checkpoint                                                                             | artifacts/phase20/portability-tests-fixed.log |
| Focused repaired UI                           | PASS; 15 cases                                                                                                | artifacts/phase20/focused-ui-final.log        |
| Coverage                                      | PASS; 404 tests / 100 files; 72.79% statements, 64.96% branches, 66.89% functions, 76.5% lines                | artifacts/phase20/final-coverage.log          |
| Chromium + WebKit                             | PASS; 1972 passed / 0 failed; 1972-case inventory                                                             | artifacts/phase20/final-cross-browser.log     |
| Local Firefox                                 | NOT TESTED; one launch probe failed before assertions (spawn UNKNOWN)                                         | artifacts/phase20/final-firefox-launch.log    |
| Closure proxies                               | PASS; 48 passed / 0 failed                                                                                    | artifacts/phase20/final-closure.log           |
| Public route audit                            | PASS; 703 passed / 0 failed                                                                                   | artifacts/phase20/final-routes.log            |
| npm audit                                     | FAIL; 4 affected packages (3 high, 1 moderate); no upgrade authorized                                         | artifacts/phase20/final-audit.json            |
| Containing-commit CI                          | NOT TESTED at report creation; exact-SHA post-push snapshot belongs to final handoff                          | GitHub Actions for the containing commit      |

The first restricted Windows Vitest invocation failed to read generated temporary modules; the unchanged tests were rerun outside that temporary-file restriction. Early UI diagnostics exposed the fixed save-notice overwrite and SVG SSR title mismatch; select lookup and asynchronous confirmation mistakes in the new test harness were corrected. Original diagnostics remain in ignored phase artifacts. No assertion, timeout, security check or performance budget was weakened. Historical content-completion report bytes are restored after retaining fresh audit evidence locally.

## 13. Performance before and after

| Measurement (bytes gzip except media) | Before | After  | Change |
| ------------------------------------- | ------ | ------ | ------ |
| jsGzip                                | 704799 | 716114 | 11315  |
| largestJsGzip                         | 168652 | 168817 | 165    |
| cssGzip                               | 20317  | 20766  | 449    |
| jsonGzip                              | 429517 | 429517 | 0      |
| newMediaFileBytes                     | 0      | 0      | 0      |

Final build: 163 JS, 2 CSS and 97 public JSON assets. The 716800-byte aggregate JS limit and 204800-byte largest chunk limit remain unchanged; aggregate JS headroom is only **686 bytes**. JSON remains under its unchanged 524288-byte aggregate / 65536-byte per-shard gzip budgets. There are no new heavy dependencies or media files. Measurements use fresh builds with the same lockfile and Node/npm toolchain.

## 14. Files modified and added

Modified (13):

- README.md
- docs/README.md
- package.json
- src/data/navigation.ts
- src/domain/schemas/foundation.ts
- src/features/data-management/service.ts
- src/features/exercises/detail.tsx
- src/features/muscles/catalogue.tsx
- src/features/muscles/detail.tsx
- src/features/workout-tracker/start.tsx
- src/routeTree.gen.ts
- src/storage/indexed-db/adapter.ts
- src/styles/app.css

Added (17):

- docs/assets/visual-training-pilot-manifest.json
- docs/decisions/phase-20-personal-plan-contract.md
- docs/phases/phase-20.md
- docs/reports/visual-training-pilot.json
- docs/reports/visual-training-pilot.md
- src/domain/schemas/personal-workout-plan.ts
- src/features/visual-training/exercise-guide.tsx
- src/features/visual-training/plan-editor.tsx
- src/features/visual-training/plans.ts
- src/features/visual-training/schematics.tsx
- src/features/visual-training/scope.ts
- src/routes/workout_.plans.tsx
- src/styles/visual-training.css
- tests/browser/visual-training-pilot.spec.ts
- tests/personal-workout-plans.test.ts
- tests/visual-training-education.test.tsx
- tests/visual-training-portability.test.ts

Tracked deletions: 0. Moves/renames: 0. All original 1337 paths remain. Existing factual source/search/public-asset files, specifications, DESIGN.md, AGENTS.md, package-lock.json and historical evidence are retained. Historical tags and the preserved Phase 19/active dependency branches are checked read-only; only normal main commit/push is authorized. Post-push synchronization and remote proof are recorded in the final handoff.

## 15. Remaining limitations and requirement matrix

Release blockers: failing dependency audit; unavailable local Firefox assertions; exact-SHA hosted CI not yet available at pre-push report creation. The pilot intentionally supports only six exercises and A/B; it does not generate a personal prescription. IndexedDB still depends on browser/profile/origin custody and the existing multi-database restore cannot become one globally atomic transaction. Independent visual/clinical review, auditory screen-reader assessment, physical-device testing and native backup custody remain NOT TESTED. No next phase or deployment is performed.

| Requirement                                                                                             | Status     | Evidence / detail                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ARCH-01 — Inspect architecture, design and relevant archived Phase 02/03/05/06/17 contracts             | PASS       | docs/decisions/phase-20-personal-plan-contract.md; Existing stores, tracker, backup and theme system reused.                                                                                                                                                                                                                              |
| ARCH-02 — Verify authoritative main checkpoint and preserve local work                                  | PASS       | artifacts/phase20/baseline.json; Started clean and synchronized at 9dd862cbad7fdc33ebcc0086e89ad1e8a19ffd3b. No reset/clean/history rewrite.                                                                                                                                                                                              |
| ARCH-03 — Inspect preceding Actions runs without indefinite polling                                     | PASS       | artifacts/phase20/github-9dd862cbad7fdc33ebcc0086e89ad1e8a19ffd3b.json; 40289217783 and 40289217801 were in_progress at the read-only inspection; no terminal outcome claimed.                                                                                                                                                            |
| MUSCLE-muscle_biceps_brachii — Original location schematic: Biceps brachii                              | PASS       | docs/assets/visual-training-pilot-manifest.json; Anterior upper arm. Approximate orientation, existing actions/qualifiers/exercise links and sources retained.                                                                                                                                                                            |
| MUSCLE-muscle_deltoid — Original location schematic: Deltoid                                            | PASS       | docs/assets/visual-training-pilot-manifest.json; Superficial muscle around the shoulder. Approximate orientation, existing actions/qualifiers/exercise links and sources retained.                                                                                                                                                        |
| MUSCLE-muscle_rectus_femoris — Original location schematic: Rectus femoris                              | PASS       | docs/assets/visual-training-pilot-manifest.json; Middle front of the thigh. Approximate orientation, existing actions/qualifiers/exercise links and sources retained.                                                                                                                                                                     |
| MUSCLE-muscle_vastus_lateralis — Original location schematic: Vastus lateralis                          | PASS       | docs/assets/visual-training-pilot-manifest.json; Lateral front and side of the thigh. Approximate orientation, existing actions/qualifiers/exercise links and sources retained.                                                                                                                                                           |
| MUSCLE-muscle_vastus_medialis — Original location schematic: Vastus medialis                            | PASS       | docs/assets/visual-training-pilot-manifest.json; Medial front of the thigh. Approximate orientation, existing actions/qualifiers/exercise links and sources retained.                                                                                                                                                                     |
| MUSCLE-muscle_vastus_intermedius — Original location schematic: Vastus intermedius                      | PASS       | docs/assets/visual-training-pilot-manifest.json; Front of the femur beneath rectus femoris. Approximate orientation, existing actions/qualifiers/exercise links and sources retained.                                                                                                                                                     |
| MUSCLE-muscle_gluteus_maximus — Original location schematic: Gluteus maximus                            | PASS       | docs/assets/visual-training-pilot-manifest.json; Superficial posterior gluteal region. Approximate orientation, existing actions/qualifiers/exercise links and sources retained.                                                                                                                                                          |
| MUSCLE-muscle_latissimus_dorsi — Original location schematic: Latissimus dorsi                          | PASS       | docs/assets/visual-training-pilot-manifest.json; Lower thoracic and lumbar back. Approximate orientation, existing actions/qualifiers/exercise links and sources retained.                                                                                                                                                                |
| MUSCLE-muscle_pectoralis_major — Original location schematic: Pectoralis major                          | PASS       | docs/assets/visual-training-pilot-manifest.json; Anterior upper chest. Approximate orientation, existing actions/qualifiers/exercise links and sources retained.                                                                                                                                                                          |
| MUSCLE-muscle_triceps_brachii — Original location schematic: Triceps brachii                            | PASS       | docs/assets/visual-training-pilot-manifest.json; Posterior upper arm. Approximate orientation, existing actions/qualifiers/exercise links and sources retained.                                                                                                                                                                           |
| MUSCLE-muscle_gastrocnemius — Original location schematic: Gastrocnemius                                | PASS       | docs/assets/visual-training-pilot-manifest.json; Superficial posterior lower leg. Approximate orientation, existing actions/qualifiers/exercise links and sources retained.                                                                                                                                                               |
| MUSCLE-muscle_soleus — Original location schematic: Soleus                                              | PASS       | docs/assets/visual-training-pilot-manifest.json; Posterior lower leg, deep to gastrocnemius. Approximate orientation, existing actions/qualifiers/exercise links and sources retained.                                                                                                                                                    |
| GUIDE-exercise_bodyweight_squat — Three controlled states: Bodyweight squat                             | PASS       | tests/browser/visual-training-pilot.spec.ts; Existing beginner classification, equipment, instructions, checkpoints, roles, mistakes, safety and sources retained; RESET reuses setup geometry.                                                                                                                                           |
| GUIDE-exercise_incline_push_up — Three controlled states: Incline push-up                               | PASS       | tests/browser/visual-training-pilot.spec.ts; Existing foundation classification, equipment, instructions, checkpoints, roles, mistakes, safety and sources retained; RESET reuses setup geometry.                                                                                                                                         |
| GUIDE-exercise_one_arm_dumbbell_row — Three controlled states: One-arm dumbbell row                     | PASS       | tests/browser/visual-training-pilot.spec.ts; Existing intermediate classification, equipment, instructions, checkpoints, roles, mistakes, safety and sources retained; RESET reuses setup geometry.                                                                                                                                       |
| GUIDE-exercise_seated_dumbbell_shoulder_press — Three controlled states: Seated dumbbell shoulder press | PASS       | tests/browser/visual-training-pilot.spec.ts; Existing foundation classification, equipment, instructions, checkpoints, roles, mistakes, safety and sources retained; RESET reuses setup geometry.                                                                                                                                         |
| GUIDE-exercise_dumbbell_curl — Three controlled states: Dumbbell curl                                   | PASS       | tests/browser/visual-training-pilot.spec.ts; Existing foundation classification, equipment, instructions, checkpoints, roles, mistakes, safety and sources retained; RESET reuses setup geometry.                                                                                                                                         |
| GUIDE-exercise_standing_calf_raise — Three controlled states: Standing calf raise                       | PASS       | tests/browser/visual-training-pilot.spec.ts; Existing foundation classification, equipment, instructions, checkpoints, roles, mistakes, safety and sources retained; RESET reuses setup geometry.                                                                                                                                         |
| PLAN-01 — Named plans and Session A / optional B                                                        | PASS       | tests/browser/visual-training-pilot.spec.ts; At most two sessions and six unique allowlisted exercise IDs per session; empty drafts can save but cannot start.                                                                                                                                                                            |
| PLAN-02 — Edit, reorder and remove exercises                                                            | PASS       | tests/browser/visual-training-pilot.spec.ts; Stable entry IDs and ordered arrays; remove Session B and delete plan require confirmation.                                                                                                                                                                                                  |
| PLAN-03 — Explicit nullable targets and canonical units                                                 | PASS       | tests/browser/visual-training-pilot.spec.ts; Nullable intended sets/repetitions/rest. Rest uses whole seconds, optional minutes converted without binary-conversion noise. Zero rest remains distinct from null. No default target load or schedule.                                                                                      |
| PLAN-04 — Save, reopen, edit and delete                                                                 | PASS       | tests/browser/visual-training-pilot.spec.ts; Commit-based feedback, duplicate-save guard, atomic full-value compare-and-swap, retained failed draft, stale-tab rejection and explicit reload.                                                                                                                                             |
| PLAN-05 — Existing tracker integration and immutable history                                            | PASS       | tests/browser/visual-training-pilot.spec.ts; Start saved A/B through newSession/newSet/createWorkout. Canonical exercise references, copied targets/names, personal/ad_hoc source and provenance snapshots. Later plan edits/deletion do not rewrite workouts.                                                                            |
| STORE-01 — Versioned local IndexedDB contract                                                           | PASS       | tests/visual-training-portability.test.ts; fitness-os-local v1 / records / module plans / personal-workout-plan payload v1. No store, database migration, competing tracker or new backup format.                                                                                                                                         |
| STORE-02 — Restore/write coordination                                                                   | PASS       | tests/visual-training-portability.test.ts; Reuse existing named Web Lock and fallback expiring operational lease; pending recovery journals block plan mutation/start.                                                                                                                                                                    |
| BACKUP-01 — Portable inclusion and fresh-profile restoration                                            | PASS       | tests/visual-training-portability.test.ts; Global Phase 17 portable archive includes versioned plan/session/exercise records; fresh-profile owning-store preparation and restore verified.                                                                                                                                                |
| BACKUP-02 — Zero-write preview and rejected untrusted imports                                           | PASS       | tests/visual-training-portability.test.ts; Correctly hashed malformed, unknown-exercise and future-version plans rejected before writes. Existing records remain unchanged.                                                                                                                                                               |
| BACKUP-03 — Interrupted/failed restore recovery                                                         | PASS       | tests/visual-training-portability.test.ts; Resume, rollback and automatic rollback after a later database quota failure preserve plan records and earlier database changes.                                                                                                                                                               |
| CSV-01 — Safe CSV inspection export                                                                     | PASS       | tests/browser/visual-training-pilot.spec.ts; Existing quoting/formula-neutralization and download helpers; plan/session/order/exercise/targets exported. CSV is not a second restore format.                                                                                                                                              |
| CONTENT-01 — Frozen identity/search/backlog inventory                                                   | PASS       | artifacts/phase20/final-check.log; 520 published factual identities; 648 search documents; 900 unpublished identities preserved. No canonical data, classifications or factual review dates changed.                                                                                                                                      |
| PRIVACY-01 — Browser-only private records                                                               | PASS       | tests/browser/visual-training-pilot.spec.ts; No personal records in SSR, metadata, URL intent, request bodies/headers or external network calls. Broadcast notices contain only changed; private records remain in IndexedDB.                                                                                                             |
| VISUAL-01 — Original visuals, provenance and evidence limitations                                       | PASS       | tests/browser/visual-training-pilot.spec.ts; Thirty documented states across twelve locations and six three-state guides; zero new media files. Independent human/clinical review is explicitly not performed.                                                                                                                            |
| GATE-01 — Strict types, lint, format, foundation/unit tests, content/search/privacy/build/budgets       | PASS       | artifacts/phase20/final-check.log; One final npm run check passed; 404 tests / 100 files. Gates, assertions, timeouts and budgets unchanged; format coverage extended.                                                                                                                                                                    |
| GATE-02 — Coverage                                                                                      | PASS       | artifacts/phase20/final-coverage.log; 404 tests / 100 files; statements 72.79%, branches 64.96%, functions 66.89%, lines 76.5%.                                                                                                                                                                                                           |
| REPO-01 — Non-destructive repository safety                                                             | PASS       | artifacts/phase20/safety-pre.json; No tracked deletion/move/rename; original 1337 paths retained, lockfile/dependencies unchanged. Branches/tags/Dependabot are read-only except normal authorized main push.                                                                                                                             |
| RELEASE-01 — Production remains untouched                                                               | PASS       | artifacts/phase20/production-readonly.json; No deployment/promotion/rollback requested. Existing production deployment and prior source SHA retained; owner approval must bind an exact later commit.                                                                                                                                     |
| A11Y-01 — Keyboard, names, labels, focus, announcements, confirmations and WCAG 2.2 AA axe checks       | PASS       | artifacts/phase20/final-cross-browser.log; New three-screen matrix: seven widths × four Light/Dark/Auto-system configurations, with reduced motion. Physical/aural review remains separate.                                                                                                                                               |
| RESP-01 — 320/375/393/768/1024/1280/1440 px without page overflow                                       | PASS       | artifacts/phase20/final-cross-browser.log; Both available engines; new matrix totals 168 screen/viewport/theme checks when both engine runs complete. Tables retain their existing local scrolling.                                                                                                                                       |
| BROWSER-01 — Complete Chromium/WebKit regression sweep                                                  | PASS       | artifacts/phase20/final-cross-browser.log; 1972 passed, 0 failed; inventory 1972 cases (986 per engine).                                                                                                                                                                                                                                  |
| BROWSER-02 — Firefox application assertions                                                             | NOT TESTED | artifacts/phase20/final-firefox-launch.log; One selected launch probe failed before assertions: browserType.launch spawn UNKNOWN on this Windows host. Do not count it as an application assertion pass. Hosted Linux exact-SHA results require separate inspection.                                                                      |
| CLOSURE-01 — Desktop/mobile persistence/backup/failure closure proxies                                  | PASS       | artifacts/phase20/final-closure.log; 48 passed, 0 failed; Firefox excluded only because the launch probe cannot start.                                                                                                                                                                                                                    |
| ROUTES-01 — Current-build public-route audit                                                            | PASS       | artifacts/phase20/final-routes.log; 703 passed, 0 failed. Historical tracked content-completion reports are preserved; current generated evidence stays in the phase artifact directory.                                                                                                                                                  |
| SECURITY-01 — npm audit high-severity gate                                                              | FAIL       | artifacts/phase20/final-audit.json; Unchanged lockfile reports 4 affected packages: 3 high, 1 moderate. Zod 4.6.5, Vite 8.3.2, undici 8.11.2 and fast-uri 3.1.8. No upgrade or audit bypass is authorized by Phase 20.                                                                                                                    |
| CI-01 — Containing-commit GitHub CI result                                                              | NOT TESTED | https://github.com/YellankiKaushik/Gymuuuuuuu/actions; This report is created before its containing commit exists. Exact-SHA CI is inspected after normal push and reported in the final handoff; no terminal result is invented in the immutable pre-push report. The unchanged required npm audit gate is expected to remain a blocker. |
| HUMAN-01 — Independent anatomy/technique visual review and real-device/aural acceptance                 | NOT TESTED | Owner checklist below; No independent human/clinical attestation or physical-device result is claimed.                                                                                                                                                                                                                                    |

## 16. Owner manual acceptance checklist

- [ ] **MAN-01 — NOT TESTED:** Inspect all twelve approximate muscle locations and all six setup/action/reset cues against their linked sources; independent visual expertise is not claimed.
- [ ] **MAN-02 — NOT TESTED:** Perform the complete journey by keyboard and with NVDA/VoiceOver, including announcements and confirmation dialogs.
- [ ] **MAN-03 — NOT TESTED:** Use real iOS Safari and Android Chrome; check touch, orientation, backgrounding and browser/OS storage behavior.
- [ ] **MAN-04 — NOT TESTED:** Create a private backup through the native file picker/download workflow, retain it outside browser storage, and restore it in a disposable profile.
- [ ] **MAN-05 — NOT TESTED:** Resolve or explicitly authorize separate work on the dependency audit; inspect exact-SHA Linux Firefox and required CI results.
- [ ] **MAN-06 — NOT TESTED:** Review the pushed exact commit and this report, then separately approve any production publication. No deployment is included in Phase 20.

Implementation is committed but not yet deployed. Owner approval is required to publish the verified commit.
