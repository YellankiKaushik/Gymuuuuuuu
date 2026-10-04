import { z } from "zod";
import rawReference from "../../content/diet-planning/reference.json";
import referenceFrameworks from "../../content/nutrients/framework-datasets.json";
import foodIdentities from "../../content/foods/identities.json";
import {
  inputsNormativeSchema,
  planNormativeSchema,
  backupNormativeSchema,
  energyNormativeSchema,
  provenanceNormativeSchema,
} from "./schema.generated";

export const dietReference = rawReference;
export const defaultProteinPreset = dietReference.proteinPresets.find(
  (p) => p.id === "general_adult_reference",
);
if (!defaultProteinPreset) throw Error("Missing default protein reference");
export const formulaSetId = "phase09_diet_targets";
export const formulaVersion = dietReference.schemaVersion;
export const energyRoundingKcal = 25;
export const energyToleranceKcal = 5;
export const massToleranceGrams = 0.1;
export const metricConversion = { cmPerInch: 2.54, kgPerPound: 0.45359237 };
export const inputLimits = {
  age: {
    min: dietReference.populationScope.minimumAgeYears,
    max: dietReference.populationScope.maximumAgeYears,
  },
  height: { min: 120, max: 230 },
  weight: { min: 30, max: 350 },
  energy: {
    min: dietReference.safetyRules.absoluteMinimumKcalPerDay,
    max: 10000,
  },
};
export type DietInputs = z.infer<typeof inputsNormativeSchema>;
export type Goal = keyof typeof dietReference.goalAdjustments;
export type Activity = keyof typeof dietReference.energyModel.equations.male;
export type ProteinPresetId =
  (typeof dietReference.proteinPresets)[number]["id"];
export const dietFrameworks = referenceFrameworks;
export const settingsSchema = backupNormativeSchema.shape.settings.refine(
  (value) => dietFrameworks.some((f) => f.id === value.referenceFrameworkId),
  "Choose a supported reference framework.",
);
export type DietSettings = z.infer<typeof settingsSchema>;
export const defaultDietSettings: DietSettings = {
  unitSystem: "metric",
  referenceFrameworkId: "us_canada_dri",
  storeInputsInSavedPlans: false,
  defaultMealCount: dietReference.mealDistribution.defaultMealCount,
};
const historicalVersion = z
  .string()
  .min(1)
  .max(40)
  .regex(/^[a-zA-Z0-9._-]+$/);
