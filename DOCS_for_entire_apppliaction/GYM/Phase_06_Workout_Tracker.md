# Phase 06 - Workout Tracker

**Project:** Fitness Knowledge and Tracking Application  
**Working product name:** Fitness OS  
**Document type:** Lovable implementation specification  
**Phase:** 06 of 20  
**Version:** 1.0  
**Date:** 5 August 2026  
**Status:** Ready for Lovable Plan mode

---

## Document purpose

This document tells Lovable exactly how to build the Workout Tracker module on top of the completed Phase 00 foundation, Phase 01 application shell, Phase 02 Muscle and Functional Anatomy Library, Phase 03 Exercise Encyclopedia, Phase 04 Workout Science module and Phase 05 Workout Programs module.

Phase 06 is the application's device-local training log. It converts a reviewed Phase 05 program session, a repeated historical session or an ad hoc exercise list into an active workout workspace. It records what the user actually completed without mutating the canonical exercise, science or program content.

The tracker is optional. All knowledge modules must remain useful without entering personal data. No account, cloud profile, backend, Supabase, Lovable Cloud database or remote personal-data persistence is permitted.

The module has eight responsibilities:

1. Start a workout from a current program, a past session or an ad hoc exercise list.
2. Record exercises, sets, repetitions, load, duration, distance, effort, rest and notes.
3. Autosave the active session to IndexedDB and recover it after refresh or accidental closure.
4. Provide a timestamp-based rest timer that remains accurate when the tab is hidden.
5. Preserve canonical Phase 03 and Phase 05 references while taking historical snapshots needed for stable records.
6. Show completed workout history, exercise history and deterministic personal-record indicators.
7. Provide edit, delete, JSON backup/restore and CSV export controls before the tracker is considered production-ready.
8. Establish clean handoff contracts for later progress analytics without building Phase 11 charts or recommendations.

Phase 06 must not behave like an AI coach. It must not diagnose pain, prescribe rehabilitation, estimate calories burned, generate workout plans, silently change program prescriptions, infer recovery, score technique, or upload personal records to a server.

## How to use this document in Lovable

1. Open the existing project only after Phases 00-05 pass their acceptance criteria.
2. Keep the Phase 00 Project Knowledge active.
3. Attach the Phase 00-06 Markdown specifications.
4. Attach the Phase 03 exercise schema and taxonomy, Phase 05 workout-program schema and taxonomy, `Phase_06_Workout_Tracker_Data_Schema.json` and `Phase_06_Workout_Tracker_Reference_Data.json`.
5. Attach `Phase_06_Lovable_Prompt_Package.txt`.
6. Run the Phase 06 Plan-mode prompt before any code changes.
7. Reject any plan that adds authentication, a backend, remote sync, AI recommendations, calorie-burn estimates, fabricated exercise data, mutable canonical programs, or unreliable timer logic.
8. Require Lovable to identify exact IndexedDB stores, migrations, transactions, routes, local backup contracts, validation rules and tests.
9. Approve the plan only after every acceptance criterion is mapped.
10. Run the Agent-mode prompt, then the verification prompt.
11. Correct every Phase 06 defect before Phase 07 begins.
12. Create the GitHub checkpoint `phase-06-workout-tracker-complete`.

---

## 1. Phase objective

Build a fast, reliable, mobile-first and fully local Workout Tracker containing:

- A workout start screen.
- Current-program session launch.
- Ad hoc workout creation.
- Repeat-from-history workflow.
- Active workout focus mode.
- Exercise and set logging.
- Warm-up, working, back-off, drop, AMRAP, technique, timed and distance set types.
- Load, repetitions, duration, distance, assistance, RPE and RIR recording.
- Previous-performance context.
- Timestamp-based rest timer.
- Pause, resume, finish and abandon workflows.
- Completed-session summary.
- Workout history and detail pages.
- Exercise-specific history.
- Deterministic personal-record detection.
- Editing and deletion with recalculation.
- Local-only settings.
- Workout JSON backup/restore.
- Workout CSV export.
- IndexedDB schema migrations and corruption recovery.
- Cross-tab active-session protection.
- Clear device-local privacy and backup warnings.

The phase is complete only when a workout can be started, logged, recovered after refresh, completed, reviewed, edited, exported, restored and deleted without an account or remote database.

## 2. Dependencies and assumptions

### 2.1 Required outputs from earlier phases

The project must already contain:

- Strict TypeScript and the responsive Phase 01 shell.
- Light, dark and system themes.
- Shared buttons, cards, dialogs, drawers, tables, badges, toasts, empty states, error boundaries and form controls.
- Phase 03 canonical exercise IDs, display names, movement classifications and publication status.
- Phase 05 canonical program IDs, versions, session IDs, prescription IDs, progression IDs and local program-instance contract.
- Repository-owned content loading and validation.
- No authentication, backend, user profile or cloud personal-data store.

Lovable may make a minimal prerequisite repair only when it documents the defect, limits the file impact and does not redesign an earlier module.

### 2.2 Cross-phase ownership

