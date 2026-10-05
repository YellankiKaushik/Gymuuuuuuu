import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import type { PublicSearchDocument } from "../../src/features/search/domain";
const documents = JSON.parse(
  readFileSync("src/data/search/search-documents.public.json", "utf8"),
) as PublicSearchDocument[];
const manifest: unknown = JSON.parse(
  readFileSync("src/data/search/search-manifest.json", "utf8"),
);

const tree = readFileSync("src/routeTree.gen.ts", "utf8");
const inventory = tree
  .split("export interface FileRoutesByFullPath {")[1]!
  .split("\n}")[0]!;
const patterns = [...inventory.matchAll(/'([^']+)': typeof /g)].map(
  (m) => m[1]!,
);
const cases = new Map<string, "route" | "public_record" | "missing_record">();
for (const path of patterns) {
  cases.set(
    path.replace(/\$[^/]+/g, "audit-unknown-record"),
    path.includes("$") ? "missing_record" : "route",
  );
}
for (const d of documents) {
  if (d.entityType !== "route" && d.entityType !== "dashboard_widget")
    cases.set(d.route, "public_record");
}

for (const [path, kind] of cases) {
  test(`route audit ${path}`, async ({ page, browserName }) => {
    const errors: string[] = [];
    const remoteRequests: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (
        url.protocol.startsWith("http") &&
        url.origin !== "http://127.0.0.1:3000"
      )
        remoteRequests.push(url.origin + url.pathname);
    });
    const states = [];
    let status: number | null = null;
    try {
      const response = await page.goto(path);
      status = response?.status() ?? null;
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.locator("h1").first()).toBeVisible();
      for (const [width, theme] of [
        [320, "light"],
        [320, "dark"],
        [768, "light"],
        [1440, "light"],
        [1440, "dark"],
      ] as const) {
        await page.setViewportSize({ width, height: 1000 });
        await page.evaluate((value) => {
          document.documentElement.dataset.theme = value;
        }, theme);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        );
        const violations =
          width === 768
            ? []
            : (
                await new AxeBuilder({ page })
                  .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
                  .analyze()
              ).violations.map((v) => ({
                id: v.id,
                impact: v.impact,
                nodes: v.nodes.map((n) => n.target),
              }));
        states.push({ width, theme, overflow, violations });
      }
      expect(status).toBeLessThan(500);
      if (kind !== "missing_record") expect(status).toBeLessThan(400);
      expect(errors).toEqual([]);
      expect(remoteRequests).toEqual([]);
      expect(states.filter((s) => s.overflow || s.violations.length)).toEqual(
        [],
      );
    } finally {
      const directory = "data-imports/route-audit";
      mkdirSync(directory, { recursive: true });
      const id = createHash("sha256")
        .update(`${browserName}:${path}`)
        .digest("hex");
      writeFileSync(
        `${directory}/${id}.json`,
        JSON.stringify(
          {
            path,
            kind,
            browserName,
            generatedAt: new Date().toISOString(),
            contentManifest: manifest,
            status,
            finalUrl: page.url(),
            errors,
            remoteRequests,
            states,
            complete: states.length === 5,
          },
          null,
          2,
        ) + "\n",
      );
    }
  });
}
