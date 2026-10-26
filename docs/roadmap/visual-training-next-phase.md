# Visual training: one proposed next phase

Status: **proposal only — implementation is not authorized by this review**. Read-only assessment on 2026-10-26 against `a946027b1f3a8754928c393228df696400b6b391`. Follow [AGENTS.md](../../AGENTS.md) and [DESIGN.md](../../DESIGN.md); preserve completed modules. The [Git reconciliation report](../reports/github-ref-reconciliation.md) records ref/PR/CI/production decisions. No application files or published content are changed here.

## Verified existing capabilities

| Published baseline        | Existing capability                                                                                                                         |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 70 muscle/anatomy records | Sourced text, regions/groups/entity types, location and cautions; approximate front/back navigation and ID-linked exercises                 |
| 32 exercises              | Written setup/execution/checkpoints, mistakes, programming/safety/source information; equipment, difficulty and movement filters            |
| 32 exercise diagrams      | Repository-owned reviewed-metadata SVGs; several are text cue panels/arrows, not full anatomical or technique demonstrations                |
| 32 workout-science topics | Source/evidence/limitation fields and exercise links; 25 already cite ACSM 2026 sources                                                     |
| 4 public programs         | Finder/comparison, eligibility/time/equipment/experience/goal matching, version-pinned selection, dates/weekdays and approved substitutions |
| Existing workout tracker  | Ad hoc/repeated/program workouts, local exercise labels, editable sets and exercise reordering, timers/history, JSON backup/restore and CSV |

The program selector customizes a published template. An ad hoc workout or repeated completed workout is not an arbitrary saved, editable multi-session personal plan. Extend the existing program/tracker model rather than duplicate its logging system.

## User-experience gaps

- Region selector is a navigation cue; no per-muscle visual location/action explanation or muscle-role legend links the abstract body into a guided lesson.
- Users navigate among muscle, exercise, science, program and tracker pages manually; no single bounded learn→choose→save-plan→start flow.
- Static cue SVGs, some predominantly text panels, do not show movement/position changes or provide structured start/middle/end guidance states.
- Role metadata is mostly context-dependent; primary/secondary activation graphics cannot truthfully be auto-filled. Cards show related names; qualifiers are chiefly in detail text.
- The existing program selector customizes a published template; ad hoc/repeat sessions are not a saved editable user-authored multi-session workout-plan builder.

## Educational content gaps and honest unknowns

- 0 muscle-specific media bindings; optional trainingRelevance and misconceptions are empty across current raw muscle records.
- Only 18 of 70 muscles have any published exercise role link. This is coverage, not permission to invent the other 52 relationships.
- 3 group records omit structure and 7 subdivision records omit joint-action arrays; not automatically defects and do not fill by inference.
- Some taxonomy equipment/movement categories have no published exercises. Keep honest empty states; do not publish backlog to fill filters.
- The Two-Day Foundation source template includes an intermediate-labelled one-arm row; do not describe every component or custom combination as universally beginner-safe.

Exact coverage: 18/70 muscles have a published exercise role link; equipment is represented in 8/29 taxonomy categories and movement patterns in 18/34. Difficulty counts are foundation 10, beginner 7, intermediate 11, advanced 3 and not-assessed 1. These are inventory counts, not suitability judgments.

All 32 exercise records carry muscle-role metadata: six exercises include primary roles, zero secondary roles, two stabilizer roles and 26 context-dependent roles. Categories overlap; they must not be summed as mutually exclusive classifications. Preserve source qualifiers and do not infer activation percentages, secondary roles, isolation claims or relationships for the other 52 muscles.

Where an individual muscle record lacks sourced action data, show that limitation explicitly. A location schematic can be accepted while its individual action remains unavailable; do not infer a subdivision action from a parent group or fabricate a missing field.

## Unavailable or unlicensed visuals

Muscle-specific media bindings: **0**. Published exercise videos, animations and photographic demonstrations: **0**. The opt-in reviewed video player exists as code, but no published video record currently uses it. Existing exercise SVGs and their explicit limitations remain useful, but are not complete motion demonstrations. The abstract body selector must not be presented as a precise per-muscle anatomy model.

Original, source-linked code-native schematics are the preferred bounded option. Do not copy proprietary anatomy plates, external exercise images or ACSM infographics. Open access does not automatically permit figure adaptation; check the rights attached to each actual asset. No new visual is represented as already created, licensed or independently reviewed.

## Evidence considered

