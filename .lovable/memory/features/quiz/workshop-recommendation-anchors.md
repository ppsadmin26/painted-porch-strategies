---
name: Quiz Workshop Recommendation Anchors
description: Every workshop offering surfaced by the P.A.T.H.finder quiz must resolve to a real, scrollable spot on /partner/amplify/workshops. The page's featured cards cover spotlight topics; the AllWorkshopTopics accordion lists every remaining workshop in path_finder_offerings with id={anchor_id || offering_key} and auto-opens on hash match. When adding a new workshop offering, set anchor_id (defaults to offering_key) and ensure either a featured card on AmplifyWorkshops.tsx carries that id OR rely on the accordion to host it automatically.
type: feature
---
- Quiz cards link via usePathFinderOverrides: `<current_url|dedicated_url>#<anchor_id>`.
- For workshops, current_url is `/partner/amplify/workshops` and anchor_id defaults to `offering_key`.
- AllWorkshopTopics (`src/components/pps/partner/AllWorkshopTopics.tsx`) fetches every live workshop row, renders an Accordion item per row with `id={anchor_id||offering_key}`, and opens + scrolls to the matching item when the URL hash changes.
- Featured cards on AmplifyWorkshops.tsx may override the landing target by using the same id string as the row's anchor_id (e.g. `architect-change`, `pillars-reinforcement`, `stoicism`).
- Never leave a quiz workshop offering pointing at the bare workshops page with no anchor. Run: `UPDATE path_finder_offerings SET anchor_id = offering_key WHERE anchor_id IS NULL AND current_url = '/partner/amplify/workshops';`
