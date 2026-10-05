import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("sidebar preference, keyboard search and missing routes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.getByRole("button", { name: "Collapse sidebar" }).click();
  await expect(page.locator(".desktop-sidebar")).toHaveClass(/collapsed/);
  await page.reload();
  await expect(page.locator(".desktop-sidebar")).toHaveClass(/collapsed/);
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  await page.keyboard.press("Control+k");
  const input = page.getByRole("combobox", {
    name: "Search Fitness OS on this device",
  });
  await input.fill("vitamins");
  await expect(
    page.getByRole("option", { name: /Nutrient encyclopedia/ }),
  ).toBeVisible();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("option").nth(1)).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await page.keyboard.press("ArrowUp");
  await expect(page.getByRole("option").first()).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await input.fill("vitamin c");
  await expect(page.getByRole("option", { selected: true })).toContainText(
    "Vitamin C",
  );
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/nutrients\/vitamin-c$/);
  await expect(
    page.getByRole("button", { name: "Search Fitness OS" }),
  ).toBeEnabled();
  await page.keyboard.press("/");
  await input.fill("no-such-module");
  await expect(page.getByText(/No published items match/)).toBeVisible();
  await input.fill("");
  await expect(input).toHaveValue("");
  await page.keyboard.press("Escape");
  await page.goto("/exercises/unknown-record");
  await expect(
    page.getByRole("heading", { name: "Exercise not available" }),
  ).toBeVisible();
  await page.goto("/no-such-page");
  await expect(
    page.getByRole("heading", { name: "Page not found", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Search Fitness OS", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Search Fitness OS" }),
  ).toBeVisible();
});

test("tablet drawer and mobile More restore focus and expose contracted destinations", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("dialog", { name: "Your workspace" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(
    page
      .getByRole("navigation", { name: "Mobile primary navigation" })
      .getByRole("link"),
  ).toHaveCount(5);
  await page.getByRole("button", { name: "More destinations" }).click();
  const dialog = page.getByRole("dialog", { name: "More from your workspace" });
  await expect(dialog.getByRole("link")).toHaveCount(6);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "More destinations" }),
  ).toBeFocused();
  await page.goto("/settings");
  await page.getByRole("radio", { name: "System", exact: true }).check();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("required viewports, narrow landscape and malformed preference recovery", async ({
  page,
}) => {
  const viewports = [
    [320, 568],
    [375, 812],
    [390, 844],
    [768, 1024],
    [1024, 768],
    [1280, 800],
    [1440, 900],
    [568, 320],
  ];
  await page.goto("/");
  for (const [width, height] of viewports) {
    await page.setViewportSize({ width: width ?? 320, height: height ?? 568 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      `${width}x${height}`,
    ).toBe(true);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
  await page.evaluate(() =>
    window.localStorage.setItem("fitness-os:preferences:v1", "{broken"),
  );
  await page.goto("/settings");
  await expect(
    page.getByText("Saved preferences are invalid.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "Light", exact: true }).check();
  await expect(
    page.getByText("Preferences saved on this device."),
  ).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.evaluate(() => {
    document.body.style.zoom = "2";
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    "200% CSS zoom reflow",
  ).toBe(true);
});
