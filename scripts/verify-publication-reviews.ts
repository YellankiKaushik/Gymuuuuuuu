import { publicRecipes } from "../src/features/recipes-meal-plans/public-records";
import { readFileSync, writeFileSync } from "node:fs";
import { validatePublicationReviews } from "../src/features/content-review/schema";
import { muscleRecords } from "../src/features/muscles/repository";
import { exerciseRecords } from "../src/features/exercises/repository";
import { scienceRecords } from "../src/features/workout-science/repository";
import { publishedPrograms } from "../src/features/programs/repository";
import { publicTemplates } from "../src/features/recipes-meal-plans/public-templates-records";
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
const verifiedFoodRecords = foodSchema.array().parse(foodJson);
for (const food of verifiedFoodRecords.filter((f) => f.status === "published"))
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
for (const n of nutrientJson.filter((n) => n.status === "published")) {
  const educationSources = n.sources
    .filter((s) =>
      [
        "nih_ods_fact_sheets",
        "fda_nutrition_education",
        "fao_food_energy",
        "nhs_food_education",
        "efsa_drv",
      ].includes(s.sourceId),
    )
    .map((s) => {
      const approved = sources.find(
        (source) => source.url.toLowerCase() === s.locator.toLowerCase(),
      );
      if (!approved)
        throw Error(
          `Individually verified nutrient page missing: ${s.locator}`,
        );
      return approved.id;
    });
  records.push({
    module: "nutrients",
    id: n.id,
    slug: n.slug,
    fields: [
      field("claims_and_educational_sections", educationSources),
      ...(n.referenceValues.length
        ? [field("referenceValues", ["fda_daily_values"])]
        : []),
    ],
  });
}
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
        [
          r.sourceRefs.includes("original_recipes_v2")
            ? "original_recipes_v2"
            : "original_recipes_v1",
        ],
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
for (const t of publicTemplates)
  records.push({
    module: "meal-templates",
    id: t.id,
    slug: t.slug,
    fields: [
      field(
        "plan.plannedItems",
        ["original_meal_collections_v1"],
        "original_authorship",
      ),
      ...t.plan.plannedItems.flatMap((item) =>
        item.recipeRef!.ingredientRequirements.map((i) =>
          field(
            `plan.${item.id}.${i.id}`,
            i.sourceSnapshot?.sourceRecords?.map((s) => s.sourceId) ?? [],
            "dataset_value",
          ),
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
        "definition",
        r.sourceIds.map((id) =>
          id === "src_aasm_sleep_duration_2015"
            ? "aasm_sleep_2015"
            : id === "src_sleep_regularity_consensus_2023"
              ? "nsf_regularity_2023"
              : id,
        ),
      ),
      ...r.claims.map((claim) =>
        field(
          `claims.${claim.id}`,
          claim.sourceIds.map((id) =>
            id === "src_aasm_sleep_duration_2015"
              ? "aasm_sleep_2015"
              : id === "src_sleep_regularity_consensus_2023"
                ? "nsf_regularity_2023"
                : id,
          ),
        ),
      ),
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
for (const r of publicRecoveryRoutines)
  records.push({
    module: "recovery",
    id: r.article.id,
    slug: r.article.slug,
    fields: [
      field("claims", r.article.sourceIds),
      field("routine.steps", r.article.sourceIds),
      field("stepRationales", r.article.sourceIds),
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
      ...r.sections.map((section) =>
        field(
          `sections.${section.id}`,
          section.content.sourceIds.map((id) =>
            id === "src_nih_ods_faq" ? "nih_ods_faq" : id,
          ),
        ),
      ),
      ...r.claims.flatMap((claim) => [
        field(`claims.${claim.id}`, claim.sourceIds),
        ...claim.harms.map((harm, index) =>
          field(`claims.${claim.id}.harms.${index}`, harm.sourceIds),
        ),
        ...(claim.protocol
          ? [
              field(`claims.${claim.id}.protocol`, claim.protocol.sourceIds),
              ...claim.protocol.safetyLimits.map((limit, index) =>
                field(
                  `claims.${claim.id}.protocol.safetyLimits.${index}`,
                  limit.sourceIds,
                ),
              ),
            ]
          : []),
      ]),
      ...r.safety.map((safety) =>
        field(
          `safety.${safety.id}`,
          safety.content.sourceIds.map((id) =>
            id === "src_nih_ods_faq" ? "nih_ods_faq" : id,
          ),
        ),
      ),
      ...(r.antiDoping ? [field("antiDoping", r.antiDoping.sourceIds)] : []),
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
          ?.filter(
            (s) =>
              s.sourceType ===
              (r.sources?.some(
                (ref) => ref.sourceType === "professional-technique-guide",
              )
                ? "professional-technique-guide"
                : "government-guideline"),
          )
          .map((s) => s.id) ?? [],
      ),
      field("muscleRoles", [
        ...new Set(r.muscleRoles?.flatMap((role) => role.sourceIds) ?? []),
      ]),
      field(
        "safety",
        r.sources
          ?.filter((s) =>
            ["government-guideline", "professional-technique-guide"].includes(
              s.sourceType,
            ),
          )
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
            : ["exercise_push_up", "exercise_knee_push_up"].includes(r.id)
              ? "original_pushup_diagrams_v1"
              : r.id === "exercise_single_leg_calf_raise"
                ? "original_calf_diagram_v1"
                : [
                      "exercise_glute_bridge",
                      "exercise_single_leg_glute_bridge",
                      "exercise_bird_dog",
                      "exercise_lat_pulldown",
                    ].includes(r.id)
                  ? "original_ace_four_diagrams_v1"
                  : [
                        "exercise_bodyweight_squat",
                        "exercise_one_arm_dumbbell_row",
                        "exercise_incline_push_up",
                        "exercise_standing_calf_raise",
                      ].includes(r.id)
                    ? "original_foundation_diagrams_v1"
                    : [
                          "exercise_dumbbell_bench_press",
                          "exercise_forward_lunge",
                          "exercise_dumbbell_romanian_deadlift",
                        ].includes(r.id)
                      ? "original_ace_next_diagrams_v1"
                      : "original_strength_diagrams_v1",
        ],
        "original_authorship",
      ),
    ],
  });
for (const r of publishedPrograms) {
  const arrangementSource =
    r.id === "program_full_body_2_day_foundation"
      ? "original_foundation_program_v1"
      : r.id === "program_full_body_3_day_foundation"
        ? "original_three_day_foundation_v1"
        : null;
  if (!arrangementSource) throw Error(`Unverified program arrangement ${r.id}`);
  records.push({
    module: "programs",
    id: r.id,
    slug: r.slug,
    fields: [
      field("schedule.arrangement", [arrangementSource], "original_authorship"),
      field("prescriptions.progression.safety.timeAllocation", [
        "nia_strength_guide_2018",
      ]),
      ...[
        ...new Set(
          r.scheduleModel!.sessions.flatMap((session) =>
            session.exerciseBlocks.flatMap((block) =>
              block.prescriptions.map((p) => p.exerciseId),
            ),
          ),
        ),
      ].map((id) => {
        const exercise = exerciseRecords.find((e) => e.id === id);
        if (!exercise || exercise.contentStatus !== "published")
          throw Error(`Unpublished program technique ${id}`);
        return field(
          `technique.${id}`,
          exercise.sources
            ?.filter((s) =>
              ["government-guideline", "professional-technique-guide"].includes(
                s.sourceType,
              ),
            )
            .map((s) => s.id) ?? [],
        );
      }),
    ],
  });
}
// Fail closed: publication in an adapter without provenance is a release error.
for (const [module, rows] of [
  ["muscles", muscleRecords.filter((r) => r.contentStatus === "published")],
  ["exercises", exerciseRecords.filter((r) => r.contentStatus === "published")],
  ["programs", publishedPrograms],
  ["meal-templates", publicTemplates],
  ["recovery-routines", publicRecoveryRoutines.map((r) => r.article)],
] as const)
  for (const row of rows)
    if (
      !records.some(
        (r) =>
          (r.module === module ||
            (module === "recovery-routines" && r.module === "recovery")) &&
          r.id === row.id,
      )
    )
      throw Error(`Publication provenance missing: ${module}:${row.id}`);
const release = validatePublicationReviews(
  records.map((r) => ({
    ...r,
    state: "published_personal_use",
    method:
      "Explicit source/identity verification and automated schema/provenance validation; no independent human review",
    lastReviewedAt: [
      ...(r.module === "foods"
        ? verifiedFoodRecords
            .find((f) => f.id === r.id)!
            .compositionProfiles.map((p) => p.review.reviewedAt!.slice(0, 10))
        : []),
      ...r.fields.flatMap((f) =>
        f.sourceIds.map((id) => {
          const source = sources.find((s) => s.id === id);
          if (!source) throw Error(`Publication source is missing: ${id}`);
          return source.lastReviewedAt;
        }),
      ),
    ]
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
