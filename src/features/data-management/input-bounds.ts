/** Bound untrusted object traversal before recursive validation, hashing or decoding. */
export function validateInputBounds(input: unknown): void {
  function* children(value: object): Generator<unknown> {
    if (Array.isArray(value)) {
      yield* value;
    } else {
      for (const key in value)
        if (Object.hasOwn(value, key)) yield Reflect.get(value, key);
    }
  }
  const pending: { values: Iterator<unknown>; depth: number }[] = [
    { values: [input].values(), depth: 0 },
  ];
  let nodes = 0;
  while (pending.length) {
    const frame = pending[pending.length - 1]!;
    const next = frame.values.next();
    if (next.done) {
      pending.pop();
      continue;
    }
    const value = next.value,
      depth = frame.depth;
    if (++nodes > 12_000_000) throw Error("Backup contains too many values.");
    if (depth > 64) throw Error("Backup nesting exceeds the supported limit.");
    if (typeof value === "number" && !Number.isFinite(value))
      throw Error("Backup contains a non-finite number.");
    if (typeof value === "string" && value.length > 3_000_000)
      throw Error("Backup contains an oversized string.");
    if (!value || typeof value !== "object") continue;
    pending.push({ values: children(value), depth: depth + 1 });
  }
}
