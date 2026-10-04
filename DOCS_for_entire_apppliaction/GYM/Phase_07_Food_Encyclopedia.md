# Phase 07 — Food Encyclopedia

**Project:** Fitness OS  
**Document type:** Lovable implementation specification  
**Version:** 1.0  
**Date:** 5 August 2026  
**Status:** Ready for Plan-mode review  
**Depends on:** Phases 00 and 01  
**Provides data contracts to:** Phases 08, 09, 10, 11, 12 and 15

---

## 0. How to use this phase

1. Keep the Phase 00 Project Knowledge active.
2. Confirm Phase 01 shell, theme, route and accessibility foundations still work.
3. Attach this Markdown specification.
4. Attach `Phase_07_Food_Data_Schema.json`.
5. Attach `Phase_07_Seed_Food_Taxonomy.json`.
6. Attach `Phase_07_Lovable_Prompt_Package.txt`.
7. Run the Phase 07 Plan-mode prompt before allowing code changes.
8. Reject any plan that adds authentication, a remote database, an exposed API key, fabricated nutrient values or unlicensed bulk data.
9. Approve only the Food Encyclopedia scope.
10. Run the Agent-mode prompt.
11. Run the verification prompt and correct every failure.
12. Create the GitHub checkpoint `phase-07-food-encyclopedia-complete`.

## 1. Phase objective

Build a searchable, source-transparent and mobile-first Food Encyclopedia that can eventually hold thousands of verified food-composition profiles without depending on a runtime API.

The phase must deliver:

- A food catalogue.
- Food detail pages.
- Raw, cooked and processed profile separation.
- A standardized per-100-gram edible-portion view.
- Optional source-backed household portions.
- Macronutrient, vitamin and mineral tables.
- Explicit missing, trace, not-detected, estimated and measured states.
- Food comparison.
- Search, aliases, regional names, categories and filters.
- Data-source and release visibility.
- A static-data ingestion contract for USDA and other rights-cleared sources.
- A rights-safe workflow for Indian food research.
- Validation, review and publication gates.
- No diet prescription, daily intake target or meal logging in this phase.

The Food Encyclopedia is a composition reference. It answers “what verified components are reported in this food and under which state and source?” It does not answer “how much should this person eat?”

## 2. Non-negotiable product decisions

- No signup, login, profile, cloud account or subscription.
- No Supabase, Firebase, Lovable Cloud database or remote personal-data store.
- No runtime USDA API dependency in the first implementation.
- No API key in browser code or GitHub.
- Repository-owned, preprocessed JSON is the production data source.
- USDA FoodData Central CC0 data is the preferred distributable composition source.
- Indian food identities are included, but ICMR-NIN data must not be scraped or bulk redistributed without confirmed permission.
- Every nutrient value must retain provenance.
- Missing values are never converted to zero.
- Raw and cooked foods are separate composition profiles.
- Daily values and intake recommendations are disabled until Phase 08.
- Food logging and calorie tracking are excluded until Phase 10.
- Recipes and mixed-dish calculations are excluded until Phase 09.

## 3. Dependencies and ownership

| Concept | Owning phase | Phase 07 rule |
| --- | --- | --- |
| Application shell and design system | Phase 01 | Reuse; do not redesign. |
| Nutrient definitions and intake guidance | Phase 08 | Use stable nutrient IDs only; do not add RDA, EAR, UL or deficiency advice. |
| Diet calculators and targets | Phase 09 | Do not calculate personal needs here. |
| Nutrition logging | Phase 10 | Provide stable food/profile/portion contracts only. |
| Recipes and meal plans | Phase 09 | Do not treat recipes as single foods in this phase. |
| Analytics | Phase 11 | Expose clean data only; no advanced trends here. |
| Global backup/export | Phase 12 | Static encyclopedia data is versioned in Git; no personal backup required. |

## 4. Required routes

| Route | Purpose |
| --- | --- |
| `/foods` | Searchable food catalogue. |
| `/foods/$slug` | Food identity and selected composition profile. |
| `/foods/compare` | Compare two to four verified profiles. |
| `/foods/categories/$categoryId` | Category-focused catalogue view. |
| `/foods/sources` | Explain source systems, releases, quality states and licensing. |
| `/foods/methodology` | Explain basis, units, missing data, matching and review rules. |

Invalid slugs, missing profiles and deprecated records must show recoverable states instead of crashing.

## 5. Information architecture

