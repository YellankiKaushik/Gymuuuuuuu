import { expect, it } from "vitest";
import { muscleRecords } from "../src/features/muscles/repository";
import index from "../src/content/muscles/index.json";
import { projectMuscleIndex } from "../src/features/muscles/index-schema";
import { loadMuscleBySlug } from "../src/features/muscles/detail-loader";
import { parseMuscleQuery, searchMuscles } from "../src/features/muscles/query";

it("preserves sourced discovery fields without bundling full teaching records", () => {
  const published = muscleRecords.filter(
    (r) => r.contentStatus === "published",
  );
  expect(index).toEqual(published.map(projectMuscleIndex));
  expect(
    index.every(
      (r) => !("structure" in r) && !("cautions" in r) && !("summary" in r),
    ),
  ).toBe(true);
  const query = parseMuscleQuery({ joint: "knee", action: "flexion" });
  expect(searchMuscles(query).map((r) => r.id)).toEqual(
    searchMuscles(query, published).map((r) => r.id),
  );
});

it("loads complete sourced anatomy and keeps unpublished slugs unavailable", async () => {
  const source = muscleRecords.find((r) => r.id === "muscle_soleus")!;
  expect(await loadMuscleBySlug(source.slug)).toEqual(source);
  expect(await loadMuscleBySlug("unpublished-anatomy")).toBeUndefined();
});
