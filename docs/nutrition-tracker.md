# Nutrition tracker

Phase 10 implements optional, device-local consumed-food and noncaloric-fluid records. Public knowledge remains gated by Phase 07/08 source review. No reviewed canonical food profiles or scope-verified population references are currently published; the tracker does not substitute synthetic foods or references. Custom foods and quick add are explicit personal inputs.

The nine workspace routes cover today, a recorded date, add, history, custom-food catalogue/detail, settings/backup, methodology and privacy. `/nutrition-log` redirects to `/nutrition`. All personal reads occur after hydration. Static private metadata is noindex and contains no personal names, quantities, dates or targets.

Canonical entries snapshot exact food/profile IDs, slug, preparation state, primary source/release/licence/review metadata, all source records and per-100-g nutrient values. Scaling is `per100g * grams / 100`, without intermediate rounding. Source energy remains independent of macro calculations. Exact mass conversions and source-reported/measured portions are supported; generic volume and estimated portions cannot silently become grams.

Each custom-food edit creates a new immutable revision with explicit serving mass, nutrient basis and source type/note. Archived foods remain in historical records. Quick add requires calories and accepts optional explicit macros; omitted nutrients are not inferred or counted as quantified. Unknown quick-add mass remains null.

Day targets freeze the selected saved Phase 09 plan on the first food or fluid record. Changes to future preferences do not rewrite older days. Explicit replacement requires confirmation and an audit reason. Copy/repeat/favourites preserve the original snapshot, assign new identities and never automatically refresh food profiles. Edits retain nutrient provenance. Dates remain stable across travel; explicit date moves require confirmation. Future consumed timestamps and nonexistent daylight-saving times are rejected.

Known totals exclude soft-deleted entries. Zero, trace, missing and unquantified not-detected remain distinct. Coverage describes available recorded composition, not physiological adequacy. Fluid volume remains separate from food moisture. No deficiency, hydration diagnosis, energy-expenditure adjustment or automatic target adjustment is produced.

Tests use synthetic fixtures only under tests/fixtures. None are compiled into runtime public content. See docs/local-data/nutrition-storage.md, nutrition-backup.md and phases/phase-10.md for storage, recovery, checks and future-phase contracts.
