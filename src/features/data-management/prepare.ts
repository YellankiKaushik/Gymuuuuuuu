import { openFitnessDatabase } from "../../storage/indexed-db/fitness-database";
import { createRecordStorage } from "../../storage/indexed-db/adapter";
import { openDietDatabase } from "../diet-planning/storage";
import { openRecipeDatabase } from "../recipes-meal-plans/storage";
import { openRecoveryDatabase } from "../recovery/storage";
import { openCardioDatabase } from "../cardio/storage";
import { openDatabase as openSupplementDatabase } from "../supplements/storage";
/** Explicit browser action; never called by preview, SSR or module initialization. */
export async function prepareRestoreStorage(): Promise<void> {
  const db = await openFitnessDatabase("fitness-os", { shared: false });
  db.close();
  const records = createRecordStorage();
  try {
    await records.list();
  } finally {
    records.close();
  }
  // Let each owner create/migrate its own stores. Never derive a schema from a file.
  for (const open of [
    openDietDatabase,
    openRecipeDatabase,
    openRecoveryDatabase,
    openCardioDatabase,
    openSupplementDatabase,
  ])
    (await open()).close();
}
