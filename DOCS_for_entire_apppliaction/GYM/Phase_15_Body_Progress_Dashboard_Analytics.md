# Phase 15 — Body Progress, Dashboard and Analytics

**Project:** Fitness OS  
**Document type:** Lovable implementation specification  
**Phase:** 15 of the modular build  
**Version:** 1.0  
**Status:** Ready for Lovable Plan mode  
**Prepared:** 5 August 2026  
**Depends on:** Phases 00, 01, 02, 03, 05, 06, 07, 08, 09, 10, 12, 13 and optionally 14  
**Next phase:** Phase 16 — Global Search, Favourites and Comparison

---

## 1. Phase objective

Build the local body-progress, dashboard and analytics layer for Fitness OS. This phase must turn existing records into transparent, reproducible summaries without inventing missing measurements, overstating precision, diagnosing health conditions, rating a person's body, or claiming that one behavior caused another outcome.

The module owns three related products:

1. **Body-progress recording:** weight, circumference sessions, externally measured body-composition estimates, progress photos and optional goals.
2. **Personal dashboard:** configurable summaries from completed modules.
3. **Analytics engine:** versioned metric definitions with formulas, inclusions, exclusions, minimum samples and data-quality flags.

The permanent rule is:

> Every displayed metric must expose what it means, how it was calculated, which records were included, which records were excluded, how many observations support it, and which method version produced it.

## 2. Scope

### 2.1 Included

- Local body-weight logging.
- Protocol-specific circumference logging with replicates.
- User-entered body-composition results from external methods.
- Local progress photos with EXIF/GPS metadata removed before storage.
- Optional goals for measurements, performance and consistency.
- Configurable dashboard widgets.
- Workout, strength, program, nutrition, sleep, recovery and cardio summaries.
- Method-labelled trends and comparisons.
- Data-quality flags and record drill-down.
- JSON and CSV export.
- Optional ZIP photo export.
- Backup, restore, deletion and audit records.

### 2.2 Explicit exclusions

- No body-fat calculation from BMI, photographs, waist measurements or model memory.
- No face, pose, physique, symmetry or attractiveness analysis.
- No automatic progress-photo rating.
- No medical diagnosis or disease-risk score.
- No universal health, fitness, recovery, diet or body score.
- No predicted goal-completion date.
- No automated causality statement.
- No automatic correlation engine in the MVP.
- No exercise calorie-burn estimate.
- No VO2max estimate.
- No cloud photo storage.
- No social sharing, public profiles or transformation contests.
- No wearable or smart-scale integration.
- No automatic extraction of values from laboratory reports or images.
- No replacement of raw historical records when formulas change.

## 3. Measurement and evidence reality

1. BMI is weight relative to height. It is a screening measure and does not directly distinguish fat, muscle and bone.
2. Circumference results depend on the anatomical site, tape placement, posture, breathing phase, operator and protocol.
3. Different waist protocols can produce different values. They must not be silently merged.
4. Body-composition methods estimate different compartments using different assumptions. BIA, DXA, skinfolds, air displacement, hydrostatic weighing, ultrasound and optical methods are not interchangeable.
5. Hydration, recent food intake, recent exercise, device configuration and software can affect some body-composition estimates.
6. A small numerical change may reflect measurement variation rather than a real physiological change.
7. A strength personal record is a performance event, not proof that muscle mass increased.
8. A change in recorded intake, sleep or training occurring near a body change does not prove causation.
9. Missing records are unknown. They are not zero and do not prove that the behavior did not occur.
10. Personal tracking is useful only when the method and context remain visible.

## 4. Phase ownership and dependencies

