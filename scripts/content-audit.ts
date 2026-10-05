import { routeAuditInventory } from "./content/route-inventory";
import { collectBrowserEvidence } from "./content/browser-report";
import { publicRecipes } from "../src/features/recipes-meal-plans/public-records";
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  muscleRecords,
  anatomyTaxonomy,
} from "../src/features/muscles/repository";
import {
  exerciseRecords,
  exerciseIdentities,
} from "../src/features/exercises/repository";
import {
  scienceRecords,
  scienceIdentities,
} from "../src/features/workout-science/repository";
import {
  publishedPrograms,
  programIdentities,
} from "../src/features/programs/repository";
import { publicTemplates } from "../src/features/recipes-meal-plans/publication";
import {
  publicRecoveryArticles,
  publicRecoveryRoutines,
} from "../src/features/recovery/publication";
import { publicCardioEntities } from "../src/features/cardio/publication";
import { publicSupplements } from "../src/features/supplements/publication";
import { appDatabaseNames } from "../src/features/data-management/service";
import { buildPublicSearchDocuments } from "../src/features/search/public-sources";
import publications from "../src/content/provenance/publications.json";
import verifiedSources from "../src/content/provenance/verified-sources.json";
import { validatePublicationReviews } from "../src/features/content-review/schema";
type Row = {
  id: string;
  slug?: string;
  contentStatus?: string;
  status?: string;
  publicationStatus?: string;
};
const read = (path: string): unknown => JSON.parse(readFileSync(path, "utf8"));
const content = (path: string) => read(`src/content/${path}.json`);
const seeds = (path: string, key: string) =>
  (content(path) as Record<string, Row[]>)[key]!;
const foods = content("foods/records") as (Row & {
  compositionProfiles: {
    nutrients: { value: number | null }[];
    sourceRecords: unknown[];
    portions: unknown[];
  }[];
  media?: unknown[];
})[];
const nutrients = content("nutrients/records") as Row[];
const groups: {
  module: string;
  identities: readonly Row[];
  public: readonly Row[];
}[] = [
  {
    module: "muscles",
    identities: anatomyTaxonomy.records,
    public: muscleRecords.filter((r) => r.contentStatus === "published"),
  },
  {
    module: "exercises",
    identities: exerciseIdentities,
    public: exerciseRecords.filter((r) => r.contentStatus === "published"),
  },
  {
    module: "workout-science",
    identities: scienceIdentities,
    public: scienceRecords.filter((r) => r.contentStatus === "published"),
  },
  {
    module: "programs",
    identities: programIdentities,
    public: publishedPrograms,
  },
  {
    module: "foods",
    identities: content("foods/identities") as Row[],
    public: foods.filter((r) => r.status === "published"),
  },
  {
    module: "nutrients",
    identities: content("nutrients/identities") as Row[],
    public: nutrients.filter((r) => r.status === "published"),
  },
  { module: "recipes", identities: publicRecipes, public: publicRecipes },
  {
    module: "meal-templates",
    identities: publicTemplates,
    public: publicTemplates,
  },
  {
    module: "recovery",
    identities: seeds("recovery/reference", "seedTaxonomy"),
    public: [
      ...publicRecoveryArticles,
      ...publicRecoveryRoutines.map((r) => r.article),
    ],
  },
  {
    module: "cardio",
    identities: seeds("cardio/reference", "seedTaxonomy"),
    public: publicCardioEntities,
  },
  {
    module: "supplements",
    identities: seeds("supplements/reference", "seedRecords"),
    public: publicSupplements,
  },
];
const duplicates: string[] = [];
const modules = groups.map((g) => {
  for (const key of ["id", "slug"] as const) {
    const used = new Set<string>();
    for (const r of g.public) {
      const v = r[key];
      if (v && used.has(v)) duplicates.push(`${g.module}:${key}:${v}`);
      if (v) used.add(v);
    }
  }
  const published = new Set(g.public.map((r) => r.id));
  return {
    module: g.module,
    totalIdentities: g.identities.length,
    publishedIdentities: g.public.length,
    draftIdentities: g.identities.filter((r) => !published.has(r.id)).length,
    blockedIdentities: g.identities
      .filter((r) => !published.has(r.id))
      .map((r) => ({
        id: r.id,
        slug: r.slug ?? null,
        reason:
          g.module === "foods"
            ? "Exact rights-cleared dataset mapping has not yet been verified"
            : "Source-backed factual record and machine publication review have not yet been completed",
        classification: "incomplete_source_review",
      })),
    humanReviewedIdentities: 0,
    reviewLevel: g.public.length ? "published_personal_use" : null,
  };
});
const tree = readFileSync("src/routeTree.gen.ts", "utf8");
const full =
  tree.split("export interface FileRoutesByFullPath {")[1]?.split("\n}")[0] ??
  "";
