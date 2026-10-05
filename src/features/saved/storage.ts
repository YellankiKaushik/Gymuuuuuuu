import { openFitnessDatabase } from "../../storage/indexed-db/fitness-database";
import { phase16BackupSchema, favouriteSchema, collectionSchema, collectionItemSchema, savedComparisonSchema, settingSchema, auditEventSchema, entityRefSchema, type EntityReference, type Phase16Backup } from "./schema";
import { isSafeCanonicalRoute, normalizeSearchText } from "../search/domain";
import { comparisonFamilyFor, validateComparisonEntities } from "../search/comparison";

const tables = ["phase16Favourites", "phase16Collections", "phase16CollectionItems", "phase16RecentQueries", "phase16RecentViews", "phase16SavedComparisons", "phase16Settings", "phase16AuditEvents", "phase16DeletedRecords", "phase16ImportConflicts"] as const;
export type SavedTable = (typeof tables)[number];
export const defaultSearchSettings = { privateSearchEnabled: false, privateSuggestionsEnabled: false, includeSensitiveNotes: false, recentPublicQueriesEnabled: true, recentPublicViewsEnabled: true, recentPrivateQueriesEnabled: false, recentPrivateViewsEnabled: false, backupIncludesRecentHistory: false, compareTray: [] as EntityReference[] };
function requestResult<T>(request: IDBRequest<T>) { return new Promise<T>((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error ?? Error("IndexedDB request failed.")); }); }
function transactionResult(tx: IDBTransaction) { return new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onabort = () => reject(tx.error ?? Error("Local save was aborted; previous records are unchanged.")); tx.onerror = () => reject(tx.error ?? Error("Local save failed; previous records are unchanged.")); }); }
const instant = () => new Date().toISOString();
const newId = (prefix: string) => `${prefix}_${crypto.randomUUID()}`;
function savedRowKey(store: SavedTable, row: Record<string, unknown>) { if (store === "phase16Settings") return String(row.key); if (store === "phase16DeletedRecords") return `${String(row.entityType)}:${String(row.entityId)}`; return String(row.id ?? `${String(row.entityType)}:${String(row.entityId)}`); }
function audit(type: "favourite_added" | "favourite_removed" | "collection_created" | "collection_updated" | "collection_deleted" | "collection_item_added" | "collection_item_removed" | "recent_history_cleared" | "comparison_saved" | "comparison_updated" | "comparison_deleted" | "entity_reference_migrated" | "imported" | "restored" | "deleted", entityType: string, entityId: string, details: Record<string, unknown> = {}) {
  return auditEventSchema.parse({ id: newId("audit"), eventType: type, entityType, entityId, occurredAt: instant(), details });
}
export async function readSavedStore<T extends Record<string, unknown> = Record<string, unknown>>(name: SavedTable) {
  const db = await openFitnessDatabase();
  if (!db.objectStoreNames.contains(name)) throw Error("Saved-content storage has not been upgraded yet.");
  return requestResult(db.transaction(name, "readonly").objectStore(name).getAll()) as Promise<T[]>;
}
export async function readSavedOverview() {
  const db = await openFitnessDatabase(), tx = db.transaction(tables as unknown as string[], "readonly");
  const pairs = await Promise.all(tables.map(async (name) => [name, await requestResult(tx.objectStore(name).getAll())] as const));
  return Object.fromEntries(pairs) as Record<SavedTable, Record<string, unknown>[]>;
}
export async function readSearchSettings() {
  const rows = await readSavedStore("phase16Settings"), stored = Object.fromEntries(rows.map((row) => [String(row.key), row.value]));
  return { ...defaultSearchSettings, ...stored } as typeof defaultSearchSettings;
}
export async function writeSearchSetting(key: keyof typeof defaultSearchSettings, value: unknown) {
  if (key === "privateSuggestionsEnabled" && value === true && !(await readSearchSettings()).privateSearchEnabled) throw Error("Enable private search before private suggestions.");
  const setting = settingSchema.parse({ key, value, updatedAt: instant() }), db = await openFitnessDatabase(), names = key === "privateSearchEnabled" && value === false ? ["phase16Settings", "phase16PrivateSearchCache"] : ["phase16Settings"], tx = db.transaction(names, "readwrite");
  tx.objectStore("phase16Settings").put(setting);
  if (key === "privateSearchEnabled" && value === false) { tx.objectStore("phase16PrivateSearchCache").clear(); tx.objectStore("phase16Settings").put(settingSchema.parse({ key: "privateSuggestionsEnabled", value: false, updatedAt: instant() })); }
  await transactionResult(tx);
}
export function entityReferenceKey(entity: Pick<EntityReference, "entityType" | "entityId">) { return `${entity.entityType}:${entity.entityId}`; }
export async function saveFavourite(entity: EntityReference) {
  const timestamp = instant(), id = `favourite:${encodeURIComponent(entity.entityType)}:${encodeURIComponent(entity.entityId)}`, favourite = favouriteSchema.parse({ id, entity, savedAt: timestamp, updatedAt: timestamp }), db = await openFitnessDatabase(), tx = db.transaction(["phase16Favourites", "phase16AuditEvents"], "readwrite"), index = tx.objectStore("phase16Favourites").index("byEntityId");
  const existing = await requestResult(index.get([entity.entityType, entity.entityId]));
  if (!existing) { tx.objectStore("phase16Favourites").put(favourite); tx.objectStore("phase16AuditEvents").put(audit("favourite_added", entity.entityType, entity.entityId)); }
  await transactionResult(tx);
  return !existing;
}
export async function removeFavourite(entityType: string, entityId: string) {
  const db = await openFitnessDatabase(), tx = db.transaction(["phase16Favourites", "phase16AuditEvents"], "readwrite"), index = tx.objectStore("phase16Favourites").index("byEntityId"), existing = await requestResult(index.get([entityType, entityId])) as { id: string } | undefined;
  if (existing) { tx.objectStore("phase16Favourites").delete(existing.id); tx.objectStore("phase16AuditEvents").put(audit("favourite_removed", entityType, entityId)); }
  await transactionResult(tx);
}
export async function saveCollection(input: { id?: string; name: string; description?: string | null; sortMode?: "manual" | "title" | "saved_newest" | "saved_oldest" }) {
  const db = await openFitnessDatabase(), tx = db.transaction(["phase16Collections", "phase16AuditEvents"], "readwrite"), store = tx.objectStore("phase16Collections"), existing = input.id ? await requestResult(store.get(input.id)) as Record<string, unknown> | undefined : undefined, existingRows = await requestResult(store.getAll()) as Record<string, unknown>[], name = Array.from(input.name.normalize("NFKC")).filter((character) => { const code = character.charCodeAt(0); return code >= 32 && code !== 127; }).join("").trim(), folded = normalizeSearchText(name);
  if (!name || name.length > 120 || /[<>]/.test(name)) { tx.abort(); throw Error("Enter a collection name of 1–120 safe characters."); }
  if (existingRows.some((row) => row.id !== input.id && normalizeSearchText(String(row.name)) === folded)) { tx.abort(); throw Error("A collection with this name already exists."); }
  const timestamp = instant(), collection = collectionSchema.parse({ id: input.id ?? newId("collection"), name, description: input.description?.slice(0, 1000) ?? null, createdAt: existing?.createdAt ?? timestamp, updatedAt: timestamp, sortMode: input.sortMode ?? existing?.sortMode ?? "manual" });
  store.put(collection); tx.objectStore("phase16AuditEvents").put(audit(existing ? "collection_updated" : "collection_created", "collection", collection.id)); await transactionResult(tx); return collection;
}
export async function addCollectionItem(collectionId: string, entity: EntityReference) {
  const db = await openFitnessDatabase(), tx = db.transaction(["phase16Collections", "phase16CollectionItems", "phase16AuditEvents"], "readwrite"), collections = tx.objectStore("phase16Collections"), parent = await requestResult(collections.get(collectionId));
  if (!parent) { tx.abort(); throw Error("Collection is unavailable; no item was added."); }
  const store = tx.objectStore("phase16CollectionItems"), rows = await requestResult(store.index("byCollectionId").getAll(collectionId)) as Record<string, unknown>[];
  if (rows.some((row) => { const item = row.entity as EntityReference; return item.entityType === entity.entityType && item.entityId === entity.entityId; })) { tx.abort(); throw Error("This reference is already in the collection."); }
  const item = collectionItemSchema.parse({ id: newId("collection_item"), collectionId, entity, position: rows.length ? Math.max(...rows.map((row) => Number(row.position))) + 1 : 0, note: null, addedAt: instant(), updatedAt: null });
  store.add(item); tx.objectStore("phase16AuditEvents").put(audit("collection_item_added", entity.entityType, entity.entityId, { collectionId })); await transactionResult(tx); return item;
}
export async function removeCollectionItem(itemId: string) {
  const db = await openFitnessDatabase(), tx = db.transaction(["phase16CollectionItems", "phase16AuditEvents"], "readwrite"), store = tx.objectStore("phase16CollectionItems"), item = await requestResult(store.get(itemId)) as Record<string, unknown> | undefined;
  if (item) { const entity = item.entity as EntityReference | undefined; store.delete(itemId); tx.objectStore("phase16AuditEvents").put(audit("collection_item_removed", entity?.entityType ?? "reference", entity?.entityId ?? itemId, { collectionId: item.collectionId })); }
  await transactionResult(tx);
}
export async function moveCollectionItem(itemId: string, direction: -1 | 1) {
  const db = await openFitnessDatabase(), tx = db.transaction("phase16CollectionItems", "readwrite"), store = tx.objectStore("phase16CollectionItems"), current = await requestResult(store.get(itemId)) as Record<string, unknown> | undefined;
  if (!current) { tx.abort(); throw Error("Collection item no longer exists."); }
  const rows = (await requestResult(store.index("byCollectionId").getAll(String(current.collectionId))) as Record<string, unknown>[]).sort((a, b) => Number(a.position) - Number(b.position)), index = rows.findIndex((row) => row.id === itemId), next = index + direction;
  if (next >= 0 && next < rows.length) { [rows[index]!.position, rows[next]!.position] = [rows[next]!.position, rows[index]!.position]; rows.forEach((row) => store.put(row)); }
  await transactionResult(tx);
}
export async function updateCollectionItemNote(itemId: string, note: string | null) {
  const db = await openFitnessDatabase(), tx = db.transaction("phase16CollectionItems", "readwrite"), store = tx.objectStore("phase16CollectionItems"), row = await requestResult(store.get(itemId)) as Record<string, unknown> | undefined;
  if (!row) { tx.abort(); throw Error("Collection item no longer exists."); }
  store.put(collectionItemSchema.parse({ ...row, note: note?.slice(0, 3000) ?? null, updatedAt: instant() })); await transactionResult(tx);
}
export async function transferCollectionItem(itemId: string, destinationId: string, copy = false) {
  const db = await openFitnessDatabase(), tx = db.transaction(["phase16Collections", "phase16CollectionItems", "phase16AuditEvents"], "readwrite"), store = tx.objectStore("phase16CollectionItems"), item = await requestResult(store.get(itemId)) as Record<string, unknown> | undefined, destination = await requestResult(tx.objectStore("phase16Collections").get(destinationId));
  if (!item || !destination) { tx.abort(); throw Error("The item or destination collection is unavailable."); }
  if (item.collectionId === destinationId && !copy) { tx.abort(); throw Error("Choose a different destination collection."); }
  const rows = await requestResult(store.index("byCollectionId").getAll(destinationId)) as Record<string, unknown>[], entity = item.entity as EntityReference;
  if (rows.some((row) => entityReferenceKey(row.entity as EntityReference) === entityReferenceKey(entity))) { tx.abort(); throw Error("This reference is already in the destination collection."); }
  const position = rows.length ? Math.max(...rows.map((row) => Number(row.position))) + 1 : 0;
  if (copy) store.add(collectionItemSchema.parse({ ...item, id: newId("collection_item"), collectionId: destinationId, position, addedAt: instant(), updatedAt: null }));
  else store.put(collectionItemSchema.parse({ ...item, collectionId: destinationId, position, updatedAt: instant() }));
  tx.objectStore("phase16AuditEvents").put(audit("collection_updated", "collection_item", itemId, { action: copy ? "copied" : "moved", from: item.collectionId, to: destinationId }));
  await transactionResult(tx);
}
export async function deleteCollection(collectionId: string) {
  const db = await openFitnessDatabase(), tx = db.transaction(["phase16Collections", "phase16CollectionItems", "phase16AuditEvents", "phase16DeletedRecords"], "readwrite"), collectionStore = tx.objectStore("phase16Collections"), collection = await requestResult(collectionStore.get(collectionId));
  if (!collection) { tx.abort(); throw Error("Collection was not found."); }
  const itemStore = tx.objectStore("phase16CollectionItems"), items = await requestResult(itemStore.index("byCollectionId").getAllKeys(collectionId));
  for (const key of items) itemStore.delete(key);
  collectionStore.delete(collectionId); tx.objectStore("phase16DeletedRecords").put({ entityType: "collection", entityId: collectionId, deletedAt: instant(), reason: "deleted by owner" }); tx.objectStore("phase16AuditEvents").put(audit("collection_deleted", "collection", collectionId, { removedItems: items.length })); await transactionResult(tx);
}
export async function recordRecentQuery(query: string, resultCount: number, scope: "public" | "public_and_private", filters: Record<string, string | number | boolean | string[] | null> = {}) {
  const normalizedQuery = normalizeSearchText(query), settings = await readSearchSettings(), allowed = scope === "public" ? settings.recentPublicQueriesEnabled : settings.recentPrivateQueriesEnabled;
  if (!allowed || !normalizedQuery || normalizedQuery.length > 120) return;
  const db = await openFitnessDatabase(), tx = db.transaction(["phase16RecentQueries", "phase16Settings"], "readwrite"), store = tx.objectStore("phase16RecentQueries"), rows = await requestResult(store.getAll()) as Record<string, unknown>[], existing = rows.find((row) => row.normalizedQuery === normalizedQuery && row.scope === scope), when = instant();
  const record = { id: existing?.id ?? newId("recent_query"), normalizedQuery, displayQuery: query.trim().slice(0, 120), scope, publicFilters: scope === "public" ? filters : {}, resultCount: Math.max(0, Math.trunc(resultCount)), searchedAt: when };
  store.put(record); const kept = [...rows.filter((row) => row.id !== record.id), record].sort((a, b) => String(b.searchedAt).localeCompare(String(a.searchedAt))).slice(0, 30); for (const old of rows) if (!kept.some((row) => row.id === old.id)) store.delete(String(old.id));
  await transactionResult(tx);
}
export async function recordRecentView(entity: EntityReference) {
  const settings = await readSearchSettings(); if (entity.referenceStatus === "private" ? !settings.recentPrivateViewsEnabled : !settings.recentPublicViewsEnabled) return;
  const db = await openFitnessDatabase(), tx = db.transaction("phase16RecentViews", "readwrite"), store = tx.objectStore("phase16RecentViews"), rows = await requestResult(store.getAll()) as Record<string, unknown>[], key = entityReferenceKey(entity), existing = rows.find((row) => entityReferenceKey(row.entity as EntityReference) === key), record = { id: existing?.id ?? newId("recent_view"), entity, viewedAt: instant() };
  store.put(record); const keep = [...rows.filter((row) => row.id !== record.id), record].sort((a, b) => String(b.viewedAt).localeCompare(String(a.viewedAt))).slice(0, 100); for (const old of rows) if (!keep.some((row) => row.id === old.id)) store.delete(String(old.id)); await transactionResult(tx);
}
export async function clearRecentHistory(scope: "queries" | "views" | "all" = "all") {
  const stores = scope === "all" ? ["phase16RecentQueries", "phase16RecentViews"] : [scope === "queries" ? "phase16RecentQueries" : "phase16RecentViews"], db = await openFitnessDatabase(), tx = db.transaction([...stores, "phase16AuditEvents"], "readwrite");
  for (const store of stores) tx.objectStore(store).clear(); tx.objectStore("phase16AuditEvents").put(audit("recent_history_cleared", "recent_history", scope)); await transactionResult(tx);
}
export async function removeRecentView(id: string) {
  const db = await openFitnessDatabase(), tx = db.transaction("phase16RecentViews", "readwrite"); tx.objectStore("phase16RecentViews").delete(id); await transactionResult(tx);
}
export async function saveCompareTray(entities: EntityReference[]) { if (entities.length > 4) throw Error("A comparison can contain at most four references."); if (entities.length) { const family = comparisonFamilyFor(entities[0]!); if (!family) throw Error("This reference type cannot be compared."); if (entities.some((entity) => comparisonFamilyFor(entity) !== family)) throw Error("Comparisons require one compatible family."); if (new Set(entities.map(entityReferenceKey)).size !== entities.length) throw Error("The comparison tray cannot contain a reference twice."); } await writeSearchSetting("compareTray", entities); }
export async function saveComparison(input: Parameters<typeof savedComparisonSchema.parse>[0]) {
  const comparison = savedComparisonSchema.parse(input); validateComparisonEntities(comparison.family, comparison.entities.map((item) => item.entity)); const db = await openFitnessDatabase(), tx = db.transaction(["phase16SavedComparisons", "phase16AuditEvents"], "readwrite"), store = tx.objectStore("phase16SavedComparisons");
  store.put(comparison); tx.objectStore("phase16AuditEvents").put(audit("comparison_saved", comparison.family, comparison.id)); await transactionResult(tx); return comparison;
}
export async function removeSavedComparison(id: string) {
  const db = await openFitnessDatabase(), tx = db.transaction(["phase16SavedComparisons", "phase16AuditEvents"], "readwrite"), store = tx.objectStore("phase16SavedComparisons"), previous = await requestResult(store.get(id));
  if (previous) { store.delete(id); tx.objectStore("phase16AuditEvents").put(audit("comparison_deleted", "comparison", id)); } await transactionResult(tx);
}

