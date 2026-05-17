## Goal

One page, one job. Each block has a single canonical home.

- **`/phase-zero`** = canonical home for the universal Painted Porch Pillars framework + diagnostic + universal outcomes
- **`/partner/embody`** = tier-specific commitments only (What We'll Architect per Pillar)
- **`/about/approach`** = manifesto + Core Values (kept, language revised)
- **`/about`** = story + leader + new "On Becoming" band
- **`/home-verbatim`** = **moved to Draft** (admin-only copy reference, not externally linked)

## Content Source Map (final)

| Block | Source today | New canonical home |
|---|---|---|
| Full Pillar definitions | `/home-verbatim` | `/phase-zero` |
| Essential Elements (behavioral bedrock) | `/home-verbatim` | `/phase-zero` |
| Fortified Porch (result band) | `/home-verbatim` | `/phase-zero` |
| The Questions per Pillar | `/partner/embody` | `/phase-zero` |
| Outcomes per Pillar | `/partner/embody` | `/phase-zero` |
| What We'll Architect per Pillar | `/partner/embody` | **stays on `/partner/embody`** |
| Manifesto / worldview prose | `/phase-zero` (currently) | `/about/approach` |
| Core Values | `/about/approach` | **stays** (language revised only) |
| On Becoming editorial | thesis doc | new band on `/about` |

## Page Changes

### 1. `/phase-zero` (`src/pages/pps/PhaseZero.tsx`) — full rewrite

Sections in order:
1. **Hero** — em-dashes removed, single `™` on this page (Phase Zero™)
2. **What we are navigating** — accelerating complexity, fragmentation (6th-grade)
3. **The work before the work** — what Phase Zero is
4. **What Phase Zero is not** — Is / Is Not two-column
5. **Foundations Phase Zero examines** *(NEW, anchor `id="foundations"`)*
   - Intro: "Phase Zero examines three load-bearing structures."
   - **Painted Porch Pillars** — three cards per Pillar (Teal / Lime / Raspberry per memory):
     - Pillar name + subtitle + icon
     - **Full definition paragraph** (lifted from `/home-verbatim`, rewritten 6th-grade)
     - **The Questions** (diagnostic bullets, lifted from EMBODY)
     - **Universal Outcomes** (strong-footing results, lifted from EMBODY)
   - **Essential Elements** behavioral bedrock pill row (from `/home-verbatim`): Communication, Collaboration, Clarity, Resilience, Alignment, Organizational Health
   - **The Fortified Porch** navy result band (from `/home-verbatim`)
6. **Where Phase Zero leads** — three-card mini-map: Blue Door Diagnostic → P.A.T.H.way → Strategic Advisory
7. **Final CTA** — `<ParallaxCTA>`, cobalt `bluedoor` primary + `/start-here` secondary

### 2. `/partner/embody` — slim Pillars block

Read first: `src/pages/pps/partner/EmbodyPath.tsx` (+ `-Alt` variant) and `src/components/pps/embody/*` to find exact section boundaries.

Keep on EMBODY:
- Section intro framing EMBODY-level integration
- Three Pillar cards: name + subtitle + icon, **one-line** definition, **What We'll Architect** bullets (tier-specific)

Remove from EMBODY (now lives on `/phase-zero`):
- Full Pillar definition paragraphs
- **The Questions** per Pillar
- **Outcomes** per Pillar
- Standalone Essential Elements band
- Standalone Fortified Porch band

Add below the Pillar cards:
- Inline callout: *"These Pillars are the universal framework Phase Zero examines. See the full framework, diagnostic questions, and outcomes on the Phase Zero page →"* → `/phase-zero#foundations`

### 3. `/about/approach` (`OurApproach.tsx`) — restructure

- Keep `TierHeroSection`
- **Keep Core Values** (Purpose, Partnership, Stewardship) — language revised to 6th-grade, manifesto-aligned
- Keep `PartnershipPromise`
- Remove 5-Principles zigzag and RLPV block
- Add manifesto bands: "What we believe," "What we reject," "What we create the conditions for," "The Painted Porch promise," "Where we fit" two-column
- Final CTA → `<ParallaxCTA>` (cobalt Blue Door primary)
- No `™` on this page

### 4. `/about` (`PPSAbout.tsx`) — additive

- Add **"On Becoming"** band under hero: bg-white, max-w-3xl, navy H2, charcoal body, 6th-grade thesis prose, closes with link to `/about/approach`
- Soften Cicero / Summum Bonum references to origin-context flavor
- Keep lime band, team, certifications, existing CTA
- No `™` on this page

### 5. `/home-verbatim` — deprecate to Draft

- Update `page_status` row for `/home-verbatim` from Live → Draft via migration (admin-only via PageGate)
- Remove any in-app links pointing to it (search `rg "home-verbatim"`)
- File and route stay in repo as a copy-reference artifact; existing `PPSHomeVerbatim.partnership.test.ts` continues to protect verbatim copy
- Not removed from Sitemap (admin still sees Draft badge there)

## Global Constraints

- No em-dashes — replace with colons or periods
- 6th-grade plain English
- One `™` per page total — only on `/phase-zero` in this batch
- Cobalt `bluedoor` variant for every `/blue-door` CTA
- `<ParallaxCTA>` for every final band
- Semantic tokens only
- No new components, hooks, routes, schema tables, edge functions

## Technical Section

**Read before editing:**
- `src/pages/pps/PPSHomeVerbatim.tsx` (lift definitions + Essential Elements + Fortified Porch)
- `src/pages/pps/partner/EmbodyPath.tsx` + any `-Alt` variant + `src/components/pps/embody/*` (lift Questions + Outcomes; identify slim points)
- `src/pages/pps/OurApproach.tsx`
- `src/pages/pps/PPSAbout.tsx`
- `src/pages/pps/PhaseZero.tsx`
- `src/components/pps/ParallaxCTA.tsx`
- `src/components/pps/PartnershipPromise.tsx`

**Edit:**
- `src/pages/pps/PhaseZero.tsx` — full rewrite; Foundations section uses `id="foundations"`
- EMBODY page / Pillars sub-components — slim cards, remove EE + FP bands, add link to `/phase-zero#foundations`
- `src/pages/pps/OurApproach.tsx` — manifesto restructure, Core Values revised
- `src/pages/pps/PPSAbout.tsx` — add "On Becoming" band
- One migration: `UPDATE page_status SET status='draft' WHERE path='/home-verbatim';`
- Search-and-remove any internal links to `/home-verbatim`

**Post-edit:** `npm run brand:validate` (confirm 1 `™` on `/phase-zero`; 0 on EMBODY, About, Approach).

## Out of Scope

- AMPLIFY / IGNITE Pillars treatment (same pattern, separate pass)
- Home page (`PPSHome.tsx`)
- New routes
- Backend, schema additions, edge functions
