
# P.A.T.H. + About-suite Audit

## 1. Where P.A.T.H. lives today

| Page | P.A.T.H. treatment |
|---|---|
| `/` (Home) | The richest visual: "Your P.A.T.H. to Sustainable Change" — 4-step winding-road graphic (Prepare / Align / Take Off / Habits) in colored cards. **Letters + words only — zero explanation of what each step actually means.** |
| `/start-here` | The quiz that routes people to a P.A.T.H.way (uses the term as a navigation device, not a methodology page). |
| `/partner` & tier pages | Use "P.A.T.H." as the partnership hub vocabulary (Ignite/Amplify/Embody as "P.A.T.H.ways"). Tier pages reference it but don't teach the framework. |
| `/phase-zero` | Currently teaches **The Painted Porch Pillars** (Foundational Architecture / Operational Intelligence / Human Capacity) — the WHO/WHERE framework. Does **not** mention P.A.T.H. as a methodology. |
| `/about`, `/about/approach`, `/about/impact` | **P.A.T.H. is entirely absent** as a framework. Only a CTA button label ("Find Your P.A.T.H.way") on the Approach final CTA. |

**Verdict:** P.A.T.H. is a brand motif everywhere but is **never actually taught** anywhere on the site. The home graphic shows the steps; nothing explains them.

## 2. Phase Zero link from `/about/approach`

`/about/approach` mentions "the work we call Phase Zero" with a link to `/phase-zero` (lines 242–249). The link **exists and is correct**. What's weak is that it's a single inline sentence in the "Where We Fit" card — Phase Zero deserves a stronger callout given how central it is.

## 3. Overlap + gap audit across the About suite

### `/about` (PPSAbout.tsx, 426 lines)
Sections: Hero → "On Becoming" → Our Story → Foundational Abilities (5) → Team intro → Team cards → Marquee → **R.L.P.V.** (Reason/Logic/Purpose/Virtue) → Our Response → **Certifications grid (14 badges)** → What's a Painted Porch → Contact CTA.

### `/about/approach` (OurApproach.tsx, 272 lines)
Sections: Hero → **Core Values** (Purpose/Partnership/Stewardship) → Manifesto (believe vs. reject) → "Conditions We Build" → Promise + Where We Fit → Blue Door CTA → PartnershipPromise.

### `/about/impact` (OurImpact.tsx, 324 lines)
Sections: Video hero → Marquee → 3 Testimonials → **Do Good ShIFt** + counter ($31,199) → Charities grid (29) → Parallax CTA.

### Overlaps
- **Marquee** appears on `/about` and `/about/impact` (fine — site-wide pattern).
- **"What we partner on / upstream of rollout" idea** lives on both `/about` ("On Becoming") and `/about/approach` ("Where We Fit"). Same point, different words.
- **Stoic / Painted Porch story** lives on `/about` ("What's a Painted Porch") and is *referenced* by `/about/approach` via tone but never told there. Not a real overlap.
- **Values vs. R.L.P.V.** — `/about/approach` has Purpose/Partnership/Stewardship; `/about` has Reason/Logic/Purpose/Virtue. Two different "values" frameworks on adjacent pages risks confusion. Worth deciding which is *the* values list and where it lives.
- **PartnershipPromise component** is on `/about/approach` and `/phase-zero` (intentional, fine).

### Gaps
- **No P.A.T.H. methodology explainer** anywhere on the site.
- **Certifications + credentials** live only on `/about` (mixed into a long page). They're a trust asset that pairs naturally with methodology.
- **No "how we do the work" walkthrough** — `/about/approach` is philosophy (values, beliefs, conditions) but never shows the *mechanics* (P.A.T.H. stages, what happens in each).
- **Phase Zero ↔ P.A.T.H. relationship is never named.** Phase Zero is the "Prepare" stage; that connection is invisible to readers.

## 4. Proposed home for the full P.A.T.H. framework

Your instinct (put it on `/about/approach`) is the right *neighborhood* — but the page is currently a philosophy/manifesto page. Two viable options:

**Option A — Expand `/about/approach` into the methodology page (recommended)**
Add a dedicated "Our Methodology: The P.A.T.H." section between "Conditions We Build" and "Promise + Where We Fit":
- Intro: P.A.T.H. as the navigational framework (Prepare → Align → Take Off → Habits).
- Four stage cards (color-coded to match the home graphic) with: what it is, what we do in this stage, what you walk away with.
- Call out: **"Prepare = Phase Zero"** with link to `/phase-zero`.
- Move **Certifications grid** off `/about` and onto `/about/approach` directly under the methodology (credentials reinforce the method).
- Rename page H1 from "Our Approach" → keep "Our Approach" but reframe: philosophy *and* methodology, in that order.

**Option B — New dedicated `/path` page**
Pure framework page. Cleaner separation but adds another route to maintain and splits attention from `/phase-zero`.

Recommendation: **Option A**. Keeps the IA flat, gives `/about/approach` the substance it currently lacks, and naturally links to `/phase-zero` (Prepare stage) and the partner tiers (Habits stage).

## 5. Proposed changes (if you approve)

1. **`/about/approach`** — Add P.A.T.H. methodology section (4 stage cards + Phase-Zero callout). Strengthen Phase Zero link from inline mention to a bordered callout block.
2. **`/about/approach`** — Move Certifications grid here from `/about`.
3. **`/about`** — Remove certifications, tighten R.L.P.V. (or replace with link to Approach), and let it stay focused on *story + team + Stoic origin*.
4. **`/phase-zero`** — Add a short "Phase Zero is the *Prepare* stage of our P.A.T.H. methodology" lead-in near the top, with a link back to `/about/approach`.
5. **Optional content cleanup** — Decide on a single canonical "values" framework (Core Values vs. R.L.P.V.); keep both only if you can articulate the distinction clearly.

## Open questions before I build

- Confirm Option A (expand `/about/approach`) vs. Option B (new `/path` page)?
- OK to move Certifications off `/about` onto `/about/approach`?
- Keep both Core Values *and* R.L.P.V., or consolidate?
- Should the Certifications section also include team headshots / "who's certified in what" — or just badges as today?
