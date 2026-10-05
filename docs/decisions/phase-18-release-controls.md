# Phase 18 release controls and deployment decisions

The Phase 18 Markdown, DOCX, schema, reference data, quick reference and prompt package define this phase. The repository already uses TanStack Start with Nitro, React, npm and a single `package-lock.json`; those choices remain in place. No backend, account, telemetry, analytics or external fitness-data service is added.

## Workflow and deployment boundary

Vercel's current TanStack Start guide confirms that the Nitro Vite plugin enables framework detection and that Git branch pushes can create Preview deployments while the configured production branch creates Production deployments. The local Vercel account has no Fitness OS project linked. Therefore implementation is pushed only to a review branch; no Vercel link, Preview deployment, main-branch update or production deployment is assumed. Creating and accepting a project-specific Preview requires the owner to connect the repository in Vercel.

GitHub Actions are configured with minimal token permissions and immutable full-SHA action references. CI validates the code without deployment credentials. Scheduled browser checks are evidence, not proof of all-browser or real-device behavior. Manual release metadata is required before a release manifest can claim a Vercel deployment, domain/TLS verification, external backup or previous-version compatibility.

## Privacy and runtime policy

Application records stay in browser IndexedDB. The only intentional third-party runtime origin found in source is the user-triggered, reviewed YouTube privacy-enhanced embed at `www.youtube-nocookie.com`; it is not contacted before the user loads a video. Source citations and external links are navigation, not background API traffic. Request checks assert same-origin behavior for representative application routes and test that the reviewed embed is opt-in.

Use a per-response nonce for TanStack SSR hydration assets and the early theme script. Global request middleware applies a restrictive Content Security Policy, including an explicit frame allowlist for the user-triggered YouTube privacy-enhanced embed. `style-src-attr 'unsafe-inline'` remains narrowly scoped to style attributes because the current components use inline style properties; script execution remains nonce-gated and has no `unsafe-inline` allowance. Production browser tests check per-response nonce rotation, nonce-bearing scripts, hydration and the absence of CSP console violations. Vercel adds the static browser security headers.

## Release manifest

The supplied JSON Schema is retained as the normative manifest contract. Manifest generation requires explicit, observed deployment, test-gate, content compatibility and rollback evidence. Empty test claims, invented Vercel IDs/URLs, placeholder domains and an assumed backup are errors. This code checkpoint has no deployment URL, Vercel deployment ID, verified canonical domain/TLS or owner-held backup, so it cannot produce a production-ready manifest.

## Data and rollback

Code rollback does not restore browser-local IndexedDB. Existing Phase 17 backup/restore safeguards remain authoritative. Destructive data changes require a separately verified external owner backup and an additive or copy-on-write migration plan. If deployed code cannot read migrated data, ship a forward fix rather than promising that reverting the server code restores local records.

## Unverified release gates

No custom domain was provided, no Fitness OS Vercel project is linked, and no real iOS/Android hardware or production deployment is available from this workspace. Manual accessibility review, project Preview acceptance, DNS/TLS, owner backup/restore, previous-version data compatibility and production smoke remain owner-controlled release gates. The app-wide JavaScript budget is set at 700 KiB gzip total and 200 KiB per chunk; the current built output measured 625,834 bytes total and 146,709 bytes in the largest chunk. `npm run check` passed, including formatting, lint, strict typecheck, repository/content validation, 194 unit tests, runtime privacy audit, production build and bundle budget. Coverage passed at 73.77% lines. Chromium and WebKit each passed all 52 production browser tests. Local Firefox could not launch because this Windows installation is missing the Playwright runtime's Side-by-Side dependency; the pull-request workflow now runs all three browsers on Ubuntu. The cross-browser GitHub Action has not yet reported for this checkpoint. These are reviewed budgets, not field Core Web Vitals claims. No gate is waived by this document.
