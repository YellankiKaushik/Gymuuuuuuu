import { createHash } from "node:crypto";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
} from "node:fs";
import {
  foodSchema,
  normalizeFoodTerm,
  type Food,
} from "../src/features/foods/schema";
import { buildFoodSearchIndex } from "../src/features/foods/domain";
const root = "src/content/foods";
export function validateFoodRelease(input: unknown[]): {
  foods: Food[];
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [],
    warnings: string[] = [],
    foods: Food[] = [];
  for (const [i, item] of input.entries()) {
    const result = foodSchema.safeParse(item);
    if (result.success) foods.push(result.data);
    else errors.push(`Record ${i}: ${result.error.message}`);
  }
  for (const key of ["id", "slug", "canonicalName"] as const) {
    const used = new Set<string>();
    for (const f of foods) {
      const value =
        key === "canonicalName" ? normalizeFoodTerm(f[key]) : f[key];
      if (used.has(value)) errors.push(`Duplicate ${key}: ${value}`);
      used.add(value);
    }
  }
  const profiles = new Set<string>(),
    aliases = new Map<string, string>(),
    sources = new Map<string, string>();
  for (const f of foods) {
    for (const alias of [f.canonicalName, ...f.aliases]) {
      const key = normalizeFoodTerm(alias),
        prior = aliases.get(key);
      if (prior && prior !== f.id)
        warnings.push(`Alias collision ${alias}: ${prior}, ${f.id}`);
      aliases.set(key, f.id);
    }
    for (const p of f.compositionProfiles) {
      if (profiles.has(p.profileId))
        errors.push(`Duplicate profile ${p.profileId}`);
      profiles.add(p.profileId);
      for (const s of p.sourceRecords) {
        if (!s.externalFoodId) continue;
        const key = `${s.sourceId}:${s.externalFoodId}`,
          prior = sources.get(key);
        if (prior && prior !== p.profileId)
          warnings.push(
            `External record reused ${key}: ${prior}, ${p.profileId}`,
          );
        sources.set(key, p.profileId);
      }
    }
    for (let i = 0; i < f.compositionProfiles.length; i++)
      for (const p of f.compositionProfiles.slice(i + 1)) {
        const prior = f.compositionProfiles[i]!;
        if (
          p.foodState !== prior.foodState &&
          JSON.stringify(p.nutrients) === JSON.stringify(prior.nutrients)
        )
          warnings.push(
            `Identical composition across states: ${prior.profileId}, ${p.profileId}`,
          );
      }
  }
  return { foods, errors, warnings };
}
const identities = JSON.parse(
  readFileSync(`${root}/identities.json`, "utf8"),
) as unknown[];
const records = JSON.parse(
  readFileSync(`${root}/records.json`, "utf8"),
) as unknown[];
const draft = validateFoodRelease(identities),
  release = validateFoodRelease(records);
if ([...draft.errors, ...release.errors].length)
  throw Error([...draft.errors, ...release.errors].join("\n"));
const published = release.foods
  .filter((f) => f.status === "published")
  .map((f) => ({
    ...f,
    compositionProfiles: f.compositionProfiles.filter(
      (p) => p.review.status === "approved",
    ),
  }));
mkdirSync(`${root}/shards`, { recursive: true });
// Only generated JSON inside this fixed repository directory is replaced.
for (const file of readdirSync(`${root}/shards`))
  if (file.endsWith(".json")) unlinkSync(`${root}/shards/${file}`);
const categories = [...new Set(published.map((f) => f.categoryId))];
const manifest: Record<string, string> = {};
for (const category of categories) {
  const foods = published.filter((f) => f.categoryId === category);
  writeFileSync(
    `${root}/shards/${category}.json`,
    JSON.stringify(foods) + "\n",
  );
  for (const f of foods) manifest[f.slug] = category;
}
// Keep glob valid even when the reviewed public release is empty.
if (!categories.length) writeFileSync(`${root}/shards/empty.json`, "[]\n");
writeFileSync(
  `${root}/index.json`,
  JSON.stringify(buildFoodSearchIndex(published)) + "\n",
);
writeFileSync(`${root}/manifest.json`, JSON.stringify(manifest) + "\n");
const report = {
  schemaVersion: 1,
  datasetVersion: "0.0.0",
  transformVersion: "1.0.0",
  inputSha256: createHash("sha256")
    .update(readFileSync(`${root}/records.json`))
    .digest("hex"),
  draftIdentities: draft.foods.filter(
    (identity) => !published.some((food) => food.id === identity.id),
  ).length,
  publishedFoods: published.length,
  publishedProfiles: published.reduce(
    (sum, f) => sum + f.compositionProfiles.length,
    0,
  ),
  warnings: [...draft.warnings, ...release.warnings],
  sourceDownloads: [],
};
writeFileSync(
  `${root}/release-report.json`,
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  `Food release validated: ${report.draftIdentities} draft identities; ${report.publishedFoods} public foods; ${report.warnings.length} review flags.`,
);