const routes = [...full.matchAll(/'([^']+)': typeof /g)].map((m) => m[1]!);
const routeFiles = readdirSync("src/routes").filter((f) => f.endsWith(".tsx"));
const featureFiles = readdirSync("src/features", { recursive: true })
  .map(String)
  .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"));
const features = (pattern: RegExp) =>
  featureFiles.filter((f) => pattern.test(f)).map((f) => `src/features/${f}`);
const index = read("src/data/search/search-documents.public.json") as unknown;
const searchRows = Array.isArray(index)
  ? index
  : (index as { documents: Row[] }).documents;
const expectedSearch = await buildPublicSearchDocuments(async (value) =>
  createHash("sha256").update(value).digest("hex"),
);
if (JSON.stringify(searchRows) !== JSON.stringify(expectedSearch))
  throw Error(
    "Public search is stale. Rebuild the index before auditing completion.",
  );
const verifiedPublications = validatePublicationReviews(
  publications,
  verifiedSources,
  new Date().toISOString().slice(0, 10),
);
const sourceCoverage = groups.map((g) => ({
  module: g.module,
  published: g.public.length,
  withPublicationProvenance: g.public.filter((r) =>
    verifiedPublications.some((p) => p.module === g.module && p.id === r.id),
  ).length,
  inSearch: g.public.filter((r) =>
    searchRows.some((s: { entityId?: string }) => s.entityId === r.id),
  ).length,
  missingSourceProvenance: g.public
    .filter(
      (r) =>
        !verifiedPublications.some(
          (p) => p.module === g.module && p.id === r.id,
        ),
    )
    .map((r) => r.id),
}));
if (sourceCoverage.some((m) => m.missingSourceProvenance.length))
  throw Error("Published record lacks verified provenance.");
