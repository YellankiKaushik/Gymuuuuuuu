# Phase 11 - Recipes and Meal Plans

**Project:** Fitness OS  
**Document type:** Lovable implementation specification  
**Version:** 1.0  
**Date:** 5 August 2026  
**Status:** Ready for Plan-mode review  
**Depends on:** Phases 00, 01, 07, 08, 09 and 10  
**Provides data contracts to:** Phases 15 and 17

---

## 0. How to use this phase

1. Keep the Phase 00 Project Knowledge active.
2. Confirm the Phase 01 shell, navigation, themes, shared components and accessibility foundation remain intact.
3. Confirm Phase 07 canonical food IDs, food-state profiles, portions, nutrient values, source releases and publication states are available.
4. Confirm Phase 08 nutrient identities, units and reference-intake semantics are available.
5. Confirm Phase 09 saved target plans and formula provenance are available.
6. Confirm Phase 10 nutrition-entry snapshots, meal slots and local-storage contracts are available.
7. Attach this Markdown specification.
8. Attach `Phase_11_Recipes_Meal_Plans_Data_Schema.json`.
9. Attach `Phase_11_Recipes_Meal_Plans_Reference_Data.json`.
10. Attach `Phase_11_Lovable_Prompt_Package.txt`.
11. Also attach the Phase 07-10 schemas and reference files because Phase 11 consumes those contracts.
12. Run the Plan-mode prompt before any code change.
13. Reject any plan that invents recipes, nutrient values, retention factors, serving weights, allergen guarantees, medical diets or target-fitting menus.
14. Approve only the Phase 11 scope.
15. Run the Agent-mode, verification, recipe-calculation audit, meal-plan integrity audit, licensing audit and correction prompts.
16. Create the GitHub checkpoint `phase-11-recipes-meal-plans-complete` only after every blocking test passes.

## 1. Phase objective

Build a transparent, local-first system for creating recipes, calculating recipe nutrition, assembling practical meal plans, scaling servings, managing leftovers and producing grocery lists.

The module must deliver:

- A curated recipe-library interface that publishes only reviewed and licensed records.
- A local personal recipe builder.
- Ingredient selection from published Phase 07 food-composition profiles.
- Exact gram-based ingredient quantities and food-specific verified portions.
- Recipe-yield models based on measured final weight whenever possible.
- Explicit nutrient-retention and cooking-yield handling.
- No-cook, cooked, batch-prep and component-recipe support.
- Immutable recipe versions and calculation provenance.
- Nutrition totals per batch, per 100 g and per serving.
- Nutrient completeness and calculation-quality indicators.
- Recipe scaling with explicit rounding behavior.
- Deterministic meal-plan construction from reviewed recipes and foods.
- Optional reviewed meal-plan templates; no generative meal planner.
- Phase 09 energy and macro target comparison.
- Phase 08 micronutrient reference comparison with completeness disclosure.
- Dietary-preference, ingredient-exclusion and allergen-information filters.
- Leftover and batch-allocation tracking.
- Grocery-list aggregation without invalid ingredient merging.
- Explicit logging of consumed recipe servings into Phase 10.
- IndexedDB persistence, versioned backup, restore and CSV/JSON export.
- Strict boundaries against clinical diets, allergy guarantees and AI-generated nutrition advice.

Phase 11 answers: **“How was this recipe calculated, what does one measured serving contain, how can I arrange reviewed foods and recipes into a practical plan, and what do I need to buy?”**

It does not answer: **“What medical diet will treat my condition, am I safe from every allergen, or what menu is clinically correct for me?”**

## 2. Supported use and hard boundaries

### 2.1 Supported use

- Adults using the application for personal meal organization.
- Recipes built from verified Phase 07 profiles or clearly labelled user-entered ingredients.
- No-cook and cooked recipes.
- Measured final yield and serving weight.
- Optional source-backed retention factors.
- Manual one-day to twenty-eight-day meal plans.
- Reviewed meal-plan templates with transparent target bands.
- Vegetarian, vegan and omnivorous filters.
- Cultural, cuisine, budget, equipment and preparation-time tags.
- Grocery planning and batch preparation.
- Local-only personal recipe and plan storage.

### 2.2 Hard boundaries

- No therapeutic diet for diabetes, kidney disease, liver disease, gastrointestinal disease, eating disorders or other medical conditions.
- No paediatric, pregnancy or lactation meal-plan generation.
- No food-allergy guarantee or cross-contamination guarantee.
- No medication or supplement advice.
- No AI menu generation.
- No automatic scraping or copying of web recipes.
- No copied recipe images without documented reuse rights.
- No fabricated ingredient weight, cooked yield, retention factor or nutrient value.
- No generic cup-to-gram conversion.
- No assumption that millilitres equal grams except water-like items with an approved density rule.
- No automatic conversion of a raw food profile into a cooked profile.
- No double application of cooking retention factors.
- No silent recipe recalculation after source-data updates.
- No silent mutation of historical meal plans or consumed Phase 10 records.
- No cloud account, authentication, database or runtime nutrition API.

