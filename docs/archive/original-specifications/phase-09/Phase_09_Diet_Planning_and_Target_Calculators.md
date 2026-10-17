# Phase 09 - Diet Planning and Target Calculators

**Project:** Fitness OS  
**Document type:** Lovable implementation specification  
**Version:** 1.0  
**Date:** 5 August 2026  
**Status:** Ready for Plan-mode review  
**Depends on:** Phases 00, 01, 07 and 08  
**Provides data contracts to:** Phases 10, 11, 15 and 17

---

## 0. How to use this phase

1. Keep the Phase 00 Project Knowledge active.
2. Confirm the Phase 01 application shell, navigation, themes and accessibility foundation remain intact.
3. Confirm Phase 07 food IDs and verified nutrient profiles are available.
4. Confirm Phase 08 nutrient IDs, units, reference frameworks and reference-value semantics are available.
5. Attach this Markdown specification.
6. Attach `Phase_09_Diet_Planning_Data_Schema.json`.
7. Attach `Phase_09_Diet_Planning_Reference_Data.json`.
8. Attach `Phase_09_Lovable_Prompt_Package.txt`.
9. Also attach the Phase 07 and Phase 08 schema/reference files because this phase consumes their stable contracts.
10. Run the Plan-mode prompt before any code change.
11. Reject any plan that replaces the specified equations, invents a calorie formula, creates a medical diet, stores health inputs remotely, adds authentication or generates meal plans from unverified content.
12. Approve only the Phase 09 scope.
13. Run the Agent-mode prompt, verification prompt and correction prompt.
14. Create the GitHub checkpoint `phase-09-diet-planning-complete` only after all blocking tests pass.

## 1. Phase objective

Build a transparent, deterministic diet-planning workspace for healthy adults. The module converts explicitly entered information into an initial energy estimate, a user-selected goal adjustment, macronutrient ranges and an optional meal-distribution plan.

The phase must deliver:

- Adult Estimated Energy Requirement calculator using the 2023 National Academies equations.
- Clear physical-activity category selection and uncertainty disclosure.
- Maintenance, fat-loss, muscle-gain, recomposition and manual planning modes.
- Conservative percentage-based energy adjustments rather than false target-date predictions.
- Protein target ranges based on selected training context.
- Fat allocation within an adult AMDR-compatible range.
- Carbohydrate calculation from remaining energy with conflict detection.
- Fibre planning benchmark and Phase 08 nutrient-reference links.
- Optional BMI context and goal-weight safety checks.
- Optional two-to-six meal target distribution.
- Locally saved plans, comparison, versioned formula provenance, JSON backup and CSV export.
- Explicit boundaries for minors, pregnancy, lactation, eating disorders, medical diets and high-risk conditions.

Phase 09 answers: “What is a defensible starting target, how was it calculated, and what assumptions could make it wrong?” It does not diagnose, treat, prescribe supplements, guarantee weight change or generate a clinical nutrition plan.

## 2. Scope and intended population

### Supported MVP population

- Adults aged 19 to 100.
- Nonpregnant and nonlactating.
- General healthy-adult planning.
- Recreational resistance, endurance and mixed training.
- Metric and imperial input with canonical metric calculations.

### Hard unavailable states

- Age below 19.
- Pregnancy.
- Lactation.
- Missing sex variable required by the source equation.
- Missing age, height, weight or activity category.

### Professional-review flags

The app must not collect a diagnosis history. It must present a non-exhaustive exclusion notice before calculation stating that the tool is not designed for diagnosed eating disorders, kidney or liver disease, diabetes managed with glucose-lowering medication, bariatric-surgery history, unintentional weight loss, prescribed therapeutic diets or extreme athletic workloads.

The user may continue only after acknowledging that limitation. No condition-specific output may be generated.

## 3. Non-negotiable product decisions

- No login, account, profile, Supabase, Firebase or cloud health database.
- No medical diagnosis, treatment or therapeutic diet.
- No AI-generated calorie, macro or meal recommendation.
- No target-date weight forecast in Phase 09.
- No static “3,500 kcal equals one pound forever” rule.
- No automatic calorie adjustment based on a single weigh-in.
- No exercise-calorie add-back.
- No calorie-burn estimate from Phase 06 workout logs.
- No “metabolic damage,” “starvation mode,” hormone or body-type claims.
- No universal protein number shown without body-weight basis and source context.
- No water target derived from a generic millilitres-per-kilogram rule.
- No supplement dose or micronutrient deficiency diagnosis.
- No forced macro split presented as optimal for everyone.
- No unlabelled manual override.
- No saved plan without formula version and source provenance.
- All personal inputs and plans remain on the device unless the user exports them.

