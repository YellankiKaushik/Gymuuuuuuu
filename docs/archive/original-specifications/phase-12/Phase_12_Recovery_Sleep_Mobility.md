# Phase 12 - Recovery, Sleep and Mobility

**Project:** Fitness OS  
**Document type:** Lovable implementation specification  
**Version:** 1.0  
**Date:** 5 August 2026  
**Status:** Ready for Plan-mode review  
**Depends on:** Phases 00, 01, 02, 03, 04, 05 and 06  
**Provides data contracts to:** Phases 15 and 17

---

## 0. How to use this phase

1. Keep the Phase 00 Project Knowledge active.
2. Preserve the Phase 01 shell, navigation, responsive behavior, themes and accessibility foundation.
3. Confirm Phase 02 muscle and body-region IDs are available.
4. Confirm Phase 03 exercise IDs, movement patterns, equipment IDs and safety fields are available.
5. Confirm Phase 04 Workout Science terminology for fatigue, RPE/RIR, deloading, warm-ups and recovery remains authoritative.
6. Confirm Phase 05 program structures and Phase 06 workout-session records are available for contextual links only.
7. Attach this Markdown specification.
8. Attach `Phase_12_Recovery_Sleep_Mobility_Data_Schema.json`.
9. Attach `Phase_12_Recovery_Sleep_Mobility_Reference_Data.json`.
10. Attach `Phase_12_Lovable_Prompt_Package.txt`.
11. Also attach the Phase 02, 03, 04 and 06 schemas/taxonomies because Phase 12 consumes those stable IDs.
12. Run the Plan-mode prompt before any code change.
13. Reject any plan that invents sleep stages, diagnoses insomnia or injury, produces an opaque recovery score, fabricates stretching prescriptions, or adds wearables/cloud services.
14. Approve only the Phase 12 scope.
15. Run Agent mode, verification, sleep-calculation audit, recovery-safety audit, mobility-content audit and privacy audit.
16. Create the GitHub checkpoint `phase-12-recovery-sleep-mobility-complete` only after every blocking acceptance test passes.

## 1. Phase objective

Build a transparent, evidence-governed system for recovery education, manual sleep tracking, subjective recovery check-ins, warm-up and mobility routines, routine-session logging, and recovery-method comparison.

The module must deliver:

- A Recovery home screen that links sleep, recovery check-ins, mobility, warm-ups and evidence-based recovery topics.
- A sleep diary based on recognized prospective self-monitoring fields.
- Transparent sleep-duration, sleep-opportunity and sleep-efficiency calculations.
- Sleep schedule summaries without diagnostic labels.
- Manual or clearly labelled consumer-device estimates; no sleep-stage diagnosis.
- Separate recovery dimensions instead of a proprietary composite score.
- Regional soreness tracking linked to Phase 02 body regions.
- Pain, illness and serious sleep-concern boundaries that suppress automated training prescriptions.
- A reviewed knowledge library for sleep, soreness, fatigue, rest, active recovery, massage, compression, foam rolling, stretching, cold-water immersion and other recovery modalities.
- A reviewed warm-up and mobility routine library linked to Phase 03 exercises.
- Local custom routine creation with immutable versions.
- Mobility-session history and adherence data.
- Phase 06 workout links without rewriting completed workout records.
- IndexedDB persistence, versioned backup, restore and CSV/JSON export.
- Strict boundaries against medical diagnosis, injury rehabilitation, sleep-treatment protocols and unvalidated wearable claims.

Phase 12 answers: **“How did I sleep, how do I feel, what recovery evidence applies, and which reviewed warm-up or mobility routine can I perform?”**

It does not answer: **“Do I have a sleep disorder or injury, what treatment should I receive, or should I medically clear myself to train?”**

## 2. Supported use and hard boundaries

### 2.1 Supported use