| Concept | Owning phase | Phase 15 rule |
| --- | --- | --- |
| Application shell and design system | Phase 01 | Reuse existing navigation, cards, tables, charts and responsive patterns. |
| Muscle and exercise identities | Phases 02–03 | Use stable IDs for workout views; do not invent effective-muscle volume. |
| Workout programs | Phase 05 | Consume dated program schedules and immutable program versions. |
| Workout sessions and PRs | Phase 06 | Consume canonical session, set and PR records. Do not rewrite source logs. |
| Foods and nutrients | Phases 07–08 | Use canonical identities and completeness metadata. |
| Diet targets | Phase 09 | Compare against frozen target versions only. |
| Nutrition diary | Phase 10 | Consume snapshots. Use user-declared day completeness for aggregate intake analytics. |
| Sleep, recovery and mobility | Phase 12 | Keep dimensions separate; no recovery score. |
| Cardio and conditioning | Phase 13 | Preserve modality and intensity-method labels; no calories or VO2max. |
| Supplement trials | Phase 14 | Optional adherence summary only; never infer efficacy. |
| Global backup | Phase 17 | Register a versioned Phase 15 adapter and optional photo ZIP adapter. |

## 5. Non-negotiable decisions

1. **Raw records are canonical.** Derived analytics are rebuildable caches.
2. **Metric definitions are versioned.** A changed formula creates a new method version.
3. **No silent historical rewrite.** Recalculation changes derived views, not source records.
4. **No hidden score.** Domains remain separate.
5. **No causal language.** Cross-domain charts are descriptive overlays.
6. **No cross-method body-composition trend by default.** Method and device compatibility must pass.
7. **No cross-protocol circumference trend by default.** Site, protocol, side and posture must match.
8. **No inferred complete nutrition day.** The user explicitly marks a day complete for analysis.
9. **No missing-data zero.** Missing, unavailable and deleted remain distinct.
10. **No automatic outlier deletion.** Potential errors are flagged for review.
11. **No universal red/green morality.** Neutral language is required.
12. **No photo processing beyond privacy-preserving re-encoding, sizing and thumbnails.**
13. **No original-photo retention by default.** Store the sanitized copy only.
14. **Photo binaries are excluded from default JSON backup.** Users explicitly request a ZIP export.
15. **No goal-date prediction.** A target date may be stored, but the app does not forecast completion.
16. **No body-fat estimate from circumference or BMI.** External results are user-entered and method-labelled.
17. **No “effective sets” claim.** Muscle analytics use transparent exercise-set associations only.
18. **No analytics from draft or quarantined records.**
19. **Every card has a details view.** Formula, records, exclusions and quality flags are inspectable.
20. **Local means local.** Measurements, photos, notes and goals stay on device unless exported.

## 6. Required routes

| Route | Purpose |
| --- | --- |
| `/dashboard` | Configurable cross-module dashboard. |
| `/progress` | Body-progress overview. |
| `/progress/weight` | Weight logging, raw chart and trend views. |
| `/progress/measurements` | Circumference sites, sessions and protocol comparisons. |
| `/progress/body-composition` | Method-labelled external body-composition estimates. |
| `/progress/photos` | Local progress-photo sets and manual comparison. |
| `/progress/goals` | Optional measurement, performance and consistency goals. |
| `/analytics` | Analytics-domain overview. |
| `/analytics/workouts` | Workout consistency, sets, duration and volume. |
| `/analytics/strength` | Exercise-specific performance and PR trends. |
| `/analytics/nutrition` | Complete-day intake and data-coverage summaries. |
| `/analytics/recovery` | Sleep and separate recovery-dimension trends. |
| `/analytics/cardio` | Modality-specific cardio duration, distance and pace. |
| `/analytics/data-quality` | Missing data, mixed methods and stale calculation notices. |
| `/analytics/methodology` | Metric definitions, formulas, versions and sources. |
| `/progress/settings` | Units, protocols, default date ranges and photo preferences. |
| `/progress/privacy` | Local storage, photo handling, export and deletion behavior. |

Invalid IDs show recoverable not-found states. Corrupt records are quarantined and excluded from calculations.

## 7. Dashboard information architecture

### 7.1 Dashboard principles

