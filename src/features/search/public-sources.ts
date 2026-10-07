import { navigationItems, findModule } from "../../data/navigation";
import { muscleRecords } from "../muscles/repository";
import { exerciseRecords } from "../exercises/repository";
import { scienceRecords } from "../workout-science/repository";
import { publishedPrograms } from "../programs/repository";
import foodIndexJson from "../../content/foods/index.json";
import nutrientIndexJson from "../../content/nutrients/index.json";
import { publicTemplates } from "../recipes-meal-plans/public-templates-records";
import { publicRecipes } from "../recipes-meal-plans/public-records";
import {
  publicRecoveryArticles,
  publicRecoveryRoutines,
} from "../recovery/publication";
import { publicCardioEntities } from "../cardio/publication";
import { publicSupplements } from "../supplements/publication";
import type { PublicSearchDocument, SearchEntityType } from "./domain";
import { normalizeSearchText, searchDocumentSchema } from "./domain";
import publicationReviews from "../../content/provenance/publications.json";
const provenanceModule: Record<string, string> = {
  phase_02_anatomy: "muscles",
  phase_03_exercises: "exercises",
  phase_04_workout_science: "workout-science",
  phase_05_programs: "programs",
  phase_07_foods: "foods",
  phase_08_nutrients: "nutrients",
  phase_11_recipes: "recipes",
  phase_11_meal_plans: "meal-templates",
  phase_12_recovery: "recovery",
  phase_13_cardio: "cardio",
  phase_14_supplements: "supplements",
};

// These compiler outputs contain only records that passed their publication gate.
// Identity seeds must never be passed through this adapter.
const foodIndex: readonly unknown[] = foodIndexJson.map((row) => ({
  ...row,
  status: "published",
}));
const nutrientIndex: readonly unknown[] = (
  nutrientIndexJson as readonly Record<string, unknown>[]
).map((row) => ({ ...row, status: "published" }));