- Adults using the application for general fitness and personal self-monitoring.
- Manual sleep diaries and optional device-duration estimates.
- Subjective fatigue, energy, soreness, stress, motivation, mood and readiness entries.
- Reviewed educational content on recovery methods.
- General warm-up, cool-down, mobility, flexibility and movement-break routines.
- Routine completion history.
- Local-only storage and user-controlled export.

### 2.2 Hard boundaries

- No diagnosis of insomnia, sleep apnea, circadian-rhythm disorder, overtraining syndrome, injury or illness.
- No sleep-stage inference from phone or wearable data.
- No claim that a consumer device is equivalent to polysomnography.
- No proprietary or opaque recovery/readiness score.
- No automatic change to a Phase 05 program based on check-in values.
- No advice to train through pain, illness or severe sleepiness.
- No rehabilitation protocol for a diagnosed injury.
- No medical cold, heat, compression or breathing protocol.
- No universal statement that one recovery modality is best.
- No claim that post-exercise stretching prevents soreness or accelerates recovery.
- No claim that soreness is required for progress.
- No generic mobility routine published without reviewed steps, sources and safety notes.
- No copying of commercial sleep questionnaires, mobility programs, images or videos without rights.
- No authentication, cloud database, runtime health API, wearable integration or remote analytics containing personal health records.

## 3. Phase ownership and dependencies

| Concept | Owning phase | Phase 12 rule |
| --- | --- | --- |
| Shell, navigation and shared components | Phase 01 | Reuse without redesign. |
| Body regions and muscle IDs | Phase 02 | Reuse for soreness, mobility targets and filters. |
| Exercise identities and technique | Phase 03 | Reference reviewed exercise IDs; never duplicate exercise instructions. |
| Training-science concepts | Phase 04 | Cross-link fatigue, deload, warm-up, RPE/RIR and recovery principles. |
| Program schedule | Phase 05 | Display context only; do not modify a program automatically. |
| Completed workout history | Phase 06 | Link immutable workout sessions to check-ins and summaries. |
| Long-term analytics | Phase 15 | Consume snapshots and descriptive trends. |
| Global backup and restore | Phase 17 | Register a versioned Phase 12 adapter. |

## 4. Non-negotiable product decisions

1. **No hidden recovery score.** Display dimensions separately. Overall readiness is entered by the user, not calculated.
2. **Sleep entries are estimates.** Manual diaries and consumer-device records are self-monitoring data, not diagnostic measurements.
3. **Sleep stages are excluded.** The app may store device-reported duration only when clearly labelled as an estimate.
4. **Adult sleep guidance is population-level.** Seven or more hours is displayed as consensus guidance, not a universal personal prescription.
5. **Regularity is descriptive.** Show schedule variability without universal red/green thresholds.
6. **No physiological “sleep debt” total.** Show only the difference from a user-selected duration goal.
7. **Pain is separate from soreness.** A pain or injury concern triggers a safety boundary, not a training recommendation.
8. **One bad day is not a diagnosis.** Trends and individual baselines matter more than a single check-in.
9. **Recovery outcomes are separated.** Soreness, perceived fatigue, strength/power and long-term adaptation are not interchangeable.
10. **Mobility is task-specific.** Do not label a person globally “mobile” or “immobile.”
11. **Routine versions are immutable.** Historical sessions retain the exact routine version performed.
12. **Published content is reviewed.** Draft taxonomy identities must not become factual articles or routines automatically.
13. **Local means local.** Sleep, soreness, pain flags, stress, notes and routine history stay on the device unless exported.

## 5. Required routes

