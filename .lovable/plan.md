## Goal

Get a real, row-by-row picture of how PPS `path_finder_offerings` and Blue Door `offerings` overlap, so the Phase 2 topic+delivery split is based on data, not guesses.

## What's already in place

- `scripts/audit-offerings-overlap.mjs` exists and is wired to read both projects with service-role keys.
- It writes `docs/offerings-duplication-audit.md` with naive name-matched rows and a `manual_review` column.

## What this step does

1. **Add the Blue Door read credentials as secrets** (one-time setup; required for the script to reach the other project):
   - `BLUEDOOR_SUPABASE_URL`
   - `BLUEDOOR_SUPABASE_SERVICE_ROLE_KEY`
   (PPS credentials are already on the project.)

2. **Run the audit script** locally via the sandbox:
   - Reads every row from PPS `path_finder_offerings` and Blue Door `offerings`.
   - Normalizes names (lowercase, strip punctuation) and joins on that key.
   - Emits `docs/offerings-duplication-audit.md` with four sections:
     - **Matched** — same offering on both sides (name, key, URL on PPS / segment, status, pricing on Blue Door)
     - **PPS only** — rows in PPS with no Blue Door equivalent
     - **Blue Door only** — rows in Blue Door not yet routed on PPS
     - **Topic candidates** — PPS rows that share a base name across multiple deliveries (e.g., AI EI Oh as Speaking + Workshop). This is the seed list for the Phase 2 topic+delivery split.

3. **Surface the audit inside the admin**:
   - Add an "Audit report" section at the top of `/admin/offerings-coverage` that links to `docs/offerings-duplication-audit.md` in the repo and shows the three count rollups (matched / PPS only / Blue Door only / topic candidates) read from a small JSON sidecar `docs/offerings-duplication-audit.json` the script also writes.

4. **No schema changes, no sync code, no deletions.** Phase 1 stays read-only.

## What you'll have at the end

- A markdown file you can read and annotate to decide which PPS rows collapse into a single topic with multiple deliveries.
- A count summary visible in the admin so you can re-run later and see drift.
- Clear input for the Phase 2 plan (topics + deliveries split in Blue Door, then the PPS importer).

## Out of scope (next step after this one)

- Building `topics` + `deliveries` tables in Blue Door.
- Building the `import-offerings-from-bluedoor` edge function in PPS.
- Flipping PPS canonical fields to read-only.

## Technical details

- The script is a plain Node ESM module already in the repo; it expects the four env vars and runs as `node scripts/audit-offerings-overlap.mjs`.
- The sidecar JSON is small (just counts + matched-name list) so the admin page can fetch it via `import("../../../docs/offerings-duplication-audit.json")` without a network call.
- Re-running the script is idempotent; both output files are regenerated.

## Open question for you to answer before I implement

Do you want me to fetch the Blue Door service-role key from you (request via the secrets tool) so the script can actually run, or would you rather paste the audit output yourself after running the script locally with your own credentials?
