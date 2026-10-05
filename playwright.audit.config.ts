import { defineConfig } from "@playwright/test";
import production from "./playwright.production.config";

export default defineConfig({
  ...production,
  testDir: "./tests/audit",
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
