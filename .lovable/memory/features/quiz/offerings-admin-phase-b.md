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

## LIVE toggle — open design question

There are (at least) **three different "live" states** that today collapse into one `is_live` boolean. Before locking ownership of the toggle, untangle:

1. **Sitemap/page Live** — owned by `page_status` (admin/pages). Governs whether the *destination URL* renders or shows Coming Soon.
2. **Offering Live (dedicated page)** — does the offering have its own published URL? When false, fall back to `current_url` + anchor on the host page.
3. **Offering Live (anchor-only deliveries)** — for resources, masterclasses, workshops, or speaking topics that never get a dedicated page, "live" means "the anchor card is published on its host page" (e.g. `/speaking/topics#...`).

Decision pending: whether (2) and (3) collapse into a single Op-Platform-owned `delivery.is_published` flag (PPS derives display state by combining it with `page_status` for the host URL), or stay on PPS as a website-rendering override. Until resolved, `is_live` remains editable on PPS — document any change here.

## New offerings

The in-app "New offering" dialog is replaced by a **New in PPS Op Platform** outbound link. New offerings must be authored in the PPS Op Platform Offerings Register first; the reconciliation pass (Phase C, not built yet) will surface them here.

## Deep link

`buildBlueDoorEditUrl(row)` in `src/pages/pps/admin/PathFinderOfferings.tsx` builds `https://paintedporch-ops.lovable.app/admin/topics?slug=<topic_slug>` (falls back to `?q=<name>` when `topic_slug` is null). Code identifiers (`buildBlueDoorEditUrl`, `BlueDoorEditLink`, `OP_PLATFORM_ADMIN_BASE`) keep their existing names; only user-visible copy uses "PPS Op Platform".

## Reference

- `docs/handoff/BlueDoor-to-PPS-Offerings-Handoff-v1.md` (canonical handoff doc; filename retained for git history)
- `.lovable/memory/features/quiz/bluedoor-recommendations-endpoint.md` (Phase A)
- `.lovable/memory/architecture/offerings-master-register.md`
