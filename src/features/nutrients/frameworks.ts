import { z } from "zod";
import datasetJson from "../../content/nutrients/framework-datasets.json";
import {
  nutrientReference,
  type FrameworkId,
  type ReferenceValue,
} from "./schema";
export const frameworkDatasetSchema = z.strictObject({
  id: z.enum([
    "us_canada_dri",
    "fda_dv_adult_4_plus",
    "icmr_nin_2020",
    "efsa_drv",
  ]),
  version: z.string().min(1).nullable(),
  authority: z.string().min(1),
  status: z.enum(["unpopulated", "pending_review", "approved", "withdrawn"]),
  rightsStatus: z.enum(["pending_review", "approved"]),
});
export type FrameworkDataset = z.infer<typeof frameworkDatasetSchema>;
export const frameworkDatasets = frameworkDatasetSchema
  .array()
  .parse(datasetJson);
export const populationSelectionSchema = z
  .strictObject({
    frameworkId: z.enum([
      "us_canada_dri",
      "fda_dv_adult_4_plus",
      "icmr_nin_2020",
      "efsa_drv",
    ]),
    frameworkVersion: z.string().min(1).nullable(),
    ageMonths: z.number().int().min(0).max(1800),
    sex: z.enum(["all", "male", "female"]),
    lifeStage: z.enum(["general", "pregnancy", "lactation"]),
  })
  .refine(
    (p) => p.sex !== "male" || p.lifeStage === "general",
    "Incompatible life-stage selection",
  );
export type PopulationSelection = z.infer<typeof populationSelectionSchema>;
export type ReferenceRow = {
  nutrientId: string;
  nutrientName: string;
  reference: ReferenceValue;
};
export type ResolvedReference =
  | {
      status: "value";
      row: ReferenceRow;
      dataset: FrameworkDataset;
      selection: PopulationSelection;
    }
  | {
      status: "unavailable" | "unsupported_framework" | "ambiguous";
      message: string;
    };
export function populationLabel(selection: PopulationSelection) {
  return `${selection.ageMonths} months · ${selection.sex} · ${selection.lifeStage}`;
}
export function resolveReferenceValue(
  nutrientId: string,
  valueType: ReferenceValue["valueType"],
  rows: ReferenceRow[],
  selection: PopulationSelection,
  datasets: FrameworkDataset[] = frameworkDatasets,
): ResolvedReference {
  populationSelectionSchema.parse(selection);
  const dataset = datasets.find((d) => d.id === selection.frameworkId);
  if (
    !dataset ||
    dataset.status !== "approved" ||
    dataset.rightsStatus !== "approved" ||
    !dataset.version ||
    dataset.version !== selection.frameworkVersion
  )
    return {
      status: "unsupported_framework",
      message:
        "This framework version has no approved reference dataset. No values are inferred.",
    };
  const matches = rows.filter(
    ({ nutrientId: id, reference: r }) =>
      id === nutrientId &&
      r.frameworkId === selection.frameworkId &&
      r.valueType === valueType &&
      ["source_verified", "manually_verified", "not_applicable"].includes(
        r.status,
      ) &&
      r.population.lifeStage === selection.lifeStage &&
      (r.population.sex === "all" || r.population.sex === selection.sex) &&
      selection.ageMonths >= r.population.ageMinMonths &&
      (r.population.ageMaxMonths === null ||
        selection.ageMonths <= r.population.ageMaxMonths),
  );
  if (matches.length > 1)
    return {
      status: "ambiguous",
      message: "Overlapping reference rows require review. No value is chosen.",
    };
  if (!matches[0])
    return {
      status: "unavailable",
      message:
        "No reviewed reference row is available for this framework and population.",
    };
  return { status: "value", row: matches[0], dataset, selection };
}
export function formatReferenceValue(r: ReferenceValue) {
  if (r.value == null && r.minValue == null && r.maxValue == null)
    return r.valueType === "no_value_established" ||
      r.status === "not_applicable"
      ? "No value established by this source"
      : "No numeric value available";
  const format = (n: number) =>
    new Intl.NumberFormat("en", { maximumSignificantDigits: 4 }).format(n);
  return r.minValue != null && r.maxValue != null
    ? `${format(r.minValue)}–${format(r.maxValue)} ${r.unit}`
    : `${r.value != null ? format(r.value) : "Not available"} ${r.unit}`;
}
export const getFramework = (id: FrameworkId) =>
  nutrientReference.referenceFrameworks.find((f) => f.id === id);
export function referenceContext(r: ReferenceValue) {
  if (["UL", "TUL"].includes(r.valueType))
    return "Upper-limit information, not an intake goal.";
  if (r.valueType === "EAR" || r.valueType === "AR")
    return "Population requirement estimate, not a personal daily target.";
  if (r.valueType === "DV") return "Food-label reference, not a personal RDA.";
  if (r.valueType === "CDRR")
    return "Chronic disease risk reduction reference, not a toxicity threshold.";
  return "Population reference, not a medical prescription.";
}
