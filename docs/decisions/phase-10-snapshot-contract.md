# Phase 10 strict snapshot extensions

The original supplied documents and normative schema remain intact. The generated Zod schema mirrors them; companion schema.ts enforces conditional references, finite amounts, canonical nutrient units, unique identities and graph relationships.

1. The normative amount requires positive gramWeight for quick add, even when no mass exists. A strict local alternative uses inputUnit entry, quantity 1, gramWeight null and conversionKind not_applicable. No fictional gram weight is introduced.
2. Canonical logs add sourceRecordsSnapshot so independently sourced nutrient values retain their full source/release/licence records, rather than relying only on the primary reference.
3. Favourites add entrySnapshot and require their source/amount to agree with it. One-tap logging therefore preserves historical values even after public/profile/custom-food updates.
4. Reference snapshots add structured adult population, basis and formScope. EAR/AR, incompatible units and supplemental/specific/unspecified form scopes are excluded from ordinary food-only comparison. Reviewed scope mappings are currently unavailable and the UI says so. The explicit comparison function is ready for approved Phase 08 data, without inferring scope from prose.
5. Arbitrary recipeRef JSON is parsed without any. Recipe writes remain rejected until Phase 11 owns a verified adapter and versioned recipe calculation contract. Planned food is not logged as consumed automatically.
6. Fluid volume retains the normative explicit mL field. It is not converted to grams or mixed with food moisture, because density is not established.
7. Database schema 10 centralizes the workout/nutrition opener. All prior workout stores/records remain unchanged; only the browser editor identity initialization becomes lazy so it cannot run at module scope.
8. Canonical entries retain foodCategoryIdSnapshot for later category read models without fetching a changed public classification. Optional source min/max bounds retain their original per-100-g basis and are not substituted for the point value. Preferred energy display converts source kcal to kJ explicitly; stored food values stay unchanged.

Source documentation checked on 2026-10-05 for engineering conventions: USDA FoodData Central data-type documentation, FAO Food Composition Data Chapter 9 and MDN StorageManager.persist. This is not clinical review or approval of food composition records. FAO's missing/trace/analytical-value conventions support retaining provenance and keeping missing data distinct from zero. The original reference's historical metadata date is preserved and is not asserted as a new review date.
