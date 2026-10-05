/** Pure arithmetic only. No browser access, prescribed zones or calorie model. */
export const cardioCalculationVersion = "cardio-arithmetic-1" as const;
export const metresPerMile = 1609.344;
export type DistanceUnit = "m" | "km" | "mile";
const factors: Record<DistanceUnit, number> = {
  m: 1,
  km: 1000,
  mile: metresPerMile,
};
function positive(value: number | null, name: string): number | null {
  if (value === null) return null;
  if (!Number.isFinite(value) || value <= 0)
    throw Error(`${name} must be positive and finite.`);
  return value;
}
function nonnegative(value: number, name: string) {
  if (!Number.isFinite(value) || value < 0)
    throw Error(`${name} must be nonnegative and finite.`);
  return value;
}
export function toMetres(value: number, unit: DistanceUnit) {
  return nonnegative(value, "Distance") * factors[unit];
}
export function fromMetres(value: number, unit: DistanceUnit) {
  return nonnegative(value, "Distance") / factors[unit];
}
export function calculatePace(
  distanceMeters: number | null,
  elapsedSeconds: number | null,
) {
  const distance = positive(distanceMeters, "Distance"),
    elapsed = positive(elapsedSeconds, "Elapsed time");
  const known = distance !== null && elapsed !== null;
  return {
    version: cardioCalculationVersion,
    secondsPerKm: known ? elapsed / (distance / 1000) : null,
    secondsPerMile: known ? elapsed / (distance / metresPerMile) : null,
    kilometresPerHour: known ? distance / 1000 / (elapsed / 3600) : null,
    milesPerHour: known ? distance / metresPerMile / (elapsed / 3600) : null,
    basis: "elapsed_time" as const,
  };
}
export function formatPace(seconds: number | null) {
  if (seconds === null) return "Not available";
  positive(seconds, "Pace");
  const rounded = Math.round(seconds);
  return `${Math.floor(rounded / 60)}:${String(rounded % 60).padStart(2, "0")}`;
}
export function tanakaMaximum(ageYears: number | null) {
  if (ageYears === null) return null;
  if (!Number.isFinite(ageYears) || ageYears < 18 || ageYears > 100)
    throw Error("This optional adult estimate accepts ages 18–100.");
  return {
    bpm: 208 - 0.7 * ageYears,
    sourceId: "src_tanaka_hrmax_2001",
    methodVersion: "tanaka-2001-v1",
    estimated: true as const,
    warning:
      "Population estimate with substantial individual error; not a measured maximum or a medical clearance.",
  };
}
export function calculateHeartRateTarget(input: {
  method: "percent_hrmax" | "heart_rate_reserve";
  maximumBpm: number | null;
  restingBpm: number | null;
  lowerFraction: number | null;
  upperFraction: number | null;
  affectedByMedicationOrMedicalContext: boolean;
}) {
  const { maximumBpm, restingBpm, lowerFraction, upperFraction } = input;
  for (const fraction of [lowerFraction, upperFraction])
    if (
      fraction !== null &&
      (!Number.isFinite(fraction) || fraction < 0 || fraction > 1)
    )
      throw Error("Fractions must be between zero and one.");
  if (
    lowerFraction !== null &&
    upperFraction !== null &&
    lowerFraction > upperFraction
  )
    throw Error("Lower fraction cannot exceed upper fraction.");
  if (
    maximumBpm !== null &&
    (!Number.isFinite(maximumBpm) || maximumBpm < 20 || maximumBpm > 280)
  )
    throw Error("Maximum heart rate is outside the record range.");
  if (
    restingBpm !== null &&
    (!Number.isFinite(restingBpm) || restingBpm < 20 || restingBpm > 260)
  )
    throw Error("Resting heart rate is outside the record range.");
  if (maximumBpm !== null && restingBpm !== null && restingBpm >= maximumBpm)
    throw Error("Resting heart rate must be below maximum heart rate.");
  const missing =
    maximumBpm === null ||
    lowerFraction === null ||
    upperFraction === null ||
    (input.method === "heart_rate_reserve" && restingBpm === null);
  const unavailable = missing || input.affectedByMedicationOrMedicalContext;
  const target = (fraction: number | null) =>
    unavailable || maximumBpm === null || fraction === null
      ? null
      : input.method === "percent_hrmax"
        ? fraction * maximumBpm
        : restingBpm! + fraction * (maximumBpm - restingBpm!);
  return {
    lowerBpm: target(lowerFraction),
    upperBpm: target(upperFraction),
    method: input.method,
    methodVersion: "hr-fraction-arithmetic-1",
    disabled: input.affectedByMedicationOrMedicalContext,
    warning: input.affectedByMedicationOrMedicalContext
      ? "Heart-rate targeting is disabled for this context. Seek individualized advice from your clinician."
      : "These are your selected fractions, not validated training zones. Heat, illness, altitude and device error may affect heart rate.",
  };
}
export function guidelineEquivalent(
  moderateMinutes: number,
  vigorousMinutes: number,
  unclassifiedMinutes = 0,
) {
  for (const value of [moderateMinutes, vigorousMinutes, unclassifiedMinutes])
    nonnegative(value, "Minutes");
  return {
    moderateMinutes,
    vigorousMinutes,
    unclassifiedMinutes,
    equivalentMinutes: moderateMinutes + 2 * vigorousMinutes,
    frameworkId: "who_hhs_adult_aerobic",
    methodVersion: "adult-aerobic-equivalent-1",
    sourceIds: ["src_who_pa_guidelines_2020", "src_hhs_pa_guidelines_2018"],
    warning:
      "Adult public-health volume only; not training load, fatigue or energy expenditure.",
  };
}
export function intervalDuration(input: {
  warmUpSeconds: number;
  coolDownSeconds: number;
  repetitions: number;
  workSeconds: number | null;
  recoverySeconds: number | null;
  includeFinalRecovery: boolean;
}) {
  const { repetitions, workSeconds, recoverySeconds } = input;
  nonnegative(input.warmUpSeconds, "Warm-up");
  nonnegative(input.coolDownSeconds, "Cool-down");
  if (!Number.isInteger(repetitions) || repetitions < 1 || repetitions > 1000)
    throw Error("Use 1–1000 whole repetitions.");
  positive(workSeconds, "Work duration");
  if (recoverySeconds !== null)
    nonnegative(recoverySeconds, "Recovery duration");
  if (workSeconds === null || recoverySeconds === null) return null;
  return (
    input.warmUpSeconds +
    input.coolDownSeconds +
    repetitions * workSeconds +
    (repetitions - (input.includeFinalRecovery ? 0 : 1)) * recoverySeconds
  );
}
export type TalkTest =
  | "not_recorded"
  | "comfortable_conversation"
  | "talk_but_not_sing"
  | "few_words_only"
  | "unable_to_speak_comfortably";
