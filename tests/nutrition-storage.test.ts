import { it, expect, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import {
  createQuickAddSnapshot,
  makeNutritionDay,
  createCustomFoodLogSnapshot,
  newNutritionId,
} from "../src/features/nutrition-tracker/domain";
import {
  readNutritionBackup,
  saveFoodEntry,
  softDeleteNutritionEntry,
  saveHydrationEntry,
  saveCustomFood,
  restoreNutritionBackup,
  deleteAllNutrition,
  saveFavourite,
} from "../src/features/nutrition-tracker/storage";
import {
  openFitnessDatabase,
  closeFitnessDatabase,
} from "../src/storage/indexed-db/fitness-database";
import { nutritionContext, customRevision } from "./fixtures/nutrition";
it("atomically saves entries and caches, detects conflicts, restores safely and preserves workout stores", async () => {
  const factory = new IDBFactory();
  vi.stubGlobal("window", { indexedDB: factory, dispatchEvent: () => true });
  try {
    const db = await openFitnessDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("appMeta", "readwrite");
      tx.objectStore("appMeta").put({
        key: "preserved-workout",
        value: "fixture",
      });
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
    });
    const day = makeNutritionDay(
        nutritionContext.localDate,
        nutritionContext.timeZone,
      ),
      entry = createQuickAddSnapshot(
        "Storage fixture",
        { energy_kcal: 100 },
        nutritionContext,
      );
    await saveFoodEntry(entry, day);
    const saved = (await readNutritionBackup()).foodEntries[0]!;
    await expect(
      saveFoodEntry({ ...saved, note: "stale" }, day, 99),
    ).rejects.toThrow("another tab");
    expect((await readNutritionBackup()).foodEntries[0]?.note).not.toBe(
      "stale",
    );
    const cached = await new Promise<unknown>((resolve) => {
      const req = db
        .transaction("derivedNutritionDayTotals")
        .objectStore("derivedNutritionDayTotals")
        .get(day.localDate);
      req.onsuccess = () => resolve(req.result);
    });
    expect(cached).toMatchObject({ localDate: day.localDate });
    await softDeleteNutritionEntry(entry.id);
    expect(
      (await readNutritionBackup()).foodEntries[0]?.deletedAt,
    ).not.toBeNull();
    await softDeleteNutritionEntry(entry.id, true);
    const now = new Date().toISOString();
    await saveHydrationEntry(
      {
        id: newNutritionId("hydration"),
        schemaVersion: 1,
        localDate: day.localDate,
        timeZone: day.timeZone,
        occurredAtUtc: nutritionContext.occurredAtUtc,
        kind: "plain_water",
        volumeMl: 250,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      },
      day,
    );
    const r = customRevision(),
      food = {
        id: r.customFoodId,
        currentRevisionId: r.id,
        name: "Synthetic private label",
        normalizedName: "synthetic private label",
        status: "active" as const,
        createdAt: now,
        updatedAt: now,
      };
    await saveCustomFood(food, r);
    await expect(saveCustomFood(food, r, now)).rejects.toThrow("immutable");
    const custom = createCustomFoodLogSnapshot(
      r,
      food.name,
      null,
      2,
      nutritionContext,
    );
    await saveFoodEntry(custom, day);
    await saveFavourite({
      id: newNutritionId("nutrition_favourite"),
      sourceKind: "custom_food",
      customFoodRef: custom.customFoodRef,
      displayName: custom.displayNameSnapshot,
      amount: {
        ...custom.amount,
        gramWeight: custom.amount.gramWeight!,
        conversionKind: "custom_food_serving",
      },
      entrySnapshot: custom,
      createdAt: now,
      updatedAt: now,
    });
    const backup = await readNutritionBackup();
    await expect(
      restoreNutritionBackup(
        { ...backup, schemaVersion: 2 },
        "keep_existing",
        true,
      ),
    ).rejects.toThrow();
    expect((await readNutritionBackup()).foodEntries).toEqual(
      backup.foodEntries,
    );
    await expect(deleteAllNutrition("wrong")).rejects.toThrow();
    await deleteAllNutrition("DELETE NUTRITION");
    expect((await readNutritionBackup()).foodEntries).toHaveLength(0);
    await restoreNutritionBackup(backup, "keep_existing", true);
    expect((await readNutritionBackup()).foodEntries).toHaveLength(2);
    const conflicting = structuredClone(backup);
    conflicting.foodEntries[0]!.note = "Conflict";
    await restoreNutritionBackup(conflicting, "duplicate_conflicts", true);
    const merged = await readNutritionBackup();
    expect(merged.foodEntries).toHaveLength(4);
    expect(merged.customFoods).toHaveLength(2);
    expect(merged.favourites).toHaveLength(2);
    expect(
      await new Promise<unknown>((resolve) => {
        const req = db
          .transaction("appMeta")
          .objectStore("appMeta")
          .get("preserved-workout");
        req.onsuccess = () => resolve(req.result);
      }),
    ).toMatchObject({ value: "fixture" });
  } finally {
    closeFitnessDatabase();
    vi.unstubAllGlobals();
  }
});
