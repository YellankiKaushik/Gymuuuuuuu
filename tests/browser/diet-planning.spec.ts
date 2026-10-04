import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
async function enterAdult(page: Page) {
  await page.goto("/diet-planning/energy");
  await page.getByLabel("I understand this limitation").check();
  await page.getByLabel("Age (years)", { exact: true }).fill("30");
  await page.getByLabel("Sex used by the source equation").selectOption("male");
  await page.getByLabel("Height (cm)", { exact: true }).fill("175");
  await page.getByLabel("Current weight (kg)", { exact: true }).fill("75");
  await page.getByLabel("Physical-activity category").selectOption("active");
  await expect(
    page.getByText("3025 kcal/day", { exact: true }).first(),
  ).toBeVisible();
}
test("diet target flow, input consent, current snapshot, edit, export, restore and cross-tab updates", async ({
  page,
  context,
}) => {
  const remote: string[] = [];
  page.on("request", (request) => {
    if (
      !request.url().startsWith("http://127.0.0.1:3000") &&
      !request.url().startsWith("http://localhost:3000")
    )
      remote.push(request.url());
  });
  await enterAdult(page);
  await page.getByRole("link", { name: "Next: Goal", exact: true }).click();
  await page.getByLabel("Planning goal").selectOption("fat_loss");
  await expect(page.getByText("2725", { exact: false }).first()).toBeVisible();
  await page.getByRole("link", { name: "Next: Macros", exact: true }).click();
  await page.getByLabel("Protein context").selectOption("strength_hypertrophy");
  await page.getByLabel("Selected protein (g/kg/day)").fill("1.6");
  await page.getByLabel("Fat (% energy)").fill("30");
  await expect(page.getByText("120 g/day", { exact: true })).toBeVisible();
  await page
    .getByLabel("Plan name", { exact: true })
    .fill("Synthetic target flow");
  await page
    .getByRole("button", { name: "Save on this device", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Saved on this device" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Saved plans", exact: true })
    .first()
    .click();
  await page
    .getByRole("link", { name: "Synthetic target flow", exact: true })
    .click();
  await page.getByText("How this was calculated", { exact: true }).click();
  await expect(page.getByText("Personal inputs were withheld.")).toBeVisible();
  await page.getByRole("button", { name: "Set current", exact: true }).click();
  await page.getByRole("button", { name: "Confirm set current" }).click();
  await expect(
    page.getByText("Status: current.", { exact: false }),
  ).toBeVisible();
  const second = await context.newPage();
  await second.goto(page.url());
  await expect(
    second.getByRole("heading", { name: "Saved diet plan", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit name and notes" }).click();
  await page.getByLabel("Plan name", { exact: true }).fill("Synthetic renamed");
  await page.getByRole("button", { name: "Save metadata" }).click();
  await expect(
    second.getByRole("button", { name: "Set current", exact: true }),
  ).toHaveCount(0);
  await expect(
    second.getByText("Synthetic renamed", { exact: false }).first(),
  ).toBeVisible();
  await second.close();
  await page
    .getByRole("link", { name: "Saved plans", exact: true })
    .first()
    .click();
  const downloadEvent = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON backup" }).click();
  const download = await downloadEvent,
    path = await download.path();
  expect(path).toBeTruthy();
  const text = await readFile(path!, "utf8");
  expect(JSON.parse(text).plans[0].inputs).toBeNull();
  await page.getByLabel("Preview JSON backup").setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from("{bad"),
  });
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: /JSON|Unexpected|position|property/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Synthetic renamed", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Preview JSON backup").setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(text),
  });
  await expect(
    page.getByText("1 plans; 1 ID conflicts.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Restore validated backup" }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "Import saved locally" }),
  ).toBeVisible();
  expect(remote).toEqual([]);
});
test("diet eligibility, unsafe goals and unreconciled meals block save; transient inputs clear on reload", async ({
  page,
}) => {
  await enterAdult(page);
  await page.getByLabel("Age (years)", { exact: true }).fill("18");
  await expect(page.getByText(/ageYears: Too small/)).toBeVisible();
  await page.getByLabel("Age (years)", { exact: true }).fill("19");
  await page.getByLabel("Pregnant or lactating").check();
  await expect(
    page.getByText(
      "This calculator is unavailable during pregnancy or lactation.",
    ),
  ).toBeVisible();
  await page.getByLabel("Pregnant or lactating").uncheck();
  await page.getByLabel("Current weight (kg)", { exact: true }).fill("50");
  await page.getByRole("link", { name: "Next: Goal", exact: true }).click();
  await page.getByLabel("Planning goal").selectOption("fat_loss");
  await expect(
    page.getByText(/Fat-loss planning is unavailable/),
  ).toBeVisible();
  await page.getByLabel("Planning goal").selectOption("manual");
  await page.getByLabel("Or direct target (kcal/day)").fill("900");
  await page.getByLabel("Manual reason").fill("Synthetic boundary test");
  await expect(
    page.getByText(/Direct manual energy must stay within|below the 1,000/),
  ).toBeVisible();
  await page.getByLabel("Planning goal").selectOption("maintenance");
  await page.getByRole("link", { name: "Meals", exact: true }).click();
  await page.getByLabel("Distribution mode").selectOption("custom");
  await page.getByLabel("Meal 1 share (%)").fill("10");
  await expect(
    page.getByText("Meal percentages must total 100%."),
  ).toBeVisible();
  await page
    .getByLabel("Plan name", { exact: true })
    .fill("Blocked allocation");
  await page
    .getByRole("button", { name: "Save on this device", exact: true })
    .click();
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "resolve the calculation fields" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("link", { name: "Energy", exact: true }).click();
  await expect(page.getByLabel("Age (years)", { exact: true })).toHaveValue("");
  await page.goto("/diet-planning/plans/dietplan_missing");
  await expect(page.getByText("Plan not found", { exact: true })).toBeVisible();
});
test("diet routes and populated planner reflow with accessible light and dark themes", async ({
  page,
}) => {
  await enterAdult(page);
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
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
      const violations = (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations;
      expect(
        violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
    if (width === 320 || width === 1440) {
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement)
          document.activeElement.blur();
        window.scrollTo(0, 0);
      });
      await page.screenshot({
        path: `docs/screenshots/phase09-energy-${width}.png`,
        fullPage: true,
      });
    }
  }
  for (const path of [
    "/diet-planning",
    "/diet-planning/goal",
    "/diet-planning/macros",
    "/diet-planning/meal-distribution",
    "/diet-planning/plans",
    "/diet-planning/methodology",
    "/diet-planning/safety",
  ]) {
    await page.goto(path);
    await expect(page.locator("h1")).toHaveCount(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/diet");
  await expect(page).toHaveURL(/diet-planning$/);
});
test("imperial inputs, manual provenance, custom grams, explicit storage and recalculation audit", async ({
  page,
}) => {
  await enterAdult(page);
  await page.getByLabel("Display units").selectOption("imperial");
  await page.getByLabel("Height (inches)", { exact: true }).fill("70");
  await page.getByLabel("Current weight (lb)", { exact: true }).fill("165");
  await page.getByRole("link", { name: "Goal", exact: true }).click();
  await page.getByLabel("Planning goal").selectOption("manual");
  await page.getByLabel("Manual adjustment (%)").fill("-10");
  await page
    .getByLabel("Manual reason")
    .fill("Synthetic manual planning assumption");
  await expect(
    page.getByText("Manual override: Synthetic manual planning assumption", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Meals", exact: true }).click();
  await page.getByLabel("Meal count").selectOption("6");
  await page.getByLabel("Distribution mode").selectOption("custom");
  await page.getByLabel("Enter individual energy and gram allocations").check();
  const allocation = page.getByLabel("Meal 1 energy (kcal)", { exact: true }),
    original = await allocation.inputValue();
  await allocation.fill(String(Number(original) + 100));
  await expect(
    page.getByText("Meal allocations do not reconcile with daily totals."),
  ).toBeVisible();
  await expect(
    page.getByText(/Difference from daily target: energy 100 kcal/),
  ).toBeVisible();
  await allocation.fill(original);
  await expect(
    page.getByText("Starting target", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Distribution mode").selectOption("even");
  await page.getByLabel("Distribution mode").selectOption("custom");
  await expect(
    page.getByLabel("Enter individual energy and gram allocations"),
  ).not.toBeChecked();
  await page
    .getByLabel("Include age, equation sex, height and weights")
    .check();
  await page
    .getByLabel("Plan name", { exact: true })
    .fill("Synthetic imperial manual");
  await page
    .getByRole("button", { name: "Save on this device", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Saved on this device" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Saved plans", exact: true })
    .first()
    .click();
  await page
    .getByRole("link", { name: "Synthetic imperial manual", exact: true })
    .click();
  await page.getByText("How this was calculated", { exact: true }).click();
  await expect(
    page.getByText(/Metric inputs: 30 years; 177.8 cm;/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Duplicate and recalculate" }).click();
  await page.getByLabel("I understand this limitation").check();
  await page
    .getByLabel("Plan name", { exact: true })
    .fill("Synthetic recalculated");
  await page
    .getByRole("button", { name: "Save on this device", exact: true })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Saved on this device" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Saved plans", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("link", { name: "Synthetic imperial manual", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Synthetic recalculated", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Include stored personal inputs in JSON export")
    .check();
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export JSON backup" }).click();
  const file = await event,
    path = await file.path();
  const backup = JSON.parse(await readFile(path!, "utf8"));
  expect(backup.plans[0].inputs.heightCm).toBeCloseTo(177.8, 8);
  expect(
    backup.auditLog.some((entry: { summary: string | null }) =>
      entry.summary?.startsWith("Duplicated and recalculated from dietplan_"),
    ),
  ).toBe(true);
});

