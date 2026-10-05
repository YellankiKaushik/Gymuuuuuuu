import {
  foodSchema,
  compositionProfileSchema,
  type Food,
  type CompositionProfile,
} from "../foods/schema";
import { dietPlanSchema, type DietPlan } from "../diet-planning/domain";
import {
  amountSchema,
  foodEntrySchema,
  customRevisionSchema,
  nutritionBackupSchema,
  nutritionDaySchema,
  targetSnapshotSchema,
  referenceSnapshotSchema,
  nutritionReference,
  nutritionNutrients,
  preferencesSchema,
  customFoodSchema,
  type FoodEntry,
  type LoggedNutrient,
  type CustomFoodRevision,
  type NutritionDay,
  type TargetSnapshot,
  type ReferenceSnapshot,
  type NutritionBackup,
} from "./schema";

export const macroIds = [
  "energy_kcal",
  "protein_g",
  "carbohydrate_total_g",
  "fat_total_g",
  "fiber_total_g",
] as const;
export const newNutritionId = (prefix: string) =>
  `${prefix}_${crypto.randomUUID()}`;
export function defaultNutritionPreferences(now = new Date().toISOString()) {
  return preferencesSchema.parse({
    id: "nutrition-preferences",
    schemaVersion: 1,
    massUnit: "g",
    energyUnit: "kcal",
    mealSlots: nutritionReference.defaultMealSlots,
    currentDietPlanId: null,
    referenceProfileId: null,
    showMicronutrients: false,
    updatedAt: now,
  });
}
export function localDateAt(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export function consumedInstant(
  date: string,
  time: string,
  timeZone: string,
  now = new Date(),
) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  )
    throw Error("Choose a valid consumed date and time.");
  const guess = Date.parse(`${date}T${time}:00Z`);
  let value = guess;
  for (let i = 0; i < 4; i++) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(value));
    const get = (type: string) => parts.find((p) => p.type === type)?.value;
    const rendered = Date.parse(
      `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:00Z`,
    );
    value += guess - rendered;
  }
  const result = new Date(value);
  if (
    localDateAt(result, timeZone) !== date ||
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(result) !== time
  )
    throw Error(
      "This local time does not exist in the selected time zone. Choose another time.",
    );
  if (value > now.getTime())
    throw Error("Consumed time cannot be in the future.");
  return result.toISOString();
}
export function convertNutritionAmountToGrams(quantity: number, unit: string) {
  const factors: Record<string, number> = {
    g: 1,
    kg: 1000,
    oz: 28.349523125,
    lb: 453.59237,
  };
  const factor = factors[unit];
  if (factor === undefined || !Number.isFinite(quantity) || quantity <= 0)
    throw Error(
      "Use a positive exact mass in g, kg, oz or lb. Generic volume cannot be converted to mass.",
    );
  const grams = quantity * factor;
  if (grams > 10000) throw Error("Log no more than 10,000 g per food entry.");
  return grams;
}
export function resolveVerifiedFoodPortion(
  profile: CompositionProfile,
  id: string,
  quantity: number,
) {
  const portion = profile.portions.find((p) => p.portionId === id);
  if (
    !portion ||
    portion.status === "estimated" ||
    !Number.isFinite(quantity) ||
    quantity <= 0
  )
    throw Error(
      "Choose a source-reported or measured portion, or enter measured grams.",
    );
  return amountSchema.parse({
    quantity,
    inputUnit: "portion",
    portionId: id,
    portionDescription: portion.label,
    gramsPerUnit: portion.grams,
    gramWeight: portion.grams * quantity,
    conversionKind: "verified_source_portion",
  });
}
export function exactMassAmount(quantity: number, unit: string) {
  return amountSchema.parse({
    quantity,
    inputUnit: unit,
    gramsPerUnit: convertNutritionAmountToGrams(1, unit),
    gramWeight: convertNutritionAmountToGrams(quantity, unit),
    conversionKind: "exact_mass",
  });
}
export type EntryContext = {
  localDate: string;
  occurredAtUtc: string;
  timeZone: string;
  localTime?: string;
  mealSlotId: string;
  mealLabelSnapshot: string;
  note?: string;
  now?: string;
};
function baseEntry(context: EntryContext) {
  const now = context.now ?? new Date().toISOString();
  if (Date.parse(context.occurredAtUtc) > Date.parse(now))
    throw Error("Consumed time cannot be in the future.");
  return {
    id: newNutritionId("nentry"),
    schemaVersion: 1 as const,
    ...context,
    now: undefined,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    revision: 1,
  };
}
// Remove the construction-only timestamp option before strict record validation.
function base(context: EntryContext) {
  const { now: _now, ...record } = baseEntry(context);
  void _now;
  return record;
}
export function calculateLoggedNutrients(
  nutrients: readonly LoggedNutrient[],
  grams: number,
) {
  if (!Number.isFinite(grams) || grams <= 0 || grams > 10000)
    throw Error("Choose a positive mass up to 10,000 g.");
  return nutrients.map((n) => ({
    ...n,
    loggedValue:
      n.per100gValue === null ? null : (n.per100gValue * grams) / 100,
  }));
}
export function calculateLoggedNutrientSnapshot(
  profile: CompositionProfile,
  grams: number,
): LoggedNutrient[] {
  return calculateLoggedNutrients(
    profile.nutrients.map((n) => ({
      nutrientId: n.nutrientId,
      unit: n.unit,
      sourceStatus: n.status,
      per100gValue: n.value,
      loggedValue: n.value,
      sourceRecordId: n.sourceRecordId,
      methodNote: n.methodNote,
      minValue: n.minValue,
      maxValue: n.maxValue,
    })),
    grams,
  );
}
export function createCanonicalFoodLogSnapshot(
  food: Food,
  profileId: string,
  amount: FoodEntry["amount"],
  context: EntryContext,
): FoodEntry {
  const f = foodSchema.parse(food),
    p = f.compositionProfiles.find((p) => p.profileId === profileId);
  if (
    f.status !== "published" ||
    !p ||
    p.review.status !== "approved" ||
    !p.review.reviewedAt
  )
    throw Error(
      "Only published foods with an approved exact profile can be logged.",
    );
  compositionProfileSchema.parse(p);
  if (amount.gramWeight === null) throw Error("This food needs a known mass.");
  const source = p.sourceRecords[0];
  if (!source) throw Error("Missing profile source.");
  const grams = amount.gramWeight;
  return foodEntrySchema.parse({
    ...base(context),
    sourceKind: "canonical_food",
    foodCategoryIdSnapshot: f.categoryId,
    displayNameSnapshot: f.canonicalName,
    canonicalFoodRef: {
      foodId: f.id,
      foodSlug: f.slug,
      foodName: f.canonicalName,
      profileId: p.profileId,
      profileState: p.foodState,
      sourceRecordId: source.sourceRecordId,
      sourceDatabase: source.sourceId,
      sourceRelease: source.release,
      sourceLicence: source.licenseNote?.slice(0, 120) ?? null,
      profileReviewedAt: p.review.reviewedAt,
    },
    amount,
    sourceRecordsSnapshot: structuredClone(p.sourceRecords),
    nutrients: calculateLoggedNutrientSnapshot(p, grams),
  });
}
export function createCustomFoodLogSnapshot(
  revision: CustomFoodRevision,
  name: string,
  brand: string | null,
  quantity: number,
  context: EntryContext,
): FoodEntry {
  const r = customRevisionSchema.parse(revision),
    grams = r.serving.gramWeight * quantity;
  const rows = nutritionNutrients.map((n) => {
    const input = r.nutrients.find((v) => v.nutrientId === n.id),
      per100 = input
        ? (input.value * 100) /
          (r.basis === "per_serving" ? r.serving.gramWeight : 100)
        : null;
    return {
      nutrientId: n.id,
      unit: n.canonicalUnit,
      sourceStatus: input
        ? ("user_entered" as const)
        : ("not_available" as const),
      per100gValue: per100,
      loggedValue: per100 === null ? null : (per100 * grams) / 100,
      sourceRecordId: r.id,
      methodNote: r.sourceNote,
    };
  });
  return foodEntrySchema.parse({
    ...base(context),
    sourceKind: "custom_food",
    displayNameSnapshot: name,
    customFoodRef: {
      customFoodId: r.customFoodId,
      revisionId: r.id,
      name,
      brand,
      sourceType: r.sourceType,
    },
    amount: {
      quantity,
      inputUnit: "serving",
      portionDescription: r.serving.description,
      gramsPerUnit: r.serving.gramWeight,
      gramWeight: grams,
      conversionKind: "custom_food_serving",
    },
    nutrients: rows,
  });
}
export function createQuickAddSnapshot(
  description: string,
  values: Partial<Record<(typeof macroIds)[number], number>>,
  context: EntryContext,
): FoodEntry {
  const id = newNutritionId("nentry");
  return foodEntrySchema.parse({
    ...base(context),
    id,
    sourceKind: "quick_add",
    displayNameSnapshot: description,
    quickAdd: { description },
    amount: {
      quantity: 1,
      inputUnit: "entry",
      gramWeight: null,
      conversionKind: "not_applicable",
    },
    nutrients: macroIds
      .filter((n) => values[n] !== undefined)
      .map((n) => ({
        nutrientId: n,
        unit: n === "energy_kcal" ? "kcal" : "g",
        sourceStatus: "user_entered",
        per100gValue: null,
        loggedValue: values[n],
        sourceRecordId: id,
        methodNote:
          "Explicit quick-add amount; composition and mass unavailable.",
      })),
  });
}
export const validateFoodLogEntry = (value: unknown) =>
  foodEntrySchema.parse(value);
