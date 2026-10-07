import { z } from "zod";

/** Reuse only fully validated, recursively frozen objects owned by this schema.
 * JSON restores and structured clones always take the complete validation path.
 * Weak references cannot retain personal snapshots after their owners release them.
 */
export function immutableSnapshotSchema<T>(schema: z.ZodType<T>) {
  const owned = new WeakSet<object>();
  function freeze(value: unknown): void {
    if (!value || typeof value !== "object") return;
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return z.union([
    z.custom<T>(
      (value) => !!value && typeof value === "object" && owned.has(value),
    ),
    schema.transform((value) => {
      freeze(value);
      if (value && typeof value === "object") owned.add(value);
      return value;
    }),
  ]);
}
