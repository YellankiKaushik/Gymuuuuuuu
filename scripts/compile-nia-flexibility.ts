import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { createHash } from "node:crypto";
import { z } from "zod";
import {
  recoveryArticleSchema,
  publicRecoveryRoutineSchema,
  validateRecoveryRelease,
} from "../src/features/recovery/publication";
import { verifiedSourceSchema } from "../src/features/content-review/schema";
import { recoveryReference } from "../src/features/recovery/schema";
const root = "src/content/provenance/";
const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const snapshot = z
  .strictObject({
    source: verifiedSourceSchema,
    definitionsSha256: digest,
    extractSha256: digest,
    pdfSha256: digest,
    sourceLocators: z.array(z.string()).length(3),
    extractionMethod: z.string().min(30),
    recordIds: z.array(z.string()).length(4),
  })
  .parse(read(root + "nia-flexibility-snapshot.json"));
for (const [name, expected] of [
  ["definitions.json", snapshot.definitionsSha256],
  ["extract.txt", snapshot.extractSha256],
])
  if (
    createHash("sha256")
      .update(readFileSync(root + "nia-flexibility-" + name))
      .digest("hex") !== expected
  )
    throw Error("NIA flexibility extraction hash mismatch.");
const definitions = z
  .strictObject({
    articles: recoveryArticleSchema.array().length(2),
    routines: publicRecoveryRoutineSchema.array().length(2),
  })
  .parse(read(root + "nia-flexibility-definitions.json"));
const registry = verifiedSourceSchema
  .array()
  .parse(read(root + "verified-sources.json"));
const source = snapshot.source;
if (
  source.reuse === "blocked" ||
  JSON.stringify(source) !==
    JSON.stringify(registry.find((entry) => entry.id === source.id)) ||
  !recoveryReference.sources.some(
    (entry) => entry.id === source.id && entry.url === source.url,
  )
)
  throw Error("NIA flexibility source verification is missing.");
const records = [
  ...definitions.articles,
  ...definitions.routines.map((entry) => entry.article),
];
if (
  JSON.stringify(records.map((entry) => entry.id)) !==
    JSON.stringify(snapshot.recordIds) ||
  new Set(snapshot.recordIds).size !== records.length
)
  throw Error("NIA flexibility identities changed or duplicate.");
for (const article of records)
  if (
    article.sourceIds.length !== 1 ||
    article.sourceIds[0] !== source.id ||
    article.review.reviewedAt !== source.lastReviewedAt
  )
    throw Error("NIA flexibility attribution changed.");
for (const entry of definitions.routines) {
  if (
    entry.routine.steps.length !== 6 ||
    entry.routine.estimatedMinutes !== null ||
    entry.routine.steps.some(
      (step) =>
        step.doseType !== "seconds" ||
        step.doseValue !== 10 ||
        step.phase03ExerciseId !== null ||
        step.sides !== "none",
    )
  )
    throw Error("NIA lower-bound holds or unknown total duration changed.");
}
const articlePath = "src/content/recovery/records.json",
  routinePath = "src/content/recovery/routines.json",
  pinPath = root + "recovery-routine-version-pins.json";
const oldArticles = recoveryArticleSchema.array().parse(read(articlePath)),
  oldRoutines = publicRecoveryRoutineSchema.array().parse(read(routinePath));
function merge<T>(current: T[], additions: T[], id: (row: T) => string): T[] {
  for (const row of additions) {
    const previous = current.find((old) => id(old) === id(row));
    if (previous && JSON.stringify(previous) !== JSON.stringify(row))
      throw Error("Existing published recovery versions are immutable.");
  }
  return [
    ...current,
    ...additions.filter((row) => !current.some((old) => id(old) === id(row))),
  ];
}
const articles = merge(oldArticles, definitions.articles, (row) => row.id),
  routines = merge(oldRoutines, definitions.routines, (row) => row.article.id);
validateRecoveryRelease(articles, routines);
const pins = routines.map((entry) => ({
  id: entry.routine.id,
  sha256: createHash("sha256").update(JSON.stringify(entry)).digest("hex"),
}));
const oldPins = z
  .array(z.strictObject({ id: z.string(), sha256: digest }))
  .parse(read(pinPath));
for (const pin of oldPins)
  if (!pins.some((entry) => entry.id === pin.id && entry.sha256 === pin.sha256))
    throw Error("A published routine version pin changed.");
for (const [path, value] of [
  [articlePath, articles],
  [routinePath, routines],
  [pinPath, pins],
] as const) {
  const output = JSON.stringify(value, null, 2) + "\n";
  if (process.argv.includes("--check")) {
    if (readFileSync(path, "utf8") !== output)
      throw Error("NIA flexibility output is stale.");
  } else {
    writeFileSync(path + ".tmp", output);
    renameSync(path + ".tmp", path);
  }
}
console.log(
  "Validated four NIA flexibility identities; unknown transition, relaxation and total duration stay unknown.",
);
