import { z } from "zod";
import { foodReference } from "../foods/schema";
import { compositionProfileNormativeSchema } from "../foods/schema.generated";
import * as normative from "./schema.generated";
import reference from "../../content/nutrition/reference.json";
export const nutritionReference = reference;
export const nutritionNutrients = foodReference.nutrientRegistry;
export function nutrientDefinition(id: string) {
  return nutritionNutrients.find((n) => n.id === id);
}
export const validTimeZone = (value: string) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
};
const supportedVersion = z.literal(1),
  dateSchema = z.iso.date(),
  timeZoneSchema = z
    .string()
    .min(1)
    .max(80)
    .refine(validTimeZone, "Invalid IANA time zone");
const unique = (ids: readonly string[]) => new Set(ids).size === ids.length;
const sourceRecordSchema =
  compositionProfileNormativeSchema.shape.sourceRecords.element;
export const loggedNutrientSchema =
  normative.loggedNutrientNormativeSchema.superRefine((n, ctx) => {
    const definition = nutrientDefinition(n.nutrientId);
    if (!definition || definition.canonicalUnit !== n.unit)
      ctx.addIssue({
        code: "custom",
        message: "Unknown nutrient ID or incompatible canonical unit.",
      });
    if (
      ["trace", "not_available"].includes(n.sourceStatus) &&
      (n.per100gValue !== null || n.loggedValue !== null)
    )
      ctx.addIssue({
        code: "custom",
        message: "Trace and missing values must remain null.",
      });
    if (
      n.sourceStatus === "not_detected" &&
      ((n.per100gValue !== null && n.per100gValue !== 0) ||
        (n.loggedValue !== null && n.loggedValue !== 0))
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Not-detected quantities may only be explicit zero or unquantified null.",
      });
    if (
      ["measured", "calculated", "imputed", "estimated"].includes(
        n.sourceStatus,
      ) &&
      (n.per100gValue === null || n.loggedValue === null)
    )
      ctx.addIssue({
        code: "custom",
        message: "Numeric source states require quantified values.",
      });
    if (n.sourceStatus === "user_entered" && n.loggedValue === null)
      ctx.addIssue({
        code: "custom",
        message: "A user-entered nutrient needs its entered amount.",
      });
    if (n.minValue != null && n.maxValue != null && n.minValue > n.maxValue)
      ctx.addIssue({ code: "custom", message: "Reversed nutrient bound." });
  });
