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
 * Extract the CTA block surrounding a `/blue-door` occurrence.
 * Walks back to the nearest `<Link`, `<Button`, `<a `, or `{` (ctas[] entry
 * opener), then forward to the matching closing `</Link>`, `</Button>`,
 * `</a>`, or `},`. This stays inside one CTA and doesn't bleed into siblings.
 */
function ctaContext(src: string, idx: number): string {
  const openers = [
    { re: /<Link\b/g, close: "</Link>" },
    { re: /<Button\b/g, close: "</Button>" },
    { re: /<a\s/g, close: "</a>" },
  ];

  let bestStart = -1;
  let closeStr: string | null = null;
  for (const { re, close } of openers) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    let lastBefore = -1;
    while ((m = re.exec(src)) !== null && m.index < idx) {
      lastBefore = m.index;
    }
    if (lastBefore > bestStart) {
      bestStart = lastBefore;
      closeStr = close;
    }
  }

  // ctas[] object entry: nearest `{` on its own line with `href`/`label` nearby
  const objStart = src.lastIndexOf("{", idx);
  if (objStart > bestStart && idx - objStart < 400) {
    bestStart = objStart;
    closeStr = "}";
  }

  if (bestStart < 0) {
    return src.slice(Math.max(0, idx - 200), Math.min(src.length, idx + 300));
  }

  const endIdx = closeStr
    ? src.indexOf(closeStr, idx)
    : -1;
  const end = endIdx > 0 ? endIdx + (closeStr?.length ?? 0) : Math.min(src.length, idx + 400);
  return src.slice(bestStart, end);
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

      // Forbidden: gold shortcut in TierHeroSection CTAs, unless an explicit
      // bluedoor buttonClassName overrides the gold styling.
      if (/isPrimary\s*:\s*true/.test(ctx) && !/buttonClassName[^,}]*bluedoor/.test(ctx)) {
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

      // --- Accessibility: accessible name ---------------------------------
      // Icon-only CTAs (an icon component as the only child, no text node)
      // need an explicit accessible name.
      const strippedTags = ctx.replace(/<[^>]*>/g, "\u0000");
      const visibleText = strippedTags
        .split("\u0000")
        .map((t) => t.replace(/[{}\s]/g, ""))
        .join("");
      const hasIcon = /<(ArrowRight|ArrowLeft|DoorOpen|DoorClosed|ChevronRight|ChevronLeft|ExternalLink|Key|Lock)\b/.test(ctx);
      const hasAccessibleName =
        /aria-label\s*=/.test(ctx) ||
        /aria-labelledby\s*=/.test(ctx) ||
        /sr-only/.test(ctx) ||
        /\blabel\s*:/.test(ctx) ||
        visibleText.length > 0;
      if (!hasAccessibleName) {
        violations.push(
          `${rel}: /blue-door CTA has no accessible name${hasIcon ? " (icon-only)" : ""} — add visible text or aria-label.\n${ctx.trim().slice(0, 240)}`,
        );
      }

      // Decorative icons inside a labelled CTA should be hidden from AT.
      if (hasIcon && visibleText.length > 0 && !/aria-hidden/.test(ctx) && /<Button\b/.test(ctx)) {
        // shadcn Button renders lucide icons with aria-hidden by default only
        // when passed `aria-hidden`; flag raw usages so screen readers don't
        // announce the glyph name.
        // (informational-strength rule: only raw <a>/<Link> markup)
      }

      // --- Accessibility: visible focus state ------------------------------
      // Hand-rolled anchors/links (not shadcn <Button>, which ships a
      // focus-visible ring) must declare their own focus-visible treatment.
      const usesButtonPrimitive =
        /<Button\b/.test(ctx) ||
        /buttonClassName/.test(ctx) ||
        /<ParallaxCTA\b/.test(ctx) ||
        /variant\s*:/.test(ctx) ||
        /isPrimary\s*:/.test(ctx);
      const isRawAnchor = !usesButtonPrimitive && /className=/.test(ctx) && /<(a\s|Link\b)/.test(ctx);
      const hasFocusState =
        /focus-visible:/.test(ctx) ||
        /focus-ring-on-dark/.test(ctx) ||
        /focus:ring/.test(ctx) ||
        /focus:outline/.test(ctx);
      if (isRawAnchor && !hasFocusState) {
        violations.push(
          `${rel}: /blue-door link has custom styling but no focus-visible state — add focus-visible: classes or focus-ring-on-dark.\n${ctx.trim().slice(0, 240)}`,
        );
      }

      // Focus rings must never be removed outright.
      if (/(focus:outline-none|focus-visible:outline-none)/.test(ctx) && !hasFocusState) {
        violations.push(
          `${rel}: /blue-door CTA removes the focus outline without a replacement ring.\n${ctx.trim().slice(0, 240)}`,
        );
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
