import { z } from "zod";
import { verifiedSourceSchema } from "../../src/features/content-review/schema";
import type { Program } from "../../src/features/programs/schema";

const schema = z.array(
  z.strictObject({
    programId: z.string().regex(/^program_[a-z0-9_]+$/),
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    arrangementSourceId: z.string().min(1),
    frameworkSourceIds: z.array(z.string().min(1)).min(1),
  }),
);
export function verifyProgramSourceBindings(
  input: unknown,
  programs: readonly Program[],
  sourceInput: unknown,
) {
  const bindings = schema.parse(input);
  const sources = verifiedSourceSchema.array().parse(sourceInput);
  if (
    new Set(bindings.map((b) => `${b.programId}@${b.version}`)).size !==
      bindings.length ||
    bindings.length !== programs.length
  )
    throw Error(
      "Program source bindings must match the entire published version set.",
    );
  for (const binding of bindings) {
    const program = programs.find(
      (p) => p.id === binding.programId && p.version === binding.version,
    );
    const arrangement = sources.find(
      (s) => s.id === binding.arrangementSourceId,
    );
    if (
      !program ||
      arrangement?.reuse !== "original_work" ||
      arrangement.evidenceType !== "original_repository_work" ||
      new Set(binding.frameworkSourceIds).size !==
        binding.frameworkSourceIds.length
    )
      throw Error(
        "Program arrangement binding is missing, duplicated or unverified.",
      );
    const frameworks = binding.frameworkSourceIds.map((id) =>
      sources.find((s) => s.id === id),
    );
    if (
      frameworks.some(
        (s) =>
          !s ||
          s.reuse === "blocked" ||
          s.reuse === "original_work" ||
          !program.sources?.some((ref) => ref.url === s.url),
      ) ||
      program.sources?.some(
        (ref) => !frameworks.some((s) => s?.url === ref.url),
      )
    )
      throw Error(
        "Program framework binding does not resolve its exact approved source URLs.",
      );
  }
  return bindings;
}
