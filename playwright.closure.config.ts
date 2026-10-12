import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/closure",
  outputDir: "test-results/closure",
  workers: 2,
  // Each case explicitly traverses multiple routes or restarts a browser profile.
  timeout: 120000,
  use: {
    baseURL: process.env.FITNESS_CLOSURE_ORIGIN ?? "http://127.0.0.1:3000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "closure-chromium",
      use: { browserName: "chromium", viewport: { width: 1440, height: 900 } },
    },
    {
      name: "closure-webkit",
      use: { browserName: "webkit", viewport: { width: 1440, height: 900 } },
    },
    {
      name: "closure-firefox",
      use: { browserName: "firefox", viewport: { width: 1440, height: 900 } },
    },
    {
      name: "android-chromium",
      use: { ...devices["Pixel 7"], browserName: "chromium" },
    },
    {
      name: "iphone-webkit",
      use: { ...devices["iPhone 13"], browserName: "webkit" },
    },
    {
      name: "ipad-webkit",
      use: { ...devices["iPad (gen 7)"], browserName: "webkit" },
    },
    {
      name: "android-tablet-chromium",
      use: {
        browserName: "chromium",
        viewport: { width: 800, height: 1280 },
        contextOptions: { screen: { width: 800, height: 1280 } },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: process.env.FITNESS_CLOSURE_ORIGIN
    ? undefined
    : {
        command: "npm start",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
