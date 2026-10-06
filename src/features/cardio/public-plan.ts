import { z } from "zod";

const segment = z.strictObject({
  kind: z.enum(["warm_up", "run", "walk", "cool_down"]),
  seconds: z.number().int().positive().max(7200),
});
export const publicPlanSchema = z
  .strictObject({
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    sourceId: z.string().min(1),
    sourceUrl: z.url(),
    sourceHtmlSha256: z.string().regex(/^[a-f0-9]{64}$/),
    extractedAt: z.iso.datetime({ offset: true }),
    sourceDate: z.iso.date().nullable(),
    goal: z.string().min(1),
    experience: z.enum(["beginner", "intermediate"]),
    durationWeeks: z.number().int().min(1).max(52),
    sessionsPerWeek: z.number().int().min(1).max(7),
    minimumRestDaysBetweenRuns: z.number().int().min(1),
    equipment: z.array(z.string().min(1)).min(1),
    intensity: z.strictObject({
      method: z.literal("manual_text"),
      methodVersion: z.string().min(1),
      instruction: z.string().min(1),
    }),
    progression: z.string().min(1),
    regression: z.string().min(1),
    attribution: z.string().min(1),
    licenceUrl: z.url(),
    sessions: z
      .array(
        z.strictObject({
          week: z.number().int().positive(),
          run: z.number().int().positive(),
          totalSeconds: z.number().int().positive(),
          segments: z.array(segment).min(3).max(100),
        }),
      )
      .min(1)
      .max(364),
  })
  .superRefine((plan, ctx) => {
    const keys = new Set<string>();
    for (const [index, session] of plan.sessions.entries()) {
      const key = `${session.week}:${session.run}`;
      if (
        keys.has(key) ||
        session.week > plan.durationWeeks ||
        session.run > plan.sessionsPerWeek
      )
        ctx.addIssue({
          code: "custom",
          path: ["sessions", index],
          message: "Duplicate or out-of-range source session.",
        });
      keys.add(key);
      if (
        session.segments[0]?.kind !== "warm_up" ||
        session.segments.at(-1)?.kind !== "cool_down"
      )
        ctx.addIssue({
          code: "custom",
          path: ["sessions", index],
          message: "Source warm-up and cooldown must remain explicit.",
        });
      if (
        session.segments.reduce((sum, part) => sum + part.seconds, 0) !==
        session.totalSeconds
      )
        ctx.addIssue({
          code: "custom",
          path: ["sessions", index, "totalSeconds"],
          message: "Source session total differs from its intervals.",
        });
    }
    if (keys.size !== plan.durationWeeks * plan.sessionsPerWeek)
      ctx.addIssue({
        code: "custom",
        path: ["sessions"],
        message: "Every source week and run must be present.",
      });
  });
export type PublicCardioPlan = z.infer<typeof publicPlanSchema>;
