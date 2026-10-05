export type RouteAuditKind = "route" | "public_record" | "missing_record";

export function routeAuditInventory(
  tree: string,
  documents: readonly { entityType: string; route: string }[],
) {
  const inventory = tree
    .split("export interface FileRoutesByFullPath {")[1]
    ?.split("\n}")[0];
  if (!inventory) throw Error("Generated route inventory is missing.");
  const cases = new Map<string, RouteAuditKind>();
  for (const match of inventory.matchAll(/'([^']+)': typeof /g)) {
    const path = match[1]!;
    cases.set(
      path.replace(/\$[^/]+/g, "audit-unknown-record"),
      path.includes("$") ? "missing_record" : "route",
    );
  }
  for (const document of documents) {
    if (!["route", "dashboard_widget"].includes(document.entityType))
      cases.set(document.route, "public_record");
  }
  return cases;
}
