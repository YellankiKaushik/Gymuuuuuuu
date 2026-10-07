import { expect, it } from "vitest";
import { programFixture } from "./fixtures/program";
import { programSchema } from "../src/features/programs/schema";
import { normativeProgramSchema } from "../src/features/programs/schema.generated";
import { validatePrograms } from "../src/features/programs/repository";
import { fromProgram } from "../src/features/workout-tracker/domain";
import { localProgramInstanceSchema } from "../src/features/programs/schema";
import { reviewedExerciseFixture } from "./fixtures/exercise";

function sourceUnspecified() {
  const candidate = structuredClone(programFixture);
  const prescription =
    candidate.scheduleModel!.sessions[0]!.exerciseBlocks[0]!.prescriptions[0]!;
  prescription.restSeconds = null;
  prescription.restGuidance = {
    status: "source_unspecified",
    text: "Test fixture: no numeric timed rest supplied by the source.",
    sourceIds: ["source_fixture"],
  };
  return candidate;
}
it("keeps normative rules intact and requires explicit provenance for unavailable timed rest", () => {
  expect(normativeProgramSchema.safeParse(programFixture).success).toBe(true);
  const candidate = sourceUnspecified();
  expect(normativeProgramSchema.safeParse(candidate).success).toBe(false);
  expect(programSchema.safeParse(candidate).success).toBe(true);
  const item =
    candidate.scheduleModel!.sessions[0]!.exerciseBlocks[0]!.prescriptions[0]!;
  delete item.restGuidance;
  expect(programSchema.safeParse(candidate).success).toBe(false);
});
it("still rejects incomplete publication, invented mixed rest states and unresolved sources", () => {
  const candidate = sourceUnspecified();
  const item =
    candidate.scheduleModel!.sessions[0]!.exerciseBlocks[0]!.prescriptions[0]!;
  item.restGuidance!.sourceIds = ["source_missing"];
  expect(
    validatePrograms(
      [candidate],
      new Set(["exercise_fixture", "exercise_alternative"]),
      new Set(["science_fixture"]),
    ).join(" "),
  ).toContain("Unknown source source_missing");
  expect(
    programSchema.safeParse({ ...candidate, progressionRules: [] }).success,
  ).toBe(false);
  expect(
    programSchema.safeParse({ ...candidate, sessionDurationMinutes: null })
      .success,
  ).toBe(false);
  item.restSeconds = { min: 0, max: 0 };
  expect(programSchema.safeParse(candidate).success).toBe(false);
});

it("freezes unspecified source rest into optional tracking without a zero-second timer", () => {
  const program = sourceUnspecified();
  const now = new Date().toISOString();
  const instance = localProgramInstanceSchema.parse({
    instanceId: "instance_source_rest",
    canonicalProgramId: program.id,
    canonicalProgramVersion: program.version,
    selectedAt: now,
    startDate: null,
    preferredWeekdays: {},
    substitutionSelections: {},
    status: "active",
    createdAt: now,
    updatedAt: now,
  });
  const session = fromProgram(
    program,
    instance,
    "session_fixture",
    "load_reps",
    () => reviewedExerciseFixture,
  );
  expect(
    session.exercises[0]!.sets[0]!.plannedTarget!.restSecondsMin,
  ).toBeNull();
  expect(
    session.exercises[0]!.sets[0]!.plannedTarget!.restSecondsMax,
  ).toBeNull();
  expect(session.exercises[0]!.prescriptionSnapshot!.notesSnapshot).toContain(
    "Rest source references: source_fixture",
  );
});
