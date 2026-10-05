import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
// GET reads immutable public release data only; input is a canonical public slug.
export const loadPublicRecipeSummaries = createServerFn({
  method: "GET",
}).handler(async () => {
  const { publicRecipeSummaries } = await import("./public-records");
  return publicRecipeSummaries();
});
export const loadPublicRecipe = createServerFn({ method: "GET" })
  .validator(
    z.object({
      slug: z
        .string()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
        .max(160),
    }),
  )
  .handler(async ({ data }) => {
    const { publicRecipes } = await import("./public-records");
    return publicRecipes.find((r) => r.slug === data.slug) ?? null;
  });
