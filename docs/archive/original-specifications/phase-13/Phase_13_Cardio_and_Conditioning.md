# Phase 13 - Cardio and Conditioning

**Project:** Fitness OS  
**Document type:** Lovable implementation specification  
**Version:** 1.0  
**Date:** 5 August 2026  
**Status:** Ready for Plan-mode review  
**Depends on:** Phases 00, 01, 03, 04, 05, 06 and 12  
**Provides data contracts to:** Phases 15 and 17

---

## 0. How to use this phase

1. Keep the Phase 00 Project Knowledge active.
2. Preserve the Phase 01 shell, navigation, responsive behavior, themes and accessibility foundation.
3. Confirm Phase 03 cardio/conditioning exercise IDs, movement patterns and equipment IDs are available.
4. Confirm Phase 04 terminology for intensity, fatigue, intervals, circuits, AMRAP, EMOM, progression and deloading remains authoritative.
5. Confirm Phase 05 program structures and Phase 06 workout-session records are available for contextual links only.
6. Confirm Phase 12 warm-up, recovery, sleep, pain and illness boundaries are available.
7. Attach this Markdown specification.
8. Attach `Phase_13_Cardio_Conditioning_Data_Schema.json`.
9. Attach `Phase_13_Cardio_Conditioning_Reference_Data.json`.
10. Attach `Phase_13_Lovable_Prompt_Package.txt`.
11. Also attach the Phase 03, 04, 05, 06 and 12 schemas/reference files because Phase 13 consumes those stable IDs and contracts.
12. Run the Plan-mode prompt before any code change.
13. Reject any plan that invents physiological thresholds, treats age-predicted HRmax as measured, creates a universal Zone 2, estimates calories burned, diagnoses disease, or adds wearables/cloud services.
14. Approve only the Phase 13 scope.
15. Run Agent mode, verification, formula audit, intensity-method audit, concurrent-training audit, safety audit and privacy audit.
16. Create the GitHub checkpoint `phase-13-cardio-conditioning-complete` only after every blocking acceptance test passes.

## 1. Phase objective

Build a transparent, evidence-governed cardio and conditioning system for learning, planning, performing and manually tracking aerobic and mixed-modal conditioning.

The module must deliver:

- A Cardio home screen linking education, modalities, plans, conditioning routines, active sessions and history.
- Public-health aerobic-volume guidance clearly separated from individualized training.
- Multiple intensity methods with the method name and assumptions always visible.
- Talk-test, perceived-effort, heart-rate, pace and power workflows without pretending they are interchangeable.
- No universal numbered-zone system and no universal “Zone 2” target.
- Reviewed modality pages for walking, running, cycling, rowing, swimming, elliptical work, stairs, jump rope, sleds and mixed conditioning.
- Reviewed continuous, tempo, interval, HIIT, sprint, circuit and mixed-modal concepts.
- Deterministic cardio-plan and routine templates; no AI-generated plans.
- Local custom plan and interval-routine creation with immutable versions.
- A cardio-session tracker with duration, distance, pace, speed, segments, heart-rate estimates, perceived effort, talk test and environment.
- Transparent progress summaries without VO₂max inference, fitness age, calorie-burn credit or hidden conditioning scores.
- Evidence-aware guidance for combining cardio with strength training.
- Preparticipation and stop-signal boundaries without diagnosis.
- IndexedDB persistence, backup, restore and CSV/JSON export.

Phase 13 answers: **“What kind of cardio can I do, how hard was it, how was the session structured, and how is my cardio work changing over time?”**

It does not answer: **“Do I have cardiovascular disease, what is my clinical exercise prescription, what is my laboratory threshold, or exactly how many calories did I burn?”**

## 2. Supported use and hard boundaries

### 2.1 Supported use

- Adults using the application for general fitness and personal self-monitoring.
- Walking, running, cycling, rowing, elliptical, stair, swimming and comparable aerobic modalities.
- Continuous, interval, circuit and mixed-modal conditioning.
- Manual session entry and optional manual entry of device-reported metrics.
- Reviewed general plans and local custom plans.
- Pace, speed, duration, distance and transparent heart-rate calculations.
- Public-health guideline tracking.
- Local-only storage and user-controlled exports.

### 2.2 Hard boundaries

- No diagnosis of cardiovascular, pulmonary, metabolic or neurological disease.
- No medical clearance determination.
- No emergency triage beyond clear stop-and-seek-help messaging.
- No automatic program for pregnancy, children, cardiac rehabilitation, uncontrolled chronic disease or post-operative rehabilitation.
- No universal Zone 1–5 model.
- No claim that “Zone 2” corresponds to one fixed percentage for everyone.
- No automatic lactate threshold, ventilatory threshold, VO₂max or fitness-age estimate.
- No calorie-burn estimate and no automatic calorie credit to Phase 09 or Phase 10.
- No claim that HIIT is always superior to continuous training.
- No claim that more intensity is always better.
- No automatic modification of Phase 05 strength programs or Phase 06 workout history.
- No GPS route recording, wearable integration, live heart-rate streaming or cloud sync.
- No copying of commercial training plans, zone systems, workouts, images or branded scales without rights.
- No automatic outdoor recommendation from stale weather or air-quality data.

