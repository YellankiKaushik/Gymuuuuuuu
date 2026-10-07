import { expect, it } from "vitest";
import { taxonomySchema } from "../src/features/muscles/schema";
import taxonomy from "../src/content/muscles/taxonomy.json";
import projection from "../src/content/muscles/runtime-taxonomy.json";
import immutable from "../src/content/programs/versions.json";
import { programSchema } from "../src/features/programs/schema";
import {
  programRecords,
  programVersions,
} from "../src/features/programs/repository";
it("keeps all anatomy identities and classification fields without exposing unpublished editorial data", () => {
  const full = taxonomySchema.parse(taxonomy);
  expect(projection.records).toEqual(
    full.records.map((r) => ({
      id: r.id,
      slug: r.slug,
      displayName: r.displayName,
      entityType: r.entityType,
      regionIds: r.regionIds,
      trainingGroupIds: r.trainingGroupIds,
    })),
  );
  expect(projection.records).toHaveLength(70);
  const { records: unused, ...fields } = full;
  const { records: ignored, ...runtime } = projection;
  expect(unused.length + ignored.length).toBe(140);
  expect(runtime).toEqual(fields);
});
it("resolves every complete program version while keeping current and immutable runtime objects independent", () => {
  expect(programVersions).toEqual(programSchema.array().parse(immutable));
  const current = programRecords.find((r) => r.contentStatus === "published")!;
  const version = programVersions.find(
    (r) => r.id === current.id && r.version === current.version,
  )!;
  expect(version).not.toBe(current);
  expect(version.scheduleModel).not.toBe(current.scheduleModel);
});
