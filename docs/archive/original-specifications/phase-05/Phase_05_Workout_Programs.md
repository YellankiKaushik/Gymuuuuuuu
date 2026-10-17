# Phase 05 — Workout Programs

**Project:** Fitness Knowledge and Tracking Application  
**Working product name:** Fitness OS  
**Document type:** Lovable implementation specification  
**Phase:** 05 of 20  
**Version:** 1.0  
**Date:** 5 August 2026  
**Status:** Ready for Lovable Plan mode

---

## Document purpose

This document tells Lovable exactly how to build the Workout Programs module on top of the completed Phase 00 foundation, Phase 01 application shell, Phase 02 Muscle and Functional Anatomy Library, Phase 03 Exercise Encyclopedia and Phase 04 Workout Science module.

Phase 05 is the application's canonical library of reviewed, predefined workout programs. It converts the principles defined in Phase 04 into practical weekly schedules while preserving source traceability, exercise-ID integrity, progression logic, substitutions, limitations and review status. It must help a user discover a suitable template, understand why the template is structured that way, inspect every training day, save one program locally and prepare it for later workout logging.

This phase must not behave like an AI coach. It must not invent a program from free-text input, diagnose injuries, prescribe rehabilitation, guarantee outcomes, change a program automatically, or silently personalize training variables. Matching must be deterministic and limited to reviewed programs already stored in the repository.

The module has six responsibilities:

1. Provide a high-quality catalogue of reviewed workout-program templates.
2. Explain the audience, assumptions, schedule, prescriptions, progression, substitutions and limitations of every program.
3. Reference Phase 03 exercise IDs and Phase 04 science-topic IDs instead of duplicating exercise technique or science articles.
4. Offer a deterministic Program Finder and neutral comparison interface.
5. Save the user's selected program and calendar preferences locally without authentication.
6. Establish stable program and program-instance contracts for Phase 06 workout tracking.

## How to use this document in Lovable

1. Open the existing project only after Phases 00–04 pass their acceptance criteria.
2. Keep the Phase 00 Project Knowledge active.
3. Attach the Phase 00–05 Markdown specifications.
4. Attach the Phase 02 muscle schema and taxonomy, Phase 03 exercise schema and taxonomy, Phase 04 science schema and taxonomy, `Phase_05_Workout_Program_Data_Schema.json` and `Phase_05_Seed_Workout_Program_Taxonomy.json`.
5. Attach `Phase_05_Lovable_Prompt_Package.txt`.
6. Run the Phase 05 Plan-mode prompt before code changes.
7. Reject any plan that creates an AI generator, backend, authentication, medical screening, fabricated schedules, unsupported numeric prescriptions, duplicated exercise instructions or automatically published draft programs.
8. Require Lovable to identify exact files, routes, cross-file validators, local-storage contracts, UI components and tests.
9. Approve the plan only after every acceptance criterion is mapped.
10. Run the Agent-mode prompt, then the verification prompt.
11. Correct every Phase 05 defect before Phase 06 begins.
12. Create the GitHub checkpoint `phase-05-workout-programs-complete`.

---

## 1. Phase objective

Build a structured, searchable, accessible and evidence-governed Workout Programs library containing:

- A catalogue of predefined program templates for general fitness, strength, hypertrophy, combined strength and hypertrophy, power, muscular endurance, home training, short sessions, return-to-training, maintenance and limited specialization contexts.
- Stable program identities and route slugs.
- Transparent audience and prerequisite rules.
- Weekly schedules and rotating-sequence schedules.
- Session-level exercise prescriptions referencing Phase 03 exercise IDs.
- Sets, repetition targets, effort methods, rest ranges and progression rules that reference Phase 04 science topics.
- Program blocks, transitions and deload logic when applicable.
- Reviewed exercise-substitution groups.
- Deterministic discovery, finder and comparison tools.
- Local selection, start-date and preferred-weekday settings.
- A safe handoff contract for logging actual workouts in Phase 06.
- Repository-owned data, publication gates and build-time validation.

The phase is complete only when a user can choose a reviewed program, understand its purpose and limits, inspect each session, see how to progress, replace exercises only through reviewed alternatives, save the program locally and enter Phase 06 without receiving fabricated or medical advice.

## 2. Dependencies and assumptions

### 2.1 Required outputs from earlier phases

The project must already contain:

- Strict TypeScript and the responsive Phase 01 shell.
- Light, dark and system themes.
- Shared cards, tabs, disclosures, filters, tables, badges, citations, dialogs, toasts, empty states and error boundaries.
- Phase 02 canonical muscle IDs.
- Phase 03 canonical exercise IDs, equipment IDs, movement-pattern IDs, difficulty, technique pages and reviewed relationships.
- Phase 04 canonical science-topic IDs for volume, load, frequency, effort, progression, periodization, fatigue and advanced methods.
- Repository-owned JSON loading and schema validation.
- No authentication, runtime CMS, user database or cloud personal profile.

