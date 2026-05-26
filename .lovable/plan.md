
# Stats Integration Plan — McKinsey + Human Data

## Recommendation (the "why" first)

Your data tells two distinct stories, and the ICP cares about different parts of each depending on where they are in the journey. Forcing it all into one section flattens the message. Instead, distribute by **page intent**:

| Page | Audience mindset | Story to tell | Stat type |
|---|---|---|---|
| **Home** (`/`) | "Is this for me?" — broad, skim-reading | Reality check that this isn't a niche problem. Hook attention. | Headline scrollers + 1 hero stat band |
| **`/partner`** (org hub) | "We have a real change initiative. Is this serious?" | Why org architecture (not training, not management) is the gap. | McKinsey "shifts" stats, framed against Pillars |
| **`/partner/embody`** | "We're committing 6–12 months. Convince me the human cost is real." | The human cost of unarchitected change. Justifies the depth of the engagement. | Human/burnout stats |

This matches your three frameworks: **Pillars** answer the org-structure problem (partner hub), **Phase Zero™** answers the change-fatigue problem (home), **EMBODY's** depth is justified by burnout data.

---

## What gets built

### 1. Home page — "The 3AM Stats Bar" + one inline data moment
**Why here:** Home visitors are scanning. We need pattern interrupts, not paragraphs.

- **A. Stat Marquee Bar** — slim, animated horizontal scroller (similar feel to the 3AM Questions strip you referenced), placed after the welcome/positioning section, before the P.A.T.H. ladder. Cycles 4 short stats with sources:
  - "86% of organizations aren't ready to adopt AI at scale" — McKinsey
  - "2 in 3 leaders say their organization is overly complex and inefficient" — McKinsey
  - "Only 32% of leaders say their last change effort actually stuck" — Gartner
  - "Global employee engagement fell to 20% in 2025" — Gallup
- **B. Inline pull-quote stat** woven into existing copy: "$10 trillion in lost productivity. 9% of global GDP. That's the cost of asking people to adapt to change their organization wasn't built to hold." (Gallup, cited)

### 2. `/partner` (Partner With Us hub) — McKinsey "Reality vs. The Shift" section
**Why here:** This is the page where decision-makers evaluate whether PPS understands their problem. Show we've read the room.

- New section: **"The Architecture Gap"** (placed before "How To Choose")
- **Style B (Editorial data band)** with split-row "Reality → Shift" cards using **Style C** treatment:
  - **Reality:** 86% not ready for AI · The Shift: Foundational Architecture must hold tech, not chase it
  - **Reality:** 2 in 3 say overly complex · The Shift: Operational Intelligence redesigns flow
  - **Reality:** Only 32% saw change stick · The Shift: Phase Zero™ authors what gets built
  - **Reality:** 79% have low trust in change · The Shift: Human Capacity makes adoption durable
- Color-codes each row to its matching Pillar (Teal, Lime, Raspberry, Navy).
- Small superscript citations linking to a `[Sources]` accordion at the bottom.

### 3. `/partner/embody` — "The Human Cost" stat band
**Why here:** EMBODY is the deepest, most expensive tier. The investment is justified by the magnitude of the human problem. Placed before the final CTA.

- **Style A (Bold stat cards)** — 3-card grid in raspberry/gold on a muted background:
  - **20%** — Global employee engagement, lowest since 2020 (Gallup 2026)
  - **1 in 4** — Employees report burnout symptoms (McKinsey Health)
  - **52% / 49%** — "Always" or "often" exhausted / stressed (Deloitte)
- Single line of PPS framing underneath: *"This is what unarchitected change does to people. EMBODY exists so it stops happening on your watch."*

---

## Shared infrastructure

- **New component:** `src/components/pps/StatCard.tsx` — reusable big-number card (number, label, source). Variants: `bold` | `editorial` | `inline`.
- **New component:** `src/components/pps/StatMarquee.tsx` — slim, auto-scrolling stat bar (CSS marquee, pauses on hover, respects `prefers-reduced-motion`).
- **New data file:** `src/data/research-stats.ts` — single source of truth so the same stat appears identically wherever it's cited (one place to update if numbers change).
- **Citations:** small `<sup>` numbers next to each stat, footnoted at the bottom of each section. Match the citation style used in your "Architecture of Change" article.

## Technical notes

- All stats live in `src/data/research-stats.ts` keyed by ID; components accept a `statId`.
- Trademark rule respected: Phase Zero™ already used on `/partner`, so the new section uses it without re-marking. Pillars references use the shorthand "Porch Pillars" after first use on the page.
- No new routes, so no `page_status` / Sitemap entries needed.
- No backend changes.
- Files touched: ~3 new components/data file, edits to `PPSHome.tsx`, `PartnerWithUs.tsx` (or equivalent partner hub), and the EMBODY page.

## Out of scope (flag for later)
- Animated count-up on stat reveal (could add later if you want; `useCountUp` already exists).
- A dedicated "Research & Data" resources page that aggregates all citations — worth considering once you have 10+ cited stats across the site.

---

Want me to proceed exactly as above, or adjust any of the three placements / stat picks first?
