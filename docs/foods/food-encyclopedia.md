# Food encyclopedia

Phase 07 implements `/foods`, `/foods/$slug`, `/foods/compare`, `/foods/categories/$categoryId`, `/foods/sources`, and `/foods/methodology`. An additional category landing page is available at `/foods/categories`.

The catalogue supports normalized names, aliases, regional names and source descriptions; deterministic one-edit typo matching; category, subgroup, state, dietary/allergen tag, source and completeness filters; explicit nutrient thresholds; source-estimate inclusion; A–Z and numeric sorting; URL state; 30-profile pages; removable filters and an accessible dialog. Numeric sorts exclude missing or explicitly excluded estimated/imputed amounts.

Detail pages select approved profiles, source-backed portions or transient custom grams, display grouped nutrients and data status, and preserve source records and quality notes. Comparison selects two to four distinct profile IDs and displays a common 100 g basis or separate source-backed servings. It reports numeric differences without scoring a winner. Unknown identities, profiles, categories and invalid comparisons recover safely.

Current content: 342 draft identities, zero public foods and zero approved profiles. The architecture and engineering fixtures are usable; the factual library is awaiting reviewed composition input. No daily-value claims, diet targets, nutrition logging, branded catalogue or recipes are introduced here. Nutrient encyclopedia links will be added only when their Phase 08 targets are available.
