import { expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { exerciseMediaSchema } from "../src/features/exercises/schema";
import { getPublishedExercises } from "../src/features/exercises/repository";
import { reviewedEmbedUrl } from "../src/features/exercises/media";
it("publishes only a safe attributed local SVG with accessible text", () => {
  const media = getPublishedExercises()[0]!.media![0]!;
  expect(exerciseMediaSchema.safeParse(media).success).toBe(true);
  expect(reviewedEmbedUrl(media)).toBeUndefined();
  expect(readFileSync(`public${media.url}`, "utf8")).toContain("<title");
  for (const change of [
    { url: "/media/../secret.svg" },
    { url: "/media/image.svg?remote=1" },
    { alt: null },
    { kind: "video" },
    { url: "javascript:alert(1)" },
    { url: "invalid-url" },
  ])
    expect(exerciseMediaSchema.safeParse({ ...media, ...change }).success).toBe(
      false,
    );
});
