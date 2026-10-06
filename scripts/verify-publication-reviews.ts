import { publicRecipes } from "../src/features/recipes-meal-plans/public-records";
import { readFileSync, writeFileSync } from "node:fs";
import { validatePublicationReviews } from "../src/features/content-review/schema";
import { muscleRecords } from "../src/features/muscles/repository";
import { exerciseRecords } from "../src/features/exercises/repository";
import { scienceRecords } from "../src/features/workout-science/repository";
import { publishedPrograms } from "../src/features/programs/repository";
import { publicTemplates } from "../src/features/recipes-meal-plans/publication";
import {
  publicRecoveryArticles,
  publicRecoveryRoutines,
} from "../src/features/recovery/publication";
import { publicCardioEntities } from "../src/features/cardio/publication";
import { publicSupplements } from "../src/features/supplements/publication";
import foodJson from "../src/content/foods/records.json";
import nutrientJson from "../src/content/nutrients/records.json";
import sources from "../src/content/provenance/verified-sources.json";
import { foodSchema } from "../src/features/foods/schema";
const records: {
  module: string;
  id: string;
  slug: string;
  fields: {
    path: string;
    sourceIds: string[];
    kind: "dataset_value" | "sourced_education" | "original_authorship";
  }[];
}[] = [];
const field = (
  path: string,
  sourceIds: string[],
  kind:
    | "dataset_value"
    | "sourced_education"
    | "original_authorship" = "sourced_education",
) => ({ path, sourceIds, kind });
for (const food of foodSchema
  .array()
  .parse(foodJson)
  .filter((f) => f.status === "published"))
  records.push({
    module: "foods",
    id: food.id,
    slug: food.slug,
    fields: [
      ...(food.id === "food_green_gram"
        ? [field("identity", ["tnau_green_gram_identity"])]
        : []),
      ...(food.id === "food_groundnut_oil"
        ? [field("identity", ["fao_groundnut_oil_identity"])]
        : []),
      ...food.compositionProfiles.map((p) =>
        field(
          `compositionProfiles.${p.profileId}`,
          p.sourceRecords.map((s) => s.sourceId),
          "dataset_value",
        ),
      ),
    ],
  });
const nutrientSources: Readonly<Record<string, string>> = {
  iron_mg: "nih_ods_iron_consumer",
  calcium_mg: "nih_ods_calcium_consumer",
  vitamin_c_mg: "nih_ods_vitamin_c_consumer",
  magnesium_mg: "nih_ods_magnesium_consumer",
  zinc_mg: "nih_ods_zinc_consumer",
  vitamin_d_ug: "nih_ods_vitamin_d_consumer",
  vitamin_b12_ug: "nih_ods_vitamin_b12_consumer",
};
for (const n of nutrientJson.filter((n) => n.status === "published"))
  records.push({
    module: "nutrients",
    id: n.id,
    slug: n.slug,
    fields: [
      field("claims", [nutrientSources[n.id]!]),
      field("referenceValues", ["fda_daily_values"]),
    ],
  });
for (const r of scienceRecords.filter((r) => r.contentStatus === "published"))
  records.push({
    module: "workout-science",
    id: r.id,
    slug: r.slug,
    fields: [field("claims", r.sources?.map((s) => s.id) ?? [])],
  });
for (const r of publicRecipes)
  records.push({
    module: "recipes",
    id: r.id,
    slug: r.slug,
    fields: [
      field(
        "version.instructions",
        ["original_recipes_v1"],
        "original_authorship",
      ),
      ...r.version.ingredients.map((i) =>
        field(
          `version.ingredients.${i.id}`,
          i.sourceSnapshot?.sourceRecords?.map((s) => s.sourceId) ?? [],
          "dataset_value",
        ),
      ),
    ],
  });
for (const r of publicRecoveryArticles)
  records.push({
    module: "recovery",
    id: r.id,
    slug: r.slug,
    fields: [
      field(
        "claims",
        r.sourceIds.map((id) =>
          id === "src_aasm_sleep_duration_2015"
            ? "aasm_sleep_2015"
            : id === "src_sleep_regularity_consensus_2023"
              ? "nsf_regularity_2023"
              : id,
        ),
      ),
    ],
  });
