
# Plan: Sourcing Standardization + Calculator v2

Two parallel workstreams. Both ship this turn.

---

## Workstream A — Sourced Stat Tooltip (site-wide)

### A1. Create shared component
**New file:** `src/components/pps/SourcedStat.tsx`

A single reusable primitive that renders a stat figure/label with an inline info-icon tooltip. Tooltip shows source name + clickable URL (opens new tab). Replaces every footnote+source-section pattern.

Props:
- `figure` (string) — big number e.g. "70%+"
- `label` (string) — short description
- `source` (string) — citation text
- `sourceUrl` (string, optional) — clickable link
- `year` (string|number, optional) — appended to source
- `variant`: `"inline" | "editorial" | "bold"` — matches existing StatCard variants
- `accentClass` — preserve current color logic

### A2. Identify and migrate all instances
Targets to convert (will grep for `StatSources`, `footnoteNumber`, manual `<ol>` source lists, `<sup>` footnotes, and "Sources" headings):
- `src/components/pps/partner/ArchitectureGapSection.tsx` (footnotes 1–4 + Sources block)
- `src/components/pps/StatCard.tsx` (`footnoteNumber` + `StatSources` helper — keep StatCard but make footnote optional and route new usage through SourcedStat)
- AMPLIFY ROI section already done as reference impl (`AmplifyPathAlt.tsx`)
- Any other page using `RESEARCH_STATS` with footnote chrome (will sweep)
- "Sources" sections in EMBODY pages if present

For each: delete the bottom "Sources" `<ol>` and `<sup>` markers; render inline info-icon tooltip instead.

### A3. Keep `RESEARCH_STATS` registry; deprecate `StatSources` helper
`StatSources` export stays for backward-compat one release, marked `@deprecated`.

---

## Workstream B — Calculator v2

### B1. Data file
**New:** `src/data/calculatorBenchmarks.ts`
- `INDUSTRY_BENCHMARKS` — 8 industries × `{ avgLoadedSalary, overrunRate, failureRate, sources[] }` (BLS 2024 + McKinsey/Gartner/BCG)
- `SIZE_PRESETS` — Small (10 ppl), Mid (35), Enterprise (100) with default tech spend per seat
- `PHASE_ZERO_IMPACT` — `{ min: 0.10, max: 0.15 }` (10–15% exposure reduction)

### B2. New dialog
**Replace:** `src/components/pps/blue-door/CostCalculatorDialog.tsx` (archive current as `_archive-v1.0/` already exists)

Inputs (3 always-visible):
1. Industry (radio cards)
2. Initiative size (S/M/E)
3. Duration (3/6/12/18/24 month stepper)

Optional expander:
- Override avg fully-loaded salary
- Outside consultants (toggle)

Outputs (3 stacked cards):
- Planned investment ($X)
- Likely overrun range ($X–$Y, using industry overrun rate ±10%)
- Failure scenario write-off ($Z, using industry failure rate)

Hero strip: **"A $1,500 Blue Door can de-risk an est. $X–$Y of this exposure"** → cobalt CTA to `/blue-door`.

Footer: "How we calculated this" collapsible with formulas + sources (info-icon tooltip pattern).

### B3. Email-me-results (lead gen)
- Inline form inside dialog: First name, Last name, Email, Company (optional), Role (optional).
- On submit → `submit-calculator-results` edge function.

### B4. New edge function
**New:** `supabase/functions/submit-calculator-results/index.ts`

Mirrors existing `submit-ghl-lead` pattern. Does:
1. Validate input (Zod).
2. Upsert contact in GHL (`GHL_API_KEY` + `GHL_LOCATION_ID`).
3. Add tag: `calc-cost-of-skipping`.
4. POST contact **note** with full calculator inputs + results breakdown (formatted text).
5. If `GHL_COST_CALC_WORKFLOW_ID` secret is set, subscribe contact to that workflow. If unset, skip silently (no error).
6. Also send a transactional email to the lead via existing `send-transactional-email` queue with their results (new template `cost-calculator-results.tsx`).

### B5. New email template
**New:** `supabase/functions/_shared/transactional-email-templates/cost-calculator-results.tsx`
- Brand-styled (white bg, Poppins/Montserrat inline)
- Shows the three result cards as HTML
- Cobalt CTA: "Step through the Blue Door → $1,500"
- Soft secondary CTA: "Talk to us about this → /contact"
- Register in `registry.ts`.

### B6. Placement
- `/blue-door` — existing dialog trigger keeps working (component swap is transparent).
- `/partner/amplify` AmplifyPathAlt — add **"Calculate your ROI"** button under the ROI table, opens same `<CostCalculatorDialog>`.

### B7. Secret
Request new secret `GHL_COST_CALC_WORKFLOW_ID` (optional; user adds later when they build the GHL workflow). Edge function works with or without it.

---

## Technical details

- **GHL workflow subscribe endpoint:** `POST /contacts/{contactId}/workflow/{workflowId}` (LeadConnector v1) — exactly the same pattern other PPS edge functions use.
- **Contact note format** (plain text, readable in GHL UI):
  ```
  Cost-of-Skipping Calculator — [date]
  Industry: Technology  |  Size: Mid (35 ppl)  |  Duration: 12 mo
  Planned: $X  •  Overrun: $Y–$Z  •  Failure write-off: $W
  Blue Door de-risks: est. $A–$B
  ```
- **Tag:** `calc-cost-of-skipping` (kebab-case, matches existing GHL tag convention).
- **No DB tables** — purely GHL-side persistence per project's lead-capture rule.
- **Tooltip primitive:** reuses existing shadcn `<Tooltip>` from `components/ui/tooltip` (already used in AmplifyPathAlt update).
- All TM/brand/Blue-Door color rules respected.

---

## Out of scope (future)
- Shareable URL with query params for results (deferred — adds complexity for marginal lift)
- A/B testing variants
- Industry benchmark refresh automation (annual manual refresh per `costOfSkippingStats.ts` pattern)
