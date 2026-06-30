---
name: Blue Door Recommendations Endpoint
description: Public Blue Door edge function that owns canonical offerings; PPS Pathfinder quiz must consume it via the typed client in src/integrations/bluedoor. Closed persona set.
type: feature
---

# Endpoint

`https://ycwitjvuhtkvtnbfvuhl.supabase.co/functions/v1/pathfinder-recommendations`

Public, anon-keyed, RLS-gated, read-only. No auth header required. GET (query params) or POST (JSON body); both accept identical filters.

# Client (PPS side)

- `src/integrations/bluedoor/recommendations.ts` — `fetchBlueDoorRecommendations(filters)` + `buildBlueDoorRecsUrl(filters)` + types.
- `src/integrations/bluedoor/personaMap.ts` — `resolveBlueDoorPersona({ resultType, scoutMode, scope })`. Use this for every quiz → endpoint call.
- Tests: `src/integrations/bluedoor/__tests__/recommendations.test.ts`.

Never hand-build the URL; never hardcode the endpoint in components.

# Persona contract (closed set, do NOT extend client-side)

`b2c_individual` · `b2b_leader` (default for B2B) · `b2b_exec` · `b2b_team` · `b2b_org`.

Scout Mode (B2B individual exploring labs) maps to `b2c_individual` — matches the existing Scout reroute.

# Field ownership after Phase A wiring

- **PPS Op Platform (canonical, read-only on PPS):** name, short_blurb, long_description, marketing_angle, content_themes, pillar_alignment, stoic_alignment, icp_routing, cascade_elements, thumbnail_url, pricing, **tier, topic tag, facilitator, `include_in_workshops` (Workshop chip), `is_keynote` (Keynote chip)**.
- **PPS (routing, still editable):** current_url, dedicated_url, anchor_id, is_live, is_featured_in_quiz, include_on_speaker_page, launch_slug, sort_order, RT pool memberships (b2c + b2b), tier colors.

# Reference

`docs/handoff/BlueDoor-to-PPS-Offerings-Handoff-v1.md` is the authoritative spec.
