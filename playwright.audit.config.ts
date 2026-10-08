import { defineConfig } from "@playwright/test";
import production from "./playwright.production.config";

export default defineConfig({
  ...production,
  outputDir: "route-test-results",
  testDir: "./tests/audit",
  fullyParallel: true,
  // An audit must own its server independently of the browser regression run.
  use: { ...production.use, baseURL: "http://127.0.0.1:3100" },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:3100",
    env: { PORT: "3100", NITRO_PORT: "3100" },
    reuseExistingServer: false,
    timeout: 120000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
