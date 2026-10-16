import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync, existsSync } from "node:fs";
import { HomePage } from "../src/components/home";
import { ModuleDiagram } from "../src/components/common/module-diagram";
import { WeightChart } from "../src/features/progress/weight-chart";
import { findModule } from "../src/data/navigation";

it("Home and workflow diagrams link only to existing destinations", () => {
  const html = [
    renderToStaticMarkup(<HomePage />),
    ...(
      [
        "training",
        "nutrition",
        "recovery",
        "cardio",
        "evidence",
        "backup",
      ] as const
    ).map((kind) => renderToStaticMarkup(<ModuleDiagram kind={kind} />)),
  ].join("");
  for (const [, href] of html.matchAll(/href="([^"]+)"/g))
    expect(
      href === "/" ||
        href?.startsWith("/settings/data") ||
        Boolean(findModule(href!)),
      href,
    ).toBe(true);
  for (const title of [
    "Learn",
    "Train",
    "Eat",
    "Recover",
    "Progress",
    "Tools &amp; data",
  ])
    expect(html).toContain(title);
});

it("weight charts expose measured points and a table without bridging missing dates", () => {
  expect(renderToStaticMarkup(<WeightChart rows={[]} />)).toContain(
    "No recorded weight points yet",
  );
  const html = renderToStaticMarkup(
    <WeightChart
      rows={[
        {
          localDate: "2026-10-01",
          medianKg: 80,
          recordCount: 1,
          recordIds: ["one"],
          flags: [],
        },
        {
          localDate: "2026-10-03",
          medianKg: 79,
          recordCount: 2,
          recordIds: ["two", "three"],
          flags: [],
        },
      ]}
    />,
  );
  expect(html.match(/<circle /g)).toHaveLength(2);
  expect(html).toContain("Median (kg)");
  expect(html).not.toContain("2026-10-02");
  expect(html).not.toContain("<polyline");
});

it("every manifest visual has provenance, licensing and a real local file", () => {
  const manifest = JSON.parse(
    readFileSync("docs/assets/owner-ux-visual-manifest.json", "utf8"),
  ) as {
    externalImagesAdded: number;
    assets: {
      file: string;
      purpose: string;
      source: string;
      author: string;
      license: string;
      sourceUrl: string | null;
      attributionRequirement: string;
      modified: boolean;
    }[];
  };
  expect(manifest.externalImagesAdded).toBe(0);
  for (const asset of manifest.assets) {
    expect(existsSync(asset.file), asset.file).toBe(true);
    for (const key of [
      "purpose",
      "source",
      "author",
      "license",
      "attributionRequirement",
    ] as const)
      expect(asset[key], `${asset.file}:${key}`).toBeTruthy();
    expect(typeof asset.modified).toBe("boolean");
    expect(asset).toHaveProperty("sourceUrl");
  }
});