| Route | Purpose |
| --- | --- |
| `/recovery` | Recovery overview, recent check-in and module navigation. |
| `/recovery/check-in` | Create or edit today’s recovery check-in. |
| `/recovery/history` | Recovery-check-in history and descriptive trends. |
| `/recovery/topics` | Recovery knowledge catalogue. |
| `/recovery/topics/$topicSlug` | Recovery topic detail. |
| `/sleep` | Sleep overview and recent diary summary. |
| `/sleep/log` | Create or edit a sleep diary entry. |
| `/sleep/history` | Sleep diary calendar and trends. |
| `/sleep/methodology` | Field definitions, calculations and device limitations. |
| `/mobility` | Mobility and flexibility knowledge and routine catalogue. |
| `/mobility/routines/$routineSlug` | Reviewed routine detail. |
| `/mobility/session/$routineId` | Perform and log a routine. |
| `/mobility/history` | Completed routine history. |
| `/mobility/custom` | Local custom routines. |
| `/mobility/custom/create` | Create a local routine. |
| `/warm-ups` | Warm-up routine catalogue. |
| `/warm-ups/$routineSlug` | Warm-up routine detail. |
| `/recovery/settings` | Units, sleep goal, check-in defaults and privacy. |
| `/recovery/privacy` | Local storage, export and device-data limitations. |

Invalid IDs must show recoverable not-found states. Corrupt records must be quarantined without crashing other records.

## 6. Primary user journeys

### 6.1 Log last night’s sleep

1. Open Sleep Log.
2. Confirm the wake-date and time zone.
3. Enter when the user got into bed and tried to sleep.
4. Enter estimated sleep-onset latency.
5. Enter awakenings and total wake time after sleep onset.
6. Enter final wake time and time out of bed.
7. Add naps separately.
8. Rate sleep quality, restedness and daytime sleepiness.
9. Review calculated sleep opportunity, estimated sleep duration and efficiency.
10. Resolve impossible chronology warnings or save as incomplete.
11. Store the entry locally.

### 6.2 Enter a device estimate

1. Select Consumer Device Estimate.
2. Enter the device name and estimated duration.
3. Do not import or interpret sleep stages in MVP.
4. Show a permanent statement that consumer sleep technology is not diagnostic.
5. Store the device source with the record.

### 6.3 Complete a recovery check-in

1. Rate overall readiness only if the user wants to.
2. Rate energy, fatigue, stress, motivation, mood and perceived recovery separately.
3. Add regional soreness with body region and laterality.
4. Indicate pain/injury concern or illness symptoms separately.
5. Link the most recent sleep log and recent Phase 06 workout sessions.
6. Save without generating a medical or training prescription.
7. Show recent personal trends and the raw values used.

### 6.4 Perform a reviewed warm-up

1. Open a warm-up routine.
2. Review goal, context, duration, equipment and stop signals.
3. Start the routine.
4. Follow each step with timer/repetition controls.
5. Mark complete or skip.
6. Finish and optionally rate difficulty or discomfort.
7. Save the exact routine-version snapshot.

### 6.5 Create a local mobility routine

1. Enter a title and context.
2. Add reviewed Phase 03 exercises or local text-only steps.
3. Set repetitions, seconds, breaths, distance or ramp-up-set dose.
4. Add technique cues and stop signals.
5. Save immutable version 1.
6. Editing creates version 2; old sessions remain linked to version 1.

### 6.6 Compare recovery methods

1. Open Recovery Topics.
2. Select methods such as active recovery, massage, foam rolling, stretching or cold-water immersion.
3. Compare effects by outcome: soreness, perceived fatigue, performance recovery and long-term adaptation.
4. Display evidence level, population and limitations.
5. Never convert mixed evidence into a universal winner.

## 7. Recovery overview screen

The overview must include:

- Today’s check-in status.
- Last recorded sleep duration and quality.
- Recent Phase 06 workout context.
- Regional soreness summary.
- Quick links to Sleep Log, Check-In, Warm-Ups and Mobility.
- Continue-reading and saved-content sections.
- A clear local-data indicator.

It must not show:

- A calculated readiness score.
- “Recovered/not recovered” diagnosis.
- Automatic program changes.
- Calorie-burn or hormonal-recovery claims.

## 8. Recovery check-in data model

Required fields:

