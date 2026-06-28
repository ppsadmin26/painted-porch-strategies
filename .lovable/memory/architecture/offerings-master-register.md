---
name: Offerings Master Register
description: PPS Op Platform project owns the canonical offerings catalog. PPS site path_finder_offerings is a one-way mirror. Topic + delivery split is the long-term model.
type: feature
---

**Canonical:** PPS Op Platform project `offerings` table (Phase 2 → `topics` + `deliveries`). Internally referenced in older docs and code as the "Blue Door project" — same thing, different name.
**Mirror:** PPS site `path_finder_offerings`. One-way sync from PPS Op Platform.

> Do not confuse with the **public product** "The Blue Door Organizational Appraisal" ($1,500 org appraisal). That product keeps its name and is unrelated to this register's naming change.

**Why:** PPS Op Platform's schema (path_stage, pillar_alignment, pricing JSONB, icp_routing, etc.) is built for diagnostic-driven recommendations. PPS site needs only the routing/display slice (name, blurb, URL, anchor, tier, eligibility). Two apps, two DBs, one source of truth.

**Topic + delivery model:** One *topic* (e.g. "AI EI Oh") → N *deliveries* (speaking / workshop / lab / keynote / course) with their own URL, price, anchor, and audience. Avoids duplicated blurbs and price drift.

**Sync key:** `offering_key = ${topic.slug}--${delivery.format}` (deterministic, stable across runs).

**Phase 1 (current):** Documentation + audit script + admin banner. No DB changes.
- Canonical schema doc: `docs/offerings-master-schema.md`
- PPS sync plan: `.lovable/plan-offerings-sync.md`
- Audit script: `scripts/audit-offerings-overlap.mjs` (reads both DBs, writes markdown)

**Phase 2 (future):** PPS Op Platform adds `topics`/`deliveries`; export edge fn; PPS site `import-offerings-from-bluedoor` edge fn; PPS site admin flips canonical fields to read-only (routing fields stay editable).

**Edit rule (post-Phase 2):** Canonical fields edited in PPS Op Platform only. Routing fields editable in either admin.

**Do NOT:** Build cross-project Supabase reads (fragile RLS, separate auth contexts, brittle env). Always go through the sync.

**Naming/code:** File paths and code identifiers retain "bluedoor" / "BlueDoor" prefixes (e.g. `src/integrations/bluedoor/`, `useBlueDoorRecommendations`, `BlueDoorEditLink`, `bluedoordiagnostic.lovable.app` URL). Only **user-visible copy** uses "PPS Op Platform". Renaming identifiers/URLs is out of scope.