export type NutrientTotal = {
  nutrientId: string;
  unit: string;
  knownTotal: number | null;
  eligibleEntries: number;
  quantifiedEntries: number;
  traceEntries: number;
  unavailableEntries: number;
  flaggedEntries: number;
  partialEntries: number;
  coveragePercent: number | null;
  completeness: "complete" | "partial" | "unavailable" | "not_applicable";
};
export function computeNutrientCoverage(eligible: number, quantified: number) {
  return {
    coveragePercent: eligible ? (quantified / eligible) * 100 : null,
    completeness: !eligible
      ? ("not_applicable" as const)
      : quantified === eligible
        ? ("complete" as const)
        : quantified === 0
          ? ("unavailable" as const)
          : ("partial" as const),
  };
}
export function aggregateNutritionDay(
  entries: readonly FoodEntry[],
  date?: string,
): NutrientTotal[] {
  const active = entries.filter(
    (e) => e.deletedAt === null && (!date || e.localDate === date),
  );
  return nutritionNutrients.map((def) => {
    let eligible = 0,
      quantified = 0,
      trace = 0,
      missing = 0,
      flagged = 0,
      partial = 0,
      total = 0;
    for (const e of active) {
      const n = e.nutrients.find((n) => n.nutrientId === def.id);
      if (e.sourceKind === "quick_add" && !n) continue;
      eligible++;
      if (n?.loggedValue != null) {
        if (n.dataCompleteness === "partial") partial++;
        total += n.loggedValue;
        quantified++;
        if (
          [
            "calculated",
            "imputed",
            "estimated",
            "not_detected",
            "user_entered",
          ].includes(n.sourceStatus)
        )
          flagged++;
      } else if (n?.sourceStatus === "trace") trace++;
      else missing++;
    }
    return {
      nutrientId: def.id,
      unit: def.canonicalUnit,
      knownTotal: quantified ? total : null,
      eligibleEntries: eligible,
      quantifiedEntries: quantified,
      traceEntries: trace,
      unavailableEntries: missing,
      flaggedEntries: flagged,
      partialEntries: partial,
      ...computeNutrientCoverage(eligible, quantified),
      ...(partial ? { completeness: "partial" as const } : {}),
    };
  });
}
export function bindDayTargetSnapshot(
  plan: DietPlan | null,
  now = new Date().toISOString(),
): TargetSnapshot | null {
  if (!plan) return null;
  const p = dietPlanSchema.parse(plan);
  return targetSnapshotSchema.parse({
    planId: p.id,
    planVersion: 1,
    title: p.name,
    energyKcal: p.energy.targetKcal,
    proteinGrams: p.macros.protein.selected,
    proteinRangeGrams: [p.macros.protein.min, p.macros.protein.max],
    fatGrams: p.macros.fat.selected,
    carbohydrateGrams: p.macros.carbohydrate.selected,
    fiberGrams: p.macros.fiber.selected,
    formulaVersion: p.provenance.formulaSetVersion,
    referenceDataVersion: p.provenance.referenceDataVersion,
    snapshottedAt: now,
  });
}
export function bindDayReferenceSnapshot(
  references: readonly ReferenceSnapshot[],
) {
  return references.map((r) =>
    referenceSnapshotSchema.parse(structuredClone(r)),
  );
}
export function makeNutritionDay(
  date: string,
  timeZone: string,
  target: TargetSnapshot | null = null,
  references: ReferenceSnapshot[] = [],
  now = new Date().toISOString(),
): NutritionDay {
  return nutritionDaySchema.parse({
    localDate: date,
    schemaVersion: 1,
    timeZone,
    targetSnapshot: target,
    referenceSnapshots: references,
    createdAt: now,
    updatedAt: now,
  });
}
export function compareDayTotalsToTargets(
  totals: NutrientTotal[],
  target: TargetSnapshot | null,
) {
  return macroIds.map((id, i) => {
    const t = totals.find((t) => t.nutrientId === id),
      value = target
        ? ([
            target.energyKcal,
            target.proteinGrams,
            target.carbohydrateGrams,
            target.fatGrams,
            target.fiberGrams,
          ][i] ?? null)
        : null;
    return {
      nutrientId: id,
      knownTotal: t?.knownTotal ?? null,
      target: value,
      difference:
        t?.knownTotal != null && value !== null ? t.knownTotal - value : null,
      partial: t?.completeness !== "complete",
    };
  });
}
export function compareDayTotalsToReferences(
  totals: NutrientTotal[],
  references: readonly ReferenceSnapshot[],
) {
  return bindDayReferenceSnapshot(references).map((r) => {
    const t = totals.find((t) => t.nutrientId === r.nutrientId),
      compatible = t?.unit === r.unit && t.knownTotal !== null && r.value > 0;
    return {
      reference: r,
      percent: compatible ? (t!.knownTotal! / r.value) * 100 : null,
      partial: t?.completeness !== "complete",
      informational: ["UL", "TUL", "DV"].includes(r.referenceType),
    };
  });
}
export function copyNutritionEntrySnapshot(
  entry: FoodEntry,
  context: EntryContext,
) {
  return foodEntrySchema.parse({
    ...structuredClone(entry),
    ...base(context),
    sourceKind: entry.sourceKind,
  });
}
export function copyNutritionMealSnapshot(
  entries: readonly FoodEntry[],
  date: string,
  mealId: string,
  context: EntryContext,
) {
  return entries
    .filter(
      (e) =>
        e.localDate === date && e.mealSlotId === mealId && e.deletedAt === null,
    )
    .map((e) => copyNutritionEntrySnapshot(e, context));
}
export function copyNutritionDaySnapshot(
  entries: readonly FoodEntry[],
  date: string,
  context: EntryContext,
) {
  return entries
    .filter((e) => e.localDate === date && e.deletedAt === null)
    .map((e) =>
      copyNutritionEntrySnapshot(e, {
        ...context,
        mealSlotId: e.mealSlotId,
        mealLabelSnapshot: e.mealLabelSnapshot ?? "Historical meal",
      }),
    );
}
export function rebuildNutritionDayTotals(entries: readonly FoodEntry[]) {
  return [...new Set(entries.map((e) => e.localDate))].map((localDate) => ({
    localDate,
    totals: aggregateNutritionDay(entries, localDate),
  }));
}
export const serializeNutritionBackup = (backup: NutritionBackup) =>
  JSON.stringify(nutritionBackupSchema.parse(backup), null, 2);
