## Goal
Let you create a brand-new offering from `/admin/path-finder-offerings` — name, tier, link fields, and RT-pool mapping — with no code changes and no migration per offering.

## What changes (admin UI only)

`src/pages/pps/admin/PathFinderOfferings.tsx`

1. **"New offering" button** in the page header (next to existing controls).
2. Clicking it opens a **dialog** with these fields:
   - **Offering key** (required) — auto-slugged from name (lowercase camel/kebab), editable, must be unique. Validated against existing keys before save.
   - **Display name** (required)
   - **Tier** (dropdown — same options as the inline tier editor: Free, IGNITE, AMPLIFY, Blue Door, Speaking, Assessment, Pathway B)
   - **Current URL** and **Dedicated URL** (optional)
   - **Anchor ID** (optional)
   - **Is live** (toggle, default true)
   - **Sort order** (number, defaults to max+10)
   - **Topic** (optional text — matches existing column)
   - **Notes** (optional textarea)
3. On Save:
   - Insert one row into `path_finder_offerings` with the fields above and empty `b2c_rt_pools` / `b2b_rt_pools` (`{}`).
   - Close dialog, refresh the list, scroll the new card into view.
4. After creation, the existing inline editor on the new card is used to set the **RT pool mapping** (B2C RT1–6 and B2B RT-A–E). No separate step needed — this reuses the editor shipped last turn.

## Out of scope
- No quiz-engine change. New offerings only appear in quiz results once you map them to RT pools via the existing inline editor (which already writes to `b2c_rt_pools` / `b2b_rt_pools`).
- No delete/archive flow (can add later if you want).
- No new DB columns or migration — the table already has every field we need.
- No change to `OFFERINGS` constant in `pathFinderQuiz.ts`. New offerings are DB-only; they surface via the RT-pool override path already in place. Hard-coded offerings keep working unchanged.

## Technical notes
- Uniqueness check: client-side against the already-loaded list, plus rely on the table's `offering_key` unique constraint to catch races.
- RLS: existing admin/editor insert policy on `path_finder_offerings` covers this.
- Validation: key must match `/^[a-zA-Z0-9_-]+$/`, name non-empty, tier required.

Confirm and I'll ship it.