import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { z } from "zod";
import { programSchema } from "../src/features/programs/schema";
import {
  programIdentities,
  validatePrograms,
} from "../src/features/programs/repository";
import { verifiedSourceSchema } from "../src/features/content-review/schema";
import { validateImmutableVersions } from "./content/immutable-versions";
const definitions = z
  .strictObject({
    extractedAt: z.iso.datetime({ offset: true }),
    sourceLocators: z.string().array().min(1),
    programs: programSchema.array().length(1),
  })
  .parse(
    JSON.parse(
      readFileSync(
        "src/content/provenance/foundation-program-definitions.json",
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
const outputs = [
  "src/content/programs/records.json",
  "src/content/programs/versions.json",
].map((path) => {
  const existing = programSchema
    .array()
    .parse(JSON.parse(readFileSync(path, "utf8")));
  for (const program of definitions.programs) {
    const seed = programIdentities.find((r) => r.id === program.id);
    if (
      !seed ||
      seed.slug !== program.slug ||
      seed.displayName !== program.displayName
    )
      throw Error("Stable program identity changed");
    const previous = existing.find(
      (r) => r.id === program.id && r.version === program.version,
    );
    if (previous && JSON.stringify(previous) !== JSON.stringify(program))
      throw Error("Immutable program version changed");
    for (const ref of program.sources ?? []) {
      if (!sources.some((s) => s.url === ref.url && s.reuse !== "blocked"))
        throw Error(`Unverified program source ${ref.id}`);
    }
  }
  const proposed = path.endsWith("versions.json")
    ? [
        ...existing,
        ...definitions.programs.filter(
          (d) =>
            !existing.some((r) => r.id === d.id && r.version === d.version),
        ),
      ]
    : [
        ...existing.filter(
          (r) => !definitions.programs.some((d) => d.id === r.id),
        ),
        ...definitions.programs,
      ];
  const errors = path.endsWith("versions.json")
    ? proposed.flatMap((program) => validatePrograms([program]))
    : validatePrograms(proposed);
  if (errors.length) throw Error(errors.join("; "));
  validateImmutableVersions(
    proposed.map((program) => ({
      id: `${program.id}@${program.version}`,
      content: program,
    })),
    JSON.parse(
      readFileSync("src/content/provenance/program-version-pins.json", "utf8"),
    ),
  );
  return { path, json: JSON.stringify(proposed, null, 2) + "\n" };
});
// Both current and immutable-version outputs pass before either write.
for (const { path, json } of outputs) {
  if (process.argv.includes("--check")) {
    if (readFileSync(path, "utf8") !== json)
      throw Error("Foundation program output is stale");
  } else {
    writeFileSync(`${path}.tmp`, json);
    renameSync(`${path}.tmp`, path);
  }
}
console.log("Source-scoped foundation program and immutable version compiled.");
