import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("food discovery filters, sourced publication and safe unknown profiles", async ({
  page,
}) => {
  await page.goto("/foods");
  await expect(
    page.getByRole("heading", { name: "Know what’s in your food." }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Search foods" }).fill("apple");
  await expect(page).toHaveURL(/q=apple/);
  await expect(
    page.getByRole("heading", { name: "Apple", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search foods" })
    .fill("unmatched-identity-zzzz");
  await expect(
    page.getByRole("heading", { name: "No reviewed profiles match." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Food filters", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Category", { exact: true }).selectOption("fruits");
  await dialog.getByRole("button", { name: "Show results" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(/category=fruits/);
  await page.goto("/foods/compare?profiles=profile_draft,profile_unknown");
  await expect(
    page.getByRole("heading", { name: "Choose reviewed food profiles." }),
  ).toBeVisible();
  await page.goto("/foods/apple");
  await expect(
    page.getByRole("heading", { name: "Apple", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Publication review level", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /Personal-use publication after source matching and machine validation/,
    ),
  ).toBeVisible();
  await page.goto("/foods/amla");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
  await page.goto("/foods/categories");
  await expect(
    page.getByRole("heading", { name: "Food categories", exact: true }),
  ).toBeVisible();
  await page.goto("/foods/sources");
  await expect(
    page.getByText("46 source-backed foods and 47 machine-validated profiles", {
      exact: false,
    }),
  ).toBeVisible();
  await page.goto("/foods/methodology");
  await expect(
    page.getByRole("heading", { name: "Missing is different from zero" }),
  ).toBeVisible();
});
test("food catalogue reflows and exposes accessible filter dialog", async ({
  page,
}) => {
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/foods");
    await expect(
      page.getByRole("textbox", { name: "Search foods" }),
    ).toBeEnabled();
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (t) => (document.documentElement.dataset.theme = t),
        theme,
      );
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
      .getByRole("button", { name: "Food filters", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Food filters", exact: true }),
    ).toBeFocused();
  }
});
