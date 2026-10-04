import { afterEach, expect, it, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { createRecordStorage } from "../src/storage/indexed-db/adapter";
import {
  clearCurrentProgram,
  listProgramInstances,
  selectProgram,
  updateProgramInstance,
} from "../src/features/programs/local";
import {
  deriveProgramSummary,
  publishedPrograms,
  validatePrograms,
} from "../src/features/programs/repository";
import {
  findPrograms,
  parseProgramQuery,
  searchPrograms,
} from "../src/features/programs/query";
import { programSchema } from "../src/features/programs/schema";
import { programFixture } from "./fixtures/program";
afterEach(() => vi.unstubAllGlobals());
it("keeps draft programs hidden and rejects incomplete publication", () => {
  expect(publishedPrograms).toEqual([]);
  expect(
    programSchema.safeParse({ ...programFixture, progressionRules: [] })
      .success,
  ).toBe(false);
  expect(
    programSchema.safeParse({
      ...programFixture,
      sessionDurationMinutes: { min: 60, max: 30 },
    }).success,
  ).toBe(false);
});
it("validates references and derived totals", () => {
  expect(
    validatePrograms(
      [programFixture],
      new Set(["exercise_fixture", "exercise_alternative"]),
      new Set(["science_fixture"]),
    ),
  ).toEqual([]);
  expect(validatePrograms([programFixture])).not.toEqual([]);
  expect(deriveProgramSummary(programFixture).estimatedWeeklyMinutes).toEqual({
    min: 20,
    max: 30,
  });
  expect(
    deriveProgramSummary({
      ...programFixture,
      trainingDaysPerWeek: 3,
      scheduleModel: {
        ...programFixture.scheduleModel!,
        mode: "rotating-sequence",
      },
    }).estimatedWeeklyMinutes,
  ).toEqual({ min: 60, max: 90 });
});
it("sanitizes URLs, limits comparison and searches 1000 fixtures", () => {
  expect(
    parseProgramQuery({
      days: "3,bad",
      compare: ["program_a", "bad", "program_b", "program_c", "program_d"],
    }),
  ).toMatchObject({
    days: ["3"],
    compare: ["program_a", "program_b", "program_c"],
  });
  const records = Array.from({ length: 1000 }, (_, index) => ({
    ...programFixture,
    id: `program_fixture_${index}`,
    displayName: `Fixture ${index}`,
  }));
  expect(searchPrograms(parseProgramQuery({ q: "999" }), records)).toHaveLength(
    1,
  );
});
it("finder enforces scope, equipment, time, days and experience", () => {
  const input = {
    goal: programFixture.primaryGoal,
    experience: programFixture.experienceLevels[0]!,
    days: 1,
    minutes: 30,
    equipmentIds: ["equipment_bodyweight"],
    environment: "gym",
    style: "",
    eligible: "yes" as const,
  };
  expect(findPrograms(input, [programFixture])).toHaveLength(1);
  for (const change of [
    { eligible: "unsure" as const },
    { equipmentIds: [] },
    { minutes: 29 },
    { days: 0 },
    { experience: "specialist" },
  ])
    expect(findPrograms({ ...input, ...change }, [programFixture])).toEqual([]);
});
it("preserves versions, confirms replacement and saves only reviewed substitutions", async () => {
  vi.stubGlobal("window", { indexedDB: new IDBFactory() });
  const storage = createRecordStorage("program-test");
  const first = await selectProgram(storage, programFixture);
  await expect(selectProgram(storage, programFixture)).rejects.toThrow(
    "Confirm",
  );
  await expect(
    updateProgramInstance(
      storage,
      {
        ...first,
        substitutionSelections: {
          "session_fixture:block_fixture:0": "exercise_unknown",
        },
      },
      programFixture,
    ),
  ).rejects.toThrow("outside");
  await updateProgramInstance(
    storage,
    {
      ...first,
      substitutionSelections: {
        "session_fixture:block_fixture:0": "exercise_alternative",
      },
    },
    programFixture,
  );
  storage.close();
  const reopened = createRecordStorage("program-test");
  expect(
    (await listProgramInstances(reopened))[0]?.substitutionSelections,
  ).toEqual({ "session_fixture:block_fixture:0": "exercise_alternative" });
  await expect(
    updateProgramInstance(reopened, first, {
      ...programFixture,
      version: "2.0.0",
    }),
  ).rejects.toThrow("version");
  const next = await selectProgram(reopened, programFixture, first.instanceId);
  expect(
    (await listProgramInstances(reopened)).filter(
      (item) => item.status === "planned",
    ),
  ).toHaveLength(1);
  await clearCurrentProgram(reopened, next);
  expect(
    (await listProgramInstances(reopened)).every(
      (item) => item.status === "archived",
    ),
  ).toBe(true);
  reopened.close();
});
it("aborts atomic changes when a payload cannot be cloned", async () => {
  vi.stubGlobal("window", { indexedDB: new IDBFactory() });
  const storage = createRecordStorage("program-atomic");
  const now = new Date().toISOString();
  const record = {
    id: "original",
    module: "plans" as const,
    schemaVersion: 1 as const,
    createdAt: now,
    updatedAt: now,
    payload: { text: "preserve" },
  };
  await storage.put(record);
  await expect(
    storage.commit({
      put: [
        { ...record, id: "new" },
        { ...record, id: "bad", payload: { fn: () => 0 } },
      ],
      remove: ["original"],
    }),
  ).rejects.toThrow();
  expect(await storage.list()).toEqual([record]);
  storage.close();
});