Lovable may make a minimal prerequisite repair only when it documents the defect, limits the file impact and does not redesign an earlier module.

### 2.2 Cross-phase ownership

| Concept | Owning phase | Phase 05 rule |
| --- | --- | --- |
| Muscle identity and anatomy | Phase 02 | Reference stable IDs only. |
| Exercise identity, technique, video and mistakes | Phase 03 | Reference exercise IDs and link to detail pages; never copy technique. |
| Training principles and evidence | Phase 04 | Reference science-topic IDs and concise rationale; never rewrite the article. |
| Workout program templates | Phase 05 | This phase is the single source of truth. |
| Completed sets, weights, RPE/RIR and history | Phase 06 | Define handoff contracts only; do not log here. |
| Cardio programming | Later cardio phase | Only small optional placeholders when a reviewed program requires them. |
| Recovery, sleep and readiness | Later recovery phases | State assumptions and boundaries; do not score readiness here. |
| Nutrition and body composition | Later nutrition phases | A program may support a goal but cannot prescribe diet. |
| AI coaching or adaptive recommendations | Future optional layer | Not permitted in Phase 05. |

## 3. Required deliverables

Lovable must produce:

1. `/programs` programme catalogue.
2. `/programs/$slug` canonical program-detail template.
3. `/programs/finder` deterministic Program Finder.
4. `/programs/compare` comparison view for up to three programs.
5. `/programs/current` locally selected program overview.
6. Search, filtering, sorting and URL-state behavior.
7. Program cards, schedule summaries, session accordions and prescription tables.
8. Audience, assumption, outcome-limit, safety and evidence components.
9. Progression, deload and substitution components.
10. Local program-selection and calendar-preference storage.
11. Canonical TypeScript models and JSON Schema validation.
12. Cross-file validators for program, exercise, equipment, muscle and science IDs.
13. Derived weekly summaries generated from prescriptions rather than manually trusted totals.
14. Draft, review-needed, reviewed, published and deprecated states.
15. Responsive and WCAG 2.2 AA behavior.
16. Automated data, route, search, finder, comparison, local-state and accessibility tests.
17. `docs/workout-programs.md`, `docs/content-governance/program-review.md` and `docs/phases/phase-05.md`.
18. A stable Phase 06 program-instance handoff contract.

## 4. Scope boundaries

### 4.1 Build in this phase

- Reviewed predefined workout-program catalogue.
- Program discovery and deterministic matching.
- Program comparison.
- Program detail, schedule and exercise-prescription display.
- Progression and deload instructions stored with sources.
- Reviewed substitutions.
- Local selection and calendar mapping.
- Program-level evidence and limitations.
- Program data validation and publication gates.

### 4.2 Do not build in this phase

- Free-text or AI-generated programs.
- User accounts, authentication, Supabase, Lovable Cloud database or server persistence.
- Workout logging, completed set entry, rest timers or personal-record detection.
- Automatic load changes based on user performance.
- Injury diagnosis, rehabilitation programs, pain-specific exercise selection or medical clearance.
- Programs for pregnancy, minors, acute injury, post-operative recovery or specific clinical conditions.
- Meal plans, calorie targets, supplement prescriptions or body-fat predictions.
- Social sharing, comments, coaching marketplace, leaderboards or payments.
- Exercise technique duplication.
- Unsourced set, rep, frequency or failure claims.
- “Best program” rankings or outcome guarantees.

## 5. Product model

The program module consists of five layers:

1. **Program identity:** stable name, slug, category, goal, experience and routine style.
2. **Eligibility and assumptions:** who the program is for, what it assumes and who should not use it.
3. **Program design:** schedule, sessions, exercise prescriptions, blocks and progression.
4. **Evidence and governance:** science-topic references, primary sources, limitations and review status.
5. **Local instance:** selected program, start date, chosen weekdays and user-selected reviewed substitutions.

The repository program record is immutable content. The local program instance stores only personal choices and later completion data. A local instance must never mutate the canonical program JSON.

## 6. Canonical routes

| Route | Purpose |
| --- | --- |
| `/programs` | Catalogue, filters, featured foundations and saved-program indicator. |
| `/programs/$slug` | Canonical reviewed program detail page. |
| `/programs/finder` | Deterministic questionnaire and matched predefined programs. |
| `/programs/compare` | Side-by-side comparison of up to three program IDs from URL state. |
| `/programs/current` | Locally selected program, start date, calendar mapping and preparation for Phase 06. |

