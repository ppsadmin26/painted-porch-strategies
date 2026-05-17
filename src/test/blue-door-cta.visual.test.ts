/**
 * Visual regression guard for /blue-door CTAs.
 *
 * Rule (per project memory "Blue Door CTA Styling"):
 *   Any CTA whose link target is `/blue-door` must use the cobalt `bluedoor`
 *   token — solid as primary or cobalt outline as secondary. Never gold,
 *   teal, navy, raspberry, lime, or the generic `primary`. In <TierHeroSection>
 *   the `isPrimary: true` shortcut renders gold and is forbidden; pass
 *   `buttonClassName` with bluedoor classes instead. In <ParallaxCTA> use
 *   `variant: "bluedoor"`.
 *
 * This is a lightweight static visual-regression check: rather than diffing
 * pixels (heavy in CI), we assert the className tokens that drive the visual
 * outcome. If a future edit reintroduces gold/teal/navy/etc on a blue-door
 * CTA, this test fails before it ships.
 */
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");

// Pages/components that are themselves the Blue Door destination, archives,
// or experiments not currently routed. /blue-door refs in these files are
// either self-links or out of scope for the cobalt rule.
const EXCLUDED = [
  /\/_archive(-v[\d.]+)?\//,
  /\/BlueDoorLandingArchive\.tsx$/,
  /\/PPSHomeArchive\.tsx$/,
  /\/PPSHomeVerbatim\.tsx$/,
  /\/PPSHomeAlt\.tsx$/,
  /\/HeroPreviewV[123]\.tsx$/,
  /\/Sitemap\.tsx$/,
  /\/App\.tsx$/,
  // Self-referential blue-door surfaces
  /\/BlueDoorLanding\.tsx$/,
  /\/BlueDoorPurchase\.tsx$/,
  /\/components\/pps\/blue-door\//,
  // Tests
  /__tests__\//,
];

const FORBIDDEN_CLASS_TOKENS = [
  "bg-primary",
  "border-primary",
  "text-primary",
  "bg-gold",
  "border-gold",
  "bg-navy",
  "bg-teal",
  "bg-raspberry",
  "bg-lime",
];

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (entry.isFile() && full.endsWith(".tsx")) acc.push(full);
  }
  return acc;
}

/**
 * Grab a generous source window around the `/blue-door` occurrence. Large
 * enough to include the wrapping <Button>/<Link> opening tag, the nested
 * styled child (for card-style CTAs), and the closing tag — but small enough
 * to stay scoped to a single CTA.
 */
function ctaContext(src: string, idx: number): string {
  const start = Math.max(0, idx - 400);
  const end = Math.min(src.length, idx + 600);
  return src.slice(start, end);
}

const files = walk(path.join(ROOT, "pages"))
  .concat(walk(path.join(ROOT, "components")))
  .filter((f) => !EXCLUDED.some((re) => re.test(f.replace(/\\/g, "/"))));

describe("Blue Door CTA visual regression (className tokens)", () => {
  const violations: string[] = [];

  for (const file of files) {
    const src = fs.readFileSync(file, "utf8");
    if (!src.includes("/blue-door")) continue;

    // Find every /blue-door occurrence and audit its surrounding CTA block.
    const re = /["'`]\/blue-door["'`]/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      const ctx = ctaContext(src, m.index);

      // Skip non-CTA contexts (e.g. a plain anchor inside body copy with no
      // button styling and no Button/TierHero/ParallaxCTA wrapper).
      const looksLikeCta =
        /<Button\b/.test(ctx) ||
        /buttonClassName/.test(ctx) ||
        /isPrimary\s*:/.test(ctx) ||
        /variant\s*:\s*["']bluedoor["']/.test(ctx) ||
        /<ParallaxCTA\b/.test(ctx) ||
        /className=/.test(ctx);
      if (!looksLikeCta) continue;

      const rel = path.relative(ROOT, file);

      // Forbidden: gold shortcut in TierHeroSection CTAs
      if (/isPrimary\s*:\s*true/.test(ctx)) {
        violations.push(`${rel}: TierHero CTA uses isPrimary:true (gold) — use buttonClassName with bluedoor.\n${ctx.trim().slice(0, 240)}`);
      }

      // Forbidden: generic outline variant without bluedoor classes
      if (
        /variant=["']outline["']/.test(ctx) &&
        !/bluedoor/.test(ctx)
      ) {
        violations.push(`${rel}: outline button to /blue-door lacks bluedoor classes.\n${ctx.trim().slice(0, 240)}`);
      }

      // Forbidden color tokens
      for (const token of FORBIDDEN_CLASS_TOKENS) {
        // Allow `text-bluedoor`/`bg-bluedoor` — only match the bare token.
        const tokRe = new RegExp(`(^|[\\s"'\`])${token}(?![\\w-])`);
        if (tokRe.test(ctx)) {
          violations.push(`${rel}: forbidden class "${token}" on /blue-door CTA.\n${ctx.trim().slice(0, 240)}`);
        }
      }

      // Must contain a bluedoor signal somewhere in the CTA block.
      const hasBluedoor =
        /bluedoor/.test(ctx) || /variant\s*:\s*["']bluedoor["']/.test(ctx);
      if (!hasBluedoor) {
        violations.push(`${rel}: /blue-door CTA missing 'bluedoor' class/variant.\n${ctx.trim().slice(0, 240)}`);
      }
    }
  }

  it("every /blue-door CTA uses cobalt (bluedoor) styling", () => {
    expect(violations, violations.join("\n\n---\n\n")).toEqual([]);
  });

  it("scanned at least 5 live files (sanity check)", () => {
    const scanned = files.filter((f) =>
      fs.readFileSync(f, "utf8").includes("/blue-door")
    );
    expect(scanned.length).toBeGreaterThanOrEqual(5);
  });
});