export const snapshotSchema = planNormativeSchema.extend({
  inputs: inputsNormativeSchema.nullable(),
  energy: energyNormativeSchema.extend({ modelVersion: historicalVersion }),
  provenance: provenanceNormativeSchema.extend({
    formulaSetVersion: historicalVersion,
    referenceDataVersion: historicalVersion,
  }),
});
export type DietPlan = z.infer<typeof snapshotSchema>;
export type DietWarning = DietPlan["warnings"][number];
export type MacroTargets = DietPlan["macros"];
export interface PlannerOptions {
  goal: Goal;
  adjustmentPercent: number;
  manualOverrideKcal?: number;
  manualOverrideReason?: string;
  proteinPresetId: string;
  selectedProteinGPerKg: number;
  fatPercentEnergy: number;
  mealCount: number;
  mealMode: "even" | "custom";
  mealLabels?: string[];
  mealPercents?: number[];
  customMeals?: DietPlan["mealDistribution"]["meals"];
}
const ensure = (condition: boolean, message: string): void => {
  if (!condition) throw new Error(message);
};
const finite = (value: number, label: string): number => {
  ensure(Number.isFinite(value), `${label} must be a finite number.`);
  return value;
};
export function validateDietPlannerEligibility(input: unknown): DietInputs {
  const result = inputsNormativeSchema.safeParse(input);
  if (!result.success)
    throw Error(
      result.error.issues
        .map((issue) => `${String(issue.path[0] ?? "Input")}: ${issue.message}`)
        .join("; "),
    );
  const valid = result.data;
  ensure(
    !valid.pregnancyOrLactation,
    "This calculator is unavailable during pregnancy or lactation.",
  );
  ensure(
    valid.professionalReviewAcknowledged === true,
    "Acknowledge the professional-review boundary before calculating.",
  );
  return valid;
}
export function convertDietPlannerInputsToMetric(input: {
  unitSystem: "metric" | "imperial";
  height: number;
  weight: number;
  targetWeight?: number;
  calculationWeight?: number;
}) {
  const height = finite(input.height, "Height"),
    weight = finite(input.weight, "Weight");
  const weightFactor =
    input.unitSystem === "imperial" ? metricConversion.kgPerPound : 1;
  return {
    heightCm:
      height *
      (input.unitSystem === "imperial" ? metricConversion.cmPerInch : 1),
    weightKg: weight * weightFactor,
    targetWeightKg:
      input.targetWeight === undefined
        ? null
        : finite(input.targetWeight, "Goal weight") * weightFactor,
    calculationWeightKg:
      input.calculationWeight === undefined
        ? null
        : finite(input.calculationWeight, "Calculation weight") * weightFactor,
  };
}
export function roundEnergyHeadline(value: number) {
  return (
    Math.round(finite(value, "Energy") / energyRoundingKcal) *
    energyRoundingKcal
  );
}
export function calculateAdultEer(input: DietInputs) {
  const valid = validateDietPlannerEligibility(input),
    equation =
      dietReference.energyModel.equations[valid.sexForEquation][
        valid.activityCategory
      ];
  const unrounded =
    equation.intercept +
    equation.ageCoefficient * valid.ageYears +
    equation.heightCoefficient * valid.heightCm +
    equation.weightCoefficient * valid.weightKg;
  ensure(
    unrounded >= 500 && unrounded <= inputLimits.energy.max,
    "The estimate is outside this calculator’s supported output range.",
  );
  return {
    unrounded,
    headline: roundEnergyHeadline(unrounded),
    equation,
    rmse: dietReference.energyModel.performance[valid.sexForEquation]
      .rmseKcalPerDay,
  };
}
export function calculateBmiContext(weightKg: number, heightCm: number) {
  ensure(
    finite(weightKg, "Weight") > 0 && finite(heightCm, "Height") > 0,
    "BMI needs positive height and weight.",
  );
  return weightKg / (heightCm / 100) ** 2;
}
export function calculateGoalEnergyTarget(
  maintenance: number,
  goal: Goal,
  adjustmentPercent: number,
  manualOverrideKcal?: number,
  reason?: string,
) {
  finite(maintenance, "Maintenance energy");
  finite(adjustmentPercent, "Adjustment");
  const rule = dietReference.goalAdjustments[goal];
  ensure(Boolean(rule), "Choose a supported goal.");
  if ("allowedPercents" in rule)
    ensure(
      rule.allowedPercents.includes(adjustmentPercent),
      "Choose an allowed percentage for this goal.",
    );
  else
    ensure(
      adjustmentPercent >= rule.minPercent &&
        adjustmentPercent <= rule.maxPercent,
      "Manual adjustment is outside the planning range.",
    );
  ensure(
    manualOverrideKcal === undefined || goal === "manual",
    "A direct energy override requires Manual mode.",
  );
  if (goal === "manual")
    ensure(Boolean(reason?.trim()), "Manual mode requires an explanation.");
  const unrounded =
    manualOverrideKcal === undefined
      ? maintenance * (1 + adjustmentPercent / 100)
      : finite(manualOverrideKcal, "Manual energy");
  if (manualOverrideKcal !== undefined) {
    const actual = (unrounded / maintenance - 1) * 100;
    ensure(
      actual >= dietReference.goalAdjustments.manual.minPercent &&
        actual <= dietReference.goalAdjustments.manual.maxPercent,
      "Direct manual energy must stay within the standard adjustment range.",
    );
    ensure(
      Number.isInteger(manualOverrideKcal),
      "Manual energy must be a whole kcal value.",
    );
  }
  ensure(
    unrounded >= inputLimits.energy.min,
    "Target is below the 1,000 kcal/day planning boundary. Change the goal or adjustment; this threshold does not guarantee adequacy.",
  );
  ensure(
    unrounded <= inputLimits.energy.max,
    "Target exceeds the supported output range.",
  );
  return {
    unrounded,
    target: roundEnergyHeadline(unrounded),
    adjustmentPercent:
      manualOverrideKcal === undefined
        ? adjustmentPercent
        : (unrounded / maintenance - 1) * 100,
  };
}
export function calculateProteinRange(
  weightKg: number,
  presetId: string,
  selectedGPerKg?: number,
) {
  ensure(
    finite(weightKg, "Calculation weight") >= inputLimits.weight.min &&
      weightKg <= inputLimits.weight.max,
    "Calculation weight is outside the supported range.",
  );
  const preset = dietReference.proteinPresets.find(
    (item) => item.id === presetId,
  );
  ensure(Boolean(preset), "Choose a supported protein context.");
  if (!preset) throw Error("Unknown protein context");
  const selected = selectedGPerKg ?? preset.defaultGPerKg;
  ensure(
    finite(selected, "Protein point") >= preset.minGPerKg &&
      selected <= preset.maxGPerKg,
    "Protein point is outside the selected range.",
  );
  return {
    min: weightKg * preset.minGPerKg,
    max: weightKg * preset.maxGPerKg,
    selected: weightKg * selected,
    unit: "g",
    basis: `${selected} g/kg/day × ${weightKg} kg; ${preset.id}`,
  };
}
export function calculateFatTarget(target: number, percent: number) {
  const range = dietReference.macroRules.adultAmdrPercentEnergy.fat;
  ensure(
    finite(target, "Energy") > 0 &&
      finite(percent, "Fat percent") >= range.min &&
      percent <= range.max,
    "Fat must be within the standard planning range.",
  );
  return {
    min:
      (target * range.min) /
      100 /
      dietReference.macroRules.energyPerGramKcal.fat,
    max:
      (target * range.max) /
      100 /
      dietReference.macroRules.energyPerGramKcal.fat,
    selected:
      (target * percent) / 100 / dietReference.macroRules.energyPerGramKcal.fat,
    unit: "g",
    basis: `${percent}% energy`,
  };
}
export function calculateRemainingCarbohydrate(
  target: number,
  proteinGrams: number,
  fatGrams: number,
) {
  ensure(
    finite(target, "Energy") > 0 &&
      finite(proteinGrams, "Protein") >= 0 &&
      finite(fatGrams, "Fat") >= 0,
    "Macro inputs must be nonnegative.",
  );
  const rules = dietReference.macroRules,
    remaining =
      target -
      proteinGrams * rules.energyPerGramKcal.protein -
      fatGrams * rules.energyPerGramKcal.fat;
  ensure(
    remaining >= -1e-8,
    "Protein and fat exceed the calorie budget. Reduce one allocation or review the energy target.",
  );
  const grams = Math.max(0, remaining) / rules.energyPerGramKcal.carbohydrate,
    range = rules.adultAmdrPercentEnergy.carbohydrate;
  return {
    range: {
      min: (target * range.min) / 100 / rules.energyPerGramKcal.carbohydrate,
      max: (target * range.max) / 100 / rules.energyPerGramKcal.carbohydrate,
      selected: grams,
      unit: "g",
      basis: "remaining energy",
    },
    percentEnergy: (Math.max(0, remaining) / target) * 100,
  };
}
export function calculateFiberBenchmark(target: number) {
  ensure(finite(target, "Energy") > 0, "Energy must be positive.");
  const grams =
    (target / 1000) * dietReference.macroRules.fiberGramsPer1000Kcal;
  return {
    min: grams,
    max: grams,
    selected: grams,
    unit: "g",
    basis: "planning benchmark",
  };
}
export function evaluateMacroAmdrStatus(
  target: number,
  macros: { proteinGrams: number; fatGrams: number; carbohydrateGrams: number },
) {
  ensure(finite(target, "Energy") > 0, "Energy must be positive.");
  const values = {
      protein: macros.proteinGrams,
      fat: macros.fatGrams,
      carbohydrate: macros.carbohydrateGrams,
    },
    result: Record<string, "within" | "below" | "above" | "not_applicable"> =
      {};
  for (const key of ["protein", "fat", "carbohydrate"] as const) {
    const percent =
        ((finite(values[key], key) *
          dietReference.macroRules.energyPerGramKcal[key]) /
          target) *
        100,
      range = dietReference.macroRules.adultAmdrPercentEnergy[key];
    result[key] =
      percent < range.min - 1e-8
        ? "below"
        : percent > range.max + 1e-8
          ? "above"
          : "within";
  }
  return result;
}
export function calculateMealDistribution(
  target: number,
  macros: MacroTargets,
  count: number,
  mode: "even" | "custom" = "even",
  labels?: string[],
  percents?: number[],
  customMeals?: DietPlan["mealDistribution"]["meals"],
): DietPlan["mealDistribution"] {
  ensure(
    dietReference.mealDistribution.allowedMealCount.includes(count),
    "Choose two to six meals.",
  );
  if (customMeals) {
    ensure(
      mode === "custom" && customMeals.length === count,
      "Custom meal count must match the plan.",
    );
    const result = { mealCount: count, mode, meals: customMeals };
    validateMeals(result, target, macros);
    return result;
  }
  const shares =
    mode === "even"
      ? Array.from({ length: count }, () => 100 / count)
      : percents;
  ensure(
    Boolean(shares) && shares?.length === count,
    "Enter a percentage for each meal.",
  );
  if (!shares) throw Error("Missing shares");
  ensure(
    shares.every((value) => Number.isFinite(value) && value >= 0) &&
      Math.abs(shares.reduce((a, b) => a + b, 0) - 100) < 0.0001,
    "Meal percentages must total 100%.",
  );
  const totals = {
      energyKcal: target,
      proteinGrams: macros.protein.selected,
      carbohydrateGrams: macros.carbohydrate.selected,
      fatGrams: macros.fat.selected,
    },
    used = {
      energyKcal: 0,
      proteinGrams: 0,
      carbohydrateGrams: 0,
      fatGrams: 0,
    };
  const meals = shares.map((share, index) => {
    const meal = {
      label: labels?.[index]?.trim() || `Meal ${index + 1}`,
      energyKcal: 0,
      proteinGrams: 0,
      carbohydrateGrams: 0,
      fatGrams: 0,
    };
    for (const key of [
      "energyKcal",
      "proteinGrams",
      "carbohydrateGrams",
      "fatGrams",
    ] as const) {
      meal[key] =
        index === count - 1
          ? totals[key] - used[key]
          : Math.floor(((totals[key] * share) / 100) * 10) / 10;
      used[key] += meal[key];
    }
    return meal;
  });
  const result = { mealCount: count, mode, meals };
  validateMeals(result, target, macros);
  return result;
}
function validateMeals(
  distribution: DietPlan["mealDistribution"],
  target: number,
  macros: MacroTargets,
) {
  ensure(
    distribution.mealCount === distribution.meals.length,
    "Meal count does not match the saved allocations.",
  );
  const totals = distribution.meals.reduce(
    (sum, meal) => ({
      energy: sum.energy + meal.energyKcal,
      protein: sum.protein + meal.proteinGrams,
      fat: sum.fat + meal.fatGrams,
      carb: sum.carb + meal.carbohydrateGrams,
    }),
    { energy: 0, protein: 0, fat: 0, carb: 0 },
  );
  ensure(
    Math.abs(totals.energy - target) <= energyToleranceKcal &&
      Math.abs(totals.protein - macros.protein.selected) <=
        massToleranceGrams &&
      Math.abs(totals.fat - macros.fat.selected) <= massToleranceGrams &&
      Math.abs(totals.carb - macros.carbohydrate.selected) <=
        massToleranceGrams,
    "Meal allocations do not reconcile with daily totals.",
  );
  for (const meal of distribution.meals) {
    const energy =
      meal.proteinGrams * dietReference.macroRules.energyPerGramKcal.protein +
      meal.fatGrams * dietReference.macroRules.energyPerGramKcal.fat +
      meal.carbohydrateGrams *
        dietReference.macroRules.energyPerGramKcal.carbohydrate;
    ensure(
      Math.abs(energy - meal.energyKcal) <= energyToleranceKcal,
      "A meal’s energy does not reconcile with its macros.",
    );
  }
}
export function evaluateDietPlanWarnings(
  input: DietInputs,
  goal: Goal,
  adjustment: number,
  macros?: MacroTargets,
): DietWarning[] {
  const warnings: DietWarning[] = [],
    rules = dietReference.safetyRules,
    bmi = calculateBmiContext(input.weightKg, input.heightCm),
    goalBmi = input.targetWeightKg
      ? calculateBmiContext(input.targetWeightKg, input.heightCm)
      : null;
  const add = (
    code: string,
    severity: DietWarning["severity"],
    message: string,
    sourceIds = ["niddk_body_weight_planner"],
  ) => warnings.push({ code, severity, message, sourceIds });
  if (goal === "fat_loss" && bmi < rules.blockLossGoalWhenCurrentBmiBelow)
    add(
      "low_bmi_loss",
      "block",
      "Fat-loss planning is unavailable at this BMI. Change the goal and seek professional review.",
    );
  if (goalBmi !== null && goalBmi < rules.blockGoalWeightBmiBelow)
    add(
      "low_goal_bmi",
      "block",
      "Goal weight falls below the planning BMI boundary. Change the goal weight.",
    );
  if (
    bmi >= rules.warnGoalWeightBmiAbove ||
    (goalBmi !== null && goalBmi >= rules.warnGoalWeightBmiAbove)
  )
    add(
      "bmi_context",
      "caution",
      "BMI is contextual, not a diagnosis. Total-body-weight protein scaling may be less appropriate; consider a manual calculation weight and professional review.",
    );
  if (adjustment <= -rules.warnWhenTargetBelowMaintenanceByPercent)
    add(
      "larger_loss_adjustment",
      "caution",
      "This is a larger energy reduction within the planning range. Review feasibility and seek professional guidance when needed.",
    );
  if (adjustment > rules.warnWhenTargetAboveMaintenanceByPercent)
    add(
      "larger_gain_adjustment",
      "caution",
      "This is a larger energy increase within the planning range. Review the assumption.",
    );
  if (macros?.amdrStatus)
    for (const [key, status] of Object.entries(macros.amdrStatus))
      if (status === "below" || status === "above")
        add(
          `amdr_${key}`,
          "caution",
          `${key} is outside the selected adult AMDR reference range (${status}). Allocations were not automatically changed.`,
          ["nasem_macronutrients_2005"],
        );
  return warnings;
}
export function validateDietPlanEnergyBalance(
  plan: Pick<DietPlan, "energy" | "macros" | "mealDistribution">,
) {
  const m = plan.macros,
    r = dietReference.macroRules.energyPerGramKcal,
    energy =
      m.protein.selected * r.protein +
      m.fat.selected * r.fat +
      m.carbohydrate.selected * r.carbohydrate;
  ensure(
    Math.abs(energy - plan.energy.targetKcal) <= energyToleranceKcal &&
      Math.abs(energy - m.energyCheckKcal) <= energyToleranceKcal,
    "Macro energy does not reconcile with the saved target.",
  );
  validateMeals(plan.mealDistribution, plan.energy.targetKcal, m);
  return true;
}
export function buildDietPlan(
  input: DietInputs,
  options: PlannerOptions,
  name: string,
  now: string,
  id: string,
  storeInputs: boolean,
): DietPlan {
  const inputs = validateDietPlannerEligibility(input),
    eer = calculateAdultEer(inputs),
    goal = calculateGoalEnergyTarget(
      eer.unrounded,
      options.goal,
      options.adjustmentPercent,
      options.manualOverrideKcal,
      options.manualOverrideReason,
    );
  const protein = calculateProteinRange(
      inputs.calculationWeightKg ?? inputs.weightKg,
      options.proteinPresetId,
      options.selectedProteinGPerKg,
    ),
    fat = calculateFatTarget(goal.target, options.fatPercentEnergy),
    carb = calculateRemainingCarbohydrate(
      goal.target,
      protein.selected,
      fat.selected,
    ),
    fiber = calculateFiberBenchmark(goal.target);
  const macros: MacroTargets = {
    protein,
    fat,
    carbohydrate: carb.range,
    fiber,
    proteinPresetId: options.proteinPresetId,
    fatPercentEnergy: options.fatPercentEnergy,
    carbohydratePercentEnergy: carb.percentEnergy,
    energyCheckKcal: goal.target,
    amdrStatus: evaluateMacroAmdrStatus(goal.target, {
      proteinGrams: protein.selected,
      fatGrams: fat.selected,
      carbohydrateGrams: carb.range.selected,
    }),
  };
  const warnings = evaluateDietPlanWarnings(
    inputs,
    options.goal,
    goal.adjustmentPercent,
    macros,
  );
  ensure(
    !warnings.some((w) => w.severity === "block"),
    warnings
      .filter((w) => w.severity === "block")
      .map((w) => w.message)
      .join(" "),
  );
  const plan: DietPlan = {
    id,
    name,
    status: "saved",
    createdAt: now,
    updatedAt: now,
    goal: options.goal,
    inputs: storeInputs ? inputs : null,
    energy: {
      modelId: dietReference.energyModel.id as "nasem_2023_adult_eer",
      modelVersion: dietReference.energyModel.version,
      unroundedMaintenanceKcal: eer.unrounded,
      maintenanceKcal: eer.headline,
      modelRmseKcal: eer.rmse,
      adjustmentPercent: goal.adjustmentPercent,
      targetKcal: goal.target,
      manualOverrideKcal: options.manualOverrideKcal ?? null,
      manualOverrideReason: options.manualOverrideReason?.trim() || null,
    },
    macros,
    mealDistribution: calculateMealDistribution(
      goal.target,
      macros,
      options.mealCount,
      options.mealMode,
      options.mealLabels,
      options.mealPercents,
      options.customMeals,
    ),
    warnings,
    provenance: {
      formulaSetId,
      formulaSetVersion: formulaVersion,
      referenceDataVersion: dietReference.schemaVersion,
      sourceIds: [
        dietReference.energyModel.sourceId,
        "nasem_macronutrients_2005",
        ...(dietReference.proteinPresets.find(
          (p) => p.id === options.proteinPresetId,
        )?.sourceIds ?? []),
        "niddk_body_weight_planner",
      ].filter((value, index, array) => array.indexOf(value) === index),
      calculatedAt: now,
    },
  };
  return dietPlanSchema.parse(withDietInputConsent(plan, storeInputs));
}
export function isCurrentFormula(plan: DietPlan) {
  return (
    plan.energy.modelVersion === dietReference.energyModel.version &&
    plan.provenance.formulaSetVersion === formulaVersion &&
    plan.provenance.referenceDataVersion === dietReference.schemaVersion
  );
}
export const dietPlanSchema = snapshotSchema.superRefine((plan, ctx) => {
  try {
    const ids = new Set(dietReference.sources.map((source) => source.id));
    const presetSources =
      dietReference.proteinPresets.find(
        (p) => p.id === plan.macros.proteinPresetId,
      )?.sourceIds ?? [];
    ensure(
      [
        dietReference.energyModel.sourceId,
        "nasem_macronutrients_2005",
        "niddk_body_weight_planner",
        ...presetSources,
      ].every((id) => plan.provenance.sourceIds.includes(id)),
      "Saved provenance is missing a required calculation source.",
    );
    ensure(
      plan.provenance.sourceIds.every((id) => ids.has(id)) &&
        plan.warnings.every((w) =>
          (w.sourceIds ?? []).every((id) => ids.has(id)),
        ),
      "Unknown source ID.",
    );
    ensure(
      !plan.warnings.some((w) => w.severity === "block"),
      "Blocked plans cannot be imported or saved.",
    );
    ensure(
      plan.macros.protein.min <= plan.macros.protein.max &&
        plan.macros.protein.selected >= plan.macros.protein.min &&
        plan.macros.protein.selected <= plan.macros.protein.max,
      "Selected protein must be within its saved range.",
    );
    ensure(
      ["protein", "fat", "carbohydrate", "fiber"].every(
        (key) => plan.macros[key as "protein"].unit === "g",
      ),
      "Saved macro units must be grams.",
    );
    ensure(
      plan.macros.fatPercentEnergy !== undefined &&
        plan.macros.proteinPresetId !== undefined,
      "Saved targets require their allocation context.",
    );
    if (plan.macros.fatPercentEnergy === undefined)
      throw Error("Missing fat percentage");
    ensure(
      dietReference.proteinPresets.some(
        (p) => p.id === plan.macros.proteinPresetId,
      ),
      "Unknown protein context.",
    );
    const fat = calculateFatTarget(
      plan.energy.targetKcal,
      plan.macros.fatPercentEnergy,
    );
    ensure(
      Math.abs(fat.selected - plan.macros.fat.selected) < massToleranceGrams,
      "Fat allocation disagrees with the saved percentage.",
    );
    const carbohydrate = calculateRemainingCarbohydrate(
      plan.energy.targetKcal,
      plan.macros.protein.selected,
      plan.macros.fat.selected,
    );
    ensure(
      plan.macros.carbohydratePercentEnergy !== undefined &&
        Math.abs(
          carbohydrate.percentEnergy - plan.macros.carbohydratePercentEnergy,
        ) < 0.01,
      "Carbohydrate percentage disagrees with remaining energy.",
    );
    validateDietPlanEnergyBalance(plan);
    const expectedAmdr = evaluateMacroAmdrStatus(plan.energy.targetKcal, {
      proteinGrams: plan.macros.protein.selected,
      fatGrams: plan.macros.fat.selected,
      carbohydrateGrams: plan.macros.carbohydrate.selected,
    });
    ensure(
      Object.keys(expectedAmdr).every(
        (key) => plan.macros.amdrStatus?.[key] === expectedAmdr[key],
      ),
      "Saved AMDR labels disagree with their allocations.",
    );
    ensure(
      plan.goal === "manual" || !plan.energy.manualOverrideKcal,
      "Manual override requires manual goal.",
    );
    if (plan.goal === "manual")
      ensure(
        Boolean(plan.energy.manualOverrideReason?.trim()),
        "Manual override requires a reason.",
      );
    if (plan.inputs) {
      validateDietPlannerEligibility(plan.inputs);
      ensure(
        !evaluateDietPlanWarnings(
          plan.inputs,
          plan.goal,
          plan.energy.adjustmentPercent,
        ).some((w) => w.severity === "block"),
        "Inputs violate a planning safety boundary.",
      );
    }
    if (isCurrentFormula(plan)) {
      const goal = calculateGoalEnergyTarget(
        plan.energy.unroundedMaintenanceKcal,
        plan.goal,
        plan.energy.adjustmentPercent,
        plan.energy.manualOverrideKcal ?? undefined,
        plan.energy.manualOverrideReason ?? undefined,
      );
      ensure(
        goal.target === plan.energy.targetKcal,
        "Saved target disagrees with its goal calculation.",
      );
      ensure(
        roundEnergyHeadline(plan.energy.unroundedMaintenanceKcal) ===
          plan.energy.maintenanceKcal,
        "Maintenance headline disagrees with its rounding rule.",
      );
      ensure(
        Math.abs(
          calculateFiberBenchmark(plan.energy.targetKcal).selected -
            plan.macros.fiber.selected,
        ) < massToleranceGrams,
        "Fibre benchmark disagrees with the formula.",
      );
      if (plan.inputs) {
        const eer = calculateAdultEer(plan.inputs);
        ensure(
          Math.abs(eer.unrounded - plan.energy.unroundedMaintenanceKcal) <
            0.01 && eer.rmse === plan.energy.modelRmseKcal,
          "Saved maintenance disagrees with its input snapshot.",
        );
        const preset = dietReference.proteinPresets.find(
          (p) => p.id === plan.macros.proteinPresetId,
        );
        ensure(Boolean(preset), "Unknown protein context.");
        if (preset) {
          const weight =
            plan.inputs.calculationWeightKg ?? plan.inputs.weightKg;
          ensure(
            Math.abs(plan.macros.protein.min - weight * preset.minGPerKg) <
              massToleranceGrams &&
              Math.abs(plan.macros.protein.max - weight * preset.maxGPerKg) <
                massToleranceGrams,
            "Saved protein range disagrees with its weight basis.",
          );
        }
      }
    }
    if (plan.dietPreferences?.excludedFoodIds) {
      const foods = new Set(foodIdentities.map((food) => food.id));
      ensure(
        plan.dietPreferences.excludedFoodIds.every((id) => foods.has(id)),
        "Unknown excluded food ID.",
      );
    }
  } catch (error) {
    ctx.addIssue({
      code: "custom",
      message: error instanceof Error ? error.message : "Invalid diet snapshot",
    });
  }
});
export const dietBackupSchema = backupNormativeSchema
  .extend({
    plans: z.array(dietPlanSchema).max(5000),
    settings: settingsSchema,
  })
  .superRefine((backup, ctx) => {
    const ids = backup.plans.map((p) => p.id),
      current = backup.plans.filter((p) => p.status === "current");
    if (
      new Set(ids).size !== ids.length ||
      current.length > 1 ||
      (backup.currentPlanId ?? null) !== (current[0]?.id ?? null)
    )
      ctx.addIssue({
        code: "custom",
        message: "Duplicate plan IDs or inconsistent current plan pointer.",
      });
    if (backup.auditLog?.some((a) => !a.planId.startsWith("dietplan_")))
      ctx.addIssue({
        code: "custom",
        message: "Invalid audit plan reference.",
      });
  });
