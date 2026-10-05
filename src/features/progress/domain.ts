import { circumferenceSchema, compositionSchema, heightSchema, weightLogSchema, type CircumferenceSession, type HeightMeasurement, type WeightLog } from "./schema";

export function median(values: readonly number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b), middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}
export function validateWeight(input: unknown) { return weightLogSchema.safeParse(input); }
export function validateCircumference(input: unknown) {
  const parsed = circumferenceSchema.safeParse(input);
  if (!parsed.success) return parsed;
  const derived = median(parsed.data.replicatesMm);
  if (derived !== parsed.data.canonicalMm) return { success: false as const, error: new Error("Canonical circumference must equal the median of its recorded replicates.") };
  return parsed;
}
export function validateComposition(input: unknown) {
  const parsed = compositionSchema.safeParse(input);
  if (!parsed.success) return parsed;
  const m = parsed.data;
  if (m.fatMassKg !== null && m.fatFreeMassKg !== null && m.bodyFatPercent !== null && m.fatMassKg + m.fatFreeMassKg > 1000)
    return { success: false as const, error: new Error("Recorded composition values exceed the supported technical limit.") };
  return parsed;
}
export const validateHeight = heightSchema.safeParse;

export const weightMethodVersion = "weight-summary-v1";
export type WeightSummary = { localDate: string; medianKg: number; recordCount: number; recordIds: string[]; flags: string[] };
export function dailyWeightSummaries(rows: WeightLog[]): WeightSummary[] {
  const grouped = new Map<string, WeightLog[]>();
  for (const row of rows) if (row.deletedAt === null) grouped.set(row.localDate, [...(grouped.get(row.localDate) ?? []), row]);
  return [...grouped].sort(([a], [b]) => a.localeCompare(b)).map(([localDate, values]) => ({
    localDate, medianKg: median(values.map((v) => v.valueKg))!, recordCount: values.length, recordIds: values.map((v) => v.id),
    flags: values.some((v) => v.retrospective) ? ["retrospective_entry"] : [],
  }));
}
export type Trend = { valueKg: number | null; sampleDays: number; windowDays: number; methodVersion: string; flag: string | null };
export function weightTrend(summaries: WeightSummary[], windowDays: 7 | 28): Trend {
  const minimum = windowDays === 7 ? 3 : 10;
  const recent = summaries;
  const methodVersion = `weight-trend-${windowDays}-v1`;
  if (recent.length < minimum) return { valueKg: null, sampleDays: recent.length, windowDays, methodVersion, flag: "insufficient_samples" };
  return { valueKg: recent.reduce((sum, row) => sum + row.medianKg, 0) / recent.length, sampleDays: recent.length, windowDays, methodVersion, flag: null };
}
export function bmi(height: HeightMeasurement | null, weightKg: number | null): number | null {
  if (!height || weightKg === null || height.valueCm <= 0) return null;
  const metres = height.valueCm / 100;
  return weightKg / (metres * metres);
}
export const compatibleCircumference = (a: CircumferenceSession, b: CircumferenceSession) => a.siteId === b.siteId && a.protocolId === b.protocolId && a.protocolVersion === b.protocolVersion && a.side === b.side && a.posture === b.posture && a.breathingPhase === b.breathingPhase;
export function groupCompatibleCircumferences(rows: CircumferenceSession[]) {
  const groups: CircumferenceSession[][] = [];
  for (const row of rows) {
    const group = groups.find((items) => items[0] && compatibleCircumference(items[0], row));
    if (group) group.push(row); else groups.push([row]);
  }
  return groups;
}
export const compositionMethodVersion = "external-composition-report-v1";
export const weightTechnicalBoundsKg = { minExclusive: 0, maxInclusive: 1000 } as const;
