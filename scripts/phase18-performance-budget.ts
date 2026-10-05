import { readdir, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const assetDirectory = join(process.cwd(), ".output/public/assets");
const jsAssets = (await readdir(assetDirectory)).filter((name) =>
  name.endsWith(".js"),
);
if (jsAssets.length === 0)
  throw new Error("No built JavaScript assets found. Run npm run build first.");

const measurements = await Promise.all(
  jsAssets.map(async (name) => {
    const contents = await readFile(join(assetDirectory, name));
    return {
      name,
      raw: contents.byteLength,
      gzip: gzipSync(contents).byteLength,
    };
  }),
);
const totalGzip = measurements.reduce((total, asset) => total + asset.gzip, 0);
const largest = [...measurements].sort(
  (left, right) => right.gzip - left.gzip,
)[0]!;
const totalLimit = 700 * 1024;
const chunkLimit = 200 * 1024;

console.log(
  `Browser JavaScript: ${measurements.length} assets, ${totalGzip} bytes gzip total; largest ${largest.name}: ${largest.gzip} bytes gzip.`,
);
if (totalGzip > totalLimit)
  throw new Error(
    `Total browser JavaScript exceeds the approved ${totalLimit}-byte gzip budget.`,
  );
if (largest.gzip > chunkLimit)
  throw new Error(
    `Largest browser JavaScript asset exceeds the ${chunkLimit}-byte gzip budget.`,
  );
