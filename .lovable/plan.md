# Standardize Eyebrow Labels

Codify the informal two-tier system already emerging in the codebase: **pill eyebrows for major section headers, plain all-caps for sub-labels** — and enforce it through a shared component so future pages can't drift.

## Approach

### 1. Create `<Eyebrow>` component (`src/components/pps/Eyebrow.tsx`)

Single component, two variants:

```tsx
<Eyebrow variant="pill" tone="gold|teal|cobalt|raspberry|purple|navy|lime">LABEL</Eyebrow>
<Eyebrow variant="plain" tone="gold|teal|...">LABEL</Eyebrow>
```

- **pill**: `inline-block rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase mb-6` + tone bg/text classes
- **plain**: `inline-block text-xs font-semibold uppercase tracking-[0.2em] mb-4` + tone text class
- Tone tokens pull from existing brand palette (`bg-gold/90 text-navy`, `text-teal`, etc.) — no new colors.
- Accepts `className` for one-off overrides.

### 2. Define the rule (codify in `mem://style/eyebrow-usage`)

- **Pill** = first eyebrow inside a top-level `<section>` that introduces a major page region (hero, tier intro, "Our Approach", "Pricing", etc.). One pill per section max.
- **Plain** = sub-labels *inside* a section: card category tags, sub-headers within a region, labels above secondary headings, eyebrows inside reusable components (`ParallaxCTA`, `FAQSection`, `StatMarquee`).
- New pages must use `<Eyebrow>` — no hand-rolled `rounded-full` eyebrow markup.

### 3. Migrate existing usage

Sweep the ~20 files with inline `rounded-full` eyebrows and the plain `uppercase tracking-*` eyebrows. For each occurrence:

- Replace with `<Eyebrow variant="pill" tone="...">...</Eyebrow>` or `<Eyebrow variant="plain" tone="...">...</Eyebrow>` based on the rule above.
- Preserve the existing tone (gold stays gold, teal stays teal, etc.).
- Where a page currently has *two* pill eyebrows in the same section, demote the second one to plain.
- Leave `ParallaxCTA`, `FAQSection`, `StatMarquee` internal eyebrows on `plain` (already correct semantically).

### 4. Add a lint/audit script

Extend `scripts/` with `brand:eyebrows` (modeled on the existing `brand:typography` validator) that fails when it finds:
- `rounded-full` + `uppercase` + `tracking-` combos outside `Eyebrow.tsx`
- Raw `<span className="...uppercase tracking-...">` eyebrow patterns in page files

Wire it into the existing brand validation flow so drift is caught at review time.

## Technical Details

- **Files touched (estimate):** 1 new component, 1 new memory file, 1 new lint script, ~25 page/section files updated.
- **No design token changes** — pulls from existing brand colors in `index.css` / `tailwind.config.ts`.
- **No behavior change** for `ParallaxCTA`, `FAQSection`, `StatMarquee` — their internal eyebrows already match the "plain = sub-label" rule.
- **Risk:** visual regression on pages where I demote a duplicate pill to plain. I'll spot-check the most-trafficked pages (Home, Blue Door, EMBODY, AMPLIFY, IGNITE, About) after migration.

## Open Question Before I Start

A few pages currently use **two pills in the same section** (e.g., a section eyebrow plus a card-level eyebrow inside it). Two options:

- **A. Strict:** Demote inner pills to plain everywhere (cleaner hierarchy, some visual change).
- **B. Lenient:** Allow a pill inside a card *only if* the card is itself a major sub-region (rare). Default everything else to plain.

I'll go with **A (strict)** unless you say otherwise — it's the only version that makes the rule enforceable by the linter.
