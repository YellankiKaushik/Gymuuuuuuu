# Phase 04 — Workout Science

**Project:** Fitness Knowledge and Tracking Application  
**Working product name:** Fitness OS  
**Document type:** Lovable implementation specification  
**Phase:** 04 of 20  
**Version:** 1.0  
**Date:** 5 August 2026  
**Status:** Ready for Lovable Plan mode

---

## Document purpose

This document tells Lovable exactly how to build the Workout Science module on top of the completed Phase 00 foundation, Phase 01 application shell, Phase 02 Muscle and Functional Anatomy Library and Phase 03 Exercise Encyclopedia.

Phase 04 is the application's canonical training-principles and programming-logic knowledge layer. It must explain how resistance-training variables interact, how different goals change decision-making, why rigid universal prescriptions are usually misleading, and how a user can interpret concepts such as volume, load, frequency, effort, RPE, RIR, failure, rest, range of motion, tempo, progression, fatigue, deloading and periodization.

This phase must not generate a personalized program, diagnose fatigue or injury, promise outcomes, or present one advanced method as universally superior. Its responsibility is to teach a transparent decision framework that later workout-program and tracking phases can reference without duplicating or contradicting the science content.

The module has four responsibilities:

1. Explain the major resistance-training concepts in practical language.
2. Preserve nuance, population limits, uncertainty and source traceability.
3. Provide stable science-topic IDs and machine-readable claims that later phases can reference.
4. Prevent Lovable or future content imports from turning incomplete evidence into rigid universal rules.

## How to use this document in Lovable

1. Open the existing project only after Phases 00–03 pass their acceptance criteria.
2. Keep the Phase 00 Project Knowledge active.
3. Attach the Phase 00, Phase 01, Phase 02, Phase 03 and Phase 04 Markdown specifications.
4. Attach `Phase_02_Muscle_Data_Schema.json`, `Phase_02_Seed_Taxonomy.json`, `Phase_03_Exercise_Data_Schema.json`, `Phase_03_Seed_Exercise_Taxonomy.json`, `Phase_04_Workout_Science_Data_Schema.json` and `Phase_04_Seed_Workout_Science_Taxonomy.json`.
5. Attach `Phase_04_Lovable_Prompt_Package.txt`.
6. Run the Phase 04 Plan-mode prompt before any code changes.
7. Reject any plan that invents factual articles, creates a program generator, adds authentication or a backend, introduces unsourced numeric prescriptions, rewrites Phase 03 exercise technique, or publishes draft science records.
8. Approve implementation only after Lovable maps every requirement to exact routes, files, components, validation rules and tests.
9. Run the Agent-mode prompt and then the verification prompt.
10. Correct all Phase 04 defects before Phase 05 begins.
11. Create a stable GitHub checkpoint named `phase-04-workout-science-complete`.

---

## 1. Phase objective

Build a structured, searchable, accessible and evidence-governed Workout Science library containing:

- A canonical catalogue of training concepts and advanced methods.
- Practical definitions and decision frameworks.
- Goal-specific interpretation for strength, hypertrophy, power, muscular endurance and general physical function.
- Explanations of volume, load, frequency, repetitions, sets, rest intervals, range of motion, tempo, exercise order and exercise selection.
- Effort and fatigue concepts including RPE, RIR, proximity to failure, velocity loss, soreness and readiness.
- Progression methods and plateau troubleshooting.
- Periodization, mesocycles, microcycles, deloading and autoregulation.
- Advanced set structures such as supersets, drop sets, rest-pause and clusters, with clear limitations.
- Evidence summaries that distinguish strong findings, uncertain findings and context-dependent findings.
- Stable topic IDs and claim IDs that later program and tracking modules can reference.
- Repository-owned structured data with publication gates and build-time validation.

The phase is complete only when a user can learn a concept, understand its practical significance and limits, compare related concepts, and follow links into relevant exercises without receiving a personalized prescription.

## 2. Dependencies and assumptions

### 2.1 Required outputs from earlier phases

The project must already have:

- Strict TypeScript and the responsive Phase 01 shell.
- Light, dark and system themes.
- Shared cards, filters, tabs, disclosures, tables, badges, citations, feedback states and page-layout primitives.
- Phase 02 canonical muscle IDs.
- Phase 03 canonical exercise IDs, movement patterns, equipment taxonomy, difficulty and contextual programming fields.
- Repository-owned static content loading and validation.
- No authentication, runtime content database or cloud personal profile.

Lovable may repair a missing prerequisite only when the repair is minimal, documented and does not redesign an earlier phase.

### 2.2 Cross-phase ownership

| Concept | Owning phase | Phase 04 rule |
| --- | --- | --- |
| Muscles and anatomy | Phase 02 | Link to existing IDs; do not restate anatomy records. |
| Exercise identity and technique | Phase 03 | Link to exercise IDs; do not duplicate setup or technique. |
| Training principles and methods | Phase 04 | This phase is the single source of truth. |
| Weekly workout programs | Phase 05 | Reference Phase 04 topic IDs; do not build here. |
| Workout logging and progression history | Phase 06 | Reference topic IDs and record actual performance later. |
| Nutrition and recovery | Later phases | Cross-link only where directly relevant. |
| Personalized recommendations | Later optional intelligence layer | Not permitted in Phase 04. |

## 3. Required deliverables

Lovable must produce:

1. `/learn/workout-science` catalogue and learning-hub page.
2. `/learn/workout-science/$slug` canonical topic-detail template.
3. `/learn/workout-science/methods` advanced-method catalogue view.
4. `/learn/workout-science/glossary` controlled terminology index.
5. Search, filtering, sorting and URL-state behavior.
6. Goal-based and experience-level learning paths.
7. Evidence-summary and claim-quality components.
8. Practical decision-framework components.
9. Comparison tables for related concepts.
10. Source, population, limitation and review metadata.
11. Draft, reviewed, published, deprecated and invalid record handling.
12. Canonical TypeScript types and JSON-schema validation.
13. Cross-file validation for Phase 03 exercise IDs and Phase 04 topic relationships.
14. Responsive and WCAG 2.2 AA behavior.
15. Automated data, routing, search, accessibility and build tests.
16. `docs/workout-science.md`, `docs/content-governance/workout-science-evidence.md` and `docs/phases/phase-04.md`.
17. A stable handoff contract for Phase 05.

## 4. Scope boundaries

### 4.1 Build in this phase