## 4. Phase ownership and dependencies

| Concept | Owning phase | Phase 09 rule |
| --- | --- | --- |
| Application shell and design language | Phase 01 | Reuse; do not redesign. |
| Food identities and composition | Phase 07 | Read published verified data; do not rewrite nutrient values. |
| Nutrient definitions and DRI frameworks | Phase 08 | Reuse IDs, units and framework semantics. |
| Food logging and daily intake | Phase 10 | Consume the current Phase 09 target plan. |
| Recipes and complete meal plans | Phase 11 | Use Phase 09 targets but own recipes and menus. |
| Trend analytics and target calibration | Phase 15 | Use saved targets and multi-week measurements; no auto-calibration here. |
| Backup and full-app export | Phase 17 | Phase 09 provides versioned local records and module export. |

## 5. Required routes

| Route | Purpose |
| --- | --- |
| `/diet-planning` | Module landing page and current-plan summary. |
| `/diet-planning/energy` | Adult maintenance-energy estimator. |
| `/diet-planning/goal` | Goal adjustment and safety checks. |
| `/diet-planning/macros` | Protein, fat, carbohydrate and fibre planner. |
| `/diet-planning/meal-distribution` | Optional two-to-six meal target allocation. |
| `/diet-planning/plans` | Saved-plan list, comparison, archive and export. |
| `/diet-planning/plans/$planId` | Saved-plan detail and provenance. |
| `/diet-planning/methodology` | Equations, assumptions, model error, rounding and limitations. |
| `/diet-planning/safety` | Eligibility and professional-review boundaries. |

Invalid plan IDs must show a recoverable not-found state. Draft or invalid plans must never be silently recalculated with a newer formula version.

## 6. Primary user journeys

### 6.1 Quick starting target

1. Open Diet Planning.
2. Read the eligibility boundary.
3. Enter age, sex used by the equation, height and weight.
4. Select an activity category.
5. View estimated maintenance energy and model uncertainty.
6. Select goal and explicit adjustment percentage.
7. Select protein context and point within the displayed range.
8. Select fat percentage within the allowed range.
9. Review calculated carbohydrate and fibre values.
10. Save locally or use without saving.

### 6.2 Existing target plan

1. Open saved plans.
2. Select a plan.
3. Review inputs, formulas, version and warnings.
4. Duplicate the plan before changing assumptions.
5. Set one plan as current.
6. Export plan data or archive the plan.

### 6.3 Manual target

1. Calculate maintenance using the approved equation.
2. Choose Manual.
3. Enter an adjustment within the standard safety range or a direct calorie target.
4. Provide a reason.
5. Display a permanent manual-override label.
6. Preserve the original calculated maintenance value.

## 7. Calculator architecture

The calculator must be a pure deterministic domain layer. UI components call functions; components must not contain hidden formula constants.

Required domain functions:

- `validateDietPlannerEligibility`
- `convertDietPlannerInputsToMetric`
- `calculateAdultEer`
- `roundEnergyHeadline`
- `calculateBmiContext`
- `calculateGoalEnergyTarget`
- `calculateProteinRange`
- `calculateFatTarget`
- `calculateRemainingCarbohydrate`
- `calculateFiberBenchmark`
- `calculateMealDistribution`
- `evaluateMacroAmdrStatus`
- `evaluateDietPlanWarnings`
- `validateDietPlanEnergyBalance`
- `serializeDietPlan`
- `migrateDietPlanRecord`

Every function must have unit tests using the attached reference vectors.

## 8. Input model and units

### Required inputs

- Age in years.
- Sex variable used by the source equation: male or female.
- Height.
- Current weight.
- Physical-activity category.
- Pregnancy or lactation status.

### Optional inputs

- Goal weight for contextual BMI warnings only.
- Separate calculation weight selected manually.
- Goal type.
- Adjustment percentage.
- Training context for protein.
- Fat percentage.
- Meal count.
- Diet pattern, cuisine preferences and excluded foods.

### Unit rules

