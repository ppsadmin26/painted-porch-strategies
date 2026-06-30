---
name: Offerings Admin Consolidation
description: Single admin surface at /admin/offerings for all path_finder_offerings; OfferingsCoverage page removed
type: feature
---

## Single admin surface: `/admin/offerings`

After Phase C, there is **one** admin page for offerings: `PathFinderOfferings.tsx` mounted at `/admin/offerings`.

### Removed (legacy)
- `src/pages/pps/admin/OfferingsCoverage.tsx`
- `supabase/functions/audit-offerings-overlap/`
- `scripts/audit-offerings-overlap.mjs`
- `docs/offerings-duplication-audit.json`
- Sidebar entry "Offerings Coverage"

### Route redirects (keep deep links working)
- `/admin/path-finder` → `/admin/offerings`
- `/admin/offerings-coverage` → `/admin/offerings`

### Ownership shown on every card
- **Read-only (PPS Op Platform canonical):** name, blurb, description, image, **tier**, **topic tag**, **facilitator**, **`include_in_workshops`** (Workshop chip), **`is_keynote`** (Keynote chip), URL, anchor — with "Edit in PPS Op Platform" deep link
- **Editable (PPS site):** `include_on_speaker_page`, `is_featured_in_quiz` (pin), `launch_slug`, RT pools (b2c + b2b), URL/anchor (transitional until sync ships)
- **Computed badge:** Published (mirror) ∧ host page Live (`page_status`) ∧ PPS gates = Visible (see `mem://features/quiz/offerings-live-toggle-phase-c`)

### Rule
Anchor-only deliveries (workshops/keynotes on `/speaking/topics#…`) require **both** `delivery.is_published === true` AND the host page being Live before the card renders publicly.