The primary Food Encyclopedia navigation must expose:

- Browse all foods.
- Fruits.
- Vegetables.
- Leafy greens.
- Legumes and pulses.
- Grains, cereals and millets.
- Nuts and seeds.
- Dairy and eggs.
- Meat and poultry.
- Fish and seafood.
- Fats and oils.
- Spices and herbs.
- Beverages.
- Fungi and algae.
- Sweeteners.
- Compare foods.
- Sources and methodology.

Do not create a “healthy” or “unhealthy” category. Those labels are reductive, context-dependent and not composition categories.

## 6. Food identity model

A food identity represents a recognizable food concept such as Apple, Spinach, Chickpea or Paneer.

Required identity fields:

- Stable ID.
- Stable slug.
- Canonical English name.
- Aliases.
- Regional names with language metadata where available.
- Optional scientific name after verification.
- Category and subgroup.
- Dietary and allergen tags.
- Publication status.
- Composition completeness status.
- Default composition profile.
- Search terms.
- Source priority.
- Media with rights metadata.
- Editorial review metadata.

An identity must not contain a single blended nutrient table when raw, boiled, dried or other states differ.

## 7. Composition-profile model

A composition profile represents one source-backed state of a food, such as:

- Apple, raw, with skin.
- Spinach, raw.
- Spinach, boiled and drained.
- Chickpea, dry.
- Chickpea, cooked and drained.
- Milk, whole, pasteurized.
- Chicken breast, roasted, skinless.

Every profile requires:

- Stable profile ID.
- Display label.
- Food state.
- Processing level.
- Preparation notes.
- `per_100g_edible_portion` basis.
- Edible-portion metadata.
- Nutrient measurements.
- Portion weights.
- Source records.
- Profile review status.

Profiles from materially different sources must not be averaged automatically.

## 8. Standard basis and serving behavior

### 8.1 Canonical basis

The canonical comparison basis is **100 grams of edible portion**.

Every nutrient value stored in the production dataset must be normalized to the canonical unit defined by the nutrient registry.

### 8.2 Portion display

A user may switch from 100 grams to a source-backed serving such as one cup, one fruit, one tablespoon or one egg.

A portion requires:

- Portion ID.
- Human-readable label.
- Gram weight.
- Source or measurement status.
- Source record ID.
- Optional note.

Do not invent household weights. If a reliable portion is unavailable, keep the 100-gram view and allow a custom gram calculator without saving personal data.

### 8.3 Scaling

Scaled values are calculated from the canonical 100-gram profile using full stored precision. Round only for display.

## 9. Nutrient registry

Phase 07 uses the stable nutrient IDs in the attached reference data. Phase 08 owns the educational definitions and intake guidance.

Core groups shown in the Food Encyclopedia:

- Energy and water.
- Protein, carbohydrate, fibre, sugars and total fat.
- Saturated, monounsaturated and polyunsaturated fat where available.
- Omega-3, omega-6 and cholesterol where available.
- Sodium, potassium, calcium, iron, magnesium, phosphorus, zinc, copper, manganese, selenium and iodine.
- Vitamins A, B1, B2, B3, B5, B6, B7, B9, B12, C, D, E and K.
- Choline where available.

Do not claim that a source measured every listed nutrient.

## 10. Nutrient-value states

Every displayed nutrient row must distinguish:

| State | Meaning | Display rule |
| --- | --- | --- |
| `measured` | Analytical or directly reported measurement. | Show value and source state. |
| `calculated` | Calculated by the source using documented components or factors. | Show value with calculated badge. |
| `imputed` | Filled by the source from related data. | Show with imputed badge and explanation. |
| `estimated` | Estimated during controlled compilation. | Show with estimate badge; never present as measured. |
| `trace` | Present below normal reporting precision. | Show “Trace”; do not show zero. |
| `not_detected` | Source reports below detection or non-detect. | Show “Not detected”; do not infer absence. |
| `not_available` | Not measured, not reported or unusable. | Show em dash or “Not available.” |

A numeric zero is allowed only when the source explicitly reports zero or a validated transformation preserves a source zero.

## 11. Source hierarchy

### 11.1 Preferred distributable sources

1. USDA FoodData Central Foundation Foods, current pinned release.
2. USDA FNDDS for relevant prepared foods and portions.
3. USDA SR Legacy only when a newer suitable profile is unavailable.
4. Other national or FAO/INFOODS datasets only after rights and field definitions are reviewed.