| Concept | Owning phase | Phase 06 rule |
| --- | --- | --- |
| Muscle identity and anatomy | Phase 02 | Reference only through the chosen Phase 03 exercise. |
| Exercise identity and technique | Phase 03 | Reference canonical IDs; never rewrite technique or claims in the tracker. |
| Training principles | Phase 04 | Link to concepts where needed; do not restate evidence articles. |
| Canonical program and prescription | Phase 05 | Snapshot for history; never mutate the repository record. |
| Actual completed workout data | Phase 06 | This phase is the source of truth. |
| Food and nutrition logging | Later phases | Do not estimate calories or connect meal data here. |
| Recovery and sleep scoring | Later phases | Do not produce readiness scores. |
| Body-progress analytics | Phase 11 | Provide clean records and derived helpers only; do not build advanced dashboards. |
| Global backup and export centre | Phase 12 | Build workout-specific backup now and register an adapter for future global backup. |

## 3. Required deliverables

Lovable must produce:

1. `/workout` workout start and resume route.
2. `/workout/session/$sessionId` active or paused workout workspace.
3. `/workout/summary/$sessionId` post-completion summary.
4. `/workout/history` completed and abandoned workout history.
5. `/workout/history/$sessionId` historical session detail.
6. `/workout/exercises/$exerciseId/history` canonical exercise history.
7. `/workout/settings` tracker settings, storage, backup and export controls.
8. Start-from-program, ad hoc and repeat-session workflows.
9. Exercise picker using published Phase 03 records.
10. Local label-only custom exercises for logging gaps without publishing anatomy claims.
11. Set rows supporting all Phase 06 performance modes.
12. Previous-performance display.
13. Rest timer and elapsed-workout timer.
14. Autosave, refresh recovery and storage-failure handling.
15. History editing and deletion.
16. Deterministic personal-record derivation and rebuild.
17. Workout JSON backup/restore and flattened CSV exports.
18. IndexedDB repositories, schema migrations and transactional writes.
19. Cross-tab active-session detection.
20. Responsive and WCAG 2.2 AA behavior.
21. Automated domain, migration, UI, history, export/import and accessibility tests.
22. `docs/workout-tracker.md`, `docs/local-data/workout-storage.md`, `docs/local-data/workout-backup.md` and `docs/phases/phase-06.md`.
23. A Phase 11 analytics handoff contract.

## 4. Scope boundaries

### 4.1 Build in this phase

- Optional local workout logging.
- Program-session snapshots and ad hoc workouts.
- Set-level performance entry.
- Previous performance and basic deterministic PR indicators.
- Workout history, editing and deletion.
- Rest and elapsed timers.
- Workout-specific backup, restore and CSV export.
- Local tracker settings.
- Local custom exercise labels.
- Storage status and backup awareness.

### 4.2 Do not build in this phase

- Signup, login, authentication, user profiles or cloud sync.
- Supabase, Firebase, Lovable Cloud database or server persistence.
- AI coaching, adaptive programming or free-text plan generation.
- Automatic prescription changes based on performance.
- Injury diagnosis, rehabilitation advice or pain-specific recommendations.
- Camera-based technique analysis.
- Calories-burned estimation.
- Body-fat, recovery, fatigue or readiness scores.
- Nutrition logging.
- Social sharing, leaderboards, trainer access or payments.
- Wearable integrations.
- Advanced trend charts, correlations or forecasts.
- Notifications requiring a server.
- Silent import merge or destructive overwrite.

## 5. Product principles

### 5.1 Logging must be faster than writing in a notebook

The active workout screen must minimize taps. Previous values, copy controls, numeric keyboards, clear completed states and responsive set rows are mandatory.

### 5.2 Canonical content and personal records are different systems

A canonical Phase 05 prescription answers “what the reviewed program says.” A Phase 06 record answers “what the user actually did.” The tracker must preserve both without changing either retrospectively.

### 5.3 History must remain readable after content updates

Every logged exercise stores a display-name snapshot and every program workout stores program and session version snapshots. The current canonical pages remain linked when the IDs still exist.

### 5.4 Derived values are rebuildable

Personal records, summaries and future analytics must be calculated from canonical workout-session records. Do not make a derived cache the only source of truth.

### 5.5 Local data is vulnerable without backups

The interface must state that browser data can be cleared or evicted. Workout JSON backup and restore are mandatory in this phase.

## 6. Canonical routes

| Route | Purpose |
| --- | --- |
| `/workout` | Start, resume or inspect the next current-program session. |
| `/workout/session/$sessionId` | Focused active or paused workout workspace. |
| `/workout/summary/$sessionId` | Completion summary and derived records. |
| `/workout/history` | Searchable workout history. |
| `/workout/history/$sessionId` | Read or edit one past session. |
| `/workout/exercises/$exerciseId/history` | Exercise-specific local performance history. |
| `/workout/settings` | Units, effort mode, timer, storage, backup and export. |

Invalid, deleted or corrupt session IDs must show a recoverable state rather than crash the application.

## 7. Navigation integration

- The Train navigation group must show `Programs`, `Workout` and `Workout history`.
- `Workout` opens `/workout`.
- A visible “Resume workout” indicator appears when an active session exists.
- During active focus mode, the mobile bottom navigation may be hidden as permitted by Phase 01.
- The active screen must retain an accessible exit control and browser-back protection only while unsaved changes exist.
- Knowledge navigation remains accessible after pausing or finishing the workout.

