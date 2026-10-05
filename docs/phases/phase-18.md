# Phase 18 integration checkpoint — 5 October 2026

The supplied branch head `8b38c47bda97b8599266ddc191097ce5f5f6d53c` was exactly two commits ahead of remote main `88b4efc48fbb77c37e2cd9873fed97d548f6546b`, with no commits behind and a clean working tree. GitHub PR creation returned HTTP 403, so the owner's explicitly authorized fast-forward fallback is used. Both original commits and the Phase 18 branch are preserved.

Validation exposed an intermittent production WebKit hydration failure. The supported client entry now waits for document parsing before starting hydration. Repeated cached public/private navigation regressions assert headings, titles, interactive search and zero page errors. Automated Vercel Git deployments are explicitly disabled and checked by the repository audit.

Observed validation before integration:

- Clean `npm ci`: passed; Node 24.16.0 / npm 11.9.0.
- `npm run check`: passed, including 194 unit tests in 34 files, formatting, lint, strict types, schemas, references, privacy, build and existing bundle budgets.
- `npm run test:coverage`: 194 passed; 73.73% lines.
- Original production Chromium: 52 passed after isolating artifact directories.
- Rebuilt production WebKit: 55 passed, including three new hydration regressions.
- Dedicated `npm run test:a11y`: passed; one tagged test covering multiple routes/themes. Other browser files contain additional accessibility matrices.
- `npm run test:privacy`: passed across 353 source files.
- `npm audit --audit-level=high`: zero known vulnerabilities.
- Rebuilt browser JS: 625,664 gzip bytes total; largest chunk 146,723 bytes, within unchanged 700 KiB / 200 KiB limits.
- Firefox cannot launch on this Windows host. A forced official reinstall did not resolve the SideBySide `mozglue` assembly failure. Full Firefox validation is unverified, not waived or reported passed.

The first simultaneous browser probe interfered with shared test artifacts; the isolated Chromium rerun passed. Later WebKit failures were investigated rather than ignored; the hydration regression was fixed and the entire rebuilt WebKit suite passed. Production deployment, domain/TLS, real-device checks, screen-reader/zoom review and owner-held backup drills remain unperformed. This is an engineering integration checkpoint, not a production release.
