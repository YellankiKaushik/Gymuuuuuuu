import { expect, test } from "@playwright/test";
test("ingredient findings retain separate outcomes, forms and confidence without personal dosing", async ({
  page,
}) => {
  await page.goto("/supplements/ingredients/ingredient-beta-alanine");
  await expect(
    page.getByRole("heading", { name: "Outcome-specific findings" }),
  ).toBeVisible();
  await expect(
    page.getByText("Men aged 18–40 years", { exact: false }),
  ).toBeVisible();
  await expect(page.getByText("beneficial", { exact: true })).toBeVisible();
  await expect(
    page.getByText("no clear benefit", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "No single source regimen extracted; no personal amount supplied.",
      { exact: false },
    ),
  ).toHaveCount(2);
  await page.goto("/supplements/evidence");
  await page
    .getByLabel("Search names, outcomes, populations and forms")
    .fill("citrulline malate");
  await expect(
    page.getByRole("heading", { name: "Citrulline Malate", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Beta-Alanine", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Study count for this outcome", { exact: true }),
  ).toHaveCount(2);
  await expect(page.getByText("Not available", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "No personal protocol, product-quality certification or current anti-doping verdict is supplied.",
    ),
  ).toBeVisible();
});
test("NIH summaries preserve form and dietary context with an explicitly ungraded review", async ({
  page,
}) => {
  await page.goto("/supplements/ingredients/ingredient-dietary-nitrate");
  await expect(
    page.getByRole("heading", {
      name: "Dietary Nitrate or Beetroot Juice",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Juice and concentrate findings do not automatically apply to powders; nitrate content varies.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText("not assessed", { exact: false })).toBeVisible();
  await expect(
    page
      .getByRole("link", {
        name: "Exercise and Athletic Performance — arginine, beetroot and BCAA sections",
      })
      .first(),
  ).toHaveAttribute(
    "href",
    "https://ods.od.nih.gov/factsheets/ExerciseAndAthleticPerformance-HealthProfessional/",
  );
  await page.goto("/supplements/evidence");
  const filter = page.getByLabel(
    "Search names, outcomes, populations and forms",
  );
  try {
    await expect(filter).toBeEnabled();
  } catch (error) {
    const diagnostic = await page.evaluate(() => ({
      readyState: document.readyState,
      fieldsets: Array.from(document.querySelectorAll("fieldset")).map(
        (node) => ({
          disabled: node.disabled,
          attribute: node.getAttribute("disabled"),
        }),
      ),
      inputStates: Array.from(document.querySelectorAll("input")).map(
        (node) => ({
          disabled: node.disabled,
          matchesDisabled: node.matches(":disabled"),
        }),
      ),
      routerBootstrap: window.$_TSR
        ? {
            initialized: window.$_TSR.initialized,
            hydrated: window.$_TSR.hydrated,
            streamEnded: window.$_TSR.streamEnded,
            buffered: window.$_TSR.buffer.length,
          }
        : null,
      nonce: document
        .querySelector('meta[name="csp-nonce"]')
        ?.getAttribute("content"),
      scripts: Array.from(document.scripts).map((script) => ({
        src: script.src,
        type: script.type,
        nonce: script.nonce,
      })),
      fieldsetReactKeys: Object.keys(
        document.querySelector("fieldset.cardio-ready") ?? {},
      ).filter((key) => key.startsWith("__react")),
      shellReactKeys: Object.keys(
        document.querySelector("header") ?? {},
      ).filter((key) => key.startsWith("__react")),
    }));
    await test.info().attach("hydration-diagnostic", {
      body: JSON.stringify(diagnostic),
      contentType: "application/json",
    });
    throw error;
  }
  await filter.fill("dietary protein");
  await expect(
    page.getByRole("heading", {
      name: "Branched-Chain Amino Acids",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "L-Arginine", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText(
      "Evidence for additional muscle-protein synthesis beyond sufficient high-quality dietary protein is inconsistent.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText("Not available", { exact: true })).toBeVisible();
  await expect(
    page.getByText(
      "Personal-use publication · machine source verification · no independent human or clinical review.",
      { exact: true },
    ),
  ).toBeVisible();
});
