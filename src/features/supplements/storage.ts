import {
  rowSchemas,
  type Collection,
  type Backup,
  type Product,
  type Label,
  type Intake,
  type Trial,
  type AdverseEvent,
} from "./schema";
import {
  emptyBackup,
  validateBackup,
  newId,
  same,
  urgentEvent,
} from "./domain";
const collections = Object.keys(rowSchemas) as Collection[];
const stores = [...collections, "derivedSummaries"];
export function openDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB)
    return Promise.reject(
      Error("Supplement records require browser IndexedDB"),
    );
  return new Promise((resolve, reject) => {
    const r = window.indexedDB.open("fitness-os-supplements-evidence", 1);
    r.onupgradeneeded = () => {
      for (const name of stores) {
        const s = r.result.createObjectStore(name, { keyPath: "id" });
        for (const key of [
          "localDate",
          "updatedAt",
          "personalProductId",
          "status",
        ])
          s.createIndex(key, key);
      }
    };
    r.onsuccess = () => {
      r.result.onversionchange = () => r.result.close();
      resolve(r.result);
    };
    r.onerror = () =>
      reject(Error("Supplement storage unavailable; records were preserved"));
    r.onblocked = () =>
      reject(Error("Close other tabs to update supplement storage"));
  });
}
function request<T>(r: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(Error("Supplement read failed"));
  });
}
function done(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = () =>
      reject(Error("Write rolled back; existing records were preserved"));
    tx.onerror = () => {};
  });
}
async function rawRoot(tx: IDBTransaction) {
  const root: Record<string, unknown> = { ...emptyBackup() };
  await Promise.all(
    collections.map(async (key) => {
      root[key] = await request(tx.objectStore(key).getAll());
    }),
  );
  return root;
}
export async function readBackup() {
  const db = await openDatabase();
  try {
    return validateBackup(
      await rawRoot(db.transaction(collections, "readonly")),
    );
  } finally {
    db.close();
  }
}
export async function rawRecovery() {
  const db = await openDatabase();
  try {
    const tx = db.transaction(stores, "readonly");
    return Object.fromEntries(
      await Promise.all(
        stores.map(async (k) => [k, await request(tx.objectStore(k).getAll())]),
      ),
    );
  } finally {
    db.close();
  }
}
function cursor(store: IDBObjectStore, limit: number, offset = 0) {
  return new Promise<unknown[]>((resolve, reject) => {
    const rows: unknown[] = [];
    let seen = 0;
    const r = store.openCursor(null, "prev");
    r.onerror = () => reject(Error("History read failed"));
    r.onsuccess = () => {
      const c = r.result;
      if (!c || rows.length >= limit) {
        resolve(rows);
        return;
      }
      if (seen++ >= offset) rows.push(c.value as unknown);
      c.continue();
    };
  });
}
export type View = {
  data: Backup;
  quarantined: number;
  totals: Partial<Record<Collection, number>>;
  offset: number;
};
export async function readView(offset = 0): Promise<View> {
  if (!Number.isInteger(offset) || offset < 0)
    throw Error("Invalid history page");
  const db = await openDatabase();
  try {
    const tx = db.transaction(collections, "readonly");
    const data: Record<string, unknown> = { ...emptyBackup() },
      totals: View["totals"] = {};
    let quarantined = 0;
    await Promise.all(
      collections.map(async (key) => {
        const s = tx.objectStore(key);
        totals[key] = await request(s.count());
        const rows = await cursor(
          s,
          key === "intakeLogs" ? 100 : 500,
          key === "intakeLogs" ? offset : 0,
        );
        const valid: unknown[] = [];
        for (const row of rows) {
          const parsed = rowSchemas[key].safeParse(row);
          if (parsed.success) valid.push(parsed.data);
          else quarantined++;
        }
        data[key] = valid;
      }),
    );
    return { data: data as Backup, quarantined, totals, offset };
  } finally {
    db.close();
  }
}
function announce() {
  if (typeof BroadcastChannel !== "undefined") {
    const c = new BroadcastChannel("fitness-os-supplement-changes");
    c.postMessage("changed");
    c.close();
  }
}
export async function mutate(
  eventType: string,
  edit: (root: Backup) => void,
  options: { allowDisabled?: boolean; replacement?: Backup } = {},
) {
  const db = await openDatabase(),
    tx = db.transaction(stores, "readwrite"),
    completion = done(tx);
  void completion.catch(() => {});
  try {
    const root = options.replacement
      ? structuredClone(options.replacement)
      : validateBackup(await rawRoot(tx));
    if (
      !options.allowDisabled &&
      root.settings[0]?.value.trackingEnabled === false
    )
      throw Error("Enable optional tracking in settings before saving");
    const oldLabels=structuredClone(root.productLabelVersions);
    edit(root);
    if(!options.replacement)for(const label of oldLabels) {
      const current=root.productLabelVersions.find(l=>l.id===label.id);
      if(!current||!same(current,label))throw Error('Historical label versions are immutable');
    }
    root.auditEvents.push({
      id: newId(),
      eventType,
      entityType: "supplement_records",
      entityId: "module",
      occurredAt: new Date().toISOString(),
      details: {},
    });
    const valid = validateBackup(root);
    for (const key of collections) {
      const s = tx.objectStore(key);
      s.clear();
      for (const row of valid[key]) s.put(row);
    }
    tx.objectStore("derivedSummaries").clear();
    tx.objectStore("derivedSummaries").put({ id: "dirty", dirty: true });
    await completion;
    announce();
  } catch (e) {
    try {
      tx.abort();
    } catch {
      /* already settled */
    }
    await completion.catch(() => {});
    throw e;
  } finally {
    db.close();
  }
}
export async function saveProduct(
  product: Product,
  label?: Label,
  expectedRevision?: number,
) {
  return mutate("product_saved", (root) => {
    const old = root.personalProducts.find((p) => p.id === product.id);
    if (old && old.revision !== expectedRevision)
      throw Error("Product changed in another tab; reload before saving");
    if (old && product.revision !== old.revision + 1)
      throw Error("Product revision must advance");
    if (label) {
      if (root.productLabelVersions.some((v) => v.id === label.id))
        throw Error("Label versions are immutable");
      const versions = root.productLabelVersions.filter(
        (v) => v.personalProductId === product.id,
      );
      if (
        label.versionNumber !==
        Math.max(0, ...versions.map((v) => v.versionNumber)) + 1
      )
        throw Error("Label version is out of sequence");
      root.productLabelVersions.push(label);
    }
    root.personalProducts = root.personalProducts.filter(
      (p) => p.id !== product.id,
    );
    root.personalProducts.push(product);
  });
}
export async function saveTrial(trial: Trial, expected?: number) {
  return mutate("trial_saved", (root) => {
    const old = root.supplementTrials.find((t) => t.id === trial.id);
    if (old && old.revision !== expected)
      throw Error("Trial changed in another tab");
    if (
      old?.status === "stopped_for_adverse_event" &&
      trial.status === "active"
    )
      throw Error("A stopped trial cannot be restarted as routine guidance");
    if (old && !same(old.labelSnapshot, trial.labelSnapshot))
      throw Error("Trial historical label is immutable");
    root.supplementTrials = root.supplementTrials.filter(
      (t) => t.id !== trial.id,
    );
    root.supplementTrials.push(trial);
  });
}
export async function saveIntake(log: Intake, expected?: number) {
  return mutate("intake_saved", (root) => {
    const old = root.intakeLogs.find((l) => l.id === log.id);
    if (old) {
      if (old.revision !== expected)
        throw Error("Intake changed in another tab");
      const { history, ...record } = old;
      if (
        log.revision !== old.revision + 1 ||
        log.history.length !== history.length + 1 ||
        !same(log.history.slice(0, -1), history) ||
        !same(log.history.at(-1)?.record, record)
      )
        throw Error("Intake correction must preserve the prior record");
      if (
        !same(old.productSnapshot, log.productSnapshot) ||
        !same(old.labelSnapshot, log.labelSnapshot) ||
        !same(old.ingredientSnapshot, log.ingredientSnapshot) ||
        old.labelVersionId !== log.labelVersionId
      )
        throw Error("Historical label and amount snapshot cannot change");
    }
    root.intakeLogs = root.intakeLogs.filter((l) => l.id !== log.id);
    root.intakeLogs.push(log);
  });
}
export async function saveEvent(event: AdverseEvent, expected?: number) {
  return mutate("adverse_event_saved", (root) => {
    const old = root.adverseEvents.find((e) => e.id === event.id);
    if (old && old.revision !== expected)
      throw Error("Event changed in another tab");
    if (old && !same(old.labelSnapshots, event.labelSnapshots))
      throw Error("Historical adverse-event label snapshot cannot change");
    root.adverseEvents = root.adverseEvents.filter((e) => e.id !== event.id);
    root.adverseEvents.push(event);
    if (urgentEvent(event)) {
      const trialIds = root.intakeLogs
        .filter((l) => event.relatedIntakeLogIds.includes(l.id))
        .map((l) => l.trialId);
      for (const t of root.supplementTrials)
        if (
          trialIds.includes(t.id) &&
          ["active", "paused", "baseline"].includes(t.status)
        ) {
          t.status = "stopped_for_adverse_event";
          t.actualEndDate = event.localDate;
          t.updatedAt = new Date().toISOString();
          t.revision++;
        }
    }
  });
}
export async function removeRecord(
  collection: Collection,
  id: string,
  confirmed: boolean,
) {
  if (!confirmed) throw Error("Confirm deletion first");
  if (
    ![
      "personalProducts",
      "supplementTrials",
      "intakeLogs",
      "adverseEvents",
      "safetyContexts",
      "savedComparisons",
    ].includes(collection)
  )
    throw Error("This record cannot be deleted independently");
  return mutate("record_deleted", (root) => {
    const rows = root[collection] as { id: string }[];
    const snapshot = rows.find((r) => r.id === id);
    if (!snapshot) throw Error("Record missing");
    root.deletedRecords.push({
      id: newId(),
      entityType: collection,
      entityId: id,
      deletedAt: new Date().toISOString(),
      collection: collection as Backup["deletedRecords"][number]["collection"],
      snapshot: JSON.parse(
        JSON.stringify(snapshot),
      ) as Backup["deletedRecords"][number]["snapshot"],
    });
    Object.assign(root, { [collection]: rows.filter((r) => r.id !== id) });
  });
}
export async function undoDelete(id: string, confirmed: boolean) {
  if (!confirmed) throw Error("Confirm restoration first");
  return mutate(
    "deletion_undone",
    (root) => {
      const t = root.deletedRecords.find((t) => t.id === id);
      if (!t) throw Error("Deleted snapshot missing");
      const row = rowSchemas[t.collection].parse(t.snapshot);
      if (root[t.collection].some((r) => r.id === row.id))
        throw Error("A live record already has that ID");
      (root[t.collection] as { id: string }[]).push(row);
      root.deletedRecords = root.deletedRecords.filter((d) => d.id !== id);
    },
    { allowDisabled: true },
  );
}
export type RestoreMode = "keep_existing" | "import_as_copy" | "replace";
export function mergeBackup(
  existing: Backup,
  incoming: Backup,
  mode: Exclude<RestoreMode, "replace">,
): Backup {
  const root = structuredClone(existing),
    copy = structuredClone(incoming);
  if (mode === "import_as_copy") {
    const mapping = new Map<string, string>();
    for (const key of collections)
      if (key !== "settings")
        for (const row of copy[key]) mapping.set(row.id, newId());
    for(const tomb of copy.deletedRecords)mapping.set(tomb.entityId,newId());
    const remap = (id: string | null) =>
      id === null ? null : (mapping.get(id) ?? id);
    const mapLabel = (l: Label) => {
      l.id = remap(l.id)!;
      l.personalProductId = remap(l.personalProductId)!;
    };
    for (const p of copy.personalProducts) {
      p.id = remap(p.id)!;
      p.currentLabelVersionId = remap(p.currentLabelVersionId);
    }
    copy.productLabelVersions.forEach(mapLabel);
    for (const t of copy.supplementTrials) {
      t.id = remap(t.id)!;
      t.labelVersionId = remap(t.labelVersionId);
      if (t.labelSnapshot) mapLabel(t.labelSnapshot);
    }
    for (const log of copy.intakeLogs) {
      const mapLog = (l: Omit<Intake, "history">) => {
        l.id = remap(l.id)!;
        l.trialId = remap(l.trialId);
        l.labelVersionId = remap(l.labelVersionId);
        if (l.labelSnapshot) mapLabel(l.labelSnapshot);
        if (l.productSnapshot) {
          l.productSnapshot.id = remap(l.productSnapshot.id)!;
          l.productSnapshot.currentLabelVersionId = remap(
            l.productSnapshot.currentLabelVersionId,
          );
        }
      };
      mapLog(log);
      log.history.forEach((h) => mapLog(h.record));
    }
    for (const e of copy.adverseEvents) {
      e.id = remap(e.id)!;
      e.relatedIntakeLogIds = e.relatedIntakeLogIds.map((id) => remap(id)!);
      e.suspectedProductIds = e.suspectedProductIds.map((id) => remap(id)!);
      e.labelSnapshots.forEach(mapLabel);
    }
    for (const key of [
      "safetyContexts",
      "savedComparisons",
      "auditEvents",
      "importConflicts",
    ] as const)
      for (const row of copy[key]) row.id = remap(row.id)!;
    const remapSnapshot=(value:unknown,key=''):unknown=>{
      if(Array.isArray(value))return value.map(v=>remapSnapshot(v,key));
      if(value!==null&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,remapSnapshot(v,k)]));
      if(typeof value==='string'&&['id','personalProductId','currentLabelVersionId','labelVersionId','trialId','entityId','relatedIntakeLogIds','suspectedProductIds'].includes(key))return remap(value);
      return value;
    };
    for(const tomb of copy.deletedRecords){tomb.id=remap(tomb.id)!;tomb.entityId=remap(tomb.entityId)!;tomb.snapshot=remapSnapshot(tomb.snapshot) as typeof tomb.snapshot;}
    for(const audit of copy.auditEvents)audit.entityId=remap(audit.entityId)!;
    for(const conflict of copy.importConflicts)conflict.entityId=remap(conflict.entityId)!;
  }
  for (const key of collections) {
    if (key === "settings") {
      if (root.settings.length === 0) root.settings = copy.settings;
      continue;
    }
    const rows = root[key] as { id: string }[];
    for (const row of copy[key]) {
      const old = rows.find((r) => r.id === row.id);
      if (old) {
        if (!same(old, row))
          root.importConflicts.push({
            id: newId(),
            collection: key,
            entityId: row.id,
            resolution: "kept_existing",
            occurredAt: new Date().toISOString(),
          });
      } else rows.push(row);
    }
  }
  return validateBackup(root);
}
export async function restore(
  backup: Backup,
  mode: RestoreMode,
  confirmed: boolean,
) {
  const valid = validateBackup(backup);
  if (!confirmed)
    throw Error("Review the backup preview and confirm before writing");
  if (mode === "replace")
    return mutate("backup_replaced", () => {}, {
      allowDisabled: true,
      replacement: valid,
    });
  return mutate(
    `backup_${mode}`,
    (root) => Object.assign(root, mergeBackup(root, valid, mode)),
    { allowDisabled: true },
  );
}
export async function clearData(phrase: string) {
  if (phrase !== "DELETE SUPPLEMENT DATA")
    throw Error("Enter DELETE SUPPLEMENT DATA");
  const db = await openDatabase(),
    tx = db.transaction(stores, "readwrite"),
    completion = done(tx);
  void completion.catch(() => {});
  try {
    stores.forEach((s) => tx.objectStore(s).clear());
    await completion;
    announce();
  } catch (e) {
    try {
      tx.abort();
    } catch {
      /* already aborted */
    }
    await completion.catch(() => {});
    throw e;
  } finally {
    db.close();
  }
}
export const supplementsBackupAdapter = {
  moduleId: "phase_14_supplements_evidence",
  read: readBackup,
  validate: validateBackup,
  restore,
};