The dashboard is a summary, not a verdict. It must:

- Show the selected date range.
- Show source module and last refresh.
- Show sample count.
- Show data-quality state.
- Link to raw records.
- Allow each widget to be hidden.
- Allow users to reorder widgets.
- Avoid celebratory or punitive language based solely on weight or appearance.
- Avoid displaying sensitive photos automatically.

### 7.2 Default dashboard

Recommended default widgets:

1. Today and next planned workout.
2. Recent completed workouts.
3. Body-weight trend, hidden until records exist.
4. Nutrition logging status and selected target comparison.
5. Sleep duration and recovery check-in shortcuts.
6. Cardio minutes by modality.
7. Active goal progress.
8. Data-quality notices.

Progress photos are never shown on the default dashboard. The user must opt in.

### 7.3 Widget anatomy

Every widget contains:

- Title.
- Date range.
- Primary value or state.
- Sample count.
- Trend or comparison label where valid.
- Quality flags.
- “How calculated” action.
- “View records” action.
- Empty state with the owning module link.

## 8. Body-weight logging

### 8.1 Required fields

- Measurement date and time.
- IANA time zone.
- Weight.
- Display unit.
- Source: manual or CSV import.
- Scale label where known.
- Time context.
- Fasting state.
- Clothing context.
- After-bathroom field.
- Retrospective-entry flag.
- Notes.

Internally store kilograms. Preserve the original display unit in audit metadata when imported.

### 8.2 Same-day records

Multiple measurements on one date are permitted. The daily canonical value is the median of non-deleted records for that local date. The UI shows:

- Canonical daily value.
- Number of same-day measurements.
- Individual measurements.
- Context differences.

The app does not automatically choose the lowest value.

### 8.3 Trend calculations

- Raw points remain visible.
- Seven-day trend requires at least three measured days.
- Twenty-eight-day trend requires at least ten measured days.
- Missing dates are omitted; they are not interpolated.
- Weekly trend change compares adjacent qualifying seven-day windows.
- No target-date forecast is produced.
- The user can switch off smoothing.

### 8.4 Potential input errors

Values outside configurable technical bounds or abrupt changes can be flagged as possible input errors. The value remains canonical until the user edits or deletes it. The app must never label a change medically impossible.

### 8.5 BMI

BMI is optional and requires a measured or explicitly entered height record. It must be labelled:

- Screening measure.
- Not a direct body-fat measurement.
- Unable to distinguish fat, muscle and bone.
- Not a diagnosis.

No BMI-derived body-fat percentage is allowed.

## 9. Circumference measurements

### 9.1 Protocol-specific records

Every session stores:

- Site identity.
- Protocol identity and version.
- Left, right, bilateral or not applicable.
- Posture.
- Breathing phase.
- Operator.
- Tape label.
- One to five replicate values.
- Canonical value.
- Notes.

The canonical session value is the median of valid replicates.

### 9.2 Comparison compatibility

Default comparison requires equality of:

- Measurement site.
- Protocol ID.
- Protocol version.
- Side.
- Posture.
- Breathing phase when relevant.

Users may view mixed-protocol records in one table, but the chart must visibly separate them and must not calculate one continuous trend.

### 9.3 Waist protocols

At minimum, keep separate:

- WHO midpoint waist.
- Superior iliac-crest waist.
- Umbilical waist.

Risk thresholds are outside the default personal-progress interface. If future educational cutoffs are added, they require population, sex, ethnicity, jurisdiction and source context.

### 9.4 Ratio calculations

Waist-to-hip ratio may be calculated only when waist and hip records:

- Use approved protocols.
- Are sufficiently close in date according to a visible rule.
- Have compatible units.

The app shows the source records and formula. It does not automatically convert the ratio into a diagnosis.

## 10. Body-composition estimates

### 10.1 Supported external methods

- DXA.
- BIA.
- Skinfold assessment.
- Air-displacement plethysmography.
- Hydrostatic weighing.
- Ultrasound.
- Three-dimensional optical estimate.
- Other user-labelled method.

