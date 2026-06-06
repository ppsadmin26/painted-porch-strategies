---
name: Master Offerings Register Cross-Project Contract
description: Sketch for sharing the Blue Door Master Offerings Register with the PPS website as a single source of truth across two Lovable projects
type: feature
---
Canonical home: Blue Door Supabase, table `public.offerings` (slug, name, category, tier, pillar[], price_usd, price_display, price_note, prerequisites[], cta, status, updated_at, plus internal-only `internal_notes` & `cost_basis_usd`). Existing Master Offerings Register admin UI in Blue Door is the editor.

Exposure: public Blue Door edge function `GET /offerings` (and `/offerings/{slug}`), `verify_jwt = false`, query params for category/tier/pillar/status, `consumer` param drives server-side field whitelist (strips internal fields). Returns versioned JSON with ETag + `Cache-Control: public, max-age=300, s-maxage=900, stale-while-revalidate=3600`. Cache-bust via "Publish to Website" button bumping global `offerings_version` row.

PPS consumer: `src/lib/offerings.ts` fetches with `consumer=pps-website`. Build-time snapshot to `src/data/offerings.fallback.json` so PPS never fails if Blue Door is down. Replaces hardcoded data on IGNITE/AMPLIFY/EMBODY pages, /business-programs, /programs, and ultimately `BLUE_DOOR_PRICE_DISPLAY`.

Status: design only — implement post-website-launch. Pilot cutover should be /business-programs (high value, low risk). Do NOT merge Blue Door into PPS repo; keep website lean for sales/education while Blue Door owns product delivery & client portal.
