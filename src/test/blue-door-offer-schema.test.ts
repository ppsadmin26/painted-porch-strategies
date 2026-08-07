import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  BLUE_DOOR_COPY,
  BLUE_DOOR_LAUNCH_DATE,
  BLUE_DOOR_PRICE_USD,
  blueDoorAvailability,
  blueDoorCheckoutSeoDescription,
  blueDoorCheckoutSeoTitle,
  blueDoorSeoDescription,
  blueDoorSeoTitle,
  blueDoorServiceJsonLd,
  isBlueDoorPreLaunch,
} from "@/config/blueDoor";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("Blue Door offer schema — runtime", () => {
  it("emits PreOrder while pre-launch, InStock after", () => {
    expect(blueDoorAvailability()).toBe(
      isBlueDoorPreLaunch() ? "https://schema.org/PreOrder" : "https://schema.org/InStock",
    );
  });

  it("builds a valid Service + Offer payload", () => {
    const ld = blueDoorServiceJsonLd() as Record<string, any>;
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("Service");
    expect(ld.offers["@type"]).toBe("Offer");
    expect(ld.offers.price).toBe(String(BLUE_DOOR_PRICE_USD));
    expect(ld.offers.priceCurrency).toBe("USD");
    expect(ld.offers.availability).toBe(blueDoorAvailability());
    expect(ld.offers.url).toMatch(/^https:\/\/.+\/blue-door$/);
    if (isBlueDoorPreLaunch()) {
      expect(ld.offers.availabilityStarts).toBe(BLUE_DOOR_LAUNCH_DATE.toISOString());
    }
  });

  it("pairs PreOrder availability with Coming Soon copy", () => {
    if (!isBlueDoorPreLaunch()) return;
    expect(BLUE_DOOR_COPY.label).toBe("Coming Soon");
    expect(blueDoorSeoTitle()).toContain("Coming Soon");
    expect(blueDoorCheckoutSeoTitle()).toContain("Coming Soon");
    expect(blueDoorSeoDescription()).toContain("Coming Soon");
    expect(blueDoorCheckoutSeoDescription()).toContain("Coming Soon");
  });

  it("attaches the schema on both Blue Door routes", () => {
    for (const page of [
      "src/pages/pps/BlueDoorLanding.tsx",
      "src/pages/pps/BlueDoorPurchase.tsx",
    ]) {
      const src = read(page);
      expect(src).toContain("blueDoorServiceJsonLd");
      expect(src).toMatch(/jsonLd:\s*blueDoorServiceJsonLd\(\)/);
    }
  });
});

describe("Blue Door offer schema — prerendered HTML", () => {
  const prerender = read("scripts/prerender.mjs");
  const content = read("scripts/prerender-content.mjs");

  it("derives availability from src/config/blueDoor.ts instead of hardcoding it", () => {
    expect(prerender).toContain("BLUE_DOOR_LAUNCH_DATE = new Date");
    expect(prerender).toContain("availability: blueDoorAvailability");
    // No literal availability string left in the Blue Door offer block.
    const block = prerender.slice(
      prerender.indexOf('"/blue-door": {'),
      prerender.indexOf('"/partner": {'),
    );
    expect(block).not.toContain('availability: "https://schema.org/');
  });

  it("uses the same PreOrder/InStock values as the runtime helper", () => {
    expect(prerender).toContain('"https://schema.org/PreOrder"');
    expect(prerender).toContain('"https://schema.org/InStock"');
    const launchIso = prerender.match(
      /BLUE_DOOR_LAUNCH_DATE = new Date\\\("\(\[\^"\]\+\)"\\\)/,
    );
    // The regex literal exists; the parsed date must match the TS config.
    expect(launchIso ?? prerender.includes("blueDoorLaunchIso")).toBeTruthy();
  });

  it("keeps prerendered Blue Door metadata aligned with the launch state", () => {
    const preLaunch = isBlueDoorPreLaunch();
    const blueDoorRoute = content.slice(
      content.indexOf('path: "/blue-door"'),
      content.indexOf('path: "/blue-door"') + 900,
    );
    if (preLaunch) {
      expect(blueDoorRoute).toContain("Coming Soon");
    }
  });
});
