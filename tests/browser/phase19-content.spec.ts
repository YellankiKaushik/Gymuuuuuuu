import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicRoutes = [
  ["/exercises/machine-chest-press", "Machine chest press"],
  ["/exercises/seated-cable-row", "Seated cable row"],
  ["/exercises/lying-leg-curl", "Lying leg curl"],
  ["/exercises/seated-leg-curl", "Seated leg curl"],
  ["/exercises/stability-ball-leg-curl", "Stability-ball leg curl"],
  [
    "/supplements/ingredients/ingredient-hmb",
    "Beta-Hydroxy-Beta-Methylbutyrate",
  ],
  ["/supplements/ingredients/ingredient-betaine", "Betaine"],
  ["/supplements/ingredients/ingredient-glutamine", "Glutamine"],
  [
    "/supplements/ingredients/ingredient-sodium-bicarbonate",
    "Sodium Bicarbonate",
  ],
  ["/supplements/ingredients/ingredient-tart-cherry", "Tart Cherry"],
  [
    "/learn/workout-science/muscular-endurance-adaptation",
    "Muscular endurance",
  ],
  ["/programs/general-fitness-2-day", "Two-Day General Fitness"],
  ["/programs/general-fitness-3-day", "Three-Day General Fitness"],
  ["/cardio/learn/topic-heat-safety", "Exercise in Heat"],
  ["/foods/red-onion", "Red onion"],
  ["/foods/bottle-gourd", "Bottle gourd"],
  ["/foods/ash-gourd", "Ash gourd"],
  ["/exercises/back-squat", "Barbell back squat"],
  ["/exercises/conventional-deadlift", "Conventional barbell deadlift"],
  ["/exercises/goblet-squat", "Goblet squat"],
  ["/foods/milkfish", "Milkfish"],
  ["/foods/soy-beverage-unsweetened", "Soy beverage, unsweetened"],
  ["/recovery/topics/sleep-quality-vs-duration", "Sleep Quality vs Duration"],
  ["/recovery/topics/bedroom-environment", "Bedroom Environment"],
  ["/recovery/topics/wind-down-routine", "Wind-Down Routine"],
  ["/recovery/topics/caffeine-and-sleep", "Caffeine and Sleep"],
  ["/recovery/topics/alcohol-and-sleep", "Alcohol and Sleep"],
  [
    "/recovery/topics/sleep-evaluation-signals",
    "When Sleep Problems Need Professional Evaluation",
  ],
  ["/recovery/topics/sleep-diary-method", "Sleep-Diary Method"],

  ["/exercises/glute-bridge", "Glute bridge"],
  ["/exercises/single-leg-glute-bridge", "Single-leg glute bridge"],
  ["/exercises/bird-dog", "Bird dog"],
  ["/exercises/lat-pulldown", "Lat pulldown"],

  ["/foods/bitter-gourd", "Bitter gourd"],
  ["/foods/moth-bean", "Moth bean"],
  ["/foods/refined-wheat-flour", "Refined wheat flour"],
  ["/foods/cornmeal", "Cornmeal"],
  ["/foods/pumpkin-seed", "Pumpkin seed"],
  ["/foods/buttermilk", "Buttermilk"],
  ["/foods/kefir", "Kefir"],
  ["/foods/turkey-breast", "Turkey breast"],
  ["/foods/chicken-liver", "Chicken liver"],
  ["/foods/mustard-oil", "Mustard oil"],
  ["/foods/turmeric-powder", "Turmeric powder"],
  ["/foods/chicken-thigh", "Chicken thigh"],
  ["/foods/chicken-drumstick", "Chicken drumstick"],

  ["/supplements/ingredients/ingredient-arginine", "L-Arginine"],
  [
    "/supplements/ingredients/ingredient-dietary-nitrate",
    "Dietary Nitrate or Beetroot Juice",
  ],
  [
    "/supplements/ingredients/ingredient-branched-chain-amino-acids",
    "Branched-Chain Amino Acids",
  ],
  ["/exercises/push-up", "Push-up"],
  ["/exercises/knee-push-up", "Knee push-up"],
  ["/learn/workout-science/specificity", "Specificity"],
  ["/learn/workout-science/progressive-overload", "Progressive overload"],
  ["/learn/workout-science/individual-response", "Individual response"],
  ["/learn/workout-science/periodization", "Periodization"],
  ["/learn/workout-science/proximity-to-failure", "Proximity to failure"],
  [
    "/cardio/learn/topic-absolute-vs-relative-intensity",
    "Absolute vs Relative Intensity",
  ],
  [
    "/cardio/learn/topic-perceived-exertion-0-10",
    "Generic 0–10 Perceived Exertion",
  ],
  ["/cardio/learn/topic-met-definition", "Metabolic Equivalent of Task"],
  [
    "/cardio/learn/topic-health-guidelines-vs-training-plan",
    "Public-Health Guidelines vs Individual Training",
  ],
  ["/cardio/learn/topic-weekly-minutes", "Weekly Aerobic Minutes"],
  [
    "/cardio/learn/topic-moderate-vigorous-equivalence",
    "Moderate–Vigorous Minute Equivalence",
  ],
  ["/cardio/learn/topic-frequency-cardio", "Cardio Frequency"],
  ["/cardio/learn/topic-beginner-progression", "Starting After Inactivity"],
  ["/cardio/modalities/modality-walking-outdoor", "Outdoor Walking"],
  ["/cardio/modalities/modality-cycling-outdoor", "Outdoor Cycling"],
  ["/exercises/dumbbell-bench-press", "Dumbbell bench press"],
  ["/exercises/forward-lunge", "Forward lunge"],
  ["/exercises/dumbbell-romanian-deadlift", "Dumbbell Romanian deadlift"],
  ["/programs/full-body-3-day-foundation", "Three-Day Full-Body Foundation"],
  ["/supplements/ingredients/ingredient-beta-alanine", "Beta-Alanine"],
  [
    "/supplements/ingredients/ingredient-citrulline-malate",
    "Citrulline Malate",
  ],
  ["/learn/workout-science/strength-adaptation", "Strength adaptation"],
  ["/learn/workout-science/power-adaptation", "Power development"],
  ["/learn/workout-science/physical-function-adaptation", "Physical function"],
  ["/learn/workout-science/training-volume", "Training volume"],
  [
    "/learn/workout-science/load-relative-intensity",
    "Load and relative intensity",
  ],
  ["/learn/workout-science/training-frequency", "Training frequency"],
  ["/learn/workout-science/range-of-motion", "Range of motion"],
  ["/learn/workout-science/exercise-order", "Exercise order"],
  ["/learn/workout-science/repetitions-in-reserve", "Repetitions in reserve"],
  [
    "/learn/workout-science/tempo-repetition-duration",
    "Tempo and repetition duration",
  ],
  ["/learn/workout-science/superset", "Superset"],
  ["/learn/workout-science/drop-set", "Drop set"],
  ["/learn/workout-science/deload", "Deloading"],
  ["/recovery/topics/static-stretching", "Static Stretching"],
  ["/recovery/topics/stretching-intensity", "Stretching Intensity"],
  [
    "/mobility/routines/routine-hamstring-flexibility",
    "Hamstring Flexibility Routine",
  ],
  ["/mobility/routines/routine-calf-flexibility", "Calf Flexibility Routine"],
  ["/nutrients/energy", "Energy"],
  ["/nutrients/energy-kilojoules", "Energy in kilojoules"],
  ["/nutrients/alcohol", "Alcohol"],
  ["/nutrients/water", "Water"],
  ["/nutrients/protein", "Protein"],
  ["/nutrients/total-carbohydrate", "Total carbohydrate"],
  ["/nutrients/available-carbohydrate", "Available carbohydrate"],
  ["/nutrients/dietary-fibre", "Dietary fibre"],
  ["/nutrients/total-sugars", "Total sugars"],
  ["/nutrients/added-sugars", "Added sugars"],
  ["/nutrients/total-fat", "Total fat"],
  ["/nutrients/saturated-fat", "Saturated fat"],
  ["/nutrients/monounsaturated-fat", "Monounsaturated fat"],
  ["/nutrients/polyunsaturated-fat", "Polyunsaturated fat"],
  ["/nutrients/trans-fat", "Trans fat"],
  ["/nutrients/omega-6-fatty-acids", "Omega-6 fatty acids"],
  ["/nutrients/cholesterol", "Cholesterol"],
  ["/nutrients/sodium", "Sodium"],
  ["/nutrients/chloride", "Chloride"],
  ["/learn/workout-science/rest-intervals", "Rest intervals"],
  ["/learn/workout-science/training-split", "Training splits"],
  ["/muscles/biceps-brachii", "Biceps brachii"],
  ["/muscles/latissimus-dorsi", "Latissimus dorsi"],
  ["/muscles/trapezius", "Trapezius"],
  ["/muscles/gluteus-maximus", "Gluteus maximus"],
  ["/muscles/biceps-femoris-short-head", "Biceps femoris — short head"],
  ["/muscles/soleus", "Soleus"],
  ["/muscles/adductor-magnus", "Adductor magnus"],
  ["/muscles/tibialis-anterior", "Tibialis anterior"],
  ["/muscles/sternocleidomastoid", "Sternocleidomastoid"],
  ["/muscles/rectus-abdominis", "Rectus abdominis"],
  ["/muscles/sartorius", "Sartorius"],
  ["/muscles/fibularis-muscles", "Fibularis/peroneal group"],
  ["/foods/skim-milk", "Skim milk"],
  ["/foods/chicken-wing", "Chicken wing"],
  ["/exercises/dumbbell-curl", "Dumbbell curl"],
  ["/exercises/dumbbell-lateral-raise", "Dumbbell lateral raise"],
  ["/exercises/single-leg-calf-raise", "Single-leg calf raise"],
  ["/exercises/bodyweight-squat", "Bodyweight squat"],
  ["/exercises/one-arm-dumbbell-row", "One-arm dumbbell row"],
  ["/exercises/incline-push-up", "Incline push-up"],
  ["/exercises/standing-calf-raise", "Standing calf raise"],
  ["/programs/full-body-2-day-foundation", "Two-Day Full-Body Foundation"],
  [
    "/exercises/seated-dumbbell-shoulder-press",
    "Seated dumbbell shoulder press",
  ],
  ["/foods/apple", "Apple"],
  ["/nutrients/iron", "Iron"],
  ["/nutrients/thiamin-vitamin-b1", "Thiamin (vitamin B1)"],
  ["/nutrients/riboflavin-vitamin-b2", "Riboflavin (vitamin B2)"],
  ["/nutrients/niacin-vitamin-b3", "Niacin (vitamin B3)"],
  ["/nutrients/vitamin-b6", "Vitamin B6"],
  ["/nutrients/folate-vitamin-b9", "Folate (vitamin B9)"],
  ["/nutrients/potassium", "Potassium"],
  ["/nutrients/phosphorus", "Phosphorus"],
  ["/nutrients/copper", "Copper"],
  ["/nutrients/manganese", "Manganese"],
  ["/nutrients/selenium", "Selenium"],
  ["/nutrients/vitamin-e", "Vitamin E"],
  ["/nutrients/vitamin-k", "Vitamin K"],
  ["/nutrients/chromium", "Chromium"],
  ["/nutrients/fluoride", "Fluoride"],
  ["/nutrients/molybdenum", "Molybdenum"],
  ["/nutrients/pantothenic-acid-vitamin-b5", "Pantothenic acid (vitamin B5)"],
  ["/nutrients/biotin-vitamin-b7", "Biotin (vitamin B7)"],
  ["/nutrients/omega-3-fatty-acids", "Omega-3 fatty acids"],
  ["/nutrients/vitamin-a", "Vitamin A"],
  ["/nutrients/beta-carotene", "Beta-carotene"],
  ["/nutrients/retinol", "Retinol"],
  ["/nutrients/folic-acid", "Folic acid"],
  ["/recipes/egg-potato-bowl", "Hard-boiled egg and potato bowl"],
  ["/recipes/cooked-oat-banana-bowl", "Cooked oat and banana bowl"],
  [
    "/meal-plans/templates/rice-chickpea-meal-prep",
    "Rice and chickpea meal-prep collection",
  ],
  ["/recipes/chickpea-cucumber-bowl", "Chickpea and cucumber bowl"],
  ["/recovery/topics/sleep-duration-adults", "Adult Sleep Duration"],
  ["/cardio/learn/topic-talk-test", "Talk Test"],
  [
    "/supplements/ingredients/ingredient-creatine-monohydrate",
    "Creatine Monohydrate",
  ],
] as const;
test.describe("Published library routes", () => {
  // Each read-only route case has an isolated browser context and no shared writes.
  test.describe.configure({ mode: "parallel" });
  for (const [path, title] of publicRoutes) {
    test(`@a11y Phase 19 published content ${path}`, async ({ page }) => {
      const errors: string[] = [];
      const remote: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("request", (request) => {
        if (!request.url().startsWith("http://127.0.0.1:3000"))
          remote.push(request.url());
      });
      await page.goto(path);
      await expect(
        page.getByRole("heading", { name: title, exact: true }).first(),
      ).toBeVisible();
      await expect(
        page
          .getByText(/personal.use publication|published_personal_use/i)
          .first(),
      ).toBeVisible();
      for (const width of [320, 768, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        for (const theme of ["light", "dark"]) {
          await page.evaluate((value) => {
            document.documentElement.dataset.theme = value;
          }, theme);
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          expect(
            (
              await new AxeBuilder({ page })
                .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
                .analyze()
            ).violations,
          ).toEqual([]);
        }
      }
      expect(errors).toEqual([]);
      expect(remote).toEqual([]);
    });
  }
});
test("public recipe loads independently of personal databases and rejects unknown slugs", async ({
  page,
}) => {
  await page.goto("/recipes/chickpea-cucumber-bowl");
  await expect(
    page.getByRole("heading", { name: "Exact ingredients" }),
  ).toBeVisible();
  await expect(page.getByText(/estimated batch mass/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Exact food profile" }).first(),
  ).toHaveAttribute("href", "/foods/chickpea");
  await page.goto("/recipes/unpublished-example");
  await expect(
    page.getByRole("heading", { name: "Public recipe unavailable" }),
  ).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex",
  );
});

test("vitamin E food rankings retain the source alpha-tocopherol form", async ({
  page,
}) => {
  await page.goto("/nutrients/vitamin-e");
  const sources = page.locator("#food-sources");
  await expect(sources.getByRole("table")).toBeVisible();
  await expect(sources.getByText(/mg alpha-tocopherol/).first()).toBeVisible();
  const link = sources.locator("tbody a").first();
  await expect(link).toHaveAttribute(
    "href",
    /\/foods\/[^?]+\?profile=profile_/,
  );
  await link.click();
  await expect(page).toHaveURL(/\/foods\/.+\?profile=profile_/);
  await expect(page.locator("h1")).toBeVisible();
});
test("public food data retries safely in the local diary without saving consumed records", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/assets/fruits-*.json", (route) => route.abort());
  await page.goto("/nutrition/add");
  await page
    .getByRole("combobox", { name: "Entry type", exact: true })
    .selectOption("canonical");
  await page.getByLabel("Search reviewed foods").fill("apple");
  await page
    .getByRole("combobox", { name: "Exact food profile", exact: true })
    .selectOption("profile_apple_fdc_1750341");
  await expect(page.getByRole("alert")).toContainText(
    "Your saved records have not changed",
  );
  await expect(
    page.getByRole("button", { name: "Save consumed entry", exact: true }),
  ).toBeDisabled();
  await page.unroute("**/assets/fruits-*.json");
  await page.getByRole("button", { name: "Retry food data" }).click();
  await page.getByLabel("Consumed mass", { exact: true }).fill("100");
  await expect(
    page.getByRole("heading", { name: "Nutrient preview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save consumed entry", exact: true }),
  ).toBeEnabled();
  expect(errors).toEqual([]);
});

test("public meal collection is read-only, source-linked and separate from private meal plans", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window.indexedDB, "open", {
      value: () => {
        throw Error("Personal storage denied during public collection viewing");
      },
    });
  });
  await page.goto("/meal-plans/templates");
  await expect(page.getByRole("status")).toContainText("3 collections");
  await page
    .getByRole("link", {
      name: "Rice and chickpea meal-prep collection",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "Exact menu", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("not a complete daily diet", { exact: false }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Rice and chickpea bowl", exact: true }),
  ).toHaveAttribute("href", "/recipes/rice-chickpea-bowl");
  await expect(page.getByRole("table")).toBeVisible();
  await page.goto("/meal-plans/templates/audit-unknown-record");
  await expect(
    page.getByRole("heading", { name: "Collection unavailable", exact: true }),
  ).toBeVisible();
});
