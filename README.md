# Fitness OS

An evidence-aware, local-first fitness application built in phases from the supplied specifications. Stack: TanStack Start, React, strict TypeScript, Tailwind and Nitro. No account or backend personal-data store.

## Run

Node.js 24.16.0 and npm 11.9.0. `.nvmrc`, `.node-version`, `package.json` and CI share this toolchain.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For production: npm run build, then npm start.

## Verify

```sh
npm run check
npm run test:coverage
npx playwright install chromium
npm run test:e2e
npm run test:a11y
```

`npm run check` includes formatting for Phase 18-owned config and release tooling, lint, strict types, source-data validation, unit tests, privacy/repository audits, the production build and measured bundle-size budgets. The coverage report is diagnostic; its current line coverage is about 74% and is not a correctness claim. Scheduled GitHub Actions run the Chromium/Firefox/WebKit matrix.

Set the public `VITE_PUBLIC_APP_ORIGIN` to the approved canonical domain in Vercel's Production environment. It must contain only the HTTP(S) origin (no path or query), and it is not a secret. Keep the same production origin before users save local data; browser IndexedDB does not move when origins change. `.env.example` shows the local default.

## Project

Requirements live in DOCS_for_entire_apppliaction/GYM. src/domain holds types and validation; src/data public content; src/features domain interfaces; src/storage client-only persistence. docs/phases records each completed gate and docs/decisions records intentional differences. Generated src/routeTree.gen.ts is managed by TanStack. Keep package-lock.json in version control.

Public content may render on the server; personal records remain in browser IndexedDB. Only small preferences use localStorage. Browser storage is not a backup. Domain knowledge and tools become available only as their phase is implemented and verified.

Vercel configuration is prepared with Nitro, per-request CSP nonces and browser security headers. Link the GitHub repository to a Vercel project to test Preview deployments; this repository has no Vercel project link or approved production domain yet. No secrets or personal records are required for a code checkpoint.
