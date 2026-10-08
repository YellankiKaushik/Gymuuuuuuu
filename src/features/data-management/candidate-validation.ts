import * as workout from "../workout-tracker/schema";
import * as nutritionStorage from "../nutrition-tracker/storage";
import * as nutritionDomain from "../nutrition-tracker/domain";
import * as saved from "../saved/storage";
import * as recipeStorage from "../recipes-meal-plans/storage";
import * as recipeDomain from "../recipes-meal-plans/domain";
import * as recoveryDomain from "../recovery/domain";
import * as cardioDomain from "../cardio/domain";
import * as supplementDomain from "../supplements/domain";
type Stores = Record<string, unknown[]>;
function mapped(stores: Stores, names: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(names).map(([field, store]) => [field, stores[store] ?? []]),
  );
}

/** Validate the resulting module, including relationships and immutable totals, before any writes. */
export async function validateRestoreCandidate(
  database: string,
  stores: Stores,
): Promise<void> {
  if (database === "fitness-os") {
    if (
      ["workoutSessions", "customExercises", "programTrackingStates"].some(
        (store) => stores[store]?.length,
      )
    ) {
      workout.workoutBackupSchema.parse({
        format: "fitness-os-workout-backup",
        schemaVersion: 1,
        exportedAt: new Date().toISOString(),
        appVersion: "0.1.0",
        data: {
          workoutPreferences: stores.workoutPreferences?.[0],
          programTrackingStates: stores.programTrackingStates ?? [],
          customExercises: stores.customExercises ?? [],
          workoutSessions: stores.workoutSessions ?? [],
        },
      });
    }
    nutritionDomain.validateNutritionBackupImport({
      ...nutritionStorage.emptyNutritionBackup(),
      preferences:
        stores.nutritionPreferences?.[0] ??
        nutritionStorage.emptyNutritionBackup().preferences,
      ...mapped(stores, {
        days: "nutritionDays",
        foodEntries: "foodLogEntries",
        hydrationEntries: "hydrationEntries",
        customFoods: "customFoods",
        customFoodRevisions: "customFoodRevisions",
        favourites: "nutritionFavourites",
        auditLog: "nutritionAuditLog",
      }),
    });
    saved.validatePhase16Backup({
      schemaVersion: "1.0.0",
      moduleId: "phase_16_search_favourites_comparison",
      exportedAt: new Date().toISOString(),
      ...mapped(stores, {
        favourites: "phase16Favourites",
        collections: "phase16Collections",
        collectionItems: "phase16CollectionItems",
        recentQueries: "phase16RecentQueries",
        recentViews: "phase16RecentViews",
        savedComparisons: "phase16SavedComparisons",
        settings: "phase16Settings",
        auditEvents: "phase16AuditEvents",
        deletedRecords: "phase16DeletedRecords",
      }),
    });
  }
  if (database === "fitness-os-recipes-meal-plans") {
    recipeDomain.validateRecipeBackup({
      ...recipeStorage.emptyRecipeBackup(),
      preferences:
        stores.mealPlanPreferences?.[0] ??
        recipeStorage.defaultRecipePreferences(),
      ...mapped(stores, {
        recipeIdentities: "recipeIdentities",
        recipeVersions: "recipeVersions",
        mealPlanIdentities: "mealPlanIdentities",
        mealPlanVersions: "mealPlanVersions",
        batchInstances: "batchInstances",
        groceryLists: "groceryLists",
        favourites: "recipeFavourites",
        auditLog: "recipeMealAuditLog",
      }),
      consumptionIntents: (stores.recipeMealMigrationState ?? []).filter(
        (row) =>
          row && typeof row === "object" && Reflect.get(row, "id") !== "schema",
      ),
    });
  }
  if (database === "fitness-os-recovery-sleep-mobility") {
    recoveryDomain.validateRecoveryBackup({
      schemaVersion: "1.0.0",
      exportedAt: new Date().toISOString(),
      moduleId: "phase_12_recovery_sleep_mobility",
      ...mapped(stores, {
        sleepLogs: "phase12_sleep_logs",
        recoveryCheckIns: "phase12_recovery_checkins",
        mobilitySessions: "phase12_mobility_sessions",
        customRoutineIdentities: "phase12_custom_routine_identities",
        customRoutineVersions: "phase12_custom_routine_versions",
        settings: "phase12_settings",
        auditEvents: "phase12_audit_events",
        deletedRecords: "phase12_deleted_records",
      }),
    });
  }
  if (database === "fitness-os-cardio-conditioning") {
    cardioDomain.validateCardioBackup({
      ...cardioDomain.emptyCardioBackup(),
      ...mapped(stores, {
        cardioSessions: "cardioSessions",
        customPlanIdentities: "customCardioPlanIdentities",
        customPlanVersions: "customCardioPlanVersions",
        customRoutineIdentities: "customConditioningRoutineIdentities",
        customRoutineVersions: "customConditioningRoutineVersions",
        settings: "cardioSettings",
        auditEvents: "cardioAuditEvents",
        deletedRecords: "cardioDeletedRecords",
      }),
    });
  }
  if (database === "fitness-os-supplements-evidence") {
    const empty = supplementDomain.emptyBackup();
    supplementDomain.validateBackup({
      ...empty,
      ...Object.fromEntries(
        Object.keys(empty)
          .filter((key) => Array.isArray(Reflect.get(empty, key)))
          .map((key) => [key, stores[key] ?? []]),
      ),
    });
  }
}
