---
name: P.A.T.H.finder Viewable Recommendation Rule
description: Admin-driven eligibility rule for quiz recommendations on both B2B and B2C tracks. Replaces the old hardcoded viewable allowlist.
type: feature
---

# Rule

A P.A.T.H.finder quiz recommendation (B2B **and** B2C) may only surface an offering that is **admin-marked clickable** in `/admin/path-finder-offerings`. Specifically:

> `is_live = true` AND at least one of `current_url`, `dedicated_url`, or `anchor_id` is set.

The dialog fetches this eligible-key set on open and passes it to `buildResult` as `viewableKeys`. `applyViewableFilter` (in `src/data/pathFinderQuiz.ts`) drops any offering not in the set. If filtering would empty a primary group, the build falls back to the original copy (or a `SAFE_*_FALLBACK`) so a result never displays blank.

# Why

- Recommendations always link to something a user can actually reach (card, anchor, or dedicated page).
- Adding/removing a workshop or speaking topic from the live site is a single admin toggle, not a code change.
- "Featured in quiz" (DB column `is_featured_in_quiz`) is now a **prioritization** signal only — eligibility is automatic.

# B2B-allowed categories
1. **Workshops** (tier `Pathway B`) — Phase Zero + Leadership & Team Development cards on `/partner/amplify/workshops`, plus dedicated pages like `/partner/amplify/stractical-leader` and `/resources/kick-the-habit`.
2. **Blue Door** (`blueDoor`).
3. **Speaking topics** (tier `Speaking`) — deep-linked to topic cards on `/speaking/{amy|rob|sierra}` via `topic-{slug}` anchors. Surfaced in a dedicated "Speaking Topics — Bookable Keynotes" group when at least one matches the result type.

Labs remain B2C-only (enforced by the existing `pathFinderQuiz.b2b.test.ts` guardrail).

# Implementation

- Eligibility filter: `applyViewableFilter` in `src/data/pathFinderQuiz.ts`
- DB fetch: `src/components/pps/quiz/PathFinderQuizDialog.tsx` (`viewableKeys` useEffect)
- Admin UI: `/admin/path-finder-offerings` — every row shows a green "Quiz eligible" badge when the rule is met, gray "Not eligible" otherwise.
- Tests: `src/data/__tests__/pathFinderQuiz.viewable.test.ts`