## 3. Phase ownership and dependencies

| Concept | Owning phase | Phase 11 rule |
| --- | --- | --- |
| Shell, navigation, themes and shared components | Phase 01 | Reuse without redesign. |
| Food identity, food state, portions and nutrient profiles | Phase 07 | Reference published records and snapshot every ingredient version. |
| Nutrient identity and reference semantics | Phase 08 | Reuse IDs, units and intake-framework rules. |
| Energy and macro target plans | Phase 09 | Compare plans against frozen target snapshots. |
| Consumed food and recipe logging | Phase 10 | Create explicit consumed-entry snapshots; never auto-log planned meals. |
| Long-term adherence and trends | Phase 15 | Consume immutable plan and recipe snapshots. |
| Global backup and restoration | Phase 17 | Register a versioned Phase 11 adapter. |

## 4. Non-negotiable product decisions

1. **Ingredient profiles are explicit.** Raw, boiled, roasted, drained and dried foods are different source profiles.
2. **Mass is canonical.** Every nutritive ingredient resolves to grams before calculation.
3. **Measured yield is preferred.** The best recipe-density calculation uses the measured final cooked weight.
4. **Retention is optional, not imaginary.** A nutrient-retention factor may be applied only when an approved source matches the ingredient group, cooking method and nutrient.
5. **No double cooking adjustment.** A cooked food profile must not receive another cooking-retention factor for the same preparation step.
6. **Missing remains missing.** An unresolved ingredient or nutrient makes the recipe partial or unavailable; it does not become zero.
7. **Recipe versions are immutable.** Editing creates a new version. Existing meal plans and food logs retain the version they used.
8. **Planned is not consumed.** A meal plan never writes to Phase 10 until the user explicitly logs it.
9. **Grocery merging is conservative.** Merge only compatible canonical food profiles and states.
10. **Templates are reviewed.** Lovable must not invent a week of meals to hit a target.
11. **Allergen labels are informational.** They are derived from declared ingredients and are not guarantees of manufacturing or kitchen safety.
12. **Licensing is mandatory.** Public recipes and images require original authorship, public-domain status or documented permission.
13. **Local means local.** Personal recipes, meal plans, notes and grocery lists remain on the device unless exported.

## 5. Required routes

| Route | Purpose |
| --- | --- |
| `/recipes` | Published recipe catalogue and local-recipe entry point. |
| `/recipes/$recipeSlug` | Published recipe detail. |
| `/recipes/create` | Create a local recipe. |
| `/recipes/local/$recipeId` | Local recipe detail and version history. |
| `/recipes/local/$recipeId/edit` | Create a new immutable recipe version. |
| `/recipes/methodology` | Recipe calculation, yield, retention and uncertainty. |
| `/meal-plans` | Saved plans and reviewed templates. |
| `/meal-plans/create` | Manual meal-plan builder. |
| `/meal-plans/$mealPlanId` | Meal-plan calendar, totals, leftovers and actions. |
| `/meal-plans/$mealPlanId/grocery-list` | Aggregated grocery list. |
| `/meal-plans/templates` | Reviewed templates only. |
| `/meal-plans/settings` | Defaults, exclusions, meal slots, units and storage. |
| `/meal-plans/privacy` | Local-storage and backup explanation. |

Invalid IDs must show recoverable not-found states. Corrupt recipe versions or meal-plan records must be isolated and must not crash the entire application.

## 6. Primary user journeys

### 6.1 Create a no-cook recipe

1. Open Create Recipe.
2. Enter title, description, preparation time and tags.
3. Add published Phase 07 ingredient profiles.
4. Enter each ingredient in grams or a verified food-specific portion.
5. Select `no_cook` calculation.
6. Enter measured final batch weight or measured serving count and serving weight.
7. Review batch, per-100-g and per-serving nutrient calculations.
8. Review missing-data and source-quality indicators.
9. Save local version 1.

### 6.2 Create a cooked recipe with measured yield

1. Add raw or otherwise appropriate ingredient profiles.
2. Enter exact ingredient weights.
3. Select the cooking method.
4. After cooking, weigh the edible final batch.
5. Enter the measured final weight.
6. Apply only approved nutrient-retention factors that match the selected method.
7. Review every applied and unavailable factor.
8. Save the recipe version with the measured yield and methodology snapshot.

### 6.3 Edit a recipe

1. Open the current recipe version.
2. Choose Edit.
3. Clone the version into a draft.
4. Change ingredients, yield, instructions or tags.
5. Recalculate.
6. Save as a new immutable version.
7. Existing meal plans and historical Phase 10 logs continue referencing the old version.

### 6.4 Build a weekly meal plan

1. Start a blank seven-day plan or a reviewed template.
2. Optionally bind a Phase 09 target snapshot.
3. Add recipe servings or individual Phase 07 foods to meal slots.
4. Review daily energy, macros and nutrient completeness.
5. Adjust serving quantities manually.
6. Assign batch recipes and leftovers.
7. Generate a grocery list.
8. Save an immutable plan version.