- Workout-science catalogue and detail interfaces.
- Resistance-training variables and adaptation concepts.
- Practical educational decision frameworks.
- Goal-specific and experience-specific interpretation.
- Advanced set-method education.
- Evidence strength, confidence, population and limitation display.
- Myth-versus-evidence sections when supported by sources.
- Related exercises, muscles and science-topic relationships.
- Controlled glossary and terminology aliases.
- Repository-owned draft taxonomy and strict publication validation.

### 4.2 Do not build in this phase

- Personalized workout-plan generation.
- Weekly schedules, program templates or exercise-day assignment.
- Workout logging, rest timers, personal records or progression history.
- Calorie, nutrition, recovery or sleep tracking.
- Medical screening, injury diagnosis, rehabilitation plans or return-to-sport protocols.
- Automatic readiness scores or fatigue diagnosis.
- AI coaching, chat recommendations or adaptive programming.
- Authentication, Supabase, Firebase, Lovable Cloud or runtime CMS.
- Unsourced formulas presented as precise biological truth.
- “Best workout method” rankings based on weak or incomparable evidence.
- Exact hypertrophy guarantees, exact recovery deadlines or universal weekly-set targets.
- Unreviewed AI-generated publishable science content.

## 5. Product and learning model

The module must support progressive depth.

| Level | User question | Default content |
| --- | --- | --- |
| Quick answer | “What does this term mean?” | Plain-language definition and three key takeaways. |
| Practical application | “How does this affect training?” | Decision framework, examples and common errors. |
| Goal context | “Does this change for strength or muscle growth?” | Goal-specific interpretation and qualifiers. |
| Evidence detail | “How certain is this?” | Claims, source hierarchy, populations, limitations and review dates. |
| Connected learning | “What should I read next?” | Related topics, exercises and later program links. |

The first screenful of every topic must answer the practical question. Research detail must remain available but should not obscure the main explanation.

## 6. Information architecture

### 6.1 Primary routes

| Route | Purpose |
| --- | --- |
| `/learn/workout-science` | Topic catalogue, learning paths, search and featured foundations. |
| `/learn/workout-science/$slug` | Canonical topic detail page. |
| `/learn/workout-science/methods` | Advanced resistance-training methods catalogue. |
| `/learn/workout-science/glossary` | Alphabetical and category-based terminology index. |
| `/exercises/$slug` | Existing Phase 03 page; display linked science topics. |
| `/learn` | Existing learning hub; feature Workout Science. |
| `/about/sources` | Existing methodology page; link to workout-science evidence policy. |

### 6.2 Detail-page anchors

- `#overview`
- `#why-it-matters`
- `#how-it-works`
- `#goal-context`
- `#decision-framework`
- `#examples`
- `#mistakes`
- `#evidence`
- `#limitations`
- `#related`
- `#sources`

Anchor navigation must work with keyboard navigation, sticky headers, browser history and direct links.

### 6.3 Entry paths

Users must be able to reach a topic through:

- Search by canonical name, alias or glossary term.
- Browse by category.
- Goal-based learning path.
- Experience-level learning path.
- Related exercise page.
- Related topic relationship.
- Advanced-method catalogue.
- Direct URL.

## 7. Workout-science domain taxonomy

### 7.1 Topic categories

Use these controlled categories:

- Foundations.
- Adaptations and goals.
- Training variables.
- Effort and fatigue.
- Progression.
- Program design.
- Periodization and autoregulation.
- Advanced methods.
- Measurement and interpretation.
- Safety boundaries.

### 7.2 Content types

Each record has one canonical content type:

- Concept.
- Training variable.
- Adaptation.
- Method.
- Measurement.
- Decision guide.
- Glossary term.

### 7.3 Goal tags

Use:

- General fitness.
- Strength.
- Hypertrophy.
- Power.
- Muscular endurance.
- Physical function.
- Skill acquisition.

A topic can have multiple goal tags. A goal tag indicates relevance, not a recommendation.

### 7.4 Experience tags

Use:

- Foundation.
- Beginner.
- Intermediate.
- Advanced.
- Coach/research detail.

A topic may appear in multiple learning paths. Advanced does not mean superior; it means the topic requires more training context or execution control.

## 8. Naming and identity rules

1. Every topic receives a stable `science_*` ID and immutable slug after publication.
2. Use plain, recognized terminology as the display name.
3. Store aliases such as “intensity of effort,” “reps in reserve” and common abbreviations without creating duplicate records.
4. Define ambiguous terms explicitly. For example, “intensity” may mean load relative to one-repetition maximum or perceived effort; the interface must not silently mix them.
5. Do not use marketing labels as canonical scientific terms.
6. Split records when two concepts require materially different definitions or decision rules.
7. Use relationship fields for synonyms, prerequisites and comparisons.
8. Deprecated records redirect to a current canonical topic and retain a migration note.
9. IDs referenced by later programs or logs must never be recycled.

## 9. Canonical data model

The attached JSON Schema is authoritative. TypeScript validation must mirror it without weakening required fields, enums, IDs, source requirements or publication gates.

### 9.1 Core identity

- Stable ID and slug.
- Display name and short title.
- Aliases and abbreviations.
- Topic category and content type.
- Goal and experience tags.
- Content status and version.

### 9.2 Educational content

- Plain-language definition.
- Short summary.
- Why it matters.
- Key takeaways.
- How it works.
- Goal-specific interpretation.
- Decision framework.
- Practical examples.
- Common mistakes and corrections.
- Myths and evidence-based correction.
- Limitations and uncertainty.

### 9.3 Evidence content

- Atomic claims.
- Claim type.
- Outcome and population.
- Evidence level.
- Confidence.
- Direction and effect qualifier.
- Source IDs.
- Limitations.
- Last verified date.

### 9.4 Relationships

- Prerequisite topics.
- Related topics.
- Commonly confused topics.
- Compared topics.
- Relevant Phase 03 exercise IDs.
- Relevant Phase 02 muscle IDs only when necessary.
- Later Phase 05 program references, initially empty.

## 10. Evidence and claim model

### 10.1 Atomic claim rule

Every factual statement that could alter training decisions must be representable as a separate claim. Do not hide multiple conclusions inside one long paragraph.

Each claim must identify:

- What is being claimed.
- Which outcome it concerns.
- Which population was studied.
- Direction of effect.
- Strength and certainty of evidence.
- Source or sources.
- Important limitations.
- Date last checked.

### 10.2 Evidence levels

Use these labels:

| Level | Meaning | Display rule |
| --- | --- | --- |
| High | Consistent high-quality synthesis or authoritative position stand with applicable evidence. | “Higher confidence” badge; still show population limits. |
| Moderate | Multiple studies or synthesis with meaningful limitations or inconsistency. | “Moderate confidence” badge. |
| Low | Limited studies, indirect evidence, substantial bias or imprecision. | “Limited evidence” badge. |
| Very low | Preliminary, highly indirect or conflicting evidence. | Do not turn into numeric guidance. |
| Consensus/practice | Professional convention or practical framework not established as a superior biological method. | Label as practice framework, not outcome proof. |

Do not convert evidence level into a numerical score visible to users.

### 10.3 Confidence language

Allowed language includes:

- “Generally supported.”
- “Likely useful in this context.”
- “Evidence is mixed.”
- “No consistent advantage has been established.”
- “The exact dose-response relationship remains uncertain.”
- “This finding may not generalize to all populations.”

Disallowed language includes:

- “Guaranteed.”
- “Scientifically proven best.”
- “Works for everyone.”
- “Always.”
- “Never,” unless describing a technical data rule or explicit safety boundary.

### 10.4 Population applicability

Every published claim must specify applicable populations such as:

- Healthy adults.
- Resistance-trained adults.
- Untrained adults.
- Older adults.
- Youth athletes.
- Clinical or rehabilitating populations.
- Mixed population.

Clinical evidence must not be generalized to healthy users or vice versa without an explicit limitation.

## 11. Standard topic-page structure

Every published topic page must use this sequence:

1. Title, category and confidence summary.
2. One-sentence definition.
3. Three to six key takeaways.
4. Why it matters.
5. How the concept works.
6. Goal-specific interpretation.
7. Practical decision framework.
8. Worked examples that are clearly non-personalized.
9. Common mistakes and corrections.
10. Evidence summary.
11. Limitations and unresolved questions.
12. Related topics and exercises.
13. Sources and review metadata.

For short glossary records, sections may be compact, but publication gates remain mandatory.

## 12. Core training-variable model

### 12.1 Training volume

The module must distinguish:

- Sets per exercise.
- Direct sets per muscle group.
- Indirect or fractional contribution.
- Repetitions.
- Volume load or tonnage.
- Session volume.
- Weekly volume.
- Effective or hard-set concepts as practical models rather than directly measured biological units.

Rules:

- Do not present tonnage as a complete measure of hypertrophy stimulus.
- Do not present a single weekly-set number as optimal for every user.
- Explain diminishing returns, recoverability and individual response.
- Identify whether a recommendation refers to direct sets, total sets or study-specific counting.
- Preserve the distinction between a minimum effective dose, a useful working range and a maximum recoverable amount; do not imply these are precisely measurable universal thresholds.

### 12.2 Load and relative intensity

The module must distinguish:

- External load.
- Percentage of one-repetition maximum.
- Repetition-maximum range.
- Absolute load.
- Relative load.
- Perceived effort.

Rules:

- Do not use “intensity” without specifying whether it means load or effort.
- Explain that heavier loads generally have greater specificity for maximal-strength outcomes.
- Explain that hypertrophy can occur across a wider load range when sets provide sufficient effort, while preserving uncertainty around exact thresholds.
- Do not require failure on every set.

### 12.3 Frequency

The module must distinguish:

- Sessions per week.
- Times a movement is practiced.
- Times a muscle group is trained.
- Frequency used to distribute weekly volume.

Rules:

- Do not claim that a split name determines results.
- Explain that frequency interacts with volume, skill practice, recovery and session length.
- Show that volume-equated comparisons can differ from non-volume-equated comparisons.

### 12.4 Repetitions and sets

The module must explain:

- Repetitions are an outcome of load, effort, tempo and exercise constraints.
- Rep ranges are practical zones, not hard biological borders.
- Warm-up sets, working sets, back-off sets and technique sets are different.
- Set counts must identify whether they are per exercise, session, muscle or week.

### 12.5 Rest intervals

The module must explain:

- Rest is a programming variable affecting performance retention, density and session duration.
- More demanding compound or strength-oriented sets commonly require more recovery than low-load isolation work.
- Rest should not be shortened solely to create fatigue when performance quality is the objective.
- Fixed rest times are starting points, not a diagnosis of readiness.

### 12.6 Range of motion

The module must explain:

- Full range of motion is a goal-dependent and person-specific concept constrained by anatomy, exercise setup and control.
- A controlled, tolerable range is not identical for every user.
- Partial ranges can be deliberate tools but should not be presented as automatically superior.
- Painful range must not be forced.
- Exercise technique remains owned by Phase 03.

### 12.7 Tempo and velocity intent

The module must distinguish:

- Actual repetition duration.
- Prescribed tempo.
- Concentric intent.
- Eccentric control.
- Pauses.
- Velocity loss.

Rules:

- Do not imply that one slow tempo is universally optimal for muscle growth.
- Explain that excessive slowing can change usable load and repetition count.
- Power content must distinguish moving fast from intending to move fast against a heavy load.

### 12.8 Exercise order and selection

The module must explain:

- Earlier exercises generally receive greater freshness and practice quality.
- Priority exercises can be placed earlier when their performance is the primary objective.
- Exercise order is a trade-off involving skill, safety, fatigue and goals.
- Phase 04 does not decide a user's exercise list.

### 12.9 Training density

Define density as work completed relative to time, with caveats:

- Higher density is not automatically better.
- Density can be progressed through rest changes, set structures or work capacity.
- Shortening rest may reduce load or repetition performance.
- Density must not replace technique and outcome-specific decisions.

## 13. Goal-specific interpretation

Every major variable page must include a goal-context matrix.

| Goal | Main emphasis | Required nuance |
| --- | --- | --- |
| Strength | Skill with heavy loading, exercise specificity, quality repetitions and sufficient rest. | Strength is movement-specific; hypertrophy and technique also contribute. |
| Hypertrophy | Sufficient weekly volume, effort, exercise selection, progression and recovery. | No single rep range or method is mandatory. |
| Power | High movement intent, appropriate load, low-to-moderate fatigue and quality repetition speed. | Fatigue can reduce power output; technical competence matters. |
| Muscular endurance | Repeated force production and task-specific fatigue tolerance. | Local endurance differs by movement, load and duration. |
| Physical function | Transfer to meaningful tasks, adherence, strength, power and balance as relevant. | Population and ability constraints must remain explicit. |

This matrix is educational. It must not output a personalized prescription.

## 14. Progressive overload and progression methods

The module must define progressive overload as a long-term requirement for continued adaptation, not a command to add weight every session.