- Stable record ID.
- Local calendar date and IANA time zone.
- Optional overall readiness, 1–5.
- Energy, 1–5.
- General fatigue, 1–5 where higher means more fatigue.
- Stress, 1–5 where higher means more stress.
- Motivation, 1–5.
- Mood, 1–5.
- Perceived recovery, 1–5.
- Regional soreness entries, 0–10.
- Pain or injury concern boolean.
- Optional pain-concern severity, 0–10.
- Illness-symptom boolean.
- Linked sleep-log ID.
- Linked immutable Phase 06 workout-session IDs.
- Notes.
- Created and updated timestamps.

### 8.1 Scale integrity

- Every scale must show endpoint meanings.
- Direction must not change across screens.
- Missing values remain missing.
- Zero is valid only for 0–10 soreness/pain scales.
- Do not average dimensions into a health score.

### 8.2 Trend presentation

Show:

- Daily values.
- Seven-, twenty-eight- and ninety-day descriptive trends.
- Median and range where useful.
- User’s own recent baseline.
- Missing-day disclosure.

Do not show population diagnostic cutoffs.

## 9. Soreness, pain and illness boundaries

### 9.1 Soreness

Soreness is user-reported and region-specific. The app may explain delayed-onset muscle soreness, but it must not equate soreness with muscle growth or workout quality.

### 9.2 Pain or injury concern

When the user marks pain or injury concern:

- Suppress automated workout suggestions.
- Display a neutral message to stop or modify activity that worsens pain and seek qualified evaluation when appropriate.
- Do not identify a tissue, condition or diagnosis.
- Do not generate a rehabilitation routine.

### 9.3 Illness symptoms

When illness symptoms are marked:

- Do not recommend training intensity.
- Do not diagnose infection or provide treatment.
- Allow the user to record a note and review history.

## 10. Sleep diary data model

The core sleep record must include:

- Wake-date used as the diary date.
- IANA time zone.
- Source: morning diary, later recall or consumer-device estimate.
- Got-into-bed time.
- Attempted-sleep time.
- Estimated sleep-onset latency.
- Number of awakenings.
- Total wake time after sleep onset.
- Final wake time.
- Out-of-bed time.
- Naps as separate intervals.
- Sleep quality, restedness and daytime sleepiness.
- Optional context tags: late caffeine, alcohol, late intense exercise, travel, shift work, illness or high stress.
- Notes.
- Calculation version and validation warnings.

The field structure follows the purpose of the Consensus Sleep Diary without copying a protected form or questionnaire verbatim.

## 11. Sleep calculations

### 11.1 Sleep opportunity

`sleepOpportunityMinutes = outOfBedAt - attemptedSleepAt`

Use exact timestamps, not string subtraction. Overnight records must work across midnight.

### 11.2 Terminal wakefulness

`terminalWakeMinutes = outOfBedAt - finalWakeAt`

### 11.3 Estimated total sleep

`estimatedTotalSleepMinutes = sleepOpportunityMinutes - sleepOnsetLatencyMinutes - wakeAfterSleepOnsetMinutes - terminalWakeMinutes`

If required inputs are missing, the result is unavailable. If the result is negative or greater than the opportunity, the entry is invalid and must show a correction prompt.

### 11.4 Sleep efficiency

`sleepEfficiencyPercent = estimatedTotalSleepMinutes / sleepOpportunityMinutes × 100`

Show to one decimal place. Do not use the percentage to diagnose insomnia.

### 11.5 Daily total sleep

`dailyTotalSleepMinutes = main-sleep estimate + completed nap durations`

Naps do not alter the main sleep episode’s efficiency.

### 11.6 Difference from selected goal

The user may select a local duration goal. Display:

`differenceFromSelectedGoal = dailyTotalSleepMinutes - selectedGoalMinutes`

Do not call this physiological sleep debt or promise that one long sleep erases accumulated effects.

## 12. Time-zone and chronology rules

