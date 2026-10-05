import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { buildPublicSearchDocuments } from "../src/features/search/public-sources";
import { tokenizeSearchText } from "../src/features/search/domain";
import {
  indexSchemaVersion,
  normalizationVersion,
  rankingVersion,
  searchAdapterVersion,
  searchManifestSchema,
  serializedIndexSchema,
} from "../src/features/search/index-format";
import { searchEntityTypes } from "../src/features/search/domain";

const digest = async (value: string) =>
  createHash("sha256").update(value).digest("hex");
const documents = await buildPublicSearchDocuments(digest),
  postings = new Map<string, number[]>();
for (let position = 0; position < documents.length; position++) {
  const document = documents[position]!;
  const tokens = new Set(
    tokenizeSearchText(
      [
        document.title,
        ...document.aliases,
        ...document.keywords,
        document.summary,
        ...document.headings,
        document.searchableBody,
      ].join(" "),
    ),
  );
  for (const token of tokens) {
    const positions = postings.get(token) ?? [];
    positions.push(position);
    postings.set(token, positions);
  }
}
const index = serializedIndexSchema.parse({
  schemaVersion: indexSchemaVersion,
  documentIds: documents.map((item) => item.documentId),
  postings: Object.fromEntries(
    [...postings].sort(([left], [right]) => left.localeCompare(right)),
  ),
});
const documentJson = JSON.stringify(documents),
  indexJson = JSON.stringify(index),
  canonicalDocumentHash = await digest(documentJson),
  indexHash = await digest(indexJson),
  indexVersion = await digest(
    `${canonicalDocumentHash}|${searchAdapterVersion}|${normalizationVersion}|${rankingVersion}`,
  );
const countsByEntityType = Object.fromEntries(
  searchEntityTypes.map((type) => [
    type,
    documents.filter((item) => item.entityType === type).length,
  ]),
) as Record<(typeof searchEntityTypes)[number], number>;
const manifestPath = new URL(
  "search-manifest.json",
  new URL("../src/data/search/", import.meta.url),
);
let previousManifest: { indexVersion?: string; builtAt?: string } | undefined;
try {
  previousManifest = JSON.parse(await readFile(manifestPath, "utf8"));
} catch {
  previousManifest = undefined;
}
const builtAt =
  previousManifest?.indexVersion === indexVersion && previousManifest.builtAt
    ? previousManifest.builtAt
    : process.env.SOURCE_DATE_EPOCH
      ? new Date(Number(process.env.SOURCE_DATE_EPOCH) * 1000).toISOString()
      : new Date(
          execFileSync("git", ["log", "-1", "--format=%cI"], {
            encoding: "utf8",
          }).trim(),
        ).toISOString();
const manifest = searchManifestSchema.parse({
  schemaVersion: indexSchemaVersion,
  adapterVersion: searchAdapterVersion,
  normalizationVersion,
  rankingVersion,
  canonicalDocumentHash,
  indexHash,
  indexVersion,
  documentCount: documents.length,
  countsByEntityType,
  builtAt,
  locale: "en",
});
const folder = new URL("../src/data/search/", import.meta.url);
await mkdir(folder, { recursive: true });
await Promise.all([
  writeFile(
    new URL("search-documents.public.json", folder),
    `${JSON.stringify(documents, null, 2)}\n`,
    "utf8",
  ),
  writeFile(
    new URL("search-index.public.json", folder),
    `${JSON.stringify(index, null, 2)}\n`,
    "utf8",
  ),
  writeFile(
    new URL("search-manifest.json", folder),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  ),
]);
console.log(
  `Local search index built: ${documents.length} documents; ${postings.size} tokens; version ${indexVersion}`,
);
console.log(
  `Published factual documents: ${documents.filter((item) => item.entityType !== "route" && item.entityType !== "dashboard_widget").length}. Draft, private and review-needed records are absent.`,
);