const unknownMassSchema = z.strictObject({
  quantity: z.number().finite().positive(),
  inputUnit: z.literal("entry"),
  gramWeight: z.null(),
  gramsPerUnit: z.null().optional(),
  conversionKind: z.literal("not_applicable"),
  portionId: z.null().optional(),
  portionDescription: z.null().optional(),
});
export const amountSchema = z.union([
  normative.amountNormativeSchema,
  unknownMassSchema,
]);
export const foodEntrySchema = normative.foodEntryNormativeSchema
  .extend({
    schemaVersion: supportedVersion,
    localDate: dateSchema,
    timeZone: timeZoneSchema,
    amount: amountSchema,
    nutrients: z.array(loggedNutrientSchema),
    sourceRecordsSnapshot: z.array(sourceRecordSchema).optional(),
    foodCategoryIdSnapshot: z.string().min(1).max(100).nullable().optional(),
  })
  .superRefine((entry, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    if (!unique(entry.nutrients.map((n) => n.nutrientId)))
      issue("Duplicate nutrient IDs.");
    if (entry.sourceKind === "recipe")
      issue(
        "Recipe entries require the Phase 11 verified recipe adapter, not available yet.",
      );
    if (entry.sourceKind !== "recipe" && entry.recipeRef)
      issue("Unexpected recipe reference on a non-recipe entry.");
    if (entry.amount.gramWeight !== null && entry.amount.gramWeight > 10000)
      issue("A food entry cannot exceed 10,000 g.");
    if (entry.amount.conversionKind === "exact_mass") {
      const factors: Record<string, number> = {
        g: 1,
        kg: 1000,
        oz: 28.349523125,
        lb: 453.59237,
      };
      const factor = factors[entry.amount.inputUnit];
      if (
        factor === undefined ||
        entry.amount.gramWeight === null ||
        Math.abs(factor * entry.amount.quantity - entry.amount.gramWeight) >
          1e-8
      )
        issue("Invalid exact mass conversion.");
    }
    if (entry.sourceKind === "canonical_food") {
      if (
        !entry.canonicalFoodRef ||
        entry.customFoodRef ||
        entry.quickAdd ||
        !entry.sourceRecordsSnapshot?.length
      )
        issue(
          "Canonical entries need their complete source snapshot and matching reference kind.",
        );
      else {
        const sourceIds = new Set(
          entry.sourceRecordsSnapshot.map((s) => s.sourceRecordId),
        );
        if (
          entry.nutrients.some(
            (n) =>
              !sourceIds.has(n.sourceRecordId) ||
              n.sourceStatus === "user_entered",
          )
        )
          issue(
            "Canonical nutrient provenance does not match its source snapshot.",
          );
        if (!sourceIds.has(entry.canonicalFoodRef.sourceRecordId))
          issue("Primary source record is missing from snapshot.");
      }
    }
    if (
      entry.sourceKind === "custom_food" &&
      (!entry.customFoodRef ||
        entry.canonicalFoodRef ||
        entry.quickAdd ||
        entry.nutrients.some(
          (n) =>
            n.sourceStatus !== "user_entered" &&
            n.sourceStatus !== "not_available",
        ))
    )
      issue(
        "Custom entries require user-entered provenance and their revision reference.",
      );
    if (
      entry.sourceKind === "quick_add" &&
      (!entry.quickAdd ||
        entry.customFoodRef ||
        entry.canonicalFoodRef ||
        entry.nutrients.some((n) => n.sourceStatus !== "user_entered"))
    )
      issue("Quick add may contain only explicitly entered nutrients.");
    if (entry.sourceKind === "quick_add" && entry.amount.gramWeight !== null)
      issue("Quick add has no measured mass; grams must remain unavailable.");
    if (entry.sourceKind !== "quick_add" && entry.amount.gramWeight === null)
      issue("Food entries require positive known gram weight.");
    if (entry.amount.gramWeight !== null) {
      for (const n of entry.nutrients)
        if (n.per100gValue !== null && n.loggedValue !== null) {
          const expected = (n.per100gValue * entry.amount.gramWeight) / 100;
          if (
            Math.abs(expected - n.loggedValue) >
            Math.max(1e-8, Math.abs(expected) * 1e-10)
          )
            issue("Logged nutrient disagrees with its stored per-100-g value.");
        }
      if (
        entry.amount.gramsPerUnit !== undefined &&
        entry.amount.gramsPerUnit !== null &&
        Math.abs(
          entry.amount.quantity * entry.amount.gramsPerUnit -
            entry.amount.gramWeight,
        ) > 1e-8
      )
        issue("Portion or mass conversion disagrees with stored grams.");
      if (
        entry.amount.conversionKind === "verified_source_portion" &&
        (!entry.amount.portionId ||
          !entry.amount.portionDescription ||
          !entry.amount.gramsPerUnit)
      )
        issue("Verified portion snapshot is incomplete.");
    }
    if (
      entry.sourceKind === "quick_add" &&
      !entry.nutrients.some((n) => n.nutrientId === "energy_kcal")
    )
      issue("Quick add requires explicitly entered calories.");
    if (
      entry.sourceKind === "quick_add" &&
      entry.nutrients.some(
        (n) =>
          ![
            "energy_kcal",
            "protein_g",
            "carbohydrate_total_g",
            "fat_total_g",
            "fiber_total_g",
          ].includes(n.nutrientId) || n.per100gValue !== null,
      )
    )
      issue("Quick add cannot infer micronutrients or per-mass values.");
  });
export const preferencesSchema = normative.preferencesNormativeSchema
  .extend({ schemaVersion: supportedVersion })
  .superRefine((p, ctx) => {
    if (
      !unique(p.mealSlots.map((s) => s.id)) ||
      !unique(p.mealSlots.map((s) => String(s.order)))
    )
      ctx.addIssue({
        code: "custom",
        message: "Meal slots need unique stable IDs and ordering.",
      });
    const defaults = new Set(reference.defaultMealSlots.map((s) => s.id));
    if (p.mealSlots.filter((s) => !defaults.has(s.id)).length > 5)
      ctx.addIssue({
        code: "custom",
        message: "At most five custom meal slots are supported.",
      });
  });