export function validateNutritionBackupImport(value: unknown) {
  if (typeof value === "string") {
    if (new TextEncoder().encode(value).length > 20 * 1024 * 1024)
      throw Error("Nutrition backup exceeds the 20 MB limit.");
    return nutritionBackupSchema.parse(JSON.parse(value));
  }
  return nutritionBackupSchema.parse(value);
}
export function createNutritionRestorePlan(
  current: NutritionBackup,
  incoming: NutritionBackup,
) {
  nutritionBackupSchema.parse(current);
  nutritionBackupSchema.parse(incoming);
  const collections = [
    "days",
    "foodEntries",
    "hydrationEntries",
    "customFoods",
    "customFoodRevisions",
    "favourites",
    "auditLog",
  ] as const;
  return collections.map((name) => {
    const existing = new Map(
      current[name].map((v) => [
        "localDate" in v && !("id" in v) ? v.localDate : "id" in v ? v.id : "",
        JSON.stringify(v),
      ]),
    );
    let added = 0,
      identical = 0,
      conflicts = 0;
    for (const record of incoming[name]) {
      const key =
        "localDate" in record && !("id" in record)
          ? record.localDate
          : "id" in record
            ? record.id
            : "";
      const old = existing.get(key);
      if (old === undefined) added++;
      else if (old === JSON.stringify(record)) identical++;
      else conflicts++;
    }
    return { collection: name, added, identical, conflicts };
  });
}
export const migrateNutritionRecords = (value: unknown) =>
  validateNutritionBackupImport(value);
