# Phase 12 storage and backup

Owner: `fitness-os-recovery-sleep-mobility`. Database version 2; JSON format 1.0.0 and module ID `phase_12_recovery_sleep_mobility`. The ten specification-named stores are created as needed. The version 1 migration adds indexes without clearing source records. Other module databases are not touched.

JSON includes sleep logs, check-ins, identities, immutable routine versions, session snapshots/player state, typed settings, audit events and deletion snapshots. Derived summaries are disposable and rebuilt exactly from source records inside successful write/restore transactions. Import-conflict preview state is not a source of personal metrics.

Validate a backup's schema, chronology, cached arithmetic, unique IDs, version lineage and session snapshots before writing. Limit file imports to 20 MB. Preview collection counts and matching IDs, select keep-existing/import-copy/replace-local, then explicitly confirm. Keep-existing retains matching records and rejects incompatible merged graphs. Import-copy remaps identifier fields and step relationships, including deletion snapshots, without rewriting free text. External workout IDs remain contextual links and may be absent on another browser.

All writes and cache rebuilds share one transaction. Synchronous errors explicitly abort it; queued clears cannot commit after a failure. Updated-time checks reject stale edits. Cross-tab signals carry only a change notification, not record payloads.

Unreadable entries are isolated from visible views; unindexed malformed records are counted without loading every diary entry at startup. Export raw recovery before repair. A confirmed replacement from a validated backup can repair a corrupt database without first parsing the corrupt records. No automatic cleanup deletes them.

Individual deletion retains a snapshot for undo. The settings clear action requires `DELETE RECOVERY DATA` and removes this module's stores only. Sleep, check-in, soreness, session and routine CSV exports keep missing fields blank and escape spreadsheet formula prefixes. Browser persistent storage is optional and does not replace backups.

`recoveryBackupAdapter` and `recoveryReadModels` are the contracts for later aggregate backup and progress phases. Consumers must preserve device/source labels, separate dimensions, missing states and frozen version references; they must not infer diagnosis or causality.