const browserEvidence = collectBrowserEvidence(
  routeAuditInventory(tree, expectedSearch),
  read("src/data/search/search-manifest.json"),
);
const report = {
  schemaVersion: 1,
  milestone: "Phase 19 — Verified Content Completion",
  completionStatus: "in_progress",
  productionDeployment: "disabled",
  modules,
  sourceCoverage,
  sourceManifest: verifiedSources.map((s) => ({
    id: s.id,
    url: s.url,
    version: s.sourceVersion,
    reuse: s.reuse,
    extractionDate: s.extractedAt,
    reviewDate: s.lastReviewedAt,
  })),
  implementedRoutes: routes.map((route) => ({
    route,
    dynamic: route.includes("$"),
    staticInventory: "implemented",
    browserAudit:
      browserEvidence.routes.find(
        (r) => r.path === route.replace(/\$[^/]+/g, "audit-unknown-record"),
      )?.result ?? "unmeasured",
  })),
  routeFiles,
  implementedTrackers: features(
    /(workout|nutrition|progress|recovery|cardio|supplements).*workspace/,
  ),
  implementedCalculators: features(/calculator|diet-planning.*domain/),
  localDatabases: appDatabaseNames,
  implementedExportsAndBackupRestore: features(
    /(data-management|backup|export|csv|restore|portability)/,
  ),
  foodProfiles: foods.reduce((n, f) => n + f.compositionProfiles.length, 0),
  numericFoodValues: foods.reduce(
    (n, f) =>
      n +
      f.compositionProfiles.reduce(
        (a, p) => a + p.nutrients.filter((v) => v.value !== null).length,
        0,
      ),
    0,
  ),
  search: {
    staleEntries: [],
    validatedAgainst: "All current production publication adapters",
    documents: searchRows.length,
    factualRecords: searchRows.filter(
      (r: unknown) =>
        typeof r === "object" &&
        r !== null &&
        !["route", "dashboard_widget"].includes(
          (r as { entityType: string }).entityType,
        ),
    ).length,
  },
  duplicateIdsOrSlugs: duplicates,
  unresolvedLicensing: [
    {
      source: "OpenStax Anatomy and Physiology",
      status: "excluded_not_imported",
      reason:
        "Current generative-AI use restriction requires permission; no content ingested.",
    },
    {
      source: "ICMR-NIN IFCT 2017",
      status: "reference_only_not_imported",
      reason:
        "Bulk reproduction permission is not established; no composition data imported.",
    },
  ],
  emptyKnowledgeModules: modules
    .filter((m) => m.publishedIdentities === 0)
    .map((m) => m.module),
  missingFoodMedia: foods.filter((f) => !f.media?.length).map((f) => f.id),
  browserAudit: browserEvidence,
  verification: {
    sourceAndRelationshipValidation: "npm run validate:content",
    staleSearchValidation: "npm run content:audit after npm run build",
    unreachableRoutes: browserEvidence.routes
      .filter(
        (r) =>
          r.evidence &&
          (r.evidence.status === null ||
            r.evidence.status >= (r.kind === "missing_record" ? 500 : 400)),
      )
      .map((r) => r.path),
    inaccessibleUiStates: browserEvidence.routes.flatMap(
      (r) =>
        r.evidence?.states
          .filter((s) => s.overflow || s.violations.length)
          .map((state) => ({ path: r.path, ...state })) ?? [],
    ),
    missingSourceReferences: sourceCoverage.flatMap(
      (m) => m.missingSourceProvenance,
    ),
    manualDevices: "not performed",
    firefox: "blocked: Windows mozglue SideBySide launch error",
  },
};
if (duplicates.length) throw Error(duplicates.join("\n"));
mkdirSync("docs/reports", { recursive: true });
writeFileSync(
  "docs/reports/content-completion.json",
  JSON.stringify(report, null, 2) + "\n",
);
writeFileSync(
  "docs/reports/content-completion.md",
  `# Content completion audit\n\nStatus: **in progress**. Production deployment remains disabled. Counts are recomputed from production adapters and identity seeds.\n\n| Module | Identities | Published | Blocked |\n| --- | ---: | ---: | ---: |\n${modules.map((m) => `| ${m.module} | ${m.totalIdentities} | ${m.publishedIdentities} | ${m.draftIdentities} |`).join("\n")}\n\n${routes.length} route patterns implemented. Current-build browser evidence: ${browserEvidence.passed} passed, ${browserEvidence.failed} failed, ${browserEvidence.unmeasured} unmeasured out of ${browserEvidence.expected} route/record URLs. Stale build or content reports are excluded. ${report.foodProfiles} food profiles, ${report.numericFoodValues} numeric food values. Every remaining identity and its block reason appears in the JSON report.\n\nNo independent human review is claimed. Missing media, licensing restrictions and unmeasured UI states remain explicit. This report does not certify completion.\n`,
);
console.log(
  modules
    .map((m) => `${m.module}: ${m.publishedIdentities}/${m.totalIdentities}`)
    .join("\n"),
);

if (
  process.argv.includes("--require-browser-pass") &&
  (browserEvidence.failed || browserEvidence.unmeasured)
)
  throw Error(
    "Current-build browser inventory has failed or unmeasured routes; inspect the generated report.",
  );
