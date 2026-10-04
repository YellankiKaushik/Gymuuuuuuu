# Phase 03 — Exercise Encyclopedia

**Project:** Fitness Knowledge and Tracking Application  
**Working product name:** Fitness OS  
**Document type:** Lovable implementation specification  
**Phase:** 03 of 20  
**Version:** 1.0  
**Date:** 5 August 2026  
**Status:** Ready for Lovable Plan mode

---

## Document purpose

This document tells Lovable exactly how to build the Exercise Encyclopedia on top of the completed Phase 00 foundation, Phase 01 application shell and Phase 02 Muscle and Functional Anatomy Library.

Phase 03 is the application's canonical exercise knowledge layer. It must explain what an exercise is, what it trains, how to set it up, how to perform it, what commonly goes wrong, which alternatives exist, how programming guidance should be interpreted, and which evidence and media support the page. It must not generate unsupported technique claims, universal prescriptions, medical treatment, fake muscle-activation percentages or copied creator content.

The module has two distinct responsibilities:

1. Give a user a fast, practical and safe exercise reference at the gym or at home.
2. Create stable exercise identities and relationships that later workout-program and tracking phases can reference without duplicating technique content.

## How to use this document in Lovable

1. Open the existing project after Phases 00, 01 and 02 pass their acceptance criteria.
2. Keep the Phase 00 Project Knowledge active.
3. Attach the Phase 00, Phase 01, Phase 02 and Phase 03 Markdown specifications.
4. Attach `Phase_02_Muscle_Data_Schema.json`, `Phase_02_Seed_Taxonomy.json`, `Phase_03_Exercise_Data_Schema.json` and `Phase_03_Seed_Exercise_Taxonomy.json`.
5. Attach `Phase_03_Lovable_Prompt_Package.txt`.
6. Use the Phase 03 Plan-mode prompt before code changes.
7. Reject any plan that invents exercise facts, introduces authentication or a backend, imports an unlicensed exercise database, replaces stable Phase 02 muscle IDs, or expands into workout planning/tracking.
8. Approve implementation only after Lovable maps requirements to exact files, tests and protected boundaries.
9. Run the Agent-mode prompt, then the verification prompt.
10. Correct every Phase 03 defect before Phase 04 begins.
11. Create a stable GitHub checkpoint named `phase-03-exercise-encyclopedia-complete`.

---

## 1. Phase objective

Build a structured, searchable, accessible and source-governed Exercise Encyclopedia containing:

- A canonical exercise catalogue.
- Exercise identities, aliases and naming conventions.
- Direct relationships to Phase 02 muscle IDs.
- Movement-pattern, equipment, mechanics and difficulty classifications.
- Exercise detail pages with setup, execution, breathing, range-of-motion and reset guidance.
- Common mistakes paired with concrete corrections.
- Regressions, progressions, variations and substitutions.
- Contextual programming guidance expressed as ranges and qualifiers.
- Reviewed demonstration videos and media metadata.
- Safety boundaries and stop-signal language without diagnosis.
- Stable contracts for workout programs and tracking in later phases.
- Repository-owned structured data with build-time validation.

The phase is complete only when the exercise library works independently as a reference and later modules can safely reference stable exercise IDs.

## 2. Dependencies and assumptions

### 2.1 Required outputs from earlier phases

The project must already have:

- Strict TypeScript and the Phase 01 responsive shell.
- Routes reserved for `/exercises` and `/exercises/$slug`.
- Shared page, card, filter, badge, disclosure, feedback, source and media primitives.
- Light, dark and system themes.
- Phase 02 canonical muscle IDs, regions, training groups, joint actions and movement patterns.
- Repository-owned static content loading and validation patterns.
- No authentication, cloud personal profiles or runtime content database.

Lovable may repair a missing prerequisite only when the repair is minimal, documented and does not redesign earlier phases.

### 2.2 Cross-phase ownership

| Concept | Owning phase | Phase 03 rule |
| --- | --- | --- |
| Canonical muscles and anatomy | Phase 02 | Reference IDs; never duplicate or rename. |
| Exercise identity and technique | Phase 03 | This phase is the single source of truth. |
| Training principles and advanced methods | Phase 04 | Link placeholders only; do not build full articles. |
| Workout programs | Phase 05 | Reference exercise IDs; do not embed duplicate instructions. |
| Workout logging | Phase 06 | Reference exercise IDs and snapshots. |
| Recovery and mobility routines | Later phases | May reference Phase 03 movement records. |

## 3. Required deliverables

Lovable must produce:

1. `/exercises` catalogue page.
2. `/exercises/$slug` detail template.
3. Search, multi-filter, sorting and URL-state behavior.
4. Data-driven movement-pattern and equipment navigation.
5. Canonical TypeScript types and JSON-schema validation.
6. Phase 02 muscle-ID integrity checks.
7. Setup and execution step components.
8. Muscle-role visualization without percentages.
9. Common-mistake and correction components.
10. Variation, progression, regression and substitution relationships.
11. Reviewed media panel with privacy-enhanced click-to-load behavior.
12. Source and review metadata.
13. Safe handling of draft, incomplete, deprecated and invalid records.
14. Responsive and WCAG 2.2 AA behavior.
15. Automated content, routing, filtering, media and accessibility tests.
16. `docs/exercise-encyclopedia.md`, `docs/content-governance/exercise-sources.md` and `docs/phases/phase-03.md`.
17. A stable handoff contract for Phase 04.

## 4. Scope boundaries

### 4.1 Build in this phase

- Exercise catalogue and detail interfaces.
- Strength, bodyweight, machine, cable, free-weight, power, plyometric, conditioning, cardio, warm-up, mobility and breathing exercise identities.
- Technique information and review workflow.
- Muscle roles and joint actions.
- Equipment and environment requirements.
- General programming contexts and evidence-qualified ranges.
- Media links, embed governance and fallback behavior.
- Source attribution, content status and review dates.
- Repository-owned seed taxonomy and validation.

### 4.2 Do not build in this phase

- Workout-plan generation or weekly schedules.
- Workout logging, set history, personal records or timers.
- Personalized exercise recommendations based on injuries or medical conditions.
- Injury diagnosis, rehabilitation protocols or treatment claims.
- AI form analysis, camera tracking or pose estimation.
- Community ratings, comments or trainer profiles.
- Authentication, Supabase, Firebase, Lovable Cloud or a runtime CMS.
- Automatic YouTube searching through an API.
- Downloaded or rehosted creator videos.
- Copied commercial exercise databases.
- Unreviewed AI-generated exercise descriptions.
- Exact EMG percentages, “best exercise” rankings or guarantees of muscle growth.

## 5. Product and learning model

The exercise page must support progressively deeper use.

| Level | User question | Default content |
| --- | --- | --- |
| Quick reference | “How do I do this now?” | Setup, numbered steps, key cues, video, primary muscles. |
| Practical learning | “What should I watch for?” | Common mistakes, corrections, breathing, range, alternatives. |
| Programming context | “How could this fit my goal?” | General ranges, rest, effort notes and qualifiers. |
| Technical detail | “Why is it classified this way?” | Joint actions, mechanics, muscle roles, evidence and review metadata. |

Do not bury the practical instructions beneath anatomy or research notes. Use progressive disclosure for advanced details.

## 6. Information architecture

### 6.1 Primary routes

| Route | Purpose |
| --- | --- |
| `/exercises` | Catalogue, search, filters, category navigation and result count. |
| `/exercises/$slug` | Canonical exercise detail page. |
| `/muscles/$slug` | Existing Phase 02 page; show related published exercises. |
| `/learn` | Existing learning hub; link to exercise catalogue. |
| `/about/sources` | Existing methodology page; link to exercise-content policy. |

### 6.2 Detail-page anchors

- `#overview`
- `#muscles`
- `#setup`
- `#execution`
- `#checkpoints`
- `#mistakes`
- `#variations`
- `#programming`
- `#safety`
- `#media`
- `#sources`

Anchor links must work with keyboard navigation, sticky headers and browser history.

### 6.3 Entry paths

Users must be able to reach an exercise through:

- Search by name or alias.
- Movement-pattern browse.
- Muscle-page relationship.
- Equipment filter.
- Exercise-type filter.
- Difficulty filter.
- Related variation or substitution.
- Direct URL.

## 7. Exercise-domain taxonomy

### 7.1 Exercise types

Use the controlled types from the Phase 03 schema:

- Resistance compound.
- Resistance isolation.
- Bodyweight strength.
- Power.
- Plyometric.
- Conditioning.
- Cardio.
- Mobility.
- Flexibility.
- Warm-up.
- Balance/stability.
- Breathing/bracing.

An exercise may have one canonical type and multiple goal tags. Do not create near-duplicate type labels.

### 7.2 Mechanics

Use:

- Compound.
- Isolation.
- Cyclical.
- Isometric.
- Mixed.
- Not applicable.

“Compound” and “isolation” are mechanical classifications, not quality ratings.

### 7.3 Laterality

Use:

- Bilateral.
- Unilateral.
- Alternating.
- Single-side.
- Not applicable.

### 7.4 Kinetic-chain classification

Use open, closed, mixed or not applicable. Do not display this classification prominently unless it helps the user; it primarily supports filtering and technical detail.

## 8. Naming and identity rules

1. Every exercise receives a stable `exercise_*` ID and immutable slug after publication.
2. Display names use familiar, neutral gym terminology.
3. Store aliases such as “military press” or regional spellings without creating duplicate records.
4. Do not encode equipment brand names in canonical records unless the exercise genuinely depends on a proprietary device.
5. Do not create separate records only because grip width, stance or minor cue changes.
6. Create a separate record when the movement, equipment setup, skill requirement or training use is materially different.
7. Use relationship fields for variations rather than duplicating full content.
8. Deprecated records redirect to the current canonical record and retain a migration note.
9. Exercise IDs used by workout logs in later phases must never be recycled.

