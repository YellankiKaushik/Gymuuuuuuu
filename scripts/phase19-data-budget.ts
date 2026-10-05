import { readdir, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const directory = join(process.cwd(), ".output/public/assets");
const files = (await readdir(directory)).filter((file) =>
  file.endsWith(".json"),
);
if (!files.length)
  throw Error(
    "No public JSON assets found. Build before checking the data budget.",
  );
const assets = await Promise.all(
  files.map(async (file) => {
    const data = await readFile(join(directory, file));
    return { file, raw: data.byteLength, gzip: gzipSync(data).byteLength };
  }),
);
const total = assets.reduce((sum, asset) => sum + asset.gzip, 0);
for (const asset of assets) {
  if (asset.raw > 1024 * 1024 || asset.gzip > 64 * 1024)
    throw Error(
      `Public data shard exceeds its 1 MiB raw / 64 KiB gzip budget: ${asset.file}`,
    );
}
if (total > 512 * 1024)
  throw Error("Public JSON exceeds the 512 KiB aggregate gzip budget.");
console.log(
  `Public data: ${assets.length} lazy JSON assets; ${total} bytes gzip total; largest ${Math.max(...assets.map((a) => a.gzip))} bytes gzip. No JavaScript budget was increased.`,
);
