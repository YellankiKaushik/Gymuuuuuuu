# Phase 18 — Testing, GitHub and Vercel Deployment

**Project:** Fitness OS  
**Document type:** Lovable implementation specification  
**Phase:** 18 — Final build and release phase  
**Version:** 1.0  
**Status:** Ready for Lovable Plan mode  
**Prepared:** 5 August 2026  
**Depends on:** Phases 00–17  
**Final outcome:** Reproducible, tested, repository-owned production release

---

## 1. Phase objective

Convert the implemented Fitness OS codebase into a reproducible, tested and recoverable production application. Phase 18 must establish the complete quality-assurance system, connect the Lovable project to GitHub, create a disciplined branch and pull-request workflow, configure continuous integration, deploy verified previews through Vercel, establish one stable production origin, publish the first production release and document how to maintain, roll back and recover the application without depending on Lovable.

This phase is not a cosmetic final pass. It is the release-control layer for every previous phase.

The permanent rule is:

> A feature is not complete because it renders in Lovable. It is complete only when its data contracts validate, critical user journeys pass in real browsers, accessibility and privacy checks pass, the production build is reproducible from GitHub, deployment is verified on the canonical domain, and recovery procedures have been tested.

## 2. Scope

### 2.1 Included

- Inspection of the actual Lovable-generated repository before choosing tools or commands.
- Preservation of the existing Lovable-native framework, router, styling system and package manager.
- Standard package scripts for formatting, linting, type checking, schema validation, tests and production builds.
- Static data validation across every implemented phase.
- Unit, component, integration and end-to-end testing.
- IndexedDB migration, backup, restore and rollback-compatibility testing.
- Automated and manual accessibility testing against WCAG 2.2 AA requirements.
- Cross-browser, real-device and responsive testing.
- Privacy and runtime-network audits.
- Security-header, secret, dependency and supply-chain checks.
- Performance-regression testing and route-specific budgets.
- GitHub connection, branch strategy, pull requests and protected-main rules where supported.
- Dependabot alerts, security updates and version-update configuration.
- Conditional code scanning where repository visibility and GitHub plan support it.
- Vercel Preview and Production environments.
- Stable custom domain, DNS, TLS, canonical-host redirects and origin-continuity rules.
- Production release manifest, changelog, release tag and runbooks.
- Production smoke tests, rollback procedures and forward-fix rules.
- Long-term maintenance schedule and portability verification.

### 2.2 Explicit exclusions

- No authentication, account system or cloud personal-data store.
- No framework migration merely to make testing easier.
- No replacement of the package manager chosen by the repository.
- No automatic analytics, session replay, advertising pixel or user-behavior tracking.
- No monitoring that transmits workouts, foods, body measurements, health notes, queries or backup metadata.
- No automated tests that contain the owner’s real personal records.
- No production tests that modify or delete real personal data.
- No claim that automated accessibility tools prove WCAG conformance.
- No claim that Lighthouse lab results prove real-user Core Web Vitals.
- No hard-coded Node, action, browser or framework version without inspecting the repository and current official compatibility.
- No blind use of copied GitHub Actions examples.
- No CI secrets exposed to pull requests from forks or untrusted code.
- No direct push to `main` after branch protections or release rules are established.
- No production deployment while required release gates are failing.
- No assumption that Vercel code rollback reverses an IndexedDB migration.
- No assumption that browser records move automatically to a new domain.
- No deletion of the Lovable project or original GitHub repository during handoff.
- No dependency on Lovable hosting, Lovable Cloud, Supabase or hidden runtime services.

## 3. Dependencies and ownership

| Area | Owning phase | Phase 18 responsibility |
| --- | --- | --- |
| Product rules and exclusions | Phase 00 | Enforce all non-negotiable rules in CI and release review. |
| Shell, routes and design system | Phase 01 | Test global navigation, themes, responsive behavior and route errors. |
| Knowledge datasets | Phases 02–05, 07–08, 12–14 | Validate schemas, sources, publication states, stable IDs, links and licensing metadata. |
| Workout and cardio tracking | Phases 06 and 13 | Test full session workflows, migrations, history and exports. |
| Diet, nutrition, recipes and meal plans | Phases 09–11 | Test calculations, snapshots, incomplete-data behavior and logging. |
| Recovery, body progress and analytics | Phases 12 and 15 | Test privacy, derived metrics, photos, trends and no-score boundaries. |
| Search, favourites and comparison | Phase 16 | Test indexing, private-search isolation, ranking, references and compare constraints. |
| Storage, backup and recovery | Phase 17 | Test backup integrity, restore preview, conflicts, media package, origin migration and destructive controls. |
| Release operations | Phase 18 | Own CI, GitHub, Vercel, domain, release manifest, rollback and maintenance runbooks. |

