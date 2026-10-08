import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import type { BackupEnvelope } from "../../src/features/data-management/service";

function pngTextChunk(text: string) {
  const data = Buffer.from(`GPS\0${text}`),
    type = Buffer.from("tEXt"),
    body = Buffer.concat([type, data]);
  let crc = 0xffffffff;
  for (const byte of body) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  const size = Buffer.alloc(4),
    checksum = Buffer.alloc(4);
  size.writeUInt32BE(data.length);
  checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
  return Buffer.concat([size, body, checksum]);
}

test("private photos remove synthetic metadata, exclude portable binaries and restore exact explicit media", async ({
  page,
  browser,
  request,
}) => {
  const requests: string[] = [];
  page.on("request", (event) => requests.push(event.url()));
  await page.addInitScript(() => {
    Reflect.deleteProperty(window, "showSaveFilePicker");
  });
  await page.goto("/progress/photos");
  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 4;
    canvas.height = 4;
    canvas.getContext("2d")!.fillRect(0, 0, 4, 4);
    return canvas.toDataURL("image/png");
  });
  const png = Buffer.from(dataUrl.split(",")[1]!, "base64"),
    marker = "SYNTHETIC-PRIVATE-GPS-METADATA";
  const source = Buffer.concat([
    png.subarray(0, png.length - 12),
    pngTextChunk(marker),
    png.subarray(png.length - 12),
  ]);
  await page.getByLabel("Image file", { exact: true }).setInputFiles({
    name: "synthetic.png",
    mimeType: "image/png",
    buffer: source,
  });
  await page
    .getByRole("button", { name: "Sanitize and save photo", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Saved successfully");
  await expect(page.locator(".progress-photo-grid img")).toHaveCount(1);
  expect(await (await request.get("/progress/photos")).text()).not.toContain(
    marker,
  );
  const zipDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download photo ZIP", exact: true })
    .click();
  const zip = await readFile((await (await zipDownload).path())!);
  expect(zip.subarray(0, 2).toString()).toBe("PK");
  expect(zip.includes(Buffer.from(marker))).toBe(false);
  await page.goto("/settings/data/backup");
  const portableDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Create backup file", exact: true })
    .click();
  const portable: BackupEnvelope = JSON.parse(
    await readFile((await (await portableDownload).path())!, "utf8"),
  );
  expect(
    portable.payload.modules
      .flatMap((module) => module.stores)
      .some((store) => store.storeId === "progressPhotoBlobs"),
  ).toBe(false);
  await page.getByLabel("Include progress-photo binary media").check();
  const fullDownload = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Create backup file", exact: true })
    .click();
  const fullPath = (await (await fullDownload).path())!;
  const full: BackupEnvelope = JSON.parse(await readFile(fullPath, "utf8"));
  expect(full.profile).toBe("full_with_media");
  expect(full.manifest.totalBinaryAssetCount).toBe(1);
  const media = full.payload.modules
    .flatMap((module) => module.stores)
    .find((store) => store.storeId === "progressPhotoBlobs")!;
  const value = media.records[0]!.value as { blob: { bytes: number[] } };
  expect(Buffer.from(value.blob.bytes).includes(Buffer.from(marker))).toBe(
    false,
  );
  const clean = await browser.newContext();
  try {
    const restored = await clean.newPage();
    await restored.goto("http://127.0.0.1:3000/settings/data/restore");
    await restored
      .getByRole("button", { name: "Prepare local storage", exact: true })
      .click();
    await expect(restored.getByRole("status")).toContainText(
      "Local storage is ready",
    );
    await restored
      .getByLabel("Backup file", { exact: true })
      .setInputFiles(fullPath);
    await expect(
      restored.getByRole("heading", { name: "Preview passed", exact: true }),
    ).toBeVisible();
    await restored
      .getByRole("button", { name: "Keep existing records", exact: true })
      .click();
    await expect(restored.getByRole("status")).toContainText(
      "Restore completed",
    );
    await restored.goto("http://127.0.0.1:3000/progress/photos");
    await expect(restored.locator(".progress-photo-grid img")).toHaveCount(1);
    const restoredBytes = await restored.evaluate(async () => {
      const db = await new Promise<IDBDatabase>((resolve, reject) => {
        const req = indexedDB.open("fitness-os");
        req.onupgradeneeded = () => req.transaction?.abort();
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      try {
        const rows = await new Promise<{ blob: Blob | Uint8Array }[]>(
          (resolve, reject) => {
            const req = db
              .transaction("progressPhotoBlobs", "readonly")
              .objectStore("progressPhotoBlobs")
              .getAll();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
          },
        );
        const binary = rows[0]!.blob;
        return [
          ...(binary instanceof Blob
            ? new Uint8Array(await binary.arrayBuffer())
            : binary),
        ];
      } finally {
        db.close();
      }
    });
    expect(restoredBytes).toEqual(value.blob.bytes);
  } finally {
    await clean.close();
  }
  expect(
    requests.every(
      (url) =>
        !url.startsWith("http") ||
        new URL(url).origin === "http://127.0.0.1:3000",
    ),
  ).toBe(true);
});
