import { readFileSync, writeFileSync } from "node:fs";
import { z } from "zod";

// Full draft identities remain the audit authority. Runtime checks only need
// their IDs (and cardio domain filters), not unpublished editorial content.
for (const [module, key] of [
  ["supplements", "seedRecords"],
  ["recovery", "seedTaxonomy"],
  ["cardio", "seedTaxonomy"],
] as const) {
  const base = `src/content/${module}`;
  const full = z
    .record(z.string(), z.unknown())
    .parse(JSON.parse(readFileSync(`${base}/reference.json`, "utf8")));
  const seeds = z
    .array(
      z.object({
        id: z.string().min(1),
        slug: z.string().min(1),
        entityType: z.string().min(1),
        domain: z.string().optional(),
      }),
    )
    .parse(full[key]);
  if (new Set(seeds.map((s) => s.id)).size !== seeds.length)
    throw Error(`Duplicate ${module} seed ID`);
  const projected = {
    ...full,
    [key]: seeds.map((seed) =>
      module === "cardio"
        ? {
            id: seed.id,
            slug: seed.slug,
            entityType: seed.entityType,
            domain: seed.domain,
          }
        : { id: seed.id, slug: seed.slug, entityType: seed.entityType },
    ),
  };
  const json = JSON.stringify(projected, null, 2) + "\n";
  const path = `${base}/runtime-reference.json`;
  if (process.argv.includes("--check")) {
    if (readFileSync(path, "utf8") !== json)
      throw Error(`Stale ${module} runtime reference`);
  } else writeFileSync(path, json);
}
console.log(
  "Runtime reference projections preserve every seed ID; full draft identities remain in the audit.",
);
