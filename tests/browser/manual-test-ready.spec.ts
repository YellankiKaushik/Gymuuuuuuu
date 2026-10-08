import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import type { BackupEnvelope } from "../../src/features/data-management/service";
import originalRecipes from "../../src/content/recipes/records.json" with { type: "json" };

test("public recipe copies exact sources locally, scales and freezes a consumed snapshot", async ({
  page,
}) => {
  await page.goto("/recipes/chickpea-cucumber-bowl");
  await page
    .getByRole("button", {
      name: "Save local copy to scale or log",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/recipes\/local\/recipe_/);
  await page.getByLabel("Scale preview: desired servings").fill("2");
  await expect(page.getByText(/300 g/).first()).toBeVisible();
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export this version", exact: true })
    .click();
  const copy = JSON.parse(
    await readFile((await (await download).path())!, "utf8"),
  ) as Record<string, unknown>;
  const original = originalRecipes.find(
    (recipe) => recipe.slug === "chickpea-cucumber-bowl",
  )!.version;
  expect(copy.ingredients).toEqual(original.ingredients);
  expect(copy.source).toEqual(original.source);
  expect(copy.yieldModel).toEqual(original.yieldModel);
  await page.getByLabel("Consumed date").fill("2026-10-04");
  await page.getByLabel("Consumed local time").fill("12:00");
  await page
    .getByRole("button", { name: "Log consumed serving", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Consumed recipe saved" }),
  ).toBeVisible();
  await page.goto("/nutrition/day/2026-10-04");
  await expect(
    page.getByRole("heading", {
      name: "Chickpea and cucumber bowl",
      exact: true,
    }),
  ).toBeVisible();
});

for (const route of [
  "/",
  "/workout",
  "/programs",
  "/exercises",
  "/foods",
  "/nutrients",
  "/diet",
  "/nutrition",
  "/recipes",
  "/meal-plans",
  "/recovery",
  "/sleep",
  "/mobility",
  "/cardio",
  "/supplements",
  "/progress",
  "/dashboard",
  "/search",
  "/saved",
  "/settings/data",
]) {
  test(`owner-test reflow ${route}`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status(), route).toBeLessThan(400);
    await expect(page.locator("h1").first()).toBeVisible();
    for (const width of [320, 375, 393, 768, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ["light", "dark"]) {
        await page.evaluate((value) => {
          document.documentElement.dataset.theme = value;
        }, theme);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${route} ${width} ${theme}`,
        ).toBe(true);
      }
    }
    expect(errors).toEqual([]);
  });
}

test("synthetic multi-module backup previews without writes and restores exact records into a clean profile", async ({
  page,
  browser,
}) => {
  // Test the documented download fallback; native OS file pickers require owner testing.
  await page.addInitScript(() => {
    Reflect.deleteProperty(window, "showSaveFilePicker");
  });
  await page.goto("/progress/weight");
  await page.getByLabel("Weight", { exact: true }).fill("70.5");
  await page
    .getByRole("button", { name: "Save measurement", exact: true })
    .click();
  await expect(page.getByText("70.5 kg", { exact: true })).toBeVisible();
  await page.goto("/nutrition/add");
  await page
    .getByLabel("Quick-add description")
    .fill("Synthetic portability check");
  await page.getByLabel("Energy (kcal) · required").fill("100");
  await page
    .getByRole("button", { name: "Save consumed entry", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Saved on this device" }),
  ).toBeVisible();
  await page.goto("/sleep/log");
  await page.getByLabel("Wake date", { exact: true }).fill("2026-10-05");
  await page.getByLabel("IANA timezone", { exact: true }).fill("Asia/Kolkata");
  await page
    .getByLabel("Attempted sleep", { exact: true })
    .fill("2026-10-04T22:30:00+05:30");
  await page
    .getByLabel("Final wake", { exact: true })
    .fill("2026-10-05T06:30:00+05:30");
  await page
    .getByLabel("Got out of bed", { exact: true })
    .fill("2026-10-05T06:45:00+05:30");
  await page.getByLabel("Time to fall asleep (minutes)").fill("15");
  await page.getByLabel("Awake after falling asleep (minutes)").fill("20");
  await page
    .getByRole("button", { name: "Save sleep entry", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Sleep entry saved" }),
  ).toBeVisible();
  await page.goto("/settings/data/backup");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Create backup file", exact: true })
    .click();
  const file = await (await download).path();
  expect(file).toBeTruthy();
  const original: BackupEnvelope = JSON.parse(await readFile(file!, "utf8"));
  expect(original.manifest.totalRecordCount).toBeGreaterThanOrEqual(3);
  const originalStores = original.payload.modules
    .flatMap((module) => module.stores)
    .filter((store) => store.recordCount > 0);
  expect(
    new Set(originalStores.map((store) => store.databaseName)).size,
  ).toBeGreaterThanOrEqual(2);
  const clean = await browser.newContext();
  try {
    await clean.addInitScript(() => {
      Reflect.deleteProperty(window, "showSaveFilePicker");
    });
    const restored = await clean.newPage();
    // Owning routes perform their versioned schema migrations; no synthetic data is saved here.
    for (const route of [
      "/progress/weight",
      "/nutrition",
      "/sleep/log",
      "/diet-planning/plans",
      "/settings/data/backup",
    ]) {
      await restored.goto(`http://127.0.0.1:3000${route}`);
      if (route === "/sleep/log")
        await expect(
          restored.getByRole("button", {
            name: "Save sleep entry",
            exact: true,
          }),
        ).toBeEnabled();
      if (route === "/diet-planning/plans")
        await expect
          .poll(() =>
            restored.evaluate(async () =>
              (await indexedDB.databases()).some(
                (database) => database.name === "fitness-os-diet-planning",
              ),
            ),
          )
          .toBe(true);
    }
    await expect
      .poll(() =>
        restored.evaluate(async () =>
          (await indexedDB.databases()).map((database) => database.name),
        ),
      )
      .toEqual(
        expect.arrayContaining([
          ...new Set(
            original.payload.modules.flatMap((module) =>
              module.stores.map((store) => store.databaseName),
            ),
          ),
        ]),
      );
    await restored.goto("http://127.0.0.1:3000/settings/data/restore");
    await restored
      .getByLabel("Backup file", { exact: true })
      .setInputFiles(file!);
    await expect(
      restored.getByRole("heading", { name: "Preview passed", exact: true }),
    ).toBeVisible();
    await expect(restored.getByText(/0 writes during preview/)).toBeVisible();
    await expect(
      restored.getByRole("region", { name: "Scrollable record table" }),
    ).toBeVisible();
    await restored.goto("http://127.0.0.1:3000/progress/weight");
    await expect(restored.getByText("70.5 kg", { exact: true })).toHaveCount(0);
    await restored.goto("http://127.0.0.1:3000/settings/data/restore");
    await restored
      .getByLabel("Backup file", { exact: true })
      .setInputFiles(file!);
    await expect(
      restored.getByRole("heading", { name: "Preview passed", exact: true }),
    ).toBeVisible();
    let confirmed = false;
    restored.once("dialog", async (dialog) => {
      confirmed = true;
      await dialog.accept();
    });
    await restored
      .getByRole("button", { name: "Replace matching stores", exact: true })
      .click();
    await expect(restored.getByRole("status")).toContainText(
      "Restore completed",
    );
    expect(confirmed).toBe(true);
    await restored.goto("http://127.0.0.1:3000/settings/data/backup");
    const afterDownload = restored.waitForEvent("download");
    await restored
      .getByRole("button", { name: "Create backup file", exact: true })
      .click();
    const after: BackupEnvelope = JSON.parse(
      await readFile((await (await afterDownload).path())!, "utf8"),
    );
    const afterStores = after.payload.modules.flatMap(
      (module) => module.stores,
    );
    for (const store of originalStores)
      expect(
        afterStores.find(
          (candidate) =>
            candidate.databaseName === store.databaseName &&
            candidate.storeId === store.storeId,
        )?.records,
      ).toEqual(store.records);
    await restored.goto("http://127.0.0.1:3000/settings/data/restore");
    await restored.getByLabel("Backup file", { exact: true }).setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        JSON.stringify({
          ...original,
          integrity: { ...original.integrity, payloadSha256: "0".repeat(64) },
        }),
      ),
    });
    await expect(
      restored.getByText(/Backup payload hash does not match/),
    ).toBeVisible();
    await expect(
      restored.getByRole("button", {
        name: "Keep existing records",
        exact: true,
      }),
    ).toHaveCount(0);
    await restored.goto("http://127.0.0.1:3000/progress/weight");
    await expect(restored.getByText("70.5 kg", { exact: true })).toBeVisible();
  } finally {
    await clean.close();
  }
});

