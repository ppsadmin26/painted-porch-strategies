import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf-8");
const EDGE_FN = "supabase/functions/submit-ghl-lead/index.ts";

describe("GHL brand pre-selection", () => {
  const src = read(EDGE_FN);

  it("defines the shared brand value", () => {
    expect(src).toMatch(/const PPS_BRAND = "Painted Porch Strategies";/);
  });

  it("sets the opportunity-level 'brands' field on every new opportunity", () => {
    const start = src.indexOf("async function createOpportunity(");
    const end = src.indexOf("async function findCompanyByName(");
    const block = src.slice(start, end > start ? end : undefined);
    expect(block).toMatch(/customFields\.push\(\{\s*key:\s*["']brands["'],\s*field_value:\s*PPS_BRAND\s*\}\);/);
  });

  it("sets the contact-level 'brands' field unconditionally", () => {
    const start = src.indexOf("function buildContactCustomFields(");
    const end = src.indexOf("function hasPopulatedCustomField(");
    const block = src.slice(start, end > start ? end : undefined);
    expect(block).toMatch(/customFields\.push\(\{\s*key:\s*["']brands["'],\s*field_value:\s*PPS_BRAND\s*\}\);/);
  });

  it("only stamps 'first_touch_brand' when the flag is set", () => {
    expect(src).toMatch(/if \(payload\.setFirstTouchBrand\) \{\s*customFields\.push\(\{\s*key:\s*["']first_touch_brand["'],\s*field_value:\s*PPS_BRAND\s*\}\);/);
  });

  it("treats first_touch_brand as write-once for existing contacts", () => {
    expect(src).toMatch(/setFirstTouchBrand:\s*!hasPopulatedCustomField\(existingContact,\s*["']first_touch_brand["']\)/);
  });

  it("always stamps first_touch_brand on brand-new contacts", () => {
    expect(src).toMatch(/setStatus:\s*true,\s*setFirstContactDate:\s*true,\s*setFirstTouchBrand:\s*true,/);
  });
});
