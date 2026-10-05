import { newNutritionId } from "../nutrition-tracker/domain";
import { recalculateRecipe, recalculateMealPlan } from "./domain";
import {
  recipeVersionSchema,
  mealPlanVersionSchema,
  type Ingredient,
  type RecipeVersion,
  type MealPlanVersion,
  type RecipeBackup,
} from "./schema";
export function recipeDraft(
  title: string,
  ingredients: Ingredient[],
  options: {
    recipeId?: string;
    versionNumber?: number;
    instructions: string;
    cookingMethod: RecipeVersion["methodology"]["cookingMethod"];
    allowUnadjustedRetention: boolean;
    yieldModel: RecipeVersion["yieldModel"];
    reason: string;
  },
): RecipeVersion {
  const now = new Date().toISOString();
  return recalculateRecipe(
    recipeVersionSchema.parse({
      id: newNutritionId("rver"),
      schemaVersion: 1,
      recipeId: options.recipeId ?? newNutritionId("recipe"),
      versionNumber: options.versionNumber ?? 1,
      title,
      source: {
        kind: "user_created",
        title,
        licenceStatus: "user_owned",
        reviewedAt: null,
      },
      ingredients: ingredients.map((line, order) => ({ ...line, order })),
      instructions: options.instructions
        .split("\n")
        .filter((s) => s.trim())
        .map((text, i) => ({ id: newNutritionId("step"), order: i + 1, text })),
      yieldModel: options.yieldModel,
      methodology: {
        cookingMethod: options.cookingMethod,
        allowUnadjustedRetention: options.allowUnadjustedRetention,
      },
      calculation: {
        method: "unavailable",
        grade: "E",
        status: "unavailable",
        methodologyVersion: "recipe-calc-1.0",
        retentionDataVersion: null,
        batchNutrients: [],
        calculatedAt: now,
      },
      tags: {
        mealTypes: [],
        cuisines: [],
        dietary: [],
        equipment: [],
        difficulty: "beginner",
      },
      allergenInfo: [
        {
          tag: "allergens",
          state: "unknown",
          basis:
            "User-created recipe. Ingredient declarations and cross-contamination are not independently verified.",
        },
      ],
      createdAt: now,
      revisionReason: options.reason,
    }),
  );
}
export function mealPlanDraft(
  title: string,
  date: string,
  days: number,
  zone: string,
  slots: string[],
): MealPlanVersion {
  const now = new Date().toISOString();
  return recalculateMealPlan(
    mealPlanVersionSchema.parse({
      id: newNutritionId("mpver"),
      schemaVersion: 1,
      mealPlanId: newNutritionId("mplan"),
      versionNumber: 1,
      title,
      startDate: date,
      dayCount: days,
      timeZone: zone,
      targetSnapshot: null,
      referenceSnapshots: [],
      mealSlots: slots,
      plannedItems: [],
      batchIds: [],
      summary: {
        dailySummaries: [],
        averageNutrients: [],
        completeness: "unavailable",
        calculatedAt: now,
      },
      createdAt: now,
      revisionReason: "Created manually",
    }),
  );
}
export const recipeCsvKinds = [
  "recipe_ingredients",
  "recipe_nutrition",
  "meal_plan_calendar",
  "meal_plan_nutrition",
  "grocery_lists",
] as const;
export function exportRecipeCsv(
  b: RecipeBackup,
  kind: (typeof recipeCsvKinds)[number],
) {
  let rows: unknown[][];
  if (kind === "recipe_ingredients")
    rows = [
      [
        "recipe_id",
        "version_id",
        "ingredient_id",
        "name",
        "kind",
        "grams",
        "source_record_ids",
      ],
      ...b.recipeVersions.flatMap((v) =>
        v.ingredients.map((i) => [
          v.recipeId,
          v.id,
          i.id,
          i.displayNameSnapshot,
          i.kind,
          i.gramWeight,
          i.nutrients
            .map((n) => n.sourceRecordId)
            .filter(Boolean)
            .join("|"),
        ]),
      ),
    ];
  else if (kind === "recipe_nutrition")
    rows = [
      [
        "recipe_id",
        "version_id",
        "nutrient_id",
        "unit",
        "batch",
        "per_100g",
        "per_serving",
        "status",
        "mass_coverage_percent",
        "grade",
      ],
      ...b.recipeVersions.flatMap((v) =>
        v.calculation.batchNutrients.map((n) => [
          v.recipeId,
          v.id,
          n.nutrientId,
          n.unit,
          n.batchValue,
          n.per100gValue,
          n.perServingValue,
          n.status,
          n.massCoveragePercent,
          v.calculation.grade,
        ]),
      ),
    ];
  else if (kind === "meal_plan_calendar")
    rows = [
      [
        "plan_id",
        "version_id",
        "item_id",
        "date",
        "meal",
        "kind",
        "name",
        "quantity",
        "grams",
        "recipe_version",
        "completeness",
      ],
      ...b.mealPlanVersions.flatMap((v) =>
        v.plannedItems.map((i) => [
          v.mealPlanId,
          v.id,
          i.id,
          i.localDate,
          i.mealSlotId,
          i.kind,
          i.displayNameSnapshot,
          i.quantity,
          i.gramWeight,
          i.recipeRef?.recipeVersionId,
          i.completeness,
        ]),
      ),
    ];
  else if (kind === "meal_plan_nutrition")
    rows = [
      [
        "plan_id",
        "version_id",
        "date",
        "nutrient_id",
        "unit",
        "known_value",
        "status",
      ],
      ...b.mealPlanVersions.flatMap((v) =>
        v.summary.dailySummaries.flatMap((d) =>
          d.nutrients.map((n) => [
            v.mealPlanId,
            v.id,
            d.localDate,
            n.nutrientId,
            n.unit,
            n.value,
            n.status,
          ]),
        ),
      ),
    ];
  else
    rows = [
      [
        "list_id",
        "plan_version",
        "item_id",
        "name",
        "required_g",
        "on_hand_g",
        "remaining_g",
        "manual_purchase",
        "purchased",
        "section",
        "quality",
      ],
      ...b.groceryLists.flatMap((l) =>
        l.items.map((i) => [
          l.id,
          l.mealPlanVersionId,
          i.id,
          i.displayName,
          i.requiredGrams,
          i.onHandGrams,
          i.remainingGrams,
          i.practicalPurchaseQuantity,
          i.purchased,
          i.storeSection,
          i.qualityFlags?.join("|"),
        ]),
      ),
    ];
  return rows
    .map((row) =>
      row
        .map(
          (value) =>
            `"${String(value ?? "")
              .replace(/^[=+@-]/, "'$&")
              .replaceAll('"', '""')}"`,
        )
        .join(","),
    )
    .join("\r\n");
}