## 8. Workout entry routes and start options

The `/workout` route must present these options in priority order:

1. Resume active workout, when one exists.
2. Start the next session from the current Phase 05 program.
3. Choose another session from the current program.
4. Repeat a previous workout.
5. Start an ad hoc workout.

Do not display fabricated “today’s workout.” The current program schedule may suggest a mapped session, but the user chooses whether to start it.

## 9. Starting a current-program session

When a user starts a Phase 05 session:

1. Read the active `LocalProgramInstance`.
2. Resolve the canonical program version and canonical session.
3. Apply the locally saved reviewed substitutions.
4. Create a new workout-session document.
5. Snapshot the program ID, program version, canonical session ID and session name.
6. Snapshot every prescription required for historical readability.
7. Create planned set rows based on the reviewed prescription.
8. Do not copy full Phase 03 technique content into the log.
9. Save the new active session transactionally before navigating into focus mode.

If the canonical program or exercise cannot be resolved, show the exact missing reference and offer a safe ad hoc copy. Do not fabricate missing prescriptions.

## 10. Ad hoc workout creation

The ad hoc flow must support:

- Workout title, defaulting to a neutral date-based label.
- Exercise search over published Phase 03 records.
- Adding local custom exercise labels.
- Reordering exercises.
- Choosing a performance mode when the canonical record does not define one.
- Choosing the correct load scope.
- Adding initial planned set rows.
- Starting immediately after the draft is transactionally saved.

A local custom exercise may store only:

- Display name.
- Performance mode.
- Load scope.
- Optional personal note.

It must not store fabricated anatomy, technique, safety or scientific claims.

## 11. Repeat a previous workout

“Repeat workout” creates a new active session with:

- A new session ID.
- `source: repeat`.
- Exercise order copied from the selected history record.
- Set types and planned targets copied.
- Actual loads, repetitions, duration and effort shown as previous-performance context, not automatically marked complete.
- Historical program references retained when applicable.

The old session remains immutable until the user explicitly edits it from history.

## 12. Active workout focus mode

### 12.1 Header

The focused header must show:

- Workout title.
- Elapsed active duration.
- Saved state: Saving, Saved, or Save failed.
- Pause or resume.
- Finish workout.
- Overflow menu for rename, export current draft and abandon.

### 12.2 Main content

Show ordered exercise cards. Each card contains:

- Exercise name and canonical detail link.
- Program role or custom label.
- Planned target summary.
- Previous comparable performance.
- Set-entry rows.
- Add-set control.
- Exercise note.
- Reorder, replace or remove controls.
- Program-deviation indicator where applicable.

### 12.3 Focus-mode navigation

- Hide nonessential navigation chrome on narrow screens.
- Do not trap the user in focus mode.
- Preserve visible browser-compatible back behavior.
- Ask for confirmation only when abandoning or when a storage transaction is still pending.

## 13. Set-entry model

Every set contains:

- Stable local set ID.
- Display order.
- Set type.
- Planned target snapshot.
- Status: planned, completed or skipped.
- Performance record appropriate to the selected mode.
- Load scope.
- Optional RIR or RPE.
- Rest target and optional actual rest.
- Completion timestamp.
- Optional note.
- Created and updated timestamps.

A completed set requires valid performance data for its mode. A skipped set does not require performance data.

## 14. Supported performance modes

| Mode | Required fields | Typical use |
| --- | --- | --- |
| `load_reps` | Canonical load and repetitions | Barbell, dumbbell and machine exercises. |
| `bodyweight_reps` | Repetitions; optional added load | Push-ups, pull-ups and similar movements. |
| `reps_only` | Repetitions | Unloaded repetition work. |
| `duration` | Seconds | Planks, carries by time and isometrics. |
| `distance_duration` | Distance and seconds | Short conditioning or locomotion logs. |
| `load_duration` | Load and seconds | Loaded holds or timed carries. |
| `assisted_reps` | Assistance and repetitions | Assisted pull-up or dip machines. |

Dedicated cardio analytics belong to a later cardio phase. Phase 06 stores only the basic performance record needed for workout history.

## 15. Load and unit rules

### 15.1 Canonical storage

- Store external load and assistance as integer grams.
- Store distance in meters.
- Store duration in whole seconds.
- Convert only for display and input.
- Store the user's display-unit preference separately.

### 15.2 Load scope

The tracker must distinguish:

- Total external load.
- Per-hand load.
- Machine stack.
- Added load.
- Assistance.
- Bodyweight only.
- Not applicable.

Do not compare records across different load scopes. A 20 kg per-hand dumbbell record is not equivalent to 20 kg total external load.

### 15.3 Unit changes

Changing from kilograms to pounds or back must not rewrite stored values. It changes only display and input conversion.

## 16. Effort entry

The user may configure:

- No effort entry.
- RIR.
- RPE.

Rules:

- RIR range: 0-10.
- RPE range: 1-10.
- Do not silently convert RIR to RPE or the reverse.
- Program targets remain visible even if the user's logging preference is different.
- Effort entry is optional unless a later reviewed program explicitly requires it.

