# Phase 20 release readiness

**Executive result: BLOCKED pending exact-commit hosted CI inspection and owner approval.** All required local checks described below pass. Baseline: `df59c127199bdea1fef60289a13e05dd6c8dd9f8`. This report belongs to its containing remediation commit; its exact SHA and observed post-push CI state are supplied in the final handoff. Do not create another documentation commit merely to record later CI completion. Tested runtime/build input SHA-256: `3f5ec699ca0b32dfee7f918e1b78552d77c634869097631e82c4531ffe44e69d`.

## Security vulnerabilities

**PASS: full npm audit = 0 unresolved vulnerabilities; production-only npm audit = 0.** The baseline had four affected packages (three high, one moderate) covering 14 advisory IDs. No advisory was suppressed, ignored or waived. Registry metadata and original/current audit output are retained in ignored `artifacts/phase20-release/` evidence.

| Package  | Installed before | Minimum compatible fix | Installed after | Relationship / result                                                                           |
| -------- | ---------------- | ---------------------- | --------------- | ----------------------------------------------------------------------------------------------- |
| fast-uri | 3.1.8            | 3.1.9                  | 3.1.9           | Transitive development dependency; FIXED                                                        |
| undici   | 8.11.2           | 8.12.2                 | 8.12.3          | Transitive development dependency; Node embeds a separate runtime copy; FIXED                   |
| vite     | 8.3.2            | 8.3.3                  | 8.3.3           | Direct declared development dependency, also reachable through the framework build graph; FIXED |
| zod      | 4.6.5            | 4.6.6                  | 4.6.6           | Direct production dependency; FIXED                                                             |

