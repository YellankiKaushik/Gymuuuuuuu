# Phase 08 — Nutrient Encyclopedia

**Project:** Fitness OS  
**Document type:** Lovable implementation specification  
**Version:** 1.0  
**Date:** 5 August 2026  
**Status:** Ready for Plan-mode review  
**Depends on:** Phases 00, 01 and 07  
**Provides data contracts to:** Phases 09, 10, 11, 13 and 15

---

## 0. How to use this phase

1. Keep the Phase 00 Project Knowledge active.
2. Confirm the Phase 01 shell, theme, navigation and accessibility foundation still works.
3. Confirm Phase 07 food routes, stable nutrient IDs and data-status semantics are available.
4. Attach this Markdown specification.
5. Attach `Phase_08_Nutrient_Data_Schema.json`.
6. Attach `Phase_08_Seed_Nutrient_Taxonomy.json`.
7. Attach `Phase_08_Lovable_Prompt_Package.txt`.
8. Also attach the Phase 07 food schema and seed taxonomy because Phase 08 links to verified food-composition records.
9. Run the Phase 08 Plan-mode prompt before code changes.
10. Reject any plan that invents intake values, diagnoses a deficiency, adds authentication, stores health inputs remotely or merges incompatible reference frameworks.
11. Approve only the Nutrient Encyclopedia scope.
12. Run the Agent-mode prompt, verification prompt and correction prompt.
13. Create the GitHub checkpoint `phase-08-nutrient-encyclopedia-complete`.

## 1. Phase objective

Build a source-transparent Nutrient Encyclopedia that explains essential nutrients and major dietary components from basic definition through practical food context.

The phase must deliver:

- A nutrient catalogue.
- Detailed nutrient pages.
- Macronutrient, vitamin, mineral, hydration and food-component categories.
- Reference-intake framework definitions.
- A manual Reference Intake Explorer by age, sex and life stage when verified values are present.
- Distinct RDA, AI, EAR, UL, AMDR, CDRR, DV, PRI, AR, RI and TUL semantics.
- Functions, forms, units and equivalence rules.
- Food-source links calculated from verified Phase 07 profiles.
- Absorption and bioavailability factors.
- General deficiency and excess-risk education.
- Nutrient-nutrient and nutrient-medication interaction summaries.
- Training relevance with evidence qualifiers.
- Vegetarian, vegan and Indian-diet context.
- Claim-level sources, limitations and review status.
- No diagnosis, treatment plan, supplement prescription or automatic personalised recommendation.

Phase 08 answers “what is this nutrient, what does it do, what reference values exist, and which verified foods contain it?” It does not decide what a specific person medically needs.

## 2. Scope definition

The MVP covers **51 stable topics**:

- Energy and water.
- Protein, carbohydrate, fibre, sugars and major fat classes.
- Sodium, potassium, calcium, iron, magnesium, phosphorus, zinc, copper, manganese, selenium, iodine, chloride, chromium, fluoride and molybdenum.
- Vitamins A, B1, B2, B3, B5, B6, B7, B9, B12, C, D, E and K.
- Retinol, beta-carotene, food folate, folic acid and dietary folate equivalents where composition data uses those forms.
- Choline.
- Label-relevant dietary components such as added sugars, trans fat, cholesterol and alcohol.

“Everything” does not mean every bioactive compound ever identified. Individual amino acids, detailed fatty acids, carotenoids beyond beta-carotene, phytosterols, polyphenols and other phytochemicals are future dataset extensions after the core contracts are stable.

## 3. Non-negotiable product decisions

- No signup, login, profile or cloud health account.
- No Supabase, Firebase or remote personal-data store.
- No AI diagnosis or nutrient-deficiency prediction.
- No supplement-dose generator.
- No medication-change advice.
- No universal “recommended amount” detached from authority, population and value type.
- No mixing values from India, US/Canada, FDA and EFSA into one synthetic number.
- No automatic geolocation-based framework selection.
- No reference value without source, framework version, unit and population.
- No statement that an RDA is a minimum, an EAR is an individual target or a UL is a recommended goal.
- No deficiency diagnosis from symptoms or food logs.
- No claim that one food is “best” without a declared comparison basis.
- Missing Phase 07 food values remain missing.
- Repository-owned static JSON is the canonical encyclopedia content.
- Optional framework preference may be stored locally only.

## 4. Dependencies and ownership