## 4. Non-negotiable release decisions

1. **Inspect before configuring.** Lovable must inspect the actual repository, framework, package manager, lockfile, build command, output mode, route system and test dependencies before creating workflows.
2. **No framework migration.** Retain the native scaffold implemented by previous phases.
3. **GitHub is the durable code record.** The complete repository, history, tags, workflows, data files and runbooks must exist outside Lovable.
4. **One active Lovable branch.** Lovable syncs one branch at a time; branch switching must be deliberate.
5. **One production branch.** Use the repository default branch, normally `main`, as the only Vercel production branch.
6. **Feature branches first.** Every non-trivial change is built on a feature branch, previewed and merged through a pull request.
7. **Reproducible install.** Commit exactly one supported lockfile and use the package manager’s immutable CI install command.
8. **No real personal test data.** Automated fixtures use clearly synthetic names, dates, measurements and records.
9. **Risk-based tests.** Calculation, migration, backup, restore and privacy code receives stronger coverage than visual wrappers.
10. **Coverage is not proof.** Coverage reports guide testing; they do not replace assertions or browser tests.
11. **Production-like E2E.** Browser tests run against a production build or Vercel preview, not only a development server.
12. **Automated accessibility is incomplete.** Release requires manual keyboard, zoom, focus, screen-reader and real-device checks.
13. **No hidden network traffic.** Runtime requests must match an explicit allowlist; personal data never appears in URLs, request bodies, headers or telemetry.
14. **No secrets expected.** This local-first application should deploy without secrets. Any variable introduced later must be justified, scoped by environment and documented.
15. **One canonical origin.** Choose and keep one custom production domain before storing real personal records.
16. **Origin changes require export/import.** Browser storage does not migrate automatically between domains, protocols or ports.
17. **Preview is not production.** Production must be rechecked because its origin, environment variables and deployment configuration may differ.
18. **Code rollback is not data rollback.** Vercel rollback changes served code; it does not reverse local browser migrations.
19. **Additive migrations first.** Destructive migrations require an external Phase 17 backup, compatibility tests and explicit release approval.
20. **Rollback must be tested.** A release cannot be labelled rollback-safe until the previous production code has been tested against data migrated by the candidate.
21. **Forward fix when incompatible.** If older code cannot read the new local schema, do not roll back to it; ship a corrected forward deployment.
22. **Plan-sensitive features are conditional.** GitHub branch rules, CodeQL and Vercel deployment checks are enabled only when supported by the actual account and plan.
23. **No action-version guessing.** Use current official actions, pin them according to repository policy and update them through reviewed Dependabot pull requests.
24. **No silent waivers.** Every waived gate must record owner, reason, risk, expiry and follow-up issue.
25. **Production is tagged and documented.** Every release records commit SHA, application version, content versions, schema compatibility, deployment ID and rollback status.

## 5. Mandatory repository inspection

Before Lovable changes code, Plan mode must report:

- Framework and exact version.
- Router and rendering mode.
- Package manager and lockfile.
- Node/runtime requirements.
- Current package scripts.
- TypeScript strictness.
- Lint and formatting tools.
- Existing test tools.
- Build command and output directory or server command.
- Static-export, SPA, SSR or hybrid behavior.
- IndexedDB databases and module adapters.
- Service worker or PWA status, if any.
- External runtime domains.
- Environment-variable usage.
- Current GitHub connection, active branch and sync state.
- Existing Vercel configuration.
- Existing CI files.
- Existing CSP and response headers.
- Routes requiring representative browser tests.
- Current dependency vulnerabilities and incompatible packages.

Lovable must not create a second lockfile, second router, second test runner or competing deployment configuration.

## 6. Required repository structure

Use the actual project structure. Add equivalent files only where they do not already exist:

```text
.github/
  workflows/
    ci.yml
    e2e.yml
    quality.yml
    scheduled-maintenance.yml
    release.yml
  dependabot.yml
  pull_request_template.md
  CODEOWNERS                  # only when useful and supported

docs/
  DEPLOYMENT.md
  RELEASE_PROCESS.md
  ROLLBACK.md
  DATA_COMPATIBILITY.md
  ORIGIN_MIGRATION.md
  MAINTENANCE.md
  TESTING.md
  ACCESSIBILITY_TESTING.md
  PRIVACY_NETWORK_ALLOWLIST.md
  INCIDENT_LOG_TEMPLATE.md

release/
  phase-18-release-manifest.schema.json
  release-manifest.example.json

scripts/
  validate-data.*
  validate-release-manifest.*
  check-network-allowlist.*
  check-forbidden-files.*
  check-static-links.*
  generate-release-manifest.*

tests/
  unit/
  component/
  integration/
  e2e/
  accessibility/
  fixtures/
  compatibility/
```

