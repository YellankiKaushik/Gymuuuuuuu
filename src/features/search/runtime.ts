import rawDocuments from "../../data/search/search-documents.public.json";
import rawIndex from "../../data/search/search-index.public.json";
import rawManifest from "../../data/search/search-manifest.json";
import type { PublicSearchDocument } from "./domain";
import { verifyPublicSearchDocuments } from "./verify-documents";
import { LocalSearchEngine } from "./engine";
import { searchManifestSchema, serializedIndexSchema } from "./index-format";

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
