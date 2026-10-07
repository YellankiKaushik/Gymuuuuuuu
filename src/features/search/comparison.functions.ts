import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { comparisonFamilies } from "../saved/schema";
import { searchEntityTypes } from "./domain";
/** The input contains only public catalogue identifiers; no saved names, versions or records. */
export const loadPublicComparison = createServerFn({ method: "GET" })
  .validator(
    z.strictObject({
      family: z.enum(comparisonFamilies),
      entities: z
        .array(
          z.strictObject({
            entityType: z.enum(searchEntityTypes),
            entityId: z
              .string()
              .regex(/^[a-z0-9_]+$/)
              .max(180),
          }),
        )
        .min(1)
        .max(4),
    }),
  )
  .handler(async ({ data }) => {
    const { resolvePublicComparison } =
      await import("./comparison-public.server");
    return resolvePublicComparison(data);
  });