## 9. Canonical data model

The attached JSON Schema is authoritative. The TypeScript implementation must mirror it without weakening required-field, enum, ID, relationship or publication constraints.

### 9.1 Core identity

- ID and slug.
- Display and canonical names.
- Aliases.
- Exercise type.
- Content status and version.

### 9.2 Classification

- Difficulty.
- Mechanics.
- Laterality.
- Kinetic chain.
- Movement patterns.
- Equipment.
- Environment and goal tags.

### 9.3 Knowledge content

- Summary.
- Muscle roles.
- Joint actions.
- Setup and execution.
- Checkpoints and cues.
- Mistakes and corrections.
- Relationships.
- Programming guidance.
- Safety.
- Media.
- Sources and review metadata.

## 10. Phase 02 muscle relationship model

Every published exercise must reference valid Phase 02 muscle IDs.

### 10.1 Allowed roles

- Primary.
- Secondary.
- Stabilizer.
- Dynamic stabilizer.
- Context-dependent.

### 10.2 Rules

- No numerical activation percentage is allowed unless a specific study, measurement method, population and limitation are displayed; the MVP should omit percentages entirely.
- A muscle cannot appear twice in the same exercise with contradictory roles.
- Roles may vary by technique, load or range. Use a qualifier rather than claiming a universal role.
- Prefer parent muscle records unless a subdivision-level claim is specifically supported.
- A published record requires at least one primary or context-dependent muscle role.
- Build-time validation must reject unknown or deprecated muscle IDs.
- Muscle pages must show only published exercise relationships.

## 11. Movement-pattern and equipment model

The attached seed taxonomy defines stable IDs. Lovable must load these taxonomies from data rather than hard-code filter labels inside components.

### 11.1 Equipment behavior

- Show required equipment, not every optional accessory.
- Separate “no equipment” from “bodyweight.”
- Support multiple equipment requirements.
- Do not claim an exercise is a home exercise solely because it uses dumbbells.
- Show environment tags such as rack required, limited space or spotter recommended only when reviewed.

### 11.2 Equipment substitutions

Equipment substitution is not automatically exercise equivalence. A substitution must be a reviewed relationship with a reason such as similar movement pattern, same main muscle group, reduced skill demand or different equipment access.

## 12. Technique instruction model

### 12.1 Required sequence

Every published technique record must contain:

1. Setup.
2. Starting position.
3. Numbered execution steps.
4. Finish or reset.
5. Breathing guidance when appropriate.
6. Range-of-motion guidance.
7. Key checkpoints.
8. Optional coaching cues.
9. Spotting notes where relevant.

### 12.2 Writing rules

- Use observable actions, not vague motivation.
- Keep each step to one primary action.
- State which body part moves and which remains controlled.
- Avoid absolute cue language when individual anatomy changes acceptable form.
- Explain a cue’s purpose when it could otherwise be misunderstood.
- Do not use pain as a normal target sensation.
- Do not tell users to hold their breath universally; breathing and bracing guidance must be context-qualified.
- Distinguish setup from execution.
- Distinguish a technique checkpoint from a safety warning.

### 12.3 Example structure

```text
Setup
1. Position the bench, rack and bar.
2. Establish stable foot and upper-body contact.

Execution
1. Unrack under control.
2. Lower through the reviewed path.
3. Press to the defined finish position.
4. Reset before the next repetition.
```

The application must not use this generic example as published bench-press content.

## 13. Programming-guidance model

Exercise pages may provide context, not a complete program.

### 13.1 Allowed contexts

- Skill learning.
- General fitness.
- Strength.
- Hypertrophy.
- Power.
- Muscular endurance.
- Conditioning.
- Warm-up.
- Mobility.

### 13.2 Rules

- Use ranges and qualifiers, not one universal number.
- Separate set, repetition, duration, rest, load and effort fields.
- Allow “context dependent,” “not applicable” and “insufficient evidence.”
- Every numeric range requires a source ID and confidence label.
- Exercise-specific programming must not contradict higher-level Phase 04 principles.
- Advanced methods such as drop sets, rest-pause and supersets are Phase 04 content.
- The 2026 ACSM position stand is the current high-level resistance-training baseline; it emphasizes that many forms of resistance training work, that prescription varies by outcome, and that consistency and high effort matter more than unnecessary complexity.
- Do not turn population-level recommendations into medical or personalized prescriptions.

## 14. Difficulty and prerequisite model

Difficulty is not determined by how hard a set feels. It describes technical and environmental demands.

| Level | Meaning |
| --- | --- |
| Foundation | Minimal setup and low coordination demand; useful for learning a pattern. |
| Beginner | Basic technique with limited prerequisites. |
| Intermediate | Requires stable pattern control, greater loading or more coordination. |
| Advanced | High technical demand, meaningful consequences for errors or substantial prerequisites. |
| Specialist | Coaching, specialized equipment or sport-specific skill strongly recommended. |

