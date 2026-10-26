import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync } from "node:fs";
import manifest from "../docs/assets/visual-training-pilot-manifest.json";
import muscles from "../src/content/muscles/records.json";
import { muscleSchema } from "../src/features/muscles/schema";
import { MuscleDetail } from "../src/features/muscles/detail";
import { ExerciseDetailContent } from "../src/features/exercises/detail";
import { exerciseIndexes } from "../src/features/exercises/repository";
import { MuscleLocationFigure } from "../src/features/visual-training/schematics";
import { PersonalPlanEditor } from "../src/features/visual-training/plan-editor";
import { navigationFor, modules } from "../src/data/navigation";
import {
  pilotExerciseIds,
  pilotMuscleIds,
} from "../src/features/visual-training/scope";

it("all 12 pilot location visuals resolve the correct immutable record and preserve sourced action qualifiers", () => {
  for (const id of pilotMuscleIds) {
    const record = muscleSchema.parse(muscles.find((r) => r.id === id));
    const figure = renderToStaticMarkup(
      <MuscleLocationFigure record={record} />,
    );
    expect(figure).toContain(`data-muscle-id="${id}"`);
    expect(
      [...figure.matchAll(/<title[^>]*>([^<]*)<\/title>/g)].some((match) =>
        match[1]?.includes(record.displayName),
      ),
    ).toBe(true);
    expect(figure).toContain("approximate location");
    expect(figure).toContain(record.locationSummary);
    const detail = renderToStaticMarkup(<MuscleDetail record={record} />);
    for (const action of record.jointActions) {
      if (action.qualifier)
        expect(detail).toContain(
          action.qualifier
            .replaceAll("&", "&amp;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#x27;"),
        );
    }
  }
});
it("non-pilot anatomy gets no fabricated pilot illustration", () => {
  expect(
    renderToStaticMarkup(
      <MuscleLocationFigure
        record={{ id: "muscle_not_in_pilot", displayName: "Other" }}
      />,
    ),
  ).toBe("");
});
it("six exercise guides link to the allowlisted plan intent and preserve classifications, source roles and safety", () => {
  for (const id of pilotExerciseIds) {
    const record = exerciseIndexes.byId.get(id)!;
    const html = renderToStaticMarkup(
      <ExerciseDetailContent record={record} />,
    );
    expect(record.contentStatus).toBe("published");
    expect(html).toContain(`data-exercise-id="${id}"`);
    expect(
      [...html.matchAll(/<title[^>]*>([^<]*)<\/title>/g)].some((match) =>
        match[1]?.includes(`${record.displayName}: setup`),
      ),
    ).toBe(true);
    expect(html).toContain(`/workout/plans?exercise=${id}`);
    for (const state of ["SETUP", "ACTION", "RESET"])
      expect(html).toContain(`>${state}</button>`);
    expect(html).toContain(record.difficulty);
    for (const role of record.muscleRoles ?? []) {
      expect(html).toContain(role.role.replaceAll("-", " "));
      if (role.qualifier)
        expect(html).toContain(
          role.qualifier
            .replaceAll("&", "&amp;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#x27;"),
        );
    }
    expect(html).toContain("Safety &amp; stop signals");
  }
  expect(
    exerciseIndexes.byId.get("exercise_one_arm_dumbbell_row")!.difficulty,
  ).toBe("intermediate");
});
it("all 30 original visual states disclose provenance and unperformed independent review", () => {
  expect(manifest.assets).toHaveLength(30);
  expect(new Set(manifest.assets.map((a) => a.id)).size).toBe(30);
  expect(
    manifest.assets
      .filter((a) => a.kind === "muscle-location")
      .map((a) => a.entityId)
      .sort(),
  ).toEqual([...pilotMuscleIds].sort());
  for (const id of pilotExerciseIds)
    expect(manifest.assets.filter((a) => a.entityId === id)).toHaveLength(3);
  for (const asset of manifest.assets) {
    expect(existsSync(asset.file)).toBe(true);
    expect(asset.author).toBeTruthy();
    expect(asset.license).toBeTruthy();
    expect(asset.sourceBasis.sourceIds.length).toBeGreaterThan(0);
    expect(asset.review.reviewedAt).toBeNull();
    expect(asset.review.reviewedBy).toBeNull();
    expect(asset.limitations).toBeTruthy();
  }
  expect(manifest.newMediaFileBytes).toBe(0);
});
it("personal plan SSR contains no browser records or pre-generated personal IDs", () => {
  const html = renderToStaticMarkup(<PersonalPlanEditor />);
  expect(html).toContain("Personal records are loaded only in this browser");
  expect(html).not.toContain("personal_plan_");
  expect(html).not.toContain("<main");
});
it("personal plan breadcrumbs resolve contextually without expanding frozen public discovery", () => {
  expect(navigationFor("/workout/plans")?.label).toBe("Personal plans");
  expect(modules.some((module) => module.path === "/workout/plans")).toBe(
    false,
  );
});
