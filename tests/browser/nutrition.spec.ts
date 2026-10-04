import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
test("private quick-add, immutable custom revisions, fluid editing, undo, backup restore and cross-tab updates", async ({
  page,
  context,
}) => {
  test.setTimeout(90000);
  const remote: string[] = [];
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://127.0.0.1:3000") &&
      !r.url().startsWith("http://localhost:3000")
    )
      remote.push(r.url());
  });
  page.on("dialog", (d) => void d.accept());
  await page.goto("/nutrition/add");
  await page
    .getByLabel("Quick-add description")
    .fill("Synthetic calories only");
  await page.getByLabel("Energy (kcal) · required").fill("100");
  await page
    .getByRole("button", { name: "Save consumed entry", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Saved on this device" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Return to today’s diary" }).click();
  await expect(
    page.getByRole("heading", { name: "Synthetic calories only", exact: true }),
  ).toBeVisible();
  const other = await context.newPage();
  await other.goto("/nutrition");
  await page.getByRole("button", { name: "Edit entry", exact: true }).click();
  await page.getByLabel("Entered calories (kcal)").fill("125");
  await page.getByRole("button", { name: "Save entry changes" }).click();
  await expect(
    other.getByText("125 kcal", { exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Delete entry", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Undo deletion" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Undo deletion" }).click();
  await page.goto("/nutrition/custom-foods");
  await page.getByLabel("Custom food name").fill("Synthetic private label");
  await page.getByLabel("Serving description").fill("Test portion");
  await page.getByLabel("Serving mass (g)").fill("40");
  await page.getByLabel("Energy (kcal)", { exact: true }).fill("120");
  await page.getByLabel("Protein (g)", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Save custom food revision" }).click();
  await expect(
    page.getByRole("link", { name: "Synthetic private label", exact: true }),
  ).toBeVisible();
  await page.goto("/nutrition/add");
  await page.getByLabel("Entry type").selectOption("custom");
  await page
    .getByRole("combobox", { name: "Custom food", exact: true })
    .selectOption({ label: "Synthetic private label" });
  await page.getByLabel("Number of servings").fill("2");
  await page
    .getByRole("button", { name: "Save consumed entry", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Saved on this device" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Return to today’s diary" }).click();
  const custom = page.locator("article").filter({
    has: page.getByRole("heading", {
      name: "Synthetic private label",
      exact: true,
    }),
  });
  await expect(custom).toContainText("240 kcal");
  await custom.getByRole("button", { name: "Favourite snapshot" }).click();
  await page.goto("/nutrition/custom-foods");
  await page
    .getByRole("link", { name: "Synthetic private label", exact: true })
    .click();
  await page.getByLabel("Energy (kcal)", { exact: true }).fill("160");
  await page.getByRole("button", { name: "Save custom food revision" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "New immutable revision" }),
  ).toBeVisible();
  await page.goto("/nutrition");
  await expect(
    page.locator("article").filter({
      has: page.getByRole("heading", {
        name: "Synthetic private label",
        exact: true,
      }),
    }),
  ).toContainText("240 kcal");
  await page.goto("/nutrition/add");
  await page.getByLabel("Entry type").selectOption("fluid");
  await page.getByLabel("Fluid volume (mL)").fill("250");
  await page
    .getByRole("button", { name: "Save consumed entry", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Saved on this device" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Return to today’s diary" }).click();
  await page.getByRole("button", { name: "Edit fluid", exact: true }).click();
  await page.getByLabel("Edit fluid volume (mL)").fill("300");
  await page.getByRole("button", { name: "Save fluid changes" }).click();
  await expect(
    page.getByText("300 mL recorded.", { exact: false }),
  ).toBeVisible();
  await page.goto("/nutrition/settings");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export nutrition JSON", exact: true })
    .click();
  const file = await download,
    backup = await readFile((await file.path())!, "utf8");
  expect(backup).toContain("Synthetic private label");
  await page.getByLabel("Preview nutrition JSON backup").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"schemaVersion":99}'),
  });
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByLabel("Type DELETE NUTRITION").fill("DELETE NUTRITION");
  await page
    .getByRole("button", { name: "Permanently clear nutrition" })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Nutrition records cleared" }),
  ).toBeVisible();
  await page.getByLabel("Preview nutrition JSON backup").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(backup),
  });
  await expect(
    page.getByRole("heading", { name: "Restore preview" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Confirm nutrition restore" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "restore completed" }),
  ).toBeVisible();
  await page.goto("/nutrition");
  await expect(
    page.getByRole("heading", { name: "Synthetic private label", exact: true }),
  ).toBeVisible();
  expect(remote).toEqual([]);
  await other.close();
});
test("all nutrition routes remain accessible at mobile and desktop widths in both themes", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
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
        "/nutrition",
        "/nutrition/add",
        "/nutrition/history",
        "/nutrition/custom-foods",
        "/nutrition/settings",
        "/nutrition/methodology",
        "/nutrition/privacy",
        "/nutrition/day/2026-10-04",
        "/nutrition/custom-foods/custom_food_missing",
      ]) {
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
        await expect(
          page.getByText("Opening local storage…", { exact: true }),
        ).toHaveCount(0);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
          `${path} ${width}`,
        ).toBe(true);
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
              .analyze()
          ).violations,
          `${path} ${width} ${theme}`,
        ).toEqual([]);
      }
      if (theme === "light" && [320, 1440].includes(width)) {
        await page.goto("/nutrition/add");
        await expect(page.getByLabel("Quick-add description")).toBeVisible();
        await page.evaluate(() => {
          (document.activeElement as HTMLElement)?.blur();
          window.scrollTo(0, 0);
        });
        await page.screenshot({
          path: `docs/screenshots/phase10-add-${width}.png`,
          fullPage: true,
        });
      }
    }
  expect(errors).toEqual([]);
});
