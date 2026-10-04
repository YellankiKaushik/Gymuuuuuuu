# Phase 10 - Nutrition Tracker

**Project:** Fitness OS  
**Document type:** Lovable implementation specification  
**Version:** 1.0  
**Date:** 5 August 2026  
**Status:** Ready for Plan-mode review  
**Depends on:** Phases 00, 01, 07, 08 and 09  
**Provides data contracts to:** Phases 11, 15 and 17

---

## 0. How to use this phase

1. Keep the Phase 00 Project Knowledge active.
2. Confirm the Phase 01 shell, navigation, themes, shared components and accessibility foundation remain intact.
3. Confirm Phase 07 canonical food IDs, composition-profile IDs, nutrient IDs, source records, portions and publication states are available.
4. Confirm Phase 08 nutrient definitions and reference-intake semantics are available.
5. Confirm Phase 09 saved target-plan records and formula provenance are available.
6. Attach this Markdown specification.
7. Attach `Phase_10_Nutrition_Tracker_Data_Schema.json`.
8. Attach `Phase_10_Nutrition_Tracker_Reference_Data.json`.
9. Attach `Phase_10_Lovable_Prompt_Package.txt`.
10. Also attach the Phase 07, Phase 08 and Phase 09 schemas and reference files because Phase 10 consumes those contracts.
11. Run the Plan-mode prompt before any code change.
12. Reject any plan that invents nutrient values, converts volume to mass without a food-specific weight, treats missing values as zero, recalculates historical entries silently, diagnoses deficiency, adds authentication, or sends personal food logs to a remote service.
13. Approve only the Phase 10 scope.
14. Run the Agent-mode prompt, verification prompt, data-integrity prompt and correction prompt.
15. Create the GitHub checkpoint `phase-10-nutrition-tracker-complete` only after every blocking test passes.

## 1. Phase objective

Build a fast, transparent, mobile-first and fully local Nutrition Tracker that records what the user consumed and calculates daily nutrient totals from verified Phase 07 food-composition profiles.

The module must deliver:

- Date-based food diary.
- Meal sections and configurable meal labels.
- Fast food search over published Phase 07 profiles.
- Exact gram-based portion calculation.
- Food-specific household portions only when a verified gram weight exists.
- Canonical food, profile, source-release and nutrient snapshots on every log entry.
- Energy, macronutrient, fibre, vitamin and mineral aggregation.
- Explicit missing-data, trace, not-detected, estimated, calculated and imputed handling.
- Daily target comparison using a frozen Phase 09 target snapshot.
- Optional micronutrient reference comparison using a frozen Phase 08 reference snapshot.
- Neutral data-completeness indicators for every nutrient.
- Quick-add entries for known calories or macros without fabricated micronutrients.
- User-entered custom packaged foods with explicit provenance.
- Plain-water and fluid-volume logging without diagnosing hydration status.
- Favourites, recent foods, repeat entry, copy meal and copy day workflows.
- Day history, entry editing, soft deletion and undo.
- IndexedDB persistence, migrations, storage-status display and persistent-storage request.
- Nutrition-specific JSON backup/restore and CSV export.
- Deterministic, rebuildable daily totals.
- Strict boundaries against medical interpretation, supplement dosing and AI-generated diet advice.

Phase 10 answers: **“What did I record eating, which exact data produced the totals, how complete are those totals, and how do they compare with the targets I explicitly selected?”**

It does not answer: **“Do I have a nutrient deficiency, what disease do I have, or what clinical diet should I follow?”**

## 2. Supported use and hard boundaries

### 2.1 Supported use

- Personal food and fluid logging.
- Adults using a valid Phase 09 plan or manual targets.
- Use without any target plan.
- Current-day and historical-day entry.
- Metric and imperial mass input.
- Verified household portions supplied by Phase 07.
- Food-only micronutrient tracking.
- User-entered packaged-food labels.
- Offline operation after application assets and food data are available locally.

### 2.2 Hard boundaries

- No diagnosis of deficiency, toxicity, dehydration or disease.
- No treatment advice or therapeutic meal plan.
- No paediatric, pregnancy, lactation or condition-specific interpretation.
- No medication or supplement recommendation.
- No automatic calorie adjustment from body-weight changes.
- No calories-burned subtraction or exercise-calorie add-back.
- No barcode product lookup requiring a runtime API.
- No camera meal recognition.
- No AI estimation from photographs or vague descriptions.
- No generic “cup to grams” conversion.
- No generic “millilitres equal grams” conversion.
- No silent replacement of source nutrient values.
- No historical recalculation when Phase 07 data changes.
- No missing-value substitution with zero.
- No server database, authentication, cloud sync or analytics upload.

## 3. Phase ownership and dependencies

