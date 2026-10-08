import { expect, it } from "vitest";
import sources from "../src/content/provenance/verified-sources.json";
import reviews from "../src/content/provenance/publications.json";
import { validatePublicationReviews } from "../src/features/content-review/schema";

it("records current OpenStax reuse restrictions without authorizing publication", () => {
  const excluded = sources.find(
    (source) => source.id === "openstax_ap2e_2026_excluded",
  )!;
  expect(excluded.reuse).toBe("blocked");
  expect(excluded.rightsReference).toContain("prior written permission");
  expect(
    reviews.flatMap((review) =>
      review.fields.flatMap((field) => field.sourceIds),
    ),
  ).not.toContain(excluded.id);
  expect(() =>
    validatePublicationReviews(
      [
        {
          ...reviews[0]!,
          fields: [
            {
              path: "anatomy",
              sourceIds: [excluded.id],
              kind: "sourced_education",
            },
          ],
        },
      ],
      sources,
      new Date().toISOString().slice(0, 10),
    ),
  ).toThrow(/rights-blocked/);
});