| Concept | Owning phase | Phase 08 rule |
| --- | --- | --- |
| Application shell and design system | Phase 01 | Reuse; do not redesign. |
| Food composition and nutrient measurements | Phase 07 | Read verified profiles and stable nutrient IDs; never rewrite composition values. |
| Diet targets and meal planning | Phase 09 | Provide reference contracts only; do not generate a diet plan here. |
| Nutrition logging | Phase 10 | Provide nutrient IDs, units and reference framework hooks. |
| Recovery and sleep | Phase 12 | Cross-link relevant education without creating recovery scores here. |
| Supplements | Phase 13 | Mention supplement context carefully; detailed supplement pages belong there. |
| Analytics | Phase 15 | Expose deterministic reference calculations and metadata. |

## 5. Required routes

| Route | Purpose |
| --- | --- |
| `/nutrients` | Searchable nutrient and dietary-component catalogue. |
| `/nutrients/$slug` | Detailed nutrient page. |
| `/nutrients/categories/$groupId` | Group-focused catalogue. |
| `/nutrients/compare` | Compare two to four nutrient topics conceptually. |
| `/nutrients/reference-intakes` | Reference Intake Explorer. |
| `/nutrients/frameworks` | Explain DRI, DV, ICMR-NIN and EFSA frameworks. |
| `/nutrients/methodology` | Units, evidence, food ranking, conversions and limitations. |
| `/nutrients/glossary` | RDA, EAR, AI, UL, AMDR, DFE, RAE, NE and related terms. |

Invalid slugs and incomplete records must show recoverable states rather than fabricated fallback text.

## 6. Primary navigation and grouping

The Nutrient Encyclopedia navigation must expose:

- Energy and hydration.
- Macronutrients.
- Fat classes.
- Vitamins.
- Minerals and electrolytes.
- Other essential nutrients.
- Dietary components.
- Reference Intake Explorer.
- Frameworks and glossary.
- Methodology.

Do not classify nutrients as “good” or “bad.” Use physiological and compositional categories.

## 7. Stable identity and Phase 07 compatibility

The attached seed taxonomy contains 51 stable nutrient identities.

- 44 identities map directly to Phase 07 nutrient measurements.
- 7 encyclopedia-only identities are reserved for broader education or a future non-breaking Phase 07 schema extension.
- Phase 07 IDs must never be renamed casually.
- Display labels may change without changing stable IDs.
- A nutrient page may link to multiple source-database forms.
- Forms such as retinol and beta-carotene must not be naively added to total vitamin A.
- Food folate, folic acid and DFE must preserve their distinct meaning.

## 8. Nutrient record model

Every production nutrient record may contain:

- Stable ID and slug.
- Canonical name and aliases.
- Group and display type.
- Essentiality classification.
- Canonical unit.
- Phase 07 nutrient IDs.
- Plain-language summary.
- Chemical or nutritional forms.
- Core functions.
- Reference values by framework and population.
- Food-source ranking rules.
- Absorption enhancers and inhibitors.
- Deficiency overview and risk groups.
- Excess-intake overview and upper limits.
- Interactions.
- Training relevance.
- Claim-level evidence.
- Source citations.
- Editorial review metadata.

Lovable must use the attached JSON Schema as the canonical contract.

## 9. Publication gates

A nutrient record may be published only when:

- Identity and aliases are reviewed.
- Summary and functions have authoritative sources.
- Units and forms are correct.
- Every displayed reference value has framework, population, type and source.
- Deficiency and excess sections include a medical boundary.
- Interactions are source-backed and severity-labelled.
- Food rankings use verified Phase 07 data.
- No unsupported athletic claim remains.
- Editorial and scientific review are approved.

Draft identities must remain hidden from public production views.

## 10. Reference-value concepts

The application must distinguish:

| Type | Meaning in the interface | Prohibited interpretation |
| --- | --- | --- |
| RDA | Intake sufficient for nearly all healthy individuals in a specified group. | Universal minimum or treatment dose. |
| AI | Assumed adequate where evidence is insufficient for an RDA. | Proven exact requirement. |
| EAR | Estimated to meet the requirement of half of a healthy group. | Personal daily target. |
| UL / TUL | Highest chronic daily intake unlikely to pose risk for most people in the stated group. | Recommended amount to reach. |
| AMDR / RI | Intake range, usually as percentage of energy, associated with adequacy and lower chronic-disease risk. | Exact gram target without energy context. |
| CDRR | Intake above which reduction is expected to reduce chronic-disease risk for a population. | Toxicity threshold. |
| DV | Single food-label reference value. | Personal RDA. |
| PRI / AR | EFSA population reference concepts. | Directly interchangeable with RDA/EAR without explanation. |

