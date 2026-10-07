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
test("source-backed program selection preserves unspecified rest and immutable version locally", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/programs/full-body-2-day-foundation");
  await expect(
    page.getByText(/Personal-use publication after source verification/),
  ).toBeVisible();
  await expect(
    page.getByText("Source time allocation", { exact: true }),
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
      name: "Two-Day Full-Body Foundation",
      exact: true,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", {
      name: "Two-Day Full-Body Foundation",
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
      name: "Two-Day Full-Body Foundation",
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
