## Goal

Split the overloaded `path_finder_offerings.tier` column into two typed fields — `engagement_tier` (IGNITE/AMPLIFY/EMBODY/NONE) and `delivery_format` (keynote/speaking/workshop/lab/course/assessment/free_resource/blue_door) — backed by Postgres enums, and drop the legacy `tier` column in the same rollout.

## Sequence

### 1. Backfill map from v5 CSV
Generate `scripts/split-tier-backfill.sql` from `/mnt/documents/offerings-url-reconciliation-v5.csv`. For each row with a `resolved_ops_offering_key`, parse `{topic}--{format}--{segment}` to seed `delivery_format`, and derive `engagement_tier` from the local `tier`. For rows without a resolved key, fall back to the derivation logic already in `PathFinderOfferings.tsx` (`deliveryTypes()` + `tierSegment()`):

| current `tier` | engagement_tier | delivery_format (default) |
|---|---|---|
| IGNITE | IGNITE | course (or `assessment` if is_keynote=false and name matches) |
| AMPLIFY | AMPLIFY | lab (or `workshop` if include_in_workshops) |
| EMBODY | EMBODY | workshop |
| Workshop | AMPLIFY | workshop |
| Speaking | NONE | speaking (or `keynote` if is_keynote=true) |
| Free | NONE | free_resource |
| Assessment | IGNITE | assessment |
| Blue Door | NONE | blue_door |

Keynote wins over workshop when `is_keynote=true`.

### 2. Migration (single transaction)
- `CREATE TYPE engagement_tier_t AS ENUM ('IGNITE','AMPLIFY','EMBODY','NONE')`
- `CREATE TYPE delivery_format_t AS ENUM ('keynote','speaking','workshop','lab','course','assessment','free_resource','blue_door')`
- `ALTER TABLE path_finder_offerings ADD COLUMN engagement_tier engagement_tier_t, ADD COLUMN delivery_format delivery_format_t`
- Run backfill UPDATEs (one WHEN/CASE per offering_key from the CSV, plus derivation fallback)
- `ALTER TABLE ... ALTER COLUMN engagement_tier SET NOT NULL, ALTER COLUMN delivery_format SET NOT NULL`
- `ALTER TABLE ... DROP COLUMN tier`
- Add indexes on both new columns

### 3. Code updates (same PR as migration approval)
Files touched:

- `src/pages/pps/admin/PathFinderOfferings.tsx` — replace `tierSegment(tier)` / `deliveryTypes(row)` with direct reads of `delivery_format` + `engagement_tier`; update `TIER_COLORS` to key on `engagement_tier`; filter dropdowns use enum values.
- `src/pages/pps/admin/offerings/OfferingEditor.tsx` — swap the single Tier `<Select>` for two selects (Engagement Tier + Delivery Format).
- `src/pages/pps/admin/OpPlatformResyncPanel.tsx` — Ops payload's `format` maps 1:1 to `delivery_format`; `catalog_segment`+`path_stage` → `engagement_tier`.
- `src/components/pps/TierBadge.tsx` — accept `engagement_tier` prop; unchanged rendering.
- `src/config/tiers.ts` — key by engagement tier only.
- `src/data/pathFinderQuiz.ts` + `supabase/functions/submit-path-finder-quiz/index.ts` + `src/components/pps/quiz/useOpPlatformRecommendations.ts` + `src/lib/quizRoutingSummary.ts` — anywhere that reads `tier` for routing/filtering switches to the new pair (usually `engagement_tier`).
- `supabase/functions/_shared/transactional-email-templates/path-finder-results.tsx` — tier badge label uses `engagement_tier`.
- `src/components/pps/partner/HowToChooseSection.tsx`, `SocialProofSection.tsx` — same swap.
- Tests: `src/data/__tests__/pathFinderQuiz.edge-cases.test.ts`, quiz integration & RecGroup tests — update fixtures.

### 4. Verification
- `tsgo` for typecheck (Supabase types regenerate after migration approval)
- `bunx vitest run` for the quiz + offering visibility tests
- Manual: load `/admin/offerings` — types column shows `delivery_format`, segment filter still works, edit page shows two selects.

## Technical notes

- Ops sync becomes trivial: no more overloaded field; the export → import mapping is direct.
- `deliveryTypes()` helper in the admin list becomes a one-liner returning `[row.delivery_format]`.
- The `NONE` engagement tier covers Free/Speaking/Blue Door — quiz routing that currently branches on `tier IN ('Free','Speaking','Blue Door')` will branch on `delivery_format` instead, which is more accurate.
- Migration is destructive (`DROP COLUMN tier`) — no going back without a restore; that's what "drop now" means. Backfill correctness is the entire risk; the v5 CSV + derivation table above are how we manage it.

## What ships in this turn

Only the migration (step 1 backfill baked in). Code updates (step 3) go out in the follow-up turn once the migration is approved and `src/integrations/supabase/types.ts` regenerates — otherwise every code change fights the old type definitions.