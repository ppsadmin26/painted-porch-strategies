## Phase 2: Typography migration — Batch 1

Migrate `<p>` / `<li>` / `<blockquote>` tags from raw Tailwind text-size utilities to the 5-token scale (`text-lead` / `text-body` / `text-body-sm` / `text-caption` / `text-pullquote`) defined in `src/index.css` during Phase 1.

### Scope (this plan only)

Five sub-batches, in order. After each sub-batch I'll re-run `npm run brand:typography` to confirm the count drops and the page still renders cleanly in preview.

| # | Sub-batch | Files | Violations |
|---|---|---|---|
| 1 | **PPSHome** | `src/pages/pps/PPSHome.tsx` | 29 |
| 2 | **Blue Door landing** (live components only, skip `_archive-v1.0/`) | 12 files in `src/components/pps/blue-door/` | 72 |
| 3 | **IGNITE tier** | `partner/IgnitePathAlt.tsx` + 5 files in `partner/ignite/` | 79 |
| 4 | **AMPLIFY tier** | `partner/AmplifyPathAlt.tsx` + 6 files in `partner/amplify/` | 125 |
| 5 | **EMBODY tier** | `partner/EmbodyPathAlt.tsx` + (any `partner/embody/` subpages) | 26 |

**Total: ~331 violations across ~31 files.** Other tiers, blog, admin, resources, about, programs, _archive folders, etc. are out of scope for this plan — they'll come in later phases.

### Migration rules (the judgment calls)

The validator flags raw classes but cannot decide the right replacement. I'll apply this decision tree per tag:

```text
Is the <p> inside a card / grid cell / sidebar / dense list?
  yes → text-body-sm        (keeps 14px feel where density matters)
  no  → continue

Is it a hero subhead, section intro under an H2, or a "lead" paragraph?
  yes → text-lead            (18→20px, was usually text-lg / text-xl)
  no  → continue

Is it a block quote, pull quote, or italic emphasis line?
  yes → text-pullquote       (was usually text-xl / text-2xl italic)
  no  → continue

Is it a footnote, caption, label, source, timestamp, badge, or legal line?
  yes → text-caption         (was text-xs)
  no  → text-body            (default, 16px)
```

Concrete raw → token mapping I'll start from:

- `text-xs` → `text-caption`
- `text-base` → `text-body`
- `text-sm` in a multi-column / card grid → `text-body-sm`; `text-sm` in full-width prose → `text-body`
- `text-lg` / `text-xl` on intro/subhead paragraphs → `text-lead`
- `text-xl` / `text-2xl` on quotes → `text-pullquote`
- `text-3xl` on a `<p>` (rare, 1 case in PPSHome) → treat as a styled lead and likely keep raw (it's heading-like); flag for review

### What I will NOT change

- **Headings** (h1–h6) — already standardized in `index.css`, validator skips them.
- **Non-text utilities** on the same element (color, weight, margin, italic, font-poppins overrides) — preserved verbatim.
- **`leading-*` overrides** — if a tag has a custom `leading-tight` etc., I keep it and drop the token's default leading via `!leading-*` only if it would override. (Tokens already include sensible defaults.)
- **Archive folders** (`_archive-v1.0/`, `BlueDoorLandingArchive.tsx`, `PPSHomeArchive.tsx`, `EmbodyPathAltArchiveV2.tsx`, etc.).
- **Tier-page font-family overrides** if any component sets Poppins on a paragraph deliberately — preserved.

### Validation after each sub-batch

1. `npm run brand:typography` — confirm file's violation count drops to 0 (or note any flagged-for-review tags).
2. Spot-check the page in preview (`/`, `/blue-door`, `/partner/ignite`, `/partner/amplify`, `/partner/embody`).
3. If anything looks visually off (size jump on a card title, lost emphasis on a hero subhead), tune the token choice for that tag.

### Out of scope (next plan)

After you approve and I ship Batch 1, the remaining backlog is roughly:

- PhaseZero, PPSHomeVerbatim, PPSBusinessPrograms, About, Speaking, Resources, Programs, Contact (~340 violations)
- Admin / legal / thank-you / opt-in pages (~280 violations)
- Shared layout components outside `pps/` (small)

I'll plan those once Batch 1 is approved and shipped.

### Deliverable

A single round of edits to ~31 files plus a short before/after violation report. No new components, no design-system changes, no copy changes.
