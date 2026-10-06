import { describe, expect, it } from "vitest";
import snapshot from "../src/content/provenance/running-plan-snapshot.json";
import { publicPlanSchema } from "../src/features/cardio/public-plan";
import {
  publicCardioEntities,
  validateCardioRelease,
} from "../src/features/cardio/publication";
import {
  publicPlanWeekSnapshot,
  publicPlanMatches,
} from "../src/features/cardio/public-plan-session";
import {
  startCardioSession,
  validateIntensity,
  validateSession,
} from "../src/features/cardio/domain";
import {
  extractRunningSessions,
  preserveImmutableRunningSnapshot,
} from "../scripts/content/nhs-running";

const plan = publicPlanSchema.parse(snapshot);
const entity = publicCardioEntities.find(
  (entry) => entry.id === "plan_5k_general_foundation",
)!;
describe("source running schedules", () => {
  it("preserves a prior extraction and refuses replacing its source version", () => {
    const again = structuredClone(plan);
    again.extractedAt = "2026-10-06T12:00:00Z";
    expect(preserveImmutableRunningSnapshot(plan, again).extractedAt).toBe(
      plan.extractedAt,
    );
    again.sourceHtmlSha256 = "a".repeat(64);
    expect(() => preserveImmutableRunningSnapshot(plan, again)).toThrow(
      /existing data was preserved/,
    );
    expect(plan.sourceHtmlSha256).toBe(snapshot.sourceHtmlSha256);
  });
  it("retains distinct source intervals and validates every stated total", () => {
    expect(plan.sessions).toHaveLength(27);
    expect(plan.sessions[0]?.totalSeconds).toBe(1710);
    expect(
      plan.sessions[0]?.segments.filter((s) => s.kind === "run"),
    ).toHaveLength(8);
    expect(plan.sessions[13]?.segments.map((s) => s.seconds)).toEqual([
      300, 480, 300, 480, 300,
    ]);
    expect(plan.sessions[14]?.segments.map((s) => s.seconds)).toEqual([
      300, 1200, 300,
    ]);
    expect(plan.sessions[15]?.segments.map((s) => s.seconds)).toEqual([
      300, 300, 180, 480, 180, 300, 300,
    ]);
    expect(plan.sessions[26]?.segments.map((s) => s.seconds)).toEqual([
      300, 1800, 300,
    ]);
    validateCardioRelease();
    const wrong = structuredClone(plan);
    wrong.sessions[0]!.totalSeconds++;
    expect(publicPlanSchema.safeParse(wrong).success).toBe(false);
    const duplicate = structuredClone(plan);
    duplicate.sessions[1] = structuredClone(duplicate.sessions[0]!);
    expect(publicPlanSchema.safeParse(duplicate).success).toBe(false);
    expect(() => extractRunningSessions("<h2>Incomplete source</h2>")).toThrow(
      /27 runs/,
    );
  });
  it("freezes a selected source week without turning targets into observations", () => {
    const week = publicPlanWeekSnapshot(entity, 5);
    expect(week.sessions).toHaveLength(3);
    expect(week.sessions[2]!.segments.map((s) => s.targetValue)).toEqual([
      300, 1200, 300,
    ]);
    const session = startCardioSession(
      {
        title: "Source run",
        modalityId: "modality_running_outdoor",
        sessionTypeId: "walk_jog",
        timezone: "UTC",
        segments: week.sessions[2]!.segments,
        frozenSource: {
          kind: "plan",
          version: week,
          weekNumber: 5,
          sessionId: week.sessions[2]!.id,
        },
      },
      "2026-10-05T10:00:00Z",
      "synthetic-test-owner",
    );
    expect(session.elapsedSecondsExact).toBeNull();
    expect(session.distanceMeters).toBeNull();
    expect(
      session.segments.every(
        (s) =>
          s.actualSecondsExact === null && s.actualTalkTest === "not_recorded",
      ),
    ).toBe(true);
    expect(session.sourcePlanSnapshot?.weekNumber).toBe(5);
    expect(validateSession(session).frozenSource).toEqual(session.frozenSource);
    const intensity = structuredClone(session.segments[0]!.intensity);
    intensity.instruction = "Invented prescription";
    expect(() => validateIntensity(intensity)).toThrow(
      /approved public source version/,
    );
    intensity.instruction = plan.intensity.instruction;
    intensity.lower = 120;
    expect(() => validateIntensity(intensity)).toThrow();
    expect(() => publicPlanWeekSnapshot(entity, 10)).toThrow(
      /published source week/,
    );
  });
  it("filters only supported programme contracts", () => {
    const filters = {
      experience: "",
      days: "",
      time: "",
      equipment: "",
      impact: "",
      priority: "",
      environment: "",
    };
    expect(publicPlanMatches(plan, filters)).toBe(true);
    expect(publicPlanMatches(plan, { ...filters, days: "2" })).toBe(false);
    expect(
      publicPlanMatches(plan, {
        ...filters,
        days: "3",
        time: "40",
        experience: "beginner",
      }),
    ).toBe(true);
    expect(publicPlanMatches(plan, { ...filters, time: "30" })).toBe(false);
    expect(publicPlanMatches(plan, { ...filters, impact: "lower" })).toBe(
      false,
    );
    expect(publicPlanMatches(plan, { ...filters, environment: "indoor" })).toBe(
      false,
    );
  });
});