## 17. Set-row interaction

Desktop rows may use a compact grid. Mobile rows must reflow into touch-friendly cards.

Required controls:

- Set number and type.
- Load, reps, duration or distance inputs as appropriate.
- Effort input.
- Complete checkbox/button.
- Skip action.
- More menu for note, duplicate and delete.

Required accelerators:

- Copy previous set.
- Copy last comparable workout value.
- Add next set.
- Restore a just-deleted set through undo.

Do not use horizontal scrolling as the only mobile interaction pattern.

## 18. Previous-performance context

For each canonical or local custom exercise, show the most recent comparable completed set data using:

- Same exercise identity.
- Same performance mode.
- Same load scope.
- Non-deleted completed sessions.

The previous-performance panel must state its date. It must not label the previous value as a recommendation.

## 19. Exercise replacement and deviations

### 19.1 Program workouts

- Show reviewed Phase 05 substitutions first.
- A reviewed substitution preserves the prescription relationship.
- An arbitrary exercise may be added as a program deviation only after explicit confirmation.
- The original exercise ID and replacement reason remain in the session snapshot.
- Do not modify the canonical program or the saved Phase 05 substitution selection without a separate explicit action.

### 19.2 Ad hoc workouts

Any published Phase 03 exercise or local custom exercise may be used.

## 20. Rest timer

### 20.1 Timer model

The rest timer must be based on absolute timestamps:

- `startedAt`.
- `endsAt`.
- `durationSeconds`.
- Triggering session and set IDs.

The displayed remaining time is recalculated from `endsAt - currentTime`; it must not trust a decrementing counter that drifts in hidden tabs.

### 20.2 Required behavior

- Start manually from presets or automatically after set completion when enabled.
- Add or subtract time.
- Stop and restart.
- Persist the active timer locally.
- Recalculate when the page becomes visible.
- Show a visual completion state.
- Optional local beep after user interaction; no notification permission is required.
- Timer failure must never block set logging.

## 21. Elapsed workout timer

The workout timer must calculate active duration from:

- `startedAt`.
- Completed pause intervals or accumulated paused seconds.
- Current paused state.
- `completedAt` when finished.

It must survive refresh and device clock display changes as far as the stored timestamps allow. Negative or impossible derived durations must be rejected and surfaced as data errors.

## 22. Pause, resume, finish and abandon

### 22.1 Pause

Pausing:

- Sets status to `paused`.
- Records `pausedAt`.
- Stops active-duration accumulation.
- Does not discard set entries.

### 22.2 Resume

Resuming:

- Adds the pause duration to `accumulatedPausedSeconds`.
- Clears `pausedAt`.
- Sets status to `active`.

### 22.3 Finish

Before completion, show:

- Number of completed, skipped and incomplete sets.
- Empty exercises.
- Session note field.
- Optional session RPE.
- Optional discomfort marker.

The user may finish with incomplete sets after explicit confirmation. Finishing sets `completedAt` and produces the summary transactionally.

### 22.4 Abandon

Abandoning requires confirmation and records an abandoned session when at least one meaningful entry exists. A completely empty new draft may be deleted after confirmation.

## 23. Autosave and recovery

### 23.1 Save behavior

- Save after every meaningful mutation with a short debounce.
- Use a single-flight queue so writes cannot overtake each other.
- Increment session revision on committed changes.
- Display Saving, Saved or Save failed.
- Use IndexedDB transactions.
- Keep only one active session pointer.

### 23.2 Recovery behavior

After refresh, browser restart or route return:

- Detect the active or paused session.
- Validate it.
- Resume exactly where it was.
- Rebuild the UI from the committed record.
- Restore the active rest timer when valid.
- Show a recovery warning when the last write failed.

Do not depend on `unload` to save the session. A before-unload warning may be attached only while an actual write is pending.

## 24. Cross-tab protection

Use same-origin cross-tab communication to prevent two tabs from editing the same active workout simultaneously.

Required behavior:

- Broadcast when a session is opened for editing.
- Show a read-only conflict screen in the second tab.
- Allow the user to take over explicitly.
- Update the first tab when takeover occurs.
- Fall back to a storage-event or revision check when BroadcastChannel is unavailable.
- Never silently merge two active-session versions.

## 25. Workout completion summary

The summary route must show:

- Workout title and date.
- Active duration.
- Exercise count.
- Completed, skipped and incomplete set counts.
- Total repetitions where meaningful.
- External load volume only for comparable `load_reps` sets.
- Newly detected personal records.
- Program session reference.
- Session RPE and note.
- Edit, repeat and history actions.

Do not estimate calories burned. Do not describe volume as muscle growth or recovery quality.

## 26. Deterministic personal records

### 26.1 Supported records

Phase 06 may derive:

- Heaviest comparable completed working set.
- Most repetitions at the same canonical load.
- Most repetitions for reps-only or bodyweight exercise.
- Longest duration.
- Longest distance.
- Highest comparable set external volume (`load x reps`).

### 26.2 Comparison rules

