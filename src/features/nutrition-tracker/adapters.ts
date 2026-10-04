import { nutritionReference, type NutritionBackup } from "./schema";
import {
  aggregateNutritionDay,
  validateNutritionBackupImport,
  migrateNutritionRecords,
  createNutritionRestorePlan,
} from "./domain";
import {
  readNutritionBackup,
  restoreNutritionBackup,
  deleteAllNutrition,
} from "./storage";
export const nutritionBackupAdapter = {
  module: "nutrition-tracker",
  schemaVersion: 1,
  canonicalStores: nutritionReference.backup.canonicalStores,
  excludedRebuildableStores:
    nutritionReference.backup.excludedRebuildableStores,
  read: readNutritionBackup,
  validate: validateNutritionBackupImport,
  migrate: migrateNutritionRecords,
  plan: createNutritionRestorePlan,
  restore: restoreNutritionBackup,
  purge: deleteAllNutrition,
} as const;
export function nutritionReadModels(backup: NutritionBackup) {
  return backup.days.map((day) => {
    const entries = backup.foodEntries.filter(
        (e) => e.localDate === day.localDate && e.deletedAt === null,
      ),
      fluids = backup.hydrationEntries.filter(
        (e) => e.localDate === day.localDate && e.deletedAt === null,
      ),
      categoryCounts: Record<string, number> = {};
    for (const e of entries)
      if (e.sourceKind === "canonical_food" && e.foodCategoryIdSnapshot)
        categoryCounts[e.foodCategoryIdSnapshot] =
          (categoryCounts[e.foodCategoryIdSnapshot] ?? 0) + 1;
    return {
      localDate: day.localDate,
      timeZone: day.timeZone,
      targetSnapshot: day.targetSnapshot,
      referenceSnapshots: day.referenceSnapshots,
      nutrients: aggregateNutritionDay(entries),
      foodEntryCount: entries.length,
      fluidEntries: fluids,
      fluidMl: fluids.reduce((sum, e) => sum + e.volumeMl, 0),
      hasRecordedConsumption: entries.length + fluids.length > 0,
      categoryCounts,
    };
  });
}
