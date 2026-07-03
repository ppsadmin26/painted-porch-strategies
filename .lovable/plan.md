# Workshop/Keynote Route Validator

Two-part validation to prevent broken or misrouted workshop/keynote links from shipping.

## Part 1 — Build-time route audit script

**New file:** `scripts/validate-workshop-routing.mjs` (patterned after `audit-anchor-coverage.mjs`, read-only, no DB writes)

For every offering row where `delivery_format IN ('workshop','keynote','speaking')` OR `include_in_workshops = true` OR `is_keynote = true`, run a set of routing rules and emit both a JSON report and a non-zero exit code when any errors are found:

**Routing rules (per row):**
1. **Featured workshops** (`include_in_workshops = true`) must have `current_url = '/partner/amplify/workshops'` AND a non-null `anchor_id`. The `anchor_id` must correspond to a card `id={…}` actually rendered in `src/pages/pps/partner/amplify/AmplifyWorkshops.tsx` (either via the DB query it makes, or the hardcoded fallback ids).
2. **Speaker-page rows** (`include_on_speaker_page = true`) must have `current_url = '/speaking/amy'` (or another registered speaker page) AND an `anchor_id` present on that page.
3. **Everything else** (workshop/keynote/speaking rows not featured and not on a speaker page, excluding dedicated landings like `/resources/kick-the-habit`, `/partner/amplify/stractical-leader`) must:
   - route to `current_url = '/speaking/topics'`
   - have a non-null `topic_slug`
   - have `anchor_id = topic_slug`
4. **`topic_slug` uniqueness pairing**: rows sharing a `topic_slug` (workshop + keynote pair) must all share the same `current_url` and `anchor_id`.
5. **Reachability**: fetch each unique target URL from the running Vite preview (localhost:8080) and confirm HTTP 200. Skipped by default; enabled with `--live` flag so CI can opt in when a preview is running.

**Outputs:**
- `docs/workshop-routing-audit.json` — machine-readable results (used by the admin validator page for context)
- Console: grouped table of errors / warnings
- Exit code 1 on any error

**Wire-up:**
- Add `"validate:routing": "node scripts/validate-workshop-routing.mjs"` to `package.json` scripts.
- Add to `prebuild` chain after sitemap generation.

## Part 2 — Admin publish guard

Enforce the same rules in the offerings editor so bad rows can't reach the site.

**New shared file:** `src/lib/workshopRoutingValidation.ts`
- Exports `validateWorkshopRouting(row): { level: 'ok'|'warning'|'error', issues: string[] }`
- Same rule set as the script (rules 1-4; rule 5 is script-only)
- Pure function, importable in both React admin UI and unit tests.

**Editor integration** — `src/pages/pps/admin/offerings/OfferingEditor.tsx`:
- On render, call `validateWorkshopRouting` against the current draft.
- Show a red `<Alert>` above the publish toggle listing each issue when `level === 'error'`.
- Disable the "Published" `<Switch>` (and the Save button when the user is trying to flip `is_published: true`) while errors exist. Editors can still save unpublished drafts to fix them.
- Warnings render as a yellow banner but don't block publish.

**List page** — `src/pages/pps/admin/PathFinderOfferings.tsx`:
- Compute validation per row; show an `AlertTriangle` icon in the row when a published row currently fails validation (catches drift when routing rules or hardcoded featured lists change).

**Unit tests** — `src/lib/__tests__/workshopRoutingValidation.test.ts`:
- Covers each rule with a passing + failing fixture (featured missing anchor, speaking row not on /speaking/topics, mismatched anchor_id vs topic_slug, paired workshop/keynote diverging URLs, dedicated-landing exceptions).

## Technical details

- Script uses the same `PPS_URL` / `PPS_SERVICE_KEY` env pattern as `audit-anchor-coverage.mjs`. No new secrets.
- Featured id pool for rule 1 is derived by parsing `AmplifyWorkshops.tsx` (both the Supabase select and the `FALLBACK_THUMB` keys — same technique as the anchor audit).
- Dedicated-landing exceptions list is a small allowlist in the validation module, keyed by `offering_key`: `stracticalLeader`, `kickTheHabit`. Add more by editing the list.
- No DB migration required. All enforcement lives client-side + build-time; the existing RLS already blocks non-editors from mutating rows.

## Files touched

**Created**
- `scripts/validate-workshop-routing.mjs`
- `src/lib/workshopRoutingValidation.ts`
- `src/lib/__tests__/workshopRoutingValidation.test.ts`

**Edited**
- `package.json` (script + prebuild chain)
- `src/pages/pps/admin/offerings/OfferingEditor.tsx` (publish guard UI)
- `src/pages/pps/admin/PathFinderOfferings.tsx` (row-level warning icon)
