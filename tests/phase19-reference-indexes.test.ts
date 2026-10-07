import { expect, test } from "vitest";
import fs from "node:fs";
import { z } from "zod";
test("runtime projections retain all IDs and required domains without draft text", () => {
  for (const [module, key] of [
    ["supplements", "seedRecords"],
    ["recovery", "seedTaxonomy"],
    ["cardio", "seedTaxonomy"],
  ]) {
    const parse = (suffix: string) =>
      z
        .record(z.string(), z.unknown())
        .parse(
          JSON.parse(
            fs.readFileSync(`src/content/${module}/${suffix}.json`, "utf8"),
          ),
        );
    const full = parse("reference"),
      runtime = parse("runtime-reference");
    const seeds = z
      .array(
        z.object({
          id: z.string(),
          slug: z.string(),
          entityType: z.string(),
          domain: z.string().optional(),
        }),
      )
      .parse(full[key!]);
    expect(runtime[key!]).toEqual(
      seeds.map((s) =>
        module === "cardio"
          ? {
              id: s.id,
              slug: s.slug,
              entityType: s.entityType,
              domain: s.domain,
            }
          : { id: s.id, slug: s.slug, entityType: s.entityType },
      ),
    );
    const withoutSeeds = (value: Record<string, unknown>) =>
      Object.fromEntries(Object.entries(value).filter(([k]) => k !== key));
    expect(withoutSeeds(runtime)).toEqual(withoutSeeds(full));
  }
});