| Concept | Owning phase | Phase 10 rule |
| --- | --- | --- |
| Application shell, themes and shared components | Phase 01 | Reuse; do not redesign. |
| Food identity, state, profile, portion and composition | Phase 07 | Read published profiles and snapshot them; never rewrite canonical data. |
| Nutrient identity and reference semantics | Phase 08 | Reuse IDs, units, RDA/AI/EAR/UL/DV semantics and scope restrictions. |
| Energy and macro target plans | Phase 09 | Bind to one selected plan and snapshot targets per day. |
| Recipes and planned menus | Phase 11 | Phase 10 logs consumed recipe servings after Phase 11 provides verified recipe composition. |
| Long-term trends and correlations | Phase 15 | Phase 10 provides canonical daily records and deterministic aggregation helpers. |
| Global backup centre | Phase 17 | Phase 10 provides a versioned module adapter and standalone backup now. |

## 4. Non-negotiable product decisions

1. **Canonical source first.** Published Phase 07 profiles are the default source of nutrient data.
2. **Snapshot history.** Every consumed entry stores the exact food name, profile state, source record, release, portion and nutrient values used when it was logged.
3. **No silent revision.** Updating Phase 07 data does not alter old entries or daily totals.
4. **Mass is canonical.** Nutrients are calculated from gram weight. Household measures are accepted only when their food-specific gram weight is verified.
5. **Energy is source data.** Do not derive canonical food energy from protein, carbohydrate and fat when the source supplies an energy value.
6. **Missing is not zero.** Unavailable and unmeasured nutrients remain missing and reduce completeness.
7. **Trace is not a numeric zero.** A trace value is flagged but excluded from exact numeric totals unless a source provides a quantitative bound and the calculation explicitly supports it.
8. **Targets are references, not diagnoses.** The interface uses neutral wording such as “recorded amount versus selected reference.”
9. **Day targets are frozen.** A day snapshots its active Phase 09 plan and Phase 08 reference profile when the first entry is created.
10. **Derived totals are rebuildable.** Food entries are canonical; daily aggregates are caches.
11. **User-entered data is labelled.** Custom foods and quick adds never inherit the credibility of verified Phase 07 profiles.
12. **Local means local.** Personal logs remain in IndexedDB unless the user exports them.

## 5. Required routes

| Route | Purpose |
| --- | --- |
| `/nutrition` | Today dashboard, target summary, meals and quick actions. |
| `/nutrition/day/$date` | Read and edit one local calendar day. |
| `/nutrition/add` | Search, select, portion and add a food. |
| `/nutrition/history` | Calendar/list history and day navigation. |
| `/nutrition/custom-foods` | Create, edit, archive and inspect user-entered foods. |
| `/nutrition/custom-foods/$customFoodId` | Custom-food detail and revision history. |
| `/nutrition/settings` | Meal labels, units, target binding, reference framework, storage, backup and export. |
| `/nutrition/methodology` | Portion calculations, aggregation, missing-data handling and limitations. |
| `/nutrition/privacy` | Device-local storage and backup explanation. |

`/nutrition/add` may be implemented as a route-backed full-screen mobile flow and a dialog/drawer on larger screens, but browser refresh and deep linking must remain safe.

Invalid dates or IDs must show recoverable not-found states. Corrupt records must never crash the entire application.

## 6. Primary user journeys

### 6.1 Log a verified food

1. Open Nutrition.
2. Choose a meal section.
3. Search published Phase 07 foods and profiles.
4. Select the exact state, such as raw, cooked, drained or dried.
5. Select grams or a verified portion.
6. Enter quantity.
7. Review calculated energy and nutrient preview.
8. Add the entry.
9. See daily totals update transactionally.

### 6.2 Repeat a recent food

1. Open a meal section.
2. Select a recent or favourite entry.
3. Confirm the previous profile, amount and portion.
4. Add as a new record with a new ID and timestamp.
5. Preserve the original nutrient snapshot unless the user explicitly chooses “Use latest verified profile.”

### 6.3 Log a packaged custom food

1. Open Custom Foods.
2. Enter product name and optional brand.
3. Enter the nutrition-label serving mass.
4. Enter calories and available nutrients exactly as shown.
5. Mark whether values are per serving or per 100 g.
6. Save locally with `user_entered_label` provenance.
7. Log the custom food by servings or grams.
8. Show missing micronutrients as unavailable, not zero.

### 6.4 Quick add

1. Choose Quick Add.
2. Enter calories and optional protein, carbohydrate, fat and fibre.
3. Add a description.
4. Save as an unsourced entry.
5. Include only entered nutrients in totals.
6. Exclude all unentered nutrients from completeness numerator.

### 6.5 Review micronutrients

