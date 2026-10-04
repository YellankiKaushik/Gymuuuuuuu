import { z } from "zod";
import { normalizeSourceAmount } from "../foods/ingestion";
import type { ResolvedReference } from "./frameworks";
export const equivalentRuleSchema = z.strictObject({
  id: z.string().min(1),
  nutrientId: z.string().min(1),
  frameworkId: z.string().min(1),
  frameworkVersion: z.string().min(1),
  form: z.string().min(1),
  fromUnit: z.string().min(1),
  toUnit: z.string().min(1),
  factor: z.number().finite().positive(),
  sourceUrl: z.url().refine((url) => url.startsWith("https:")),
  sourceLocator: z.string().min(1),
  reviewStatus: z.literal("approved"),
});
export type EquivalentRule = z.infer<typeof equivalentRuleSchema>;
export function convertEquivalentUnit(
  value: number,
  fromUnit: string,
  toUnit: string,
  context: {
    nutrientId: string;
    frameworkId: string;
    frameworkVersion: string;
    form?: string;
  },
  rule?: EquivalentRule,
) {
  if (!Number.isFinite(value) || value < 0) throw Error("Invalid amount");
  if (fromUnit === toUnit) return value;
  try {
    return normalizeSourceAmount(value, fromUnit, toUnit);
  } catch {
    /* equivalent units require a context-specific rule */
  }
  if (!rule)
    throw Error(
      "These nutrient forms or units are not interchangeable without a verified conversion rule.",
    );
  equivalentRuleSchema.parse(rule);
  if (
    rule.nutrientId !== context.nutrientId ||
    rule.frameworkId !== context.frameworkId ||
    rule.frameworkVersion !== context.frameworkVersion ||
    rule.form !== context.form ||
    rule.fromUnit !== fromUnit ||
    rule.toUnit !== toUnit
  )
    throw Error(
      "Conversion rule does not apply to this nutrient, framework version or form.",
    );
  const converted = value * rule.factor;
  if (!Number.isFinite(converted)) throw Error("Conversion overflow");
  return converted;
}
export function calculatePercentReference(
  measurement: {
    nutrientId: string;
    value: number | null;
    unit: string;
    status: string;
    form?: string;
  },
  resolved: ResolvedReference,
  rule?: EquivalentRule,
) {
  if (resolved.status !== "value") throw Error(resolved.message);
  const { reference: r, nutrientId } = resolved.row;
  if (measurement.nutrientId !== nutrientId)
    throw Error(
      "Different nutrient concepts cannot calculate a reference percentage.",
    );
  if (
    measurement.value === null ||
    !["measured", "calculated", "imputed", "estimated"].includes(
      measurement.status,
    )
  )
    throw Error("A verified numeric food amount is required.");
  if (
    r.value == null ||
    r.value <= 0 ||
    !["per_day", "label_reference"].includes(r.basis ?? "")
  )
    throw Error(
      "A positive scalar daily or label reference is required. Ranges and body-weight references are not percentage denominators.",
    );
  const amount = convertEquivalentUnit(
    measurement.value,
    measurement.unit,
    r.unit,
    {
      nutrientId,
      frameworkId: r.frameworkId,
      frameworkVersion: resolved.dataset.version!,
      form: measurement.form,
    },
    rule,
  );
  const percent = (amount / r.value) * 100;
  if (!Number.isFinite(percent)) throw Error("Reference percentage overflow");
  return {
    percent,
    kind: ["UL", "TUL"].includes(r.valueType)
      ? "upper_limit_information"
      : "population_reference",
    frameworkId: r.frameworkId,
    frameworkVersion: resolved.dataset.version!,
    population: resolved.selection,
    valueType: r.valueType,
    explanation: ["UL", "TUL"].includes(r.valueType)
      ? "Percentage of an upper limit; it is not a progress goal."
      : "Percentage of the selected population reference; it does not diagnose adequacy or deficiency.",
  };
}
