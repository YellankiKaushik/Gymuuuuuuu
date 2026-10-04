import React from "react";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { NutrientDetail } from "../src/features/nutrients/detail";
import { NutrientComparison } from "../src/features/nutrients/compare";
import {
  nutrientFixture,
  nutrientFrameworkFixture,
} from "../tests/fixtures/nutrient";
Object.assign(globalThis, { React });
const second = structuredClone(nutrientFixture);
second.id = "fat_total_g";
second.slug = "second-synthetic-fixture";
second.canonicalName = "Second synthetic nutrient fixture";
const css = ["foundation", "shell", "catalogue", "foods", "nutrients"]
  .map((name) => readFileSync(`src/styles/${name}.css`, "utf8"))
  .join("\n");
const markup = [
  [
    "detail",
    renderToStaticMarkup(
      <NutrientDetail
        record={nutrientFixture}
        datasets={[nutrientFrameworkFixture]}
      />,
    ),
  ],
  [
    "compare",
    renderToStaticMarkup(
      <NutrientComparison records={[nutrientFixture, second]} />,
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
      `<!doctype html><html lang="en"><head><title>Synthetic engineering fixture</title><style>${css}:root{--font-sans:'Segoe UI',Arial,sans-serif}</style></head><body><main>${html}</main></body></html>`,
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
        path: `docs/screenshots/phase08-${name}-${width}.png`,
        fullPage: true,
      });
  }
await browser.close();
console.log(
  "Nutrient detail and comparison fixtures passed five viewport widths and both themes.",
);