1. Open the day nutrient panel.
2. Choose a nutrient.
3. View known recorded total.
4. View target/reference snapshot and reference type.
5. View quantified-entry coverage and missing-entry count.
6. View source entries contributing to the total.
7. Read the statement that one day of food logging cannot diagnose a deficiency.

### 6.6 Change a target plan

1. Select a different current Phase 09 plan in settings.
2. Future days use the new plan.
3. Existing days keep their original target snapshot.
4. The user may explicitly replace a day snapshot after reading a confirmation and recording an audit reason.

## 7. Information architecture and navigation

- Add `Nutrition` to the primary Track navigation group.
- The Nutrition landing page defaults to the current local date.
- Date controls must allow previous/next day and calendar selection.
- A visible “Add food” action remains reachable with one tap on mobile.
- The global search may route to Phase 07 food pages; adding food must occur through the Nutrition add flow.
- Phase 07 food-detail pages may expose “Log this food,” passing food and profile IDs to Phase 10.
- Phase 09 plan pages may expose “Use as current nutrition target.”
- Phase 08 nutrient pages may expose “View today’s recorded intake.”

## 8. Food selection and profile integrity

### 8.1 Eligible canonical records

A food may be logged only when:

- The food record is `published`.
- The selected composition profile is approved for display.
- The profile contains a valid source record.
- The nutrient list passes Phase 07 schema validation.
- The profile state is explicit.

Draft identities without verified profiles must show “Nutrition data unavailable” and cannot be logged as canonical foods.

### 8.2 State selection

Raw and cooked foods are separate profiles, not an automatic transformation. The interface must not calculate cooked values from raw values using a generic retention factor.

Examples of separate state labels:

- Raw.
- Boiled, drained.
- Steamed.
- Roasted.
- Dried.
- Canned, drained.
- Prepared with salt.
- Prepared without salt.

Only states present in the source-backed Phase 07 profile may be selected.

### 8.3 Source priority

Phase 10 does not choose between competing records automatically. Phase 07 owns the canonical default profile. The add flow must show the source database, source release and profile state before confirmation.

## 9. Portion and unit calculation

### 9.1 Canonical formula

All nutrient calculations use the logged gram weight:

```text
logged nutrient amount = nutrient value per 100 g x logged grams / 100
```

This is the calculation documented by USDA FoodData Central for converting per-100-g values using a food-specific portion weight.

### 9.2 Accepted input modes

- Grams.
- Kilograms.
- Ounces.
- Pounds.
- Verified Phase 07 portion, such as one fruit, one tablespoon or one cup, only when a gram weight exists.
- User-defined custom-food serving with a stored gram weight.

### 9.3 Exact mass conversions

```text
1 kilogram = 1,000 grams
1 ounce = 28.349523125 grams
1 pound = 453.59237 grams
```

Do not round the gram weight before nutrient calculations.

### 9.4 Prohibited conversions

- No generic cup-to-gram conversion.
- No generic tablespoon-to-gram conversion.
- No generic millilitre-to-gram conversion.
- No density assumption for oils, milk, cooked grains or mixed foods.
- No “medium fruit” weight unless the selected profile supplies that portion.

### 9.5 Display precision

- Store full calculation precision.
- Display food amount to a sensible precision based on unit.
- Display energy to the nearest whole kilocalorie in the daily headline.
- Display protein, carbohydrate, fat and fibre to one decimal gram by default.
- Display vitamins and minerals with nutrient-specific precision from Phase 08.
- Never change stored values merely to match display rounding.

## 10. Log-entry snapshot contract

Every canonical food entry must include:

- Entry ID and schema version.
- Local date key.
- UTC consumed timestamp.
- IANA time zone used for the local date.
- Meal-slot ID.
- Canonical food ID.
- Canonical food-name snapshot.
- Composition-profile ID and version/review timestamp.
- Food-state snapshot.
- Source record ID.
- Source database and release.
- Source licence identifier where applicable.
- Input quantity and input unit.
- Portion snapshot and gram weight.
- Calculated logged gram weight.
- Per-100-g nutrient snapshot.
- Calculated logged-amount nutrient snapshot.
- Nutrient status, value, unit and method/source status.
- Data-quality flags.
- Optional note.
- Created, updated and deleted timestamps.

The tracker must remain able to render an entry even if the canonical food is later renamed, deprecated or removed.

## 11. Nutrient-value states and aggregation

### 11.1 Supported source states

Phase 10 consumes the Phase 07 states:

- `measured`
- `calculated`
- `imputed`
- `estimated`
- `trace`
- `not_detected`
- `not_available`

### 11.2 Numeric inclusion rules