for (const r of publicCardioEntities)
  records.push({
    module: "cardio",
    id: r.id,
    slug: r.slug,
    fields: [
      ...(r.plan
        ? [field("plan.sessions", [r.plan.sourceId], "sourced_education")]
        : []),
      field(
        "claims",
        r.sourceIds.map((id) =>
          id === "src_cdc_intensity_2025" ? "cdc_talk_test" : id,
        ),
      ),
    ],
  });
for (const r of publicSupplements)
  records.push({
    module: "supplements",
    id: r.id,
    slug: r.slug,
    fields: [
      field(
        "sections",
        r.sourceIds.map((id) =>
          id === "src_nih_ods_faq" ? "nih_ods_faq" : id,
        ),
      ),
    ],
  });
for (const r of muscleRecords.filter((r) => r.contentStatus === "published"))
  records.push({
    module: "muscles",
    id: r.id,
    slug: r.slug,
    fields: [field("anatomy", r.sources)],
  });
for (const r of exerciseRecords.filter((r) => r.contentStatus === "published"))
  records.push({
    module: "exercises",
    id: r.id,
    slug: r.slug,
    fields: [
      field(
        "technique",
        r.sources
          ?.filter((s) => s.sourceType === "government-guideline")
          .map((s) => s.id) ?? [],
      ),
      field("muscleRoles", [
        ...new Set(r.muscleRoles?.flatMap((role) => role.sourceIds) ?? []),
      ]),
      field(
        "safety",
        r.sources
          ?.filter((s) => s.sourceType === "government-guideline")
          .map((s) => s.id) ?? [],
      ),
      field("programmingGuidance", [
        ...new Set(r.programmingGuidance?.flatMap((g) => g.sourceIds) ?? []),
      ]),
      field(
        "media",
        [
          r.id === "exercise_dumbbell_curl"
            ? "original_curl_diagram_v1"
            : "original_strength_diagrams_v1",
        ],
        "original_authorship",
      ),
    ],
  });
// Fail closed: publication in an adapter without provenance is a release error.
for (const [module, rows] of [
  ["muscles", muscleRecords.filter((r) => r.contentStatus === "published")],
  ["exercises", exerciseRecords.filter((r) => r.contentStatus === "published")],
  ["programs", publishedPrograms],
  ["meal-templates", publicTemplates],
  ["recovery-routines", publicRecoveryRoutines.map((r) => r.article)],
] as const)
  for (const row of rows)
    if (!records.some((r) => r.module === module && r.id === row.id))
      throw Error(`Publication provenance missing: ${module}:${row.id}`);
const release = validatePublicationReviews(
  records.map((r) => ({
    ...r,
    state: "published_personal_use",
    method:
      "Explicit source/identity verification and automated schema/provenance validation; no independent human review",
    lastReviewedAt: r.fields
      .flatMap((f) =>
        f.sourceIds.map((id) => {
          const source = sources.find((s) => s.id === id);
          if (!source) throw Error(`Publication source is missing: ${id}`);
          return source.lastReviewedAt;
        }),
      )
      .sort()
      .at(-1)!,
    reviewer: { kind: "machine", name: "Codex" },
    limitations: [
      "No independent human or clinical review.",
      "See each record's source-specific limitations and missing data.",
    ],
  })),
  sources,
  new Date().toISOString().slice(0, 10),
);
const path = "src/content/provenance/publications.json",
  json = JSON.stringify(release, null, 2) + "\n";
if (process.argv.includes("--write")) writeFileSync(path, json);
else if (readFileSync(path, "utf8") !== json)
  throw Error(
    "Publication provenance is stale or incomplete. Verify sources, then regenerate the review manifest.",
  );
console.log(
  `Explicit personal-use provenance validated: ${release.length} records; zero human-review claims.`,
);