export function formatNutritionValue(value: number | null, unit: string) {
  return value === null
    ? "Not available"
    : `${value.toLocaleString("en", { maximumFractionDigits: unit === "kcal" ? 0 : 1 })} ${unit}`;
}
export function formatNutritionMass(grams: number, unit: "g" | "oz") {
  return formatNutritionValue(
    unit === "g" ? grams : grams / convertNutritionAmountToGrams(1, "oz"),
    unit,
  );
}
export function formatNutritionEnergy(
  value: number | null,
  preference: "kcal" | "kJ",
) {
  return formatNutritionValue(
    value === null ? null : preference === "kJ" ? value * 4.184 : value,
    preference,
  );
}
export function editQuickAddSnapshot(
  entry: FoodEntry,
  values: Partial<Record<(typeof macroIds)[number], number>>,
) {
  if (entry.sourceKind !== "quick_add")
    throw Error("Choose a quick-add entry.");
  const replacement = createQuickAddSnapshot(
    entry.displayNameSnapshot,
    values,
    {
      localDate: entry.localDate,
      occurredAtUtc: entry.occurredAtUtc,
      timeZone: entry.timeZone,
      localTime: entry.localTime ?? undefined,
      mealSlotId: entry.mealSlotId,
      mealLabelSnapshot: entry.mealLabelSnapshot ?? "Historical meal",
    },
  );
  return foodEntrySchema.parse({
    ...entry,
    nutrients: replacement.nutrients.map((n) => ({
      ...n,
      sourceRecordId: entry.id,
    })),
  });
}
export const convertMassToGrams = convertNutritionAmountToGrams;
export const resolveVerifiedPortionGrams = resolveVerifiedFoodPortion;
export function validateCanonicalFoodEntry(value: unknown) {
  const entry = validateFoodLogEntry(value);
  if (entry.sourceKind !== "canonical_food")
    throw Error("Expected a canonical food snapshot.");
  return entry;
}
export const validateCustomFood = (value: unknown) =>
  customFoodSchema.parse(value);
