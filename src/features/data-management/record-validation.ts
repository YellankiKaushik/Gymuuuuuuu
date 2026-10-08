import * as w from "../workout-tracker/schema";
import * as n from "../nutrition-tracker/schema";
import * as p from "../progress/schema";
import * as s from "../saved/schema";
import * as d from "../diet-planning/domain";
import * as r from "../recovery/schema";
import * as c from "../cardio/schema";
import * as u from "../supplements/schema";
import * as recipes from "../recipes-meal-plans/schema";
import * as recipeNormative from "../recipes-meal-plans/schema.generated";
import * as nutritionNormative from "../nutrition-tracker/schema.generated";
import * as dietNormative from "../diet-planning/schema.generated";
import * as foundation from "../../domain/schemas/foundation";
import { z } from "zod";

/** Loaded only for portability actions; owning schemas remain authoritative. */
export async function restoreRecordSchemas(): Promise<
  Record<string, Record<string, z.ZodType>>
> {
  return {
    "fitness-os-local": { records: foundation.localRecordSchema },
    "fitness-os": {
      workoutPreferences: w.workoutPreferencesNormativeSchema,
      programTrackingStates: w.programTrackingStateNormativeSchema,
      customExercises: w.customExerciseSchema,
      workoutSessions: w.workoutSessionSchema,
      nutritionPreferences: n.preferencesSchema,
      nutritionDays: n.nutritionDaySchema,
      foodLogEntries: n.foodEntrySchema,
      hydrationEntries: n.hydrationSchema,
      customFoods: n.customFoodSchema,
      customFoodRevisions: n.customRevisionSchema,
      nutritionFavourites: n.favouriteSchema,
      nutritionAuditLog: nutritionNormative.auditRecordNormativeSchema,
      bodyWeightLogs: p.weightLogSchema,
      circumferenceSessions: p.circumferenceSchema,
      bodyCompositionMeasurements: p.compositionSchema,
      progressPhotos: p.photoSchema,
      heightMeasurements: p.heightSchema,
      progressGoals: p.goalSchema,
      nutritionDayReviews: p.nutritionReviewSchema,
      dashboardLayouts: p.layoutSchema,
      metricCalculationReceipts: p.receiptSchema,
      phase15Settings: p.settingSchema,
      phase15AuditEvents: p.auditEventSchema,
      phase15DeletedRecords: p.deletedRecordSchema,
      phase16Favourites: s.favouriteSchema,
      phase16Collections: s.collectionSchema,
      phase16CollectionItems: s.collectionItemSchema,
      phase16RecentQueries: s.recentQuerySchema,
      phase16RecentViews: s.recentViewSchema,
      phase16SavedComparisons: s.savedComparisonSchema,
      phase16Settings: s.settingSchema,
      phase16AuditEvents: s.auditEventSchema,
      progressPhotoBlobs: z
        .object({
          blobKey: z.string().min(1),
          blob: z
            .instanceof(Blob)
            .refine(
              (blob) =>
                ["image/jpeg", "image/png", "image/webp"].includes(blob.type) &&
                blob.size > 0 &&
                blob.size <= 10 * 1024 * 1024,
              "Invalid or oversized progress image.",
            ),
        })
        .passthrough(),
    },
    "fitness-os-diet-planning": {
      dietPlans: d.dietPlanSchema,
      dietPlannerSettings: z.strictObject({
        id: z.literal("settings"),
        value: d.settingsSchema,
      }),
      dietPlanAuditLog: dietNormative.auditNormativeSchema,
    },
    "fitness-os-recipes-meal-plans": {
      recipeIdentities: recipes.recipeIdentitySchema,
      recipeVersions: recipes.recipeVersionSchema,
      mealPlanIdentities: recipes.mealPlanIdentitySchema,
      mealPlanVersions: recipes.mealPlanVersionSchema,
      batchInstances: recipes.batchSchema,
      groceryLists: recipes.grocerySchema,
      recipeFavourites: recipeNormative.favouriteNormativeSchema,
      recipeMealAuditLog: recipeNormative.auditRecordNormativeSchema,
      mealPlanPreferences: recipes.preferencesSchema,
      recipeMealMigrationState: z.union([
        recipes.consumptionIntentSchema,
        z.strictObject({
          id: z.literal("schema"),
          schemaVersion: z.literal(1),
          updatedAt: z.iso.datetime({ offset: true }),
        }),
      ]),
    },
    "fitness-os-recovery-sleep-mobility": {
      phase12_sleep_logs: r.sleepSchema,
      phase12_recovery_checkins: r.checkInSchema,
      phase12_mobility_sessions: r.sessionSchema,
      phase12_custom_routine_identities: r.identitySchema,
      phase12_custom_routine_versions: r.routineSchema,
      phase12_settings: r.settingSchema,
      phase12_audit_events: r.auditSchema,
      phase12_deleted_records: r.tombstoneSchema,
    },
    "fitness-os-cardio-conditioning": {
      cardioSessions: c.sessionSchema,
      customCardioPlanIdentities: c.identitySchema,
      customCardioPlanVersions: c.planSchema,
      customConditioningRoutineIdentities: c.identitySchema,
      customConditioningRoutineVersions: c.routineSchema,
      cardioSettings: c.preferencesSchema,
      cardioAuditEvents: c.auditSchema,
      cardioDeletedRecords: c.tombstoneSchema,
    },
    "fitness-os-supplements-evidence": u.rowSchemas,
  };
}
