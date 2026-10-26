import { localRecordSchema } from "../../domain/schemas/foundation";
import type { LocalRecord } from "../../domain/types";

export interface RecordStorage {
  get(id: string): Promise<LocalRecord | undefined>;
  list(): Promise<LocalRecord[]>;
  put(record: LocalRecord): Promise<void>;
  remove(id: string): Promise<void>;
  commit(change: {
    put?: readonly LocalRecord[];
    remove?: readonly string[];
  }): Promise<void>;
  close(): void;
}
export interface AtomicRecordStorage extends RecordStorage {
  compareAndSwap(
    id: string,
    expected: LocalRecord | undefined,
    next: LocalRecord | undefined,
  ): Promise<void>;
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`,
      )
      .join(",")}}`;
  return JSON.stringify(value) ?? "undefined";
}

// The generic store is infrastructure only. Future phases define module schemas.
export function createRecordStorage(
  databaseName = "fitness-os-local",
): AtomicRecordStorage {
  let database: Promise<IDBDatabase> | undefined;
  function open(): Promise<IDBDatabase> {
    if (typeof window === "undefined" || !window.indexedDB)
      return Promise.reject(
        new Error("Local records require browser IndexedDB."),
      );
    database ??= new Promise((resolve, reject) => {
      const request = window.indexedDB.open(databaseName, 1);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("records", { keyPath: "id" });
      };
      request.onerror = () => {
        database = undefined;
        reject(
          new Error(
            "Local storage could not open. Export your records before clearing site data.",
          ),
        );
      };
      request.onblocked = () => {
        database = undefined;
        reject(
          new Error(
            "Close other Fitness OS tabs and retry opening local storage.",
          ),
        );
      };
      request.onsuccess = () => {
        request.result.onversionchange = () => {
          request.result.close();
          database = undefined;
        };
        resolve(request.result);
      };
    });
    return database;
  }
  async function transact<T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> {
    const db = await open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("records", mode);
      const request = operation(transaction.objectStore("records"));
      transaction.oncomplete = () => resolve(request.result);
      transaction.onerror = () =>
        reject(
          new Error(
            "Local data operation failed. Existing records have been preserved.",
          ),
        );
      transaction.onabort = () =>
        reject(
          new Error("Local data operation was aborted. Nothing was saved."),
        );
    });
  }
  return {
    async compareAndSwap(id, expected, next) {
      const valid =
        next === undefined ? undefined : localRecordSchema.parse(next);
      if ((valid && valid.id !== id) || (expected && expected.id !== id))
        throw new Error("Record identity mismatch.");
      const db = await open();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("records", "readwrite"),
          store = tx.objectStore("records"),
          read = store.get(id);
        let reason =
          "Local save failed. Your draft is still on this page; existing records are preserved.";
        tx.oncomplete = () => resolve();
        tx.onerror = tx.onabort = () => reject(new Error(reason));
        read.onsuccess = () => {
          if (canonical(read.result) !== canonical(expected)) {
            reason =
              "This plan changed in another tab. Reload the saved plan before retrying; nothing was overwritten.";
            tx.abort();
            return;
          }
          try {
            if (valid) store.put(valid);
            else store.delete(id);
          } catch {
            tx.abort();
          }
        };
      });
    },
    async get(id) {
      const record: unknown = await transact("readonly", (store) =>
        store.get(id),
      );
      return record === undefined ? undefined : localRecordSchema.parse(record);
    },
    async list() {
      const records: unknown[] = await transact("readonly", (store) =>
        store.getAll(),
      );
      return records.map((record) => localRecordSchema.parse(record));
    },
    async put(record) {
      const valid = localRecordSchema.parse(record);
      await transact("readwrite", (store) => store.put(valid));
    },
    async remove(id) {
      await transact("readwrite", (store) => store.delete(id));
    },
    async commit(change) {
      const records = (change.put ?? []).map((record) =>
        localRecordSchema.parse(record),
      );
      const db = await open();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction("records", "readwrite"),
          recordStore = transaction.objectStore("records");
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(
            new Error(
              "Local data changes failed. Existing records were preserved.",
            ),
          );
        transaction.onabort = () =>
          reject(new Error("Local changes were aborted. Nothing was saved."));
        try {
          records.forEach((record) => recordStore.put(record));
          (change.remove ?? []).forEach((id) => recordStore.delete(id));
        } catch {
          transaction.abort();
        }
      });
    },
    close() {
      if (database) {
        void database.then((db) => db.close()).catch(() => undefined);
        database = undefined;
      }
    },
  };
}
