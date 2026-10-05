import { openFitnessDatabase } from "../../storage/indexed-db/fitness-database";
import { phase15StoreNames, weightLogSchema, circumferenceSchema, compositionSchema, photoSchema, heightSchema, goalSchema, nutritionReviewSchema, layoutSchema, receiptSchema, auditEventSchema, deletedRecordSchema, settingSchema, importConflictSchema } from "./schema";
import { median } from "./domain";

const privateStores = phase15StoreNames.filter((name) => !["progressPhotoBlobs", "derivedAnalyticsCache", "phase15Settings", "phase15AuditEvents", "phase15DeletedRecords", "phase15ImportConflicts"].includes(name));
const recordSchemas = {
  bodyWeightLogs: weightLogSchema, circumferenceSessions: circumferenceSchema, bodyCompositionMeasurements: compositionSchema,
  progressPhotos: photoSchema, heightMeasurements: heightSchema, progressGoals: goalSchema, nutritionDayReviews: nutritionReviewSchema,
  dashboardLayouts: layoutSchema, metricCalculationReceipts: receiptSchema,
} as const;
const requestValue = <T>(request: IDBRequest<T>) => new Promise<T>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error ?? Error("IndexedDB request failed")); });
const transactionDone = (tx: IDBTransaction) => new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onabort = tx.onerror = () => reject(tx.error ?? Error("Local save failed; existing records remain.")); });
export async function saveProgressRecord(storeName: keyof typeof recordSchemas, value: unknown) {
  const parsed = recordSchemas[storeName].safeParse(value);
  if (!parsed.success) throw Error(parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; "));
  const db = await openFitnessDatabase(), tx = db.transaction([storeName, "phase15AuditEvents"], "readwrite"), occurredAt = new Date().toISOString();
  tx.objectStore(storeName).put(parsed.data);
  tx.objectStore("phase15AuditEvents").put({ id: crypto.randomUUID(), eventType: "record_saved", entityType: storeName, entityId: parsed.data.id, occurredAt, details: {} });
  await transactionDone(tx);
  return parsed.data;
}
export async function readProgressStore<T>(storeName: string): Promise<T[]> {
  const db = await openFitnessDatabase();
  if (!db.objectStoreNames.contains(storeName)) throw Error("Phase 15 storage is unavailable; upgrade the application first.");
  return requestValue(db.transaction(storeName, "readonly").objectStore(storeName).getAll()) as Promise<T[]>;
}
export async function readProgressOverview() {
  const names = ["bodyWeightLogs", "circumferenceSessions", "bodyCompositionMeasurements", "progressPhotos", "heightMeasurements", "progressGoals", "nutritionDayReviews", "dashboardLayouts", "metricCalculationReceipts", "phase15Settings", "phase15AuditEvents"] as const;
  const entries = await Promise.all(names.map(async (name) => [name, await readProgressStore(name)] as const));
  return Object.fromEntries(entries) as Record<(typeof names)[number], Record<string, unknown>[]>;
}
export async function deleteProgressRecord(entityType: string, entityId: string, now = new Date()) {
  const allowed = new Set(["bodyWeightLogs", "circumferenceSessions", "bodyCompositionMeasurements", "progressPhotos", "heightMeasurements", "progressGoals", "nutritionDayReviews"]);
  if (!allowed.has(entityType)) throw Error("This record type cannot be deleted here.");
  const db = await openFitnessDatabase(), tx = db.transaction([entityType, "phase15DeletedRecords", "phase15AuditEvents"], "readwrite"), store = tx.objectStore(entityType), old = await requestValue(store.get(entityId));
  if (!old) { tx.abort(); throw Error("Record was not found."); }
  const deletedAt = now.toISOString(), record = old as Record<string, unknown>;
  store.put({ ...record, deletedAt, updatedAt: deletedAt });
  tx.objectStore("phase15DeletedRecords").put({ entityType, entityId, deletedAt, undoUntil: new Date(now.getTime() + 30_000).toISOString(), snapshot: record });
  tx.objectStore("phase15AuditEvents").put({ id: crypto.randomUUID(), eventType: "record_deleted", entityType, entityId, occurredAt: deletedAt, details: { undoWindowSeconds: 30 } });
  await transactionDone(tx);
}
export async function undoProgressDelete(entityType: string, entityId: string, now = new Date()) {
  const db = await openFitnessDatabase(), tx = db.transaction([entityType, "phase15DeletedRecords"], "readwrite"), tombs = tx.objectStore("phase15DeletedRecords"), tomb = await requestValue(tombs.get([entityType, entityId])) as { undoUntil: string; snapshot: Record<string, unknown> } | undefined;
  if (!tomb || Date.parse(tomb.undoUntil) < now.getTime()) { tx.abort(); throw Error("Undo is no longer available."); }
  tx.objectStore(entityType).put({ ...tomb.snapshot, deletedAt: null, updatedAt: now.toISOString() }); tombs.delete([entityType, entityId]); await transactionDone(tx);
}
export async function finalizeProgressDelete(entityType: string, entityId: string, now = new Date()) {
  const db = await openFitnessDatabase(), tx = db.transaction(["phase15DeletedRecords", "progressPhotoBlobs"], "readwrite"), store = tx.objectStore("phase15DeletedRecords"), tomb = await requestValue(store.get([entityType, entityId])) as { undoUntil: string; snapshot?: Record<string, unknown> } | undefined;
  if (tomb && Date.parse(tomb.undoUntil) <= now.getTime()) { if (entityType === "progressPhotos" && typeof tomb.snapshot?.blobKey === "string") tx.objectStore("progressPhotoBlobs").delete(tomb.snapshot.blobKey); store.delete([entityType, entityId]); }
  await transactionDone(tx);
}

const backupVersion = 1;
export async function makeProgressBackup() {
  const db = await openFitnessDatabase(), names = privateStores.filter((name) => db.objectStoreNames.contains(name));
  const tx = db.transaction([...names, "phase15AuditEvents", "phase15DeletedRecords", "phase15Settings", "phase15ImportConflicts"], "readonly");
  const data = await Promise.all(names.map(async (name) => [name, await requestValue(tx.objectStore(name).getAll())] as const));
  const auditEvents = await requestValue(tx.objectStore("phase15AuditEvents").getAll()), deletedRecords = await requestValue(tx.objectStore("phase15DeletedRecords").getAll()), settings = await requestValue(tx.objectStore("phase15Settings").getAll());
  const importConflicts = await requestValue(tx.objectStore("phase15ImportConflicts").getAll());
  return { schemaVersion: backupVersion, moduleId: "fitness-os-phase-15", exportedAt: new Date().toISOString(), ...Object.fromEntries(data), auditEvents, deletedRecords, settings, importConflicts, photoBinariesIncluded: false };
}
const backupArraySchemas = {
  bodyWeightLogs: weightLogSchema, circumferenceSessions: circumferenceSchema, bodyCompositionMeasurements: compositionSchema, progressPhotos: photoSchema, heightMeasurements: heightSchema, progressGoals: goalSchema, nutritionDayReviews: nutritionReviewSchema, dashboardLayouts: layoutSchema, metricCalculationReceipts: receiptSchema,
} as const;
export function validateProgressBackup(input: unknown) {
  if (!input || typeof input !== "object") throw Error("Backup must be an object.");
  const backup = input as Record<string, unknown>;
  if (backup.schemaVersion !== backupVersion || backup.moduleId !== "fitness-os-phase-15") throw Error("Unsupported Phase 15 backup version.");
  if (typeof backup.exportedAt !== "string" || !Number.isFinite(Date.parse(backup.exportedAt))) throw Error("Backup export time is invalid.");
  if (backup.photoBinariesIncluded !== false) throw Error("Photo binary data is not accepted in the JSON backup. Restore images from the separate ZIP archive.");
  const validated: Record<string, unknown[]> = {};
  for (const [name, schema] of Object.entries(backupArraySchemas)) {
    if (!Array.isArray(backup[name])) throw Error(`Backup is missing ${name}.`);
    validated[name] = (backup[name] as unknown[]).map((value, index) => { const parsed = schema.safeParse(value); if (!parsed.success) throw Error(`${name}[${index}] is invalid: ${parsed.error.issues[0]?.message ?? "invalid record"}`); return parsed.data; });
  }
  const extraArrays = { auditEvents: auditEventSchema, deletedRecords: deletedRecordSchema, settings: settingSchema, importConflicts: importConflictSchema } as const;
  for (const [name, schema] of Object.entries(extraArrays)) {
    if (!Array.isArray(backup[name])) throw Error(`Backup is missing ${name}.`);
    validated[name] = (backup[name] as unknown[]).map((value, index) => { const parsed = schema.safeParse(value); if (!parsed.success) throw Error(`${name}[${index}] is invalid: ${parsed.error.issues[0]?.message ?? "invalid record"}`); return parsed.data; });
  }
  return { backup, validated };
}
export async function restoreProgressBackup(input: unknown, mode: "keep_existing" | "import_copy" | "replace") {
  const { validated } = validateProgressBackup(input), db = await openFitnessDatabase(), replaceNames = Object.keys(backupArraySchemas);
  const existing = new Map<string, Set<string>>();
  if (mode === "keep_existing") {
    const read = db.transaction(replaceNames, "readonly");
    for (const name of replaceNames) existing.set(name, new Set(((await requestValue(read.objectStore(name).getAll()) as Record<string, unknown>[]).map((row) => String(row.id)))));
  }
  const tx = db.transaction([...replaceNames, "phase15AuditEvents", "phase15DeletedRecords", "phase15Settings", "phase15ImportConflicts", "progressPhotoBlobs", "derivedAnalyticsCache"], "readwrite");
  if (mode === "replace") { for (const name of [...replaceNames, "phase15AuditEvents", "phase15DeletedRecords", "phase15Settings", "phase15ImportConflicts"]) tx.objectStore(name).clear(); tx.objectStore("progressPhotoBlobs").clear(); }
  for (const name of replaceNames) for (const row of validated[name] ?? []) {
    const record = row as Record<string, unknown>;
    if (mode === "keep_existing" && existing.get(name)?.has(String(record.id))) continue;
    const isPhoto = name === "progressPhotos";
    const value = mode === "import_copy" ? { ...record, id: `${String(record.id ?? "record")}-import-${crypto.randomUUID()}`, ...(isPhoto ? { blobKey: `missing-${crypto.randomUUID()}`, includeBinaryInBackup: false } : {}), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : mode === "replace" && isPhoto ? { ...record, blobKey: `missing-${crypto.randomUUID()}`, includeBinaryInBackup: false } : record;
    const store = tx.objectStore(name);
    store.put(value);
  }
  const extraPairs = [["auditEvents", "phase15AuditEvents"], ["deletedRecords", "phase15DeletedRecords"], ["settings", "phase15Settings"], ["importConflicts", "phase15ImportConflicts"]] as const;
  for (const [source, target] of extraPairs) for (const row of validated[source] ?? []) tx.objectStore(target).put(row);
  tx.objectStore("derivedAnalyticsCache").clear();
  await transactionDone(tx);
  return { imported: Object.values(validated).reduce((sum, rows) => sum + rows.length, 0), photoBinariesRestored: 0, cacheRebuilt: false };
}
export function escapeCsv(value: unknown) {
  const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  if (typeof value === "number") return text;
  return /^[=+@\-\t\r]/.test(text) ? `'${text}` : text;
}
export function recordsToCsv(rows: Record<string, unknown>[]) {
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const cell = (value: unknown) => { const text = escapeCsv(value); return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text; };
  return [columns.map(cell).join(","), ...rows.map((row) => columns.map((key) => cell(row[key])).join(","))].join("\r\n");
}
export function downloadText(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type })), link = document.createElement("a"); link.href = url; link.download = filename; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportCsvSet() {
  const data = await makeProgressBackup() as unknown as Record<string, unknown[]>;
  for (const name of ["bodyWeightLogs", "heightMeasurements", "circumferenceSessions", "bodyCompositionMeasurements", "progressGoals", "nutritionDayReviews", "metricCalculationReceipts", "dashboardLayouts"] as const)
    downloadText(`fitness-os-${name}.csv`, recordsToCsv((data[name] ?? []) as Record<string, unknown>[]), "text/csv;charset=utf-8");
  await saveProgressSetting("lastCsvExportAt", new Date().toISOString());
}
export function circumferenceMedianMm(replicates: number[]) { return median(replicates); }
export async function saveSanitizedPhoto(file: File, details: Record<string, string | null>) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw Error("Choose a JPEG, PNG, or WebP image.");
  const sourceUrl = URL.createObjectURL(file);
  try {
    const image = new Image(); image.src = sourceUrl; await image.decode();
    if (image.naturalWidth * image.naturalHeight > 20_000_000 || image.naturalWidth > 20_000 || image.naturalHeight > 20_000) throw Error("Image is above the 20-megapixel storage limit.");
    const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d"); if (!context) throw Error("This browser cannot sanitize the selected image.");
    context.drawImage(image, 0, 0);
    const mime = file.type === "image/png" ? "image/png" : file.type === "image/webp" ? "image/webp" : "image/jpeg";
    const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(Error("Image re-encoding failed.")), mime, 0.92));
    const blobKey = crypto.randomUUID(), id = crypto.randomUUID(), now = new Date(), measuredAt = now.toISOString(), localDate = new Intl.DateTimeFormat("en-CA").format(now), timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const hash = await crypto.subtle.digest("SHA-256", await blob.arrayBuffer()), sha256 = [...new Uint8Array(hash)].map((value) => value.toString(16).padStart(2, "0")).join("");
    const metadata = photoSchema.parse({ id, setId: details.setId ?? "default", takenAt: measuredAt, localDate, timezone, view: details.view ?? "front", pose: details.pose ?? null, clothing: details.clothing ?? null, lighting: details.lighting ?? null, cameraDistance: details.cameraDistance ?? null, background: details.background ?? null, blobKey, mime, width: canvas.width, height: canvas.height, sanitizedCopy: true, originalMetadataRemoved: true, includeBinaryInBackup: true, sha256, notes: details.notes ?? null, createdAt: measuredAt, updatedAt: measuredAt, deletedAt: null });
    const db = await openFitnessDatabase(), tx = db.transaction(["progressPhotos", "progressPhotoBlobs"], "readwrite"); tx.objectStore("progressPhotos").put(metadata); tx.objectStore("progressPhotoBlobs").put({ blobKey, blob, mime }); await transactionDone(tx);
    return metadata;
  } finally { URL.revokeObjectURL(sourceUrl); }
}
export async function readPhotoBlob(blobKey: string) {
  const db = await openFitnessDatabase();
  return requestValue(db.transaction("progressPhotoBlobs", "readonly").objectStore("progressPhotoBlobs").get(blobKey)) as Promise<{ blob: Blob; mime: string } | undefined>;
}
export async function downloadProgressBackup() {
  const backup = await makeProgressBackup();
  downloadText("fitness-os-progress-backup.json", JSON.stringify(backup, null, 2), "application/json;charset=utf-8");
  await saveProgressSetting("lastJsonBackupAt", backup.exportedAt);
}
export async function saveProgressSetting(key: string, value: unknown) {
  const db = await openFitnessDatabase(), tx = db.transaction("phase15Settings", "readwrite");
  tx.objectStore("phase15Settings").put({ key, value, updatedAt: new Date().toISOString() });
  await transactionDone(tx);
}
function concatBytes(parts: Uint8Array[]) { const size = parts.reduce((sum, part) => sum + part.length, 0), result = new Uint8Array(size); let offset = 0; for (const part of parts) { result.set(part, offset); offset += part.length; } return result; }
function crc32(bytes: Uint8Array) { let crc = 0xffffffff; for (const byte of bytes) { crc ^= byte; for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0); } return (crc ^ 0xffffffff) >>> 0; }
function zipStored(files: { name: string; data: Uint8Array }[]) {
  const encoder = new TextEncoder(), locals: Uint8Array[] = [], central: Uint8Array[] = []; let localOffset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name), crc = crc32(file.data), local = new Uint8Array(30 + name.length), localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true); localView.setUint16(4, 20, true); localView.setUint16(6, 0x0800, true); localView.setUint32(14, crc, true); localView.setUint32(18, file.data.length, true); localView.setUint32(22, file.data.length, true); localView.setUint16(26, name.length, true); local.set(name, 30); locals.push(local, file.data);
    const entry = new Uint8Array(46 + name.length), view = new DataView(entry.buffer); view.setUint32(0, 0x02014b50, true); view.setUint16(4, 20, true); view.setUint16(6, 20, true); view.setUint16(8, 0x0800, true); view.setUint32(16, crc, true); view.setUint32(20, file.data.length, true); view.setUint32(24, file.data.length, true); view.setUint16(28, name.length, true); view.setUint32(42, localOffset, true); entry.set(name, 46); central.push(entry); localOffset += local.length + file.data.length;
  }
  const centralBytes = concatBytes(central), end = new Uint8Array(22), view = new DataView(end.buffer); view.setUint32(0, 0x06054b50, true); view.setUint16(8, files.length, true); view.setUint16(10, files.length, true); view.setUint32(12, centralBytes.length, true); view.setUint32(16, localOffset, true); return concatBytes([...locals, centralBytes, end]);
}
export async function downloadPhotoArchive(filter: { from?: string; to?: string; view?: string }) {
  const photos = (await readProgressStore<Record<string, unknown>>("progressPhotos")).filter((photo) => !photo.deletedAt && (!filter.from || String(photo.localDate) >= filter.from) && (!filter.to || String(photo.localDate) <= filter.to) && (!filter.view || filter.view === "all" || photo.view === filter.view));
  const files: { name: string; data: Uint8Array }[] = [], missing: string[] = []; let totalBytes = 0;
  for (const photo of photos) { const item = await readPhotoBlob(String(photo.blobKey)); if (!item) { missing.push(String(photo.id)); continue; } const data = new Uint8Array(await item.blob.arrayBuffer()); totalBytes += data.length; if (totalBytes > 1_000_000_000) throw Error("Selected photos exceed the 1 GB archive limit."); files.push({ name: `photos/${String(photo.localDate)}-${String(photo.view)}-${String(photo.id)}.${item.mime === "image/png" ? "png" : item.mime === "image/webp" ? "webp" : "jpg"}`, data }); }
  const manifest = { exportedAt: new Date().toISOString(), selection: filter, records: photos, missingBinaryRecordIds: missing, sha256Checksums: Object.fromEntries(photos.map((photo) => [String(photo.id), photo.sha256])) };
  files.push({ name: "manifest.json", data: new TextEncoder().encode(JSON.stringify(manifest, null, 2)) });
  const archive = zipStored(files), url = URL.createObjectURL(new Blob([archive], { type: "application/zip" })), link = document.createElement("a"); link.href = url; link.download = "fitness-os-progress-photos.zip"; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  await saveProgressSetting("lastPhotoBackupAt", new Date().toISOString());
  return { photos: photos.length, archived: files.length - 1, missing: missing.length };
}