## 3. Phase ownership and dependencies

| Concept | Owning phase | Phase 13 rule |
| --- | --- | --- |
| Shell, navigation and shared components | Phase 01 | Reuse without redesign. |
| Exercise identities and technique | Phase 03 | Link stable exercise IDs; never duplicate technique pages. |
| Training variables and advanced methods | Phase 04 | Cross-link intervals, density, AMRAP, EMOM, fatigue and deloading. |
| Strength-oriented programs | Phase 05 | Display concurrent-training context; do not mutate programs. |
| Strength workout history | Phase 06 | Use immutable session references for scheduling context. |
| Recovery, sleep, warm-ups and pain flags | Phase 12 | Reuse safety boundaries and routine references. |
| Long-term dashboard and analytics | Phase 15 | Consume Phase 13 snapshots and derived summaries. |
| Global backup and restore | Phase 17 | Register a versioned Phase 13 adapter. |

## 4. Non-negotiable product decisions

1. **Intensity is method-labelled.** Every target and observation identifies talk test, perceived effort, percent HRmax, HRR, pace, power or reviewed text.
2. **No universal zones.** Numbered zones may only appear when the exact framework, source and calculation are named.
3. **Age-predicted HRmax is an estimate.** Use `208 - 0.7 × age` only as an optional estimate and preserve the source and version.
4. **Measured and estimated heart rate are different.** The UI must never silently merge them.
5. **Heart rate can be misleading.** Medication, heat, dehydration, illness, altitude and device limitations must remain visible.
6. **Public-health guidance is not a personal prescription.** Weekly ranges do not dictate the user’s exact session structure.
7. **No minimum bout requirement.** Short bouts count toward totals; the interface must not discard them.
8. **One vigorous minute counts as approximately two moderate minutes only for guideline-equivalent summaries.** Do not use this equivalence for recovery cost, calorie burn or performance.
9. **HIIT is optional.** It is one method, not the default or a universal superior choice.
10. **SIT is not beginner default.** Sprint-interval work requires reviewed prerequisites and strong safety warnings.
11. **Historical sessions are immutable snapshots.** Later formula, plan or setting changes do not rewrite history.
12. **No hidden conditioning score.** Show duration, distance, pace, session RPE, intensity method and frequency separately.
13. **No calorie estimate.** Duration, MET identity, body mass or device readings do not produce calories in Phase 13.
14. **Symptoms override targets.** Stop signals suppress “continue” or “push harder” guidance.
15. **Local means local.** Session metrics, heart rate, notes and symptom flags remain on the device unless exported.

## 5. Required routes

| Route | Purpose |
| --- | --- |
| `/cardio` | Cardio overview, current plan, quick start and weekly summary. |
| `/cardio/learn` | Cardio and conditioning knowledge catalogue. |
| `/cardio/learn/$topicSlug` | Knowledge-topic detail. |
| `/cardio/modalities` | Modality catalogue and comparison. |
| `/cardio/modalities/$modalitySlug` | Modality detail. |
| `/cardio/plans` | Reviewed cardio-plan catalogue and deterministic finder. |
| `/cardio/plans/$planSlug` | Reviewed plan detail. |
| `/cardio/custom-plans` | Local custom-plan identities and versions. |
| `/cardio/custom-plans/create` | Create a local custom plan. |
| `/conditioning` | Conditioning concepts and routine catalogue. |
| `/conditioning/routines/$routineSlug` | Reviewed conditioning-routine detail. |
| `/conditioning/custom` | Local custom interval and circuit routines. |
| `/cardio/session/new` | Start a reviewed, custom or ad hoc cardio session. |
| `/cardio/session/active` | Active cardio-session interface. |
| `/cardio/history` | Session history, calendar and filters. |
| `/cardio/history/$sessionId` | Immutable session detail and edit history. |
| `/cardio/progress` | Descriptive cardio trends. |
| `/cardio/calculators/pace` | Pace, speed, distance and duration calculator. |
| `/cardio/calculators/intensity` | Transparent intensity-method calculator. |
| `/cardio/methodology` | Formulas, sources, limitations and version history. |
| `/cardio/settings` | Units, default modality, heart-rate inputs and privacy. |
| `/cardio/privacy` | Local storage, device-estimate and network behavior. |

Invalid IDs show recoverable not-found states. Corrupt local records are quarantined without crashing valid records.

## 6. Primary user journeys

### 6.1 Find a suitable cardio plan

1. Open Cardio Plans.
2. Select primary goal, current experience, days per week, available time, preferred modalities and impact tolerance.
3. Optionally identify strength-training priority and available recovery days.
4. Run deterministic matching against reviewed plan metadata.
5. Show matched plans with transparent reasons and unmatched constraints.
6. Do not generate a new plan.
7. Save one reviewed plan locally as current.

### 6.2 Start an easy continuous session

1. Select a modality.
2. Select Easy Continuous or Recovery Cardio.
3. Choose duration or open-ended tracking.
4. Select an intensity method, preferably talk test or perceived effort when no validated heart-rate data exist.
5. Review warm-up and stop signals.
6. Start the timestamp-based session timer.
7. Record duration, optional distance, perceived effort, talk test and notes.
8. Finish and save an immutable session snapshot.

### 6.3 Perform an interval session

