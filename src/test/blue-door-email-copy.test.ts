import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { BLUE_DOOR_COPY } from "@/config/blueDoor";

const TEMPLATE_PATH =
  "supabase/functions/_shared/transactional-email-templates/blue-door-purchase-confirmation.tsx";
const MIRROR_PATH = "supabase/functions/_shared/blue-door-copy.ts";

/**
 * The Blue Door purchase confirmation email must carry the pre-launch
 * "Coming Soon" messaging and must pull it from the shared copy module rather
 * than hardcoding a launch date. The template is a Deno/React-Email module, so
 * it is asserted by source inspection.
 */
describe("Blue Door purchase confirmation email", () => {
  const template = readFileSync(TEMPLATE_PATH, "utf8");
  const mirror = readFileSync(MIRROR_PATH, "utf8");

  it("imports the shared Blue Door copy module", () => {
    expect(template).toMatch(/from ['"]\.\.\/blue-door-copy\.ts['"]/);
    expect(template).toContain("BLUE_DOOR_COPY");
  });

  it("uses shared copy for subject, preview, and launch highlight", () => {
    expect(template).toContain("subject: BLUE_DOOR_COPY.emailSubject");
    expect(template).toContain("{BLUE_DOOR_COPY.emailPreview}");
    expect(template).toContain("{BLUE_DOOR_COPY.emailHighlight}");
    expect(template).toContain("{BLUE_DOOR_COPY.emailHighlightBody}");
  });

  it("carries the Coming Soon / launch-day messaging", () => {
    expect(BLUE_DOOR_COPY.label).toBe("Coming Soon");
    expect(BLUE_DOOR_COPY.emailSubject).toMatch(/opens soon/i);
    expect(BLUE_DOOR_COPY.emailPreview).toMatch(/opens soon/i);
    expect(BLUE_DOOR_COPY.emailHighlight).toMatch(/opens soon/i);
    expect(BLUE_DOOR_COPY.emailHighlightBody).toMatch(/on launch day/i);
    // Mirror the same values backend-side so the deployed email matches.
    expect(mirror).toContain(BLUE_DOOR_COPY.emailSubject);
    expect(mirror).toContain(BLUE_DOOR_COPY.emailHighlight);
  });

  it("has no hardcoded launch date in the template or copy", () => {
    const stale = /July|June|\b20\d\d\b|\b\d{1,2}(st|nd|rd|th)\b/;
    expect(template).not.toMatch(stale);
    expect(Object.values(BLUE_DOOR_COPY).join(" ")).not.toMatch(stale);
  });
});