- Store instants with offsets and store the IANA zone separately.
- Use wake-date in the entry’s local time zone.
- Handle cross-midnight sleep.
- Detect daylight-saving transitions where applicable.
- Do not compare clock-time regularity across a time-zone change without a warning.
- Prevent final wake before attempted sleep unless exact timestamps show a valid next-day crossing.
- Prevent overlapping naps and main sleep unless explicitly retained as a correction warning.
- Never shift historical records when the current device time zone changes.

## 13. Sleep summaries

Supported summaries:

- Average and median total sleep duration.
- Minimum and maximum duration.
- Sleep-quality and restedness trends.
- Median attempted-sleep and wake times.
- Descriptive schedule variability after midnight-aware unwrapping.
- Number of complete and incomplete entries.
- Device-estimate proportion.
- Difference from the locally selected goal.

No universal red/amber/green classification is allowed for schedule variability or sleep efficiency.

## 14. Adult sleep reference guidance

The interface may state that consensus guidance recommends **seven or more hours per night on a regular basis for generally healthy adults**. It must also state:

- Individual needs vary.
- A single night is not a diagnosis.
- More sleep may be appropriate in some circumstances.
- The app does not establish a personal medical requirement.

Do not convert the guidance into a mandatory target without explicit user selection.

## 15. Consumer sleep technology boundary

- Consumer-device data must be labelled `estimate`.
- The app must not claim device validation unless the exact device and validation study are documented.
- Sleep-stage charts are excluded from the MVP.
- Device duration may be stored as a separate estimate, not merged invisibly with diary-derived duration.
- Consumer technology cannot be used in the app to diagnose or treat a sleep disorder.
- No wearable account connection is permitted in Phase 12.

## 16. Sleep-concern safety messages

The app may show a neutral suggestion to seek professional evaluation when the user reports persistent sleep problems, severe daytime sleepiness, breathing that starts/stops during sleep, frequent loud snoring or gasping.

Rules:

- The app does not determine persistence automatically from a single night.
- The app does not claim the user has sleep apnea or insomnia.
- The message must cite the approved sleep-health source.
- Emergency language must be reserved for genuinely urgent symptoms; Phase 12 does not create an emergency triage tool.

## 17. Recovery knowledge catalogue

Every published recovery topic requires:

- Stable ID and slug.
- Plain-language definition.
- Target outcomes separated into soreness, perceived fatigue, strength/power, range of motion and long-term adaptation.
- Applicable population.
- Intervention description.
- Evidence summary.
- Evidence strength and limitations.
- Contraindication and professional-guidance boundary where relevant.
- Related Phase 04 concepts.
- Source registry entries.
- Reviewed date and reviewer status.

### 17.1 Required modality topics

- Passive rest.
- Active recovery.
- Massage.
- Compression garments.
- Foam rolling.
- Post-exercise stretching.
- Cold-water immersion.
- Heat exposure.
- Contrast-water methods.
- Sleep.
- Stress management and relaxation context.

### 17.2 Outcome separation

A modality that improves perceived soreness does not automatically improve strength, power, biomarkers or long-term adaptation. The comparison UI must preserve this distinction.

## 18. Cold-water immersion rules

The article must distinguish:

- Acute perceived-soreness or recovery outcomes.
- Immediate performance outcomes.
- Repeated use after resistance training and possible adaptation trade-offs.
- Population limitations, including male-dominated evidence where applicable.

The app must not:

- Present cold-water immersion as mandatory.
- Generate a personalised temperature/time prescription.
- Recommend use to people with medical contraindications.
- Hide the potential trade-off with resistance-training adaptation.

## 19. Stretching and foam-rolling rules

### 19.1 Post-exercise stretching

Do not claim post-exercise stretching reduces delayed-onset soreness or accelerates strength recovery. It may be used for preference or range-of-motion goals when appropriate.

### 19.2 Static stretching before performance

