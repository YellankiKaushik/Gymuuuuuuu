import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("local workout logs, refreshes, completes, edits, backs up and restores", async ({
  page,
  context,
}) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/workout");
  await page
    .getByLabel("Personal exercise label", { exact: true })
    .fill("Personal test lift");
  await page.getByRole("button", { name: "Save label and select" }).click();
  await expect(
    page.getByText("Personal test lift · Local label", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Workout title", { exact: true }).fill("My local test");
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await expect(page).toHaveURL(/workout\/session\//);
  await page.getByRole("button", { name: "Take over editor" }).click();
  await expect(
    page.getByRole("button", { name: "Complete set", exact: true }),
  ).toBeEnabled();
  await page.getByLabel("Load (kg)", { exact: true }).fill("20");
  await page.getByLabel("Repetitions", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Complete set", exact: true }).click();
  await expect(
    page.getByText("Set 1 · completed", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "60s", exact: true }).click();
  await page
    .getByRole("button", { name: "Pause workout", exact: true })
    .click();
  await expect(
    page.locator(".workout-status").getByText("Saved", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Take over editor" }).click();
  await expect(
    page.getByText("Set 1 · completed", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/seconds remaining/)).toBeVisible();
  await page
    .getByRole("button", { name: "Resume workout", exact: true })
    .click();
  const second = await context.newPage();
  await second.goto(page.url());
  await expect(
    second.getByRole("button", { name: "Take over editor" }),
  ).toBeVisible();
  await expect(
    second.getByRole("button", { name: "Complete set", exact: true }),
  ).toBeDisabled();
  await second.close();
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (value) => (document.documentElement.dataset.theme = value),
        theme,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
      ).toBe(false);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations,
      ).toEqual([]);
    }
    if (width === 320 || width === 1440)
      await page.screenshot({
        path: `docs/screenshots/phase06-active-${width}.png`,
        fullPage: true,
      });
  }
  await page
    .getByRole("button", { name: "Finish workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page).toHaveURL(/workout\/summary\//);
  await expect(
    page.getByRole("heading", { name: "Completed sets", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Review or edit", exact: true }).click();
  await page.getByRole("button", { name: "Take over editor" }).click();
  await page.getByLabel("Repetitions", { exact: true }).fill("6");
  await expect(
    page.locator(".workout-status").getByText("Saved", { exact: true }),
  ).toBeVisible();
  await page.goto("/workout/settings");
  const download = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Download workout JSON", exact: true })
    .click();
  const backup = await download;
  const file = await backup.path();
  expect(file).toBeTruthy();
  await page
    .getByLabel("Preview workout backup", { exact: true })
    .setInputFiles(file!);
  await expect(
    page.getByRole("heading", { name: "Restore preview", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Confirm local import", exact: true })
    .click();
  await expect(
    page.getByText(
      "Import applied atomically. Derived records will rebuild from sessions.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.setViewportSize({ width: 320, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
  ).toBe(false);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(errors).toEqual([]);
});
