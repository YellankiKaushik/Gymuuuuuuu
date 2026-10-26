import { afterEach, expect, it, vi } from "vitest";
import { IDBFactory, IDBObjectStore } from "fake-indexeddb";
import { createRecordStorage } from "../src/storage/indexed-db/adapter";
import { closeFitnessDatabase } from "../src/storage/indexed-db/fitness-database";
import {
  createBackup,
  previewBackup,
  readDataHistory,
  restoreBackup,
  resumeRestore,
  rollbackRestore,
} from "../src/features/data-management/service";
import { prepareRestoreStorage } from "../src/features/data-management/prepare";
import {
  listPersonalPlans,
  newPersonalPlan,
  savePersonalPlan,
  withPersonalPlanWrite,
  workoutFromPersonalPlan,
} from "../src/features/visual-training/plans";
import { workoutSessionSchema } from "../src/features/workout-tracker/schema";
import { getPreferences } from "../src/features/workout-tracker/storage";

function setup() {
  closeFitnessDatabase();
  const factory = new IDBFactory(),
    values = new Map<string, string>();
  vi.stubGlobal("window", {
    indexedDB: factory,
    localStorage: {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
    },
  });
  vi.stubGlobal("navigator", {});
  return { factory, values };
}
afterEach(() => {
  closeFitnessDatabase();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function done(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = tx.onerror = () => reject(tx.error);
  });
}
async function rawWrite(database: string, store: string, value: unknown) {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(database);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const tx = db.transaction(store, "readwrite");
  tx.objectStore(store).put(value);
  await done(tx);
  db.close();
}
function draft() {
  const plan = newPersonalPlan();
  plan.payload.name = "Synthetic portable plan";
  plan.payload.sessions = [
    {
      id: "A",
      entries: [
        {
          id: "plan_entry_a",
          exerciseId: "exercise_dumbbell_curl",
          sets: 1,
          repetitions: 5,
          restSeconds: 30,
        },
      ],
    },
    {
      id: "B",
      entries: [
        {
          id: "plan_entry_b",
          exerciseId: "exercise_one_arm_dumbbell_row",
          sets: null,
          repetitions: null,
          restSeconds: null,
        },
      ],
    },
  ];
  return plan;
}
it("global portable backup restores both plan sessions and independent workout snapshots into a fresh profile; preview writes nothing", async () => {
  setup();
  await prepareRestoreStorage();
  const store = createRecordStorage(),
    plan = await savePersonalPlan(store, draft());
  const workout = workoutSessionSchema.parse(
    workoutFromPersonalPlan(plan, "A"),
  );
  await getPreferences();
  await rawWrite("fitness-os", "workoutSessions", workout);
  const archive = await createBackup();
  const records = archive.payload.modules
    .flatMap((m) => m.stores)
    .find(
      (s) => s.databaseName === "fitness-os-local" && s.storeId === "records",
    )!;
  expect(records.records.find((r) => r.recordId === plan.id)?.value).toEqual(
    plan,
  );
  expect((records.records[0]!.value as typeof plan).payload.version).toBe(1);
  store.close();
  setup();
  await prepareRestoreStorage();
  const before = await createBackup();
  const preview = await previewBackup(archive);
  expect(preview.errors).toEqual([]);
  expect(preview.writes).toBe(0);
  expect((await createBackup()).payload).toEqual(before.payload);
  await restoreBackup(archive, "keep-existing");
  const fresh = createRecordStorage(),
    restored = (await listPersonalPlans(fresh))[0]!;
  expect(restored).toEqual(plan);
  expect(restored.payload.sessions[1]!.entries[0]!.exerciseId).toBe(
    "exercise_one_arm_dumbbell_row",
  );
  await savePersonalPlan(
    fresh,
    { ...restored, payload: { ...restored.payload, name: "Later edit" } },
    restored,
  );
  const exported = await createBackup();
  const snapshot = exported.payload.modules
    .flatMap((m) => m.stores)
    .find((s) => s.storeId === "workoutSessions")!
    .records.find((r) => r.recordId === workout.id)!.value;
  expect(snapshot).toEqual(workout);
  fresh.close();
});

it.each(["future", "unknown-exercise", "malformed"])(
  "rejects correctly hashed %s plan imports before canonical writes",
  async (kind) => {
    setup();
    await prepareRestoreStorage();
    const store = createRecordStorage(),
      plan = await savePersonalPlan(store, draft()),
      corrupt = structuredClone(plan);
    if (kind === "future") Reflect.set(corrupt.payload, "version", 2);
    else if (kind === "unknown-exercise")
      Reflect.set(
        corrupt.payload.sessions[0]!.entries[0]!,
        "exerciseId",
        "exercise_unpublished",
      );
    else Reflect.set(corrupt.payload, "sessions", [{ id: "A" }]);
    // Simulate an untrusted correctly hashed archive via the real serializer.
    await rawWrite("fitness-os-local", "records", corrupt);
    const archive = await createBackup();
    await rawWrite("fitness-os-local", "records", plan);
    const before = await createBackup();
    const preview = await previewBackup(archive);
    expect(preview.errors.join(" ")).toContain("Invalid records");
    expect(preview.writes).toBe(0);
    await expect(restoreBackup(archive, "replace")).rejects.toThrow(
      "Invalid records",
    );
    expect((await createBackup()).payload).toEqual(before.payload);
    expect(await listPersonalPlans(store)).toEqual([plan]);
    store.close();
  },
);