export type DietBackup = z.infer<typeof dietBackupSchema>;
export function serializeDietPlan(plan: DietPlan, includeInputs = true) {
  const valid = dietPlanSchema.parse(plan);
  return JSON.stringify(withDietInputConsent(valid, includeInputs), null, 2);
}
export function withDietInputConsent(
  plan: DietPlan,
  includeInputs: boolean,
): DietPlan {
  return includeInputs
    ? plan
    : {
        ...plan,
        inputs: null,
        macros: {
          ...plan.macros,
          protein: {
            ...plan.macros.protein,
            basis: `Calculation inputs withheld; ${plan.macros.proteinPresetId}`,
          },
        },
      };
}
export function migrateDietPlanRecord(input: unknown) {
  return dietPlanSchema.parse(input);
}
export function currentDietTargets(plan: DietPlan, settings: DietSettings) {
  const p = dietPlanSchema.parse(plan);
  return {
    planId: p.id,
    targetKcal: p.energy.targetKcal,
    protein: p.macros.protein,
    fat: p.macros.fat,
    carbohydrate: p.macros.carbohydrate,
    fiber: p.macros.fiber,
    referenceFrameworkId: settings.referenceFrameworkId,
    provenance: p.provenance,
    mealDistribution: p.mealDistribution,
    warnings: p.warnings,
  };
}
