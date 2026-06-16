## Goal
Let you edit, from `/admin/path-finder-offerings` with no code changes:
1. **Pricing/tier** (Free, IGNITE, AMPLIFY, Blue Door, Speaking, Assessment, Pathway B)
2. **Result-Type (RT) mapping** — which B2C results (RT1–RT6) and B2B results (RT-A–RT-E) this offering can surface in, and in which "bucket" (primary recommendation pool vs. free-resource pool vs. speaking pool)
3. **Link fields** (already editable — keep as-is)

Plus confirm: **Stoic Leader Field Guide is already in the register** (live, Free, `/stoic-field-guide`). No DB change needed for it.

## What changes

### Database (one migration)
Add two columns to `path_finder_offerings`:
- `b2c_rt_pools jsonb` — e.g. `{"RT1":["free"], "RT3":["primary","free"], "RT5":["free"]}`
- `b2b_rt_pools jsonb` — e.g. `{"RT-A":["free"], "RT-C":["speaking","free"]}`

Pool values: `"primary"` (main recommendation), `"free"` (free-resources strip), `"speaking"` (speaking topics strip).

Backfill from the current hard-coded maps in `pathFinderQuiz.ts` so behavior is unchanged on day 1.

### Quiz engine (`src/data/pathFinderQuiz.ts`)
Replace the hard-coded `FREE_RESOURCES_BY_RT` and `SPEAKING_BY_RT` constants with a lookup that prefers DB overrides (already loaded via `usePathFinderOverrides`) and falls back to the existing constants. Primary-pool selection inside each `case "RTx":` block already filters by offering key — extend it to also accept any offering whose `b2c_rt_pools[RTx]` includes `"primary"`.

This keeps the quiz fully data-driven going forward.

### Admin UI (`src/pages/pps/admin/PathFinderOfferings.tsx`)
On each offering card, add:
- **Tier** dropdown (replaces the read-only badge) — same options as the `TIER_COLORS` keys.
- **RT mapping** grid: two compact rows of checkboxes
  - B2C: RT1 RT2 RT3 RT4 RT5 RT6, each with a 3-state segmented control: Off / Free / Primary (Speaking is B2B-only).
  - B2B: RT-A RT-B RT-C RT-D RT-E, each with: Off / Free / Primary / Speaking.
- Saves into the new `b2c_rt_pools` / `b2b_rt_pools` columns via the existing dirty/Save flow.

Link fields (current_url / dedicated_url / anchor_id / launch_slug) stay exactly as today.

### Tests
Update `src/data/__tests__/pathFinderQuiz.b2c.test.ts` and `pathFinderQuiz.b2b.test.ts` only if the engine signature changes; behavior should be identical with no overrides loaded.

## Out of scope (call out)
- Renaming tiers / adding new tier types — still in code (TIER_COLORS map).
- Per-RT *ordering* of offerings (sort_order is already a global field).
- Changing the RT decision logic itself (Q1–Q7 scoring) — still in code.

## Technical notes
- Columns are `jsonb` (not separate tables) for simplicity; the override hook already returns rows as-is so no new RPCs needed.
- Backfill SQL will read the current TS constants verbatim (I'll inline them in the migration).
- RLS: existing admin/editor policies on `path_finder_offerings` already cover the new columns.

Confirm and I'll ship it. If you'd rather keep the engine code-driven for now and only add **tier editing** (smaller change), say so and I'll scope down.
