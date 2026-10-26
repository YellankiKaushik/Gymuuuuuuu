import { afterEach, describe, expect, it, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { createRecordStorage } from "../src/storage/indexed-db/adapter";
import { personalPlanSchema } from "../src/domain/schemas/personal-workout-plan";
import { localRecordSchema } from "../src/domain/schemas/foundation";
import {
  deletePersonalPlan,
  canonicalPlanRest,
  listPersonalPlans,
  newPersonalPlan,
  personalPlanCsv,
  savePersonalPlan,
  workoutFromPersonalPlan,
} from "../src/features/visual-training/plans";
import { previewBackup, serializeBackup } from "../src/storage/backup/envelope";

afterEach(() => vi.unstubAllGlobals());
function draft() {
  const p = newPersonalPlan();
  p.payload.name = "My plan";
  p.payload.sessions[0]!.entries.push({
    id: "plan_entry_one",
    exerciseId: "exercise_bodyweight_squat",
    sets: 2,
    repetitions: 8,
    restSeconds: null,
  });
  return p;
}
function storage() {
  const values = new Map<string, string>();
  vi.stubGlobal("window", {
    indexedDB: new IDBFactory(),
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
  // Each test exercises atomic IDB conflicts independently of the fallback
  // exclusive lease; real browser Web Locks permit concurrent shared writers.
  vi.stubGlobal("navigator", {
    locks: {
      request: async (
        _name: string,
        _options: unknown,
        callback: (lock: object) => Promise<unknown>,
      ) => callback({}),
    },
  });
  return createRecordStorage();
}
describe("Phase 20 versioned personal plan contract", () => {
  it("converts minutes without binary rounding errors while preserving null, zero and real fractions", () => {
    expect(canonicalPlanRest(1.1, "min")).toBe(66);
    expect(canonicalPlanRest(0.5, "min")).toBe(30);
    expect(canonicalPlanRest(null, "min")).toBeNull();
    expect(canonicalPlanRest(0, "s")).toBe(0);
    expect(canonicalPlanRest(0.01, "min")).toBe(0.6);
    expect(canonicalPlanRest(1e-20, "min")).not.toBe(0);
  });
  it.each([
    ["sets", 0],
    ["sets", 1.5],
    ["sets", 101],
    ["repetitions", 0],
    ["repetitions", 10001],
    ["restSeconds", -1],
    ["restSeconds", 86401],
  ] as const)("rejects invalid %s %s without writes", (key, value) => {
    const p = draft();
    p.payload.sessions[0]!.entries[0]![key] = value;
    expect(personalPlanSchema.safeParse(p).success).toBe(false);
  });
  it("preserves missing targets separately from explicit zero rest", () => {
    const p = draft();
    Object.assign(p.payload.sessions[0]!.entries[0]!, {
      sets: null,
      repetitions: null,
      restSeconds: 0,
    });
    const w = workoutFromPersonalPlan(p, "A");
    expect(w.exercises[0]!.sets).toEqual([]);
    expect(w.exercises[0]!.prescriptionSnapshot?.plannedSetCount).toBeNull();
    expect(
      personalPlanSchema.parse(p).payload.sessions[0]!.entries[0]!.restSeconds,
    ).toBe(0);
  });
  it("rejects empty names, three sessions, invalid references and duplicate exercise/entry IDs", () => {
    const p = draft();
    expect(
      personalPlanSchema.safeParse({
        ...p,
        payload: { ...p.payload, name: "" },
      }).success,
    ).toBe(false);
    expect(
      personalPlanSchema.safeParse({
        ...p,
        payload: {
          ...p.payload,
          sessions: [
            ...p.payload.sessions,
            { id: "B", entries: [] },
            { id: "B", entries: [] },
          ],
        },
      }).success,
    ).toBe(false);
    const e = p.payload.sessions[0]!.entries[0]!;
    p.payload.sessions[0]!.entries.push({ ...e });
    expect(personalPlanSchema.safeParse(p).success).toBe(false);
    expect(
      localRecordSchema.safeParse({
        ...draft(),
        payload: { ...draft().payload, version: 2 },
      }).success,
    ).toBe(false);
    const q = draft();
    Reflect.set(
      q.payload.sessions[0]!.entries[0]!,
      "exerciseId",
      "exercise_not_published",
    );
    expect(localRecordSchema.safeParse(q).success).toBe(false);
  });
  it("does not change older generic records and fails closed on corrupt reserved IDs", () => {
    const p = draft();
    expect(
      localRecordSchema.safeParse({
        ...p,
        id: "legacy_program",
        payload: { kind: "program-instance", legacy: true },
      }).success,
    ).toBe(true);
    expect(
      localRecordSchema.safeParse({ ...p, payload: { kind: "misspelled" } })
        .success,
    ).toBe(false);
  });
  it("copies immutable targets and provenance into an ordinary personal workout", () => {
    const p = draft(),
      w = workoutFromPersonalPlan(p, "A");
    p.payload.sessions[0]!.entries[0]!.repetitions = 99;
    p.payload.name = "Edited";
    expect(w.source).toBe("ad_hoc");
    expect(w.programRef).toBeNull();
    expect(w.title).toBe("My plan · Session A");
    expect(w.exercises[0]!.sets).toHaveLength(2);
    expect(w.exercises[0]!.sets[0]!.plannedTarget?.repsMin).toBe(8);
    expect(w.exercises[0]!.sets[0]!.performance).toBeNull();
    expect(w.exercises[0]!.sets[0]!.restTargetSeconds).toBeNull();
  });
  it("blocks starting an empty session, supports A/B and preserves order", () => {
    const p = draft();
    p.payload.sessions.push({ id: "B", entries: [] });
    expect(() => workoutFromPersonalPlan(p, "B")).toThrow("Add an exercise");
    p.payload.sessions[1]!.entries = [
      { ...p.payload.sessions[0]!.entries[0]!, id: "plan_entry_b" },
    ];
    expect(workoutFromPersonalPlan(p, "B").title).toContain("Session B");
  });
  it("CSV uses established injection protection and includes nullable targets/session/exercise", () => {
    const p = draft();
    p.payload.name = "=SUM(A1:A2)";
    const csv = personalPlanCsv(p);
    expect(csv).toContain('"\'=SUM(A1:A2)"');
    expect(csv).toContain('"exercise_bodyweight_squat","2","8",""');
    expect(csv).toContain('"session"');
  });
});
describe("Phase 20 atomic persistence", () => {
  it("saves/reopens/edits/deletes without affecting legacy records", async () => {
    const s = storage();
    const old = {
      id: "legacy",
      module: "notes" as const,
      schemaVersion: 1 as const,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      payload: { text: "keep" },
    };
    await s.put(old);
    const p = await savePersonalPlan(s, draft());
    const other = createRecordStorage();
    expect((await listPersonalPlans(other))[0]).toEqual(p);
    const edited = await savePersonalPlan(
      other,
      { ...p, payload: { ...p.payload, name: "Revised" } },
      p,
    );
    expect(edited.payload.revision).toBe(2);
    await deletePersonalPlan(s, edited);
    expect(await listPersonalPlans(s)).toEqual([]);
    expect(await s.get("legacy")).toEqual(old);
    s.close();
    other.close();
  });
  it("allows only one concurrent stale update and rejects duplicate create/delete races", async () => {
    const s = storage(),
      p = await savePersonalPlan(s, draft()),
      other = createRecordStorage();
    const results = await Promise.allSettled([
      savePersonalPlan(
        s,
        { ...p, payload: { ...p.payload, name: "First" } },
        p,
      ),
      savePersonalPlan(
        other,
        { ...p, payload: { ...p.payload, name: "Second" } },
        p,
      ),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    await expect(savePersonalPlan(s, p)).rejects.toThrow("another tab");
    await expect(deletePersonalPlan(s, p)).rejects.toThrow("another tab");
    expect((await listPersonalPlans(s))[0]!.payload.revision).toBe(2);
    s.close();
    other.close();
  });
  it("round trips through the existing foundation backup and rejects future/corrupt plans in preview", async () => {
    const s = storage(),
      p = await savePersonalPlan(s, draft());
    const envelope = {
      format: "fitness-os-backup" as const,
      schemaVersion: 1 as const,
      exportedAt: new Date().toISOString(),
      appVersion: "0.1.0",
      records: [p],
      preferences: { theme: "system" as const, units: "metric" as const },
    };
    const raw = serializeBackup(envelope);
    expect(previewBackup(raw).ok).toBe(true);
    const corrupt = JSON.parse(raw);
    corrupt.records[0].payload.version = 2;
    expect(previewBackup(JSON.stringify(corrupt)).ok).toBe(false);
    expect(await s.get(p.id)).toEqual(p);
    s.close();
  });
  it("retains the draft when IndexedDB is unavailable", async () => {
    storage();
    Reflect.deleteProperty(window, "indexedDB");
    const p = draft();
    await expect(savePersonalPlan(createRecordStorage(), p)).rejects.toThrow(
      "IndexedDB",
    );
    expect(p.payload.name).toBe("My plan");
  });
});
