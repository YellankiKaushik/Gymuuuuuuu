import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import definitions from "../src/content/provenance/historical-remaining-anatomy-definitions.json";
import snapshot from "../src/content/provenance/gray-1918-remaining-snapshot.json";
import { muscleSchema } from "../src/features/muscles/schema";
import {
  anatomyTaxonomy,
  validateAnatomy,
} from "../src/features/muscles/repository";
import verifiedSources from "../src/content/provenance/verified-sources.json";

if (
  createHash("sha256")
    .update(readFileSync(snapshot.extractPath))
    .digest("hex") !== snapshot.sha256
)
  throw Error("Retained anatomy source extract changed");
const source = verifiedSources.find((row) => row.id === snapshot.sourceId);
if (
  !source ||
  source.url !== snapshot.sourceUrl ||
  source.reuse !== "public_domain_data"
)
  throw Error("Anatomy source identity or reuse authorization changed");
const additions = muscleSchema.array().parse(definitions);
if (
  JSON.stringify(additions.map((row) => row.id)) !==
  JSON.stringify(snapshot.recordIds)
)
  throw Error("Anatomy source identity coverage changed");
for (const row of additions) {
  const seed = anatomyTaxonomy.records.find((item) => item.id === row.id);
  if (
    !seed ||
    seed.slug !== row.slug ||
    seed.displayName !== row.displayName ||
    seed.entityType !== row.entityType
  )
    throw Error(`Immutable anatomy identity changed: ${row.id}`);
  if (
    row.sources.length !== 1 ||
    row.sources[0] !== snapshot.sourceId ||
    row.jointActions.some(
      (action) =>
        action.sourceIds.length !== 1 ||
        action.sourceIds[0] !== snapshot.sourceId,
    )
  )
    throw Error(`Incomplete anatomy source references: ${row.id}`);
  if (
    !row.reviewedBy?.includes("no human review") ||
    row.reviewedAt !== source.lastReviewedAt
  )
    throw Error(
      `Anatomy publication review differs from source verification: ${row.id}`,
    );
}
const path = "src/content/muscles/records.json";
const current: unknown[] = JSON.parse(readFileSync(path, "utf8"));
const parsed = muscleSchema.array().parse(current);
for (const addition of additions) {
  const previous = parsed.find((row) => row.id === addition.id);
  if (
    previous?.contentStatus === "published" &&
    JSON.stringify(previous) !== JSON.stringify(addition)
  )
    throw Error(
      `Published anatomy changed: ${addition.id}; a new reviewed revision is required.`,
    );
}
const existingIds = new Set(parsed.map((row) => row.id));
const output = [
  ...current.map((row, index) =>
    parsed[index]!.contentStatus === "published"
      ? row
      : (additions.find((addition) => addition.id === parsed[index]!.id) ??
        row),
  ),
  ...additions.filter((row) => !existingIds.has(row.id)),
];
const errors = validateAnatomy(muscleSchema.array().parse(output));
if (errors.length) throw Error(errors.join("; "));
const value = JSON.stringify(output, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== value)
    throw Error("Remaining anatomy compilation is stale");
} else {
  writeFileSync(`${path}.tmp`, value);
  renameSync(`${path}.tmp`, path);
}
console.log(
  `Compiled ${additions.length} additional sourced anatomy identities; historical and missing-field limitations retained.`,
);
