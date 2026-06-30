# Phase C — Collapse "Live" toggles & finalize PPS ↔ Op Platform ownership

## Goal
End the ambiguity of `path_finder_offerings.is_live` by separating **page-level** live state (PPS-owned via `page_status`) from **offering-level** publish state (Op Platform-owned via `delivery.is_published`). After this phase, the PPS admin shows zero "Live" toggles on offerings — display is computed.

## Ownership after Phase C

| Concern | Source of truth | UI surface |
|---|---|---|
| Page renders vs Coming Soon | PPS `page_status` | `/admin/pages` (existing) |
| Offering published (dedicated page OR anchor card) | Op Platform `delivery.is_published` | paintedporch-ops.lovable.app |
| Quiz inclusion + pin | PPS (`is_featured_in_quiz`, new `include_in_quiz`) | `/admin/path-finder-offerings` |
| Speaker page inclusion | PPS (`include_on_speaker_page`) | `/admin/path-finder-offerings` |
| RT pools / routing rules | PPS (`b2c_rt_pools`, `b2b_rt_pools`) | `/admin/path-finder-offerings` (future: dedicated quiz-rules surface) |
| Linked Launch | PPS (`launch_slug`) | `/admin/path-finder-offerings` |
| Everything narrative + delivery (name, blurb, image, facilitator, tier, topic, format, segment, URL, anchor, sort_order, pricing) | Op Platform | paintedporch-ops.lovable.app |

## Display computation (single rule)

An offering is **publicly visible** when:

```text
delivery.is_published === true        // from Op Platform mirror
  AND page_status(host_url) === 'live' // PPS-owned
  AND (PPS-side gates per surface)    // include_in_quiz / include_on_speaker_page / etc.
```

Where `host_url = (current_url || dedicated_url).split('#')[0]`.

## Work breakdown

### C1 — Schema
- Add `path_finder_offerings.is_published BOOLEAN NOT NULL DEFAULT false` (mirrors `delivery.is_published` from Op Platform).
- Backfill `is_published = is_live` for every existing row (one-time copy).
- Keep `is_live` for one release as a deprecated alias; mark it nullable, no longer read by render code.
- Add `include_in_quiz BOOLEAN NOT NULL DEFAULT true` (PPS-owned, separate from `is_featured_in_quiz` which is "pin to top").
- Migration includes the standard GRANT block.

### C2 — Compute helper
- Create `src/lib/offeringVisibility.ts` exporting `isOfferingVisible(row, pageStatuses)` and `resolveHostPath(row)`.
- Single source of truth used by:
  - `usePathFinderOverrides` (already reads `page_status`)
  - `useSpeakerTopics`
  - `useOpPlatformRecommendations` filter
  - Speaking Topics page grouping
- Add unit tests covering the four states (published+live, published+draft, unpublished+live, unpublished+draft).

### C3 — Admin UI
- `/admin/path-finder-offerings`:
  - Remove the `is_live` toggle column.
  - Replace with a **read-only "Published"** badge sourced from `is_published` (with "Edit in PPS Op Platform" deep link).
  - Add a computed **"Visible"** badge: Published ∧ host page Live ∧ relevant PPS gates.
  - Keep editable: `include_in_quiz`, `is_featured_in_quiz` (pin), `include_on_speaker_page`, `launch_slug`, RT pools.
- `/admin/pages` unchanged (already PPS-owned).

### C4 — Sync contract
- Update `docs/handoff/BlueDoor-to-PPS-Offerings-Handoff-v1.md`:
  - `delivery.is_published` is the canonical publish flag.
  - PPS mirror writes `is_published` only via sync; admin never edits it.
- Update `.lovable/memory/features/quiz/offerings-admin-phase-b.md` → mark Phase B complete, link Phase C memory.
- New memory file: `.lovable/memory/features/quiz/offerings-live-toggle-phase-c.md` with the visibility rule and ownership table above.

### C5 — Render code sweep
- Replace every `row.is_live` read with `isOfferingVisible(...)` or `row.is_published` (depending on intent).
- Files to touch (from grep):
  - `src/hooks/usePathFinderOverrides.ts`
  - `src/hooks/useSpeakerTopics.ts`
  - `src/integrations/op-platform/recommendations.ts` (filter)
  - Any `path_finder_offerings.is_live` SELECT in scripts/edge functions.
- Update `scripts/audit-anchor-coverage.mjs` and report generators to read `is_published`.

### C6 — Tests
- Vitest: visibility helper + admin component renders Published/Visible badges correctly.
- Playwright: existing quiz specs continue to pass (no recommendation regressions).

### C7 — Cleanup (follow-up PR, not this phase)
- Once Op Platform sync overwrites `is_published` reliably, drop the deprecated `is_live` column.

## Open question to confirm before C1
Do you want **anchor-only deliveries** (workshops/keynotes on `/speaking/topics#…`) to require their *host* page (`/speaking/topics`) be Live before the card publishes, or should `delivery.is_published` alone be enough? My recommendation: require both (host page Live AND delivery published). Confirm and I'll proceed with C1–C6.
