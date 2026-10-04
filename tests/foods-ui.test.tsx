// @vitest-environment jsdom
import { afterEach, it, expect } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FoodDetail } from "../src/features/foods/detail";
import { FoodComparison } from "../src/features/foods/compare";
import { foodFixture } from "./fixtures/food";
afterEach(cleanup);
it("scales portions and custom grams without mutating the canonical profile", async () => {
  const user = userEvent.setup();
  const original = structuredClone(foodFixture);
  render(<FoodDetail food={foodFixture} />);
  await user.selectOptions(
    screen.getByLabelText("Serving basis"),
    "portion_test_fixture",
  );
  expect(screen.getAllByText("46.3 kcal")).toHaveLength(1);
  await user.selectOptions(screen.getByLabelText("Serving basis"), "custom");
  const field = screen.getByLabelText("Custom edible grams");
  await user.clear(field);
  await user.type(field, "50");
  expect(screen.getAllByText("61.73 kcal")).toHaveLength(1);
  await user.clear(field);
  await user.type(field, "0");
  expect(screen.getByRole("alert").textContent).toContain("above 0");
  expect(foodFixture).toEqual(original);
});
it("compares separate source-backed servings and names missing comparisons", async () => {
  const user = userEvent.setup(),
    second = structuredClone(foodFixture);
  second.id = "food_second_fixture";
  second.canonicalName = "Second synthetic fixture";
  second.compositionProfiles[0]!.profileId = "profile_second_fixture";
  second.compositionProfiles[0]!.portions[0]!.grams = 50;
  render(
    <FoodComparison
      columns={[
        { food: foodFixture, profile: foodFixture.compositionProfiles[0]! },
        { food: second, profile: second.compositionProfiles[0]! },
      ]}
    />,
  );
  await user.selectOptions(
    screen.getByLabelText("Comparison basis"),
    "servings",
  );
  expect(screen.getAllByText("46.3 kcal")).toHaveLength(1);
  expect(screen.getAllByText("61.73 kcal")).toHaveLength(1);
  expect(
    screen.getAllByText("Difference from first profile: Not comparable").length,
  ).toBeGreaterThan(1);
});
