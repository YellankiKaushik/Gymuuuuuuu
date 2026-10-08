import { z } from "zod";
import { verifiedSourceSchema } from "../../src/features/content-review/schema";
import { mappingSchema } from "./usda";

export const foodIdentityMatchesSchema = z.array(
  z.strictObject({
    foodId: z.string().regex(/^food_/),
    fdcId: z.number().int().positive(),
    description: z.string().min(1),
    sourceIds: z.string().min(1).array().min(1),
    rationale: z.string().min(30),
    verifiedAt: z.iso.datetime({ offset: true }),
  }),
);

export function verifyFoodIdentityMatches(
  input: unknown,
  mappingInput: unknown,
  sourceInput: unknown,
  today: string,
) {
  z.iso.datetime({ offset: true }).parse(today);
  const matches = foodIdentityMatchesSchema.parse(input);
  const mappings = mappingSchema.array().parse(mappingInput);
  const sources = verifiedSourceSchema.array().parse(sourceInput);
  if (
    new Set(matches.map((row) => `${row.foodId}:${row.fdcId}`)).size !==
    matches.length
  )
    throw Error("Duplicate food identity match");
  for (const match of matches) {
    if (Date.parse(match.verifiedAt) > Date.parse(today))
      throw Error("Future food identity verification");
    if (
      !mappings.some(
        (row) =>
          row.foodId === match.foodId &&
          row.fdcId === match.fdcId &&
          row.description === match.description,
      )
    )
      throw Error(
        "Identity naming proof differs from the exact composition mapping",
      );
    if (new Set(match.sourceIds).size !== match.sourceIds.length)
      throw Error("Duplicate naming source");
    for (const id of match.sourceIds) {
      const source = sources.find((row) => row.id === id);
      if (
        !source ||
        source.reuse === "blocked" ||
        Date.parse(source.extractedAt) > Date.parse(match.verifiedAt)
      )
        throw Error(
          "Naming proof requires an approved, previously inspected source",
        );
    }
  }
  return matches;
}
