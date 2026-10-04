import type { SearchSchemaInput } from "@tanstack/react-router";
import { normalizeTerm } from "../muscles/repository";
import { publishedPrograms, programTaxonomy } from "./repository";
import {
  programGoals,
  programExperiences,
  programStyles,
  programEnvironments,
  programDurations,
  type Program,
} from "./schema";
export const programFilters = {
  goal: [...programGoals],
  experience: [...programExperiences],
  days: ["1", "2", "3", "4", "5", "6", "7"],
  time: ["short", "medium", "long"],
  equipment: programTaxonomy.equipmentProfiles.map((item) => item.id),
  environment: [...programEnvironments],
  style: [...programStyles],
  duration: [...programDurations],
};
export type ProgramQuery = {
  q: string;
  sort: string;
  compare: string[];
} & Record<keyof typeof programFilters, string[]>;
const list = (value: unknown) =>
  (Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : []
  ).filter((item): item is string => typeof item === "string");
export function parseProgramQuery(raw: Record<string, unknown>): ProgramQuery {
  return {
    ...(Object.fromEntries(
      Object.entries(programFilters).map(([key, options]) => [
        key,
        [
          ...new Set(
            list(raw[key]).filter((item) =>
              (options as readonly string[]).includes(item),
            ),
          ),
        ],
      ]),
    ) as Record<keyof typeof programFilters, string[]>),
    q: typeof raw.q === "string" ? raw.q.slice(0, 200) : "",
    sort: [
      "editorial",
      "az",
      "days-asc",
      "days-desc",
      "short",
      "reviewed",
    ].includes(String(raw.sort))
      ? String(raw.sort)
      : "editorial",
    compare: [
      ...new Set(
        list(raw.compare).filter((id) => /^program_[a-z0-9_]+$/.test(id)),
      ),
    ].slice(0, 3),
  };
}
export const validateProgramSearch = (
  raw: Record<string, unknown> & SearchSchemaInput,
) => parseProgramQuery(raw);
export function programQueryParams(query: ProgramQuery) {
  return Object.fromEntries(
    Object.entries(query)
      .filter(([key, value]) =>
        Array.isArray(value)
          ? value.length
          : key === "sort"
            ? value !== "editorial"
            : Boolean(value),
      )
      .map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(",") : value,
      ]),
  );
}
export function searchPrograms(
  query: ProgramQuery,
  records: readonly Program[] = publishedPrograms,
) {
  const match = (selected: string[], actual: string[]) =>
    !selected.length || selected.some((item) => actual.includes(item));
  const terms = normalizeTerm(query.q).split(" ").filter(Boolean);
  return records
    .filter(
      (item) =>
        item.contentStatus === "published" &&
        terms.every((term) =>
          normalizeTerm(
            [
              item.displayName,
              ...(item.aliases ?? []),
              item.primaryGoal,
              item.routineStyle,
              ...(item.audience?.bestFor ?? []),
            ].join(" "),
          ).includes(term),
        ) &&
        match(query.goal, [item.primaryGoal, ...(item.secondaryGoals ?? [])]) &&
        match(query.experience, item.experienceLevels) &&
        match(query.days, [String(item.trainingDaysPerWeek)]) &&
        match(
          query.time,
          item.sessionDurationMinutes
            ? [
                item.sessionDurationMinutes.max <= 30
                  ? "short"
                  : item.sessionDurationMinutes.max <= 60
                    ? "medium"
                    : "long",
              ]
            : [],
        ) &&
        match(query.equipment, [item.equipmentProfileId]) &&
        match(query.environment, item.environmentTags ?? []) &&
        match(query.style, [item.routineStyle]) &&
        match(query.duration, [item.durationMode]),
    )
    .sort(
      (a, b) =>
        (query.sort === "days-asc"
          ? a.trainingDaysPerWeek - b.trainingDaysPerWeek
          : query.sort === "days-desc"
            ? b.trainingDaysPerWeek - a.trainingDaysPerWeek
            : query.sort === "short"
              ? (a.sessionDurationMinutes?.max ?? Infinity) -
                (b.sessionDurationMinutes?.max ?? Infinity)
              : query.sort === "reviewed"
                ? (b.review?.reviewedAt ?? "").localeCompare(
                    a.review?.reviewedAt ?? "",
                  )
                : query.sort === "editorial"
                  ? (a.learningOrder ?? Infinity) -
                    (b.learningOrder ?? Infinity)
                  : 0) || a.displayName.localeCompare(b.displayName),
    );
}
export type FinderInput = {
  goal: string;
  experience: string;
  days: number;
  minutes: number;
  equipmentIds: string[];
  environment: string;
  style: string;
  eligible: "yes" | "no" | "unsure";
};
export const finderVersion = "1.0.0";
export function findPrograms(
  input: FinderInput,
  records: readonly Program[] = publishedPrograms,
) {
  if (
    input.eligible !== "yes" ||
    !Number.isInteger(input.days) ||
    input.days < 1 ||
    input.days > 7 ||
    !Number.isFinite(input.minutes) ||
    input.minutes <= 0
  )
    return [];
  return records
    .filter(
      (item) =>
        item.contentStatus === "published" &&
        item.trainingDaysPerWeek <= input.days &&
        item.environmentTags?.includes(
          input.environment as (typeof programEnvironments)[number],
        ) &&
        (item.requiredEquipmentIds ?? []).every((id) =>
          input.equipmentIds.includes(id),
        ) &&
        item.experienceLevels.includes(
          input.experience as (typeof programExperiences)[number],
        ) &&
        item.sessionDurationMinutes &&
        item.sessionDurationMinutes.max <= input.minutes &&
        [item.primaryGoal, ...(item.secondaryGoals ?? [])].includes(
          input.goal as (typeof programGoals)[number],
        ),
    )
    .map((program) => {
      const reasons = [
        `${program.trainingDaysPerWeek} sessions fit your available days.`,
        "Required equipment and environment match.",
        "The reviewed time range fits your time budget.",
        "Your experience level is within its audience.",
      ];
      const score =
        (program.primaryGoal === input.goal ? 40 : 20) +
        (program.trainingDaysPerWeek === input.days ? 20 : 10) +
        (program.routineStyle === input.style ? 10 : 0);
      return { program, reasons, score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.program.displayName.localeCompare(b.program.displayName),
    );
}
