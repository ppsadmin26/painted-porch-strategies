---
name: Quiz Viewable Recommendation Rule
description: P.A.T.H.finder may only recommend offerings that have a real, visible link/card/anchor on a public page. Anything broader is filtered out; the catch-all message tells the user more options exist via Contact Us.
type: feature
---

## Rule
Every offering surfaced by the P.A.T.H.finder quiz (B2B or B2C) MUST resolve to something the user can actually see and click into on a public page — a card, accordion item, hub link, anchor, or dedicated route. If it isn't viewable, the quiz cannot recommend it.

## B2B implementation (src/data/pathFinderQuiz.ts)
`b2bResult` filters `primaryKeys` through `VIEWABLE_B2B_KEYS` (hard-coded Set in the function). The current allowlist is:

- `/partner/amplify/workshops` Phase Zero cards: `architectChange`, `architectureOfAdaptability`, `pathToLastingChange`, `cultivatingChangeResilience`, `leadershipOM`
- `/partner/amplify/workshops` Leadership & Team Development cards: `masterYourMessageB2B`, `radicalMindfulnessB2B`, `stoicismB2B`
- Dedicated pages: `stracticalLeader` (`/partner/amplify/stractical-leader`), `kickTheHabit` (`/resources/kick-the-habit`), `blueDoor` (`/blue-door`)

Fallback if filter empties: `[architectureOfAdaptability, pathToLastingChange, architectChange]` so results never go blank.

## Page-side requirement
Each viewable workshop card on `/partner/amplify/workshops` carries an explicit `id={offering_key}` (not a slugified title) and `scroll-mt-24` so the anchor link scrolls to the exact card. DB `path_finder_offerings.anchor_id` must equal the `offering_key` for these so `usePathFinderOverrides` resolves `current_url#anchor_id` correctly.

## When adding/removing a workshop from a page
1. Add (or remove) the offering key in `VIEWABLE_B2B_KEYS`.
2. If adding: also add the card with `id={offering_key}` and ensure DB row has matching `anchor_id`.
3. The catch-all message at the bottom of `/partner/amplify/workshops` tells the user other topics exist via Contact Us — never push the catalog back into the quiz output.

## Why
Recommending an offering with no on-page destination breaks user trust and creates dead-end clicks. The quiz purposefully narrows to a curated set; broader exploration happens through the Contact Us conversation.