- Exclude deleted, abandoned, skipped and planned sets.
- Exclude warm-up sets by default from load and volume records.
- Compare only the same exercise identity, performance mode and load scope.
- Compare canonical grams, meters and seconds, not rounded display values.
- Do not compare assistance values as if higher assistance were better.
- Do not infer a one-repetition maximum in this phase.
- Recalculate after history edits, deletion, restore and unit changes.

### 26.3 Storage rule

Personal-record records are derived. A cache may exist for performance, but it must be rebuildable from workout sessions.

## 27. Workout history catalogue

The `/workout/history` route must provide:

- Date range.
- Workout title search.
- Source filter: program, ad hoc, repeat or import.
- Program filter.
- Exercise filter.
- Status filter: completed or abandoned.
- Sort by newest or oldest.
- Pagination or virtualization.
- Empty state with “Start workout.”
- Export action.

History must not load the full database into memory when indexes can narrow the query.

## 28. Historical workout detail

The history detail route must show:

- Immutable ID and revision metadata in an advanced details disclosure.
- Program snapshot.
- Exercise order.
- Every set and actual performance.
- Notes and session RPE.
- Derived summary.
- Personal-record indicators.
- Edit, repeat, export and delete actions.

The canonical exercise link may show “Current article” while the historical display-name snapshot remains visible.

## 29. Editing completed history

Editing is allowed because the tracker is a personal log.

Rules:

- Load the current revision.
- Save through an atomic transaction.
- Update `updatedAt` and revision.
- Recalculate summaries and personal records.
- Preserve `completedAt` unless the user explicitly changes the session time.
- Warn when editing a record that originated from import.
- Never change the canonical program or exercise records.

## 30. Deletion and undo

- Delete requires explicit confirmation.
- Mark `deletedAt` first so an undo toast can restore it.
- Exclude soft-deleted sessions from normal history, previous-performance and PR calculations.
- Provide a permanent-delete action inside a local-data maintenance panel.
- A restore/import process must preserve deletion state unless the user chooses a conflict strategy.

## 31. Exercise-specific history

For a canonical exercise or local custom exercise, show:

- Last performed date.
- Recent sessions.
- Comparable set records.
- Current deterministic personal records.
- Load-scope and performance-mode filters.
- A table-first view.

Advanced charts, predictions and correlations belong to Phase 11.

## 32. Local custom exercise management

The workout settings route must allow the user to:

- Create a local custom exercise.
- Rename it.
- Change performance mode or load scope only with a warning about comparison discontinuity.
- Archive it.
- Restore it.
- View the sessions using it.

A custom exercise is a tracker label only. It must never appear in the public Exercise Encyclopedia.

## 33. Workout settings

Required settings:

- Weight display unit: kg or lb.
- Distance display unit: km or mi.
- Effort mode: none, RIR or RPE.
- Default rest duration.
- Auto-start rest timer.
- Timer sound: off or beep.
- Show previous performance.
- Confirm before discard.
- Week starts on Monday or Sunday.

Settings are local and may be included in workout backups.

## 34. IndexedDB architecture

Use IndexedDB for structured workout data. Use localStorage only for a small active-session pointer or tiny UI preferences when necessary.

Required object stores:

| Store | Purpose |
| --- | --- |
| `appMeta` | Database and migration metadata. |
| `workoutPreferences` | Singleton tracker settings. |
| `programInstances` | Existing Phase 05 program instances. |
| `programTrackingStates` | Sequence cursor and tracker-only state. |
| `customExercises` | Local custom labels. |
| `workoutSessions` | Active and historical session documents. |
| `activeTimers` | At most one active rest timer per session. |
| `derivedPersonalRecords` | Rebuildable cache only. |

The implementation may use a small maintained IndexedDB wrapper if it is already in the project. Do not introduce a remote database.

## 35. Transaction boundaries

Use atomic transactions for:

- Creating a session and active pointer.
- Saving a session revision.
- Completing a session and updating program tracking state.
- Soft deletion and PR-cache rebuild markers.
- Backup replace import.
- Database migration.

If a transaction fails, show a specific error and retain the in-memory draft until a retry or export is possible.

## 36. Schema versioning and migrations

- Every domain record includes a schema version where specified.
- Database upgrades are explicit and sequential.
- Each migration is idempotent or guarded by version.
- Migration failure must stop writes and show a recovery/export screen.
- Do not delete unknown fields silently during migration.
- Add migration fixture tests for every supported previous version.
- Keep a documented minimum supported backup version.

## 37. Storage status and persistence

The settings route should show when available:

- Approximate local storage usage.
- Approximate quota.
- Whether persistent storage has been granted.
- Last workout backup date.
- Number of sessions and custom exercises.

The app may request persistent storage only after the user explicitly chooses “Protect local data.” The browser may deny the request; denial must not break the tracker.

## 38. Workout JSON backup

### 38.1 Backup content

The workout backup must include:

- Backup format and schema version.
- Export timestamp and app version.
- Workout preferences.
- Program tracking states.
- Custom exercises.
- Active, paused, completed, abandoned and soft-deleted sessions.

Exclude rebuildable PR caches and active rest timers.

### 38.2 Export behavior

