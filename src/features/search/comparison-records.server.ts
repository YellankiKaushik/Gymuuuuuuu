import type { EntityReference, ComparisonFamily } from "../saved/schema";
import { comparisonFamilyFor, validateComparisonEntities } from "./comparison";
import { loadPublicSearchRuntime } from "./runtime";

import type { ComparisonField, ComparisonRecord } from "./comparison-types";
const words = (s: string) =>
  s
    .replace(/^(equipment|pattern|muscle|group|region)_/, "")
    .replaceAll("_", " ")
    .replaceAll("-", " ");
const field = (
  label: string,
  value: string | null | undefined,
): ComparisonField => ({ label, value: value?.trim() || "Not available" });

/** Reads only approved public records. Saved/local reference labels never authorize facts. */
export async function loadComparisonRecords(
  family: ComparisonFamily,
  entities: readonly EntityReference[],
  allowSinglePublicRecord = false,
): Promise<ComparisonRecord[]> {
  if (allowSinglePublicRecord && entities.length === 1) {
    if (comparisonFamilyFor(entities[0]!) !== family)
      throw Error(
        "These references do not belong to the selected comparison family.",
      );
  } else validateComparisonEntities(family, entities);
  if (entities.some((e) => e.referenceStatus !== "active"))
    throw Error(
      "Choose active published library references for this comparison.",
    );
  const runtime = await loadPublicSearchRuntime();
  try {
    return await Promise.all(
      entities.map(async (entity) => {
        const doc = runtime.documents.find(
          (d) =>
            d.entityId === entity.entityId &&
            d.entityType === entity.entityType,
        );
        const row: ComparisonRecord = {
          id: entity.entityId,
          title: doc?.title ?? entity.lastKnownTitle,
          route: doc?.route ?? "",
          fields: [],
          sources: [],
          limitations: [],
        };
        if (!doc)
          return {
            ...row,
            unavailable:
              "This reference is no longer in the published library.",
          };
        if (entity.entityVersion && entity.entityVersion !== doc.entityVersion)
          return {
            ...row,
            unavailable:
              "The saved reference version differs from the current publication. Select the current record from Search.",
          };
        row.fields.push(field("Summary", doc.summary));
        switch (family) {
          case "foods": {
            const { getFoodBySlug } = await import("../foods/repository");
            const { foodReference } = await import("../foods/schema");
            const food = await getFoodBySlug(doc.route.split("/").at(-1)!);
            if (!food || food.id !== entity.entityId)
              throw Error("Published food reference is unresolved.");
            row.profiles = food.compositionProfiles;
            row.fields = [
              field("Food identity", food.canonicalName),
              field(
                "Preparation",
                "Choose the exact source profile below; raw and cooked quantities are not interchangeable.",
              ),
            ];
            row.sources = food.compositionProfiles.flatMap((p) =>
              p.sourceRecords.map((s) => ({
                label: `${p.label} · ${s.release} · ${s.sourceRecordId}`,
                url: foodReference.sourceRegistry.find(
                  (r) => r.id === s.sourceId,
                )!.url,
              })),
            );
            row.limitations.push(
              "Values are per 100 g edible portion. No serving or cooking-state conversion is inferred; missing data is not zero.",
            );
            break;
          }
          case "nutrients": {
            const { getNutrientById } = await import("../nutrients/repository");
            const nutrient = await getNutrientById(entity.entityId);
            if (!nutrient)
              throw Error("Published nutrient reference is unresolved.");
            row.fields = [
              field("Explanation", nutrient.summary),
              field("Measurement unit", nutrient.canonicalUnit),
              field(
                "Reference frameworks",
                nutrient.referenceValues.length
                  ? nutrient.referenceValues
                      .map(
                        (r) =>
                          `${words(r.frameworkId)} · ${r.valueType} · ${r.value ?? "No single value"} ${r.unit} · ${words(r.basis ?? "other")} · ${words(r.population.sex)} · ${r.population.ageMinMonths}–${r.population.ageMaxMonths ?? "no upper bound"} months · ${words(r.population.lifeStage)}`,
                      )
                      .join("; ")
                  : "No numeric reference rows published",
              ),
            ];
            row.sources = nutrient.sources
              .filter((s) => /^https?:\/\//.test(s.locator))
              .map((s) => ({ label: s.notes ?? s.sourceId, url: s.locator }));
            row.limitations.push(
              "Different nutrient units and framework populations are not comparable intake targets. EAR is not a personal target; UL is not an intake goal; DV is a food-label reference.",
            );
            break;
          }
          case "muscles": {
            const { loadMuscleBySlug } =
              await import("../muscles/detail-loader");
            const { sourceRegistry } = await import("../../data/sources");
            const muscle = await loadMuscleBySlug(doc.route.split("/").at(-1)!);
            if (!muscle || muscle.id !== entity.entityId)
              throw Error("Published anatomy reference is unresolved.");
            row.fields = [
              field("Explanation", muscle.summary),
              field("Entity type", words(muscle.entityType)),
              field("Anatomical name", muscle.anatomicalName),
              field(
                "Source-described actions",
                muscle.jointActions
                  .map(
                    (a) =>
                      `${a.joint}: ${a.motion}${a.qualifier ? ` (${a.qualifier})` : ""}`,
                  )
                  .join("; ") ||
                  "Subdivision-specific actions are not established",
              ),
            ];
            row.sources = sourceRegistry
              .filter((s) => muscle.sources.includes(s.sourceId))
              .map((s) => ({ label: s.title, url: s.url }));
            row.limitations.push(...muscle.cautions);
            break;
          }
          case "exercises": {
            const { exerciseRecords } = await import("../exercises/repository");
            const exercise = exerciseRecords.find(
              (r) =>
                r.id === entity.entityId && r.contentStatus === "published",
            );
            if (!exercise)
              throw Error("Published exercise reference is unresolved.");
            row.fields = [
              field("Explanation", exercise.summary),
              field("Equipment", exercise.equipmentIds.map(words).join(", ")),
              field(
                "Movement patterns",
                exercise.movementPatternIds.map(words).join(", "),
              ),
              field(
                "Difficulty",
                words(exercise.difficulty ?? "not available"),
              ),
            ];
            row.sources = (exercise.sources ?? []).map((s) => ({
              label: s.title,
              url: s.url,
            }));
            row.limitations.push(
              "Source-scoped technique education does not establish a universal variation, individual suitability or exact muscle-activation percentages.",
            );
            break;
          }
          case "workout_programs": {
            const { publishedPrograms } =
              await import("../programs/repository");
            const program = publishedPrograms.find(
              (r) => r.id === entity.entityId,
            );
            if (!program)
              throw Error("Published program reference is unresolved.");
            row.fields = [
              field("Explanation", program.summary),
              field("Primary goal", words(program.primaryGoal)),
              field(
                "Population",
                program.populationScope?.map(words).join(", "),
              ),
              field("Training days", String(program.trainingDaysPerWeek)),
              field(
                "Experience",
                program.experienceLevels.map(words).join(", "),
              ),
            ];
            row.sources = (program.sources ?? []).map((s) => ({
              label: s.title,
              url: s.url,
            }));
            row.limitations.push(
              "The published source context and missing-rest explanations remain on the full program. No duration or result is predicted from these comparison fields.",
            );
            break;
          }
          case "recipes": {
            const { publicRecipes } =
              await import("../recipes-meal-plans/public-records");
            const recipe = publicRecipes.find((r) => r.id === entity.entityId);
            if (!recipe)
              throw Error("Published recipe reference is unresolved.");
            row.fields = [
              field("Recipe revision", String(recipe.version.versionNumber)),
              field(
                "Calculation method",
                words(recipe.version.calculation.method),
              ),
              field("Calculation grade", recipe.version.calculation.grade),
              field(
                "Nutrition coverage",
                words(recipe.version.calculation.status),
              ),
              ...recipe.version.ingredients.map((i) =>
                field(
                  i.displayNameSnapshot,
                  i.gramWeight == null
                    ? "Mass not available"
                    : `${i.gramWeight} g`,
                ),
              ),
            ];
            row.fields.push(
              field("Yield method", words(recipe.version.yieldModel.mode)),
              field(
                "Final mass",
                `${recipe.version.yieldModel.finalWeightGrams ?? "Not available"} g`,
              ),
              field(
                "Servings",
                String(recipe.version.yieldModel.servings ?? "Not available"),
              ),
            );
            row.limitations.push(
              recipe.version.yieldModel.note ??
                "See the full recipe yield methodology.",
            );
            row.sources.push({
              label: "Original recipe and exact ingredient provenance",
              url: doc.route,
            });
            break;
          }
          case "recovery_methods": {
            const { publicRecoveryArticles, publicRecoveryRoutines } =
              await import("../recovery/publication");
            const { recoveryReference } = await import("../recovery/schema");
            const article = [
              ...publicRecoveryArticles,
              ...publicRecoveryRoutines.map((r) => r.article),
            ].find((r) => r.id === entity.entityId);
            if (!article)
              throw Error("Published recovery reference is unresolved.");
            row.fields = [
              field("Explanation", article.definition),
              field("Population", article.population),
              field("Context", article.context),
              field("Evidence context", words(article.evidenceStrength)),
            ];
            row.sources = recoveryReference.sources
              .filter((s) => article.sourceIds.includes(s.id))
              .map((s) => ({ label: s.title, url: s.url }));
            row.limitations.push(...article.limitations);
            break;
          }
          case "cardio_modalities":
          case "cardio_plans": {
            const { publicCardioEntities } =
              await import("../cardio/publication");
            const { cardioReference } = await import("../cardio/schema");
            const cardio = publicCardioEntities.find(
              (r) => r.id === entity.entityId,
            );
            if (!cardio)
              throw Error("Published cardio reference is unresolved.");
            row.fields = [
              field("Population", cardio.population),
              field("Prerequisites", cardio.prerequisites.join("; ")),
              ...cardio.claims.map((c) =>
                field(`Source claim · ${words(c.evidenceStrength)}`, c.text),
              ),
            ];
            row.sources = cardioReference.sources
              .filter((s) => cardio.sourceIds.includes(s.id))
              .map((s) => ({ label: s.title, url: s.url }));
            row.limitations.push(...cardio.limitations);
            break;
          }
          case "supplements": {
            const { publicSupplements } =
              await import("../supplements/publication");
            const { supplementReference } =
              await import("../supplements/schema");
            const supplement = publicSupplements.find(
              (r) => r.id === entity.entityId,
            );
            if (!supplement)
              throw Error("Published supplement reference is unresolved.");
            row.fields = [
              ...supplement.sections.map((s) =>
                field(s.heading, s.content.text),
              ),
              field(
                "Outcome-specific research claims",
                supplement.claims.length
                  ? "See each outcome, population, protocol, confidence and safety context in the full article."
                  : "No outcome-specific efficacy claims published",
              ),
              field(
                "Anti-doping assessment",
                supplement.antiDoping
                  ? `${supplement.antiDoping.status} · source list ${supplement.antiDoping.listYear}`
                  : "No current status assessment published",
              ),
            ];
            row.sources = supplementReference.sources
              .filter((s) => supplement.sourceIds.includes(s.id))
              .map((s) => ({ label: s.title, url: s.url }));
            row.limitations.push(
              "Efficacy, safety, quality, certification, jurisdiction and anti-doping status are separate questions. No universal works badge or personal dosing prescription is created.",
            );
          }
        }
        return row;
      }),
    );
  } finally {
    runtime.engine.dispose();
  }
}