Unknown or unpublished slugs must use the Phase 01 unavailable/not-found state. Draft content must never appear as a usable workout.

## 7. Program taxonomy

### 7.1 Categories

- General fitness
- Strength
- Hypertrophy
- Strength and hypertrophy
- Power
- Muscular endurance and circuits
- Home and minimal equipment
- Time-efficient
- Return and maintenance
- Body-composition support
- Specialization

### 7.2 Routine styles

- Full body
- Upper/lower
- Push/pull/legs
- Upper/lower plus push/pull/legs
- Body-part split
- Alternating A/B
- Circuit
- Specialization
- Mixed

Routine style is an organizational choice, not an outcome ranking. Current evidence indicates that split and full-body routines can produce similar strength and hypertrophy outcomes when relevant training volume is equated. The interface must therefore describe trade-offs such as schedule, session length, frequency distribution and preference rather than declaring one style universally superior.

### 7.3 Goal vocabulary

- General fitness
- Strength
- Hypertrophy
- Strength and hypertrophy
- Power
- Muscular endurance
- Body-composition support
- Maintenance
- Skill

“Body-composition support” must not be presented as a fat-loss guarantee. The page must state that body-mass change is strongly affected by energy intake and other factors outside this program module.

### 7.4 Experience vocabulary

- Foundation
- Beginner
- Intermediate
- Advanced
- Specialist

Experience is determined by technical competence, consistency, tolerance for training volume and ability to self-regulate—not only by months spent in a gym.

## 8. Program eligibility and safety boundary

Every published program must state:

- Intended healthy population.
- Best-fit user characteristics.
- Required technical prerequisites.
- Equipment and environment assumptions.
- Expected schedule commitment.
- Situations for which it is not designed.
- General stop signals.
- Situations requiring professional review.
- That the content is educational and not medical advice.

The Program Finder must not ask diagnostic questions or attempt to clear a user medically. It may ask whether the user can participate in general exercise without known restrictions. A negative or uncertain response must show a neutral instruction to seek appropriate professional advice rather than generating a program.

## 9. Stable identifiers and immutability

- Program IDs use `program_...`.
- Session IDs use `session_...` and are unique within the program package.
- Exercise block IDs use `block_...`.
- Program-block IDs use `program_block_...`.
- Progression IDs use `progression_...`.
- Substitution IDs use `substitution_...`.
- Published IDs and slugs must never be reused for a different concept.
- Renaming uses aliases and redirect metadata; it does not replace the ID.
- Deprecated programs remain resolvable and point to a reviewed replacement where available.

## 10. Publication lifecycle

| Status | Public behavior |
| --- | --- |
| `draft` | Hidden from catalogue and finder. Direct route shows unavailable. |
| `review-needed` | Hidden from public use; visible only in validation reports. |
| `reviewed` | May be previewed in development but not treated as production content. |
| `published` | Searchable, selectable and usable. |
| `deprecated` | Read-only notice with replacement and migration guidance. |

A program cannot be published unless schedule, prescriptions, progression, substitutions, safety, evidence, sources and review metadata pass validation.

## 11. Program record model

The canonical program record must support:

- Identity and taxonomy.
- Audience and assumptions.
- Duration mode and expected session duration.
- Equipment profile.
- Weekly schedule or rotating sequence.
- Sessions and ordered exercise blocks.
- Exercise prescriptions referencing Phase 03 IDs.
- Progression rules.
- Deload or transition logic.
- Reviewed substitution groups.
- Derived weekly summaries.
- Science rationale referencing Phase 04 IDs.
- Measurement guidance and limitations.
- Safety boundaries.
- Sources and review metadata.
- Versioning and deprecation.

The attached JSON Schema is normative. TypeScript types must be inferred from or kept mechanically aligned with that schema.

## 12. Exercise prescription model

Every exercise prescription must contain:

- Canonical Phase 03 exercise ID.
- Role: skill, power, primary, secondary, accessory, isolation, conditioning, warm-up or mobility.
- Set range.
- Repetition, duration, distance or technical-quality target.
- Effort method and target.
- Rest range.
- Optional tempo only when justified.
- Progression-rule ID.
- Optional reviewed substitution-group ID.
- Optional flag and concise notes.

The program page must link the exercise name to `/exercises/$slug`. It must not repeat setup steps, form instructions, mistakes, videos or anatomy. The user should be able to open the exercise detail in a new browser tab or same-tab navigation.

## 13. Numeric prescription rules

Numeric fields are allowed only when:

- The program has a defined population and goal.
- The prescription is internally consistent.
- The rationale references Phase 04 science topics.
- Relevant claims have source IDs.
- The values are presented as a template, not a guarantee.
- The interface explains how the user should select a starting load.
- The program includes a stall or regression response.

