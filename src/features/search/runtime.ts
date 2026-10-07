import rawManifest from "../../data/search/search-manifest.json";
import type { PublicSearchDocument } from "./domain";
import { verifyPublicSearchDocuments } from "./verify-documents";
import { LocalSearchEngine } from "./engine";
import { searchManifestSchema, serializedIndexSchema } from "./index-format";
import { searchDocumentSchema } from "./domain";
import { loadPublicJson } from "../content-review/public-json";

const publicAssetUrls = import.meta.glob<string>(
  "../../data/search/*.public.json",
  { query: "?url", import: "default", eager: true },
);
async function loadSearchAssets() {
  if (import.meta.env.SSR) {
    const [documents, index] = await Promise.all([
      import("../../data/search/search-documents.public.json"),
      import("../../data/search/search-index.public.json"),
    ]);
    return [documents.default, index.default] as const;
  }
  const documentUrl =
      publicAssetUrls["../../data/search/search-documents.public.json"],
    indexUrl = publicAssetUrls["../../data/search/search-index.public.json"];
  if (!documentUrl || !indexUrl)
    throw Error("Public search assets are unavailable.");
  return Promise.all([
    loadPublicJson(documentUrl, searchDocumentSchema.array()),
    loadPublicJson(indexUrl, serializedIndexSchema),
  ]);
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
export type PublicSearchRuntime = {
  engine: LocalSearchEngine;
  documentCount: number;
  status: "verified" | "rebuilt";
};
export async function loadPublicSearchRuntime(): Promise<PublicSearchRuntime> {
  const [rawDocuments, rawIndex] = await loadSearchAssets();
  const docs = await verifyPublicSearchDocuments(rawDocuments, sha256),
    manifest = searchManifestSchema.parse(rawManifest),
    index = serializedIndexSchema.parse(rawIndex);
  const [documentsHash, indexHash] = await Promise.all([
    sha256(JSON.stringify(docs)),
    sha256(JSON.stringify(index)),
  ]);
  const matches =
    documentsHash === manifest.canonicalDocumentHash &&
    indexHash === manifest.indexHash &&
    manifest.documentCount === docs.length &&
    index.documentIds.length === docs.length &&
    index.documentIds.every(
      (id, position) => id === docs[position]?.documentId,
    );
  const engine = new LocalSearchEngine();
  await engine.build(
    docs as PublicSearchDocument[],
    matches ? index.postings : undefined,
  );
  return {
    engine,
    documentCount: docs.length,
    status: matches ? "verified" : "rebuilt",
  };
}