The application stores reported values. It does not calculate the estimate.

### 10.2 Required method metadata

- Method.
- Device manufacturer and model.
- Software version where available.
- Facility or operator where relevant.
- Protocol ID and version.
- Measurement conditions.
- Source report name.
- Values explicitly reported.

### 10.3 Longitudinal comparison

By default, compare only records with compatible:

- Method.
- Device/model.
- Software version where material.
- Protocol.
- Body compartment definition.

Mixed-method views are allowed only as clearly separated records. Do not draw a joined line between them.

### 10.4 Allowed values

The system can store reported:

- Body-fat percentage.
- Fat mass.
- Fat-free mass.
- Lean soft tissue.
- Skeletal-muscle estimate.

A missing component remains unavailable. The app does not derive one component from another unless the source report supplied the exact relationship and method.

## 11. Progress photos

### 11.1 Capture and import

Supported views:

- Front.
- Back.
- Left side.
- Right side.
- Custom.

The user may record pose, clothing, lighting, camera distance and background for consistency.

### 11.2 Privacy-preserving storage

Before storage, create a sanitized local copy by re-encoding the image. The implementation must:

- Remove EXIF metadata.
- Remove GPS metadata.
- Avoid storing the original file by default.
- Generate a local thumbnail.
- Keep images in IndexedDB.
- Avoid runtime upload or remote image processing.
- Warn that normal browser storage is not encrypted by Fitness OS itself.

### 11.3 Photo comparison

- Manual date and view selection.
- Side-by-side and slider modes.
- Keyboard-operable controls.
- No automatic crop based on body detection.
- No pose matching.
- No body segmentation.
- No attractiveness, symmetry, muscularity or fat analysis.
- No “before/after score.”

### 11.4 Backup

Default JSON backup includes photo metadata but not image binaries. Optional photo export creates a ZIP containing:

- Manifest JSON.
- Sanitized images.
- Hashes where available.
- Missing-file report.

Import previews total file count and storage requirement before writing.

## 12. Goals

### 12.1 Supported goals

- Increase a measurement.
- Decrease a measurement.
- Maintain a range.
- Reach a performance value.
- Complete a behavior a chosen number of times.
- Improve logging consistency.

### 12.2 Goal boundaries

- Goals are optional.
- The user selects the metric.
- Baseline and target remain visible.
- Target date is optional.
- No prediction of completion date.
- No automatic target recommendation.
- No judgement when a target is missed.
- Body-photo goals are prohibited.

## 13. Workout and strength analytics

### 13.1 Workout summaries

Allowed summaries:

- Completed sessions.
- Abandoned sessions shown separately.
- Session duration.
- Completed sets by visible set-type filter.
- Exercise frequency.
- Movement-pattern frequency.
- Program adherence when a dated schedule exists.
- Workout notes and pain flags as links, not scores.

### 13.2 Volume load

Volume load is calculated only for compatible completed load-and-repetition sets:

`normalized external load in kg × completed repetitions`

Default exclusions:

- Warm-up sets.
- Technique sets.
- Bodyweight-only sets.
- Assisted repetitions.
- Duration and distance modes.
- Unknown load scope.

Volume load is an arithmetic workload descriptor. It is not labelled total muscular stimulus.

### 13.3 Muscle-related views

Phase 03 relationships may support “sets involving this muscle” views. The UI must say:

- Exercise-set association.
- Based on primary or secondary muscle mapping.
- Not an activation percentage.
- Not an effective-set estimate.
- One set may appear under more than one muscle relationship.

### 13.4 Strength trends

Strength charts remain exercise-specific. Compatibility requires:

- Same canonical exercise ID.
- Compatible equipment.
- Compatible load scope.
- Same estimated-1RM formula version when e1RM is used.

Allowed views:

- Best completed load at a chosen repetition count.
- Best set by load and repetitions.
- Estimated 1RM from Phase 06.
- Rep records.
- Duration or distance records for applicable exercises.
- Personal-record history.

A personal record is not labelled guaranteed physiological improvement.

## 14. Nutrition analytics

### 14.1 Complete-for-analysis review

Phase 15 adds an explicit daily review state:

- Complete for analysis.
- Partial.
- Unknown.

The application never infers that a diary is complete because entries exist.

### 14.2 Aggregate rules

Daily averages and target comparisons use dates explicitly marked complete for analysis. The UI always shows:

- Complete-day count.
- Partial-day count.
- Date range.
- Nutrient-coverage state.
- Target snapshot version.

### 14.3 Allowed summaries

- Recorded energy average.
- Recorded protein, carbohydrate, fat and fibre averages.
- Difference from frozen Phase 09 targets.
- Meal distribution.
- Food-category frequency.
- Nutrient-data coverage.
- Selected micronutrient recorded totals when coverage is visible.

### 14.4 Prohibited interpretations

- No deficiency diagnosis.
- No “perfect diet” score.
- No punishment for target deviations.
- No conversion of partial days into full-day intake.
- No causal claim between one nutrient and one performance change.

## 15. Sleep and recovery analytics

### 15.1 Sleep

Allowed summaries:

- Median sleep duration.
- Sleep-duration distribution.
- Bedtime and wake-time views.
- Method-versioned schedule variability.
- Sleep-source distribution.
- Complete and incomplete record counts.

Do not calculate one sleep score.

### 15.2 Recovery dimensions

Display separately:

- Energy.
- General fatigue.
- Stress.
- Motivation.
- Mood.
- Perceived recovery.
- Regional soreness.
- Pain or injury concern.
- Illness flag.

No weighted composite is permitted.

## 16. Cardio analytics

Allowed summaries:

- Sessions.
- Duration.
- Moderate, vigorous and unclassified minutes.
- Distance by modality.
- Pace by comparable modality and environment.
- Power when directly recorded.
- Heart rate with source label.
- Interval completion.
- Plan adherence where dated.

Prohibited outputs:

- Calories burned.
- VO2max estimate.
- Fitness age.
- Cardiac age.
- Fat-burning score.
- Cross-modality pace ranking.

## 17. Supplement-trial analytics

When Phase 14 exists, Phase 15 may show:

- Recorded adherence.
- Trial dates.
- User-selected outcomes.
- Adverse-event links.
- Training, sleep and diet context links.

It must not claim that the supplement caused an observed change. It must not rank ingredients or products.

## 18. Cross-domain views

### 18.1 Allowed

- Overlay body weight with workout-session dates.
- Overlay measurements with program phases.
- Overlay sleep duration with workout performance.
- Overlay nutrition completeness with weight records.
- Overlay cardio sessions with recovery check-ins.

### 18.2 Required language

Every cross-domain view displays:

> Timelines can help you inspect patterns. They do not prove that one variable caused another.

### 18.3 Excluded from MVP

- Automatic correlation coefficients.
- Regression models.
- Forecasting.
- Anomaly-driven advice.
- AI-generated explanations.
- “Top factors affecting progress.”

## 19. Metric engine contract

Every metric definition contains:

- Metric ID.
- Domain.
- Human label.
- Unit.
- Formula.
- Method version.
- Included statuses.
- Excluded statuses.
- Minimum samples.
- Date-grouping rule.
- Unit-normalization rule.
- Compatibility rules.
- Quality flags.
- Source dependencies.
- Last calculated timestamp.

Every rendered result contains a calculation receipt:

- Metric ID and version.
- Date range.
- Record IDs or a reproducible query description.
- Included count.
- Excluded count and reasons.
- Result.
- Quality flags.
- Calculation timestamp.

## 20. Date, time-zone and range rules