### 6.5 Log a planned recipe to Phase 10

1. Open a planned meal.
2. Choose Log consumed.
3. Confirm recipe version, serving quantity, date and meal slot.
4. Create a Phase 10 recipe entry containing the exact recipe-version and nutrient snapshot.
5. Mark the planned item as logged without changing the original plan nutrition.

### 6.6 Generate and use a grocery list

1. Open a saved meal-plan version.
2. Generate a list from active planned items.
3. Aggregate compatible ingredient requirements in grams.
4. Keep incompatible states separate.
5. Mark pantry/on-hand quantities manually.
6. Mark items purchased.
7. Regenerate only after explicit confirmation if the plan changes.

## 7. Recipe catalogue and publication model

### 7.1 Published recipe eligibility

A curated recipe may appear publicly only when:

- The recipe has a stable ID and slug.
- Every ingredient is resolved or explicitly marked non-nutritive.
- The recipe has a reviewed yield model.
- Nutrition calculation status is not `unavailable`.
- Source and licence metadata are complete.
- Instructions are original, public domain or used with permission.
- Media has documented rights.
- Allergens and dietary tags are reviewed.
- Food-safety statements have authoritative sources where applicable.
- Editorial status is `published`.

### 7.2 Public recipe source types

- `original_project_recipe`.
- `public_domain_government_recipe`.
- `licensed_recipe`.
- `adapted_with_permission`.

A URL alone is not permission to reproduce content.

### 7.3 Local recipes

Local user-created recipes:

- Are stored in IndexedDB.
- Are not published to other users.
- May contain unresolved or custom ingredients.
- Display honest calculation-quality and missing-data states.
- May be archived but not silently deleted from historical plans.

## 8. Recipe identity and versioning

A recipe identity is stable. A recipe version contains the actual instructions and calculation inputs.

Required identity fields:

- Recipe ID.
- Current version ID.
- Title.
- Slug for published recipes.
- Visibility: published or local.
- Active or archived status.
- Created and updated timestamps.

Required version fields:

- Version ID and sequential version number.
- Recipe ID.
- Title and description snapshots.
- Ingredient lines.
- Instruction steps.
- Yield model.
- Calculation methodology.
- Nutrient results.
- Tags, allergens and dietary classifications.
- Time, equipment and difficulty metadata.
- Source and licence metadata.
- Created timestamp and revision reason.

Version IDs are referenced by meal plans, grocery lists and Phase 10 logs.

## 9. Ingredient-line model

Each line must contain:

- Stable line ID and display order.
- Ingredient kind: canonical food, custom food, recipe component or unresolved text.
- Display name snapshot.
- Quantity and entered unit.
- Canonical gram weight when nutritive.
- Preparation note, such as chopped or drained.
- Optional or required flag.
- Phase 07 food/profile/source snapshot, when canonical.
- Custom-food revision snapshot, when local.
- Component-recipe version snapshot, when nested.
- Per-100-g nutrient snapshot and source statuses.
- Retention-factor assignment, when applicable.
- Waste/refuse adjustment, only when source-backed.
- Data-quality flags.

### 9.1 Unit rules

Accepted exact mass units:

- Gram.
- Kilogram.
- Ounce.
- Pound.

Accepted non-mass units only when a verified gram weight exists:

- Food-specific household portion.
- Measured serving.
- Measured spoon, cup or piece tied to the exact profile.

Prohibited:

- Generic cup-to-gram lookup.
- Generic tablespoon-to-gram lookup.
- Assuming one millilitre equals one gram for oils, powders or mixed foods.
- Estimating a handful, bowl or plate without a recorded gram weight.

### 9.2 Nested recipes

A component recipe may be used as an ingredient only when:

- A specific immutable recipe version is selected.
- The component has a valid per-gram nutrient calculation.
- The used amount resolves to grams or measured servings.
- Circular recipe dependencies are blocked.
- Maximum nesting depth is three levels in Phase 11.

## 10. Recipe-yield model

### 10.1 Yield modes

| Mode | Use | Quality implication |
| --- | --- | --- |
| Analysed source | A trusted source provides analysed recipe composition and serving weight. | Highest source quality when licence and identity match. |
| Measured final weight | User or editor weighs the complete edible final batch. | Preferred calculated method. |
| Measured servings | Batch is divided into measured servings with known gram weight. | Strong when serving weights reconcile with batch weight. |
| Estimated ingredient sum | Final weight is assumed to equal ingredient gram weights. | Allowed only for no-cook or no-loss mixtures; flagged estimated. |
| Serving count only | Serving count exists but serving grams are unknown. | Per-serving totals may be shown; per-100-g values unavailable. |
| Unavailable | Yield cannot be determined. | Nutrition density and serving values blocked. |

### 10.2 Final-weight rules

- Final batch weight means edible food after cooking, draining and discarded inedible matter.
- Container weight must be excluded.
- If the batch loses or gains water, the measured final weight controls nutrient density.
- Measured batch weight and total measured serving weights must reconcile within a configurable tolerance, default 2%.
- A user may save outside tolerance only after recording a reason; calculation quality is downgraded.