Tooltips and glossary pages must explain the distinction in plain language.

## 11. Reference frameworks

### 11.1 US/Canada DRI

Use for structured RDA, AI, EAR, UL, AMDR and CDRR values when source data is verified. Values vary by age, sex and life stage.

### 11.2 FDA Daily Value

Use for optional food-label-style percentage calculations. It is one reference value for an intended label population, not a personalised requirement.

### 11.3 India ICMR-NIN 2020

This is the preferred Indian context framework. The public NIN material confirms the 2020 report includes RDA, EAR and tolerable upper limits. Do not scrape or bulk reproduce paid or copyright tables until structured-use rights are confirmed.

### 11.4 EFSA DRV

Use as an optional comparative professional framework. EFSA states that DRVs guide professionals and policy; they are not individual prescriptions.

### 11.5 Framework isolation

- Store every framework separately.
- Never average reference values.
- Show authority and version.
- Preserve each framework’s terminology.
- Let users switch explicitly.
- Store only the selected framework ID locally.

## 12. Reference Intake Explorer

The `/nutrients/reference-intakes` tool is a reference-table explorer, not a medical calculator.

Inputs:

- Framework.
- Age or age band.
- Sex where the framework distinguishes it.
- General, pregnancy or lactation life stage.
- Optional unit display preference.

Outputs:

- Nutrient name.
- Value type.
- Value or range.
- Unit and basis.
- Source authority and version.
- Notes and limitations.
- “No value established” state when applicable.

Rules:

- Do not store age, sex or life stage unless the user explicitly selects “remember on this device.”
- Remembered values remain local.
- Do not infer pregnancy or lactation.
- Do not ask for medical conditions.
- Do not transform the table into supplement doses.
- Do not show red deficiency warnings based on food logs.

## 13. Units, forms and equivalents

The methodology must explain and encode:

- kcal and kJ as energy units.
- grams, milligrams and micrograms.
- Vitamin A as RAE where appropriate.
- Folate as DFE where appropriate.
- Niacin equivalents where applicable.
- Vitamin E as alpha-tocopherol units defined by the source framework.
- Vitamin D microgram and IU display only through a verified conversion rule.
- Percentage-of-energy ranges for AMDR or RI.
- Body-weight-based values only when the source framework explicitly uses them.

Never apply a conversion rule globally when the nutrient form or framework differs.

## 14. Percent-reference calculations

When a user selects a compatible reference value:

`percent_reference = nutrient_amount / reference_value × 100`

Required conditions:

- Same nutrient concept.
- Compatible units.
- Compatible equivalent system.
- Selected reference value is numeric and applicable.
- Food value is verified and not `not_available`.
- UI names the framework and population.

Rules:

- Round only for display.
- Values above 100% are not automatically dangerous.
- Values below 100% are not automatically deficient.
- UL percentage must not be presented as a progress goal.
- Do not calculate percentage for incompatible forms without an approved equivalence transformation.

## 15. Phase 07 food integration

Every nutrient detail page may show verified food sources from Phase 07.

Required links:

- Nutrient page to foods containing that nutrient.
- Food detail nutrient row to the relevant nutrient page.
- Food comparison to reference framework explanation.
- Optional percentage reference display after the user selects a framework.

A nutrient page must not hand-maintain numeric food tables when the same values exist in Phase 07. Use Phase 07 as the composition source of truth.

## 16. Food-source ranking

The interface may rank verified foods by:

- Amount per 100 g.
- Amount per 100 kcal.
- Amount per verified household portion.

Ranking controls must expose the selected basis.

Required safeguards:

- Exclude `not_available` rather than treating it as zero.
- Allow users to exclude estimated or imputed values.
- Preserve raw/cooked profile labels.
- Show source release.
- Do not rank incompatible forms as identical totals.
- Do not call the first result “the best source.”
- Explain that absorption and typical serving size may change practical contribution.

## 17. Nutrient catalogue UX

The `/nutrients` catalogue must provide:

- Search by name, alias and common abbreviation.
- Group filter.
- Essentiality filter.
- Reference-framework availability filter.
- Phase 07 food-data availability filter.
- Published-content filter for internal review mode.
- Alphabetical sorting.
- Optional sort by group.
- URL-persisted filters.
- Clear-all action and result count.

