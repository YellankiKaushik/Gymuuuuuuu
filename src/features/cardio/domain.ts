import {
  backupSchema,
  sessionSchema,
  recordSchema,
  segmentSchema,
  planSchema,
  routineSchema,
  cardioReference,
  type CardioBackup,
  type Session,
  type SessionRecord,
  type Segment,
  type Intensity,
  type Plan,
  type Routine,
} from "./schema";
import {
  calculateHeartRateTarget,
  exactElapsed,
  guidelineEquivalent,
  classifyActualIntensity,
  tanakaMaximum,
} from "./calculations";
import { localDate, validateZonedTimestamp } from "../recovery/domain";
export function newCardioId() {
  return `cardio_${crypto.randomUUID()}`;
}
export function manualIntensity(
  instruction = "User-selected activity; no prescribed intensity.",
): Intensity {
  return {
    method: "manual_text",
    methodVersion: "user-instruction-1",
    lower: null,
    upper: null,
    unit: null,
    instruction,
    maxHrSource: "not_applicable",
    provenance: {
      sourceIds: [],
      basis: "user_selected",
      frameworkId: null,
      maximumHeartRateBpm: null,
      restingHeartRateBpm: null,
      ageYears: null,
      lowerFraction: null,
      upperFraction: null,
      estimated: false,
      hrTargetingDisabled: false,
      cautions: [],
    },
  };
}
export function makeSegment(
  title: string,
  targetMode: Segment["targetMode"] = "open",
  targetValue: number | null = null,
  segmentType: Segment["segmentType"] = "steady",
  order = 1,
): Segment {
  return {
    id: newCardioId(),
    order,
    segmentType,
    targetMode,
    targetValue,
    targetUnit:
      targetMode === "duration"
        ? "s"
        : targetMode === "distance"
          ? "m"
          : targetMode === "repetitions"
            ? "repetitions"
            : null,
    actualDurationSeconds: null,
    actualDistanceMeters: null,
    intensity: manualIntensity(),
    completed: false,
    title,
    actualSecondsExact: null,
    status: "planned",
    actualTalkTest: "not_recorded",
    actualPerceivedEffort: null,
    modificationNote: "",
    recoveryMode: segmentType === "recovery" ? "passive" : "not_applicable",
  };
}
function unique(values: readonly string[], label: string) {
  if (new Set(values).size !== values.length)
    throw Error(`Duplicate ${label}.`);
}
function sourceIds(ids: readonly string[]) {
  unique(ids, "source reference");
  if (ids.some((id) => !cardioReference.sources.some((s) => s.id === id)))
    throw Error("Unknown cardio source reference.");
}
export function validateIntensity(value: Intensity) {
  const p = value.provenance;
  sourceIds(p.sourceIds);
  if (p.basis === "reviewed_source")
    throw Error(
      "No reviewed public prescriptions are released yet. Save this as your own selection.",
    );
  if (p.frameworkId !== null)
    throw Error("No reviewed heart-rate zone framework is released.");
  if (value.lower !== null && value.upper !== null && value.lower > value.upper)
    throw Error("Intensity lower bound exceeds its upper bound.");
  if (
    value.method === "percent_hrmax" ||
    value.method === "heart_rate_reserve"
  ) {
    if (value.maxHrSource === "not_applicable")
      throw Error("Heart-rate targeting needs an explicit maximum source.");
    if (p.estimated !== (value.maxHrSource === "age_predicted_tanaka"))
      throw Error("Maximum source and estimate label disagree.");
    if (value.maxHrSource === "age_predicted_tanaka") {
      const calculated = tanakaMaximum(p.ageYears);
      if (
        !calculated ||
        calculated.bpm !== p.maximumHeartRateBpm ||
        !p.sourceIds.includes(calculated.sourceId)
      )
        throw Error(
          "Tanaka estimate or source does not match its frozen inputs.",
        );
    }
    const target = calculateHeartRateTarget({
      method: value.method,
      maximumBpm: p.maximumHeartRateBpm,
      restingBpm: p.restingHeartRateBpm,
      lowerFraction: p.lowerFraction,
      upperFraction: p.upperFraction,
      affectedByMedicationOrMedicalContext: p.hrTargetingDisabled,
    });
    if (
      target.lowerBpm !== value.lower ||
      target.upperBpm !== value.upper ||
      value.unit !== "bpm" ||
      value.methodVersion !== target.methodVersion
    )
      throw Error("Heart-rate target differs from its frozen calculation.");
  } else {
    if (
      value.maxHrSource !== "not_applicable" ||
      p.estimated ||
      p.maximumHeartRateBpm !== null ||
      p.restingHeartRateBpm !== null ||
      p.ageYears !== null ||
      p.lowerFraction !== null ||
      p.upperFraction !== null
    )
      throw Error("Non-HR methods cannot carry a hidden HR prescription.");
    if (
      value.method === "manual_text" &&
      (!value.instruction?.trim() ||
        value.lower !== null ||
        value.upper !== null ||
        value.unit !== null)
    )
      throw Error(
        "Manual instructions need text and no invented numerical zone.",
      );
    if (
      value.method === "perceived_effort_0_10" &&
      [value.lower, value.upper].some((n) => n !== null && (n < 0 || n > 10))
    )
      throw Error("Perceived effort must be within 0–10.");
    if (
      value.method === "pace" &&
      value.unit !== "s/km" &&
      value.unit !== "s/mile"
    )
      throw Error("Pace targets need a declared pace unit.");
    if (value.method === "power" && value.unit !== "W")
      throw Error("Power targets need watts.");
    if (
      ["pace", "power"].includes(value.method) &&
      [value.lower, value.upper].some((n) => n !== null && n <= 0)
    )
      throw Error("Pace and power numerical targets must be positive.");
  }
}
export function validateSegments(values: Segment[], planned = false) {
  unique(
    values.map((s) => s.id),
    "segment identity",
  );
  values.forEach((value, i) => {
    const s = segmentSchema.parse(value);
    if (s.order !== i + 1) throw Error("Segment orders must be consecutive.");
    validateIntensity(s.intensity);
    const unit =
      s.targetMode === "duration"
        ? "s"
        : s.targetMode === "distance"
          ? "m"
          : s.targetMode === "repetitions"
            ? "repetitions"
            : null;
    if (s.targetUnit !== unit)
      throw Error("Segment targets must use their canonical units.");
    if (
      s.targetMode === "open"
        ? s.targetValue !== null
        : s.targetValue === null || s.targetValue <= 0
    )
      throw Error("Use a positive target or an open segment with no target.");
    if (s.targetMode === "repetitions" && !Number.isInteger(s.targetValue))
      throw Error("Repetitions must be whole numbers.");
    if (s.completed !== (s.status === "completed"))
      throw Error("Segment completion fields disagree.");
    if (
      s.actualSecondsExact === null
        ? s.actualDurationSeconds !== null
        : s.actualDurationSeconds !== Math.floor(s.actualSecondsExact)
    )
      throw Error(
        "Segment integer seconds differ from exact measured seconds.",
      );
    if (s.recoveryMode !== "not_applicable" && s.segmentType !== "recovery")
      throw Error("Recovery mode belongs to recovery segments.");
    if (
      planned &&
      (s.status !== "planned" ||
        s.actualSecondsExact !== null ||
        s.actualDistanceMeters !== null ||
        s.actualPerceivedEffort !== null ||
        s.actualTalkTest !== "not_recorded" ||
        s.modificationNote !== "")
    )
      throw Error(
        "Plan templates cannot contain personal performance measurements.",
      );
  });
}
export function validatePlan(value: unknown): Plan {
  const plan = planSchema.parse(value);
  sourceIds(plan.sourceIds);
  unique(
    plan.sessions.map((s) => s.id),
    "plan session",
  );
  plan.sessions.forEach((s) => validateSegments(s.segments, true));
  return plan;
}
export function validateRoutine(value: unknown): Routine {
  const routine = routineSchema.parse(value);
  sourceIds(routine.sourceIds);
  validateSegments(routine.segments, true);
  return routine;
}
function validateRecord(record: SessionRecord) {
  validateSegments(record.segments);
  unique(record.stopSignals, "stop signal");
  unique(record.linkedWorkoutIds, "linked workout");
  unique(record.environment.tags, "environment tag");
  unique(
    record.laps.map((l) => l.id),
    "lap identity",
  );
  record.laps.forEach((lap, index) => {
    if (
      (record.startedAt && Date.parse(lap.at) < Date.parse(record.startedAt)) ||
      (record.endedAt && Date.parse(lap.at) > Date.parse(record.endedAt))
    )
      throw Error("Lap timestamp is outside this session.");
    const previous = record.laps[index - 1];
    if (
      previous &&
      (Date.parse(lap.at) < Date.parse(previous.at) ||
        lap.elapsedSecondsExact < previous.elapsedSecondsExact)
    )
      throw Error("Lap observations must be chronological.");
    if (
      record.elapsedSecondsExact !== null &&
      lap.elapsedSecondsExact > record.elapsedSecondsExact
    )
      throw Error("Lap elapsed time exceeds the session.");
  });
  unique(
    record.heartRateObservations.map((h) => h.id),
    "HR observation",
  );
  const modality = cardioReference.modalities.find(
    (m) => m.id === record.modalityId,
  )!;
  if (record.phase03ExerciseId !== modality.phase03ExerciseId)
    throw Error("Activity and technique identity disagree.");
  if (record.startedAt) {
    validateZonedTimestamp(record.startedAt, record.timezone);
    if (localDate(record.startedAt, record.timezone) !== record.sessionDate)
      throw Error("Session date differs from its local start date.");
  }
  if (
    record.endedAt &&
    (!record.startedAt ||
      Date.parse(record.endedAt) < Date.parse(record.startedAt))
  )
    throw Error("End time must follow the session start.");
  if (
    record.startedAt &&
    record.endedAt &&
    record.elapsedSecondsExact !== null &&
    record.elapsedSecondsExact >
      (Date.parse(record.endedAt) - Date.parse(record.startedAt)) / 1000 + 0.001
  )
    throw Error("Active elapsed time cannot exceed the start/end time window.");
  if (Date.parse(record.updatedAt) < Date.parse(record.createdAt))
    throw Error("Updated time cannot precede creation.");
  if (
    record.elapsedSecondsExact === null
      ? record.elapsedSeconds !== null
      : record.elapsedSeconds !== Math.floor(record.elapsedSecondsExact)
  )
    throw Error("Elapsed integer seconds differ from exact measured seconds.");
  if (
    record.averageHeartRateBpm !== null &&
    record.maximumHeartRateBpm !== null &&
    record.averageHeartRateBpm > record.maximumHeartRateBpm
  )
    throw Error("Average HR cannot exceed recorded maximum HR.");
  if (
    record.heartRateSource === "none" &&
    (record.averageHeartRateBpm !== null || record.maximumHeartRateBpm !== null)
  )
    throw Error("Heart-rate observations need their source.");
  if (record.averageCadence !== null && record.cadenceUnit === "not_recorded")
    throw Error("Cadence needs its measurement unit.");
  if (
    record.player.currentIndex >= record.segments.length &&
    (record.status === "active" || record.status === "paused")
  )
    throw Error("The current segment is unavailable.");
  if ((record.status === "active") !== (record.player.runningSince !== null))
    throw Error("Player state and timestamp anchor disagree.");
  if (record.status === "active" && record.stopSignals.length)
    throw Error("An urgent stop must pause or end the session.");
  if (
    (record.status === "completed" || record.status === "abandoned") &&
    (!record.startedAt || !record.endedAt)
  )
    throw Error("Finished sessions need start and end timestamps.");
  if (
    record.elapsedSecondsExact !== null &&
    record.segments.reduce(
      (total, s) => total + (s.actualSecondsExact ?? 0),
      0,
    ) >
      record.elapsedSecondsExact + 0.000001
  )
    throw Error("Segment durations exceed the recorded session duration.");
  if (
    record.startedAt &&
    record.player.runningSince &&
    Date.parse(record.player.runningSince) < Date.parse(record.startedAt)
  )
    throw Error("Timer anchor precedes start.");
  for (const h of record.heartRateObservations)
    if (
      (record.startedAt && Date.parse(h.at) < Date.parse(record.startedAt)) ||
      (record.endedAt && Date.parse(h.at) > Date.parse(record.endedAt))
    )
      throw Error("HR observation is outside the session.");
  if (record.frozenSource) {
    const frozen = record.frozenSource;
    if (frozen.kind === "plan") {
      validatePlan(frozen.version);
      if (
        !frozen.version.sessions.some((s) => s.id === frozen.sessionId) ||
        frozen.weekNumber > frozen.version.durationWeeks
      )
        throw Error("Frozen plan session or week is unavailable.");
      if (
        !record.sourcePlanSnapshot ||
        record.sourcePlanSnapshot.planId !== frozen.version.planIdentityId ||
        record.sourcePlanSnapshot.planVersionId !== frozen.version.id ||
        record.sourcePlanSnapshot.sessionId !== frozen.sessionId ||
        record.sourcePlanSnapshot.weekNumber !== frozen.weekNumber ||
        record.sourcePlanSnapshot.title !== frozen.version.title
      )
        throw Error("Source plan summary differs from its frozen version.");
    } else {
      validateRoutine(frozen.version);
      if (record.sourcePlanSnapshot)
        throw Error("Routine sessions cannot masquerade as a plan session.");
    }
  } else if (record.sourcePlanSnapshot)
    throw Error("Source plan needs its full frozen snapshot.");
}
export function validateSession(value: unknown): Session {
  const s = sessionSchema.parse(value);
  validateRecord(s);
  if (s.status === "completed" && !s.originalCompletedRecord)
    throw Error("Completed records need their original frozen record.");
  if (s.originalCompletedRecord) {
    const original = s.originalCompletedRecord;
    validateRecord(original);
    if (
      original.id !== s.id ||
      original.status !== "completed" ||
      JSON.stringify(original.frozenSource) !==
        JSON.stringify(s.frozenSource) ||
      JSON.stringify(original.sourcePlanSnapshot) !==
        JSON.stringify(s.sourcePlanSnapshot)
    )
      throw Error("Historical source snapshot changed.");
    if (
      original.segments.length !== s.segments.length ||
      original.segments.some(
        (seg, i) =>
          seg.id !== s.segments[i]?.id ||
          seg.targetMode !== s.segments[i]?.targetMode ||
          seg.targetValue !== s.segments[i]?.targetValue ||
          seg.targetUnit !== s.segments[i]?.targetUnit ||
          seg.segmentType !== s.segments[i]?.segmentType ||
          JSON.stringify(seg.intensity) !==
            JSON.stringify(s.segments[i]?.intensity),
      )
    )
      throw Error("Historical prescribed intensity changed.");
  }
  unique(
    s.revisions.map((r) => r.id),
    "edit revision",
  );
  for (const revision of s.revisions) {
    validateRecord(revision.record);
    if (
      revision.record.id !== s.id ||
      JSON.stringify(revision.record.frozenSource) !==
        JSON.stringify(s.frozenSource)
    )
      throw Error("Edit revision source differs.");
  }
  return s;
}
export function emptyCardioBackup(): CardioBackup {
  return {
    schemaVersion: "1.0.0",
    companionVersion: 1,
    exportedAt: new Date().toISOString(),
    moduleId: "phase_13_cardio_conditioning",
    cardioSessions: [],
    customPlanIdentities: [],
    customPlanVersions: [],
    customRoutineIdentities: [],
    customRoutineVersions: [],
    settings: [],
    auditEvents: [],
    deletedRecords: [],
  };
}
export function validateCardioBackup(value: unknown): CardioBackup {
  const root = backupSchema.parse(value);
  for (const rows of [
    root.cardioSessions,
    root.customPlanIdentities,
    root.customPlanVersions,
    root.customRoutineIdentities,
    root.customRoutineVersions,
    root.settings,
    root.auditEvents,
    root.deletedRecords,
  ])
    unique(
      rows.map((r) => r.id),
      "record identity",
    );
  root.cardioSessions.forEach(validateSession);
  root.customPlanVersions.forEach(validatePlan);
  root.customRoutineVersions.forEach(validateRoutine);
  if (
    root.cardioSessions.filter((s) => ["active", "paused"].includes(s.status))
      .length > 1
  )
    throw Error("Only one live cardio session can be restored.");
  function versions(
    identities: CardioBackup["customPlanIdentities"],
    rows: (Plan | Routine)[],
    kind: "plan" | "routine",
  ) {
    for (const identity of identities) {
      const matches = rows
        .filter(
          (v) =>
            ("planIdentityId" in v ? v.planIdentityId : v.routineIdentityId) ===
            identity.id,
        )
        .sort((a, b) => a.versionNumber - b.versionNumber);
      if (
        !matches.length ||
        matches.at(-1)?.id !== identity.currentVersionId ||
        matches.at(-1)?.title !== identity.title ||
        matches.some((v, i) => v.versionNumber !== i + 1)
      )
        throw Error(`Invalid ${kind} identity/version lineage.`);
    }
    if (
      rows.some(
        (v) =>
          !identities.some(
            (i) =>
              i.id ===
              ("planIdentityId" in v ? v.planIdentityId : v.routineIdentityId),
          ),
      )
    )
      throw Error(`Orphaned ${kind} version.`);
  }
  versions(root.customPlanIdentities, root.customPlanVersions, "plan");
  versions(root.customRoutineIdentities, root.customRoutineVersions, "routine");
  const selected = root.settings[0]?.value.currentPlanIdentityId;
  if (
    selected &&
    !root.customPlanIdentities.some((i) => i.id === selected && !i.archived)
  )
    throw Error("Selected local cardio plan is unavailable.");
  unique(
    root.deletedRecords.map((t) => `${t.entityType}:${t.entityId}`),
    "deleted entity",
  );
  for (const tomb of root.deletedRecords) {
    const snap = tomb.snapshot;
    if (snap.kind !== tomb.entityType)
      throw Error("Deleted entity type differs from its snapshot.");
    if (snap.kind === "session") {
      validateSession(snap.session);
      if (
        snap.session.id !== tomb.entityId ||
        root.cardioSessions.some((s) => s.id === tomb.entityId)
      )
        throw Error("Deleted session identity conflicts with a live record.");
    } else {
      if (snap.identity.id !== tomb.entityId)
        throw Error("Deleted identity differs from its snapshot.");
      versions([snap.identity], snap.versions, snap.kind);
      if (snap.kind === "plan") {
        snap.versions.forEach(validatePlan);
        if (root.customPlanIdentities.some((i) => i.id === tomb.entityId))
          throw Error("Deleted plan is still live.");
      } else {
        snap.versions.forEach(validateRoutine);
        if (root.customRoutineIdentities.some((i) => i.id === tomb.entityId))
          throw Error("Deleted routine is still live.");
      }
    }
  }
  return root;
}
export function startCardioSession(
  input: {
    title: string;
    modalityId: string;
    sessionTypeId: Session["sessionTypeId"];
    timezone: string;
    segments: Segment[];
    frozenSource?: Session["frozenSource"];
  },
  now: string,
  ownerId: string,
): Session {
  const segments = structuredClone(input.segments);
  validateSegments(segments, true);
  const frozen = input.frozenSource ?? null;
  return validateSession({
    id: newCardioId(),
    title: input.title,
    sessionDate: localDate(now, input.timezone),
    timezone: input.timezone,
    status: "active",
    modalityId: input.modalityId,
    phase03ExerciseId:
      cardioReference.modalities.find((m) => m.id === input.modalityId)
        ?.phase03ExerciseId ?? null,
    sessionTypeId: input.sessionTypeId,
    startedAt: now,
    endedAt: null,
    elapsedSeconds: null,
    elapsedSecondsExact: null,
    classificationVersion: "cdc-talk-effort-examples-1",
    deviceLabel: null,
    distanceMeters: null,
    averageHeartRateBpm: null,
    maximumHeartRateBpm: null,
    heartRateSource: "none",
    averagePowerWatts: null,
    averageCadence: null,
    cadenceUnit: "not_recorded",
    perceivedEffort0to10: null,
    talkTest: "not_recorded",
    segments,
    environment: {
      locationType: "unknown",
      surface: null,
      temperatureCelsius: null,
      humidityPercent: null,
      elevationGainMeters: null,
      tags: [],
    },
    stopSignals: [],
    notes: "",
    sourcePlanSnapshot:
      frozen?.kind === "plan"
        ? {
            planId: frozen.version.planIdentityId,
            planVersionId: frozen.version.id,
            weekNumber: frozen.weekNumber,
            sessionId: frozen.sessionId,
            title: frozen.version.title,
          }
        : null,
    frozenSource: frozen,
    createdAt: now,
    updatedAt: now,
    player: {
      currentIndex: 0,
      accumulatedSeconds: 0,
      segmentSeconds: 0,
      runningSince: now,
    },
    linkedWorkoutIds: [],
    laps: [],
    strengthPriority: "not_set",
    heartRateObservations: [],
    originalCompletedRecord: null,
    revisions: [],
    revision: 1,
    lease: {
      ownerId,
      expiresAt: new Date(Date.parse(now) + 30000).toISOString(),
    },
  });
}
export function sessionElapsed(session: Session, now: string) {
  return exactElapsed(
    session.player.accumulatedSeconds,
    session.player.runningSince,
    now,
  );
}
export function recordCardioLap(
  input: Session,
  now: string,
  distanceMeters: number | null,
) {
  const session = structuredClone(validateSession(input));
  if (
    !["active", "paused"].includes(session.status) ||
    session.stopSignals.length
  )
    throw Error(
      "A lap cannot be added after ending activity or an urgent stop.",
    );
  session.laps.push({
    id: newCardioId(),
    at: now,
    elapsedSecondsExact: sessionElapsed(session, now),
    distanceMeters,
  });
  session.revision++;
  session.updatedAt = now;
  return validateSession(session);
}
export function transitionCardio(
  input: Session,
  action: "pause" | "resume" | "next" | "skip" | "finish" | "abandon",
  now: string,
): Session {
  const s = structuredClone(validateSession(input));
  if (!["active", "paused"].includes(s.status))
    throw Error("This session has already ended.");
  if (action === "resume") {
    if (s.status !== "paused" || s.stopSignals.length)
      throw Error(
        "This session cannot resume. Urgent stop concerns require ending activity and seeking help.",
      );
    s.status = "active";
    s.player.runningSince = now;
  } else {
    const delta = exactElapsed(0, s.player.runningSince, now);
    s.player.accumulatedSeconds += delta;
    s.player.segmentSeconds += delta;
    s.player.runningSince = s.status === "active" ? now : null;
    if (action === "pause") {
      s.status = "paused";
      s.player.runningSince = null;
    } else {
      const current = s.segments[s.player.currentIndex];
      if (current) {
        current.actualSecondsExact = s.player.segmentSeconds;
        current.actualDurationSeconds = Math.floor(s.player.segmentSeconds);
        current.status =
          action === "skip" || action === "abandon" ? "skipped" : "completed";
        current.completed = current.status === "completed";
      }
      if (action === "next" || action === "skip") {
        s.player.currentIndex++;
        s.player.segmentSeconds = 0;
      }
      if (
        action === "finish" ||
        action === "abandon" ||
        s.player.currentIndex >= s.segments.length
      ) {
        s.status = action === "abandon" ? "abandoned" : "completed";
        for (const segment of s.segments)
          if (segment.status === "planned") {
            segment.status = "skipped";
            segment.completed = false;
          }
        s.endedAt = now;
        s.player.runningSince = null;
        s.elapsedSecondsExact = s.player.accumulatedSeconds;
        s.elapsedSeconds = Math.floor(s.elapsedSecondsExact);
        s.lease = null;
      }
    }
  }
  s.updatedAt = now;
  s.revision++;
  if (s.status === "completed")
    s.originalCompletedRecord = recordSchema.parse(
      Object.fromEntries(
        Object.entries(s).filter(
          ([k]) =>
            ![
              "originalCompletedRecord",
              "revisions",
              "revision",
              "lease",
            ].includes(k),
        ),
      ),
    );
  return validateSession(s);
}
export function markUrgentStop(
  input: Session,
  signal: Session["stopSignals"][number],
  now: string,
): Session {
  const s =
    input.status === "active"
      ? transitionCardio(input, "pause", now)
      : structuredClone(input);
  if (s.status !== "paused") throw Error("This session is not live.");
  s.stopSignals = [...new Set([...s.stopSignals, signal])];
  s.updatedAt = now;
  s.revision++;
  return validateSession(s);
}
export function weeklyVolume(sessions: readonly Session[]) {
  let moderate = 0,
    vigorous = 0,
    unclassified = 0;
  for (const s of sessions.filter((s) => s.status === "completed")) {
    let segmentTotal = 0;
    for (const seg of s.segments) {
      const duration = seg.actualSecondsExact;
      if (duration === null) continue;
      segmentTotal += duration;
      const category = classifyActualIntensity(
        seg.actualTalkTest === "not_recorded" &&
          seg.actualPerceivedEffort === null
          ? s.talkTest
          : seg.actualTalkTest,
        seg.actualTalkTest === "not_recorded" &&
          seg.actualPerceivedEffort === null
          ? s.perceivedEffort0to10
          : seg.actualPerceivedEffort,
      ).classification;
      if (category === "moderate") moderate += duration / 60;
      else if (category === "vigorous") vigorous += duration / 60;
      else unclassified += duration / 60;
    }
    // Whole-session talk observations only classify time not individually recorded.
    const remainder =
      Math.max(0, (s.elapsedSecondsExact ?? 0) - segmentTotal) / 60;
    const category = classifyActualIntensity(
      s.talkTest,
      s.perceivedEffort0to10,
    ).classification;
    if (category === "moderate") moderate += remainder;
    else if (category === "vigorous") vigorous += remainder;
    else unclassified += remainder;
  }
  return guidelineEquivalent(moderate, vigorous, unclassified);
}
