import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
/** Only a canonical public slug is accepted; personal storage is never read. */
export const loadPublicScienceTopic = createServerFn({ method: "GET" })
  .validator(
    z.strictObject({
      slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(160),
    }),
  )
  .handler(async ({ data }) => {
    const { getScienceBySlug } = await import("./repository");
    return getScienceBySlug(data.slug) ?? null;
  });