type PublicRow = Record<string, unknown>;
function text(row: PublicRow, ...keys: string[]) {
  for (const key of keys)
    if (typeof row[key] === "string" && row[key].trim()) return row[key].trim();
  return "";
}
function textArray(row: PublicRow, ...keys: string[]) {
  for (const key of keys)
    if (Array.isArray(row[key]))
      return row[key]
        .filter(
          (value): value is string =>
            typeof value === "string" && !!value.trim(),
        )
        .map((value) => value.trim());
  return [];
}
function recordRoute(type: SearchEntityType, slug: string) {
  const path = (
    {
      muscle: `/muscles/${slug}`,
      exercise: `/exercises/${slug}`,
      workout_science_topic: `/learn/workout-science/${slug}`,
      workout_program: `/programs/${slug}`,
      food: `/foods/${slug}`,
      nutrient: `/nutrients/${slug}`,
      recipe: `/recipes/${slug}`,
      meal_plan_template: `/meal-plans/templates/${slug}`,
      recovery_topic: `/recovery/topics/${slug}`,
      recovery_routine: `/mobility/routines/${slug}`,
      cardio_topic: `/cardio/learn/${slug}`,
      cardio_modality: `/cardio/modalities/${slug}`,
      cardio_plan: `/cardio/plans/${slug}`,
      conditioning_routine: `/conditioning/routines/${slug}`,
      supplement_ingredient: `/supplements/ingredients/${slug}`,
      supplement_evidence_topic: `/supplements/evidence/${slug}`,
    } as Partial<Record<SearchEntityType, string>>
  )[type];
  return path && findModule(path) ? path : null;
}
function publishedRows(
  type: SearchEntityType,
  sourceModule: string,
  rows: readonly unknown[],
) {
  const output: Omit<PublicSearchDocument, "contentHash">[] = [];
  for (const value of rows) {
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const row = value as PublicRow,
      isPublished =
        row.contentStatus === "published" ||
        row.publicationStatus === "published" ||
        row.status === "published";
    if (!isPublished) continue;
    const entityId = text(row, "id"),
      slug = text(row, "slug"),
      title = text(row, "displayName", "title", "name");
    if (!entityId || !slug || !title)
      throw Error(
        `Published ${type} is missing its stable ID, slug, or title.`,
      );
    const route = recordRoute(type, slug);
    if (!route)
      throw Error(
        `Published ${type}:${entityId} has no canonical route in the module registry.`,
      );
    const aliases = [
        ...new Set([
          ...textArray(row, "aliases"),
          ...textArray(row, "abbreviations"),
        ]),
      ],
      summary = text(
        row,
        "summary",
        "definition",
        "description",
        "shortDescription",
      );
    const review =
      row.review && typeof row.review === "object"
        ? (row.review as PublicRow)
        : {};
    const headings = textArray(row, "headings", "sectionHeadings"),
      keywords = [
        ...new Set([
          ...aliases,
          ...textArray(row, "keywords", "terms", "category", "group"),
        ]),
      ];
    output.push({
      documentId: `${type}:${entityId}`,
      entityType: type,
      entityId,
      entityVersion: text(row, "version", "versionId") || null,
      sourceModule,
      route,
      title,
      normalizedTitle: normalizeSearchText(title),
      aliases,
      normalizedAliases: aliases.map(normalizeSearchText),
      summary,
      keywords,
      headings,
      searchableBody: "",
      facets: {},
      publicationStatus: "published",
      lastReviewedAt:
        publicationReviews.find(
          (r) =>
            r.module === provenanceModule[sourceModule] && r.id === entityId,
        )?.lastReviewedAt ??
        (typeof review.reviewedAt === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(review.reviewedAt)
          ? review.reviewedAt
          : null),
    });
  }
  return output;
}
const publicGroups: readonly {
  type: SearchEntityType;
  module: string;
  rows: readonly unknown[];
}[] = [
  { type: "muscle", module: "phase_02_anatomy", rows: muscleRecords },
  { type: "exercise", module: "phase_03_exercises", rows: exerciseRecords },
  {
    type: "workout_science_topic",
    module: "phase_04_workout_science",
    rows: scienceRecords,
  },
  {
    type: "workout_program",
    module: "phase_05_programs",
    rows: publishedPrograms,
  },
  { type: "food", module: "phase_07_foods", rows: foodIndex },
  { type: "nutrient", module: "phase_08_nutrients", rows: nutrientIndex },
  {
    type: "recipe",
    module: "phase_11_recipes",
    rows: publicRecipes.map((recipe) => ({
      id: recipe.id,
      slug: recipe.slug,
      status: recipe.status,
      title: text(recipe.version as unknown as PublicRow, "name", "title"),
      version: recipe.version.id,
    })),
  },
  {
    type: "meal_plan_template",
    module: "phase_11_meal_plans",
    rows: publicTemplates.map((t) => ({
      id: t.id,
      slug: t.slug,
      title: t.title,
      status: t.status,
      version: t.plan.id,
      summary:
        "Static lunch and snack collection; source-validated personal use; not a complete daily diet.",
      review: { reviewedAt: t.review.reviewedAt.slice(0, 10) },
    })),
  },
  {
    type: "recovery_topic",
    module: "phase_12_recovery",
    rows: publicRecoveryArticles,
  },
  {
    type: "recovery_routine",
    module: "phase_12_recovery",
    rows: publicRecoveryRoutines.map((item) => ({
      ...item.article,
      id: item.article.id,
      slug: item.article.slug,
      title: item.routine.title,
      summary: item.article.definition,
    })),
  },
  {
    type: "cardio_topic",
    module: "phase_13_cardio",
    rows: publicCardioEntities.filter(
      (item) => item.entityType === "knowledge_topic",
    ),
  },
  {
    type: "cardio_modality",
    module: "phase_13_cardio",
    rows: publicCardioEntities.filter(
      (item) => item.entityType === "cardio_modality",
    ),
  },
  {
    type: "cardio_plan",
    module: "phase_13_cardio",
    rows: publicCardioEntities.filter(
      (item) => item.entityType === "cardio_plan_template",
    ),
  },
  {
    type: "conditioning_routine",
    module: "phase_13_cardio",
    rows: publicCardioEntities.filter(
      (item) => item.entityType === "conditioning_routine",
    ),
  },
  {
    type: "supplement_ingredient",
    module: "phase_14_supplements",
    rows: publicSupplements.filter((item) => item.entityType === "ingredient"),
  },
  {
    type: "supplement_evidence_topic",
    module: "phase_14_supplements",
    rows: publicSupplements.filter((item) => item.entityType !== "ingredient"),
  },
];