Do not create `vercel.json` unless the actual project requires headers, redirects, rewrites or build overrides that cannot be expressed safely through the framework or Vercel project settings.

## 7. Standard package commands

Expose stable command names, adapting their implementation to the detected package manager and framework:

| Script | Required behavior |
| --- | --- |
| `format:check` | Verify formatting without modifying files. |
| `lint` | Run framework, TypeScript and accessibility lint rules. |
| `typecheck` | Run strict type checking without emitting build output. |
| `validate:data` | Validate every static data file, stable relationship and publication rule. |
| `test:unit` | Run deterministic formula and pure-function tests. |
| `test:coverage` | Produce risk-based coverage reports. |
| `test:e2e` | Run critical Playwright journeys against a production-like build. |
| `test:a11y` | Run automated accessibility checks on representative states. |
| `build` | Produce the production application exactly as Vercel will. |
| `check` | Run all fast pull-request gates in deterministic order. |

If an equivalent script already exists, preserve it and add an alias only when necessary.

## 8. Test-data policy

### 8.1 Synthetic fixtures only

Automated fixtures must be artificial and obviously non-personal:

- Names such as `Synthetic User A`, never the owner’s name.
- Fixed dates and fixed time zones.
- Non-identifying progress-photo placeholders.
- Invented workout, nutrition and sleep logs.
- No exported browser backup from real use.
- No real symptom, medication or supplement-adverse-event notes.

### 8.2 Deterministic fixtures

- Freeze system time where calculations depend on dates.
- Set explicit IANA time zones.
- Seed random generators.
- Avoid live nutrition, video, retailer or health APIs.
- Store static expected outputs beside the test vector.
- Separate small unit fixtures from full cross-module compatibility fixtures.

### 8.3 Artifact privacy

CI artifacts may contain synthetic traces, screenshots, coverage and reports. They must never contain:

- Real workouts, foods, measurements or notes.
- Progress photos.
- Backup files.
- Browser-storage exports from production.
- Environment secrets.
- Private search queries.

## 9. Static and repository tests

The repository-contract test must fail when:

- More than one package-manager lockfile exists.
- No lockfile exists.
- The runtime version is ambiguous.
- TypeScript strictness is disabled without an approved reason.
- Required scripts are missing.
- `.env` secrets are tracked.
- Backup, photo or personal-data files are committed.
- Large generated test output is committed accidentally.
- Draft source records are published.
- A workflow has excessive permissions.
- A new external runtime domain is not registered.

Use the detected package manager’s immutable install command. Do not use a non-deterministic install in CI.

## 10. Static data and content validation

Phase 18 must run every phase-specific schema and integrity test already delivered. The global validator must check:

- JSON parse validity.
- JSON Schema compliance.
- Unique stable IDs and slugs within owning namespaces.
- Valid cross-phase references.
- Valid route targets.
- Published records meet publication gates.
- Draft and quarantined records are excluded from public indexes.
- Missing nutrient and analytics values remain unavailable rather than zero.
- Formula and methodology versions are present.
- Source records include publisher, URL and review metadata.
- Media records include license or embedding permission.
- No duplicate food, exercise, muscle, nutrient or supplement identity is introduced silently.
- Search aliases are reviewed rather than generated speculatively.
- Every external link uses an approved protocol.
- Broken-link reports distinguish permanent failures from temporary rate limits.

External-link checking runs on a schedule and before major releases. Transient external failures should produce a reviewed report, not automatically delete content.

## 11. Unit-testing strategy

Unit tests must cover pure and deterministic logic from every phase, including:

- Unit conversions and rounding boundaries.
- Dates, time zones and daylight-saving transitions.
- Workout volume, personal records and estimated-strength calculations.
- Food quantity and nutrient aggregation.
- Missing, trace and unavailable nutrient states.
- Diet formulas and reference-data versions.
- Recipe yield, retention and serving calculations.
- Sleep and recovery calculations.
- Cardio pace, interval and heart-rate calculations.
- Supplement total-exposure arithmetic without safety diagnosis.
- Body-weight medians and trend calculations.
- Search normalization, ranking and highlight escaping.
- Comparison-family compatibility.
- CSV quoting and spreadsheet-safe escaping.
- Backup hashing, manifest generation and conflict classification.
- Release-manifest generation and compatibility decisions.