### 14.1 Supported progression levers

- Load.
- Repetitions.
- Sets.
- Range of motion.
- Technique quality.
- Exercise difficulty.
- Movement velocity or power quality.
- Density.
- Frequency.
- Reduced assistance.
- Increased control or pause demands.

### 14.2 Required progression concepts

- Single progression.
- Double progression.
- Rep-first progression.
- Load-first progression.
- Set progression.
- Top-set plus back-off structure.
- Technical progression.
- Range-of-motion progression.
- Density progression.
- Exercise progression and regression.

### 14.3 Rules

- Do not treat every lever as appropriate at the same time.
- Do not recommend increasing load when technique or range deteriorates.
- Explain that short-term performance fluctuates.
- Plateaus require diagnosis of measurement, adherence, recovery, specificity and programming context before adding complexity.
- Worked examples must be labelled illustrative and non-personalized.

## 15. RPE, RIR and autoregulation

### 15.1 Definitions

The module must explain:

- Session RPE.
- Set RPE.
- Repetitions in reserve.
- Estimated proximity to failure.
- Autoregulation.
- Readiness as a practical judgment, not a medical score.

### 15.2 Interface requirements

Include:

- A visual RPE/RIR relationship table.
- Examples of what “approximately 2 RIR” means.
- A warning that estimation accuracy varies with training experience, exercise and set duration.
- A distinction between technical failure, volitional failure and momentary muscular failure.

### 15.3 Rules

- Do not claim exact RIR accuracy.
- Do not equate discomfort with failure.
- Do not tell users to test true failure on high-risk exercises.
- Do not create a readiness algorithm in this phase.

## 16. Training to failure and proximity to failure

The module must present failure as a tool with costs, not a universal requirement.

Required sections:

- Definitions of failure states.
- Potential stimulus implications.
- Fatigue and performance costs.
- Exercise-specific risk and practicality.
- Differences between strength and hypertrophy contexts.
- Beginner considerations.
- When leaving repetitions in reserve can preserve quality and volume.

The evidence summary must state that training to momentary failure has not shown a consistent universal advantage over non-failure training and that proximity to failure appears more relevant to hypertrophy than to strength, while the exact dose-response remains uncertain.

## 17. Fatigue, soreness and recovery interpretation

The module must distinguish:

- Acute performance fatigue.
- Local muscular fatigue.
- Systemic or whole-session fatigue.
- Delayed-onset muscle soreness.
- Joint discomfort.
- Pain or neurological symptoms.
- Motivational fatigue.

Rules:

- Soreness is not a required marker of an effective session.
- Absence of soreness does not prove a session was ineffective.
- The module must not diagnose overtraining syndrome.
- Persistent pain, swelling, loss of function, dizziness, chest symptoms or neurological signs must trigger a stop-and-seek-qualified-help message.
- Recovery recommendations beyond basic educational context are owned by later recovery phases.

## 18. Periodization and training organization

The module must explain periodization as planned variation and organization, not as a guarantee of superior outcomes.

Required concepts:

- Session.
- Microcycle.
- Mesocycle.
- Macrocycle.
- Linear periodization.
- Undulating periodization.
- Block periodization.
- Concurrent emphasis.
- Specialization phase.
- Taper.
- Deload.
- Maintenance phase.
- Autoregulated progression.

Rules:

- Do not rank periodization models as universally best.
- Explain that periodization appears more consistently useful for maximal strength than for hypertrophy when volume is equated, while results and applicability vary.
- Separate the organizational benefits of periodization from proof that a specific model creates greater adaptation.
- Do not build calendar schedules in Phase 04.

## 19. Deloading and reduced-load periods

The module must define:

- Planned deload.
- Reactive deload.
- Volume reduction.
- Load reduction.
- Exercise-complexity reduction.
- Frequency reduction.
- Complete rest when appropriate.

Rules:

- Do not state that every user must deload on a fixed number of weeks.
- Do not diagnose accumulated fatigue from a single subjective signal.
- Present deloading as one possible fatigue-management strategy.
- Link future logging data only as a placeholder; do not create automatic triggers.

## 20. Advanced resistance-training methods

Advanced methods must be presented as tools that alter time efficiency, fatigue distribution, stimulus characteristics or training experience. They must not be marketed as inherently superior.

### 20.1 Required methods

- Superset.
- Antagonist superset.
- Compound set.
- Tri-set.
- Giant set.
- Drop set.
- Rest-pause.
- Cluster set.
- Myo-reps.
- Pyramid set.
- Reverse pyramid.
- Pre-exhaustion.
- Post-exhaustion.
- Circuit training.
- AMRAP.
- EMOM.
- Isometric emphasis.
- Eccentric emphasis or overload.
- Paused repetitions.
- Partial-range overload.
- Blood-flow restriction as a specialist educational topic.

### 20.2 Method-page requirements

Each method must include:

- Definition.
- What variable it changes.
- Common use cases.
- Potential advantages.
- Main fatigue or technique costs.
- Exercises for which it is more or less practical.
- Experience prerequisites.
- Evidence summary.
- “No consistent superiority established” statement when applicable.
- Safety boundaries.

### 20.3 Specialist boundaries

Blood-flow restriction, maximal eccentrics, forced repetitions and similar specialist methods require stronger warnings and must not include unsupervised prescriptive protocols in this phase.

## 21. Measurement and interpretation

The module must cover:

- One-repetition maximum.
- Estimated one-repetition maximum.
- Repetition maximum.
- Volume load.
- Direct-set counts.
- Relative strength.
- Repetition performance.
- Technique consistency.
- Range-of-motion consistency.
- Velocity-based metrics as an advanced concept.

Rules:

- A metric is a proxy and must not be described as the adaptation itself.
- Estimated 1RM formulas have limitations and are less reliable at high repetition counts or unfamiliar exercises.
- Tonnage comparisons across different exercises can be misleading.
- Phase 04 may display formulas and explanations but must not build persistent calculators; calculators belong under the later Tools phase.

## 22. Decision-framework component

Every training-variable and advanced-method page must use the same decision structure:

1. **Use this concept to solve:** the practical problem.
2. **Prioritize it when:** relevant context.
3. **Do not prioritize it when:** competing constraints or insufficient foundation.
4. **Main adjustment levers:** variables the user can conceptually change.
5. **Watch for:** performance, technique and recovery costs.
6. **What it cannot tell you:** explicit limitations.

This structure must not produce individualized advice.

## 23. Comparison interface