Each non-foundation record should list prerequisites or a regression when possible.

## 15. Safety and screening model

### 15.1 Boundaries

The application provides general exercise education. It does not determine medical readiness, diagnose injury or replace qualified assessment.

### 15.2 Required safety language

- Stop when a movement causes sudden, sharp, escalating or unfamiliar pain; loss of control; faintness; chest pressure; or other concerning symptoms.
- Use professional guidance when the user has a known condition, recent surgery, unexplained symptoms or uncertainty about safe participation.
- Do not use red warning banners for normal complexity or muscle effort.
- Do not present contraindication tags as diagnoses.
- Do not prescribe rehabilitation exercises for a specific injury.

### 15.3 Exercise-level safety fields

- Setup hazards.
- Equipment/rack requirements.
- Spotter recommendation.
- Prerequisites.
- Stop signals.
- Contextual cautions.

## 16. Content status and publication gates

| Status | Meaning | Public behavior |
| --- | --- | --- |
| Draft | Identity or incomplete content. | Excluded from public catalogue. |
| Review needed | Substantial content exists but has unresolved review. | Excluded or shown only in development. |
| Reviewed | Content passed subject review but may lack final media/licensing. | Preview only. |
| Published | All required fields, sources, reviews and media checks pass. | Public. |
| Deprecated | Replaced or removed. | Redirect or unavailable notice. |

A “published” flag must never bypass schema and cross-file validation.

## 17. Starter taxonomy and coverage contract

The attached seed contains **184 draft exercise identities** spanning major gym, home, bodyweight, conditioning and foundational mobility patterns.

The seed is deliberately not a completed content database. It establishes:

- Stable IDs and slugs.
- Broad exercise type.
- Movement-pattern references.
- Required equipment references.
- Draft status.

Before publication, every record needs reviewed muscle roles, technique, mistakes, programming guidance, safety, media and sources.

### 17.1 MVP publication target

The first production content pass should prioritize 100–120 high-value exercises with broad equipment and muscle coverage. Quality takes priority over publishing all seed identities.

### 17.2 Coverage audit

The build must report:

- Published records by movement pattern.
- Published records by body region and primary muscle group.
- Published records by equipment.
- Records missing regressions, media or review dates.
- Broken relationships and orphaned IDs.

## 18. `/exercises` catalogue page

### 18.1 Page structure

1. Page header and concise purpose statement.
2. Search input.
3. Quick browse chips for movement pattern and equipment.
4. Filter and sort controls.
5. Active-filter summary with clear-all.
6. Result count.
7. Responsive card/list results.
8. Empty and no-match states.
9. Source/methodology link.

### 18.2 Exercise card

Show:

- Exercise name.
- Exercise type.
- Primary muscle names derived from valid Phase 02 relationships.
- Main movement pattern.
- Required equipment.
- Difficulty.
- Reviewed video indicator when available.
- Optional saved state only through an existing generic local favourite primitive.

Do not show unsourced set/rep recommendations on catalogue cards.

### 18.3 Views

Support comfortable card and compact list views when Phase 01 patterns allow it. Store view preference locally, not in a profile.

## 19. Search, filter and sort behavior

### 19.1 Search index

Index:

- Display name.
- Canonical name.
- Aliases.
- Movement patterns.
- Equipment names.
- Muscle display names and aliases.
- Goal tags.

Use normalized case, whitespace and punctuation. Support common aliases without fuzzy matching that creates dangerous false results.

### 19.2 Required filters

- Exercise type.
- Primary muscle/training group.
- Movement pattern.
- Equipment.
- Difficulty.
- Mechanics.
- Laterality.
- Environment.
- Goal tag.
- Reviewed-video availability.

### 19.3 Filter logic

- Use OR inside a single filter group and AND across groups.
- Keep filters in URL query parameters.
- Restore state on reload and browser navigation.
- Ignore invalid query values safely.
- Show active filters as removable chips.
- Mobile filters open in an accessible sheet/dialog.

### 19.4 Sorting

- Relevance when searching.
- Name A–Z.
- Difficulty.
- Recently reviewed.

Never sort by invented effectiveness ranking.

## 20. Exercise detail page

### 20.1 Header

Show:

- Name and aliases.
- Exercise type, difficulty and mechanics.
- Equipment and environment.
- Primary muscles.
- Reviewed-content and last-reviewed metadata.
- Breadcrumbs.

### 20.2 Practical-first layout

The first viewport should prioritize:

- Concise overview.
- Demonstration media or reviewed visual.
- Setup and numbered execution.
- Key checkpoints.

Technical classification and full sources may appear later.

### 20.3 Required sections

1. Overview.
2. Muscles and actions.
3. Setup.
4. Execution.
5. Key checkpoints and cues.
6. Common mistakes and corrections.
7. Regressions, progressions, variations and substitutions.
8. General programming contexts.
9. Safety and stop signals.
10. Media.
11. Sources and review history.