### 10.3 Yield factor

```text
yield factor = final edible cooked weight / total relevant pre-cooking edible weight
```

The factor documents concentration or dilution. It does not by itself model vitamin or mineral retention.

## 11. Recipe nutrient-calculation methods

### 11.1 Preferred calculation order

1. Use an authoritative analysed composite-recipe record when the recipe identity and preparation match.
2. Otherwise use exact ingredient profiles matching the state actually added.
3. Correct for source-backed refuse or drained weight where necessary.
4. Sum each ingredient's nutrient amount.
5. Apply approved retention factors only to eligible raw-to-cooked transformations.
6. Apply measured final yield to calculate nutrient density.
7. Calculate per serving from measured serving weight or reconciled serving count.
8. Preserve every input, factor, source and status in the recipe-version snapshot.

### 11.2 Base ingredient calculation

```text
ingredient nutrient amount = ingredient grams / 100 x nutrient value per 100 g
```

### 11.3 Retention adjustment

```text
retained nutrient amount = pre-cooking nutrient amount x retention factor
```

Rules:

- Factor 1.00 means 100% retained, not “no data.”
- Factors must be stored as decimals with source and release.
- Apply retention to nutrient amount before dividing by final batch weight.
- Never apply a factor to a profile already representing the same cooked state.
- Never invent a factor by averaging unrelated foods or cooking methods.
- If a factor is unavailable, preserve the unadjusted value only when the methodology explicitly allows it and label the nutrient calculation as limited; otherwise mark it unavailable.
- Retention factors are estimates and must not be presented as laboratory analysis.

### 11.4 Recipe density

```text
nutrient per 100 g = retained batch nutrient amount / final batch grams x 100
```

### 11.5 Per-serving calculation

```text
nutrient per serving = retained batch nutrient amount / number of servings
```

When serving weights vary, use measured individual serving weight rather than equal division.

### 11.6 Energy rule

- Sum canonical source energy from ingredient profiles.
- Do not replace source energy with a macro-derived estimate.
- Retain source energy methodology and statuses.
- If energy is unavailable for a material ingredient, recipe energy completeness is partial or unavailable.

### 11.7 Salt, water and cooking fat

- Added salt must be an explicit ingredient.
- Added water must be an explicit ingredient when it materially changes yield; it contributes no energy but affects batch weight.
- Oil added for frying must be represented by a measured absorbed amount, a source-backed yield model or an explicit uncertain estimate.
- Do not assume all cooking oil is consumed.
- Drained liquid or discarded cooking water must be represented in the method when it affects yield or nutrient loss.

## 12. Calculation-quality grades

| Grade | Meaning |
| --- | --- |
| A | Authoritative analysed composite recipe with matching preparation and serving weight. |
| B | Verified ingredient profiles, measured final yield, complete source-backed factors where required. |
| C | Verified ingredient profiles and measured yield, but some cooking-retention factors unavailable or estimated. |
| D | Verified ingredient profiles with estimated yield or incomplete serving measurement. |
| E | Unresolved ingredients, missing material nutrient data or unusable yield; totals partial or unavailable. |

Grades communicate calculation confidence only. They are not a health score.

## 13. Missing data and completeness

For every nutrient, record:

- Known batch total.
- Per-100-g value when available.
- Per-serving value when available.
- Number and gram share of quantified ingredients.
- Number and gram share of trace or unavailable ingredients.
- Measured, calculated, imputed and estimated contribution flags.
- Retention-factor coverage.
- Completeness state: complete, partial, unavailable or not applicable.

Recommended completeness calculation:

```text
mass coverage = grams of ingredients with quantified nutrient values / total nutritive ingredient grams x 100
```

Mass coverage is a documentation metric, not proof of physiological adequacy.

Material ingredients that lack nutrition data must be visible in the calculation report.

## 14. Recipe scaling

### 14.1 Scaling rule

```text
scale factor = desired servings / original servings
scaled ingredient quantity = original quantity x scale factor
```

### 14.2 Rounding

- Preserve exact internal values.
- Display mass to a practical precision appropriate to the quantity.
- Do not round each ingredient before the nutrient calculation.
- Allow the user to mark ingredients as `round_manually`, such as eggs or packaged units.
- Show both calculated and practical rounded quantities.
- Do not claim that cooking time, pan size, leavening or seasoning scales linearly.

### 14.3 Scaled recipe status

Scaling creates a planning view, not a new recipe version, unless the user saves changes as a version.

## 15. Instructions, equipment and food safety

Required instruction-step fields:

- Step number.
- Instruction text.
- Optional timer.
- Optional equipment.
- Optional temperature or doneness note.
- Optional safety source.

Food-safety rules:

