import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { z } from "zod";
import { exerciseSchema } from "../src/features/exercises/schema";
import {
  exerciseIdentities,
  validateExercises,
} from "../src/features/exercises/repository";
import { verifiedSourceSchema } from "../src/features/content-review/schema";
const root = "src/content/provenance/";
const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const snapshot = z
  .strictObject({
    extractedAt: z.iso.datetime(),
    definitionsSha256: digest,
    sourcesSha256: digest,
    recordIds: z.string().array().length(3),
    mediaHashes: z.record(z.string(), digest),
    reviewMethod: z.string().min(50),
  })
  .parse(read(root + "ace-next-exercise-snapshot.json"));
for (const [name, expected] of [
  ["definitions", snapshot.definitionsSha256],
  ["sources", snapshot.sourcesSha256],
] as const)
  if (
    createHash("sha256")
      .update(readFileSync(root + `ace-next-exercise-${name}.json`))
      .digest("hex") !== expected
  )
    throw Error("ACE exercise extraction hash mismatch.");
const additions = exerciseSchema
  .array()
  .length(3)
  .parse(read(root + "ace-next-exercise-definitions.json"));
const sources = verifiedSourceSchema
  .array()
  .length(3)
  .parse(read(root + "ace-next-exercise-sources.json"));
const registry = verifiedSourceSchema
  .array()
  .parse(read(root + "verified-sources.json"));
for (const source of sources)
  if (
    source.reuse === "blocked" ||
    source.extractedAt !== snapshot.extractedAt ||
    JSON.stringify(source) !==
      JSON.stringify(registry.find((entry) => entry.id === source.id))
  )
    throw Error("ACE exercise source is not approved.");
if (
  JSON.stringify(additions.map((entry) => entry.id)) !==
    JSON.stringify(snapshot.recordIds) ||
  new Set(snapshot.recordIds).size !== 3
)
  throw Error("ACE approved exercise identities changed.");
for (const record of additions) {
  const seed = exerciseIdentities.find((seed) => seed.id === record.id);
  if (
    !seed ||
    seed.slug !== record.slug ||
    seed.displayName !== record.displayName ||
    record.review?.techniqueReviewedAt !== snapshot.extractedAt.slice(0, 10)
  )
    throw Error("Exercise stable identity or source-check date changed.");
  for (const ref of record.sources ?? [])
    if (
      !registry.some(
        (source) =>
          source.id === ref.id &&
          source.url === ref.url &&
          source.reuse !== "blocked",
      )
    )
      throw Error("Exercise source reference is unresolved.");
  for (const media of record.media ?? []) {
    if (
      !/^\/media\/[a-z0-9-]+-cue\.svg$/.test(media.url) ||
      createHash("sha256")
        .update(readFileSync("public" + media.url))
        .digest("hex") !== snapshot.mediaHashes[media.url]
    )
      throw Error("Original exercise media hash mismatch.");
  }
  if (
    record.programmingGuidance?.some(
      (row) =>
        row.setRange != null || row.repRange != null || row.restSeconds != null,
    )
  )
    throw Error(
      "Technique source cannot acquire invented numeric programming.",
    );
}
const path = "src/content/exercises/records.json";
const current = exerciseSchema.array().parse(read(path));
for (const record of additions) {
  const prior = current.find((entry) => entry.id === record.id);
  if (prior && JSON.stringify(prior) !== JSON.stringify(record))
    throw Error("Published exercise version cannot be overwritten.");
}
const proposed = [
  ...current,
  ...additions.filter(
    (record) => !current.some((prior) => prior.id === record.id),
  ),
];
const errors = validateExercises(proposed);
if (errors.length) throw Error(errors.join("; "));
const output = JSON.stringify(proposed, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== output)
    throw Error("ACE exercise publication output is stale.");
} else {
  writeFileSync(path + ".tmp", output);
  renameSync(path + ".tmp", path);
}
console.log(
  "Validated three source-scoped ACE techniques, original diagrams and unknown numeric programming.",
);
