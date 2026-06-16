## Goal

Link `path_finder_offerings` to `course_launch_status` so admins manage launch status in one place, and the quiz recommendation engine automatically reflects "Live" vs "Coming Soon — join the list" without manual double-entry.

## Schema change

Add a single nullable column on `path_finder_offerings`:

- `launch_slug text` — soft reference to `course_launch_status.slug` (no hard FK so renames don't break inserts).
- Index on `launch_slug` for join lookups.

Backfill `launch_slug` from existing data using the `anchor_id` ↔ launch slug pattern already in use:

```text
mc-leading-change-mini        → mc-leading-change-mini
mc-radical-mindfulness-mini   → mc-radical-mindfulness-mini
mc-master-your-message-mini   → mc-master-your-message-mini
mc-elements-of-team           → mc-elements-of-team
mc-meditation-challenge       → mc-meditation-challenge
mc-gratitude-challenge        → mc-gratitude-challenge
mc-talking-to-strangers       → mc-talking-to-strangers
mc-team-superpowers           → mc-team-superpowers
mc-mym-journal-challenge      → mc-mym-journal-challenge
radical-mindfulness           → radical-mindfulness
master-your-message           → master-your-message
extraordinary-teams           → extraordinary-teams
performance-dna               → performance-dna
lab-leading-change            → lab-leading-change
lab-goldilocks-leadership     → goldilocksLab (manual)
lab-stractical-leadership     → stracticalLeaderLab (manual)
```

## Quiz recommendation logic

Effective availability becomes a derived value:

```text
linked launch row exists?
  yes, status = 'coming_soon' → "Coming Soon" (eligible, deprioritized, shows "Join the list" badge)
  yes, status = 'live'        → Live
  no                          → use is_live as before
```

The existing prioritization (Live first, then Coming Soon) and the "Launching soon — join the list" badge stay as-is; they just now read from the joined launch status instead of a hand-toggled column.

## Admin UI changes

`/admin/offerings` (PathFinderOfferings.tsx):
- Add a "Launch" column showing one of:
  - green "Live" badge
  - amber "Coming Soon" badge
  - "—" when no launch is linked
- Add a `launch_slug` selector on the row edit form (dropdown of existing `course_launch_status.slug` values + "(none)").
- Add a "Manage launch" link next to the badge that opens `/admin/course-launches?slug=<launch_slug>` (deep link).

`/admin/course-launches` (CourseLaunchManager.tsx):
- Read `?slug=` from query string. If set, scroll the matching row into view and apply a brief highlight ring.
- No other behavior change — notify toggles, "Go Live & Notify", and notify-list editing stay on this page (per user choice).

## Files touched

- `supabase/migrations/<timestamp>_link_offerings_to_launches.sql` — add column, index, backfill.
- `src/pages/pps/admin/PathFinderOfferings.tsx` — add Launch column, launch_slug selector, deep-link.
- `src/pages/pps/admin/CourseLaunchManager.tsx` — `?slug=` deep-link scroll + highlight.
- `src/components/pps/quiz/PathFinderQuizDialog.tsx` — read joined `course_launch_status.status`; derive effective availability.
- `src/pages/pps/admin/OfferingsCoverage.tsx` (optional) — surface "linked launch missing" as an audit warning.

## Out of scope

- No retirement of `is_live` (kept as the source of truth for offerings without a launch row, e.g. always-available items, free downloads, assessments delivered by other vendors).
- No changes to the `notify-launch-signup` edge function or notification emails.
- No changes to existing route structure.

## Rollout

1. Migration (add column + backfill).
2. Admin UI (PathFinderOfferings + CourseLaunchManager deep-link).
3. Quiz logic update.
4. Smoke test: take the quiz, confirm a Coming-Soon-linked offering still appears with the "Launching soon — join the list" badge and deep-links to its card.