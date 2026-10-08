import rawTaxonomy from "../../content/programs/taxonomy.json";
import rawRecords from "../../content/programs/records.json";
import historicalVersions from "../../content/programs/historical-versions.json";
import versionIndex from "../../content/programs/version-index.json";
import { anatomyTaxonomy, normalizeTerm } from "../muscles/public-repository";
import { exerciseIdentities, exerciseIndexes } from "../exercises/repository";
import {
  scienceIdentities,
  scienceIndexes,
} from "../workout-science/public-repository";
import { programSchema, type Program } from "./schema";
export const programTaxonomy = rawTaxonomy;
export const programIdentities = programSchema
  .array()
  .parse(rawTaxonomy.records);
export const programRecords = programSchema.array().parse(rawRecords);
const historical = programSchema.array().parse(historicalVersions);
export const programVersions = versionIndex.map((entry) => {
  const program = (entry.current ? programRecords : historical).find(
    (r) => r.id === entry.id && r.version === entry.version,
  );
  if (!program) throw Error("Immutable program version is missing.");
  return structuredClone(program);
});
export function deriveProgramSummary(program: Program) {
  const sessions = program.scheduleModel?.sessions ?? [];
  const rotating = program.scheduleModel?.mode === "rotating-sequence";
  const windows = rotating
    ? sessions.map((_, start) =>
        Array.from(
          { length: program.trainingDaysPerWeek },
          (_, index) => sessions[(start + index) % sessions.length]!,
        ),
      )
    : [sessions];
  const minutes = windows.map((window) => {
    const total = { min: 0, max: 0 };
    for (const session of window) {
      const duration = session.estimatedDurationMinutes;
      if (duration === null) return null;
      total.min += duration.min;
      total.max += duration.max;
    }
    return total;
  });
  const knownMinutes = minutes.filter(
    (item): item is { min: number; max: number } => item !== null,
  );
  const movementCounts = new Map<string, number[]>();
  windows.forEach((window, windowIndex) =>
    window.forEach((session) => {
      const ids = new Set(
        session.exerciseBlocks.flatMap((block) =>
          block.prescriptions
            .filter((item) => !item.optional)
            .flatMap(
              (item) =>
                (
                  exerciseIndexes.byId.get(item.exerciseId) ??
                  exerciseIdentities.find(
                    (exercise) => exercise.id === item.exerciseId,
                  )
                )?.movementPatternIds ?? [],
            ),
        ),
      );
      ids.forEach((id) => {
        const counts =
          movementCounts.get(id) ?? (Array(windows.length).fill(0) as number[]);
        counts[windowIndex] = (counts[windowIndex] ?? 0) + 1;
        movementCounts.set(id, counts);
      });
    }),
  );
  return {
    sessionCount: rotating ? program.trainingDaysPerWeek : sessions.length,
    estimatedWeeklyMinutes:
      sessions.length && knownMinutes.length === minutes.length
        ? {
            min: Math.min(...knownMinutes.map((item) => item.min)),
            max: Math.max(...knownMinutes.map((item) => item.max)),
          }
        : null,
    movementPatternExposure: [...movementCounts].map(
      ([movementPatternId, counts]) => ({
        movementPatternId,
        min: Math.min(...counts),
        max: Math.max(...counts),
      }),
    ),
    exerciseCount: new Set(
      sessions.flatMap((session) =>
        session.exerciseBlocks.flatMap((block) =>
          block.prescriptions.map((item) => item.exerciseId),
        ),
      ),
    ).size,
    method: rotating
      ? "Range across all possible starting positions in the rotating sequence; optional slots excluded from exposure."
      : "Required prescription slots in the listed week; optional slots excluded from exposure.",
  };
}
export function validatePrograms(
  records: readonly Program[],
  publicExerciseIds = new Set(
    [...exerciseIndexes.byId.values()]
      .filter((item) => item.contentStatus === "published")
      .map((item) => item.id),
  ),
  publicScienceIds = new Set(scienceIndexes.byId.keys()),
) {
  const errors: string[] = [],
    ids = new Set<string>(),
    slugs = new Set<string>();
  const knownPrograms = new Set(
      [...programIdentities, ...records].map((item) => item.id),
    ),
    knownExercises = new Set(exerciseIdentities.map((item) => item.id)),
    knownScience = new Set(scienceIdentities.map((item) => item.id));
  for (const program of records) {
    const add = (path: string, message: string) =>
      errors.push(`${program.id}.${path}: ${message}`);
    if (ids.has(program.id)) add("id", "Duplicate ID");
    if (slugs.has(program.slug)) add("slug", "Duplicate slug");
    ids.add(program.id);
    slugs.add(program.slug);
    if (
      !programTaxonomy.equipmentProfiles.some(
        (item) => item.id === program.equipmentProfileId,
      )
    )
      add("equipmentProfileId", "Unknown profile");
    const identity = programIdentities.find((item) => item.id === program.id);
    if (identity && identity.slug !== program.slug)
      add("slug", "Stable slug changed");
    const sourceIds = new Set(program.sources?.map((item) => item.id));
    if (sourceIds.size !== (program.sources?.length ?? 0))
      add("sources", "Duplicate source ID");
    const sessions = program.scheduleModel?.sessions ?? [],
      sessionIds = new Set(sessions.map((item) => item.id));
    if (sessionIds.size !== sessions.length)
      add("scheduleModel.sessions", "Duplicate session ID");
    const blocks = sessions.flatMap((session) => session.exerciseBlocks),
      blockIds = new Set(blocks.map((item) => item.id));
    if (blockIds.size !== blocks.length)
      add("exerciseBlocks", "Duplicate block ID");
    const progressionIds = new Set(
        program.progressionRules?.map((item) => item.id),
      ),
      substitutionIds = new Set(
        program.substitutionGroups?.map((item) => item.id),
      );
    if (progressionIds.size !== (program.progressionRules?.length ?? 0))
      add("progressionRules", "Duplicate progression ID");
    if (substitutionIds.size !== (program.substitutionGroups?.length ?? 0))
      add("substitutionGroups", "Duplicate substitution ID");
    const exerciseRef = (id: string, path: string) => {
      if (!knownExercises.has(id) && !publicExerciseIds.has(id))
        add(path, `Unknown exercise ${id}`);
      if (program.contentStatus === "published" && !publicExerciseIds.has(id))
        add(path, `Unpublished exercise ${id}`);
    };
    const scienceRef = (id: string, path: string) => {
      if (!knownScience.has(id) && !publicScienceIds.has(id))
        add(path, `Unknown science ${id}`);
      if (program.contentStatus === "published" && !publicScienceIds.has(id))
        add(path, `Unpublished science ${id}`);
    };
    function refs(value: unknown, path = "") {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach((item, index) => refs(item, `${path}.${index}`));
        return;
      }
      for (const [key, child] of Object.entries(value)) {
        if (key === "sourceIds" && Array.isArray(child))
          child.forEach((id: string) => {
            if (!sourceIds.has(id))
              add(`${path}.${key}`, `Unknown source ${id}`);
          });
        else if (key === "scienceTopicIds" && Array.isArray(child))
          child.forEach((id: string) => scienceRef(id, `${path}.${key}`));
        else refs(child, `${path}.${key}`);
      }
    }
    refs(program);
    for (const block of blocks)
      for (const prescription of block.prescriptions) {
        exerciseRef(prescription.exerciseId, block.id);
        if (!progressionIds.has(prescription.progressionRuleId))
          add(block.id, "Missing progression rule");
        if (
          prescription.substitutionGroupId &&
          !substitutionIds.has(prescription.substitutionGroupId)
        )
          add(block.id, "Missing substitution group");
      }
    for (const group of program.substitutionGroups ?? []) {
      [...group.originalExerciseIds, ...group.candidateExerciseIds].forEach(
        (id) => exerciseRef(id, group.id),
      );
      if (
        group.candidateExerciseIds.every((id) =>
          group.originalExerciseIds.includes(id),
        )
      )
        add(group.id, "Substitution needs a distinct alternative");
    }
    for (const block of program.blocks ?? [])
      for (const id of block.scheduleSessionIds)
        if (!sessionIds.has(id)) add(block.id, "Unknown schedule session");
    for (const example of program.scheduleModel?.calendarExamples ?? []) {
      if (new Set(example.days.map((day) => day.day)).size !== 7)
        add("calendarExamples", "Duplicate weekday");
      example.days.forEach((day) => {
        if (day.sessionId && !sessionIds.has(day.sessionId))
          add("calendarExamples", "Unknown session");
      });
    }
    for (const id of [
      ...(program.relatedProgramIds ?? []),
      ...(program.deprecation
        ? [program.deprecation.replacementProgramId]
        : []),
    ])
      if (!knownPrograms.has(id) || id === program.id)
        add("relatedProgramIds", "Invalid program relation");
    for (const estimate of program.weeklySummary?.muscleSetEstimates ?? [])
      if (
        !anatomyTaxonomy.records.some(
          (muscle) => muscle.id === estimate.muscleId,
        )
      )
        add("weeklySummary", "Unknown muscle");
    const summary = deriveProgramSummary(program);
    if (
      program.weeklySummary?.sessionCount != null &&
      program.weeklySummary.sessionCount !== summary.sessionCount
    )
      add(
        "weeklySummary.sessionCount",
        "Declared total conflicts with derived sessions",
      );
    if (
      program.weeklySummary?.estimatedWeeklyMinutes &&
      JSON.stringify(program.weeklySummary.estimatedWeeklyMinutes) !==
        JSON.stringify(summary.estimatedWeeklyMinutes)
    )
      add(
        "weeklySummary.estimatedWeeklyMinutes",
        "Declared time conflicts with derived sessions",
      );
    for (const exposure of program.weeklySummary?.movementPatternExposure ??
      []) {
      const actual = summary.movementPatternExposure.find(
        (item) => item.movementPatternId === exposure.movementPatternId,
      );
      if (
        !actual ||
        actual.min !== exposure.sessionCount ||
        actual.max !== exposure.sessionCount
      )
        add(
          "weeklySummary.movementPatternExposure",
          "Declared exposure conflicts with derived range",
        );
    }
  }
  return [...new Set(errors)];
}
const errors = [
  ...validatePrograms(programIdentities),
  ...validatePrograms(programRecords),
];
if (errors.length) throw new Error(errors.join("\n"));
export const publishedPrograms = programRecords.filter(
  (program) => program.contentStatus === "published",
);
export const programIndexes = {
  byId: new Map(programRecords.map((program) => [program.id, program])),
  bySlug: new Map(programRecords.map((program) => [program.slug, program])),
  search: new Map(
    publishedPrograms.map((program) => [
      program.id,
      normalizeTerm(
        [
          program.displayName,
          ...(program.aliases ?? []),
          program.primaryGoal,
          program.routineStyle,
          programTaxonomy.equipmentProfiles.find(
            (item) => item.id === program.equipmentProfileId,
          )?.displayName,
          ...(program.audience?.bestFor ?? []),
        ].join(" "),
      ),
    ]),
  ),
};
export function getProgramBySlug(slug: string) {
  const program = programIndexes.bySlug.get(slug);
  return program && ["published", "deprecated"].includes(program.contentStatus)
    ? program
    : undefined;
}
export function resolveProgramVersion(id: string, version: string) {
  return [...programRecords, ...programVersions].find(
    (program) =>
      program.id === id &&
      program.version === version &&
      program.contentStatus === "published",
  );
}
