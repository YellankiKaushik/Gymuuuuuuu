# Repository map

The root keeps conventional developer controls visible. This organization moves historical specifications, not the application architecture.

```text
/
├── .github/                  pinned workflows, Dependabot and PR guidance
├── docs/
│   ├── README.md             current documentation hub
│   ├── features/            subject index for established feature documents
│   ├── assets/              visual provenance
│   ├── content-governance/  sources and publication boundaries
│   ├── data-dictionary/     shared data contracts
│   ├── decisions/           specification and engineering decisions
│   ├── diet-planning/       formulas, models, methods and checks
│   ├── foods/               ingestion, composition and source policy
│   ├── local-data/          module storage and backup contracts
│   ├── nutrients/           reference frameworks and review methods
│   ├── phases/              implementation plans and handoffs
│   ├── reports/             dated release evidence and move manifest
│   ├── runbooks/            release, rollback and owner deployment
│   ├── screenshots/         historical visual evidence
│   ├── security/            threat model
│   └── archive/original-specifications/
│       ├── phase-00/ … phase-17/
│       └── phase-18/legacy-copies/   original duplicates retained
├── public/                  unchanged static assets and license notices
├── scripts/                 existing entry points plus family index
├── src/                     unchanged runtime architecture/content
│   ├── components/          shell and shared UI
│   ├── content/             repository-owned factual inputs
│   ├── data/                navigation and generated search assets
│   ├── features/            feature domains, pages and storage
│   ├── routes/              TanStack file-based routes
│   ├── storage/             IndexedDB and backup contracts
│   └── config/, domain/, lib/, styles/
├── tests/                   existing suites plus classification index
│   └── audit/, browser/, closure/, fixtures/
└── conventional root controls listed below
```

## Root controls

- `README.md` and `AGENTS.md`: entry point and permanent maintenance rules.
- `package.json` and `package-lock.json`: stable npm commands and reproducible dependency resolution.
- `.node-version` and `.nvmrc`: conventional Node version discovery.
- `.env.example`, `.gitignore`, `.gitattributes`, `.prettierignore`: public configuration example, Git/editor boundaries and formatting exclusions.
- `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `vercel.json`: conventional tool discovery and deployment policy. None moved.
- `tsconfig.content.json`: separate strict content-tooling project; kept next to the main TypeScript config.
- `playwright.config.ts`: default test discovery. Specialized `playwright.audit.config.ts`, `playwright.closure.config.ts` and `playwright.production.config.ts` also remain at root. Their test/output paths are config-relative, the audit config imports production config, and npm/CI/history use their names. Moving three files would add path rebasing and historical-reference churn without changing the useful suite separation. No extra `config/` directory is needed.

Runtime files and public assets were not moved. Two source imports and generated provenance comments were repaired to the archived original JSON paths; imported values and application behavior are unchanged. Historical report paths stay meaningful through the [move manifest](reports/repository-reorganization-manifest.md).

Ignored local outputs (`node_modules/`, `.output/`, `data-imports/`, `artifacts/`, coverage and test results) are not the tracked GitHub tree. They were not cleaned or deleted.
