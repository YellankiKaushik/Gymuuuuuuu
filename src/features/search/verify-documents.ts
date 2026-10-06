import { isAllowlistedPublicRoute, searchDocumentSchema } from "./domain";

export async function verifyPublicSearchDocuments(
  input: unknown,
  digest: (value: string) => Promise<string>,
) {
  const documents = searchDocumentSchema.array().parse(input),
    unique = new Set<string>();
  for (const document of documents) {
    if (unique.has(document.documentId))
      throw Error("Public search documents contain duplicate stable IDs.");
    if (
      document.entityType === "route" &&
      !isAllowlistedPublicRoute(document.route)
    )
      throw Error(
        "Public search document contains a route outside the navigation allowlist.",
      );
    unique.add(document.documentId);
  }
  // Bound native crypto requests while avoiding one browser IPC round-trip per document.
  const batchSize = 8;
  for (let offset = 0; offset < documents.length; offset += batchSize)
    await Promise.all(
      documents.slice(offset, offset + batchSize).map(async (document) => {
        const { contentHash, ...canonical } = document;
        if ((await digest(JSON.stringify(canonical))) !== contentHash)
          throw Error(
            `Public search document hash is invalid: ${document.documentId}.`,
          );
      }),
    );
  return documents;
}
