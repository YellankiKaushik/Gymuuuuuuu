import {
  backupSchema,
  calculatedSchema,
  sleepSchema,
  sessionSchema,
  identitySchema,
  checkInSchema,
  type SleepLog,
  type RecoveryBackup,
  type Session,
  type Routine,
} from "./schema";
export function newRecoveryId() {
  return `recovery_${crypto.randomUUID()}`;
}
const difference = (
  end: string | undefined | null,
  start: string | undefined | null,
) => (end && start ? (Date.parse(end) - Date.parse(start)) / 60000 : null);
export function calculateSleep(
  input: Pick<
    SleepLog,
    | "attemptedSleepAt"
    | "outOfBedAt"
    | "finalWakeAt"
    | "sleepOnsetLatencyMinutes"
    | "wakeAfterSleepOnsetMinutes"
    | "naps"
    | "source"
    | "deviceDurationMinutes"
    | "gotIntoBedAt"
  >,
) {
  const warnings: string[] = [];
  const opportunity = difference(input.outOfBedAt, input.attemptedSleepAt),
    terminal = difference(input.outOfBedAt, input.finalWakeAt);
  let valid = true;
  const invalid = (message: string) => {
    valid = false;
    warnings.push(message);
  };
  if (
    opportunity !== null &&
    (!Number.isFinite(opportunity) || opportunity < 0 || opportunity > 1440)
  )
    invalid(
      "Sleep opportunity needs valid timestamps between zero and 24 hours.",
    );
  if (
    terminal !== null &&
    (!Number.isFinite(terminal) || terminal < 0 || terminal > 1440)
  )
    invalid(
      "Final wake must precede getting out of bed with valid timestamps.",
    );
  if (
    input.gotIntoBedAt &&
    input.attemptedSleepAt &&
    Date.parse(input.gotIntoBedAt) > Date.parse(input.attemptedSleepAt)
  )
    invalid("Getting into bed must precede attempting sleep.");
  if (
    input.finalWakeAt &&
    input.attemptedSleepAt &&
    Date.parse(input.finalWakeAt) < Date.parse(input.attemptedSleepAt)
  )
    invalid("Final wake must follow attempting sleep.");
  let naps = 0;
  const intervals: [number, number][] = [];
  for (const nap of input.naps ?? []) {
    const start = Date.parse(nap.startAt),
      end = Date.parse(nap.endAt);
    if (
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      end <= start ||
      end - start > 86400000
    )
      invalid(
        "A nap needs valid timestamps and a positive duration within 24 hours.",
      );
    else {
      naps += (end - start) / 60000;
      intervals.push([start, end]);
    }
  }
  intervals.sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < intervals.length; i++) {
    const prior = intervals[i - 1],
      current = intervals[i];
    if (prior && current && current[0] < prior[1])
      invalid("Naps cannot overlap.");
  }
  if (
    input.attemptedSleepAt &&
    input.outOfBedAt &&
    intervals.some(
      ([a, b]) =>
        a < Date.parse(input.outOfBedAt!) &&
        b > Date.parse(input.attemptedSleepAt!),
    )
  )
    invalid("A nap cannot overlap the main sleep opportunity.");
  let total: number | null = null;
  if (input.source === "consumer_device_estimate") {
    total = input.deviceDurationMinutes ?? null;
    warnings.push(
      "Consumer device duration is an estimate; no sleep stages or diagnosis are calculated.",
    );
  } else if (
    opportunity !== null &&
    terminal !== null &&
    input.sleepOnsetLatencyMinutes != null &&
    input.wakeAfterSleepOnsetMinutes != null
  ) {
    total =
      opportunity -
      input.sleepOnsetLatencyMinutes -
      input.wakeAfterSleepOnsetMinutes -
      terminal;
    if (total < 0 || total > opportunity)
      invalid("Entered awake time is incompatible with the sleep opportunity.");
  }
  if (naps > 1440 || (total !== null && total + naps > 1440))
    invalid("Daily sleep duration exceeds 24 hours.");
  if (total === null)
    warnings.push("Duration is incomplete; missing time is not zero.");
  return calculatedSchema.parse({
    sleepOpportunityMinutes: valid ? opportunity : null,
    terminalWakeMinutes: valid ? terminal : null,
    estimatedTotalSleepMinutes: valid ? total : null,
    dailyTotalSleepMinutes: valid && total !== null ? total + naps : null,
    sleepEfficiencyPercent:
      valid &&
      input.source !== "consumer_device_estimate" &&
      total !== null &&
      opportunity !== null &&
      opportunity > 0
        ? (total / opportunity) * 100
        : null,
    napMinutes: valid ? naps : null,
    calculationVersion: "sleep-arithmetic-1",
    validationWarnings: warnings,
    valid,
  });
}
export function localDate(instant: string, timezone: string) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(instant));
  return `${p.find((v) => v.type === "year")?.value}-${p.find((v) => v.type === "month")?.value}-${p.find((v) => v.type === "day")?.value}`;
}
export function validateSleep(value: unknown): SleepLog {
  const parsed = sleepSchema.parse(value);
  const calculated = calculateSleep(parsed);
  if (!calculated.valid) throw Error(calculated.validationWarnings.join(" "));
  if (JSON.stringify(calculated) !== JSON.stringify(parsed.calculated))
    throw Error("Sleep calculation does not match its source fields.");
  const wake = parsed.finalWakeAt ?? parsed.outOfBedAt;
  for (const instant of [
    parsed.gotIntoBedAt,
    parsed.attemptedSleepAt,
    parsed.finalWakeAt,
    parsed.outOfBedAt,
    ...(parsed.naps ?? []).flatMap((n) => [n.startAt, n.endAt]),
  ]) {
    if (instant) validateZonedTimestamp(instant, parsed.timezone);
  }
  for (const nap of parsed.naps ?? [])
    if (localDate(nap.startAt, parsed.timezone) !== parsed.sleepDate)
      throw Error("Naps must start on the selected local wake date.");
  if (wake && localDate(wake, parsed.timezone) !== parsed.sleepDate)
    throw Error(
      "Sleep date must be the local wake date in the selected timezone.",
    );
  if (
    parsed.source !== "consumer_device_estimate" &&
    parsed.deviceDurationMinutes != null
  )
    throw Error(
      "Device estimates cannot be mixed into manual diary calculations.",
    );
  if (
    parsed.status === "complete" &&
    calculated.estimatedTotalSleepMinutes === null
  )
    throw Error("A complete diary entry requires a duration.");
  return parsed;
}
export function validateZonedTimestamp(instant: string, timezone: string) {
  if (instant.endsWith("Z")) return;
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?[+-]\d{2}:\d{2}$/.exec(
      instant,
    );
  if (!match) throw Error("Use an explicit ISO timestamp and UTC offset.");
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(instant));
  const fields = ["year", "month", "day", "hour", "minute", "second"];
  if (
    fields.some(
      (key, i) =>
        parts.find((p) => p.type === key)?.value !== (match[i + 1] ?? "00"),
    )
  )
    throw Error(
      "Timestamp offset does not match this timezone. Check daylight-saving time; nonexistent local times cannot be saved.",
    );
}
export function assertUnique(
  records: readonly { id: string }[],
  label: string,
) {
  if (new Set(records.map((r) => r.id)).size !== records.length)
    throw Error(`Duplicate ${label} IDs.`);
}
export function validateRecoveryBackup(value: unknown): RecoveryBackup {
  const parsed = backupSchema.parse(value);
  for (const [key, rows] of Object.entries(parsed))
    if (Array.isArray(rows)) assertUnique(rows, key);
  for (const sleep of parsed.sleepLogs) validateSleep(sleep);
  const deletedKeys = parsed.deletedRecords.map(
    (t) => `${t.entityType}:${t.entityId}`,
  );
  if (new Set(deletedKeys).size !== deletedKeys.length)
    throw Error("Duplicate deleted entity snapshots.");
  for (const identity of parsed.customRoutineIdentities) {
    const current = parsed.customRoutineVersions.find(
      (r) => r.id === identity.currentVersionId,
    );
    if (!current || current.routineIdentityId !== identity.id)
      throw Error("Routine identity has no matching current version.");
    if (
      current.versionNumber !==
      Math.max(
        ...parsed.customRoutineVersions
          .filter((v) => v.routineIdentityId === identity.id)
          .map((v) => v.versionNumber),
      )
    )
      throw Error(
        "Current routine version must be its latest immutable version.",
      );
  }
  const versionKeys = new Set<string>();
  for (const routine of parsed.customRoutineVersions) {
    const key = `${routine.routineIdentityId}:${routine.versionNumber}`;
    if (versionKeys.has(key)) throw Error("Duplicate routine version number.");
    versionKeys.add(key);
    if (
      !parsed.customRoutineIdentities.some(
        (i) => i.id === routine.routineIdentityId,
      ) &&
      !parsed.deletedRecords.some(
        (t) =>
          t.entityType === "customRoutineIdentities" &&
          t.entityId === routine.routineIdentityId,
      )
    )
      throw Error("Routine version has no identity.");
  }
  for (const check of parsed.recoveryCheckIns)
    if (
      check.linkedSleepLogId &&
      !parsed.sleepLogs.some((s) => s.id === check.linkedSleepLogId) &&
      !parsed.deletedRecords.some(
        (t) =>
          t.entityType === "sleepLogs" && t.entityId === check.linkedSleepLogId,
      )
    )
      throw Error("Check-in sleep link does not exist.");
  for (const session of parsed.mobilitySessions) {
    const version = parsed.customRoutineVersions.find(
      (r) => r.id === session.routineVersionId,
    );
    if (
      !version ||
      JSON.stringify(version) !== JSON.stringify(session.routineSnapshot)
    )
      throw Error("Session does not preserve its exact routine version.");
  }
  for (const tombstone of parsed.deletedRecords) {
    if (tombstone.snapshot.id !== tombstone.entityId)
      throw Error("Deleted snapshot identity mismatch.");
    if (parsed[tombstone.entityType].some((v) => v.id === tombstone.entityId))
      throw Error("Deleted record remains active.");
    if (tombstone.entityType === "sleepLogs") validateSleep(tombstone.snapshot);
    if (tombstone.entityType === "recoveryCheckIns")
      checkInSchema.parse(tombstone.snapshot);
    if (tombstone.entityType === "customRoutineIdentities") {
      const identity = identitySchema.parse(tombstone.snapshot);
      if (
        !parsed.customRoutineVersions.some(
          (v) =>
            v.id === identity.currentVersionId &&
            v.routineIdentityId === identity.id,
        )
      )
        throw Error("Deleted identity has no version lineage.");
    }
    if (tombstone.entityType === "mobilitySessions") {
      const session = sessionSchema.parse(tombstone.snapshot);
      const version = parsed.customRoutineVersions.find(
        (v) => v.id === session.routineVersionId,
      );
      if (
        !version ||
        JSON.stringify(version) !== JSON.stringify(session.routineSnapshot)
      )
        throw Error("Deleted session snapshot differs from its version.");
    }
  }
  return parsed;
}
export function summarize(values: readonly (number | null | undefined)[]) {
  const known = values
    .filter((v): v is number => v != null)
    .sort((a, b) => a - b);
  const middle = Math.floor(known.length / 2);
  return {
    known: known.length,
    missing: values.length - known.length,
    mean: known.length ? known.reduce((a, b) => a + b, 0) / known.length : null,
    median: known.length
      ? known.length % 2
        ? known[middle]!
        : (known[middle - 1]! + known[middle]!) / 2
      : null,
    min: known[0] ?? null,
    max: known.at(-1) ?? null,
  };
}
export function clockRegularity(logs: readonly SleepLog[]) {
  const zones = [...new Set(logs.map((s) => s.timezone))];
  if (zones.length > 1)
    return {
      timezoneChanged: true,
      bedtime: summarize([]),
      wake: summarize([]),
    };
  const clock = (instant: string | undefined | null, zone: string) => {
    if (!instant) return null;
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(instant));
    return (
      Number(parts.find((p) => p.type === "hour")?.value) * 60 +
      Number(parts.find((p) => p.type === "minute")?.value)
    );
  };
  const unwrap = (values: (number | null)[]) => {
    const known = values.filter((v): v is number => v !== null);
    if (!known.length) return summarize(values);
    let best = known[0]!,
      score = Infinity;
    for (const candidate of known) {
      const distance = known.reduce(
        (sum, v) => sum + Math.abs(((v - candidate + 2160) % 1440) - 720),
        0,
      );
      if (distance < score) {
        best = candidate;
        score = distance;
      }
    }
    return summarize(
      values.map((v) =>
        v === null ? null : best + ((v - best + 2160) % 1440) - 720,
      ),
    );
  };
  return {
    timezoneChanged: false,
    bedtime: unwrap(logs.map((l) => clock(l.attemptedSleepAt, l.timezone))),
    wake: unwrap(logs.map((l) => clock(l.finalWakeAt, l.timezone))),
  };
}
export function startSession(
  routine: Routine,
  timezone: string,
  at = new Date().toISOString(),
): Session {
  return sessionSchema.parse({
    id: newRecoveryId(),
    routineId: routine.routineIdentityId,
    routineVersionId: routine.id,
    routineSnapshot: structuredClone(routine),
    startedAt: at,
    timezone,
    completedStepIds: [],
    skippedStepIds: [],
    createdAt: at,
    updatedAt: at,
    state: "paused",
    stepIndex: 0,
    activeSeconds: 0,
    stepSeconds: 0,
    runningSince: null,
    side: routine.steps[0]?.sides === "left_right" ? "left" : "both",
    completedSides: [],
    endedAt: null,
    notes: "",
    discomfortConcern: false,
  });
}
export function playerElapsed(session: Session, at = new Date().toISOString()) {
  const delta = session.runningSince
    ? Math.max(0, (Date.parse(at) - Date.parse(session.runningSince)) / 1000)
    : 0;
  return {
    activeSeconds: session.activeSeconds + delta,
    stepSeconds: session.stepSeconds + delta,
  };
}
export function transitionSession(
  session: Session,
  action:
    | "resume"
    | "pause"
    | "complete_step"
    | "skip_step"
    | "abandon"
    | "left"
    | "right"
    | "both",
  at = new Date().toISOString(),
): Session {
  if (session.state === "completed" || session.state === "abandoned")
    throw Error("This session is finished.");
  const next = structuredClone(session);
  Object.assign(next, playerElapsed(session, at));
  next.runningSince = null;
  next.updatedAt = at;
  if (action === "resume") {
    next.state = "running";
    next.runningSince = at;
  } else if (action === "pause") next.state = "paused";
  else if (action === "abandon") {
    next.state = "abandoned";
    next.endedAt = at;
  } else if (["left", "right", "both"].includes(action)) {
    next.side = action as Session["side"];
    next.state = "paused";
  } else {
    const step = next.routineSnapshot.steps[next.stepIndex];
    if (!step) throw Error("No current step.");
    if (action === "complete_step") {
      if (step.sides === "left_right" && next.side === "both")
        throw Error("Choose a side before completing this step.");
      if (
        next.completedSides.some(
          (s) => s.stepId === step.id && s.side === next.side,
        )
      )
        throw Error("This side is already completed.");
      next.completedSides.push({ stepId: step.id, side: next.side });
      if (
        step.sides === "left_right" &&
        !(["left", "right"] as const).every((side) =>
          next.completedSides.some(
            (s) => s.stepId === step.id && s.side === side,
          ),
        )
      ) {
        next.side = next.side === "left" ? "right" : "left";
        next.stepSeconds = 0;
        next.state = "paused";
        return sessionSchema.parse(next);
      }
    }
    (action === "complete_step"
      ? next.completedStepIds
      : next.skippedStepIds
    ).push(step.id);
    next.stepIndex++;
    next.stepSeconds = 0;
    next.side =
      next.routineSnapshot.steps[next.stepIndex]?.sides === "left_right"
        ? "left"
        : "both";
    next.state =
      next.stepIndex === next.routineSnapshot.steps.length
        ? "completed"
        : "paused";
    if (next.state === "completed") next.endedAt = at;
  }
  return sessionSchema.parse(next);
}
