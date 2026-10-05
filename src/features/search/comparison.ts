import type { EntityReference, ComparisonFamily } from "../saved/schema";

const familyByEntity = {
  muscle: "muscles", exercise: "exercises", workout_program: "workout_programs", food: "foods", nutrient: "nutrients", recipe: "recipes", recovery_topic: "recovery_methods", recovery_routine: "recovery_methods", cardio_modality: "cardio_modalities", cardio_plan: "cardio_plans", supplement_ingredient: "supplements", supplement_evidence_topic: "supplements",
} as const satisfies Partial<Record<EntityReference["entityType"], ComparisonFamily>>;
export function comparisonFamilyFor(entity: EntityReference): ComparisonFamily | null { return familyByEntity[entity.entityType as keyof typeof familyByEntity] ?? null; }
export function validateComparisonEntities(family: ComparisonFamily, entities: readonly EntityReference[]) {
  if (entities.length < 2 || entities.length > 4) throw Error("A comparison needs two to four items from the same family.");
  if (entities.some((entity) => comparisonFamilyFor(entity) !== family)) throw Error("These references do not belong to the selected comparison family.");
  if (new Set(entities.map((entity) => `${entity.entityType}:${entity.entityId}`)).size !== entities.length) throw Error("A comparison cannot contain the same reference twice.");
}
