import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("milkfish preparation deep links and soy missing household weights remain explicit @a11y", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.goto("/foods/milkfish");
  const profiles = page.getByRole("combobox", {
    name: "Composition profile",
    exact: true,
  });
  await expect(profiles).toHaveValue("profile_milkfish_fdc_173675");
  await expect(page.locator(".food-profile-banner strong")).toHaveText(
    "Fish, milkfish, raw",
  );
  await profiles.selectOption("profile_milkfish_fdc_171995");
  await expect(page).toHaveURL(/profile=profile_milkfish_fdc_171995/);
  await expect(page.locator(".food-profile-banner strong")).toHaveText(
    "Fish, milkfish, cooked, dry heat",
  );
  await page.reload();
  await expect(profiles).toHaveValue("profile_milkfish_fdc_171995");
  await page.goto("/foods/soy-beverage-unsweetened");
  await expect(page.locator(".food-profile-banner strong")).toHaveText(
    "Soy milk, unsweetened, plain, shelf stable",
  );
  await expect(
    page.getByText(
      "No source-backed household portions are available for this profile.",
    ),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});
test("food discovery filters, sourced publication and safe unknown profiles", async ({
  page,
}) => {
  await page.goto("/foods");
  await expect(
    page.getByRole("heading", { name: "Know what’s in your food." }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Search foods" }).fill("apple");
  await expect(page).toHaveURL(/q=apple/);
  await expect(
    page.getByRole("heading", { name: "Apple", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search foods" })
    .fill("unmatched-identity-zzzz");
  await expect(
    page.getByRole("heading", { name: "No reviewed profiles match." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Food filters", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Category", { exact: true }).selectOption("fruits");
  await dialog.getByRole("button", { name: "Show results" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page).toHaveURL(/category=fruits/);
  await page.goto("/foods/compare?profiles=profile_draft,profile_unknown");
  await expect(
    page.getByRole("heading", { name: "Choose reviewed food profiles." }),
  ).toBeVisible();
  await page.goto("/foods/apple");
  await expect(
    page.getByRole("heading", { name: "Apple", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Publication review level", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      /Personal-use publication after source matching and machine validation/,
    ),
  ).toBeVisible();
  await page.goto("/foods/amla");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
  await page.goto("/foods/categories");
  await expect(
    page.getByRole("heading", { name: "Food categories", exact: true }),
  ).toBeVisible();
  await page.goto("/foods/sources");
  await expect(
    page.getByText(
      "258 source-backed foods and 267 machine-validated profiles",
      {
        exact: false,
      },
    ),
  ).toBeVisible();
  await page.goto("/foods/methodology");
  await expect(
    page.getByRole("heading", { name: "Missing is different from zero" }),
  ).toBeVisible();
});
test("food catalogue reflows and exposes accessible filter dialog", async ({
  page,
}) => {
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/foods");
    await expect(
      page.getByRole("textbox", { name: "Search foods" }),
    ).toBeEnabled();
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
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    await page
      .getByRole("button", { name: "Food filters", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
    await expect(
      page.getByRole("button", { name: "Food filters", exact: true }),
    ).toBeFocused();
  }
});

test("native food profile control reflows and remains keyboard operable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 1000 });
  await page.goto("/foods/brown-rice");
  const control = page.getByRole("combobox", {
    name: "Composition profile",
    exact: true,
  });
  await expect(control).toBeEnabled();
  const options = await control.locator("option").evaluateAll((rows) =>
    rows.map((row) => ({
      value: (row as HTMLOptionElement).value,
      text: row.textContent ?? "",
    })),
  );
  expect(options.length).toBeGreaterThan(1);
  await control.focus();
  await expect(control).toBeFocused();
  await control.press("Home");
  await control.press("ArrowDown");
  await control.press("Enter");
  await expect(control).toHaveValue(options[1]!.value);
  await expect(page).toHaveURL(new RegExp("profile=" + options[1]!.value));
  await expect(page.locator(".food-profile-banner strong")).toHaveText(
    options[1]!.text.split(" · ")[0]!,
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
