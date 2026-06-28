---
name: PPS Offerings Admin — Phase B (mirror-only)
description: /admin/path-finder-offerings is now mirror-only for canonical narrative fields. Edit name/blurb/description/image in Blue Door; routing stays here.
type: feature
---

# Phase B status

`/admin/path-finder-offerings` is the **routing** editor only. Canonical narrative fields are sourced from the Blue Door Offerings Master Register and rendered read-only with an **Edit in Blue Door** deep link per row.

## Read-only (Blue Door canonical)

- `name`
- `blurb`
- `description`
- `image_url`

(Pricing, marketing_angle, content_themes, pillar/stoic/icp/cascade live only in Blue Door and never appeared on this admin.)

## Still editable on PPS

- `current_url`, `dedicated_url`, `anchor_id`
- `is_live`, `is_featured_in_quiz`
- `include_in_workshops`, `is_keynote`, `include_on_speaker_page`
- `tier`, `topic` (tag), `facilitator`
- `launch_slug`
- `b2c_rt_pools`, `b2b_rt_pools`
- `sort_order`

## New offerings

The in-app "New offering" dialog is replaced by a **New in Blue Door** outbound link. New offerings must be authored in the Blue Door Offerings Register first; the reconciliation pass (Phase C, not built yet) will surface them here.

## Deep link

`buildBlueDoorEditUrl(row)` in `src/pages/pps/admin/PathFinderOfferings.tsx` builds `https://bluedoordiagnostic.lovable.app/admin/topics?slug=<topic_slug>` (falls back to `?q=<name>` when `topic_slug` is null).

## Reference

- `docs/handoff/BlueDoor-to-PPS-Offerings-Handoff-v1.md`
- `.lovable/memory/features/quiz/bluedoor-recommendations-endpoint.md` (Phase A)
