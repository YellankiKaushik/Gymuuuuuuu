import { openFitnessDatabase } from "../../storage/indexed-db/fitness-database";
import {
  nutritionBackupSchema,
  foodEntrySchema,
  hydrationSchema,
  preferencesSchema,
  customFoodSchema,
  customRevisionSchema,
  favouriteSchema,
  type NutritionBackup,
  type NutritionDay,
  type FoodEntry,
  type HydrationEntry,
  type NutritionPreferences,
  type CustomFood,
  type CustomFoodRevision,
  type NutritionFavourite,
  type TargetSnapshot,
} from "./schema";
import {
  defaultNutritionPreferences,
  aggregateNutritionDay,
  validateNutritionBackupImport,
  createNutritionRestorePlan,
  newNutritionId,
} from "./domain";
import { auditRecordNormativeSchema } from "./schema.generated";

const collections = {
  days: "nutritionDays",
  foodEntries: "foodLogEntries",
  hydrationEntries: "hydrationEntries",
  customFoods: "customFoods",
  customFoodRevisions: "customFoodRevisions",
  favourites: "nutritionFavourites",
  auditLog: "nutritionAuditLog",
} as const;
const canonicalStores = ["nutritionPreferences", ...Object.values(collections)];
const allStores = [...canonicalStores, "derivedNutritionDayTotals"];
export function emptyNutritionBackup(
  now = new Date().toISOString(),
): NutritionBackup {
  return {
    format: "fitness-os-nutrition-backup",
    schemaVersion: 1,
    module: "nutrition-tracker",
    exportedAt: now,
    preferences: defaultNutritionPreferences(now),
    days: [],
    foodEntries: [],
    hydrationEntries: [],
    customFoods: [],
    customFoodRevisions: [],
    favourites: [],
    auditLog: [],
  };
}
function getRequests(tx: IDBTransaction) {
  return {
    preferences: tx
      .objectStore("nutritionPreferences")
      .get("nutrition-preferences"),
    ...Object.fromEntries(
      Object.entries(collections).map(([key, store]) => [
        key,
        tx.objectStore(store).getAll(),
      ]),
    ),
  } as { preferences: IDBRequest<unknown> } & Record<
    keyof typeof collections,
    IDBRequest<unknown[]>
  >;
}
function readRequests(requests: ReturnType<typeof getRequests>) {
  const record: Record<string, unknown> = {
    ...emptyNutritionBackup(),
    preferences: requests.preferences.result ?? defaultNutritionPreferences(),
  };
  for (const key of Object.keys(collections) as (keyof typeof collections)[])
    record[key] = requests[key].result;
  return nutritionBackupSchema.parse(record);
}
export async function readNutritionBackup(): Promise<NutritionBackup> {
  const db = await openFitnessDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(canonicalStores, "readonly"),
      requests = getRequests(tx);
    tx.onabort = () =>
      reject(
        tx.error ?? Error("Nutrition read failed. Records are preserved."),
      );
    tx.onerror = () => reject(tx.error ?? Error("Nutrition read failed."));
    tx.oncomplete = () => {
      try {
        resolve(readRequests(requests));
      } catch (error) {
        reject(error);
      }
    };
  });
}
export async function exportRawNutritionRecovery() {
  const db = await openFitnessDatabase();
  return new Promise<string>((resolve, reject) => {
    const tx = db.transaction(canonicalStores, "readonly"),
      requests = getRequests(tx);
    tx.oncomplete = () => {
      const raw: Record<string, unknown> = {
        format: "fitness-os-nutrition-raw-recovery",
        notice:
          "Unvalidated recovery data. Repair and validate before importing. Never publish personal records.",
        exportedAt: new Date().toISOString(),
      };
      for (const [key, request] of Object.entries(requests))
        raw[key] = request.result;
      resolve(JSON.stringify(raw, null, 2));
    };
    tx.onabort = () =>
      reject(
        tx.error ??
          Error("Recovery export failed. Existing records are preserved."),
      );
  });
}
function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("fitness-os:nutrition-changed"));
  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel("fitness-os:nutrition-changes");
    channel.postMessage({ kind: "changed" });
    channel.close();
  }
}
function identity(value: object) {
  return "id" in value
    ? String(value.id)
    : "localDate" in value
      ? String(value.localDate)
      : "";
}
async function mutate(transform: (backup: NutritionBackup) => NutritionBackup) {
  const db = await openFitnessDatabase();
  return new Promise<NutritionBackup>((resolve, reject) => {
    const tx = db.transaction(allStores, "readwrite"),
      requests = getRequests(tx);
    let outstanding = Object.keys(requests).length,
      result: NutritionBackup | undefined,
      cause: unknown;
    Object.values(requests).forEach(
      (request) =>
        (request.onsuccess = () => {
          if (--outstanding !== 0) return;
          try {
            const before = readRequests(requests);
            result = nutritionBackupSchema.parse(
              transform(structuredClone(before)),
            );
            tx.objectStore("nutritionPreferences").put(result.preferences);
            const affected = new Set<string>();
            for (const key of Object.keys(
              collections,
            ) as (keyof typeof collections)[]) {
              const old = new Map(
                  before[key].map((v) => [identity(v), JSON.stringify(v)]),
                ),
                next = new Map(result[key].map((v) => [identity(v), v]));
              for (const [id, value] of next) {
                if (old.get(id) !== JSON.stringify(value)) {
                  tx.objectStore(collections[key]).put(value);
                  if (
                    "localDate" in value &&
                    typeof value.localDate === "string"
                  )
                    affected.add(value.localDate);
                  const previous = before[key].find((v) => identity(v) === id);
                  if (
                    previous &&
                    "localDate" in previous &&
                    typeof previous.localDate === "string"
                  )
                    affected.add(previous.localDate);
                }
              }
              for (const id of old.keys())
                if (!next.has(id)) {
                  tx.objectStore(collections[key]).delete(id);
                  const previous = before[key].find((v) => identity(v) === id);
                  if (
                    previous &&
                    "localDate" in previous &&
                    typeof previous.localDate === "string"
                  )
                    affected.add(previous.localDate);
                }
            }
            for (const date of affected) {
              if (result.days.some((d) => d.localDate === date))
                tx.objectStore("derivedNutritionDayTotals").put({
                  localDate: date,
                  totals: aggregateNutritionDay(result.foodEntries, date),
                });
              else tx.objectStore("derivedNutritionDayTotals").delete(date);
            }
          } catch (error) {
            cause = error;
            tx.abort();
          }
        }),
    );
    tx.onabort = () =>
      reject(
        cause ??
          tx.error ??
          Error("Save failed. Existing nutrition records are preserved."),
      );
    tx.onerror = () => {
      cause ??= tx.error;
    };
    tx.oncomplete = () => {
      if (!result) {
        reject(Error("No nutrition change was saved."));
        return;
      }
      notify();
      resolve(result);
    };
  });
}
export async function saveNutritionPreferences(value: NutritionPreferences) {
  const parsed = preferencesSchema.parse(value);
  return mutate((b) => ({ ...b, preferences: parsed }));
}
function ensureDay(b: NutritionBackup, day: NutritionDay) {
  if (!b.days.some((d) => d.localDate === day.localDate)) b.days.push(day);
}
export async function saveFoodEntry(
  value: FoodEntry,
  day: NutritionDay,
  expectedRevision?: number,
) {
  const e = foodEntrySchema.parse(value);
  return mutate((b) => {
    const old = b.foodEntries.find((v) => v.id === e.id);
    if (old && old.revision !== expectedRevision)
      throw Error("This entry changed in another tab. Reload before editing.");
    ensureDay(b, day);
    const next = foodEntrySchema.parse({
      ...e,
      revision: old ? old.revision + 1 : 1,
      updatedAt: new Date().toISOString(),
    });
    b.foodEntries = b.foodEntries.filter((v) => v.id !== next.id);
    b.foodEntries.push(next);
    return b;
  });
}
export async function saveFoodEntries(entries: FoodEntry[], day: NutritionDay) {
  const parsed = entries.map((e) => foodEntrySchema.parse(e));
  return mutate((b) => {
    ensureDay(b, day);
    for (const e of parsed) {
      if (b.foodEntries.some((v) => v.id === e.id))
        throw Error("Copied entries must have new identities.");
      b.foodEntries.push(e);
    }
    return b;
  });
}
export async function saveHydrationEntry(
  value: HydrationEntry,
  day: NutritionDay,
  expectedUpdatedAt?: string,
) {
  const e = hydrationSchema.parse(value);
  return mutate((b) => {
    const old = b.hydrationEntries.find((v) => v.id === e.id);
    if (old && old.updatedAt !== expectedUpdatedAt)
      throw Error(
        "This fluid entry changed in another tab. Reload before editing.",
      );
    ensureDay(b, day);
    b.hydrationEntries = b.hydrationEntries.filter((v) => v.id !== e.id);
    b.hydrationEntries.push({ ...e, updatedAt: new Date().toISOString() });
    return b;
  });
}
export async function saveCustomFood(
  food: CustomFood,
  revision: CustomFoodRevision,
  expectedUpdatedAt?: string,
) {
  const f = customFoodSchema.parse(food),
    r = customRevisionSchema.parse(revision);
  return mutate((b) => {
    const old = b.customFoods.find((v) => v.id === f.id);
    if (old && old.updatedAt !== expectedUpdatedAt)
      throw Error(
        "This custom food changed in another tab. Reload before revising.",
      );
    if (b.customFoodRevisions.some((v) => v.id === r.id))
      throw Error("Custom revisions are immutable. Create a new revision.");
    b.customFoods = b.customFoods.filter((v) => v.id !== f.id);
    b.customFoods.push(f);
    b.customFoodRevisions.push(r);
    return b;
  });
}
export async function setCustomFoodArchived(id: string, archived: boolean) {
  return mutate((b) => {
    const food = b.customFoods.find((f) => f.id === id);
    if (!food) throw Error("Custom food unavailable.");
    food.status = archived ? "archived" : "active";
    food.updatedAt = new Date().toISOString();
    return b;
  });
}
export async function saveFavourite(value: NutritionFavourite) {
  const f = favouriteSchema.parse(value);
  return mutate((b) => {
    b.favourites = b.favourites.filter((v) => v.id !== f.id);
    b.favourites.push(f);
    return b;
  });
}
export async function removeFavourite(id: string) {
  return mutate((b) => ({
    ...b,
    favourites: b.favourites.filter((f) => f.id !== id),
  }));
}
export async function softDeleteNutritionEntry(id: string, restore = false) {
  return mutate((b) => {
    const entry =
      b.foodEntries.find((e) => e.id === id) ??
      b.hydrationEntries.find((e) => e.id === id);
    if (!entry) throw Error("Entry unavailable.");
    entry.deletedAt = restore ? null : new Date().toISOString();
    entry.updatedAt = new Date().toISOString();
    if ("revision" in entry) entry.revision++;
    return b;
  });
}
export async function purgeNutritionEntry(id: string, confirmed: boolean) {
  if (!confirmed) throw Error("Confirm permanent deletion first.");
  return mutate((b) => ({
    ...b,
    foodEntries: b.foodEntries.filter((e) => e.id !== id),
    hydrationEntries: b.hydrationEntries.filter((e) => e.id !== id),
    auditLog: [
      ...b.auditLog,
      {
        id: newNutritionId("nutrition_audit"),
        action: "purge" as const,
        occurredAt: new Date().toISOString(),
        summary:
          "Permanently deleted one nutrition entry after explicit confirmation.",
      },
    ],
  }));
}
export async function replaceNutritionDayTarget(
  date: string,
  target: TargetSnapshot | null,
  reason: string,
  confirmed: boolean,
) {
  if (!confirmed || !reason.trim())
    throw Error("Confirm target replacement and provide an audit reason.");
  return mutate((b) => {
    const day = b.days.find((d) => d.localDate === date);
    if (!day) throw Error("Day unavailable.");
    day.targetSnapshot = target;
    day.updatedAt = new Date().toISOString();
    b.auditLog.push(
      auditRecordNormativeSchema.parse({
        id: newNutritionId("nutrition_audit"),
        action: "target_snapshot_replaced",
        occurredAt: day.updatedAt,
        localDate: date,
        summary: "Explicitly replaced the frozen daily target snapshot.",
        reason,
      }),
    );
    return b;
  });
}
export async function restoreNutritionBackup(
  value: unknown,
  mode: "keep_existing" | "duplicate_conflicts",
  confirmed: boolean,
  preferences: "keep" | "import" = "keep",
) {
  const incoming = validateNutritionBackupImport(value);
  if (!confirmed) throw Error("Review and confirm the restore plan first.");
  return mutate((current) => {
    if (preferences === "import") current.preferences = incoming.preferences;
    const plan = createNutritionRestorePlan(current, incoming);
    if (mode === "duplicate_conflicts" && plan.some((p) => p.conflicts > 0)) {
      // Remap the entire imported custom-food graph; keep existing frozen days on date collisions.
      const map = new Map<string, string>();
      for (const f of incoming.customFoods)
        map.set(f.id, newNutritionId("custom_food"));
      for (const r of incoming.customFoodRevisions)
        map.set(r.id, newNutritionId("custom_food_revision"));
      const ref = (value: FoodEntry) => {
        if (value.customFoodRef) {
          value.customFoodRef.customFoodId = map.get(
            value.customFoodRef.customFoodId,
          )!;
          value.customFoodRef.revisionId = map.get(
            value.customFoodRef.revisionId,
          )!;
          value.nutrients = value.nutrients.map((n) => ({
            ...n,
            sourceRecordId: map.get(n.sourceRecordId) ?? n.sourceRecordId,
          }));
        }
        value.id = newNutritionId("nentry");
        return value;
      };
      incoming.customFoods.forEach((f) => {
        f.id = map.get(f.id)!;
        f.currentRevisionId = map.get(f.currentRevisionId)!;
      });
      incoming.customFoodRevisions.forEach((r) => {
        r.id = map.get(r.id)!;
        r.customFoodId = map.get(r.customFoodId)!;
      });
      incoming.foodEntries = incoming.foodEntries.map(ref);
      incoming.hydrationEntries.forEach(
        (e) => (e.id = newNutritionId("hydration")),
      );
      incoming.favourites.forEach((f) => {
        f.id = newNutritionId("nutrition_favourite");
        f.entrySnapshot = ref(f.entrySnapshot);
        if (f.customFoodRef) {
          f.customFoodRef.customFoodId = map.get(f.customFoodRef.customFoodId)!;
          f.customFoodRef.revisionId = map.get(f.customFoodRef.revisionId)!;
        }
      });
      incoming.auditLog.forEach(
        (a) => (a.id = newNutritionId("nutrition_audit")),
      );
    }
    for (const key of Object.keys(
      collections,
    ) as (keyof typeof collections)[]) {
      const existing = new Set(current[key].map(identity));
      const additions = incoming[key].filter((v) => !existing.has(identity(v))); // A union push is structurally safe because collection key and values stay paired.
      (current[key] as object[]).push(...additions);
    }
    current.auditLog.push({
      id: newNutritionId("nutrition_audit"),
      action: mode === "keep_existing" ? "restore_merge" : "restore_duplicate",
      occurredAt: new Date().toISOString(),
      summary:
        "Validated nutrition restore; existing records and day snapshots retained.",
    });
    return current;
  });
}
export async function deleteAllNutrition(phrase: string) {
  if (phrase !== "DELETE NUTRITION")
    throw Error("Type DELETE NUTRITION to confirm. Export a backup first.");
  const result = await mutate(() => emptyNutritionBackup());
  const db = await openFitnessDatabase();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("derivedNutritionDayTotals", "readwrite");
    tx.objectStore("derivedNutritionDayTotals").clear();
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error);
  });
  return result;
}
export async function rebuildStoredNutritionTotals() {
  const db = await openFitnessDatabase(),
    backup = await readNutritionBackup();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("derivedNutritionDayTotals", "readwrite");
    tx.objectStore("derivedNutritionDayTotals").clear();
    for (const day of backup.days)
      tx.objectStore("derivedNutritionDayTotals").put({
        localDate: day.localDate,
        totals: aggregateNutritionDay(backup.foodEntries, day.localDate),
      });
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error);
  });
}
