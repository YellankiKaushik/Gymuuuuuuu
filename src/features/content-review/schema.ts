import { z } from "zod";
export const reviewStates = [
  "draft",
  "source_verified",
  "machine_validated",
  "human_review_pending",
  "published_personal_use",
  "published_reviewed",
  "deprecated",
] as const;
export const verifiedSourceSchema = z.strictObject({
  id: z.string().min(1),
  title: z.string().min(1),
  publisher: z.string().min(1),
  url: z
    .url()
    .refine(
      (value) => /^https?:\/\//.test(value),
      "Source references must use HTTP(S)",
    ),
  sourceVersion: z.string().min(1).nullable(),
  sourceDate: z.iso.date().nullable(),
  evidenceType: z.enum([
    "government_dataset",
    "government_reference",
    "consensus",
    "professional_summary",
    "original_repository_work",
    "historical_anatomy",
  ]),
  extractedAt: z.iso.datetime({ offset: true }),
  lastReviewedAt: z.iso.date(),
  reuse: z.enum([
    "public_domain_data",
    "brief_factual_paraphrase",
    "original_work",
    "open_government_licence",
    "blocked",
  ]),
  rightsReference: z.string().min(1),
  limitations: z.array(z.string().min(1)),
});
export const publicationReviewSchema = z.strictObject({
  module: z.string().min(1),
  id: z.string().min(1),
  slug: z.string().min(1),
  state: z.enum(reviewStates),
  method: z.string().min(20),
  lastReviewedAt: z.iso.date(),
  reviewer: z.discriminatedUnion("kind", [
    z.strictObject({ kind: z.literal("machine"), name: z.string().min(1) }),
    z.strictObject({
      kind: z.literal("human"),
      name: z.string().min(1),
      attestationReference: z.string().min(1),
    }),
  ]),
  fields: z
    .array(
      z.strictObject({
        path: z.string().min(1),
        sourceIds: z.array(z.string().min(1)).min(1),
        kind: z.enum([
          "dataset_value",
          "sourced_education",
          "original_authorship",
        ]),
      }),
    )
    .min(1),
  limitations: z.array(z.string().min(1)).min(1),
});
export function validatePublicationReviews(
  inputs: unknown[],
  sourceInputs: unknown[],
  today: string,
) {
  z.iso.date().parse(today);
  const records = publicationReviewSchema.array().parse(inputs),
    sources = verifiedSourceSchema.array().parse(sourceInputs);
  for (const group of [
    records.map((r) => `${r.module}:${r.id}`),
    sources.map((s) => s.id),
  ])
    if (new Set(group).size !== group.length)
      throw Error("Duplicate provenance identity");
  for (const source of sources)
    if (
      source.lastReviewedAt > today ||
      source.extractedAt.slice(0, 10) > today
    )
      throw Error("Future source verification date");
  for (const record of records) {
    if (record.lastReviewedAt > today)
      throw Error("Future publication review date");
    if (
      record.state === "published_reviewed" &&
      record.reviewer.kind !== "human"
    )
      throw Error("Human-reviewed publication requires a human attestation");
    if (
      !["published_personal_use", "published_reviewed"].includes(record.state)
    )
      throw Error("Draft or pending provenance cannot authorise publication");
    for (const field of record.fields)
      for (const id of field.sourceIds) {
        const source = sources.find((s) => s.id === id);
        if (!source || source.reuse === "blocked")
          throw Error(`Unapproved or rights-blocked source ${id}`);
        if (
          field.kind === "original_authorship" &&
          source.evidenceType !== "original_repository_work"
        )
          throw Error(
            "Original authorship requires an original repository source",
          );
        if (
          field.kind === "dataset_value" &&
          source.evidenceType !== "government_dataset"
        )
          throw Error(
            "Numeric dataset values require a verified dataset source",
          );
      }
  }
  return records;
}
