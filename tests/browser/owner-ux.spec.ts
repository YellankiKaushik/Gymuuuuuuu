import { test, expect, settleLayout } from "./test";
import AxeBuilder from "@axe-core/playwright";

for (const [timezoneId, instant, local] of [
  ["UTC", "2026-10-16T04:00:00Z", "2026-10-16T04:00"],
  ["Asia/Kolkata", "2026-10-16T04:00:00Z", "2026-10-16T09:30"],
  ["America/Los_Angeles", "2026-10-16T04:00:00Z", "2026-10-15T21:00"],
  ["Asia/Kolkata", "2026-10-15T18:31:00Z", "2026-10-16T00:01"],
] as const) {
  test.describe(`${timezoneId} ${local}`, () => {
    test.use({ timezoneId });
    test("PROG-001 local defaults, save, edit and reload retain the intended instant", async ({
      page,
    }) => {
      await page.clock.install({ time: new Date(instant) });
      await page.goto("/progress/weight");
      await expect(page.getByText("Saved in this browser")).toBeVisible();
      const form = page
        .locator("form")
        .filter({ has: page.getByLabel("Weight", { exact: true }) });
      await expect(form.locator('[name="measuredAt"]')).toHaveValue(local);
      await expect(form.locator('[name="localDate"]')).toHaveValue(
        local.slice(0, 10),
      );
      await form.getByLabel("Weight", { exact: true }).fill("80");
      await form
        .getByRole("button", { name: "Save measurement", exact: true })
        .click();
      const row = page.getByRole("row").filter({ hasText: "80 kg" });
      await row.getByRole("button", { name: "Edit", exact: true }).click();
      const input = row.getByLabel("Validated record JSON");
      const record = JSON.parse(await input.inputValue()) as {
        measuredAt: string;
        notes: string;
      };
      expect(record.measuredAt).toBe(new Date(instant).toISOString());
      record.measuredAt = new Date(Date.parse(instant) - 60_000).toISOString();
      record.notes = "SYNTHETIC-OWNER-UX";
      await input.fill(JSON.stringify(record));
      await row.getByRole("button", { name: "Save edit" }).click();
      await expect(page.getByText("Record updated.")).toBeVisible();
      await page.reload();
      await row.getByRole("button", { name: "Edit", exact: true }).click();
      expect(JSON.parse(await input.inputValue())).toMatchObject({
        measuredAt: record.measuredAt,
        notes: record.notes,
      });
    });
  });
}

test("PROG-002 newest active height wins over IndexedDB key order after reopen", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-16T04:00:00Z") });
  await page.goto("/progress/weight");
  await expect(page.getByText("Saved in this browser")).toBeVisible();
  await page.evaluate(async () => {
    const request = indexedDB.open("fitness-os");
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const timestamp = "2026-10-16T03:00:00Z";
    const tx = db.transaction("heightMeasurements", "readwrite");
    for (const [id, measuredAt, valueCm, deletedAt] of [
      ["aaa-newest", timestamp, 180, null],
      ["zzz-oldest", "2026-01-01T03:00:00Z", 160, null],
      ["future", "2027-01-01T00:00:00Z", 190, null],
      ["deleted", timestamp, 200, timestamp],
    ] as const)
      tx.objectStore("heightMeasurements").put({
        id,
        measuredAt,
        valueCm,
        deletedAt,
        createdAt: timestamp,
        updatedAt: timestamp,
        localDate: measuredAt.slice(0, 10),
        timezone: "UTC",
        source: "manual",
        notes: null,
      });
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  });
  await page.reload();
  await expect(page.getByText("Saved in this browser")).toBeVisible();
  await page.getByLabel("Weight", { exact: true }).fill("80");
  await page
    .getByRole("button", { name: "Save measurement", exact: true })
    .click();
  await expect(page.getByText(/BMI screening value: 24.7/)).toBeVisible();
  await page.reload();
  await expect(page.getByText(/BMI screening value: 24.7/)).toBeVisible();
  await expect(
    page.getByRole("img", {
      name: "Weight by recorded local date, in kilograms",
    }),
  ).toBeVisible();
});

