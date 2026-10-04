import React from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { FoodDetail } from "../src/features/foods/detail";
import { FoodComparison } from "../src/features/foods/compare";
import { foodFixture } from "../tests/fixtures/food";
Object.assign(globalThis, { React });
const css = ["foundation", "shell", "catalogue", "foods"]
  .map((name) => readFileSync(`src/styles/${name}.css`, "utf8"))
  .join("\n");
const second = structuredClone(foodFixture);
second.id = "food_second_fixture";
second.slug = "second-fixture";
second.canonicalName = "Second synthetic fixture";
second.compositionProfiles[0]!.profileId = "profile_second_fixture";
const markup = [
  ["detail", renderToStaticMarkup(<FoodDetail food={foodFixture} />)],
  [
    "compare",
    renderToStaticMarkup(
      <FoodComparison
        columns={[
          { food: foodFixture, profile: foodFixture.compositionProfiles[0]! },
          { food: second, profile: second.compositionProfiles[0]! },
        ]}
      />,
    ),
  ],
];
const browser = await chromium.launch({ channel: "msedge", headless: true }),
  context = await browser.newContext(),
  page = await context.newPage();
for (const [name, html] of markup)
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.setContent(
      `<!doctype html><html lang="en"><head><title>Engineering fixture</title><style>${css}:root{--font-sans:'Segoe UI',Arial,sans-serif}</style></head><body><main>${html}</main></body></html>`,
    );
    if (
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      )
    )
      throw Error(`Overflow ${name} ${width}`);
    for (const theme of ["light", "dark"]) {
      await page.evaluate(
        (t) => (document.documentElement.dataset.theme = t),
        theme,
      );
      const violations = (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze()
      ).violations;
      if (violations.length)
        throw Error(
          JSON.stringify(
            violations.map((v) => ({
              id: v.id,
              targets: v.nodes.map((n) => n.target),
            })),
          ),
        );
    }
    if (width === 320 || width === 1440)
      await page.screenshot({
        path: `docs/screenshots/phase07-${name}-${width}.png`,
        fullPage: true,
      });
  }
await browser.close();
console.log(
  "Food detail and comparison fixtures passed five viewport widths and both themes.",
);
