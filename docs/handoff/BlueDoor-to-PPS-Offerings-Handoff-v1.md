# Offerings Management — Blue Door → PPS Site Handoff

Companion to the PPS-side handoff ("Offerings Management — Where We Stand", June 27, 2026).

This document describes the **Blue Door** state of the catalog now that Phase 2 (topic + delivery split) has landed on the Blue Door side, and specifies what the **PPS site** project needs to build to consume it.

**Prepared:** June 27, 2026

**Status:** Blue Door canonical model is live and queryable. PPS site has not yet been wired in.

---

## 1. TL;DR

Blue Door is now the canonical home for offerings under a **topics + deliveries** model. The legacy flat `offerings` table is preserved as a compatibility layer but is no longer the source of truth. A public Supabase Edge Function (`pathfinder-recommendations`) exposes a filtered, denormalized view of the catalog for the PPS Pathfinder quiz and Blue Door Pathways recommendations — no Blue Door service key required, no direct DB coupling.

The PPS site now needs to:

1. Point the Pathfinder quiz at the Blue Door edge function.

2. Stop treating `path_finder_offerings` as the working register for canonical fields (name, blurb, description, marketing angle, content themes, pillar alignment, stoic alignment, ICP routing).

3. Keep routing/eligibility fields editable on the PPS side (URL, anchor_id, is_live, is_featured_in_quiz, sort_order) until the inverse sync exists.

4. Run a reconciliation pass against the canonical Blue Door catalog and auto-archive (never delete) un-matched legacy rows.

No PPS database changes are required to ship the quiz integration in step 1 — it is a pure front-end fetch.

---

## 2. What changed on the Blue Door side

### 2.1 New canonical schema

| Table | Role | Row count (today) |

|---|---|---|

| `topics` | Canonical narrative record (one per idea). Owns name, short_blurb, long_description, marketing_angle, content_themes, pillar_alignment, stoic_alignment, ICP routing, cascade_elements. | 57 |

| `deliveries` | Specific implementations (1 topic → N deliveries). Owns format, catalog_segment (B2B / B2C), audience_personas, pricing, URL, status, path_stage, surface eligibility, sort_order. | 142 |

| `offerings` (legacy) | Frozen flat catalog. No longer the source of truth; retained only for back-compat reads. | 67 |

Deterministic delivery key: `${topic.slug}--${delivery.format}--${delivery.catalog_segment}`.

### 2.2 Unified read view

`public.offerings_unified` joins topics + deliveries with the legacy fields the PPS site expects. RLS uses `security_invoker = true` so the public anon role only sees `is_live = true AND status = 'live'` rows.

### 2.3 Public edge function — `pathfinder-recommendations`

Deployed and live. **`verify_jwt = false`.** Reads from `offerings_unified` via the anon key (RLS applies).

**Endpoint:** `https://ycwitjvuhtkvtnbfvuhl.supabase.co/functions/v1/pathfinder-recommendations`

**Methods:** `GET` (query params) or `POST` (JSON body). Both accept identical filters.

**Filters (all optional, all combinable):**

| Param | Type | Allowed values |

|---|---|---|

| `persona` | string \| string[] | `b2c_individual`, `b2b_leader`, `b2b_exec`, `b2b_team`, `b2b_org` |

| `stage` | string \| string[] | `PREPARE`, `ALIGN`, `TAKE_OFF`, `HABITS` |

| `format` | string \| string[] | `assessment`, `course`, `free_resource`, `keynote`, `lab`, `masterclass`, `partnership`, `workshop` |

| `segment` | string \| string[] | `B2B`, `B2C` |

| `pillar` | string \| string[] | Pillar slugs (e.g. `cultural_cornerstone`) |

| `surface` | string | `quiz`, `pathways`, `any` (default `any`). `quiz` requires `quiz_recommendable = true`; `pathways` requires `pathways_recommendable = true`. |

| `liveOnly` | boolean | Default `true`. Restricts to `is_live = true AND status = 'live'`. |

| `limit` | integer | 1–200. |

CSV is accepted (`?persona=b2b_leader,b2b_exec`) and so are repeated params.

**Response shape:**

```json

{

  "count": 6,

  "results": [

    {

      "name": "...",

      "short_blurb": "...",

      "long_description": "...",

      "url": "...",

      "thumbnail_url": "...",

      "format": "masterclass",

      "catalog_segment": "B2C",

      "audience_personas": ["b2c_individual"],

      "path_stage": "PREPARE",

      "pricing": { /* JSONB */ },

      "marketing_angle": "...",

      "content_themes": [ /* string[] */ ],

      "pillar_alignment": [ /* slugs */ ],

      "is_live": true,

      "status": "live",

      "sort_order": 12

    }

  ]

}

```

**Error envelope:** `{ "error": <message | zod field errors> }` with HTTP `400` (validation) or `500` (server).

### 2.4 Admin surfaces on Blue Door

- `/admin/topics` — canonical topic editor (narrative, pillars, stoic, ICP routing, cascade elements, marketing angle, content themes).

- `/admin/topics/:id/deliveries` — per-delivery editor (format, persona, pricing, URL, sort, surface eligibility, status).

- `/admin/offerings` — legacy editor, retained read-only-ish for audit and back-compat.

- `/admin/catalog-validation` — flags missing URLs, persona gaps, pricing gaps, and topic/delivery coverage.

---

## 3. What the PPS site needs to do

