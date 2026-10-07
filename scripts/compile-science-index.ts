import { readFileSync, writeFileSync } from "node:fs";
import { scienceSchema } from "../src/features/workout-science/schema";
import { projectScienceIndex } from "../src/features/workout-science/index-schema";
import { validateScience } from "../src/features/workout-science/repository";
const records = scienceSchema
  .array()
  .parse(
    JSON.parse(
      readFileSync("src/content/workout-science/records.json", "utf8"),
    ),
  );
const errors = validateScience(records);
if (errors.length) throw Error(errors.join("\n"));
const index = records
  .filter((r) => ["published", "deprecated"].includes(r.contentStatus))
  .map(projectScienceIndex);
const path = "src/content/workout-science/index.json",
  output = JSON.stringify(index, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== output)
    throw Error("Science discovery index is stale.");
} else writeFileSync(path, output);
console.log(
  "Science discovery projection matches the fully validated source records.",
);