export async function makePhase16Backup(includeHistory = false): Promise<Phase16Backup> {
  const db = await openFitnessDatabase(), names = [...tables], tx = db.transaction(names, "readonly"), data = Object.fromEntries(await Promise.all(names.map(async (name) => [name, await requestResult(tx.objectStore(name).getAll())] as const)));
  const backup = { schemaVersion: "1.0.0", exportedAt: instant(), moduleId: "phase_16_search_favourites_comparison", favourites: data.phase16Favourites, collections: data.phase16Collections, collectionItems: data.phase16CollectionItems, recentQueries: includeHistory ? data.phase16RecentQueries : [], recentViews: includeHistory ? data.phase16RecentViews : [], savedComparisons: data.phase16SavedComparisons, settings: data.phase16Settings, auditEvents: data.phase16AuditEvents, deletedRecords: data.phase16DeletedRecords };
  return phase16BackupSchema.parse(backup);
}
export function validatePhase16Backup(input: unknown) {
  const backup = phase16BackupSchema.parse(input), collectionIds = new Set(backup.collections.map((item) => item.id));
  const idLists = [backup.favourites.map((item) => item.id), backup.collections.map((item) => item.id), backup.collectionItems.map((item) => item.id), backup.recentQueries.map((item) => item.id), backup.recentViews.map((item) => item.id), backup.savedComparisons.map((item) => item.id), backup.auditEvents.map((item) => item.id)];
  if (idLists.some((ids) => new Set(ids).size !== ids.length)) throw Error("Backup contains duplicate record IDs.");
  if (new Set(backup.favourites.map((item) => entityReferenceKey(item.entity))).size !== backup.favourites.length) throw Error("Backup contains duplicate canonical favourites.");
  const references = [...backup.favourites.map((item) => item.entity), ...backup.collectionItems.map((item) => item.entity), ...backup.recentViews.map((item) => item.entity), ...backup.savedComparisons.flatMap((item) => item.entities.map((part) => part.entity))];
  if (references.some((entity) => entity.lastKnownRoute !== null && !isSafeCanonicalRoute(entity.lastKnownRoute))) throw Error("Backup contains a reference outside the canonical application routes.");
  if (backup.collectionItems.some((item) => !collectionIds.has(item.collectionId))) throw Error("Backup contains a collection item without its parent collection.");
  for (const collection of backup.collections) { const items = backup.collectionItems.filter((item) => item.collectionId === collection.id); if (items.some((item, index) => items.findIndex((candidate) => candidate.position === item.position) !== index) || new Set(items.map((item) => entityReferenceKey(item.entity))).size !== items.length) throw Error("Backup contains duplicate collection positions or references."); }
  for (const comparison of backup.savedComparisons) { if (new Set(comparison.entities.map((item) => item.position)).size !== comparison.entities.length || new Set(comparison.entities.map((item) => entityReferenceKey(item.entity))).size !== comparison.entities.length) throw Error("Backup contains duplicate comparison positions or references."); validateComparisonEntities(comparison.family, comparison.entities.map((item) => item.entity)); }
  const booleanSettings = new Set(["privateSearchEnabled", "privateSuggestionsEnabled", "includeSensitiveNotes", "recentPublicQueriesEnabled", "recentPublicViewsEnabled", "recentPrivateQueriesEnabled", "recentPrivateViewsEnabled", "backupIncludesRecentHistory"]);
  const settingsMap = new Map(backup.settings.map((setting) => [setting.key, setting.value]));
  for (const setting of backup.settings) { if (booleanSettings.has(setting.key) && typeof setting.value !== "boolean") throw Error(`Backup setting ${setting.key} must be true or false.`); if (setting.key === "includeSensitiveNotes" && setting.value === true) throw Error("Sensitive notes are not supported in this search version."); if (setting.key === "privateSuggestionsEnabled" && setting.value === true && settingsMap.get("privateSearchEnabled") !== true) throw Error("Private suggestions require private search to be enabled."); if (setting.key === "compareTray") { if (!Array.isArray(setting.value)) throw Error("Backup comparison tray must be a reference list."); const entities = setting.value.map((entity) => entityRefSchema.parse(entity)); if (entities.length > 4 || entities.some((entity) => !comparisonFamilyFor(entity)) || entities.length > 1 && entities.some((entity) => comparisonFamilyFor(entity) !== comparisonFamilyFor(entities[0]!)) || new Set(entities.map(entityReferenceKey)).size !== entities.length) throw Error("Backup comparison tray contains incompatible references."); } }
  return backup;
}
export async function previewPhase16Restore(input: unknown) {
  const backup = validatePhase16Backup(input), current = await readSavedOverview();
  return { backup, summary: [
    ["phase16Favourites", backup.favourites, current.phase16Favourites], ["phase16Collections", backup.collections, current.phase16Collections], ["phase16CollectionItems", backup.collectionItems, current.phase16CollectionItems], ["phase16RecentQueries", backup.recentQueries, current.phase16RecentQueries], ["phase16RecentViews", backup.recentViews, current.phase16RecentViews], ["phase16SavedComparisons", backup.savedComparisons, current.phase16SavedComparisons], ["phase16Settings", backup.settings, current.phase16Settings], ["phase16AuditEvents", backup.auditEvents, current.phase16AuditEvents], ["phase16DeletedRecords", backup.deletedRecords, current.phase16DeletedRecords],
  ].map(([store, incoming, existing]) => { const name = String(store) as SavedTable, existingIds = new Set((existing as Record<string, unknown>[]).map((row) => savedRowKey(name, row))); return { store: String(store), incoming: (incoming as unknown[]).length, conflicts: (incoming as Record<string, unknown>[]).filter((row) => existingIds.has(savedRowKey(name, row))).length }; }) };
}
export async function restorePhase16Backup(input: unknown, mode: "keep_existing" | "import_copy" | "replace") {
  const checked = validatePhase16Backup(input), current = mode === "replace" ? null : await readSavedOverview(), db = await openFitnessDatabase(), tx = db.transaction([...tables, "phase16PrivateSearchCache"], "readwrite"), stores = tx.objectStoreNames;
  if (mode === "replace") for (const name of tables) tx.objectStore(name).clear();
  tx.objectStore("phase16PrivateSearchCache").clear();
  const idMap = new Map<string, string>(), timestamp = instant();
  const rowsByStore: Record<SavedTable, Record<string, unknown>[]> = {
    phase16Favourites: checked.favourites as unknown as Record<string, unknown>[], phase16Collections: checked.collections as unknown as Record<string, unknown>[], phase16CollectionItems: checked.collectionItems as unknown as Record<string, unknown>[], phase16RecentQueries: checked.recentQueries as unknown as Record<string, unknown>[], phase16RecentViews: checked.recentViews as unknown as Record<string, unknown>[], phase16SavedComparisons: checked.savedComparisons as unknown as Record<string, unknown>[], phase16Settings: checked.settings as unknown as Record<string, unknown>[], phase16AuditEvents: checked.auditEvents as unknown as Record<string, unknown>[], phase16DeletedRecords: checked.deletedRecords as unknown as Record<string, unknown>[], phase16ImportConflicts: [],
  };
  if (mode === "import_copy") for (const name of ["phase16Collections", "phase16CollectionItems", "phase16RecentQueries", "phase16RecentViews", "phase16SavedComparisons", "phase16AuditEvents"] as const) for (const row of rowsByStore[name]) { const prior = String(row.id); row.id = newId(name.replace("phase16", "").toLowerCase()); idMap.set(prior, String(row.id)); }
  if (mode === "import_copy") for (const row of rowsByStore.phase16CollectionItems) row.collectionId = idMap.get(String(row.collectionId)) ?? String(row.collectionId);
  const conflictRows: Record<string, unknown>[] = [];
  for (const name of tables) {
    const store = tx.objectStore(name), currentIds = new Set((current?.[name] ?? []).map((row) => savedRowKey(name, row)));
    for (const inputRow of rowsByStore[name]) {
      const row = { ...inputRow };
      if (name === "phase16Settings" && mode === "import_copy") continue;
      const conflictKey = savedRowKey(name, row), isFavouriteConflict = name === "phase16Favourites" && (current?.phase16Favourites ?? []).some((old) => entityReferenceKey(old.entity as EntityReference) === entityReferenceKey(row.entity as EntityReference));
      if (mode === "keep_existing" && (currentIds.has(conflictKey) || isFavouriteConflict)) {
        conflictRows.push({ id: newId("conflict"), collection: name, entityId: conflictKey, resolution: "kept_existing", occurredAt: timestamp }); continue;
      }
      store.put(row);
    }
  }
  for (const conflict of conflictRows) tx.objectStore("phase16ImportConflicts").put(conflict);
  tx.objectStore("phase16AuditEvents").put(audit("restored", "phase16_backup", checked.moduleId, { mode, conflicts: conflictRows.length }));
  if (!stores.contains("phase16PrivateSearchCache")) throw Error("Private search cache storage is unavailable.");
  await transactionResult(tx);
  return { imported: Object.values(rowsByStore).reduce((sum, rows) => sum + rows.length, 0), conflicts: conflictRows.length };
}
export function downloadSavedBackup(includeHistory = false) { return makePhase16Backup(includeHistory).then((backup) => { download("fitness-os-phase-16-backup.json", JSON.stringify(backup, null, 2), "application/json"); return backup; }); }
function download(filename: string, contents: string, mime: string) { const url = URL.createObjectURL(new Blob([contents], { type: mime })), link = document.createElement("a"); link.href = url; link.download = filename; link.click(); window.setTimeout(() => URL.revokeObjectURL(url), 1000); }
function csvCell(value: unknown) { const text = value === null || value === undefined ? "" : typeof value === "object" ? JSON.stringify(value) : String(value), escaped = /^[\s]*[=+@]/.test(text) || /^[\s]*-[^0-9.]/.test(text) ? `'${text}` : text; return `"${escaped.replaceAll('"', '""')}"`; }
function encodeCsv(rows: Record<string, unknown>[]) { const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))]; return [columns.map(csvCell).join(","), ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))].join("\r\n"); }
export async function exportSavedCsv(includeHistory = false) {
  const data = await makePhase16Backup(includeHistory);
  for (const [name, rows] of [["favourites", data.favourites], ["collections", data.collections], ["collection-items", data.collectionItems], ["recent-queries", data.recentQueries], ["recent-views", data.recentViews], ["comparisons", data.savedComparisons]] as const) download(`fitness-os-phase-16-${name}.csv`, encodeCsv(rows as unknown as Record<string, unknown>[]), "text/csv;charset=utf-8");
}
export async function readPrivateSearchCache() {
  const db = await openFitnessDatabase(); return requestResult(db.transaction("phase16PrivateSearchCache", "readonly").objectStore("phase16PrivateSearchCache").getAll());
}
export async function replacePrivateSearchCache(rows: readonly Record<string, unknown>[]) {
  const settings = await readSearchSettings(); if (!settings.privateSearchEnabled) return;
  const db = await openFitnessDatabase(), tx = db.transaction("phase16PrivateSearchCache", "readwrite"), store = tx.objectStore("phase16PrivateSearchCache"); store.clear(); for (const row of rows) store.put(row); await transactionResult(tx);
}
