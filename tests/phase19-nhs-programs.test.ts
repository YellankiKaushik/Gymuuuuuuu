import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  publishedPrograms,
  programIdentities,
  resolveProgramVersion,
  validatePrograms,
} from "../src/features/programs/repository";
import { verifyProgramSourceBindings } from "../scripts/content/program-source-bindings";
import bindings from "../src/content/provenance/program-source-bindings.json";
import sources from "../src/content/provenance/verified-sources.json";
import snapshot from "../src/content/provenance/nhs-program-snapshot.json";
import oldTwoDay from "../src/content/provenance/foundation-program-definitions.json";
import oldThreeDay from "../src/content/provenance/three-day-program-definition.json";

it("preserves all seed identities and prior immutable NIA programs while publishing exact NHS-scoped versions", () => {
  expect(programIdentities).toHaveLength(50);
  expect(publishedPrograms).toHaveLength(4);
  expect(validatePrograms(publishedPrograms)).toEqual([]);
  expect(resolveProgramVersion(oldThreeDay.id, oldThreeDay.version)).toEqual(
    oldThreeDay,
  );
  for (const definition of oldTwoDay.programs)
    expect(resolveProgramVersion(definition.id, definition.version)).toEqual(
      definition,
    );
  for (const program of publishedPrograms.filter((p) =>
    p.id.startsWith("program_general_fitness_"),
  )) {
    const seed = programIdentities.find((p) => p.id === program.id)!;
    expect(program.slug).toBe(seed.slug);
    expect(program.displayName).toBe(seed.displayName);
    expect(program.timeContext?.method).toBe("source_unspecified");
    expect(program.sessionDurationMinutes).toBeNull();
    expect(program.experienceLevels).toEqual(["intermediate"]);
    expect(program.review?.programReviewerRole).toContain(
      "no independent human review",
    );
    expect(program.scheduleModel!.sessions).toHaveLength(
      seed.trainingDaysPerWeek,
    );
    for (const session of program.scheduleModel!.sessions) {
      expect(session.estimatedDurationMinutes).toBeNull();
      for (const p of session.exerciseBlocks.flatMap((b) => b.prescriptions)) {
        expect(p.sets).toEqual({ min: 2, max: 2 });
        expect(p.repetitionTarget.range).toEqual({ min: 8, max: 12 });
        expect(p.restSeconds).toBeNull();
        expect(typeof p.effortTarget.target).toBe("string");
        expect(p.restGuidance?.sourceIds).toEqual(["source_nhs_strength_2026"]);
      }
    }
  }
});
it("pins actually inspected source transcriptions without claiming a raw HTML archive or human review", () => {
  expect(snapshot.rawHtmlSha256).toBeNull();
  for (const [name, pin] of [
    ["definitions", snapshot.definitionSha256],
    ["sources", snapshot.sourceSha256],
  ] as const)
    expect(
      createHash("sha256")
        .update(readFileSync(`src/content/provenance/nhs-program-${name}.json`))
        .digest("hex"),
    ).toBe(pin);
  expect(
    sources.find((s) => s.id === "nhs_strength_flexibility_2026")?.sourceDate,
  ).toBe("2026-07-21");
  expect(sources.find((s) => s.id === "nhs_warmup_2026")?.sourceDate).toBe(
    "2026-06-24",
  );
});
it("rejects missing, duplicated, blocked or mismatched program source bindings instead of falling back to a plausible source", () => {
  expect(
    verifyProgramSourceBindings(bindings, publishedPrograms, sources),
  ).toEqual(bindings);
  expect(() =>
    verifyProgramSourceBindings(bindings.slice(1), publishedPrograms, sources),
  ).toThrow();
  expect(() =>
    verifyProgramSourceBindings(
      [...bindings.slice(1), bindings[1]],
      publishedPrograms,
      sources,
    ),
  ).toThrow();
  const bad = structuredClone(bindings);
  bad[2]!.frameworkSourceIds = ["nia_strength_guide_2018"];
  expect(() =>
    verifyProgramSourceBindings(bad, publishedPrograms, sources),
  ).toThrow("exact approved source URLs");
  const blocked = sources.map((s) =>
    s.id === "nhs_strength_flexibility_2026" ? { ...s, reuse: "blocked" } : s,
  );
  expect(() =>
    verifyProgramSourceBindings(bindings, publishedPrograms, blocked),
  ).toThrow();
});
