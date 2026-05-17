import { createLovableConfig } from "lovable-agent-playwright-config/config";
import { devices } from "@playwright/test";

/**
 * Visual regression strategy:
 *  - Single Chromium/Linux project so baselines committed to the repo are
 *    deterministic across CI and local dev (macOS contributors should run
 *    snapshot updates in a Linux container or rely on CI).
 *  - Snapshots live next to the specs under `e2e/__snapshots__/<spec>/`
 *    with no per-platform suffix, since we're pinned to one platform.
 *  - 2% diff ratio matches the per-spec `toHaveScreenshot` options.
 */
export default createLovableConfig({
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  snapshotPathTemplate: "{testDir}/__snapshots__/{testFileName}/{arg}{ext}",
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    },
  },
});