Do not create false precision. Use practical ranges where the evidence or individual response does not justify a single exact value.

## 14. Effort and load-selection display

Supported effort methods:

- RIR
- RPE
- Percentage of 1RM
- Velocity intent
- Technical stop
- Comfortable effort
- Not applicable

The UI must define the selected method in plain language and link to the Phase 04 concept page. If a program uses RIR or RPE, it must explain that estimates improve with practice and should not be treated as exact physiological measurements.

The app must not calculate a starting weight from body weight, age or sex. It may explain a safe load-finding process stored in the reviewed program content.

## 15. Progression rules

Supported rule types:

- Double progression
- Load progression
- Repetition progression
- Set progression
- Density progression
- Technical progression
- Autoregulated progression
- Block transition
- Maintenance

Every progression rule requires:

1. Trigger conditions.
2. Exact action.
3. Ceiling or boundary.
4. Floor or regression boundary.
5. Stall response.
6. Science-topic references.
7. Source references.

A rule must never say only “add weight every week.” It must state what qualifies the user to progress and what to do when performance, technique or recovery does not support the increase.

## 16. Program blocks and periodization

Programs may be:

- Fixed-week programs.
- Open-ended templates with scheduled review points.
- Block-based programs.

A block must define its purpose, week range, sessions, transition conditions and rationale. Periodization is a structuring option, not a mandatory badge of quality. The program detail must not imply that complex periodization is required for all healthy adults.

## 17. Deload and transition logic

Supported approaches:

- Scheduled
- Readiness-guided
- Performance-guided
- None
- Context-dependent

A deload section must explain:

- Why it exists in this specific program.
- What variable changes: load, sets, effort, exercise selection or frequency.
- How long the adjustment lasts.
- What it does not diagnose.
- When the user should stop and seek professional advice rather than continuing.

Do not generate a recovery score or infer overtraining.

## 18. Substitution system

Substitution must be deterministic and reviewed.

Every substitution group must define:

- Original exercise IDs.
- Candidate exercise IDs.
- Matching rules such as movement pattern, target role, equipment and skill demand.
- Changes that are not acceptable.
- Whether set, rep, rest or effort fields also require modification.
- Review status.

The app must never replace an exercise by searching only for the same primary muscle. A valid substitution must preserve the purpose of the slot and must not silently increase technical difficulty or change the program's equipment assumptions.

The user may select only listed candidates. Free-text substitutions and AI suggestions are prohibited in this phase.

## 19. Derived weekly summaries

The application should derive, not manually trust:

- Session count.
- Estimated weekly time.
- Movement-pattern exposure.
- Exercise count.
- Direct set estimates by muscle where the data model supports it.
- Frequency of repeated exercise skills.

Derived summaries must clearly state their counting method. Indirect or fractional muscle-set estimates must not be shown as laboratory truth. The default public summary should prefer direct working sets and provide a methodology tooltip.

## 20. `/programs` catalogue page

### 20.1 Page structure

1. Breadcrumb and page header.
2. Short explanation of predefined reviewed programs.
3. Link to Workout Science.
4. Search field.
5. Filter controls.
6. Active-filter summary and clear-all action.
7. Result count.
8. Program grid/list.
9. Finder callout.
10. Current-program callout when local selection exists.
11. Empty and unavailable states.

### 20.2 Program card

Each published program card must show:

- Name.
- Primary goal.
- Experience level.
- Days per week.
- Estimated session duration.
- Routine style.
- Equipment summary.
- Duration mode.
- Concise “best for” statement.
- Review status/date.
- Compare control.
- View-program action.

Do not show star ratings, popularity, fake completion counts or “best” badges.

## 21. Search, filters and sorting

### 21.1 Search fields

Search over:

- Display name.
- Aliases.
- Goal.
- Routine style.
- Equipment-profile name.
- Concise audience text.

### 21.2 Filters

- Primary goal
- Experience level
- Days per week
- Session-duration band
- Equipment profile
- Environment
- Routine style
- Duration mode

### 21.3 Sorting

- Recommended foundations first
- Name A–Z
- Fewer days first
- More days first
- Shorter sessions first
- Recently reviewed

“Recommended foundations first” must use a reviewed editorial order, not hidden personalization.

### 21.4 URL state

Search, filters, sort and compare IDs must survive refresh and browser navigation through URL query parameters. Invalid values must be removed safely without crashing.

## 22. Deterministic Program Finder

The finder is a filter-and-ranking interface over published records. It is not a generator.

### 22.1 Questions

1. Primary goal.
2. Experience level.
3. Available training days.
4. Typical session-time limit.
5. Equipment access.
6. Training environment.
7. Routine-style preference, optional.
8. Confirmation that the user is seeking general educational programming for a healthy adult without known restrictions.

