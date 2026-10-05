import { z } from "zod";
import { sourceMetadataNormativeSchema } from "../../features/recipes-meal-plans/schema.generated";
export const recipeLogReferenceSchema = z.strictObject({
  recipeId: z.string().regex(/^recipe_[a-zA-Z0-9_-]+$/),
  recipeVersionId: z.string().regex(/^rver_[a-zA-Z0-9_-]+$/),
  versionNumber: z.number().int().positive(),
  title: z.string().min(1).max(200),
  calculationGrade: z.enum(["A", "B", "C", "D", "E"]),
  methodologyVersion: z.string().min(1),
  retentionDataVersion: z.string().nullable(),
  sourceMetadata: sourceMetadataNormativeSchema.extend({
    reviewer: z.string().nullable().optional(),
    attribution: z.string().nullable().optional(),
  }),
  sourceRecordIds: z.array(z.string().min(1)),
  ingredientSources: z.array(
    z.strictObject({
      ingredientId: z.string().min(1),
      sourceKind: z.enum(["canonical_food", "custom_food"]),
      sourceRecords: z.array(z.json()),
      customRevision: z.json().optional(),
    }),
  ),
  nutrientQuality: z.array(
    z.strictObject({
      nutrientId: z.string().min(1),
      status: z.enum(["complete", "partial", "unavailable", "not_applicable"]),
      massCoveragePercent: z.number().finite().min(0).max(100),
    }),
  ),
  plannedItemRef: z
    .strictObject({
      planVersionId: z.string().regex(/^mpver_/),
      plannedItemId: z.string().regex(/^pitem_/),
    })
    .optional(),
});
export type RecipeLogReference = z.infer<typeof recipeLogReferenceSchema>;
