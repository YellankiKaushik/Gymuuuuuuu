import type { CompositionProfile } from "../foods/schema";
export type ComparisonField = { label: string; value: string };
export type ComparisonRecord = {
  id: string;
  title: string;
  route: string;
  fields: ComparisonField[];
  sources: { label: string; url: string }[];
  limitations: string[];
  profiles?: CompositionProfile[];
  unavailable?: string;
};