The module must support static data-driven comparisons such as:

- RPE versus RIR.
- Load intensity versus effort intensity.
- Volume versus volume load.
- Frequency versus split.
- Superset versus compound set.
- Rest-pause versus cluster sets.
- Linear versus undulating periodization.
- Failure versus non-failure.
- Full versus partial range of motion.

Comparison tables must:

- Define each concept.
- Identify shared features.
- Identify practical differences.
- State when evidence does not establish superiority.
- Link to full topic pages.
- Remain horizontally usable on mobile through stacked cards or accessible scroll regions.

## 24. Glossary requirements

The glossary must:

- Include canonical terms, abbreviations and aliases.
- Group terms alphabetically and by category.
- Provide a one- or two-sentence definition.
- Link to the canonical topic where available.
- Distinguish terms that are often misused.
- Support keyboard navigation and direct URL fragments.
- Exclude invented jargon and marketing labels.

## 25. Search, filter and sort behavior

### 25.1 Search index

Index:

- Display name.
- Short title.
- Aliases.
- Abbreviations.
- Definition.
- Key takeaways.
- Category.
- Goal tags.
- Related exercise names through derived Phase 03 indexes.

Search must not index unpublished long-form content.

### 25.2 Required filters

- Category.
- Content type.
- Goal.
- Experience level.
- Evidence confidence.
- Content status for development-only tools.

### 25.3 Filter logic

- Filters use AND between groups and OR within a group.
- State is represented in the URL.
- Browser back/forward restores state.
- Invalid filter values are ignored safely.
- “Clear all” removes URL filter parameters.
- Results count updates accessibly.

### 25.4 Sorting

Support:

- Recommended learning order.
- Alphabetical.
- Recently reviewed.
- Foundation first.

Do not sort by “best,” popularity or unsupported evidence score.

## 26. Catalogue page

### 26.1 Required structure

- Page title and scope statement.
- Safety and non-personalization note.
- Search.
- Category navigation.
- Goal and experience learning paths.
- Featured foundation topics.
- Advanced-method entry card.
- Filter/sort controls.
- Result count.
- Topic cards.
- Empty and error states.
- Source-methodology link.

### 26.2 Topic card

Show:

- Topic name.
- Short definition.
- Category.
- Experience level.
- Relevant goals.
- Evidence-confidence label.
- Review date.
- “Open topic” action.

Do not show a numeric confidence score.

## 27. Topic-detail page

### 27.1 Header

Show:

- Topic name.
- Short definition.
- Category and content type.
- Goal and experience tags.
- Confidence summary.
- Last reviewed date.
- Table-of-contents control.

### 27.2 Practical-first layout

The first content area must include:

- Definition.
- Three to six key takeaways.
- Why it matters.
- Decision framework.

### 27.3 Required sections

- How it works.
- Goal context.
- Examples.
- Common mistakes.
- Myths when applicable.
- Evidence summary.
- Limitations.
- Related topics.
- Relevant exercises.
- Sources and review metadata.

## 28. Myth and misconception model

A myth record requires:

- Exact misconception.
- Why it is incomplete or wrong.
- Corrected statement.
- Confidence level.
- Source IDs.
- Scope limitations.

Rules:

- Do not create provocative myths solely for engagement.
- Do not ridicule users or creators.
- Do not use “debunked” when evidence is merely mixed.
- Never publish an unsourced myth correction.

## 29. Example and scenario model

Examples must be:

- Clearly marked as illustrative.
- Non-personalized.
- Internally consistent.
- Connected to stable exercise IDs when naming an exercise.
- Free from guarantees.
- Free from medical or injury advice.

An example may show how a variable changes, but must not become a complete weekly program.

## 30. Source governance

### 30.1 Source hierarchy

Use, in order of preference:

1. Current authoritative position stands and guidelines.
2. Systematic reviews, umbrella reviews and meta-analyses.
3. Randomized or controlled training trials.
4. Consensus statements and recognized textbooks for definitions.
5. Observational or mechanistic work for context only.
6. Practitioner material only when clearly labelled as practice interpretation.

### 30.2 Source rules

- Every claim must reference exact source IDs.
- A topic cannot cite only a general homepage.
- Preserve publication year, title, authors or organization, DOI/PMID when available and source type.
- Do not copy abstracts or article prose.
- Do not treat a single study as a universal rule.
- Record conflicts and disagreement rather than selecting the most convenient conclusion.
- Older evidence may remain when foundational, but the review process must search for newer syntheses.

### 30.3 Review cadence

- High-impact quantitative guidance: review at least annually.
- Stable definitions: review every two years or after major position-stand updates.
- Advanced methods: review annually because evidence can change rapidly.
- Broken source links: detect during release checks.

## 31. Content status and publication gates

Use:

- Draft.
- Review needed.
- Reviewed.
- Published.
- Deprecated.

A record may be published only when:

- Identity and category validate.
- Definition, summary and key takeaways exist.
- Decision framework is complete.
- Every decision-changing claim has at least one source.
- Evidence level and population are specified.
- Limitations are present.
- Reviewer and review dates exist.
- Relationships resolve.
- No prohibited universal or medical language exists.
- Deprecated-source or broken-link checks pass.

Draft seed records must never appear in public routes.

## 32. Starter taxonomy and coverage contract

The attached seed taxonomy establishes stable identities and learning order. It does not contain publishable science articles.

### 32.1 Seed target

The taxonomy must include at least:

- 8 foundation topics.
- 5 adaptation/goal topics.
- 12 core training-variable topics.
- 8 effort/fatigue topics.
- 10 progression and program-design topics.
- 10 periodization/autoregulation topics.
- 20 advanced-method topics.
- 8 measurement topics.

### 32.2 MVP publication target

Before public launch, publish at minimum:

- Progressive overload.
- Specificity.
- Volume.
- Load and relative intensity.
- Frequency.
- Sets and repetitions.
- Rest intervals.
- Range of motion.
- Tempo and velocity intent.
- Exercise order.
- RPE.
- RIR.
- Proximity to failure.
- Training to failure.
- Fatigue versus soreness.
- Strength training principles.
- Hypertrophy training principles.
- Power training principles.
- Progression methods.
- Deloading.
- Periodization.
- Supersets.
- Drop sets.
- Rest-pause.
- Cluster sets.

Every public article still requires full source and review fields.

## 33. Content ingestion and review workflow

