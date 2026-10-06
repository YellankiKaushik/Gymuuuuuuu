import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicRoutes = [
  ["/muscles/biceps-brachii", "Biceps brachii"],
  ["/muscles/latissimus-dorsi", "Latissimus dorsi"],
  ["/muscles/trapezius", "Trapezius"],
  ["/exercises/dumbbell-curl", "Dumbbell curl"],
  ["/exercises/dumbbell-lateral-raise", "Dumbbell lateral raise"],
  [
    "/exercises/seated-dumbbell-shoulder-press",
    "Seated dumbbell shoulder press",
  ],
  ["/foods/apple", "Apple"],
  ["/nutrients/iron", "Iron"],
  ["/nutrients/thiamin-vitamin-b1", "Thiamin (vitamin B1)"],
  ["/nutrients/riboflavin-vitamin-b2", "Riboflavin (vitamin B2)"],
  ["/nutrients/niacin-vitamin-b3", "Niacin (vitamin B3)"],
  ["/nutrients/vitamin-b6", "Vitamin B6"],
  ["/recipes/egg-potato-bowl", "Hard-boiled egg and potato bowl"],
  ["/recipes/cooked-oat-banana-bowl", "Cooked oat and banana bowl"],
  [
    "/meal-plans/templates/rice-chickpea-meal-prep",
    "Rice and chickpea meal-prep collection",
  ],
  ["/recipes/chickpea-cucumber-bowl", "Chickpea and cucumber bowl"],
  ["/recovery/topics/sleep-duration-adults", "Adult Sleep Duration"],
  ["/cardio/learn/topic-talk-test", "Talk Test"],
  [
    "/supplements/ingredients/ingredient-creatine-monohydrate",
    "Creatine Monohydrate",
  ],
] as const;
for (const [path, title] of publicRoutes) {
  test(`@a11y Phase 19 published content ${path}`, async ({ page }) => {
    const errors: string[] = [];
    const remote: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("request", (request) => {
      if (!request.url().startsWith("http://127.0.0.1:3000"))
        remote.push(request.url());
    });
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name: title, exact: true }).first(),
    ).toBeVisible();
    await expect(
      page
        .getByText(/personal.use publication|published_personal_use/i)
        .first(),
    ).toBeVisible();
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
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
    }
    expect(errors).toEqual([]);
    expect(remote).toEqual([]);
  });
}
test("public recipe loads independently of personal databases and rejects unknown slugs", async ({
  page,
}) => {
  await page.goto("/recipes/chickpea-cucumber-bowl");
  await expect(
    page.getByRole("heading", { name: "Exact ingredients" }),
  ).toBeVisible();
  await expect(page.getByText(/estimated batch mass/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Exact food profile" }).first(),
  ).toHaveAttribute("href", "/foods/chickpea");
  await page.goto("/recipes/unpublished-example");
  await expect(
    page.getByRole("heading", { name: "Public recipe unavailable" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
});
test("public food data retries safely in the local diary without saving consumed records", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/assets/fruits-*.json", (route) => route.abort());
  await page.goto("/nutrition/add");
  await page
    .getByRole("combobox", { name: "Entry type", exact: true })
    .selectOption("canonical");
  await page.getByLabel("Search reviewed foods").fill("apple");
  await page
    .getByRole("combobox", { name: "Exact food profile", exact: true })
    .selectOption("profile_apple_fdc_1750341");
  await expect(page.getByRole("alert")).toContainText(
    "Your saved records have not changed",
  );
  await expect(
    page.getByRole("button", { name: "Save consumed entry", exact: true }),
  ).toBeDisabled();
  await page.unroute("**/assets/fruits-*.json");
  await page.getByRole("button", { name: "Retry food data" }).click();
  await page.getByLabel("Consumed mass", { exact: true }).fill("100");
  await expect(
    page.getByRole("heading", { name: "Nutrient preview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save consumed entry", exact: true }),
  ).toBeEnabled();
  expect(errors).toEqual([]);
});

test("public meal collection is read-only, source-linked and separate from private meal plans", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.indexedDB, "open", {
      value: () => {
        throw Error("Personal storage denied during public collection viewing");
      },
    });
  });
  await page.goto("/meal-plans/templates");
  await expect(page.getByRole("status")).toContainText("3 collections");
  await page
    .getByRole("link", {
      name: "Rice and chickpea meal-prep collection",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Exact menu", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("not a complete daily diet", { exact: false }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Rice and chickpea bowl", exact: true }),
  ).toHaveAttribute("href", "/recipes/rice-chickpea-bowl");
  await expect(page.getByRole("table")).toBeVisible();
  await page.goto("/meal-plans/templates/audit-unknown-record");
  await expect(
    page.getByRole("heading", { name: "Collection unavailable", exact: true }),
  ).toBeVisible();
});
