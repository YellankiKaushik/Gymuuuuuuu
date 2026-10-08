import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("@a11y published food comparison retains source preparations, missing values and local saves", async ({
  page,
}) => {
  const remote: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).origin !== "http://127.0.0.1:3000")
      remote.push(request.url());
  });
  for (const [query, title] of [
    ["apple", "Apple"],
    ["brown rice", "Brown rice"],
  ]) {
    await page.goto(`/search?q=${encodeURIComponent(query!)}&type=food`);
    const card = page.getByRole("article").filter({
      has: page.getByRole("heading", { name: title!, exact: true }),
    });
    await card
      .getByRole("button", { name: "Add to compare", exact: true })
      .click();
    await expect(
      card.getByRole("button", { name: "Add to compare", exact: true }),
    ).toBeDisabled();
  }
  await page.goto("/compare/foods");
  const apple = page
    .getByRole("article")
    .filter({ has: page.getByRole("heading", { name: "Apple", exact: true }) });
  const rice = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Brown rice", exact: true }),
  });
  await expect(
    apple.getByText("not available · kJ", { exact: true }),
  ).toBeVisible();
  await expect(
    rice.getByText(/Select a source preparation before comparing/),
  ).toBeVisible();
  const select = rice.getByRole("combobox", {
    name: "Source food preparation",
  });
  const cooked = await select
    .locator("option")
    .filter({ hasText: /· cooked$/ })
    .first()
    .getAttribute("value");
  expect(cooked).toBeTruthy();
  await select.selectOption(cooked!);
  await expect(
    rice.getByText(/· cooked · per 100 g edible portion/),
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
  await page
    .getByLabel("Save this comparison name")
    .fill("Synthetic browser food comparison");
  await page
    .getByRole("button", { name: "Save comparison", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "Comparison saved on this device.",
  );
  await page.goto("/compare");
  await expect(
    page.getByText(/Synthetic browser food comparison/),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText(/Synthetic browser food comparison/),
  ).toBeVisible();
  expect(remote).toEqual([]);
});

test("nutrient comparison preserves FDA label context and unavailable reference rows", async ({
  page,
}) => {
  for (const [query, title] of [
    ["iron", "Iron"],
    ["protein", "Protein"],
    ["water", "Water"],
  ]) {
    await page.goto(`/search?q=${query}&type=nutrient`);
    const card = page.getByRole("article").filter({
      has: page.getByRole("heading", { name: title!, exact: true }),
    });
    await card
      .getByRole("button", { name: "Add to compare", exact: true })
      .click();
    await expect(
      card.getByRole("button", { name: "Add to compare", exact: true }),
    ).toBeDisabled();
  }
  await page.goto("/compare/nutrients");
  await expect(
    page.getByText("No numeric reference rows published", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(/fda dv adult 4 plus · DV · 18 mg · label reference/),
  ).toBeVisible();
  await expect(
    page.getByText(/fda dv adult 4 plus · DV · 50 g · label reference/),
  ).toBeVisible();
  await expect(
    page.getByText(/EAR is not a personal target/).first(),
  ).toBeVisible();
  await expect(
    page.getByText(/No winner or personal target is assigned/),
  ).toBeVisible();
});
