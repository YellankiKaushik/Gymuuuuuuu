import { describe, it, expect } from "vitest";
import { validatePublicationReviews } from "../src/features/content-review/schema";
const source = {
  id: "s",
  title: "Dataset",
  publisher: "USDA",
  url: "https://fdc.nal.usda.gov/",
  sourceVersion: "April 2026",
  sourceDate: null,
  evidenceType: "government_dataset",
  extractedAt: "2026-10-05T14:21:40Z",
  lastReviewedAt: "2026-10-05",
  reuse: "public_domain_data",
  rightsReference: "CC0",
  limitations: [],
};
const review = {
  module: "foods",
  id: "food_example",
  slug: "example",
  state: "published_personal_use",
  method: "Exact source extraction and machine numeric validation",
  lastReviewedAt: "2026-10-05",
  reviewer: { kind: "machine", name: "Codex" },
  fields: [{ path: "composition", sourceIds: ["s"], kind: "dataset_value" }],
  limitations: ["No human review"],
};
describe("Publication review boundary", () => {
  it("accepts honest machine personal-use publication", () =>
    expect(
      validatePublicationReviews([review], [source], "2026-10-05"),
    ).toHaveLength(1));
  it("rejects a machine posing as a human reviewer", () =>
    expect(() =>
      validatePublicationReviews(
        [{ ...review, state: "published_reviewed" }],
        [source],
        "2026-10-05",
      ),
    ).toThrow(/human attestation/));
  it("rejects licensing blocks and missing source IDs", () => {
    expect(() =>
      validatePublicationReviews(
        [review],
        [{ ...source, reuse: "blocked" }],
        "2026-10-05",
      ),
    ).toThrow(/rights-blocked/);
    expect(() =>
      validatePublicationReviews([review], [], "2026-10-05"),
    ).toThrow(/Unapproved/);
  });
  it("rejects pending reviews, future dates and duplicate records", () => {
    expect(() =>
      validatePublicationReviews(
        [{ ...review, state: "human_review_pending" }],
        [source],
        "2026-10-05",
      ),
    ).toThrow(/pending/);
    expect(() =>
      validatePublicationReviews([review], [source], "2026-10-04"),
    ).toThrow(/Future/);
    expect(() =>
      validatePublicationReviews([review, review], [source], "2026-10-05"),
    ).toThrow(/Duplicate/);
  });
});
