import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf-8");
const EDGE_FN = "supabase/functions/submit-ghl-lead/index.ts";

describe("GHL opportunity brand pre-selection", () => {
  const src = read(EDGE_FN);

  it("always sets the Brand custom field to Painted Porch Strategies on new opportunities", () => {
    // The brand assignment must be unconditional (not inside a conditional).
    expect(src).toMatch(/customFields\.push\(\{[^}]*key:\s*["']brand["'][^}]*field_value:\s*["']Painted Porch Strategies["'][^}]*\}\);/);
  });

  it("uses the opportunity-level custom field key 'brand' (not a contact field)", () => {
    // Ensure it is pushed inside the opportunity createOpportunity payload builder,
    // not inside buildContactCustomFields or upsertContact.
    const opportunityStart = src.indexOf("async function createOpportunity(");
    const opportunityEnd = src.indexOf("async function findCompanyByName(");
    const opportunityBlock = src.slice(opportunityStart, opportunityEnd > opportunityStart ? opportunityEnd : undefined);
    expect(opportunityBlock).toMatch(/key:\s*["']brand["']/);
  });
});