### 22.2 Matching behavior

- Apply hard constraints first: publish status, days, equipment and environment.
- Apply goal and experience compatibility.
- Apply duration compatibility.
- Apply optional routine preference.
- Rank through explicit weights stored in code and documented.
- Show why each result matched.
- Show compromises when a result is only a close match.
- Never alter the program to force a match.
- Never infer health status.

### 22.3 No-result behavior

Show:

- Which constraints removed all programs.
- Controls to relax one constraint.
- Educational links to relevant Workout Science topics.
- No generated fallback.

### 22.4 Explainability

Every result must display a concise rationale such as:

- Matches four available days.
- Fits full-gym equipment.
- Designed for intermediate strength and hypertrophy.
- Estimated sessions fit the selected time band.

Do not display an opaque numerical “compatibility score.”

## 23. Program comparison

Users may compare two or three published programs.

Compare:

- Primary and secondary goals.
- Experience and prerequisites.
- Days per week.
- Session duration.
- Duration mode.
- Routine style.
- Equipment.
- Weekly structure.
- Progression type.
- Deload/transition approach.
- Direct-set methodology.
- Best-fit and not-for statements.
- Evidence and review date.

Comparison must be descriptive and neutral. It must not crown a winner.

On mobile, use stacked comparison cards or a horizontally scrollable table with sticky row labels and an accessible non-table alternative.

## 24. Program detail page

### 24.1 Information order

1. Breadcrumb.
2. Program title and status.
3. Goal, experience, days, time, routine and equipment summary.
4. “Who this is for” and “Not designed for.”
5. Outcomes and limitations.
6. Weekly schedule overview.
7. Session details.
8. Progression rules.
9. Substitutions.
10. Blocks, deload or transitions.
11. Measurement guidance.
12. Science rationale.
13. Safety boundaries.
14. Sources and review metadata.
15. Related programs.
16. Save/set-as-current action.

### 24.2 Sticky actions

Desktop may use a restrained sticky action panel containing:

- Set as current program.
- Compare.
- Print.
- Copy canonical link.

Mobile must use a non-obstructive action bar and preserve content reflow.

## 25. Weekly schedule display

Support:

- Fixed weekly calendar.
- Rotating A/B or PPL sequence.
- Flexible-week schedule.
- Block calendar.

The default detail view should display sessions in their program order, not force Monday–Sunday labels. Calendar examples are optional examples and must be labelled as such.

Rest days are not “missed workouts.” The interface must visually distinguish training days, rest days and optional sessions.

## 26. Session display

Each session must show:

- Session name and focus.
- Estimated duration.
- Ordered blocks.
- Exercise name and link.
- Sets.
- Repetition/duration target.
- Effort target.
- Rest.
- Progression-rule indicator.
- Substitution control when available.
- Optional status.
- Concise notes.

Use responsive cards on narrow screens instead of forcing a wide prescription table below 768 px.

## 27. Local program selection

Phase 05 may save only:

- Canonical program ID and version.
- Selected date.
- Optional start date.
- Preferred weekdays or schedule mapping.
- Reviewed substitution choices.
- Display preferences.

Store the program instance in IndexedDB where Phase 06 can extend it. A small active-program pointer may be stored in localStorage.

The app must provide:

- Set as current.
- Replace current program with confirmation.
- Clear current program.
- Export current selection as part of the future global backup.
- Detect when the canonical program version changes.

It must not store completed sets or weights yet.

## 28. Program version changes

When a saved program has an older canonical version:

- Preserve the local instance.
- Show the version difference.
- Display reviewed migration notes.
- Let the user keep the old instance or create a new instance.
- Never silently change exercise prescriptions.
- Never overwrite local substitutions.

## 29. Print and offline-friendly output

Program detail should have a print stylesheet with:

- Program identity and version.
- Schedule.
- Sessions and prescriptions.
- Progression summary.
- Safety and source summary.
- No navigation chrome.
- No embedded videos.

The print view is a reference, not a tracking worksheet. Actual logging belongs to Phase 06.

## 30. Evidence and content-governance rules

### 30.1 Evidence hierarchy

Prefer:

1. Current position stands and public-health guidelines.
2. Umbrella reviews.
3. Systematic reviews and meta-analyses.
4. Randomized or controlled trials for narrower decisions.
5. Consensus or practice frameworks only where evidence is incomplete.

### 30.2 Program-level rationale

Every important design decision must state:

- The decision.
- Relevant Phase 04 science-topic IDs.
- Source IDs.
- Population and goal context.
- Limitations.

### 30.3 Interpretation guardrails

The program library must preserve these principles:

