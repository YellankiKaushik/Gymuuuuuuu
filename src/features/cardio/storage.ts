import {
  identitySchema,
  preferencesSchema,
  type CardioBackup,
  type Session,
  type Identity,
  type Preferences,
  type Plan,
  type Routine,
} from "./schema";
import {
  emptyCardioBackup,
  validateCardioBackup,
  validateSession,
  validatePlan,
  validateRoutine,
  newCardioId,
} from "./domain";
import { recordSchema } from "./schema";
import { getWorkout } from "../workout-tracker/storage";
import { localDate } from "../recovery/domain";
export const cardioCollections = {
  cardioSessions: "cardioSessions",
  customPlanIdentities: "customCardioPlanIdentities",
  customPlanVersions: "customCardioPlanVersions",
  customRoutineIdentities: "customConditioningRoutineIdentities",
  customRoutineVersions: "customConditioningRoutineVersions",
  settings: "cardioSettings",
  auditEvents: "cardioAuditEvents",
  deletedRecords: "cardioDeletedRecords",
} as const;
const allStores = [
  ...Object.values(cardioCollections),
  "cardioImportConflicts",
  "cardioDerivedSummaries",
];
let fallbackOwner: string | null = null;
/** A small tab-control token, not a personal record. Called only by browser actions. */
export function cardioOwnerId() {
  if (typeof window === "undefined")
    throw Error("Session control is browser only.");
  try {
    const existing = window.sessionStorage.getItem("fitness-os-cardio-owner");
    if (existing) return existing;
    const owner = newCardioId();
    window.sessionStorage.setItem("fitness-os-cardio-owner", owner);
    return owner;
  } catch {
    return fallbackOwner ?? (fallbackOwner = newCardioId());
  }
}
export function defaultCardioPreferences(): Preferences {
  return {
    id: "cardio-preferences",
    key: "preferences",
    value: {
      trackingEnabled: true,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      distanceUnit: "km",
      historyDays: 28,
      currentPlanIdentityId: null,
      planStartDate: null,
      hrTargetingDisabled: false,
    },
    updatedAt: new Date().toISOString(),
  };
}
export function openCardioDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB)
    return Promise.reject(Error("Cardio tracking requires browser IndexedDB."));
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open("fitness-os-cardio-conditioning", 1);
    req.onupgradeneeded = () => {
      for (const name of allStores) {
        const store = req.result.objectStoreNames.contains(name)
          ? req.transaction!.objectStore(name)
          : req.result.createObjectStore(name, { keyPath: "id" });
        for (const index of [
          "sessionDate",
          "modalityId",
          "sessionTypeId",
          "status",
          "createdAt",
          "updatedAt",
          "deletedAt",
          "planIdentityId",
          "routineIdentityId",
          "sourcePlanSnapshot.planVersionId",
        ])
          if (!store.indexNames.contains(index))
            store.createIndex(index, index);
      }
    };
    req.onsuccess = () => {
      req.result.onversionchange = () => req.result.close();
      resolve(req.result);
    };
    req.onerror = () =>
      reject(
        Error(
          "Cardio database could not open. Your existing records remain unchanged.",
        ),
      );
    req.onblocked = () =>
      reject(Error("Close other Fitness OS tabs to update cardio storage."));
  });
}
function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(Error("Cardio storage read failed."));
  });
}
function transactionDone(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () =>
      reject(
        Error("Cardio write rolled back; existing records were preserved."),
      );
    tx.onerror = () => {
      /* abort supplies one safe error */
    };
  });
}
async function readRoot(tx: IDBTransaction): Promise<CardioBackup> {
  const root: Record<string, unknown> = { ...emptyCardioBackup() };
  await Promise.all(
    Object.entries(cardioCollections).map(async ([key, name]) => {
      root[key] = await request(tx.objectStore(name).getAll());
    }),
  );
  return validateCardioBackup(root);
}
export async function readCardioBackup() {
  const db = await openCardioDatabase();
  try {
    return await readRoot(
      db.transaction(Object.values(cardioCollections), "readonly"),
    );
  } finally {
    db.close();
  }
}
export async function readRawCardioData() {
  const db = await openCardioDatabase();
  try {
    const tx = db.transaction(allStores, "readonly");
    return Object.fromEntries(
      await Promise.all(
        allStores.map(async (name) => [
          name,
          await request(tx.objectStore(name).getAll()),
        ]),
      ),
    );
  } finally {
    db.close();
  }
}
export type CardioView = {
  sessions: Session[];
  plans: Plan[];
  routines: Routine[];
  planIdentities: Identity[];
  routineIdentities: Identity[];
  preferences: Preferences;
  quarantined: number;
  totalSessions: number;
};
function cursorRows(
  store: IDBObjectStore | IDBIndex,
  range: IDBKeyRange | null,
  limit: number,
): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    const rows: unknown[] = [];
    const req = store.openCursor(range, "prev");
    req.onerror = () => reject(Error("Cardio history could not be read."));
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor || rows.length >= limit) {
        resolve(rows);
        return;
      }
      rows.push(cursor.value as unknown);
      cursor.continue();
    };
  });
}
export async function readCardioView(
  end = localDate(
    new Date().toISOString(),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ),
  days = 90,
  limit = 500,
): Promise<CardioView> {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(end) ||
    !Number.isInteger(days) ||
    days < 1 ||
    days > 3650 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100000
  )
    throw Error("Invalid history window.");
  const start = new Date(`${end}T12:00:00Z`);
  if (!Number.isFinite(start.getTime())) throw Error("Invalid history date.");
  start.setUTCDate(start.getUTCDate() - days + 1);
  const db = await openCardioDatabase();
  try {
    const tx = db.transaction(Object.values(cardioCollections), "readonly");
    const store = tx.objectStore("cardioSessions");
    const [
      recent,
      active,
      paused,
      planIdentities,
      routineIdentities,
      prefs,
      total,
      indexed,
    ] = await Promise.all([
      cursorRows(
        store.index("sessionDate"),
        IDBKeyRange.bound(start.toISOString().slice(0, 10), end),
        limit,
      ),
      request(store.index("status").getAll("active", 2)) as Promise<unknown[]>,
      request(store.index("status").getAll("paused", 2)) as Promise<unknown[]>,
      request(
        tx
          .objectStore(cardioCollections.customPlanIdentities)
          .getAll(undefined, 500),
      ) as Promise<unknown[]>,
      request(
        tx
          .objectStore(cardioCollections.customRoutineIdentities)
          .getAll(undefined, 500),
      ) as Promise<unknown[]>,
      request(
        tx.objectStore(cardioCollections.settings).get("cardio-preferences"),
      ) as Promise<unknown>,
      request(store.count()),
      request(store.index("sessionDate").count()),
    ]);
    let quarantined = total - indexed;
    function parseRows<T>(rows: unknown[], parse: (row: unknown) => T): T[] {
      const result: T[] = [];
      for (const row of rows)
        try {
          result.push(parse(row));
        } catch {
          quarantined++;
        }
      return result;
    }
    const sessions = [
      ...new Map(
        parseRows([...recent, ...active, ...paused], validateSession).map(
          (s) => [s.id, s],
        ),
      ).values(),
    ];
    const pids = parseRows(planIdentities, (row) => identitySchema.parse(row)),
      rids = parseRows(routineIdentities, (row) => identitySchema.parse(row));
    const [planVersions, routineVersions]: [unknown[], unknown[]] =
      await Promise.all([
        Promise.all(
          pids.map((i) =>
            request(
              tx
                .objectStore(cardioCollections.customPlanVersions)
                .get(i.currentVersionId),
            ),
          ),
        ),
        Promise.all(
          rids.map((i) =>
            request(
              tx
                .objectStore(cardioCollections.customRoutineVersions)
                .get(i.currentVersionId),
            ),
          ),
        ),
      ]);
    const plans = parseRows(planVersions, validatePlan),
      routines = parseRows(routineVersions, validateRoutine);
    let preferences = defaultCardioPreferences();
    if (prefs !== undefined)
      try {
        preferences = preferencesSchema.parse(prefs);
      } catch {
        quarantined++;
      }
    return {
      sessions,
      plans,
      routines,
      planIdentities: pids,
      routineIdentities: rids,
      preferences,
      quarantined,
      totalSessions: total,
    };
  } finally {
    db.close();
  }
}
export async function getCardioSession(id: string) {
  const db = await openCardioDatabase();
  try {
    const row: unknown = await request(
      db
        .transaction("cardioSessions", "readonly")
        .objectStore("cardioSessions")
        .get(id),
    );
    return row === undefined ? null : validateSession(row);
  } finally {
    db.close();
  }
}
function announceChange() {
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel("fitness-os-cardio-changes");
    channel.postMessage({ changed: true });
    channel.close();
  }
}
async function mutateCardio(
  action: string,
  entityType: CardioBackup["auditEvents"][number]["entityType"],
  entityId: string,
  change: (root: CardioBackup) => void,
  options: { allowDisabled?: boolean; replaceCorrupt?: CardioBackup } = {},
) {
  const db = await openCardioDatabase();
  const tx = db.transaction(allStores, "readwrite");
  const done = transactionDone(tx);
  void done.catch(() => {});
  try {
    const before = options.replaceCorrupt
      ? emptyCardioBackup()
      : await readRoot(tx);
    if (
      !options.allowDisabled &&
      before.settings[0]?.value.trackingEnabled === false
    )
      throw Error(
        "Cardio tracking is disabled. Enable it before saving new records.",
      );
    const after = structuredClone(options.replaceCorrupt ?? before);
    change(after);
    const now = new Date().toISOString();
    after.auditEvents.push({
      id: newCardioId(),
      entityType,
      entityId,
      action,
      at: now,
      details: {},
    });
    after.exportedAt = now;
    const valid = validateCardioBackup(after);
    if (options.replaceCorrupt) {
      tx.objectStore("cardioImportConflicts").clear();
      tx.objectStore("cardioDerivedSummaries").clear();
    }
    for (const [key, name] of Object.entries(cardioCollections) as [
      keyof typeof cardioCollections,
      string,
    ][]) {
      const store = tx.objectStore(name);
      const previous = new Map(
        before[key].map((row) => [row.id, JSON.stringify(row)]),
      );
      if (options.replaceCorrupt) store.clear();
      else
        for (const old of before[key])
          if (!valid[key].some((row) => row.id === old.id))
            store.delete(old.id);
      for (const row of valid[key])
        if (
          options.replaceCorrupt ||
          previous.get(row.id) !== JSON.stringify(row)
        )
          store.put(row);
    }
    // Rebuildable marker, never exported as personal truth. Readers calculate from actual records.
    tx.objectStore("cardioDerivedSummaries").put({
      id: "weekly-volume",
      dirty: true,
      calculationVersion: "adult-aerobic-equivalent-1",
      updatedAt: now,
    });
    await done;
    announceChange();
    return valid;
  } catch (error) {
    try {
      tx.abort();
    } catch {
      /* already aborted */
    }
    await done.catch(() => {});
    throw error;
  } finally {
    db.close();
  }
}
export async function saveCardioSession(
  value: Session,
  expectedRevision: number | null,
  ownerId: string,
  takeOver = false,
) {
  const session = validateSession(value);
  const previous =
    expectedRevision === null ? null : await getCardioSession(session.id);
  for (const linkedId of session.linkedWorkoutIds.filter(
    (id) => !previous?.linkedWorkoutIds.includes(id),
  )) {
    const workout = await getWorkout(linkedId);
    if (!workout || workout.status !== "completed" || workout.deletedAt)
      throw Error(
        "New workout links must reference completed, available local workouts.",
      );
  }
  const now = new Date().toISOString();
  return mutateCardio(
    expectedRevision === null ? "created" : "updated",
    "session",
    session.id,
    (root) => {
      const index = root.cardioSessions.findIndex((s) => s.id === session.id),
        old = root.cardioSessions[index];
      if (old ? old.revision !== expectedRevision : expectedRevision !== null)
        throw Error(
          "This record changed in another tab. Reload before saving.",
        );
      if (
        old?.lease &&
        old.lease.ownerId !== ownerId &&
        Date.parse(old.lease.expiresAt) > Date.parse(now) &&
        !takeOver
      )
        throw Error(
          "Another tab owns this active session. Confirm taking control before changing it.",
        );
      if (
        old?.originalCompletedRecord &&
        JSON.stringify(old.originalCompletedRecord) !==
          JSON.stringify(session.originalCompletedRecord)
      )
        throw Error("The original completed record is immutable.");
      if (old && session.revision <= old.revision)
        throw Error("Updated records need a new revision.");
      if (
        old &&
        JSON.stringify(old.frozenSource) !==
          JSON.stringify(session.frozenSource)
      )
        throw Error("The session source version is immutable.");
      if (old?.originalCompletedRecord) {
        const last = session.revisions.at(-1);
        const prior = recordSchema.parse(
          Object.fromEntries(
            Object.entries(old).filter(
              ([key]) =>
                ![
                  "originalCompletedRecord",
                  "revisions",
                  "revision",
                  "lease",
                ].includes(key),
            ),
          ),
        );
        if (
          session.revisions.length !== old.revisions.length + 1 ||
          old.revisions.some(
            (r, i) =>
              JSON.stringify(r) !== JSON.stringify(session.revisions[i]),
          ) ||
          !last ||
          JSON.stringify(last.record) !== JSON.stringify(prior)
        )
          throw Error(
            "Completed corrections must append the prior record and preserve edit history.",
          );
      }
      if (["active", "paused"].includes(session.status))
        session.lease = {
          ownerId,
          expiresAt: new Date(Date.parse(now) + 30000).toISOString(),
        };
      else session.lease = null;
      if (old) root.cardioSessions[index] = session;
      else root.cardioSessions.push(session);
    },
  );
}
export async function saveCardioVersion(
  value: Plan | Routine,
  expectedCurrentVersion: string | null,
) {
  const isPlan = "planIdentityId" in value;
  const version = isPlan ? validatePlan(value) : validateRoutine(value);
  const identityId =
    "planIdentityId" in version
      ? version.planIdentityId
      : version.routineIdentityId;
  return mutateCardio(
    "version_saved",
    isPlan ? "plan" : "routine",
    identityId,
    (root) => {
      const identities = isPlan
        ? root.customPlanIdentities
        : root.customRoutineIdentities;
      const identity = identities.find((i) => i.id === identityId);
      if ((identity?.currentVersionId ?? null) !== expectedCurrentVersion)
        throw Error(
          "This plan or routine changed in another tab. Reload before saving.",
        );
      if (identity) {
        identity.currentVersionId = version.id;
        identity.title = version.title;
        identity.updatedAt = version.createdAt;
      } else
        identities.push({
          id: identityId,
          title: version.title,
          currentVersionId: version.id,
          archived: false,
          createdAt: version.createdAt,
          updatedAt: version.createdAt,
        });
      if (isPlan) root.customPlanVersions.push(validatePlan(version));
      else root.customRoutineVersions.push(validateRoutine(version));
    },
  );
}
export async function saveCardioPreferences(value: Preferences) {
  const setting = preferencesSchema.parse(value);
  return mutateCardio(
    "preferences_saved",
    "settings",
    setting.id,
    (root) => {
      root.settings = [setting];
    },
    { allowDisabled: true },
  );
}
export async function deleteCardioEntity(
  type: "session" | "plan" | "routine",
  id: string,
  confirmed: boolean,
) {
  if (!confirmed) throw Error("Confirm deletion before proceeding.");
  return mutateCardio(
    "soft_deleted",
    type,
    id,
    (root) => {
      let snapshot: CardioBackup["deletedRecords"][number]["snapshot"];
      if (type === "session") {
        const session = root.cardioSessions.find((s) => s.id === id);
        if (!session) throw Error("Session is unavailable.");
        if (["active", "paused"].includes(session.status))
          throw Error("End the session before deleting it.");
        snapshot = { kind: "session", session };
        root.cardioSessions = root.cardioSessions.filter((s) => s.id !== id);
      } else if (type === "plan") {
        const identity = root.customPlanIdentities.find((i) => i.id === id);
        if (!identity) throw Error("Plan is unavailable.");
        snapshot = {
          kind: "plan",
          identity,
          versions: root.customPlanVersions.filter(
            (v) => v.planIdentityId === id,
          ),
        };
        root.customPlanIdentities = root.customPlanIdentities.filter(
          (i) => i.id !== id,
        );
        root.customPlanVersions = root.customPlanVersions.filter(
          (v) => v.planIdentityId !== id,
        );
        if (root.settings[0]?.value.currentPlanIdentityId === id) {
          root.settings[0].value.currentPlanIdentityId = null;
          root.settings[0].value.planStartDate = null;
          root.settings[0].updatedAt = new Date().toISOString();
        }
      } else {
        const identity = root.customRoutineIdentities.find((i) => i.id === id);
        if (!identity) throw Error("Routine is unavailable.");
        snapshot = {
          kind: "routine",
          identity,
          versions: root.customRoutineVersions.filter(
            (v) => v.routineIdentityId === id,
          ),
        };
        root.customRoutineIdentities = root.customRoutineIdentities.filter(
          (i) => i.id !== id,
        );
        root.customRoutineVersions = root.customRoutineVersions.filter(
          (v) => v.routineIdentityId !== id,
        );
      }
      root.deletedRecords.push({
        id: newCardioId(),
        entityType: type,
        entityId: id,
        deletedAt: new Date().toISOString(),
        snapshot,
      });
    },
    { allowDisabled: true },
  );
}
export async function undoCardioDelete(tombId: string) {
  return mutateCardio(
    "delete_undone",
    "backup",
    tombId,
    (root) => {
      const tomb = root.deletedRecords.find((t) => t.id === tombId);
      if (!tomb) throw Error("Deleted record is unavailable.");
      const s = tomb.snapshot;
      if (s.kind === "session") root.cardioSessions.push(s.session);
      else if (s.kind === "plan") {
        root.customPlanIdentities.push(s.identity);
        root.customPlanVersions.push(...s.versions);
      } else {
        root.customRoutineIdentities.push(s.identity);
        root.customRoutineVersions.push(...s.versions);
      }
      root.deletedRecords = root.deletedRecords.filter((t) => t.id !== tombId);
    },
    { allowDisabled: true },
  );
}
export type RestoreMode = "keep" | "copy" | "replace";
export function mergeCardio(
  existing: CardioBackup,
  imported: CardioBackup,
  mode: RestoreMode,
) {
  const incoming = structuredClone(validateCardioBackup(imported));
  if (mode === "replace") return incoming;
  const target = structuredClone(validateCardioBackup(existing));
  if (mode === "copy") {
    const map = new Map<string, string>();
    function collect(value: unknown) {
      if (Array.isArray(value)) value.forEach(collect);
      else if (value && typeof value === "object") {
        const obj = value as Record<string, unknown>;
        if (typeof obj.id === "string" && obj.id !== "cardio-preferences")
          map.set(obj.id, map.get(obj.id) ?? newCardioId());
        Object.values(obj).forEach(collect);
      }
    }
    collect(incoming);
    const references = new Set([
      "id",
      "entityId",
      "currentVersionId",
      "planIdentityId",
      "routineIdentityId",
      "planId",
      "planVersionId",
      "sessionId",
      "currentPlanIdentityId",
    ]);
    function remap(value: unknown): unknown {
      if (Array.isArray(value)) return value.map(remap);
      if (value && typeof value === "object")
        return Object.fromEntries(
          Object.entries(value).map(([k, v]) => [
            k,
            references.has(k) && typeof v === "string"
              ? (map.get(v) ?? v)
              : remap(v),
          ]),
        );
      return value;
    }
    Object.assign(incoming, remap(incoming));
  }
  for (const key of Object.keys(
    cardioCollections,
  ) as (keyof typeof cardioCollections)[]) {
    if (key === "settings") {
      if (!target.settings.length) target.settings = incoming.settings;
      continue;
    }
    const ids = new Set(target[key].map((r) => r.id));
    // Every collection retains its own strict row schema when the final graph is parsed.
    const merged: unknown[] = [
      ...target[key],
      ...incoming[key].filter((r) => !ids.has(r.id)),
    ];
    Object.assign(target, { [key]: merged });
  }
  return validateCardioBackup(target);
}
export function parseCardioImport(text: string) {
  if (new TextEncoder().encode(text).length > 20 * 1024 * 1024)
    throw Error("Cardio backups are limited to 20 MB.");
  return validateCardioBackup(JSON.parse(text) as unknown);
}
export async function restoreCardio(
  backup: CardioBackup,
  mode: RestoreMode,
  confirmed: boolean,
) {
  const valid = validateCardioBackup(backup);
  if (!confirmed)
    throw Error("Review the import preview and confirm before writing.");
  if (mode === "replace")
    return mutateCardio("backup_replaced", "backup", "cardio", () => {}, {
      allowDisabled: true,
      replaceCorrupt: valid,
    });
  return mutateCardio(
    `backup_${mode}`,
    "backup",
    "cardio",
    (root) => {
      Object.assign(root, mergeCardio(root, valid, mode));
    },
    { allowDisabled: true },
  );
}
export async function clearCardioData(phrase: string) {
  if (phrase !== "DELETE CARDIO DATA")
    throw Error("Enter DELETE CARDIO DATA to clear this module.");
  const db = await openCardioDatabase();
  const tx = db.transaction(allStores, "readwrite");
  const done = transactionDone(tx);
  void done.catch(() => {});
  try {
    allStores.forEach((name) => tx.objectStore(name).clear());
    await done;
    announceChange();
  } catch (error) {
    try {
      tx.abort();
    } catch {
      /* already aborted */
    }
    await done.catch(() => {});
    throw error;
  } finally {
    db.close();
  }
}
export const cardioBackupAdapter = {
  moduleId: "phase_13_cardio_conditioning",
  read: readCardioBackup,
  validate: validateCardioBackup,
  restore: restoreCardio,
};