- Source modules retain their own canonical local dates and time zones.
- Dashboard ranges use local calendar dates.
- A time-zone change does not silently move a historical record.
- Week-start preference is Monday or Sunday.
- Supported presets: 7 days, 28 days, 12 weeks, 6 months, 1 year and all time.
- Custom ranges are inclusive.
- Charts show the exact range and measured-day count.

## 21. Data-quality system

### 21.1 Required states

- Not enough records.
- Mixed protocol.
- Mixed method.
- Mixed device.
- Mixed source.
- Incomplete nutrition day.
- Partial nutrient coverage.
- Time-zone change.
- Possible input error.
- Retrospective entry.
- Estimated value.
- Stale metric version.
- Missing photo binary.
- Deleted source record.

### 21.2 Behavior

- Quality flags never silently remove data.
- Warning details identify affected records.
- The user can correct, exclude from one view or retain the record.
- Permanent deletion requires confirmation.
- View-specific exclusion never modifies the source record.

## 22. Charts and accessible alternatives

### 22.1 Chart requirements

- Raw data and smoothing are visually distinct.
- Color is not the only encoding.
- Hover interactions also work with keyboard focus.
- Exact values are available without hover.
- Every chart has a data table.
- Every chart has a text summary.
- Zooming does not hide controls.
- Empty and insufficient-sample states are explicit.

### 22.2 Neutral visual language

Do not use red for weight gain or green for weight loss by default. Colors identify series and states, not moral value.

## 23. Local data architecture

Phase 15 adds these IndexedDB stores:

1. Body-weight logs.
2. Circumference sessions.
3. Body-composition measurements.
4. Progress-photo metadata.
5. Progress-photo blobs.
6. Progress goals.
7. Nutrition-day reviews.
8. Dashboard layouts.
9. Phase 15 settings.
10. Audit events.
11. Deleted-record tombstones.
12. Import conflicts.
13. Rebuildable analytics cache.

Writes spanning metadata and photo blobs must be transactional where possible. Derived analytics caches are disposable and excluded from canonical backups.

## 24. Privacy and security boundaries

- No authentication.
- No cloud database.
- No remote photo processing.
- No remote analytics containing personal measurements.
- No third-party analytics events containing values, notes, goals, photo identifiers or metric results.
- No URL query parameters containing sensitive values.
- No photo preview in notifications.
- No service-worker caching of personal photo URLs outside the controlled local data path.
- Clearing browser data can remove records.
- Persistent-storage requests can be denied by the browser.
- The UI must show last backup date and photo-backup state.

## 25. Backup, restore and export

### 25.1 JSON backup

The canonical Phase 15 JSON backup includes:

- Body-weight logs.
- Circumference sessions.
- Body-composition measurements.
- Photo metadata.
- Goals.
- Nutrition-day reviews.
- Dashboard layouts.
- Settings.
- Audit events.
- Tombstones.

Photo binaries are excluded by default.

### 25.2 Photo ZIP

Optional export includes sanitized photo binaries and a manifest. The user selects:

- All photos.
- Selected dates.
- Selected views.
- Metadata only.

### 25.3 CSV exports

Provide separate exports for:

- Weight.
- Circumferences and replicates.
- Body composition.
- Goals.
- Nutrition-day reviews.
- Metric results with method versions.
- Dashboard configuration.

Derived CSV includes the calculation method version and date range.

### 25.4 Restore

- Validate the entire file before writing.
- Preview conflicts.
- Support keep-existing, import-as-copy and replace-local modes.
- Restore transactionally.
- Rebuild analytics caches after success.
- Do not restore photo metadata as complete when the binary is absent.

## 26. Performance requirements

- Dashboard initial shell renders before heavy analytics.
- Compute metrics in a Web Worker when large local datasets would block interaction.
- Cache by metric ID, method version, date range and source-store revision.
- Invalidate only affected caches after a record edit.
- Virtualize long record tables.
- Lazy-load photo thumbnails.
- Revoke temporary object URLs.
- Avoid decoding full-size photos for catalogue grids.
- No chart library should force server-side personal-data processing.

