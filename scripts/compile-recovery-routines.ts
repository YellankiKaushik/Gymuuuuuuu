import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  publicRecoveryRoutineSchema,
  validateRecoveryRelease,
  publicRecoveryArticles,
} from "../src/features/recovery/publication";
import sources from "../src/content/provenance/verified-sources.json";
const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const definitions = publicRecoveryRoutineSchema
  .array()
  .parse(read("src/content/provenance/recovery-routine-definitions.json"));
validateRecoveryRelease(publicRecoveryArticles, definitions);
const existing = publicRecoveryRoutineSchema
  .array()
  .parse(read("src/content/recovery/routines.json"));
for (const old of existing) {
  const proposed = definitions.find((r) => r.routine.id === old.routine.id);
  if (!proposed || JSON.stringify(proposed) !== JSON.stringify(old))
    throw Error("Existing public routine versions are immutable.");
}
for (const item of definitions) {
  if (
    !sources.some(
      (s) =>
        item.article.sourceIds.includes(s.id) &&
        s.reuse !== "blocked" &&
        s.url ===
          "https://www.nhs.uk/better-health/get-active/get-running-with-couch-to-5k/couch-to-5k-running-plan/",
    )
  )
    throw Error("Approved walking source is missing.");
  if (
    !["routine_running_warmup", "routine_post_run_cooldown"].includes(
      item.article.id,
    ) ||
    item.routine.steps.length !== 1 ||
    item.routine.steps[0]!.doseType !== "seconds" ||
    item.routine.steps[0]!.doseValue !== 5 * 60 ||
    item.routine.steps[0]!.phase03ExerciseId != null ||
    item.routine.estimatedMinutes !== 5
  )
    throw Error("Walking template differs from the extracted NHS step.");
}
const pins = definitions.map((item) => ({
  id: item.routine.id,
  sha256: createHash("sha256").update(JSON.stringify(item)).digest("hex"),
}));
const target = "src/content/recovery/routines.json",
  pinTarget = "src/content/provenance/recovery-routine-version-pins.json";
const content = JSON.stringify(definitions, null, 2) + "\n",
  pinContent = JSON.stringify(pins, null, 2) + "\n";
if (process.argv.includes("--check")) {
  if (
    readFileSync(target, "utf8") !== content ||
    readFileSync(pinTarget, "utf8") !== pinContent
  )
    throw Error("Recovery routine output or version pin is stale.");
} else {
  if (
    existing.length &&
    JSON.stringify(read(pinTarget)) !== JSON.stringify(pins)
  )
    throw Error("Existing routine version hashes cannot be overwritten.");
  writeFileSync(target, content);
  writeFileSync(pinTarget, pinContent);
}
console.log(
  "Two NHS walking templates validated; no recovery score or invented stretch sequence.",
);
