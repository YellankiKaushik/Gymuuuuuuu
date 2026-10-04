# Workout storage

Database `fitness-os`, version 6, contains the eight prescribed stores and six session indexes. Initialization migrations 1–6 are guarded by the previous version. Fixtures exercise upgrades from versions 1–5 while preserving an unknown metadata field. Session/custom/preferences/tracking/backup record versions currently support version 1 only; future versions fail closed.

The Phase 05 `fitness-os-local` database remains intact. The tracker reads program selections through its existing adapter and maps legacy unprefixed instance IDs to stable tracker references. New Phase 05 selections use `program_instance_` IDs. No older program selection is deleted during tracker initialization.

Session creation and the active pointer share a transaction. Session mutations check expected revision and editor ownership in the same transaction, then increment revision. Completing a program session updates its separate tracking record atomically. A small localStorage pointer provides the shell's resume link; IndexedDB remains authoritative. It may be absent when localStorage is blocked without affecting records.

An IDB editor lease lasts 30 seconds and renews every five seconds while the editor is active. Another tab is read-only while the lease is valid. Explicit takeover loads the latest saved revision. Revision checks prevent stale overwrites even without BroadcastChannel. Browser lifecycle throttling can expire leases; a displaced writer cannot bypass the transaction checks.

History first obtains exercise/status indexed IDs when needed, then traverses the timestamp index, deserializing only matching page records. The performance fixture contains 5,000 sessions and 100,000 set rows. No full history query occurs on each numeric keystroke. Corrupt records are preserved and surfaced; raw recovery export is available, rather than silently deleting or weakening validation.

Storage quota/persistence estimates are approximate browser reports. Persistent storage is requested only by the Protect local data button. A denial leaves logging and backup available. IndexedDB failures leave the visible draft available for retry/export. Browser eviction, deliberate clearing or discarding unsaved edits can still remove data; backups are essential.