- Explain that acute effects depend on duration, context and the activity that follows.
- Avoid static stretching as the only warm-up for maximal or explosive performance.
- Do not turn research-duration observations into a universal prescription.

### 19.3 Dynamic stretching

Dynamic movements may be used inside a task-specific warm-up. Each published routine must include controlled technique and context.

### 19.4 Foam rolling

Explain that effects are generally modest and outcome-specific. Do not claim that foam rolling breaks adhesions, detoxifies tissue or permanently lengthens fascia.

## 20. Warm-up architecture

A reviewed warm-up may contain:

1. General movement to increase temperature.
2. Dynamic mobility relevant to the session.
3. Movement rehearsal.
4. Phase 06/Phase 03 ramp-up sets for the primary exercise.

Not every session requires the same sequence or duration. The routine must state its goal, population, equipment and context.

### 20.1 Warm-up routine fields

- Stable routine identity and immutable version.
- Title and summary.
- Context and goal.
- Experience level.
- Estimated duration.
- Equipment.
- Target body regions and movement patterns.
- Ordered steps.
- Dose type and value.
- Technique cues.
- Intensity cues.
- Stop signals.
- Alternatives.
- Source and review metadata.

## 21. Mobility and flexibility architecture

### 21.1 Terminology

- Flexibility: available passive or active range, depending on the measure.
- Mobility: usable movement capability in a specific task and context.
- Range of motion must identify the joint, direction, measurement and conditions.

### 21.2 Routine categories

- Warm-up.
- Cool-down.
- Standalone mobility.
- Flexibility.
- Recovery.
- Movement break.
- Position-specific preparation.

### 21.3 Publication gate

A routine may be public only when:

- Every exercise/step is reviewed.
- Phase 03 references are valid.
- Dose and sequence are source-backed or explicitly editorial with rationale.
- Stop signals and limitations are complete.
- Media rights are documented.
- The routine does not claim to diagnose or treat a condition.
- Editorial status is `published`.

## 22. Routine execution interface

Required behavior:

- Large start/pause/next controls.
- Current and upcoming step.
- Timer, repetitions or breath count.
- Side switching.
- Technique cue.
- Stop signal.
- Skip action.
- Session elapsed time.
- Screen-wake behavior only after user permission.
- Keyboard and screen-reader access.
- No automatic camera analysis.

At completion, save:

- Routine ID and exact version ID.
- Start and end timestamps.
- Completed and skipped steps.
- Perceived difficulty.
- Discomfort concern.
- Notes.

## 23. Local custom routines

- Stored only in IndexedDB.
- May reference published Phase 03 exercise IDs.
- May include local text-only steps.
- Editing creates a new version.
- Archiving does not delete historical sessions.
- Import conflicts must offer keep existing, import as copy or replace local.
- Custom routines are never published automatically.

## 24. Search, filters and relationships

### 24.1 Knowledge filters

- Domain: sleep, recovery, readiness, mobility.
- Evidence strength.
- Population.
- Outcome.
- Modality.
- Publication/review status for development tools.

### 24.2 Routine filters

- Context.
- Body region.
- Movement pattern.
- Duration.
- Equipment.
- Difficulty.
- Warm-up vs cool-down vs standalone.

### 24.3 Relationships

- Sleep topics link to recovery topics.
- Recovery topics link to Phase 04 concepts.
- Mobility topics link to Phase 02 regions and Phase 03 exercises.
- Warm-ups link to Phase 05 program days but do not modify them.
- Check-ins link to immutable Phase 06 workout sessions.

## 25. IndexedDB architecture

Required stores:

1. `phase12_sleep_logs`.
2. `phase12_recovery_checkins`.
3. `phase12_mobility_sessions`.
4. `phase12_custom_routine_identities`.
5. `phase12_custom_routine_versions`.
6. `phase12_settings`.
7. `phase12_audit_events`.
8. `phase12_deleted_records`.
9. `phase12_import_conflicts`.
10. `phase12_derived_summaries`.

