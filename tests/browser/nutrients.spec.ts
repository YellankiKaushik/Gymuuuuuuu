import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("nutrient routes, filters, framework isolation and hidden draft topics", async ({
  page,
}) => {
  await page.goto("/nutrients");
  await expect(
    page.getByRole("heading", { name: "Understand your nutrients." }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search nutrient topics" })
    .fill("B12");
  await expect(page).toHaveURL(/q=B12/);
  await expect(
    page.getByRole("heading", {
      name: "Vitamin B12",
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Nutrient filters", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog
    .getByLabel("Topic group", { exact: true })
    .selectOption("vitamins");
  await dialog.getByRole("button", { name: "Show topics" }).click();
  await expect(page).toHaveURL(/group=vitamins/);
  await page.goto("/nutrients/vitamin-b12");
  await expect(
    page.getByRole("heading", { name: "Vitamin B12", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('meta[name="robots"][content="noindex"]'),
  ).toHaveCount(0);
  await page.goto("/nutrients/protein");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
  await page.goto("/nutrients/compare?topics=protein_g,fat_total_g");
  await expect(
    page.getByRole("heading", { name: "Choose reviewed nutrient topics." }),
  ).toBeVisible();
  await page.goto("/nutrients/categories/vitamins");
  await expect(
    page.getByRole("heading", { name: "Understand your nutrients." }),
  ).toBeVisible();
  await page.goto("/nutrients/frameworks");
  await expect(
    page.getByRole("heading", { name: "Reference frameworks", exact: true }),
  ).toBeVisible();
  await page.goto("/nutrients/glossary");
  await expect(
    page.getByRole("heading", { name: "EAR · Estimated Average Requirement" }),
  ).toBeVisible();
  await page.goto("/nutrients/methodology");
  await expect(
    page.getByRole("heading", { name: "Units and equivalents" }),
  ).toBeVisible();
});
test("reference population is transient, remembers only after explicit action and avoids remote requests", async ({
  page,
}) => {
  const remote: string[] = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("http://127.0.0.1:3000"))
      remote.push(request.url());
  });
  await page.goto("/nutrients/reference-intakes");
  const age = page.getByRole("spinbutton", { name: "Reference age" });
  await expect(age).toBeEnabled();
  await age.fill("31");
  await page
    .getByLabel("Sex used by framework", { exact: true })
    .selectOption("female");
  await page
    .getByLabel("Life stage", { exact: true })
    .selectOption("pregnancy");
  await expect(page).not.toHaveURL(/31|female|pregnancy/);
  await expect(
    page.getByText("No approved reference dataset is available", {
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(age).toBeEnabled();
  await expect(age).toHaveValue("");
  await age.fill("31");
  await page
    .getByLabel("Sex used by framework", { exact: true })
    .selectOption("female");
  await page
    .getByRole("button", { name: "Remember population on this device" })
    .click();
  await expect(
    page.getByText("Population selections saved on this device.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(age).toBeEnabled();
  await expect(age).toHaveValue("372");
  await expect(page.getByLabel("Age unit", { exact: true })).toHaveValue(
    "months",
  );
  await expect(
    page.getByLabel("Sex used by framework", { exact: true }),
  ).toHaveValue("female");
  await page
    .getByRole("button", { name: "Forget remembered population" })
    .click();
  await expect(
    page.getByText("Remembered population removed.", { exact: false }),
  ).toBeVisible();
  await page.reload();
  await expect(age).toBeEnabled();
  await expect(age).toHaveValue("");
  await page.goto("/nutrients/reference-intakes?framework=unsupported");
  await expect(
    page.getByText("Unsupported framework identifier.", { exact: false }),
  ).toBeVisible();
  expect(remote).toEqual([]);
});
test("nutrient and reference controls reflow and remain accessible", async ({
  page,
}) => {
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of [
      "/nutrients",
      "/nutrients/reference-intakes",
      "/nutrients/glossary",
    ]) {
      await page.goto(path);
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
    }
  }
});
