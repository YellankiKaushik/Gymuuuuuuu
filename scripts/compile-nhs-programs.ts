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

const root = "src/content/provenance/nhs-program-";
const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const hash = (path: string) =>
  createHash("sha256").update(readFileSync(path)).digest("hex");
const digest = z.string().regex(/^[a-f0-9]{64}$/);
const snapshot = z
  .strictObject({
    definitionSha256: digest,
    sourceSha256: digest,
    recordIds: z.string().array().length(2),
    sourceLocators: z.string().array().length(2),
    rawHtmlSha256: z.null(),
    reviewMethod: z.string().min(100),
  })
  .parse(read(root + "snapshot.json"));
if (
  hash(root + "definitions.json") !== snapshot.definitionSha256 ||
  hash(root + "sources.json") !== snapshot.sourceSha256
)
  throw Error("NHS program transcription hashes changed.");
const definitions = programSchema
  .array()
  .length(2)
  .parse(read(root + "definitions.json"));
const newSources = verifiedSourceSchema
  .array()
  .length(4)
  .parse(read(root + "sources.json"));
const approved = verifiedSourceSchema
  .array()
  .parse(read("src/content/provenance/verified-sources.json"));
if (new Set(newSources.map((s) => s.id)).size !== newSources.length)
  throw Error("Duplicate NHS program sources.");
for (const source of newSources) {
  if (
    source.reuse === "blocked" ||
    source.lastReviewedAt > new Date().toISOString().slice(0, 10) ||
    source.extractedAt > new Date().toISOString() ||
    JSON.stringify(approved.find((s) => s.id === source.id)) !==
      JSON.stringify(source)
  )
    throw Error("NHS program source is unapproved or dated in the future.");
}
const expected = [
  "program_general_fitness_2_day",
  "program_general_fitness_3_day",
];
if (
  JSON.stringify(definitions.map((p) => p.id)) !== JSON.stringify(expected) ||
  JSON.stringify(snapshot.recordIds) !== JSON.stringify(expected)
)
  throw Error("NHS program identity manifest changed.");
for (const program of definitions) {
  const seed = programIdentities.find((p) => p.id === program.id);
  if (
    !seed ||
    seed.slug !== program.slug ||
    seed.displayName !== program.displayName ||
    program.version !== "1.0.0" ||
    program.populationScope?.join(",") !== "healthy-adults" ||
    program.timeContext?.method !== "source_unspecified" ||
    program.sessionDurationMinutes !== null ||
    program.trainingDaysPerWeek !== seed.trainingDaysPerWeek ||
    program.review?.reviewedAt !== "2026-10-08"
  )
    throw Error(
      "NHS program stable identity, population, time or review scope changed.",
    );
  for (const session of program.scheduleModel!.sessions)
    for (const block of session.exerciseBlocks)
      for (const p of block.prescriptions)
        if (
          p.sets.min !== 2 ||
          p.sets.max !== 2 ||
          p.repetitionTarget.range?.min !== 8 ||
          p.repetitionTarget.range.max !== 12 ||
          p.restSeconds !== null ||
          p.restGuidance?.sourceIds.join(",") !== "source_nhs_strength_2026" ||
          p.effortTarget.method !== "technical-stop"
        )
          throw Error("NHS numerical or qualitative framework changed.");
  for (const ref of program.sources ?? [])
    if (!newSources.some((s) => s.url === ref.url))
      throw Error("Unverified NHS program framework URL.");
}
const outputs = [
  "src/content/programs/records.json",
  "src/content/programs/versions.json",
].map((path) => {
  const current = programSchema.array().parse(read(path));
  for (const program of definitions) {
    const prior = current.find(
      (p) => p.id === program.id && p.version === program.version,
    );
    if (prior && JSON.stringify(prior) !== JSON.stringify(program))
      throw Error("Immutable NHS program changed.");
  }
  const proposed = [
    ...current,
    ...definitions.filter(
      (p) => !current.some((r) => r.id === p.id && r.version === p.version),
    ),
  ];
  const errors = path.endsWith("versions.json")
    ? proposed.flatMap((p) => validatePrograms([p]))
    : validatePrograms(proposed);
  if (errors.length) throw Error(errors.join("; "));
  return { path, value: proposed };
});
const versions = outputs.find((o) => o.path.endsWith("versions.json"))!.value;
const pins = versions.map((p) => {
  const id = `${p.id}@${p.version}`;
  return {
    id,
    sha256: createHash("sha256")
      .update(JSON.stringify({ id, content: p }))
      .digest("hex"),
  };
});
const pinPath = "src/content/provenance/program-version-pins.json";
const oldPins = z
  .array(z.strictObject({ id: z.string(), sha256: digest }))
  .parse(read(pinPath));
for (const old of oldPins)
  if (!pins.some((p) => p.id === old.id && p.sha256 === old.sha256))
    throw Error("A pre-existing immutable program pin changed.");
validateImmutableVersions(
  versions.map((p) => ({ id: `${p.id}@${p.version}`, content: p })),
  pins,
);
// Validate every source, relationship and immutable output before any publication write.
for (const { path, value } of [...outputs, { path: pinPath, value: pins }]) {
  const text = JSON.stringify(value, null, 2) + "\n";
  if (process.argv.includes("--check")) {
    if (readFileSync(path, "utf8") !== text)
      throw Error("NHS program output is stale.");
  } else {
    writeFileSync(path + ".tmp", text);
    renameSync(path + ".tmp", path);
  }
}
console.log(
  "Validated two original NHS-scoped general strength arrangements; duration and timed rest remain explicitly unknown.",
);
