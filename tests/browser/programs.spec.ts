import { expect, test } from "@playwright/test";
test("program discovery, finder scope and current selection empty states", async ({
  page,
}) => {
  await page.goto("/programs");
  await expect(
    page.getByRole("heading", { name: "Workout programs", exact: true }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Search programs" }).fill("fixture");
  await expect(page).toHaveURL(/q=fixture/);
  await page.goto("/programs/finder");
  await page.getByRole("button", { name: "Find matching templates" }).click();
  await expect(
    page.getByText("Review the scope with a qualified professional", {
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/programs/current");
  await expect(
    page.getByRole("heading", { name: "No program selected." }),
  ).toBeVisible();
  await page.goto("/programs/compare");
  await expect(
    page.getByRole("heading", { name: "Choose programs to compare." }),
  ).toBeVisible();
});
for (const [slug, title, knownDuration] of [
  ["full-body-2-day-foundation", "Two-Day Full-Body Foundation", true],
  ["full-body-3-day-foundation", "Three-Day Full-Body Foundation", true],
  ["general-fitness-2-day", "Two-Day General Fitness", false],
  ["general-fitness-3-day", "Three-Day General Fitness", false],
] as const) {
  test(`source-backed ${slug} selection preserves unspecified rest and immutable version locally`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/programs/${slug}`);
    await expect(
      page.getByText(/Personal-use publication after source verification/),
    ).toBeVisible();
    await expect(
      page.getByText(
        knownDuration ? "Source time allocation" : "Duration availability",
        { exact: true },
      ),
    ).toBeVisible();
    if (!knownDuration)
      await expect(
        page.getByText("Duration not supplied", { exact: true }).first(),
      ).toBeVisible();
    await expect(
      page.getByText(/timed rest not specified by the source/).first(),
    ).toBeVisible();
    await expect(
      page
        .getByRole("link", { name: "One-arm dumbbell row", exact: true })
        .first(),
    ).toHaveAttribute("href", "/exercises/one-arm-dumbbell-row");
    await page
      .getByRole("button", { name: "Select this program", exact: true })
      .click();
    await expect(page.getByRole("status")).toContainText("Program selected");
    await page.goto("/programs/current");
    await expect(
      page.getByRole("heading", {
        name: title,
        exact: true,
      }),
    ).toBeVisible();
    await page.reload();
    await expect(
      page.getByRole("heading", {
        name: title,
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(/timed rest not specified by the source/).first(),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Clear current selection", exact: true })
      .click();
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(
      page.getByRole("heading", {
        name: title,
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Clear current selection", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Confirm clear", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "No program selected.", exact: true }),
    ).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("Finder includes unknown-duration published templates only after an explicit no-time-limit choice", async ({
  page,
}) => {
  await page.goto("/programs/finder");
  await page
    .getByRole("combobox", { name: "Experience", exact: true })
    .selectOption("intermediate");
  for (const label of ["Bodyweight", "Dumbbell", "Bench"])
    await page.getByLabel(label, { exact: true }).check();
  await page
    .getByRole("combobox", {
      name: /These templates cover generally healthy adults/,
    })
    .selectOption("yes");
  await page.getByRole("button", { name: "Find matching templates" }).click();
  await expect(
    page.getByRole("heading", { name: "Two-Day General Fitness", exact: true }),
  ).toHaveCount(0);
  await page
    .getByLabel("Do not apply a session time limit", { exact: true })
    .check();
  await expect(
    page.getByLabel("Minutes available per session", { exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Find matching templates" }).click();
  await expect(
    page.getByRole("heading", { name: "Two-Day General Fitness", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Three-Day General Fitness",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Duration is not supplied; you chose not to apply a time limit.",
      { exact: true },
    ),
  ).toHaveCount(2);
  await page
    .getByLabel("Do not apply a session time limit", { exact: true })
    .uncheck();
  await page.getByRole("button", { name: "Find matching templates" }).click();
  await expect(
    page.getByRole("heading", { name: "Two-Day General Fitness", exact: true }),
  ).toHaveCount(0);
});
