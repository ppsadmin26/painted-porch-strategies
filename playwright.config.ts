import { defineConfig, devices } from "@playwright/test";

/**
 * Visual regression strategy:
 *  - Single Chromium/Linux project so baselines committed to the repo are
 *    deterministic across CI and local dev (macOS contributors should run
 *    snapshot updates in a Linux container or rely on CI).
 *  - Snapshots live next to the specs under `e2e/__snapshots__/<spec>/`
 *    with no per-platform suffix, since we're pinned to one platform.
 *  - 2% diff ratio matches the per-spec `toHaveScreenshot` options.
 */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL: BASE_URL,
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Prefer the system Chromium binary when present (CI sandbox ships
        // /bin/chromium and does not include the Playwright-managed download).
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
          : process.env.PUPPETEER_EXECUTABLE_PATH
            ? { executablePath: process.env.PUPPETEER_EXECUTABLE_PATH }
            : undefined,
      },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: "npm run dev -- --port 8080",
        url: BASE_URL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
  snapshotPathTemplate: "{testDir}/__snapshots__/{testFileName}/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    },
  },
});
