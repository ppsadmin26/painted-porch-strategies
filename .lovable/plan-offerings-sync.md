# PPS Offerings Sync Plan (Phase 1)

This is the PPS-side companion to `docs/offerings-master-schema.md`.

## Today (Phase 1)
- PPS owns `path_finder_offerings` table outright. Admin edits everything.
- Blue Door owns `offerings` table outright.
- Two registers, same concepts, manual reconciliation.

## After Phase 2 (target)
- Blue Door is canonical (`topics` + `deliveries`).
- A Blue Door edge function emits the PPS projection (see schema doc) on demand or on row change.
- A PPS edge function `import-offerings-from-bluedoor` upserts into `path_finder_offerings`, keyed by `offering_key = ${topic.slug}--${delivery.format}`.
- PPS admin shows canonical fields read-only with "Edit in Blue Door" deep link. Routing fields stay editable.
- Legacy rows in PPS that don't match a synced key get auto-archived (`is_live = false`) but are not deleted.

## Audit script (Phase 1 deliverable)
`scripts/audit-offerings-overlap.mjs` — read-only:
- Reads PPS `path_finder_offerings` via service-role key (this project).
- Reads Blue Door `offerings` via a Blue Door service-role key (provided at runtime via env).
- Writes `docs/offerings-duplication-audit.md` with a two-column table + naive match column (lowercased name overlap) + a `manual_review` column to be filled in by hand.
- Run with `BLUEDOOR_URL=... BLUEDOOR_SERVICE_KEY=... node scripts/audit-offerings-overlap.mjs`.
- Not wired to CI. Run when you want a fresh map before Phase 2.

## Constraint
No PPS DB changes during Phase 1. No content drift fixes. Audit only.