1. Create or select a stable draft identity.
2. Define research questions.
3. Collect current high-level syntheses.
4. Extract atomic claims and population limits.
5. Record conflicts and uncertainty.
6. Draft plain-language content without copying source prose.
7. Add goal-specific interpretation.
8. Add decision framework and examples.
9. Validate related Phase 03 exercise IDs.
10. Run prohibited-language and numeric-guidance checks.
11. Complete subject review.
12. Complete editorial review.
13. Mark reviewed.
14. Publish only after automated gates pass.
15. Re-review on schedule or when a major source changes.

Lovable must not bulk-generate reviewed or published science content.

## 34. Data validation rules

Validation must reject:

- Invalid or duplicate IDs/slugs.
- Unknown category, content type, goal or experience values.
- Published records without sources or review metadata.
- Claims without population, evidence level, limitations or source IDs.
- Broken related-topic, exercise or muscle IDs.
- Self relationships.
- Circular prerequisite chains.
- Numeric guidance without units, context, qualifier and source.
- Universal words in decision-changing guidance without an explicit source and approved exception.
- Medical diagnosis or treatment phrases.
- Empty key takeaways.
- Sources with duplicate IDs or missing citation metadata.
- Deprecated records without replacement or migration note.

Validation errors must show file, record ID, JSON path and corrective action.

## 35. Technical implementation contract

### 35.1 Storage

Use repository-owned JSON or TypeScript data validated at build time. Do not add a runtime database.

### 35.2 Recommended project structure

```text
src/
  features/
    workout-science/
      components/
      data/
      lib/
      pages/
      schemas/
      tests/
  routes/
    learn/
      workout-science/
content/
  workout-science/
    topics/
    sources/
    taxonomy/
    review/
public/
  workout-science/
docs/
  workout-science.md
  content-governance/workout-science-evidence.md
  phases/phase-04.md
scripts/
  validate-workout-science.*
  build-workout-science-index.*
  report-workout-science-coverage.*
```

Adapt paths to the existing framework, but preserve separation by feature.

### 35.3 Required generated indexes

Generate:

- Published topic by ID.
- Published topic by slug.
- Alias and abbreviation index.
- Category index.
- Goal and experience indexes.
- Related-topic graph.
- Exercise-to-topic reverse index.
- Glossary index.
- Source-to-claim index.
- Coverage and review-due report.

### 35.4 Routing

- Use canonical slugs.
- Draft records return a safe unavailable state in production.
- Deprecated slugs redirect to replacements.
- Unknown slugs return the existing 404 pattern.
- Anchor links remain stable.

## 36. Component catalogue

Lovable must create or reuse:

- `WorkoutScienceCataloguePage`.
- `WorkoutScienceTopicPage`.
- `ScienceTopicCard`.
- `ScienceCategoryNavigation`.
- `LearningPathCard`.
- `ScienceSearchAndFilters`.
- `EvidenceConfidenceBadge`.
- `AtomicClaimList`.
- `PopulationApplicability`.
- `EvidenceLimitationsPanel`.
- `DecisionFrameworkCard`.
- `GoalContextMatrix`.
- `KeyTakeaways`.
- `CommonMistakeCorrection`.
- `MythCorrection`.
- `TopicComparison`.
- `ScienceGlossary`.
- `RelatedScienceTopics`.
- `RelevantExercises`.
- `ScienceSourceList`.
- `ReviewMetadata`.
- `DraftUnavailableState`.

Use Phase 01 primitives rather than creating a separate visual language.

## 37. Local saved-state impact

Phase 04 may store only non-sensitive local preferences:

- Saved topics.
- Recently viewed topics.
- Last learning-path position.
- Dismissed educational notices.

Rules:

- Use the existing local-first storage adapter.
- Do not create a profile.
- Do not infer health status.
- Corrupted values must fail safely.
- Saved topic IDs must survive content updates when IDs remain valid.

## 38. Responsive behavior

### Desktop

- Use a readable content column with optional sticky table of contents.
- Comparison tables may use two or three columns.
- Catalogue filters may use a sidebar or toolbar consistent with Phase 01.

### Tablet

- Collapse secondary filter controls.
- Keep key takeaways and decision framework visible without excessive scrolling.
- Avoid fixed-width evidence tables.

### Mobile

- Support 320 CSS pixels without horizontal page overflow.
- Stack comparison content.
- Use accessible horizontally scrollable tables only when necessary.
- Make glossary anchors and filter targets touch friendly.
- Keep source and evidence details collapsible but reachable.

## 39. Accessibility requirements

Meet WCAG 2.2 AA expectations established in Phase 01.

Specific requirements:

- Semantic heading hierarchy.
- Skip links and anchor focus placement.
- Keyboard-operable filters, tabs and disclosures.
- Evidence confidence is conveyed by text, not colour alone.
- Comparison tables use headers and captions.
- Mathematical notation has accessible text alternatives.
- Abbreviations expand on first use.
- Tooltips are not the sole source of information.
- Focus is returned after dialogs or filter drawers close.
- Content reflows at 400% zoom.
- Reduced-motion preferences are respected.

## 40. Performance requirements

- Static pre-render published topic pages where supported.
- Lazy-load noncritical comparison and source details.
- Keep search local and indexed.
- Avoid shipping full draft records to production clients.
- Do not fetch source websites at runtime.
- Catalogue interaction should remain responsive with at least 500 fixture topics.
- Production build must report broken internal relationships before deployment.

## 41. SEO and metadata

Every published topic page must include:

- Unique title.
- Plain-language description.
- Canonical URL.
- Appropriate Open Graph metadata.
- Structured breadcrumb data when supported.
- Article review date.
- No exaggerated claims in titles or metadata.

Draft and review-needed pages must not be indexed.

## 42. Privacy

This phase must not:

- Collect health data.
- Send reading history to third parties.
- load analytics without explicit later approval.
- infer goals from browsing behavior.
- create user profiling.

Local saved-topic behavior must be documented and removable.

## 43. Error and edge states

Support:

- No search results.
- Invalid filter parameter.
- Draft topic route.
- Deprecated topic redirect.
- Missing related exercise.
- Missing optional comparison content.
- Broken source link in development report.
- Review overdue badge.
- Empty saved-topic list.
- Corrupted local state.
- JavaScript error boundary.

A missing optional source link must not remove the article, but a missing source ID for a decision-changing claim must block publication.

## 44. Required automated tests

### Data and schema

- Valid draft record.
- Valid published record.
- Missing source publication failure.
- Missing reviewer publication failure.
- Invalid evidence level.
- Invalid population.
- Numeric guidance without context.
- Duplicate ID/slug.
- Broken topic/exercise/muscle relationship.
- Circular prerequisite detection.
- Deprecated record redirect metadata.

