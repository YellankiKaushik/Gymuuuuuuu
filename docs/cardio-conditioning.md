# Cardio and conditioning module

Phase 13 implements optional device-local cardio tracking and method-labelled arithmetic. Its public release collections contain zero published entities: all 202 supplied identities remain drafts. Activity names identify a user's category; their supplied impact/beginner tags are not released as guidance.

## Arithmetic contracts

Canonical distance is metres and time is seconds. A mile is exactly 1609.344 m. Pace and speed use actual elapsed time and measured distance; missing or nonpositive required values do not generate a result. Timestamp timers preserve fractional seconds in companion fields. Normative integer seconds are their floor projection.

Tanaka (`tanaka-2001-v1`) is an optional adult estimate: 208 − 0.7 × age. The engineering input range is 18–100; that range is a software boundary, not source validation for every age or medical context. The result retains its estimate label and source. HR reserve and percent-of-maximum calculations accept user-selected fractions, never guessed training zones. Missing required inputs produce unavailable results; affected medication/medical context disables targeting.

Adult guideline equivalents (`adult-aerobic-equivalent-1`) are moderate minutes plus twice vigorous minutes. Actual segment observations take precedence; whole-session reports fill otherwise unspecified segments and remaining time without double counting. The pinned `cdc-talk-effort-examples-1` classification uses CDC talk-test states, then its generic effort examples (5–6 moderate, 7–8 vigorous). Other effort numbers and ambiguous talk states remain unclassified rather than extrapolating a new rule. No calorie, fatigue, fitness-age or VO₂max model exists, and no diet or nutrition records are adjusted.

## Local ownership

`fitness-os-cardio-conditioning` v1 has ten stores: cardioSessions, customCardioPlanIdentities, customCardioPlanVersions, customConditioningRoutineIdentities, customConditioningRoutineVersions, cardioSettings, cardioAuditEvents, cardioDeletedRecords, cardioImportConflicts and cardioDerivedSummaries.

Sessions use a revision number and short owner lease. A small sessionStorage tab-control token is technical state, not a personal record. Cross-tab messages contain only a changed flag. UI controls wait for hydration; personal reads occur in browser callbacks. Page metadata is static and private routes carry noindex/nofollow with no canonical personal URLs.

Immutable identity/version pairs keep current local plans and routines. The user can select a current local plan, start date and explicit plan week. The overview's next unrecorded slot is schedule context, with a warning about the bounded history window, not a training recommendation. Sessions embed full version snapshots and their intensity input/source contracts. A completed record freezes its original state; corrections append previous records and reasons, with validation preventing loss of earlier edits. Soft deletion moves a snapshot to deleted records, and explicit undo restores it. Finishing early leaves unplayed segments skipped, without invented actual distance or HR.

Laps record cumulative timestamp elapsed time and optional manually measured lap distance. They do not infer GPS or route data. Lap observations appear as labelled overlapping rows in segment CSV; do not add those rows to segment durations. Progress groups use activity, HR source, device/machine label and environment; unknown device identity remains explicitly unverified.

## Backup and recovery

The strict JSON format is `1.0.0`, module ID `phase_13_cardio_conditioning`, companion version 1. It includes all personal truth and excludes rebuildable summary markers. The original schema's base fields are preserved; [the companion decision](decisions/phase-13-schema-companions.md) explains additions.

Files are limited to 20 MB and validated before writes. The user previews counts and confirms keep, copy or replace. Keep retains matching IDs and rejects conflicting version graphs. Copy remaps owned identities and references, retaining external workout IDs and repository source IDs. Replace can repair a corrupt current database with a valid backup. All mutations, audits and cache invalidation share one transaction; synchronous queued-write failures explicitly abort. Raw export preserves unsupported stored rows without interpreting them as valid facts.

Seven CSV datasets cover sessions, segments, HR observations, interval completion, weekly summaries, custom plans and custom routines. Null values become blank cells; formula-like strings are escaped. CSV is for analysis, JSON for restore. Destructive clearing requires the exact phrase `DELETE CARDIO DATA` and touches this module only.

## Boundaries

Strength scheduling and completed workouts from Phases 05/06, and pain/illness context from Phase 12, are loaded read-only on explicit request. The user chooses a concurrent priority. No automatic hard-session recommendation, universal order, rehabilitation or medical clearance is produced. Urgent stop concerns pause activity and disable continuation; the user can end and save the record.

`cardioBackupAdapter` and `cardioReadModels` are exported for subsequent local-data phases. Later global backups must include this database alongside fitness-os, fitness-os-local, fitness-os-diet-planning, fitness-os-recipes-meal-plans and fitness-os-recovery-sleep-mobility.