- Canonical calculations use kilograms and centimetres.
- Imperial inputs are converted before validation.
- Store canonical metric values and the user’s preferred display system.
- Display enough precision to verify input conversion, but round headline targets sensibly.
- Do not round intermediate calculations.

## 9. Adult maintenance-energy estimator

### 9.1 Primary model

Use the 2023 National Academies adult EER equations. These equations predict total energy expenditure for weight-stable adults by sex, age, height, weight and PAL category.

Inputs:

- Age: years.
- Height: centimetres.
- Weight: kilograms.
- Output: kilocalories per day.

### 9.2 Male equations, age 19+

```text
Inactive:
EER = 753.07 - (10.83 x age) + (6.50 x height) + (14.10 x weight)

Low active:
EER = 581.47 - (10.83 x age) + (8.30 x height) + (14.94 x weight)

Active:
EER = 1004.82 - (10.83 x age) + (6.52 x height) + (15.91 x weight)

Very active:
EER = -517.88 - (10.83 x age) + (15.61 x height) + (19.11 x weight)
```

### 9.3 Female equations, age 19+

```text
Inactive:
EER = 584.90 - (7.01 x age) + (5.72 x height) + (11.71 x weight)

Low active:
EER = 575.77 - (7.01 x age) + (6.60 x height) + (12.14 x weight)

Active:
EER = 710.25 - (7.01 x age) + (6.54 x height) + (12.34 x weight)

Very active:
EER = 511.83 - (7.01 x age) + (9.07 x height) + (12.56 x weight)
```

### 9.4 Model-performance disclosure

The source reports adult-model RMSE values of approximately 339 kcal/day for men and 246 kcal/day for women, with mean absolute percentage error around 9 percent.

The interface must state:

- This is a population-model estimate, not a metabolic measurement.
- Individual maintenance can differ by hundreds of calories.
- The RMSE is a model-performance statistic, not a guaranteed personal confidence interval.
- Weight trend over time is more informative than one calculation.
- Phase 15 may support multi-week calibration; Phase 09 must not auto-adjust.

### 9.5 Rounding

- Retain the unrounded result internally.
- Round the main display to the nearest 25 kcal/day.
- Show the unrounded value only in Methodology or an expandable calculation detail.
- Do not imply precision to one calorie.

## 10. Physical-activity category selection

Use the source PAL ranges:

| Category | Adult PAL range | Interface description |
| --- | --- | --- |
| Inactive | 1.00 to less than 1.53 | Independent daily living with minimal additional activity. |
| Low active | 1.53 to less than 1.68 | Daily living plus some routine movement or planned activity. |
| Active | 1.68 to less than 1.85 | Regular moderate-to-vigorous movement across the week. |
| Very active | 1.85 to less than 2.50 | High sustained activity; extreme athletic workloads remain out of scope. |

The selector must:

- Explain that PAL is an aggregate of work, transport, recreation, sleep and daily movement.
- Avoid mapping one workout count or step count directly to a category.
- Allow the user to compare categories and see the resulting estimate before saving.
- Preserve the selected category in the plan’s provenance.

## 11. Optional educational REE comparison

Mifflin-St Jeor may be included only on the Methodology page as a historical resting-energy equation. It must not be multiplied by arbitrary activity factors and substituted for the Phase 09 primary EER result.

If implemented:

- Label it “Resting energy estimate - educational comparison.”
- Show its source and year.
- Do not average it with the NASEM EER.
- Do not use it for saved calorie targets.

## 12. Goal-energy planning

### 12.1 Goal modes

- Maintenance: 0 percent.
- Fat loss: -5, -10, -15 or -20 percent.
- Muscle gain: +5, +10 or +15 percent.
- Recomposition: 0 or -5 percent.
- Manual: within -20 to +15 percent, with reason.

### 12.2 Calculation

```text
targetEnergy = maintenanceEnergy x (1 + adjustmentPercent / 100)
```

Round the final target to the nearest 25 kcal/day after calculating the unrounded target.

### 12.3 Why percentages are used

The app must not claim that a fixed deficit maps to a guaranteed weekly loss. Body weight changes dynamically, and maintenance estimates are uncertain. Percentage adjustments expose the planning assumption without pretending to predict a date.

### 12.4 Defaults

- Maintenance default: 0 percent.
- Fat-loss default: -10 percent.
- Muscle-gain default: +5 percent.
- Recomposition default: 0 percent.

