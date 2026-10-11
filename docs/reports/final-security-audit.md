# Final security audit

Engineering verification passed for `335b428868486c487fcae42ca941a3726e082701`; [automated evidence](final-automated-test.md) binds the exact implementation/build. Critical findings: 0 observed. High findings: 0 observed. These counts are not a formal penetration-test guarantee.

| Severity | Component and problem | Fix and verification |
| --- | --- |
| Medium | SEC-01: Global backup validation — Unbounded recursive hashing/decoding of deeply nested opaque values could exhaust stack/resources; a naive breadth-sized guard also imposed excess media memory overhead. | Bound depth, strings, nodes and finite numbers before recursive work; use depth-sized iterator frames. final-security.test.ts plus invalid-preview/fresh-profile/rollback regressions; 358 units and full browser suites |
| Low | SEC-02: Imported recipe and supplement provenance — Generic URL schemas admitted executable/non-web schemes in provenance fields; no active exploit of these fields is claimed. | Owning schemas require bounded HTTP(S) source/media/registry URLs; generated schemas preserved. Unsafe protocol rejection with valid HTTPS controls; whole-module restore validation |
| Low | SEC-03: Progress photo selection — Declared upload MIME was not compared to magic bytes before decoding. | JPEG/PNG/WebP signature and size check before browser decoding or storage; existing sanitization retained. Unit MIME mismatch/empty/SVG tests and both-browser invalid image preservation; metadata/full-media journey |
| Low | SEC-04: Browser schema initialization / CSP — Zod caught an eval capability probe rejected by CSP; console-only checks missed its policy event. | Exact zod entry alias configures supported jitless parser before dependent browser schemas; SSR mode retained; direct event regression across seven route families. Chromium/WebKit targeted 8/8; final browser/route gates; old live event recorded as known blocked probe pending redeploy |
| Low | SEC-05: Public origin configuration — Credential-bearing origins were silently normalized and accepted. | Reject username/password alongside unsupported protocols, paths, queries and fragments. Targeted configuration import regression; actual production public origin matches exactly |
| Low | SEC-06: GitHub Actions checkout — Readonly checkout credentials were unnecessarily retained in test workspaces. | persist-credentials:false in every checkout; existing readonly permissions and SHA pins retained. Workflow source review and five fresh successful hosted jobs |
| Informational | INFO-01: CSP styles — Removing inline style-attribute permission breaks existing React positioning/media layouts. | Retain narrow style-src-attr allowance; no script unsafe-inline/eval. Controlled stricter-policy probe blocks ten body-region styles; live policy otherwise retained |
| Informational | INFO-02: Dependencies — Six packages have newer versions and newer Vercel npm warns about esbuild install-script policy. | No blanket upgrade or unsupported npm policy; document reviewed script and future version review. Clean installs, zero-vulnerability audit, manifest/source review |
| Informational | INFO-03: Repository governance — main was reported unprotected; dependency-alert state is not available through this connector. | Recommend owner-managed required checks/review and branch protection; no settings changed. Read-only GitHub branch API and current hosted checks |

## Dependencies and secrets

Fresh npm audit reports zero vulnerabilities. esbuild 0.28.2 postinstall selects the platform binary, may fall back to registry installation/download, and verifies binary version; expected build-time behavior, not a vulnerability finding. Optional macOS fsevents 2.3.3 is recorded. Pinned npm 11.9.0 does not support npm install-scripts ls; its attempt is retained and lockfile/installed manifests/source supply the review. No dependency changes or unsupported allowScripts policy were introduced. Six outdated packages are informational: Playwright 1.63→1.64, plugin-react 6.1.1→6.1.2, lucide 1.52→1.53, TypeScript 6.0.3→7.0.2, typescript-eslint 8.71→8.71.1, Vite 8.3.2→8.3.4. Review separately; no major framework/toolchain upgrade is part of this pass.

Final documented-tree scan: 1280 tracked files (candidate scan: 1271) and 290 public-output files, zero matching secrets. Original fetched-reachable history scan: 63 commits/2595 unique blobs, zero matches. No rotation is indicated by these scans. Binary strings were scanned; screenshot OCR, unreachable objects and inaccessible remote history were not. No credential value was printed and no history was rewritten.

## Privacy and local data

chromium: 918 synthetic requests; unexpected remote 0, request-marker leaks 0, SSR leaks 0 across 10 independently requested routes. webkit: 911 synthetic requests; unexpected remote 0, request-marker leaks 0, SSR leaks 0 across 10 independently requested routes. Personal records remain in IndexedDB; approved small preferences, transient restore-lock/control tokens and nutrient preference use local/session storage. No structured health records are stored there. Photos are sanitized locally and ordinary portable backups exclude binary media; source filenames are not persisted. Public search has 648 documents and zero private entities; private queries stay off URLs.

## Import, backup and numeric safety

Validation precedes canonical writes. Preview and invalid import perform zero writes; malformed/future/duplicate/relationship/date/unit/non-finite and media integrity cases are covered by targeted and owning-module regressions. A fresh synthetic context prepares all seven owning databases through one explicit workflow, then restores exact records and snapshots. Interrupted/partial writes exercise abort, before-image rollback and retained recovery. No cross-database atomicity is claimed. CSV checks cover = + - @ tab/CR, quoting, Unicode and multiline text; raw exports remain labelled. Backups remain unencrypted and unauthenticated; integrity hashes detect corruption rather than trusted authorship.

## Health and fitness boundaries

- diet: Adult eligibility, pregnancy/lactation exclusion, disclosed formulas/assumptions and conservative bounds; no calorie credit or exact weight/date promise.
- body: BMI screening context and externally measured/source-labelled body composition; no physique/attractiveness/health score.
- sleep: Estimates/source labels; no diagnosis, invented stages or certain sleep-debt claim.
- recovery: Pain/illness distinct from soreness; stop signals; no opaque recovery score.
- cardio: Estimate/stop labels; no fabricated VO2max, fitness age, universal Zone 2 or automatic exercise calories.
- supplements: Immutable labels, unknown blend amounts, adverse-event stop guidance; no prescription, steroid/SARM/peptide protocol, global score or certification-as-efficacy.
- clinicalReview: No independent human or clinical review claimed.

## Live Vercel audit

[Production](https://kaush-ka-gym.vercel.app) returned HTTPS 200 with verified certificates, expected security headers, distinct matching CSP nonces and the exact canonical origin. Project gymuuuuuuu is TanStack Start/Node 24; build logs identify GitHub repository/main/commit 26281fd and npm ci. Sole project variable VITE_PUBLIC_APP_ORIGIN matches exactly and targets Production only; Preview is not configured with it. No integrations were returned. Some dashboard overrides are omitted by the connector; no inaccessible state is inferred.

The final live smoke passed 14 representative routes with 631 requests, no failed assets/errors/dialogs, no personal-marker leaks and no unexpected remotes. 14 recorded policy events are the known CSP-blocked Zod eval probe in the old deployment; no other event is accepted. The candidate fixes that probe with interpreter mode and retains strict script policy.

A new owner-controlled Vercel redeploy is required for commit 335b428868486c487fcae42ca941a3726e082701 (or the final documentation-only descendant with the same execution tree). No deployment or environment/project mutation was performed. Follow [the owner runbook](../runbooks/vercel-owner-deployment.md).

## Owner-only work

Real iOS/Android/desktop workflows; human keyboard/screen-reader/print review; native picker/save behavior; real quota/eviction/persistent-storage conditions; private external backup custody; owner redeploy and final live smoke for that new build. Automated evidence does not replace these checks.