export async function buildPublicSearchDocuments(
  hash: (value: string) => Promise<string>,
) {
  const routeDocs = [
    ...new Map(
      navigationItems
        .filter((item) => isStaticRoute(item.href))
        .map((item) => [item.href, item]),
    ).values(),
  ].map((item) => ({
    documentId: `route:${item.href}`,
    entityType: "route" as const,
    entityId: item.href,
    entityVersion: null,
    sourceModule: "phase_01_navigation",
    route: item.href,
    title: item.label,
    normalizedTitle: normalizeSearchText(item.label),
    aliases: [...new Set(item.aliases)],
    normalizedAliases: [...new Set(item.aliases)].map(normalizeSearchText),
    summary: item.description,
    keywords: [...item.aliases],
    headings: [],
    searchableBody: "",
    facets: {
      domain: [item.groupId ?? "navigation"],
      visibility: [item.visibility],
    },
    publicationStatus: "published" as const,
    lastReviewedAt: null,
  }));
  const widgets = [
    {
      id: "weight_progress",
      title: "Body-weight trend",
      route: "/progress/weight",
    },
    {
      id: "circumference",
      title: "Circumference measurements",
      route: "/progress/measurements",
    },
    {
      id: "composition",
      title: "Body-composition reports",
      route: "/progress/body-composition",
    },
    { id: "goals", title: "Progress goals", route: "/progress/goals" },
  ].map((item) => ({
    documentId: `dashboard_widget:${item.id}`,
    entityType: "dashboard_widget" as const,
    entityId: item.id,
    entityVersion: null,
    sourceModule: "phase_15_progress",
    route: item.route,
    title: item.title,
    normalizedTitle: normalizeSearchText(item.title),
    aliases: [],
    normalizedAliases: [],
    summary: "Optional destination in your device-local progress workspace.",
    keywords: [],
    headings: [],
    searchableBody: "",
    facets: {},
    publicationStatus: "published" as const,
    lastReviewedAt: null,
  }));
  const contentDocs = publicGroups.flatMap((group) =>
    publishedRows(group.type, group.module, group.rows),
  );
  const records = [...routeDocs, ...widgets, ...contentDocs],
    identities = new Set<string>(),
    routes = new Set<string>();
  for (const record of records) {
    if (identities.has(record.documentId))
      throw Error(`Duplicate public search document ${record.documentId}.`);
    if (routes.has(record.route) && record.entityType !== "dashboard_widget")
      throw Error(`Duplicate public search route ${record.route}.`);
    identities.add(record.documentId);
    if (record.entityType !== "dashboard_widget") routes.add(record.route);
  }
  const documents = await Promise.all(
    records.map(async (record) => ({
      ...record,
      contentHash: await hash(JSON.stringify(record)),
    })),
  );
  return documents.map((document) =>
    searchDocumentSchema.parse(document),
  ) as PublicSearchDocument[];
}
function isStaticRoute(path: string) {
  return (
    !path.includes("$") &&
    !path.includes("?") &&
    !path.includes("#") &&
    (path === "/" || !!findModule(path))
  );
}