### 11.1 Coverage policy

Do not force a meaningless global 100% target.

- Registered formula engines, schema migrations, backup serializers, restore planners and release-compatibility logic require complete branch coverage for their defined test vectors.
- Presentation components use a lower risk-based target and must be covered by behavior and E2E tests.
- Establish a baseline after the initial suite exists.
- Pull requests may not reduce coverage for critical registered modules.
- Any uncovered critical branch requires a documented test or explicit release waiver.

## 12. Component and integration testing

Use the framework-compatible component runner. When the scaffold supports React Testing Library, tests should interact through accessible roles, labels and visible behavior rather than internal component state.

Required component and integration targets:

- Global navigation and mobile menus.
- Search dialog, filters and comparison tray.
- Unit and theme settings.
- Calculator validation and explanation drawers.
- Workout set editor and timers.
- Nutrition quantity and portion controls.
- Recipe scaling and meal-plan interactions.
- Sleep and recovery forms.
- Cardio intervals.
- Supplement evidence and safety states.
- Body measurement and photo controls.
- Backup, restore, conflict and reset dialogs.
- Error, empty, loading, unavailable and stale-data states.
- IndexedDB adapters and migration functions.
- Cross-tab lock behavior.

## 13. End-to-end test architecture

Use Playwright or the existing equivalent browser runner. Do not add a second E2E framework.

### 13.1 Environments

- Local production build for deterministic CI.
- Vercel Preview for release-candidate acceptance.
- Production for read-only and synthetic fresh-profile smoke tests.

### 13.2 Pull-request matrix

Run the critical smoke suite on:

- Chromium desktop.
- Chromium mobile emulation.

### 13.3 Main and release matrix

Add:

- Firefox desktop.
- WebKit desktop.
- WebKit mobile emulation.
- Manual real-device smoke on one current iOS Safari device.
- Manual real-device smoke on one current Android Chrome device.

### 13.4 Critical cross-module journeys

1. Open the app from a fresh browser profile.
2. Navigate through all top-level modules.
3. Search and open a muscle, exercise, food and nutrient.
4. Save an item and restore it after reload.
5. Start, log, finish and reopen a workout.
6. Create a diet-plan estimate and save it locally.
7. Log a food with a verified gram quantity.
8. Create and log a personal recipe serving.
9. Record sleep and recovery information.
10. Log a cardio session.
11. Save a supplement product without generating a recommendation.
12. Record weight and a circumference measurement.
13. Review dashboard metrics and data-quality details.
14. Export a portable backup.
15. Preview a restore with zero canonical writes.
16. Restore into a fresh synthetic profile.
17. Verify favourites, logs, versions and references after restore.
18. Verify no personal record appears in a URL or network request.

### 13.5 Failure artifacts

Retain on failure only:

- Screenshot.
- Trace.
- Video where needed.
- Browser console output.
- Network summary with redacted values.

Use synthetic data and a limited retention period.

## 14. Storage and migration test matrix

Phase 17 is release-critical. Required scenarios include:

- Fresh database creation.
- Upgrade from every supported previous schema version.
- Interrupted migration recovery.
- Duplicate tab during migration.
- Storage persistence denied.
- Quota exceeded during a write.
- Quota exceeded during backup creation.
- Corrupt backup.
- Hash mismatch.
- Unknown future backup version.
- Keep-existing restore.
- Import-as-copy restore.
- Replace-selected-modules restore.
- Replace-all restore.
- Multi-database journal resume.
- Multi-database rollback.
- Missing progress-photo binary.
- Full-media package restore.
- Reset confirmation and cancellation.

### 14.1 Candidate-to-previous rollback test

For each release with a local schema change:

1. Start the previous production application with synthetic canonical data.
2. Upgrade to the candidate and allow all candidate migrations.
3. Verify the candidate data.
4. Launch the previous production code against the candidate-migrated data.
5. Record whether the previous code reads safely, enters a controlled unsupported-version state or corrupts data.
6. Mark `rollbackSafe` only when the previous code is demonstrably safe.

If this test fails, the incident plan must use a forward fix instead of code rollback.

## 15. Accessibility testing

Target WCAG 2.2 AA while acknowledging that conformance requires human judgment.

### 15.1 Automated checks

