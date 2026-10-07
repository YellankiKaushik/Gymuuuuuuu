import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import snapshot from "../src/content/provenance/three-day-program-snapshot.json";
import {
  programRecords,
  programVersions,
  validatePrograms,
} from "../src/features/programs/repository";
import { findPrograms } from "../src/features/programs/query";
const program = programRecords.find((r) => r.id === snapshot.recordId)!;
it("retains the inspected weekly framework and an independently attributed original arrangement", () => {
  for (const [file, digest] of [
    ["three-day-program-definition.json", snapshot.definitionSha256],
    ["three-day-program-extract.txt", snapshot.sourceExtractSha256],
  ])
    expect(
      createHash("sha256")
        .update(readFileSync(`src/content/provenance/${file}`))
        .digest("hex"),
    ).toBe(digest);
  expect(snapshot.sourceLocators[0]).toContain("104 and 106");
  expect(program.populationScope).toEqual(["older-adults-general"]);
  expect(program.timeContext?.method).toBe("source_guideline_allocation");
  expect(program.trainingDaysPerWeek).toBe(3);
  const calendar = program.scheduleModel!.calendarExamples![0]!.days;
  expect(calendar).toHaveLength(7);
  expect(calendar.filter((day) => day.sessionId).map((day) => day.day)).toEqual(
    ["monday", "wednesday", "friday"],
  );
  for (let index = 0; index < calendar.length; index++) {
    if (calendar[index]?.sessionId)
      expect(calendar[(index + 1) % calendar.length]?.sessionId).toBeNull();
  }
  expect(validatePrograms([program])).toEqual([]);
  expect(
    programVersions.find(
      (r) => r.id === program.id && r.version === program.version,
    ),
  ).toEqual(program);
  const prescriptions = program.scheduleModel!.sessions.flatMap((s) =>
    s.exerciseBlocks.flatMap((b) => b.prescriptions),
  );
  expect(prescriptions).toHaveLength(18);
  for (const p of prescriptions) {
    expect(p.restSeconds).toBeNull();
    expect(p.sets).toEqual({ min: 2, max: 2 });
    expect(p.repetitionTarget.range).toEqual({ min: 10, max: 15 });
  }
  expect(program.review?.editorialReviewerRole).toContain(
    "published_personal_use",
  );
});
it("provides a static three-day finder option with required equipment and source scope", () => {
  const input = {
    eligible: "yes" as const,
    days: 3,
    minutes: 30,
    environment: "home",
    equipmentIds: program.requiredEquipmentIds!,
    experience: "foundation",
    goal: "general-fitness",
    style: "full-body",
  };
  expect(findPrograms(input).map((r) => r.program.id)).toContain(program.id);
  expect(findPrograms({ ...input, equipmentIds: [] })).toEqual([]);
  expect(findPrograms(input, [{ ...program, contentStatus: "draft" }])).toEqual(
    [],
  );
});
