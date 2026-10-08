import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { nutrientSchema } from "../src/features/nutrients/schema";
import {
  readVerifiedFdaSnapshot,
  verifyFdaReferenceValues,
  withVerifiedFdaReferences,
} from "./content/fda";

const snapshot = readVerifiedFdaSnapshot();
const path = "src/content/nutrients/records.json";
const records = nutrientSchema
  .array()
  .parse(JSON.parse(readFileSync(path, "utf8")));
const output = nutrientSchema
  .array()
  .parse(records.map((r) => withVerifiedFdaReferences(r, snapshot)));
verifyFdaReferenceValues(output, snapshot);
for (const row of snapshot.rows)
  if (
    output.filter(
      (r) =>
        r.status === "published" &&
        r.id === row.nutrientId &&
        r.referenceValues.some((v) => v.sourceId === snapshot.sourceId),
    ).length !== 1
  )
    throw Error(
      `${row.nutrientId}: table row must map to exactly one published nutrient.`,
    );
const sources: {
  id: string;
  sourceVersion: string | null;
  extractedAt: string;
  url: string;
}[] = JSON.parse(
  readFileSync("src/content/provenance/verified-sources.json", "utf8"),
);
const source = sources.find((s) => s.id === snapshot.sourceId);
if (
  source?.sourceVersion !== snapshot.sourceVersion ||
  source.extractedAt !== snapshot.extractedAt ||
  source.url !== snapshot.url
)
  throw Error("FDA snapshot and approved source registry disagree.");
const value = JSON.stringify(output, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== value)
    throw Error("FDA reference release is stale.");
} else {
  writeFileSync(`${path}.tmp`, value);
  renameSync(`${path}.tmp`, path);
}
console.log(
  `Verified ${snapshot.rows.length} exact FDA label reference rows; no personal intake targets or form conversions.`,
);
