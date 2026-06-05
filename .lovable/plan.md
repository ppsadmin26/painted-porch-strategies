# Site-Wide Audit & Remediation Plan

Scope: content, anchors, CTAs, SEO across all PPS pages. Findings prioritized P0 → P3. Nothing executed yet — confirm scope before I start.

---

## P0 — Broken / wrong (fix first)

1. **Dead anchors `#coaching` and `#advisory` on `/services`**
   - Used by `PPSHomeArchive.tsx` (lines 185, 200) and `PPSHomeAlt.tsx` (195, 210) linking `to="/services#coaching"` and `to="/services#advisory"`.
   - `PPSServices.tsx` defines neither ID. Either add the IDs (with `scroll-mt-24`) to the matching sections, or strip the hash. Note both files are archive/alt variants; lowest-risk fix = remove the hash.

2. **`/services` itself has no `useDocumentSeo`** — bare `<title>Lovable App</title>` fallback for a key page. Same gap on **/about**, **/about/approach**, **/about/impact**, **/contact**, **/start-here**, **/blue-door**, **/phase-zero** sub-pages, **/partner/***, **/programs/***, **/speaking**, **/resources/***. Only 8 of ~60 pages currently call the SEO hook.

3. **`scroll-mt` missing on most in-page anchor targets**
   - Confirmed only 9 files use `scroll-mt-*`. Pages with `<section id="...">` but no offset class will scroll under the sticky nav: `BurnoutResources` (`#resources-start`), `StracticalLeaderGuide` (`#get-guide`), `CommunicatorStyles`, `StoicFieldGuide`, `KickTheHabit`, `PilotTraining`, `ElementsMiniSignUp` (`#pricing`), `EQChangeLeaderMini`, `PPSPrograms` (`#signature-programs`), `partner/ignite/EQAssessment`, `partner/ignite/WorkingGeniusAssessment` (`#get-started`), `partner/EmbodyPathAlt` (`#human-cost-heading`).
   - Fix: add `scroll-mt-24` to each target section.

---

## P1 — Hand-rolled final CTAs to replace with `<ParallaxCTA>`

Confirmed via `bg-fixed|bg-cover` scan, excluding intentional hero sections and archives:

| File | Section | Suggested tone |
|---|---|---|
| `pages/pps/about/OurImpact.tsx` | final CTA band | `gold` (warm/celebratory) |
| `pages/pps/Speaking.tsx` | "Book Amy" closing | `purple` |
| `pages/pps/partner/IgnitePathAlt.tsx` | bottom CTA | `teal` (tier-aligned) |
| `pages/pps/partner/AmplifyPathAlt.tsx` | bottom CTA | `purple` |
| `pages/pps/partner/amplify/AmplifyWorkshops.tsx` | bottom CTA | `purple` |
| `pages/pps/partner/ignite/WorkingGeniusAssessment.tsx` | bottom CTA | `teal` |
| `components/pps/partner/FinalInvitationSection.tsx` | Partner hub closer | `charcoal` (neutral, sits above teal sections) |
| `pages/pps/ChangeCommsSignUp.tsx`, `ChangeRoadmapSignUp.tsx`, `ChangeCommsThankYou.tsx`, `ChangeRoadmapThankYou.tsx` | final CTA | `teal` |

Excluded (correctly hand-rolled or intentional): Blue Door `FinalCTASectionAlt` (custom raspberry per memory), `TierHeroSection` (heroes, not final CTAs), `PPSBlog` (list page CTA).

---

## P2 — Content audit (copy, headings, structure)

### Hierarchy / headings
- **Multiple H1 risk**: spot-check `PPSAbout`, `PartnerWithUsAlt`, `PhaseZero`, `OurApproach` — confirm exactly one `<h1>` after the recent restructures. Demote stray `text-4xl`s used as visual H1s.
- **Eyebrow normalization**: standardize on `text-sm uppercase tracking-wide font-semibold text-primary` across all section eyebrows. Currently inconsistent (some text-xs, some text-gold, some no tracking).

### Copy hygiene (per memory rules)
- **Em-dashes (—)**: ban per Core rule. Sweep all `/pps` pages with `rg "—"` and convert to commas, colons, or split sentences. Last sweep was partial.
- **Trademark linter**: run `npm run brand:validate` and fix all `> 1 ™` per page violations. Shared components (footer, search, partner sections) must be 0.
- **"Schedule a call" / `mailto:`**: do a final pass; per memory all CTAs should resolve to `/contact`.
- **"shIFt" / "What IF?" casing**: verify capitalization on home, about, approach, blog headings.

### Cross-link health
- Sweep every `<Link to="/...">` for routes deleted/renamed in the recent restructure (`/about` reordering moved R.L.P.V. + Foundational Abilities → `/about/approach`). Verify no nav/footer/sitemap link points to a removed section ID on `/about`.
- `/about/approach#path` and `#certifications` confirmed valid (P0-2 audit already done).
- `/phase-zero#foundations` confirmed valid.
- `/about/impact#do-good-shift` confirmed valid.

### Page-by-page quick wins
- **`/about`**: alternate `bg-white` ↔ `bg-muted/30` (now partial). Team grid contrast for Amy's `bg-strategic/10` card — verify text-foreground meets AA.
- **`/about/approach`**: confirm new R.L.P.V. + side-by-side abilities/conditions sections have matching vertical rhythm (py-20/py-24) and consistent eyebrow style.
- **`/phase-zero`**: now has back-link to `#path` — verify the new sentence sits above (not inside) the "Where Phase Zero Leads" grid as designed.
- **`/partner/amplify`**: confirm phase cards use navy colon-separated leads per memory.
- **`/programs/*`**: three program pages duplicate the `#pricing` CTA pattern — consider a shared `<ProgramPricingCTA>` to dedupe.
- **`/resources/blog`**: media + LinkedIn imports — verify primary-category color coding still renders correctly on grid cards.

---

## P3 — SEO metadata rollout

For each public page, set via `useDocumentSeo({ title, description, canonical, ogTitle, ogDescription, ogImage, jsonLd })`:

**Priority pages (do first):**
1. `/` (PPSHome — already done ✓)
2. `/about`, `/about/approach`, `/about/impact`
3. `/phase-zero`, `/blue-door`
4. `/partner`, `/partner/ignite`, `/partner/amplify`, `/partner/embody`
5. `/services`, `/programs`, `/business-programs`
6. `/contact`, `/start-here`, `/speaking`
7. `/resources/blog`, `/resources/faq`

**Per page:** unique `<title>` (≤60 chars w/ primary keyword), description ≤160 chars in Amy's voice, canonical = current path, og:image = page-specific hero (fallback `/og-image.jpg`). Add JSON-LD: `WebPage` for content pages, `BreadcrumbList` for subpages, `Service` for tier pages, `Person` for /amy /rob /sierra.

**robots.txt cleanup**: `/about/approach` and `/about/impact` are currently `Disallow:` (left over from draft). With the restructure they're live core pages — remove both Disallow lines so they get indexed.

---

## Execution order (proposed)

1. **P0 fixes** (~30 min): dead `#coaching`/`#advisory` anchors, robots.txt unblock for /about/approach + /about/impact, add `scroll-mt-24` to all hash targets.
2. **P1 ParallaxCTA migration** (~1 hr): swap 11 hand-rolled CTAs in batches by tier.
3. **P3 SEO rollout** (~1.5 hr): add `useDocumentSeo` to the 16 priority pages.
4. **P2 content polish** (~2 hr): em-dash sweep, trademark linter, eyebrow normalization, heading hierarchy audit.

Each phase is independent and reversible. Recommend approving phase-by-phase so we can sanity-check before moving on.

---

## Open questions before I start

1. **P0-1**: Strip the `#coaching`/`#advisory` hashes, or add the IDs to `/services`? (Strip is safer since both callers are archive variants.)
2. **P1**: OK to use the tone mapping above, or override any specific one?
3. **P3 og:images**: use existing per-page hero assets, or generate fresh 1200×630 OG images for the priority 16?
4. **Sequencing**: tackle phases 1→4 in order, or want any phase deferred?