export const targetSnapshotSchema =
  normative.targetSnapshotNormativeSchema.superRefine((t, ctx) => {
    if (
      t.proteinRangeGrams &&
      ((t.proteinRangeGrams[0] ?? 0) > (t.proteinRangeGrams[1] ?? 0) ||
        (t.proteinGrams !== null &&
          (t.proteinGrams < (t.proteinRangeGrams[0] ?? 0) ||
            t.proteinGrams > (t.proteinRangeGrams[1] ?? 0))))
    )
      ctx.addIssue({
        code: "custom",
        message: "Protein range and selected target disagree.",
      });
  });
export const referenceSnapshotSchema =
  normative.referenceSnapshotNormativeSchema
    .extend({
      population: z.strictObject({
        ageMonths: z.number().int().min(228).max(1200),
        sex: z.enum(["all", "male", "female"]),
        lifeStage: z.literal("general"),
      }),
      basis: z.enum(["per_day", "label_reference"]),
      formScope: z.enum([
        "all_food_forms",
        "specific_form",
        "supplemental_only",
        "unspecified",
      ]),
    })
    .superRefine((r, ctx) => {
      const n = nutrientDefinition(r.nutrientId);
      if (!n || n.canonicalUnit !== r.unit)
        ctx.addIssue({
          code: "custom",
          message:
            "Reference unit does not match the recorded food nutrient concept.",
        });
      if (["EAR", "AR"].includes(r.referenceType))
        ctx.addIssue({
          code: "custom",
          message:
            "EAR/AR are unavailable in default personal progress comparisons.",
        });
      if (
        r.scope === "supplemental_only" ||
        r.scope === "other" ||
        r.formScope !== "all_food_forms"
      )
        ctx.addIssue({
          code: "custom",
          message: "This source scope cannot be compared with food-only logs.",
        });
      if (r.referenceType === "DV" && r.scope !== "label_reference")
        ctx.addIssue({
          code: "custom",
          message: "DV must retain its label-reference context.",
        });
    });
export const nutritionDaySchema = normative.nutritionDayNormativeSchema
  .extend({
    schemaVersion: supportedVersion,
    localDate: dateSchema,
    timeZone: timeZoneSchema,
    targetSnapshot: targetSnapshotSchema.nullable(),
    referenceSnapshots: z.array(referenceSnapshotSchema),
  })
  .refine(
    (d) =>
      unique(
        d.referenceSnapshots.map(
          (r) => `${r.nutrientId}:${r.frameworkId}:${r.referenceType}`,
        ),
      ),
    "Duplicate day reference snapshots",
  );
export const hydrationSchema = normative.hydrationEntryNormativeSchema.extend({
  schemaVersion: supportedVersion,
  localDate: dateSchema,
  timeZone: timeZoneSchema,
});
export const customRevisionSchema =
  normative.customFoodRevisionNormativeSchema.superRefine((r, ctx) => {
    if (!unique(r.nutrients.map((n) => n.nutrientId)))
      ctx.addIssue({
        code: "custom",
        message: "Duplicate custom nutrient IDs.",
      });
    for (const n of r.nutrients) {
      const d = nutrientDefinition(n.nutrientId);
      if (!d || d.canonicalUnit !== n.unit)
        ctx.addIssue({
          code: "custom",
          message:
            "Custom nutrient needs an explicit absolute amount in its canonical unit.",
        });
    }
  });
export const customFoodSchema = normative.customFoodNormativeSchema;
export const favouriteSchema = normative.favouriteNormativeSchema
  .extend({ entrySnapshot: foodEntrySchema })
  .superRefine((f, ctx) => {
    if (f.sourceKind !== f.entrySnapshot.sourceKind)
      ctx.addIssue({
        code: "custom",
        message: "Favourite must preserve a canonical/custom food snapshot.",
      });
    if (
      JSON.stringify(f.amount) !== JSON.stringify(f.entrySnapshot.amount) ||
      JSON.stringify(f.customFoodRef ?? null) !==
        JSON.stringify(f.entrySnapshot.customFoodRef ?? null) ||
      JSON.stringify(f.canonicalFoodRef ?? null) !==
        JSON.stringify(f.entrySnapshot.canonicalFoodRef ?? null)
    )
      ctx.addIssue({
        code: "custom",
        message:
          "Favourite amount and source must match its immutable entry snapshot.",
      });
    if (
      (f.sourceKind === "canonical_food" && !f.canonicalFoodRef) ||
      (f.sourceKind === "custom_food" && !f.customFoodRef)
    )
      ctx.addIssue({
        code: "custom",
        message: "Favourite reference is missing.",
      });
  });
