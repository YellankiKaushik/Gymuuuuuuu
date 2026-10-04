# Phase 01 — verified shell

Read all four files: master Markdown, quick reference, prompt package, and every DOCX paragraph compared to the Markdown. The DOCX's three additional cover paragraphs reiterate the same scope and constraints.

## Delivered and evidence
- [x] Native stack, strict checking and no excluded services: package.json, typecheck/lint/build.
- [x] Single typed route/navigation manifest, stable IDs, valid groups and aliases: navigation.ts; 4 manifest tests.
- [x] Configured product/origin/version: config/app.ts and route-metadata.ts. UI labels and title metadata derive from these.
- [x] Validated local theme/sidebar preferences with backward-compatible optional sidebar field: preference adapter/schema; malformed fallback browser test.
- [x] 272/80 px desktop sidebar with accessible labels/tooltips and persisted collapse; tablet dialog drawer; exactly five mobile bottom links; six More destinations; focus trap and restoration: navigation.tsx and shell browser checks.
- [x] Navigation-only search: button/Ctrl K/slash, aliases, arrow/Enter, clear/no-results/Escape; no external service or query persistence.
- [x] Readable light/dark/system tokens, typography, spacing, icons, motion and common primitives; docs/design-system.md and docs/navigation.md.
- [x] Useful home navigation with no fake metrics; neutral placeholders; safe unknown entity; branded 404 with home/search/back; global states.
- [x] Skip link, keyboard focus, route titles, no core console errors, automated axe scans on representative light/dark pages and More sheet.
- [x] Build, strict checking, lint, 13 unit tests and 6 browser tests pass.
- [x] All required viewports (320,375,390,768,1024,1280,1440), narrow landscape and 200% CSS zoom/reflow verified without body overflow. Desktop/mobile screenshots inspected.

## Exact file areas
Added config/app.ts, lib/navigation-search.ts and route-metadata.ts, app-shell/navigation.tsx, common/page-header.tsx and primitives.tsx, styles/shell.css and foundation.css, navigation unit tests and shell browser tests, upgrade/inspection scripts and design/navigation docs. Updated shell/finder, manifest, preference schema/adapter, home/module/state/source components, route metadata, styles import and browser regression checks.

## Limits and handoff
Remote GitHub/Vercel connection and remote deployment refresh verification await the owner's destination; local SSR refresh across the full route contract passes. Origin is intentionally localhost until deployment. Native title tooltips support collapsed icons; explicit accessible names work with keyboard/screen readers. Automated axe and keyboard checks supplement, but do not constitute a full manual assistive-technology audit. No domain content/tracker/PWA functionality has been added. Preserve these components in Phase 02 and extend through props/composition.