### 11.2 Indian Food Composition Tables

ICMR-NIN IFCT/NVIF 2017 is an important Indian reference. However, the official NIN website states that reproduction, distribution and automated scraping require prior written permission.

Therefore:

- Do not scrape the NIN website.
- Do not bulk copy IFCT tables into repository data without written permission or a verified reusable license.
- Use IFCT for manual research, identity matching and validation only unless rights are cleared.
- Keep Indian foods as draft identities when no rights-cleared composition profile exists.
- Never substitute a “similar” USDA food without marking the match as `close_match` and explaining the limitation.

## 12. Static ingestion architecture

The production application must not call FoodData Central during normal use.

Required pipeline:

```text
Pinned source download
        ↓
Offline transform script
        ↓
Food matching and normalization
        ↓
Schema validation
        ↓
Editorial review report
        ↓
Repository JSON shards
        ↓
Static search index
        ↓
Lovable-built UI
```

Suggested repository structure:

```text
data/
  foods/
    index.json
    categories.json
    shards/
      fruits-a-f.json
      fruits-g-z.json
      vegetables.json
      legumes-pulses.json
      grains-millets.json
      animal-foods.json
      oils-spices-other.json
  nutrients/
    registry.json
  sources/
    food-source-registry.json
    releases.json
scripts/
  food-data/
    import-fdc.ts
    normalize-foods.ts
    validate-foods.ts
    build-food-search-index.ts
reports/
  food-data-validation.json
```

Lovable may create the pipeline interfaces and scripts, but it must not fabricate production output.

## 13. Source-release pinning

Every build must pin source releases, for example USDA Foundation Foods April 2026.

Required release metadata:

- Source ID.
- Release name.
- Release date.
- Download date.
- Original file checksum.
- Transform-script version.
- Output dataset version.
- Record counts.
- Validation result.
- Licence note.

Do not silently replace a release during a normal application build.

## 14. Food matching

Food matching is a controlled editorial operation.

Required match types:

- `exact` — description and state match the intended food.
- `close_match` — usable but not identical; must show limitation.
- `compiled` — values assembled from multiple allowed records with documented rules.
- `manual_entry` — manually entered from a rights-cleared source.

Matching must consider:

- Species or variety when known.
- Raw versus cooked.
- Edible portion.
- Skin, seed, bone or refuse.
- Moisture state.
- Fortification.
- Added salt, sugar or fat.
- Preparation method.
- Geography and market relevance.

Do not match solely by name similarity.

## 15. Duplicate control

The ingestion pipeline must detect:

- Duplicate stable IDs.
- Duplicate slugs.
- Multiple identities with normalized identical names.
- Aliases colliding with another canonical name.
- Profiles that point to the same external source record.
- Raw and cooked records accidentally merged.
- Branded and generic foods accidentally merged.

Potential duplicates must enter a review queue, not automatic deletion.

## 16. Food catalogue UX

The `/foods` catalogue must provide:

- Search.
- Category and subgroup filters.
- Food-state filter.
- Plant/animal classification filter.
- Allergen filter.
- Data-completeness filter.
- Source filter.
- Alphabetical sort.
- Optional sort by calories, protein, fibre or selected nutrient only when comparable verified values exist.
- URL-persisted filter state.
- Clear-all action.
- Result count.
- Pagination or virtualization.

Cards or rows must show:

- Food name.
- Selected profile label.
- Category.
- State.
- Calories, protein, carbohydrate, fat and fibre when available.
- Data-completeness indicator.
- Primary source and release.

Do not show made-up values to fill a uniform card layout.

## 17. Search behavior

Search must match:

- Canonical name.
- Alias.
- Regional name.
- Source description.
- Category and subgroup.

Search requirements:

- Typo-tolerant but deterministic.
- Accent and case insensitive.
- Alias matches labelled as aliases.
- No network request.
- Search index generated at build time.
- Results limited to published profiles in production.
- Draft identities available only in development or content-review tooling.

## 18. Food detail page

The detail page must contain:

1. Breadcrumbs.
2. Canonical name and aliases.
3. Category and dietary/allergen tags.
4. Profile selector.
5. State and preparation summary.
6. 100-gram/portion/custom-gram switcher.
7. Energy and macronutrient summary.
8. Full nutrient table grouped by type.
9. Missing-data and data-status explanation.
10. Portion table.
11. Source records and releases.
12. Data-quality notes.
13. Rights-cleared image when available.
14. Compare action.
15. Links to Phase 08 nutrient pages when those routes exist.