## 21. Step-by-step execution interface

- Use semantic ordered lists.
- Allow a compact “gym mode” that enlarges steps and controls without hiding safety information.
- Preserve text when video fails.
- Do not require audio.
- Do not auto-advance steps.
- Avoid animation that implies a precise motion path unless the animation is reviewed.
- Provide print-friendly instructions.

## 22. Common mistakes and corrections

Every mistake card must include:

- What is observed.
- Why it matters.
- A practical correction.
- Severity: minor, performance or safety.
- Source IDs.

Do not shame users. Do not label normal anatomical variation as incorrect. Safety-severity items receive stronger visual treatment but remain readable in dark mode.

## 23. Exercise relationships

### 23.1 Relationship meanings

| Relationship | Meaning |
| --- | --- |
| Regression | Lower technical, load or range demand used to learn or scale the pattern. |
| Progression | Higher demand or added complexity with a clear prerequisite. |
| Variation | Same exercise family with a meaningful setup, grip, stance, path or equipment change. |
| Substitution | Alternative chosen for a stated reason; not automatically equivalent. |
| Prerequisite | Skill or exercise competency that should precede the record. |

### 23.2 Integrity rules

- All relationships use stable exercise IDs.
- No self-reference.
- No dead IDs.
- Reciprocal links are generated when semantically valid, not forced.
- Relationship cards state why the item is related.
- Deprecated targets are removed or migrated.

## 24. Video and media governance

### 24.1 Selection

Store reviewed links and metadata; do not scrape or download videos. Selection criteria:

- Clear full-body and relevant joint visibility.
- Technique consistent with the written record.
- No dangerous or contradictory instruction.
- Appropriate camera angle and playback quality.
- Captions available when possible.
- Creator/channel and review date recorded.
- Embed permission confirmed at review time.

### 24.2 Embed behavior

- Use click-to-load rather than autoplay.
- Prefer YouTube privacy-enhanced embeds with `youtube-nocookie.com` where applicable.
- Preserve standard player controls and branding.
- Use a responsive 16:9 container meeting the provider’s minimum player requirements.
- Use `origin` when the IFrame API is enabled.
- Default captions on when a reviewed caption track is available.
- Provide “Watch on YouTube” fallback.
- Handle disabled, removed, age-restricted or blocked embeds without breaking the page.
- Do not imply Fitness OS owns third-party videos.

### 24.3 Media availability checks

The app does not need a live YouTube API. Maintain a review report or optional build-time link check that never blocks the whole production build because a third-party service is unavailable.

## 25. Images, diagrams and animation

- Use repository-owned or properly licensed media.
- Store license, creator, credit and source.
- Provide alt text that describes exercise-relevant posture and movement.
- Do not use AI imagery as authoritative technique evidence without expert review and explicit labeling.
- Do not mirror copyrighted thumbnails or diagrams without permission.
- A decorative thumbnail cannot replace written execution steps.

## 26. Source governance

### 26.1 Source hierarchy

1. Current position stands and government guidelines for high-level programming and participation claims.
2. Systematic reviews and primary studies for biomechanics or exercise-specific claims.
3. Recognized textbooks and academic/professional technique resources.
4. Manufacturer manuals for equipment setup only.
5. Reviewed demonstration videos for visual technique support.

### 26.2 Claim rules

- Each muscle-role, joint-action, numeric range and safety-specific claim needs source IDs.
- Do not cite a video as the only source for anatomy or programming.
- Record publication date, review date and source type.
- When sources disagree, describe the limitation or use context-dependent wording.
- Do not copy long passages. Write original summaries.

### 26.3 Review cadence

- Review pages at least every 24 months.
- Review sooner when a major position stand changes, a safety issue is identified or a linked video changes.
- Show the user the content review date, not every internal workflow detail.

## 27. Content ingestion and review workflow

1. Create or select the stable exercise identity.
2. Validate naming, type, movement pattern and equipment.
3. Map Phase 02 muscles and joint actions with sources.
4. Draft setup and execution from sources.
5. Add mistakes and corrections.
6. Add relationships.
7. Add contextual programming guidance.
8. Add safety fields.
9. Select and review media.
10. Perform technique, anatomy, safety and media review.
11. Run schema and relationship validation.
12. Publish only when all gates pass.

Lovable must never “complete missing fields” using unsourced generated text.

## 28. Data validation rules

Build-time validation must reject:

- Duplicate IDs or slugs.
- Unknown movement, equipment, muscle or exercise relationship IDs.
- Published records missing required content.
- Empty execution steps.
- Numeric programming ranges without source IDs.
- Invalid min/max ranges.
- Contradictory muscle roles.
- Self-referential relationships.
- Media marked reviewed without review date.
- Published media with invalid URLs or missing credit/license state.
- Published records with overdue or absent critical reviews.
- Deprecated targets still used by published relationships without migration.

## 29. Technical implementation contract

### 29.1 Storage

Use repository-owned JSON or TypeScript data, validated at build time. Do not add a runtime backend or CMS.

