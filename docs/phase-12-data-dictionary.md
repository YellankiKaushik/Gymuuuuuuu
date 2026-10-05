# Phase 12 data dictionary

Backup format: `schemaVersion: 1.0.0`, `moduleId: phase_12_recovery_sleep_mobility`, ISO export timestamp. Unknown root fields and unsupported versions are rejected. Original definitions remain in `schema.generated.ts`; strict companion behavior is in `schema.ts`.

Sleep logs: immutable ID; local wake date; IANA timezone; manual morning/later recall or consumer-device source; explicit offset instants; optional entered latency/awake minutes and awakening count; optional naps with their own IDs and instants; quality/restedness/sleepiness 1–5; context tags and notes; status and created/updated timestamps. Device duration is an optional separately labelled field. Calculated duration/efficiency fields are validated against their source fields and include version, warnings and validity. Unknown is null; entered zero is zero.

Check-ins: immutable ID, local date/timezone, separate optional 1–5 ratings, explicit canonical region/side/severity 0–10, optional pain severity with its flag, illness/sleep concern categories, sleep-log ID and immutable completed workout IDs. Higher fatigue/stress ratings mean more reported fatigue/stress; their direction is not combined with energy or readiness. No derived composite field exists.

Routine identities: ID, current immutable version ID, title, active/archive state and timestamps. Versions: identity ID, consecutive version number, context, user-entered steps/doses/cues/stop signals, optional estimated duration, notes, creation time and revision reason. Step IDs and order are stable within a version; reviewed published exercise IDs are the only allowed exercise references. Seconds and metres are canonical; repetitions, breaths and ramp-up sets use whole counts.

Sessions: immutable ID and exact routine/version snapshot; UTC-normalized start instant, end instant/timezone; explicit running/paused/completed/abandoned state, current index/side, persisted active and step seconds, resume timestamp, performed/skipped step IDs and completed side records. Feedback is difficulty 1–5, discomfort concern and notes. A newer current routine never rewrites a historical snapshot.

Settings: a single typed preference record containing optional user goal minutes, history window, timezone and tracking switch. Audit records contain change action/entity IDs/timestamps. Deletion records have their own ID, entity type/ID, deletion timestamp and validated undo snapshot. Disposable summaries carry source record IDs/updated timestamps, never become a second source of truth, and are excluded from backup.

The module adapter owns this schema and database only. Global restore must validate every participant before writes and preserve module conflict rules. Progress consumers must retain missing values, source labels, timezone separation and distinct reported dimensions.
