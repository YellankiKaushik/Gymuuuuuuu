import {
  buildDietPlan,
  type DietInputs,
  type PlannerOptions,
} from "../../src/features/diet-planning/domain";
export const dietInputFixture: DietInputs = {
  ageYears: 30,
  sexForEquation: "male",
  heightCm: 175,
  weightKg: 75,
  activityCategory: "active",
  pregnancyOrLactation: false,
  professionalReviewAcknowledged: true,
  targetWeightKg: null,
  calculationWeightKg: null,
};
export const dietOptionsFixture: PlannerOptions = {
  goal: "maintenance",
  adjustmentPercent: 0,
  proteinPresetId: "strength_hypertrophy",
  selectedProteinGPerKg: 1.6,
  fatPercentEnergy: 30,
  mealCount: 4,
  mealMode: "even",
};
export const dietPlanFixture = () =>
  buildDietPlan(
    dietInputFixture,
    dietOptionsFixture,
    "Synthetic engineering plan",
    "2026-10-05T00:00:00.000Z",
    "dietplan_fixture",
    true,
  );
