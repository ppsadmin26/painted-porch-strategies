import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const read = (p: string) => readFileSync(join(process.cwd(), p), "utf-8");

/**
 * Lead-capture safety net for /contact and every opt-in landing page.
 *
 * Why source-level instead of full render:
 *   - Each page wires the global Supabase client, toast provider, router,
 *     session storage, GHL edge fn, and (for /contact) a transactional
 *     email pipeline. End-to-end render tests need that full constellation
 *     mocked and re-mocked per case, which makes them brittle.
 *   - The invariants that actually keep these forms safe are structural:
 *     trimmed values, required-field gating, the right edge function name,
 *     no `mailto:` fallback, no `window.open`, accessible labels. Those
 *     can be asserted directly against the source.
 */

const CONTACT = "src/pages/pps/PPSContact.tsx";
const BURNOUT = "src/pages/pps/BurnoutOptIn.tsx";
const KICK = "src/pages/pps/KickTheHabit.tsx";
const PILOT = "src/pages/pps/PilotTraining.tsx";
const STOIC = "src/pages/pps/StoicFieldGuide.tsx";

describe("Contact form (/contact)", () => {
  const src = read(CONTACT);

  it("submits via the canonical submit-ghl-lead edge function", () => {
    expect(src).toMatch(/supabase\.functions\.invoke\(["']submit-ghl-lead["']/);
  });

  it("trims every user-entered string before submission (no whitespace-only leads)", () => {
    for (const field of ["firstName", "lastName", "email", "message"]) {
      expect(src).toMatch(new RegExp(`${field}\\.trim\\(\\)`));
    }
  });

  it("blocks submission until all required fields are filled", () => {
    // Validation block sets errors.* and bails out before the fetch.
    expect(src).toMatch(/if\s*\(!firstName\.trim\(\)\)\s*errors\.firstName/);
    expect(src).toMatch(/if\s*\(!email\.trim\(\)\)\s*errors\.email/);
    expect(src).toMatch(/if\s*\(!message\.trim\(\)\)\s*errors\.message/);
    expect(src).toMatch(/if\s*\(Object\.keys\(errors\)\.length\s*>\s*0\)/);
  });

  it("fires confirmation + notification emails with an idempotency key", () => {
    expect(src).toMatch(/templateName:\s*["']contact-confirmation["']/);
    expect(src).toMatch(/templateName:\s*["']contact-notification["']/);
    expect(src).toMatch(/idempotencyKey:\s*`contact-confirm-/);
    expect(src).toMatch(/idempotencyKey:\s*`contact-notify-/);
  });

  it("does not fall back to mailto: or window.open (per global CTA rule)", () => {
    expect(src).not.toMatch(/href=["']mailto:/i);
    expect(src).not.toMatch(/window\.open\s*\(/);
  });

  it("never logs the full form body (only the error object)", () => {
    // We allow `console.error("Contact form error:", err)` but not raw body dumps.
    const logs = src.match(/console\.(log|error|warn)\([^)]*\)/g) ?? [];
    for (const line of logs) {
      expect(line).not.toMatch(/password|firstName|lastName|email\.trim/);
    }
  });
});

describe.each([
  { name: "Burnout opt-in", file: BURNOUT, fn: "submit-burnout-optin" },
  { name: "Kick the Habit opt-in", file: KICK, fn: "submit-kick-habit-optin" },
  { name: "Pilot Training opt-in", file: PILOT, fn: "submit-pilot-training-optin" },
  { name: "Stoic Field Guide opt-in", file: STOIC, fn: "submit-stoic-field-guide-optin" },
])("Subscribe/optin: $name", ({ file, fn }) => {
  const src = read(file);

  it(`calls the ${fn} edge function`, () => {
    expect(src).toMatch(new RegExp(`supabase\\.functions\\.invoke\\(["']${fn}["']`));
  });

  it("validates name + email before submitting", () => {
    expect(src).toMatch(/\.trim\(\)/);
    // Must short-circuit when fields are missing (no silent ghost submits).
    // Pattern: an `if (...trim()...)` guard with a `return` inside its block.
    expect(src).toMatch(/if\s*\([^)]*\.trim\(\)[^)]*\)\s*\{[\s\S]{0,300}?return/);
  });

  it("does not use mailto: links or window.open (centralized lead capture)", () => {
    expect(src).not.toMatch(/href=["']mailto:/i);
    expect(src).not.toMatch(/window\.open\s*\(/);
  });

  it("surfaces errors to the user via toast (no silent failures)", () => {
    expect(src).toMatch(/toast\(\{[\s\S]{0,400}?variant:\s*["']destructive["']/);
  });
});

describe("Burnout opt-in specifics", () => {
  const src = read(BURNOUT);

  it("requires the consent checkbox before submission", () => {
    expect(src).toMatch(/if\s*\(!consent\)/);
  });

  it("inputs expose accessible names (aria-label) for screen readers", () => {
    expect(src).toMatch(/aria-label="First name"/);
    expect(src).toMatch(/aria-label="Last name"/);
    expect(src).toMatch(/aria-label="Email address"/);
  });

  it("honors ?invalid=1 query so failed tokens can re-submit (no redirect loop)", () => {
    expect(src).toMatch(/searchParams\.get\(["']invalid["']\)\s*===\s*["']1["']/);
  });
});
