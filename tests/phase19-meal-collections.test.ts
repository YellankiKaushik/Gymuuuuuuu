import { describe, expect, it } from "vitest";
import { publicTemplates } from "../src/features/recipes-meal-plans/public-templates-records";
import { publicRecipes } from "../src/features/recipes-meal-plans/public-records";
import {
  validatePublicRelease,
  matchReviewedTemplates,
} from "../src/features/recipes-meal-plans/publication";
import { recalculateMealPlan } from "../src/features/recipes-meal-plans/domain";
import { entityRegistry } from "../src/features/search/domain";
describe("immutable public meal collections", () => {
  it("retains exact recipe sources, partial nutrients and neutral dates without personal targets", () => {
    expect(publicTemplates).toHaveLength(3);
    validatePublicRelease(publicRecipes, publicTemplates);
    for (const t of publicTemplates) {
      expect(t.plan.targetSnapshot).toBeNull();
      expect(t.plan.startDate).toBe("2000-01-01");
      expect(t.plan.plannedItems.every((i) => !i.loggedEntryIds.length)).toBe(
        true,
      );
      expect(t.limitations.join(" ")).toContain("not a complete daily diet");
      expect(recalculateMealPlan(t.plan).summary).toEqual(t.plan.summary);
      const energy = t.plan.summary.dailySummaries[0]!.nutrients.find(
        (n) => n.nutrientId === "energy_kcal",
      )!;
      const exactEnergy = t.plan.plannedItems.reduce(
        (sum, i) =>
          sum + i.nutrients.find((n) => n.nutrientId === "energy_kcal")!.value!,
        0,
      );
      expect(energy.value).toBeCloseTo(exactEnergy, 8);
      expect(t.energyBandKcal).toEqual([
        Math.floor(exactEnergy),
        Math.ceil(exactEnergy),
      ]);
      expect(
        t.plan.summary.dailySummaries[0]!.nutrients.some(
          (n) => n.status !== "complete",
        ),
      ).toBe(true);
    }
  });
  it("rejects altered recipe snapshots, links, summaries and duplicate template identities", () => {
    const template = publicTemplates[0]!;
    const altered = structuredClone(template);
    altered.plan.plannedItems[0]!.recipeRef!.ingredientRequirements[0]!.gramWeight = 1;
    expect(() => validatePublicRelease(publicRecipes, [altered])).toThrow(
      /snapshot/,
    );
    const linked = structuredClone(template);
    linked.recipeLinks[0]!.slug = "unpublished-recipe";
    expect(() => validatePublicRelease(publicRecipes, [linked])).toThrow(
      /canonical/,
    );
    const unsafe = structuredClone(template);
    unsafe.allergenTags = [];
    expect(() => validatePublicRelease(publicRecipes, [unsafe])).toThrow(
      /unknown allergen/,
    );
    const band = structuredClone(template);
    band.energyBandKcal = [2000, 2200];
    expect(() => validatePublicRelease(publicRecipes, [band])).toThrow(
      /energy band/,
    );
    const stale = structuredClone(template);
    stale.plan.summary.dailySummaries[0]!.nutrients[0]!.value = 999;
    expect(() => validatePublicRelease(publicRecipes, [stale])).toThrow(
      /stale/,
    );
    expect(() =>
      validatePublicRelease(publicRecipes, [template, template]),
    ).toThrow(/Duplicate/);
  });
  it("keeps unknown allergen exclusions out of matches and public templates distinct from private plans", () => {
    expect(matchReviewedTemplates({}, publicTemplates)).toHaveLength(3);
    expect(
      matchReviewedTemplates({ excludedAllergens: ["milk"] }, publicTemplates),
    ).toEqual([]);
    expect(matchReviewedTemplates({ days: 7 }, publicTemplates)).toEqual([]);
    expect(
      matchReviewedTemplates({ equipment: ["bowl"] }, publicTemplates),
    ).toEqual([]);
    expect(entityRegistry.find((r) => r[0] === "meal_plan_template")?.[2]).toBe(
      "public",
    );
    expect(entityRegistry.find((r) => r[0] === "meal_plan")?.[2]).toBe(
      "private_opt_in",
    );
  });
});
