/** Reject original metadata in an imported image; never infer anything about its subject. */
export function validateSanitizedImage(bytes: Uint8Array, mime: string): void {
  const ascii = (offset: number, size: number) =>
    String.fromCharCode(...bytes.slice(offset, offset + size));
  if (mime === "image/jpeg") {
    if (bytes[0] !== 0xff || bytes[1] !== 0xd8)
      throw Error("Invalid JPEG image.");
    let offset = 2;
    while (offset < bytes.length) {
      if (bytes[offset++] !== 0xff) throw Error("Malformed JPEG image.");
      while (bytes[offset] === 0xff) offset++;
      const marker = bytes[offset++];
      if (marker === 0xda || marker === 0xd9) return;
      if (marker === undefined) break;
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      const size = (bytes[offset]! << 8) | bytes[offset + 1]!;
      if (size < 2 || offset + size > bytes.length)
        throw Error("Malformed JPEG segment.");
      if (marker === 0xe1 || marker === 0xed || marker === 0xfe)
        throw Error(
          "Image contains original metadata. Import a sanitized copy.",
        );
      offset += size;
    }
    throw Error("Incomplete JPEG image.");
  }
  if (mime === "image/png") {
    if (
      ascii(1, 3) !== "PNG" ||
      bytes[0] !== 137 ||
      bytes[4] !== 13 ||
      bytes[5] !== 10 ||
      bytes[6] !== 26 ||
      bytes[7] !== 10
    )
      throw Error("Invalid PNG image.");
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    let offset = 8;
    while (offset + 12 <= bytes.length) {
      const size = view.getUint32(offset),
        type = ascii(offset + 4, 4);
      if (["eXIf", "tEXt", "zTXt", "iTXt"].includes(type))
        throw Error(
          "Image contains original metadata. Import a sanitized copy.",
        );
      offset += size + 12;
      if (offset > bytes.length) throw Error("Malformed PNG chunk.");
      if (type === "IEND") return;
    }
    throw Error("Incomplete PNG image.");
  }
  if (mime === "image/webp") {
    if (ascii(0, 4) !== "RIFF" || ascii(8, 4) !== "WEBP")
      throw Error("Invalid WebP image.");
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (view.getUint32(4, true) + 8 !== bytes.length)
      throw Error("Malformed WebP size.");
    let offset = 12;
    while (offset + 8 <= bytes.length) {
      const type = ascii(offset, 4),
        size = view.getUint32(offset + 4, true);
      if (["EXIF", "XMP "].includes(type))
        throw Error(
          "Image contains original metadata. Import a sanitized copy.",
        );
      offset += 8 + size + (size % 2);
    }
    if (offset !== bytes.length) throw Error("Malformed WebP chunk.");
    return;
  }
  throw Error("Unsupported image type.");
}

export async function validatePhotoBlob(
  blob: Blob,
  metadata: {
    mime: string;
    width: number;
    height: number;
    sha256: string | null;
  },
): Promise<void> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  validateSanitizedImage(bytes, blob.type);
  if (blob.type !== metadata.mime)
    throw Error("Photo MIME does not match its metadata.");
  const hash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
  if (hash !== metadata.sha256)
    throw Error("Photo checksum does not match its metadata.");
  const url = URL.createObjectURL(blob);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    if (
      image.naturalWidth !== metadata.width ||
      image.naturalHeight !== metadata.height ||
      image.naturalWidth * image.naturalHeight > 20_000_000
    )
      throw Error("Photo dimensions do not match the bounded sanitized copy.");
  } finally {
    URL.revokeObjectURL(url);
  }
}
