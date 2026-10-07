import { readFileSync, writeFileSync } from "node:fs";
import { scienceSchema } from "../src/features/workout-science/schema";
import {
  validateScience,
  scienceIdentities,
} from "../src/features/workout-science/repository";
import sources from "../src/content/provenance/verified-sources.json";
const read = (p: string): unknown => JSON.parse(readFileSync(p, "utf8"));
const additions = scienceSchema
  .array()
  .parse(read("src/content/provenance/science-research-definitions.json"));
const path = "src/content/workout-science/records.json",
  old = scienceSchema.array().parse(read(path));
for (const article of additions) {
  const seed = scienceIdentities.find((s) => s.id === article.id);
  if (
    !seed ||
    seed.slug !== article.slug ||
    seed.displayName !== article.displayName
  )
    throw Error("Science identity changed.");
  for (const source of article.sources ?? [])
    if (
      !sources.some(
        (s) =>
          s.id === source.id && s.url === source.url && s.reuse !== "blocked",
      )
    )
      throw Error("Science source/rights missing.");
  const previous = old.find((s) => s.id === article.id);
  if (
    previous?.contentStatus === "published" &&
    JSON.stringify(previous) !== JSON.stringify(article)
  )
    throw Error(
      "Published science content cannot be overwritten without an explicit version review.",
    );
}
const proposed = [
  ...old.filter((s) => !additions.some((r) => r.id === s.id)),
  ...additions,
];
const errors = validateScience(proposed);
if (errors.length) throw Error(errors.join("\n"));
const output = JSON.stringify(proposed, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== output)
    throw Error("Science research output is stale.");
} else writeFileSync(path, output);
console.log(
  "Two research comparisons compiled with study context and limited editorial confidence.",
);