1. Open a reviewed or local routine.
2. Review work intervals, recovery intervals, repetitions, warm-up, cool-down and target method.
3. Confirm the routine has no unresolved safety or evidence fields.
4. Start the active-session screen.
5. Use timestamp-based work and recovery timers.
6. Pause or resume without duplicating a segment.
7. Mark segments complete, skipped or modified.
8. Record actual duration, distance or power where available.
9. Record perceived effort and stop signals.
10. Finish and preserve the exact routine version performed.

### 6.4 Log an outdoor session manually

1. Select modality and local date/time zone.
2. Enter elapsed duration.
3. Enter optional distance, elevation and surface.
4. Enter optional device-reported average/max heart rate and label the device source.
5. Enter perceived effort and talk-test result.
6. Add weather or environment tags manually.
7. Save without creating GPS, route or live-weather records.

### 6.5 Compare intensity methods

1. Open the Intensity Calculator.
2. Select talk test, perceived effort, percent HRmax or HRR.
3. For HR methods, identify HRmax as measured, clinician supplied or age predicted.
4. If age predicted, display the formula, source and uncertainty warning.
5. If resting HR is missing, HRR remains unavailable.
6. If medication or a condition affects heart rate, show a warning and recommend using a reviewed alternative method or clinician-provided targets.
7. Never convert the output into universal zone numbers.

### 6.6 Combine cardio and strength

1. Select a strength-priority, cardio-priority or balanced schedule view.
2. Show Phase 05 and Phase 06 sessions without editing them.
3. Identify same-session and same-day conflicts transparently.
4. Show evidence-based trade-offs, including possible explosive-strength interference.
5. Offer scheduling options, not automatic changes.
6. Let the user save a local calendar arrangement.

## 7. Information architecture and screen requirements

### 7.1 Cardio home

Required cards:

- Current cardio plan.
- Next planned session.
- Quick-start modalities.
- Weekly moderate and vigorous minutes.
- Guideline-equivalent summary.
- Recent session.
- Recent pace or distance trend.
- Concurrent-training context.
- Safety and methodology links.

The page must remain useful with no tracking data and must not shame users for missing a guideline.

### 7.2 Knowledge catalogue

Filters:

- Foundations
- Intensity
- Continuous training
- Intervals
- Conditioning
- Programming
- Concurrent training
- Measurement
- Safety

Every public topic requires:

- Definition
- Practical relevance
- Applicable population
- Mechanism or rationale
- What the evidence supports
- What remains uncertain
- Common misuse
- Examples
- Safety boundary
- Related modalities, plans and Phase 04 topics
- Claim-level sources
- Review date and reviewer status

### 7.3 Modality catalogue

Each modality card shows:

- Modality name
- Indoor, outdoor or both
- Impact classification
- Skill demand
- Primary metrics
- Typical equipment
- Beginner suitability
- Environment considerations
- Phase 03 technique link where available
- Publication status

Modality comparison may compare accessibility, impact, skill, equipment, metrics and environment. It must not declare one modality universally best.

### 7.4 Modality detail

Required sections:

- What the modality is
- Common session types
- Equipment and setup
- Technique link to Phase 03 when available
- Impact and tissue-loading context
- Skill demands
- Useful metrics
- Intensity-method compatibility
- Beginner progression principles
- Common errors
- Environment and safety
- Low-impact or equipment substitutions
- Related reviewed plans and routines
- Sources and review metadata

### 7.5 Cardio-plan catalogue and finder

The finder may use only reviewed metadata:

- Goal
- Experience
- Days per week
- Minutes per session
- Modality preference
- Impact tolerance
- Equipment
- Strength-training priority
- Environment

The result explains exact matches and compromises. It does not create or modify prescriptions.

### 7.6 Conditioning catalogue

Required categories:

- Continuous conditioning
- Aerobic intervals
- HIIT
- Sprint interval
- Circuits
- Mixed-modal
- Sled
- Jump rope
- Shuttle
- Bodyweight
- Low-impact
- Recovery

Every public routine requires explicit work, recovery, repetitions, warm-up, cool-down, target method, prerequisites, stop signals and sources.

### 7.7 Active session

Required controls:

- Session title and modality
- Elapsed timer
- Current segment
- Segment target and target method
- Work/recovery timer
- Pause/resume
- Complete/skip segment
- Add lap or manual segment
- Stop-signal control
- Finish session
- Abandon session

Timers must derive from timestamps, not an assumed uninterrupted browser interval.

### 7.8 History and detail

History filters:

- Date range
- Modality
- Session type
- Plan
- Completed or abandoned
- Heart-rate source
- Indoor/outdoor

Session detail shows original snapshots, formulas and calculation versions. Editing creates an audit event. Deletion is soft with undo.

## 8. Intensity architecture

### 8.1 Absolute and relative intensity

Absolute intensity uses activity energy cost, commonly METs. It is suitable for population classification but can misclassify individual effort. Relative intensity reflects how hard the activity is for the individual.

The application must display this distinction before showing an absolute MET category.

### 8.2 Talk test

Supported states:

