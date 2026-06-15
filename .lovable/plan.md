## Goal

Stop dumping the full workshop catalog in B2B P.A.T.H.finder results. Instead, surface up to 3 "featured" workshops/speaking topics per result, plus a soft note about additional sessions in the same topic area. A single "Contact Us to Learn More" CTA carries the quiz answers + recommendations into the contact form AND creates a GHL Opportunity (not just a tagged contact).

Scope: B2B track only. B2C results unchanged.

---

## 1. Define the "featured" set (DB)

Add a new boolean to `path_finder_offerings`:

- `is_featured_in_quiz boolean not null default false`

An offering is eligible for B2B quiz recommendations if **either**:
- `anchor_id is not null` (already has a card on a tier/speaker page), OR
- `is_featured_in_quiz = true` (manual override)

Plus existing B2B filters already in `mem://features/quiz/b2b-recommendation-rules` (workshops + Blue Door + speaking only; no labs unless individual focus).

Admin: add a checkbox in `/admin/offerings` row editor so editors can toggle `is_featured_in_quiz` per row.

## 2. Tag every offering with a quiz `topic_area`

Re-use the existing `topic` column on `path_finder_offerings` (already powers the workshop topic tabs — see `AllWorkshopTopics.tsx`). For each result type, map to 1–2 `topic` values (e.g., "Innovation"/"Change" → "Change & Innovation"). This lets us write the topic note ("We also offer additional sessions in **Change & Innovation** — let's discuss on a call") without hard-coding.

No new column needed; just confirm every featured offering has a `topic`.

## 3. Recommendation logic changes (B2B only)

File: `src/data/pathFinderQuiz.ts` (B2B branch) + any helper in `src/components/pps/quiz/`.

- Filter the candidate pool to the "featured" set defined in step 1.
- Cap the returned `recommendations` items to **up to 3 picks** for the primary recommendation group.
- Resolve the result's `topic_area` (string) and pass it through to the dialog as `topicNote`.
- B2C path: unchanged.

## 4. Results UI

File: `src/components/pps/quiz/PathFinderQuizDialog.tsx` (results view).

- Render up to 3 featured pick cards as today.
- Below the cards, add a single muted note:
  > "We also offer additional speaking and workshop sessions in **{topicArea}**. Let's discuss the right fit on a quick call."
- Replace the multi-CTA stack with **one primary CTA**: "Contact Us to Learn More" → `/contact?...` (see step 5).
- Keep the "Email me my results" path (existing `submit-path-finder-quiz`) unchanged.

## 5. Contact handoff

When the user clicks "Contact Us to Learn More":

a. **Deep link to `/contact`** with structured query params:
   - `scope=organization`
   - `interest=quiz-followup`
   - `topic={topicArea}`
   - `resultType={resultType}`
   - `message=` prefilled summary (result headline, top 3 picks by name, topic note)
   - `pathQuizPayload=` base64-encoded JSON of `{ answers, recommendations, resultType, headline, strongestNextStep, topicArea }` (read-only; passed through the form to the submit handler)

b. **Contact form** (`src/pages/pps/Contact.tsx` and its submit edge fn — likely `submit-ghl-lead`):
   - Hydrate the existing fields from query params (already supported per `mem://features/contact-form-logic`).
   - On submit, if `pathQuizPayload` is present, forward it to the edge function alongside the normal contact payload.

c. **Edge function** `submit-ghl-lead` (or a small new wrapper, TBD during build):
   - Existing behavior: create/update GHL contact + add a note + send internal admin email.
   - New behavior when `pathQuizPayload` present:
     1. Add tag `PathQuiz-Followup` and `path-finder-{resultType}`.
     2. Create a GHL **Opportunity** in the configured pipeline (new secrets: `GHL_PIPELINE_ID`, `GHL_PIPELINE_STAGE_ID`) with:
        - `name`: `"P.A.T.H. Followup — {firstName} {lastName} ({resultType})"`
        - `contactId`: from upsert above
        - `monetaryValue`: 0
        - `status`: `open`
        - Notes: full quiz answers + recommendations summary.
     3. Internal admin email (re-use existing transactional template or extend it) includes: quiz answers, top 3 recs, topic area, contact message.

## 6. Admin UX

- `/admin/offerings`: add `is_featured_in_quiz` toggle column + bulk-edit support.
- Optional: small "Featured in B2B quiz pool" filter chip at the top of the offerings list.

## 7. Validation

- Unit test in `src/data/__tests__/pathFinderQuiz.b2b.test.ts`: every B2B result type returns ≤3 picks and all picks have `anchor_id || is_featured_in_quiz`.
- Manual: take quiz, confirm narrowed results, click CTA, confirm `/contact` prefilled, submit, confirm GHL contact + opportunity + admin email.

---

## Technical notes

- **Secrets to request before build:** `GHL_PIPELINE_ID`, `GHL_PIPELINE_STAGE_ID` (the user will need to grab these from GHL Settings → Pipelines).
- **DB migration:** single `ALTER TABLE path_finder_offerings ADD COLUMN is_featured_in_quiz boolean NOT NULL DEFAULT false;` plus an index isn't required.
- **Default backfill:** I'll flip `is_featured_in_quiz=true` for any offering that today already has both an `anchor_id` AND was previously recommended by the B2B quiz, so existing recs don't suddenly drop to zero in edge cases.
- **No new public route**, so no sitemap/page_status entry needed.
- **B2C untouched**, including the labs-for-individuals rule from existing memory.

## Files likely touched

- supabase migration (new column + admin grants already cover authenticated)
- `src/data/pathFinderQuiz.ts`
- `src/components/pps/quiz/PathFinderQuizDialog.tsx`
- `src/components/pps/quiz/PathFinderQuizProvider.tsx` (if topic plumbing needed)
- `src/pages/pps/Contact.tsx` (read + forward `pathQuizPayload`)
- `supabase/functions/submit-ghl-lead/index.ts` (or sibling) — add Opportunity creation
- `src/pages/pps/admin/Offerings*.tsx` — featured toggle
- New memory entry: `mem://features/quiz/b2b-featured-pool` summarizing the rule
