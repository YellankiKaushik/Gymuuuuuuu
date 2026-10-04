import { z } from "zod";
import { createRecordStorage } from "../../storage/indexed-db/adapter";
export const rememberedPopulationSchema = z
  .strictObject({
    kind: z.literal("nutrient-reference-population"),
    ageMonths: z.number().int().min(0).max(1800),
    sex: z.enum(["all", "male", "female"]),
    lifeStage: z.enum(["general", "pregnancy", "lactation"]),
  })
  .refine(
    (p) => p.sex !== "male" || p.lifeStage === "general",
    "Incompatible life-stage selection",
  );
export type RememberedPopulation = z.infer<typeof rememberedPopulationSchema>;
const id = "preferences.nutrient-reference-population";
export async function readRememberedPopulation() {
  const storage = createRecordStorage();
  try {
    const record = await storage.get(id);
    return record
      ? rememberedPopulationSchema.parse(record.payload)
      : undefined;
  } finally {
    storage.close();
  }
}
export async function rememberPopulation(population: RememberedPopulation) {
  const payload = rememberedPopulationSchema.parse(population),
    storage = createRecordStorage();
  try {
    const prior = await storage.get(id),
      now = new Date().toISOString();
    await storage.put({
      id,
      module: "presets",
      schemaVersion: 1,
      createdAt: prior?.createdAt ?? now,
      updatedAt: now,
      payload,
    });
  } finally {
    storage.close();
  }
}
export async function forgetPopulation() {
  const storage = createRecordStorage();
  try {
    await storage.remove(id);
  } finally {
    storage.close();
  }
}
