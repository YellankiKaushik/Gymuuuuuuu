import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("public walking routine remains readable with private storage denied", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "indexedDB", {
      get: () => {
        throw Error("Synthetic private storage denial");
      },
    });
  });
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.goto("/warm-ups/routine-running-warmup");
  expect(
    await page.evaluate(() => {
      try {
        return window.indexedDB === undefined;
      } catch (error) {
        return (
          error instanceof Error &&
          error.message === "Synthetic private storage denial"
        );
      }
    }),
  ).toBe(true);
  await expect(
    page.getByRole("heading", { name: "Running Warm-Up", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Source walking step: 300 seconds", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Loading browser records…")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Copy to my routines" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(
    page.getByText("Source walking step: 300 seconds", { exact: true }),
  ).toBeVisible();
});
test("source routine copy survives reload and appears in local backup", async ({
  page,
}) => {
  await page.goto("/mobility/routines/routine-post-run-cooldown");
  await page.getByRole("button", { name: "Copy to my routines" }).click();
  await expect(page.getByRole("status")).toContainText("Source routine copied");
  await page.getByRole("link", { name: "Open my routines" }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Post-Run Cool-Down", exact: true }),
  ).toBeVisible();
  await page.goto("/recovery/settings");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export JSON backup", exact: true })
    .click();
  const result = await download;
  expect(await result.failure()).toBeNull();
});