Required indexes include date, updated time, routine ID, routine version, publication status and linked workout-session ID where applicable.

Derived summaries must be disposable and exactly rebuildable from source records.

## 26. Backup, restore and export

### 26.1 JSON backup

Include:

- Schema version.
- Export time.
- Module ID.
- Sleep logs.
- Recovery check-ins.
- Mobility sessions.
- Custom routine versions.
- Settings.
- Audit events.
- Deleted-record tombstones.

### 26.2 Restore

- Validate before writing.
- Preview counts and conflicts.
- Use a transaction.
- Roll back on failure.
- Offer keep-existing, import-as-copy and replace-local modes.
- Rebuild derived summaries after successful restore.

### 26.3 CSV exports

Provide separate exports for:

- Sleep diary.
- Recovery check-ins.
- Regional soreness.
- Mobility sessions.
- Custom routines.

Do not flatten missing values into zero.

## 27. Privacy and runtime-network requirements

- No personal sleep, stress, soreness, pain, mood, illness, routine or note data may leave the browser.
- No analytics event may contain personal Phase 12 values.
- Error reports must not include record payloads.
- Imports and exports are processed locally.
- Static knowledge files and user-clicked source links are allowed.
- No wearable, AI, cloud database, remote logging or health API request is allowed.

## 28. Content governance

Every published article or routine requires:

- Source IDs.
- Claim-to-source mapping.
- Population and context.
- Evidence strength.
- Limitations.
- Last-reviewed date.
- Reviewer/editor status.
- Media rights.
- Public-safe language.

Lovable must not convert taxonomy titles into full articles by generation.

## 29. Accessibility and responsive behavior

- Meet the Phase 01 WCAG 2.2 AA target.
- Every rating control has a visible label and screen-reader value.
- Charts have data-table alternatives.
- Color is never the only signal.
- Routine controls have at least 44 × 44 CSS-pixel targets.
- Timer state is announced without excessive live-region chatter.
- Motion respects reduced-motion preferences.
- Tables collapse into accessible cards on narrow screens.
- All workflows work at 320 CSS pixels.

## 30. Performance requirements

- Lazy-load knowledge content and routine media.
- Keep active routine controls responsive offline.
- Render trend charts from derived summaries.
- Avoid loading every sleep/check-in record at startup.
- Paginate or virtualize long histories.
- No runtime scientific-content API.

## 31. Empty, error and unavailable states

Required states:

- No sleep entries.
- Incomplete sleep entry.
- Impossible sleep chronology.
- Device estimate with limitation notice.
- No check-in history.
- Missing linked workout.
- Draft routine unavailable publicly.
- Routine step missing a Phase 03 exercise.
- Restore conflict.
- Storage unavailable or quota error.
- Corrupt record quarantined.
- Source link unavailable.

Never replace unavailable evidence or data with generated text.

## 32. Acceptance criteria

Phase 12 is complete only when:

1. All required routes work on desktop and mobile.
2. Sleep logging supports overnight chronology and time zones.
3. Test-vector calculations produce exact expected results.
4. Missing sleep fields remain unavailable.
5. Device estimates are clearly labelled and non-diagnostic.
6. No sleep-stage diagnosis or wearable integration exists.
7. Recovery dimensions remain separate.
8. No proprietary recovery score exists.
9. Pain/illness flags suppress automated training prescriptions.
10. Regional soreness uses valid Phase 02 region IDs.
11. Knowledge topics distinguish subjective and objective outcomes.
12. Cold-water content includes adaptation trade-offs.
13. Post-exercise stretching is not represented as a proven DOMS solution.
14. Routine references use valid Phase 03 exercise IDs.
15. Routine versions are immutable.
16. Historical sessions retain their version IDs.
17. IndexedDB CRUD and migrations pass.
18. Backup/restore conflicts and rollback pass.
19. CSV exports preserve missing values.
20. No personal Phase 12 record leaves the browser.
21. Accessibility, dark mode and 320-pixel layouts pass.
22. Phases 00–06 regression tests remain green.