- Many resistance-training prescriptions improve strength and hypertrophy compared with no training.
- Higher loads are generally more specific to maximal-strength outcomes.
- Multiple-set approaches are commonly used for hypertrophy, with response and tolerability varying.
- Volume and frequency show diminishing returns and must be interpreted in context.
- Routine split is mainly an organization method when volume is comparable.
- Complex periodization and advanced methods are optional tools, not automatic requirements.
- Training to momentary failure is not universally necessary.
- Adherence, technical competence and recoverability constrain the practical program.

These principles must be linked to Phase 04 rather than copied into every program.

## 31. Content workflow

1. Create or update stable identity.
2. Define audience and assumptions.
3. Select only existing Phase 03 exercise IDs.
4. Draft schedule and prescriptions.
5. Attach progression and substitution rules.
6. Calculate derived summaries.
7. Add science rationale and sources.
8. Add safety and outcome limitations.
9. Run schema and cross-file validation.
10. Complete programming review.
11. Complete science review.
12. Complete editorial and accessibility review.
13. Mark reviewed.
14. Publish through repository change and tests.

Lovable must not author missing scientific or programming content during UI implementation.

## 32. Source and review display

Every published detail page must show:

- Program version.
- Last reviewed date.
- Next review due.
- Reviewer roles, not personal credentials invented by the app.
- Evidence references.
- Clear limitations.
- Report-an-issue link or local copyable issue template, without requiring an account.

## 33. Technical architecture

Suggested responsibilities:

```text
src/
  features/programs/
    components/
    data/
    lib/
    routes/
    schemas/
    types/
  lib/content-validation/
  lib/local-programs/
  routes/programs/

data/
  programs/
  program-taxonomies/
  sources/

docs/
  workout-programs.md
  content-governance/program-review.md
  phases/phase-05.md
```

Use the existing framework and routing conventions. Do not migrate the app solely to match this suggested tree.

## 34. Data loading and indexes

At build time:

1. Load program records.
2. Validate schema.
3. Validate unique IDs and slugs.
4. Validate equipment-profile IDs.
5. Validate every Phase 03 exercise reference.
6. Validate every Phase 04 science-topic reference.
7. Validate internal session, block, progression and substitution IDs.
8. Derive catalogue search documents.
9. Derive filter indexes.
10. Derive weekly summaries.
11. Exclude non-published records from production catalogue and finder.
12. Fail the production build on invalid published content.

## 35. Cross-file validation rules

A published program fails when:

- An exercise ID does not exist.
- An exercise is not reviewed/published enough for public use.
- A science-topic ID does not exist.
- An equipment-profile ID is invalid.
- A session ID is duplicated.
- A prescription points to a missing progression rule.
- A substitution candidate is missing or identical to the only original.
- Session duration min exceeds max.
- Set, rep, rest or week range min exceeds max.
- `trainingDaysPerWeek` conflicts with the schedule model.
- A fixed-week program lacks duration weeks.
- A block-based program lacks blocks.
- A published program lacks safety, sources or review metadata.
- Derived summaries conflict with declared metadata.
- A program duplicates Phase 03 technique text.

## 36. Program Finder implementation contract

The matcher must be a pure deterministic function with:

- Versioned matching rules.
- Unit tests for each hard constraint.
- Unit tests for ranking ties.
- Explainable match reasons.
- No network calls.
- No model/AI call.
- No hidden demographic inference.
- No persistence unless the user explicitly selects a result.

Finder answers should remain in URL state during the session. Sensitive health data must not be requested or encoded.

## 37. Local program-instance contract for Phase 06

```ts
interface LocalProgramInstance {
  instanceId: string;
  canonicalProgramId: string;
  canonicalProgramVersion: string;
  selectedAt: string;
  startDate: string | null;
  preferredWeekdays: Record<string, string>;
  substitutionSelections: Record<string, string>;
  status: 'planned' | 'active' | 'paused' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}
```

Phase 06 may extend this contract through versioned migrations. Phase 05 must not add completed-session or performance fields.

## 38. Performance requirements

- Programme catalogue should remain responsive with at least 1,000 records.
- Search and filters should run locally after initial data load.
- Lazy-load non-critical detail sections.
- Do not load Phase 03 video embeds on programme pages.
- Route-level code splitting must be preserved.
- Avoid shipping all detailed programs to the homepage bundle.
- Production build must not expose draft content through client-side data files.

## 39. Accessibility requirements

- One H1 per route.
- Semantic headings and landmarks.
- Programme cards accessible as structured groups.
- Filters labelled and keyboard operable.
- Finder questions grouped with fieldsets and legends.
- Tables have headers, captions and a reflow alternative.
- Session accordions expose expanded state.
- Comparison is usable without colour.
- Focus remains visible in light and dark themes.
- Touch targets meet the Phase 01 baseline.
- Content reflows at 320 px and 400% zoom.
- Print output has logical reading order.
- No auto-advancing finder steps without user action.