Run axe or the existing equivalent on representative states:

- Home and module hubs.
- Catalogues and detail pages.
- Search dialog.
- Workout and nutrition editors.
- Calculators.
- Charts and tables.
- Backup and restore flows.
- Error and empty states.
- Light and dark themes.

### 15.2 Manual release checks

- Keyboard-only operation.
- Logical focus order.
- Visible focus not obscured by sticky navigation.
- Escape and focus restoration for dialogs.
- Accessible names for controls.
- Status and error announcements.
- 200% browser zoom.
- 400% reflow where applicable.
- Text spacing.
- Reduced-motion preference.
- High-contrast/forced-colors smoke where supported.
- Dragging alternatives.
- Minimum target sizing.
- Tables with correct header relationships.
- Charts with equivalent text summaries.
- Screen-reader smoke using one desktop screen reader/browser combination.
- Real iOS VoiceOver or Android TalkBack smoke for core logging flows when available.

Automated scores must not be described as WCAG certification.

## 16. Responsive and visual testing

Test at minimum:

- 320 px width.
- 375 px width.
- 430 px width.
- 768 px width.
- 1024 px width.
- 1280 px width.
- 1440 px width.

Review:

- Safe-area insets.
- Mobile bottom navigation.
- Sticky timers and action bars.
- Long anatomical and nutrient names.
- Large tables and compare views.
- Charts without horizontal clipping.
- Keyboard opening on mobile forms.
- Landscape phone orientation.
- Dark mode.
- Empty, loading and error states.

Visual regression snapshots may cover stable shell and component states, but they must not become the only functional test.

## 17. Performance and bundle controls

### 17.1 Production build

Every release must build from a fresh clone with the committed lockfile. Build warnings are reviewed rather than ignored.

### 17.2 Representative Lighthouse routes

Run lab audits on a small stable route set such as:

- Home.
- Exercise catalogue.
- Exercise detail.
- Food catalogue.
- Food detail.
- Workout workspace with synthetic data.
- Nutrition tracker with synthetic data.
- Dashboard with synthetic data.
- Settings/Data page.

### 17.3 Budgets

Create route-specific budgets after measuring the actual baseline:

- JavaScript transfer size.
- Total transfer size.
- Image count and size.
- Third-party request count.
- Main-thread blocking indicators.
- Search-index load time.
- Largest static dataset chunks.

Do not copy arbitrary score thresholds. Release gates prevent unexplained regression from the approved baseline. Core Web Vitals field claims are prohibited unless privacy-approved field telemetry is introduced in a later explicit decision.

### 17.4 Required performance behaviors

- Search index loads lazily or in a worker.
- Large datasets are chunked or loaded by route where practical.
- Progress photos are not loaded on the dashboard by default.
- Charts do not render thousands of points when aggregation is sufficient.
- External video players do not load before user intent where the prior media policy requires it.
- No duplicate icon, chart or utility libraries.

## 18. Privacy and network audit

Create a documented runtime network allowlist from the actual implementation.

For every request, record:

- Domain.
- Purpose.
- Trigger.
- Data categories sent.
- Whether personal data can be present.
- Whether the request is required.
- Whether it can be delayed until user action.
- Owning module.

The audit must verify:

- No workout, food, sleep, supplement, body or recovery record leaves the browser.
- No private search query leaves the browser.
- No personal data is placed in route parameters.
- No backup metadata is transmitted.
- No analytics or session-replay SDK is present.
- No hidden error-reporting SDK captures form content.
- External video requests follow the reviewed embedding policy.
- Fonts and icons are local where the design system requires it.
- Preview and production use the same approved allowlist.

## 19. Security and supply-chain checks

### 19.1 Application security

Review and test:

- Content Security Policy or equivalent framework-safe headers.
- `frame-ancestors` or equivalent clickjacking protection.
- `object-src 'none'` where compatible.
- Referrer policy.
- Permissions policy.
- MIME sniffing protection.
- Safe external links.
- Safe HTML rendering; no unreviewed raw HTML.
- Search highlight escaping.
- CSV formula protection.
- Backup-file validation before parsing or writing.
- File-type and size limits for images and imports.

CSP must be designed for the actual rendering mode. Do not copy a nonce-based SSR example into a static build or allow broad `unsafe-inline`/`unsafe-eval` in production without a documented reason.

### 19.2 Repository security

