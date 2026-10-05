import { it, expect, vi } from "vitest";
import { IDBFactory, IDBObjectStore } from "fake-indexeddb";
import { recipeDraft } from "../src/features/recipes-meal-plans/editor";
import {
  ingredientFromFoodEntry,
  buildRecipeLogSnapshot,
} from "../src/features/recipes-meal-plans/domain";
import { canonical, nutritionContext } from "./fixtures/nutrition";
import {
  saveRecipeVersion,
  readRecipeBackup,
  restoreRecipeBackup,
  openRecipeDatabase,
  purgeRecipeData,
  prepareConsumptionIntent,
  commitConsumptionIntent,
} from "../src/features/recipes-meal-plans/storage";
import { readNutritionBackup } from "../src/features/nutrition-tracker/storage";
import { makeNutritionDay } from "../src/features/nutrition-tracker/domain";
import { closeFitnessDatabase } from "../src/storage/indexed-db/fitness-database";
it("keeps immutable versions, copies identifier graphs without rewriting text, recovers corruption and logs idempotently", async () => {
  vi.stubGlobal("window", {
    indexedDB: new IDBFactory(),
    dispatchEvent: () => true,
  });
  try {
    const r = recipeDraft(
      "Synthetic storage recipe",
      [ingredientFromFoodEntry(canonical(100), 0)],
      {
        instructions: "Test only",
        cookingMethod: "no_cook",
        allowUnadjustedRetention: false,
        reason: "Fixture only",
        yieldModel: {
          mode: "measured_final_weight",
          finalWeightGrams: 100,
          servings: 2,
          servingWeightGrams: 50,
          tolerancePercent: 2,
          measuredAt: "2026-10-04T00:00:00Z",
        },
      },
    );
    const identity = {
      id: r.recipeId,
      schemaVersion: 1 as const,
      visibility: "local" as const,
      title: r.title,
      currentVersionId: r.id,
      status: "active" as const,
      createdAt: r.createdAt,
      updatedAt: r.createdAt,
    };
    await saveRecipeVersion(identity, r);
    await expect(
      saveRecipeVersion(identity, r, identity.updatedAt),
    ).rejects.toThrow("immutable");
    let backup = await readRecipeBackup();
    backup.recipeVersions[0]!.description = r.id;
    await expect(
      restoreRecipeBackup(backup, "replace_local", false),
    ).rejects.toThrow("confirm");
    await restoreRecipeBackup(backup, "import_copy", true);
    expect((await readRecipeBackup()).recipeVersions).toHaveLength(2);
    expect(
      (await readRecipeBackup()).recipeVersions.find((v) => v.id !== r.id)
        ?.description,
    ).toBe(r.id);
    const entry = buildRecipeLogSnapshot(r, 1, nutritionContext),
      id = "intent_test";
    await prepareConsumptionIntent({
      id,
      kind: "consumption_intent",
      schemaVersion: 1,
      recipeVersionId: r.id,
      planVersionId: null,
      plannedItemId: null,
      entry,
      day: makeNutritionDay(entry.localDate, entry.timeZone),
      stage: "pending",
      requestedAt: r.createdAt,
      updatedAt: r.createdAt,
      error: null,
    });
    await commitConsumptionIntent(id);
    await commitConsumptionIntent(id);
    expect((await readNutritionBackup()).foodEntries).toHaveLength(1);
    backup = await readRecipeBackup();
    const failWrite = vi
      .spyOn(IDBObjectStore.prototype, "put")
      .mockImplementationOnce(() => {
        throw Error("Injected synchronous replacement failure");
      });
    await expect(
      restoreRecipeBackup(backup, "replace_local", true),
    ).rejects.toThrow("Injected");
    failWrite.mockRestore();
    expect((await readRecipeBackup()).recipeVersions).toHaveLength(2);
    const db = await openRecipeDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("recipeVersions", "readwrite");
      tx.objectStore("recipeVersions").put({ id: r.id, corrupt: true });
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
    });
    db.close();
    await expect(readRecipeBackup()).rejects.toThrow();
    await restoreRecipeBackup(backup, "replace_local", true);
    expect((await readRecipeBackup()).recipeVersions).toHaveLength(2);
    await expect(purgeRecipeData("no")).rejects.toThrow();
    await purgeRecipeData("DELETE RECIPES AND PLANS");
    expect((await readRecipeBackup()).recipeVersions).toHaveLength(0);
    expect((await readNutritionBackup()).foodEntries).toHaveLength(1);
  } finally {
    closeFitnessDatabase();
    vi.unstubAllGlobals();
  }
});