### 29.2 Recommended project structure

```text
src/
  features/exercises/
    components/
    data/
    schemas/
    search/
    routes/
    utils/
  features/muscles/
  shared/
data/
  exercises/
  taxonomies/
docs/
  content-governance/
  phases/
scripts/
  validate-content/
```

Adapt to the existing Lovable scaffold without migrating frameworks.

### 29.3 Required generated indexes

- Exercise ID index.
- Slug index.
- Alias index.
- Movement-pattern index.
- Equipment index.
- Muscle-to-exercise index.
- Exercise relationship graph.
- Search index.

Indexes must derive from validated data and must not become a second manual source of truth.

### 29.4 Routing

- Pre-generate published exercise routes when supported.
- Invalid slugs show safe not-found behavior.
- Deprecated slugs redirect to the replacement when configured.
- Draft records are inaccessible in production.

## 30. Component catalogue

At minimum:

- `ExerciseCard`.
- `ExerciseCompactRow`.
- `ExerciseSearch`.
- `ExerciseFilterPanel`.
- `ExerciseSort`.
- `ActiveFilterChips`.
- `ExerciseMetadata`.
- `MuscleRoleList`.
- `TechniqueSteps`.
- `CheckpointList`.
- `MistakeCorrectionCard`.
- `ExerciseRelationshipGroup`.
- `ProgrammingGuidanceTable`.
- `SafetyNotice`.
- `ReviewedMediaPlayer`.
- `SourceList`.
- `ReviewMetadata`.
- `ExerciseUnavailableState`.

Reuse Phase 01 primitives. Do not create a second design system.

## 31. Local saved-state impact

This phase may support local favourites only when a generic Phase 01 saved-item contract already exists or can be added minimally.

- Store only exercise IDs and timestamps.
- Handle deleted/deprecated IDs gracefully.
- No account or synchronization.
- Favourites are not proof of completed exercise.
- Workout logs belong to Phase 06.

## 32. Responsive behavior

### Desktop

- Two-column detail layout may keep a media/summary rail sticky when space permits.
- Filters may remain in a side panel.
- Technique content must retain readable line length.

### Tablet

- Collapse filters into a drawer or sheet.
- Avoid cramped multi-column programming tables.

### Mobile

- Single-column detail flow.
- Large tap targets.
- Bottom sheets must not obscure focus.
- Tables convert to stacked cards when horizontal scrolling would impair use.
- Video remains within viewport.
- “Gym mode” text remains usable at 320 CSS pixels.

## 33. Accessibility requirements

Meet WCAG 2.2 AA, including:

- Semantic headings and lists.
- Full keyboard access.
- Visible, unobscured focus.
- Minimum target sizing consistent with the design system.
- Accessible names for filters and media controls.
- Captions for prerecorded synchronized media when Fitness OS owns the media; for third-party media, expose caption availability and retain complete text instructions.
- Text alternatives for instructional images.
- No color-only distinction for muscle roles, severity or status.
- Reduced-motion support.
- Correct dialog focus trapping and return.
- 200% zoom and reflow testing.

## 34. Performance requirements

- Catalogue interaction should remain responsive with at least 500 records.
- Lazy-load third-party media and noncritical images.
- Do not load YouTube iframes before user action.
- Keep search and filters client-local with a compact derived index.
- Avoid shipping full source prose in client bundles when summaries and citations suffice.
- Prevent layout shift with reserved media dimensions.

## 35. SEO and metadata

For published exercise pages:

- Unique title and description.
- Canonical route.
- Open Graph metadata when reviewed media exists.
- Structured data only when accurate and supported by the implementation.
- Draft and internal review pages must not be indexed.
- Avoid titles claiming “best,” “perfect,” “guaranteed” or medical outcomes.

## 36. Privacy

- Third-party media is click-to-load.
- Explain that opening or playing external media may contact that provider.
- Use privacy-enhanced YouTube mode where applicable.
- Do not add analytics or tracking pixels in this phase.
- Local favourites remain device-local.

## 37. Error and edge states

Handle:

- No catalogue results.
- Invalid query parameters.
- Unknown exercise slug.
- Draft or unpublished route.
- Deprecated exercise with and without replacement.
- Missing optional image.
- Video unavailable, blocked or embedding disabled.
- Source URL unavailable.
- Relationship target missing.
- Muscle reference removed or deprecated.
- Local favourite references a removed exercise.

The page must retain written technique when media fails.

## 38. Required automated tests

### Data and schema

- Valid record passes.
- Published incomplete record fails.
- Duplicate ID/slug fails.
- Unknown Phase 02 muscle ID fails.
- Unknown movement/equipment ID fails.
- Invalid programming range fails.
- Unsourced numeric guidance fails.
- Self-reference fails.
- Missing media review fails.

### Search and filters

- Alias search.
- Muscle-name search.
- Equipment and movement filters.
- OR within group and AND across groups.
- URL state restoration.
- Invalid query-value handling.
- Relevance sorting under search.

