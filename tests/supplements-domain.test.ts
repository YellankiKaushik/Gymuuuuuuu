import { expect, it } from "vitest";
import {
  emptyBackup,
  validateBackup,
  canonicalMass,
  exposure,
  certificationApplies,
  wadaFresh,
  urgentEvent,
  parseBackup,
} from "../src/features/supplements/domain";
import {
  publicSupplements,
  validateSupplementsRelease,
  claimSchema,
} from "../src/features/supplements/publication";
import { supplementsCsv } from "../src/features/supplements/export";
import { mergeBackup } from "../src/features/supplements/storage";
import {
  product,
  label,
  trial,
  intake,
  event,
  now,
} from "./supplements-fixtures";
const root = () => ({
  ...emptyBackup(),
  personalProducts: [structuredClone(product)],
  productLabelVersions: [structuredClone(label)],
  supplementTrials: [structuredClone(trial)],
  intakeLogs: [structuredClone(intake)],
});
it("keeps all draft ingredient claims and doses hidden; requires atomic claim scope", () => {
  expect(publicSupplements.map((r) => r.id)).toEqual([
    "ingredient_creatine_monohydrate",
    "ingredient_caffeine",
  ]);
  expect(publicSupplements.flatMap((r) => r.claims)).toEqual([]);
  expect(publicSupplements.every((r) => r.antiDoping === null)).toBe(true);
  expect(() => validateSupplementsRelease()).not.toThrow();
  expect(
    claimSchema.safeParse({
      id: "global_works",
      ingredientIdentityId: "ingredient_creatine_monohydrate",
      evidenceConfidence: "high",
    }).success,
  ).toBe(false);
});
it("distinguishes zero from unknown and refuses proprietary blend allocation", () => {
  expect(canonicalMass(label.ingredients[0]!)).toBe(0);
  expect(
    canonicalMass({ ...label.ingredients[0]!, amount: 100, unit: "mg" }),
  ).toBe(0.1);
  expect(
    canonicalMass({
      ...label.ingredients[0]!,
      amount: 100,
      amountDisclosure: "proprietary_blend_total_only",
    }),
  ).toBeNull();
  expect(
    canonicalMass({ ...label.ingredients[0]!, amount: 100, unit: "IU" }),
  ).toBeNull();
  const r = root();
  r.intakeLogs[0]!.ingredientSnapshot = [
    { ...label.ingredients[0]!, amount: null, amountDisclosure: "unknown" },
  ];
  expect(exposure(r.intakeLogs)[0]).toMatchObject({ known: 0, unknown: 1 });
});
it("rejects unsupported amounts and changed historical labels", () => {
  const r = root();
  expect(() => validateBackup(r)).not.toThrow();
  r.intakeLogs[0]!.ingredientSnapshot[0]!.amount = 2;
  expect(() => validateBackup(r)).toThrow("historical label changed");
  const bad = root();
  bad.productLabelVersions[0]!.ingredients[0]!.amountDisclosure = "unknown";
  expect(() => validateBackup(bad)).toThrow("must stay unknown");
});
it("never upgrades unmatched lot, unknown registry or stale annual status", () => {
  const c = {
    id: "cert",
    schemeId: "synthetic",
    status: "verified_current" as const,
    productOrLotIdentifier: "different",
    verifiedAt: now,
    registryUrl: "https://example.invalid/registry",
    evidenceNote: "Synthetic registry fixture",
    lotSpecific: true,
    matchedLot: "different",
    scope: ["identity" as const],
    validUntil: null,
  };
  expect(certificationApplies(label, c, "2026-10-05")).toBe(false);
  expect(
    certificationApplies(
      label,
      { ...c, matchedLot: "LOT-TEST", productOrLotIdentifier: "LOT-TEST" },
      "2026-10-05",
    ),
  ).toBe(true);
  expect(wadaFresh(2026, 2027, "approved")).toBe(false);
  expect(wadaFresh(2026, 2026, "draft")).toBe(false);
});
it("requires urgent trials to stop without claiming causality", () => {
  const r = root();
  r.adverseEvents = [structuredClone(event)];
  expect(urgentEvent(event)).toBe(true);
  expect(() => validateBackup(r)).toThrow("stopping");
  r.supplementTrials[0]!.status = "stopped_for_adverse_event";
  expect(() => validateBackup(r)).not.toThrow();
});
it("copies owned IDs and preserves public IDs and external context references", () => {
  const r = root();
  r.supplementTrials[0]!.contextLinks = [
    {
      module: "cardio",
      recordId: "external-cardio",
      note: "synthetic-product",
    },
  ];
  const merged = mergeBackup(emptyBackup(), r, "import_as_copy");
  expect(merged.personalProducts[0]!.id).not.toBe(product.id);
  expect(merged.intakeLogs[0]!.labelVersionId).toBe(
    merged.productLabelVersions[0]!.id,
  );
  expect(merged.supplementTrials[0]!.contextLinks[0]).toEqual(
    r.supplementTrials[0]!.contextLinks[0],
  );
});
it("exports seven CSV views without converting missing amounts to zero; protects formula text", () => {
  const r = root();
  r.personalProducts[0]!.displayName = "=CMD()";
  const csv = supplementsCsv(r);
  expect(Object.keys(csv)).toHaveLength(7);
  expect(csv["supplement-products-labels.csv"]).toContain("'=CMD()");
  expect(csv["supplement-label-amounts.csv"]).toContain(",0,");
  expect(() => parseBackup("{malformed")).toThrow();
  expect(() =>
    parseBackup(JSON.stringify({ ...r, companionVersion: 2 })),
  ).toThrow();
});