| State | Display meaning | Use |
| --- | --- | --- |
| Comfortable conversation | Speech is easy | Easy or lower-moderate context |
| Talk but not sing | Conversation is possible but breathing is clearly elevated | Common moderate-intensity rule of thumb |
| Few words only | Speech requires frequent breathing pauses | Vigorous context |
| Unable to speak comfortably | Very hard effort or a possible stop signal depending on context | Never used as a universal target |

Talk-test results are observations, not diagnoses or laboratory thresholds.

### 8.3 Generic perceived effort

Use a plain 0–10 effort input. Do not call it a copyrighted branded scale unless licensing is confirmed.

The UI may use neutral anchors such as very easy, easy, moderate, hard and very hard. Exact anchors must be reviewed and versioned.

### 8.4 Heart-rate methods

#### Age-predicted maximum heart rate

Default optional estimate:

`estimated HRmax = 208 - (0.7 × age in years)`

Rules:

- Round only for display.
- Keep the exact unrounded value in the calculation trace.
- Label the result “age-predicted estimate.”
- Never label it measured.
- Permit user-entered measured or clinician-supplied HRmax.
- Preserve source and method version in every target snapshot.

#### Percentage of HRmax

`target HR = fraction × HRmax`

#### Heart-rate reserve

`target HR = resting HR + fraction × (HRmax - resting HR)`

Rules:

- HRR is unavailable without resting HR and HRmax.
- A later resting-HR or HRmax edit does not rewrite historical targets.
- Medication, illness, heat, dehydration, altitude and device limitations produce visible cautions.
- A user may disable heart-rate targets entirely.

### 8.5 Zone-system rule

The application must not display Zone 1–5 without storing:

- Framework name
- Framework version
- Calculation method
- Threshold basis
- Source
- User inputs
- Limitations

“Zone 2” is searchable as an educational topic, but the app must explain that different systems define it differently.

### 8.6 Pace and power

Pace and power are modality-specific. Outdoor slope, wind, heat, current, surface and device calibration affect interpretation.

Do not compare running pace directly with rowing pace or cycling speed. Progress charts remain modality-specific.

## 9. Public-health volume and weekly summaries

### 9.1 Adult guidance contract

Display:

- 150–300 minutes per week of moderate-intensity aerobic activity, or
- 75–150 minutes per week of vigorous-intensity aerobic activity, or
- an equivalent combination.

This is a public-health framework, not a personalized dose.

### 9.2 Guideline-equivalent minutes

`moderate-equivalent minutes = moderate minutes + 2 × vigorous minutes`

Rules:

- Label as “guideline-equivalent minutes.”
- Do not call it training load.
- Do not use it to predict adaptation, fatigue or calories.
- Short sessions count.
- Unclassified sessions remain separate.

### 9.3 Classification hierarchy

For a completed session, classification priority is:

1. Reviewed segment prescription and actual method.
2. User-recorded talk test.
3. User-recorded perceived effort.
4. Reviewed heart-rate target with valid inputs.
5. Absolute MET category only as a population-level estimate.
6. Unclassified when evidence is insufficient.

Do not force every minute into moderate or vigorous.

## 10. Cardio and conditioning programming

### 10.1 FITT-VP fields

Every reviewed plan must declare:

- Frequency
- Intensity method
- Time
- Type or modality
- Weekly volume
- Progression rule

### 10.2 Progression

Progression options:

- Add session duration
- Add weekly frequency
- Add distance
- Reduce recovery duration
- Add repetitions
- Increase target pace or power
- Change terrain or incline
- Increase intensity

A plan must declare which variable changes and which variables stay stable. Do not increase every variable simultaneously.

### 10.3 Continuous training

Continuous session records must identify:

- Easy, moderate, long easy, tempo or recovery intent
- Duration or distance
- Target method
- Warm-up and cool-down
- Optional pace, heart rate and RPE
- Stop signals

### 10.4 Intervals

Every interval routine must identify:

- Work duration or distance
- Recovery duration or distance
- Repetitions
- Recovery mode
- Whether recovery follows the final repetition
- Warm-up
- Cool-down
- Target method
- Completion rule
- Modification rule
- Stop signals

### 10.5 HIIT and sprint interval boundaries

- HIIT includes varied protocols and populations; do not present one protocol as definitive.
- Sprint interval training involves near-maximal or maximal work and is not a default beginner option.
- The app must show prerequisites and recovery cost.
- A hard interval session is not required to satisfy health guidelines.
- More HIIT is not automatically better.
- Low-volume HIIT evidence does not justify zero-volume recovery or unlimited intensity.

### 10.6 Circuits and mixed-modal conditioning

Mixed-modal routines must preserve technique quality. Complex barbell lifts, high-skill movements and fatigue-sensitive exercises require explicit restrictions.

The routine builder must warn when high-skill Phase 03 exercises are placed under severe time pressure or very high fatigue.

## 11. Modality system

The reference package contains 24 stable modality identities. Each remains draft until reviewed.

Required classification fields:

- Indoor/outdoor
- Impact level
- Weight-bearing status
- Skill level
- Equipment
- Typical metrics
- Intensity-method compatibility
- Environmental sensitivity
- Phase 03 exercise link
- Common substitutions
- Safety notes

Do not infer joint safety from “low impact” alone. Low impact does not mean universally pain-free or medically appropriate.

## 12. Cardio plan model