- Safety statements must cite authoritative sources.
- The application may display general clean, separate, cook and chill guidance.
- Perishable prepared food should be refrigerated or frozen promptly under the current official two-hour rule, or one hour above 32 C/90 F.
- Refrigerator guidance may state 4 C/40 F or below; freezer guidance may state -18 C/0 F or below.
- Leftover reheating guidance may state 74 C/165 F when applicable.
- Recipe-specific safe internal temperatures must come from a reviewed official source.
- The app must not infer safety from colour, texture or appearance.
- Safety notes do not replace user judgment or official local guidance.

## 16. Allergen and dietary information

### 16.1 Allergen derivation

Allergen tags may be derived from declared ingredients and user-entered metadata.

Required states:

- Contains.
- May contain or uncertain.
- Not declared in recorded ingredients.
- Unknown.

Never display “allergen free” as a guarantee unless a qualified controlled source supports that claim. Cross-contamination cannot be inferred from a recipe ingredient list.

### 16.2 Dietary tags

Supported informational tags may include:

- Vegetarian.
- Vegan.
- Contains egg.
- Contains dairy.
- Contains fish.
- Contains shellfish.
- Contains gluten ingredients.
- Contains peanuts.
- Contains tree nuts.
- Contains soy.
- Contains sesame.

Tags are filter metadata, not medical certification.

### 16.3 User exclusions

The user may create local exclusion lists. The app must:

- Warn when an explicitly declared ingredient matches an exclusion.
- Show unknown status when ingredient data is incomplete.
- Never guarantee that a plan is medically safe.

## 17. Recipe-detail interface

Required sections:

- Title, description, source and version.
- Yield, serving size and calculation grade.
- Preparation, cooking and total time.
- Ingredients with gram weights and source states.
- Instructions.
- Batch, per-100-g and per-serving nutrition.
- Nutrient completeness.
- Applied yield and retention factors.
- Dietary and allergen information.
- Equipment.
- Storage and food-safety notes.
- Version history for local recipes.
- Add to meal plan.
- Log consumed in Phase 10.
- Export recipe JSON or print-friendly view.

A calculation-details drawer must show the complete arithmetic and source snapshots.

## 18. Recipe search and filters

Required search fields:

- Recipe title.
- Ingredient aliases.
- Cuisine.
- Meal type.
- Dietary tags.
- Equipment.

Required filters:

- Published or local.
- Meal type.
- Preparation time.
- Cooking time.
- Difficulty.
- Dietary tags.
- Declared allergens.
- Equipment.
- Calculation grade.
- Source type.

Sort options:

- Name.
- Recently added.
- Preparation time.
- Energy per serving.
- Protein per serving.

Nutrition sorting must exclude recipes with unavailable comparison values rather than treating them as zero.

## 19. Meal-plan model

A meal plan has a stable identity and immutable versions.

Required plan identity fields:

- Meal-plan ID.
- Current version ID.
- Title.
- Status: active or archived.
- Created and updated timestamps.

Required plan-version fields:

- Version ID and version number.
- Start date and number of days, 1-28.
- Time zone.
- Phase 09 target snapshot, optional.
- Phase 08 reference snapshot, optional.
- Meal-slot configuration snapshot.
- Planned meals and items.
- Batch and leftover allocations.
- Dietary preferences and exclusions.
- Planned nutrient summary and completeness.
- Grocery-list reference.
- Created timestamp and revision reason.

## 20. Meal-plan items

A planned item may be:

- A specific recipe version and serving quantity.
- A published Phase 07 food profile and gram quantity.
- A Phase 10 custom-food revision.
- A manual placeholder with no nutrient calculation.

Every calculated planned item must store:

- Exact source-version snapshot.
- Quantity and gram weight.
- Planned nutrient snapshot.
- Date and meal slot.
- Optional note.
- Optional leftover allocation.
- Logged-to-Phase-10 state, without storing the consumed-entry value as canonical plan data.

Placeholders reduce completeness and must not be interpreted as zero intake.

## 21. Manual meal-plan builder

The builder must support:

- One to twenty-eight days.
- Drag or keyboard-based move between dates and meal slots.
- Add recipe serving.
- Add canonical food.
- Duplicate meal.
- Copy day.
- Repeat selected days.
- Adjust serving quantity.
- Remove item.
- Add note or placeholder.
- Review planned totals.
- Review grocery requirements.
- Save as a new immutable version.

Accessibility must provide non-drag alternatives for every operation.

## 22. Reviewed meal-plan templates

### 22.1 Template policy

A template may be published only when:

- Every recipe and food version is published and available.
- Energy and macro totals fall within the declared target band.
- Nutrient completeness is displayed.
- Dietary tags and exclusions are reviewed.
- The plan has a source and editorial review date.
- The template is not described as treatment for a disease.
- The plan has substitution guidance.

### 22.2 Template matching

A deterministic matcher may filter templates by:

- Target energy band.
- Diet preference.
- Days.
- Meals per day.
- Cooking time.
- Equipment.
- Budget category.
- Cuisine preference.
- Explicit exclusions.

The matcher must show why a template matches. It must not generate a new menu.

### 22.3 Template boundaries

