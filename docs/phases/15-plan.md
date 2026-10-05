# Phase 15 implementation plan

Phase 15 builds a private, browser-local body progress workspace and analytics layer over the previously completed workout, nutrition, recovery, cardio and supplement modules.

## Integration sequence

1. Extend the canonical `fitness-os` IndexedDB schema from v10 to the specified v15 without modifying or deleting earlier stores. Versions 11–14 remain reserved; the v15 upgrade creates the Phase 15 records and indexes.
2. Define strict runtime schemas and typed storage APIs for weight, circumference, external composition, photo metadata/blobs, measured height, goals, explicit nutrition-day review, dashboard layouts, settings, audit/tombstones, import conflicts and rebuildable analytics.
3. Implement compatible, versioned calculations and result receipts. Never infer body fat from BMI, waist or photos; never combine incompatible protocols/devices; keep missing values and incomplete nutrition days out of averages.
4. Add validation-first backup/restore, CSV exports, photo sanitization and optional ZIP export. Stage/validate imports before a single transaction; report conflicts and preserve records after validation errors.
5. Add the 17 specified dashboard, progress, analytics, methodology, settings and privacy routes using the existing TanStack Start route conventions. Keep personal values out of server metadata and URLs.
6. Add focused unit tests, migration/backup/property coverage, route smoke and keyboard/responsive checks. Run typecheck, lint, full tests, content validation/build and desktop/mobile browser checks before checkpoint.
7. Update the phase checklist, decision log and handoff with validation results, then push the completed phase and `phase-15-...-complete` tag before reading Phase 16.

## Routes

`/dashboard`, `/progress`, `/progress/weight`, `/progress/measurements`, `/progress/body-composition`, `/progress/photos`, `/progress/goals`, `/analytics`, `/analytics/workouts`, `/analytics/strength`, `/analytics/nutrition`, `/analytics/recovery`, `/analytics/cardio`, `/analytics/data-quality`, `/analytics/methodology`, `/progress/settings`, `/progress/privacy`.

## Acceptance boundaries

- Raw source records remain canonical and unchanged by analytics. Every result includes method/version, range, sample counts, exclusions and quality flags.
- Trends require minimum samples and compatible sources; no interpolation, forecasting, universal score, causal claim or body-composition calculator.
- Photos are re-encoded locally before persistence, original metadata is discarded, binary data is excluded from the default JSON backup, and photo comparison remains manual.
- Personal records use IndexedDB only. Imports validate completely before writes. Destructive operations require confirmation and show save/backup feedback.
- Draft reference identities/protocols are not exposed as reviewed public knowledge.

## Phase checklist

- [x] Read all six phase documents, the normative schema, reference data and existing module contracts before implementation.
- [x] Implement the Phase 15 v15 IndexedDB migration and strictly validated browser-local stores.
- [x] Deliver the 17 dashboard, progress, analytics, methodology, settings and privacy routes.
- [x] Add backups, validated restore, eight progress CSV datasets, selected-photo ZIP export, audit and deletion recovery.
- [x] Add formula/source metadata, complete-day review and date-window filtering without transforming source-module records.
- [x] Pass strict TypeScript, lint, unit, browser, responsive and WCAG 2.2 AA checks; content validation and production build.
- [x] Write the companion decisions, external source notes, completion checklist and Phase 16 handoff.
- [x] Push the Phase 15 checkpoint and create its completion tag before reading Phase 16.

Verification details and next-phase constraints are recorded in `phase-15.md`.
