import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "/recovery",
  "/recovery/check-in",
  "/recovery/history",
  "/recovery/topics",
  "/recovery/topics/unavailable",
  "/sleep",
  "/sleep/log",
  "/sleep/history",
  "/sleep/methodology",
  "/mobility",
  "/mobility/routines/unavailable",
  "/mobility/session/unavailable",
  "/mobility/history",
  "/mobility/custom",
  "/mobility/custom/create",
  "/warm-ups",
  "/warm-ups/unavailable",
  "/recovery/settings",
  "/recovery/privacy",
];
for (const theme of ["light", "dark"])
  test(`Phase 12 route accessibility and layout in ${theme}`, async ({
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
        await expect(page.locator(".recovery-page")).toBeVisible();
        await expect(page.getByText("Loading browser records…")).toHaveCount(0);
        await expect(page.locator("h1")).toHaveCount(1);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth + 1,
          ),
        ).toBe(true);
        const result = await new AxeBuilder({ page }).analyze();
        expect(result.violations, `${route} ${width} ${theme}`).toEqual([]);
      }
    }
  });
test("local sleep, check-in, routine revision, resumable session and backup workflow", async ({
  page,
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
  page.on("dialog", (d) => void d.accept());
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
  await page.goto("/recovery/check-in");
  await page.getByLabel("Energy", { exact: true }).selectOption("2");
  await page.getByLabel("General fatigue", { exact: true }).selectOption("4");
  await page.getByLabel("Pain or injury concern", { exact: true }).check();
  await page.getByLabel("Reported pain concern severity (0–10)").fill("7");
  await page.getByRole("button", { name: "Add region", exact: true }).click();
  await page.getByLabel("Soreness 1", { exact: true }).fill("0");
  await page
    .getByRole("button", { name: "Save check-in", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Check-in saved" }),
  ).toBeVisible();
  await page.goto("/mobility/custom/create");
  await page
    .getByLabel("Routine title", { exact: true })
    .fill("Synthetic private routine");
  await page.getByLabel("Step 1 title", { exact: true }).fill("Synthetic step");
  await page.getByLabel("Step 1 dose", { exact: true }).fill("30");
  await page
    .getByRole("button", { name: "Save routine version", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Immutable routine version saved" }),
  ).toBeVisible();
  await page.goto("/mobility/custom");
  await page.getByRole("link", { name: "Open routine", exact: true }).click();
  const sessionUrl = page.url();
  await page
    .getByRole("button", { name: "Start routine", exact: true })
    .click();
  await page.getByRole("button", { name: "Resume", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Pause", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 320, height: 568 });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "docs/screenshots/phase12-player-320.png",
    fullPage: true,
  });
  await page.context().setOffline(true);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Resume", exact: true }),
  ).toBeVisible();
  await page.context().setOffline(false);
  await page.goto("/mobility/custom");
  await page
    .getByRole("link", { name: "Create revision", exact: true })
    .click();
  await page
    .getByLabel("Step 1 title", { exact: true })
    .fill("Revised synthetic step");
  await page
    .getByLabel("Revision reason", { exact: true })
    .fill("Synthetic revision check");
  await page
    .getByRole("button", { name: "Save routine version", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Immutable routine version saved" }),
  ).toBeVisible();
  await page.goto(sessionUrl);
  await expect(
    page.getByRole("heading", { name: "Synthetic step", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Complete step", exact: true })
    .click();
  await page.goto("/mobility/history");
  await expect(page.getByText(/completed · version 1/)).toBeVisible();
  await page
    .getByLabel("Session notes", { exact: true })
    .fill("Test-only feedback");
  await page
    .getByRole("button", { name: "Save feedback", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Session feedback saved" }),
  ).toBeVisible();
  await page.goto("/recovery/settings");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export JSON backup", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe(
    "fitness-os-recovery-backup.json",
  );
  expect(external).toEqual([]);
  const privateHtml = await (
    await page.request.get(new URL(sessionUrl).pathname)
  ).text();
  expect(privateHtml).not.toContain("Synthetic private routine");
  expect(privateHtml).not.toContain("Test-only feedback");
  expect(privateHtml).toContain("noindex,nofollow");
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/recovery");
  await expect(
    page.getByRole("heading", { name: "Latest sleep report", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/phase12-recovery-320.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({
    path: "docs/screenshots/phase12-recovery-1440.png",
    fullPage: true,
  });
});
test("keyboard, reduced motion, additional widths, quota and storage-denied states", async ({
  page,
  browser,
}) => {
  test.setTimeout(60000);
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.goto("/recovery/check-in");
  await page.getByLabel("Energy", { exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByLabel("Energy", { exact: true })).toHaveValue("1");
  await expect(page.getByLabel("Energy", { exact: true })).toBeFocused();
  for (const [width, height] of [
    [320, 568],
    [390, 844],
    [768, 1024],
    [1366, 768],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width: width!, height: height! });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  }
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const request = indexedDB.open("fitness-os-recovery-sleep-mobility", 2);
        request.onsuccess = () => {
          const db = request.result,
            tx = db.transaction("phase12_recovery_checkins", "readwrite");
          tx.objectStore("phase12_recovery_checkins").put({
            id: "recovery_missing_link",
            date: "2026-10-05",
            timezone: "UTC",
            createdAt: "2026-10-05T00:00:00Z",
            updatedAt: "2026-10-05T00:00:00Z",
            regionalSoreness: [],
            alertCategories: [],
            linkedWorkoutSessionIds: ["missing_fixture_workout"],
          });
          tx.oncomplete = () => {
            db.close();
            resolve();
          };
          tx.onabort = () => reject(Error("Fixture setup failed"));
        };
        request.onerror = () => reject(Error("Fixture database failed"));
      }),
  );
  await page.reload();
  await page
    .getByLabel("Edit an existing check-in", { exact: true })
    .selectOption("recovery_missing_link");
  await page
    .getByRole("button", { name: "Load completed workouts", exact: true })
    .click();
  await expect(
    page.getByText(/^Completed workout unavailable in this browser/),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Remove unavailable workout link",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Save check-in", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Check-in saved" }),
  ).toBeVisible();
  await page.goto("/sleep/log");
  await page
    .getByLabel("Notes", { exact: true })
    .fill("Synthetic unsaved quota fixture");
  await page.evaluate(() => {
    IDBObjectStore.prototype.put = function () {
      throw new DOMException("Synthetic quota denial", "QuotaExceededError");
    };
  });
  await page
    .getByRole("button", { name: "Save sleep entry", exact: true })
    .click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Synthetic quota denial" }),
  ).toBeVisible();
  await expect(page.getByLabel("Notes", { exact: true })).toHaveValue(
    "Synthetic unsaved quota fixture",
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
  await denied.goto("/recovery");
  await expect(
    denied.getByRole("alert").filter({ hasText: "storage is unavailable" }),
  ).toBeVisible();
  await blocked.close();
});