- No claim that a template is optimal.
- No automatic use for pregnancy, children or medical conditions.
- No guarantee that all micronutrient needs are met.
- No substitution without recalculating totals.

## 23. Target comparison

### 23.1 Phase 09 binding

A meal-plan version may snapshot one Phase 09 plan:

- Energy target.
- Protein range and planning point.
- Fat target or range.
- Carbohydrate target.
- Fibre benchmark.
- Formula and reference-data versions.

### 23.2 Comparison language

Use:

- Planned.
- Selected target.
- Difference.
- Within selected range.
- Below or above selected planning point.
- Data incomplete.

Do not use:

- Perfect diet.
- Bad day.
- Cheat meal.
- Metabolism reset.
- Detox.
- Guaranteed muscle gain or fat loss.

### 23.3 Daily and weekly summaries

Display:

- Planned energy and macros by day.
- Average across selected days.
- Range and variability.
- Nutrient completeness.
- Major contributors.
- Unresolved items.

A target comparison is invalid when the planned data are materially incomplete.

## 24. Micronutrient reference comparison

- Reuse Phase 08 framework semantics.
- Freeze the reference profile in the plan version.
- Display planned known total and completeness.
- Do not label a low planned value as a deficiency.
- Do not label an above-reference value as toxicity.
- Respect food-only, total-intake and supplement-specific scope.
- Treat one planned week as an estimate, not a clinical assessment.

## 25. Batch preparation and leftovers

### 25.1 Batch instance

A batch instance represents planned production of a recipe version.

Required fields:

- Batch ID.
- Recipe-version ID.
- Planned production date.
- Planned servings or batch multiplier.
- Total available serving equivalents.
- Assigned servings by meal-plan item.
- Remaining servings.
- Optional storage note.

### 25.2 Allocation rules

- Assigned servings may not exceed available servings.
- Editing the recipe version does not alter an existing batch instance.
- Scaling a batch updates grocery requirements and planned nutrient snapshots only in a new meal-plan version.
- A leftover item is an allocation from the same batch, not a duplicate recipe production.
- Log consumed servings independently in Phase 10.

## 26. Grocery-list generation

### 26.1 Generation source

A grocery list is generated from one immutable meal-plan version.

### 26.2 Merge key

Merge ingredient requirements only when all relevant fields match:

- Canonical food ID.
- Composition-profile/state ID.
- Preparation state.
- Ingredient role that affects purchasing, when relevant.
- Unit basis.

Do not merge:

- Raw rice with cooked rice.
- Whole milk with skim milk.
- Fresh spinach with frozen spinach.
- Drained canned beans with dry beans.
- Canonical foods with unresolved text ingredients.

### 26.3 Required grocery item fields

- Grocery item ID.
- Merge key.
- Display name.
- Required gram amount.
- Optional practical purchase quantity.
- Source recipe references.
- Store section.
- Pantry/on-hand amount.
- Remaining amount to buy.
- Purchased state.
- Note.
- Data-quality flags.

### 26.4 Practical purchase quantities

Package or piece suggestions may be shown only when:

- A verified package size or piece weight exists; or
- The user enters a local package size.

The app must not invent package sizes or market prices.

### 26.5 Regeneration

When the meal plan changes:

- The current list remains tied to its original plan version.
- Offer generation of a new list.
- Preserve manually entered pantry and purchase states where merge keys still match, after user confirmation.

## 27. Meal-plan and recipe logging into Phase 10

### 27.1 Explicit action

Planning never equals consumption. Logging requires an explicit action.

### 27.2 Recipe-entry snapshot

A Phase 10 recipe entry must include:

- Recipe ID and immutable version ID.
- Recipe title snapshot.
- Serving quantity and grams.
- Calculation grade.
- Nutrient snapshot per logged amount.
- Source and methodology versions.
- Planned-item reference, optional.

### 27.3 Historical integrity

- Later recipe edits do not change Phase 10 entries.
- Later meal-plan edits do not change Phase 10 entries.
- A user may explicitly replace a logged entry with a newer recipe version, creating an audit record.

## 28. IndexedDB storage model

Required stores:

1. `recipeIdentities`.
2. `recipeVersions`.
3. `mealPlanIdentities`.
4. `mealPlanVersions`.
5. `batchInstances`.
6. `groceryLists`.
7. `recipeFavourites`.
8. `mealPlanPreferences`.
9. `recipeMealAuditLog`.
10. `recipeMealMigrationState`.

Useful indexes:

- Recipe ID.
- Current version ID.
- Recipe title normalization.
- Recipe status.
- Recipe dietary tags.
- Meal-plan start date.
- Meal-plan active status.
- Grocery-list plan-version ID.
- Batch recipe-version ID.
- Updated timestamp.

All multi-record saves must use one transaction. Derived nutrient summaries are rebuildable caches and must not be the only record of the calculation.

## 29. Backup, restore and export

### 29.1 JSON backup

Include:

- Preferences.
- Local recipe identities and versions.
- Meal-plan identities and versions.
- Batch instances.
- Grocery lists.
- Favourites.
- Audit records.
- Schema version.
- Formula/reference-data versions.
- Export timestamp.