### 3.1 Phase A — Wire the Pathfinder quiz (no DB changes)

This unblocks the quiz immediately. No schema work on PPS side.

**Mapping required on PPS:** translate each quiz outcome into one of the five personas above (and optionally a `stage` or `format` filter if the quiz surfaces preferred modality).

**Reference fetch (browser, no auth):**

```ts

const params = new URLSearchParams({

  persona: 'b2b_leader',     // from quiz outcome

  surface: 'quiz',           // restricts to quiz-eligible deliveries

  limit: '6',

});

const res = await fetch(

  `https://ycwitjvuhtkvtnbfvuhl.supabase.co/functions/v1/pathfinder-recommendations?${params}`

);

const { count, results } = await res.json();

```

Render `name`, `short_blurb`, `thumbnail_url`, and `url` for each result. `marketing_angle` is the recommended subhead. `pricing` is JSONB shaped per delivery; show only the segment-relevant fields.

**Acceptance:**

- Quiz no longer renders any offering that has `is_live = false` on the Blue Door side.

- Quiz URLs match Blue Door URLs (verified by spot-checking ≥10 deliveries across formats).

- No more hardcoded allowlists in PPS quiz code.

### 3.2 Phase B — Flip `path_finder_offerings` to mirror-only

After Phase A is in production, the PPS admin should stop editing canonical fields on `path_finder_offerings`. Recommended structural changes on PPS:

| Field group | Owner | PPS admin behavior |

|---|---|---|

| `name`, `short_blurb`, `long_description`, `marketing_angle`, `content_themes`, `pillar_alignment`, `stoic_alignment`, `icp_routing`, `cascade_elements`, `thumbnail_url` | **Blue Door (canonical)** | Read-only with "Edit in Blue Door" deep link. |

| `current_url`, `dedicated_url`, `anchor_id`, `is_live`, `is_featured_in_quiz`, `include_in_workshops`, `sort_order`, RT pool memberships, tier colors | **PPS (routing)** | Stays editable on PPS. |

| `pricing` | **Blue Door (canonical)** with PPS display overrides allowed | Read base price from Blue Door; PPS may override display only. |

### 3.3 Phase C — Reconciliation pass

Build a one-time import that maps PPS rows to Blue Door deliveries via `offering_key = ${topic.slug}--${delivery.format}--${delivery.catalog_segment}`. For any PPS row that does not match:

- **Auto-archive** (`is_live = false`). Never delete.

- Log to an audit table for human review.

Re-run after every Blue Door catalog change until the inverse sync (Phase D) is built.

### 3.4 Phase D — Inverse sync (later)

When PPS is ready to stop hand-editing routing fields, Blue Door will add the same routing fields under the `deliveries` row and the PPS admin will become fully read-only. Not needed for the quiz integration.

---

## 4. Persona mapping reference (Pathfinder → endpoint)

The Blue Door catalog uses these five personas; the PPS quiz must map every outcome into one of them. The list is closed — do not introduce new persona keys without a Blue Door schema change.

| Persona key | Who it represents |

|---|---|

| `b2c_individual` | Individual contributor / self-led learner buying for themselves. |

| `b2b_leader` | People-leader inside an org (manager → director). Default for most B2B quiz outcomes. |

| `b2b_exec` | C-suite / VP-level decision maker (budget authority, org-wide scope). |

| `b2b_team` | Intact team purchase (workshop, lab, or course for a defined unit). |

| `b2b_org` | Whole-organization engagement (assessment, partnership, multi-cohort). |

Stage values (`PREPARE`, `ALIGN`, `TAKE_OFF`, `HABITS`) are the four P.A.T.H. stages — pass through only if the quiz surfaces a stage signal; otherwise omit.

---

## 5. What is intentionally out of scope for this handoff

- **Inverse sync from PPS → Blue Door.** Phase D, deferred.

- **Webhook on Blue Door write.** Today the quiz fetches live every page render. Webhook + PPS cache is a later optimization.

- **Stripe / checkout integration.** Pricing is exposed for display only; checkout flows remain owned by PPS.

- **Auth on the edge function.** Endpoint is intentionally public (anon-keyed, RLS-gated, read-only).

---

## 6. Open decisions for the PPS team

1. Where does the quiz call live in the PPS codebase — a hook, a server route, or inline in the quiz component?

2. Caching: cache the response per persona for the session, or always fetch fresh?

3. Where should `marketing_angle` render — subhead, card body, or hover?

4. Display rule when `pricing` is missing for a delivery: hide price entirely, show "Inquire", or fall back to a tier label?

5. How should the PPS admin surface the "Edit in Blue Door" deep link — per row, or as a single banner once `path_finder_offerings` flips to mirror-only?

---

## 7. Reference

- **Edge function source:** `supabase/functions/pathfinder-recommendations/index.ts`

- **Unified view:** `public.offerings_unified` (Blue Door Supabase project `ycwitjvuhtkvtnbfvuhl`)

- **Topic / delivery schema:** Blue Door migrations `supabase/migrations/*topics*.sql` and `*deliveries*.sql`

- **Recommendation service (Blue Door internal):** `src/services/recommendationService.ts`

- **Cross-reference report:** `scripts/cross_reference_report.md`

- **OMR audit:** `scripts/omr_audit.md`

- **Companion PPS handoff:** "Offerings Management — Where We Stand" (June 27, 2026)

---

*End of Blue Door → PPS handoff — June 27, 2026*
