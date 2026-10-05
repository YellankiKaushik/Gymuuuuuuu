# Phase 17 implementation plan

## Source review and inventory

- [x] Read the Phase 17 DOCX, schema JSON, reference data, quick reference, and Lovable prompt package. The source folder has no Phase 17 Markdown specification; the DOCX and machine-readable files are authoritative.
- [x] Inspect every `indexedDB.open`, object-store creation, and Web Storage access in the application, along with module backup adapters and existing database migrations.
- [x] Compare the Phase 17 reference registry with the actual application storage. The reference expects 92 registered stores across ten modules, but deployed code has separate databases for diet planning, cardio, recovery, supplements, recipes, and the generic local-record adapter; Phase 15 also has two additional stores (`heightMeasurements`, `metricCalculationReceipts`) and the generic `records` store has no registry entry. Preserve this deployed layout rather than rewriting user databases.
- [x] Identify browser-only values: `fitness-os:preferences:v1` (theme and units), `fitness-os:nutrient-framework:v1` (display preference), `fitness-os:active-workout:v1` (operational pointer), and `fitness-os-cardio-owner` (tab token). Unknown storage keys are not exported. Session storage and operational pointers are excluded.
- [x] Review IndexedDB structured-clone data and existing binary storage. Progress photo blobs are kept out of default portable exports and may be included only in an explicitly selected full-media backup.

## Implementation sequence

1. [x] Add a version-17 migration for six Phase 17 control stores while preserving all pre-existing stores.
2. [x] Build a browser-only inventory and canonical type-tagged serialization with SHA-256 record/store/payload integrity; runtime-discovered stores outside the reference registry are carried opaquely in their owning database.
3. [x] Implement portable and selected-database JSON backup, gzip, explicit full-media inclusion and integrity manifests, confirmed file-picker receipts, approximate storage estimates and user-triggered persistent-storage requests.
4. [x] Implement zero-write restore preview, envelope/hash/key-path/duplicate-primary-key validation, keep-existing and replace, durable before-image snapshots, recoverable multi-database journaling, resume and rollback. Import-as-copy is disabled until every store has a verified ID and relationship remapper.
5. [x] Add spreadsheet-safe and warned raw CSV, storage inventory/health/history/reset routes, typed reset confirmation, responsive keyboard-accessible UI and a cross-tab restore lock.
6. [x] Add unit and browser tests, update this phase record and push the phase checkpoint before reading Phase 18.

## Known constraints and decisions to record

- The reference registry expects 92 logical stores across ten modules. Deployed code has separate databases for diet planning, cardio, recovery, supplements and recipes, plus `fitness-os-local.records`; Phase 15 also has `heightMeasurements` and `metricCalculationReceipts`. The application preserves these actual database/store names instead of rewriting user databases.
- Unknown stores are surfaced and carried through backup/restore without interpreting their schema. Unknown local/session keys are listed but never included in backup.
- The spec makes encryption optional. Password-encrypted backups are deferred to avoid claiming a cryptographic profile before the complete media and multi-database envelope is verified; the interface must state that the available integrity hash detects corruption but does not encrypt or authenticate a backup.
- Multi-database restore cannot be one atomic browser transaction. A persistent journal records the active operation and blocked state; recovery requires an explicit resume/rollback choice.
- Storage estimates are browser estimates and are labelled approximate. A successful persistent-storage request is reported exactly as granted or denied.

## Checkpoint evidence and limitations

- The browser discovers seven app-owned physical database names. Unknown stores in an app-owned database are preserved in backup and restore; unknown database names are reported and left untouched.
- Unit coverage: **190 tests in 33 files**, including future-format rejection, tampered-payload detection, preview writes=0, keep-existing conflicts, default binary exclusion/full-media hashes, and CSV quoting/formula safety. The 25 supplied vector IDs are checked in; vectors requiring encrypted archives, unsupported browser capabilities, owner-specific relationship remapping, or injected multi-database quota failure remain limitations rather than fabricated passes.
- Full browser regression: **51/51 passed**, including data-management desktop/mobile routes, axe checks, reset confirmation and existing module flows.
- `npm run check` passes strict typecheck, ESLint, all unit tests, content validation and production build. The production bundler reports existing upstream `use client` directive warnings.
- Restore preview validates the archive schema, format version, payload/store/record hashes, known database/store presence, primary keys and duplicate keys. It does not yet invoke every owning feature's Zod row validator during the cross-module restore; existing module schemas remain authoritative and this limitation is recorded.
- Full-media values are stored inline in the JSON envelope with per-asset byte-length/hash entries instead of the reference's preferred ZIP container. The packaging deviation is explained in `docs/decisions/phase-17-local-backup-and-restore.md`. Password encryption remains deferred as the schema marks it optional.
- File System Access API receipts are recorded only after the selected file writer closes successfully. Fallback browser downloads report that they started and do not claim a confirmed receipt.

## Checkpoint checklist

- [x] Unit/integration tests cover supported Phase 17 integrity behaviors listed above.
- [x] Strict typecheck, lint, foundation tests, production build and Phase 17 browser checks pass.
- [x] Desktop and narrow mobile layouts and accessibility checks pass.
- [x] Final inventory, limitations, tests, commit and handoff are recorded here.

## Handoff

After this checkpoint is pushed, read all Phase 18 documents before implementation. Phase 17 adds no accounts, cloud storage, telemetry or public fitness facts. Preserve its encryption deferral, full-media packaging note and import-as-copy limitation when Phase 18 adds deployment and release checks.
