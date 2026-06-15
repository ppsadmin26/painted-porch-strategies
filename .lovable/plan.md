## Recommendation

**Master home: Blue Door project DB is canonical; PPS gets a one-way synced mirror.**

Why this beats the other options:
- Blue Door's `offerings` schema is genuinely richer (path_stage, pillar_alignment, pricing JSONB, icp_routing, cascade_elements, stoic_alignment, status workflow). The diagnostic's recommendation engine needs that depth. The PPS website doesn't — it needs name, blurb, URL, anchor, tier, eligibility flags.
- Cross-project Supabase reads from PPS into Blue Door's DB (or vice versa) are fragile: separate auth contexts, separate RLS, separate type generators, brittle env wiring. A one-way sync keeps each app reading its own DB.
- "New shared schema in PPS" would force re-platforming the Blue Door admin you've already built. Not worth it.
- Editing in two places (status quo) is exactly what you want to stop.

**Topic vs delivery: split them.** AI EI Oh is the proof — same idea, different format, different price, different URL, different audience. Without the split you'll be hand-syncing blurbs forever. The split is also where Blue Door's recommender gets stronger: it can recommend the topic, and the consumer surface picks the appropriate delivery.

**Phase 1 stays read-only** per your choice. We document and align; we don't move data yet.

## Phase 1 deliverables (this plan)

### 1. Canonical schema doc in Blue Door (`/docs/offerings-master.md`)
Single doc describing the topic + delivery model that Blue Door will adopt in Phase 2, plus the PPS sync contract. No code changes to either DB yet.

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
hero_image                     anchor_id      (deep-link target)
                               pricing (JSONB — same shape as today)
                               duration_label
                               status   (active | pending | archived)
                               is_live  (web-visible)
                               include_in_quiz
                               sort_order
```

Existing Blue Door `offerings` columns (path_stage, entry_element, partnership_style[], offering_type[], icp_routing, cascade_elements, stoic_alignment, value_proposition, outcome, prerequisites, notes fields, assessment_addon) all stay — they live on `delivery` (most are delivery-specific) with a documented rule that a few may eventually promote to `topic` if they prove to be cross-format invariants.

### 2. Schema mapping doc in PPS (`.lovable/plan-offerings-sync.md`)
Defines the projection that PPS will consume:

```text
PPS path_finder_offerings (FUTURE source: synced view of Blue Door deliveries)
─────────────────────────
offering_key        ← `${topic.slug}--${delivery.format}` (stable, deterministic)
name                ← topic.name + format suffix when ambiguous ("AI EI Oh (Workshop)")
blurb               ← topic.short_blurb
description         ← delivery-specific description (falls back to topic.long_description)
facilitator         ← delivery.facilitator
tier                ← delivery.tier
topic               ← topic.themes[0] (for the workshop-hub topic chip)
current_url         ← delivery.url
dedicated_url       ← delivery.url (when delivery.is_live)
anchor_id           ← delivery.anchor_id
is_live             ← delivery.is_live
include_in_workshops← (delivery.format = 'workshop')
is_featured_in_quiz ← delivery.include_in_quiz
sort_order          ← delivery.sort_order
```

### 3. Audit pass (no edits)
Generate `/docs/offerings-duplication-audit.md` in the PPS repo listing every current PPS `path_finder_offerings` row alongside every Blue Door `offerings` row, with a "same topic?" column filled by string match + manual review column. This is the canonical map we'll use in Phase 2 to backfill cleanly. Built as a read-only script under `scripts/audit-offerings-overlap.mjs` that hits both DBs via service-role keys and writes the markdown.

### 4. Admin UI hint in PPS `/admin/path-finder-offerings`
Add a single read-only banner: *"This table will become a synced mirror of the Blue Door offerings catalog. Edit canonical data in [Blue Door → Offerings]. Routing fields (URL, anchor, is_live, is_featured_in_quiz) will remain editable here until Phase 2."* Link out to the Blue Door admin. No behavior change.

### 5. Memory updates
- New: `mem://architecture/offerings-master-register` — Blue Door is canonical; PPS mirrors; topic+delivery split is the long-term model; Phase 1 is documentation only.
- Update: `mem://features/quiz/b2b-recommendation-rules` to note Phase 2 will source from synced deliveries.

## Out of scope for Phase 1
- No schema migrations in either DB.
- No data movement.
- No new sync job (that's Phase 2).
- No changes to the quiz, speaker pages, or workshop hub.

## Phase 2 preview (not building yet, for context)

1. Add `topics` + `deliveries` tables in Blue Door alongside existing `offerings`; backfill from current `offerings` rows and from PPS speaking/workshop data using the audit map.
2. Build a Supabase edge function in Blue Door (`export-pps-offerings`) that emits the projection above on demand or on `deliveries` row change.
3. Build the receiving end in PPS (`import-offerings-from-bluedoor` edge fn) that upserts into `path_finder_offerings` and marks any non-synced legacy rows as `archived`.
4. Flip PPS admin to read-only for canonical fields; keep routing fields editable; add "Synced X minutes ago" indicator.
5. Retire the legacy un-split Blue Door `offerings` table once parity is verified.