| Status | Numeric daily sum | Completeness effect | Display |
| --- | --- | --- | --- |
| Measured | Include value | Quantified | Measured |
| Calculated | Include value | Quantified, flagged | Calculated |
| Imputed | Include value | Quantified, flagged | Imputed |
| Estimated | Include value | Quantified, flagged | Estimated |
| Not detected | Include numeric zero only when source explicitly records zero/not detected | Quantified, flagged | Not detected |
| Trace | Do not convert to zero; no exact numeric addition | Partial | Trace present |
| Not available | Do not add | Missing | Not available |

If future source data provides a quantitative less-than bound, store it separately. Do not substitute the bound, half the bound or zero without an approved rule and versioned methodology.

### 11.3 Daily aggregate output

For every nutrient, calculate:

- `knownTotal`.
- Canonical unit.
- Number of contributing entries.
- Number of quantified entries.
- Number of trace entries.
- Number of unavailable entries.
- Number of calculated, imputed or estimated entries.
- Coverage percentage by entry count.
- Completeness state: `complete`, `partial`, `unavailable` or `not_applicable`.
- Target/reference comparison, when valid.

### 11.4 Coverage calculation

```text
coverage percentage = quantified eligible entries / all eligible entries x 100
```

An eligible entry is a consumed food entry that could contain a nutrient record. Plain-water entries are not eligible for unrelated nutrients. Quick-add entries are eligible only for nutrients explicitly provided by the user.

Coverage is a documentation signal, not a measure of biological adequacy.

### 11.5 Rebuild rule

Daily totals must be reproducible by aggregating active entries. A cached day summary may improve performance but must be discarded and rebuilt when:

- An entry is added.
- An entry is edited.
- An entry is deleted or restored.
- A custom food revision changes an entry through explicit user action.
- A migration changes the calculation contract.

## 12. Energy and macronutrient totals

- Sum the source `energy_kcal` value for each entry.
- Do not independently calculate canonical energy from macros when source energy exists.
- If a custom food has calories but no macros, calories are included and macro coverage is partial.
- If a custom food has macros but no calories, do not fabricate calories by default. Require explicit calories or show energy unavailable.
- Show protein, total carbohydrate, total fat and fibre separately.
- Do not present net carbohydrate unless Phase 07 explicitly owns and validates an available-carbohydrate field and the user chooses it.
- Do not subtract exercise energy.
- Do not automatically increase targets on workout days.

The daily headline must reconcile with entry-level values after display rounding. A hidden balancing adjustment is prohibited.

## 13. Target-plan binding

### 13.1 Current plan

The user may select one Phase 09 saved plan as the current nutrition target. Nutrition logging works without a plan.

### 13.2 Day target snapshot

When the first entry or manual hydration record is created for a date, create a `DayTargetSnapshot` containing:

- Phase 09 plan ID.
- Plan version.
- Plan title.
- Energy target.
- Protein target or selected range point.
- Fat target.
- Carbohydrate target.
- Fibre benchmark.
- Formula and reference-data versions.
- Snapshot timestamp.

Changing the current plan affects new days only.

### 13.3 Comparison wording

Use:

- Recorded.
- Target.
- Remaining.
- Above selected target.
- No target selected.

Do not use:

- Good/bad food day.
- Failed diet.
- Cheat meal.
- Perfect macros.
- Metabolic damage.
- Fat-burning mode.

### 13.4 Range targets

When Phase 09 provides a range, the interface must show the range and selected planning point. It must not collapse the range into a universal recommendation without provenance.

## 14. Micronutrient reference comparison

### 14.1 Optional reference profile

The user may select a valid Phase 08 reference profile using the supported framework, age, sex and life-stage contract. The selected profile is optional.

### 14.2 Frozen reference snapshot

Each day stores:

- Framework ID and version.
- Population criteria.
- Nutrient ID.
- Reference type.
- Value and unit.
- Scope, such as total intake, food only or supplemental only.
- Source ID.

### 14.3 Display rules

- RDA/AI/PRI/RI: show recorded amount versus selected planning reference.
- EAR/AR: hide from the default consumer progress view unless Phase 08 explicitly marks it suitable for individual assessment and the methodology explanation is visible.
- UL/TUL: compare only when the scope applies to food intake recorded by Phase 10.
- DV: label as a food-label reference, not a personal target.
- AMDR: use Phase 09 macro interpretation, not a second conflicting calculation.

### 14.4 Safety language

The micronutrient panel must state:

> Food logs estimate recorded dietary intake. A single day or incomplete log cannot diagnose a nutrient deficiency, excess, absorption problem or medical condition.

A low recorded value must not trigger a deficiency badge. An above-reference value must not trigger toxicity language. Use neutral reference comparison and link to the Phase 08 nutrient article.

## 15. Day boundaries, dates and time zones

Every entry stores:

- `occurredAtUtc`.
- `timeZone` as an IANA identifier.
- `localDate` in `YYYY-MM-DD` format.
- Optional local time.

