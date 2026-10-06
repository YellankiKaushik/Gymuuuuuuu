import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("@a11y source running schedule is usable, filtered and selectable without saving a session", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/cardio/plans");
  const result = page.getByRole("link", {
    name: "General 5K Foundation Plan",
    exact: true,
  });
  await expect(result).toBeVisible();
  const minutes = page.getByRole("spinbutton", {
    name: "Available session minutes",
    exact: true,
  });
  await minutes.fill("30");
  await expect(result).toHaveCount(0);
  await minutes.fill("40");
  await expect(result).toBeVisible();
  await result.click();
  await expect(
    page.getByRole("heading", { name: "Week 9", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/original update date not available/),
  ).toBeVisible();
  await expect(page.getByText(/source text/)).toBeVisible();
  for (const theme of ["light", "dark"]) {
    await page.evaluate((value) => {
      document.documentElement.dataset.theme = value;
    }, theme);
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
  }
  await page
    .getByRole("link", { name: "Choose a source run in the optional tracker" })
    .click();
  await page
    .getByRole("combobox", { name: "Published source plan", exact: true })
    .selectOption("plan_5k_general_foundation");
  await page
    .getByRole("combobox", { name: "Source week", exact: true })
    .selectOption("5");
  await page
    .getByRole("combobox", { name: "Source run", exact: true })
    .selectOption("3");
  await expect(
    page.getByRole("button", { name: "Start local timer" }),
  ).toBeEnabled();
  await expect(
    page.getByRole("checkbox", { name: "Record a completed session manually" }),
  ).not.toBeChecked();
  await expect(
    page.getByText(/nothing is saved until you start or save/),
  ).toBeVisible();
  await page.goto("/cardio/history");
  await expect(page.locator('a[href^="/cardio/history/cardio_"]')).toHaveCount(
    0,
  );
});
