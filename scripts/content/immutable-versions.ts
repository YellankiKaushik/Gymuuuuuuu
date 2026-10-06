import { createHash } from "node:crypto";
import { z } from "zod";

const pinsSchema = z
  .array(
    z.strictObject({
      id: z.string().min(1),
      sha256: z.string().regex(/^[a-f0-9]{64}$/),
    }),
  )
  .refine(
    (pins) => new Set(pins.map((pin) => pin.id)).size === pins.length,
    "Duplicate immutable version pins",
  );

/** Validate before writes; a changed published snapshot requires a new version. */
export function validateImmutableVersions(
  records: readonly { id: string }[],
  inputPins: unknown,
) {
  const pins = pinsSchema.parse(inputPins);
  const byId = new Map(records.map((record) => [record.id, record]));
  if (byId.size !== records.length)
    throw Error("Duplicate published version IDs");
  for (const pin of pins) {
    const record = byId.get(pin.id);
    if (!record) throw Error(`Missing immutable publication ${pin.id}`);
    const digest = createHash("sha256")
      .update(JSON.stringify(record))
      .digest("hex");
    if (digest !== pin.sha256)
      throw Error(
        `Immutable publication changed: ${pin.id}. Publish a new reviewed version.`,
      );
  }
  if (pins.length !== records.length)
    throw Error("New publication requires an explicit reviewed version pin");
}