## 33. Required automated tests

- Sleep chronology across midnight.
- Sleep-opportunity calculation.
- Terminal-wake calculation.
- Total-sleep calculation.
- Sleep-efficiency calculation.
- Incomplete-entry null behavior.
- Negative/impossible duration rejection.
- Nap aggregation.
- Time-zone-change regularity warning.
- Device-estimate limitation rendering.
- No composite recovery score.
- Pain-flag safety behavior.
- Phase 02 body-region reference validation.
- Phase 03 routine-step reference validation.
- Routine circular/invalid version reference prevention.
- Routine-session snapshot integrity.
- IndexedDB migration and transaction rollback.
- JSON backup round-trip.
- Restore conflict modes.
- CSV missing-value preservation.
- Network request audit.
- Keyboard, screen-reader and reduced-motion tests.

## 34. Manual test matrix

Test at minimum:

- 320 × 568 phone.
- 390 × 844 phone.
- 768 × 1024 tablet.
- 1366 × 768 desktop.
- 1440 × 900 desktop.
- Light, dark and system themes.
- Keyboard only.
- Screen reader.
- Reduced motion.
- Browser refresh during an active mobility routine.
- Offline use after initial load.
- Storage-denied and quota-failure states.

## 35. Lovable guardrails

Lovable must not:

- Add Supabase, authentication, backend storage or cloud sync.
- Add Apple Health, Google Fit, Fitbit, Garmin or wearable APIs.
- Generate sleep stages.
- Diagnose sleep disorders, injury, illness or overtraining.
- Create an opaque readiness score.
- Automatically change a workout program.
- Invent recovery evidence or mobility prescriptions.
- Publish draft topic/routine identities.
- Copy commercial routines, questionnaires, images or videos.
- Send personal health data to analytics or error services.
- Refactor unrelated completed phases.

## 36. Source registry and evidence rules

The attached reference-data file contains the approved sources. At minimum, implementation must preserve these evidence distinctions:

- Adult sleep duration: AASM/SRS consensus.
- Sleep regularity: formal consensus with limitations.
- Sleep fields: Consensus Sleep Diary concepts.
- Consumer devices: not diagnostic.
- Warm-up: performance effects are context-specific.
- Static stretching: duration and follow-on activity matter.
- Post-exercise stretching: no reliable DOMS/strength-recovery advantage over passive recovery.
- Foam rolling: generally small, outcome-specific effects.
- Recovery modalities: perceived soreness/fatigue outcomes differ from objective performance outcomes.
- Repeated cold-water immersion after resistance training may trade off against adaptation.

## 37. Phase completion checklist

- [ ] Plan-mode output approved.
- [ ] Routes and navigation implemented.
- [ ] Sleep diary and formulas implemented.
- [ ] Check-ins and regional soreness implemented.
- [ ] Knowledge catalogue implemented with draft gates.
- [ ] Warm-up and mobility routines implemented.
- [ ] Routine player and history implemented.
- [ ] Custom routine versioning implemented.
- [ ] IndexedDB migrations implemented.
- [ ] Backup, restore and CSV exports implemented.
- [ ] Privacy/network audit passed.
- [ ] Accessibility audit passed.
- [ ] All attached test vectors passed.
- [ ] Phases 00–06 regression suite passed.
- [ ] GitHub checkpoint created.

## 38. Handoff to later phases

Phase 15 may consume:

- Sleep-duration and schedule summaries.
- Self-reported recovery dimensions.
- Regional soreness trends.
- Routine adherence.
- Links between check-ins and Phase 06 sessions.

Phase 15 must not convert these into diagnosis or causal claims.

Phase 17 must include the Phase 12 backup adapter, schema version, conflict handling and restoration tests.
