---
name: Offerings Master Register
description: Blue Door project owns the canonical offerings catalog. PPS path_finder_offerings is a one-way mirror. Topic + delivery split is the long-term model.
type: feature
---

**Canonical:** Blue Door project `offerings` table (Phase 2 → `topics` + `deliveries`).
**Mirror:** PPS `path_finder_offerings`. One-way sync from Blue Door.

**Why:** Blue Door's schema (path_stage, pillar_alignment, pricing JSONB, icp_routing, etc.) is built for diagnostic-driven recommendations. PPS needs only the routing/display slice (name, blurb, URL, anchor, tier, eligibility). Two apps, two DBs, one source of truth.

**Topic + delivery model:** One *topic* (e.g. "AI EI Oh") → N *deliveries* (speaking / workshop / lab / keynote / course) with their own URL, price, anchor, and audience. Avoids duplicated blurbs and price drift.

**Sync key:** `offering_key = ${topic.slug}--${delivery.format}` (deterministic, stable across runs).

**Phase 1 (current):** Documentation + audit script + admin banner. No DB changes.
- Canonical schema doc: `docs/offerings-master-schema.md`
- PPS sync plan: `.lovable/plan-offerings-sync.md`
- Audit script: `scripts/audit-offerings-overlap.mjs` (reads both DBs, writes markdown)

**Phase 2 (future):** Blue Door adds `topics`/`deliveries`; export edge fn; PPS `import-offerings-from-bluedoor` edge fn; PPS admin flips canonical fields to read-only (routing fields stay editable).

**Edit rule (post-Phase 2):** Canonical fields edited in Blue Door only. Routing fields editable in either admin.

**Do NOT:** Build cross-project Supabase reads (fragile RLS, separate auth contexts, brittle env). Always go through the sync.
