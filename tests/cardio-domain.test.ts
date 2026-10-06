import { expect, it } from "vitest";
import {
  makeSegment,
  startCardioSession,
  transitionCardio,
  validateSession,
  validateCardioBackup,
  emptyCardioBackup,
  markUrgentStop,
  weeklyVolume,
  sessionElapsed,
  recordCardioLap,
} from "../src/features/cardio/domain";
import { mergeCardio } from "../src/features/cardio/storage";
import {
  publicCardioEntities,
  validateCardioRelease,
} from "../src/features/cardio/publication";
import { cardioCsv } from "../src/features/cardio/export";
import { cardioReference } from "../src/features/cardio/schema";
export function cardioFixture() {
  return startCardioSession(
    {
      title: "Synthetic test session",
      modalityId: "modality_walking_outdoor",
      sessionTypeId: "manual_other",
      timezone: "UTC",
      segments: [
        makeSegment("First", "duration", 60),
        makeSegment("Second", "open", null, "steady", 2),
      ],
    },
    "2026-10-05T10:00:00Z",
    "test-owner",
  );
}
it("keeps timestamp timer exact through pauses and segment transitions", () => {
  let s = cardioFixture();
  s = transitionCardio(s, "pause", "2026-10-05T10:00:10.250Z");
  expect(sessionElapsed(s, "2026-10-05T10:10:00Z")).toBe(10.25);
  s = transitionCardio(s, "resume", "2026-10-05T10:10:00Z");
  s = transitionCardio(s, "next", "2026-10-05T10:10:20.500Z");
  expect(s.segments[0]?.actualSecondsExact).toBe(30.75);
  expect(s.segments[0]?.actualDurationSeconds).toBe(30);
  s = transitionCardio(s, "finish", "2026-10-05T10:10:30.750Z");
  expect(s.elapsedSecondsExact).toBe(41);
  expect(s.originalCompletedRecord?.elapsedSecondsExact).toBe(41);
  expect(() => transitionCardio(s, "finish", "2026-10-05T10:10:40Z")).toThrow(
    "ended",
  );
});
it("does not infer actual distance or heart rate from a planned target", () => {
  const s = transitionCardio(cardioFixture(), "finish", "2026-10-05T10:01:00Z");
  expect(s.distanceMeters).toBeNull();
  expect(s.averageHeartRateBpm).toBeNull();
  expect(s.segments[0]?.actualDistanceMeters).toBeNull();
});
it("blocks urgent continuation and unsupported clinical inference", () => {
  const s = markUrgentStop(
    cardioFixture(),
    "chest_pressure_or_pain",
    "2026-10-05T10:00:10Z",
  );
  expect(s.status).toBe("paused");
  expect(() => transitionCardio(s, "resume", "2026-10-05T10:01:00Z")).toThrow(
    "cannot resume",
  );
  expect(() =>
    validateSession({
      ...s,
      status: "active",
      player: { ...s.player, runningSince: s.updatedAt },
    }),
  ).toThrow("urgent");
});
it("rejects unsupported keys, contradictory measurements and altered historical targets", () => {
  const s = transitionCardio(cardioFixture(), "finish", "2026-10-05T10:01:00Z");
  expect(() =>
    validateSession({ ...s, gpsLocation: { lat: 1, lon: 1 } }),
  ).toThrow();
  expect(() =>
    validateSession({
      ...s,
      averageHeartRateBpm: 150,
      heartRateSource: "none",
    }),
  ).toThrow("source");
  const altered = structuredClone(s);
  altered.segments[0]!.intensity.instruction = "Changed target";
  expect(() => validateSession(altered)).toThrow("Historical prescribed");
  expect(() => validateSession({ ...s, elapsedSeconds: 61 })).toThrow("exact");
  expect(() => validateSession({ ...s, sessionDate: "2026-10-04" })).toThrow(
    "local start",
  );
});
it("separates actual segment classifications and avoids double counting", () => {
  let s = cardioFixture();
  s.segments[0]!.actualTalkTest = "talk_but_not_sing";
  s = transitionCardio(s, "next", "2026-10-05T10:01:00Z");
  s.segments[1]!.actualTalkTest = "few_words_only";
  s = transitionCardio(s, "finish", "2026-10-05T10:01:30Z");
  expect(weeklyVolume([s])).toMatchObject({
    moderateMinutes: 1,
    vigorousMinutes: 0.5,
    unclassifiedMinutes: 0,
    equivalentMinutes: 2,
  });
  expect(weeklyVolume([cardioFixture()]).equivalentMinutes).toBe(0);
});
it("validates backup graphs and keep/copy semantics before storage", () => {
  const root = emptyCardioBackup();
  root.cardioSessions = [
    transitionCardio(cardioFixture(), "finish", "2026-10-05T10:01:00Z"),
  ];
  expect(mergeCardio(root, root, "keep").cardioSessions).toHaveLength(1);
  const copy = mergeCardio(root, root, "copy");
  expect(copy.cardioSessions).toHaveLength(2);
  const copied = copy.cardioSessions[1]!;
  expect(copied.id).not.toBe(root.cardioSessions[0]!.id);
  expect(copied.originalCompletedRecord?.id).toBe(copied.id);
  expect(copied.title).toBe("Synthetic test session");
  expect(copied.modalityId).toBe("modality_walking_outdoor");
  expect(() =>
    validateCardioBackup({
      ...root,
      cardioSessions: [...root.cardioSessions, ...root.cardioSessions],
    }),
  ).toThrow("Duplicate");
});
it("publishes only the explicitly sourced identities from the 202 seeds", () => {
  expect(cardioReference.seedTaxonomy).toHaveLength(202);
  expect(publicCardioEntities.map((r) => r.id)).toEqual([
    "topic_talk_test",
    "plan_5k_general_foundation",
  ]);
  expect(
    publicCardioEntities.every((r) => r.publicationStatus === "published"),
  ).toBe(true);
  expect(() => validateCardioRelease()).not.toThrow();
});
it("exports seven CSV datasets with null blanks and spreadsheet escaping", () => {
  const root = emptyCardioBackup(),
    s = transitionCardio(cardioFixture(), "finish", "2026-10-05T10:01:00Z");
  s.notes = "=SUM(A1:A3)";
  root.cardioSessions = [s];
  const files = cardioCsv(root);
  expect(Object.keys(files)).toHaveLength(7);
  expect(files["cardio-sessions.csv"]).toContain("'=SUM");
  expect(files["cardio-sessions.csv"]).not.toContain("null");
});
it("records timestamp laps without inferring distance or double-counting volume", () => {
  let s = recordCardioLap(cardioFixture(), "2026-10-05T10:00:20.250Z", null);
  s = recordCardioLap(s, "2026-10-05T10:00:30.500Z", 100);
  s = transitionCardio(s, "finish", "2026-10-05T10:01:00Z");
  expect(s.laps[0]?.elapsedSecondsExact).toBe(20.25);
  expect(s.laps[0]?.distanceMeters).toBeNull();
  expect(s.laps[1]?.distanceMeters).toBe(100);
  expect(weeklyVolume([s]).unclassifiedMinutes).toBe(1);
  expect(() => recordCardioLap(s, "2026-10-05T10:02:00Z", null)).toThrow();
  const root = emptyCardioBackup();
  root.cardioSessions = [s];
  expect(cardioCsv(root)["cardio-segments.csv"]).toContain("lap_observation");
});
it("uses actual whole-session reports for unspecified segments and keeps other effort values unclassified", () => {
  let s = cardioFixture();
  s.perceivedEffort0to10 = 5;
  s = transitionCardio(s, "finish", "2026-10-05T10:01:00Z");
  expect(weeklyVolume([s]).moderateMinutes).toBe(1);
  s.perceivedEffort0to10 = 9;
  expect(weeklyVolume([s]).unclassifiedMinutes).toBe(1);
});