Defaults are interface starting points, not recommendations for every user.

### 12.5 Warnings and blocks

- Block any result below 1,000 kcal/day.
- Block a fat-loss goal when current BMI is below 18.5.
- Block a goal weight that implies BMI below 18.5.
- Warn at fat-loss adjustments of 15 or 20 percent.
- Warn at gain adjustments above 10 percent.
- Warn when a current or goal BMI is 30 or above; do not diagnose obesity or create medical advice.
- Do not use BMI as the sole measure of health or athletic suitability.
- Do not estimate a completion date.

## 13. BMI context

BMI is optional context, not the central output.

```text
BMI = weightKg / (heightMetres x heightMetres)
```

Required display rules:

- Show the numeric result and formula.
- Explain that BMI does not distinguish muscle from fat and is not a diagnosis.
- Use it only for low-weight safety blocks and contextual warnings.
- Never label the user’s body as good, bad, fit or unfit.
- Do not calculate body-fat percentage from BMI.

## 14. Protein target calculator

### 14.1 General adult reference

- 0.8 g/kg/day.
- Label as a population reference for healthy adults, not an athletic optimisation target.

### 14.2 Regular exercise

- 1.2 to 1.6 g/kg/day.
- Default selection: 1.4 g/kg/day.

### 14.3 Strength or hypertrophy training

- 1.4 to 2.0 g/kg/day.
- Default selection: 1.6 g/kg/day.

### 14.4 Endurance or mixed training

- 1.2 to 2.0 g/kg/day.
- Default selection: 1.4 g/kg/day.

### 14.5 Calculation

```text
proteinGrams = calculationWeightKg x selectedProteinGramsPerKg
proteinEnergyKcal = proteinGrams x 4
```

### 14.6 Required boundaries

- Show the full range and selected point.
- Allow current weight or a manually selected calculation weight.
- Never silently invent adjusted body weight.
- If BMI is 30 or above, state that simple total-body-weight scaling may be less appropriate and allow professional review or manual basis.
- Do not show a special high-protein kidney-disease mode.
- Do not prescribe protein supplements.
- Do not imply that the upper end is always superior.

## 15. Fat target calculator

Use the adult AMDR context of 20 to 35 percent of energy.

```text
fatEnergyKcal = targetEnergyKcal x fatPercent / 100
fatGrams = fatEnergyKcal / 9
```

Required behavior:

- Default selection: 25 percent.
- Standard UI range: 20 to 35 percent.
- Display grams and percentage.
- Link to Phase 08 for fat-class education.
- Do not call a low-fat or high-fat split medically superior.
- Do not generate ketogenic-diet logic in Phase 09.

## 16. Carbohydrate calculation

Carbohydrate is calculated from remaining energy after selected protein and fat.

```text
remainingEnergyKcal = targetEnergyKcal - proteinEnergyKcal - fatEnergyKcal
carbohydrateGrams = remainingEnergyKcal / 4
carbohydratePercentEnergy = remainingEnergyKcal / targetEnergyKcal x 100
```

Validation:

- Remaining energy must be zero or positive.
- If protein plus fat exceeds the calorie budget, block save and explain the conflict.
- Compare the result with the adult AMDR context of 45 to 65 percent energy.
- A result outside the AMDR may be displayed only with a clear “outside selected reference range” label.
- Do not automatically alter protein or fat to force AMDR compliance.

Athletic carbohydrate context may be shown as education from the sports-nutrition source, but the app must not simultaneously force both a grams-per-kilogram target and a fixed calorie budget. Present feasibility conflicts rather than hiding them.

## 17. Fibre planning benchmark

Use 14 g per 1,000 kcal as a planning benchmark:

```text
fiberGrams = targetEnergyKcal / 1000 x 14
```

Rules:

- Label this as a planning benchmark.
- Also link to verified Phase 08 age/sex reference values where available.
- Do not promise that reaching the number treats constipation or disease.
- Round to the nearest whole gram in the headline.
- Preserve the unrounded value internally.

## 18. Hydration reference

Phase 09 must not create a body-weight-based water prescription.

It may display:

- Phase 08 total-water reference values where verified.
- A statement that total water includes food and beverages.
- A statement that climate, sweat rate, illness, pregnancy, lactation and training alter needs.
- A link to the later recovery/hydration module.

No dehydration diagnosis or electrolyte prescription belongs here.