it.each(["resume", "rollback"] as const)(
  "blocks plan writes during an interrupted restore, then recovers plans via %s",
  async (mode) => {
    setup();
    await prepareRestoreStorage();
    const store = createRecordStorage(),
      incomingPlan = await savePersonalPlan(store, draft());
    const incoming = await createBackup();
    const before = await savePersonalPlan(
      store,
      {
        ...incomingPlan,
        payload: { ...incomingPlan.payload, name: "Before restore" },
      },
      incomingPlan,
    );
    await rawWrite("fitness-os-local", "records", incomingPlan);
    await rawWrite("fitness-os", "phase17RestoreJournal", {
      id: "synthetic-plan-interruption",
      status: "running",
      startedAt: new Date().toISOString(),
      mode: "replace",
      completedDatabases: ["fitness-os-local"],
      currentDatabase: "fitness-os",
      backup: incoming,
      selectedStores: null,
      rollbackSnapshots: [
        {
          databaseName: "fitness-os-local",
          storeId: "records",
          records: [before],
        },
      ],
      shellPreferenceSnapshots: [],
    });
    await expect(savePersonalPlan(store, before, incomingPlan)).rejects.toThrow(
      "restore needs recovery",
    );
    expect(await listPersonalPlans(store)).toEqual([incomingPlan]);
    store.close();
    closeFitnessDatabase();
    if (mode === "resume") await resumeRestore("synthetic-plan-interruption");
    else await rollbackRestore("synthetic-plan-interruption");
    const reopened = createRecordStorage();
    expect(await listPersonalPlans(reopened)).toEqual([
      mode === "resume" ? incomingPlan : before,
    ]);
    expect((await readDataHistory()).phase17RestoreJournal).toEqual([]);
    reopened.close();
  },
);

it("rolls earlier database changes back when restoring a plan hits a quota failure", async () => {
  setup();
  await prepareRestoreStorage();
  const store = createRecordStorage(),
    incomingPlan = await savePersonalPlan(store, draft());
  await rawWrite("fitness-os", "phase17Settings", {
    key: "pilot",
    value: "incoming",
  });
  const archive = await createBackup();
  const before = await savePersonalPlan(
    store,
    {
      ...incomingPlan,
      payload: { ...incomingPlan.payload, name: "Keep this plan" },
    },
    incomingPlan,
  );
  await rawWrite("fitness-os", "phase17Settings", {
    key: "pilot",
    value: "preserve",
  });
  const initial = await createBackup(),
    put = IDBObjectStore.prototype.put;
  let failed = false;
  vi.spyOn(IDBObjectStore.prototype, "put").mockImplementation(function (
    this: IDBObjectStore,
    value: unknown,
    key?: IDBValidKey,
  ) {
    if (this.name === "records" && !failed) {
      failed = true;
      throw new DOMException("Synthetic quota failure", "QuotaExceededError");
    }
    return put.call(this, value, key);
  });
  await expect(restoreBackup(archive, "replace")).rejects.toThrow(
    "previous records were restored automatically",
  );
  expect(failed).toBe(true);
  expect(await listPersonalPlans(store)).toEqual([before]);
  const after = await createBackup();
  for (const target of initial.payload.modules
    .flatMap((m) => m.stores)
    .filter((s) => s.storeId !== "phase17AuditEvents"))
    expect(
      after.payload.modules
        .flatMap((m) => m.stores)
        .find(
          (s) =>
            s.databaseName === target.databaseName &&
            s.storeId === target.storeId,
        )?.records,
    ).toEqual(target.records);
  expect((await readDataHistory()).phase17RestoreJournal).toEqual([]);
  store.close();
});

it("uses the established fallback restore lease and refuses blocked coordination without writing personal records", async () => {
  const { values } = setup(),
    store = createRecordStorage(),
    plan = draft();
  values.set(
    "fitness-os:restore-lock:v1",
    JSON.stringify({ owner: "another-tab", expiresAt: Date.now() + 30000 }),
  );
  await expect(savePersonalPlan(store, plan)).rejects.toThrow(
    "restore is already running",
  );
  expect(await store.list()).toEqual([]);
  values.clear();
  await withPersonalPlanWrite(async () => {
    expect(
      JSON.parse(values.get("fitness-os:restore-lock:v1")!).owner,
    ).toBeTruthy();
  });
  expect(values.size).toBe(0);
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    get: () => {
      throw new DOMException("Synthetic blocked storage", "SecurityError");
    },
  });
  await expect(savePersonalPlan(store, plan)).rejects.toThrow(
    "Synthetic blocked storage",
  );
  expect(await store.list()).toEqual([]);
  store.close();
});

it("uses the same Web Lock name as restore and handles a busy exclusive lock", async () => {
  setup();
  const operation = vi.fn(async () => "written");
  const request = vi.fn(
    async (
      _name: string,
      _options: unknown,
      callback: (lock: null) => Promise<unknown>,
    ) => callback(null),
  );
  vi.stubGlobal("navigator", { locks: { request } });
  await expect(withPersonalPlanWrite(operation)).rejects.toThrow(
    "restore is already running",
  );
  expect(request).toHaveBeenCalledWith(
    "fitness-os-data-restore",
    { mode: "shared", ifAvailable: true },
    expect.any(Function),
  );
  expect(operation).not.toHaveBeenCalled();
});
