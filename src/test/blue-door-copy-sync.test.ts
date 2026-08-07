import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { BLUE_DOOR_COPY } from "@/config/blueDoor";

/**
 * The backend mirror (`supabase/functions/_shared/blue-door-copy.ts`) must carry
 * exactly the same Blue Door launch copy as the frontend config, since edge
 * functions and email templates cannot import from `src/`.
 */
describe("Blue Door copy sync", () => {
  it("backend mirror matches src/config/blueDoor.ts", () => {
    const mirror = readFileSync("supabase/functions/_shared/blue-door-copy.ts", "utf8");
    // SEO-only keys are frontend concerns and are not mirrored backend-side.
    const frontendOnly = new Set(["seoTitle", "seoTitleCheckout"]);
    for (const [key, value] of Object.entries(BLUE_DOOR_COPY)) {
      if (frontendOnly.has(key)) continue;
      expect(mirror, `missing key: ${key}`).toContain(`${key}:`);
      expect(mirror, `value drift for: ${key}`).toContain(value.replace(/"/g, '\\"'));
    }
  });

  it("has no stale hardcoded launch dates", () => {
    const values = Object.values(BLUE_DOOR_COPY).join(" ");
    expect(values).not.toMatch(/July|June|\b20\d\d\b/);
  });
});