## 19. Meal-distribution planner

This planner divides selected daily targets into two to six planning slots.

### Modes

- Even: distribute energy and selected macros evenly, then resolve rounding in the final meal.
- Custom: user enters percentages or gram allocations; totals must reconcile.

### Required behavior

- Default to four meals.
- Allow labels such as Breakfast, Lunch, Snack and Dinner.
- Display daily total and difference after each edit.
- Prevent saving if energy or macro totals do not reconcile within the allowed rounding tolerance.
- Treat even distribution as convenience, not a biological requirement.
- Do not create food menus or recipes.

## 20. Diet pattern and exclusions

Optional local planning metadata may include:

- Omnivore.
- Vegetarian.
- Vegan.
- Pescatarian.
- Eggetarian.
- Unspecified.
- Cuisine preferences.
- Excluded Phase 07 food IDs.
- Free-text allergy note.

This is not a user profile. It is plan-specific local metadata.

Rules:

- Do not infer allergies from food choices.
- Do not guarantee allergen safety.
- Do not automatically diagnose nutrient gaps.
- Phase 11 may use these preferences when showing reviewed meal-plan templates.

## 21. Saved plans

A user may save multiple plans such as maintenance, cut, gain or travel.

Each saved plan must contain:

- Stable plan ID.
- Name and status.
- Creation and update timestamps.
- Goal.
- Input snapshot if the user permits storage.
- Original maintenance estimate.
- Model RMSE.
- Adjustment percentage.
- Target calories.
- Protein range and selected point.
- Fat percentage and grams.
- Carbohydrate grams and percentage.
- Fibre benchmark.
- Meal distribution.
- Warnings.
- Formula version.
- Reference-data version.
- Source IDs.
- Manual override and reason.

Only one plan may be current. Switching the current plan must not delete historical plans.

## 22. Local storage

Use IndexedDB, not a remote database.

Recommended stores:

```text
fitness-os
  dietPlans
  dietPlannerSettings
  dietPlanAuditLog
```

Requirements:

- Transactional create/update/archive/delete.
- Schema migrations.
- JSON module backup and restore.
- CSV summary export.
- Optional exclusion of personal input fields from exports.
- Cross-tab update notification.
- No network request containing inputs or results.

## 23. Formula provenance and versioning

Every saved plan must record:

- `formulaSetId`
- `formulaSetVersion`
- `referenceDataVersion`
- `sourceIds`
- `calculatedAt`

When formulas change in a future release:

- Do not silently recalculate old plans.
- Display “calculated with an older formula version.”
- Offer Duplicate and Recalculate.
- Preserve the old plan for comparison.
- Record the recalculation in the audit log.

## 24. Results interface

The result screen must present:

1. Estimated maintenance energy.
2. Selected goal adjustment.
3. Starting calorie target.
4. Model uncertainty and assumptions.
5. Protein range and selected target.
6. Fat target.
7. Calculated carbohydrate.
8. Fibre benchmark.
9. Optional meal distribution.
10. Warnings and unsupported-use boundary.
11. Formula and source details.

Do not lead with a giant calorie number without the uncertainty and goal assumption nearby.

## 25. Calculation detail drawer

Provide an expandable “How this was calculated” panel showing:

- Converted metric inputs.
- Exact equation and coefficients.
- Unrounded maintenance result.
- Rounding rule.
- Goal adjustment calculation.
- Protein basis.
- Fat calculation.
- Carbohydrate remainder.
- Fibre calculation.
- AMDR comparison.
- Formula version and sources.

This detail must be printable and exportable.

## 26. Empty, warning and error states

Required states:

- Unsupported age.
- Pregnancy or lactation.
- Missing required input.
- Invalid height or weight.
- Target below 1,000 kcal/day.
- Loss goal at low BMI.
- Goal weight below BMI 18.5.
- Protein and fat exceed calorie budget.
- Carbohydrate remainder is negative.
- Saved plan uses older formula version.
- Corrupted imported backup.
- Import conflict.
- No saved plans.
- Phase 08 reference value unavailable.

Every error must explain what can be changed. No fallback formula may run silently.

## 27. Accessibility

- One H1 per route.
- Labels and units programmatically associated with every input.
- Radio groups and sliders operable by keyboard.
- Sliders must have numeric input alternatives.
- Calculation changes announced through a polite live region.
- Error summaries link to invalid fields.
- Warning severity is not conveyed by colour alone.
- Tables have captions and headers.
- Formula text remains selectable and readable at 400 percent zoom.
- Mobile reflow works at 320 px.
- Focus remains visible in light and dark themes.