test("global restore rejects stale file completions after a newer invalid selection", async ({
  page,
}) => {
  await page.goto("/settings/data/restore");
  await page.evaluate(() => {
    const original = File.prototype.text;
    Object.assign(window, { releaseOldBackup: undefined });
    File.prototype.text = function () {
      if (this.name === "old-backup.json")
        return new Promise<string>((resolve) => {
          Object.assign(window, { releaseOldBackup: () => resolve("{}") });
        });
      return original.call(this);
    };
  });
  const picker = page.getByLabel("Backup file", { exact: true });
  await picker.setInputFiles({
    name: "old-backup.json",
    mimeType: "application/json",
    buffer: Buffer.from("{}"),
  });
  await expect
    .poll(() =>
      page.evaluate(() => typeof Reflect.get(window, "releaseOldBackup")),
    )
    .toBe("function");
  await picker.setInputFiles({
    name: "invalid-latest.json",
    mimeType: "application/json",
    buffer: Buffer.from("invalid newest backup"),
  });
  await expect(page.getByRole("alert")).toBeVisible();
  const latestError = await page.getByRole("alert").textContent();
  await page.evaluate(async () => {
    Reflect.get(window, "releaseOldBackup")();
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  await expect(page.getByRole("alert")).toHaveText(latestError!);
  await expect(page.locator(".restore-preview")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Keep existing records" }),
  ).toHaveCount(0);
});