## 40. Empty, unavailable and error states

Required states:

- No published programs.
- No search results.
- No exact finder matches.
- Invalid compare IDs.
- Unpublished or deprecated program.
- Missing exercise relationship.
- Local storage unavailable.
- Saved version differs from canonical.
- Corrupt local instance.

Errors must never show a partially usable unsafe program. Fail closed and explain what is unavailable.

## 41. Automated tests

### 41.1 Data tests

- Schema validation for all seed records.
- Duplicate ID and slug detection.
- Cross-file exercise and science references.
- Published-content gates.
- Range-order validation.
- Schedule-day consistency.
- Progression and substitution references.
- Derived-summary consistency.

### 41.2 Catalogue tests

- Search aliases and titles.
- Filters individually and in combination.
- URL restoration.
- Sort stability.
- Draft exclusion.

### 41.3 Finder tests

- Hard constraints.
- Ranking and ties.
- Exact versus close matches.
- Explainable reasons.
- No-results relaxation controls.
- No persistence before selection.

### 41.4 Detail tests

- Route resolution.
- Exercise links.
- Science links.
- Schedule rendering.
- Responsive prescription cards.
- Deprecated state.
- Print stylesheet.

### 41.5 Local-state tests

- Set current program.
- Replace with confirmation.
- Calendar preferences.
- Substitution selections.
- Version mismatch.
- Corrupt state recovery.
- No workout-performance fields.

### 41.6 Accessibility tests

- Keyboard catalogue, finder, comparison and sessions.
- Labels and descriptions.
- Accordion state.
- Table semantics.
- Focus management.
- Automated accessibility scan on every route.

## 42. Manual testing matrix

Test at:

- 320 × 568
- 360 × 800
- 390 × 844
- 768 × 1024
- 1024 × 768
- 1280 × 800
- 1440 × 900

Test:

- Light, dark and system theme.
- Keyboard-only navigation.
- 200% and 400% zoom.
- Long program names.
- Large schedules.
- One-day and six-day programs.
- No-result finder state.
- Three-program comparison.
- Local storage disabled.
- Print preview.
- Version migration notice.

## 43. Lovable implementation sequence

1. Audit existing routes, components and data contracts.
2. Add schema and seed taxonomy without publishing records.
3. Add program loader and cross-file validators.
4. Add TypeScript domain models.
5. Build catalogue and URL-state filters.
6. Build program cards and detail template.
7. Build schedule and session components.
8. Build progression, substitution, evidence and safety components.
9. Build deterministic finder.
10. Build neutral comparison.
11. Add local program-instance storage.
12. Add version-mismatch and deprecated states.
13. Add print styling.
14. Add automated tests.
15. Run type-check, lint, test, accessibility scan and production build.
16. Document implementation and checkpoint.

Build in small testable increments. Do not attempt the entire phase in one uncontrolled edit.

## 44. Protected boundaries

Lovable must not modify unless a verified compatibility defect requires a minimal patch:

- Phase 00 no-authentication and local-first rules.
- Phase 01 shell, tokens and navigation architecture.
- Phase 02 muscle IDs.
- Phase 03 exercise IDs, technique content and media behavior.
- Phase 04 science-topic content and claim interpretation.
- Existing public routes.
- GitHub integration and deployment configuration.

Non-negotiable prohibitions:

- No backend or authentication.
- No AI program generator.
- No medical or injury personalization.
- No fabricated workouts.
- No automatic publication of seed records.
- No exercise-technique duplication.
- No silent canonical-program mutation.
- No “best program” ranking.
- No outcome guarantees.

## 45. Acceptance criteria

### 45.1 Architecture

- [ ] Programme data is repository-owned and schema validated.
- [ ] Published data references valid Phase 03 and Phase 04 IDs.
- [ ] Draft data is excluded from production use.
- [ ] No backend, authentication or AI generation exists.
- [ ] Canonical records and local instances are separate.

### 45.2 Catalogue and discovery

- [ ] `/programs` is searchable, filterable, sortable and URL-addressable.
- [ ] Programme cards show all required decision information.
- [ ] Finder uses deterministic documented rules.
- [ ] Finder explains matches and compromises.
- [ ] Comparison supports two or three programs without a winner score.

### 45.3 Detail and content

- [ ] Detail pages present audience, outcomes, schedule, sessions, progression, substitutions, evidence, safety and review metadata.
- [ ] Exercise prescriptions link to Phase 03 rather than duplicate technique.
- [ ] Science decisions link to Phase 04.
- [ ] Published prescriptions have valid progression and substitution rules.
- [ ] Deprecated and unavailable states are safe.

