import { afterEach, expect, it, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { fitnessDatabaseVersion, openFitnessDatabase, closeFitnessDatabase } from "../src/storage/indexed-db/fitness-database";
import { dailyWeightSummaries, median, weightTrend, bmi, validateCircumference } from "../src/features/progress/domain";
import { makeProgressBackup, restoreProgressBackup, saveProgressRecord, validateProgressBackup, escapeCsv, recordsToCsv, deleteProgressRecord, undoProgressDelete, readProgressStore } from "../src/features/progress/storage";
import { phase15StoreNames } from "../src/features/progress/schema";

afterEach(() => { closeFitnessDatabase(); vi.unstubAllGlobals(); });
function weight(id: string, date: string, valueKg: number) {
  const timestamp = `${date}T08:00:00.000Z`;
  return { id, createdAt: timestamp, updatedAt: timestamp, deletedAt: null, measuredAt: timestamp, localDate: date, timezone: "UTC", valueKg, enteredValue: valueKg, enteredUnit: "kg", source: "manual", scaleId: null, timeContext: "morning", fastingState: "unknown", clothing: "unknown", afterBathroom: null, retrospective: false, notes: null };
}

it("upgrades the shared database to v15 without losing existing canonical stores", async () => {
  const factory = new IDBFactory(); vi.stubGlobal("window", { indexedDB: factory });
  const db = await openFitnessDatabase();
  expect(fitnessDatabaseVersion).toBe(17);
  expect(db.objectStoreNames.contains("workoutSessions")).toBe(true);
  expect(db.objectStoreNames.contains("nutritionDays")).toBe(true);
  for (const name of phase15StoreNames) expect(db.objectStoreNames.contains(name)).toBe(true);
  expect(db.transaction("phase15DeletedRecords").objectStore("phase15DeletedRecords").keyPath).toEqual(["entityType", "entityId"]);
});

it("uses daily medians and minimum measured-day thresholds without interpolation", () => {
  expect(median([80, 78, 82, 79])).toBe(79.5);
  const summaries = dailyWeightSummaries([weight("a", "2026-01-01", 80), weight("b", "2026-01-01", 82), weight("c", "2026-01-03", 79)] as never);
  expect(summaries[0]).toMatchObject({ localDate: "2026-01-01", medianKg: 81, recordCount: 2 });
  expect(weightTrend(summaries, 7)).toMatchObject({ valueKg: null, sampleDays: 2, flag: "insufficient_samples" });
  expect(bmi(null, 80)).toBeNull();
});

it("rejects a circumference canonical value that is not the replicate median", () => {
  const timestamp = "2026-01-01T08:00:00.000Z";
  const item = { id: "circ-1", createdAt: timestamp, updatedAt: timestamp, deletedAt: null, measuredAt: timestamp, localDate: "2026-01-01", timezone: "UTC", siteId: "waist", protocolId: "protocol_user_recorded", protocolVersion: "1", side: "not_applicable", posture: "standing", breathingPhase: "unknown", replicatesMm: [800, 820, 810], canonicalMm: 800, operator: "self", tapeId: null, notes: null };
  expect(validateCircumference(item).success).toBe(false);
  expect(validateCircumference({ ...item, canonicalMm: 810 }).success).toBe(true);
});

it("escapes spreadsheet formulas in text cells while preserving negative numbers", () => {
  expect(escapeCsv(-2.5)).toBe("-2.5");
  expect(recordsToCsv([{ note: "=SUM(A1:A2)", massKg: -2.5, text: "comma, and \"quote\"" }])).toContain("'=SUM(A1:A2)");
  expect(recordsToCsv([{ note: "=SUM(A1:A2)", massKg: -2.5, text: "comma, and \"quote\"" }])).toContain("-2.5");
  expect(recordsToCsv([{ note: "=SUM(A1:A2)", massKg: -2.5, text: "comma, and \"quote\"" }])).toContain('"comma, and ""quote"""');
});

it("validates the entire JSON backup before writes and keeps existing records on errors", async () => {
  vi.stubGlobal("window", { indexedDB: new IDBFactory() });
  const record = weight("w-1", "2026-01-01", 71.5);
  await saveProgressRecord("bodyWeightLogs", record);
  const backup = await makeProgressBackup();
  expect(backup.photoBinariesIncluded).toBe(false);
  expect(validateProgressBackup(backup).validated.bodyWeightLogs).toHaveLength(1);
  const corrupt = { ...backup, bodyWeightLogs: [{ ...record, valueKg: -1 }] };
  expect(() => validateProgressBackup(corrupt)).toThrow();
  await expect(restoreProgressBackup(corrupt, "replace")).rejects.toThrow();
  const after = await makeProgressBackup() as unknown as Record<string, unknown>;
  expect(after.bodyWeightLogs).toEqual([record]);
});

it("soft-deletes with an audit/tombstone and restores from the undo snapshot", async () => {
  vi.stubGlobal("window", { indexedDB: new IDBFactory() });
  const record = weight("undo-me", "2026-01-02", 69.2);
  await saveProgressRecord("bodyWeightLogs", record);
  await deleteProgressRecord("bodyWeightLogs", record.id, new Date("2026-01-03T00:00:00.000Z"));
  expect(await readProgressStore("bodyWeightLogs")).toMatchObject([{ id: "undo-me", deletedAt: "2026-01-03T00:00:00.000Z" }]);
  expect(await readProgressStore("phase15AuditEvents")).toHaveLength(2);
  await undoProgressDelete("bodyWeightLogs", record.id, new Date("2026-01-03T00:00:10.000Z"));
  expect(await readProgressStore("bodyWeightLogs")).toMatchObject([{ id: "undo-me", deletedAt: null }]);
  expect(await readProgressStore("phase15DeletedRecords")).toEqual([]);
});
