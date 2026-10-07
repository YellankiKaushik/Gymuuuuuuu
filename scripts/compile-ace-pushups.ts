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
    recordIds: z.string().array().length(2),
    mediaHashes: z.record(z.string(), digest),
    reviewMethod: z.string().min(50),
  })
  .parse(read(root + "ace-pushup-snapshot.json"));
for (const [name, expected] of [
  ["definitions", snapshot.definitionsSha256],
  ["sources", snapshot.sourcesSha256],
] as const)
  if (
    createHash("sha256")
      .update(readFileSync(root + `ace-pushup-${name}.json`))
      .digest("hex") !== expected
  )
    throw Error("ACE exercise extraction hash mismatch.");
const additions = exerciseSchema
  .array()
  .length(2)
  .parse(read(root + "ace-pushup-definitions.json"));
const sources = verifiedSourceSchema
  .array()
  .length(2)
  .parse(read(root + "ace-pushup-sources.json"));
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
  new Set(snapshot.recordIds).size !== 2
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
  const guidance = record.programmingGuidance?.[0];
  const knee = record.id === "exercise_knee_push_up";
  if (
    record.programmingGuidance?.length !== 1 ||
    guidance?.context !== "skill-learning" ||
    guidance.guidanceStatus !== "context-dependent" ||
    JSON.stringify(guidance.setRange) !== JSON.stringify({ min: 2, max: 2 }) ||
    JSON.stringify(guidance.repRange) !==
      JSON.stringify({ min: knee ? 6 : 5, max: knee ? 8 : 6 }) ||
    JSON.stringify(guidance.restSeconds) !==
      JSON.stringify({ min: 60, max: 60 }) ||
    JSON.stringify(guidance.sourceIds) !==
      JSON.stringify(["ace_pushup_progression_2019"]) ||
    record.technique?.breathing !== null
  )
    throw Error(
      "The source-specific push-up example or unknown breathing timing changed.",
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
  "Validated two source-scoped push-up techniques, original diagrams and contextual professional example and unknown breathing timing.",
);
