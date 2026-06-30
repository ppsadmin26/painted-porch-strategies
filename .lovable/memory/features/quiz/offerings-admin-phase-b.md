---
name: PPS Offerings Admin — Phase B (mirror-only)
description: /admin/path-finder-offerings is mirror-only for canonical narrative fields. Edit name/blurb/description/image in the PPS Op Platform; routing stays here.
type: feature
---

# Phase B status

`/admin/path-finder-offerings` is the **routing** editor only. Canonical narrative fields are sourced from the **PPS Op Platform** Offerings Master Register (the canonical offerings catalog formerly referred to internally as "Blue Door") and rendered read-only with an **Edit in PPS Op Platform** deep link per row.

> Naming note: the public product **The Blue Door Organizational Appraisal** is unrelated to this register and keeps its name. "PPS Op Platform" only refers to the master offerings register / admin project.

## Ownership boundary (canonical)

**PPS Op Platform owns everything offering-related** (name, blurb, description, image, facilitator, tier, topic, category, segment, format, pricing, URL/anchor mappings, delivery details, sort order, etc.) **EXCEPT** the following PPS-website-only concerns:

- **Quiz routing rules** — `b2c_rt_pools`, `b2b_rt_pools`, plus all result-type → offering mapping logic. Treated as configurable Pathfinder Quiz routing settings (future: move to a dedicated quiz-rules admin surface, not per-offering toggles).
- **Include in Pathfinder quiz** flag (website-only inclusion gate).
- **Pin to top of Pathfinder quiz** flag (`is_featured_in_quiz`).
- **Speaker Page toggle** (`include_on_speaker_page`) — sole governor of `/speaking/{amy,rob,sierra}` inclusion; facilitator alone does NOT auto-list a topic.
- **Linked Launch** (`launch_slug`) — ties an offering to a website launch-list / coming-soon notification flow.

Everything else is read-only on `/admin/path-finder-offerings` and edited in the Op Platform. Do not re-introduce canonical fields (name, blurb, image, facilitator, tier, topic, anchor, URL, etc.) as editable on the PPS side. Hot-patch overrides for URL/anchor are tolerated only until Op Platform deliveries own them end-to-end (Phase C).

## LIVE toggle — RESOLVED in Phase C

The three collapsed "live" states are now separated. See `mem://features/quiz/offerings-live-toggle-phase-c.md` for the canonical rule. Short version:

- **Page Live vs Coming Soon** → `page_status` (PPS, `/admin/pages`).
- **Offering Published (catalog)** → `path_finder_offerings.is_published` (mirrors Op Platform `delivery.is_published`).
- A card is publicly visible only when Published AND its host page is Live. Helper: `src/lib/offeringVisibility.ts`.

`is_live` is deprecated; a DB trigger mirrors it to `is_published` during the transition. Render code MUST go through `isOfferingPublished` / `isOfferingVisible`.

## New offerings

The in-app "New offering" dialog is replaced by a **New in PPS Op Platform** outbound link. New offerings must be authored in the PPS Op Platform Offerings Register first; the reconciliation pass (Phase C, not built yet) will surface them here.

## Deep link

`buildBlueDoorEditUrl(row)` in `src/pages/pps/admin/PathFinderOfferings.tsx` builds `https://paintedporch-ops.lovable.app/admin/topics?slug=<topic_slug>` (falls back to `?q=<name>` when `topic_slug` is null). Code identifiers (`buildBlueDoorEditUrl`, `BlueDoorEditLink`, `OP_PLATFORM_ADMIN_BASE`) keep their existing names; only user-visible copy uses "PPS Op Platform".

## Reference

- `docs/handoff/BlueDoor-to-PPS-Offerings-Handoff-v1.md` (canonical handoff doc; filename retained for git history)
- `.lovable/memory/features/quiz/bluedoor-recommendations-endpoint.md` (Phase A)
- `.lovable/memory/architecture/offerings-master-register.md`
