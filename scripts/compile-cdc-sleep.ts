import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { z } from "zod";
import {
  recoveryArticleSchema,
  publicRecoveryRoutines,
  validateRecoveryRelease,
} from "../src/features/recovery/publication";
import { recoveryReference } from "../src/features/recovery/schema";
import { verifiedSourceSchema } from "../src/features/content-review/schema";
const root = "src/content/provenance/";
const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const snapshot = z
  .strictObject({
    extractedAt: z.iso.datetime(),
    definitionsSha256: digest,
    sourcesSha256: digest,
    recordIds: z.string().array().length(7),
    moduleSource: z.strictObject({
      id: z.string(),
      title: z.string(),
      publisher: z.string(),
      year: z.number().int(),
      type: z.literal("government_guidance"),
      url: z.url(),
      role: z.string().array(),
      licenseNote: z.string(),
    }),
    sourceHtmlSha256: z.null(),
    sourceCaptureMethod: z.string().min(60),
    sourceLocators: z.string().array().length(4),
    reviewMethod: z.string().min(60),
  })
  .parse(read(root + "cdc-sleep-snapshot.json"));
for (const [name, expected] of [
  ["definitions", snapshot.definitionsSha256],
  ["sources", snapshot.sourcesSha256],
] as const)
  if (
    createHash("sha256")
      .update(readFileSync(root + `cdc-sleep-${name}.json`))
      .digest("hex") !== expected
  )
    throw Error(
      "CDC sleep extraction changed; explicitly verify a new source revision.",
    );
const sources = verifiedSourceSchema
  .array()
  .length(1)
  .parse(read(root + "cdc-sleep-sources.json"));
const registry = verifiedSourceSchema
  .array()
  .parse(read(root + "verified-sources.json"));
for (const source of sources)
  if (
    source.reuse === "blocked" ||
    source.extractedAt !== snapshot.extractedAt ||
    source.id !== snapshot.moduleSource.id ||
    source.url !== snapshot.moduleSource.url ||
    JSON.stringify(source) !==
      JSON.stringify(registry.find((s) => s.id === source.id)) ||
    JSON.stringify(snapshot.moduleSource) !==
      JSON.stringify(recoveryReference.sources.find((s) => s.id === source.id))
  )
    throw Error("CDC sleep source registry or rights approval differs.");
const additions = recoveryArticleSchema
  .array()
  .length(7)
  .parse(read(root + "cdc-sleep-definitions.json"));
const seeds = z
  .object({
    seedTaxonomy: z.array(
      z.object({
        id: z.string(),
        slug: z.string(),
        title: z.string(),
        domain: z.string(),
      }),
    ),
  })
  .parse(read("src/content/recovery/reference.json")).seedTaxonomy;
if (
  JSON.stringify(additions.map((r) => r.id)) !==
    JSON.stringify(snapshot.recordIds) ||
  new Set(snapshot.recordIds).size !== 7
)
  throw Error("CDC approved identity set changed.");
for (const record of additions) {
  const seed = seeds.find((s) => s.id === record.id);
  if (
    !seed ||
    seed.slug !== record.slug ||
    seed.title !== record.title ||
    seed.domain !== record.domain ||
    record.review.reviewedAt !== snapshot.extractedAt.slice(0, 10) ||
    record.evidenceStrength !== "not_graded" ||
    record.claims.some(
      (c) =>
        c.outcome !== "sleep" ||
        c.sourceIds.some((id) => !sources.some((s) => s.id === id)),
    )
  )
    throw Error("CDC identity, scope, review date or source changed.");
}
const path = "src/content/recovery/records.json";
const current = recoveryArticleSchema.array().parse(read(path));
for (const record of additions) {
  const previous = current.find((r) => r.id === record.id);
  if (previous && JSON.stringify(previous) !== JSON.stringify(record))
    throw Error("Refusing to overwrite a published recovery article.");
}
const proposed = [
  ...current,
  ...additions.filter((r) => !current.some((p) => p.id === r.id)),
];
validateRecoveryRelease(proposed, publicRecoveryRoutines);
const known = new Set(
  [...proposed, ...publicRecoveryRoutines.map((r) => r.article)].map(
    (r) => r.id,
  ),
);
for (const record of additions)
  if (record.relatedIds.some((id) => !known.has(id) || id === record.id))
    throw Error("Unpublished or self-referencing recovery relationship.");
const value = JSON.stringify(proposed, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== value)
    throw Error("CDC sleep release is stale.");
} else {
  writeFileSync(path + ".tmp", value);
  renameSync(path + ".tmp", path);
}
console.log(
  "Verified seven CDC sleep-habit articles; no opaque score, diagnosis, medication changes or formal evidence grade.",
);
