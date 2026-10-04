import { describe, it, expect } from "vitest";
import {
  dietInputFixture,
  dietOptionsFixture,
  dietPlanFixture,
} from "./fixtures/diet";
import {
  calculateAdultEer,
  convertDietPlannerInputsToMetric,
  roundEnergyHeadline,
  calculateBmiContext,
  calculateGoalEnergyTarget,
  calculateProteinRange,
  calculateFatTarget,
  calculateRemainingCarbohydrate,
  calculateFiberBenchmark,
  calculateMealDistribution,
  evaluateMacroAmdrStatus,
  evaluateDietPlanWarnings,
  validateDietPlanEnergyBalance,
  validateDietPlannerEligibility,
  serializeDietPlan,
  migrateDietPlanRecord,
  dietPlanSchema,
  dietBackupSchema,
  dietReference,
  defaultDietSettings,
  isCurrentFormula,
  buildDietPlan,
  type Activity,
  type Goal,
} from "../src/features/diet-planning/domain";
import {
  redactDietInputs,
  exportDietBackup,
  exportDietCsv,
  previewDietImport,
} from "../src/features/diet-planning/storage";
describe("Phase 09 sourced deterministic calculator", () => {
  it.each([
    ["male", "inactive", 2623.17],
    ["male", "low_active", 2829.57],
    ["male", "active", 3014.17],
    ["male", "very_active", 3322.22],
    ["female", "inactive", 2035.02],
    ["female", "low_active", 2196.89],
    ["female", "active", 2333.47],
    ["female", "very_active", 2565.7],
  ] as const)(
    "checks independent %s %s equation vector",
    (sex, activity, expected) => {
      const value = calculateAdultEer({
        ...dietInputFixture,
        sexForEquation: sex,
        activityCategory: activity,
        ...(sex === "female"
          ? { ageYears: 28, heightCm: 165, weightKg: 60 }
          : {}),
      });
      expect(value.unrounded).toBeCloseTo(expected, 6);
      expect(value.rmse).toBe(sex === "male" ? 339 : 246);
    },
  );
  it("matches supplied vectors and converts without intermediate rounding", () => {
    expect(roundEnergyHeadline(3014.17)).toBe(3025);
    expect(roundEnergyHeadline(2196.89)).toBe(2200);
    expect(roundEnergyHeadline(1012.49)).toBe(1000);
    expect(roundEnergyHeadline(1012.5)).toBe(1025);
    const input = convertDietPlannerInputsToMetric({
      unitSystem: "imperial",
      height: 70,
      weight: 165,
      targetWeight: 150,
      calculationWeight: 160,
    });
    expect(input.heightCm).toBe(177.8);
    expect(input.weightKg).toBeCloseTo(74.84274105, 8);
    expect(input.targetWeightKg).toBeCloseTo(68.0388555, 8);
    expect(input.calculationWeightKg).toBeCloseTo(72.5747792, 8);
    expect(calculateBmiContext(75, 175)).toBeCloseTo(24.489795918, 8);
    expect(() =>
      convertDietPlannerInputsToMetric({
        unitSystem: "metric",
        height: Infinity,
        weight: 75,
      }),
    ).toThrow();
  });
  it("requires eligible complete adult inputs and explicit boundary acknowledgement", () => {
    for (const patch of [
      { ageYears: 18 },
      { ageYears: 101 },
      { pregnancyOrLactation: true },
      { professionalReviewAcknowledged: false },
      { heightCm: 119 },
      { weightKg: 351 },
      { sexForEquation: "" },
      { activityCategory: "" },
    ])
      expect(() =>
        validateDietPlannerEligibility({ ...dietInputFixture, ...patch }),
      ).toThrow();
    expect(
      validateDietPlannerEligibility({ ...dietInputFixture, ageYears: 19 }),
    ).toBeDefined();
    expect(
      calculateAdultEer({ ...dietInputFixture, ageYears: 100 }),
    ).toBeDefined();
  });
  it("uses every allowed goal adjustment and preserves maintenance for manual override", () => {
    for (const [goal, rule] of Object.entries(dietReference.goalAdjustments))
      if ("allowedPercents" in rule)
        for (const percent of rule.allowedPercents) {
          const result = calculateGoalEnergyTarget(3000, goal as Goal, percent);
          expect(result.unrounded).toBeCloseTo(3000 * (1 + percent / 100), 8);
        }
    expect(() => calculateGoalEnergyTarget(3000, "fat_loss", -25)).toThrow();
    expect(() =>
      calculateGoalEnergyTarget(3000, "manual", 0, 2500, ""),
    ).toThrow();
    expect(() =>
      calculateGoalEnergyTarget(3000, "manual", 0, 2000, "test"),
    ).toThrow();
    expect(
      calculateGoalEnergyTarget(
        3000,
        "manual",
        0,
        2700,
        "Explicit test override",
      ).target,
    ).toBe(2700);
    expect(() => calculateGoalEnergyTarget(1100, "fat_loss", -20)).toThrow(
      /1,000/,
    );
    expect(() => calculateGoalEnergyTarget(1249, "fat_loss", -20)).toThrow();
    expect(calculateGoalEnergyTarget(1250, "fat_loss", -20).target).toBe(1000);
  });
  it("blocks loss and goal-weight safety while keeping BMI contextual", () => {
    expect(
      evaluateDietPlanWarnings(
        { ...dietInputFixture, weightKg: 50 },
        "fat_loss",
        -10,
      ).some((w) => w.severity === "block"),
    ).toBe(true);
    expect(
      evaluateDietPlanWarnings(
        { ...dietInputFixture, targetWeightKg: 45 },
        "maintenance",
        0,
      ).some((w) => w.severity === "block"),
    ).toBe(true);
    expect(
      evaluateDietPlanWarnings(
        { ...dietInputFixture, weightKg: 120 },
        "maintenance",
        0,
      ).some((w) => w.code === "bmi_context"),
    ).toBe(true);
    expect(
      evaluateDietPlanWarnings(dietInputFixture, "fat_loss", -15).some(
        (w) => w.code === "larger_loss_adjustment",
      ),
    ).toBe(true);
    expect(
      evaluateDietPlanWarnings(dietInputFixture, "muscle_gain", 10),
    ).toHaveLength(0);
    expect(
      evaluateDietPlanWarnings(dietInputFixture, "muscle_gain", 15),
    ).toHaveLength(1);
    expect(() =>
      buildDietPlan(
        { ...dietInputFixture, weightKg: 50 },
        { ...dietOptionsFixture, goal: "fat_loss", adjustmentPercent: -10 },
        "Blocked",
        "2026-10-05T00:00:00Z",
        "dietplan_blocked",
        true,
      ),
    ).toThrow(/Fat-loss/);
  });
  it("checks protein contexts and supplied macro vector without forcing AMDR", () => {
    for (const p of dietReference.proteinPresets) {
      const range = calculateProteinRange(75, p.id);
      expect(range.min).toBe(75 * p.minGPerKg);
      expect(range.max).toBe(75 * p.maxGPerKg);
      expect(range.selected).toBe(75 * p.defaultGPerKg);
    }
    const protein = calculateProteinRange(75, "strength_hypertrophy", 1.6),
      fat = calculateFatTarget(2500, 30),
      carb = calculateRemainingCarbohydrate(
        2500,
        protein.selected,
        fat.selected,
      ),
      fiber = calculateFiberBenchmark(2500);
    expect(protein.selected).toBe(120);
    expect(fat.selected).toBeCloseTo(83.3333333, 6);
    expect(carb.range.selected).toBe(317.5);
    expect(fiber.selected).toBe(35);
    expect(() =>
      calculateProteinRange(75, "strength_hypertrophy", 2.1),
    ).toThrow();
    expect(() => calculateFatTarget(2500, 19)).toThrow();
    expect(() => calculateRemainingCarbohydrate(1000, 250, 50)).toThrow(
      /exceed/,
    );
    expect(calculateRemainingCarbohydrate(1000, 250, 0).range.selected).toBe(0);
    expect(
      evaluateMacroAmdrStatus(1000, {
        proteinGrams: 150,
        fatGrams: 30,
        carbohydrateGrams: 32.5,
      }),
    ).toEqual({ protein: "above", fat: "within", carbohydrate: "below" });
  });
  it("resolves even meal rounding and validates custom percent/gram energy and totals", () => {
    const plan = dietPlanFixture();
    for (const count of [2, 3, 4, 5, 6]) {
      const meals = calculateMealDistribution(
        plan.energy.targetKcal,
        plan.macros,
        count,
      );
      expect(meals.meals.reduce((s, m) => s + m.proteinGrams, 0)).toBeCloseTo(
        plan.macros.protein.selected,
        8,
      );
      expect(
        validateDietPlanEnergyBalance({ ...plan, mealDistribution: meals }),
      ).toBe(true);
    }
    const custom = calculateMealDistribution(
      plan.energy.targetKcal,
      plan.macros,
      2,
      "custom",
      ["A", "B"],
      [40, 60],
    );
    expect(custom.meals[0]?.label).toBe("A");
    expect(() =>
      calculateMealDistribution(
        plan.energy.targetKcal,
        plan.macros,
        2,
        "custom",
        undefined,
        [40, 40],
      ),
    ).toThrow();
    expect(() =>
      calculateMealDistribution(
        plan.energy.targetKcal,
        plan.macros,
        2,
        "custom",
        undefined,
        undefined,
        custom.meals.map((m, i) =>
          i ? m : { ...m, energyKcal: m.energyKcal + 100 },
        ),
      ),
    ).toThrow();
    expect(() => calculateMealDistribution(3000, plan.macros, 7)).toThrow();
  });
  it("validates saved calculations, rejects unknown fields and preserves historical snapshots", () => {
    const plan = dietPlanFixture();
    expect(JSON.parse(serializeDietPlan(plan))).toEqual(plan);
    expect(migrateDietPlanRecord(plan)).toEqual(plan);
    for (const invalid of [
      { ...plan, unknown: "discard?" },
      {
        ...plan,
        energy: { ...plan.energy, targetKcal: plan.energy.targetKcal + 100 },
      },
      {
        ...plan,
        macros: {
          ...plan.macros,
          protein: { ...plan.macros.protein, selected: 1000 },
        },
      },
      { ...plan, inputs: { ...dietInputFixture, pregnancyOrLactation: true } },
      { ...plan, provenance: { ...plan.provenance, sourceIds: ["unknown"] } },
    ])
      expect(dietPlanSchema.safeParse(invalid).success).toBe(false);
    const old = {
      ...plan,
      energy: { ...plan.energy, modelVersion: "2022.1" },
      provenance: { ...plan.provenance, formulaSetVersion: "0.9.0" },
    };
    expect(isCurrentFormula(old)).toBe(false);
    expect(migrateDietPlanRecord(old).energy.unroundedMaintenanceKcal).toBe(
      plan.energy.unroundedMaintenanceKcal,
    );
    expect(
      dietPlanSchema.parse(redactDietInputs(plan, false)).inputs,
    ).toBeNull();
    expect(redactDietInputs(plan, false).macros.protein.basis).not.toContain(
      "75 kg",
    );
  });
  it("exports validated backups and safe CSV with input consent and conflict preview", () => {
    const plan = { ...dietPlanFixture(), name: "=SYNTHETIC()" },
      backup = {
        schemaVersion: "1.0.0" as const,
        exportedAt: "2026-10-05T00:00:00Z",
        plans: [plan],
        settings: defaultDietSettings,
        currentPlanId: null,
      };
    const text = exportDietBackup(backup, false),
      preview = previewDietImport(text, backup);
    expect(preview.backup.plans[0]?.inputs).toBeNull();
    expect(preview.conflicts).toEqual([plan.id]);
    expect(exportDietCsv(backup)).toContain('"\'=SYNTHETIC()"');
    expect(() => previewDietImport("{bad", backup)).toThrow();
    expect(
      dietBackupSchema.safeParse({ ...backup, currentPlanId: plan.id }).success,
    ).toBe(false);
    expect(
      dietBackupSchema.safeParse({ ...backup, plans: [plan, plan] }).success,
    ).toBe(false);
    expect(
      dietBackupSchema.safeParse({
        ...backup,
        settings: { ...defaultDietSettings, secret: "unknown" },
      }).success,
    ).toBe(false);
  });
  it("retains the four prescribed PAL ranges", () => {
    expect(
      dietReference.activityCategories.map((c) => [
        c.palMin,
        c.palMaxExclusive,
      ]),
    ).toEqual([
      [1, 1.53],
      [1.53, 1.68],
      [1.68, 1.85],
      [1.85, 2.5],
    ]);
    expect(
      dietReference.activityCategories.map((c) => c.id as Activity),
    ).toHaveLength(4);
  });
});
