import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("local data management exposes all routes with a usable storage inventory", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 950 });
  await page.goto("/settings/data");
  await expect(page.getByRole("heading", { name: "Your local data" })).toBeVisible();
  await page.getByRole("link", { name: "Storage", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Storage inventory" })).toBeVisible();
  await expect(page.getByText("Approximate browser-reported values")).toBeVisible();
  const report = await new AxeBuilder({ page }).analyze();
  expect(report.violations).toEqual([]);
  for (const path of ["backup", "restore", "export", "health", "history", "reset"]) {
    await page.goto(`/settings/data/${path}`);
    await expect(page.locator("h1")).toBeVisible();
  }
});

test("backup preview reports zero writes and reset requires a typed confirmation", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/settings/data/backup");
  await expect(page.getByRole("heading", { name: "Create a backup" })).toBeVisible();
  await page.getByRole("link", { name: "Restore", exact: true }).click();
  await expect(page.getByText(/0 writes during preview/)).toHaveCount(0);
  await page.getByRole("link", { name: "Clear data", exact: true }).click();
  expect(await page.locator("form").evaluate((form: HTMLFormElement) => form.checkValidity())).toBe(false);
  await page.getByRole("radio", { name: /I understand and want to clear without a backup/ }).check();
  await page.getByRole("textbox", { name: /Type CLEAR LOCAL DATA to confirm/ }).fill("CLEAR LOCAL DATA");
  expect(await page.locator("form").evaluate((form: HTMLFormElement) => form.checkValidity())).toBe(true);
  const report = await new AxeBuilder({ page }).analyze();
  expect(report.violations).toEqual([]);
  await page.getByRole("button", { name: "Clear Fitness OS data" }).click();
  await expect(page.getByRole("status").last()).toContainText("Cleared");
});