- Validate all records before export.
- Produce a human-identifiable filename with date and version.
- Never upload the file.
- Update local last-backup metadata only after download creation succeeds.

## 39. Workout JSON restore

Restore must be a staged process:

1. Read file locally.
2. Validate format and schema.
3. Migrate supported older versions in memory.
4. Show counts, date range and conflicts.
5. Offer merge or replace.
6. Create a safety backup before replace.
7. Apply in one transaction.
8. Rebuild indexes and personal records.
9. Report accepted, skipped and rejected records.

### 39.1 Merge conflicts

When the same record ID exists with different content, do not silently merge nested sets. Offer:

- Keep existing.
- Replace with imported.
- Import as a copy with a new ID.
- Skip all conflicts.

An identical record may be skipped automatically after content comparison.

## 40. CSV export

Provide at least:

1. `workout_sessions.csv` - one row per session.
2. `workout_sets.csv` - one row per set with session and exercise identifiers.
3. `custom_exercises.csv` - local custom definitions.

CSV rules:

- UTF-8 with a header row.
- ISO date-time values.
- Canonical units plus display-unit columns when useful.
- Stable column names documented in `docs/local-data/workout-backup.md`.
- Escape commas, quotes and line breaks correctly.
- No formulas beginning with `=`, `+`, `-` or `@` may be emitted unescaped from user-entered text.

CSV import is not required in Phase 06. JSON is the canonical restore format.

## 41. Validation rules

A workout session is invalid when:

- ID, status, source or timestamps are malformed.
- `completedAt` exists for a non-completed status without a documented migration case.
- `pausedAt` exists while status is not paused.
- `exerciseIds` does not match exercise references in the session.
- Exercise or set orders are duplicated.
- A canonical exercise ID does not exist in Phase 03 unless the record is historical and explicitly unresolved.
- A local custom ID does not exist.
- A completed set lacks mode-appropriate performance data.
- Load, reps, distance, duration or effort is negative or non-finite.
- RIR or RPE is outside its allowed range.
- Load scope conflicts with performance mode.
- Program snapshot references a missing Phase 05 program without preserving historical snapshot fields.
- Derived duration is negative.
- A soft-deleted session is presented as active.

Invalid active data must enter recovery mode rather than being silently discarded.

## 42. Safety and content boundaries

- The tracker records user-entered performance; it does not judge medical safety.
- Provide a neutral optional discomfort flag: none, noticed, stopped set or stopped session.
- Do not diagnose the cause.
- Link to existing exercise safety information when a canonical exercise is available.
- Do not encourage continuing through sharp or worsening pain.
- Do not estimate calories burned, injury risk or recovery time.

## 43. Empty, loading and error states

Required states:

- No current program.
- No workout history.
- No previous performance.
- No matching exercise.
- Active session recovered.
- Active session opened in another tab.
- Save failed.
- Storage blocked or unavailable.
- Quota estimate unavailable.
- Backup invalid.
- Backup from unsupported future version.
- Import conflicts.
- Canonical exercise removed or deprecated.
- Program version changed.
- Corrupt session.
- Deleted session.

Every state must provide a next action and avoid data loss.

## 44. Accessibility requirements

- One H1 per route.
- Active focus mode uses semantic landmarks.
- Exercise cards have clear headings.
- Set rows have associated labels, not placeholder-only inputs.
- Numeric inputs expose units.
- Completion controls announce status.
- Timer changes do not create constant screen-reader announcements; announce only meaningful milestones.
- Dialogs trap focus correctly and return focus on close.
- Reordering has keyboard-operable alternatives.
- Charts are not required in this phase.
- Tables have headers and mobile reflow alternatives.
- Color is not the only indicator of completed, skipped, failed or PR state.
- Touch targets meet Phase 01 requirements.
- Content reflows at 320 px and 400% zoom.
- Focus remains visible in light and dark themes.

## 45. Responsive behavior

### Mobile

- Focus mode prioritizes one exercise card at a time.
- Set entries use large numeric controls and native numeric keyboards.
- Sticky finish or add-set actions must not obscure inputs.
- Bottom navigation may be hidden only during active focus mode.

### Tablet

- Exercise list and current exercise may use a split layout when space allows.

### Desktop

- Show exercise navigation or session outline beside the active card.
- Avoid a spreadsheet-like wall of tiny inputs.

## 46. Performance requirements

- Active set interactions should feel immediate on a mid-range mobile device.
- Do not query the entire history database for every keystroke.
- Use IndexedDB indexes for history filters and exercise lookup.
- Support at least 5,000 sessions and 100,000 set rows without loading all records into memory.
- Lazy-load history detail.
- Virtualize or paginate long history lists.
- Keep the active session route bundle focused.
- No workout mutation should require a network request.

## 47. Privacy requirements

- Personal workout data stays in the browser unless the user downloads an export.
- No analytics event may include loads, reps, notes, workout names or session identifiers.
- Do not log personal workout records to console in production.
- Do not place workout data in URLs.
- Do not include workout data in error-reporting payloads.
- Clear local-data boundaries before destructive actions.

## 48. Technical architecture

Suggested responsibilities:

