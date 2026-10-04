# Fitness OS

An evidence-aware, local-first fitness application built in phases from the supplied specifications. Stack: TanStack Start, React, strict TypeScript, Tailwind and Nitro. No account or backend personal-data store.

## Run

Node.js 22.12+ (Node 24 recommended), npm.

```sh
npm ci
npm run dev
```

Open http://localhost:3000. For production: npm run build, then npm start.

## Verify

```sh
npm run check
npx playwright install chromium
npm run test:browser
```

## Project

Requirements live in DOCS_for_entire_apppliaction/GYM. src/domain holds types and validation; src/data public content; src/features domain interfaces; src/storage client-only persistence. docs/phases records each completed gate and docs/decisions records intentional differences. Generated src/routeTree.gen.ts is managed by TanStack. Keep package-lock.json in version control.

Public content may render on the server; personal records remain in browser IndexedDB. Only small preferences use localStorage. Browser storage is not a backup. Domain knowledge and tools become available only as their phase is implemented and verified.

Vercel configuration is prepared with Nitro; external GitHub/Vercel linking and production deployment need the owner's destinations. No secrets or personal records are required for a code checkpoint.
