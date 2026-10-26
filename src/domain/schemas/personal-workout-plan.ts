import { z } from "zod";
import { pilotExerciseIds } from "../../features/visual-training/scope";

export const personalPlanEntrySchema = z.strictObject({
  id: z.string().regex(/^plan_entry_[a-z0-9_-]+$/),
  exerciseId: z.enum(pilotExerciseIds),
  sets: z.number().int().min(1).max(100).nullable(),
  repetitions: z.number().int().min(1).max(10000).nullable(),
  restSeconds: z.number().int().min(0).max(86400).nullable(),
});
export const personalPlanSchema = z
  .strictObject({
    id: z.string().regex(/^personal_plan_[a-z0-9_-]+$/),
    module: z.literal("plans"),
    schemaVersion: z.literal(1),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    payload: z.strictObject({
      kind: z.literal("personal-workout-plan"),
      version: z.literal(1),
      revision: z.number().int().positive(),
      name: z
        .string()
        .min(1, "Name the plan before saving.")
        .max(120)
        .refine(
          (value) => value.trim() === value,
          "Remove surrounding spaces from the plan name.",
        ),
      sessions: z
        .array(
          z.strictObject({
            id: z.enum(["A", "B"]),
            entries: z.array(personalPlanEntrySchema).max(6),
          }),
        )
        .min(1)
        .max(2),
    }),
  })
  .superRefine((plan, ctx) => {
    if (Date.parse(plan.updatedAt) < Date.parse(plan.createdAt))
      ctx.addIssue({ code: "custom", message: "Invalid timestamp order." });
    if (
      plan.payload.sessions[0]?.id !== "A" ||
      (plan.payload.sessions[1] && plan.payload.sessions[1].id !== "B")
    )
      ctx.addIssue({
        code: "custom",
        message: "Use Session A and optionally Session B.",
      });
    const ids = plan.payload.sessions.flatMap((s) =>
      s.entries.map((e) => e.id),
    );
    if (new Set(ids).size !== ids.length)
      ctx.addIssue({ code: "custom", message: "Duplicate entry IDs." });
    for (const s of plan.payload.sessions)
      if (new Set(s.entries.map((e) => e.exerciseId)).size !== s.entries.length)
        ctx.addIssue({
          code: "custom",
          message: "An exercise may appear once per session.",
        });
  });
export type PersonalPlan = z.infer<typeof personalPlanSchema>;
export type PersonalPlanEntry = z.infer<typeof personalPlanEntrySchema>;
