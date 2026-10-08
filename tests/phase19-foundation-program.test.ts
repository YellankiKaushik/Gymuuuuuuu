import { expect, test } from "vitest";
import {
  programRecords,
  programVersions,
  validatePrograms,
} from "../src/features/programs/repository";
import { exerciseRecords } from "../src/features/exercises/repository";
import { programSchema } from "../src/features/programs/schema";
import { findPrograms } from "../src/features/programs/query";
test("publishes an original source-scoped program with exact public technique prerequisites", () => {
  const program = programRecords.find(
    (r) => r.id === "program_full_body_2_day_foundation",
  )!;
  expect(program.contentStatus).toBe("published");
  expect(program.populationScope).toEqual(["older-adults-general"]);
  expect(
    programVersions.find(
      (r) => r.id === program.id && r.version === program.version,
    ),
  ).toEqual(program);
  expect(validatePrograms([program])).toEqual([]);
  expect(program.timeContext?.method).toBe("source_guideline_allocation");
  const prescriptions = program.scheduleModel!.sessions.flatMap((s) =>
    s.exerciseBlocks.flatMap((b) => b.prescriptions),
  );
  expect(prescriptions).toHaveLength(12);
  for (const p of prescriptions) {
    expect(
      exerciseRecords.find((e) => e.id === p.exerciseId)?.contentStatus,
    ).toBe("published");
    expect(p.restSeconds).toBeNull();
    expect(p.restGuidance?.sourceIds).toEqual(["source_nia_strength_2018"]);
    expect(p.sets).toEqual({ min: 2, max: 2 });
    expect(p.repetitionTarget.range).toEqual({ min: 10, max: 15 });
  }
  expect(program.audience?.prerequisites.join(" ")).toContain("intermediate");
  const changed = structuredClone(program);
  expect(
    changed.scheduleModel!.sessions[0]!.estimatedDurationMinutes,
  ).not.toBeNull();
  changed.scheduleModel!.sessions[0]!.estimatedDurationMinutes!.max = 35;
  expect(programSchema.safeParse(changed).success).toBe(false);
});
test("finder exposes source allocation honestly and hides mismatched equipment and drafts", () => {
  const program = programRecords.find(
    (r) => r.id === "program_full_body_2_day_foundation",
  )!;
  const input = {
    eligible: "yes" as const,
    days: 2,
    minutes: 30,
    environment: "home",
    equipmentIds: program.requiredEquipmentIds!,
    experience: "foundation",
    goal: "general-fitness",
    style: "full-body",
  };
  const results = findPrograms(input);
  expect(results.map((r) => r.program.id)).toContain(program.id);
  expect(results[0]?.reasons.join(" ")).toContain("not guaranteed");
  expect(findPrograms({ ...input, equipmentIds: [] })).toEqual([]);
  expect(findPrograms(input, [{ ...program, contentStatus: "draft" }])).toEqual(
    [],
  );
});
test("exercise variants do not invent ACE protocols or transfer machine and one-leg prescriptions", () => {
  for (const id of [
    "exercise_bodyweight_squat",
    "exercise_one_arm_dumbbell_row",
  ]) {
    const row = exerciseRecords.find((r) => r.id === id)!;
    expect(row.programmingGuidance![0]?.setRange).toBeNull();
    expect(row.programmingGuidance![0]?.repRange).toBeNull();
    expect(row.programmingGuidance![0]?.restSeconds).toBeNull();
    expect(
      row.sources?.some((s) => s.sourceType === "professional-technique-guide"),
    ).toBe(true);
  }
  const calf = exerciseRecords.find(
    (r) => r.id === "exercise_standing_calf_raise",
  )!;
  expect(calf.equipmentIds).toEqual([
    "equipment_bodyweight",
    "equipment_sturdy_chair",
  ]);
  expect(calf.programmingGuidance![0]?.setRange).toEqual({ min: 2, max: 2 });
  expect(
    exerciseRecords.find((r) => r.id === "exercise_single_leg_calf_raise")!
      .programmingGuidance![0]?.setRange,
  ).toBeNull();
  expect(
    exerciseRecords.find((r) => r.id === "exercise_incline_push_up")!.summary,
  ).toContain("wall");
});
