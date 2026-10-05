# Phase 15 schema companion decisions

The supplied Phase 15 JSON schema is the normative base. The following narrow companion fields/stores make explicit behaviors from the main specification representable while preserving existing data.

1. The shared `fitness-os` IndexedDB database advances to version 15 as specified. Upgrade versions 11–14 are reserved and create no stores; v15 adds the Phase 15 stores only.
2. Add an `heightMeasurements` private store for explicit measured/entered height in canonical centimeters. The supplied record schema has no height entity, but the BMI section requires an explicit, dated height measurement and forbids inferred height. Height is never inferred from age, photos, program or imported weight.
3. Add a private `metricCalculationReceipts` store so a prior result's algorithm version, range, included/excluded record IDs and reasons, sample counts, flags and result remain inspectable after rebuildable cache invalidation. Cache entries remain disposable and are excluded from backup; receipts are personal records included in JSON backup.
4. Deleted-record entries carry a private recoverable snapshot and expiry alongside the normative entity type, entity ID and deletion timestamp. This is required for the specified undo window; snapshots remain local and backed up.
5. Metric definitions have strict method-version and source-dependency fields. Values not supported by the Phase 14 input contract (such as scheduled supplement adherence) display as unavailable rather than being inferred from free-text intake notes.
6. No source registry entry marked draft is presented as reviewed content. Source/review metadata remains mandatory before a knowledge claim can be published.

These extensions are private app data contracts and do not change scientific claims or public reference facts.
