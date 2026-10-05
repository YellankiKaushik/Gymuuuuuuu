# Phase 18 implementation and release handoff

## Source review

- [x] Read every Phase 18 source in `DOCS_for_entire_apppliaction/GYM`: primary Markdown, DOCX, both JSON files, quick reference and prompt package. Duplicate numbered files have matching content hashes.
- [x] Inspect the repository, Git state, package/toolchain, app requests, persistence boundaries, test suites, deployment configuration and release history before implementation.
- [x] Preserve TanStack Start, React, npm, Vite, strict TypeScript, Nitro and browser-local personal records. No secrets, personal records, analytics or new runtime fitness APIs are introduced.
- [x] Check Vercel account projects without linking or deploying this repository. No Fitness OS Vercel project is linked; this matters because a Git-linked push to `main` is a production deployment.
- [x] Record the Phase 18 release, testing and deployment decisions in `docs/decisions/phase-18-release-controls.md`.

## Repository implementation

- [x] Pin the supported Node/npm toolchain and make the clean-install contract explicit.
- [x] Add distinct formatting, lint, typecheck, content/data validation, unit, coverage, browser E2E and accessibility checks while preserving the existing foundation checks.
- [x] Add least-privilege, SHA-pinned GitHub Actions for CI, scheduled browser/security checks, and manually invoked release evidence. Keep production deployment out of automation.
- [x] Add dependency update configuration, repository templates, security headers and an SSR nonce-based CSP, privacy/request checks, and release/data rollback runbooks.
- [x] Implement and test release-manifest generation against the supplied Phase 18 schema. Require observed deployment and verification inputs; never invent deployment, TLS, backup, test or compatibility results.
- [x] Run formatting, strict typecheck, lint, data validation, all unit tests, coverage, production build, browser E2E and accessibility checks. Record results and remaining gates.
- [ ] Push this checkpoint to a review branch and record the exact commit and CI handoff.

### Verified implementation checkpoint

- `npm run check`: passed (format, ESLint, strict TypeScript, content and repository contracts, 194/194 unit tests, privacy audit across 352 source files, production build and performance budget).
- `npm run test:coverage`: passed; 73.77% line coverage.
- `npm audit`: 0 known vulnerabilities at the time of the audit.
- Production Chromium: 52/52 browser tests passed. Production WebKit: 52/52 browser tests passed, including responsive and accessibility checks.
- Local Firefox could not start because the installed Playwright Firefox executable lacks a Windows Side-by-Side runtime. The pull-request cross-browser workflow runs Chromium, Firefox and WebKit on Ubuntu, so Firefox will be verified in GitHub Actions.
- Built browser JavaScript measured 625,834 gzip bytes total and 146,709 gzip bytes for the largest chunk, within the configured 700 KiB total and 200 KiB per-chunk budgets.
- `git diff --check` passed. The workflow cross-browser matrix is configured for pull requests, but GitHub CI has not yet run for this checkpoint.
- The Vercel/domain/TLS, real-device/manual accessibility, owner backup/restore, prior-version data compatibility and production smoke gates below remain open.

## Owner-controlled gates still required for a production release

These cannot be honestly marked passed from this workspace alone. Do not promote or deploy production while any required gate is outstanding.

- [ ] Create/link the Vercel project and connect the Git repository with a non-production preview workflow first.
- [ ] Verify Vercel Preview routes, production-like behavior, response headers, allowed outbound requests and accessibility.
- [ ] Select and configure the stable canonical production domain; verify DNS, TLS, canonical links and origin continuity before any user creates browser-local records.
- [ ] Perform manual WCAG 2.2 AA review and real iOS/Android device checks.
- [ ] Inspect GitHub Actions results and enable required checks/branch protection if supported by the repository's visibility and plan.
- [ ] Exercise a real owner-held backup and restore, prior-version compatibility, and code rollback on the actual release candidate. Code rollback does not roll back browser data.
- [ ] Run production smoke tests after the owner authorizes release and verify the production environment separately from Preview.

## Handoff

The implementation checkpoint is a review branch. It is not a production release. `docs/decisions/phase-18-release-controls.md` records which automated controls are implemented, what the local test evidence proves, and which external release gates remain open.