### 12.1 Reviewed plans

The reference package contains 32 stable plan identities. They are not complete prescriptions.

A publishable plan requires:

- Goal
- Population
- Experience requirement
- Duration in weeks
- Days per week
- Time per session
- Modality requirements
- Weekly schedule
- Every session and segment
- Intensity method
- Progression rules
- Reduced-week or deload logic
- Substitution rules
- Concurrent-training notes
- Stop signals
- Sources
- Reviewer approval

### 12.2 Local custom plans

- Custom plan edits create a new immutable version.
- Historical sessions retain the performed plan version.
- The builder validates segment fields but does not judge medical suitability.
- The builder does not auto-generate a plan.
- Copying a reviewed plan creates a local derivative clearly labelled “custom.”

## 13. Cardio session tracker

### 13.1 Supported session metrics

- Start and end timestamps
- Local date and IANA time zone
- Elapsed duration
- Modality
- Session type
- Distance
- Pace
- Speed
- Elevation gain
- Average and maximum heart rate
- Heart-rate source
- Average power
- Cadence
- Perceived effort
- Talk test
- Segments and laps
- Environment
- Stop signals
- Notes

### 13.2 Pace and speed formulas

`pace seconds per distance unit = elapsed seconds ÷ distance units`

`speed distance units per hour = distance units ÷ elapsed hours`

Rules:

- Distance must be positive.
- Elapsed duration must be positive.
- Missing distance returns unavailable pace and speed.
- Preserve exact SI values internally.
- Round only for display.
- Moving time is not inferred without a source.

### 13.3 Segment completion

A segment stores planned and actual values separately. Skipping or modifying a segment never rewrites the routine version.

### 13.4 Heart-rate records

Device values are stored as estimates. The UI shows the source beside every number.

The app does not:

- Validate a wearable against an ECG.
- Infer arrhythmia.
- Infer threshold.
- Infer VO₂max.
- Infer calorie burn.

### 13.5 Symptoms and stop signals

If a user selects an urgent stop signal:

- Pause or end the active session.
- Suppress “continue,” “increase intensity” and completion-celebration prompts.
- Show clear safety messaging.
- Do not generate a diagnosis.
- Preserve the flag locally in the session record.

## 14. Progress and analytics

Phase 13 may show:

- Sessions per week
- Total duration
- Moderate minutes
- Vigorous minutes
- Unclassified minutes
- Guideline-equivalent minutes
- Distance by modality
- Pace by modality
- Average heart rate with source labels
- Perceived effort
- Interval completion
- Plan adherence
- Time in user-defined reviewed target ranges

Phase 13 must not show:

- VO₂max inferred from ordinary workouts
- Fitness age
- Cardiac age
- Calorie burn
- Fat-burn zone
- Training readiness score
- Medical risk score
- Cross-modality pace rankings

Sparse data and changed devices must be visible. Trends require enough comparable records and remain descriptive.

## 15. Concurrent cardio and strength training

### 15.1 Evidence framing

Concurrent aerobic and strength training is not universally incompatible with muscle or strength development. Evidence suggests maximal strength and whole-muscle hypertrophy can often be maintained, while explosive-strength gains may be more vulnerable, especially when modalities are combined in the same session.

The app must show uncertainty and protocol dependence.

### 15.2 Scheduling options

- Strength first when maximal strength or technique quality is the immediate priority.
- Cardio first when endurance-session quality is the immediate priority.
- Separate sessions when feasible.
- Consider at least several hours between demanding sessions when explosive performance is important.
- Use lower-impact or easier cardio when lower-body fatigue is already high.
- Avoid automatically placing hard intervals after high-fatigue lower-body training.

These are options, not universal rules.

### 15.3 Data behavior

- Read Phase 05 planned sessions.
- Read Phase 06 completed sessions.
- Do not edit either record.
- Display possible conflicts and user-controlled alternatives.
- Store any cardio calendar choice only in Phase 13 local data.

## 16. Safety architecture

### 16.1 Preparticipation boundary

The educational screen explains that screening depends on:

- Current activity level
- Known cardiovascular, metabolic or renal disease
- Signs or symptoms
- Desired exercise intensity

Do not reproduce a proprietary questionnaire. Do not issue medical clearance.

### 16.2 Stop signals

Blocking stop-signal categories:

- Chest pain, pressure, squeezing or unusual upper-body discomfort
- Unusual or extreme shortness of breath
- Dizziness, fainting or confusion
- Fast or irregular heartbeat with symptoms
- New severe pain or gait change
- New neurological symptoms
- Heat-illness concern
- Any urgent concern

The application must use locally appropriate emergency wording at deployment.

### 16.3 Heat and air quality

- Heat and humidity can raise physiological strain.
- Users should be able to tag heat and humidity manually.
- Faintness or weakness in heat is a stop signal.
- Air-quality guidance must come from a current approved source; Phase 13 does not fetch live AQI in the MVP.
- Never recommend outdoor exercise from stale cached data.

### 16.4 Pain, illness and recovery

Phase 12 pain or illness flags suppress hard-session recommendations. Phase 13 must not diagnose the cause.

## 17. Data model

### 17.1 IndexedDB stores

Create ten dedicated stores:

1. `cardioSessions`
2. `customCardioPlanIdentities`
3. `customCardioPlanVersions`
4. `customConditioningRoutineIdentities`
5. `customConditioningRoutineVersions`
6. `cardioSettings`
7. `cardioAuditEvents`
8. `cardioDeletedRecords`
9. `cardioImportConflicts`
10. `cardioDerivedSummaries`

Derived summaries are disposable and rebuildable.

### 17.2 Required indexes

- Session date
- Modality ID
- Session type
- Status
- Plan version ID
- Created and updated timestamps
- Deleted state

### 17.3 Transactions

Completing a session must transactionally save:

- Session snapshot
- Segment actuals
- Source plan/routine snapshot
- Audit event
- Derived-summary invalidation marker

If the transaction fails, no partial completed session remains.

### 17.4 Migrations

- Every schema migration is versioned and tested.
- Back up before destructive migration.
- Roll back on failure.
- Unknown future fields are preserved when safe or quarantined.
- Historical method versions remain readable.

## 18. Backup, restore and export

### 18.1 JSON backup

Export:

- Schema version
- Export timestamp
- Sessions
- Custom plan versions
- Custom routine versions
- Settings
- Audit events
- Deleted-record tombstones

### 18.2 Restore modes

- Keep existing
- Import as copy
- Replace local

Show conflict preview before commit. Restoration is transactional.

### 18.3 CSV exports

Provide:

- Cardio sessions
- Cardio segments
- Heart-rate observations
- Interval completion
- Weekly summaries
- Custom plans
- Custom routines

Missing values export as blank, not zero.

## 19. Content governance and publication gates

A topic, modality, plan or routine cannot be public unless:

- Identity and slug are stable.
- Scope and population are stated.
- Claims map to approved sources.
- Intensity method is explicit.
- Uncertainty and limitations are present.
- Safety boundaries are complete.
- Phase 03 links resolve where applicable.
- Copyright and media rights are confirmed.
- Reviewer and review date exist.
- Publication status is `published`.

Lovable must not turn draft titles into generated factual content.

## 20. Search, filters and URL state

Global and module search must index reviewed titles, aliases and summaries only.

Filters must be encoded in URL query parameters where practical so views are shareable without exposing personal data.

Required filters:

- Modality
- Indoor/outdoor
- Impact
- Equipment
- Goal
- Experience
- Session duration
- Session type
- Intensity method
- Plan days per week
- Strength-training priority

## 21. Accessibility and responsive behavior

- Meet WCAG 2.2 AA.
- All timers have text equivalents.
- Do not rely on color alone for work/recovery states.
- Announce segment changes without excessive screen-reader noise.
- Provide reduced-motion alternatives.
- Charts have accessible data tables.
- Drag-and-drop has keyboard controls.
- Touch targets remain at least 44 by 44 CSS pixels.
- Active-session controls remain usable at 320 px width.
- Pace and duration fields use semantic labels and unit descriptions.
- Error messages identify the field and correction.

## 22. Privacy and runtime network rules

Allowed runtime requests:

- Static application assets
- User-clicked source links

Prohibited runtime requests:

- Session metrics
- Heart-rate values
- Distances, pace, power or cadence
- Symptom flags
- Notes
- Plan selections
- GPS or route data
- AI services
- Analytics containing cardio values
- Cloud databases or storage

The build must include a runtime-request audit.

## 23. Performance requirements

- Load module shell without parsing all sessions.
- Paginate or virtualize large history lists.
- Build search indexes at build time for public content.
- Rebuild derived summaries incrementally.
- Keep active-session timers independent of React render frequency.
- Restore timer state from timestamps after refresh or background suspension.
- Do not load maps or wearable SDKs.

## 24. Calculation test vectors

| Test | Expected result |
| --- | --- |
| 5 km in 25 minutes | 5:00 per km and 12.0 km/h |
| 1 mile in 8 minutes | 8:00 per mile and 7.5 mph |
| Tanaka estimate at age 40 | 180 bpm |
| HRR with rest 60, max 190, 50–70% | 125–151 bpm after display rounding |
| 90 moderate + 30 vigorous minutes | 150 guideline-equivalent minutes |
| Six 2-min work/2-min recovery repetitions with final recovery, 10-min warm-up/cool-down | 44 minutes |
| Same interval without final recovery | 42 minutes |
| Missing distance | Pace and speed unavailable |
| Later settings change | Historical target remains unchanged |
| Wrist heart rate | Displayed as device estimate |
| MET, weight and duration supplied | No calorie estimate produced |
| Chest-pressure flag | No continue recommendation and no diagnosis |

## 25. Automated tests

Required automated tests:

- JSON Schema validation
- Duplicate seed IDs and slugs
- Phase 03 exercise-reference integrity
- Pace and speed calculations
- Unit conversions
- HRmax estimate
- HRR and percent-HRmax calculations
- Guideline-equivalent minutes
- Interval-duration calculations
- Missing-data propagation
- Historical snapshot immutability
- Device-estimate labelling
- No-calorie output
- Stop-signal suppression
- Timer recovery after refresh
- Segment idempotency
- IndexedDB transaction rollback
- Migration rollback
- Backup round trip
- Restore-conflict behavior
- CSV blank-value behavior
- Runtime-network audit
- Phase 00–12 regression suite

