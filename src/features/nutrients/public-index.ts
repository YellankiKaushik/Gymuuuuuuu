import indexJson from "../../content/nutrients/index.json";
import report from "../../content/nutrients/release-report.json";
import glossary from "../../content/nutrients/glossary.json";
import { z } from "zod";
export type NutrientIndexEntry = {
  id: string;
  slug: string;
  name: string;
  aliases: string[];
  group: string;
  essentiality: string;
  unit: string;
  displayKind: string;
  frameworks: string[];
  foodCoverage: number;
  terms: string;
};
export const nutrientIndex = indexJson as NutrientIndexEntry[];
export const nutrientReleaseReport = report;
const glossarySchema = z.strictObject({
  term: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  sourceUrl: z.url(),
  id: z.string().regex(/^glossary_[a-z]+$/),
  slug: z.string().regex(/^[a-z]+$/),
  review: z.strictObject({
    status: z.literal("source_checked"),
    checkedAt: z.iso.date(),
    reviewer: z.string().min(1),
    note: z.string().min(1),
  }),
});
const checkedGlossary = glossarySchema.array().parse(glossary);
export const getFrameworkGlossary = () => checkedGlossary;
