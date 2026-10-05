import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
const routes = [
  "/cardio",
  "/cardio/learn",
  "/cardio/learn/unavailable",
  "/cardio/modalities",
  "/cardio/modalities/unavailable",
  "/cardio/plans",
  "/cardio/plans/unavailable",
  "/cardio/custom-plans",
  "/cardio/custom-plans/create",
  "/conditioning",
  "/conditioning/routines/unavailable",
  "/conditioning/custom",
  "/cardio/session/new",
  "/cardio/session/active",
  "/cardio/history",
  "/cardio/history/unavailable",
  "/cardio/progress",
  "/cardio/calculators/pace",
  "/cardio/calculators/intensity",
  "/cardio/methodology",
  "/cardio/settings",
  "/cardio/privacy",
];
for (const theme of ["light", "dark"])
  test(`Phase 13 routes, accessibility and layout in ${theme}`, async ({
    page,
  }) => {
    test.setTimeout(240000);
    await page.addInitScript(
      (theme) =>
        localStorage.setItem(
          "fitness-os:preferences:v1",
          JSON.stringify({ theme }),
        ),
      theme,
    );
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(route);
        await expect(page.locator(".cardio-page")).toBeVisible();
        await expect(page.getByText("Loading browser records…")).toHaveCount(0);
        await expect(
          page.getByText("Loading selected browser record…"),
        ).toHaveCount(0);
        await expect(page.locator("h1")).toHaveCount(1);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
          `${route} ${width}`,
        ).toBe(true);
        expect(
          (await new AxeBuilder({ page }).analyze()).violations,
          `${route} ${width} ${theme}`,
        ).toEqual([]);
      }
    }
  });
