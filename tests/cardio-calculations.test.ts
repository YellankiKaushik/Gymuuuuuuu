import { describe, expect, it } from "vitest";
import {
  calculatePace,
  formatPace,
  toMetres,
  fromMetres,
  tanakaMaximum,
  calculateHeartRateTarget,
  guidelineEquivalent,
  intervalDuration,
  classifyTalkTest,
  exactElapsed,
  stopBoundary,
} from "../src/features/cardio/calculations";

describe("Phase 13 arithmetic reference vectors", () => {
  it("retains exact canonical conversions and elapsed-time pace", () => {
    const five = calculatePace(5000, 1500);
    expect(five.secondsPerKm).toBe(300);
    expect(formatPace(five.secondsPerKm)).toBe("5:00");
    expect(five.kilometresPerHour).toBe(12);
    const mile = calculatePace(1609.344, 480);
    expect(mile.secondsPerMile).toBe(480);
    expect(formatPace(mile.secondsPerMile)).toBe("8:00");
    expect(mile.milesPerHour).toBe(7.5);
    expect(toMetres(1, "mile")).toBe(1609.344);
    expect(fromMetres(1609.344, "mile")).toBe(1);
    expect(calculatePace(5012.3, 1500.25).secondsPerKm).toBeCloseTo(
      299.3138096,
    );
    expect(formatPace(359.6)).toBe("6:00");
  });
  it("preserves missing measurements instead of generating zeros", () => {
    expect(calculatePace(null, 1800).secondsPerKm).toBeNull();
    expect(calculatePace(1000, null).kilometresPerHour).toBeNull();
    expect(() => calculatePace(0, 1800)).toThrow();
    expect(() => calculatePace(1000, 0)).toThrow();
    expect(() => toMetres(NaN, "km")).toThrow();
  });
  it("labels Tanaka as an optional estimate and retains fractional results", () => {
    expect(tanakaMaximum(40)?.bpm).toBe(180);
    expect(tanakaMaximum(41)?.bpm).toBeCloseTo(179.3);
    expect(tanakaMaximum(40)?.estimated).toBe(true);
    expect(tanakaMaximum(null)).toBeNull();
    expect(() => tanakaMaximum(17)).toThrow();
  });
  it("calculates the specified HRR example without guessing zones", () => {
    const input = {
      method: "heart_rate_reserve" as const,
      maximumBpm: 190,
      restingBpm: 60,
      lowerFraction: 0.5,
      upperFraction: 0.7,
      affectedByMedicationOrMedicalContext: false,
    };
    const target = calculateHeartRateTarget(input);
    expect(target.lowerBpm).toBe(125);
    expect(target.upperBpm).toBe(151);
    expect(
      calculateHeartRateTarget({ ...input, method: "percent_hrmax" }).lowerBpm,
    ).toBe(95);
    expect(
      calculateHeartRateTarget({ ...input, restingBpm: null }).lowerBpm,
    ).toBeNull();
    expect(
      calculateHeartRateTarget({
        ...input,
        affectedByMedicationOrMedicalContext: true,
      }).lowerBpm,
    ).toBeNull();
    expect(() =>
      calculateHeartRateTarget({ ...input, restingBpm: 190 }),
    ).toThrow();
    expect(() =>
      calculateHeartRateTarget({ ...input, lowerFraction: 0.8 }),
    ).toThrow();
  });
  it("separates guideline equivalents from unclassified minutes and short bouts", () => {
    expect(guidelineEquivalent(90, 30, 20)).toMatchObject({
      equivalentMinutes: 150,
      unclassifiedMinutes: 20,
    });
    expect(guidelineEquivalent(0.5, 0).equivalentMinutes).toBe(0.5);
    expect(() => guidelineEquivalent(-1, 0)).toThrow();
  });
  it("makes final interval recovery explicit", () => {
    const input = {
      warmUpSeconds: 600,
      coolDownSeconds: 600,
      repetitions: 6,
      workSeconds: 120,
      recoverySeconds: 120,
      includeFinalRecovery: true,
    };
    expect(intervalDuration(input)).toBe(2640);
    expect(intervalDuration({ ...input, includeFinalRecovery: false })).toBe(
      2520,
    );
    expect(intervalDuration({ ...input, workSeconds: null })).toBeNull();
    expect(() => intervalDuration({ ...input, repetitions: 1.5 })).toThrow();
  });
  it("classifies only the recorded CDC talk-test observations", () => {
    expect(classifyTalkTest("talk_but_not_sing").classification).toBe(
      "moderate",
    );
    expect(classifyTalkTest("few_words_only").classification).toBe("vigorous");
    expect(classifyTalkTest("not_recorded").classification).toBe(
      "unclassified",
    );
    expect(classifyTalkTest("unable_to_speak_comfortably").classification).toBe(
      "unclassified",
    );
  });
  it("uses timestamp seconds through suspension and rejects backwards clocks", () => {
    expect(
      exactElapsed(10.5, "2026-10-05T10:00:00Z", "2026-10-05T10:10:00.250Z"),
    ).toBe(610.75);
    expect(exactElapsed(10.5, null, "2026-10-05T10:10:00Z")).toBe(10.5);
    expect(() =>
      exactElapsed(0, "2026-10-05T10:01:00Z", "2026-10-05T10:00:00Z"),
    ).toThrow();
  });
  it("suppresses continuation and diagnostic claims after an urgent stop", () => {
    expect(stopBoundary(["chest_pressure_or_pain"])).toEqual({
      urgentSafetyMessage: true,
      allowContinue: false,
      allowIntensification: false,
      diagnosis: false,
    });
    expect(stopBoundary([]).allowContinue).toBe(true);
  });
  it("does not return calories, diet adjustments, or VO2max", () => {
    expect(calculatePace(5000, 1500)).not.toHaveProperty("calories");
    expect(guidelineEquivalent(90, 30)).not.toHaveProperty(
      "nutritionAdjustment",
    );
    expect(tanakaMaximum(40)).not.toHaveProperty("vo2max");
  });
});