No daily-intake percentage is shown until Phase 08 provides a versioned reference system.

## 19. Nutrient table behavior

- Group rows into macronutrients, fats, minerals and vitamins.
- Keep canonical units visible.
- Show source state badges.
- Preserve “Trace,” “Not detected” and “Not available.”
- Allow “Show unavailable nutrients” toggle.
- Provide table-first desktop layout and stacked accessible mobile layout.
- Do not sort nutrients by “importance.”
- Do not make deficiency or treatment claims.

## 20. Food comparison

The comparison route supports two to four composition profiles.

Required behavior:

- Compare the same basis, default 100 grams.
- Allow a separate serving comparison only when every selected profile has a source-backed serving.
- Display state and source prominently.
- Highlight numeric differences without claiming a winner.
- Show missing values honestly.
- Prevent invalid comparison between a food identity with no profile and a verified profile.
- Persist selected IDs in a compact URL only; do not place personal data in the URL.

No automatic “better food” verdict is allowed.

## 21. Filters based on nutrient thresholds

Nutrient threshold filters such as “at least 10 g protein per 100 g” are permitted only when:

- The selected nutrient exists.
- The selected profile is published.
- Values use the same basis and unit.
- `not_available` values are excluded, not treated as zero.
- Estimated and imputed values can be included or excluded explicitly.

Qualitative labels such as “high protein” must not be generated without an approved rule and jurisdiction context.

## 22. Branded foods boundary

Branded foods are excluded from the Phase 07 MVP because:

- They change frequently.
- Label nutrient coverage is narrower.
- Product availability is regional.
- Duplicate and stale records are common.
- The local-first static app would require frequent updates.

The architecture may reserve a future `brand` profile type, but do not import the USDA Branded dataset now.

## 23. Mixed dishes and recipes boundary

- A single-ingredient cooked food may be a composition profile.
- A mixed dish with multiple ingredients belongs to Phase 09 recipes.
- A source-database mixed dish may be added later as a clearly labelled survey/composite food, not confused with a calculated recipe.
- Do not calculate restaurant or homemade dishes from names alone.

## 24. Images and licensing

Each media asset requires:

- Source URL or repository path.
- Licence.
- Attribution.
- Alt text.
- Rights verification status.

Do not use random search-engine images. Do not hotlink media without permission. A food page without a rights-cleared image is acceptable.

## 25. Data-quality checks

The validator must check:

- Schema validity.
- Stable ID and slug uniqueness.
- Valid category and subgroup relationships.
- Valid nutrient IDs and canonical units.
- Non-negative finite values.
- `null` value for `trace`, `not_detected` and `not_available` unless a source-specific numeric bound is documented.
- Required source record for every nutrient value and portion.
- Default profile exists.
- Published identity has at least one approved profile.
- Published profile has energy or documented reason for absence.
- Source release and citation are present.
- Food state and preparation are not contradictory.
- Edible portion is between zero and 100 when reported.
- Portion grams are positive.
- Min value does not exceed max value.
- Raw and cooked profiles are not accidentally identical copies without explanation.

## 26. Plausibility warnings

Plausibility checks produce review warnings, not automatic factual corrections.

Examples:

- Protein, fat or carbohydrate above 100 g per 100 g.
- Water above 100 g per 100 g.
- Sum of proximate components far outside an expected range.
- Energy inconsistent with reported energy-yielding components.
- Sodium/potassium unit mismatch.
- Vitamin values that differ by orders of magnitude between close matches.
- Portion weight outside a plausible range.

The source value must remain visible to reviewers. Never silently overwrite it with a calculated value.

## 27. Energy handling

- Preserve source-reported energy.
- Preserve whether energy is measured or calculated by the source.
- A separate compiler-calculated check may be used for validation.
- Do not replace source energy automatically.
- Show kcal by default; kJ may be displayed from a source value or controlled conversion.
- State the conversion method in methodology documentation.

## 28. Editorial publication gates

An identity may be published only when:

- Canonical name and aliases are reviewed.
- Category and subgroup are valid.
- At least one composition profile is approved.
- Every displayed value has provenance.
- Rights metadata is complete for any media.
- Source release is pinned.
- No unresolved blocking validation issue exists.

A profile may be published only when:

- Food state and edible basis are clear.
- Source record is accessible and rights-compatible.
- Units are normalized.
- Missing values are correctly represented.
- Numeric review is complete.
- A reviewer approves it.

