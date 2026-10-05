import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  unlinkSync,
} from "node:fs";
import { createHash } from "node:crypto";
import {
  nutrientSchema,
  verifiedReference,
  type Nutrient,
} from "../src/features/nutrients/schema";
import { frameworkDatasetSchema } from "../src/features/nutrients/frameworks";
import { rankVerifiedFoodSources } from "../src/features/nutrients/ranking";
import { foodSchema, normalizeFoodTerm } from "../src/features/foods/schema";
import { verifyFdaReferenceValues } from "./content/fda";
const root = "src/content/nutrients",
  identities = nutrientSchema
    .array()
    .parse(JSON.parse(readFileSync(`${root}/identities.json`, "utf8"))),
  records = nutrientSchema
    .array()
    .parse(JSON.parse(readFileSync(`${root}/records.json`, "utf8")));
for (const rows of [identities, records])
  for (const key of ["id", "slug"] as const)
    if (new Set(rows.map((r) => r[key])).size !== rows.length)
      throw Error(`Duplicate nutrient ${key}`);
const datasets = frameworkDatasetSchema
  .array()
  .parse(JSON.parse(readFileSync(`${root}/framework-datasets.json`, "utf8")));
if (new Set(datasets.map((d) => d.id)).size !== datasets.length)
  throw Error("Duplicate framework datasets");
const published = records.filter((r) => r.status === "published");
verifyFdaReferenceValues(
  published,
  JSON.parse(
    readFileSync("src/content/provenance/fda-daily-values.json", "utf8"),
  ),
);
for (const n of published)
  for (const r of n.referenceValues) {
    const dataset = datasets.find((d) => d.id === r.frameworkId);
    if (
      !verifiedReference(r) ||
      !dataset?.version ||
      dataset.status !== "approved" ||
      dataset.rightsStatus !== "approved"
    )
      throw Error(`${n.id}: reference dataset version/rights/review missing`);
    if (
      !n.sources.some(
        (s) =>
          s.sourceId === r.sourceId &&
          `${s.locator} ${s.notes ?? ""}`.includes(dataset.version),
      )
    )
      throw Error(
        `${n.id}: source citation must identify the configured dataset version`,
      );
  }
const foods = foodSchema
  .array()
  .parse(JSON.parse(readFileSync("src/content/foods/records.json", "utf8")))
  .filter((f) => f.status === "published");
for (const folder of ["topics", "frameworks", "rankings"]) {
  mkdirSync(`${root}/${folder}`, { recursive: true });
  for (const file of readdirSync(`${root}/${folder}`))
    if (file.endsWith(".json")) unlinkSync(`${root}/${folder}/${file}`);
}
const coverage: Record<string, number> = {};
for (const n of published) {
  writeFileSync(`${root}/topics/${n.slug}.json`, JSON.stringify(n) + "\n");
  const rules = n.foodSourceRules.filter(
    (r) =>
      r.status === "enabled" &&
      r.phase07NutrientId &&
      r.rankingBasis !== "qualitative_only",
  );
  const rankings = rules.flatMap((rule) =>
    rankVerifiedFoodSources(
      foods,
      rule.phase07NutrientId!,
      rule.rankingBasis as "per_100g" | "per_100kcal" | "per_verified_portion",
      { unit: n.canonicalUnit, minimumDataStatus: rule.minimumDataStatus },
    ),
  );
  coverage[n.id] = new Set(rankings.map((r) => r.profileId)).size;
  writeFileSync(
    `${root}/rankings/${n.id}.json`,
    JSON.stringify(rankings) + "\n",
  );
}
if (!published.length) {
  writeFileSync(`${root}/topics/empty.json`, "null\n");
  writeFileSync(`${root}/rankings/empty.json`, "[]\n");
}
for (const d of datasets) {
  const rows = published.flatMap((n) =>
    n.referenceValues
      .filter((r) => r.frameworkId === d.id && verifiedReference(r))
      .map((reference) => ({
        nutrientId: n.id,
        nutrientName: n.canonicalName,
        reference,
      })),
  );
  writeFileSync(`${root}/frameworks/${d.id}.json`, JSON.stringify(rows) + "\n");
}
const index = published.map((n: Nutrient) => ({
  id: n.id,
  slug: n.slug,
  name: n.canonicalName,
  aliases: n.aliases,
  group: n.groupId,
  essentiality: n.essentiality,
  unit: n.canonicalUnit,
  displayKind: n.displayKind,
  frameworks: [
    ...new Set(
      n.referenceValues.filter(verifiedReference).map((r) => r.frameworkId),
    ),
  ],
  foodCoverage: coverage[n.id] ?? 0,
  terms: normalizeFoodTerm(
    [n.canonicalName, ...n.aliases, n.groupId].join(" "),
  ),
}));
writeFileSync(`${root}/index.json`, JSON.stringify(index) + "\n");
writeFileSync(
  `${root}/manifest.json`,
  JSON.stringify(Object.fromEntries(published.map((n) => [n.id, n.slug]))) +
    "\n",
);
const report = {
  schemaVersion: 1,
  transformVersion: "1.0.0",
  draft: identities.filter((n) => n.status === "draft_identity").length,
  partial: records.filter((n) => n.contentStatus === "partial").length,
  published: published.length,
  referenceRows: published.reduce(
    (sum, n) => sum + n.referenceValues.length,
    0,
  ),
  inputSha256: createHash("sha256")
    .update(readFileSync(`${root}/records.json`))
    .digest("hex"),
};
writeFileSync(
  `${root}/release-report.json`,
  JSON.stringify(report, null, 2) + "\n",
);
console.log(
  `Nutrient release validated: ${report.draft} draft identities, ${report.published} published topics, ${report.referenceRows} public reference rows.`,
);