- Enable dependency graph and Dependabot alerts.
- Enable Dependabot security updates.
- Configure reviewed weekly or monthly version-update pull requests.
- Group low-risk development updates where useful.
- Review major updates manually.
- Enable secret scanning and push protection where available.
- Enable CodeQL/default code scanning only where the repository visibility and GitHub plan support it.
- Treat absence of CodeQL as a plan limitation, not proof of security.
- Use least-privilege GitHub Actions permissions.
- Do not expose write tokens to untrusted pull-request code.
- Review action updates through Dependabot.

## 20. GitHub connection and source-control workflow

### 20.1 Connect Lovable

1. Confirm the Phase 17 checkpoint exists.
2. In Lovable, connect the project to the intended GitHub account.
3. Record the repository owner, name and default branch.
4. Confirm two-way sync succeeds.
5. Clone the repository locally.
6. Run immutable install, validation, tests and build without Lovable.

Lovable creates a private repository by default. Keep it private unless the owner deliberately chooses open-source publication.

Do not transfer the repository or rename the GitHub account/organization while sync is active. Lovable currently tracks repository renames, but owner transfer and repository deletion break sync.

### 20.2 Branch model

- `main`: production branch; always releasable.
- `feature/<short-name>`: new work.
- `fix/<short-name>`: normal fixes.
- `hotfix/<short-name>`: urgent production correction.
- `release/<version>`: optional only when a release candidate needs stabilization.

Because Lovable edits one active branch at a time:

1. Switch Lovable to `main`.
2. Pull/sync the latest `main`.
3. Create a new feature branch from `main`.
4. Let Lovable edit only that branch.
5. Review the Git diff.
6. Open a pull request.
7. Verify the Vercel Preview.
8. Merge only after required checks pass.
9. Switch Lovable back to `main` and confirm synchronization.

### 20.3 Main-branch rules

Where the account plan supports them:

- Require pull requests.
- Require unique named status checks.
- Require conversation resolution.
- Block force pushes.
- Block deletion.
- Require branch to be current when necessary.
- Apply rules to administrators when practical.

If private-repository branch protection is unavailable on the owner’s plan, document the limitation and follow the same workflow manually. Do not claim the branch is technically protected.

### 20.4 Pull-request template

Every PR must state:

- Scope.
- Phases/modules affected.
- Data-schema changes.
- Migration IDs.
- Privacy/network changes.
- External domains added.
- Screenshots using synthetic data.
- Tests run.
- Accessibility review.
- Preview URL.
- Backup/rollback implications.
- Documentation updates.

## 21. GitHub Actions architecture

### 21.1 CI workflow

On every pull request and `main` push:

1. Checkout code.
2. Set up the declared runtime.
3. Restore package-manager cache only according to the lockfile.
4. Run immutable dependency install.
5. Check formatting.
6. Lint.
7. Typecheck.
8. Validate data.
9. Run unit/component tests.
10. Build.

### 21.2 E2E workflow

- Install browser dependencies.
- Start a production-like build.
- Run PR smoke browsers.
- Run the full matrix on `main` and release.
- Upload traces only on failure or explicit debugging.
- Never include real local-storage data.

### 21.3 Quality workflow

On `main` and before release:

- Automated accessibility.
- Network/privacy allowlist.
- Security-header checks.
- Lighthouse CI and resource budgets.
- Bundle analysis report.

### 21.4 Scheduled maintenance

At a reasonable low frequency, such as weekly:

- Full browser regression.
- External-link report.
- Dependency review.
- Source-registry freshness report.
- Static-data duplicate report.

Scheduled failure creates an issue or report; it must not silently modify scientific content.

### 21.5 Workflow security

- Declare top-level `permissions: contents: read` unless a job needs more.
- Grant write permission only to the smallest job requiring it.
- Do not use production secrets on untrusted PR code.
- Avoid `pull_request_target` for running repository code.
- Pin third-party actions according to repository security policy.
- Review action provenance and licence.
- Keep job names unique when they are required branch checks.

## 22. Vercel project configuration

### 22.1 Import from GitHub

- Import the connected GitHub repository.
- Confirm framework detection against the actual repository.
- Confirm root directory.
- Confirm install command.
- Confirm build command.
- Confirm output behavior.
- Set `main` as Production Branch.
- Do not add a database, backend or serverless API unless already required by the approved scaffold.

### 22.2 Environments

Use:

- **Development:** local work with synthetic fixtures.
- **Preview:** every branch and pull request.
- **Production:** `main` and the canonical domain.

The application should require no custom secrets. If the scaffold exposes harmless build metadata, document it separately from secrets.

### 22.3 Environment-variable audit

For every variable, record:

- Name.
- Purpose.
- Owner.
- Development value source.
- Preview value source.
- Production value source.
- Whether the value reaches the client.
- Rotation procedure.

Never prefix a secret as public. Keep environment files out of Git.

### 22.4 Preview deployment acceptance

Every release-candidate preview must pass:

- Build success.
- Critical route smoke.
- Browser console audit.
- Network allowlist.
- Accessibility smoke.
- Responsive smoke.
- Backup export.
- Restore preview with zero writes.
- IndexedDB persistence after reload.
- No production-domain or personal-data mutation.

## 23. Canonical domain and origin continuity

### 23.1 Stable domain requirement

Before the owner stores long-term personal records:

- Register or choose one custom domain.
- Add it to the Vercel project.
- Configure the exact DNS records shown by Vercel.
- Verify domain ownership.
- Verify TLS.
- Choose one canonical hostname, such as apex or `www`.
- Redirect every alternate hostname to the canonical hostname.
- Record the domain-renewal owner and renewal date.

Do not use both the generated `vercel.app` URL and custom domain as interchangeable personal-data locations. They are different origins with separate browser storage.

### 23.2 Domain-change procedure

If the canonical domain must change:

1. Open the old origin.
2. Create and validate a Phase 17 external backup.
3. Keep the old origin active.
4. Deploy and verify the new origin.
5. Open the new origin.
6. Preview the restore.
7. Restore and validate counts, references and media.
8. Create a new backup from the new origin.
9. Only then redirect or retire the old origin.

Automatic cross-origin transfer is prohibited.

## 24. Release versioning and manifest

Use semantic versioning for application releases:

- Patch: compatible fixes and content corrections.
- Minor: backward-compatible features or additive schemas.
- Major: intentionally incompatible application or data changes.

Every production release generates a manifest conforming to `Phase_18_Testing_Deployment_Data_Schema.json` with:

- Release ID and version.
- Repository and 40-character commit SHA.
- Branch and tag.
- Framework, runtime and package-manager versions.
- Lockfile hash.
- Test-gate results.
- Phase content and schema versions.
- Per-module minimum readable data versions.
- Migration IDs.
- Rollback compatibility.
- Vercel deployment ID and URLs.
- Canonical domain and TLS status.
- Previous deployment and rollback runbook.

## 25. Production release procedure

1. Freeze the release scope.
2. Pull the latest `main`.
3. Confirm the repository is clean.
4. Create an external Phase 17 backup when the release changes local schemas.
5. Run immutable install from a fresh environment.
6. Run all release gates.
7. Build production assets.
8. Generate the release manifest.
9. Deploy or obtain the Vercel Preview.
10. Complete preview acceptance.
11. Merge the approved pull request to `main`.
12. Confirm Vercel production deployment.
13. Verify canonical domain, redirects and TLS.
14. Run production smoke in a fresh synthetic browser profile.
15. Verify an existing compatible synthetic database.
16. Check browser console and network activity.
17. Tag the production commit.
18. Publish changelog/release notes.
19. Store the manifest and CI links.
20. Record the release in the incident/maintenance log.

Do not run destructive test flows against the owner’s real browser profile.

## 26. Rollback and incident recovery

### 26.1 Incident classes

- Build failure before production.
- Broken preview.
- Broken production UI.
- Broken static content or route.
- Security/privacy regression.
- Local-data migration failure.
- Backup/restore defect.
- Domain or DNS failure.
- Dependency or supply-chain incident.

### 26.2 Code rollback

When current local schemas remain compatible, Vercel rollback or Git revert may restore the previous application. After rollback:

- Verify production logs/build output.
- Run critical routes.
- Verify existing local data.
- Record incident and affected deployment.

Vercel plan limits may affect which deployment can be selected. The runbook must document actual project capability.

### 26.3 Data-migration incident

If the previous code cannot safely read migrated data:

- Do not route production to the incompatible old deployment.
- Freeze further migrations.
- Ship a forward fix.
- Preserve current data.
- Use the pre-release external backup only through the explicit Phase 17 recovery process.
- Never silently replace a user’s current browser data with an older backup.

### 26.4 Domain incident

If DNS or domain assignment fails:

- Keep the previous canonical origin active where possible.
- Do not tell the owner to begin using a temporary hostname for real data.
- Restore DNS/TLS.
- Verify redirects.
- Use backup/import only if origin migration is unavoidable.

## 27. Production smoke checklist