```text
src/
  features/workout-tracker/
    components/
    domain/
    repositories/
    routes/
    schemas/
    services/
    tests/
    types/
  lib/indexeddb/
  lib/local-backup/
  lib/unit-conversion/
  routes/workout/

docs/
  workout-tracker.md
  local-data/workout-storage.md
  local-data/workout-backup.md
  phases/phase-06.md
```

Use the existing framework and routing conventions. Do not migrate the app solely to match this suggested tree.

## 49. Domain services

Implement pure, testable functions for:

- Session creation from Phase 05 prescription.
- Ad hoc session creation.
- Repeat-session draft creation.
- Unit conversion.
- Session active-duration calculation.
- Rest-timer remaining-time calculation.
- Set validation.
- Session summary calculation.
- Previous-performance lookup criteria.
- Personal-record derivation.
- Program sequence update.
- Soft deletion and restoration.
- Backup validation and migration.
- CSV sanitization.

UI components must not duplicate this business logic.

## 50. Program-instance extension

Do not mutate the Phase 05 `LocalProgramInstance` shape with workout logs. Store tracker-only state separately:

```ts
interface ProgramTrackingState {
  programInstanceId: string;
  schemaVersion: number;
  sequenceCursor: number | null;
  completedSessionCount: number;
  lastStartedCanonicalSessionId: string | null;
  lastCompletedCanonicalSessionId: string | null;
  lastCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
```

Workout sessions reference the program instance and canonical session through a snapshot. Program completion progress is derived from logs plus this small state record.

## 51. Active session contract

```ts
interface WorkoutSession {
  id: string;
  schemaVersion: number;
  revision: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  source: 'program' | 'ad_hoc' | 'repeat' | 'import';
  title: string;
  localDate: string;
  timeZone: string;
  startedAt: string;
  pausedAt: string | null;
  completedAt: string | null;
  abandonedAt: string | null;
  accumulatedPausedSeconds: number;
  programRef: ProgramWorkoutRef | null;
  exerciseIds: string[];
  exercises: WorkoutExerciseLog[];
  sessionNote: string | null;
  sessionRpe: number | null;
  discomfortFlag: 'none' | 'noticed' | 'stopped_set' | 'stopped_session';
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
```

The attached JSON Schema is the machine-readable source of truth.

## 52. Phase 11 analytics handoff

Phase 11 must receive clean access to:

- Completed session date and active duration.
- Program and canonical session references.
- Exercise identity.
- Set type and status.
- Canonical load, repetitions, distance and duration.
- Load scope and performance mode.
- RIR or RPE.
- Session RPE.
- Notes and discomfort marker, with privacy caution.
- Soft-deletion state.

Phase 11 must derive charts from Phase 06 records and must not rewrite them.

## 53. Automated tests

### 53.1 Domain tests

- Unit conversion round trips.
- Set-mode validation.
- Load-scope comparison boundaries.
- Active-duration calculation across pauses.
- Rest timer after hidden-tab elapsed time.
- Session summary calculations.
- Previous-performance selection.
- PR derivation and exclusions.
- PR recalculation after edit or deletion.
- Program snapshot creation.
- Program sequence updates.
- CSV formula-injection sanitization.

### 53.2 Repository and migration tests

- Database initialization.
- Upgrade from each supported schema version.
- Transaction rollback.
- Corrupt-record quarantine.
- 5,000-session indexed queries.
- Active-session recovery.
- Cross-tab revision conflict.

### 53.3 UI and end-to-end tests

- Start from current program.
- Start ad hoc.
- Repeat history.
- Add, complete, skip, duplicate and delete a set.
- Pause, refresh and resume.
- Rest timer completion after tab hide.
- Finish with incomplete sets.
- Edit a completed session.
- Delete and undo.
- Backup, merge restore and replace restore.
- Unit preference change.
- Keyboard-only active workout.
- 320 px mobile layout.
- Dark mode.

## 54. Manual test matrix

| Area | Required checks |
| --- | --- |
| Mobile | Android Chrome and iOS Safari where available. |
| Desktop | Current Chrome, Edge, Firefox and Safari where available. |
| Storage | Normal, private/restricted and quota-failure simulations. |
| Navigation | Back, refresh, direct links and active-session recovery. |
| Multi-tab | Second-tab conflict and explicit takeover. |
| Import | Valid, old supported, future unsupported, corrupt and conflicting files. |
| Accessibility | Keyboard, focus, screen reader smoke test, 400% zoom and reduced motion. |

## 55. Acceptance criteria

### Architecture and scope

- [ ] No authentication, backend, Supabase, Firebase or cloud personal-data storage exists.
- [ ] No workout write requires a network request.
- [ ] Canonical Phase 03 and Phase 05 data remains immutable.
- [ ] Tracker data is stored in IndexedDB.
- [ ] localStorage is used only for tiny pointers or preferences.
- [ ] No AI coach, adaptive programming, calorie estimate or medical feature exists.

### Start and active workout

- [ ] `/workout` offers resume, current-program, repeat and ad hoc workflows.
- [ ] A program workout snapshots canonical IDs and version data.
- [ ] Ad hoc workouts support published and local custom exercises.
- [ ] Repeat workout creates a new draft and preserves the old record.
- [ ] Active focus mode works on mobile and desktop.
- [ ] Exercise reordering, replacement, add and remove actions work.
- [ ] Program deviations are explicit.