### Search and filters

- Exact term.
- Alias.
- Abbreviation.
- Category.
- Goal.
- Experience.
- Multiple filters.
- Clear all.
- URL reload and browser history.
- No results.

### Routing and relationships

- Published detail route.
- Draft unavailable route.
- Deprecated redirect.
- Invalid slug.
- Related-topic graph.
- Exercise-to-topic reverse links.
- Glossary anchor route.

### Accessibility

- Keyboard filters and disclosures.
- Focus management.
- Table semantics.
- Text labels for evidence confidence.
- No critical automated axe violations on catalogue, detail, methods and glossary templates.

### Build

- Type-check.
- Lint.
- Unit tests.
- Content validation.
- Relationship validation.
- Production build.

## 45. Manual testing matrix

Test at minimum:

| Area | Cases |
| --- | --- |
| Viewports | 320, 375, 768, 1024 and 1440 CSS pixels. |
| Themes | Light, dark and system. |
| Input | Keyboard, mouse and touch. |
| Zoom | 100%, 200% and 400% reflow. |
| Search | Exact term, alias, abbreviation, typo/no match. |
| Filters | Single, multiple, clear, URL reload and browser back. |
| Detail | Anchors, key takeaways, decision framework, evidence, limitations and sources. |
| Comparison | Desktop table, mobile stack and keyboard access. |
| Status | Published, draft, deprecated, overdue and invalid. |
| Relationships | Topic-to-topic and topic-to-exercise. |
| Local state | Save, unsave, corrupted item and content update. |
| Resilience | Missing optional content and JavaScript error boundary. |

## 46. Required content-review checklist

Before a topic becomes published:

- Canonical identity and aliases are correct.
- Ambiguous terminology is defined.
- Definition and summary are accurate.
- Key takeaways match evidence.
- Goal context is complete and qualified.
- Decision framework does not become a prescription.
- Atomic claims have sources, populations and limitations.
- Evidence-level labels are justified.
- Conflicting evidence is acknowledged.
- Numeric ranges include context, units, qualifiers and sources.
- Examples are illustrative and non-personalized.
- Myths are sourced and not exaggerated.
- Related exercise and topic IDs validate.
- No exercise technique is duplicated.
- No medical diagnosis or treatment is present.
- Review dates and reviewer roles exist.
- No copied prose or fabricated precision remains.

## 47. Lovable implementation sequence

1. Audit Phase 00–03 routes, components, data contracts and tests.
2. Add the Phase 04 schema and strict validation.
3. Import the seed taxonomy as draft identities only.
4. Build source, claim, relationship and coverage indexes.
5. Build catalogue, learning paths, filters, sorting and URL state.
6. Build the topic-detail template with fixture-only reviewed sample records.
7. Build evidence, decision-framework, goal-context, myth and comparison components.
8. Build glossary and advanced-method catalogue views.
9. Connect published topic relationships to Phase 03 exercise pages.
10. Add safe draft, deprecated and error states.
11. Add automated tests and review-due reports.
12. Run accessibility, responsive and production-build checks.
13. Update required documentation.
14. Report acceptance status, limitations and any intentionally deferred content.

Do not bulk-generate publishable science articles during implementation.

## 48. Protected boundaries

Lovable must preserve:

- Phase 00 no-authentication and local-first decisions.
- Phase 01 shell, routes, design tokens and shared primitives.
- Phase 02 muscle IDs and anatomy pages.
- Phase 03 exercise IDs, technique content and publication rules.
- Existing working themes and accessibility behavior.
- Repository ownership and Vercel compatibility.

Lovable must not:

- Migrate the framework.
- Add a backend or database.
- Rename stable IDs.
- Replace reviewed content with generated prose.
- Refactor unrelated phases.
- Build programs, workout logging, nutrition or recovery features.

## 49. Phase 04 acceptance criteria

Phase 04 passes only when all are true:

1. All required Workout Science routes work inside the Phase 01 shell.
2. Only published records appear publicly.
3. Topic data validates against the attached schema.
4. Every published decision-changing claim has source, population, evidence and limitation fields.
5. Related exercise IDs resolve to Phase 03.
6. Search covers names, aliases, abbreviations, definitions and categories.
7. Filters and sorting restore from URL state.
8. Catalogue performance remains responsive with 500 fixture topics.
9. Topic pages are practical-first and include key takeaways and decision frameworks.
10. Major variables distinguish similar terms such as load intensity and effort intensity.
11. Goal-context sections avoid universal prescriptions.
12. Failure, RPE and RIR content preserves uncertainty and exercise-specific caution.
13. Periodization content does not rank one model as universally superior.
14. Advanced-method pages state costs, prerequisites and evidence limitations.
15. No personalized program generator, logger, backend or authentication exists.
16. No medical diagnosis, treatment or precise outcome guarantees exist.
17. Draft, deprecated, overdue and invalid routes behave safely.
18. Comparison and glossary interfaces work on mobile and with keyboard navigation.
19. WCAG, zoom, reflow, dark mode and responsive checks pass.
20. Type-check, lint, automated tests, content validation and production build pass.
21. Required docs and coverage reports exist.
22. Phase 05 can reference stable science-topic IDs without migration.

## 50. Phase 04 Plan-mode prompt

```text
Read all attached Phase 00–04 documents and JSON files completely. Do not modify code.

Prepare a formal implementation plan for Phase 04 only. Audit the existing framework, Phase 01 shell, Phase 02 anatomy contracts, Phase 03 exercise contracts, routes, shared components, validation and tests. List exact files to create, modify and protect. Map the Phase 04 JSON Schema into strict TypeScript validation without weakening publication gates. Define repository-owned topic/source loading, atomic claim validation, evidence and population metadata, topic/exercise relationship checks, coverage reports, catalogue search/filter/sort with URL state, learning paths, glossary, advanced-method catalogue, practical-first detail template, evidence/decision/comparison components, draft/deprecated handling, documentation and tests mapped to every acceptance criterion.

Non-negotiable: no authentication, backend, Supabase, Lovable Cloud, runtime CMS, personalized program generation, workout logging, AI coaching, medical diagnosis, injury treatment, unsourced numeric prescriptions, universal “best” claims, fabricated publishable science or rewriting Phase 03 exercise technique. Preserve Phases 00–03 and all stable IDs.

End with every Phase 04 acceptance criterion and request approval.
```

