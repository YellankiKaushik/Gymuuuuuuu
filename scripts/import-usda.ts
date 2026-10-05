import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { buildUsdaRelease } from "./content/usda";
const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const sources = read("src/content/provenance/sources.json") as {
  extractedAt: string;
}[];
const rows = buildUsdaRelease(
  read("src/content/foods/identities.json") as unknown[],
  read("src/content/provenance/food-mappings.json") as unknown[],
  read("src/content/provenance/usda-selected.json") as unknown[],
  sources[0]!.extractedAt,
);
const path = "src/content/foods/records.json";
const value = JSON.stringify(rows, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== value)
    throw Error("USDA release is stale. Run npm run content:import:foods.");
} else {
  writeFileSync(`${path}.tmp`, value);
  renameSync(`${path}.tmp`, path);
}
console.log(
  `Verified USDA release: ${rows.length} identities / ${rows.reduce((n, f) => n + f.compositionProfiles.length, 0)} profiles.`,
);