Do not duplicate static published recipe or canonical food datasets. Store stable references and immutable local snapshots where required.

### 29.2 Restore

- Validate schema before writing.
- Preview counts and conflicts.
- Support keep-existing, import-as-copy and replace-locally modes.
- Never overwrite silently.
- Restore in a transaction.
- Rebuild derived summaries.
- Report unresolved canonical references without deleting the imported version snapshot.

### 29.3 CSV exports

Provide:

- Recipe ingredient export.
- Recipe nutrition export.
- Meal-plan calendar export.
- Meal-plan nutrient summary export.
- Grocery-list export.

Preserve IDs, versions, units, statuses, source references and completeness flags.

## 30. Privacy and network behavior

- Personal recipes, notes, plans and grocery lists stay in IndexedDB.
- No runtime request may transmit personal meal plans or recipes.
- Static published content may be bundled with the application.
- External source links open only after user action.
- Backup parsing and export generation occur locally.
- No analytics payload may contain recipe titles, ingredients, exclusions, notes or plan targets.

## 31. Responsive behavior

### Mobile

- Recipe ingredients and steps use a single-column layout.
- Add ingredient and add meal actions remain reachable with one thumb.
- Meal-plan days use horizontal date navigation or accessible day tabs.
- Grocery items have large check targets.
- Calculation details use full-screen sheets.

### Desktop

- Recipe builder may use ingredients, calculation and preview columns.
- Meal plan may use a seven-day grid with a keyboard-accessible list alternative.
- Grocery list may use category columns or a sortable table.

Tables must collapse into labelled cards below their minimum readable width.

## 32. Accessibility requirements

- Meet WCAG 2.2 AA requirements inherited from Phase 01.
- Every drag action has move-up, move-down and move-to controls.
- Recipe calculation grades are not communicated by colour alone.
- Timers and dynamic totals use appropriate live-region behavior without excessive announcements.
- Form errors identify the exact ingredient or yield field.
- Tables have headers and captions.
- Icons have accessible names.
- Keyboard focus is preserved after adding, moving or deleting items.
- Print views preserve heading hierarchy and readable contrast.

## 33. Performance requirements

- Recipe catalogue search should respond within 100 ms after local index load for the initial dataset target.
- Recipe recalculation should complete within 100 ms for 100 ingredient lines on a representative modern device.
- A 28-day plan with 12 items per day must remain usable without blocking the main thread.
- Use memoized pure calculation functions and rebuildable indexes.
- Do not load full nutrient-detail panels until requested.
- Large exports may use a worker, but all data must remain local.

## 34. Required pure domain functions

Implement and test pure functions equivalent to:

- `convertExactMassToGrams`.
- `resolveVerifiedPortionGrams`.
- `calculateIngredientNutrients`.
- `applyRetentionFactor`.
- `calculateYieldFactor`.
- `calculateRecipeBatchTotals`.
- `calculateRecipePer100g`.
- `calculateRecipePerServing`.
- `calculateRecipeCompleteness`.
- `gradeRecipeCalculation`.
- `scaleRecipe`.
- `detectCircularRecipeDependency`.
- `calculateMealPlanDayTotals`.
- `calculateMealPlanAverage`.
- `comparePlanWithTarget`.
- `allocateBatchServings`.
- `aggregateGroceryRequirements`.
- `buildRecipeLogSnapshot`.
- `validateRecipeBackup`.
- `planRecipeRestoreConflicts`.

No calculation function may read current canonical data implicitly. All inputs and versions must be explicit.

## 35. Required tests

### 35.1 Unit tests

- Exact mass conversion.
- Verified portion conversion.
- No-cook recipe sum.
- Measured-yield density.
- Retention-factor application.
- Double-retention prevention.
- Missing nutrient propagation.
- Trace handling.
- Per-serving calculation.
- Recipe scaling.
- Practical rounding does not affect internal totals.
- Nested recipe calculation.
- Circular dependency rejection.
- Target comparison.
- Batch allocation.
- Grocery merge and non-merge rules.
- Historical version freeze.

### 35.2 Integration tests

- Create and version a local recipe.
- Add recipe to meal plan.
- Generate grocery list.
- Log a recipe serving to Phase 10.
- Update canonical Phase 07 source data and confirm historical recipe versions remain unchanged.
- Edit a recipe and confirm existing meal plans remain on the old version.
- Backup and restore with conflicts.
- Rebuild derived summaries.

### 35.3 End-to-end tests

- Create recipe from verified foods, weigh yield, save and view nutrition.
- Build seven-day plan, assign leftovers and generate list.
- Use a reviewed template and inspect matching reasons.
- Log one planned serving into Phase 10.
- Use keyboard-only meal-plan editing.
- Verify dark mode, 320-pixel mobile layout and print view.

### 35.4 Privacy tests

- Inspect runtime requests while creating recipes and plans.
- Confirm exports are local.
- Confirm no personal payload reaches analytics, logs, AI or storage services.

