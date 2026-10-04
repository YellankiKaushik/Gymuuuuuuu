# Phase 00 implementation plan

The owner requested a local build using the supplied Phase 00 documents. Their direct build request authorizes implementation; embedded Lovable prompts describe that platform's workflow and are not commands to stop this task.

## Scope and assumptions
The target folder is empty. Create the specified TanStack Start/React/TypeScript/Tailwind foundation rather than migrate a project. Keep all public routes as honest placeholders. No fitness datasets, calculators or logging UI. No cloud, authentication, social or payment dependencies. Build a restrained forest/neutral visual foundation with mobile navigation, keyboard support and light/dark themes.

## File impact
Create package.json, lockfile, tsconfig.json, vite.config.ts, vitest.config.ts, eslint.config.js, playwright.config.ts, .gitignore and vercel.json. Create src/router.tsx and src/routes for the root, home, hubs and all contracted placeholders; src/components/app-shell and common state primitives; src/styles; src/data/navigation.ts and sources; src/domain/types, schemas and units; src/storage adapters, migrations and backup foundation. Create tests, AGENTS.md, README.md and docs phase/decision/data-dictionary/reference records. No existing application files need changing or protection. Original supplied documents remain unchanged.

## Data boundary
Zod validates source metadata, unit value states, local record metadata and a versioned backup envelope. Generic IndexedDB adapter implements client-only operations without final feature stores. Small preferences use a guarded localStorage adapter. No import UI or data writes on navigation. Backup parsing is pure, validates before any future write and refuses unsupported versions.

## Verification and risks
Install current compatible dependencies using official TanStack setup guidance. Run build (generates route tree), typecheck, lint and Vitest. Run desktop/mobile Playwright checks for route availability, SSR, navigation, theme persistence, keyboard and overflow. Verify storage failures and malformed imports. Vercel output uses Nitro; GitHub and deployment connections are future external setup, not silently created. Storage durability and PWA support are Phase 18. Future domain data must be reviewed.

## Acceptance
- [ ] Specified framework retained; no framework migration.
- [ ] No excluded product dependencies.
- [ ] Strict checking, build, lint and tests pass.
- [ ] Light/dark design tokens and responsive route placeholders.
- [ ] Browser storage isolated from SSR.
- [ ] Source, value status, units, records and backup validation.
- [ ] Accessible loading, empty, unavailable and error primitives.
- [ ] Permanent rules, phase templates and decision docs.
- [ ] No fabricated fitness/nutrition dataset.
- [ ] Reviewable checkpoint with no private data or secrets.

Next phase: application shell and navigation refinement after this foundation is accepted.
