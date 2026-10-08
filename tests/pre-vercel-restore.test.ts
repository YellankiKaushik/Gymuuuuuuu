import { afterEach, expect, it, vi } from "vitest";
import { IDBFactory, IDBObjectStore } from "fake-indexeddb";
import {
  closeFitnessDatabase,
  openFitnessDatabase,
} from "../src/storage/indexed-db/fitness-database";
import { createRecordStorage } from "../src/storage/indexed-db/adapter";
import {
  createBackup,
  clearLocalData,
  downloadBackup,
  previewBackup,
  restoreBackup,
  readDataHistory,
  validateBackup,
} from "../src/features/data-management/service";
import { readPhotoBlob } from "../src/features/progress/storage";
import { prepareRestoreStorage } from "../src/features/data-management/prepare";
import {
  maximumBackupBytes,
  readBackupFile,
} from "../src/features/data-management/read-file";

function setup() {
  const indexedDB = new IDBFactory(),
    preferences = new Map<string, string>();
  vi.stubGlobal("window", {
    indexedDB,
    sessionStorage: { removeItem: vi.fn() },
    localStorage: {
      getItem: (key: string) => preferences.get(key) ?? null,
      setItem: (key: string, value: string) => preferences.set(key, value),
      removeItem: (key: string) => preferences.delete(key),
    },
  });
  return { indexedDB, preferences };
}
afterEach(() => {
  closeFitnessDatabase();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function done(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error);
  });
}

it("prepares every owning schema from one action, then previews with zero canonical writes", async () => {
  setup();
  await prepareRestoreStorage();
  const before = await createBackup();
  expect(
    new Set(
      before.payload.modules.flatMap((module) =>
        module.stores.map((store) => store.databaseName),
      ),
    ).size,
  ).toBe(7);
  expect((await previewBackup(before)).errors).toEqual([]);
  expect((await createBackup()).payload).toEqual(before.payload);
});

it("invalid and valid-but-uninitialized previews create no databases in a fresh profile", async () => {
  setup();
  await prepareRestoreStorage();
  const backup = await createBackup();
  const fresh = setup().indexedDB;
  expect((await previewBackup({})).errors.length).toBeGreaterThan(0);
  expect((await previewBackup(backup)).errors.join(" ")).toContain(
    "Prepare local storage",
  );
  expect(await fresh.databases()).toEqual([]);
});

it("rejects duplicate target stores and future module/registry/serializer versions", async () => {
  setup();
  await prepareRestoreStorage();
  const backup = await createBackup();
  const module = backup.payload.modules[0]!;
  const duplicate = {
    ...backup,
    payload: {
      ...backup.payload,
      modules: [{ ...module, stores: [module.stores[0], module.stores[0]] }],
    },
  };
  expect(validateBackup(duplicate).errors.join(" ")).toContain(
    "Duplicate target store",
  );
  for (const changed of [
    { ...backup, registryVersion: 2 },
    {
      ...backup,
      integrity: { ...backup.integrity, canonicalSerializerVersion: 2 },
    },
    {
      ...backup,
      payload: {
        ...backup.payload,
        modules: [{ ...module, moduleSchemaVersion: 2 }],
      },
    },
  ])
    expect((await previewBackup(changed)).errors.length).toBeGreaterThan(0);
});

it("rejects correctly hashed malformed measurements before changing populated data", async () => {
  setup();
  const db = await openFitnessDatabase();
  const tx = db.transaction(["bodyWeightLogs", "phase17Settings"], "readwrite");
  tx.objectStore("bodyWeightLogs").put({
    id: "invalid-weight",
    valueKg: -5,
    localDate: "not-a-date",
  });
  tx.objectStore("phase17Settings").put({ key: "preserve", value: "before" });
  await done(tx);
  db.close();
  const backup = await createBackup();
  const preview = await previewBackup(backup);
  expect(preview.errors.join(" ")).toContain("Invalid bodyWeightLogs");
  await expect(restoreBackup(backup, "replace")).rejects.toThrow(
    "Invalid bodyWeightLogs",
  );
  expect((await createBackup()).payload).toEqual(backup.payload);
});

it("automatically rolls back earlier database writes after a later synchronous quota failure", async () => {
  setup();
  await prepareRestoreStorage();
  const db = await openFitnessDatabase();
  const tx = db.transaction("phase17Settings", "readwrite");
  tx.objectStore("phase17Settings").put({ key: "test", value: "incoming" });
  await done(tx);
  db.close();
  const records = createRecordStorage();
  const time = "2026-10-08T12:00:00.000Z";
  await records.put({
    id: "synthetic",
    module: "notes",
    schemaVersion: 1,
    createdAt: time,
    updatedAt: time,
    payload: { note: "incoming" },
  });
  records.close();
  const backup = await createBackup();
  const previous = await openFitnessDatabase();
  const change = previous.transaction("phase17Settings", "readwrite");
  change.objectStore("phase17Settings").put({ key: "test", value: "before" });
  await done(change);
  previous.close();
  const before = await createBackup();
  const original = IDBObjectStore.prototype.put;
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
    return original.call(this, value, key);
  });
  await expect(restoreBackup(backup, "replace")).rejects.toThrow(
    "previous records were restored automatically",
  );
  expect(failed).toBe(true);
  const after = await createBackup();
  for (const store of before.payload.modules
    .flatMap((module) => module.stores)
    .filter((store) => store.storeId !== "phase17AuditEvents")) {
    expect(
      after.payload.modules
        .flatMap((module) => module.stores)
        .find(
          (candidate) =>
            candidate.databaseName === store.databaseName &&
            candidate.storeId === store.storeId,
        )?.records,
    ).toEqual(store.records);
  }
  expect((await readDataHistory()).phase17RestoreJournal).toEqual([]);
});

