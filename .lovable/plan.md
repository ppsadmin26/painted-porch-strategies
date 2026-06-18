## Goal

Clarify the split between the two pages so each has one job:

- **`/sitemap`** — the **visible site map**. A clean, hierarchical tree of the public site (with the existing admin-only badges/toggles removed or moved). Visitors get the tree; staff see category/status badges read-only.
- **`/admin/pages`** — the **unified page manager**. One table where every route's URL, Status, Category, Location (Main Nav / Subpage / Standalone), and SEO/AEO state are visible and editable side by side.

## Source of "Location"

We don't need a new DB column. `Location` is derived from `sitemapData` in `src/pages/pps/Sitemap.tsx`:

- `Main Nav` — top-level node in `sitemapData` (depth 0)
- `Subpage` — nested under a Main Nav parent (depth ≥ 1), label shows parent (e.g. `Subpage of /partner/ignite`)
- `Standalone` — route exists in `App.tsx` but not in `sitemapData` (orphan / utility / thank-you / etc.)
- `Unlisted` — DB row exists but route isn't in `sitemapData` or `App.tsx` (cleanup candidate)

A small helper `resolveLocation(path)` in `src/config/pageLocation.ts` returns `{ kind, parentPath?, parentLabel? }`.

## /admin/pages — unified table

Rebuild `PageStatusManager.tsx` around a single sortable/filterable table. One row per route, columns:

```text
| Path | Title (from page_seo) | Status | Category | Location | SEO/AEO | Note | Actions |
```

- **Path** — link opens the live route in a new tab
- **Title** — `page_seo.title` if present, else `—`
- **Status** — inline Live/Draft switch (existing `setStatus`)
- **Category** — inline segmented picker public / internal / archived (existing `setCategory`)
- **Location** — read-only chip (Main Nav / Subpage of … / Standalone / Unlisted)
- **SEO/AEO** — chip showing `Custom` / `Default` / `Missing canonical` etc.; click → existing `PageSeoEditorDialog`
- **Note** — admin-only inline edit (existing `notesById` flow)
- **Actions** — Remove override, Open page

Top bar keeps existing controls (search, "Sync from sitemap", "Add path", `BulkSeoGenerator`, `CanonicalAuditCard`) but consolidated into a single header strip. Filters: category (multi), status, location, "has SEO override", "in sitemap only / in App only / both".

Source list = union of:
1. Every path from `collectSitemapPaths()`
2. Every `page_status` row
3. Every `page_seo.path`

Excludes `/admin/*` by default (toggle to show).

## /sitemap — visible site tree only

Trim `Sitemap.tsx` down to:

- Public tree rendering from `sitemapData` (already there)
- Category filtering for public viewers (existing behavior — internal/archived hidden)
- Staff-only read-only badges next to each node: Status (Live/Draft) and Category
- **Remove** from this page: inline status switch, inline category picker, "Page Status" admin shortcut row, the bottom admin management block. Replace with a single banner for staff: "Manage these pages in /admin/pages" linking through.

The page becomes presentational; all writes happen in `/admin/pages`.

## Files

**New**
- `src/config/pageLocation.ts` — `resolveLocation(path, sitemapData)` + `LocationKind` type

**Edited**
- `src/pages/pps/admin/PageStatusManager.tsx` — replace card list with unified table + Location column + SEO/AEO column
- `src/pages/pps/Sitemap.tsx` — strip write controls, keep tree + read-only staff badges + link to `/admin/pages`
- `src/pages/pps/Sitemap.tsx` nav label change in admin shortcuts list (already references `/admin/pages`)

**Untouched**
- DB schema (`page_status`, `page_seo`) — no migration needed
- `usePageStatuses`, `pageCategories.ts`, validators, sitemap.xml/robots.txt generators

## Out of scope

- Renaming routes
- Moving `/admin/pages` to a new URL
- Adding `location` to the DB (kept derived so the sitemap tree stays the single source of structural truth)
- Touching `App.tsx` routing

## Open question before I build

Should `/sitemap` keep showing **staff-only badges** (Status + Category chips next to each node) so admins can scan the tree at a glance — or do you want it stripped to a pure public tree with zero admin chrome, and all status visibility lives only in `/admin/pages`?