Rules:

- The day is anchored to the local date chosen at entry creation.
- Travelling to another time zone does not silently move historical entries.
- Editing the consumed time does not change the date unless the user explicitly changes the date.
- Future consumption entries are not supported in Phase 10; future planning belongs to Phase 11.
- Backdated entries are permitted.

## 16. Meal sections

Default stable meal-slot IDs:

- Breakfast.
- Morning snack.
- Lunch.
- Afternoon snack.
- Dinner.
- Evening snack.
- Other.

The user may:

- Rename display labels.
- Reorder slots.
- Hide unused slots.
- Add up to five custom slots.

Stable IDs must not change when labels change. Entries preserve the label snapshot for historical readability.

## 17. Fast logging features

Required:

- Recent foods derived from entries.
- Favourite food/profile/portion combinations.
- Repeat previous entry.
- Duplicate entry.
- Copy a meal from another day.
- Copy an entire day.
- Change quantity inline.
- Move entry between meals.
- Search aliases and regional names.
- Filter by food category and profile state.
- Numeric keyboard on mobile.
- One-tap add using a saved favourite amount.

Copy behavior:

- Creates new IDs and timestamps.
- Defaults to the original entry snapshot.
- Offers “Use latest verified profile” as an explicit alternative.
- Never silently upgrades values.

## 18. Custom foods

### 18.1 Purpose

Custom foods support packaged foods or personal items absent from the verified catalogue. They are local records, not public encyclopedia content.

### 18.2 Required fields

- Name.
- Optional brand.
- Serving description.
- Serving gram weight.
- Calories, when available.
- Nutrients entered exactly from the label or source.
- Basis: per serving or per 100 g.
- Source type: nutrition label, manufacturer document, personal calculation or other.
- Source note.
- Created and updated timestamps.

### 18.3 Rules

- Never infer missing nutrients.
- Never convert %DV into absolute nutrient amounts without a matching Phase 08 DV version and an explicit user action.
- Preserve revision history.
- Existing log entries keep the custom-food revision snapshot used at the time.
- Editing a custom food affects new entries only.
- Archiving does not delete historical entries.
- Custom foods must display a `User entered` badge.

## 19. Quick add

Quick Add supports incomplete but honest logging.

Required:

- Description.
- Calories.
- Optional protein, carbohydrate, fat and fibre.
- Meal slot.
- Date/time.
- Note.

Rules:

- No micronutrient inference.
- No food-category claims.
- No quality score.
- Mark as `quick_add` provenance.
- Include only provided values in totals.
- Reduce completeness for nutrients not provided only according to the eligible-entry rule.

## 20. Water and fluid logging

Phase 10 may record:

- Plain water in millilitres.
- Other noncaloric fluid volume as a manual record.
- Nutrient-bearing beverages through Phase 07 food profiles.

Rules:

- Do not create a universal hydration target.
- Do not diagnose dehydration.
- Do not assume all beverages are equivalent to plain water.
- Avoid double counting: a beverage logged as a Phase 07 food must not also be automatically added as a separate fluid record unless the user explicitly chooses it.
- Food moisture from Phase 07 may be shown as “water from recorded foods” when coverage is sufficient, but it must remain separate from manually logged fluid volume.

## 21. Editing, deletion and audit behavior

- Editing quantity recalculates from the stored profile snapshot.
- Replacing the food creates a new source snapshot.
- Moving meal or time does not change nutrient values.
- Soft-delete entries and exclude them from totals immediately.
- Provide undo for the current session.
- Permanent purge requires confirmation.
- Store `createdAt`, `updatedAt`, `deletedAt`, revision number and last-edit reason where relevant.
- Day-target snapshot replacement requires explicit confirmation and an audit record.
- Restore/import conflicts must never overwrite silently.

## 22. Daily screen requirements

### 22.1 Header

- Local date.
- Previous/next date.
- Calendar picker.
- Current target-plan label.
- Storage/backup status indicator when attention is required.

### 22.2 Headline summary

- Energy recorded and target.
- Protein, carbohydrate, fat and fibre.
- Neutral progress visualization.
- No moral scoring.
- No calorie-burn subtraction.

### 22.3 Meal sections

Each section shows:

- Meal label.
- Entry count.
- Energy subtotal.
- Add-food action.
- Entry rows with amount, source badge and key nutrients.
- Expandable details and actions.

### 22.4 Nutrient panel

Tabs or sections:

- Macros.
- Vitamins.
- Minerals.
- Data completeness.
- Sources.

Each nutrient row shows known total, unit, reference when selected, coverage status and contributing entries.

## 23. Food-add flow requirements

