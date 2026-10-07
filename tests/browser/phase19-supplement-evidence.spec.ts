import { expect, test } from "@playwright/test";
test("ingredient findings retain separate outcomes, forms and confidence without personal dosing", async ({
  page,
}) => {
  await page.goto("/supplements/ingredients/ingredient-beta-alanine");
  await expect(
    page.getByRole("heading", { name: "Outcome-specific findings" }),
  ).toBeVisible();
  await expect(
    page.getByText("Men aged 18–40 years", { exact: false }),
  ).toBeVisible();
  await expect(page.getByText("beneficial", { exact: true })).toBeVisible();
  await expect(
    page.getByText("no clear benefit", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "No single source regimen extracted; no personal amount supplied.",
      { exact: false },
    ),
  ).toHaveCount(2);
  await page.goto("/supplements/evidence");
  await page
    .getByLabel("Search names, outcomes, populations and forms")
    .fill("citrulline malate");
  await expect(
    page.getByRole("heading", { name: "Citrulline Malate", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Beta-Alanine", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Study count for this outcome", { exact: true }),
  ).toHaveCount(2);
  await expect(page.getByText("Not available", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "No personal protocol, product-quality certification or current anti-doping verdict is supplied.",
    ),
  ).toBeVisible();
});
