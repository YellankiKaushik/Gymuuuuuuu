# Workout backup and export

Canonical format `fitness-os-workout-backup`, schema version 1. Contains preferences, program tracking states, custom labels and all sessions, including active, paused, abandoned and deleted records. Timers and rebuildable PR caches are excluded. Phase 05 selections have their own ownership and will be included by the later global backup adapter.

Restore parses locally, validates strict normative and semantic schemas, rejects future versions/duplicate record IDs/missing custom references/multiple active logs, previews counts/date range/conflicts and requires an explicit import choice. Merge keeps or replaces conflicting records without merging nested sets. Session conflicts may instead become new copies with fresh session/exercise/set IDs. Copying conflicting custom labels or tracking states is rejected; choose keep or replace for those.

Replace creates a downloadable safety snapshot before applying. The transaction rereads canonical stores and aborts if they changed after preview. Changes apply atomically across canonical stores, timers, derived caches and metadata. Replaced session revisions advance so stale editors cannot overwrite imported records. Record contents that were skipped remain unchanged. The file remains on the user's device; no upload occurs. Last-backup metadata changes only after download creation.

CSV files are `workout_sessions.csv`, `workout_sets.csv` and `custom_exercises.csv`. Headers are stable field names matching the exported documents. Set CSV includes canonical grams/meters/seconds, scope, performance mode and separate effort fields. Missing values remain empty. UTF-8 text is quoted and formula-like user text is prefixed for spreadsheet safety. JSON is the restore format; CSV import is outside this phase.

The raw recovery copy preserves invalid session/custom documents for external repair. It is explicitly a recovery artifact and cannot be imported as a normal validated backup without repair. Backup files contain personal records; keep them private.
