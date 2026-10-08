import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { z } from "zod";
import {
  publishedCardioSchema,
  validateCardioRelease,
} from "../src/features/cardio/publication";
import { verifiedSourceSchema } from "../src/features/content-review/schema";
const root = "src/content/provenance/";
const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const moduleSourceSchema = z.strictObject({
  id: z.string(),
  title: z.string(),
  publisher: z.string(),
  year: z.number().int(),
  type: z.literal("government_guidance"),
  url: z.url(),
  roles: z.string().array(),
  licenseNote: z.string(),
});
const snapshot = z
  .strictObject({
    extractedAt: z.iso.datetime(),
    definitionsSha256: digest,
    sourcesSha256: digest,
    recordIds: z.string().array().length(1),
    moduleSources: moduleSourceSchema.array().length(1),
    sourceHtmlSha256: z.null(),
    sourceCaptureMethod: z.string().min(50),
    sourceLocators: z.record(z.string(), z.string().min(10)),
    reviewMethod: z.string().min(50),
  })
  .parse(read(root + "cdc-heat-snapshot.json"));
for (const [name, expected] of [
  ["definitions", snapshot.definitionsSha256],
  ["sources", snapshot.sourcesSha256],
])
  if (
    createHash("sha256")
      .update(readFileSync(root + `cdc-heat-${name}.json`))
      .digest("hex") !== expected
  )
    throw Error("Cardio source observations or definitions changed.");
const additions = publishedCardioSchema
  .array()
  .length(1)
  .parse(read(root + "cdc-heat-definitions.json"));
const sources = verifiedSourceSchema
  .array()
  .length(1)
  .parse(read(root + "cdc-heat-sources.json"));
const registry = verifiedSourceSchema
  .array()
  .parse(read(root + "verified-sources.json"));
const reference = z
  .object({
    sources: z.unknown().array(),
    seedTaxonomy: z
      .object({
        id: z.string(),
        slug: z.string(),
        title: z.string(),
        entityType: z.string(),
      })
      .array(),
  })
  .parse(read("src/content/cardio/reference.json"));
for (const source of sources) {
  if (
    source.extractedAt !== snapshot.extractedAt ||
    source.lastReviewedAt !== snapshot.extractedAt.slice(0, 10) ||
    source.reuse === "blocked" ||
    JSON.stringify(source) !==
      JSON.stringify(registry.find((r) => r.id === source.id))
  )
    throw Error("Cardio source is not explicitly approved.");
  const moduleSource = snapshot.moduleSources.find((r) => r.id === source.id);
  if (
    !moduleSource ||
    moduleSource.url !== source.url ||
    !reference.sources.some(
      (r) => JSON.stringify(r) === JSON.stringify(moduleSource),
    ) ||
    !snapshot.sourceLocators[source.id]
  )
    throw Error("Cardio source registry or inspected locator is unresolved.");
}
if (
  JSON.stringify(additions.map((r) => r.id)) !==
    JSON.stringify(snapshot.recordIds) ||
  new Set(snapshot.recordIds).size !== 1
)
  throw Error("Cardio approved identity set changed.");
for (const record of additions) {
  const seed = reference.seedTaxonomy.find((r) => r.id === record.id);
  if (
    !seed ||
    seed.slug !== record.slug ||
    seed.title !== record.title ||
    seed.entityType !== record.entityType ||
    record.review.reviewedAt !== snapshot.extractedAt.slice(0, 10)
  )
    throw Error("Cardio stable identity or review date changed.");
  if (
    record.plan ||
    !["knowledge_topic", "cardio_modality"].includes(record.entityType)
  )
    throw Error(
      "Educational observations cannot acquire an invented plan or routine.",
    );
  for (const id of record.sourceIds)
    if (!sources.some((s) => s.id === id))
      throw Error("Cardio education source is unresolved.");
  if (record.claims.some((c) => c.evidenceStrength !== "not_graded"))
    throw Error(
      "A public-health summary cannot acquire a fabricated evidence grade.",
    );
}
const path = "src/content/cardio/records.json";
const current = publishedCardioSchema.array().parse(read(path));
for (const record of additions) {
  const prior = current.find((r) => r.id === record.id);
  if (prior && JSON.stringify(prior) !== JSON.stringify(record))
    throw Error("Published cardio content cannot be overwritten.");
}
const proposed = [
  ...current,
  ...additions.filter((r) => !current.some((p) => p.id === r.id)),
];
validateCardioRelease(proposed);
const text = JSON.stringify(proposed, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== text)
    throw Error("Cardio education output is stale.");
} else {
  writeFileSync(path + ".tmp", text);
  renameSync(path + ".tmp", path);
}
console.log(
  "Validated one source-scoped CDC heat-safety entry; no personal physiological estimates or fabricated schedules.",
);