## 28. Responsive behavior

### Mobile

- Use a stepper or stacked sections.
- Keep current step, progress and result summary visible.
- Use numeric keyboards for numeric inputs.
- Results use cards; avoid wide fixed tables.
- Methodology tables may horizontally scroll with clear labels.

### Tablet

- Inputs and live summary may use two columns.
- Keep warnings below the related result.

### Desktop

- Use a two-column planner with sticky live summary.
- Provide a contents rail on Methodology.
- Saved-plan comparison may use a wide semantic table.

## 29. Performance and offline behavior

- All calculations run locally and instantly.
- No runtime nutrition or energy API.
- Lazy-load methodology and source detail.
- Keep reference constants in one versioned static module.
- The calculator must work after the app shell and reference data are cached.
- Never block a calculation because an unrelated image or article failed to load.

## 30. Suggested TypeScript architecture

```text
src/
  features/diet-planning/
    components/
    routes/
    domain/
      eligibility.ts
      unit-conversion.ts
      adult-eer.ts
      bmi-context.ts
      goal-energy.ts
      protein-target.ts
      macro-allocation.ts
      fiber-target.ts
      meal-distribution.ts
      warnings.ts
      provenance.ts
      plan-validation.ts
    storage/
      diet-plan-db.ts
      diet-plan-migrations.ts
      diet-plan-export.ts
    data/
      phase09-reference-data.ts
    tests/
  docs/diet-planning/
```

## 31. Data validation

The validator must check:

- Schema validity.
- Unique plan IDs.
- Exactly one current plan or none.
- Age, height and weight ranges.
- Unsupported life-stage block.
- Valid activity category.
- Correct formula version.
- Maintenance calculation within rounding tolerance.
- Adjustment within goal-specific range.
- Target at least 1,000 kcal/day.
- Protein range min not above max.
- Selected target inside its range.
- Fat percentage between 20 and 35.
- Macro energy reconciles with target within 5 kcal or documented rounding tolerance.
- Meal totals reconcile.
- Manual override has a reason.
- Source IDs exist.
- Imports do not silently discard unknown fields.

## 32. Required automated tests

- All eight adult EER equations.
- Metric and imperial conversion.
- Nearest-25 energy rounding.
- Male and female RMSE display.
- Boundary age 19.
- Pregnancy and lactation block.
- PAL selection.
- Goal adjustment for every allowed percentage.
- 1,000-kcal minimum block.
- Low-BMI loss block.
- Goal-weight BMI block.
- Protein preset ranges.
- Fat gram calculation.
- Carbohydrate remainder and negative remainder.
- Fibre calculation.
- AMDR comparison.
- Meal-distribution rounding.
- Manual override provenance.
- Older-formula warning.
- IndexedDB CRUD and migration.
- JSON export/import round trip.
- CSV summary export.
- No remote network request.
- Regression of Phases 00, 01, 07 and 08.

## 33. Reference test vectors

| Test | Inputs | Expected |
| --- | --- | --- |
| Male active EER | 30 y, 175 cm, 75 kg, active | 3014.17 kcal unrounded; 3025 kcal headline. |
| Female low-active EER | 28 y, 165 cm, 60 kg, low active | 2196.89 kcal unrounded; 2200 kcal headline. |
| Macro allocation | 2500 kcal, 75 kg, 1.6 g/kg protein, 30% fat | 120 g protein, 83.33 g fat, 317.5 g carbohydrate, 35 g fibre. |

Tests must use a numerical tolerance no wider than 0.01 for unrounded formula values.

## 34. Manual test matrix

Test at minimum:

- 320 px mobile, 768 px tablet and 1440 px desktop.
- Metric and imperial units.
- Light and dark modes.
- Keyboard only.
- Screen-reader labels and live results.
- 400 percent zoom.
- Age 18 and age 19.
- Very small and very large valid inputs.
- Pregnancy and lactation.
- Every PAL category.
- Every goal mode.
- Low-BMI loss attempt.
- Below-1,000-kcal attempt.
- Manual override.
- Negative carbohydrate conflict.
- Two and six meals.
- Export, clear, restore and import conflict.
- Old formula version.

