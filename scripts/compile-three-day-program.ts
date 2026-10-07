import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { createHash } from "node:crypto";
import { z } from "zod";
import { programSchema } from "../src/features/programs/schema";
import {
  programIdentities,
  validatePrograms,
} from "../src/features/programs/repository";
import { verifiedSourceSchema } from "../src/features/content-review/schema";
import { validateImmutableVersions } from "./content/immutable-versions";
const root = "src/content/provenance/";
const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const snapshot = z
  .strictObject({
    definitionSha256: digest,
    sourceExtractSha256: digest,
    pdfSha256: digest,
    source: verifiedSourceSchema,
    recordId: z.literal("program_full_body_3_day_foundation"),
    sourceLocators: z.string().array().length(3),
    reviewMethod: z.string().min(50),
  })
  .parse(read(root + "three-day-program-snapshot.json"));
for (const [name, hash] of [
  ["definition.json", snapshot.definitionSha256],
  ["extract.txt", snapshot.sourceExtractSha256],
] as const)
  if (
    createHash("sha256")
      .update(readFileSync(root + "three-day-program-" + name))
      .digest("hex") !== hash
  )
    throw Error("Three-day program extraction hash mismatch.");
const program = programSchema.parse(
  read(root + "three-day-program-definition.json"),
);
const seed = programIdentities.find((row) => row.id === program.id);
const sources = verifiedSourceSchema
  .array()
  .parse(read(root + "verified-sources.json"));
if (
  program.id !== snapshot.recordId ||
  !seed ||
  seed.slug !== program.slug ||
  seed.displayName !== program.displayName ||
  program.trainingDaysPerWeek !== 3 ||
  program.scheduleModel?.sessions.length !== 3 ||
  program.review?.reviewedAt !== snapshot.source.lastReviewedAt ||
  JSON.stringify(sources.find((source) => source.id === snapshot.source.id)) !==
    JSON.stringify(snapshot.source) ||
  snapshot.source.reuse !== "original_work"
)
  throw Error(
    "Three-day program identity, review or arrangement attribution changed.",
  );
for (const ref of program.sources ?? [])
  if (
    !sources.some(
      (source) => source.url === ref.url && source.reuse !== "blocked",
    )
  )
    throw Error("Unverified three-day program framework.");
if (
  program.populationScope?.join(",") !== "older-adults-general" ||
  program.timeContext?.method !== "source_guideline_allocation"
)
  throw Error("The NIA population or honest time context changed.");
const outputs = [
  "src/content/programs/records.json",
  "src/content/programs/versions.json",
].map((path) => {
  const current = programSchema.array().parse(read(path));
  const prior = current.find(
    (row) => row.id === program.id && row.version === program.version,
  );
  if (prior && JSON.stringify(prior) !== JSON.stringify(program))
    throw Error("Immutable program version changed.");
  const proposed = prior ? current : [...current, program];
  const errors = validatePrograms(proposed);
  if (errors.length) throw Error(errors.join("; "));
  return { path, proposed };
});
const versionRows = outputs.find((output) =>
  output.path.endsWith("versions.json"),
)!.proposed;
const pins = versionRows.map((row) => ({
  id: `${row.id}@${row.version}`,
  sha256: createHash("sha256")
    .update(JSON.stringify({ id: `${row.id}@${row.version}`, content: row }))
    .digest("hex"),
}));
const pinPath = root + "program-version-pins.json";
const oldPins = z
  .array(z.strictObject({ id: z.string(), sha256: digest }))
  .parse(read(pinPath));
for (const pin of oldPins)
  if (
    !pins.some(
      (current) => current.id === pin.id && current.sha256 === pin.sha256,
    )
  )
    throw Error("A pre-existing program pin changed.");
validateImmutableVersions(
  versionRows.map((row) => ({ id: `${row.id}@${row.version}`, content: row })),
  pins,
);
for (const { path, value } of [
  ...outputs.map(({ path, proposed }) => ({ path, value: proposed })),
  { path: pinPath, value: pins },
]) {
  const text = JSON.stringify(value, null, 2) + "\n";
  if (process.argv.includes("--check")) {
    if (readFileSync(path, "utf8") !== text)
      throw Error("Three-day program output is stale.");
  } else {
    writeFileSync(path + ".tmp", text);
    renameSync(path + ".tmp", path);
  }
}
console.log(
  "Validated original three-day NIA-scoped arrangement; no superiority, individual suitability or measured session duration inferred.",
);
