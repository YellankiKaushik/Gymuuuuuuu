import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
test("six-step flexibility copy preserves readable source provenance in backup @a11y", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.goto("/mobility/routines/routine-calf-flexibility");
  await page.getByRole("button", { name: "Copy to my routines" }).click();
  await expect(page.getByRole("status")).toContainText("Source routine copied");
  await page.getByRole("link", { name: "Open my routines" }).click();
  await expect(page).toHaveURL(/\/mobility\/custom$/);
  await expect(
    page.getByText("6 steps · Unknown estimated minutes"),
  ).toBeVisible();
  await page.reload();
  await page.getByText("Original source instructions", { exact: true }).click();
  await expect(
    page.getByText("Your changes do not alter this original source snapshot.", {
      exact: false,
    }),
  ).toBeVisible();
  const details = page
    .locator("details")
    .filter({
      has: page.getByText("Original source instructions", { exact: true }),
    });
  await expect(details.locator("ol > li")).toHaveCount(6);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/recovery/settings");
  const pending = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export JSON backup", exact: true })
    .click();
  const download = await pending;
  const path = await download.path();
  expect(path).not.toBeNull();
  const backup: unknown = JSON.parse(await readFile(path!, "utf8"));
  expect(backup).toMatchObject({
    customRoutineVersions: [
      {
        publicationProvenance: {
          publicIdentity: "routine_calf_flexibility",
          reviewLevel: "published_personal_use",
          sourceSteps: Array.from({ length: 6 }, () => ({ doseValue: 10 })),
        },
      },
    ],
  });
});
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
  // A full-document link must finish navigating before reload; otherwise WebKit
  // may reload the preceding public page rather than the saved local library.
  await expect(page).toHaveURL(/\/mobility\/custom$/);
  await expect(
    page.getByRole("heading", { name: "Post-Run Cool-Down", exact: true }),
  ).toBeVisible();
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
