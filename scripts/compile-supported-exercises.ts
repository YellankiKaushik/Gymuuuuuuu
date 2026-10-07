import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { createHash } from "node:crypto";
import { z } from "zod";
import { exerciseSchema } from "../src/features/exercises/schema";
import {
  exerciseIdentities,
  validateExercises,
} from "../src/features/exercises/repository";
import { verifiedSourceSchema } from "../src/features/content-review/schema";
const definitions = z
  .strictObject({
    extractedAt: z.iso.datetime({ offset: true }),
    niaFileSha256: z.string().regex(/^[a-f0-9]{64}$/),
    sourceLocators: z.record(z.string(), z.string().min(1)),
    records: exerciseSchema.array().length(4),
    mediaHashes: z.record(z.string(), z.string().regex(/^[a-f0-9]{64}$/)),
  })
  .parse(
    JSON.parse(
      readFileSync(
        "src/content/provenance/supported-exercise-definitions.json",
        "utf8",
      ),
    ),
  );
const sources = verifiedSourceSchema
  .array()
  .parse(
    JSON.parse(
      readFileSync("src/content/provenance/verified-sources.json", "utf8"),
    ),
  );
const niaSnapshot = z
  .object({
    sourceId: z.literal("nia_strength_guide_2018"),
    sourceFileSha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .parse(
    JSON.parse(
      readFileSync("src/content/provenance/nia-strength-snapshot.json", "utf8"),
    ),
  );
if (definitions.niaFileSha256 !== niaSnapshot.sourceFileSha256)
  throw Error("Supported variants reference a different NIA source snapshot");
const path = "src/content/exercises/records.json";
const existing = exerciseSchema
  .array()
  .parse(JSON.parse(readFileSync(path, "utf8")));
const proposed = existing
  .map((r) => definitions.records.find((d) => d.id === r.id) ?? r)
  .concat(
    definitions.records.filter((d) => !existing.some((r) => r.id === d.id)),
  );
for (const record of definitions.records) {
  const identity = exerciseIdentities.find((r) => r.id === record.id);
  if (
    !identity ||
    identity.slug !== record.slug ||
    identity.displayName !== record.displayName
  )
    throw Error("Stable exercise identity changed");
  const previous = existing.find((r) => r.id === record.id);
  if (
    previous?.contentStatus === "published" &&
    JSON.stringify(previous) !== JSON.stringify(record)
  )
    throw Error("Published exercise changed without version migration");
  for (const ref of record.sources ?? []) {
    const approved = sources.find((s) => s.id === ref.id);
    if (!approved || approved.url !== ref.url || approved.reuse === "blocked")
      throw Error(`Unverified exercise source ${ref.id}`);
  }
  for (const media of record.media ?? []) {
    const expected = definitions.mediaHashes[media.url];
    if (
      !expected ||
      !media.url.startsWith("/media/") ||
      createHash("sha256")
        .update(readFileSync(`public${media.url}`))
        .digest("hex") !== expected
    )
      throw Error("Exercise media snapshot changed");
  }
}
const errors = validateExercises(proposed);
if (errors.length) throw Error(errors.join("; "));
const json = JSON.stringify(proposed, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== json)
    throw Error("Supported exercise publication is stale");
} else {
  writeFileSync(`${path}.tmp`, json);
  renameSync(`${path}.tmp`, path);
}
console.log(
  "Four sourced exercise variants compiled without changing existing publications.",
);
