# Offerings Master Register — Canonical Schema (Phase 1 doc)

**Status:** Documentation only. No DB changes in either project yet.

**Canonical home:** Blue Door project (`offerings` table today → `topics` + `deliveries` in Phase 2).
**Mirror:** PPS project `path_finder_offerings` (one-way sync from Blue Door).

## Why this shape

The same *idea* (e.g. "AI EI Oh") can be sold in multiple *formats* (speaking keynote, half-day workshop, lab) at different prices, on different pages, to different audiences. The current registers conflate idea + format into one row, which forces duplicate blurbs and hand-maintained URL/price drift.

We split them:

```text
topic                          delivery (1 topic → N deliveries)
─────                          ────────────────────────────────
id                             id
slug ("ai-ei-oh")              topic_id ──► topic.id
name                           format  (speaking | workshop | lab | course | keynote | diagnostic)
short_blurb                    catalog_segment (B2C | B2B)
long_description               tier    (IGNITE | AMPLIFY | EMBODY | Blue Door | Free | Speaking | Assessment)
pillar_alignment[]             facilitator
themes[]                       url            (canonical web URL for this delivery)
hero_image                     anchor_id      (deep-link target on the URL)
                               pricing (JSONB)
                               duration_label
                               status   (active | pending | archived)
                               is_live  (web-visible)
                               include_in_quiz
                               sort_order
```

### Existing Blue Door `offerings` columns stay (on `delivery`)

`path_stage`, `entry_element`, `partnership_style[]`, `offering_type[]`, `icp_routing`,
`cascade_elements`, `stoic_alignment`, `value_proposition`, `outcome`, `prerequisites`,
all `*_notes` fields, `assessment_addon` — these are delivery-specific and stay on `delivery`.

If we discover a few are truly cross-format (same across speaking/workshop/lab), we promote
them to `topic` in a future migration. Don't promote speculatively.

## PPS sync projection

The Blue Door project will emit one PPS row per `delivery` via an export edge function in Phase 2. PPS upserts into `path_finder_offerings`:

```text
PPS path_finder_offerings (Phase 2 source: synced view of Blue Door deliveries)
─────────────────────────
offering_key          ← `${topic.slug}--${delivery.format}` (deterministic, stable)
name                  ← topic.name + format suffix when ambiguous ("AI EI Oh (Workshop)")
blurb                 ← topic.short_blurb
description           ← delivery.description (falls back to topic.long_description)
facilitator           ← delivery.facilitator
tier                  ← delivery.tier
topic                 ← topic.themes[0]   (for the workshop-hub topic chip)
current_url           ← delivery.url
dedicated_url         ← delivery.url       (when delivery.is_live)
anchor_id             ← delivery.anchor_id
is_live               ← delivery.is_live
include_in_workshops  ← (delivery.format = 'workshop')
is_featured_in_quiz   ← delivery.include_in_quiz
sort_order            ← delivery.sort_order
```

## Phase 1 / Phase 2 boundary

| Phase | What happens                                                                 |
| ----- | ---------------------------------------------------------------------------- |
| 1     | Schema docs (this file). Audit script. Admin banner in PPS. Memory updates. No DB changes. |
| 2     | Topics + deliveries tables in Blue Door. Backfill from existing rows + PPS audit map. Export edge fn (Blue Door). Import edge fn (PPS). Flip PPS admin canonical fields to read-only. Retire legacy un-split `offerings`. |

## Edit rules (post-Phase 2)

- **Canonical fields** (name, blurb, pricing, descriptions, pillar/path/format/tier) → edit in Blue Door admin only.
- **Routing fields** (current_url, dedicated_url, anchor_id, is_live, is_featured_in_quiz, include_in_workshops, sort_order) → editable in either admin; Blue Door is source of truth but PPS can override per environment if needed.
