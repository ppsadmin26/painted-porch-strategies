## Two problems

**1. WFH recommendation points at a draft page.** `workFromHomePro` is marked `is_live=true` in `path_finder_offerings` and points at `/wfh-sign-up`, but `/wfh-sign-up` is `draft` in `page_status`. The quiz eligibility filter only checks the offerings table, so it has no idea the destination page is hidden.

**2. RT6 ("Explore Before Committing") is a wall of "if X, try Y" with no clear pick.** Five conditional groups (8+ free/low-cost items) and no primary recommendation. Reads like a directory, not guidance.

## Fix 1: Cross-check page_status in the eligibility filter

In `PathFinderQuizDialog.tsx`, the eligibility fetch already pulls every offering's URLs. Add a second fetch for `page_status` rows where `status='draft'`, build a set of draft paths, then exclude any offering whose resolved URL path (URL or dedicated_url, ignoring hash and query) is in the draft set. External URLs (http/https) are always allowed; anchor-only offerings (no URL) are always allowed because they live on an already-public hub.

This means admins keep one toggle (the page Live/Draft) and the quiz follows automatically. No data migration needed; once `/wfh-sign-up` flips to Live, the WFH offering reappears.

## Fix 2: Tighten RT6 into one clear pick + small "also free" group

RT6 fires when nothing in the user's answers points strongly to inner game / communication / team / change. New shape:

- **Primary group (1 pick, decisive):** `kickTheHabitB2C` — short, free, finishable, gives a real win. Sets the tone that PPS work is concrete.
- **One secondary group, "Free starting points" (3 items max):** `fiftyTwoStoicism`, `burnoutResources`, `stracticalMini`. Same canonical free tools used everywhere else, no conditional buckets.
- **Narrative:** rewrite to acknowledge they're exploring AND give one decisive next move ("Start here, finish it, then come back to the quiz").
- **whatComesNext:** unchanged — retake the quiz in 60–90 days or reach out.

`workFromHomePro`, `resolutionRemix`, `meditationChallenge`, `gratitudeChallenge`, `journalingChallenge`, and the rest get dropped from RT6 (they remain in the OFFERINGS catalog for other contexts). Result goes from ~10 items spread across 5 groups to 4 items across 2 groups.

## Files

- `src/components/pps/quiz/PathFinderQuizDialog.tsx` — add page_status fetch, filter eligibility by draft paths
- `src/data/pathFinderQuiz.ts` — rewrite RT6 case in `b2cResult()`

## Out of scope

- Touching B2B results (already narrow per the b2b-recommendation-rules memory)
- Flipping `/wfh-sign-up` to Live — that's a content decision, not a quiz fix
- Adding a page_status UI hint inside `/admin/path-finder-offerings` (useful but separate)
