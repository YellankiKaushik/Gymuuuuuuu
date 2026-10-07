import type { EntityReference, ComparisonFamily } from "../saved/schema";
import { validateComparisonEntities } from "./comparison";
import { loadPublicSearchRuntime } from "./runtime";
import { loadPublicComparison } from "./comparison.functions";
import type { ComparisonRecord } from "./comparison-types";
export type { ComparisonField, ComparisonRecord } from "./comparison-types";

/** Saved labels, routes and personal references never enter a server request. */
export async function loadComparisonRecords(
  family: ComparisonFamily,
  entities: readonly EntityReference[],
): Promise<ComparisonRecord[]> {
  validateComparisonEntities(family, entities);
  if (entities.some((entity) => entity.referenceStatus !== "active"))
    throw Error(
      "Choose active published library references for this comparison.",
    );
  const runtime = await loadPublicSearchRuntime();
  try {
    const rows: (ComparisonRecord | undefined)[] = entities.map((entity) => {
      const doc = runtime.documents.find(
        (document) =>
          document.entityId === entity.entityId &&
          document.entityType === entity.entityType,
      );
      const unavailable = !doc
        ? "This reference is no longer in the published library."
        : entity.entityVersion && entity.entityVersion !== doc.entityVersion
          ? "The saved reference version differs from the current publication. Select the current record from Search."
          : undefined;
      return unavailable
        ? {
            id: entity.entityId,
            title: doc?.title ?? entity.lastKnownTitle,
            route: doc?.route ?? "",
            fields: [],
            sources: [],
            limitations: [],
            unavailable,
          }
        : undefined;
    });
    const publicEntities = entities.flatMap((entity, position) =>
      rows[position]
        ? []
        : [{ entityType: entity.entityType, entityId: entity.entityId }],
    );
    if (publicEntities.length) {
      const published = await loadPublicComparison({
        data: { family, entities: publicEntities },
      });
      for (let position = 0, resolved = 0; position < rows.length; position++)
        if (!rows[position]) rows[position] = published[resolved++];
    }
    return rows.map((row) => {
      if (!row) throw Error("Published comparison reference is unresolved.");
      return row;
    });
  } finally {
    runtime.engine.dispose();
  }
}
