import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Phase 15 records body weight locally and keeps the 320px layout inside the viewport", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/progress/weight");
  await expect(page.getByText("Saved in this browser")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Body weight" })).toBeVisible();
  await page.getByLabel("Weight", { exact: true }).fill("70.5");
  await page.getByRole("button", { name: "Save measurement" }).click();
  await expect(page.getByText("70.5 kg", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("70.5 kg", { exact: true })).toBeVisible();
  const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: window.innerWidth }));
  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
  expect(pageErrors).toEqual([]);
});

test("nutrition analytics requires an explicit complete-day review", async ({ page }) => {
  await page.goto("/analytics/nutrition");
  await expect(page.getByText("Saved in this browser")).toBeVisible();
  await expect(page.getByText("Explicitly reviewed complete days: 0.")).toBeVisible();
  await page.getByLabel("Coverage").selectOption("complete_for_analysis");
  await page.getByRole("button", { name: "Save day review" }).click();
  await expect(page.getByText("Explicitly reviewed complete days: 1.")).toBeVisible();
});

test("dashboard never renders the private photo grid", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Body progress dashboard" })).toBeVisible();
  await expect(page.getByText(/Photos are never shown on the dashboard/)).toBeVisible();
  await expect(page.locator(".progress-photo-grid")).toHaveCount(0);
});

test("all Phase 15 routes load with private-page metadata and a working analytics range", async ({ page }) => {
  const routes = [
    ["/dashboard", "Body progress dashboard"], ["/progress", "Progress workspace"], ["/progress/weight", "Body weight"],
    ["/progress/measurements", "Circumference measurements"], ["/progress/body-composition", "External body composition reports"],
    ["/progress/photos", "Private progress photos"], ["/progress/goals", "Progress goals"], ["/analytics", "Analytics"],
    ["/analytics/workouts", "Workout analytics"], ["/analytics/strength", "Strength analytics"], ["/analytics/nutrition", "Nutrition analytics"],
    ["/analytics/recovery", "Recovery analytics"], ["/analytics/cardio", "Cardio analytics"], ["/analytics/data-quality", "Data quality"],
    ["/analytics/methodology", "Metric methodology"], ["/progress/settings", "Progress backup & settings"], ["/progress/privacy", "Progress privacy"],
  ];
  for (const [path, heading] of routes) {
    await page.goto(path!);
    await expect(page.getByRole("heading", { name: heading! }).first()).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex,nofollow");
  }
  await page.goto("/analytics/workouts");
  await expect(page.getByText("Saved in this browser")).toBeVisible();
  const range = page.locator('section[aria-label="Analytics date range"] select');
  await range.selectOption("7");
  await expect(range).toHaveValue("7");
  await expect(page.getByText(/Showing \d{4}-\d{2}-\d{2} through .* inclusive/)).toBeVisible();
  await range.selectOption("custom");
  await expect(range).toHaveValue("custom");
  await page.locator('section[aria-label="Analytics date range"] input[type="date"]').nth(0).fill("2026-01-01");
  await page.locator('section[aria-label="Analytics date range"] input[type="date"]').nth(1).fill("2026-01-31");
  await expect(page.getByText("Showing 2026-01-01 through 2026-01-31, inclusive.")).toBeVisible();
});

test("private tracking pages have no automated accessibility violations at mobile and desktop widths", async ({ page }) => {
  for (const viewport of [{ width: 320, height: 800 }, { width: 1280, height: 900 }]) {
    await page.setViewportSize(viewport);
    for (const path of ["/dashboard", "/progress/weight", "/progress/photos", "/analytics/nutrition"]) {
      await page.goto(path);
      await expect(page.getByText("Saved in this browser")).toBeVisible();
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations, `${path} at ${viewport.width}px`).toEqual([]);
    }
  }
});
