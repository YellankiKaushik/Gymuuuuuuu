import { expect, it } from "vitest";
import { programSchema } from "../src/features/programs/schema";
import { deriveProgramSummary } from "../src/features/programs/repository";
import { findPrograms } from "../src/features/programs/query";
import { programFixture } from "./fixtures/program";

function unknownProgram() {
  const program = structuredClone(programFixture);
  program.sessionDurationMinutes = null;
  for (const session of program.scheduleModel!.sessions)
    session.estimatedDurationMinutes = null;
  program.timeContext = {
    method: "source_unspecified",
    explanation:
      "The approved source gives no session duration. Unknown is neither zero nor an estimate and must not fit a time-limited search.",
    sourceIds: ["source_fixture"],
  };
  return program;
}
it("requires explicit provenance for unknown published duration and rejects mixed numeric claims", () => {
  const program = unknownProgram();
  expect(programSchema.safeParse(program).success).toBe(true);
  expect(
    programSchema.safeParse({ ...program, timeContext: undefined }).success,
  ).toBe(false);
  expect(
    programSchema.safeParse({
      ...program,
      sessionDurationMinutes: { min: 10, max: 10 },
    }).success,
  ).toBe(false);
  const mixed = structuredClone(program);
  mixed.scheduleModel!.sessions[0]!.estimatedDurationMinutes = {
    min: 10,
    max: 10,
  };
  expect(programSchema.safeParse(mixed).success).toBe(false);
  expect(
    programSchema.safeParse({
      ...program,
      timeContext: {
        ...program.timeContext!,
        method: "source_guideline_allocation",
      },
    }).success,
  ).toBe(false);
});
it("propagates any missing session duration through fixed and rotating weekly totals without converting it to zero", () => {
  const program = unknownProgram();
  expect(deriveProgramSummary(program).estimatedWeeklyMinutes).toBeNull();
  const mixed = structuredClone(programFixture);
  mixed.scheduleModel!.sessions.push({
    ...mixed.scheduleModel!.sessions[0]!,
    id: "session_unknown",
    estimatedDurationMinutes: null,
  });
  expect(deriveProgramSummary(mixed).estimatedWeeklyMinutes).toBeNull();
  mixed.scheduleModel!.mode = "rotating-sequence";
  expect(deriveProgramSummary(mixed).estimatedWeeklyMinutes).toBeNull();
  expect(deriveProgramSummary(programFixture).estimatedWeeklyMinutes).toEqual({
    min: 20,
    max: 30,
  });
});
it("never treats unknown duration as fitting an available time budget", () => {
  const program = unknownProgram();
  const input = {
    goal: program.primaryGoal,
    experience: program.experienceLevels[0]!,
    days: 7,
    minutes: 1000,
    equipmentIds: program.requiredEquipmentIds!,
    environment: program.environmentTags![0]!,
    style: "",
    eligible: "yes" as const,
  };
  expect(findPrograms(input, [program])).toEqual([]);
  expect(findPrograms(input, [programFixture])).toHaveLength(1);
  const unlimited = findPrograms({ ...input, minutes: null }, [program]);
  expect(unlimited).toHaveLength(1);
  expect(unlimited[0]!.reasons.join(" ")).toContain("Duration is not supplied");
  expect(findPrograms({ ...input, minutes: Number.NaN }, [program])).toEqual(
    [],
  );
});