## 36. Blocking acceptance criteria

Phase 11 fails if any of the following occurs:

- An ingredient nutrient value is invented.
- Missing nutrient data is treated as zero.
- A generic volume-to-mass conversion is used.
- A cooked profile receives the same cooking retention adjustment again.
- A retention factor lacks source, food-group, method or nutrient scope.
- A recipe with unresolved material ingredients is presented as complete.
- Editing a recipe changes an older meal plan or Phase 10 log.
- A planned meal is automatically marked consumed.
- Grocery aggregation merges incompatible food states.
- A template is generated by AI or presented as medical treatment.
- The app claims allergen-free safety from an ingredient list.
- Copied recipe text or media lacks reuse rights.
- Personal data is sent remotely.
- Authentication or backend infrastructure is added.

## 37. Required documentation files in the repository

Lovable must create or update:

- `docs/phase-11-recipes-meal-plans.md`.
- `docs/recipe-calculation-methodology.md`.
- `docs/recipe-versioning.md`.
- `docs/meal-plan-methodology.md`.
- `docs/grocery-list-rules.md`.
- `docs/food-safety-and-allergen-boundaries.md`.
- `docs/phase-11-data-dictionary.md`.
- `docs/phase-11-test-matrix.md`.
- `docs/phase-11-source-registry.md`.
- `docs/phase-11-backup-restore.md`.

## 38. Required source and licence metadata

Every public recipe and media asset must record:

- Source title.
- Publisher or author.
- Source URL or identifier.
- Access or review date.
- Licence or permission basis.
- Whether adaptation occurred.
- Attribution text when required.
- Reviewer.
- Publication status.

Ingredient nutrient sources remain linked through Phase 07 snapshots.

## 39. Evidence and technical sources

1. FAO, calculation of dishes prepared from recipes: `https://www.fao.org/4/y4705e/y4705E23.htm`
2. FAO, calculation of composite prepared dishes: `https://www.fao.org/4/y4705e/y4705e15.htm`
3. FAO/INFOODS recipe resources: `https://www.fao.org/infoods/infoods/recipes/en/`
4. FAO/INFOODS standards and guidelines: `https://www.fao.org/infoods/infoods/standards-guidelines/en/`
5. USDA Table of Nutrient Retention Factors, Release 6: `https://www.ars.usda.gov/northeast-area/beltsville-md-bhnrc/beltsville-human-nutrition-research-center/methods-and-application-of-food-composition-laboratory/mafcl-site-pages/nutrient-retention-factors/`
6. USDA FNDDS documentation and cooking-yield resources: `https://www.ars.usda.gov/northeast-area/beltsville-md-bhnrc/beltsville-human-nutrition-research-center/food-surveys-research-group/docs/fndds-download-databases/`
7. USDA FoodData Central documentation: `https://fdc.nal.usda.gov/data-documentation/`
8. Dietary Guidelines for Americans, 2025-2030 resources: `https://www.realfood.gov/`
9. USDA MyPlate weekly meal-planning guidance: `https://www.myplate.gov/eathealthy/budget/budget-weekly-meals`
10. FDA food storage guidance: `https://www.fda.gov/consumers/consumer-updates/are-you-storing-food-safely`
11. FDA food safety in the kitchen: `https://www.fda.gov/food/buy-store-serve-safe-food/food-safety-your-kitchen`
12. MDN IndexedDB API: `https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API`
13. W3C WCAG 2.2: `https://www.w3.org/TR/WCAG22/`
14. Lovable Plan mode: `https://docs.lovable.dev/features/plan-mode`
15. Lovable Project Knowledge: `https://docs.lovable.dev/features/knowledge`

## 40. Explicitly deferred

- AI recipe generation.
- AI meal-plan generation.
- Restaurant meal estimation.
- Barcode lookup.
- Image-based recipe import.
- Automatic web-recipe scraping.
- Live grocery prices.
- Store integration and delivery ordering.
- Shared household accounts.
- Cloud synchronization.
- Clinical and disease-specific diets.
- Pregnancy, lactation and paediatric plans.
- Food-allergy certification.
- Supplement schedules.
- Automatic pantry scanning.
- Automatic target adjustment.
- Long-term adherence scoring.

## 41. Definition of done

The phase is done only after Lovable:

1. Implements the approved Plan-mode scope.
2. Passes every attached calculation and integrity vector.
3. Demonstrates measured-yield and retention calculations with full provenance.
4. Demonstrates that missing values are not zero.
5. Demonstrates that cooked profiles are not adjusted twice.
6. Demonstrates immutable recipe and meal-plan history.
7. Demonstrates conservative grocery aggregation.
8. Demonstrates explicit Phase 10 logging.
9. Demonstrates no remote personal-data transmission.
10. Passes mobile, desktop, print and accessibility checks.
11. Produces the required repository documentation.
12. Produces a final acceptance matrix with no blocking failure.
13. Creates the GitHub checkpoint `phase-11-recipes-meal-plans-complete`.