### Routing and relationships

- Published detail route.
- Draft route unavailable.
- Deprecated redirect.
- Broken relationship detection.
- Muscle-to-exercise relationship generation.

### Media

- Iframe absent before user action.
- Privacy-enhanced domain when used.
- No autoplay.
- External fallback available.
- Unavailable video does not remove text.

### Accessibility

- Keyboard filters and dialogs.
- Focus return.
- Semantic ordered steps.
- Accessible media title.
- No critical automated axe violations on catalogue and detail templates.

### Build

- Type-check.
- Lint.
- Unit tests.
- Content validation.
- Production build.

## 39. Manual testing matrix

Test at minimum:

| Area | Cases |
| --- | --- |
| Viewports | 320, 375, 768, 1024 and 1440 CSS pixels. |
| Themes | Light, dark and system. |
| Input | Keyboard, mouse and touch. |
| Zoom | 100%, 200% and browser text enlargement. |
| Search | Exact name, alias, muscle, typo/no match. |
| Filters | Single, multiple, clear, URL reload and browser back. |
| Detail | All sections, anchor links, print, no image, no video. |
| Media | Load, captions, fallback, blocked embed, external navigation. |
| Status | Published, draft, deprecated and invalid slug. |
| Relationships | Variation, regression, progression and substitution. |
| Resilience | JavaScript error boundary and corrupted local favourite. |

## 40. Required content-review checklist

Before a record becomes published:

- Canonical identity and aliases are correct.
- Phase 02 muscle IDs are valid.
- Muscle roles and joint actions have sources.
- Setup and execution are complete and observable.
- Breathing and range guidance are appropriately qualified.
- Mistakes have corrections and sources.
- Difficulty and prerequisites are justified.
- Programming ranges have context, source and confidence.
- Safety text does not diagnose or prescribe treatment.
- Video matches the written technique.
- Embed permission and caption availability were checked.
- Media credits and license state are stored.
- Technique, anatomy, safety and media review dates exist.
- No copied prose or fabricated precision remains.

## 41. Lovable implementation sequence

1. Audit Phase 00–02 code, routes, tokens and data contracts.
2. Add Phase 03 schema and validation without changing Phase 02 IDs.
3. Import the seed taxonomy as draft identities.
4. Build derived indexes and integrity reports.
5. Build catalogue search, filters, sorting and URL state.
6. Build the detail template with fixture-only reviewed sample data.
7. Build relationship and source components.
8. Build click-to-load media behavior.
9. Connect published muscle relationships to Phase 02 pages.
10. Add errors, redirects and draft exclusion.
11. Add tests and content-review reports.
12. Run accessibility, responsive and production-build checks.
13. Update documentation.
14. Report acceptance status and limitations.

Do not bulk-generate publishable content during implementation.

## 42. Protected boundaries

Lovable must preserve:

- Phase 00 no-authentication and local-first decisions.
- Phase 01 shell, routes, design tokens and shared primitives.
- Phase 02 muscle IDs, taxonomy and detail pages.
- Existing working themes and accessibility behavior.
- Repository ownership and Vercel compatibility.

Lovable must not:

- Migrate the framework.
- Introduce a backend or database.
- Rename stable IDs.
- Replace reviewed content with generated text.
- Refactor unrelated phases.
- Build workout plans, logging, nutrition or recovery features.

## 43. Phase 03 acceptance criteria

Phase 03 passes only when all are true:

1. `/exercises` and `/exercises/$slug` work inside the Phase 01 shell.
2. Only published records appear publicly.
3. Exercise data validates against the attached schema.
4. Every published muscle reference resolves to Phase 02.
5. Search covers names, aliases, muscles, equipment and movement patterns.
6. Filters use controlled taxonomies and restore from URL state.
7. Catalogue results remain responsive with 500 fixture records.
8. Exercise detail is practical-first and includes complete written steps.
9. Common mistakes include reasons and corrections.
10. Relationships use stable IDs and contain no broken/self references.
11. Programming guidance is contextual, sourced and range-based.
12. No EMG rankings, universal prescriptions or medical treatment claims exist.
13. Third-party media is reviewed, credited and click-to-load.
14. YouTube embeds use privacy-enhanced mode where applicable, no autoplay and a fallback link.
15. Written instructions remain available when media fails.
16. Draft, deprecated and invalid routes behave safely.
17. Keyboard, zoom, reflow, dark mode and mobile tests pass.
18. Type-check, lint, tests, content validation and production build pass.
19. Required documentation and integrity reports exist.
20. Phase 04 can reference stable exercise IDs without migration.

## 44. Phase 03 Plan-mode prompt