export type FoodSnapshotInput =
  | {
      kind: "canonical";
      food: Food;
      profileId: string;
      amount: FoodEntry["amount"];
    }
  | {
      kind: "custom";
      revision: CustomFoodRevision;
      name: string;
      brand: string | null;
      quantity: number;
    }
  | {
      kind: "quick";
      description: string;
      values: Partial<Record<(typeof macroIds)[number], number>>;
    };
export function createFoodEntrySnapshot(
  input: FoodSnapshotInput,
  context: EntryContext,
) {
  if (input.kind === "canonical")
    return createCanonicalFoodLogSnapshot(
      input.food,
      input.profileId,
      input.amount,
      context,
    );
  if (input.kind === "custom")
    return createCustomFoodLogSnapshot(
      input.revision,
      input.name,
      input.brand,
      input.quantity,
      context,
    );
  return createQuickAddSnapshot(input.description, input.values, context);
}
export const aggregateNutrientCoverage = computeNutrientCoverage;
export const compareAgainstTarget = compareDayTotalsToTargets;
export const compareAgainstReference = compareDayTotalsToReferences;
export const copyNutritionEntry = copyNutritionEntrySnapshot;
export const copyMealEntries = copyNutritionMealSnapshot;
export const copyDayEntries = copyNutritionDaySnapshot;
export const rebuildNutritionDayCache = rebuildNutritionDayTotals;
export const validateNutritionBackup = validateNutritionBackupImport;
export const planNutritionRestore = createNutritionRestorePlan;
export function exportNutritionCsv(
  backup: NutritionBackup,
  kind: (typeof nutritionReference.csvExports)[number],
) {
  const b = nutritionBackupSchema.parse(backup);
  const cell = (v: unknown) =>
    `"${String(v ?? "")
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""')}"`;
  let rows: unknown[][];
  if (kind === "food_entries") {
    rows = [
      [
        "id",
        "local_date",
        "consumed_utc",
        "time_zone",
        "meal_id",
        "name",
        "source_kind",
        "source_record_id",
        "source_release",
        "grams",
        "nutrient_id",
        "unit",
        "status",
        "per_100_g",
        "logged_value",
        "deleted_at",
      ],
      ...b.foodEntries.flatMap((e) =>
        e.nutrients.map((n) => [
          e.id,
          e.localDate,
          e.occurredAtUtc,
          e.timeZone,
          e.mealSlotId,
          e.displayNameSnapshot,
          e.sourceKind,
          n.sourceRecordId,
          e.canonicalFoodRef?.sourceRelease,
          e.amount.gramWeight,
          n.nutrientId,
          n.unit,
          n.sourceStatus,
          n.per100gValue,
          n.loggedValue,
          e.deletedAt,
        ]),
      ),
    ];
  } else if (kind === "hydration_entries") {
    rows = [
      [
        "id",
        "date",
        "consumed_utc",
        "time_zone",
        "kind",
        "volume_ml",
        "deleted_at",
      ],
      ...b.hydrationEntries.map((e) => [
        e.id,
        e.localDate,
        e.occurredAtUtc,
        e.timeZone,
        e.kind,
        e.volumeMl,
        e.deletedAt,
      ]),
    ];
  } else if (kind === "custom_foods") {
    rows = [
      [
        "food_id",
        "revision_id",
        "revision",
        "basis",
        "serving_g",
        "source_type",
        "source_note",
        "nutrient_id",
        "unit",
        "value",
      ],
      ...b.customFoodRevisions.flatMap((r) =>
        r.nutrients.map((n) => [
          r.customFoodId,
          r.id,
          r.revisionNumber,
          r.basis,
          r.serving.gramWeight,
          r.sourceType,
          r.sourceNote,
          n.nutrientId,
          n.unit,
          n.value,
        ]),
      ),
    ];
  } else {
    rows = [
      [
        "date",
        "nutrient_id",
        "unit",
        "known_total",
        "quantified_entries",
        "eligible_entries",
        "coverage_percent",
        "completeness",
        "trace_entries",
        "unavailable_entries",
        "flagged_entries",
      ],
      ...b.days.flatMap((d) =>
        aggregateNutritionDay(b.foodEntries, d.localDate)
          .filter(
            (t) =>
              kind !== "daily_energy_macros" ||
              macroIds.some((id) => id === t.nutrientId),
          )
          .map((t) => [
            d.localDate,
            t.nutrientId,
            t.unit,
            t.knownTotal,
            t.quantifiedEntries,
            t.eligibleEntries,
            t.coveragePercent,
            t.completeness,
            t.traceEntries,
            t.unavailableEntries,
            t.flaggedEntries,
          ]),
      ),
    ];
  }
  return rows.map((row) => row.map(cell).join(",")).join("\r\n");
}
