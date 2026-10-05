import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("creates immutable recipe versions, manual plans, leftovers, groceries and explicit consumed snapshots", async ({
  page,
}) => {
  test.setTimeout(120000);
  page.on(
    "dialog",
    (d) => void d.accept(d.type() === "prompt" ? "6" : undefined),
  );
  const remote: string[] = [];
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://127.0.0.1:3000") &&
      !r.url().startsWith("http://localhost:3000")
    )
      remote.push(r.url());
  });
  await page.goto("/nutrition/custom-foods");
  await page.getByLabel("Custom food name").fill("Synthetic recipe ingredient");
  await page.getByLabel("Serving description").fill("Test-only serving");
  await page.getByLabel("Serving mass (g)").fill("100");
  await page.getByLabel("Energy (kcal)", { exact: true }).fill("100");
  await page.getByLabel("Protein (g)", { exact: true }).fill("10");
  await page.getByRole("button", { name: "Save custom food revision" }).click();
  await expect(
    page.getByRole("link", {
      name: "Synthetic recipe ingredient",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/recipes/create");
  await page.getByLabel("Recipe title").fill("Synthetic private recipe");
  await page
    .getByLabel("Ingredient source")
    .selectOption({ label: "Synthetic recipe ingredient · custom food" });
  await page.getByLabel("Edible mass (g)", { exact: true }).fill("100");
  await page
    .getByRole("button", { name: "Add ingredient", exact: true })
    .click();
  await page
    .getByLabel("Instructions (one step per line)")
    .fill("Test-only no-cook preparation.");
  await page.getByLabel("Final edible mass, without container (g)").fill("100");
  await page.getByLabel("Serving count", { exact: true }).fill("2");
  await page.getByLabel("Measured serving mass (g), optional").fill("50");
  await page
    .getByLabel("Measurement date and time (UTC)")
    .fill("2026-10-04T00:00");
  await page
    .getByRole("button", { name: "Save immutable recipe version" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Synthetic private recipe",
      exact: true,
    }),
  ).toBeVisible();
  const recipeUrl = page.url();
  await page.getByLabel("Consumed date").fill("2026-10-04");
  await page.getByLabel("Consumed local time").fill("12:00");
  await page
    .getByRole("button", { name: "Log consumed serving", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Consumed recipe saved" }),
  ).toBeVisible();
  await page.goto("/meal-plans/create");
  await page.getByLabel("Plan title").fill("Synthetic private calendar");
  await page.getByLabel("Start date").fill("2026-10-04");
  await page.getByLabel("Number of days (1–28)").fill("2");
  await page.getByRole("button", { name: "Create manual plan" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Synthetic private calendar",
      exact: true,
    }),
  ).toBeVisible();
  const planUrl = page.url();
  await page.getByLabel("Item", { exact: true }).selectOption({
    label: "Synthetic private recipe · current recipe version",
  });
  await page.getByLabel("Serving equivalents / quantity").fill("2");
  await page
    .getByRole("button", { name: "Add planned item", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Prepare a batch", exact: true })
    .click();
  await page
    .getByLabel("Reason for revised plan")
    .fill("Prepared six serving equivalents");
  await page
    .getByRole("button", { name: "Save new meal-plan version" })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "New meal-plan version saved" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText("2026-10-04 · 6 produced · 4 available", { exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Grocery lists", exact: true }).click();
  await page
    .getByRole("button", { name: "Generate for current plan version" })
    .click();
  await expect(
    page.getByText("Required: 300 g · Remaining: 300 g", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("On hand (g)").fill("50");
  await page
    .getByLabel("Manual package/purchase quantity")
    .fill("User-entered package note");
  await page.getByRole("button", { name: "Save grocery state" }).click();
  await expect(
    page.getByText("Required: 300 g · Remaining: 250 g", { exact: true }),
  ).toBeVisible();
  await page.goto(recipeUrl);
  await page.getByRole("link", { name: "Create a revised version" }).click();
  await page.getByLabel("Recipe title").fill("Revised synthetic recipe");
  await page.getByLabel("Reason for this version").fill("Title revision");
  await page
    .getByRole("button", { name: "Save immutable recipe version" })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Revised synthetic recipe",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto(planUrl);
  await expect(
    page.getByRole("heading", {
      name: "Synthetic private recipe",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/nutrition/day/2026-10-04");
  await expect(
    page.getByRole("heading", {
      name: "Synthetic private recipe",
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/meal-plans/settings");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export full JSON backup", exact: true })
    .click();
  expect((await download).suggestedFilename()).toBe(
    "recipes-meal-plans-backup.json",
  );
  expect(remote).toEqual([]);
});
test("Phase 11 routes remain accessible without private records at desktop and narrow widths", async ({
  page,
}) => {
  test.setTimeout(180000);
  for (const width of [320, 768, 1440])
    for (const theme of ["light", "dark"]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/settings");
      await page
        .getByRole("radio", {
          name: theme === "dark" ? "Dark" : "Light",
          exact: true,
        })
        .check();
      for (const path of [
        "/recipes",
        "/recipes/create",
        "/recipes/unpublished",
        "/recipes/local/recipe_missing",
        "/recipes/local/recipe_missing/edit",
        "/recipes/methodology",
        "/meal-plans",
        "/meal-plans/create",
        "/meal-plans/mplan_missing",
        "/meal-plans/mplan_missing/grocery-list",
        "/meal-plans/templates",
        "/meal-plans/settings",
        "/meal-plans/privacy",
      ]) {
        await page.goto(path);
        await expect(page.locator("h1")).toHaveCount(1);
        await expect(
          page.getByText(
            /Loading (local recipe records|recipe editor|meal plans|meal-plan settings|meal plan|grocery lists)/,
          ),
        ).toHaveCount(0);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        expect(results.violations).toEqual([]);
      }
      if (theme === "light" && [320, 1440].includes(width)) {
        await page.goto("/recipes/create");
        await expect(page.getByLabel("Recipe title")).toBeVisible();
        await page.evaluate(() => {
          (document.activeElement as HTMLElement)?.blur();
          window.scrollTo(0, 0);
        });
        await page.screenshot({
          path: `docs/screenshots/phase11-recipe-${width}.png`,
          fullPage: true,
        });
      }
    }
});
