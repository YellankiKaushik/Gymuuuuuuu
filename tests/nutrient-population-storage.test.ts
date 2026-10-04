import { afterEach, it, expect, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";
import { createRecordStorage } from "../src/storage/indexed-db/adapter";
import {
  readRememberedPopulation,
  rememberPopulation,
  forgetPopulation,
} from "../src/features/nutrients/population-storage";
afterEach(() => vi.unstubAllGlobals());
it("keeps population preferences in IndexedDB and forgets only that record", async () => {
  vi.stubGlobal("window", { indexedDB: new IDBFactory() });
  const store = createRecordStorage(),
    now = new Date().toISOString();
  await store.put({
    id: "unrelated.preset",
    module: "presets",
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
    payload: { kind: "unrelated" },
  });
  expect(await readRememberedPopulation()).toBeUndefined();
  await rememberPopulation({
    kind: "nutrient-reference-population",
    ageMonths: 372,
    sex: "female",
    lifeStage: "general",
  });
  expect(await readRememberedPopulation()).toEqual({
    kind: "nutrient-reference-population",
    ageMonths: 372,
    sex: "female",
    lifeStage: "general",
  });
  await expect(
    rememberPopulation({
      kind: "nutrient-reference-population",
      ageMonths: 372,
      sex: "male",
      lifeStage: "pregnancy",
    }),
  ).rejects.toThrow();
  expect((await readRememberedPopulation())?.sex).toBe("female");
  await forgetPopulation();
  expect(await readRememberedPopulation()).toBeUndefined();
  expect((await store.get("unrelated.preset"))?.payload).toEqual({
    kind: "unrelated",
  });
  store.close();
});