## 29. Draft seed taxonomy behavior

The attached seed file contains **342 stable food identities** and no production nutrient values.

Lovable must:

- Load it for development taxonomy and search-shape testing.
- Keep identities marked `draft_identity` out of the public production catalogue.
- Never fabricate composition profiles.
- Never mark draft identities published automatically.
- Provide a developer/content-validation report showing draft, partial and publishable counts.

## 30. Source and methodology pages

### 30.1 `/foods/sources`

Explain:

- Which datasets are used.
- Release dates.
- Licence status.
- Data-type differences.
- Why some foods or nutrients are missing.
- How to report an error.

### 30.2 `/foods/methodology`

Explain:

- 100-gram edible-portion basis.
- Portion scaling.
- Raw/cooked separation.
- Nutrient status labels.
- Source matching.
- Unit normalization.
- Rounding.
- Comparison limitations.
- No intake advice in this module.

## 31. Empty and error states

Required states:

- No published foods yet.
- No result for search.
- Draft identity has no verified profile.
- Profile unavailable.
- Source record missing.
- Unsupported dataset version.
- Validation failed.
- Search index failed to load.
- Invalid comparison selection.
- Missing image.
- Deprecated profile.

Every state must explain what is missing and provide a safe next action.

## 32. Accessibility

- One H1 per route.
- Semantic search and filter form.
- Filter chips expose selected state and removal controls.
- Data tables use headers and captions.
- Mobile nutrient rows preserve label, value, unit and status association.
- Comparison differences are not conveyed by colour alone.
- Profile selector is keyboard operable.
- Tooltips are not the only source of definitions.
- Images have meaningful alt text.
- Reflow works at 320 px and 400% zoom.
- Focus remains visible in light and dark themes.
- Units use readable text, not inaccessible superscripts alone.

## 33. Responsive behavior

### Mobile

- Search remains prominent.
- Filters open in an accessible drawer.
- Food cards show only verified summary nutrients.
- Nutrient sections use stacked rows.
- Compare selection uses a sticky tray that never hides content.

### Tablet

- Catalogue may use two columns.
- Detail page may show profile controls beside summary.

### Desktop

- Catalogue may use table or grid mode.
- Detail page may use a sticky profile/source sidebar.
- Comparison table may scroll horizontally with frozen food-name headers.

## 34. Performance

- Support at least 10,000 food identities and 30,000 profiles.
- Do not load the full nutrient payload for every catalogue card.
- Use a compact catalogue index and lazy-load detail shards.
- Build the search index at compile time.
- Paginate or virtualize long catalogues.
- Avoid runtime network calls for canonical food content.
- Cache static shards through the normal application asset strategy.
- Keep comparison calculations client-side and deterministic.

## 35. Suggested TypeScript architecture

```text
src/
  features/foods/
    components/
    routes/
    domain/
      food-types.ts
      food-validation.ts
      food-scaling.ts
      food-comparison.ts
      food-search.ts
    data/
      load-food-index.ts
      load-food-profile.ts
      food-source-registry.ts
    tests/
  content/foods/
  docs/foods/
scripts/food-data/
```

Required domain functions:

- `validateFoodIdentity`
- `validateCompositionProfile`
- `scaleNutrientValue`
- `formatNutrientValue`
- `compareFoodProfiles`
- `buildFoodSearchIndex`
- `resolveFoodAlias`
- `getDataCompleteness`
- `getSourceBadge`

## 36. No runtime API requirement

The application must work with static repository data.

Lovable must not:

- Request a USDA API key.
- Place `DEMO_KEY` in production code.
- Fetch USDA data directly from the browser.
- Make the catalogue fail when offline.
- Add a backend solely to proxy food data.

An offline import script may be run manually during dataset updates.

## 37. Testing requirements

### 37.1 Domain tests

- Scaling from 100 g to arbitrary grams.
- Unit formatting.
- Trace/not-detected/not-available display.
- Missing values excluded from numeric sorts.
- Compare logic uses equal basis.
- Alias resolution.
- Raw/cooked separation.
- Profile publication gates.

### 37.2 Schema and data tests

- Validate every production record.
- Reject duplicate IDs and slugs.
- Reject invalid subgroup/category combinations.
- Reject nutrients with unsupported units.
- Reject published profiles without source records.
- Confirm draft seed file contains no nutrient measurements.

### 37.3 UI tests