- Canonical URL loads over HTTPS.
- Alternate hostname redirects once to canonical.
- Home page and every module hub load.
- No unhandled console error.
- No failed required static asset.
- Search index loads.
- One knowledge detail page per major module opens.
- Workout session can be created and removed in synthetic profile.
- Food entry can be created and removed in synthetic profile.
- Backup downloads and validates.
- Restore preview makes zero writes.
- Theme and unit settings persist.
- Page refresh preserves synthetic local records.
- Private data does not enter URLs.
- Network requests match allowlist.
- Production headers match policy.
- 404 and global error states work.
- Mobile navigation works on real devices.

## 28. Long-term maintenance

### Every release

- Review dependency changes.
- Review external domains.
- Run release gates.
- Update changelog and manifest.
- Confirm rollback compatibility.
- Create an external data backup before destructive schema work.

### Monthly

- Review Dependabot and security alerts.
- Check Vercel deployment failures.
- Verify domain and TLS health.
- Run a backup and restore drill with synthetic data.
- Review failed external links.

### Quarterly

- Fresh clone and build from GitHub.
- Full browser and real-device regression.
- Review bundle and performance baseline.
- Review CSP and network allowlist.
- Review storage quota and backup documentation.
- Verify GitHub and Vercel account recovery access.

### Annually

- Renew the custom domain.
- Review Node, framework and major dependency support status.
- Review official scientific source registries and licensing.
- Rehearse deployment to a temporary alternative host from GitHub.
- Verify that the application can operate without Lovable access.

## 29. Definition of done

Phase 18 is complete only when:

- The actual repository was inspected before configuration.
- No framework or package-manager migration occurred.
- GitHub sync works and the repository can be cloned and built independently.
- One lockfile is committed.
- Required package scripts work.
- CI runs on pull requests and `main`.
- Static data, type, unit, component and build gates pass.
- Critical E2E flows pass in the required browser matrix.
- Automated and manual accessibility review passes.
- Runtime privacy/network audit passes.
- Security and dependency review passes.
- Phase 17 backup, restore and migration tests pass.
- Vercel Preview acceptance passes.
- One canonical custom domain is configured with TLS and redirects.
- Production smoke passes.
- Release manifest validates.
- Rollback compatibility is documented honestly.
- Deployment, rollback, origin migration and maintenance runbooks exist.
- No real personal data exists in the repository or CI artifacts.
- The application remains usable without Lovable.

## 30. Lovable Plan-mode instructions

Read Phase 00 Project Knowledge and all implemented phases. Read the attached Phase 18 specification, schema and reference data completely.

Do not modify code yet.

Inspect the actual repository and report:

1. Framework, version, router and rendering mode.
2. Package manager, lockfile and runtime version.
3. Current scripts, linting, formatting and tests.
4. Build and deployment behavior.
5. IndexedDB databases, schema versions and migration implementation.
6. External runtime domains and environment variables.
7. GitHub connection, active branch and existing workflows.
8. Vercel configuration and production branch.
9. Gaps between the repository and this specification.
10. Exact files to create or modify.
11. Test tool choices based on existing compatibility.
12. Data-migration and rollback risks.
13. Plan-sensitive GitHub/Vercel features that may be unavailable.
14. A staged implementation plan with verification after each stage.

Reject any plan that introduces authentication, a backend, analytics, a framework migration, a second package manager, fabricated test data, destructive migration or unapproved network service.

## 31. Lovable Agent-mode implementation instructions

Implement only the approved Phase 18 plan.

Required sequence:

1. Add repository and package-script contracts.
2. Add static data validation.
3. Add unit and component tests.
4. Add storage and compatibility tests.
5. Add E2E and accessibility tests.
6. Add privacy, security and performance checks.
7. Add GitHub workflows with least privilege.
8. Add Dependabot and repository templates.
9. Add release schema, manifest generator and runbooks.
10. Configure Vercel without changing the application framework.
11. Verify Preview.
12. Stop before production promotion and present the owner with the final release checklist.

Do not claim completion while a required test is skipped or failing. Do not deploy to production automatically unless the owner explicitly performs or approves the final release action in Lovable/Vercel.

## 32. Sources and review notes

The authoritative source registry is contained in `Phase_18_Testing_Deployment_Reference_Data.json`. It includes current official Lovable, Vercel, GitHub, framework-testing, Playwright, W3C, axe-core, Lighthouse and Web Vitals documentation reviewed through 5 August 2026.

Tool versions, GitHub Action tags, Vercel plan features and framework compatibility are time-sensitive. Phase 18 therefore requires implementation-time inspection rather than hard-coding documentation examples.