Cards or rows show:

- Nutrient name.
- Common alias.
- Group.
- Canonical unit.
- Reference-value availability.
- Verified food-link availability.
- Content review status in development mode only.

## 18. Nutrient detail page

Required sections:

1. Breadcrumbs.
2. Canonical name, aliases and group.
3. Plain-language overview.
4. Essentiality and dietary-component classification.
5. Forms and equivalent systems.
6. Core functions.
7. Reference intake table with framework selector.
8. Food-source explorer.
9. Absorption and bioavailability.
10. Deficiency overview and risk groups.
11. Excess intake and upper-limit context.
12. Interactions.
13. Training relevance.
14. Vegetarian, vegan and Indian-diet considerations.
15. Sources, review date and limitations.
16. Related nutrients and foods.

Medical content must use neutral educational styling, not alarmist red banners.

## 19. Nutrient comparison

The comparison route supports two to four nutrient topics.

Useful comparison fields:

- Classification.
- Primary functions.
- Canonical units.
- Forms and equivalence systems.
- Reference-value types available.
- Deficiency-risk groups.
- Excess and UL availability.
- Important interactions.
- Food-data coverage.

Do not compare unlike units numerically as if one nutrient were “larger” or more important.

## 20. Functions and claims

Functions must be concise and source-backed.

Each material claim requires:

- Claim ID.
- Exact claim text.
- Category.
- Applicable population.
- Evidence level.
- Source IDs.
- Limitations.
- Review status.

Avoid vague claims such as “boosts immunity,” “detoxifies,” “burns fat” or “increases testosterone” unless the exact context and evidence support the wording.

## 21. Absorption and bioavailability

Possible factors include:

- Nutrient form.
- Food matrix.
- Enhancers.
- Inhibitors.
- Meal composition.
- Physiological state.
- Medication effects.
- Fortification or supplement form.

The app must distinguish:

- Greater absorption from higher total nutrient content.
- Laboratory bioaccessibility from human bioavailability.
- Population evidence from individual prediction.

Do not produce a numeric absorption percentage unless a source supports that specific context.

## 22. Deficiency education

Each deficiency section may contain:

- High-level physiological consequence.
- Groups at higher risk.
- General signs and symptoms.
- Dietary-pattern considerations.
- When professional assessment is appropriate.
- Source links.

Mandatory boundary text:

> Symptoms are nonspecific and cannot diagnose a nutrient deficiency. Diagnosis may require clinical evaluation and appropriate laboratory testing.

Do not create a symptom checker.

## 23. Excess, toxicity and upper limits

Each excess section may contain:

- Whether a UL/TUL exists.
- Whether the upper limit applies to food, supplements or both.
- Known adverse-effect context.
- Population-specific exceptions.
- Professional-review triggers.

Never treat “no UL established” as proof that unlimited intake is safe.

## 24. Interactions

The interface may include:

- Nutrient-nutrient interactions.
- Nutrient-medication interactions.
- Nutrient-condition cautions.
- Food/supplement timing context.

Every interaction requires severity:

- Informational.
- Caution.
- Professional review.
- Urgent.

Medication interactions must be clearly non-exhaustive and must not advise stopping, starting or changing medication.

## 25. Training relevance

Training relevance may cover:

- Energy metabolism.
- Muscle protein synthesis context.
- Oxygen transport.
- Bone health.
- Hydration and electrolytes.
- Neuromuscular function.
- Recovery and immune function.

Rules:

- Separate normal physiological need from performance-enhancement claims.
- Distinguish deficiency correction from benefit above adequate intake.
- Do not imply that more is better.
- Supplement details belong to Phase 13.
- Sports-specific claims require explicit evidence level and population.

## 26. Dietary-pattern context

Nutrient pages should support:

- Vegetarian context.
- Vegan context.
- Mixed-diet context.
- Indian food examples derived from verified Phase 07 records.
- Fortified-food context.
- Bioavailability limitations.

Do not assume every vegetarian or vegan user is deficient. Explain risk and planning considerations without diagnosis.

## 27. Source governance

Priority order:

1. Official nutrient-reference authorities.
2. NIH ODS professional fact sheets.
3. National Academies consensus DRI reports.
4. ICMR-NIN official Indian nutrient-requirement material.
5. EFSA scientific opinions.
6. Systematic reviews and professional consensus documents for athletic context.
7. Primary research only when higher-level evidence is unavailable.

