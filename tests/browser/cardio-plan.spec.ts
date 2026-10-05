import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("local cardio plan selection, HR method snapshot, revisions, laps and CSV", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/cardio/custom-plans/create");
  await page
    .getByLabel("Title", { exact: true })
    .fill("Synthetic private plan");
  await page
    .getByLabel("Your goal", { exact: true })
    .fill("Synthetic user-selected goal");
  await page.getByLabel("Duration weeks", { exact: true }).fill("2");
  await page
    .getByRole("button", { name: "Add plan session", exact: true })
    .click();
  await page
    .getByLabel("Session title", { exact: true })
    .fill("Synthetic HR slot");
  await page.getByRole("button", { name: "Add segment", exact: true }).click();
  await page
    .getByLabel("Target method", { exact: true })
    .selectOption("heart_rate_reserve");
  await page.getByLabel("Maximum bpm", { exact: true }).fill("190");
  await page.getByLabel("Resting bpm", { exact: true }).fill("60");
  await page
    .getByLabel("Your lower fraction (0–1)", { exact: true })
    .fill("0.5");
  await page
    .getByLabel("Your upper fraction (0–1)", { exact: true })
    .fill("0.7");
  await expect(page.getByText(/^Selected target:/)).toContainText("125–151");
  await page
    .getByRole("button", { name: "Save local plan version", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Immutable local version saved" }),
  ).toBeVisible();
  await page.goto("/cardio/custom-plans");
  await page
    .getByRole("button", { name: "Use as my current cardio plan", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Current local cardio plan selected" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Start Synthetic HR slot", exact: true })
    .click();
  await expect(page).toHaveURL(/\/cardio\/session\/active$/);
  await expect(page.getByText(/^125–151 bpm$/)).toBeVisible();
  await page
    .getByLabel("Actual distance for this lap m", { exact: true })
    .fill("100");
  await page.getByRole("button", { name: "Record lap", exact: true }).click();
  await expect(page.getByText(/^Lap 1:/)).toContainText("100 m");
  await page
    .getByRole("button", { name: "End and save session", exact: true })
    .click();
  await expect(
    page.getByText("Session ended and saved locally.", { exact: true }),
  ).toBeVisible();
  await page.goto("/cardio/custom-plans/create");
  const select = page.getByLabel("Saved plan version", { exact: true });
  await expect(select.locator("option")).toHaveCount(2);
  const value = await select.locator("option").last().getAttribute("value");
  await select.selectOption(value!);
  await page
    .getByLabel("Title", { exact: true })
    .fill("Revised synthetic private plan");
  await page
    .getByLabel("Revision reason", { exact: true })
    .fill("Synthetic later revision");
  await page
    .getByLabel("Your lower fraction (0–1)", { exact: true })
    .fill("0.6");
  await page
    .getByRole("button", { name: "Save local plan version", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Immutable local version saved" }),
  ).toBeVisible();
  await page.goto("/cardio/history");
  await page
    .getByRole("link", { name: "Synthetic HR slot", exact: true })
    .click();
  await expect(page.getByText(/^Frozen source:/)).toContainText(
    "Synthetic private plan · version 1",
    { timeout: 15_000 },
  );
  await expect(page.getByText(/^Original target:/)).toContainText(
    "hr-fraction-arithmetic-1",
  );
  await page
    .getByLabel("Your notes", { exact: true })
    .fill("First audited note");
  await page
    .getByLabel("Correction reason", { exact: true })
    .fill("First correction");
  await page
    .getByRole("button", { name: "Save audited correction", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Correction saved" }),
  ).toBeVisible();
  await page
    .getByLabel("Your notes", { exact: true })
    .fill("Second audited note");
  await page
    .getByLabel("Correction reason", { exact: true })
    .fill("Second correction");
  await page
    .getByRole("button", { name: "Save audited correction", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Correction saved" }),
  ).toBeVisible();
  await expect(page.locator("details")).toContainText("First correction");
  await expect(page.locator("details")).toContainText("Second correction");
  for (const route of [
    "/cardio",
    "/cardio/history",
    "/cardio/progress",
    "/cardio/custom-plans",
  ]) {
    await page.goto(route);
    await expect(page.getByText("Loading browser records…")).toHaveCount(0);
    for (const width of [320, 390, 768, 1366, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth + 1,
        ),
      ).toBe(true);
    }
    await page.setViewportSize({ width: 320, height: 568 });
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  }
  await page.goto("/cardio/settings");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "cardio-segments.csv", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe("cardio-segments.csv");
});
