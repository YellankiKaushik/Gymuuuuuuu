import { z } from "zod";
import {
  normativeProgramSchema,
  normativeProgramObjectSchema,
  validateProgramConditionals,
} from "./schema.generated";
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
const schedule = normativeProgramObjectSchema.shape.scheduleModel
  .unwrap()
  .unwrap();
const session = schedule.shape.sessions.element;
const block = session.shape.exerciseBlocks.element;
const prescription = block.shape.prescriptions.element;
const sourceRestPrescription = prescription
  .extend({
    restSeconds: prescription.shape.restSeconds.nullable(),
    restGuidance: z
      .strictObject({
        status: z.literal("source_unspecified"),
        text: z.string().min(20),
        sourceIds: z.array(z.string().regex(/^source_[a-z0-9_]+$/)).min(1),
      })
      .optional(),
  })
  .superRefine((item, ctx) => {
    if (item.restSeconds === null && !item.restGuidance)
      ctx.addIssue({
        code: "custom",
        path: ["restGuidance"],
        message: "Unspecified timed rest requires explicit source context",
      });
    if (item.restSeconds !== null && item.restGuidance)
      ctx.addIssue({
        code: "custom",
        path: ["restGuidance"],
        message:
          "Unspecified-rest context cannot accompany a numeric prescription",
      });
  });
const sourceRestSchedule = schedule.extend({
  sessions: z
    .array(
      session.extend({
        estimatedDurationMinutes:
          session.shape.estimatedDurationMinutes.nullable(),
        exerciseBlocks: z
          .array(
            block.extend({
              prescriptions: z.array(sourceRestPrescription).min(1),
            }),
          )
          .min(1),
      }),
    )
    .min(1),
});
export const programSchema = normativeProgramObjectSchema
  .extend({
    scheduleModel: sourceRestSchedule.nullable().optional(),
    timeContext: z
      .strictObject({
        method: z.enum(["source_guideline_allocation", "source_unspecified"]),
        explanation: z.string().min(30),
        sourceIds: z.array(z.string().regex(/^source_[a-z0-9_]+$/)).min(1),
      })
      .optional(),
  })
  .superRefine(validateProgramConditionals)
  .superRefine((program, ctx) => {
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
    const sessions = program.scheduleModel?.sessions ?? [];
    if (program.timeContext?.method === "source_unspecified") {
      if (
        program.sessionDurationMinutes !== null ||
        sessions.some((session) => session.estimatedDurationMinutes !== null)
      )
        issue(
          ["timeContext"],
          "Unspecified duration requires explicit null for every duration; it cannot accompany numeric estimates",
        );
    } else {
      if (
        !program.sessionDurationMinutes ||
        sessions.some((session) => session.estimatedDurationMinutes === null)
      )
        issue(
          ["sessionDurationMinutes"],
          "Unknown duration requires explicit source-unspecified provenance",
        );
      if (
        program.timeContext?.method === "source_guideline_allocation" &&
        sessions.some(
          (session) =>
            session.estimatedDurationMinutes?.min !==
              program.sessionDurationMinutes?.min ||
            session.estimatedDurationMinutes?.max !==
              program.sessionDurationMinutes?.max,
        )
      )
        issue(
          ["timeContext"],
          "Source time allocation must match each session; it is not an observed completion estimate",
        );
    }
  });
export type Program = z.infer<typeof programSchema>;
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