## 26. Manual tests

- Mobile active-session workflow
- Screen-reader segment announcements
- Keyboard interval controls
- Dark mode
- 320 px layout
- Long routine names
- Large text zoom
- Reduced motion
- Poor connectivity/offline behavior
- Cross-tab active-session conflict
- Background-tab timer recovery
- Date and time-zone change
- Unit switch after historical sessions exist
- Unpublished content state
- Heart-rate medication warning
- Pain and illness boundary
- Concurrent schedule view

## 27. Blocking acceptance criteria

- [ ] Every intensity target names its method.
- [ ] No universal Zone 1–5 or Zone 2 value is generated.
- [ ] Age-predicted HRmax is labelled as an estimate.
- [ ] HRR cannot calculate without required inputs.
- [ ] Heart-rate source is visible beside every stored value.
- [ ] Public-health minutes are separated from training load.
- [ ] Short bouts count.
- [ ] No calorie-burn estimate exists.
- [ ] No VO₂max or fitness-age inference exists.
- [ ] HIIT and SIT have clear boundaries and prerequisites.
- [ ] Interval duration handles final-recovery rules correctly.
- [ ] Active-session timers survive refresh without double counting.
- [ ] Historical plan, routine and method snapshots are immutable.
- [ ] Stop signals suppress continue/intensify guidance.
- [ ] Concurrent-training content is qualified and non-deterministic.
- [ ] No Phase 05 or Phase 06 record is mutated.
- [ ] No personal data leaves the browser.
- [ ] Draft taxonomy records are not published.
- [ ] Backup, restore and CSV export pass.
- [ ] Mobile, desktop, dark mode and WCAG 2.2 AA checks pass.

## 28. Implementation sequence

1. Register routes and navigation.
2. Add TypeScript types from the Phase 13 schema.
3. Add reference-data validation.
4. Build pure pace, speed, HR and interval functions.
5. Run formula tests before UI work.
6. Build knowledge and modality catalogues.
7. Build plan and conditioning catalogues with publication gates.
8. Build deterministic plan finder.
9. Build local custom plan and routine versioning.
10. Build active-session state machine and timestamp timers.
11. Build IndexedDB stores, indexes and migrations.
12. Build history and session detail.
13. Build progress summaries.
14. Build concurrent-training view.
15. Build backup, restore and export.
16. Run privacy, safety, accessibility and regression audits.
17. Create the Phase 13 GitHub checkpoint.

## 29. Future handoff

Phase 13 provides Phase 15 with:

- Session snapshots
- Modality
- Duration
- Distance
- Pace and speed
- Intensity method
- Moderate, vigorous and unclassified minutes
- Heart-rate source
- Perceived effort
- Segment completion
- Plan adherence

Phase 13 provides Phase 17 with:

- Versioned backup adapter
- Migration version
- Conflict semantics
- CSV definitions
- Privacy classification

Future wearable or GPS integrations require a separate phase with explicit permissions, provenance, privacy and validation rules.

## 30. Source registry

### src_who_pa_guidelines_2020

- **Title:** WHO guidelines on physical activity and sedentary behaviour
- **Publisher:** World Health Organization
- **Year:** 2020
- **Type:** guideline
- **URL:** https://www.who.int/publications/i/item/9789240015128
- **Use:** public_health_volume, sedentary_behavior, adult_guidance
- **Rights note:** CC BY-NC-SA 3.0 IGO; summarize with attribution and preserve licence constraints.

### src_hhs_pa_guidelines_2018

- **Title:** Physical Activity Guidelines for Americans, 2nd edition
- **Publisher:** U.S. Department of Health and Human Services
- **Year:** 2018
- **Type:** government_guideline
- **URL:** https://odphp.health.gov/our-work/nutrition-physical-activity/physical-activity-guidelines/current-guidelines
- **Use:** public_health_volume, progression, bouts, adult_guidance
- **Rights note:** U.S. government guidance; cite the current official page and edition.

### src_cdc_intensity_2025

- **Title:** How to Measure Physical Activity Intensity
- **Publisher:** U.S. Centers for Disease Control and Prevention
- **Year:** 2025
- **Type:** government_guidance
- **URL:** https://www.cdc.gov/physical-activity-basics/measuring/index.html
- **Use:** talk_test, absolute_met_intensity, moderate_vigorous_examples
- **Rights note:** Summarize with citation.

### src_compendium_2024

- **Title:** 2024 Adult Compendium of Physical Activities: A third update of the energy costs of human activities
- **Publisher:** Journal of Sport and Health Science
- **Year:** 2024
- **Type:** systematic_compendium
- **URL:** https://pubmed.ncbi.nlm.nih.gov/38242596/
- **Use:** met_reference, activity_classification, energy_cost_limitations
- **Rights note:** Do not bulk-copy the Compendium without confirming reuse rights. Store source codes only when licensed and reviewed.

### src_tanaka_hrmax_2001

- **Title:** Age-predicted maximal heart rate revisited
- **Publisher:** Journal of the American College of Cardiology
- **Year:** 2001
- **Type:** primary_research
- **URL:** https://pubmed.ncbi.nlm.nih.gov/11153730/
- **Use:** age_predicted_hrmax
- **Rights note:** Use the equation with citation; label as an estimate with substantial individual error.