## 27. Accessibility requirements

Target WCAG 2.2 AA.

- Semantic heading hierarchy.
- Labelled measurement inputs.
- Unit announced beside values.
- Keyboard-operable chart controls.
- Data-table alternative for every chart.
- Focus management after modal and import actions.
- Screen-reader announcements for save, delete, restore and calculation completion.
- Progress photos require user-entered descriptions when they are used outside private comparison views.
- No color-only status.
- Reduced-motion support.
- 320 px layout without horizontal page overflow.

## 28. Testing requirements

### 28.1 Calculation tests

- Same-day median.
- Seven-day minimum-sample gate.
- Seven-day mean.
- Adjacent-window weekly change.
- Circumference replicate median.
- Mixed-protocol block.
- Mixed-device body-composition warning.
- Volume-load inclusion and exclusion.
- e1RM method-version inheritance.
- Complete nutrition-day filtering.
- Nutrient coverage not treated as adequacy.
- Sleep median without score.
- Cardio output without calories.
- Goal output without prediction.
- Cross-domain output without causality.

### 28.2 Data integrity tests

- Source records are never changed by analytics.
- Deleted records are excluded and recoverable during undo period.
- View-specific exclusions remain non-destructive.
- Metric-version change rebuilds cache.
- Historical calculation receipt remains inspectable.
- Missing photo binary creates warning.
- Sanitized photo has no original EXIF/GPS metadata.
- JSON backup excludes binaries by default.
- Photo ZIP manifest matches files.
- Restore is transactional.

### 28.3 Privacy tests

- No measurement value in network requests.
- No photo binary in network requests.
- No personal values in URLs.
- No remote image transformation.
- No analytics event containing private metric values.

### 28.4 Responsive and accessibility tests

- 320 px, 375 px, tablet and desktop.
- Light and dark mode.
- Keyboard-only chart operation.
- Screen-reader table navigation.
- Zoom to 200 percent.
- Reduced motion.
- Long labels and localized numbers.

## 29. Acceptance criteria

- [ ] All required routes exist.
- [ ] Dashboard widgets are configurable and removable.
- [ ] Every metric has a method version and calculation details.
- [ ] Raw records remain canonical.
- [ ] Same-day weight uses median and shows record count.
- [ ] Trend minimum-sample gates work.
- [ ] Circumference protocols are not mixed silently.
- [ ] Body-composition methods and devices are not mixed silently.
- [ ] No body-fat calculator exists.
- [ ] Photos are sanitized locally before storage.
- [ ] No photo-analysis feature exists.
- [ ] Default JSON backup excludes photo binaries.
- [ ] Optional photo ZIP has a manifest.
- [ ] Nutrition aggregates require user-declared complete days.
- [ ] Missing nutrient data remains missing.
- [ ] Workout volume exclusions are visible.
- [ ] Muscle set views are labelled associations, not effective sets.
- [ ] Sleep and recovery remain separate dimensions.
- [ ] Cardio analytics produce no calories or VO2max.
- [ ] Supplement analytics produce no efficacy conclusion.
- [ ] Cross-domain views state that they do not prove causation.
- [ ] No composite health, fitness, diet, body or recovery score exists.
- [ ] No goal-completion forecast exists.
- [ ] Data-quality flags identify affected records.
- [ ] Chart data tables and text summaries exist.
- [ ] Backup and restore validate transactionally.
- [ ] No personal data leaves the browser.
- [ ] Previous phases remain functional.

## 30. Source registry

