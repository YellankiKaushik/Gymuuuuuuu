import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { createHash } from "node:crypto";
import { z } from "zod";
import { scienceSchema } from "../src/features/workout-science/schema";
import {
  validateScience,
  scienceIdentities,
} from "../src/features/workout-science/repository";
import { verifiedSourceSchema } from "../src/features/content-review/schema";

const root = "src/content/provenance/";
const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const hash = (name: string) =>
  createHash("sha256")
    .update(readFileSync(root + name))
    .digest("hex");
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const snapshot = z
  .strictObject({
    extractedAt: z.iso.datetime({ offset: true }),
    reviewMethod: z.string().min(30),
    definitionSha256: digest,
    sourcesSha256: digest,
    observationsSha256: digest,
    identityIds: z.array(z.string()).length(5),
    sourceXmlSha256: digest,
    inspectedSections: z.string().array().min(2),
  })
  .parse(read(root + "acsm-principles-snapshot.json"));
if (
  snapshot.definitionSha256 !== hash("acsm-principles-definitions.json") ||
  snapshot.sourcesSha256 !== hash("acsm-principles-sources.json") ||
  snapshot.observationsSha256 !== hash("acsm-principles-observations.json")
)
  throw Error("Training research extraction snapshot changed.");
const sources = verifiedSourceSchema
  .array()
  .parse(read(root + "acsm-principles-sources.json"));
const approved = verifiedSourceSchema
  .array()
  .parse(read(root + "verified-sources.json"));
const observations = z
  .array(
    z.strictObject({
      sourceId: z.string(),
      observations: z.array(z.string().min(20)).min(1),
    }),
  )
  .parse(read(root + "acsm-principles-observations.json"));
const additions = scienceSchema
  .array()
  .parse(read(root + "acsm-principles-definitions.json"));
const path = "src/content/workout-science/records.json";
const current = scienceSchema.array().parse(read(path));
if (
  JSON.stringify(additions.map((row) => row.id)) !==
    JSON.stringify(snapshot.identityIds) ||
  new Set(snapshot.identityIds).size !== additions.length
)
  throw Error("Training research snapshot identities changed or duplicate.");
for (const source of sources) {
  if (
    source.reuse === "blocked" ||
    source.extractedAt !== snapshot.extractedAt ||
    JSON.stringify(source) !==
      JSON.stringify(approved.find((row) => row.id === source.id)) ||
    !observations.some((row) => row.sourceId === source.id)
  )
    throw Error(`Training research source verification missing: ${source.id}`);
}
for (const row of additions) {
  const identity = scienceIdentities.find((seed) => seed.id === row.id);
  if (
    !identity ||
    identity.slug !== row.slug ||
    identity.displayName !== row.displayName ||
    identity.contentType !== row.contentType ||
    identity.category !== row.category
  )
    throw Error(`Training identity changed: ${row.id}`);
  for (const ref of row.sources ?? [])
    if (
      !sources.some(
        (source) =>
          source.id === ref.id &&
          source.url === ref.url &&
          source.title === ref.title &&
          source.lastReviewedAt === row.review?.reviewedAt &&
          source.sourceVersion?.includes(ref.doi ?? "no-doi"),
      )
    )
      throw Error(`Unverified training citation: ${row.id}:${ref.id}`);
  const previous = current.find((old) => old.id === row.id);
  if (
    previous?.contentStatus === "published" &&
    JSON.stringify(previous) !== JSON.stringify(row)
  )
    throw Error(
      `Published training record requires an explicit version review: ${row.id}`,
    );
}
const proposed = [
  ...current.map(
    (row) => additions.find((entry) => entry.id === row.id) ?? row,
  ),
  ...additions.filter((row) => !current.some((old) => old.id === row.id)),
];
const errors = validateScience(proposed);
if (errors.length) throw Error(errors.join("\n"));
const output = JSON.stringify(proposed, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== output)
    throw Error("Training research output is stale.");
} else {
  const temporary = path + ".tmp";
  writeFileSync(temporary, output);
  renameSync(temporary, path);
}
console.log(
  `Validated ${additions.length} source-scoped training articles; no individual prescription or independent human review claimed.`,
);
