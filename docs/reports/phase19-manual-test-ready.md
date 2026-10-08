# Phase 19 — Ready for owner manual testing

The verified subset is frozen. All final automated gates passed. Remaining unpublished identities are future backlog, not blockers for owner testing. No independent human review or real-device testing is claimed.

## Evidence binding

Tested code/test commit: `93047ce622c604d6676433ee426bcb361febf927`. Application build commit: `b6a89c6708914b7ab257b216971c210db7af7ed1`. The intervening commit changes only the exercise regression and its decision note. Final completion documentation and synthetic screenshots do not change the tested application.

Production build timestamp: `2026-10-08T11:57:25.816Z`. All 823 production output files remained identical after verification; whole-build SHA-256: `e0faabf4daa53141bf32c85fd6f2be95efe4c141c0b77dc1ca7af113a9241fde`. Search index version: `83fef1c09dbeeb3e9a28bba1e037a38dbbfa3ec9d05a39ce2cea5d3175b91fa5`. Route records retain the tested commit, build timestamp, server-entry hash and complete content manifest. The tag `codex-first-manual-test-ready` identifies the final repository checkpoint.

## Frozen content

| Module          | Published | Backlog |
| --------------- | --------: | ------: |
| muscles         |        70 |       0 |
| exercises       |        32 |     152 |
| workout-science |        32 |      66 |
| programs        |         4 |      46 |
| foods           |       264 |      78 |
| nutrients       |        51 |       0 |
| recipes         |        24 |       0 |
| meal-templates  |         3 |       0 |
| recovery        |        15 |     109 |
| cardio          |        13 |     189 |
| supplements     |        12 |     260 |

**520 factual records; 648 search documents; 273 food profiles; 10,011 numerical food values; 35 FDA label reference rows; 900 backlog identities.** Every public factual record has publication provenance. Public review state is `published_personal_use`; independent human-reviewed count is zero. No duplicate IDs/slugs, broken source/relationship references, stale search entries or missing required media files remain. Optional record visuals remain incomplete. Detailed source, numerical, comparison, media, licensing and per-identity backlog coverage is in [the adapter audit](content-completion.json).

## Final automated verification

- Clean `npm ci`, `npm run check`, `npm run test:coverage` and `npm audit --audit-level=high`: passed. Audit: zero vulnerabilities.
- Unit tests: **338 passed in 92 files**. Coverage: statements **71.88%**, branches **64.31%**, functions **66.39%**, lines **76.84%**; configured thresholds passed.
- Local Chromium: **282/282**. Local WebKit: **282/282**. Windows Firefox's known runtime limitation was not repeatedly retried.
- Hosted Ubuntu: Chromium **282/282**, Firefox **282/282**, WebKit **282/282**; mandatory accessibility **184/184**. Hosted verify also passed clean installation, check, coverage, browser suite and npm audit.
- Final route audit: **702/702**, five states per URL; 320px light/dark, 768px light, 1440px light/dark. Mobile/desktop states received WCAG 2/2.1/2.2 AA scans; tablet checks measure overflow. Zero uncaught errors, failed assets, unexpected remote requests or page overflow. Full interactive-state, print and human accessibility coverage is not inferred.
- Twenty representative workspaces checked seven widths **320/375/393/768/1024/1280/1440px** in both themes. Existing journey tests plus public-recipe and synthetic multi-module portability regressions passed. Restore preview performed no writes; corrupt import preserved existing data.
- Production build and unchanged performance budgets passed: **274 JavaScript assets / 705,746 gzip bytes**, largest **171,072**; **97 lazy JSON assets / 429,517 gzip bytes**, largest **59,287**.
- Source/schema/relationships/review dates/licensing/media bindings, frozen search hashes, privacy/network and security-header checks passed. Tests use synthetic isolated contexts; no real personal data was created.

Hosted evidence on the tested commit:

- [CI](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/37774678041): accessibility — success, verify — success
- [Cross-browser regression](https://github.com/YellankiKaushik/Gymuuuuuuu/actions/runs/37774678026): browser (webkit) — success, browser (firefox) — success, browser (chromium) — success

Initial stale draft assertions and synthetic fixture errors were corrected; the final green results above replace those attempts. Assertions, timeouts and budgets were not weakened. Historical reports remain bound to their own commits.

## Bugs and usability fixes

- 320px Workout Science source identifiers overflowed; wrap complete visible provenance.
- Global backup services could close connections still used by module workspaces; use independently owned connections.
- Restore preview reopened a database per store; reuse one owned connection per database while preserving validation-before-write.
- Stale file reads/restore previews could supersede a newer file selection; guard generations and busy states.
- Data-management breadcrumbs and user screens contained engineering phase labels; resolve contextual destinations and replace normal-screen copy.
- Home lacked direct nutrition logging, diet planning and cardio entry points.
- Public recipes lacked a route into existing local scaling/editing/logging; add explicit source-preserving local copy.
- Build/check could silently regenerate search; compare deterministic frozen output and fail stale assets.
- Route evidence lacked explicit commit/build hash binding; retain and strictly validate bindings.
- Browser assertions used obsolete food counts and assumed published barbell bench press was a draft; assert exact frozen inventory and a genuinely unpublished exercise.

## Owner manual checks

- Real Android
- Real iPhone/iPad
- Human screen-reader testing
- Actual personal workout flow
- Actual nutrition flow
- Actual backup/restore including native OS pickers and stable browser origin
- Visual/UX preferences
- Print output and subjective improvements

Use the [README procedure](../../README.md). Keep the browser origin/profile stable and export backups before destructive actions. In a fresh profile, initialize owning module schemas before global restore. Optional media, historical source limitations, estimated recipe yields and the 900 unpublished identities remain explicit.

## Deployment

Production deployment was NOT performed. Automatic Vercel Git deployment remains disabled. No production domain was connected.
