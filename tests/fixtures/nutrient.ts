import type {
  Nutrient,
  ReferenceValue,
} from "../../src/features/nutrients/schema";
import type { FrameworkDataset } from "../../src/features/nutrients/frameworks";
export const nutrientFrameworkFixture: FrameworkDataset = {
  id: "us_canada_dri",
  version: "test-only-v1",
  authority: "Synthetic framework for engineering tests only",
  status: "approved",
  rightsStatus: "approved",
};
export const referenceFixture: ReferenceValue = {
  frameworkId: "us_canada_dri",
  valueType: "RDA",
  population: {
    ageMinMonths: 228,
    ageMaxMonths: 599,
    sex: "female",
    lifeStage: "general",
    notes: "Synthetic population band",
  },
  value: 50,
  minValue: null,
  maxValue: null,
  unit: "g",
  basis: "per_day",
  sourceId: "us_canada_dri_tables",
  status: "source_verified",
  notes: "Test-only synthetic numeric value; not a real recommendation.",
};
const summary =
  "Synthetic nutrient fixture for engineering tests only. It does not describe real nutrient requirements.";
const description =
  "Synthetic function statement used to test source and claim rendering only.";
const overview =
  "Synthetic risk context used to test reviewed medical boundaries only.";
export const nutrientFixture: Nutrient = {
  id: "protein_g",
  slug: "protein-synthetic-fixture",
  canonicalName: "Protein (synthetic fixture)",
  aliases: ["synthetic protein"],
  groupId: "macronutrients",
  canonicalUnit: "g",
  foodDataNutrientIds: ["protein_g"],
  essentiality: "essential_class",
  displayKind: "macronutrient",
  status: "published",
  contentStatus: "complete_for_mvp",
  summary,
  forms: [],
  functions: [
    {
      title: "Synthetic function",
      description,
      sourceIds: ["us_canada_dri_tables"],
    },
  ],
  referenceValues: [
    referenceFixture,
    {
      ...referenceFixture,
      valueType: "UL",
      value: 100,
      notes: "Synthetic upper-limit fixture; not a real protein upper limit.",
    },
  ],
  foodSourceRules: [
    {
      rankingBasis: "per_100g",
      phase07NutrientId: "protein_g",
      minimumDataStatus: "any_verified",
      status: "enabled",
      notes: "Synthetic source-row test.",
    },
  ],
  absorptionFactors: [],
  deficiency: {
    overview,
    riskGroups: ["Synthetic fixture group only"],
    signsAndSymptoms: [],
    medicalBoundary:
      "Symptoms are nonspecific and cannot diagnose a nutrient deficiency. Diagnosis may require clinical evaluation and appropriate laboratory testing.",
    sourceIds: ["us_canada_dri_tables"],
  },
  excess: {
    overview,
    riskGroups: [],
    signsAndSymptoms: [],
    medicalBoundary:
      "Seek professional clinical assessment; this fixture describes no actual toxicity.",
    sourceIds: ["us_canada_dri_tables"],
  },
  interactions: [],
  athleticRelevance: [],
  claims: [
    {
      claimId: "claim_fixture_summary",
      text: summary,
      category: "other",
      evidenceLevel: "not_applicable",
      population: "Synthetic test population",
      sourceIds: ["us_canada_dri_tables"],
      reviewStatus: "approved",
      limitations: "Synthetic, never published.",
    },
    {
      claimId: "claim_fixture_function",
      text: description,
      category: "function",
      evidenceLevel: "not_applicable",
      population: "Synthetic test population",
      sourceIds: ["us_canada_dri_tables"],
      reviewStatus: "approved",
      limitations: "Synthetic, never published.",
    },
    {
      claimId: "claim_fixture_deficiency",
      text: overview,
      category: "deficiency",
      evidenceLevel: "not_applicable",
      population: "Synthetic test population",
      sourceIds: ["us_canada_dri_tables"],
      reviewStatus: "approved",
      limitations: "Synthetic, never published.",
    },
    {
      claimId: "claim_fixture_excess",
      text: overview,
      category: "excess",
      evidenceLevel: "not_applicable",
      population: "Synthetic test population",
      sourceIds: ["us_canada_dri_tables"],
      reviewStatus: "approved",
      limitations: "Synthetic, never published.",
    },
  ],
  sources: [
    {
      sourceId: "us_canada_dri_tables",
      locator: "Synthetic fixture test-only-v1. No real source row.",
      accessedAt: "2026-08-05",
      notes:
        "Engineering test only; not a citation for real food or medical facts.",
    },
  ],
  editorial: {
    reviewStatus: "approved",
    reviewedAt: "2026-08-05",
    reviewer: "Synthetic test reviewer",
    notes: "Test-only; never included in public content.",
  },
};
