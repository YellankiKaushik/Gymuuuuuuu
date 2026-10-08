import { expect, test } from "@playwright/test";

test("@security document history restores usable public controls", async ({
  page,
}) => {
  for (let visit = 0; visit < 4; visit++) {
    await page.goto("/supplements/evidence");
    await expect(
      page.getByLabel("Search names, outcomes, populations and forms"),
    ).toBeEnabled();
    await page.goto("/supplements/ingredients/ingredient-dietary-nitrate");
    await page.goBack();
    const filter = page.getByLabel(
      "Search names, outcomes, populations and forms",
    );
    await expect(filter).toBeEnabled();
    await filter.fill("dietary protein");
    await expect(
      page.getByRole("heading", {
        name: "Branched-Chain Amino Acids",
        exact: true,
      }),
    ).toBeVisible();
    await page.goForward();
    await expect(
      page.getByRole("heading", {
        name: "Dietary Nitrate or Beetroot Juice",
        exact: true,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "Search Fitness OS", exact: true })
      .click();
    await expect(
      page.getByRole("combobox", { name: "Search Fitness OS on this device" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
  }
});

for (const path of [
  "/",
  "/progress/privacy",
  "/nutrition/settings",
  "/analytics/workouts",
  "/supplements/evidence",
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
      if (path === "/supplements/evidence") {
        const filter = page.getByLabel(
          "Search names, outcomes, populations and forms",
        );
        await expect(filter).toBeEnabled();
        await filter.fill("dietary protein");
        await expect(
          page.getByRole("heading", {
            name: "Branched-Chain Amino Acids",
            exact: true,
          }),
        ).toBeVisible();
        await filter.fill("");
      }
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
