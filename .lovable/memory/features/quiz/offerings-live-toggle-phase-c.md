---
name: PPS Offerings — Phase C (Published vs Page-Live split)
description: path_finder_offerings.is_live is deprecated. Render code must use is_published (catalog publish flag) AND page_status (host page Live). Single helper lives in src/lib/offeringVisibility.ts.
type: feature
---

# Phase C status

The legacy single `is_live` boolean on `path_finder_offerings` collapsed three unrelated states. Phase C splits them:

| Concern | Source of truth | UI surface |
|---|---|---|
| Page renders vs Coming Soon | `page_status.status` (PPS) | `/admin/pages` |
| Offering published in canonical catalog | `path_finder_offerings.is_published` (mirrors PPS Op Platform `delivery.is_published`) | `/admin/path-finder-offerings` (transitional) → PPS Op Platform once sync ships |
| Quiz inclusion + pin | `include_in_quiz`, `is_featured_in_quiz` (PPS) | `/admin/path-finder-offerings` |
| Speaker page inclusion | `include_on_speaker_page` (PPS) | `/admin/path-finder-offerings` |
| RT pools / routing rules | `b2c_rt_pools`, `b2b_rt_pools` (PPS) | `/admin/path-finder-offerings` |
| Linked launch | `launch_slug` (PPS) | `/admin/path-finder-offerings` |
| All narrative + delivery (name, blurb, image, facilitator, tier, topic, format, segment, URL, anchor, sort_order, pricing) | PPS Op Platform | `paintedporch-ops.lovable.app` |

## Visibility rule (single source of truth)

```
visible = isOfferingPublished(row) && !draftPagePaths.has(resolveHostPath(row))
```

Implemented in `src/lib/offeringVisibility.ts` with helpers `isOfferingPublished`, `resolveHostPath`, `isOfferingVisible`. **Every render surface MUST use these helpers — do not hand-roll the rule.** Tests in `src/lib/__tests__/offeringVisibility.test.ts`.

Surface-specific gates (`include_in_quiz`, `include_on_speaker_page`, etc.) are ANDed on top of `isOfferingVisible` by each consumer.

## DB sync trigger (transitional)

`sync_offering_publish_flags()` (BEFORE INSERT/UPDATE) mirrors `is_live` ↔ `is_published` so render code that hasn't been swept yet keeps working. Both columns stay in sync from either side. The trigger will be dropped — and `is_live` removed — once the PPS Op Platform sync writes `is_published` exclusively (follow-up cleanup migration).

## Admin UI changes

`/admin/path-finder-offerings`:
- Toggle re-labeled **Published / Unpublished** (writes `is_published`; trigger mirrors `is_live`).
- "Quiz eligible" badge now requires `is_published` + at least one URL/anchor.
- Filter dropdown: "Needs publish" / "Published".
- Phase B banner updated to Phase C copy with link to `/admin/pages` for page-level Live state.

## Files touched

- `src/lib/offeringVisibility.ts` (new)
- `src/lib/__tests__/offeringVisibility.test.ts` (new)
- `src/hooks/usePathFinderOverrides.ts` (reads `is_published` via helper)
- `src/pages/pps/admin/PathFinderOfferings.tsx` (Published toggle, eligibility, filters, banner)
- Migration: adds `is_published` (backfilled from `is_live`), `include_in_quiz` (default true), `sync_offering_publish_flags()` trigger.

## Still to do (Phase C follow-up, not blocking)

- PPS Op Platform exposes `delivery.is_published` in the sync payload → PPS mirror writes `is_published` only from sync.
- Once sync is reliable: remove admin Published toggle (replace with read-only badge + Op-Platform deep link), drop trigger, drop `is_live` column.
- Sweep remaining `is_live` reads in `scripts/`, `supabase/functions/audit-offerings-overlap/`, and `src/integrations/op-platform/schema.ts` (Op Platform's own `is_live` field is separate — leave alone).

## Reference

- `.lovable/memory/features/quiz/offerings-admin-phase-b.md` (Phase B, superseded by this for the publish-flag question)
- `docs/handoff/BlueDoor-to-PPS-Offerings-Handoff-v1.md`
