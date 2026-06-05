# Plan: Anchor Wiring + Resume Content Audit

## Part 1 — Anchor & Deep-Link Wiring (execute first)

Goal: every cross-page mention of P.A.T.H., Phase Zero, or Certifications lands the user directly on the right section, not the top of a long page.

### 1. `src/pages/pps/about/OurApproach.tsx`
- Add `id="certifications"` + `scroll-mt-24` to the Certifications section wrapper (currently line 375).
- Confirm existing `id="path"` on the Methodology section already has `scroll-mt-24` (it does).

### 2. `src/pages/pps/PPSAbout.tsx`
- In the "Our Response" / methodology bridge copy, split the dual mention so:
  - "P.A.T.H. methodology" → `/about/approach#path`
  - "our certifications" → `/about/approach#certifications`
- Keep copy intact; only swap the link targets.

### 3. `src/pages/pps/PhaseZero.tsx`
- Above the "Where Phase Zero Leads" cards, add a short back-link sentence:
  "Phase Zero is the Prepare stage of our broader P.A.T.H. methodology →" linking to `/about/approach#path`.
- No other content changes.

### 4. Verify
- `ScrollToHash` in `App.tsx` already handles cross-page hash scroll (100ms smooth) — no changes.
- Spot-check anchors render correctly at top of viewport (scroll-mt-24 accounts for sticky nav).

No changes to: `/about/impact`, methodology copy, Approach Prepare callout, shared components.

---

## Part 2 — Resume About-Suite Content Audit (execute after Part 1)

Pick up the re-homing recommendations that were paused. Proposed execution order:

### Step A — `/about/approach` (OurApproach.tsx)
New section flow:
1. Hero
2. Manifesto (move up — current opener)
3. Core Values
4. **R.L.P.V.** (moved IN from `/about`)
5. The Conditions We Build Together
6. **5 Foundational Abilities** (moved IN from `/about`) — rendered as a side-by-side pair with Conditions ("What we build in people" vs "What we build in the org")
7. P.A.T.H. Methodology (with `#path`)
8. Certifications (with `#certifications`)
9. Partnership Promise
10. Final Blue Door ParallaxCTA

### Step B — `/about` (PPSAbout.tsx)
New section flow:
1. Hero
2. **What's a Painted Porch** (Stoa Poikile — moved up right after hero)
3. On Becoming
4. Our Story
5. Team grid
6. Client marquee / trust signals
7. "How we think + how we work" bridge (links to `#path` and `#certifications`)
8. Final CTA (convert to `<ParallaxCTA>`, non-navy tone)

Removed from `/about`: R.L.P.V., 5 Foundational Abilities (now on Approach).

### Step C — Style/flow polish on `/about`
- Alternate section backgrounds (`bg-white` ↔ `bg-muted/30`) so no two whites touch.
- Normalize eyebrow tag styling across sections.
- Enforce single H1; primary vs secondary H2 hierarchy.
- Team grid contrast check (Amy's `bg-strategic/10` card).
- Trademark hygiene: ≤ 1 ™ on `/about` (primary mention only).
- Tighten "Our Response" copy as part of the bridge section.

### Step D — `/about/impact`
No changes this round (confirmed last time).

### Open question to resolve before Step A
For the Approach page: **merge Foundational Abilities + Conditions into one list, or keep as two side-by-side cards?**
My recommendation: two side-by-side cards (abilities = individuals, conditions = organization). Confirm or override.

---

## Order of operations
1. Execute Part 1 (anchors) — small, low-risk, ~3 file edits.
2. Confirm Part 2 scope + the side-by-side vs merge question.
3. Execute Step A (Approach restructure).
4. Execute Step B (About restructure).
5. Execute Step C (About polish).
