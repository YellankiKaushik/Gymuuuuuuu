import documents from "../../data/search/search-documents.public.json";
import { loadComparisonRecords } from "./comparison-records.server";
import type { ComparisonFamily, EntityReference } from "../saved/schema";
export async function resolvePublicComparison(data: {
  family: ComparisonFamily;
  entities: { entityType: EntityReference["entityType"]; entityId: string }[];
}) {
  const references = data.entities.map((entity) => {
    const document = documents.find(
      (doc) =>
        doc.entityId === entity.entityId &&
        doc.entityType === entity.entityType,
    );
    if (
      !document ||
      ["route", "dashboard_widget"].includes(document.entityType)
    )
      throw Error("Only published factual catalogue identifiers are accepted.");
    return {
      ...entity,
      sourceModule: document.sourceModule,
      entityVersion: document.entityVersion,
      lastKnownTitle: document.title,
      lastKnownRoute: document.route,
      referenceStatus: "active" as const,
    };
  });
  return loadComparisonRecords(data.family, references, true);
}
