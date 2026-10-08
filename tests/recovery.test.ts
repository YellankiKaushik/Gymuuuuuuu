import { it, expect } from "vitest";
import {
  calculateSleep,
  validateSleep,
  clockRegularity,
  startSession,
  transitionSession,
  playerElapsed,
  validateRecoveryBackup,
} from "../src/features/recovery/domain";
import { checkInSchema, sleepSchema } from "../src/features/recovery/schema";
import {
  emptyRecoveryBackup,
  mergeRecovery,
} from "../src/features/recovery/storage";
import { recoveryCsv } from "../src/features/recovery/export";
import {
  validateRecoveryRelease,
  publicRecoveryArticles,
} from "../src/features/recovery/publication";
import { sleepFixture, routineFixture } from "./fixtures/recovery";
it("reproduces diary and nap vectors without converting missing values to zero", () => {
  const entry = sleepFixture();
  expect(validateSleep(entry).calculated).toMatchObject({
    sleepOpportunityMinutes: 495,
    terminalWakeMinutes: 15,
    estimatedTotalSleepMinutes: 445,
  });
  expect(entry.calculated.sleepEfficiencyPercent).toBeCloseTo(89.9, 1);
  const nap = sleepFixture({
    sleepOnsetLatencyMinutes: 40,
    naps: [
      {
        id: "nap_fixture_01",
        startAt: "2026-08-05T14:00:00+05:30",
        endAt: "2026-08-05T14:25:00+05:30",
      },
    ],
  });
  expect(validateSleep(nap).calculated.dailyTotalSleepMinutes).toBe(445);
  expect(
    sleepFixture({
      outOfBedAt: null,
      sleepOnsetLatencyMinutes: null,
      status: "incomplete",
    }).calculated.estimatedTotalSleepMinutes,
  ).toBeNull();
});
it("rejects impossible chronology, altered cached arithmetic, overlapping naps and wrong wake date", () => {
  expect(() =>
    validateSleep(sleepFixture({ sleepOnsetLatencyMinutes: 600 })),
  ).toThrow();
  const entry = sleepFixture();
  entry.calculated.estimatedTotalSleepMinutes = 999;
  expect(() => validateSleep(entry)).toThrow("does not match");
  expect(() =>
    validateSleep(sleepFixture({ sleepDate: "2026-08-04" })),
  ).toThrow("wake date");
  expect(() =>
    validateSleep(
      sleepFixture({
        naps: [
          {
            id: "nap_fixture_01",
            startAt: "2026-08-05T14:00:00+05:30",
            endAt: "2026-08-05T14:25:00+05:30",
          },
          {
            id: "nap_fixture_02",
            startAt: "2026-08-05T14:10:00+05:30",
            endAt: "2026-08-05T14:30:00+05:30",
          },
        ],
      }),
    ),
  ).toThrow();
  expect(
    calculateSleep({
      source: "manual_recall",
      attemptedSleepAt: "bad",
      outOfBedAt: "worse",
    }).valid,
  ).toBe(false);
});
it("preserves seconds and detects nonexistent DST clocks while accepting either explicit fold offset", () => {
  const spring = sleepFixture({
    sleepDate: "2026-03-08",
    timezone: "America/New_York",
    attemptedSleepAt: "2026-03-07T23:00:00-05:00",
    finalWakeAt: "2026-03-08T07:00:30-04:00",
    outOfBedAt: "2026-03-08T07:01:00-04:00",
    sleepOnsetLatencyMinutes: 0,
    wakeAfterSleepOnsetMinutes: 0,
  });
  expect(validateSleep(spring).calculated.estimatedTotalSleepMinutes).toBe(
    420.5,
  );
  expect(() =>
    validateSleep(
      sleepFixture({
        sleepDate: "2026-03-08",
        timezone: "America/New_York",
        attemptedSleepAt: "2026-03-08T02:30:00-05:00",
        finalWakeAt: "2026-03-08T07:00:00-04:00",
        outOfBedAt: "2026-03-08T07:01:00-04:00",
      }),
    ),
  ).toThrow("offset");
  for (const offset of ["-04:00", "-05:00"])
    expect(() =>
      validateSleep(
        sleepFixture({
          sleepDate: "2026-11-01",
          timezone: "America/New_York",
          attemptedSleepAt: `2026-11-01T01:30:00${offset}`,
          finalWakeAt: "2026-11-01T07:00:00-05:00",
          outOfBedAt: "2026-11-01T07:01:00-05:00",
        }),
      ),
    ).not.toThrow();
});
it("labels device estimates separately and rejects stages; never infers a composite readiness score", () => {
  const device = sleepFixture({
    source: "consumer_device_estimate",
    deviceDurationMinutes: 430,
  });
  expect(validateSleep(device).calculated).toMatchObject({
    estimatedTotalSleepMinutes: 430,
    sleepEfficiencyPercent: null,
  });
  expect(() =>
    sleepSchema.parse({ ...device, stages: { deep: 80 } }),
  ).toThrow();
  const check = checkInSchema.parse({
    id: "check_fixture_01",
    date: "2026-08-05",
    timezone: "Asia/Kolkata",
    createdAt: "2026-08-05T00:00:00Z",
    updatedAt: "2026-08-05T00:00:00Z",
    energy: 2,
    generalFatigue: 4,
    stress: 3,
    motivation: 2,
    overallReadiness: null,
    painOrInjuryConcern: true,
    painConcernSeverity: 7,
  });
  expect(check.overallReadiness).toBeNull();
  expect("calculatedRecoveryScore" in check).toBe(false);
  expect(() =>
    checkInSchema.parse({
      ...check,
      regionalSoreness: [{ regionId: "whole_body", severity: 3 }],
    }),
  ).toThrow();
});
it("unwraps bedtime near midnight and separates timezone changes", () => {
  const a = sleepFixture({ attemptedSleepAt: "2026-08-04T23:50:00+05:30" }),
    b = sleepFixture({ attemptedSleepAt: "2026-08-05T00:10:00+05:30" });
  const clock = clockRegularity([a, b]);
  expect(clock.bedtime.max! - clock.bedtime.min!).toBe(20);
  expect(
    clockRegularity([a, { ...b, timezone: "Europe/London" }]).timezoneChanged,
  ).toBe(true);
});
it("resumes frozen snapshots with elapsed time, stops paused time and prevents finished-session transitions", () => {
  const routine = routineFixture();
  const at = "2026-08-05T07:00:00Z";
  const paused = startSession(routine, "UTC", at);
  const running = transitionSession(paused, "resume", at);
  expect(playerElapsed(running, "2026-08-05T07:00:10Z").activeSeconds).toBe(10);
  const next = transitionSession(running, "pause", "2026-08-05T07:00:10Z");
  expect(playerElapsed(next, "2026-08-05T08:00:00Z").activeSeconds).toBe(10);
  const finished = transitionSession(
    next,
    "complete_step",
    "2026-08-05T08:00:00Z",
  );
  expect(finished.state).toBe("completed");
  expect(finished.routineVersionId).toBe(routine.id);
  expect(() => transitionSession(finished, "resume")).toThrow("finished");
});
it("copies version graphs and preserves free text and historical snapshots", () => {
  const root = emptyRecoveryBackup(),
    routine = routineFixture(),
    newer = routineFixture(2);
  root.customRoutineVersions = [routine, newer];
  root.customRoutineIdentities = [
    {
      id: routine.routineIdentityId,
      currentVersionId: newer.id,
      title: newer.title,
      status: "active",
      createdAt: routine.createdAt,
      updatedAt: newer.createdAt,
    },
  ];
  const session = transitionSession(
    startSession(routine, "UTC"),
    "complete_step",
  );
  session.notes = routine.id;
  root.mobilitySessions = [session];
  root.sleepLogs = [sleepFixture()];
  const clone = mergeRecovery(root, root, "import_copy");
  expect(clone.customRoutineIdentities).toHaveLength(2);
  expect(clone.mobilitySessions).toHaveLength(2);
  expect(clone.mobilitySessions[1]?.notes).toBe(routine.id);
  expect(clone.mobilitySessions[1]?.routineSnapshot.versionNumber).toBe(1);
  expect(() => validateRecoveryBackup(clone)).not.toThrow();
});
it("exports five CSV families without missing-as-zero or spreadsheet formula execution", () => {
  const root = emptyRecoveryBackup();
  root.sleepLogs = [
    sleepFixture({
      status: "incomplete",
      sleepOnsetLatencyMinutes: null,
      notes: "=SUM(1,2)",
    }),
  ];
  const csv = recoveryCsv(root, "sleep");
  expect(csv).toContain("'=SUM(1,2)");
  expect(csv).toContain(",,");
  for (const kind of ["checkins", "soreness", "sessions", "routines"] as const)
    expect(recoveryCsv(root, kind)).toContain("id");
  expect(publicRecoveryArticles.map((r) => r.id)).toEqual([
    "sleep_duration_adults",
    "sleep_regularity",
    "static_stretching",
    "stretching_intensity",
    "sleep_quality_vs_duration",
    "bedroom_environment",
    "wind_down_routine",
    "caffeine_and_sleep",
    "alcohol_and_sleep",
    "sleep_evaluation_signals",
    "sleep_diary_method",

  ]);
  expect(publicRecoveryArticles.every((r) => r.sourceIds.length > 0)).toBe(
    true,
  );
  expect(() => validateRecoveryRelease()).not.toThrow();
});
it("records each side explicitly and rejects unknown exercise references", () => {
  const routine = routineFixture();
  routine.steps[0]!.sides = "left_right";
  let session = startSession(routine, "UTC");
  session = transitionSession(session, "complete_step");
  expect(session.side).toBe("right");
  expect(session.state).toBe("paused");
  expect(session.completedStepIds).toHaveLength(0);
  session = transitionSession(session, "complete_step");
  expect(session.state).toBe("completed");
  expect(session.completedSides.map((s) => s.side)).toEqual(["left", "right"]);
  expect(() =>
    startSession(
      {
        ...routine,
        steps: [
          {
            ...routine.steps[0]!,
            phase03ExerciseId: "exercise_draft_unreviewed",
          },
        ],
      },
      "UTC",
    ),
  ).toThrow("published");
});
