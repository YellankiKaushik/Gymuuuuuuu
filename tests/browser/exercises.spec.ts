import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("exercise multiselect, URL restoration, dialog focus and safe content gates", async ({
  page,
}) => {
  await page.goto("/exercises");
  await expect(
    page.getByRole("button", { name: "Search Fitness OS" }),
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Horizontal push", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Horizontal pull", exact: true })
    .click();
  await page.getByRole("button", { name: "Dumbbell", exact: true }).click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Horizontal push", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Horizontal pull", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("textbox", { name: "Search exercises" }).fill("bench");
  await expect(page).toHaveURL(/q=bench/);
  await page.getByRole("button", { name: /^Filters/ }).click();
  await expect(
    page.getByRole("dialog", { name: "Exercise filters" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: /^Filters/ })).toBeFocused();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.goto("/exercises/barbell-bench-press");
  await expect(
    page.getByRole("heading", { name: "Exercise not available", exact: true }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
});
test("exercise mobile, dark, zoom reflow and invalid queries", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/exercises?type=fake&equipment=fake");
  await expect(
    page.getByRole("button", { name: "Search Fitness OS" }),
  ).toBeEnabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page
    .getByRole("dialog")
    .locator("summary")
    .filter({ hasText: /^equipment/ })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("checkbox", { name: "Barbell", exact: true })
    .check();
  await page.getByRole("button", { name: "Show results", exact: true }).click();
  await page.goto("/settings");
  await page.getByRole("radio", { name: "Dark", exact: true }).check();
  await page.goto("/exercises");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.evaluate(() => {
    document.documentElement.style.zoom = "2";
  });
  const reflow = await page.evaluate(() => ({
    viewport: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    elements: [...document.querySelectorAll<HTMLElement>("body *")]
      .map((element) => ({
        tag: element.tagName,
        className: element.className,
        right: element.getBoundingClientRect().right,
        width: element.getBoundingClientRect().width,
      }))
      .filter((element) => element.right > innerWidth + 1),
  }));
  expect(reflow.scrollWidth, JSON.stringify(reflow)).toBeLessThanOrEqual(
    reflow.viewport,
  );
});
