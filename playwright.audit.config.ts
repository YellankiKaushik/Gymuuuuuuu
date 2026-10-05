import { defineConfig } from "@playwright/test";
import production from "./playwright.production.config";

export default defineConfig({
  ...production,
  outputDir: "route-test-results",
  testDir: "./tests/audit",
  fullyParallel: true,
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
