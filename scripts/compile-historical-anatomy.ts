import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { muscleSchema } from "../src/features/muscles/schema";
import {
  anatomyTaxonomy,
  validateAnatomy,
} from "../src/features/muscles/repository";
import definitions from "../src/content/provenance/historical-lower-limb-definitions.json";
import additionalDefinitions from "../src/content/provenance/historical-lower-limb-additional.json";
import snapshot from "../src/content/provenance/gray-1918-lower-limb-snapshot.json";

const digest = createHash("sha256")
  .update(readFileSync(snapshot.extractPath))
  .digest("hex");
if (digest !== snapshot.sha256)
  throw Error("Historical source extract changed");
const additions = muscleSchema
  .array()
  .parse([...definitions, ...additionalDefinitions]);
if (
  JSON.stringify(additions.map((row) => row.id)) !==
  JSON.stringify([
    ...snapshot.recordIds,
    "muscle_adductor_magnus",
    "muscle_adductor_longus",
    "muscle_adductor_brevis",
    "muscle_gracilis",
    "muscle_pectineus",
    "muscle_tibialis_anterior",
    "muscle_deep_hip_rotator_group",
  ])
)
  throw Error("Historical source identity coverage changed");
for (const row of additions) {
  const seed = anatomyTaxonomy.records.find((seed) => seed.id === row.id);
  if (
    !seed ||
    row.slug !== seed.slug ||
    row.displayName !== seed.displayName ||
    row.entityType !== seed.entityType
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
    throw Error(`Historical anatomy source coverage changed: ${row.id}`);
}
const path = "src/content/muscles/records.json";
const current: unknown[] = JSON.parse(readFileSync(path, "utf8"));
const parsed = muscleSchema.array().parse(current);
for (const addition of additions) {
  const previous = parsed.find((row) => row.id === addition.id);
  if (previous && JSON.stringify(previous) !== JSON.stringify(addition))
    throw Error(
      `Published anatomy changed: ${addition.id}. A reviewed revision is required.`,
    );
}
const addedIds = new Set(additions.map((row) => row.id));
const output = [
  ...current.filter((_, index) => !addedIds.has(parsed[index]!.id)),
  ...additions,
];
const errors = validateAnatomy(muscleSchema.array().parse(output));
if (errors.length) throw Error(errors.join("; "));
const value = JSON.stringify(output, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== value)
    throw Error("Historical anatomy compilation is stale");
} else {
  writeFileSync(`${path}.tmp`, value);
  renameSync(`${path}.tmp`, path);
}
console.log(
  `Compiled ${additions.length} sourced lower-limb anatomy records; historical limitations retained.`,
);