1. Search query and filters.
2. Published food results.
3. Profile/state selection.
4. Source and release summary.
5. Portion options with gram weights.
6. Quantity input.
7. Nutrient preview.
8. Meal/date/time selection.
9. Add confirmation.

The preview must use the same pure calculation function as the saved entry. The displayed preview and saved record must match within floating-point tolerance.

## 24. Domain architecture

Required pure domain functions:

- `convertMassToGrams`
- `resolveVerifiedPortionGrams`
- `calculateLoggedNutrientSnapshot`
- `validateCanonicalFoodEntry`
- `validateCustomFood`
- `createFoodEntrySnapshot`
- `aggregateNutritionDay`
- `aggregateNutrientCoverage`
- `bindDayTargetSnapshot`
- `bindDayReferenceSnapshot`
- `compareAgainstTarget`
- `compareAgainstReference`
- `copyNutritionEntry`
- `copyMealEntries`
- `copyDayEntries`
- `rebuildNutritionDayCache`
- `serializeNutritionBackup`
- `validateNutritionBackup`
- `planNutritionRestore`
- `migrateNutritionRecords`

No UI component may contain duplicate nutrient-status logic, conversion constants or target-comparison rules.

## 25. IndexedDB architecture

Use the existing `fitness-os` database. Migrate transactionally and preserve every earlier-phase store.

Required Phase 10 stores:

| Store | Key | Purpose |
| --- | --- | --- |
| `nutritionPreferences` | `id` | Singleton units, meals, target and reference settings. |
| `nutritionDays` | `localDate` | Day metadata and frozen target/reference snapshots. |
| `foodLogEntries` | `id` | Canonical, custom and quick-add consumed entries. |
| `hydrationEntries` | `id` | Manual plain-water and fluid-volume records. |
| `customFoods` | `id` | Local user-entered food records and current revision. |
| `customFoodRevisions` | `id` | Immutable custom-food revisions. |
| `nutritionFavourites` | `id` | Saved food/profile/portion combinations. |
| `nutritionAuditLog` | `id` | Target replacements, restore decisions and destructive actions. |
| `derivedNutritionDayTotals` | `localDate` | Rebuildable cache; excluded from canonical backups. |

Required indexes include:

- Entries by local date.
- Entries by local date and meal slot.
- Entries by canonical food ID.
- Entries by custom food ID.
- Entries by consumed timestamp.
- Entries by deleted timestamp.
- Favourites by canonical/custom reference.
- Custom foods by normalized name.

All entry creation and day-cache updates must occur in one transaction or use a recoverable dirty-cache marker.

## 26. Storage resilience

- Request persistent storage through `navigator.storage.persist()` only after explaining why.
- Report whether persistence was granted.
- Display estimated storage use when supported.
- Warn that local browser data may still be cleared, lost with the device or unavailable on another browser.
- Never claim that browser storage is a backup.
- Do not write critical data only during page unload.
- Detect aborted transactions and show a recoverable save error.
- Provide an explicit “Rebuild daily totals” maintenance action.

## 27. Backup, restore and export

### 27.1 JSON backup

Nutrition backup must contain:

- Format and schema version.
- Export timestamp.
- App/module version.
- Nutrition preferences.
- Nutrition days.
- Food log entries.
- Hydration entries.
- Custom foods and revisions.
- Favourites.
- Audit records required for integrity.
- Referenced target and reference snapshots.

Exclude rebuildable totals and recent-food caches.

### 27.2 Restore workflow

1. Parse without writing.
2. Validate schema and supported version.
3. Produce a restore plan.
4. Report new, duplicate, conflicting, corrupt and unsupported records.
5. Offer merge, keep existing or import as duplicate where safe.
6. Require explicit confirmation.
7. Write transactionally.
8. Rebuild derived totals.
9. Display a restore report.

Never overwrite silently.

### 27.3 CSV exports

Required exports:

- Food entries.
- Daily energy and macro totals.
- Daily nutrient totals with completeness.
- Hydration entries.
- Custom foods.

CSV must include IDs, dates, source kind, food/profile snapshots, quantities, gram weights, nutrient units, completeness and target/reference provenance where applicable.

## 28. Error and unavailable states

Required recoverable states:

- Food profile missing or unpublished.
- Portion missing gram weight.
- Nutrient unit incompatible with canonical unit.
- Corrupt source snapshot.
- Missing target plan.
- Invalid reference profile.
- IndexedDB unavailable.
- Storage quota exceeded.
- Transaction aborted.
- Import schema unsupported.
- Restore conflict.
- Canonical food deprecated.
- Custom-food revision missing.

The system must explain what failed and what the user can do. It must not replace failed data with fabricated values.

## 29. Accessibility and responsive requirements