Every source record requires authority, title or locator, date accessed and relevant version.

## 28. Rights and quotation rules

- Do not copy entire NIH, NIN, EFSA or National Academies pages.
- Summarize in original wording.
- Use brief quotations only when necessary.
- Do not scrape paid ICMR-NIN tables.
- Facts and values still require provenance and versioning.
- Do not use random blog charts or infographics.
- Rights-cleared original diagrams are optional; text-first pages are acceptable.

## 29. Seed taxonomy behavior

The attached seed file contains 51 stable identities.

Lovable must:

- Load identities for route, search and schema development.
- Keep all `draft_identity` records out of production public views.
- Never generate missing reference values.
- Never generate deficiency or toxicity claims from model memory.
- Never publish a page because an ID exists.
- Provide a development report showing draft, partial and publishable counts.

## 30. Search behavior

Search must match:

- Canonical name.
- Alias.
- Vitamin number.
- Abbreviation such as RAE, DFE, MUFA or PUFA.
- Group.

Search is local, deterministic, case-insensitive and typo-tolerant. Production results include published records only.

## 31. Empty and error states

Required states:

- No published nutrient articles yet.
- Nutrient identity exists but content is under review.
- Reference framework has no value for this nutrient or group.
- No UL established.
- Phase 07 has no verified food measurement.
- Selected food ranking basis is unavailable.
- Invalid unit conversion.
- Unsupported framework version.
- Source unavailable.
- Deprecated record.

Every state must explain the limitation without guessing.

## 32. Accessibility

- One H1 per route.
- Semantic tables with captions and headers.
- Framework selector and age controls are keyboard operable.
- Abbreviations are expanded on first use.
- Tooltips are not the only source of definitions.
- Comparison differences are not conveyed by colour alone.
- Medical cautions are announced clearly but not repeatedly.
- Reflow works at 320 px and 400% zoom.
- Focus is visible in light and dark themes.
- Units remain programmatically associated with values.

## 33. Responsive behavior

### Mobile

- Catalogue filters use an accessible drawer.
- Nutrient detail sections stack vertically.
- Reference tables transform into labelled cards when needed.
- Framework and population controls remain visible near the results.
- Food-source ranking uses compact rows with explicit basis.

### Tablet

- Two-column catalogue is allowed.
- Reference explorer may place controls beside results.

### Desktop

- Detail pages may use a sticky contents/source sidebar.
- Wide reference tables may use horizontal scroll with frozen row labels.
- Food-source and framework panels may appear side by side.

## 34. Performance

- Support at least 250 nutrient and dietary-component topics in future.
- Keep catalogue index compact.
- Lazy-load full articles and reference tables.
- Build search index at compile time.
- Precompute Phase 07 food rankings at build time for common bases.
- Do not load all food profiles on a nutrient page.
- Use deterministic client-side reference calculations.
- No runtime external nutrient API.

## 35. Suggested TypeScript architecture

```text
src/
  features/nutrients/
    components/
    routes/
    domain/
      nutrient-types.ts
      nutrient-validation.ts
      reference-frameworks.ts
      reference-calculation.ts
      nutrient-equivalents.ts
      food-source-ranking.ts
      evidence-formatting.ts
    data/
      load-nutrient-index.ts
      load-nutrient-record.ts
      load-reference-framework.ts
    tests/
  content/nutrients/
  docs/nutrients/
scripts/nutrient-data/
```

Required domain functions:

- `validateNutrientRecord`
- `resolveReferenceValue`
- `calculatePercentReference`
- `convertEquivalentUnit`
- `rankVerifiedFoodSources`
- `formatReferenceValue`
- `getFrameworkGlossary`
- `getNutrientPublicationStatus`
- `validateClaimSources`

## 36. Data validation

The validator must check:

- Schema validity.
- Unique IDs and slugs.
- Valid group relationships.
- Phase 07 nutrient IDs exist when referenced.
- Canonical unit is compatible with reference values.
- Population age ranges do not overlap accidentally within the same framework/value type.
- `minValue` does not exceed `maxValue`.
- Ranges use a range-compatible value type.
- Percentage-energy values use an explicit basis.
- Reference values have source and review status.
- Claims have at least one source.
- Published deficiency/excess sections include medical boundary text.
- Interactions include severity.
- Food rankings never include missing measurements as zero.
- Published records have approved editorial status.

## 37. Automated tests

Required tests:

- Schema test for all nutrient records.
- Stable-ID and slug uniqueness.
- Phase 07 compatibility.
- Reference population resolution.
- Boundary-age selection.
- Pregnancy/lactation selection.
- Unit and equivalent conversions.
- Percent-reference calculations.
- UL-not-goal display logic.
- Missing-value handling.
- Food ranking and profile-state handling.
- Draft/published separation.
- Search aliases and abbreviations.
- Route and invalid-slug behavior.
- Accessibility of tables and selectors.
- No remote health-data request.
- Regression of Phases 00, 01 and 07.

## 38. Manual test matrix

Test at minimum:

- 320 px mobile.
- 768 px tablet.
- 1440 px desktop.
- Light and dark themes.
- Keyboard only.
- Screen-reader landmarks and table headers.
- 400% zoom.
- No published content.
- Partial article.
- Multiple frameworks.
- No reference value.
- No upper limit.
- No food data.
- Raw and cooked food profiles.
- Missing, estimated and measured food values.
- Invalid framework query parameter.

## 39. Acceptance criteria

- [ ] All required routes work.
- [ ] Catalogue search and filters are local and deterministic.
- [ ] Draft identities are hidden in production.
- [ ] Frameworks remain isolated and labelled.
- [ ] Reference-value types are explained correctly.
- [ ] Reference Intake Explorer selects verified population rows only.
- [ ] No reference value is fabricated.
- [ ] Percent-reference calculations state framework and population.
- [ ] UL values are never shown as targets.
- [ ] Food rankings use verified Phase 07 data and explicit basis.
- [ ] Missing food data is never zero-filled.
- [ ] Forms and equivalents are not naively combined.
- [ ] Deficiency content cannot diagnose the user.
- [ ] Interaction content does not change medication advice.
- [ ] Training claims include evidence and limitations.
- [ ] Mobile, desktop, dark mode and accessibility tests pass.
- [ ] No auth, backend or remote personal-data storage is added.
- [ ] Phases 00, 01 and 07 remain functional.

## 40. Explicit exclusions

Do not build in Phase 08:

- Personal calorie or macro targets.
- Meal plans.
- Food logging.
- Daily adherence scores.
- Automatic deficiency detection.
- Blood-test interpretation.
- Medical-condition nutrition plans.
- Supplement stack or dosage recommendations.
- Product shopping links.
- AI chatbot advice.
- Cloud profiles.

## 41. Required implementation deliverables

Lovable must create:

- All Phase 08 routes.
- Nutrient catalogue and detail components.
- Reference framework and glossary components.
- Reference Intake Explorer.
- Phase 07 food-source integration.
- Static data loaders.
- Schema validation.
- Domain calculation functions.
- Empty/error states.
- Unit, integration and accessibility tests.
- `docs/nutrients/METHODOLOGY.md`.
- `docs/nutrients/SOURCES.md`.
- `docs/nutrients/REFERENCE_FRAMEWORKS.md`.
- `docs/nutrients/CONTENT_REVIEW.md`.
- `docs/nutrients/TESTING.md`.

## 42. GitHub checkpoint

After every acceptance criterion passes, create:

`phase-08-nutrient-encyclopedia-complete`

Do not begin Phase 09 while blocking failures remain.

## 43. Phase 09 handoff

Phase 08 must provide Phase 09 with:

- Stable nutrient IDs.
- Canonical units.
- Versioned reference frameworks.
- Population selectors.
- Reference-value resolution functions.
- Equivalent and conversion rules.
- Food-source integration.
- Clear distinction between general references and personal targets.

Phase 09 may calculate diet targets, but it must not change Phase 08’s definitions or source values.

## 44. Authoritative source register

| Source | Use |
| --- | --- |
| NIH ODS vitamin and mineral fact sheets | Functions, intake tables, food sources, safety and interactions. |
| NIH ODS nutrient recommendations and DRI tables | Definitions and versioned US/Canada reference values. |
| FDA Daily Values | Optional label-oriented percentages. |
| ICMR-NIN RDA/EAR 2020 | Indian framework after rights and data-use review. |
| EFSA Dietary Reference Values | Comparative European framework. |
| USDA FoodData Central | Verified food-composition links from Phase 07. |

## 45. Final Lovable instruction

Build the Nutrient Encyclopedia as a reviewed knowledge and reference system. Do not convert authoritative population references into medical prescriptions, do not invent values or symptoms, and do not compromise the local-first no-authentication architecture.
