import { test, expect } from "@playwright/test";

const payload = "SYNTHETIC-FINAL-XSS <img src=x onerror=alert(1)>";
test.beforeEach(async ({ page }) => {
  page.on("dialog", (dialog) => {
    throw Error(`Unexpected synthetic payload dialog: ${dialog.type()}`);
  });
});
test.afterEach(async ({ page }) => {
  await expect(
    page.locator("img[onerror], script[data-synthetic-payload]"),
  ).toHaveCount(0);
});

test("synthetic workout and nutrition names remain text across persistence", async ({
  page,
}) => {
  await page.goto("/workout");
  await page
    .getByLabel("Personal exercise label", { exact: true })
    .fill(payload);
  await page.getByRole("button", { name: "Save label and select" }).click();
  await expect(
    page.getByText(`${payload} · Local label`, { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Workout title", { exact: true }).fill(payload);
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await expect(page).toHaveURL(/\/workout\/session\//);
  await expect(
    page.getByRole("heading", { name: payload, exact: true }),
  ).toBeVisible();
  await page.goto("/nutrition/custom-foods");
  await page.getByLabel("Custom food name").fill(payload);
  await page.getByLabel("Serving description").fill("Synthetic portion");
  await page.getByLabel("Serving mass (g)").fill("100");
  await page.getByLabel("Energy (kcal)", { exact: true }).fill("100");
  await page.getByRole("button", { name: "Save custom food revision" }).click();
  await expect(
    page.getByRole("link", { name: payload, exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("link", { name: payload, exact: true }),
  ).toBeVisible();
});

test("synthetic collection names and private search payload never execute or reach URLs", async ({
  page,
  request,
}) => {
  const leaks: string[] = [];
  page.on("request", (event) => {
    if (
      (
        event.url() +
        JSON.stringify(event.headers()) +
        (event.postData() ?? "")
      ).includes("SYNTHETIC-FINAL-XSS")
    )
      leaks.push(event.url());
  });
  await page.goto("/saved/collections");
  await expect(
    page.getByText("Saved items loaded on this device.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("New collection name").fill(payload);
  await page.getByRole("button", { name: "Create collection" }).click();
  await expect(page.getByRole("status")).toContainText("safe characters");
  await expect(
    page.getByRole("link", { name: payload, exact: true }),
  ).toHaveCount(0);
  await page.goto("/search");
  await page.getByRole("button", { name: "On-device records" }).click();
  await page.getByRole("textbox", { name: "Search query" }).fill(payload);
  await expect(page).not.toHaveURL(/SYNTHETIC|onerror/);
  expect(await (await request.get("/saved/collections")).text()).not.toContain(
    "SYNTHETIC-FINAL-XSS",
  );
  expect(leaks).toEqual([]);
});

test("synthetic supplement text and invalid photo MIME are safely handled", async ({
  page,
}) => {
  await page.goto("/supplements/products/create");
  await page.getByLabel("Product name").fill(payload);
  await page
    .getByLabel("Serving text, exactly as printed")
    .fill("Synthetic portion");
  await page.getByLabel("Ingredient 1 label name").fill(payload);
  await page.getByLabel("Ingredient 1 amount disclosure").selectOption("exact");
  await page.getByRole("textbox", { name: "Ingredient 1 amount" }).fill("0");
  await page.getByLabel("Ingredient 1 printed unit").fill("mg");
  await page
    .getByRole("button", { name: "Save product and label version" })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "New immutable label version saved" }),
  ).toContainText("New immutable label version saved");
  await page.goto("/supplements/products");
  await expect(page.getByText(payload, { exact: true }).first()).toBeVisible();
  await page.goto("/progress/photos");
  await page.getByLabel("Image file", { exact: true }).setInputFiles({
    name: "synthetic.png",
    mimeType: "image/png",
    buffer: Buffer.from("<svg>synthetic</svg>"),
  });
  await page
    .getByRole("button", { name: "Sanitize and save photo", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("signature");
  await expect(page.locator(".progress-photo-grid img")).toHaveCount(0);
});
