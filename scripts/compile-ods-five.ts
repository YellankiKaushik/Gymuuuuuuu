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
    extractedAt: z.iso.datetime(),
    definitionsSha256: digest,
    sourcesSha256: digest,
    recordIds: z.string().array().length(5),
    moduleSource: z.strictObject({
      id: z.string(),
      title: z.string(),
      publisher: z.string(),
      year: z.number().int(),
      type: z.literal("government_reference"),
      url: z.url(),
      roles: z.string().array(),
      licenseNote: z.string(),
    }),
    sourceHtmlSha256: z.null(),
    sourceCaptureMethod: z.string().min(50),
    sourceLocators: z.string().array().length(5),
    reviewMethod: z.string().min(50),
  })
  .parse(read(root + "ods-five-snapshot.json"));
for (const [name, expected] of [
  ["definitions", snapshot.definitionsSha256],
  ["sources", snapshot.sourcesSha256],
] as const)
  if (
    createHash("sha256")
      .update(readFileSync(root + `ods-five-${name}.json`))
      .digest("hex") !== expected
  )
    throw Error("NIH ingredient observation snapshot changed.");
const sources = verifiedSourceSchema
  .array()
  .length(1)
  .parse(read(root + "ods-five-sources.json"));
const registry = verifiedSourceSchema
  .array()
  .parse(read(root + "verified-sources.json"));
for (const source of sources)
  if (
    source.reuse === "blocked" ||
    source.extractedAt !== snapshot.extractedAt ||
    JSON.stringify(source) !==
      JSON.stringify(registry.find((entry) => entry.id === source.id)) ||
    source.id !== snapshot.moduleSource.id ||
    source.url !== snapshot.moduleSource.url ||
    JSON.stringify(snapshot.moduleSource) !==
      JSON.stringify(
        supplementReference.sources.find((entry) => entry.id === source.id),
      )
  )
    throw Error("NIH ingredient source registry mismatch.");
const additions = publicEntitySchema
  .array()
  .length(5)
  .parse(read(root + "ods-five-definitions.json"));
const fullReference = z
  .object({
    seedRecords: z
      .object({
        id: z.string(),
        title: z.string(),
        slug: z.string(),
        entityType: z.string(),
      })
      .array(),
  })
  .parse(read("src/content/supplements/reference.json"));
if (
  JSON.stringify(additions.map((row) => row.id)) !==
    JSON.stringify(snapshot.recordIds) ||
  new Set(snapshot.recordIds).size !== 5
)
  throw Error("NIH ingredient identity set changed.");
for (const entry of additions) {
  const seed = fullReference.seedRecords.find((row) => row.id === entry.id);
  if (
    !seed ||
    entry.title !== seed.title ||
    entry.slug !== seed.slug ||
    entry.entityType !== seed.entityType ||
    entry.claims.length !== 1 ||
    entry.antiDoping !== null ||
    !entry.safety.length ||
    entry.review.reviewedAt !== snapshot.extractedAt.slice(0, 10)
  )
    throw Error("NIH ingredient identity/review boundaries changed.");
  for (const claim of entry.claims)
    if (
      claim.protocol !== null ||
      claim.magnitude !== null ||
      claim.studyCount !== null ||
      claim.evidenceConfidence !== "not_assessed" ||
      claim.assessmentMethod !== "editorial" ||
      claim.review.reviewedAt !== entry.review.reviewedAt ||
      !claim.sourceIds.every((id) => sources.some((source) => source.id === id))
    )
      throw Error(
        "Unextracted protocol, magnitude, count or formal grading cannot be published.",
      );
}
const path = "src/content/supplements/records.json";
const current = publicEntitySchema.array().parse(read(path));
for (const entry of additions) {
  const prior = current.find((row) => row.id === entry.id);
  if (prior && JSON.stringify(prior) !== JSON.stringify(entry))
    throw Error("Prior supplement publication is immutable.");
}
const result = [
  ...current,
  ...additions.filter((row) => !current.some((prior) => prior.id === row.id)),
];
validateSupplementsRelease(result);
const output = JSON.stringify(result, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== output)
    throw Error("NIH ingredient output is stale.");
} else {
  writeFileSync(path + ".tmp", output);
  renameSync(path + ".tmp", path);
}
console.log(
  "Validated five additional NIH ingredient summaries; no personal dose, product approval or formal grading inferred.",
);
