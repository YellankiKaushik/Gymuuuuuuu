import { z } from "zod";
import { normativeProgramSchema } from "./schema.generated";
export type { Program } from "./schema.generated";
export const programGoals = normativeProgramSchema.shape.primaryGoal.options;
export const programExperiences =
  normativeProgramSchema.shape.experienceLevels.element.options;
export const programStyles = normativeProgramSchema.shape.routineStyle.options;
export const programDurations =
  normativeProgramSchema.shape.durationMode.options;
export const programEnvironments = [
  "gym",
  "home",
  "outdoors",
  "travel",
  "limited-space",
  "mixed",
] as const;
export const programSchema = normativeProgramSchema.superRefine(
  (program, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: "custom", path, message });
    function ranges(value: unknown, path: (string | number)[]) {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        value.forEach((item, index) => ranges(item, [...path, index]));
        return;
      }
      const record = value as Record<string, unknown>;
      if (
        typeof record.min === "number" &&
        typeof record.max === "number" &&
        record.min > record.max
      )
        issue(path, "Minimum exceeds maximum");
      Object.entries(record).forEach(([key, child]) =>
        ranges(child, [...path, key]),
      );
    }
    ranges(program, []);
    if (program.contentStatus === "deprecated" && !program.deprecation)
      issue(["deprecation"], "Replacement and migration note required");
    if (program.contentStatus !== "published") return;
    for (const key of [
      "sessionDurationMinutes",
      "summary",
      "outcomesAndLimits",
      "audience",
      "scheduleModel",
      "safety",
      "review",
      "updatedAt",
    ] as const)
      if (!program[key])
        issue([key], "Non-null reviewed content required for publication");
    if (program.durationMode === "fixed-weeks" && !program.durationWeeks)
      issue(["durationWeeks"], "Fixed-week duration required");
    if (
      program.scheduleModel &&
      ["fixed-week", "flexible-week"].includes(program.scheduleModel.mode) &&
      program.scheduleModel.sessions.length !== program.trainingDaysPerWeek
    )
      issue(
        ["trainingDaysPerWeek"],
        "Session count conflicts with the weekly schedule",
      );
    program.progressionRules?.forEach((rule, index) => {
      if (!rule.ceiling?.length || !rule.floor?.length)
        issue(
          ["progressionRules", index],
          "Progression needs ceiling and regression boundaries",
        );
    });
    program.scheduleModel?.sessions.forEach((session, sessionIndex) =>
      session.exerciseBlocks.forEach((block, blockIndex) =>
        block.prescriptions.forEach((prescription, index) => {
          const path = [
            "scheduleModel",
            "sessions",
            sessionIndex,
            "exerciseBlocks",
            blockIndex,
            "prescriptions",
            index,
          ];
          if (!prescription.sets.min)
            issue(
              [...path, "sets"],
              "Usable prescriptions require at least one set",
            );
          if (
            ["repetitions", "seconds", "distance"].includes(
              prescription.repetitionTarget.type,
            ) &&
            !prescription.repetitionTarget.range
          )
            issue([...path, "repetitionTarget"], "Numeric target needs range");
          if (
            prescription.repetitionTarget.type === "distance" &&
            !prescription.repetitionTarget.unit
          )
            issue(
              [...path, "repetitionTarget", "unit"],
              "Distance unit required",
            );
          if (
            prescription.repetitionTarget.type === "amrap-capped" &&
            !prescription.repetitionTarget.cap
          )
            issue([...path, "repetitionTarget", "cap"], "AMRAP cap required");
          const effort = prescription.effortTarget;
          if (typeof effort.target !== "string") {
            const max =
              effort.method === "rir" || effort.method === "rpe"
                ? 10
                : effort.method === "percent-1rm"
                  ? 100
                  : undefined;
            const min = effort.method === "rpe" ? 1 : 0;
            if (
              max !== undefined &&
              (effort.target.min < min || effort.target.max > max)
            )
              issue(
                [...path, "effortTarget"],
                "Effort target outside method scale",
              );
          }
        }),
      ),
    );
  },
);
export const weekdays = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export const localProgramInstanceSchema = z
  .strictObject({
    instanceId: z.string().min(1),
    canonicalProgramId: z.string().regex(/^program_[a-z0-9_]+$/),
    canonicalProgramVersion: z.string().regex(/^\d+\.\d+\.\d+$/),
    selectedAt: z.iso.datetime(),
    startDate: z.iso.date().nullable(),
    preferredWeekdays: z.record(z.string(), z.enum(weekdays)),
    substitutionSelections: z.record(
      z.string(),
      z.string().regex(/^exercise_[a-z0-9_]+$/),
    ),
    status: z.enum(["planned", "active", "paused", "completed", "archived"]),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .refine(
    (instance) => instance.updatedAt >= instance.createdAt,
    "Invalid instance timestamps",
  );
export type LocalProgramInstance = z.infer<typeof localProgramInstanceSchema>;