- Meet WCAG 2.2 AA requirements established in Phase 01.
- All progress visuals require text equivalents.
- Colour cannot be the only indication of target or completeness status.
- Meal sections must use semantic headings.
- Entry actions must be keyboard accessible.
- Quantity inputs require visible labels, units and validation messages.
- Search result source/state information must be announced meaningfully.
- Dialog focus must be trapped and restored.
- Touch targets must remain usable at 320 px viewport width.
- Nutrient tables must have proper row/column headers and a mobile card alternative.
- Reduced-motion preference must be respected.

## 30. Performance requirements

- Adding, editing or deleting an entry should update the visible day within 200 ms on a typical modern device after the IndexedDB transaction completes.
- Food search must be debounced and locally indexed.
- Do not load every nutrient table for every food into the initial route bundle.
- Virtualize long food-result lists when necessary.
- Recalculate only affected day totals.
- Heavy exports may run in a worker when dataset size justifies it.
- The application must remain usable offline after required static assets are cached.

## 31. Privacy requirements

- No remote analytics event may contain food names, quantities, targets or notes.
- No health data is sent to Lovable, Supabase, Firebase or any server at runtime.
- Export occurs only through explicit user action.
- Imported files are parsed locally.
- Notes remain local.
- Provide a “Delete all nutrition data” action with typed confirmation and backup reminder.
- Document that anyone with access to the unlocked device/browser profile may access local records.

## 32. Safety and interpretation language

Required statements:

- Food composition varies by cultivar, processing, preparation and source.
- Logged quantities may be inaccurate when portions are estimated.
- Missing nutrient values make totals incomplete.
- One day is not the same as usual intake.
- Recorded intake does not prove absorption or nutritional status.
- Reference values are for planning and assessment of healthy populations and individuals according to their defined framework.
- Symptoms or suspected deficiencies require qualified clinical evaluation.

Prohibited statements:

- “You are deficient.”
- “You have toxicity.”
- “This food cures.”
- “Your metabolism is broken.”
- “You must take this supplement.”
- “You failed your diet.”

## 33. Testing requirements

### 33.1 Unit tests

- Exact mass conversions.
- Portion-to-gram calculation.
- Per-100-g nutrient calculation.
- Status-aware aggregation.
- Trace and unavailable handling.
- Target snapshot binding.
- Reference snapshot scope rules.
- Custom-food basis conversion.
- Quick-add incomplete-data behavior.
- Copy-entry snapshot behavior.
- Date/time-zone anchoring.
- Soft-delete exclusion.
- Backup schema validation.
- Restore conflict planning.
- Migration idempotency.

### 33.2 Integration tests

- Log canonical food and reload.
- Log two portions and reconcile totals.
- Edit quantity and rebuild totals.
- Delete and restore entry.
- Copy meal without silent source upgrade.
- Switch current plan without altering historical day.
- Create custom food, revise it and verify old entries retain old revision.
- Export, clear and restore nutrition data.
- IndexedDB transaction failure recovery.
- Persistent-storage request states.

### 33.3 Accessibility tests

- Keyboard-only food logging.
- Screen-reader meal and nutrient navigation.
- Visible focus.
- Error announcement.
- Zoom to 200%.
- 320 px viewport.
- Dark theme and high-contrast behavior.

### 33.4 Regression tests

- Phase 01 navigation and themes.
- Phase 07 food catalogue/detail pages.
- Phase 08 nutrient pages and reference semantics.
- Phase 09 plans and formula provenance.
- Phase 06 shared IndexedDB data remains intact.

## 34. Required reference test vectors

The attached reference-data file contains synthetic test foods. Synthetic values exist only to test arithmetic and must never appear as public content.

Blocking vectors include:

1. **150 g canonical food:** per-100-g values multiply by 1.5 exactly.
2. **Two-entry day:** daily energy and macros equal the sum of entry snapshots.
3. **Missing iron:** one quantified entry and one unavailable entry produce partial coverage, not a zero for the missing entry.
4. **Trace nutrient:** trace is flagged and excluded from exact numeric sum.
5. **Custom label:** two 40 g servings produce 80 g and exactly twice the per-serving values.
6. **Target freeze:** changing the current plan does not change an existing day snapshot.
7. **Copy behavior:** default copy preserves the original profile snapshot and a new ID.
8. **Deleted entry:** soft-deleted entry is excluded from totals.

## 35. Acceptance criteria

Phase 10 is complete only when:

- A published Phase 07 food can be logged by grams and verified portion.
- Every canonical entry preserves source and nutrient snapshots.
- Historical totals do not change after canonical data updates.
- Missing and trace values are handled exactly as specified.
- Daily totals reconcile with entry snapshots.
- Phase 09 targets are frozen per day.
- Phase 08 references are scope-aware and optional.
- No low-intake value is labelled as a deficiency.
- Custom foods retain immutable revisions.
- Quick add does not fabricate micronutrients.
- Copy workflows never silently upgrade data.
- Date/time-zone behavior is deterministic.
- IndexedDB CRUD, migrations and recovery pass.
- Backup/export/restore pass.
- No personal nutrition request leaves the browser.
- Mobile, desktop, dark mode and accessibility tests pass.
- Phases 00, 01, 06, 07, 08 and 09 pass regression.

