/** Bound untrusted object traversal before recursive validation, hashing or decoding. */
export function validateInputBounds(input: unknown): void {
  const pending: { value: unknown; depth: number }[] = [
    { value: input, depth: 0 },
  ];
  let nodes = 0;
  while (pending.length) {
    const { value, depth } = pending.pop()!;
    if (++nodes > 12_000_000) throw Error("Backup contains too many values.");
    if (depth > 64) throw Error("Backup nesting exceeds the supported limit.");
    if (typeof value === "number" && !Number.isFinite(value))
      throw Error("Backup contains a non-finite number.");
    if (typeof value === "string" && value.length > 3_000_000)
      throw Error("Backup contains an oversized string.");
    if (!value || typeof value !== "object") continue;
    for (const item of Object.values(value))
      pending.push({ value: item, depth: depth + 1 });
  }
}
