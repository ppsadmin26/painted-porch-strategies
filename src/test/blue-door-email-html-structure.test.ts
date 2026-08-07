import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { BLUE_DOOR_COPY } from "@/config/blueDoor";

const TEMPLATE_PATH =
  "supabase/functions/_shared/transactional-email-templates/blue-door-purchase-confirmation.tsx";

/**
 * Email-client compatibility guard for the Blue Door purchase confirmation.
 *
 * The template is a Deno/React-Email module (npm: specifiers) so it cannot be
 * imported into the jsdom test runtime. Instead we assert the structural rules
 * that determine whether the "Coming Soon" copy renders correctly in Outlook,
 * Gmail, Apple Mail, and mobile clients:
 *
 *  - React Email primitives only (they compile to table-based, client-safe HTML)
 *  - all styling inline (no <style> blocks, no external CSS, no Tailwind classes)
 *  - no modern layout (flex/grid), no CSS variables, no media queries
 *  - white <Body> background, web-safe font stacks with fallbacks
 *  - absolute https URLs for images and links
 *  - the launch messaging lives inside real text nodes, not raw HTML
 */
describe("Blue Door confirmation email — HTML structure / client compatibility", () => {
  const src = readFileSync(TEMPLATE_PATH, "utf8");

  it("uses React Email primitives for every structural element", () => {
    for (const el of ["Html", "Head", "Body", "Container", "Section", "Heading", "Text", "Preview"]) {
      expect(src, `missing <${el}>`).toContain(`<${el}`);
    }
    // No bare block-level HTML that Outlook renders inconsistently.
    expect(src).not.toMatch(/<(div|table|tr|td|span|p)\b/);
  });

  it("sets language and direction on the root element", () => {
    expect(src).toMatch(/<Html\s+lang="en"\s+dir="ltr">/);
  });

  it("keeps all styling inline and email-safe", () => {
    expect(src).not.toMatch(/<style\b/i);
    expect(src).not.toMatch(/className=/);
    expect(src).not.toMatch(/@media/);
    expect(src).not.toMatch(/display:\s*['"]?(flex|grid)/);
    expect(src).not.toMatch(/var\(--/);
    expect(src).not.toMatch(/position:\s*['"]?(absolute|fixed)/);
  });

  it("never injects raw HTML", () => {
    expect(src).not.toContain("dangerouslySetInnerHTML");
  });

  it("uses a white body background and web-safe font fallbacks", () => {
    expect(src).toMatch(/backgroundColor:\s*'#ffffff'/);
    expect(src).toMatch(/fontFamily:[^\n]*Arial,\s*sans-serif/);
  });

  it("constrains the container width for mobile clients", () => {
    expect(src).toMatch(/maxWidth:\s*'5\d\dpx'/);
  });

  it("uses absolute https URLs for images, links, and buttons", () => {
    const urls = src.match(/(?:href|src)=(?:{`|{|")([^"`}]+)/g) ?? [];
    expect(urls.length).toBeGreaterThan(0);
    for (const raw of urls) {
      const value = raw.replace(/^(?:href|src)=(?:{`|{|")/, "");
      // Template-literal refs to SITE_URL/LOGO_URL constants are absolute.
      if (value.startsWith("$") || value.startsWith("SITE_URL") || value.startsWith("LOGO_URL")) continue;
      expect(value, `non-absolute URL: ${value}`).toMatch(/^https:\/\//);
    }
    expect(src).toMatch(/const SITE_URL = 'https:\/\//);
    expect(src).toMatch(/const LOGO_URL = 'https:\/\//);
  });

  it("gives the logo image alt text and explicit width", () => {
    expect(src).toMatch(/<Img[^>]*alt="Painted Porch Strategies"/s);
    expect(src).toMatch(/<Img[^>]*width="180"/s);
  });

  it("renders the Coming Soon launch copy as plain text nodes", () => {
    // Highlight block wraps the launch messaging in <Text>, not raw markup.
    expect(src).toMatch(/<Text style={highlightHeading}>\s*{BLUE_DOOR_COPY\.emailHighlight}/);
    expect(src).toMatch(/<Text style={highlightText}>\s*{BLUE_DOOR_COPY\.emailHighlightBody}/);
    expect(BLUE_DOOR_COPY.emailHighlight).not.toMatch(/[<>]/);
    expect(BLUE_DOOR_COPY.emailHighlightBody).not.toMatch(/[<>]/);
  });

  it("exposes preview text so inbox snippets show the launch state", () => {
    expect(src).toMatch(/<Preview>{BLUE_DOOR_COPY\.emailPreview}<\/Preview>/);
    expect(BLUE_DOOR_COPY.emailPreview.length).toBeGreaterThan(20);
    expect(BLUE_DOOR_COPY.emailPreview.length).toBeLessThanOrEqual(150);
  });

  it("keeps the CTA a React Email Button with inline padding (Outlook-safe)", () => {
    expect(src).toMatch(/<Button href={`\${SITE_URL}/);
    expect(src).toMatch(/const ctaButton = {[^}]*padding:/);
    expect(src).toMatch(/const ctaButton = {[^}]*textDecoration:\s*'none'/);
  });

  it("omits unsubscribe markup (appended by the platform)", () => {
    expect(src.toLowerCase()).not.toContain("unsubscribe");
  });
});
