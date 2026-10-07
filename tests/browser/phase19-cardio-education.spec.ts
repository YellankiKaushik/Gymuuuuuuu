import { expect, test } from "@playwright/test";
test("cardio educational methods expose their source scope, prerequisites and pause boundaries", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/cardio/learn/topic-perceived-exertion-0-10");
  await expect(
    page.getByRole("heading", {
      name: "Generic 0–10 Perceived Exertion",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(/Moderate relative effort is 5 or 6/),
  ).toBeVisible();
  await expect(page.getByText(/not resistance-training RIR/)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Before you start", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "When to pause", exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Evidence level: Not Graded/i)).toBeVisible();
  await page.goto("/cardio/learn/topic-met-definition");
  await expect(
    page.getByText(/No personal MET or VO2max estimate/),
  ).toBeVisible();
  await page.goto("/cardio/learn/topic-moderate-vigorous-equivalence");
  await expect(
    page.getByText(/not equal training load, fatigue, calories/),
  ).toBeVisible();
  await page.goto("/cardio/modalities/modality-walking-outdoor");
  await expect(page.getByText(/2025 review-due date is past/)).toBeVisible();
  await expect(
    page.getByText(/Contains public sector information licensed/),
  ).toBeVisible();
  await page.goto("/cardio/modalities/modality-cycling-outdoor");
  await expect(
    page.getByText(/name alone does not classify your recorded effort/),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
