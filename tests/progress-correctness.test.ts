import { afterEach, expect, it, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import {
  localDateTimeValue,
  localDateValue,
} from "../src/features/progress/local-time";
import { newestActiveHeight, bmi } from "../src/features/progress/domain";
import {
  saveProgressRecord,
  readProgressStore,
} from "../src/features/progress/storage";
import { closeFitnessDatabase } from "../src/storage/indexed-db/fitness-database";

afterEach(() => {
  closeFitnessDatabase();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

it.each([
  ["UTC", "2026-10-16T04:00:00Z", "2026-10-16T04:00"],
  ["Asia/Kolkata", "2026-10-16T04:00:00Z", "2026-10-16T09:30"],
  ["America/Los_Angeles", "2026-10-16T04:00:00Z", "2026-10-15T21:00"],
  ["Asia/Kolkata", "2026-10-15T18:31:00Z", "2026-10-16T00:01"],
  ["America/Los_Angeles", "2026-10-16T06:59:00Z", "2026-10-15T23:59"],
])(
  "round trips local components and edited instants in %s at %s",
  (zone, instant, expected) => {
    vi.stubEnv("TZ", zone);
    const date = new Date(instant);
    expect(localDateTimeValue(date)).toBe(expected);
    expect(localDateValue(date)).toBe(expected.slice(0, 10));
    expect(new Date(localDateTimeValue(date)).toISOString()).toBe(
      date.toISOString(),
    );
    const edited = new Date(date.getTime() + 120_000);
    expect(new Date(localDateTimeValue(edited)).getTime()).toBe(
      edited.getTime(),
    );
  },
);

const timestamp = "2026-10-16T04:00:00Z";
const height = (id: string, measuredAt: string, valueCm: number) => ({
  id,
  measuredAt,
  valueCm,
  createdAt: timestamp,
  updatedAt: timestamp,
  deletedAt: null,
  localDate: measuredAt.slice(0, 10),
  timezone: "UTC",
  source: "manual",
  notes: null,
});

it("selects by measurement instant, excludes invalid/deleted/future rows and is order independent", () => {
  const older = height("zzz-older", "2026-01-01T03:00:00Z", 160);
  const newer = height("aaa-newer", "2026-10-16T03:00:00Z", 180);
  const rows = [
    newer,
    older,
    { ...newer, id: "deleted", deletedAt: timestamp },
    height("future", "2027-01-01T00:00:00Z", 190),
    { ...newer, valueCm: -1 },
    { ...newer, measuredAt: "invalid" },
  ];
  for (const ordered of [rows, [...rows].reverse()]) {
    expect(newestActiveHeight(ordered, new Date(timestamp))?.id).toBe(
      "aaa-newer",
    );
    expect(
      bmi(newestActiveHeight(ordered, new Date(timestamp)), 80)?.toFixed(1),
    ).toBe("24.7");
  }
  expect(newestActiveHeight([], new Date(timestamp))).toBeNull();
});

it("resolves equal instants by update/creation then stable ID tie, including offset timestamps", () => {
  const first = height("a", "2026-10-16T09:00:00+05:30", 160);
  const second = {
    ...height("z", "2026-10-16T03:30:00Z", 180),
    updatedAt: "2026-10-16T04:01:00Z",
  };
  expect(newestActiveHeight([first, second], new Date(timestamp))?.id).toBe(
    "z",
  );
  expect(newestActiveHeight([second, first], new Date(timestamp))?.id).toBe(
    "z",
  );
  const tied = { ...first, id: "b" };
  expect(newestActiveHeight([tied, first], new Date(timestamp))?.id).toBe("a");
});

it("persists the intended local instant and preserves chronological BMI after database reopen and edit", async () => {
  vi.stubEnv("TZ", "Asia/Kolkata");
  vi.stubGlobal("window", { indexedDB: new IDBFactory() });
  const measuredAt = new Date(
    localDateTimeValue(new Date(timestamp)),
  ).toISOString();
  await saveProgressRecord(
    "heightMeasurements",
    height("aaa-newest", measuredAt, 180),
  );
  await saveProgressRecord(
    "heightMeasurements",
    height("zzz-oldest", "2026-01-01T00:00:00Z", 160),
  );
  closeFitnessDatabase();
  const rows = await readProgressStore("heightMeasurements");
  expect(newestActiveHeight(rows, new Date(timestamp))?.measuredAt).toBe(
    "2026-10-16T04:00:00.000Z",
  );
  expect(
    bmi(newestActiveHeight(rows, new Date(timestamp)), 80)?.toFixed(1),
  ).toBe("24.7");
  await saveProgressRecord(
    "heightMeasurements",
    height("aaa-newest", new Date("2026-10-16T09:29").toISOString(), 179),
  );
  closeFitnessDatabase();
  expect(
    newestActiveHeight(
      await readProgressStore("heightMeasurements"),
      new Date(timestamp),
    )?.measuredAt,
  ).toBe("2026-10-16T03:59:00.000Z");
});
