import type { ScienceDiscoveryTopic } from "./index-schema";
import { z } from "zod";
import type { SearchSchemaInput } from "@tanstack/react-router";
import { normalizeTerm } from "../muscles/public-repository";
import { buildScienceIndexes, scienceIndexes } from "./public-repository";
import {
  confidences,
  scienceCategories,
  scienceExperiences,
  scienceGoals,
  scienceTypes,
} from "./constants";
export const scienceFilterOptions = {
  category: [...scienceCategories],
  type: [...scienceTypes],
  goal: [...scienceGoals],
  experience: [...scienceExperiences],
  confidence: [...confidences],
};
export const scienceFilterKeys = Object.keys(
  scienceFilterOptions,
) as (keyof typeof scienceFilterOptions)[];
export type ScienceQuery = {
  q: string;
  sort: "learning" | "az" | "reviewed" | "foundation";
} & Record<keyof typeof scienceFilterOptions, string[]>;
export function parseScienceQuery(raw: Record<string, unknown>): ScienceQuery {
  const filters = Object.fromEntries(
    scienceFilterKeys.map((key) => {
      const values = Array.isArray(raw[key])
        ? raw[key]
        : typeof raw[key] === "string"
          ? raw[key].split(",")
          : [];
      return [
        key,
        [
          ...new Set(
            values.filter(
              (value): value is string =>
                typeof value === "string" &&
                (scienceFilterOptions[key] as readonly string[]).includes(
                  value,
                ),
            ),
          ),
        ],
      ];
    }),
  ) as Record<keyof typeof scienceFilterOptions, string[]>;
  return {
    ...filters,
    q: z.string().max(200).catch("").parse(raw.q),
    sort: z
      .enum(["learning", "az", "reviewed", "foundation"])
      .catch("learning")
      .parse(raw.sort),
  };
}
const cache = new WeakMap<
  readonly ScienceDiscoveryTopic[],
  ReturnType<typeof buildScienceIndexes>
>();
export function validateScienceSearch(
  raw: Record<string, unknown> & SearchSchemaInput,
) {
  return parseScienceQuery(raw);
}
export function scienceQueryParams(query: ScienceQuery) {
  return Object.fromEntries(
    Object.entries(query)
      .filter(([key, value]) =>
        Array.isArray(value)
          ? value.length
          : key === "q"
            ? Boolean(value)
            : value !== "learning",
      )
      .map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(",") : value,
      ]),
  );
}
export function searchScience(
  query: ScienceQuery,
  records?: readonly ScienceDiscoveryTopic[],
) {
  let index = records ? cache.get(records) : scienceIndexes;
  if (!index) {
    index = buildScienceIndexes(records ?? []);
    if (records) cache.set(records, index);
  }
  const match = (selected: string[], values: readonly string[]) =>
    !selected.length || selected.some((value) => values.includes(value));
  const terms = normalizeTerm(query.q).split(" ").filter(Boolean);
  return index.published
    .filter(
      (item) =>
        terms.every((term) => index.search.get(item.id)?.includes(term)) &&
        match(query.category, [item.category]) &&
        match(query.type, [item.contentType]) &&
        match(query.goal, item.goalTags) &&
        match(query.experience, item.experienceTags) &&
        match(
          query.confidence,
          item.claims?.map((claim) => claim.confidence) ?? [],
        ),
    )
    .sort((a, b) => {
      if (query.sort === "learning")
        return (
          (a.learningOrder ?? Number.MAX_SAFE_INTEGER) -
            (b.learningOrder ?? Number.MAX_SAFE_INTEGER) ||
          a.displayName.localeCompare(b.displayName)
        );
      if (query.sort === "reviewed")
        return (
          (b.review?.reviewedAt ?? "").localeCompare(
            a.review?.reviewedAt ?? "",
          ) || a.displayName.localeCompare(b.displayName)
        );
      if (query.sort === "foundation")
        return (
          Number(b.experienceTags.includes("foundation")) -
            Number(a.experienceTags.includes("foundation")) ||
          (a.learningOrder ?? 999) - (b.learningOrder ?? 999)
        );
      return a.displayName.localeCompare(b.displayName);
    });
}