export const nutritionBackupSchema = normative.backupNormativeSchema
  .extend({
    schemaVersion: supportedVersion,
    preferences: preferencesSchema,
    days: z.array(nutritionDaySchema),
    foodEntries: z.array(foodEntrySchema),
    hydrationEntries: z.array(hydrationSchema),
    customFoods: z.array(customFoodSchema),
    customFoodRevisions: z.array(customRevisionSchema),
    favourites: z.array(favouriteSchema),
  })
  .superRefine((b, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    for (const [name, ids] of [
      ["days", b.days.map((d) => d.localDate)],
      ["entries", b.foodEntries.map((e) => e.id)],
      ["hydration", b.hydrationEntries.map((e) => e.id)],
      ["foods", b.customFoods.map((f) => f.id)],
      ["revisions", b.customFoodRevisions.map((r) => r.id)],
      ["favourites", b.favourites.map((f) => f.id)],
      ["audits", b.auditLog.map((a) => a.id)],
    ] as const)
      if (!unique(ids)) issue(`Duplicate ${name} identities.`);
    const days = new Set(b.days.map((d) => d.localDate)),
      foods = new Map(b.customFoods.map((f) => [f.id, f])),
      revisions = new Map(b.customFoodRevisions.map((r) => [r.id, r]));
    if (
      [...b.foodEntries, ...b.hydrationEntries].some(
        (e) => !days.has(e.localDate),
      )
    )
      issue("An entry has no owning day snapshot.");
    for (const f of b.customFoods)
      if (revisions.get(f.currentRevisionId)?.customFoodId !== f.id)
        issue("Custom current revision is missing or belongs to another food.");
    for (const r of b.customFoodRevisions)
      if (!foods.has(r.customFoodId))
        issue("Custom revision has no owning food.");
    for (const e of [
      ...b.foodEntries,
      ...b.favourites.map((f) => f.entrySnapshot),
    ])
      if (
        e.customFoodRef &&
        revisions.get(e.customFoodRef.revisionId)?.customFoodId !==
          e.customFoodRef.customFoodId
      )
        issue("Custom entry revision is missing or mismatched.");
    for (const e of [
      ...b.foodEntries,
      ...b.favourites.map((f) => f.entrySnapshot),
    ]) {
      if (!e.customFoodRef) continue;
      const revision = revisions.get(e.customFoodRef.revisionId);
      if (!revision) continue;
      for (const n of e.nutrients) {
        const value = revision.nutrients.find(
            (v) => v.nutrientId === n.nutrientId,
          ),
          expected = value
            ? (value.value * 100) /
              (revision.basis === "per_serving"
                ? revision.serving.gramWeight
                : 100)
            : null;
        if (n.sourceRecordId !== revision.id || n.per100gValue !== expected)
          issue("Custom log snapshot disagrees with its immutable revision.");
      }
      if (
        revision.nutrients.some(
          (n) => !e.nutrients.some((v) => v.nutrientId === n.nutrientId),
        )
      )
        issue("Custom log snapshot omitted an entered revision nutrient.");
    }
    const revisionKeys = b.customFoodRevisions.map(
      (r) => `${r.customFoodId}:${r.revisionNumber}`,
    );
    if (!unique(revisionKeys)) issue("Duplicate custom revision numbers.");
  });
export type FoodEntry = z.infer<typeof foodEntrySchema>;
export type LoggedNutrient = z.infer<typeof loggedNutrientSchema>;
export type NutritionDay = z.infer<typeof nutritionDaySchema>;
export type NutritionPreferences = z.infer<typeof preferencesSchema>;
export type NutritionBackup = z.infer<typeof nutritionBackupSchema>;
export type CustomFood = z.infer<typeof customFoodSchema>;
export type CustomFoodRevision = z.infer<typeof customRevisionSchema>;
export type HydrationEntry = z.infer<typeof hydrationSchema>;
export type NutritionFavourite = z.infer<typeof favouriteSchema>;
export type TargetSnapshot = z.infer<typeof targetSnapshotSchema>;
export type ReferenceSnapshot = z.infer<typeof referenceSnapshotSchema>;