for (const [width, height] of [
  [320, 800],
  [375, 812],
  [393, 852],
  [768, 1024],
  [1024, 768],
  [1280, 720],
  [1440, 700],
] as const) {
  test(`@a11y owner Home and navigation at ${width}x${height}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Your module map" }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    if (width >= 1024) {
      expect(
        await page
          .locator(".desktop-sidebar")
          .evaluate((el) => el.scrollHeight <= el.clientHeight),
      ).toBe(true);
      for (const name of [
        "Home",
        "Learn",
        "Train",
        "Eat",
        "Recover",
        "Progress",
        "Tools",
        "Saved",
        "Settings",
      ])
        await expect(
          page
            .locator(".desktop-sidebar")
            .getByRole("link", { name, exact: true }),
        ).toBeInViewport();
      await page.getByRole("button", { name: "Expand Learn group" }).click();
      await expect(
        page
          .locator(".nav-children")
          .getByRole("link", { name: "Muscle library" }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", { name: "Expand Learn group" }),
      ).toBeFocused();
    }
    const links = await page
      .locator(".home-module a")
      .evaluateAll((elements) => elements.map((el) => el.getAttribute("href")));
    expect(links).toContain("/settings/data");
    for (const theme of ["light", "dark"] as const) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
      }, theme);
      await settleLayout(page);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
  });
}

test("theme Auto follows runtime changes; manual choices and reload override the system", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/settings");
  await page.getByRole("radio", { name: "Auto (System)", exact: true }).check();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("radio", { name: "Light", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "light" });
  await page.getByRole("radio", { name: "Dark", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("radio", { name: "Auto (System)", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.reload();
  await expect(
    page.getByRole("radio", { name: "Auto (System)", exact: true }),
  ).toBeChecked();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

for (const path of [
  "/programs",
  "/diet-planning",
  "/recovery",
  "/sleep",
  "/cardio",
  "/supplements",
  "/settings/data",
]) {
  test(`@a11y informative module diagram ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator(".information-path").first()).toBeVisible();
    for (const width of [393, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ["light", "dark"]) {
        await page.evaluate((value) => {
          document.documentElement.dataset.theme = value;
        }, theme);
        await settleLayout(page);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        expect(
          (
            await new AxeBuilder({ page })
              .withTags([
                "wcag2a",
                "wcag2aa",
                "wcag21a",
                "wcag21aa",
                "wcag22aa",
              ])
              .analyze()
          ).violations,
        ).toEqual([]);
      }
    }
  });
}

test("body front/back controls mirror the keyboard-accessible region list", async ({
  page,
}) => {
  await page.goto("/muscles");
  await page.getByRole("button", { name: "Body", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    page.getByRole("img", { name: "Back body-region navigation silhouette" }),
  ).toBeVisible();
  const map = page.locator(".body-map button").first();
  const label = (await map.getAttribute("aria-label"))!
    .replace("Select ", "")
    .replace(" on body map", "");
  await map.click();
  const list = page
    .locator(".region-text-list")
    .getByRole("button", { name: label, exact: true });
  await expect(list).toHaveAttribute("aria-pressed", "true");
  await list.focus();
  await page.keyboard.press("Enter");
  await expect(map).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Front", exact: true }).click();
  await expect(
    page.getByRole("img", { name: "Front body-region navigation silhouette" }),
  ).toBeVisible();
});

test("exercise discovery reuses local reviewed visuals with alternative text", async ({
  page,
}) => {
  await page.goto("/exercises");
  const images = page.locator("img.exercise-preview");
  expect(await images.count()).toBeGreaterThan(0);
  for (const image of await images.all()) {
    expect(await image.getAttribute("alt")).toBeTruthy();
    expect(await image.getAttribute("src")).toMatch(
      /^\/media\/[a-z0-9-]+\.svg$/,
    );
  }
  await images.first().scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      images.first().evaluate((el) => (el as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
});

for (const [saved, colorScheme, expected] of [
  ['{"theme":"dark","units":"metric"}', "light", "dark"],
  ['{"theme":"light","units":"metric"}', "dark", "light"],
  ["{invalid-json", "dark", "dark"],
] as const) {
  test(`theme first paint before hydration: ${saved} on ${colorScheme}`, async ({
    browser,
    baseURL,
  }) => {
    const origin = new URL(baseURL!).origin;
    const context = await browser.newContext({
      colorScheme,
      storageState: {
        cookies: [],
        origins: [
          {
            origin,
            localStorage: [{ name: "fitness-os:preferences:v1", value: saved }],
          },
        ],
      },
    });
    // Deliberately prevent application hydration; the nonce-bearing early script
    // must select the right theme independently of the client bundle.
    await context.route("**/assets/*.js", (route) => route.abort());
    const page = await context.newPage();
    try {
      await page.goto(origin);
      await expect(page.locator("html")).toHaveAttribute(
        "data-theme",
        expected,
      );
      await expect(
        page.getByRole("button", { name: "Search Fitness OS", exact: true }),
      ).toBeDisabled();
    } finally {
      await context.close();
    }
  });
}
