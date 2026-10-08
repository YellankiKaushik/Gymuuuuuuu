import { z } from "zod";
import { openFitnessDatabase } from "../../storage/indexed-db/fitness-database";

export const appDatabaseNames = [
  "fitness-os",
  "fitness-os-local",
  "fitness-os-diet-planning",
  "fitness-os-recipes-meal-plans",
  "fitness-os-recovery-sleep-mobility",
  "fitness-os-cardio-conditioning",
  "fitness-os-supplements-evidence",
] as const;
export type AppDatabaseName = (typeof appDatabaseNames)[number];
const ephemeralStores = new Set([
  "activeTimers", "derivedPersonalRecords", "derivedNutritionDayTotals",
  "derivedAnalyticsCache", "phase16PrivateSearchCache", "phase17DataHealthCache",
  "phase17RestoreJournal",
]);
const mediaStores = new Set(["progressPhotoBlobs"]);
const shellKeys = [
  "fitness-os:preferences:v1",
  "fitness-os:nutrient-framework:v1",
] as const;
const envelopeSchema = z.object({
  format: z.literal("fitness-os-backup"),
  formatVersion: z.number().int().positive(),
  backupId: z.string().min(8),
  createdAt: z.string().datetime({ offset: true }),
  appVersion: z.string().min(1),
  registryVersion: z.number().int().positive(),
  profile: z.enum(["portable", "portable_gzip", "full_with_media", "selected_modules"]),
  payload: z.object({ modules: z.array(z.object({
    moduleId: z.string().regex(/^phase_[0-9]{2}$/),
    moduleSchemaVersion: z.number().int().nonnegative(),
    stores: z.array(z.object({
      databaseName: z.string().min(1), storeId: z.string().min(1),
      schemaVersion: z.number().int().nonnegative(), recordCount: z.number().int().nonnegative(),
      records: z.array(z.object({ recordId: z.string(), recordHash: z.string().regex(/^[a-f0-9]{64}$/), value: z.unknown() })),
      storeHash: z.string().regex(/^[a-f0-9]{64}$/), warnings: z.array(z.string()),
    })),
  })), shellPreferences: z.array(z.object({ key: z.string(), value: z.unknown(), source: z.string() })), binaryAssets: z.array(z.unknown()) }),
  manifest: z.object({ moduleCounts: z.array(z.unknown()), totalStoreCount: z.number().int(), totalRecordCount: z.number().int(), totalBinaryAssetCount: z.number().int(), payloadByteLength: z.number().int(), excludedCategories: z.array(z.string()), selectedModules: z.array(z.string()).optional(), humanSummary: z.string().optional() }),
  integrity: z.object({ algorithm: z.literal("SHA-256"), payloadSha256: z.string().regex(/^[a-f0-9]{64}$/), canonicalSerializerVersion: z.number().int().positive() }),
  warnings: z.array(z.string()).optional(),
}).strict();
export type BackupEnvelope = z.infer<typeof envelopeSchema>;
export type DataInventory = { supported: boolean; databases: { name: string; version: number; stores: { name: string; count: number; includedByDefault: boolean; media: boolean }[]; warning?: string }[]; unknownDatabaseNames: string[]; storageEstimate?: { usage?: number; quota?: number; persisted: boolean | null }; warnings: string[] };
type Encoded = null | boolean | number | string | Encoded[] | { [key: string]: Encoded };
type RawStore = { databaseName: string; storeId: string; schemaVersion: number; records: { recordId: string; recordHash: string; value: Encoded }[]; storeHash: string; warnings: string[] };

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error ?? Error("IndexedDB request failed.")); });
}
function transactionDone(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onabort = tx.onerror = () => reject(tx.error ?? Error("IndexedDB transaction failed.")); });
}
function sorted(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(sorted).join(",")}]`;
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${sorted((value as Record<string, unknown>)[key])}`).join(",")}}`;
}
async function digest(value: unknown): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) throw Error("SHA-256 is unavailable in this browser context. Use a secure browser context and retry.");
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(sorted(value)));
  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function encode(value: unknown): Promise<Encoded> {
  if (value === null || typeof value === "string" || typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "undefined") return { $type: "Undefined" };
  if (typeof value === "bigint") return { $type: "BigInt", value: value.toString() };
  if (value instanceof Date) return { $type: "Date", value: value.toISOString() };
  if (value instanceof Blob) return { $type: "Blob", mime: value.type, bytes: [...new Uint8Array(await value.arrayBuffer())] };
  if (value instanceof ArrayBuffer) return { $type: "ArrayBuffer", bytes: [...new Uint8Array(value)] };
  if (ArrayBuffer.isView(value)) return { $type: value.constructor.name, bytes: [...new Uint8Array(value.buffer, value.byteOffset, value.byteLength)] };
  if (value instanceof Map) return { $type: "Map", entries: await Promise.all([...value].map(async ([k, v]) => [await encode(k), await encode(v)])) };
  if (value instanceof Set) return { $type: "Set", values: await Promise.all([...value].map(encode)) };
  if (Array.isArray(value)) return Promise.all(value.map(encode));
  if (typeof value === "object") return Object.fromEntries(await Promise.all(Object.entries(value).map(async ([key, item]) => [key, await encode(item)])));
  throw Error(`Unsupported record value type: ${typeof value}`);
}
function decode(value: Encoded): unknown {
  if (Array.isArray(value)) return value.map(decode);
  if (!value || typeof value !== "object") return value;
  const object = value as Record<string, Encoded>, type = object.$type;
  if (type === "Undefined") return undefined;
  if (type === "BigInt") return BigInt(String(object.value));
  if (type === "Date") return new Date(String(object.value));
  if (type === "Blob") return new Blob([new Uint8Array((object.bytes as number[]).map(Number))], { type: String(object.mime) });
  if (type === "ArrayBuffer") return new Uint8Array((object.bytes as number[]).map(Number)).buffer;
  if (type === "Map") return new Map((object.entries as Encoded[][]).map(([key, item]) => [decode(key!), decode(item!)]));
  if (type === "Set") return new Set((object.values as Encoded[]).map(decode));
  if (typeof type === "string" && type.endsWith("Array")) {
    const bytes = new Uint8Array((object.bytes as number[]).map(Number));
    const constructors: Record<string, (buffer: ArrayBuffer) => ArrayBufferView> = { Uint8Array: (b) => new Uint8Array(b), Int8Array: (b) => new Int8Array(b), Uint16Array: (b) => new Uint16Array(b), Int16Array: (b) => new Int16Array(b), Uint32Array: (b) => new Uint32Array(b), Int32Array: (b) => new Int32Array(b), Float32Array: (b) => new Float32Array(b), Float64Array: (b) => new Float64Array(b), BigInt64Array: (b) => new BigInt64Array(b), BigUint64Array: (b) => new BigUint64Array(b) };
    if (constructors[type]) return constructors[type]!(bytes.buffer);
    return bytes;
  }
  return Object.fromEntries(Object.entries(object).filter(([key]) => key !== "$type").map(([key, item]) => [key, decode(item)]));
}
function keyFromValue(keyPath: string | string[] | null, value: unknown): IDBValidKey | undefined {
  if (!keyPath || !value || typeof value !== "object") return undefined;
  const row = value as Record<string, unknown>;
  const readPath = (path: string): unknown => path.split(".").reduce<unknown>((item, part) => item && typeof item === "object" ? (item as Record<string, unknown>)[part] : undefined, row);
  const key = Array.isArray(keyPath) ? keyPath.map(readPath) : readPath(keyPath);
  if (Array.isArray(key)) return key.every((item) => item !== undefined) ? key as IDBValidKey[] : undefined;
  return key === undefined ? undefined : key as IDBValidKey;
}
function moduleFor(databaseName: string, storeName: string): string {
  if (databaseName === "fitness-os-recipes-meal-plans") return "phase_11";
  if (databaseName === "fitness-os-diet-planning") return "phase_09";
  if (databaseName === "fitness-os-recovery-sleep-mobility") return "phase_12";
  if (databaseName === "fitness-os-cardio-conditioning") return "phase_13";
  if (databaseName === "fitness-os-supplements-evidence") return "phase_14";
  if (databaseName === "fitness-os-local") return "phase_06";
  if (/phase16/i.test(storeName)) return "phase_16";
  if (/progress|phase15|dashboardLayouts|metricCalculation|derivedAnalytics/i.test(storeName)) return "phase_15";
  if (/nutrition|foodLog|hydration|customFood/i.test(storeName)) return "phase_10";
  if (/diet/i.test(storeName)) return "phase_09";
  if (/workout|program|Exercise|activeTimer|PersonalRecord|appMeta/i.test(storeName)) return "phase_06";
  return "phase_17";
}
function idFrom(value: Encoded, fallback: string): string {
  if (value && !Array.isArray(value) && typeof value === "object") {
    const row = value as Record<string, Encoded>;
    for (const key of ["id", "key", "localDate", "sessionId", "instanceId", "programInstanceId", "blobKey", "cacheKey"]) if (row[key] !== undefined) return String(row[key]);
  }
  return fallback;
}
function findEncodedBlobs(value: Encoded): { mime: string; bytes: number[] }[] {
  if (Array.isArray(value)) return value.flatMap(findEncodedBlobs);
  if (!value || typeof value !== "object") return [];
  if (value.$type === "Blob") return [{ mime: String(value.mime), bytes: (value.bytes as number[]).map(Number) }];
  return Object.values(value).flatMap(findEncodedBlobs);
}
async function readDatabase(name: string, version: number, fullMedia = false): Promise<{ version: number; stores: RawStore[] }> {
  const db = name === "fitness-os" ? await openFitnessDatabase("fitness-os", { shared: false }) : await openExistingDatabase(name, version);
  try {
    const stores: RawStore[] = [];
    for (const storeId of [...db.objectStoreNames]) {
      const tx = db.transaction(storeId, "readonly"), rows = await request(tx.objectStore(storeId).getAll());
      await transactionDone(tx);
      const include = !ephemeralStores.has(storeId) && (!mediaStores.has(storeId) || fullMedia);
      const records = include ? await Promise.all((rows as unknown[]).map(async (row, index) => {
        const value = await encode(row), recordId = idFrom(value, `${storeId}:${index}`);
        return { recordId, value, recordHash: await digest(value) };
      })) : [];
      const body = records.map(({ recordId, value, recordHash }) => ({ recordId, value, recordHash }));
      if (include) stores.push({ databaseName: name, storeId, schemaVersion: db.version, records, storeHash: await digest(body), warnings: mediaStores.has(storeId) ? ["contains_binary_media"] : [] });
    }
    return { version: db.version, stores };
  } finally { db.close(); }
}
function openExistingDatabase(name: string, version: number): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB) return Promise.reject(Error("Browser IndexedDB is unavailable."));
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(name, version);
    req.onupgradeneeded = () => { req.transaction?.abort(); reject(Error(`Database ${name} is newer than the backup target and cannot be opened for restore.`)); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? Error(`Could not open ${name}.`));
    req.onblocked = () => reject(Error(`Close other tabs before accessing ${name}.`));
  });
}
async function existingDatabaseInfos(): Promise<{ name: string; version: number }[]> {
  if (typeof window === "undefined" || !window.indexedDB) return [];
  if (typeof window.indexedDB.databases === "function") {
    const infos = await window.indexedDB.databases();
    return infos.filter((info): info is IDBDatabaseInfo & { name: string; version: number } => typeof info.name === "string" && typeof info.version === "number").map(({ name, version }) => ({ name, version }));
  }
  const found: { name: string; version: number }[] = [];
  for (const name of appDatabaseNames) {
    try { const db = await openKnownWithoutUpgrade(name); found.push({ name, version: db.version }); db.close(); } catch { /* Browsers without database enumeration cannot distinguish a missing database safely. */ }
  }
  return found;
}
function openKnownWithoutUpgrade(name: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => { const req = window.indexedDB.open(name); req.onupgradeneeded = () => { req.transaction?.abort(); reject(Error("Database does not exist.")); }; req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error ?? Error("Database not available.")); });
}
export async function inspectLocalData(): Promise<DataInventory> {
  if (typeof window === "undefined" || !window.indexedDB) return { supported: false, databases: [], unknownDatabaseNames: [], warnings: ["IndexedDB is unavailable in this browser context."] };
  const warnings: string[] = [], infos = await existingDatabaseInfos(), databases: DataInventory["databases"] = [];
  for (const info of infos) {
    if (!appDatabaseNames.includes(info.name as AppDatabaseName)) continue;
    try {
      const db = info.name === "fitness-os" ? await openFitnessDatabase("fitness-os", { shared: false }) : await openExistingDatabase(info.name, info.version);
      try { databases.push({ name: info.name, version: db.version, stores: await Promise.all([...db.objectStoreNames].map(async (name) => { const tx = db.transaction(name, "readonly"), count = await request(tx.objectStore(name).count()); return { name, count, includedByDefault: !ephemeralStores.has(name) && !mediaStores.has(name), media: mediaStores.has(name) }; })) }); } finally { db.close(); }
    } catch (error) { const message = error instanceof Error ? error.message : "Database inspection failed."; warnings.push(`${info.name}: ${message}`); databases.push({ name: info.name, version: info.version, stores: [], warning: message }); }
  }
  let storageEstimate: DataInventory["storageEstimate"];
  try { const estimate = await navigator.storage?.estimate(); const persisted = await navigator.storage?.persisted?.(); storageEstimate = { usage: estimate?.usage, quota: estimate?.quota, persisted: persisted ?? null }; } catch { warnings.push("Storage estimates are unavailable in this browser."); }
  const unknownDatabaseNames = infos.map((info) => info.name).filter((name) => !appDatabaseNames.includes(name as AppDatabaseName));
  return { supported: true, databases, unknownDatabaseNames, storageEstimate, warnings };
}
export async function requestPersistentStorage(): Promise<boolean | null> {
  if (typeof navigator === "undefined" || !navigator.storage?.persist) return null;
  return navigator.storage.persist();
}
export async function createBackup(options: { selectedDatabases?: string[]; fullMedia?: boolean; gzip?: boolean } = {}): Promise<BackupEnvelope> {
  const infos = await existingDatabaseInfos(), chosen = infos.filter((info) => appDatabaseNames.includes(info.name as AppDatabaseName) && (!options.selectedDatabases || options.selectedDatabases.includes(info.name)));
  if (!chosen.length) throw Error("No Fitness OS local databases were found in this browser profile.");
  const raw = await Promise.all(chosen.map((info) => readDatabase(info.name, info.version, options.fullMedia)));
  const rows = raw.flatMap((item) => item.stores);
  const modulesMap = new Map<string, typeof rows>();
  for (const store of rows) { const moduleId = moduleFor(store.databaseName, store.storeId), current = modulesMap.get(moduleId) ?? []; current.push(store); modulesMap.set(moduleId, current); }
  const modules = [...modulesMap].map(([moduleId, stores]) => ({ moduleId, moduleSchemaVersion: 1, stores: stores.map(({ databaseName, storeId, schemaVersion, records, storeHash, warnings }) => ({ databaseName, storeId, schemaVersion, recordCount: records.length, records, storeHash, warnings })) }));
  const shellPreferences = shellKeys.flatMap((key) => { try { const value = window.localStorage.getItem(key); return value === null ? [] : [{ key, value, source: "localStorage_preference" }]; } catch { return []; } });
  const binaryAssets: Record<string, unknown>[] = [];
  if (options.fullMedia) for (const module of modules) for (const store of module.stores) for (const record of store.records) {
    const blobs = findEncodedBlobs(record.value);
    for (const [index, blob] of blobs.entries()) binaryAssets.push({ assetId: `${module.moduleId}:${record.recordId}:${index}`, moduleId: module.moduleId, recordId: record.recordId, mediaType: blob.mime, byteLength: blob.bytes.length, sha256: await digest(blob.bytes), included: true, archivePath: `payload.modules.${module.moduleId}.${store.storeId}.${record.recordId}` });
  }
  const payload = { modules, shellPreferences, binaryAssets };
  const payloadText = sorted(payload), totalStores = rows.filter((store) => !ephemeralStores.has(store.storeId) && !mediaStores.has(store.storeId)), recordCount = totalStores.reduce((sum, store) => sum + store.records.length, 0);
  const moduleCounts = modules.map((module) => ({ moduleId: module.moduleId, storeCount: module.stores.length, recordCount: module.stores.reduce((sum, store) => sum + store.recordCount, 0), binaryAssetCount: binaryAssets.filter((asset) => asset.moduleId === module.moduleId).length }));
  const envelope = { format: "fitness-os-backup" as const, formatVersion: 1, backupId: `backup_${crypto.randomUUID()}`, createdAt: new Date().toISOString(), appVersion: "0.1.0", registryVersion: 1, profile: options.gzip ? "portable_gzip" as const : options.fullMedia ? "full_with_media" as const : options.selectedDatabases ? "selected_modules" as const : "portable" as const, payload, manifest: { moduleCounts, totalStoreCount: totalStores.length, totalRecordCount: recordCount, totalBinaryAssetCount: binaryAssets.length, payloadByteLength: new TextEncoder().encode(payloadText).byteLength, excludedCategories: ["ephemeral_timers", "derived_caches", ...(options.fullMedia ? [] : ["binary_media"]), "active_workout_pointer", "session_storage"], ...(options.selectedDatabases ? { selectedModules: options.selectedDatabases } : {}), humanSummary: `${recordCount} records across ${totalStores.length} stores in ${chosen.length} local databases.` }, integrity: { algorithm: "SHA-256" as const, payloadSha256: await digest(payload), canonicalSerializerVersion: 1 }, warnings: ["Integrity hashes detect accidental corruption; this backup is not encrypted or authenticated.", ...shellPreferences.map((pref) => `included_preference:${pref.key}`)] };
  return envelopeSchema.parse(envelope);
}
export function validateBackup(input: unknown): { backup: BackupEnvelope; errors: string[]; warnings: string[] } {
  const parsed = envelopeSchema.safeParse(input);
  if (!parsed.success) return { backup: undefined as unknown as BackupEnvelope, errors: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`), warnings: [] };
  const backup = parsed.data, warnings = [...(backup.warnings ?? [])], errors: string[] = [];
  if (backup.formatVersion > 1) errors.push("This backup uses a newer format version and cannot be restored safely.");
  const canonicalPayload = sorted(backup.payload);
  void canonicalPayload;
  return { backup, errors, warnings };
}
export async function previewBackup(input: unknown) {
  const result = validateBackup(input);
  if (result.errors.length) return { ...result, conflicts: [], writes: 0 };
  const errors: string[] = [], conflicts: { databaseName: string; storeId: string; incoming: number; existing: number }[] = [];
  const payload = result.backup.payload;
  if (await digest(payload) !== result.backup.integrity.payloadSha256) errors.push("Backup payload hash does not match. No local data was changed.");
  const opened = new Map<string, IDBDatabase>();
  try {
  for (const module of payload.modules) for (const store of module.stores) {
    if (!appDatabaseNames.includes(store.databaseName as AppDatabaseName)) { errors.push(`Unrecognized target database: ${store.databaseName}.`); continue; }
    if (await digest(store.records.map(({ recordId, value, recordHash }) => ({ recordId, value, recordHash }))) !== store.storeHash) errors.push(`Store integrity check failed: ${store.databaseName}/${store.storeId}.`);
    for (const record of store.records) if (await digest(record.value) !== record.recordHash) errors.push(`Record integrity check failed: ${store.databaseName}/${store.storeId}/${record.recordId}.`);
    try {
      let db = opened.get(store.databaseName);
      if (!db) { db = store.databaseName === "fitness-os" ? await openFitnessDatabase("fitness-os", { shared: false }) : await openExistingDatabase(store.databaseName, store.schemaVersion); opened.set(store.databaseName, db); }
      if (!db.objectStoreNames.contains(store.storeId)) errors.push(`Target store is missing: ${store.databaseName}/${store.storeId}.`);
      else {
        const tx = db.transaction(store.storeId, "readonly"), objectStore = tx.objectStore(store.storeId), count = await request(objectStore.count()), incomingKeys = new Set<string>();
        for (const record of store.records) {
          const key = keyFromValue(objectStore.keyPath, decode(record.value as Encoded));
          if (key === undefined) { errors.push(`Record key is missing for ${store.databaseName}/${store.storeId}/${record.recordId}.`); continue; }
          const canonicalKey = sorted(key);
          if (incomingKeys.has(canonicalKey)) errors.push(`Duplicate primary key in ${store.databaseName}/${store.storeId}: ${record.recordId}.`);
          incomingKeys.add(canonicalKey);
        }
        conflicts.push({ databaseName: store.databaseName, storeId: store.storeId, incoming: store.recordCount, existing: count });
      }

    } catch { errors.push(`Target database is unavailable: ${store.databaseName}. Create or restore it in the owning module before importing this archive.`); }
  }
  } finally { for (const db of opened.values()) db.close(); }
  return { backup: result.backup, errors, warnings: result.warnings, conflicts, writes: 0 };
}
async function restoreBackupUnlocked(input: unknown, mode: "keep-existing" | "replace", selectedStores?: string[]) {
  const preview = await previewBackup(input);
  if (preview.errors.length) throw Error(preview.errors.join(" "));
  const dbs = [...new Set(preview.backup.payload.modules.flatMap((module) => module.stores.map((store) => store.databaseName)))], allStores = preview.backup.payload.modules.flatMap((module) => module.stores).filter((store) => !selectedStores || selectedStores.includes(`${store.databaseName}/${store.storeId}`));
  const rollbackSnapshots = await Promise.all(dbs.map(async (name) => {
    const info = (await existingDatabaseInfos()).find((item) => item.name === name); if (!info) throw Error(`Database ${name} is no longer available.`);
    const db = name === "fitness-os" ? await openFitnessDatabase("fitness-os", { shared: false }) : await openExistingDatabase(name, info.version);
    try {
      const stores = allStores.filter((store) => store.databaseName === name);
      return await Promise.all(stores.map(async (store) => {
        const tx = db.transaction(store.storeId, "readonly"), records = await request(tx.objectStore(store.storeId).getAll()); await transactionDone(tx);
        return { databaseName: name, storeId: store.storeId, records };
      }));
    } finally { db.close(); }
  }));
  const shellPreferenceSnapshots = shellKeys.map((key) => ({ key, value: window.localStorage.getItem(key) }));
  const journal = { id: `restore_${crypto.randomUUID()}`, status: "running", startedAt: new Date().toISOString(), mode, completedDatabases: [] as string[], currentDatabase: "", backup: preview.backup, selectedStores: selectedStores ?? null, rollbackSnapshots: rollbackSnapshots.flat(), shellPreferenceSnapshots };
  const controlDb = await openFitnessDatabase("fitness-os", { shared: false });
  const startTx = controlDb.transaction("phase17RestoreJournal", "readwrite"); startTx.objectStore("phase17RestoreJournal").put(journal); await transactionDone(startTx); controlDb.close();
  try {
    for (const name of dbs) {
      journal.currentDatabase = name;
      const stores = preview.backup.payload.modules.flatMap((module) => module.stores).filter((store) => store.databaseName === name && (!selectedStores || selectedStores.includes(`${name}/${store.storeId}`)));
      if (!stores.length) { journal.completedDatabases.push(name); continue; }
      const info = (await existingDatabaseInfos()).find((item) => item.name === name); if (!info) throw Error(`Database ${name} is no longer available.`);
      const db = name === "fitness-os" ? await openFitnessDatabase("fitness-os", { shared: false }) : await openExistingDatabase(name, info.version);
      const tx = db.transaction(stores.map((store) => store.storeId), "readwrite");
      for (const store of stores) {
        const target = tx.objectStore(store.storeId);
        if (mode === "replace") target.clear();
        for (const row of store.records) {
          const value = decode(row.value as Encoded);
          if (mode === "keep-existing") {
            const key = keyFromValue(target.keyPath, value);
            if (key === undefined || await request(target.get(key)) === undefined) target.put(value);
          } else target.put(value);
        }
      }
      await transactionDone(tx); db.close(); journal.completedDatabases.push(name);
      const updateDb = await openFitnessDatabase("fitness-os", { shared: false }), update = updateDb.transaction("phase17RestoreJournal", "readwrite"); update.objectStore("phase17RestoreJournal").put({ ...journal, currentDatabase: "" }); await transactionDone(update); updateDb.close();
    }
    for (const preference of preview.backup.payload.shellPreferences) window.localStorage.setItem(preference.key, typeof preference.value === "string" ? preference.value : JSON.stringify(preference.value));
    const db = await openFitnessDatabase("fitness-os", { shared: false }), tx = db.transaction(["phase17RestoreJournal", "phase17AuditEvents"], "readwrite"); tx.objectStore("phase17RestoreJournal").delete(journal.id); tx.objectStore("phase17AuditEvents").put({ id: `audit_${crypto.randomUUID()}`, eventType: "restore_completed", occurredAt: new Date().toISOString(), details: { mode, backupId: preview.backup.backupId, databases: dbs.length } }); await transactionDone(tx); db.close();
    return { databases: dbs.length, records: preview.backup.manifest.totalRecordCount };
  } catch (error) {
    try { const db = await openFitnessDatabase("fitness-os", { shared: false }), tx = db.transaction("phase17RestoreJournal", "readwrite"); tx.objectStore("phase17RestoreJournal").put({ ...journal, status: "blocked", error: error instanceof Error ? error.message : "Restore failed", updatedAt: new Date().toISOString() }); await transactionDone(tx); db.close(); } catch { /* journal remains in its previous durable state */ }
    throw Error(`Restore is blocked after ${journal.completedDatabases.length} database(s). Existing writes remain recoverable; resume or roll back from Data health. ${error instanceof Error ? error.message : "Restore failed."}`, { cause: error });
  }
}
export async function restoreBackup(input: unknown, mode: "keep-existing" | "replace", selectedStores?: string[]) {
  if (typeof navigator !== "undefined" && navigator.locks) return navigator.locks.request("fitness-os-data-restore", { mode: "exclusive", ifAvailable: true }, async (lock) => {
    if (!lock) throw Error("A restore is already running in another Fitness OS tab. Wait for it to finish, then retry.");
    return restoreBackupUnlocked(input, mode, selectedStores);
  });
  if (typeof window === "undefined") throw Error("Restore is only available in a browser tab.");
  const lockKey = "fitness-os:restore-lock:v1", owner = crypto.randomUUID(), now = Date.now();
  try {
    const current = window.localStorage.getItem(lockKey);
    if (current) { const value: unknown = JSON.parse(current); if (value && typeof value === "object" && Number((value as { expiresAt?: unknown }).expiresAt) > now) throw Error("A restore is already running in another Fitness OS tab. Wait for it to finish, then retry."); }
    window.localStorage.setItem(lockKey, JSON.stringify({ owner, expiresAt: now + 30 * 60 * 1000 }));
    const written: unknown = JSON.parse(window.localStorage.getItem(lockKey) ?? "null");
    if (!written || typeof written !== "object" || (written as { owner?: unknown }).owner !== owner) throw Error("Could not acquire the cross-tab restore lock. No data was changed.");
  } catch (error) { throw error instanceof Error ? error : Error("Could not access the cross-tab restore lock. No data was changed.", { cause: error }); }
  try { return await restoreBackupUnlocked(input, mode, selectedStores); }
  finally { try { const current: unknown = JSON.parse(window.localStorage.getItem(lockKey) ?? "null"); if (current && typeof current === "object" && (current as { owner?: unknown }).owner === owner) window.localStorage.removeItem(lockKey); } catch { /* Keep the expiring lock if storage becomes unavailable. */ } }
}
async function pendingJournal(id: string) {
  const db = await openFitnessDatabase("fitness-os", { shared: false }), tx = db.transaction("phase17RestoreJournal", "readonly"), row = await request(tx.objectStore("phase17RestoreJournal").get(id)) as ({ backup?: unknown; mode?: unknown; selectedStores?: unknown; rollbackSnapshots?: { databaseName: string; storeId: string; records: unknown[] }[] } & Record<string, unknown>) | undefined;
  await transactionDone(tx); db.close(); if (!row) throw Error("The pending restore journal was not found."); return row;
}
export async function resumeRestore(id: string) {
  const journal = await pendingJournal(id);
  if (!journal.backup || (journal.mode !== "keep-existing" && journal.mode !== "replace")) throw Error("This restore journal does not contain a resumable validated archive.");
  const result = await restoreBackup(journal.backup, journal.mode, Array.isArray(journal.selectedStores) ? journal.selectedStores.filter((item): item is string => typeof item === "string") : undefined);
  const db = await openFitnessDatabase("fitness-os", { shared: false }), tx = db.transaction(["phase17RestoreJournal", "phase17AuditEvents"], "readwrite"); tx.objectStore("phase17RestoreJournal").delete(id); tx.objectStore("phase17AuditEvents").put({ id: `audit_${crypto.randomUUID()}`, eventType: "restore_resumed", occurredAt: new Date().toISOString(), details: { journalId: id } }); await transactionDone(tx); db.close(); return result;
}
async function rollbackRestoreUnlocked(id: string) {
  const journal = await pendingJournal(id), snapshots = journal.rollbackSnapshots ?? [];
  const names = [...new Set(snapshots.map((snapshot) => snapshot.databaseName))];
  for (const name of names) {
    const info = (await existingDatabaseInfos()).find((item) => item.name === name); if (!info) throw Error(`Database ${name} is unavailable; rollback remains blocked and journaled.`);
    const selected = snapshots.filter((snapshot) => snapshot.databaseName === name), db = name === "fitness-os" ? await openFitnessDatabase("fitness-os", { shared: false }) : await openExistingDatabase(name, info.version), tx = db.transaction(selected.map((snapshot) => snapshot.storeId), "readwrite");
    for (const snapshot of selected) { const store = tx.objectStore(snapshot.storeId); store.clear(); for (const record of snapshot.records) store.put(record); }
    await transactionDone(tx); db.close();
  }
  for (const preference of (journal.shellPreferenceSnapshots ?? []) as { key: string; value: string | null }[]) { if (preference.value === null) window.localStorage.removeItem(preference.key); else window.localStorage.setItem(preference.key, preference.value); }
  const db = await openFitnessDatabase("fitness-os", { shared: false }), tx = db.transaction(["phase17RestoreJournal", "phase17AuditEvents"], "readwrite"); tx.objectStore("phase17RestoreJournal").delete(id); tx.objectStore("phase17AuditEvents").put({ id: `audit_${crypto.randomUUID()}`, eventType: "restore_rolled_back", occurredAt: new Date().toISOString(), details: { journalId: id, databases: names.length } }); await transactionDone(tx); db.close(); return { databases: names.length };
}
export async function rollbackRestore(id: string) {
  if (typeof navigator !== "undefined" && navigator.locks) return navigator.locks.request("fitness-os-data-restore", { mode: "exclusive", ifAvailable: true }, async (lock) => { if (!lock) throw Error("Another data restore operation is running in a different tab."); return rollbackRestoreUnlocked(id); });
  if (typeof window === "undefined") throw Error("Restore rollback is only available in a browser tab.");
  const lockKey = "fitness-os:restore-lock:v1", owner = crypto.randomUUID(), now = Date.now();
  try {
    const current: unknown = JSON.parse(window.localStorage.getItem(lockKey) ?? "null");
    if (current && typeof current === "object" && Number((current as { expiresAt?: unknown }).expiresAt) > now) throw Error("Another data restore operation is running in a different tab.");
    window.localStorage.setItem(lockKey, JSON.stringify({ owner, expiresAt: now + 30 * 60 * 1000 }));
    const check: unknown = JSON.parse(window.localStorage.getItem(lockKey) ?? "null");
    if (!check || typeof check !== "object" || (check as { owner?: unknown }).owner !== owner) throw Error("Could not acquire the cross-tab restore lock.");
  } catch (error) { throw error instanceof Error ? error : Error("Could not access the cross-tab restore lock.", { cause: error }); }
  try { return await rollbackRestoreUnlocked(id); }
  finally { try { const check: unknown = JSON.parse(window.localStorage.getItem(lockKey) ?? "null"); if (check && typeof check === "object" && (check as { owner?: unknown }).owner === owner) window.localStorage.removeItem(lockKey); } catch { /* leave expiring lease for another tab to recover */ } }
}
export async function recordBackupReceipt(backup: BackupEnvelope, method: "file-picker") {
  const db = await openFitnessDatabase("fitness-os", { shared: false }), tx = db.transaction(["phase17BackupReceipts", "phase17AuditEvents"], "readwrite"), id = backup.backupId, createdAt = new Date().toISOString();
  tx.objectStore("phase17BackupReceipts").put({ id, createdAt, profile: backup.profile, recordCount: backup.manifest.totalRecordCount, storeCount: backup.manifest.totalStoreCount, payloadSha256: backup.integrity.payloadSha256, delivery: method });
  tx.objectStore("phase17AuditEvents").put({ id: `audit_${crypto.randomUUID()}`, eventType: "backup_saved", occurredAt: createdAt, details: { backupId: id, profile: backup.profile } });
  await transactionDone(tx); db.close();
}
export function safeCsvCell(value: unknown, mode: "safe" | "raw" = "safe"): string {
  let text = typeof value === "string" ? value : value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  if (mode === "safe" && /^[\s]*[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function encodeCsv(rows: readonly Record<string, unknown>[], mode: "safe" | "raw" = "safe"): string {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return [columns.map((column) => safeCsvCell(column, mode)).join(","), ...rows.map((row) => columns.map((column) => safeCsvCell(row[column], mode)).join(","))].join("\r\n");
}
export async function readDataHistory() {
  const db = await openFitnessDatabase("fitness-os", { shared: false }), names = ["phase17BackupReceipts", "phase17AuditEvents", "phase17RestoreJournal"], tx = db.transaction(names, "readonly");
  const result = await Promise.all(names.map(async (name) => [name, await request(tx.objectStore(name).getAll())] as const)); await transactionDone(tx); db.close();
  return Object.fromEntries(result) as Record<string, Record<string, unknown>[]>;
}
export async function clearLocalData(confirmText: string) {
  if (confirmText !== "CLEAR LOCAL DATA") throw Error("Type CLEAR LOCAL DATA exactly to continue.");
  const infos = await existingDatabaseInfos().catch(() => []);
  const removed: string[] = [];
  for (const { name } of infos) if (appDatabaseNames.includes(name as AppDatabaseName)) await new Promise<void>((resolve, reject) => {
    const req = window.indexedDB.deleteDatabase(name); req.onsuccess = () => { removed.push(name); resolve(); }; req.onerror = () => reject(req.error ?? Error(`Could not clear ${name}.`)); req.onblocked = () => reject(Error(`Close other tabs before clearing ${name}; no further databases were changed.`));
  });
  for (const key of shellKeys) window.localStorage.removeItem(key);
  window.localStorage.removeItem("fitness-os:active-workout:v1");
  window.sessionStorage.removeItem("fitness-os-cardio-owner");
  return removed;
}
export async function downloadBackup(backup: BackupEnvelope): Promise<"saved" | "download-started"> {
  const content = JSON.stringify(backup, null, 2), compressed = backup.profile === "portable_gzip";
  let blob = new Blob([content], { type: "application/json" });
  if (compressed) {
    if (typeof CompressionStream === "undefined") throw Error("Gzip compression is unavailable in this browser. Choose an uncompressed backup.");
    blob = await new Response(blob.stream().pipeThrough(new CompressionStream("gzip"))).blob();
  }
  const filename = `fitness-os-backup-${backup.createdAt.slice(0, 10)}.json${compressed ? ".gz" : ""}`;
  const picker = (window as Window & { showSaveFilePicker?: (options: { suggestedName: string; types: { description: string; accept: Record<string, string[]> }[] }) => Promise<{ createWritable(): Promise<{ write(data: Blob): Promise<void>; close(): Promise<void> }> }> }).showSaveFilePicker;
  if (picker) return picker({ suggestedName: filename, types: [{ description: compressed ? "Fitness OS compressed backup" : "Fitness OS backup", accept: { [compressed ? "application/gzip" : "application/json"]: [compressed ? ".gz" : ".json"] } }] }).then(async (handle) => { const writer = await handle.createWritable(); await writer.write(blob); await writer.close(); return "saved" as const; });
  const url = URL.createObjectURL(blob), anchor = document.createElement("a"); anchor.href = url; anchor.download = filename; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); return "download-started";
}
