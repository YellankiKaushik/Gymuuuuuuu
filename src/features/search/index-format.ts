import { z } from "zod";
import { searchEntityTypes } from "./domain";

export const indexSchemaVersion = "1.0.0";
export const searchAdapterVersion = "fitness-os-native-index-v1";
export const normalizationVersion = "unicode-nfkc-token-v1";
export const rankingVersion = "field-weights-exact-prefix-bonus-v1";
export const serializedIndexSchema = z.strictObject({
  schemaVersion: z.literal(indexSchemaVersion),
  documentIds: z.array(z.string()),
  postings: z.record(z.string(), z.array(z.number().int().nonnegative())),
});
export const searchManifestSchema = z.strictObject({
  schemaVersion: z.literal(indexSchemaVersion), adapterVersion: z.literal(searchAdapterVersion), normalizationVersion: z.literal(normalizationVersion), rankingVersion: z.literal(rankingVersion), canonicalDocumentHash: z.string().regex(/^[a-f0-9]{64}$/), indexHash: z.string().regex(/^[a-f0-9]{64}$/), indexVersion: z.string().regex(/^[a-f0-9]{64}$/), documentCount: z.number().int().nonnegative(), countsByEntityType: z.record(z.enum(searchEntityTypes), z.number().int().nonnegative()), builtAt: z.iso.datetime(), locale: z.literal("en"),
});
export type SerializedSearchIndex = z.infer<typeof serializedIndexSchema>;
export type SearchManifest = z.infer<typeof searchManifestSchema>;
