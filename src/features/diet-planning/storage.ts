import { z } from "zod";
import {
  defaultDietSettings,
  dietBackupSchema,
  dietPlanSchema,
  settingsSchema,
  migrateDietPlanRecord,
  withDietInputConsent,
  type DietPlan,
  type DietBackup,
  type DietSettings,
} from "./domain";
import { auditNormativeSchema } from "./schema.generated";

const databaseName = "fitness-os-diet-planning",
  databaseVersion = 1;
type Audit = z.infer<typeof auditNormativeSchema>;
const settingsRecordSchema = z.strictObject({
  id: z.literal("settings"),
  value: settingsSchema,
});
export function openDietDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB)
    return Promise.reject(Error("Diet plans require browser IndexedDB."));
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(databaseName, databaseVersion);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore("dietPlans", { keyPath: "id" });
      db.createObjectStore("dietPlannerSettings", { keyPath: "id" });
      db.createObjectStore("dietPlanAuditLog", { keyPath: "id" });
    };
    request.onerror = () =>
      reject(
        Error(
          "Local diet storage could not open. Existing records are preserved.",
        ),
      );
    request.onblocked = () =>
      reject(Error("Close other Fitness OS tabs and retry."));
    request.onsuccess = () => {
      request.result.onversionchange = () => request.result.close();
      resolve(request.result);
    };
  });
}
function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("fitness-os:diet-changed"));
    if ("BroadcastChannel" in window) {
      const channel = new BroadcastChannel("fitness-os:diet-changes");
      channel.postMessage({ kind: "changed" });
      channel.close();
    }
  }
}
export async function readDietBackup(): Promise<DietBackup> {
  const db = await openDietDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(
          ["dietPlans", "dietPlannerSettings", "dietPlanAuditLog"],
          "readonly",
        ),
        plans = tx.objectStore("dietPlans").getAll(),
        settings = tx.objectStore("dietPlannerSettings").get("settings"),
        audit = tx.objectStore("dietPlanAuditLog").getAll();
      tx.onerror = () => reject(Error("Could not read local diet plans."));
      tx.oncomplete = () => {
        try {
          const values = (plans.result as unknown[]).map(migrateDietPlanRecord),
            record: unknown = settings.result;
          resolve(
            dietBackupSchema.parse({
              schemaVersion: "1.0.0",
              exportedAt: new Date().toISOString(),
              currentPlanId:
                values.find((p) => p.status === "current")?.id ?? null,
              plans: values,
              settings:
                record === undefined
                  ? defaultDietSettings
                  : settingsRecordSchema.parse(record).value,
              auditLog: (audit.result as unknown[]).map((item) =>
                auditNormativeSchema.parse(item),
              ),
            }),
          );
        } catch (error) {
          reject(error);
        }
      };
    });
  } finally {
    db.close();
  }
}
type Mutation = {
  summary?: string;
  action: Audit["action"];
  plan?: DietPlan;
  planId?: string;
  expectedUpdatedAt?: string;
  settings?: DietSettings;
  backup?: DietBackup;
  conflicts?: "keep" | "replace";
};
export async function mutateDietPlans(change: Mutation) {
  const validPlan = change.plan ? dietPlanSchema.parse(change.plan) : undefined,
    validSettings = change.settings
      ? settingsSchema.parse(change.settings)
      : undefined,
    validBackup = change.backup
      ? dietBackupSchema.parse(change.backup)
      : undefined;
  const db = await openDietDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(
          ["dietPlans", "dietPlannerSettings", "dietPlanAuditLog"],
          "readwrite",
        ),
        store = tx.objectStore("dietPlans"),
        request = store.getAll();
      let failure: unknown;
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(
          failure ??
            Error("Diet changes failed. Existing records were preserved."),
        );
      tx.onabort = () =>
        reject(
          failure ?? Error("Diet changes were aborted. Nothing was saved."),
        );
      request.onsuccess = () => {
        try {
          const plans = (request.result as unknown[]).map(
              migrateDietPlanRecord,
            ),
            existing = plans.find(
              (p) => p.id === (validPlan?.id ?? change.planId),
            ),
            now = new Date().toISOString(),
            id = validPlan?.id ?? change.planId ?? "dietplan_module";
          if (
            change.expectedUpdatedAt !== undefined &&
            existing?.updatedAt !== change.expectedUpdatedAt
          )
            throw Error(
              "This plan changed in another tab. Reload it before editing.",
            );
          if (validBackup) {
            const merged = new Map(plans.map((p) => [p.id, p]));
            for (const plan of validBackup.plans)
              if (!merged.has(plan.id) || change.conflicts === "replace")
                merged.set(plan.id, plan);
            const selected =
              change.conflicts === "replace"
                ? validBackup.currentPlanId
                : (plans.find((p) => p.status === "current")?.id ?? null);
            const values = [...merged.values()].map((p) => ({
              ...p,
              status: (p.id === selected
                ? "current"
                : p.status === "current"
                  ? "saved"
                  : p.status) as DietPlan["status"],
            }));
            dietBackupSchema.parse({
              ...validBackup,
              plans: values,
              currentPlanId: selected ?? null,
            });
            values.forEach((p) => store.put(p));
            tx.objectStore("dietPlannerSettings").put({
              id: "settings",
              value: validBackup.settings,
            });
            (validBackup.auditLog ?? []).forEach((a) =>
              tx.objectStore("dietPlanAuditLog").put(a),
            );
          } else {
            if (change.action === "created") {
              if (!validPlan || existing)
                throw Error("Plan ID already exists or plan is missing.");
              store.put({ ...validPlan, status: "saved" });
            }
            if (change.action === "updated") {
              if (!validPlan || !existing)
                throw Error("Plan no longer exists.");
              store.put({
                ...validPlan,
                status: existing.status,
                createdAt: existing.createdAt,
                updatedAt: now,
              });
            }
            if (change.action === "set_current") {
              if (!existing) throw Error("Plan no longer exists.");
              plans.forEach((p) => {
                if (p.status === "current" || p.id === existing.id)
                  store.put({
                    ...p,
                    status: p.id === existing.id ? "current" : "saved",
                    updatedAt: now,
                  });
              });
            }
            if (change.action === "archived") {
              if (!existing) throw Error("Plan no longer exists.");
              store.put({ ...existing, status: "archived", updatedAt: now });
            }
            if (change.action === "deleted") {
              if (!existing) throw Error("Plan no longer exists.");
              store.delete(existing.id);
            }
            if (validSettings)
              tx.objectStore("dietPlannerSettings").put({
                id: "settings",
                value: validSettings,
              });
          }
          tx.objectStore("dietPlanAuditLog").put(
            auditNormativeSchema.parse({
              id: `dietaudit_${crypto.randomUUID()}`,
              planId: id,
              timestamp: now,
              action: change.action,
              summary: validBackup
                ? "Validated module restore; unrelated plans retained."
                : (change.summary ?? null),
            }),
          );
        } catch (error) {
          failure = error;
          tx.abort();
        }
      };
    });
  } finally {
    db.close();
  }
  notify();
}
export function exportDietBackup(backup: DietBackup, includeInputs: boolean) {
  const parsed = dietBackupSchema.parse(backup);
  return JSON.stringify(
    {
      ...parsed,
      exportedAt: new Date().toISOString(),
      plans: parsed.plans.map((p) => redactDietInputs(p, includeInputs)),
    },
    null,
    2,
  );
}
export function redactDietInputs(
  plan: DietPlan,
  includeInputs: boolean,
): DietPlan {
  return withDietInputConsent(plan, includeInputs);
}
export function previewDietImport(text: string, existing: DietBackup) {
  if (text.length > 20 * 1024 * 1024)
    throw Error("Backup exceeds the 20 MB import limit.");
  const backup = dietBackupSchema.parse(JSON.parse(text) as unknown),
    ids = new Set(existing.plans.map((p) => p.id));
  return {
    backup,
    conflicts: backup.plans.filter((p) => ids.has(p.id)).map((p) => p.id),
  };
}
const csvCell = (value: unknown) => {
  const text = String(value ?? "");
  return `"${text.match(/^[\s]*[=+@-]/) ? "'" : ""}${text.replaceAll('"', '""')}"`;
};
export function exportDietCsv(backup: DietBackup) {
  const valid = dietBackupSchema.parse(backup),
    header = [
      "plan_id",
      "name",
      "status",
      "goal",
      "target_kcal",
      "protein_min_g",
      "protein_max_g",
      "protein_selected_g",
      "fat_g",
      "fat_percent",
      "carbohydrate_g",
      "fiber_benchmark_g",
      "formula_version",
      "reference_version",
      "calculated_at",
      "manual_reason",
    ];
  return [
    header,
    ...valid.plans.map((p) => [
      p.id,
      p.name,
      p.status,
      p.goal,
      p.energy.targetKcal,
      p.macros.protein.min,
      p.macros.protein.max,
      p.macros.protein.selected,
      p.macros.fat.selected,
      p.macros.fatPercentEnergy,
      p.macros.carbohydrate.selected,
      p.macros.fiber.selected,
      p.provenance.formulaSetVersion,
      p.provenance.referenceDataVersion,
      p.provenance.calculatedAt,
      p.energy.manualOverrideReason,
    ]),
  ]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
}
export function downloadDietFile(text: string, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type })),
    anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function watchDietChanges(onChange: () => void) {
  window.addEventListener("fitness-os:diet-changed", onChange);
  const channel =
    "BroadcastChannel" in window
      ? new BroadcastChannel("fitness-os:diet-changes")
      : null;
  if (channel) channel.onmessage = onChange;
  return () => {
    window.removeEventListener("fitness-os:diet-changed", onChange);
    channel?.close();
  };
}
