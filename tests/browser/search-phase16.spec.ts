import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("local search dialog supports keyboard suggestions, navigation and focus-safe close", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const opener = page.getByRole("button", { name: "Search Fitness OS" });
  await expect(opener).toBeEnabled();
  await page.keyboard.press("Control+k");
  const input = page.getByRole("combobox", {
    name: "Search Fitness OS on this device",
  });
  await expect(input).toBeFocused();
  await input.fill("vitamins");
  await expect(page.getByRole("option").first()).toBeVisible();
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
  await opener.click();
  await expect(
    page.getByRole("dialog", { name: "Search Fitness OS" }),
  ).toBeVisible();
  await expect(input).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(opener).toBeFocused();
});

test("public search filters stay in URL while private query state never does", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/search?q=vitamins&type=nutrient");
  await expect(
    page.getByRole("heading", { name: "Search Fitness OS" }),
  ).toBeVisible();
  await expect(page.getByText(/Private search is off/).first()).toBeVisible();
  await page.getByText("Modules", { exact: true }).click();
  await page.getByRole("checkbox", { name: "phase 08 nutrients" }).check();
  await expect(
    page.getByRole("checkbox", { name: "phase 08 nutrients" }),
  ).toBeChecked();
  await expect(page).toHaveURL(/q=vitamins/);
  await expect(page).toHaveURL(/phase_08_nutrients/);
  await page.getByRole("button", { name: "On-device records" }).click();
  const query = page.getByRole("textbox", { name: "Search query" });
  await query.fill("knee pain note");
  await expect(page).not.toHaveURL(/knee|pain|note/);
  await expect(
    page.getByRole("heading", { name: "Search this device" }),
  ).toBeVisible();
  await expect(page.getByText(/Private search is off/).first()).toBeVisible();
  expect(
    requests.every((url) => new URL(url).origin === new URL(page.url()).origin),
  ).toBe(true);
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

test("favourites persist locally and saved pages remain private across reload", async ({
  page,
}) => {
  await page.goto("/search?q=vitamins");
  const favourite = page.getByRole("button", { name: "Favourite" }).first();
  await expect(favourite).toBeVisible();
  await favourite.click();
  await expect(
    page.getByText("Favourite saved on this device.", { exact: true }),
  ).toBeVisible();
  await page.goto("/saved/favourites");
  await expect(page.getByRole("heading", { name: "Favourites" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Nutrient encyclopedia/ }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("link", { name: /Nutrient encyclopedia/ }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex,follow",
  );
});

test("collections support rename, private notes, sorting, filtering and moving references", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/saved/collections");
  await expect(
    page.getByText("Saved items loaded on this device.", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("New collection name").fill("Learning list");
  await page.getByRole("button", { name: "Create collection" }).click();
  await expect(page.getByRole("link", { name: "Learning list" })).toBeVisible();
  await page.getByRole("button", { name: "Rename" }).click();
  await page.getByLabel("Rename collection").fill("Training list");
  await page.getByRole("button", { name: "Save name" }).click();
  await page.getByLabel("New collection name").fill("Later");
  await page.getByRole("button", { name: "Create collection" }).click();
  await expect(
    page.getByRole("link", { name: "Later", exact: true }),
  ).toBeVisible();
  await page.goto("/search?q=vitamins");
  const collection = page.getByLabel(
    "Choose collection for Nutrient encyclopedia",
  );
  await collection.selectOption({ label: "Training list" });
  await page
    .getByRole("article")
    .filter({ has: collection })
    .getByRole("button", { name: "Add to collection" })
    .click();
  await expect(
    page.getByText("Reference added to the selected collection.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.goto("/saved/collections");
  await page.getByRole("link", { name: "Training list" }).click();
  await expect(
    page.getByRole("link", { name: "Nutrient encyclopedia" }),
  ).toBeVisible();
  const note = page.getByLabel("Private collection note");
  await note.fill("Review after training");
  await page.getByRole("button", { name: "Save note" }).click();
  await page.getByLabel("Sort collection").selectOption("title");
  await page.getByLabel("Filter by entity type").selectOption("route");
  await page
    .getByLabel("Destination collection")
    .selectOption({ label: "Later" });
  await page.getByRole("button", { name: "Move", exact: true }).click();
  await expect(
    page.getByText("No references match this collection filter."),
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

test("search settings and saved overview reflow at mobile and desktop widths", async ({
  page,
}) => {
  for (const width of [320, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    for (const route of [
      "/search/settings",
      "/saved",
      "/saved/collections",
      "/recent",
      "/compare",
    ]) {
      await page.goto(route);
      const layout = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        viewport: innerWidth,
        overflow: Array.from(document.querySelectorAll("body *"))
          .filter((item) => item.getBoundingClientRect().right > innerWidth + 1)
          .slice(0, 12)
          .map((item) => ({
            tag: item.tagName,
            className: typeof item.className === "string" ? item.className : "",
            right: item.getBoundingClientRect().right,
            width: item.scrollWidth,
          })),
      }));
      expect(layout.width <= layout.viewport, `${route} at ${width}px`).toBe(
        true,
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
            .analyze()
        ).violations,
        route,
      ).toEqual([]);
    }
  }
});
