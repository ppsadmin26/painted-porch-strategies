# Epic ShIFt Draft Site (v3)

Same draft-only build as before. The change in this version is the differentiation strategy: **"more than" is out.** It concedes the category. The new positioning claims a different category entirely.

## The differentiation thesis

From your Insights article: culture consultancies, tech advisories, and operational design firms each pull one lever. Each is legitimate. Each, done alone, leaves the other two dimensions untouched, and those untouched dimensions pull the organization back.

You don't do more of what they do. You work a **different unit**: the whole organism, three pillars simultaneously.

```text
  CULTURE FIRM        TECH ADVISORY       OPS DESIGN FIRM
       │                    │                    │
   one lever            one lever            one lever
       │                    │                    │
       └─── each leaves the other two untouched ─┘

  PAINTED PORCH
  Cultural Cornerstone + Operational Frame + Living Ecosystem
  designed together, at the same time = your Fortified Porch
```

This is a claim about scope of design, not quality of service. It can be stated plainly with zero defensiveness because it names what they do as real and legitimate.

## Where it lives

### 1. A dedicated section on `/home-v2`: "Yes, and Also No"

The article's own move, compressed. Three short cards, each naming a category honestly and then the limit:

- **Culture work** builds trust and shared language. Then people return to unclear decision rights and systems that reward the old behavior. You get informed helplessness, not engagement.
- **Technology** modernizes the system, then exposes every design flaw that was previously survivable. The tech becomes the villain in a story that was about organizational authorship.
- **Operational design** produces an elegant structure on paper that yields compliance without commitment.

Closing line for the section: *"Each of these is real work, done well by good people. Each one alone leaves the other two untouched. We don't pick a lever. We work the whole organism."*

Then the three Pillars as the payoff, using the article's exact definitions:

- **Cultural Cornerstone** — the leadership capacity to author direction
- **Operational Frame** — the systems, processes, and governance that execute it
- **Living Ecosystem** — the adaptive, human infrastructure that sustains it

With the integration line: designing all three at once so they reinforce each other. That's the Fortified Porch.

### 2. The scope boundary on `/how-we-work`

Still the second differentiator, but now it reads as consistency rather than restriction: because the unit of work is the whole organism at the design stage, the practice ends at the close of Align. "We design the building. You construct it."

### 3. The organism framing replaces "more than" everywhere

No "this requires more than leadership training" constructions anywhere in the new pages. Instead: *"We're often introduced as the culture people, or the tech transition people, or the ops people. Yes, and also no."*

## Structure (unchanged from v2)

| Route | Purpose | Status |
|---|---|---|
| `/home-v2` | Possibility page. Sells the idea, carries the "Yes, and Also No" section. | Draft |
| `/how-we-work` | Engagement architecture, stages, scope boundary, qualification standards. | Draft |
| `/epic-shift` | Philosophy: Stoic roots, the Pillars in depth, Phase Zero™, P.A.T.H.™ | Draft |
| `/capabilities` | New capability library. Existing tier pages stay live and untouched. | Draft |

## `/home-v2` section order

1. **Hero** — possibility-forward. Primary CTA: Open Your Blue Door (cobalt). Secondary: See How We Work.
2. **The moment** — the quiet moment a bigger question forms. Recognition, not diagnosis.
3. **The one question** — *"Does our organization have the architecture to lead this?"*
4. **Yes, and Also No** — the differentiation section above. This is the spine of the page.
5. **The three Pillars** — the payoff to section 4, leading into the Fortified Porch.
6. **The Blue Door** — three framings A / B / C, stacked and labeled for comparison (see below).
7. **The boundary** — "We design the building. You construct it." Links to `/how-we-work`.
8. **Proof** — `ClientLogoMarquee` + trimmed `StatMarquee`.
9. **Final CTA** — `ParallaxCTA`, `overlayTone="teal"`.

## Blue Door: three framings to compare

Written three ways in place, labeled, so you can read them side by side. I delete the two you don't pick.

- **A — Possibility-first.** Opens with the upside. Cost framing becomes the cost of the move you didn't make.
- **B — Honest mirror.** One unflinching, blameless line naming reality, then an immediate pivot to what becomes visible and possible.
- **C — The deliberate pause.** Neither problem nor promise. The pause before commitment, framed as the mark of a serious leader.

All three carry the organism logic: the appraisal reads all three pillars at once, which is why it shows you something a single-lever assessment structurally cannot.

## Technical notes

- New files: `src/pages/pps/v2/HomeV2.tsx`, `HowWeWork.tsx`, `EpicShift.tsx`, `Capabilities.tsx`; sections under `src/components/pps/v2/`.
- Routes registered in `src/App.tsx` inside the `PPSLayout` block.
- Insert 4 rows into `page_status` with `status = 'draft'`, `category = 'public'` so `PageGate` hides them. Default is already draft, but explicit rows make them toggleable.
- Add the 4 routes to `src/pages/pps/Sitemap.tsx` so they appear in `/admin/pages`.
- **Not** added to `scripts/generate-sitemap.mjs` or `scripts/prerender-content.mjs` while draft, so crawlers never see them.
- Reuse only existing components: `TierHeroSection`, `Eyebrow`, `ParallaxCTA`, `ClientLogoMarquee`, `StatMarquee`, `PPSBreadcrumb`. No new tokens.
- Voice: plain English, no em-dashes, no servant language, partnership verbs. `.text-lead` / `.text-body` tokens on all body copy. shIFt IF colors per the site rule. One ™ per page on the primary concept.
- Run `npm run brand:typography`, `brand:eyebrows`, `brand:validate` before finishing.
- Save to project memory: the engagement architecture, the scope boundary, the qualification standards, and this organism-vs-lever differentiation rule. The uploaded doc itself stays out of the repo.