### Set logging

- [ ] All defined performance modes work.
- [ ] All defined set types work.
- [ ] Completed sets require valid mode-specific data.
- [ ] Load scope is explicit.
- [ ] RIR and RPE limits are enforced.
- [ ] Previous comparable performance is dated and non-prescriptive.
- [ ] Unit changes do not mutate canonical stored values.

### Timers and persistence

- [ ] Workout duration survives pause and refresh.
- [ ] Rest timer uses absolute timestamps.
- [ ] Rest timer recalculates after hidden-tab time.
- [ ] Autosave shows Saving, Saved and Save failed.
- [ ] A failed write retains recoverable in-memory data.
- [ ] Active session recovers after refresh.
- [ ] Cross-tab simultaneous editing is blocked or explicitly taken over.

### Completion and history

- [ ] Finish flow summarizes incomplete sets before completion.
- [ ] Summary excludes unsupported calorie claims.
- [ ] History supports search, filters and sorting.
- [ ] Historical detail preserves display snapshots.
- [ ] Completed sessions can be edited.
- [ ] Soft deletion, undo and permanent deletion work.
- [ ] Exercise history uses indexed queries.

### Personal records

- [ ] PR rules are deterministic and documented.
- [ ] Comparisons respect exercise, mode and load scope.
- [ ] Warm-ups and invalid sets are excluded as specified.
- [ ] Assistance is not treated as higher-is-better.
- [ ] PRs recalculate after edit, delete and restore.
- [ ] Derived PR caches are rebuildable.

### Backup and export

- [ ] Workout JSON backup validates before download.
- [ ] Restore validates and previews before writing.
- [ ] Merge conflicts are never silently combined.
- [ ] Replace creates a safety backup first.
- [ ] Import applies transactionally.
- [ ] CSV session, set and custom-exercise exports work.
- [ ] User-entered CSV text is formula-safe.
- [ ] Last-backup metadata updates only after successful export creation.

### Reliability, privacy and accessibility

- [ ] Versioned migrations have fixture tests.
- [ ] Storage blocked, quota and corrupt-data states are recoverable.
- [ ] Workout data is absent from URLs, analytics and production logs.
- [ ] Local-data limits are visible.
- [ ] 320 px reflow and 400% zoom pass.
- [ ] Keyboard and focus behavior pass.
- [ ] Screen-reader labels and timer announcements are usable.
- [ ] Type-check, lint, tests, accessibility checks and production build pass.
- [ ] GitHub checkpoint `phase-06-workout-tracker-complete` is created.

## 56. Lovable implementation sequence

1. Audit Phase 05 local program-instance storage and existing local-data helpers.
2. Finalize Phase 06 TypeScript types and JSON Schema mapping.
3. Implement IndexedDB database version and migrations.
4. Build repositories and pure domain services.
5. Build `/workout` start route.
6. Build program, repeat and ad hoc session creation.
7. Build active focus mode and set rows.
8. Build elapsed and rest timers.
9. Build autosave and cross-tab protection.
10. Build completion summary.
11. Build history and exercise-history routes.
12. Build PR derivation and cache rebuild.
13. Build settings and custom-exercise management.
14. Build workout backup, restore and CSV export.
15. Add error, recovery and storage states.
16. Run automated and manual tests.
17. Update documentation.
18. Create the GitHub checkpoint.

## 57. Do-not-modify guardrails

Lovable must not:

- Replace the Phase 01 shell or design system.
- Change Phase 02 muscle IDs.
- Change Phase 03 exercise IDs or content statuses.
- Change Phase 04 science topics.
- Rewrite Phase 05 canonical programs or progression rules.
- Store workout data inside canonical JSON files.
- Add a backend, cloud sync or authentication.
- Generate or infer exercise technique.
- Estimate calories, injury risk or recovery.
- Auto-advance program prescriptions without explicit user action.
- Hide import conflicts.
- Treat localStorage as the primary workout database.
- make derived PR caches authoritative.

## 58. Phase 07 handoff

Phase 07 will build the Food Encyclopedia. It must remain independent from workout logs. Phase 06 should expose only stable local-data adapter interfaces for future dashboard and global backup integration.

## 59. Completion definition

Phase 06 is complete when every acceptance criterion passes, a workout survives refresh and hidden-tab timing, history remains editable and exportable, all data stays local, canonical program and exercise records remain untouched, import is safe and transactional, no unsupported health claims exist, and the GitHub checkpoint `phase-06-workout-tracker-complete` is created.

## References

1. MDN Web Docs. IndexedDB API. https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
2. MDN Web Docs. Using IndexedDB. https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
3. MDN Web Docs. Broadcast Channel API. https://developer.mozilla.org/en-US/docs/Web/API/Broadcast_Channel_API
4. MDN Web Docs. Page Visibility API. https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
5. MDN Web Docs. StorageManager estimate. https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/estimate
6. MDN Web Docs. StorageManager persist. https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
7. MDN Web Docs. beforeunload event. https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeunload_event