| Source ID | Source | Role |
| --- | --- | --- |
| `src_cdc_bmi_about_2025` | U.S. Centers for Disease Control and Prevention — About Body Mass Index (BMI) (2025) | bmi definition, screening boundary, limitations |
| `src_cdc_nhanes_anthro_2021` | U.S. Centers for Disease Control and Prevention / NCHS — National Health and Nutrition Examination Survey: 2021 Anthropometry Procedures Manual (2021) | weight measurement, circumference protocols, quality control, equipment |
| `src_cdc_nhanes_bodycomp_2021` | U.S. Centers for Disease Control and Prevention / NCHS — National Health and Nutrition Examination Survey: 2021 Body Composition Procedures Manual (2021) | dexa protocol, body composition reporting, quality control |
| `src_who_waist_2011` | World Health Organization — Waist Circumference and Waist-Hip Ratio: Report of a WHO Expert Consultation (2011) | waist protocol, waist hip ratio, protocol comparability, population cutoff caution |
| `src_bodycomp_standards_2026` | International expert working group / Nutrition — Methodological standards for body composition assessment: bioimpedance, DXA, CT and ultrasound (2026) | method specific reporting, longitudinal monitoring, device and protocol consistency, minimal detectable change |
| `src_bodycomp_limitations_2022` | Nutrition — Assessment of body composition: Intrinsic methodological limitations and statistical pitfalls (2022) | cross method limitations, statistical pitfalls, population assumptions |
| `src_acsm_rt_2026` | American College of Sports Medicine — ACSM Position Stand: Resistance Training Prescription for Muscle Function, Hypertrophy, and Physical Performance in Healthy Adults (2026) | strength progress, training consistency, goal specific outcomes |
| `src_1rm_reliability_2020` | Sports Medicine - Open — Test-Retest Reliability of the One-Repetition Maximum Strength Assessment: A Systematic Review (2020) | strength measurement reliability, familiarization, measurement variation |
| `src_mdn_indexeddb` | Mozilla Developer Network — IndexedDB API (2026) | local structured storage, transactions, offline records |
| `src_mdn_storage` | Mozilla Developer Network — StorageManager.persist() (2026) | persistent storage request, browser denial boundary |
| `src_wcag_22` | World Wide Web Consortium — Web Content Accessibility Guidelines (WCAG) 2.2 (2023) | accessible charts, keyboard access, contrast, status announcements |

Full URLs and usage notes are stored in `Phase_15_Body_Progress_Analytics_Reference_Data.json`.

## 31. Lovable implementation order

1. Read Phase 00 Project Knowledge and this full specification.
2. Audit existing source schemas and stable IDs.
3. Produce a Plan-mode file and migration plan.
4. Add Phase 15 IndexedDB stores and migration.
5. Implement metric-definition registry and calculation receipts.
6. Implement body-weight logging and trends.
7. Implement circumference protocols and sessions.
8. Implement external body-composition records.
9. Implement sanitized local progress photos.
10. Implement goals.
11. Implement dashboard layouts and widgets.
12. Implement workout and strength analytics.
13. Implement nutrition analytics and complete-day review.
14. Implement sleep, recovery and cardio analytics.
15. Implement optional supplement adherence summary.
16. Implement data-quality centre.
17. Implement backup, photo ZIP and CSV exports.
18. Run calculation, privacy, accessibility and regression tests.

## 32. Lovable do-not-modify guardrail

Lovable must not:

- Replace working Phase 01 navigation or design tokens.
- Rewrite Phase 06 workout records.
- Rewrite Phase 10 nutrition snapshots.
- Rewrite Phase 12 sleep or recovery records.
- Rewrite Phase 13 cardio records.
- Rewrite Phase 14 product or trial records.
- Add authentication, Supabase, Firebase or a cloud database.
- Add remote analytics or photo processing.
- Add invented body-composition formulas.
- Add a composite score.
- Add AI-generated progress explanations.
- Publish draft knowledge identities as factual content.

## 33. Handoff to Phase 16

Phase 15 exposes stable searchable entities for:

- Measurement protocols.
- Progress knowledge topics.
- Metric definitions.
- Dashboard widgets.
- Saved goals.

Phase 16 may index public knowledge and local titles, but it must not expose private values or photo metadata in public search URLs or remote services.
