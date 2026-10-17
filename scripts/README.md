# Script navigation

All 88 original scripts remain at their established paths. Run commands from the repository root. Public npm command names are unchanged; see the [project commands](../README.md#development-and-verification). Flat entry points use sibling/shared imports, repository-relative input/output paths and named historical test/report references. Moving these families would require unrelated import and evidence repairs, so classification provides navigation without that risk.

Generators, historical scaffolding and audit tools can write source files or reports. Their presence is not an instruction to rerun them against a completed project. Do not run a generator just to inspect it; preserve archived inputs and review generated changes. Archive-related references in schema generators and release/audit tools now point to the phase archive.

## content import/validation/search

- [build-search-index.ts](build-search-index.ts)
- [import-usda.ts](import-usda.ts)
- [prepare-food-source.mjs](prepare-food-source.mjs)
- [validate-content.ts](validate-content.ts)
- [verify-publication-reviews.ts](verify-publication-reviews.ts)
- [verify-usda-dataset.ts](verify-usda-dataset.ts)

## content compilers

- [compile-ace-four-exercises.ts](compile-ace-four-exercises.ts)
- [compile-ace-loaded-exercises.ts](compile-ace-loaded-exercises.ts)
- [compile-ace-machine-exercises.ts](compile-ace-machine-exercises.ts)
- [compile-ace-next-exercises.ts](compile-ace-next-exercises.ts)
- [compile-ace-pushups.ts](compile-ace-pushups.ts)
- [compile-acsm-adaptations.ts](compile-acsm-adaptations.ts)
- [compile-acsm-measurement.ts](compile-acsm-measurement.ts)
- [compile-acsm-principles.ts](compile-acsm-principles.ts)
- [compile-anatomy-index.ts](compile-anatomy-index.ts)
- [compile-cardio-education.ts](compile-cardio-education.ts)
- [compile-cdc-heat.ts](compile-cdc-heat.ts)
- [compile-cdc-sleep.ts](compile-cdc-sleep.ts)
- [compile-component-nutrients.ts](compile-component-nutrients.ts)
- [compile-fda-references.ts](compile-fda-references.ts)
- [compile-foods.ts](compile-foods.ts)
- [compile-foundation-programs.ts](compile-foundation-programs.ts)
- [compile-historical-anatomy.ts](compile-historical-anatomy.ts)
- [compile-nhs-programs.ts](compile-nhs-programs.ts)
- [compile-nia-flexibility.ts](compile-nia-flexibility.ts)
- [compile-nih-nutrients.ts](compile-nih-nutrients.ts)
- [compile-nutrients.ts](compile-nutrients.ts)
- [compile-ods-five.ts](compile-ods-five.ts)
- [compile-ods-ingredients.ts](compile-ods-ingredients.ts)
- [compile-original-recipes.ts](compile-original-recipes.ts)
- [compile-original-templates.ts](compile-original-templates.ts)
- [compile-recovery-routines.ts](compile-recovery-routines.ts)
- [compile-reference-indexes.ts](compile-reference-indexes.ts)
- [compile-remaining-anatomy.ts](compile-remaining-anatomy.ts)
- [compile-runtime-knowledge.ts](compile-runtime-knowledge.ts)
- [compile-science-index.ts](compile-science-index.ts)
- [compile-science-research.ts](compile-science-research.ts)
- [compile-supplement-evidence.ts](compile-supplement-evidence.ts)
- [compile-supported-exercises.ts](compile-supported-exercises.ts)
- [compile-supported-four-exercises.ts](compile-supported-four-exercises.ts)
- [compile-three-day-program.ts](compile-three-day-program.ts)
- [compile-training-research.ts](compile-training-research.ts)

## content audit

- [content-audit.ts](content-audit.ts)
- [phase19-data-budget.ts](phase19-data-budget.ts)

## shared content adapters

- [browser-report.ts](content/browser-report.ts)
- [exercise-media-bindings.ts](content/exercise-media-bindings.ts)
- [fda.ts](content/fda.ts)
- [food-identity-matches.ts](content/food-identity-matches.ts)
- [immutable-versions.ts](content/immutable-versions.ts)
- [nhs-running.ts](content/nhs-running.ts)
- [program-source-bindings.ts](content/program-source-bindings.ts)
- [route-inventory.ts](content/route-inventory.ts)
- [usda-dataset.ts](content/usda-dataset.ts)
- [usda.ts](content/usda.ts)
- [vitamin-e-ranking.ts](content/vitamin-e-ranking.ts)

## route generators

- [create-cardio-routes.mjs](create-cardio-routes.mjs)
- [create-nutrition-routes.mjs](create-nutrition-routes.mjs)
- [create-recovery-routes.mjs](create-recovery-routes.mjs)
- [create-supplements-routes.mjs](create-supplements-routes.mjs)
- [scaffold-routes.mjs](scaffold-routes.mjs)

## historical release/security audit

- [final-live-audit.ts](final-live-audit.ts)
- [final-secret-scan.ts](final-secret-scan.ts)
- [final-security-inventory.ts](final-security-inventory.ts)
- [pre-vercel-gap-audit.ts](pre-vercel-gap-audit.ts)
- [pre-vercel-security-audit.ts](pre-vercel-security-audit.ts)

## schema generators

- [generate-cardio-schema.mjs](generate-cardio-schema.mjs)
- [generate-diet-schema.mjs](generate-diet-schema.mjs)
- [generate-food-schema.mjs](generate-food-schema.mjs)
- [generate-nutrient-schema.mjs](generate-nutrient-schema.mjs)
- [generate-nutrition-schema.mjs](generate-nutrition-schema.mjs)
- [generate-program-schema.mjs](generate-program-schema.mjs)
- [generate-recipe-schema.mjs](generate-recipe-schema.mjs)
- [generate-recovery-schema.mjs](generate-recovery-schema.mjs)
- [generate-supplements-schema.mjs](generate-supplements-schema.mjs)
- [generate-workout-schema.mjs](generate-workout-schema.mjs)

## inspection tools

- [inspect-exercise-fixture.tsx](inspect-exercise-fixture.tsx)
- [inspect-food-fixture.tsx](inspect-food-fixture.tsx)
- [inspect-nutrient-fixture.tsx](inspect-nutrient-fixture.tsx)
- [inspect-program-fixture.tsx](inspect-program-fixture.tsx)
- [inspect-science-fixture.tsx](inspect-science-fixture.tsx)
- [inspect-ui.mjs](inspect-ui.mjs)
- [read-docx-differences.ps1](read-docx-differences.ps1)
- [read-seed-data.mjs](read-seed-data.mjs)

## release/privacy/performance

- [phase18-performance-budget.ts](phase18-performance-budget.ts)
- [phase18-release-manifest.ts](phase18-release-manifest.ts)
- [phase18-repository-audit.ts](phase18-repository-audit.ts)
- [phase18-runtime-audit.ts](phase18-runtime-audit.ts)

## historical scaffolding

- [upgrade-shell.mjs](upgrade-shell.mjs)
