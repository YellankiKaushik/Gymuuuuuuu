import { calculateSleep } from "../../src/features/recovery/domain";
import {
  sleepSchema,
  routineSchema,
  type SleepLog,
} from "../../src/features/recovery/schema";
export function sleepFixture(change: Partial<SleepLog> = {}): SleepLog {
  const base = {
    id: "sleep_fixture_0001",
    sleepDate: "2026-08-05",
    timezone: "Asia/Kolkata",
    source: "manual_morning_diary" as const,
    createdAt: "2026-08-05T07:00:00+05:30",
    updatedAt: "2026-08-05T07:00:00+05:30",
    status: "complete" as const,
    attemptedSleepAt: "2026-08-04T22:30:00+05:30",
    outOfBedAt: "2026-08-05T06:45:00+05:30",
    finalWakeAt: "2026-08-05T06:30:00+05:30",
    sleepOnsetLatencyMinutes: 15,
    wakeAfterSleepOnsetMinutes: 20,
    naps: [],
    ...change,
  };
  return sleepSchema.parse({ ...base, calculated: calculateSleep(base) });
}
export function routineFixture(version = 1) {
  return routineSchema.parse({
    id: `routine_version_${version}`,
    routineIdentityId: "routine_identity_1",
    versionNumber: version,
    title: "Synthetic fixture only",
    context: "standalone_mobility",
    publicationStatus: "local_active",
    steps: [
      {
        id: "step_fixture_1",
        order: 1,
        title: "Test step",
        doseType: "seconds",
        doseValue: 30,
        sides: "none",
      },
    ],
    createdAt: `2026-08-05T07:0${version}:00Z`,
    revisionReason: "Synthetic fixture",
  });
}