## 36. Required implementation files

Lovable may adapt paths to the existing repository, but responsibilities must remain separated.

```text
src/
  features/nutrition-tracker/
    routes/
    components/
    domain/
      portions.ts
      entry-snapshots.ts
      aggregation.ts
      completeness.ts
      target-binding.ts
      reference-binding.ts
      copying.ts
      backup.ts
      migrations.ts
    data/
      nutrition-reference-data.ts
    repositories/
      nutrition-day-repository.ts
      food-log-repository.ts
      custom-food-repository.ts
      hydration-repository.ts
      favourite-repository.ts
    types/
      nutrition-tracker.ts
    tests/
  db/
    migrations/
      phase-10-nutrition-tracker.ts
  docs/
    nutrition-tracker.md
    local-data/nutrition-storage.md
    local-data/nutrition-backup.md
    phases/phase-10.md
```

## 37. Phase 11 handoff

Phase 10 must expose stable interfaces for Phase 11 recipes and meal plans:

- Log one verified recipe serving as a consumed entry.
- Snapshot recipe version, ingredient calculation version and serving gram weight.
- Preserve recipe history after recipe edits.
- Accept planned meals only after the user marks them consumed.
- Avoid duplicating recipe-calculation logic inside Phase 10.

Phase 11 owns recipe formulation, nutrient retention assumptions, menus and grocery lists.

## 38. Phase 15 handoff

Expose deterministic read models for:

- Daily energy and macro totals.
- Daily target snapshots.
- Nutrient known totals and completeness.
- Logging frequency.
- Food-category counts where Phase 07 classification exists.
- Water/fluid records.

Phase 15 may calculate trends but must preserve Phase 10 provenance and completeness. It must not infer a deficiency from trend data.

## 39. Phase 17 handoff

Register a nutrition backup adapter that provides:

- Current schema version.
- Canonical stores.
- Excluded rebuildable stores.
- Validation function.
- Migration function.
- Conflict-planning function.
- Restore function.
- Purge function.

## 40. Explicitly deferred

- Recipe builder and nutrient retention calculations.
- Weekly meal plans and grocery lists.
- Restaurant meal estimation.
- Barcode product lookup.
- Camera or photo logging.
- Voice logging.
- Cloud sync.
- Shared household accounts.
- Supplement tracking and dose analysis.
- Clinical diet protocols.
- Wearable integration.
- Long-term adherence scoring.
- Deficiency prediction.
- Automatic target adjustment.
- AI coaching.

## 41. Evidence and technical sources

1. USDA FoodData Central, Data Type Documentation. `https://fdc.nal.usda.gov/data-documentation/`
2. USDA FoodData Central, Foundation Foods Documentation. `https://fdc.nal.usda.gov/Foundation_Foods_Documentation/`
3. USDA FoodData Central, Downloadable Data. `https://fdc.nal.usda.gov/download-datasets/`
4. FAO/INFOODS, Standards and Guidelines. `https://www.fao.org/infoods/infoods/standards-guidelines/en/`
5. FAO, Food Composition Data: data values, missing values, trace values and documentation. `https://www.fao.org/4/y4705e/y4705e14.htm`
6. NIH Office of Dietary Supplements, Nutrient Recommendations and Databases. `https://ods.od.nih.gov/HealthInformation/nutrientrecommendations.aspx`
7. National Academies, Dietary Reference Intakes collection and applications. `https://nap.nationalacademies.org/collection/57/dietary-reference-intakes`
8. MDN, IndexedDB API. `https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API`
9. MDN, Using IndexedDB. `https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB`
10. MDN, StorageManager.persist(). `https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist`
11. W3C, Web Content Accessibility Guidelines 2.2. `https://www.w3.org/TR/WCAG22/`

## 42. Definition of done

The phase is done only after Lovable:

1. Implements the approved Plan-mode scope.
2. Passes every reference vector.
3. Passes schema, migration, import/export and data-integrity tests.
4. Demonstrates that missing nutrients are not treated as zero.
5. Demonstrates that historical entries remain unchanged after a source-profile update.
6. Demonstrates that no personal nutrition data is sent remotely.
7. Passes accessibility and responsive checks.
8. Produces the required documentation.
9. Produces a final acceptance matrix with no blocking failure.
10. Creates the GitHub checkpoint `phase-10-nutrition-tracker-complete`.
