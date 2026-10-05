import { z } from "zod";
import { normalizeSearchText } from "./domain";
import type { SearchableDocument } from "./engine";
import { replacePrivateSearchCache, readSearchSettings } from "../saved/storage";

export const privateSearchDocumentSchema = z.strictObject({
  documentId: z.string().min(1), entityType: z.enum(["workout_session", "diet_plan", "recipe", "meal_plan", "sleep_entry", "recovery_checkin", "body_measurement"]), entityId: z.string().min(1), entityVersion: z.string().nullable(), sourceModule: z.string().min(1), route: z.string().startsWith("/"), title: z.string().min(1).max(300), normalizedTitle: z.string(), aliases: z.array(z.string()), normalizedAliases: z.array(z.string()), summary: z.string().max(1000), keywords: z.array(z.string()), headings: z.array(z.string()), searchableBody: z.literal(""), facets: z.record(z.string(), z.array(z.string())), lastReviewedAt: z.null(),
});
export type PrivateSearchDocument = SearchableDocument & { private: true };
function stringValue(record: Record<string, unknown>, ...keys: string[]) { for (const key of keys) if (typeof record[key] === "string" && record[key].trim()) return record[key].trim(); return ""; }
function entityRows(input: unknown) { return Array.isArray(input) ? input.filter((item): item is Record<string, unknown> => !!item && typeof item === "object" && !Array.isArray(item)) : []; }
function makeDocument(entityType: PrivateSearchDocument["entityType"], sourceModule: string, entityId: string, title: string, route: string, date: string, keywords: string[] = []): PrivateSearchDocument {
  return { documentId: `${entityType}:${entityId}`, entityType, entityId, entityVersion: null, sourceModule, route, title, normalizedTitle: normalizeSearchText(title), aliases: [], normalizedAliases: [], summary: date ? `On-device record dated ${date}.` : "On-device saved record.", keywords: [...new Set(keywords)], headings: [], searchableBody: "", facets: {}, lastReviewedAt: null, private: true };
}
function parseBackupRows<T extends Record<string, unknown>>(input: unknown) { return entityRows(input) as T[]; }
export async function buildPrivateSearchDocuments() {
  const settings = await readSearchSettings();
  if (!settings.privateSearchEnabled) return { documents: [] as PrivateSearchDocument[], message: "Private search is off." };
  const documents: PrivateSearchDocument[] = [], issues: string[] = [];
  const load = async (label: string, work: () => Promise<void>) => { try { await work(); } catch { issues.push(`${label} records are unavailable`); } };
  await load("Workout", async () => {
    const backup = await (await import("../workout-tracker/backup")).makeWorkoutBackup();
    for (const session of backup.data.workoutSessions.filter((item) => !item.deletedAt)) {
      const structuredNames = session.exercises.map((exercise) => stringValue(exercise as unknown as Record<string, unknown>, "displayName", "name", "exerciseName")).filter(Boolean), program = session.programRef ? stringValue(session.programRef as unknown as Record<string, unknown>, "name", "title") : "";
      documents.push(makeDocument("workout_session", "phase_06_workout_tracker", session.id, `Workout session · ${session.localDate}`, "/workout/history", session.localDate, [...structuredNames, program].filter(Boolean)));
    }
  });
  await load("Diet-plan", async () => {
    const backup = await (await import("../diet-planning/storage")).readDietBackup();
    for (const row of parseBackupRows(backup.plans)) { const entityId = stringValue(row, "id"); if (!entityId) continue; const title = stringValue(row, "title", "name", "displayName") || `Saved diet plan · ${stringValue(row, "updatedAt", "createdAt").slice(0, 10)}`; documents.push(makeDocument("diet_plan", "phase_09_diet_planning", entityId, title, "/diet-planning", stringValue(row, "updatedAt", "createdAt").slice(0, 10), [stringValue(row, "goalId"), stringValue(row, "status")].filter(Boolean))); }
  });
  await load("Recipe and meal-plan", async () => {
    const backup = await (await import("../recipes-meal-plans/storage")).readRecipeBackup();
    for (const row of parseBackupRows(backup.recipeIdentities)) { const entityId = stringValue(row, "id"); if (!entityId) continue; const title = stringValue(row, "title", "name", "displayName") || `Personal recipe · ${entityId.slice(0, 12)}`; documents.push(makeDocument("recipe", "phase_11_recipes", entityId, title, "/recipes", stringValue(row, "updatedAt", "createdAt").slice(0, 10), [stringValue(row, "visibility")].filter(Boolean))); }
    for (const row of parseBackupRows(backup.mealPlanIdentities)) { const entityId = stringValue(row, "id"); if (!entityId) continue; const title = stringValue(row, "title", "name", "displayName") || `Meal plan · ${entityId.slice(0, 12)}`; documents.push(makeDocument("meal_plan", "phase_11_meal_plans", entityId, title, "/diet-planning", stringValue(row, "updatedAt", "createdAt").slice(0, 10))); }
  });
  await load("Recovery", async () => {
    const backup = await (await import("../recovery/storage")).readRecoveryBackup();
    for (const row of backup.sleepLogs) documents.push(makeDocument("sleep_entry", "phase_12_recovery", row.id, `Sleep entry · ${row.sleepDate}`, "/recovery", row.sleepDate));
    for (const row of backup.recoveryCheckIns) documents.push(makeDocument("recovery_checkin", "phase_12_recovery", row.id, `Recovery check-in · ${row.date}`, "/recovery", row.date));
  });
  await load("Progress", async () => {
    const rows = await (await import("../progress/storage")).readProgressOverview();
    const groups = [["bodyWeightLogs", "Weight entry", "/progress/weight"], ["circumferenceSessions", "Circumference entry", "/progress/measurements"], ["bodyCompositionMeasurements", "Composition report", "/progress/body-composition"]] as const;
    for (const [store, label, route] of groups) for (const row of parseBackupRows(rows[store]).filter((item) => !item.deletedAt)) { const entityId = stringValue(row, "id"), date = stringValue(row, "localDate"); if (entityId) documents.push(makeDocument("body_measurement", "phase_15_progress", entityId, `${label}${date ? ` · ${date}` : ""}`, route, date, [store])); }
  });
  const validated = documents.map((item) => privateSearchDocumentSchema.parse(item));
  await replacePrivateSearchCache(validated.map((document) => ({ cacheKey: `private:${document.documentId}`, document, cachedAt: new Date().toISOString() })));
  return { documents: validated as PrivateSearchDocument[], message: issues.length ? `Some local modules could not be searched: ${issues.join(", ")}.` : `${validated.length} structured on-device records indexed; notes, symptoms, event descriptions and photo metadata are excluded.` };
}
