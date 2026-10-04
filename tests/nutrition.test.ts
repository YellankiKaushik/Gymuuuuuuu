import { describe, it, expect } from "vitest";
import { dietPlanFixture } from "./fixtures/diet";
import {
  createCustomFoodLogSnapshot,
  createQuickAddSnapshot,
  aggregateNutritionDay,
  bindDayTargetSnapshot,
  copyNutritionEntrySnapshot,
  makeNutritionDay,
  consumedInstant,
  convertNutritionAmountToGrams,
  resolveVerifiedFoodPortion,
  compareDayTotalsToReferences,
  validateNutritionBackupImport,
  serializeNutritionBackup,
  exportNutritionCsv,
  createNutritionRestorePlan,
} from "../src/features/nutrition-tracker/domain";
import { foodEntrySchema } from "../src/features/nutrition-tracker/schema";
import { emptyNutritionBackup } from "../src/features/nutrition-tracker/storage";
import {
  nutritionFood,
  canonical,
  customRevision,
  nutritionContext,
} from "./fixtures/nutrition";
const now = "2026-10-05T12:00:00.000Z";
describe("Phase 10 snapshot arithmetic and eligibility", () => {
  it("scales every macro with full precision and retains original source review/release", () => {
    const e = canonical();
    expect(
      e.nutrients
        .filter((n) => n.loggedValue !== null)
        .map((n) => [n.nutrientId, n.loggedValue]),
    ).toEqual(
      expect.arrayContaining([
        ["energy_kcal", 150],
        ["protein_g", 15],
        ["carbohydrate_total_g", 30],
        ["fat_total_g", 3],
        ["fiber_total_g", 7.5],
      ]),
    );
    const source = nutritionFood().compositionProfiles[0]!.sourceRecords[0]!;
    expect(e.canonicalFoodRef?.sourceRelease).toBe(source.release);
    const f = nutritionFood();
    f.compositionProfiles[0]!.nutrients[0]!.value = 999;
    expect(
      e.nutrients.find((n) => n.nutrientId === "energy_kcal")?.loggedValue,
    ).toBe(150);
  });
  it("matches the independent two-entry macro vector without deriving energy from macros", () => {
    const a = canonical(),
      b = createQuickAddSnapshot(
        "Synthetic second vector",
        {
          energy_kcal: 250,
          protein_g: 20,
          carbohydrate_total_g: 25,
          fat_total_g: 8,
          fiber_total_g: 4,
        },
        nutritionContext,
      ),
      totals = aggregateNutritionDay([a, b]);
    for (const [id, value] of [
      ["energy_kcal", 400],
      ["protein_g", 35],
      ["carbohydrate_total_g", 55],
      ["fat_total_g", 11],
      ["fiber_total_g", 11.5],
    ] as const)
      expect(totals.find((t) => t.nutrientId === id)?.knownTotal).toBe(value);
  });
  it("keeps missing, trace, unquantified not-detected and quantified zero distinct", () => {
    const a = canonical(100),
      b = canonical(100);
    for (const e of [a, b]) {
      const iron = e.nutrients.find((n) => n.nutrientId === "iron_mg")!,
        selenium = e.nutrients.find((n) => n.nutrientId === "selenium_ug")!;
      if (e === a) {
        Object.assign(iron, {
          sourceStatus: "measured",
          per100gValue: 2.4,
          loggedValue: 2.4,
        });
        Object.assign(selenium, {
          sourceStatus: "measured",
          per100gValue: 8,
          loggedValue: 8,
        });
      } else {
        Object.assign(selenium, {
          sourceStatus: "trace",
          per100gValue: null,
          loggedValue: null,
        });
      }
    }
    const total = aggregateNutritionDay([a, b]);
    expect(total.find((t) => t.nutrientId === "iron_mg")).toMatchObject({
      knownTotal: 2.4,
      coveragePercent: 50,
      completeness: "partial",
      unavailableEntries: 1,
    });
    expect(total.find((t) => t.nutrientId === "selenium_ug")).toMatchObject({
      knownTotal: 8,
      traceEntries: 1,
      completeness: "partial",
    });
    Object.assign(
      b.nutrients.find((n) => n.nutrientId === "iron_mg")!,
      { sourceStatus: "not_detected", per100gValue: 0, loggedValue: 0 },
    );
    expect(
      aggregateNutritionDay([a, b]).find((t) => t.nutrientId === "iron_mg"),
    ).toMatchObject({ knownTotal: 2.4, coveragePercent: 100 });
    expect(aggregateNutritionDay([])[0]).toMatchObject({
      knownTotal: null,
      completeness: "not_applicable",
    });
  });
  it("normalizes known custom serving mass and leaves omitted nutrients missing", () => {
    const e = createCustomFoodLogSnapshot(
      customRevision(),
      "Synthetic label",
      null,
      2,
      nutritionContext,
    );
    expect(e.amount.gramWeight).toBe(80);
    expect(
      e.nutrients.find((n) => n.nutrientId === "energy_kcal")?.loggedValue,
    ).toBe(240);
    expect(
      e.nutrients.find((n) => n.nutrientId === "protein_g")?.loggedValue,
    ).toBe(10);
    expect(
      e.nutrients.find((n) => n.nutrientId === "iron_mg")?.loggedValue,
    ).toBeNull();
  });
  it("does not make quick-add omissions eligible for micronutrient coverage", () => {
    const e = createQuickAddSnapshot(
      "Calories only",
      { energy_kcal: 0 },
      nutritionContext,
    );
    expect(e.amount.gramWeight).toBeNull();
    expect(
      aggregateNutritionDay([e]).find((n) => n.nutrientId === "iron_mg"),
    ).toMatchObject({
      eligibleEntries: 0,
      knownTotal: null,
      completeness: "not_applicable",
    });
    expect(
      aggregateNutritionDay([e]).find((n) => n.nutrientId === "energy_kcal"),
    ).toMatchObject({ knownTotal: 0, coveragePercent: 100 });
    expect(() =>
      createQuickAddSnapshot(
        "Missing calories",
        { protein_g: 20 },
        nutritionContext,
      ),
    ).toThrow();
  });
  it("freezes targets and copies original snapshots with new IDs", () => {
    const p = dietPlanFixture(),
      target = bindDayTargetSnapshot(p, now)!,
      day = makeNutritionDay(
        nutritionContext.localDate,
        nutritionContext.timeZone,
        target,
        [],
        now,
      );
    p.energy.targetKcal += 200;
    expect(day.targetSnapshot?.energyKcal).toBe(target.energyKcal);
    const e = canonical(),
      copy = copyNutritionEntrySnapshot(e, {
        ...nutritionContext,
        localDate: "2026-10-03",
        occurredAtUtc: "2026-10-03T06:30:00Z",
      });
    expect(copy.id).not.toBe(e.id);
    expect(copy.nutrients).toEqual(e.nutrients);
    expect(copy.canonicalFoodRef).toEqual(e.canonicalFoodRef);
  });
  it("excludes soft-deleted entries from totals", () => {
    const a = createQuickAddSnapshot(
        "First",
        { energy_kcal: 100 },
        nutritionContext,
      ),
      b = createQuickAddSnapshot(
        "Deleted",
        { energy_kcal: 200 },
        nutritionContext,
      );
    b.deletedAt = now;
    expect(aggregateNutritionDay([a, b])[0]?.knownTotal).toBe(100);
  });
  it("uses exact mass conversions and refuses guessed portions or volumes", () => {
    expect(convertNutritionAmountToGrams(1, "oz")).toBe(28.349523125);
    expect(convertNutritionAmountToGrams(1, "lb")).toBe(453.59237);
    expect(() => convertNutritionAmountToGrams(1, "cup")).toThrow();
    expect(() => convertNutritionAmountToGrams(-1, "g")).toThrow();
    expect(() =>
      resolveVerifiedFoodPortion(
        nutritionFood().compositionProfiles[0]!,
        "portion_missing",
        1,
      ),
    ).toThrow();
    const e = canonical();
    expect(() =>
      foodEntrySchema.parse({ ...e, amount: { ...e.amount, gramWeight: 20 } }),
    ).toThrow();
  });
  it("keeps local dates stable and rejects future or nonexistent local consumed times", () => {
    expect(
      consumedInstant("2026-10-04", "12:00", "Asia/Kolkata", new Date(now)),
    ).toBe("2026-10-04T06:30:00.000Z");
    expect(() =>
      consumedInstant("2026-10-06", "12:00", "Asia/Kolkata", new Date(now)),
    ).toThrow();
    expect(() =>
      consumedInstant("2026-03-08", "02:30", "America/New_York", new Date(now)),
    ).toThrow();
  });
  it("rejects incompatible-equivalent and supplemental-only references", () => {
    const r = {
      nutrientId: "iron_mg",
      frameworkId: "synthetic",
      frameworkVersion: "1",
      referenceType: "RDA",
      value: 8,
      unit: "mg",
      scope: "food_only",
      sourceId: "synthetic-source",
      population: { ageMonths: 360, sex: "male", lifeStage: "general" },
      basis: "per_day",
      formScope: "all_food_forms",
      snapshottedAt: now,
    } as const;
    expect(
      compareDayTotalsToReferences(aggregateNutritionDay([]), [r])[0]?.percent,
    ).toBeNull();
    expect(() =>
      compareDayTotalsToReferences([], [{ ...r, unit: "mg NE" }]),
    ).toThrow();
    expect(() =>
      compareDayTotalsToReferences([], [{ ...r, scope: "supplemental_only" }]),
    ).toThrow();
  });
  it("validates backups and exports missing states and provenance in CSV", () => {
    const b = emptyNutritionBackup(now),
      entry = canonical();
    b.days = [makeNutritionDay(entry.localDate, entry.timeZone)];
    b.foodEntries = [entry];
    expect(validateNutritionBackupImport(serializeNutritionBackup(b))).toEqual(
      b,
    );
    expect(exportNutritionCsv(b, "food_entries")).toContain("not_available");
    expect(exportNutritionCsv(b, "daily_nutrients_completeness")).toContain(
      "coverage_percent",
    );
    expect(
      createNutritionRestorePlan(emptyNutritionBackup(), b).find(
        (p) => p.collection === "foodEntries",
      )?.added,
    ).toBe(1);
    expect(() =>
      validateNutritionBackupImport({ ...b, schemaVersion: 2 }),
    ).toThrow();
    expect(() => validateNutritionBackupImport({ ...b, days: [] })).toThrow();
  });
});
