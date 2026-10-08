import { createHash } from "node:crypto";
import { z } from "zod";
import type { Exercise } from "../../src/features/exercises/schema";
import { verifiedSourceSchema } from "../../src/features/content-review/schema";

const bindingSchema = z.array(
  z.strictObject({
    exerciseId: z.string().regex(/^exercise_[a-z0-9_]+$/),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    mediaId: z.string().min(1),
    url: z.string().regex(/^\/media\/[a-z0-9-]+\.svg$/),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    sourceId: z.string().min(1),
  }),
);
export function verifyExerciseMediaBindings(
  input: unknown,
  exercises: readonly Exercise[],
  sourceInput: unknown,
  readAsset: (url: string) => Uint8Array,
) {
  const bindings = bindingSchema.parse(input);
  const sources = verifiedSourceSchema.array().parse(sourceInput);
  const media = exercises
    .filter((r) => r.contentStatus === "published")
    .flatMap((r) => (r.media ?? []).map((m) => ({ exercise: r, media: m })));
  if (
    bindings.length !== media.length ||
    new Set(bindings.map((b) => `${b.exerciseId}@${b.version}:${b.mediaId}`))
      .size !== bindings.length
  )
    throw Error(
      "Media bindings must match the entire published media version set.",
    );
  for (const binding of bindings) {
    const item = media.find(
      ({ exercise, media: m }) =>
        exercise.id === binding.exerciseId &&
        exercise.version === binding.version &&
        m.id === binding.mediaId,
    );
    const source = sources.find((s) => s.id === binding.sourceId);
    if (
      !item ||
      item.media.url !== binding.url ||
      item.media.kind !== "diagram" ||
      item.media.reviewStatus !== "reviewed" ||
      !item.media.alt ||
      !item.media.credit ||
      !item.media.license ||
      source?.reuse !== "original_work" ||
      source.evidenceType !== "original_repository_work"
    )
      throw Error(
        "Media identity, attribution or original source binding is unresolved.",
      );
    const bytes = readAsset(binding.url);
    const text = new TextDecoder().decode(bytes);
    if (
      createHash("sha256").update(bytes).digest("hex") !== binding.sha256 ||
      !text.includes("<svg") ||
      /<script|<image|(?:href|src)=["'](?:https?:|data:|javascript:)/i.test(
        text,
      )
    )
      throw Error("Media asset hash or repository SVG boundary failed.");
  }
  return bindings;
}
