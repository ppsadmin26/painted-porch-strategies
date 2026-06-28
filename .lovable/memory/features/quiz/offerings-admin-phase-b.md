---
name: PPS Offerings Admin — Phase B (mirror-only)
description: /admin/path-finder-offerings is mirror-only for canonical narrative fields. Edit name/blurb/description/image in the PPS Op Platform; routing stays here.
type: feature
---

# Phase B status

`/admin/path-finder-offerings` is the **routing** editor only. Canonical narrative fields are sourced from the **PPS Op Platform** Offerings Master Register (the canonical offerings catalog formerly referred to internally as "Blue Door") and rendered read-only with an **Edit in PPS Op Platform** deep link per row.

> Naming note: the public product **The Blue Door Organizational Appraisal** is unrelated to this register and keeps its name. "PPS Op Platform" only refers to the master offerings register / admin project.

## Read-only (PPS Op Platform canonical)

- `name`
- `blurb`
- `description`
- `image_url`

## Still editable on PPS

- `current_url`, `dedicated_url`, `anchor_id`
- `is_live`, `is_featured_in_quiz`
- `include_in_workshops`, `is_keynote`, `include_on_speaker_page`
- `tier`, `topic` (tag), `facilitator`
- `launch_slug`
- `b2c_rt_pools`, `b2b_rt_pools`
- `sort_order`

## New offerings

The in-app "New offering" dialog is replaced by a **New in PPS Op Platform** outbound link. New offerings must be authored in the PPS Op Platform Offerings Register first; the reconciliation pass (Phase C, not built yet) will surface them here.

## Deep link

`buildBlueDoorEditUrl(row)` in `src/pages/pps/admin/PathFinderOfferings.tsx` builds `https://paintedporch-ops.lovable.app/admin/topics?slug=<topic_slug>` (falls back to `?q=<name>` when `topic_slug` is null). Code identifiers (`buildBlueDoorEditUrl`, `BlueDoorEditLink`, `OP_PLATFORM_ADMIN_BASE`) keep their existing names; only user-visible copy uses "PPS Op Platform".

## Reference

- `docs/handoff/BlueDoor-to-PPS-Offerings-Handoff-v1.md` (canonical handoff doc; filename retained for git history)
- `.lovable/memory/features/quiz/bluedoor-recommendations-endpoint.md` (Phase A)
- `.lovable/memory/architecture/offerings-master-register.md`
