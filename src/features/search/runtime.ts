import rawDocuments from "../../data/search/search-documents.public.json";
import rawIndex from "../../data/search/search-index.public.json";
import rawManifest from "../../data/search/search-manifest.json";
import { isAllowlistedPublicRoute, searchDocumentSchema, type PublicSearchDocument } from "./domain";
import { LocalSearchEngine } from "./engine";
import { searchManifestSchema, serializedIndexSchema } from "./index-format";

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
export type PublicSearchRuntime = { engine: LocalSearchEngine; documentCount: number; status: "verified" | "rebuilt" };
export async function loadPublicSearchRuntime(): Promise<PublicSearchRuntime> {
  const docs = searchDocumentSchema.array().parse(rawDocuments), manifest = searchManifestSchema.parse(rawManifest), index = serializedIndexSchema.parse(rawIndex), unique = new Set<string>();
  for (const document of docs) {
    if (unique.has(document.documentId)) throw Error("Public search documents contain duplicate stable IDs.");
    if (document.entityType === "route" && !isAllowlistedPublicRoute(document.route)) throw Error("Public search document contains a route outside the navigation allowlist.");
    unique.add(document.documentId);
    const { contentHash, ...canonical } = document;
    if (await sha256(JSON.stringify(canonical)) !== contentHash) throw Error(`Public search document hash is invalid: ${document.documentId}.`);
  }
  const documentsHash = await sha256(JSON.stringify(docs)), indexHash = await sha256(JSON.stringify(index)), matches = documentsHash === manifest.canonicalDocumentHash && indexHash === manifest.indexHash && manifest.documentCount === docs.length && index.documentIds.length === docs.length && index.documentIds.every((id, position) => id === docs[position]?.documentId);
  const engine = new LocalSearchEngine();
  await engine.build(docs as PublicSearchDocument[], matches ? index.postings : undefined);
  return { engine, documentCount: docs.length, status: matches ? "verified" : "rebuilt" };
}
