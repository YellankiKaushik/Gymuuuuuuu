import { expect, test } from "@playwright/test";

for (const path of [
  "/",
  "/progress/privacy",
  "/nutrition/settings",
  "/analytics/workouts",
]) {
  test(`@security cached document hydration remains usable at ${path}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (let visit = 0; visit < 8; visit++) {
      await page.goto(path);
      await expect(
        page.getByRole("heading", { level: 1 }).first(),
      ).toBeVisible();
      await expect(page).toHaveTitle(/Fitness OS/);
      await page
        .getByRole("button", { name: "Search Fitness OS", exact: true })
        .click();
      await expect(
        page.getByRole("combobox", {
          name: "Search Fitness OS on this device",
        }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
    }
    expect(errors).toEqual([]);
  });
}