| Exact advisory                                                           | Package  | Severity | Affected range  | Result |
| ------------------------------------------------------------------------ | -------- | -------- | --------------- | ------ |
| [GHSA-w74x-v6f9-j3xg](https://github.com/advisories/GHSA-w74x-v6f9-j3xg) | fast-uri | moderate | >=3.0.0 <3.1.9  | FIXED  |
| [GHSA-xhq7-xmqj-769h](https://github.com/advisories/GHSA-xhq7-xmqj-769h) | fast-uri | low      | >=3.0.0 <3.1.9  | FIXED  |
| [GHSA-wjr9-j795-jxcr](https://github.com/advisories/GHSA-wjr9-j795-jxcr) | fast-uri | moderate | >=3.1.3 <3.1.9  | FIXED  |
| [GHSA-333x-w4r6-6crp](https://github.com/advisories/GHSA-333x-w4r6-6crp) | fast-uri | low      | >=3.0.0 <3.1.9  | FIXED  |
| [GHSA-4qv8-2p9j-2685](https://github.com/advisories/GHSA-4qv8-2p9j-2685) | undici   | moderate | >=8.0.0 <8.12.2 | FIXED  |
| [GHSA-f72v-6w45-q472](https://github.com/advisories/GHSA-f72v-6w45-q472) | undici   | moderate | >=8.0.0 <8.12.2 | FIXED  |
| [GHSA-xjj6-f33q-929c](https://github.com/advisories/GHSA-xjj6-f33q-929c) | undici   | high     | >=8.0.0 <8.12.2 | FIXED  |
| [GHSA-698v-4r3x-3vcv](https://github.com/advisories/GHSA-698v-4r3x-3vcv) | vite     | moderate | >=8.3.0 <=8.3.2 | FIXED  |
| [GHSA-r825-w8mm-5pxw](https://github.com/advisories/GHSA-r825-w8mm-5pxw) | vite     | moderate | >=8.3.0 <=8.3.2 | FIXED  |
| [GHSA-587h-7wmj-h5pm](https://github.com/advisories/GHSA-587h-7wmj-h5pm) | vite     | high     | >=8.3.0 <=8.3.2 | FIXED  |
| [GHSA-9jrq-w75r-8gcw](https://github.com/advisories/GHSA-9jrq-w75r-8gcw) | vite     | low      | >=8.3.0 <=8.3.2 | FIXED  |
| [GHSA-rq7h-c2jc-7f22](https://github.com/advisories/GHSA-rq7h-c2jc-7f22) | vite     | moderate | >=8.3.0 <=8.3.2 | FIXED  |
| [GHSA-vfpm-58rq-9qcg](https://github.com/advisories/GHSA-vfpm-58rq-9qcg) | vite     | moderate | >=8.3.0 <=8.3.2 | FIXED  |
| [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5) | zod      | high     | <4.6.6          | FIXED  |

### Actual exposure and regression risk

**fast-uri:** URI resolution is used by schema/tooling dependencies, not a new user-link renderer. The supported upstream range resolves 3.1.9 without an override; existing URL, schema and import validation remains in place. Dependency path: AJV 8.20.0 -> fast-uri ^3.0.1 (also AJV-formats). Refresh lockfile resolution within the existing upstream range; no override. Risk: Compatible patch release; validation/import and browser regressions executed.

**undici:** The npm copy serves jsdom/testing, not browser fetch. The installed compatible version is 8.12.3. Separately, Node 24.16.0 embedded 7.25.0; Node 24.22.1 now supplies 7.30.1. No external fitness API or untrusted remote production fetch path was introduced. Dependency path: jsdom 30.1.2 -> undici ^8.11.2. Refresh lockfile resolution within the existing upstream range; no override. Risk: Compatible patch release; validation/import and browser regressions executed.

**vite:** The affected editor/middleware/file-serving paths concern the development/build server. Normal production uses the built Nitro server, not the Vite development server. Localhost binding is not treated as a substitute for the patch; no exploit or absence of all attack paths is claimed. Dependency path: root Vite and TanStack build/plugin dependencies. Raise direct minimum within the same major; update the lockfile. Risk: Compatible patch release; validation/import and browser regressions executed.

**zod:** Untrusted local backup/import collections and form/record validation reach Zod. Existing input bounds do not justify ignoring the advisory. The upstream patch is installed; record/import semantics are covered by targeted and complete regressions. Dependency path: root zod; also shared with TanStack tooling. Raise direct minimum within the same major; update the lockfile. Risk: Compatible patch release; validation/import and browser regressions executed.

### Separate Node runtime correction

The installed npm Undici package does not replace Node’s internal fetch implementation. Node 24.16.0 was observed embedding Undici 7.25.0. The [official Node 24.22.1 security release](https://nodejs.org/en/blog/release/v24.22.1) supplies Undici 7.30.1 and additional DNS, TLS, HTTP, Brotli, snapshot-randomness and permission fixes. Both runtime pin files, the supported minimum engine and the repository audit’s explicit version assertion now require that corrected Node 24 baseline. This retains Node 24 and npm 11 compatibility; it is not a framework-major migration.

Verification used Node v24.22.1, bundled Undici 7.30.1, and compatible npm 11.13.0. The declared package manager remains npm@11.9.0. The official Windows executable was checked against its [distribution checksum manifest](https://nodejs.org/dist/v24.22.1/SHASUMS256.txt), SHA-256 `d702daa815eabbff763c7d3808e235cf031cf2ca70211b56847bc72f51e240e5`. A workspace-local executable and CLI wrappers were used; the owner’s global installation was not changed. Existing historical manifest fixtures keep their original recorded runtime metadata.

## Dependency changes

Exactly four installed npm packages changed. Zod/Vite direct ranges advance within their current major; fast-uri/undici use existing upstream AJV/jsdom ranges. No override, force fix, legacy-peer-dependency bypass, TypeScript 7 merge, TanStack update or Dependabot merge was used. Only root engine metadata and the four package entries change in the lockfile.

| Package  | Before | After  |
| -------- | ------ | ------ |
| fast-uri | 3.1.8  | 3.1.9  |
| undici   | 8.11.2 | 8.12.3 |
| vite     | 8.3.2  | 8.3.3  |
| zod      | 4.6.5  | 4.6.6  |

Runtime pins: 24.16.0 → 24.22.1. npm’s declared manager/range stays 11.9.0 / >=11.9.0 <12; final verification actually used npm 11.13.0. Application framework versions remain unchanged.

## Phase 20 feature integrity

**PASS:** all twelve muscle schematics and all six three-state guides retain their immutable IDs, source access, difficulty labels, text alternatives, source qualifiers and safety guidance. The one-arm row stays intermediate. Visual/tracker implementation files are byte-identical to the Phase 20 baseline. The existing two-session personal-plan/tracker journey passes: muscle → exercise guide → add → A/B → save/reload/edit → start → complete → history. No functionality was reimplemented, removed or redesigned.

## Data integrity

**PASS:** IndexedDB contracts/store versions, migrations, backup envelopes and snapshot semantics are unchanged. Current unit/browser checks cover failed writes, cross-tab conflicts, rest-unit conversion, null versus zero, independent completed workout snapshots, fresh-profile global JSON restore, zero-write previews, malformed/future/unknown-reference rejection, recovery/rollback, CSV formula safety and legacy data compatibility. Personal records stay in IndexedDB and out of SSR, metadata and external requests.

The bounded optimization replaces one unnecessarily heavy ID-membership import. The existing food compiler now also emits an ID-only projection, preserving all **342** accepted seed IDs—including unpublished identities historically accepted in diet backups. New tests verify the complete projection and valid/unknown exclusions. Original scientific/editorial source files, all **520** published entities, **648** search documents and **900** unpublished identities remain unchanged. No nutrient value, source, review date, food identity or publication status is modified.

## Browser and accessibility results

| Scope                                                                                | Environment / SHA                                      | Result                                                                                             |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Current critical pilot, diet validation, backup, hydration and security-header files | Local Windows; corrected Node 24.22.1 build            | 114 passed: Chromium 57 + WebKit 57                                                                |
| Original complete Chromium/Firefox/WebKit regression                                 | Hosted Linux; df59c127199bdea1fef60289a13e05dd6c8dd9f8 | All 12 browser shards passed                                                                       |
| Original Firefox test counts                                                         | Hosted Linux, four shards                              | 257 + 237 + 246 + 246 = 986 passed; 8 closure cases passed                                         |
| Original accessibility                                                               | Hosted Linux CI                                        | Both accessibility shards passed                                                                   |
| Current pilot accessibility/reflow                                                   | Chromium + WebKit                                      | 168 screen/width/theme configurations; reduced motion; zero asserted axe/CSP regressions           |
| Local Firefox spawn UNKNOWN                                                          | Windows host limitation                                | Not duplicated; not an application release blocker because the original hosted Firefox jobs pass   |
| Original public-route audit                                                          | Baseline implementation                                | 703 passed; no route added/renamed and factual routes/data unchanged; not repeated for reassurance |

The focused final suite uses the unchanged existing tests in visual-training-pilot, diet-planning, security-headers, hydration and data-management. It covers 320/375/393/768/1024/1280/1440 px, Light/Dark/actual Auto and reduced motion. No assertions, timeouts or security checks were weakened. New-commit hosted results remain required and are inspected after push; the original Firefox success does not claim a test of a future SHA.

## GitHub Actions

Original CI [40326445379](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/40326445379): **FAILURE**, exact SHA df59c127199bdea1fef60289a13e05dd6c8dd9f8. Verification/build, 404 unit tests, coverage, both Chromium shards and both accessibility shards passed; verification failed only at npm audit. The failed job log was inspected and names the four affected packages. Original cross-browser [40326445493](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/40326445493): **SUCCESS**, same exact SHA; all Chromium, Firefox and WebKit shards passed. No job was skipped; conditional artifact/closure steps were skipped by design where appropriate.

| Run         | Job ID       | Job                   | Conclusion |
| ----------- | ------------ | --------------------- | ---------- |
| 40326445379 | 121584248831 | browser (1)           | success    |
| 40326445379 | 121584248929 | verify                | failure    |
| 40326445379 | 121584249080 | browser (2)           | success    |
| 40326445379 | 121584249134 | accessibility (2)     | success    |
| 40326445379 | 121584249186 | accessibility (1)     | success    |
| 40326445493 | 121584249518 | browser (firefox, 1)  | success    |
| 40326445493 | 121584249673 | browser (chromium, 2) | success    |
| 40326445493 | 121584249686 | browser (firefox, 2)  | success    |
| 40326445493 | 121584249719 | browser (firefox, 3)  | success    |
| 40326445493 | 121584249759 | browser (chromium, 4) | success    |
| 40326445493 | 121584249812 | browser (webkit, 2)   | success    |
| 40326445493 | 121584249817 | browser (chromium, 1) | success    |
| 40326445493 | 121584249819 | browser (webkit, 4)   | success    |
| 40326445493 | 121584249859 | browser (chromium, 3) | success    |
| 40326445493 | 121584249904 | browser (webkit, 3)   | success    |
| 40326445493 | 121584249908 | browser (firefox, 4)  | success    |
| 40326445493 | 121584249927 | browser (webkit, 1)   | success    |

The remediation commit does not exist when its report is authored. Its exact-SHA workflow results are checked after the normal push and recorded in the final handoff. Until those required results are terminal and successful, this report’s publication state remains BLOCKED; IN_PROGRESS must not be described as success. No duplicate full workflow or browser sweep was dispatched.

## Final local verification

| Gate                                               | Result                                                                                       | Evidence                                                                |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Clean install, corrected runtime                   | PASS; npm ci; zero audit findings                                                            | artifacts/phase20-release/final-runtime-npm-ci.log                      |
| Comprehensive code gate                            | PASS; format/lint/strict types/content/search/406 tests/privacy/build/budgets                | artifacts/phase20-release/final-runtime-check.log                       |
| Coverage                                           | PASS; 406 tests / 101 files; 72.84% statements, 64.96% branches, 67% functions, 76.54% lines | artifacts/phase20-release/final-coverage.log                            |
| Zod targeted record/backup checks                  | PASS; 50 tests / 4 files                                                                     | artifacts/phase20-release/zod-targeted-tests.log                        |
| Optimization, diet references and plan portability | PASS; 46 tests / 4 files                                                                     | artifacts/phase20-release/optimization-targeted-tests.log               |
| Focused browser/accessibility                      | PASS; 114 tests                                                                              | artifacts/phase20-release/final-focused-browser.log                     |
| Full and production-only audits                    | PASS; 0 unresolved in both                                                                   | artifacts/phase20-release/final-audit.json; final-production-audit.json |

The final npm run check includes the required privacy audit, build and performance gates, so those passing operations were not duplicated solely for reassurance. One earlier package-only code gate passed before exposure analysis discovered the separate Node-embedded Undici gap; one necessary corrected-runtime code gate followed. Coverage and the focused browser cycle ran once on the final runtime. Security package repair cycles: one; newly discovered runtime repair cycles: one; bundle optimization passes: one. Historical generated content-completion reports are restored byte-for-byte after current evidence is retained locally.

## Performance

| Bytes gzip (media raw)   | Before Phase 20 remediation | After  |
| ------------------------ | --------------------------- | ------ |
| Total JavaScript         | 716114                      | 707105 |
| Largest JavaScript chunk | 168817                      | 168826 |
| CSS                      | 20766                       | 20766  |
| Public JSON              | 429517                      | 429517 |
| New media bytes          | 0                           | 0      |
| Aggregate JS headroom    | 686                         | 9695   |

**PASS:** 707105 / 716800 bytes aggregate and 168826 / 204800 bytes largest chunk. No budget changed. Security patches alone measured 716365 bytes; the localized projection pass leaves 9695 bytes of headroom. The 9009-byte additional headroom falls short of the optional 10240-byte target; this is documented rather than expanding the pass or removing features. No descriptions, accessibility text, visuals, tests or factual data were stripped. CSS/public JSON/media sizes are unchanged; the Vite splitting configuration is unchanged.

## Privacy and security

**PASS locally:** runtime audit scans 404 source files; synthetic journey checks send no personal data to external origins. Headers, nonce CSP, CSRF protection, SSR/private-data boundaries and the local-first/no-account architecture are unchanged. The corrected Zod remains configured jitless in the browser. npm audit covers the installed dependency graph; the separate bundled runtime review and correction are recorded above. No credentials or personal records are added to the repository.

## Known remaining issues

P0: none found. P1: no unresolved local security/application failure found. This is not a claim of exhaustive exploit testing or independent human/clinical review.

- **P2 / CI-CANDIDATE — BLOCKED_PENDING_POST_PUSH_INSPECTION:** Required exact-SHA hosted checks for the containing remediation commit do not exist at pre-commit report creation. Next action: Inspect exact-SHA CI after normal push. If still running, report IN_PROGRESS; do not deploy or create another documentation-only CI-completion commit.
- **P3 / BUNDLE-TARGET — DOCUMENTED_NON_BLOCKING:** The bounded pass adds 9009 bytes of headroom, below the optional 10240-byte additional target; 9695 bytes remain and the unchanged budget passes. Next action: Preserve correctness and stop the bounded optimization pass; future changes must keep the same budget.
- **OWNER / LOCAL-RUNTIME — INFORMATION:** The global Node installation is intentionally unchanged. Final tests used a checksum-verified workspace-local Node 24.22.1. Next action: Use Node 24.22.1 or a compatible later Node 24 security release for subsequent local work. Version managers and CI read the committed pin files.
- **OWNER / MANUAL-ACCEPTANCE — NOT_TESTED:** No new physical-device, auditory screen-reader or independent clinical/visual review was performed. Next action: Use the existing Phase 20 owner acceptance checklist; automated/assistant verification is not independent human review.

## Production

Current alias https://kaush-ka-gym.vercel.app still points to deployment `dpl_5sLqYJstGvCKQWkMyh3A9vNQqVx7`, READY, source `a946027b1f3a8754928c393228df696400b6b391`. **Production changed: NO. Production update required: YES** to publish the pilot and remediation, after exact-commit CI completion and owner approval. No preview/production deployment, promotion, rollback, bulk upload or deployment configuration change was performed. The current live dependency/runtime versions were not re-executed or altered as part of these read-only checks. The future authorized method is Vercel server-side Git source at the exact approved SHA.

## Files and repository safety

Modified (10):

- .node-version
- .nvmrc
- README.md
- docs/README.md
- docs/phases/phase-20.md
- package-lock.json
- package.json
- scripts/compile-foods.ts
- scripts/phase18-repository-audit.ts
- src/features/diet-planning/domain.ts

Added (5):

- docs/decisions/phase-20-release-remediation.md
- docs/reports/phase-20-release-readiness.json
- docs/reports/phase-20-release-readiness.md
- src/content/foods/identity-ids.json
- tests/release-readiness.test.ts

Deleted: **0**. Renamed: **0**. Moved: **0**. All 1354 original tracked paths remain; 26 historical tags retain their objects. No branch/tag cleanup, history rewrite, force push or dependency PR merge occurred. A Vite Dependabot remote-tracking ref was observed rebased externally during the initial fetch; the agent did not force-push it. Final clean/synchronized main and the containing commit’s exact CI status are checked after normal push.

**BLOCKED:** Phase 20 remains blocked. The exact unresolved findings and next actions are documented. No production deployment was performed.