## 51. Phase 04 Agent-mode implementation prompt

```text
Implement the approved Phase 04 plan exactly. Build only the Workout Science module on top of Phases 00–03.

Use repository-owned validated data and the attached draft seed taxonomy. Do not fabricate missing factual articles or mark draft identities published. Implement the catalogue, learning paths, URL filters, search, sorting, topic template, glossary, advanced-method catalogue, evidence confidence, atomic claims, population and limitation display, decision frameworks, goal-context matrices, comparisons, myths, sources, review metadata, relationships and safe status states. Reference Phase 03 exercise IDs directly and never duplicate exercise technique.

Run schema and cross-file validation, type-check, lint, automated tests, production build, accessibility checks and responsive inspection. Update docs/workout-science.md, docs/content-governance/workout-science-evidence.md and docs/phases/phase-04.md. Report exact files changed, commands/results, known limitations and acceptance status.
```

## 52. Phase 04 verification prompt

```text
Audit the implementation against the complete Phase 04 specification. Produce a table with criterion, pass/fail, evidence, files and required fix.

Verify scope boundaries; no backend/authentication/program generator/logger; schema publication gates; atomic claim sources, populations and limitations; Phase 03 ID integrity; search and URL restoration; practical-first detail pages; correct terminology distinctions; qualified goal context; no universal prescriptions or medical advice; periodization and advanced-method nuance; glossary and comparison accessibility; draft/deprecated states; mobile, dark mode, keyboard, focus, zoom and reflow; and all validation/test/build results.

Fix only verified Phase 04 defects. Preserve passing Phase 00–03 behavior and rerun the relevant checks.
```

## 53. Content-ingestion prompt

```text
Import only the reviewed Workout Science records and source records I attach. Validate every topic against the Phase 04 schema and all related exercise IDs against Phase 03. Do not rewrite factual fields, infer missing evidence levels, invent numeric ranges, omit population limits, create new conclusions, or mark a record published when required claim, source, limitation, review or relationship fields are incomplete.

Before changing the application, return a rejected-record report listing record ID, exact field path, error, missing dependency and corrective action. Import only records that pass every publication gate.
```

## 54. Focused correction prompt

```text
Correct only the verified Phase 04 defects below. Preserve all passing Phase 00–04 behavior. Identify root cause, exact file impact, smallest fix and regression test. Run relevant content validation, relationship validation, type-check, lint, tests and production build. Do not redesign, migrate frameworks, add a backend or expand into workout programs or tracking.

[PASTE VERIFIED DEFECTS]
```

## 55. Phase 05 handoff requirements

Phase 05 must receive:

- Stable science-topic IDs and slugs.
- Goal tags and experience tags.
- Training-variable definitions.
- Contextual guidance and evidence metadata.
- Exercise IDs and topic relationships.
- Advanced-method IDs.
- Progression and periodization concept IDs.
- Publication-status selector.
- Content version and snapshot rules.
- Clear prohibition against copying full science articles into program records.

Phase 05 may reference science topics to justify program choices but must not rewrite or contradict Phase 04 content.

## 56. Completion definition

Phase 04 is complete when:

- All acceptance criteria pass.
- Only reviewed and published topics are public.
- Draft taxonomy identities remain protected.
- Topic and exercise relationships validate.
- Evidence and limitations are visible and traceable.
- Documentation is current.
- A GitHub checkpoint named `phase-04-workout-science-complete` exists.
- Phase 05 can begin without schema migration.

## 57. Reference and verification baseline

Use the following as the initial policy baseline. Every published topic still requires its own exact claim-level sources.

1. Currier BS, et al. *American College of Sports Medicine Position Stand. Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults: An Overview of Reviews.* Medicine & Science in Sports & Exercise. 2026. PMID: 41843416. DOI: 10.1249/MSS.0000000000003897.
2. American College of Sports Medicine. *Science Spotlight: ACSM Releases New Position Stand on Resistance Training.* 18 March 2026.
3. Currier BS, et al. *Resistance training prescription for muscle strength and hypertrophy in healthy adults: a systematic review and Bayesian network meta-analysis.* British Journal of Sports Medicine. 2023. PMID: 37414459.
4. Pelland JC, et al. *The Resistance Training Dose Response: Meta-Regressions Exploring the Effects of Weekly Volume and Frequency on Muscle Hypertrophy and Strength Gains.* Sports Medicine. 2025. PMID: 41343037.
5. Robinson ZP, et al. *Exploring the Dose-Response Relationship Between Estimated Resistance Training Proximity to Failure, Strength Gain, and Muscle Hypertrophy.* Sports Medicine. 2024. PMID: 38970765.
6. Refalo MC, et al. *Influence of Resistance Training Proximity-to-Failure on Skeletal Muscle Hypertrophy: A Systematic Review with Meta-analysis.* Sports Medicine. 2023. PMID: 36334240.
7. Lopez P, et al. *Resistance Training Load Effects on Muscle Hypertrophy and Strength Gain: Systematic Review and Network Meta-analysis.* Medicine & Science in Sports & Exercise. 2021. PMID: 33433148.
8. Schoenfeld BJ, et al. *Dose-response relationship between weekly resistance training volume and increases in muscle mass: A systematic review and meta-analysis.* Journal of Sports Sciences. 2017. PMID: 27433992.
9. Grgic J, et al. *Effects of Periodization on Strength and Muscle Hypertrophy in Volume-Equated Resistance Training Programs: A Systematic Review and Meta-analysis.* Sports Medicine. 2022. PMID: 35044672.
10. Cowley N, et al. *The Effects of Advanced Resistance Training Prescription Methods on Strength, Power, Hypertrophy, and Performance Adaptations in Healthy Adults: A Systematic Review and Bayesian Network Meta-analysis.* Sports Medicine. 2026. PMID: 41951916.
11. Schoenfeld BJ, et al. *Effect of repetition duration during resistance training on muscle hypertrophy: a systematic review and meta-analysis.* Sports Medicine. 2015. PMID: 25601394.
12. Pallares JG, et al. *Effects of range of motion on resistance training adaptations: A systematic review and meta-analysis.* Scandinavian Journal of Medicine & Science in Sports. 2021. PMID: 34170576.
13. W3C Web Accessibility Initiative. *Web Content Accessibility Guidelines (WCAG) 2.2.*
14. Phase 02 canonical anatomy taxonomy and Phase 03 canonical exercise taxonomy and governance rules.

The application must record exact sources for every published claim rather than treating this baseline as a substitute for topic-level verification.
