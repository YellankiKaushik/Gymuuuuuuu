import {
  sleepSchema,
  checkInSchema,
  sessionSchema,
  routineSchema,
  identitySchema,
  settingSchema,
  auditSchema,
  tombstoneSchema,
  type RecoveryBackup,
  type RecoverySettings,
  type entityTypes,
} from "./schema";
import { newRecoveryId, validateRecoveryBackup, validateSleep } from "./domain";
import { getWorkout } from "../workout-tracker/storage";
import { recoveryReadModels } from "./read-models";
const collections = {
  sleepLogs: "phase12_sleep_logs",
  recoveryCheckIns: "phase12_recovery_checkins",
  mobilitySessions: "phase12_mobility_sessions",
  customRoutineIdentities: "phase12_custom_routine_identities",
  customRoutineVersions: "phase12_custom_routine_versions",
  settings: "phase12_settings",
  auditEvents: "phase12_audit_events",
  deletedRecords: "phase12_deleted_records",
} as const;
const stores = [
  ...Object.values(collections),
  "phase12_import_conflicts",
  "phase12_derived_summaries",
];
const parsers = {
  sleepLogs: sleepSchema,
  recoveryCheckIns: checkInSchema,
  mobilitySessions: sessionSchema,
  customRoutineIdentities: identitySchema,
  customRoutineVersions: routineSchema,
  settings: settingSchema,
  auditEvents: auditSchema,
  deletedRecords: tombstoneSchema,
};
export function emptyRecoveryBackup(): RecoveryBackup {
  return {
    schemaVersion: "1.0.0",
    exportedAt: new Date().toISOString(),
    moduleId: "phase_12_recovery_sleep_mobility",
    sleepLogs: [],
    recoveryCheckIns: [],
    mobilitySessions: [],
    customRoutineIdentities: [],
    customRoutineVersions: [],
    settings: [],
    auditEvents: [],
    deletedRecords: [],
  };
}
export function defaultRecoverySettings(): RecoverySettings {
  return {
    id: "recovery-preferences",
    key: "preferences",
    value: {
      sleepGoalMinutes: null,
      historyDays: 28,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      trackingEnabled: true,
    },
    updatedAt: new Date().toISOString(),
  };
}
export function openRecoveryDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB)
    return Promise.reject(Error("Recovery tracking needs browser IndexedDB."));
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(
      "fitness-os-recovery-sleep-mobility",
      2,
    );
    request.onupgradeneeded = () => {
      for (const name of stores) {
        const store = request.result.objectStoreNames.contains(name)
          ? request.transaction!.objectStore(name)
          : request.result.createObjectStore(name, { keyPath: "id" });
        for (const key of [
          "date",
          "sleepDate",
          "updatedAt",
          "routineId",
          "routineVersionId",
          "publicationStatus",
          "startedAt",
          "deletedAt",
        ])
          if (!store.indexNames.contains(key)) store.createIndex(key, key);
        if (!store.indexNames.contains("linkedWorkoutSessionIds"))
          store.createIndex(
            "linkedWorkoutSessionIds",
            "linkedWorkoutSessionIds",
            { multiEntry: true },
          );
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(Error("Recovery database could not open."));
    request.onblocked = () =>
      reject(Error("Close other Fitness OS tabs to update recovery storage."));
  });
}
function requestValue<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(Error("Recovery storage read failed."));
  });
}
function completed(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () =>
      reject(
        Error("Recovery write rolled back; existing records were preserved."),
      );
    tx.onerror = () => {
      /* onabort reports one safe error */
    };
  });
}
async function readRoot(tx: IDBTransaction): Promise<RecoveryBackup> {
  const root: Record<string, unknown> = { ...emptyRecoveryBackup() };
  await Promise.all(
    Object.entries(collections).map(async ([key, name]) => {
      root[key] = await requestValue(tx.objectStore(name).getAll());
    }),
  );
  return validateRecoveryBackup(root);
}
export async function readRecoveryBackup() {
  const db = await openRecoveryDatabase();
  try {
    return await readRoot(
      db.transaction(Object.values(collections), "readonly"),
    );
  } finally {
    db.close();
  }
}
export async function readRawRecoveryData() {
  const db = await openRecoveryDatabase();
  try {
    const tx = db.transaction(stores, "readonly");
    return Object.fromEntries(
      await Promise.all(
        stores.map(async (name) => [
          name,
          await requestValue(tx.objectStore(name).getAll()),
        ]),
      ),
    );
  } finally {
    db.close();
  }
}
export type RecoveryView = { data: RecoveryBackup; quarantined: number };
export async function readRecoveryView(
  days = 28,
  end = new Date().toISOString().slice(0, 10),
  maxRecords = 500,
): Promise<RecoveryView> {
  if (!Number.isInteger(maxRecords) || maxRecords < 1 || maxRecords > 100000)
    throw Error("Invalid history limit.");
  const db = await openRecoveryDatabase();
  try {
    const tx = db.transaction(Object.values(collections), "readonly");
    const start = new Date(`${end}T12:00:00Z`);
    start.setUTCDate(start.getUTCDate() - days + 1);
    const range = IDBKeyRange.bound(start.toISOString().slice(0, 10), end);
    const root = emptyRecoveryBackup();
    let quarantined = 0;
    const rows = await Promise.all(
      Object.entries(collections).map(async ([key, name]) => {
        const store = tx.objectStore(name);
        const indexed =
          key === "sleepLogs"
            ? "sleepDate"
            : key === "recoveryCheckIns"
              ? "date"
              : key === "mobilitySessions"
                ? "startedAt"
                : null;
        const activeRange =
          key === "mobilitySessions"
            ? IDBKeyRange.bound(
                `${start.toISOString().slice(0, 10)}T00:00:00Z`,
                `${end}T23:59:59.999Z`,
              )
            : range;
        const valuesPromise = indexed
          ? recentRows(store.index(indexed), activeRange, maxRecords)
          : key === "auditEvents"
            ? Promise.resolve([])
            : requestValue<unknown[]>(store.getAll());
        const counts = indexed
          ? Promise.all([
              requestValue(store.count()),
              requestValue(store.index(indexed).count()),
            ])
          : Promise.resolve([0, 0]);
        const [values, countPair] = await Promise.all([valuesPromise, counts]);
        quarantined += Math.max(0, (countPair[0] ?? 0) - (countPair[1] ?? 0));
        const healthy = values.flatMap((value) => {
          const parsed = parsers[key as keyof typeof parsers].safeParse(value);
          if (!parsed.success) {
            quarantined++;
            return [];
          }
          if (key === "sleepLogs") {
            try {
              validateSleep(parsed.data);
            } catch {
              quarantined++;
              return [];
            }
          }
          return [parsed.data];
        });
        return [key, healthy] as const;
      }),
    );
    return {
      data: { ...root, ...Object.fromEntries(rows) } as RecoveryBackup,
      quarantined,
    };
  } finally {
    db.close();
  }
}
function signal() {
  window.dispatchEvent(new Event("fitness-os:recovery-changed"));
  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel("fitness-os-recovery");
    channel.postMessage("changed");
    channel.close();
  }
}
async function mutate(work: (root: RecoveryBackup) => void) {
  const db = await openRecoveryDatabase();
  try {
    const tx = db.transaction(stores, "readwrite");
    const done = completed(tx);
    try {
      const before = await readRoot(tx),
        after = structuredClone(before);
      work(after);
      validateRecoveryBackup(after);
      for (const [key, name] of Object.entries(collections)) {
        const previous = before[key as keyof typeof collections];
        const next = after[key as keyof typeof collections];
        const store = tx.objectStore(name);
        for (const row of previous)
          if (!next.some((r) => r.id === row.id)) store.delete(row.id);
        for (const row of next)
          if (
            JSON.stringify(previous.find((r) => r.id === row.id)) !==
            JSON.stringify(row)
          )
            store.put(row);
      }
      rebuildSummaries(tx, after);
    } catch (error) {
      tx.abort();
      await done.catch(() => undefined);
      throw error;
    }
    await done;
    signal();
  } finally {
    db.close();
  }
}
function audit(
  root: RecoveryBackup,
  entityType: RecoveryBackup["auditEvents"][number]["entityType"],
  entityId: string,
  action: RecoveryBackup["auditEvents"][number]["action"],
) {
  root.auditEvents.push({
    id: newRecoveryId(),
    entityType,
    entityId,
    action,
    at: new Date().toISOString(),
  });
}
function requireTracking(root: RecoveryBackup) {
  if (root.settings[0]?.value.trackingEnabled === false)
    throw Error(
      "Tracking is disabled. Enable it in recovery settings before saving personal records.",
    );
}
export async function saveSleep(value: unknown, expectedUpdatedAt?: string) {
  const parsed = validateSleep(value);
  return mutate((root) => {
    requireTracking(root);
    const old = root.sleepLogs.find((s) => s.id === parsed.id);
    if (old && old.updatedAt !== expectedUpdatedAt)
      throw Error(
        "This diary entry changed in another tab. Reload before editing.",
      );
    if (!old && expectedUpdatedAt) throw Error("This diary entry was deleted.");
    root.sleepLogs = root.sleepLogs.filter((s) => s.id !== parsed.id);
    root.sleepLogs.push(parsed);
    audit(root, "sleepLogs", parsed.id, old ? "edit" : "create");
  });
}
export async function saveCheckIn(value: unknown, expectedUpdatedAt?: string) {
  const parsed = checkInSchema.parse(value);
  for (const workoutId of parsed.linkedWorkoutSessionIds ?? []) {
    const workout = await getWorkout(workoutId);
    if (!workout || workout.status !== "completed")
      throw Error("Only existing completed workout sessions may be linked.");
  }
  return mutate((root) => {
    requireTracking(root);
    const old = root.recoveryCheckIns.find((s) => s.id === parsed.id);
    if (old && old.updatedAt !== expectedUpdatedAt)
      throw Error(
        "This check-in changed in another tab. Reload before editing.",
      );
    if (!old && expectedUpdatedAt) throw Error("This check-in was deleted.");
    root.recoveryCheckIns = root.recoveryCheckIns.filter(
      (s) => s.id !== parsed.id,
    );
    root.recoveryCheckIns.push(parsed);
    audit(root, "recoveryCheckIns", parsed.id, old ? "edit" : "create");
  });
}
export async function saveRoutine(value: unknown, expectedVersionId?: string) {
  const parsed = routineSchema.parse(value);
  return mutate((root) => {
    requireTracking(root);
    const old = root.customRoutineIdentities.find(
      (i) => i.id === parsed.routineIdentityId,
    );
    if (old && old.currentVersionId !== expectedVersionId)
      throw Error("Routine version changed. Reload before editing.");
    if (root.customRoutineVersions.some((v) => v.id === parsed.id))
      throw Error("Routine versions are immutable. Create a new version.");
    const prior = root.customRoutineVersions.filter(
      (v) => v.routineIdentityId === parsed.routineIdentityId,
    );
    if (
      parsed.versionNumber !==
      Math.max(0, ...prior.map((v) => v.versionNumber)) + 1
    )
      throw Error("Routine version must be consecutive.");
    root.customRoutineVersions.push(parsed);
    root.customRoutineIdentities = root.customRoutineIdentities.filter(
      (i) => i.id !== parsed.routineIdentityId,
    );
    root.customRoutineIdentities.push({
      id: parsed.routineIdentityId,
      currentVersionId: parsed.id,
      title: parsed.title,
      status: "active",
      createdAt: old?.createdAt ?? parsed.createdAt,
      updatedAt: parsed.createdAt,
    });
    audit(root, "customRoutineVersions", parsed.id, "version");
  });
}
export async function saveSession(value: unknown, expectedUpdatedAt?: string) {
  const parsed = sessionSchema.parse(value);
  return mutate((root) => {
    requireTracking(root);
    const old = root.mobilitySessions.find((s) => s.id === parsed.id);
    if (old && old.updatedAt !== expectedUpdatedAt)
      throw Error("Session changed in another tab. Reload before continuing.");
    if (
      old &&
      JSON.stringify(old.routineSnapshot) !==
        JSON.stringify(parsed.routineSnapshot)
    )
      throw Error("Session snapshot cannot change.");
    if (
      old &&
      (old.state === "completed" || old.state === "abandoned") &&
      sessionPerformance(old) !== sessionPerformance(parsed)
    )
      throw Error(
        "Finished session performance is immutable; only feedback may be edited.",
      );
    root.mobilitySessions = root.mobilitySessions.filter(
      (s) => s.id !== parsed.id,
    );
    root.mobilitySessions.push(parsed);
    audit(root, "mobilitySessions", parsed.id, old ? "edit" : "create");
  });
}
export async function saveRecoverySettings(value: unknown) {
  const parsed = settingSchema.parse(value);
  return mutate((root) => {
    root.settings = [parsed];
    audit(root, "settings", parsed.id, "edit");
  });
}
export async function archiveRoutine(identityId: string) {
  return mutate((root) => {
    const identity = root.customRoutineIdentities.find(
      (i) => i.id === identityId,
    );
    if (!identity) throw Error("Routine not found.");
    identity.status = identity.status === "active" ? "archived" : "active";
    identity.updatedAt = new Date().toISOString();
    audit(root, "customRoutineIdentities", identity.id, "archive");
  });
}
export async function deleteRecoveryRecord(
  entityType: (typeof entityTypes)[number],
  entityId: string,
) {
  return mutate((root) => {
    const rows = root[entityType],
      record = rows.find((r) => r.id === entityId);
    if (!record) throw Error("Record not found.");
    root.deletedRecords.push({
      id: newRecoveryId(),
      entityType,
      entityId,
      deletedAt: new Date().toISOString(),
      snapshot: record,
    });
    for (let i = rows.length - 1; i >= 0; i--)
      if (rows[i]?.id === entityId) rows.splice(i, 1);
    audit(root, entityType, entityId, "delete");
  });
}
export async function undoRecoveryDelete(tombstoneId: string) {
  return mutate((root) => {
    const tomb = root.deletedRecords.find((t) => t.id === tombstoneId);
    if (!tomb) throw Error("Deleted record not found.");
    if (root[tomb.entityType].some((r) => r.id === tomb.entityId))
      throw Error("An active record already uses this ID.");
    switch (tomb.entityType) {
      case "sleepLogs":
        root.sleepLogs.push(validateSleep(tomb.snapshot));
        break;
      case "recoveryCheckIns":
        root.recoveryCheckIns.push(checkInSchema.parse(tomb.snapshot));
        break;
      case "mobilitySessions":
        root.mobilitySessions.push(sessionSchema.parse(tomb.snapshot));
        break;
      case "customRoutineIdentities":
        root.customRoutineIdentities.push(identitySchema.parse(tomb.snapshot));
        break;
    }
    root.deletedRecords = root.deletedRecords.filter(
      (t) => t.id !== tombstoneId,
    );
    audit(root, tomb.entityType, tomb.entityId, "undo");
  });
}
export function validateRecoveryImport(text: string) {
  if (text.length > 20 * 1024 * 1024)
    throw Error("Recovery backup exceeds 20 MB.");
  return validateRecoveryBackup(JSON.parse(text) as unknown);
}
export function recoveryConflicts(
  existing: RecoveryBackup,
  incoming: RecoveryBackup,
) {
  return Object.keys(collections).flatMap((key) => {
    const name = key as keyof typeof collections;
    return incoming[name]
      .filter((row) => existing[name].some((v) => v.id === row.id))
      .map((row) => `${key}: ${row.id}`);
  });
}
export type RestoreMode = "keep_existing" | "import_copy" | "replace_local";
export function mergeRecovery(
  existing: RecoveryBackup,
  incoming: RecoveryBackup,
  mode: RestoreMode,
): RecoveryBackup {
  validateRecoveryBackup(incoming);
  if (mode === "replace_local") return structuredClone(incoming);
  const next = structuredClone(existing),
    copy = structuredClone(incoming);
  if (mode === "import_copy") {
    const mapping = new Map<string, string>();
    for (const key of Object.keys(collections)) {
      if (key === "settings") continue;
      for (const row of copy[key as keyof typeof collections])
        mapping.set(row.id, newRecoveryId());
    }
    for (const tomb of copy.deletedRecords)
      if (!mapping.has(tomb.entityId))
        mapping.set(tomb.entityId, newRecoveryId());
    const remap = (v: string) => mapping.get(v) ?? v;
    for (const routine of copy.customRoutineVersions) {
      routine.id = remap(routine.id);
      routine.routineIdentityId = remap(routine.routineIdentityId);
      for (const step of routine.steps) {
        if (!mapping.has(step.id)) mapping.set(step.id, newRecoveryId());
        step.id = remap(step.id);
      }
    }
    for (const identity of copy.customRoutineIdentities) {
      identity.id = remap(identity.id);
      identity.currentVersionId = remap(identity.currentVersionId);
    }
    for (const sleep of copy.sleepLogs) sleep.id = remap(sleep.id);
    for (const check of copy.recoveryCheckIns) {
      check.id = remap(check.id);
      if (check.linkedSleepLogId)
        check.linkedSleepLogId = remap(check.linkedSleepLogId);
    }
    for (const session of copy.mobilitySessions) {
      session.id = remap(session.id);
      session.routineId = remap(session.routineId);
      session.routineVersionId = remap(session.routineVersionId);
      session.routineSnapshot = structuredClone(
        copy.customRoutineVersions.find(
          (v) => v.id === session.routineVersionId,
        )!,
      );
      session.completedStepIds = session.completedStepIds.map(remap);
      session.skippedStepIds = session.skippedStepIds.map(remap);
      session.completedSides = session.completedSides.map((s) => ({
        ...s,
        stepId: remap(s.stepId),
      }));
    }
    for (const tomb of copy.deletedRecords) {
      tomb.id = remap(tomb.id);
      tomb.entityId = remap(tomb.entityId);
      tomb.snapshot.id = tomb.entityId;
      if (tomb.entityType === "customRoutineIdentities") {
        const identity = identitySchema.parse(tomb.snapshot);
        identity.currentVersionId = remap(identity.currentVersionId);
        tomb.snapshot = identity;
      } else if (tomb.entityType === "recoveryCheckIns") {
        const check = checkInSchema.parse(tomb.snapshot);
        if (check.linkedSleepLogId)
          check.linkedSleepLogId = remap(check.linkedSleepLogId);
        tomb.snapshot = check;
      } else if (tomb.entityType === "mobilitySessions") {
        const session = sessionSchema.parse(tomb.snapshot);
        session.routineId = remap(session.routineId);
        session.routineVersionId = remap(session.routineVersionId);
        session.routineSnapshot = structuredClone(
          copy.customRoutineVersions.find(
            (v) => v.id === session.routineVersionId,
          )!,
        );
        session.completedStepIds = session.completedStepIds.map(remap);
        session.skippedStepIds = session.skippedStepIds.map(remap);
        session.completedSides = session.completedSides.map((s) => ({
          ...s,
          stepId: remap(s.stepId),
        }));
        tomb.snapshot = session;
      }
    }
    for (const event of copy.auditEvents) {
      event.id = remap(event.id);
      event.entityId = remap(event.entityId);
    }
  }
  for (const key of Object.keys(collections)) {
    const name = key as keyof typeof collections;
    const combined = [
      ...next[name],
      ...copy[name].filter((r) => !next[name].some((v) => v.id === r.id)),
    ];
    Object.assign(next, { [name]: combined });
  }
  return validateRecoveryBackup(next);
}
export async function restoreRecoveryBackup(
  incoming: RecoveryBackup,
  mode: RestoreMode,
  confirmed: boolean,
) {
  if (!confirmed) throw Error("Confirm the preview before restoring.");
  const valid = validateRecoveryBackup(incoming);
  if (mode !== "replace_local")
    return mutate((root) =>
      Object.assign(root, mergeRecovery(root, valid, mode)),
    );
  const db = await openRecoveryDatabase();
  try {
    const tx = db.transaction(stores, "readwrite"),
      done = completed(tx);
    try {
      for (const name of stores) tx.objectStore(name).clear();
      for (const [key, name] of Object.entries(collections))
        for (const row of valid[key as keyof typeof collections])
          tx.objectStore(name).put(row);
      rebuildSummaries(tx, valid);
    } catch (error) {
      tx.abort();
      await done.catch(() => undefined);
      throw error;
    }
    await done;
    signal();
  } finally {
    db.close();
  }
}
export async function purgeRecovery(phrase: string) {
  if (phrase !== "DELETE RECOVERY DATA")
    throw Error("Enter DELETE RECOVERY DATA to confirm.");
  return restoreRecoveryBackup(emptyRecoveryBackup(), "replace_local", true);
}
export const recoveryBackupAdapter = {
  moduleId: "phase_12_recovery_sleep_mobility",
  read: readRecoveryBackup,
  validate: validateRecoveryBackup,
  restore: restoreRecoveryBackup,
};
function rebuildSummaries(tx: IDBTransaction, data: RecoveryBackup) {
  const store = tx.objectStore("phase12_derived_summaries");
  store.clear();
  const models = recoveryReadModels(data);
  for (const row of [...models.sleep, ...models.checkins, ...models.routines])
    store.put(row);
}
function recentRows(
  index: IDBIndex,
  range: IDBKeyRange,
  limit = 500,
): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const rows: unknown[] = [];
    const request = index.openCursor(range, "prev");
    request.onerror = () => reject(Error("Recovery history read failed."));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor || rows.length === limit) {
        resolve(rows);
        return;
      }
      rows.push(cursor.value as unknown);
      cursor.continue();
    };
  });
}

function sessionPerformance(value: unknown) {
  if (typeof value !== "object" || value === null) return "";
  return JSON.stringify(
    Object.fromEntries(
      Object.entries(value).filter(
        ([key]) =>
          ![
            "notes",
            "perceivedDifficulty",
            "discomfortConcern",
            "updatedAt",
          ].includes(key),
      ),
    ),
  );
}