### 45.4 Local behavior

- [ ] A program can be selected locally without login.
- [ ] Start date and preferred weekdays can be saved.
- [ ] Only reviewed substitutions can be selected.
- [ ] Version mismatches do not silently overwrite data.
- [ ] No completed-set data is stored in Phase 05.

### 45.5 Quality

- [ ] Mobile, tablet and desktop layouts pass.
- [ ] Keyboard, focus, zoom and screen-reader behavior pass.
- [ ] Print output is usable.
- [ ] All validation, type-check, lint, tests and production build pass.
- [ ] Phase documentation is committed.

## 46. Phase 05 Plan-mode prompt

Use the separate prompt package. The required planning instruction must force Lovable to:

- Read every attached Phase 05 file.
- Audit Phase 00–04 contracts.
- Produce exact file and route changes.
- Map JSON Schema to TypeScript and build validation.
- Define cross-file ID checks.
- Design catalogue, finder, comparison and detail states.
- Design local instance storage without workout logs.
- Map tests to every acceptance criterion.
- Identify conflicts before code changes.

## 47. Phase 05 Agent-mode prompt

Use the separate prompt package only after the Plan-mode output is corrected and approved.

Implementation must preserve Phases 00–04, build only Phase 05, run validation and testing, and report exact files changed. Lovable must not invent publishable program content from draft identities.

## 48. Reviewed programme import prompt

Use the import prompt when reviewed program records are later supplied. It must validate records without rewriting facts, inferring missing prescriptions or changing status.

## 49. Focused correction prompt

Use the correction prompt only for verified defects. Require root cause, minimal file impact and regression tests. Do not ask Lovable to redesign the module while fixing a defect.

## 50. Phase 06 handoff requirements

Phase 06 must receive:

- Canonical program IDs and versions.
- Session IDs and display order.
- Exercise-block and prescription IDs.
- Exercise IDs.
- Set, rep, effort and rest targets.
- Progression-rule IDs.
- Reviewed substitution selections.
- Local program-instance contract.
- Calendar mapping.

Phase 06 will add actual sessions, completed sets, weights, reps, RPE/RIR, notes, timers and history. It must not mutate canonical Phase 05 records.

## 51. Completion definition

Phase 05 is complete when the entire acceptance checklist passes, only reviewed published programs are usable, the finder is deterministic and explainable, every prescription resolves to valid exercise and science records, local selection survives refresh, no workout logging or backend exists, and the GitHub checkpoint `phase-05-workout-programs-complete` is created.

## References

1. **ACSM 2026 position stand.** American College of Sports Medicine Position Stand. Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults: An Overview of Reviews. https://pubmed.ncbi.nlm.nih.gov/41843416/

2. **ACSM update summary.** ACSM Publishes Updated Resistance Training Guidelines. https://acsm.org/resistance-training-guidelines-update-2026/

3. **Prescription network meta-analysis.** Resistance training prescription for muscle strength and hypertrophy in healthy adults: a systematic review and Bayesian network meta-analysis. https://pubmed.ncbi.nlm.nih.gov/37414459/

4. **Split versus full-body.** Efficacy of Split Versus Full-Body Resistance Training on Strength and Muscle Growth: A Systematic Review With Meta-Analysis. https://pubmed.ncbi.nlm.nih.gov/38595233/

5. **Periodization.** Effects of Periodization on Strength and Muscle Hypertrophy in Volume-Equated Resistance Training Programs: A Systematic Review and Meta-analysis. https://pubmed.ncbi.nlm.nih.gov/35044672/

6. **Dose response 2026.** The Resistance Training Dose Response: Meta-Regressions Exploring the Effects of Weekly Volume and Frequency on Muscle Hypertrophy and Strength Gains. https://pubmed.ncbi.nlm.nih.gov/41343037/

7. **Proximity to failure.** Exploring the Dose-Response Relationship Between Estimated Resistance Training Proximity to Failure, Strength Gain, and Muscle Hypertrophy. https://pubmed.ncbi.nlm.nih.gov/38970765/

8. **Physical activity guideline.** Physical Activity Guidelines Questions & Answers, Office of Disease Prevention and Health Promotion. https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/about-physical-activity-guidelines/questions-answers

9. **Lovable Plan mode.** Brainstorm in Plan mode - Lovable Documentation. https://docs.lovable.dev/features/plan-mode

10. **Lovable Agent mode.** Build in Agent mode - Lovable Documentation. https://docs.lovable.dev/features/agent-mode

11. **Lovable best practices.** Best practices - Lovable Documentation. https://docs.lovable.dev/tips-tricks/best-practice

12. **Lovable GitHub.** Connect your project to GitHub - Lovable Documentation. https://docs.lovable.dev/integrations/github