```text
Read all attached Phase 00–03 documents and JSON files completely. Do not modify code.

Prepare a formal implementation plan for Phase 03 only. Audit the existing framework, Phase 01 shell, Phase 02 anatomy contracts, routes, shared components, content validation and tests. List exact files to create, modify and protect. Map the Phase 03 JSON Schema into strict TypeScript validation without weakening publication gates. Define the repository-owned exercise loader, cross-file muscle validation, movement/equipment taxonomies, derived indexes, catalogue search/filter/sort with URL state, practical-first detail page, technique/mistake/relationship/programming components, click-to-load privacy-enhanced media, safe draft/deprecated states, documentation and tests mapped to every acceptance criterion.

Non-negotiable: no authentication, backend, Supabase, Lovable Cloud, runtime CMS, exercise scraping, automatic YouTube search, unlicensed database import, generated publishable technique, EMG rankings, medical diagnosis, injury treatment, workout-plan generation or workout logging. Preserve Phases 00–02 and all stable IDs.

End with every Phase 03 acceptance criterion and request approval.
```

## 45. Phase 03 Agent-mode implementation prompt

```text
Implement the approved Phase 03 plan exactly. Build only the Exercise Encyclopedia on top of Phases 00–02.

Use repository-owned validated data and the attached draft seed taxonomy. Do not fabricate missing exercise facts or mark draft identities published. Reference Phase 02 muscle IDs directly. Implement the catalogue, URL filters, search, sorting, detail template, written setup/execution, muscle roles, mistakes/corrections, relationships, contextual programming display, safety, sources, review metadata and click-to-load reviewed media. Preserve written instructions when media fails.

Run schema and cross-file validation, type-check, lint, automated tests, production build, accessibility checks and responsive inspection. Update docs/exercise-encyclopedia.md, docs/content-governance/exercise-sources.md and docs/phases/phase-03.md. Report exact files changed, commands/results, known limitations and acceptance status.
```

## 46. Phase 03 verification prompt

```text
Audit the implementation against the complete Phase 03 specification. Produce a table with criterion, pass/fail, evidence, files and required fix.

Verify scope boundaries; no backend/authentication; Phase 02 ID integrity; schema publication gates; search and URL filter restoration; practical-first detail pages; complete text when media fails; contextual and sourced programming ranges; no EMG rankings or medical advice; relationship integrity; privacy-enhanced click-to-load video; mobile, dark mode, keyboard, focus, captions, zoom and reflow; and all validation/test/build results.

Fix only verified Phase 03 defects. Preserve passing Phase 00–02 behavior and rerun the relevant checks.
```

## 47. Content-ingestion prompt

```text
Import only the reviewed exercise records I attach. Validate each record against the Phase 03 schema and the Phase 02 muscle taxonomy. Do not rewrite factual fields, add unsourced technique, infer missing muscle roles, create numeric programming ranges, or mark a record published when required source, review, safety or media fields are incomplete.

Before changing the application, return a rejected-record report listing the record ID, exact field path, error, missing dependency and corrective action. Import only records that pass every publication gate.
```

## 48. Focused correction prompt

```text
Correct only the verified Phase 03 defects below. Preserve all passing Phase 00–03 behavior. Identify root cause, exact file impact, smallest fix and regression test. Run relevant content validation, type-check, lint, tests and production build. Do not redesign, migrate frameworks, add a backend or expand into workout science/programming.

[PASTE VERIFIED DEFECTS]
```

## 49. Phase 04 handoff requirements

Phase 04 must receive:

- Stable exercise IDs and slugs.
- Exercise types and movement patterns.
- Equipment taxonomy.
- Phase 02 muscle-role relationships.
- Difficulty and prerequisite fields.
- Contextual programming fields clearly separated from general training principles.
- Relationship graph.
- Source and confidence metadata.
- Published-record selector and content snapshot/version rules.

Phase 04 must not rewrite exercise technique content.

## 50. Completion definition

Phase 03 is complete when:

- All acceptance criteria pass.
- The public library contains only reviewed/published records.
- Draft seed identities remain protected from accidental publication.
- Exercise and muscle relationships validate.
- Media is governed and resilient.
- Documentation is current.
- A GitHub checkpoint named `phase-03-exercise-encyclopedia-complete` exists.
- Phase 04 can begin without schema migration.

## 51. Reference and verification baseline

Use these sources as the initial policy baseline; exercise-specific records still need their own reviewed sources.

1. American College of Sports Medicine. *Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults: An Overview of Reviews.* Medicine & Science in Sports & Exercise, 2026. DOI: 10.1249/MSS.0000000000003897.
2. American College of Sports Medicine. Official 2026 resistance-training guidance and position-stand materials.
3. U.S. Department of Health and Human Services. *Physical Activity Guidelines for Americans, Second Edition* and current Move Your Way materials.
4. Google/YouTube. Official embedded-player, privacy-enhanced mode, player-parameter and developer-policy documentation.
5. W3C Web Accessibility Initiative. *Web Content Accessibility Guidelines (WCAG) 2.2*, including prerecorded media, focus, reflow and target requirements.
6. Phase 02 canonical anatomy taxonomy and source-governance rules.

The application must record exact sources used for every published exercise rather than treating this baseline as a substitute for exercise-level verification.