- Catalogue search and filters.
- URL state restore.
- Profile switching.
- Portion switching.
- Custom gram scaling.
- Missing-data rendering.
- Food comparison.
- Source and methodology routes.
- Mobile filter drawer.

### 37.4 Accessibility tests

- Keyboard-only catalogue and compare flow.
- Screen-reader labels for nutrient rows.
- Focus order.
- Dialog/drawer focus management.
- Colour-independent data status.
- 320 px and 400% zoom reflow.

## 38. Required documentation outputs

Lovable must create or update:

- `docs/foods/food-encyclopedia.md`
- `docs/foods/data-model.md`
- `docs/foods/source-policy.md`
- `docs/foods/data-ingestion.md`
- `docs/foods/methodology.md`
- `docs/phases/phase-07.md`

The documentation must list exact source releases, licences and validation commands.

## 39. Acceptance criteria

- [ ] `/foods` loads without authentication or network food API calls.
- [ ] Only published, source-backed profiles appear in production.
- [ ] Draft identities remain hidden from public production views.
- [ ] Raw, cooked and processed profiles remain separate.
- [ ] Every numeric nutrient value exposes source provenance.
- [ ] Missing values are never rendered as zero.
- [ ] 100-gram scaling is correct.
- [ ] Source-backed portions scale correctly.
- [ ] Search resolves aliases and regional names.
- [ ] Filters and sorting exclude unavailable values correctly.
- [ ] Comparison uses equal bases and gives no “winner” verdict.
- [ ] Source and methodology pages explain limitations.
- [ ] No daily values, RDA, meal advice or personal diet targets appear.
- [ ] No ICMR-NIN scraping or unlicensed bulk IFCT reproduction exists.
- [ ] No API key appears in source code.
- [ ] Schema and seed validation pass.
- [ ] Mobile, desktop, light and dark themes pass.
- [ ] Accessibility checks pass.
- [ ] Earlier phases remain functional.

## 40. Lovable “do not modify” guardrails

Do not redesign the Phase 01 shell.  
Do not add authentication.  
Do not add a remote database.  
Do not expose or request a USDA API key.  
Do not fabricate food or nutrient values.  
Do not scrape ICMR-NIN.  
Do not merge raw and cooked profiles.  
Do not convert missing values to zero.  
Do not add diet prescriptions, daily values or meal logging.  
Do not import branded foods.  
Do not replace source-reported values silently.  
Do not publish draft seed identities.

## 41. Phase 08 handoff

Phase 07 provides Phase 08 with:

- Stable nutrient IDs.
- Canonical units.
- Food-to-nutrient measurements.
- Value-state semantics.
- Source provenance.
- Food search and comparison routes.

Phase 08 will add nutrient education, functions, intake-reference systems, deficiency/excess context and food-source discovery. Phase 08 must not rewrite Phase 07 composition values.

## 42. Phase 09 and Phase 10 handoff

Phase 09 may use composition profiles and gram-based scaling to calculate recipes and meal plans.  
Phase 10 may reference stable food/profile/portion IDs for local nutrition logging.

Historical logs must snapshot display names and source dataset versions so later food-data updates do not rewrite past records.

## 43. External references and source implications

- USDA FoodData Central Downloadable Data — `https://fdc.nal.usda.gov/download-datasets/`: current downloads are available in CSV and JSON; Foundation Foods April 2026 is the pinned preferred release for this phase.
- USDA FoodData Central Data Documentation — `https://fdc.nal.usda.gov/data-documentation/`: data types have different purposes and update schedules; Foundation, FNDDS, Branded and SR Legacy must not be treated as interchangeable.
- USDA FoodData Central API Guide — `https://fdc.nal.usda.gov/api-guide/`: FDC data is published under CC0, but API keys must not be exposed. This phase uses downloads, not a runtime API.
- FAO/INFOODS Standards and Guidelines — `https://www.fao.org/infoods/infoods/standards-guidelines/en/`: use its food matching, unit conversion and data-quality guidance for compilation.
- ICMR-NIN Downloads and site terms — `https://www.nin.res.in/downloads/`: IFCT/NVIF 2017 is available as an official Indian reference, while the site states reproduction and automated scraping require permission.

## 44. Definition of done

Phase 07 is done only when the application has a production-safe Food Encyclopedia architecture, static-data pipeline, verified publication gates, catalogue/detail/compare UX and tests—and contains no fabricated composition values, runtime API dependency or rights violation.
