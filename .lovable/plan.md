
# Split /admin/offerings into list + detail

## Goal

Match the PPS Ops Platform pattern: `/admin/offerings` is a compact registry table of every delivery; clicking a row opens a full detail/edit page for that one offering.

## Routes

- `/admin/offerings` — **List view** (new default). Table of all deliveries.
- `/admin/offerings/:offeringKey` — **Detail view**. The card UI that today lives inline (Registry section + PPS Controls section from the last cleanup).
- Existing redirects (`/admin/path-finder`, `/admin/offerings-coverage`) continue to land on the list.

## List view (`/admin/offerings`)

Columns modeled on the reference screenshot:

| Column | Source | Notes |
| --- | --- | --- |
| Topic | `name` + `offering_key` + short blurb (1 line, truncated) | Click → detail page |
| IDs | `#sort_order` (or short id) | Read-only |
| Types | delivery-type chips (workshop / keynote / lab / free_resource / …) | From canonical fields (`is_keynote`, `include_in_workshops`, tier) |
| Segments | B2B / B2C chip | Derived from tier + audience |
| Facilitator | full name chips (`facilitatorDisplay`) | Read-only |
| Categories | topic tag chip(s) | Read-only |
| Deliveries | count of sibling rows sharing `topic_slug` | Read-only |
| Live | ✅ / — based on visible flag | Read-only summary |
| Updated | `updated_at` | Formatted date |
| ✎ | Link to detail page | |

Keeps: top summary line ("N shown · N topics · N deliveries · N live"), search input, type/segment/facilitator/category filters, "Refresh" and "New topic" buttons, Phase-C banner, broken-launch alert, `OpPlatformResyncPanel`.

Removes from list view: the giant expanded card per row (moves to detail page).

## Detail view (`/admin/offerings/:offeringKey`)

Reuses the current card body verbatim — Registry section (read-only, Op Platform) + PPS Controls section (Quiz + Website). Adds:

- Back link "← All offerings"
- Page title = offering name, subtitle = key + tier chip
- Save + dirty-state logic (already exists) scoped to this one offering

Same data fetch: single `path_finder_offerings` row by `offering_key` (plus launch options + page-status lookup already in the page).

## Files

- `src/pages/pps/admin/PathFinderOfferings.tsx` — refactor into the **list view** only. Strip the per-row expanded card JSX.
- `src/pages/pps/admin/PathFinderOfferingDetail.tsx` — **new**. Renders one offering using the extracted card component.
- `src/pages/pps/admin/offerings/OfferingEditor.tsx` — **new**. Extracted from the current inline card (Registry + PPS Controls sections + save handler). Consumed by the detail page. This keeps the diff manageable and lets both pages share code if needed later.
- `src/App.tsx` — add the `/admin/offerings/:offeringKey` route.

## Out of scope

- Bulk edit from the list.
- Any DB / schema changes.
- Changes to `OpPlatformResyncPanel`, routing-rules logic, or sync behavior.
- Renaming or moving fields.
