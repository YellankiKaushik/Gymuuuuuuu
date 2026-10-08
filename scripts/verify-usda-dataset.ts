import { readFileSync } from "node:fs";
import { z } from "zod";
import {
  datasetDescriptorSchema,
  verifySelectedAgainstDataset,
} from "./content/usda-dataset";
const [sourceId, path] = process.argv.slice(2);
if (!sourceId || !path)
  throw Error(
    "Usage: tsx scripts/verify-usda-dataset.ts SOURCE_ID EXTRACTED_JSON_PATH (the SHA-256 pins the JSON payload, not the ZIP container).",
  );
const read = (file: string): unknown => JSON.parse(readFileSync(file, "utf8"));
const descriptors = datasetDescriptorSchema
  .array()
  .parse(read("src/content/provenance/sources.json"));
const descriptor = descriptors.find((row) => row.sourceId === sourceId);
if (!descriptor) throw Error("Unknown approved USDA dataset.");
const selected = z
  .unknown()
  .array()
  .parse(read("src/content/provenance/usda-selected.json"));
const mappings = z
  .unknown()
  .array()
  .parse(read("src/content/provenance/food-mappings.json"));
console.log(
  JSON.stringify(
    verifySelectedAgainstDataset(
      readFileSync(path),
      descriptor,
      selected,
      mappings,
    ),
  ),
);
