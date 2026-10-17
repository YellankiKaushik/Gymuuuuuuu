import { test, expect, settleLayout } from "./test";
import AxeBuilder from "@axe-core/playwright";
import matrix from "../../docs/assets/design-system-route-matrix.json" with { type: "json" };
import { mkdir } from "node:fs/promises";

for (const sample of matrix.samples) {
  test(`@a11y unified design: ${sample.module}`, async ({ page }, info) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(sample.path);
    await expect(page.locator("h1")).toHaveCount(1);
    if (sample.module !== "Missing route") {
      await expect(page.locator("h1")).not.toHaveText("Page not found");
    }
    const recordWorkspace = page.locator(".progress-workspace-fields");
    if (await recordWorkspace.count()) {
      await expect(recordWorkspace).toBeEnabled();
      await expect(
        page.getByText("Saved in this browser", { exact: true }),
      ).toBeVisible();
    }
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const theme of ["light", "dark"]) {
        await page.evaluate((value) => {
          document.documentElement.dataset.theme = value;
        }, theme);
        await settleLayout(page);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `${sample.module} ${width} ${theme}`,
        ).toBe(true);
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
              .analyze()
          ).violations,
        ).toEqual([]);
        if (info.project.name === "chromium") {
          await mkdir("artifacts/final-design/screenshots", {
            recursive: true,
          });
          await page.screenshot({
            path: `artifacts/final-design/screenshots/${sample.module.replaceAll(/[^a-z0-9]/gi, "-")}-${width}-${theme}.png`,
            fullPage: true,
          });
        }
      }
    }
    expect(errors).toEqual([]);
  });
}

for (const [width, height] of matrix.viewports) {
  test(`Home design boundaries ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width: width!, height: height! });
    await page.goto("/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const columns = await page
      .locator(".home-module-grid")
      .evaluate(
        (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
      );
    expect(columns).toBe(width! >= 1280 ? 3 : width! >= 540 ? 2 : 1);
    await expect(
      page.getByRole("link", { name: "Find an answer", exact: true }),
    ).toBeVisible();
  });
}

test("data navigation identifies exactly one current page", async ({
  page,
}) => {
  await page.goto("/settings/data/restore");
  await expect(page.locator(".data-tabs a.active")).toHaveCount(1);
  await expect(page.locator(".data-tabs a.active")).toHaveText("Restore");
  await page.goto("/saved/collections");
  const current = page.locator(
    'nav[aria-label="Saved pages"] a[aria-current="page"]',
  );
  await expect(current).toHaveCount(1);
  await expect(current).toHaveText("Collections");
  await expect(current).toHaveCSS("min-height", "44px");
  // DOMRect floats can lose precision in Firefox; compare CSS layout units.
  const height = (await current.boundingBox())?.height ?? 0;
  expect(Math.round(height * 64) / 64).toBeGreaterThanOrEqual(44);
});
