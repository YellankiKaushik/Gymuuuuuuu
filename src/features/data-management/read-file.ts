export const maximumBackupBytes = 100 * 1024 * 1024;

/** Bound both the selected file and decompressed bytes before JSON parsing. */
export async function readBackupFile(file: File): Promise<string> {
  if (file.size > maximumBackupBytes)
    throw Error(
      "Backup exceeds the 100 MiB import limit. Export selected modules instead.",
    );
  if (!file.name.endsWith(".gz")) {
    const text = await file.text();
    if (new TextEncoder().encode(text).byteLength > maximumBackupBytes)
      throw Error("Backup exceeds the 100 MiB import limit.");
    return text;
  }
  if (typeof DecompressionStream === "undefined")
    throw Error("Gzip is unavailable. Use an uncompressed JSON backup.");
  const reader = file
    .stream()
    .pipeThrough(new DecompressionStream("gzip"))
    .getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const next = await reader.read();
      if (next.done) break;
      total += next.value.byteLength;
      if (total > maximumBackupBytes) {
        await reader.cancel();
        throw Error("Decompressed backup exceeds the 100 MiB import limit.");
      }
      chunks.push(next.value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}
