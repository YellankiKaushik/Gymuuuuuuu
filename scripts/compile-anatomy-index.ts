import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { muscleRecords } from "../src/features/muscles/repository";
import { projectMuscleIndex } from "../src/features/muscles/index-schema";

const path = "src/content/muscles/index.json";
const value =
  JSON.stringify(
    muscleRecords
      .filter((r) => ["published", "deprecated"].includes(r.contentStatus))
      .map(projectMuscleIndex),
    null,
    2,
  ) + "\n";
if (process.argv.includes("--check")) {
  if (readFileSync(path, "utf8") !== value)
    throw Error("Anatomy discovery index is stale");
} else {
  writeFileSync(`${path}.tmp`, value);
  renameSync(`${path}.tmp`, path);
}
console.log("Sourced anatomy discovery index validated.");
