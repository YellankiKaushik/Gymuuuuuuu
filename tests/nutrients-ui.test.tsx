// @vitest-environment jsdom
import { afterEach, it, expect } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  NutrientDetail,
  FoodSourceExplorer,
} from "../src/features/nutrients/detail";
import { nutrientFixture, nutrientFrameworkFixture } from "./fixtures/nutrient";
import { foodFixture } from "./fixtures/food";
import { rankVerifiedFoodSources } from "../src/features/nutrients/ranking";
afterEach(cleanup);
it("shows reference context rather than goals and keeps framework tables separate", async () => {
  const user = userEvent.setup();
  render(
    <NutrientDetail
      record={nutrientFixture}
      datasets={[nutrientFrameworkFixture]}
    />,
  );
  expect(
    screen.getByText("Upper-limit information, not an intake goal."),
  ).toBeTruthy();
  expect(screen.queryByRole("progressbar")).toBeNull();
  await user.selectOptions(
    screen.getByLabelText("Reference framework"),
    "fda_dv_adult_4_plus",
  );
  expect(
    screen.getByText(
      "No reviewed reference values are available for this framework and nutrient. No value is inferred.",
    ),
  ).toBeTruthy();
  expect(screen.queryByText("50 g")).toBeNull();
});
it("selects source-backed ranking basis and explicitly excludes estimates", async () => {
  const user = userEvent.setup(),
    food = structuredClone(foodFixture);
  food.compositionProfiles[0]!.nutrients[1]!.value = 5;
  food.compositionProfiles[0]!.nutrients[1]!.status = "estimated";
  food.compositionProfiles[0]!.nutrients[1]!.methodNote = "Synthetic estimate";
  const rankings = (
    ["per_100g", "per_100kcal", "per_verified_portion"] as const
  ).flatMap((b) => rankVerifiedFoodSources([food], "protein_g", b));
  render(
    <FoodSourceExplorer nutrientName="Synthetic protein" rankings={rankings} />,
  );
  expect(screen.getByText("5 g")).toBeTruthy();
  await user.selectOptions(
    screen.getByLabelText("Food ranking basis"),
    "per_verified_portion",
  );
  expect(screen.getByText("1.875 g")).toBeTruthy();
  await user.click(
    screen.getByLabelText("Include estimated and imputed amounts"),
  );
  expect(
    screen.getByText(
      "No verified food measurements are available on this ranking basis. Incompatible forms, missing values and unavailable portions are excluded.",
    ),
  ).toBeTruthy();
});
