import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const routes = [
  "/supplements",
  "/supplements/ingredients",
  "/supplements/ingredients/creatine-monohydrate",
  "/supplements/compare",
  "/supplements/evidence",
  "/supplements/evidence/unavailable",
  "/supplements/safety",
  "/supplements/quality",
  "/supplements/anti-doping",
  "/supplements/frameworks",
  "/supplements/methodology",
  "/supplements/privacy",
  "/supplements/products",
  "/supplements/products/create",
  "/supplements/products/unavailable",
  "/supplements/trials",
  "/supplements/trials/create",
  "/supplements/trials/unavailable",
  "/supplements/adverse-events",
  "/supplements/settings",
];
for (const theme of ["light", "dark"])
  test(`Phase 14 routes, accessibility and responsive layout in ${theme}`, async ({
    page,
  }) => {
    test.setTimeout(240000);
    await page.addInitScript(
      (theme) =>
        localStorage.setItem(
          "fitness-os:preferences:v1",
          JSON.stringify({ theme }),
        ),
      theme,
    );
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const route of routes) {
        await page.goto(route);
        await expect(page.locator(".supplements-page")).toBeVisible();
        await expect(page.getByText("Loading browser records…")).toHaveCount(0);
        await expect(page.locator("h1")).toHaveCount(1);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
          `${route} ${width}`,
        ).toBe(true);
        expect(
          (await new AxeBuilder({ page }).analyze()).violations,
          `${route} ${width} ${theme}`,
        ).toEqual([]);
      }
    }
  });
test("captures versioned labels, frozen intake, trial, urgent event, backup and clear privacy boundaries", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 390, height: 844 });
  const external: string[] = [];
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://127.0.0.1:3000") &&
      !r.url().startsWith("http://localhost:3000")
    )
      external.push(r.url());
  });
  await page.goto("/supplements/products/create");
  await page.getByLabel("Product name").fill("Local test powder");
  await page.getByLabel("Serving text, exactly as printed").fill("2 scoops");
  await page.getByLabel("Ingredient 1 label name").fill("Test compound");
  await page.getByLabel("Ingredient 1 amount disclosure").selectOption("exact");
  await page.getByRole("textbox", { name: "Ingredient 1 amount" }).fill("0");
  await page.getByLabel("Ingredient 1 printed unit").fill("mg");
  await page
    .getByRole("button", { name: "Save product and label version" })
    .click();
  await expect(
    page.getByText(
      "New immutable label version saved; earlier intakes unchanged",
    ),
  ).toBeVisible();
  await page.goto("/supplements/products");
  await page.getByRole("link", { name: "Labels and edit product" }).click();
  await page.getByText(/Version 1 ·/).click();
  await expect(page.getByText("0 mg · exact")).toBeVisible();
  await page.goto("/supplements/trials/create");
  await page.getByLabel("Trial title").fill("Local observation");
  await page.getByLabel("Exact label version (optional)").selectOption({
    label: "Local test powder · version 1",
  });
  await page.getByLabel("Trial start date").fill("2026-10-05");
  await page.getByLabel("Trial status").selectOption("active");
  await page.getByRole("button", { name: "Save trial" }).click();
  await expect(
    page.getByText("Trial saved; observations do not establish efficacy"),
  ).toBeVisible();
  await page.goto("/supplements/products");
  await page.getByLabel("Captured label version").selectOption({
    label: "Local test powder · version 1 · lot not recorded",
  });
  await page.getByLabel("Associated trial (optional)").selectOption({
    label: "Local observation · active",
  });
  await page.getByLabel("Servings actually taken").fill("1");
  await page.getByRole("button", { name: "Save intake" }).click();
  await expect(page.getByText(/Intake saved with frozen label/)).toBeVisible();
  await expect(page.getByText(/0 servings/)).toHaveCount(0);
  await expect(page.getByText(/1 servings/)).toBeVisible();
  await page.goto("/supplements/adverse-events");
  await page.getByLabel("Event severity").selectOption("urgent_or_emergency");
  await page.getByLabel("Symptoms (one per line)").fill("Test concern");
  await page.getByText("Related intake records").click();
  await page
    .getByRole("checkbox", { name: /Intake.*Local test powder/ })
    .check();
  await expect(page.getByRole("alert")).toContainText(
    "seek urgent medical help",
  );
  await page.getByRole("button", { name: "Save suspected event" }).click();
  await expect(
    page.getByText(
      "Suspected event saved; linked urgent trials stopped atomically",
    ),
  ).toBeVisible();
  await page.goto("/supplements/trials");
  await expect(page.getByText("stopped for adverse event")).toBeVisible();
  await page.goto("/supplements/settings");
  const response = await request.get("/supplements/products/unavailable");
  expect(await response.text()).not.toContain("Local test powder");
  await expect(
    page.getByRole("button", { name: "Export JSON backup" }),
  ).toBeVisible();
  expect(external).toEqual([]);
});
