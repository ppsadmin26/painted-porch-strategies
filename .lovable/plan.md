
# Plan: P.A.T.H. Finder™ Quiz Dialog

Builds the full quiz from the spec doc as a **popup dialog** triggered from every "P.A.T.H.finder Quiz" link on the site. No new route.

---

## Workstream A — Quiz UI (dialog)

### A1. Data/logic module
**New:** `src/data/pathFinderQuiz.ts`
- All questions (PQ1, B2C Q1–Q6, B2B PQ2 + branch trees Team/Change/Cap/Strategic + PQ3 + decision-maker Q4)
- Branching graph (which questions follow based on prior answers)
- Scoring functions:
  - B2C → RT1–RT6 per Section 6 logic (zone counts, Q6=A hard override, Q6=B/C/D modifiers)
  - B2B → RT-A/B/C/D/E per routing matrix (Section 4)
- Offering catalog with name, tier (IGNITE / AMPLIFY / Blue Door / Pathway B), facilitator (Amy / Rob / Sierra), and on-site URL
- Result-type → recommendation set resolver that:
  - Picks primary offerings from Q1 routing
  - Layers in secondary signals (Communication → Rob, Resilience → Sierra)
  - Computes "Strongest Next Step" tag per routing matrix
  - Adds Blue Door alongside all org results
  - Triggers reverse-crossover note when org Q1-Cap=B + Q2-Cap=C

### A2. Dialog component
**New:** `src/components/pps/quiz/PathFinderQuizDialog.tsx`
- Controlled `<Dialog>` (shadcn) with `<PathFinderQuizContext>` provider so any link can trigger it
- Step UI: progress bar, one question at a time, back/next, multi-select for secondary-signal questions
- Result screen renders branded result card with:
  - Headline + intro copy per RT (from spec)
  - "Strongest Next Step" highlighted box (cobalt for Blue Door, primary teal for workshops)
  - Recommendation grid: name, facilitator, tier badge, short description, **Link to offering page**
  - Reverse-crossover callout when triggered
  - Email-me-results form (First name, Email + checkbox: "Also subscribe to updates")
  - Retake / close actions
- All styling follows brand tokens; Poppins headings, Montserrat body; ™ on first Phase Zero / P.A.T.H. / Painted Porch Pillars mention

### A3. Global trigger
**New:** `src/components/pps/quiz/PathFinderQuizProvider.tsx` mounted in `PPSLayout` so `usePathFinderQuiz()` exposes `open()`
- Replace existing "Take Free P.A.T.H.finder Quiz" `<Link to="/start-here">` and the `/start-here` hero CTA (currently links to /blue-door) so they call `open()` instead
- Sweep `rg -l "P.A.T.H.finder Quiz\|start-here"` and migrate each CTA in nav, HowToChooseSection, StartHere hero, etc.

---

## Workstream B — Submission + Email

### B1. Edge function
**New:** `supabase/functions/submit-path-finder-quiz/index.ts`
- Body (Zod-validated): `firstName, email, subscribe: boolean, track: 'b2c'|'b2b', resultType, answers, recommendations[]`
- Always: enqueue `path-finder-results` transactional email to the user with their RT + recommendation list (each with absolute URL to offering page)
- If `subscribe === true`: upsert contact in GHL with tag `PathQuiz` + post a note with full answer log + result. Skip GHL entirely otherwise.
- Uses existing `GHL_API_KEY` + `GHL_LOCATION_ID`. Mirrors `submit-calculator-results` pattern.

### B2. Email template
**New:** `supabase/functions/_shared/transactional-email-templates/path-finder-results.tsx`
- Brand-styled white-bg React Email
- Sections: greeting → result headline → "Your Strongest Next Step" callout → full recommendation list (name, tier, link button) → soft CTA to /contact
- Register in `registry.ts`

---

## Out of scope (deferred)
- Post-completion 3-touch email flywheel (Section 9) — not requested, ship later
- Re-take history storage in DB — results just emailed; no PPS DB table
- A/B variants of opening copy per Aspiring Leader tag — single copy first pass

---

## Sitemap / page status
No new public route is added (dialog only), so no Sitemap.tsx or `page_status` change needed.

## Secrets
All required (`GHL_API_KEY`, `GHL_LOCATION_ID`) already set. No new secrets.
