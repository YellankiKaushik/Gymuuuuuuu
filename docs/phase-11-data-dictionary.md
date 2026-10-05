# Phase 11 data dictionary
Original schema remains unmodified. schema.generated.ts is deterministically generated from it; schema.ts supplies strict companion snapshots and conditional validation.
recipeIdentities / recipeVersions: stable recipe ownership, immutable ingredients, source, yield, instructions, tags, calculation and history.
mealPlanIdentities / mealPlanVersions: stable plan ownership, immutable dated quantities, exact source versions, meal slots, targets/references and daily/average summaries.
batchInstances: owning plan version, frozen recipe production snapshot, production date, serving equivalents and item allocation joins.
groceryLists: owning plan version, precise merge keys, required/on-hand/remaining masses and manual purchase state.
recipeFavourites: local reference associations. mealPlanPreferences: device settings only.
recipeMealAuditLog: local action lineage. recipeMealMigrationState: schema marker and recoverable pending/committed consumption intents.
Canonical units are g/kcal with source nutrient canonical units. Null means unquantified/unavailable, never implicit zero. Nutrition snapshots include per-nutrient partial status and ingredient source details.
