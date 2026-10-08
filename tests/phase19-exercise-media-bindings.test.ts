import { readFileSync } from "node:fs";
import { expect, test } from "vitest";
import bindings from "../src/content/provenance/exercise-media-bindings.json";
import sources from "../src/content/provenance/verified-sources.json";
import { exerciseRecords } from "../src/features/exercises/repository";
import { verifyExerciseMediaBindings } from "../scripts/content/exercise-media-bindings";

const readAsset = (url: string) => readFileSync("public" + url);
test("binds every published media version to its exact repository asset and original source", () => {
  expect(
    verifyExerciseMediaBindings(bindings, exerciseRecords, sources, readAsset),
  ).toEqual(bindings);
  expect(bindings.length).toBe(
    exerciseRecords.flatMap((r) => r.media ?? []).length,
  );
});
test("rejects missing, duplicate, substituted and unverified media bindings", () => {
  expect(() =>
    verifyExerciseMediaBindings(
      bindings.slice(1),
      exerciseRecords,
      sources,
      readAsset,
    ),
  ).toThrow();
  expect(() =>
    verifyExerciseMediaBindings(
      [...bindings, bindings[0]],
      exerciseRecords,
      sources,
      readAsset,
    ),
  ).toThrow();
  const substituted = structuredClone(bindings);
  substituted[0]!.url = bindings[1]!.url;
  expect(() =>
    verifyExerciseMediaBindings(
      substituted,
      exerciseRecords,
      sources,
      readAsset,
    ),
  ).toThrow();
  const factualSource = structuredClone(bindings);
  factualSource[0]!.sourceId = "ace_machine_chest_press";
  expect(() =>
    verifyExerciseMediaBindings(
      factualSource,
      exerciseRecords,
      sources,
      readAsset,
    ),
  ).toThrow();
  expect(() =>
    verifyExerciseMediaBindings(bindings, exerciseRecords, sources, () =>
      new TextEncoder().encode("<svg><script>alert(1)</script></svg>"),
    ),
  ).toThrow();
  const blocked = sources.map((s) =>
    s.id === bindings[0]!.sourceId ? { ...s, reuse: "blocked" } : s,
  );
  expect(() =>
    verifyExerciseMediaBindings(bindings, exerciseRecords, blocked, readAsset),
  ).toThrow();
});
