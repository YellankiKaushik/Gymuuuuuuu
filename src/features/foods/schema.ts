import { z } from "zod";
import reference from "../../content/foods/reference.json";
import {
  foodNormativeSchema,
  compositionProfileNormativeSchema,
  nutrientMeasurementNormativeSchema,
} from "./schema.generated";
export type Food = z.infer<typeof foodNormativeSchema>;
export type CompositionProfile = z.infer<
  typeof compositionProfileNormativeSchema
>;
export type NutrientMeasurement = z.infer<
  typeof nutrientMeasurementNormativeSchema
>;
export const foodReference = reference;
export const numericStatuses = [
  "measured",
  "calculated",
  "imputed",
  "estimated",
] as const;
export const normalizeFoodTerm = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLocaleLowerCase("en")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
export function profileIssues(p: CompositionProfile): string[] {
  const errors: string[] = [];
  const unique = (ids: string[], name: string) => {
    if (new Set(ids).size !== ids.length) errors.push(`Duplicate ${name}`);
  };
  unique(
    p.nutrients.map((n) => n.nutrientId),
    "nutrient",
  );
  unique(
    p.sourceRecords.map((s) => s.sourceRecordId),
    "source record",
  );
  unique(
    p.portions.map((s) => s.portionId),
    "portion",
  );
  for (const n of p.nutrients) {
    const numeric = numericStatuses.some((s) => s === n.status);
    if (numeric !== (n.value !== null))
      errors.push(`${n.nutrientId}: value/status mismatch`);
    if (
      n.unit !==
      reference.nutrientRegistry.find((r) => r.id === n.nutrientId)
        ?.canonicalUnit
    )
      errors.push(`${n.nutrientId}: noncanonical unit`);
    if (!p.sourceRecords.some((s) => s.sourceRecordId === n.sourceRecordId))
      errors.push(`${n.nutrientId}: missing source`);
    if (n.minValue != null && n.maxValue != null && n.minValue > n.maxValue)
      errors.push(`${n.nutrientId}: reversed bounds`);
    if (
      n.value != null &&
      ((n.minValue != null && n.value < n.minValue) ||
        (n.maxValue != null && n.value > n.maxValue))
    )
      errors.push(`${n.nutrientId}: value outside bounds`);
    if (
      (n.status === "estimated" ||
        n.status === "imputed" ||
        n.minValue != null ||
        n.maxValue != null) &&
      !n.methodNote?.trim()
    )
      errors.push(`${n.nutrientId}: documented method required`);
  }
  for (const portion of p.portions)
    if (
      !p.sourceRecords.some((s) => s.sourceRecordId === portion.sourceRecordId)
    )
      errors.push(`${portion.portionId}: missing source`);
  if (p.review.status === "approved") {
    if (!p.review.reviewer?.trim() || !p.review.reviewedAt)
      errors.push("Approved profile requires review signoff");
    for (const s of p.sourceRecords) {
      if (!s.release.trim() || !s.citation?.trim() || !s.licenseNote?.trim())
        errors.push(`${s.sourceRecordId}: incomplete provenance`);
      if (
        s.sourceId.startsWith("usda") &&
        s.release !==
          reference.sourceRegistry.find((r) => r.id === s.sourceId)?.release
      )
        errors.push(
          `${s.sourceRecordId}: release must match the pinned source registry`,
        );
      if (
        s.sourceId === "fao_infoods_guidelines" ||
        s.sourceId === "icmr_nin_ifct_2017_reference"
      )
        errors.push(
          `${s.sourceRecordId}: reference-only source cannot supply distributable composition`,
        );
      if (
        s.matchType === "close_match" &&
        !p.review.qualityNotes.some((n) => n.trim())
      )
        errors.push("Close match requires limitations");
    }
    const energy = p.nutrients.find((n) => n.nutrientId === "energy_kcal");
    if (
      (!energy || energy.value === null) &&
      !p.review.qualityNotes.some((n) => /energy/i.test(n))
    )
      errors.push("Energy or documented absence required");
    if (!p.nutrients.length)
      errors.push("Approved profile requires composition data");
  }
  return errors;
}
export const compositionProfileSchema =
  compositionProfileNormativeSchema.superRefine((p, ctx) => {
    for (const message of profileIssues(p))
      ctx.addIssue({ code: "custom", message });
  });
export const foodSchema = foodNormativeSchema.superRefine((f, ctx) => {
  const error = (message: string) => ctx.addIssue({ code: "custom", message });
  if (
    reference.foodSubgroups.find((s) => s.id === f.subgroupId)?.categoryId !==
    f.categoryId
  )
    error("Subgroup/category mismatch");
  for (const tag of f.dietaryTags ?? [])
    if (!reference.dietaryTags.includes(tag))
      error(`Unknown dietary tag ${tag}`);
  for (const tag of f.allergenTags ?? [])
    if (!reference.allergenTags.includes(tag))
      error(`Unknown allergen tag ${tag}`);
  if (
    new Set(f.compositionProfiles.map((p) => p.profileId)).size !==
    f.compositionProfiles.length
  )
    error("Duplicate profile ID");
  for (const p of f.compositionProfiles)
    for (const issue of profileIssues(p)) error(`${p.profileId}: ${issue}`);
  if (
    f.defaultProfileId &&
    !f.compositionProfiles.some((p) => p.profileId === f.defaultProfileId)
  )
    error("Default profile missing");
  if (f.status === "published") {
    if (
      f.editorial.reviewStatus !== "approved" ||
      !f.editorial.reviewedAt ||
      !f.editorial.reviewer?.trim()
    )
      error("Publication requires identity signoff");
    if (
      !f.compositionProfiles.some(
        (p) =>
          p.profileId === f.defaultProfileId && p.review.status === "approved",
      )
    )
      error("Publication requires approved default profile");
    if (
      f.compositionStatus === "unpopulated" ||
      f.compositionStatus === "superseded"
    )
      error("Publication requires current composition");
    for (const m of f.media ?? [])
      if (
        m.status !== "rights_verified" ||
        !m.license.trim() ||
        !m.attribution.trim() ||
        !m.alt.trim() ||
        !m.src.startsWith("/media/")
      )
        error("Public media requires local rights-cleared assets");
  }
});
export const validateFoodIdentity = (input: unknown) => foodSchema.parse(input);
export const validateCompositionProfile = (input: unknown) =>
  compositionProfileSchema.parse(input);
