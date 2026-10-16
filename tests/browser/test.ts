import { test as base, expect, type Page } from "@playwright/test";

export async function settleLayout(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
}

export async function readyForUi(page: Page) {
  await expect(
    page.getByRole("button", { name: "Search Fitness OS", exact: true }),
  ).toBeEnabled();
  await settleLayout(page);
}

// SSR headings do not prove event handlers are hydrated. All assertions and
// timeouts remain unchanged; document navigation and resizing await real readiness.
export const test = base.extend({
  page: async ({ page }, use) => {
    const goto = page.goto.bind(page);
    page.goto = async (...args) => {
      const response = await goto(...args);
      await readyForUi(page);
      return response;
    };
    const reload = page.reload.bind(page);
    page.reload = async (...args) => {
      const response = await reload(...args);
      await readyForUi(page);
      return response;
    };
    const resize = page.setViewportSize.bind(page);
    page.setViewportSize = async (size) => {
      await resize(size);
      if (page.url() !== "about:blank") await settleLayout(page);
    };
    await use(page);
  },
});
export { expect };
export type * from "@playwright/test";