### src_talk_test_review_2014

- **Title:** The talk test: a useful tool for prescribing and monitoring exercise intensity
- **Publisher:** Current Opinion in Cardiology
- **Year:** 2014
- **Type:** review
- **URL:** https://pubmed.ncbi.nlm.nih.gov/25010379/
- **Use:** talk_test, relative_intensity
- **Rights note:** Summarize; do not reproduce copyrighted protocols verbatim.

### src_talk_test_regulation_2015

- **Title:** Evidence that the talk test can be used to regulate exercise intensity
- **Publisher:** Journal of Strength and Conditioning Research
- **Year:** 2015
- **Type:** validation_study
- **URL:** https://pubmed.ncbi.nlm.nih.gov/25536539/
- **Use:** talk_test_regulation
- **Rights note:** Summarize with citation.

### src_hiit_umbrella_2024

- **Title:** High-intensity interval training and cardiorespiratory fitness in adults: an umbrella review
- **Publisher:** Scandinavian Journal of Medicine & Science in Sports
- **Year:** 2024
- **Type:** umbrella_review
- **URL:** https://pubmed.ncbi.nlm.nih.gov/38760916/
- **Use:** hiit_effectiveness, evidence_quality, population_variability
- **Rights note:** Summarize effect direction and limitations; do not claim universal superiority.

### src_concurrent_meta_2022

- **Title:** Compatibility of Concurrent Aerobic and Strength Training for Skeletal Muscle Size and Function
- **Publisher:** Sports Medicine
- **Year:** 2022
- **Type:** systematic_review_meta_analysis
- **URL:** https://pubmed.ncbi.nlm.nih.gov/34757594/
- **Use:** concurrent_training, strength_hypertrophy, explosive_strength
- **Rights note:** Summarize with population and protocol limitations.

### src_concurrent_fiber_meta_2022

- **Title:** Effects of Concurrent Aerobic and Strength Training on Muscle Fiber Hypertrophy
- **Publisher:** Sports Medicine
- **Year:** 2022
- **Type:** systematic_review_meta_analysis
- **URL:** https://pubmed.ncbi.nlm.nih.gov/35476184/
- **Use:** concurrent_training, fiber_hypertrophy, running_cycling_context
- **Rights note:** Use only as qualified context; avoid deterministic modality claims.

### src_acsm_screening_2015

- **Title:** Updating ACSM's Recommendations for Exercise Preparticipation Health Screening
- **Publisher:** Medicine & Science in Sports & Exercise
- **Year:** 2015
- **Type:** consensus_update
- **URL:** https://pubmed.ncbi.nlm.nih.gov/26473759/
- **Use:** preparticipation_screening, medical_clearance_boundary
- **Rights note:** Use conceptual factors; do not reproduce proprietary questionnaires.

### src_aha_target_hr_2024

- **Title:** Target Heart Rates Chart
- **Publisher:** American Heart Association
- **Year:** 2024
- **Type:** professional_guidance
- **URL:** https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/target-heart-rates
- **Use:** heart_rate_guidance, medication_caution
- **Rights note:** Summarize and label age-predicted values as general guides.

### src_aha_warning_signs_2024

- **Title:** Develop a Physical Activity Plan for You
- **Publisher:** American Heart Association
- **Year:** 2024
- **Type:** professional_guidance
- **URL:** https://www.heart.org/en/health-topics/cardiac-rehab/getting-physically-active/develop-a-physical-activity-plan-for-you
- **Use:** exercise_stop_signals, urgent_symptoms
- **Rights note:** Summarize with citation; emergency wording must be localized where deployed.

### src_cdc_heat_athletes_2024

- **Title:** Heat and Athletes
- **Publisher:** U.S. Centers for Disease Control and Prevention
- **Year:** 2024
- **Type:** government_guidance
- **URL:** https://www.cdc.gov/heat-health/risk-factors/heat-and-athletes.html
- **Use:** heat_safety, outdoor_exercise
- **Rights note:** Summarize with citation.

### src_cdc_heatrisk_aqi_2025

- **Title:** How to use the HeatRisk Tool and Air Quality Index
- **Publisher:** U.S. Centers for Disease Control and Prevention
- **Year:** 2025
- **Type:** government_guidance
- **URL:** https://www.cdc.gov/heat-health/hcp/clinical-guidance/how-to-use-the-heatrisk-tool-and-air-quality-index.html
- **Use:** air_quality, heat_risk, outdoor_modification
- **Rights note:** Do not hard-code local advisories without a current approved data source.

### src_aha_pa_recommendations

- **Title:** American Heart Association Recommendations for Physical Activity in Adults
- **Publisher:** American Heart Association
- **Year:** 2024
- **Type:** professional_guidance
- **URL:** https://www.heart.org/en/healthy-living/exercise-and-physical-activity/fitness-basics/aha-recs-for-physical-activity-in-adults
- **Use:** public_health_volume, talk_test_examples, beginner_progression
- **Rights note:** Summarize with citation.


## 31. Lovable implementation rule

When the source, formula, rights status, population, intensity method or safety boundary is incomplete, Lovable must show an unavailable or draft state. It must not fill the gap with generated cardio advice.