test("cardio manual entry, audit correction, immutable routine versions, resumable player, backup and SSR privacy", async ({
  page,
  context,
  request,
}) => {
  test.setTimeout(120000);
  const external: string[] = [];
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://127.0.0.1:3000") &&
      !r.url().startsWith("http://localhost:3000")
    )
      external.push(r.url());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/cardio/calculators/pace");
  await page.getByLabel("Distance", { exact: true }).fill("5");
  await page.getByLabel("Elapsed seconds", { exact: true }).fill("1500");
  await page
    .getByRole("button", { name: "Calculate pace", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Pace results" }),
  ).toContainText("5:00");
  await page.goto("/cardio/calculators/intensity");
  await page.getByLabel("Maximum heart rate bpm", { exact: true }).fill("190");
  await page.getByLabel("Resting heart rate bpm", { exact: true }).fill("60");
  await page.getByLabel("Your lower percentage", { exact: true }).fill("50");
  await page.getByLabel("Your upper percentage", { exact: true }).fill("70");
  await page
    .getByRole("button", { name: "Calculate selected HR fractions" })
    .click();
  await expect(
    page.getByRole("region", { name: "Heart-rate results" }),
  ).toContainText("125–151");
  await page.goto("/cardio/session/new");
  await page
    .getByLabel("Session title", { exact: true })
    .fill("Synthetic private cardio title");
  await page.getByLabel("Record a completed session manually").check();
  await page
    .getByLabel("Actual start timestamp with offset")
    .fill("2026-10-04T10:00:00Z");
  await page.getByLabel("Actual elapsed seconds", { exact: true }).fill("1500");
  await page
    .getByRole("button", { name: "Save completed manual session" })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Manual session saved" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: /Edit actual observations for/ })
    .click();
  await page.getByLabel("Distance m", { exact: true }).fill("5000");
  await page.getByLabel("Average heart rate bpm", { exact: true }).fill("152");
  await page
    .getByLabel("Heart-rate observation source", { exact: true })
    .selectOption("wrist_device_estimate");
  await page
    .getByLabel("Your notes", { exact: true })
    .fill("Synthetic private cardio note");
  await page
    .getByLabel("Correction reason", { exact: true })
    .fill("Added actual user observations");
  await page.getByRole("button", { name: "Save audited correction" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Correction saved" }),
  ).toBeVisible();
  const detailUrl = page.url();
  const html = await (await request.get(detailUrl)).text();
  expect(html).not.toContain("Synthetic private cardio title");
  expect(html).not.toContain("Synthetic private cardio note");
  expect(html).toContain("noindex,nofollow");
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  await page.goto("/conditioning/custom");
  await page
    .getByLabel("Title", { exact: true })
    .fill("Synthetic interval routine");
  await page.getByLabel("Warm-up seconds", { exact: true }).fill("10");
  await page.getByLabel("Work seconds", { exact: true }).fill("45");
  await page.getByLabel("Recovery seconds", { exact: true }).fill("15");
  await page.getByLabel("Cool-down seconds", { exact: true }).fill("10");
  await page.getByLabel("Repetitions", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Create interval segments" }).click();
  await page
    .getByRole("button", { name: "Save local routine version" })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Immutable local version saved" }),
  ).toBeVisible();
  await page.goto("/conditioning");
  await page
    .getByRole("button", { name: "Start routine", exact: true })
    .click();
  await expect(page).toHaveURL(/\/cardio\/session\/active$/);
  await page.getByRole("button", { name: "Pause timer", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume timer", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Resume timer", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume timer", exact: true }).click();
  await page
    .getByRole("button", { name: "Skip current segment", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Segment 2: Work 1" }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.getByRole("button", { name: "Pause timer", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume timer", exact: true }),
  ).toBeVisible();
  await context.setOffline(false);
  await page.getByRole("button", { name: "Resume timer", exact: true }).click();
  await page
    .getByRole("button", { name: "Record urgent stop and pause", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Resume timer", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("alert").filter({ hasText: "Stop activity" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 320, height: 568 });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: "docs/screenshots/phase13-player-320.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "End and save session", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "No active session" }),
  ).toBeVisible();
  await page.goto("/cardio/settings");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download cardio JSON backup", exact: true })
    .click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).not.toBeNull();
  const backup = await readFile(path!, "utf8");
  const parsed = JSON.parse(backup) as {
    cardioSessions: {
      originalCompletedRecord: unknown;
      heartRateSource: string;
    }[];
    customRoutineVersions: unknown[];
  };
  expect(parsed.cardioSessions).toHaveLength(2);
  expect(
    parsed.cardioSessions.some(
      (s) => s.heartRateSource === "wrist_device_estimate",
    ),
  ).toBe(true);
  expect(parsed.customRoutineVersions).toHaveLength(1);
  expect(
    parsed.cardioSessions.every((s) => s.originalCompletedRecord !== null),
  ).toBe(true);
  await page
    .getByLabel("Cardio JSON backup file", { exact: true })
    .setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from(
        backup.replace('"companionVersion": 1', '"companionVersion": 999'),
      ),
    });
  await expect(
    page.getByRole("alert").filter({ hasText: "Nothing was written" }),
  ).toBeVisible();
  await page
    .getByLabel("Cardio JSON backup file", { exact: true })
    .setInputFiles({
      name: "valid.json",
      mimeType: "application/json",
      buffer: Buffer.from(backup),
    });
  await expect(page.getByText(/^Validated preview:/)).toBeVisible();
  await page.getByLabel("Restore mode", { exact: true }).selectOption("copy");
  await page
    .getByLabel("Confirm the reviewed restore mode", { exact: true })
    .check();
  await page
    .getByRole("button", { name: "Apply cardio restore", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "restore completed atomically" }),
  ).toBeVisible();
  await page.goto("/cardio");
  await page
    .getByRole("button", { name: "Load local concurrent context" })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Read-only local context loaded" }),
  ).toBeVisible();
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: "docs/screenshots/phase13-cardio-320.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.getByRole("complementary")).toBeVisible();
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();
    window.scrollTo(0, 0);
  });
  await page.screenshot({
    path: "docs/screenshots/phase13-cardio-1440.png",
    fullPage: true,
  });
  expect(external).toEqual([]);
});
test("cardio cross-tab ownership, keyboard, quota and storage denial", async ({
  page,
  context,
  browser,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/cardio/session/new");
  await page
    .getByLabel("Session title", { exact: true })
    .fill("Synthetic ownership test");
  await page.getByLabel("Activity category", { exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByLabel("Activity category", { exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Start local timer", exact: true })
    .click();
  await expect(page).toHaveURL(/\/cardio\/session\/active$/);
  const other = await context.newPage();
  await other.goto("/cardio/session/active");
  await other.getByRole("button", { name: "Pause timer", exact: true }).click();
  await expect(
    other.getByRole("alert").filter({ hasText: "Another tab owns" }),
  ).toBeVisible();
  await other
    .getByLabel("Confirm taking session control from another tab")
    .check();
  await other.getByRole("button", { name: "Pause timer", exact: true }).click();
  await expect(
    other.getByRole("button", { name: "Resume timer" }),
  ).toBeVisible();
  await other.close();
  await page.reload();
  await page
    .getByLabel("Confirm taking session control from another tab")
    .check();
  await page
    .getByRole("button", { name: "End and save session", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Session ended and saved locally." }),
  ).toBeVisible();
  await page.goto("/cardio/session/new");
  await page
    .getByLabel("Session title", { exact: true })
    .fill("Synthetic unsaved quota title");
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Synthetic quota denial", "QuotaExceededError");
    };
  });
  await page
    .getByRole("button", { name: "Start local timer", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Synthetic quota denial" }),
  ).toBeVisible();
  await expect(page.getByLabel("Session title", { exact: true })).toHaveValue(
    "Synthetic unsaved quota title",
  );
  const blocked = await browser.newContext();
  await blocked.addInitScript(() =>
    Object.defineProperty(window, "indexedDB", {
      get: () => {
        throw new DOMException("Synthetic storage denied", "SecurityError");
      },
    }),
  );
  const denied = await blocked.newPage();
  await denied.goto("/cardio/session/new");
  await expect(
    denied.getByRole("alert").filter({ hasText: "storage is unavailable" }),
  ).toBeVisible();
  await denied
    .getByLabel("Session title", { exact: true })
    .fill("Unsaved draft remains editable");
  await expect(denied.getByLabel("Session title", { exact: true })).toHaveValue(
    "Unsaved draft remains editable",
  );
  await blocked.close();
});
