import { test, expect } from "vitest";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import snapshot from "../src/content/provenance/nia-flexibility-snapshot.json";
import definitions from "../src/content/provenance/nia-flexibility-definitions.json";
import {
  publicRecoveryArticles,
  publicRecoveryRoutines,
  validateRecoveryRelease,
} from "../src/features/recovery/publication";
import { createPublicRoutineCopy } from "../src/features/recovery/public-routines";

test("NIA flexibility retains the government extraction, safety boundaries and honest age", () => {
  expect(
    createHash("sha256")
      .update(
        readFileSync("src/content/provenance/nia-flexibility-extract.txt"),
      )
      .digest("hex"),
  ).toBe(snapshot.extractSha256);
  expect(
    createHash("sha256")
      .update(
        readFileSync("src/content/provenance/nia-flexibility-definitions.json"),
      )
      .digest("hex"),
  ).toBe(snapshot.definitionsSha256);
  expect(snapshot.source.sourceVersion).toContain("March 2018");
  expect(snapshot.source.sourceDate).toBeNull();
  expect(validateRecoveryRelease()).toBeUndefined();
  for (const article of definitions.articles) {
    expect(publicRecoveryArticles.find((row) => row.id === article.id)).toEqual(
      article,
    );
    expect(article.contraindications.join(" ")).toContain("sharp");
    expect(article.limitations.join(" ")).toContain(
      "No improvement in soreness",
    );
    expect(article.review.reviewer).toContain("no human review");
  }
});

test("source lower-bound holds preserve side order and leave total duration unknown", () => {
  for (const entry of definitions.routines) {
    expect(
      publicRecoveryRoutines.find((row) => row.article.id === entry.article.id),
    ).toEqual(entry);
    expect(entry.routine.estimatedMinutes).toBeNull();
    expect(entry.routine.steps).toHaveLength(6);
    expect(
      entry.routine.steps.every(
        (step) =>
          step.doseValue === 10 &&
          step.doseType === "seconds" &&
          step.phase03ExerciseId === null,
      ),
    ).toBe(true);
    expect(entry.routine.notes).toContain("lower bounds");
    expect(entry.article.limitations.join(" ")).toContain(
      "not counted as zero",
    );
  }
  const calf = definitions.routines.find(
    (entry) => entry.article.id === "routine_calf_flexibility",
  )!;
  expect(calf.routine.steps.map((step) => step.title.split(" ")[0])).toEqual([
    "Left",
    "Right",
    "Left",
    "Right",
    "Left",
    "Right",
  ]);
  const hamstring = definitions.routines.find(
    (entry) => entry.article.id === "routine_hamstring_flexibility",
  )!;
  expect(
    hamstring.routine.steps.map((step) => step.title.split(" ")[0]),
  ).toEqual(["Right", "Right", "Right", "Left", "Left", "Left"]);
});

test("local copies retain source steps without changing the immutable publication", () => {
  const published = publicRecoveryRoutines.find(
    (entry) => entry.article.id === "routine_calf_flexibility",
  )!;
  const before = JSON.stringify(published);
  const first = createPublicRoutineCopy(published.article.id);
  const second = createPublicRoutineCopy(published.article.id);
  expect(first.id).not.toBe(second.id);
  expect(first.steps[0]?.id).not.toBe(published.routine.steps[0]?.id);
  expect(first.publicationProvenance!.sourceSteps).toEqual(
    published.routine.steps,
  );
  first.steps[0]!.doseValue = 20;
  expect(JSON.stringify(published)).toBe(before);
  expect(first.publicationProvenance!.sourceSteps[0]!.doseValue).toBe(10);
});
