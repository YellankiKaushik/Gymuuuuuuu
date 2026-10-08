import { expect, it } from "vitest";
import { validateSanitizedImage } from "../src/features/data-management/image-validation";

it("rejects JPEG EXIF, PNG text/EXIF and WebP metadata without decoding or saving", () => {
  const jpeg = new Uint8Array([
    255, 216, 255, 225, 0, 8, 69, 120, 105, 102, 0, 0, 255, 217,
  ]);
  expect(() => validateSanitizedImage(jpeg, "image/jpeg")).toThrow("metadata");
  for (const type of ["eXIf", "tEXt", "iTXt", "zTXt"]) {
    const png = new Uint8Array([
      137,
      80,
      78,
      71,
      13,
      10,
      26,
      10,
      0,
      0,
      0,
      0,
      ...new TextEncoder().encode(type),
      0,
      0,
      0,
      0,
    ]);
    expect(() => validateSanitizedImage(png, "image/png")).toThrow("metadata");
  }
  for (const type of ["EXIF", "XMP "]) {
    const webp = new Uint8Array([
      ...new TextEncoder().encode("RIFF"),
      12,
      0,
      0,
      0,
      ...new TextEncoder().encode(`WEBP${type}`),
      0,
      0,
      0,
      0,
    ]);
    expect(() => validateSanitizedImage(webp, "image/webp")).toThrow(
      "metadata",
    );
  }
});

it("rejects malformed lengths, unsupported MIME and truncated image headers", () => {
  for (const mime of [
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/svg+xml",
  ]) {
    expect(() =>
      validateSanitizedImage(new Uint8Array([1, 2, 3]), mime),
    ).toThrow();
  }
  expect(() =>
    validateSanitizedImage(
      new Uint8Array([255, 216, 255, 224, 255, 255]),
      "image/jpeg",
    ),
  ).toThrow("Malformed");
});
