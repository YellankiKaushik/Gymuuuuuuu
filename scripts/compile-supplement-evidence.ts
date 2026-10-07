import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { z } from "zod";
import {
  publicEntitySchema,
  validateSupplementsRelease,
} from "../src/features/supplements/publication";
import { supplementReference } from "../src/features/supplements/schema";
import { verifiedSourceSchema } from "../src/features/content-review/schema";
const root = "src/content/provenance/";
const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const snapshot = z
  .strictObject({
    definitionsSha256: digest,
    sourcesSha256: digest,
    recordIds: z.array(z.string()).length(2),
    extractedAt: z.iso.datetime(),
    reviewMethod: z.string().min(50),
  })
  .parse(read(root + "supplement-evidence-snapshot.json"));
for (const [name, expected] of [
  ["definitions", snapshot.definitionsSha256],
  ["sources", snapshot.sourcesSha256],
] as const)
  if (
    createHash("sha256")
      .update(readFileSync(root + `supplement-evidence-${name}.json`))
      .digest("hex") !== expected
  )
    throw Error("Supplement evidence snapshot hash mismatch.");
const sources = verifiedSourceSchema
  .array()
  .length(4)
  .parse(read(root + "supplement-evidence-sources.json"));
const registry = verifiedSourceSchema
  .array()
  .parse(read(root + "verified-sources.json"));
for (const source of sources)
  if (
    source.reuse === "blocked" ||
    source.extractedAt !== snapshot.extractedAt ||
    JSON.stringify(source) !==
      JSON.stringify(registry.find((entry) => entry.id === source.id)) ||
    !supplementReference.sources.some(
      (entry) => entry.id === source.id && entry.url === source.url,
    )
  )
    throw Error("Supplement source verification is missing or changed.");
const additions = publicEntitySchema
  .array()
  .length(2)
  .parse(read(root + "supplement-evidence-definitions.json"));
if (
  JSON.stringify(additions.map((entry) => entry.id)) !==
    JSON.stringify(snapshot.recordIds) ||
  new Set(snapshot.recordIds).size !== 2
)
  throw Error("Supplement approved identities changed.");
for (const entry of additions) {
  if (
    entry.claims.length !== 2 ||
    entry.antiDoping !== null ||
    !entry.safety.length ||
    entry.review.reviewedAt !== snapshot.extractedAt.slice(0, 10)
  )
    throw Error("Supplement claim/safety/review boundaries changed.");
  for (const claim of entry.claims)
    if (
      claim.protocol !== null ||
      claim.magnitude !== null ||
      claim.evidenceConfidence !== "low" ||
      claim.assessmentMethod !== "editorial" ||
      claim.review.reviewedAt !== entry.review.reviewedAt ||
      !claim.sourceIds.every((id) => sources.some((source) => source.id === id))
    )
      throw Error("Unsupported dose, magnitude, confidence or source change.");
}
const path = "src/content/supplements/records.json";
const current = publicEntitySchema.array().parse(read(path));
for (const entry of additions) {
  const prior = current.find((row) => row.id === entry.id);
  if (prior && JSON.stringify(prior) !== JSON.stringify(entry))
    throw Error("Existing supplement publications are immutable.");
}
const result = [
  ...current,
  ...additions.filter(
    (entry) => !current.some((prior) => prior.id === entry.id),
  ),
];
validateSupplementsRelease(result);
const output = JSON.stringify(result, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== output)
    throw Error("Supplement evidence output is stale.");
} else {
  writeFileSync(path + ".tmp", output);
  renameSync(path + ".tmp", path);
}
console.log(
  "Validated two ingredient records with four outcome-specific claims; no personal protocol or current anti-doping verdict inferred.",
);