Current science cites ACSM 2026 sources in 25 of 32 topics: 22 cite the position stand and three cite the official summary. It is not missing content to republish. The paper concerns healthy adults and goal-specific resistance-training outcomes. The official summary emphasizes regular participation, individualization and manageable plans. **Design interpretation:** offer a simple user-controlled plan with clear source scope, without automatic universal load/volume prescriptions. [Position stand](https://pubmed.ncbi.nlm.nih.gov/41843416/), [article and rights statement](https://pmc.ncbi.nlm.nih.gov/articles/PMC12965823/), [official ACSM summary](https://acsm.org/resistance-training-guidelines-update-2026/).

This was a bounded evidence check, not an open-ended literature review or new factual-publication pass.

## One prioritized pilot

**Six-exercise guided learning → personal two-session plan → existing workout tracker.** Restrict the allowlist to the six already-published exercises in `program_full_body_2_day_foundation`. Keep the 900-item historical backlog frozen. No new public exercise, muscle, science or program identities.

| Existing exercise ID                      | Existing difficulty |
| ----------------------------------------- | ------------------- |
| `exercise_bodyweight_squat`               | beginner            |
| `exercise_incline_push_up`                | foundation          |
| `exercise_one_arm_dumbbell_row`           | intermediate        |
| `exercise_seated_dumbbell_shoulder_press` | foundation          |
| `exercise_dumbbell_curl`                  | foundation          |
| `exercise_standing_calf_raise`            | foundation          |

The one-arm row is intermediate-labelled despite the source program's Foundation title. Preserve that label and source scope; the title is not blanket beginner clearance.

The twelve existing linked muscle IDs are:

- `muscle_biceps_brachii`
- `muscle_deltoid`
- `muscle_rectus_femoris`
- `muscle_vastus_lateralis`
- `muscle_vastus_medialis`
- `muscle_vastus_intermedius`
- `muscle_gluteus_maximus`
- `muscle_latissimus_dorsi`
- `muscle_pectoralis_major`
- `muscle_triceps_brachii`
- `muscle_gastrocnemius`
- `muscle_soleus`

Implement this as one finite phase in the following order, after separate owner authorization:

1. First create original labelled location/action schematics for only the twelve existing linked muscle records, with mirrored text and explicit approximate/not-to-scale labels; use existing sourced facts and preserve role qualifiers. Any precision claim beyond those sources requires actual review before publication.
2. For the six exercise pages, provide accessible user-controlled setup/action/reset views derived from current execution text/diagrams, visible source links, existing difficulty/equipment and stop signals. No autoplay, video dependency or fabricated posture measurement.
3. Add a local-only draft plan capped at two sessions, composed only of the six allowlisted IDs, with title, reorder/edit/delete, user-entered sets/reps/rest (or explicitly attributed canonical targets if cloned) and an explicit reviewed-source/custom-change distinction. Do not generate prescriptions from goals/health data or call a user plan a reviewed canonical program.
4. Save in IndexedDB behind an explicitly reviewed local record contract, version/snapshot semantics, validation-before-write and backup/restore/CSV coverage. Start a session through existing tracker primitives; do not fork a second logging system.

Before implementation, read the relevant current muscle/exercise/program/workout/backup contracts and original Phase 02, 03, 05, 06 and 17 schemas under [the archive](../archive/original-specifications/README.md). Record the new local record contract and compatibility decisions before writes; keep immutable factual IDs and canonical units. This roadmap does not define a migration or silently authorize one.

## Acceptance test and stop condition

1. Dataset count/hash freeze: 70 muscles,32 exercises,32 science,4 programs and 900 backlog unchanged; no new published fitness entities.
2. All six exercise→muscle links resolve by immutable ID. Every existing primary/context-dependent/stabilizer role and source qualifier is preserved; no EMG percentages, secondary roles or isolation claims invented.
3. Every new original visual has stable ID, source/author/license/review metadata, useful text alternative and a source-backed scope. No new human-review date without an actual review.
4. A keyboard/mobile user can select a taught region, read one of six guides, add exercises to a draft, reorder, explicitly enter targets, save, reload, edit/delete, start in the current tracker and return to the plan without losing records.
5. Canonical program content/version and completed workout snapshots remain unchanged when the local plan is edited. Unknown duration/rest stays unavailable until user-supplied, not zero or guessed.
6. Plan export/import round trip succeeds, CSV includes plan data, malformed imports cause zero writes, rollback/error feedback preserves old records, and destructive replacement/deletion requires confirmation.
7. Personal data stays browser-local and absent from SSR/logs/URLs/metadata/network. No accounts, cloud storage or external fitness runtime API.
8. Semantic controls, visible focus, role/state alternatives and reduced motion; desktop/mobile Light/Dark/Auto focused axe/keyboard checks and required app gates after future implementation. Do not run broad suites during this documentation task.

Add a dedicated malformed-import/round-trip check for the new personal-plan record type; existing workout backup coverage must not be assumed to cover new stores. Every save/error/edit/delete path needs visible feedback. A saved user-authored plan stays labelled personal; cloned source targets retain attribution, and changed targets retain their personal origin. Unknown/unentered duration or rest remains unavailable until explicitly supplied.

Stop when the six guides and twelve schematics pass their source/provenance/accessibility checks and a keyboard/mobile user can create, save, reload, edit/delete, export/restore and start a two-session plan through the existing tracker without altering a canonical program or completed-session snapshot. Run the required implementation gates only in that future authorized phase.

## Out of scope

- new exercises/muscles/program identities
- automatic programming or medical suitability decisions
- new image scraping or unlicensed copying
- new video hosting
- body model/EMG/activation heatmaps
- dependency modernization
- social/accounts/cloud sync
- general backlog expansion

No implementation, factual research expansion, dependency upgrade, new account/cloud service or unlicensed visual acquisition starts in this task. Resolve account CI availability before future release validation. Retain the phase-19 citation ref until a separately authorized immutable-URL repair is complete.

## Repository evidence

- [src/features/muscles/body-selector.tsx:10](../../src/features/muscles/body-selector.tsx#L10) — Front/back region selector with keyboard-equivalent text list. SVG identifies itself as abstract approximate navigation, not a precise anatomy diagram.
- [src/features/muscles/detail.tsx:115](../../src/features/muscles/detail.tsx#L115) — Location, structural text, actions, relationships, related exercises and sources render. No muscle-specific diagram renderer.
- [src/features/muscles/detail.tsx:236](../../src/features/muscles/detail.tsx#L236) — Related exercises use exercisesForMuscle(record.id).
- [src/features/exercises/repository.ts:75](../../src/features/exercises/repository.ts#L75) — exercisesForMuscle follows explicit ID-based muscleRoles on published exercises, not automatic hierarchy/activation inference.
- [src/features/exercises/catalogue.tsx:27](../../src/features/exercises/catalogue.tsx#L27) — Cards include primary/context-dependent muscle names, difficulty, movements, equipment and local reviewed image. Role distinctions/qualifiers are fuller on detail page.
- [src/features/exercises/detail.tsx:15](../../src/features/exercises/detail.tsx#L15) — Written setup, execution, checkpoints, breathing/range/tempo/spotting (where provided), muscle-role sources, errors, relations, programming, safety, media, gym mode and print exist.
- [src/features/exercises/media.tsx:4](../../src/features/exercises/media.tsx#L4) — Reviewed opt-in video player is implemented but no published video data exists. Static local SVG, credits/license/review information and fallback text exist.
- [public/media/bodyweight-squat-cue.svg:1](../../public/media/bodyweight-squat-cue.svg#L1) — Representative SVG is three text cue panels/arrows, explicitly a movement sequence and not a complete technique/anatomical demonstration.
- [src/features/programs/query.ts:157](../../src/features/programs/query.ts#L157) — Finder filters reviewed templates by eligibility answer, available days/time/equipment/experience/goals, with explicit no-time-limit handling for unknown durations.
- [src/features/programs/local.ts:24](../../src/features/programs/local.ts#L24) — Selection pins canonical program ID/version; start date/weekday preferences and only reviewed substitution options are mutable locally.
- [src/features/programs/schema.ts:238](../../src/features/programs/schema.ts#L238) — LocalProgramInstance models a selected public template, not an arbitrary user-authored multi-session program.
- [src/features/workout-tracker/start.tsx:207](../../src/features/workout-tracker/start.tsx#L207) — Ad hoc workouts select published exercises or local labels; repeat recent workouts and start current canonical program sessions.
- [src/features/workout-tracker/domain.ts:120](../../src/features/workout-tracker/domain.ts#L120) — repeatSession and fromProgram create session/set snapshots; canonical program start checks current version and published exercise availability.
- [src/features/workout-tracker/editor.tsx:999](../../src/features/workout-tracker/editor.tsx#L999) — Set adding/removal/duplication and exercise reorder/edit/removal, rest timer and session workflow already exist.
- [src/features/workout-tracker/settings.tsx:233](../../src/features/workout-tracker/settings.tsx#L233) — Workout JSON backup, CSV, preview/restore and destructive confirmations exist. New plan data would need explicit inclusion, not presumed coverage.
