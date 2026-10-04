import { it, expect, vi } from "vitest";
import { IDBFactory, IDBObjectStore as FakeStore } from "fake-indexeddb";
import { canonical, nutritionContext } from "./fixtures/nutrition";
import {
  makeNutritionDay,
  copyNutritionMealSnapshot,
  copyNutritionDaySnapshot,
} from "../src/features/nutrition-tracker/domain";
import {
  readNutritionBackup,
  saveFoodEntry,
  saveFoodEntries,
  replaceNutritionDayTarget,
  rebuildStoredNutritionTotals,
  exportRawNutritionRecovery,
} from "../src/features/nutrition-tracker/storage";
import {
  openFitnessDatabase,
  closeFitnessDatabase,
} from "../src/storage/indexed-db/fitness-database";
import {
  nutritionReadModels,
  nutritionBackupAdapter,
} from "../src/features/nutrition-tracker/adapters";
it("keeps frozen targets through concurrent writes, aborts queued writes on cache failure, and rebuilds derived data", async () => {
  const factory = new IDBFactory();
  vi.stubGlobal("window", { indexedDB: factory, dispatchEvent: () => true });
  try {
    const first = canonical(),
      second = canonical(250),
      target = {
        planId: "dietplan_test",
        planVersion: 1,
        title: "Synthetic frozen target",
        energyKcal: 2200,
        proteinGrams: 100,
        fatGrams: 70,
        carbohydrateGrams: 250,
        fiberGrams: 30,
        formulaVersion: "synthetic1",
        referenceDataVersion: "synthetic1",
        snapshottedAt: new Date().toISOString(),
      },
      day = makeNutritionDay(first.localDate, first.timeZone, target);
    await Promise.all([
      saveFoodEntry(first, day),
      saveFoodEntry(second, {
        ...day,
        targetSnapshot: { ...target, energyKcal: 2400 },
      }),
    ]);
    let b = await readNutritionBackup();
    expect(b.foodEntries).toHaveLength(2);
    expect([2200, 2400]).toContain(b.days[0]?.targetSnapshot?.energyKcal);
    const original = FakeStore.prototype.put;
    const spy = vi
      .spyOn(FakeStore.prototype, "put")
      .mockImplementation(function (
        this: IDBObjectStore,
        ...args: Parameters<IDBObjectStore["put"]>
      ) {
        if (this.name === "derivedNutritionDayTotals")
          throw Error("Injected cache write failure");
        return original.apply(this, args);
      });
    const third = canonical(300);
    await expect(saveFoodEntry(third, day)).rejects.toThrow("Injected");
    spy.mockRestore();
    expect((await readNutritionBackup()).foodEntries).toHaveLength(2);
    await expect(
      replaceNutritionDayTarget(
        day.localDate,
        { ...target, energyKcal: 2400 },
        "",
        true,
      ),
    ).rejects.toThrow();
    await replaceNutritionDayTarget(
      day.localDate,
      { ...target, energyKcal: 2400 },
      "Explicit synthetic replacement",
      true,
    );
    b = await readNutritionBackup();
    expect(b.days[0]?.targetSnapshot?.energyKcal).toBe(2400);
    expect(b.auditLog).toHaveLength(1);
    const copies = copyNutritionMealSnapshot(
      b.foodEntries,
      day.localDate,
      nutritionContext.mealSlotId,
      {
        ...nutritionContext,
        localDate: "2026-10-03",
        occurredAtUtc: "2026-10-03T06:30:00Z",
      },
    );
    expect(
      copyNutritionDaySnapshot(b.foodEntries, day.localDate, nutritionContext),
    ).toHaveLength(2);
    await saveFoodEntries(
      copies,
      makeNutritionDay("2026-10-03", first.timeZone),
    );
    await rebuildStoredNutritionTotals();
    const model = nutritionReadModels(await readNutritionBackup());
    expect(
      model
        .find((d) => d.localDate === "2026-10-03")
        ?.nutrients.find((n) => n.nutrientId === "energy_kcal")?.knownTotal,
    ).toBe(400);
    expect(
      model.find((d) => d.localDate === "2026-10-03")?.categoryCounts.fruits,
    ).toBe(2);
    expect(nutritionBackupAdapter.excludedRebuildableStores).toContain(
      "derivedNutritionDayTotals",
    );
    const db = await openFitnessDatabase();
    expect((await openFitnessDatabase()).version).toBe(10);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction("foodLogEntries", "readwrite");
      tx.objectStore("foodLogEntries").put({
        id: "nentry_corrupt",
        schemaVersion: 99,
      });
      tx.oncomplete = () => resolve();
      tx.onabort = () => reject(tx.error);
    });
    await expect(readNutritionBackup()).rejects.toThrow();
    const raw = JSON.parse(await exportRawNutritionRecovery()) as {
      foodEntries: unknown[];
    };
    expect(raw.foodEntries).toHaveLength(5);
  } finally {
    vi.restoreAllMocks();
    closeFitnessDatabase();
    vi.unstubAllGlobals();
  }
});