## 35. Acceptance criteria

- [ ] All Phase 09 routes work.
- [ ] The 2023 NASEM equations are implemented exactly.
- [ ] No hidden activity multiplier is used.
- [ ] Model uncertainty is visible near the result.
- [ ] Energy values are rounded only after calculation.
- [ ] Goal adjustments are explicit and within the defined range.
- [ ] No target-date prediction is shown.
- [ ] Below-1,000-kcal results are blocked.
- [ ] Low-BMI loss and target-weight safety checks work.
- [ ] Protein ranges and sources are visible.
- [ ] Fat is limited to the standard 20-to-35-percent planning range.
- [ ] Carbohydrate is calculated from remaining energy and conflicts are surfaced.
- [ ] Fibre is labelled as a benchmark.
- [ ] No generic water-per-kilogram target is generated.
- [ ] Meal distribution reconciles with daily totals.
- [ ] Saved plans preserve formula provenance.
- [ ] Old plans are not silently recalculated.
- [ ] Data remains local and exportable.
- [ ] No medical diet, supplement dose or deficiency diagnosis is generated.
- [ ] Mobile, desktop, dark-mode and accessibility tests pass.
- [ ] Phases 00, 01, 07 and 08 remain functional.

## 36. Explicit exclusions

Do not build in Phase 09:

- Food diary or daily intake tracking.
- Recipe database.
- Automatically generated menus.
- Shopping lists.
- Micronutrient-gap diagnosis.
- Supplement plan.
- Medical-condition diet.
- Pregnancy or paediatric planning.
- Eating-disorder support tool.
- Dynamic target-date body-weight model.
- Calorie-burn estimator.
- Wearable integration.
- Cloud sync.
- AI coach.

## 37. Required implementation deliverables

Lovable must create:

- All Phase 09 routes and components.
- Deterministic calculation domain layer.
- Versioned static reference-data loader.
- Local saved-plan storage and migrations.
- JSON import/export and CSV summary export.
- Calculation detail and methodology views.
- Warning and unsupported-use states.
- Unit, integration, accessibility and storage tests.
- `docs/diet-planning/METHODOLOGY.md`.
- `docs/diet-planning/FORMULAS.md`.
- `docs/diet-planning/SAFETY_BOUNDARIES.md`.
- `docs/diet-planning/DATA_MODEL.md`.
- `docs/diet-planning/TESTING.md`.

## 38. GitHub checkpoint

After every blocking acceptance criterion passes, create:

`phase-09-diet-planning-complete`

Do not start Phase 10 while formula, safety, storage or regression tests are failing.

## 39. Phase 10 handoff

Phase 09 must expose:

- Current target-plan ID.
- Target calories.
- Protein minimum, maximum and selected grams.
- Fat grams and percent energy.
- Carbohydrate grams and percent energy.
- Fibre benchmark.
- Phase 08 reference-framework ID.
- Formula and reference-data versions.
- Meal-distribution targets.
- Warning state.

Phase 10 may compare logged intake with these targets. It must not reinterpret or silently alter them.

## 40. Authoritative source register

| Source | Use in Phase 09 |
| --- | --- |
| National Academies, Dietary Reference Intakes for Energy, 2023, doi:10.17226/26818 | Primary adult EER equations, PAL ranges and model error. |
| NIDDK Body Weight Planner | Adult-only precedent, dynamic-model caution, low-intake and low-BMI warnings. |
| CDC Steps for Losing Weight, 2025 | Gradual-weight-change context; no guaranteed rate calculation. |
| Academy/DC/ACSM Nutrition and Athletic Performance, 2016 | Exercise-related protein and carbohydrate context and professional referral boundary. |
| ISSN Protein and Exercise position stand, 2017 | Healthy exercising-adult protein range and meal-distribution context. |
| National Academies macronutrient DRI report | Protein RDA, adult AMDR and fibre benchmark. |
| Dietary Guidelines for Americans, 2025-2030 | Flexible whole-food pattern principle; not a rigid universal menu. |
| Mifflin et al., 1990 | Optional educational REE comparison only. |

## 41. Final Lovable instruction

Build Phase 09 as an auditable planning calculator, not a digital nutritionist. Use only the attached formula constants and rules. Show assumptions, error and provenance. Keep every personal input local. When the evidence cannot support a precise answer, show the limitation instead of manufacturing certainty.