it("keep-existing preserves existing shell preferences", async () => {
  const { preferences } = setup();
  await prepareRestoreStorage();
  preferences.set("fitness-os:preferences:v1", "incoming");
  const backup = await createBackup();
  preferences.set("fitness-os:preferences:v1", "before");
  await restoreBackup(backup, "keep-existing");
  expect(preferences.get("fitness-os:preferences:v1")).toBe("before");
});

it("backup excludes the IndexedDB active-workout pointer as well as timers", async () => {
  setup();
  const db = await openFitnessDatabase();
  const tx = db.transaction("appMeta", "readwrite");
  tx.objectStore("appMeta").put({
    key: "active-workout",
    sessionId: "synthetic-active",
  });
  await done(tx);
  db.close();
  const backup = await createBackup();
  const stores = backup.payload.modules.flatMap((module) => module.stores);
  expect(stores.some((store) => store.storeId === "activeTimers")).toBe(false);
  expect(
    stores
      .find((store) => store.storeId === "appMeta")!
      .records.some((record) => record.recordId === "active-workout"),
  ).toBe(false);
});

it("rejects oversized files before reading and malformed gzip before preview", async () => {
  const text = vi.fn();
  await expect(
    readBackupFile({
      size: maximumBackupBytes + 1,
      name: "large.json",
      text,
    } as unknown as File),
  ).rejects.toThrow("100 MiB");
  expect(text).not.toHaveBeenCalled();
  await expect(
    readBackupFile(new File(["invalid"], "invalid.gz")),
  ).rejects.toThrow();
});

it("a rejected blocked upgrade cannot migrate later when the old tab closes", async () => {
  const { indexedDB } = setup();
  const old = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("fitness-os", 1);
    req.onupgradeneeded = () =>
      req.result.createObjectStore("appMeta", { keyPath: "key" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  await expect(
    openFitnessDatabase("fitness-os", { shared: false }),
  ).rejects.toThrow("Close other");
  old.close();
  const unchanged = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open("fitness-os");
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  expect(unchanged.version).toBe(1);
  expect([...unchanged.objectStoreNames]).toEqual(["appMeta"]);
  unchanged.close();
  const retry = await openFitnessDatabase("fitness-os", { shared: false });
  expect(retry.version).toBe(17);
  retry.close();
});

it("reads sanitized byte photos and existing native Blob photos without changing their bytes", async () => {
  setup();
  const db = await openFitnessDatabase();
  const bytes = new Uint8Array([1, 2, 3]);
  const tx = db.transaction("progressPhotoBlobs", "readwrite"),
    complete = done(tx);
  tx.objectStore("progressPhotoBlobs").put({
    blobKey: "bytes",
    blob: bytes,
    mime: "image/png",
  });
  tx.objectStore("progressPhotoBlobs").put({
    blobKey: "legacy",
    blob: new Blob([bytes], { type: "image/png" }),
    mime: "image/png",
  });
  await complete;
  for (const key of ["bytes", "legacy"]) {
    const row = await readPhotoBlob(key);
    expect(row?.blob.type).toBe("image/png");
    expect(new Uint8Array(await row!.blob.arrayBuffer())).toEqual(bytes);
  }
});

it("refuses an export larger than its supported restore limit before starting a download", async () => {
  setup();
  await openFitnessDatabase();
  const backup = await createBackup({ selectedDatabases: ["fitness-os"] });
  vi.spyOn(Blob.prototype, "size", "get").mockReturnValue(
    maximumBackupBytes + 1,
  );
  await expect(downloadBackup(backup)).rejects.toThrow("100 MiB restore limit");
});

it("keeps an authorized blocked clear pending until the other connection closes", async () => {
  const { indexedDB } = setup();
  await openFitnessDatabase();
  const other = await new Promise<IDBDatabase>((resolve) => {
    const req = indexedDB.open("fitness-os");
    req.onsuccess = () => resolve(req.result);
  });
  let blocked = "";
  const clearing = clearLocalData("CLEAR LOCAL DATA", (name) => {
    blocked = name;
  });
  await vi.waitFor(() => expect(blocked).toBe("fitness-os"));
  expect(
    (await indexedDB.databases()).some((row) => row.name === "fitness-os"),
  ).toBe(true);
  other.close();
  expect(await clearing).toContain("fitness-os");
  expect(await indexedDB.databases()).toEqual([]);
});
