import { readFileSync, writeFileSync } from "node:fs";
import { taxonomySchema } from "../src/features/muscles/schema";
import { programSchema } from "../src/features/programs/schema";
const read = (p: string): unknown => JSON.parse(readFileSync(p, "utf8"));
const write = (p: string, value: unknown) => {
  const text = JSON.stringify(value, null, 2) + "\n";
  if (process.argv.includes("--check")) {
    if (readFileSync(p, "utf8") !== text)
      throw Error(`Stale runtime knowledge: ${p}`);
  } else writeFileSync(p, text);
};
const taxonomy = taxonomySchema.parse(
  read("src/content/muscles/taxonomy.json"),
);
write("src/content/muscles/runtime-taxonomy.json", {
  ...taxonomy,
  records: taxonomy.records.map((r) => ({
    id: r.id,
    slug: r.slug,
    displayName: r.displayName,
    entityType: r.entityType,
    regionIds: r.regionIds,
    trainingGroupIds: r.trainingGroupIds,
  })),
});
const current = programSchema
    .array()
    .parse(read("src/content/programs/records.json")),
  versions = programSchema
    .array()
    .parse(read("src/content/programs/versions.json"));
const key = (p: { id: string; version: string }) => `${p.id}@${p.version}`;
if (new Set(versions.map(key)).size !== versions.length)
  throw Error("Duplicate immutable program version.");
const index = versions.map((p) => {
  const match = current.find((r) => key(r) === key(p));
  if (match && JSON.stringify(match) !== JSON.stringify(p))
    throw Error("Current program differs from immutable version.");
  return { id: p.id, version: p.version, current: !!match };
});
write("src/content/programs/version-index.json", index);
write(
  "src/content/programs/historical-versions.json",
  versions.filter((p) => !index.find((r) => key(r) === key(p))?.current),
);
console.log(
  "Runtime knowledge retains every anatomy identity and immutable program version without duplicate current payloads.",
);