export function classifyTalkTest(value: TalkTest) {
  return {
    classification:
      value === "talk_but_not_sing"
        ? ("moderate" as const)
        : value === "few_words_only"
          ? ("vigorous" as const)
          : ("unclassified" as const),
    sourceId: "src_cdc_intensity_2025",
    methodVersion: "cdc-talk-test-1",
  };
}
export function classifyActualIntensity(talk: TalkTest, effort: number | null) {
  if (talk !== "not_recorded")
    return { ...classifyTalkTest(talk), method: "talk_test" };
  if (
    effort !== null &&
    (!Number.isInteger(effort) || effort < 0 || effort > 10)
  )
    throw Error("Actual effort must be a whole self-report from zero to ten.");
  return {
    classification:
      effort === 5 || effort === 6
        ? ("moderate" as const)
        : effort === 7 || effort === 8
          ? ("vigorous" as const)
          : ("unclassified" as const),
    sourceId: "src_cdc_intensity_2025",
    methodVersion: "cdc-effort-examples-1",
    method: "perceived_effort_0_10",
  };
}
export function exactElapsed(
  accumulatedSeconds: number,
  runningSince: string | null,
  now: string,
) {
  nonnegative(accumulatedSeconds, "Accumulated time");
  const at = Date.parse(now),
    start = runningSince === null ? null : Date.parse(runningSince);
  if (
    !Number.isFinite(at) ||
    (start !== null && (!Number.isFinite(start) || at < start))
  )
    throw Error(
      "Timer timestamps are invalid or the clock moved backwards. Pause and correct the record.",
    );
  return accumulatedSeconds + (start === null ? 0 : (at - start) / 1000);
}
export function stopBoundary(signals: readonly string[]) {
  return {
    urgentSafetyMessage: signals.length > 0,
    allowContinue: signals.length === 0,
    allowIntensification: signals.length === 0,
    diagnosis: false as const,
  };
}
