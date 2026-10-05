import { afterEach, describe, expect, it, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { closeFitnessDatabase, openFitnessDatabase } from "../src/storage/indexed-db/fitness-database";
import { createBackup, encodeCsv, previewBackup, restoreBackup, validateBackup } from "../src/features/data-management/service";
import reference from "../DOCS_for_entire_apppliaction/GYM/Phase_17_Local_Storage_Backup_Export_Reference_Data.json";

afterEach(() => { closeFitnessDatabase(); vi.unstubAllGlobals(); });
function storage() { const factory = new IDBFactory(); vi.stubGlobal("window", { indexedDB: factory, localStorage: { getItem: () => null, setItem: vi.fn(), removeItem: vi.fn() } }); return factory; }
function done(tx: IDBTransaction) { return new Promise<void>((resolve, reject) => { tx.oncomplete = () => resolve(); tx.onabort = tx.onerror = () => reject(tx.error); }); }

describe("Phase 17 local data portability", () => {
  it("checks in each supplied Phase 17 integrity vector", () => { expect(reference.testVectors).toHaveLength(25); });
  it("CSV quotes values and neutralizes formula-like text by default", () => {
    expect(encodeCsv([{ note: "=SUM(A1:A2)", value: "say \"hi\"" }])).toBe('"note","value"\r\n"\'=SUM(A1:A2)","say ""hi"""');
    expect(encodeCsv([{ note: "=1+1" }], "raw")).toBe('"note"\r\n"=1+1"');
  });
  it("rejects malformed and future-format envelopes before preview writes", async () => {
    storage(); await openFitnessDatabase();
    const backup = await createBackup();
    expect(validateBackup({ ...backup, format: "unknown" }).errors.length).toBeGreaterThan(0);
    const future = await previewBackup({ ...backup, formatVersion: 2 });
    expect(future.writes).toBe(0); expect(future.errors.join(" ")).toContain("newer format");
  });
  it("validates hashes without writing and keep-existing preserves colliding records", async () => {
    storage(); const db = await openFitnessDatabase();
    const initial = { key: "theme", value: "light", updatedAt: new Date().toISOString() };
    const tx = db.transaction("phase17Settings", "readwrite"); tx.objectStore("phase17Settings").put(initial); await done(tx); db.close();
    const backup = await createBackup();
    const preview = await previewBackup(backup);
    expect(preview.errors).toEqual([]); expect(preview.writes).toBe(0);
    const reopened = await openFitnessDatabase();
    const before = await new Promise<unknown>((resolve, reject) => { const request = reopened.transaction("phase17Settings").objectStore("phase17Settings").get("theme"); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    expect(before).toEqual(initial); reopened.close();
    await restoreBackup(backup, "keep-existing");
    const afterDb = await openFitnessDatabase();
    const after = await new Promise<unknown>((resolve, reject) => { const request = afterDb.transaction("phase17Settings").objectStore("phase17Settings").get("theme"); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    expect(after).toEqual(initial); afterDb.close();
  });
  it("detects tampered payload content before any database changes", async () => {
    storage(); await openFitnessDatabase(); const backup = await createBackup();
    const changed = { ...backup, payload: { ...backup.payload, shellPreferences: [{ key: "unexpected", value: "x", source: "localStorage_preference" }] } };
    const preview = await previewBackup(changed);
    expect(preview.errors.join(" ")).toContain("payload hash"); expect(preview.writes).toBe(0);
  });
  it("keeps binary media out of portable backups and adds it only to the explicit full profile", async () => {
    storage(); const db = await openFitnessDatabase(), tx = db.transaction("progressPhotoBlobs", "readwrite");
    tx.objectStore("progressPhotoBlobs").put({ blobKey: "photo_blob_1", blob: new Blob(["private image"], { type: "image/png" }) }); await done(tx); db.close();
    const portable = await createBackup();
    expect(portable.payload.modules.flatMap((module) => module.stores).some((store) => store.storeId === "progressPhotoBlobs")).toBe(false);
    const full = await createBackup({ fullMedia: true });
    expect(full.profile).toBe("full_with_media"); expect(full.manifest.totalBinaryAssetCount).toBe(1);
    expect(full.payload.binaryAssets[0]).toMatchObject({ included: true, mediaType: "image/png", byteLength: 13 });
  });
});
