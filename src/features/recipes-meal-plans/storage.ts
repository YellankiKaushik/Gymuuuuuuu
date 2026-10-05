import {
  recipeReference,
  recipeBackupSchema,
  recipeIdentitySchema,
  recipeVersionSchema,
  mealPlanIdentitySchema,
  mealPlanVersionSchema,
  grocerySchema,
  preferencesSchema,
  consumptionIntentSchema,
  type RecipeBackup,
  type RecipeIdentity,
  type RecipeVersion,
  type MealPlanIdentity,
  type MealPlanVersion,
  type Batch,
  type GroceryList,
  type Preferences,
  type ConsumptionIntent,
} from "./schema";
import {
  validateRecipeBackup,
  planRecipeRestoreConflicts,
  recalculateRecipe,
  recalculateMealPlan,
} from "./domain";
import { newNutritionId } from "../nutrition-tracker/domain";
import {
  readNutritionBackup,
  saveFoodEntry,
} from "../nutrition-tracker/storage";
const collections = {
  recipeIdentities: "recipeIdentities",
  recipeVersions: "recipeVersions",
  mealPlanIdentities: "mealPlanIdentities",
  mealPlanVersions: "mealPlanVersions",
  batchInstances: "batchInstances",
  groceryLists: "groceryLists",
  favourites: "recipeFavourites",
  auditLog: "recipeMealAuditLog",
  consumptionIntents: "recipeMealMigrationState",
} as const;
const stores = [...Object.values(collections), "mealPlanPreferences"];
export function defaultRecipePreferences(): Preferences {
  return preferencesSchema.parse({
    id: "recipe-meal-preferences",
    schemaVersion: 1,
    massUnit: "g",
    energyUnit: "kcal",
    defaultPlanDays: 7,
    defaultMealSlots: ["meal_breakfast", "meal_lunch", "meal_dinner"],
    dietaryPreferences: [],
    excludedIngredientIds: [],
    excludedAllergenTags: [],
    updatedAt: new Date().toISOString(),
  });
}
export function emptyRecipeBackup(): RecipeBackup {
  return {
    format: "fitness-os-recipes-meal-plans-backup",
    schemaVersion: 1,
    module: "recipes-meal-plans",
    exportedAt: new Date().toISOString(),
    preferences: defaultRecipePreferences(),
    recipeIdentities: [],
    recipeVersions: [],
    mealPlanIdentities: [],
    mealPlanVersions: [],
    batchInstances: [],
    groceryLists: [],
    favourites: [],
    auditLog: [],
    consumptionIntents: [],
  };
}
export function openRecipeDatabase(): Promise<IDBDatabase> {
  if (typeof window === "undefined" || !window.indexedDB)
    return Promise.reject(
      Error("Recipes and meal plans require browser IndexedDB."),
    );
  return new Promise((resolve, reject) => {
    const req = window.indexedDB.open(
      recipeReference.database.name,
      recipeReference.database.version,
    );
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const definition of recipeReference.database.stores) {
        const store = db.createObjectStore(definition.id, {
          keyPath: definition.keyPath,
        });
        definition.indexes.forEach((index) => store.createIndex(index, index));
      }
      req.transaction!.objectStore("recipeMealMigrationState").put({
        id: "schema",
        schemaVersion: 1,
        updatedAt: new Date().toISOString(),
      });
    };
    req.onblocked = () =>
      reject(
        Error("Close other Fitness OS tabs before upgrading recipe storage."),
      );
    req.onerror = () =>
      reject(
        Error(
          "Recipe database could not open. Existing records are preserved.",
        ),
      );
    req.onsuccess = () => {
      const db = req.result;
      db.onversionchange = () => db.close();
      resolve(db);
    };
  });
}
function requests(tx: IDBTransaction) {
  return {
    preferences: tx
      .objectStore("mealPlanPreferences")
      .get("recipe-meal-preferences"),
    ...Object.fromEntries(
      Object.entries(collections).map(([key, store]) => [
        key,
        tx.objectStore(store).getAll(),
      ]),
    ),
  } as { preferences: IDBRequest<unknown> } & Record<
    keyof typeof collections,
    IDBRequest<unknown[]>
  >;
}
function collect(req: ReturnType<typeof requests>) {
  const value: Record<string, unknown> = {
    ...emptyRecipeBackup(),
    preferences: req.preferences.result ?? defaultRecipePreferences(),
  };
  for (const key of Object.keys(collections) as (keyof typeof collections)[])
    value[key] =
      key === "consumptionIntents"
        ? req[key].result.filter(
            (v) =>
              typeof v === "object" &&
              v !== null &&
              "kind" in v &&
              v.kind === "consumption_intent",
          )
        : req[key].result;
  return value;
}
export async function readRawRecipeData() {
  const db = await openRecipeDatabase();
  try {
    return await new Promise<Record<string, unknown>>((resolve, reject) => {
      const tx = db.transaction(stores, "readonly"),
        req = requests(tx);
      tx.oncomplete = () => resolve(collect(req));
      tx.onabort = () => reject(tx.error ?? Error("Recipe read failed."));
    });
  } finally {
    db.close();
  }
}
export async function readRecipeBackup() {
  return validateRecipeBackup(await readRawRecipeData());
}
export async function exportRawRecipeRecovery() {
  return JSON.stringify(
    {
      format: "fitness-os-recipe-raw-recovery",
      notice:
        "Unvalidated personal recovery data; repair and validate before importing.",
      records: await readRawRecipeData(),
    },
    null,
    2,
  );
}
export function isolateRecipeRecords(raw: Record<string, unknown>) {
  const base = emptyRecipeBackup(),
    issues: string[] = [];
  const schemas = {
    recipeIdentities: recipeIdentitySchema,
    recipeVersions: recipeVersionSchema,
    mealPlanIdentities: mealPlanIdentitySchema,
    mealPlanVersions: mealPlanVersionSchema,
    groceryLists: grocerySchema,
  } as const;
  for (const key of Object.keys(schemas) as (keyof typeof schemas)[]) {
    const records = Array.isArray(raw[key]) ? raw[key] : [];
    for (const record of records) {
      const result = schemas[key].safeParse(record);
      if (result.success) {
        (base[key] as object[]).push(result.data);
      } else
        issues.push(
          `${key}: ${typeof record === "object" && record !== null && "id" in record ? String(record.id) : "unknown record"} is corrupt.`,
        );
    }
  }
  base.recipeVersions = base.recipeVersions.filter((v) => {
    try {
      const calculated = recalculateRecipe(v);
      if (JSON.stringify(calculated) !== JSON.stringify(v))
        throw Error("Arithmetic mismatch");
      return true;
    } catch {
      issues.push(`Recipe version ${v.id} has invalid arithmetic.`);
      return false;
    }
  });
  base.mealPlanVersions = base.mealPlanVersions.filter((v) => {
    try {
      const calculated = recalculateMealPlan(v);
      if (JSON.stringify(calculated) !== JSON.stringify(v))
        throw Error("Arithmetic mismatch");
      return true;
    } catch {
      issues.push(`Plan version ${v.id} has invalid arithmetic.`);
      return false;
    }
  });
  base.recipeIdentities = base.recipeIdentities.filter((i) => {
    const valid = base.recipeVersions.some(
      (v) => v.id === i.currentVersionId && v.recipeId === i.id,
    );
    if (!valid)
      issues.push(`Recipe ${i.id} has an unavailable current version.`);
    return valid;
  });
  base.recipeVersions = base.recipeVersions.filter((v) =>
    base.recipeIdentities.some((i) => i.id === v.recipeId),
  );
  base.mealPlanIdentities = base.mealPlanIdentities.filter((i) =>
    base.mealPlanVersions.some(
      (v) => v.id === i.currentVersionId && v.mealPlanId === i.id,
    ),
  );
  base.mealPlanVersions = base.mealPlanVersions.filter((v) =>
    base.mealPlanIdentities.some((i) => i.id === v.mealPlanId),
  );
  return { backup: base, issues, readOnly: true as const };
}
function notify() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("fitness-os:recipes-changed"));
  if ("BroadcastChannel" in window) {
    const channel = new BroadcastChannel("fitness-os:recipe-changes");
    channel.postMessage({ kind: "changed" });
    channel.close();
  }
}
async function mutate(transform: (b: RecipeBackup) => RecipeBackup) {
  const db = await openRecipeDatabase();
  try {
    return await new Promise<RecipeBackup>((resolve, reject) => {
      const tx = db.transaction(stores, "readwrite"),
        req = requests(tx);
      let left = Object.keys(req).length,
        saved: RecipeBackup | undefined,
        cause: unknown;
      Object.values(req).forEach(
        (r) =>
          (r.onsuccess = () => {
            if (--left) return;
            try {
              const before = validateRecipeBackup(collect(req));
              saved = validateRecipeBackup(transform(structuredClone(before)));
              tx.objectStore("mealPlanPreferences").put(saved.preferences);
              for (const key of Object.keys(
                collections,
              ) as (keyof typeof collections)[]) {
                const old = new Map(
                    before[key].map((r) => [r.id, JSON.stringify(r)]),
                  ),
                  next = new Map(saved[key].map((r) => [r.id, r]));
                for (const [id, record] of next)
                  if (old.get(id) !== JSON.stringify(record))
                    tx.objectStore(collections[key]).put(record);
                for (const id of old.keys())
                  if (!next.has(id))
                    tx.objectStore(collections[key]).delete(id);
              }
            } catch (error) {
              cause = error;
              tx.abort();
            }
          }),
      );
      tx.onabort = () =>
        reject(
          cause ??
            tx.error ??
            Error("Recipe change failed. Existing records are preserved."),
        );
      tx.onerror = () => {
        cause ??= tx.error;
      };
      tx.oncomplete = () => {
        if (!saved) {
          reject(Error("No recipe change committed."));
          return;
        }
        notify();
        resolve(saved);
      };
    });
  } finally {
    db.close();
  }
}
function audit(
  b: RecipeBackup,
  action: string,
  type: string,
  id: string,
  detail: string | null = null,
) {
  b.auditLog.push({
    id: newNutritionId("audit"),
    action,
    entityType: type,
    entityId: id,
    detail,
    occurredAt: new Date().toISOString(),
  });
}
export async function saveRecipeVersion(
  identity: RecipeIdentity,
  version: RecipeVersion,
  expectedUpdatedAt?: string,
) {
  const id = recipeIdentitySchema.parse(identity),
    v = recalculateRecipe(version);
  if (id.visibility !== "local")
    throw Error("Public recipes require repository publication review.");
  return mutate((b) => {
    const existing = b.recipeIdentities.find((i) => i.id === id.id);
    if (existing && existing.updatedAt !== expectedUpdatedAt)
      throw Error(
        "Recipe changed in another tab. Reload before saving a new version.",
      );
    if (b.recipeVersions.some((r) => r.id === v.id))
      throw Error("Recipe versions are immutable. Create a new version ID.");
    if (v.recipeId !== id.id || id.currentVersionId !== v.id)
      throw Error("Recipe identity/version mismatch.");
    const expected =
      Math.max(
        0,
        ...b.recipeVersions
          .filter((r) => r.recipeId === id.id)
          .map((r) => r.versionNumber),
      ) + 1;
    if (v.versionNumber !== expected)
      throw Error("Recipe version number must advance sequentially.");
    b.recipeIdentities = b.recipeIdentities.filter((i) => i.id !== id.id);
    b.recipeIdentities.push(id);
    b.recipeVersions.push(v);
    audit(b, "version_saved", "recipe", id.id, v.revisionReason);
    return b;
  });
}
export async function saveMealPlanVersion(
  identity: MealPlanIdentity,
  version: MealPlanVersion,
  batches: Batch[],
  expectedUpdatedAt?: string,
) {
  const id = mealPlanIdentitySchema.parse(identity),
    v = recalculateMealPlan(version);
  return mutate((b) => {
    const existing = b.mealPlanIdentities.find((i) => i.id === id.id);
    if (existing && existing.updatedAt !== expectedUpdatedAt)
      throw Error("Meal plan changed in another tab. Reload before saving.");
    if (b.mealPlanVersions.some((p) => p.id === v.id))
      throw Error("Meal-plan versions are immutable.");
    if (v.mealPlanId !== id.id || id.currentVersionId !== v.id)
      throw Error("Plan identity/version mismatch.");
    const expected =
      Math.max(
        0,
        ...b.mealPlanVersions
          .filter((p) => p.mealPlanId === id.id)
          .map((p) => p.versionNumber),
      ) + 1;
    if (v.versionNumber !== expected)
      throw Error("Meal-plan version number must advance sequentially.");
    b.mealPlanIdentities = b.mealPlanIdentities.filter((i) => i.id !== id.id);
    b.mealPlanIdentities.push(id);
    b.mealPlanVersions.push(v);
    b.batchInstances.push(...batches);
    audit(b, "version_saved", "meal_plan", id.id, v.revisionReason);
    return b;
  });
}
export async function archiveRecipeEntity(
  kind: "recipe" | "meal_plan",
  id: string,
  archived: boolean,
) {
  return mutate((b) => {
    const entity =
      kind === "recipe"
        ? b.recipeIdentities.find((r) => r.id === id)
        : b.mealPlanIdentities.find((p) => p.id === id);
    if (!entity) throw Error("Record unavailable.");
    entity.status = archived ? "archived" : "active";
    entity.updatedAt = new Date().toISOString();
    audit(b, archived ? "archived" : "reactivated", kind, id);
    return b;
  });
}
export async function saveGroceryList(
  list: GroceryList,
  confirmPreserve = false,
) {
  const parsed = grocerySchema.parse(list);
  return mutate((b) => {
    if (b.groceryLists.some((l) => l.id === parsed.id))
      throw Error(
        "Generation needs a new grocery-list ID. Edit pantry states separately.",
      );
    if (
      b.groceryLists.some(
        (l) => l.mealPlanVersionId === parsed.mealPlanVersionId,
      ) &&
      !confirmPreserve
    )
      throw Error(
        "Confirm generation of another list for this version. Existing lists are retained.",
      );
    b.groceryLists.push(parsed);
    audit(b, "grocery_generated", "grocery_list", parsed.id);
    return b;
  });
}
export async function updateGroceryItem(
  listId: string,
  itemId: string,
  change: {
    onHandGrams: number | null;
    purchased: boolean;
    storeSection: string;
    practicalPurchaseQuantity?: string;
    note?: string;
  },
) {
  return mutate((b) => {
    const list = b.groceryLists.find((l) => l.id === listId),
      item = list?.items.find((i) => i.id === itemId);
    if (!list || !item) throw Error("Grocery item unavailable.");
    Object.assign(item, change);
    item.remainingGrams =
      item.requiredGrams === null || item.onHandGrams === null
        ? null
        : Math.max(0, item.requiredGrams - item.onHandGrams);
    grocerySchema.parse(list);
    return b;
  });
}
export async function saveMealPreferences(value: Preferences) {
  const preferences = preferencesSchema.parse(value);
  return mutate((b) => ({ ...b, preferences }));
}
export async function setRecipeFavourite(recipeId: string, favourite: boolean) {
  return mutate((b) => {
    b.favourites = b.favourites.filter(
      (f) => !(f.kind === "recipe" && f.referenceId === recipeId),
    );
    if (favourite)
      b.favourites.push({
        id: newNutritionId("fav"),
        kind: "recipe",
        referenceId: recipeId,
        createdAt: new Date().toISOString(),
      });
    return b;
  });
}
export async function prepareConsumptionIntent(value: ConsumptionIntent) {
  const intent = consumptionIntentSchema.parse(value);
  return mutate((b) => {
    if (!b.recipeVersions.some((v) => v.id === intent.recipeVersionId))
      throw Error("Recipe version unavailable.");
    if (b.consumptionIntents.some((i) => i.id === intent.id))
      throw Error(
        "Consumption intent already exists. Resume its existing entry ID.",
      );
    b.consumptionIntents.push(intent);
    return b;
  });
}
export async function commitConsumptionIntent(id: string) {
  const before = await readRecipeBackup(),
    intent = before.consumptionIntents.find((i) => i.id === id);
  if (!intent) throw Error("Consumption intent unavailable.");
  if (intent.stage === "committed") return before;
  try {
    const nutrition = await readNutritionBackup(),
      existing = nutrition.foodEntries.find((e) => e.id === intent.entry.id);
    if (existing) {
      if (
        existing.recipeRef?.recipeVersionId !== intent.recipeVersionId ||
        JSON.stringify(existing.nutrients) !==
          JSON.stringify(intent.entry.nutrients) ||
        existing.amount.gramWeight !== intent.entry.amount.gramWeight
      )
        throw Error(
          "A conflicting nutrition entry already uses this intent ID. No overwrite occurred.",
        );
    } else await saveFoodEntry(intent.entry, intent.day);
    return await mutate((b) => {
      const pending = b.consumptionIntents.find((i) => i.id === id);
      if (!pending) throw Error("Consumption intent changed.");
      pending.stage = "committed";
      pending.error = null;
      pending.updatedAt = new Date().toISOString();
      audit(
        b,
        "logged_consumed",
        pending.plannedItemId ? "planned_item" : "recipe_version",
        pending.plannedItemId ?? pending.recipeVersionId,
        JSON.stringify({
          nutritionEntryId: pending.entry.id,
          planVersionId: pending.planVersionId,
          recipeVersionId: pending.recipeVersionId,
        }),
      );
      return b;
    });
  } catch (error) {
    await mutate((b) => {
      const pending = b.consumptionIntents.find((i) => i.id === id);
      if (pending) {
        pending.error = (
          error instanceof Error ? error.message : "Nutrition log failed."
        ).slice(0, 500);
        pending.updatedAt = new Date().toISOString();
      }
      return b;
    });
    throw error;
  }
}
export async function validateRecipeImport(value: unknown) {
  if (
    typeof value === "string" &&
    new TextEncoder().encode(value).length > 20 * 1024 * 1024
  )
    throw Error("Recipe backup exceeds 20 MB.");
  return validateRecipeBackup(value);
}
export async function restoreRecipeBackup(
  value: unknown,
  mode: "keep_existing" | "import_copy" | "replace_local",
  confirmed: boolean,
) {
  const incoming = await validateRecipeImport(value);
  if (!confirmed) throw Error("Review and confirm the restore plan first.");
  if (mode === "replace_local") {
    audit(incoming, "restored_replace", "module", "recipes-meal-plans");
    return replaceRecipeData(incoming);
  }
  return mutate((current) => {
    if (mode === "import_copy") {
      const ids = new Map<string, string>();
      for (const key of Object.keys(
        collections,
      ) as (keyof typeof collections)[]) {
        for (const record of incoming[key]) {
          const prefix = record.id.slice(0, record.id.indexOf("_"));
          ids.set(record.id, newNutritionId(prefix));
        }
      }
      for (const intent of incoming.consumptionIntents)
        if (intent.stage === "pending")
          ids.set(intent.entry.id, newNutritionId("nentry"));
      const identifierKeys = new Set([
        "id",
        "recipeId",
        "recipeVersionId",
        "currentVersionId",
        "mealPlanId",
        "mealPlanVersionId",
        "planVersionId",
        "referenceId",
        "entityId",
        "sourceRecordId",
        "batchIds",
        "dependencyRecipeIds",
        "sourceRefs",
        "sourceRecordIds",
      ]);
      const remap = (value: unknown, field = ""): unknown => {
        if (typeof value === "string")
          return field === "mergeKey"
            ? value
                .split("|")
                .map((part) => ids.get(part) ?? part)
                .join("|")
            : identifierKeys.has(field)
              ? (ids.get(value) ?? value)
              : value;
        if (Array.isArray(value))
          return value.map((item) => remap(item, field));
        if (value !== null && typeof value === "object")
          return Object.fromEntries(
            Object.entries(value).map(([key, item]) => [key, remap(item, key)]),
          );
        return value;
      };
      const copy = recipeBackupSchema.parse(remap(incoming));
      for (const key of Object.keys(
        collections,
      ) as (keyof typeof collections)[])
        (current[key] as object[]).push(...copy[key]);
    } else
      for (const key of Object.keys(
        collections,
      ) as (keyof typeof collections)[]) {
        const existing = new Set(current[key].map((r) => r.id));
        (current[key] as object[]).push(
          ...incoming[key].filter((r) => !existing.has(r.id)),
        );
      }
    audit(current, "restored_merge", "module", "recipes-meal-plans", mode);
    return current;
  });
}
export async function purgeRecipeData(phrase: string) {
  if (phrase !== "DELETE RECIPES AND PLANS")
    throw Error("Type DELETE RECIPES AND PLANS and export a backup first.");
  return replaceRecipeData(emptyRecipeBackup());
}
async function replaceRecipeData(input: RecipeBackup) {
  const saved = validateRecipeBackup(input);
  const db = await openRecipeDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(stores, "readwrite");
      let cause: unknown;
      tx.oncomplete = () => resolve();
      tx.onabort = () =>
        reject(
          cause ??
            tx.error ??
            Error("Replacement failed. Existing records are preserved."),
        );
      try {
        for (const store of stores) tx.objectStore(store).clear();
        tx.objectStore("mealPlanPreferences").put(saved.preferences);
        for (const key of Object.keys(
          collections,
        ) as (keyof typeof collections)[])
          for (const record of saved[key])
            tx.objectStore(collections[key]).put(record);
        tx.objectStore("recipeMealMigrationState").put({
          id: "schema",
          schemaVersion: 1,
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        cause = error;
        tx.abort();
      }
    });
    notify();
    return saved;
  } finally {
    db.close();
  }
}
export const recipeBackupAdapter = {
  module: "recipes-meal-plans",
  schemaVersion: 1,
  canonicalStores: stores,
  read: readRecipeBackup,
  validate: validateRecipeBackup,
  plan: planRecipeRestoreConflicts,
  restore: restoreRecipeBackup,
  purge: purgeRecipeData,
} as const;
