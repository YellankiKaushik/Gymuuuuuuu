/** Verify the selected type against magic bytes before asking the browser to decode it. */
export async function validatePhotoInput(file: File): Promise<void> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw Error("Choose a JPEG, PNG, or WebP image.");
  if (file.size === 0 || file.size > 10 * 1024 * 1024)
    throw Error("Choose an image no larger than 10 MiB.");
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const text = (start: number, end: number) =>
    String.fromCharCode(...bytes.slice(start, end));
  const matches =
    file.type === "image/jpeg"
      ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      : file.type === "image/png"
        ? [137, 80, 78, 71, 13, 10, 26, 10].every(
            (byte, index) => bytes[index] === byte,
          )
        : text(0, 4) === "RIFF" && text(8, 12) === "WEBP";
  if (!matches)
    throw Error("Image signature does not match the selected MIME type.");
}
