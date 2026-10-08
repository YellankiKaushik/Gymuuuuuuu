import { test, expect } from "@playwright/test";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
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

test.describe.serial("synthetic portability journey", () => {
  let portabilityFixture:
    | {
        original: BackupEnvelope;
        file: Buffer;
        requests: string[];
        bodies: string[];
        ssrRoutes: string[];
      }
    | undefined;
  test("synthetic multi-module records export exactly without network or SSR leaks", async ({
    page,
    context,
    request,
  }) => {
    const requests: string[] = [],
      bodies: string[] = [],
      ssrRoutes: string[] = [];
    context.on("request", (event) => {
      requests.push(event.url());
      bodies.push(event.postData() ?? "");
    });
    // Test the documented download fallback; native OS file pickers require owner testing.
    await page.addInitScript(() => {
      Reflect.deleteProperty(window, "showSaveFilePicker");
    });
    await page.goto("/search?q=vitamins");
    await page
      .getByRole("button", { name: "Favourite", exact: true })
      .first()
      .click();
    await expect(
      page.getByText("Favourite saved on this device.", { exact: true }),
    ).toBeVisible();
    await page.goto("/programs/general-fitness-3-day");
    await page
      .getByRole("button", { name: "Select this program", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Program selected");
    await page.goto("/workout");
    await page
      .getByLabel("Personal exercise label", { exact: true })
      .fill("Synthetic portability lift");
    await page.getByRole("button", { name: "Save label and select" }).click();
    await page
      .getByLabel("Workout title", { exact: true })
      .fill("Synthetic portability workout");
    await page
      .getByRole("button", { name: "Start workout", exact: true })
      .click();
    await page.getByRole("button", { name: "Take over editor" }).click();
    await expect(
      page.getByRole("button", { name: "Complete set", exact: true }).first(),
    ).toBeEnabled();
    await page.getByLabel("Load (kg)", { exact: true }).first().fill("20");
    await page.getByLabel("Repetitions", { exact: true }).first().fill("5");
    await page
      .getByRole("button", { name: "Complete set", exact: true })
      .first()
      .click();
    await page
      .getByRole("button", { name: "Finish workout", exact: true })
      .click();
    await page.getByRole("button", { name: "Confirm", exact: true }).click();
    await expect(page).toHaveURL(/workout\/summary\//);
    await page.goto("/diet-planning/energy");
    await page.getByLabel("I understand this limitation").check();
    await page.getByLabel("Age (years)", { exact: true }).fill("30");
    await page
      .getByLabel("Sex used by the source equation")
      .selectOption("male");
    await page.getByLabel("Height (cm)", { exact: true }).fill("175");
    await page.getByLabel("Current weight (kg)", { exact: true }).fill("75");
    await page.getByLabel("Physical-activity category").selectOption("active");
    await expect(
      page.getByText("3025 kcal/day", { exact: true }).first(),
    ).toBeVisible();
    await page.getByRole("link", { name: "Next: Goal", exact: true }).click();
    await expect(page).toHaveURL(/diet-planning\/goal$/);
    await page.getByRole("link", { name: "Next: Macros", exact: true }).click();
    await expect(page).toHaveURL(/diet-planning\/macros$/);
    await expect(
      page.getByRole("heading", { name: "Macros planner", exact: true }),
    ).toBeVisible();
    await page
      .getByLabel("Plan name", { exact: true })
      .fill("Synthetic portability target");
    await page
      .getByRole("button", { name: "Save on this device", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Saved on this device" }),
    ).toBeVisible();
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
    await page
      .getByLabel("IANA timezone", { exact: true })
      .fill("Asia/Kolkata");
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
    await page.goto("/recovery/check-in");
    await page.getByLabel("Energy", { exact: true }).selectOption("2");
    await page.getByLabel("General fatigue", { exact: true }).selectOption("4");
    await page
      .getByRole("button", { name: "Save check-in", exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Check-in saved" }),
    ).toBeVisible();
    await page.goto("/cardio/session/new");
    await page
      .getByLabel("Session title", { exact: true })
      .fill("Synthetic portability cardio");
    await page.getByLabel("Record a completed session manually").check();
    await page
      .getByLabel("Actual start timestamp with offset")
      .fill("2026-10-04T10:00:00Z");
    await page
      .getByLabel("Actual elapsed seconds", { exact: true })
      .fill("1500");
    await page
      .getByRole("button", { name: "Save completed manual session" })
      .click();
    await expect(
      page.getByRole("status").filter({ hasText: "Manual session saved" }),
    ).toBeVisible();
    await page.goto("/supplements/products/create");
    await page.getByLabel("Product name").fill("Synthetic portability label");
    await page.getByLabel("Serving text, exactly as printed").fill("2 scoops");
    await page
      .getByLabel("Ingredient 1 label name")
      .fill("Synthetic ingredient");
    await page
      .getByLabel("Ingredient 1 amount disclosure")
      .selectOption("exact");
    await page.getByRole("textbox", { name: "Ingredient 1 amount" }).fill("0");
    await page.getByLabel("Ingredient 1 printed unit").fill("mg");
    await page
      .getByRole("button", { name: "Save product and label version" })
      .click();
    await expect(
      page.getByText(
        "New immutable label version saved; earlier intakes unchanged",
      ),
    ).toBeVisible();
    for (const route of [
      "/workout",
      "/diet-planning/plans",
      "/nutrition",
      "/sleep",
      "/recovery",
      "/cardio",
      "/supplements/products",
      "/progress/weight",
      "/saved/favourites",
      "/search",
    ]) {
      const html = await (await request.get(route)).text();
      expect(html, route).not.toContain("Synthetic portability");
      ssrRoutes.push(route);
    }
    await page.goto("/dashboard");
    await expect(page.locator("h1")).toBeVisible();
    await page.goto("/settings/data/export");
    const csvDownload = page.waitForEvent("download");
    await page
      .getByRole("button", { name: "Export spreadsheet-safe CSV", exact: true })
      .click();
    expect(
      await readFile((await (await csvDownload).path())!, "utf8"),
    ).toContain("workoutSessions");
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
    portabilityFixture = {
      original,
      file: await readFile(file!),
      requests,
      bodies,
      ssrRoutes,
    };
  });

  test("fresh-profile restore preserves exact multi-module records and rejects corruption", async ({
    browser,
  }, testInfo) => {
    expect(portabilityFixture).toBeDefined();
    const { original, file, requests, bodies, ssrRoutes } = portabilityFixture!;
    const originalStores = original.payload.modules
      .flatMap((module) => module.stores)
      .filter((store) => store.recordCount > 0);
    const clean = await browser.newContext();
    clean.on("request", (event) => {
      requests.push(event.url());
      bodies.push(event.postData() ?? "");
    });
    try {
      await clean.addInitScript(() => {
        Reflect.deleteProperty(window, "showSaveFilePicker");
      });
      const restored = await clean.newPage();
      await restored.goto("http://127.0.0.1:3000/settings/data/restore");
      await restored
        .getByRole("button", { name: "Prepare local storage", exact: true })
        .click();
      await expect(restored.getByRole("status")).toContainText(
        "Local storage is ready",
      );
      await restored.getByLabel("Backup file", { exact: true }).setInputFiles({
        name: "synthetic.json",
        mimeType: "application/json",
        buffer: file,
      });
      await expect(
        restored.getByRole("heading", { name: "Preview passed", exact: true }),
      ).toBeVisible();
      await expect(restored.getByText(/0 writes during preview/)).toBeVisible();
      await expect(
        restored.getByRole("region", { name: "Scrollable record table" }),
      ).toBeVisible();
      await restored.goto("http://127.0.0.1:3000/progress/weight");
      await expect(restored.getByText("70.5 kg", { exact: true })).toHaveCount(
        0,
      );
      await restored.goto("http://127.0.0.1:3000/settings/data/restore");
      await restored.getByLabel("Backup file", { exact: true }).setInputFiles({
        name: "synthetic.json",
        mimeType: "application/json",
        buffer: file,
      });
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
      await expect(
        restored.getByText("70.5 kg", { exact: true }),
      ).toBeVisible();
    } finally {
      await clean.close();
    }
    expect(
      requests.every((url) => new URL(url).origin === "http://127.0.0.1:3000"),
    ).toBe(true);
    expect(
      [...requests, ...bodies].some((value) =>
        /Synthetic(?:%20| )portability/i.test(value),
      ),
    ).toBe(false);
    await mkdir("docs/reports", { recursive: true });
    await writeFile(
      `docs/reports/pre-vercel-privacy-${testInfo.project.name}.json`,
      JSON.stringify(
        {
          schemaVersion: 1,
          testedCommit: execFileSync("git", ["rev-parse", "HEAD"], {
            encoding: "utf8",
          }).trim(),
          browser: testInfo.project.name,
          syntheticOnly: true,
          requestCount: requests.length,
          unexpectedRemoteRequests: 0,
          personalValuesInRequests: 0,
          ssrRoutes,
          ssrPersonalMarkerLeaks: 0,
          freshProfileRestore: "passed",
          invalidImportPreservation: "passed",
        },
        null,
        2,
      ) + "\n",
    );
  });
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
