## Goal

Enforce the memory rule across every live page: any CTA pointing to `/blue-door` must be cobalt (`bluedoor` token). Solid cobalt as primary, cobalt outline as secondary. Never gold, teal/primary, navy, or generic outline.

## Standard classes (already used elsewhere)

- **Primary (solid):** `bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor`
- **Secondary (outline on light bg):** `bg-transparent border-2 border-bluedoor text-bluedoor hover:bg-bluedoor hover:text-white`
- **In `<ParallaxCTA>`:** `variant: "bluedoor"`
- **In `<TierHeroSection>`:** pass `buttonClassName` with the primary classes above (not `isPrimary: true`, which renders gold)

## Live violations to fix

1. **`src/pages/pps/StartHere.tsx`** line 46 — TierHero CTA "Take the P.A.T.H.finder Quiz" currently `isPrimary: true` to `/blue-door`. Replace with `buttonClassName` cobalt primary.
2. **`src/pages/pps/PhaseZero.tsx`** line 178 — TierHero CTA "Open the Blue Door" `isPrimary: true`. Replace with `buttonClassName` cobalt primary.
3. **`src/pages/pps/PPSForTeams.tsx`** line 116 — TierHero CTA to `/blue-door` `isPrimary: true`. Replace with `buttonClassName` cobalt primary.
4. **`src/pages/pps/PPSForTeams.tsx`** lines 308–310 — in-page Button `bg-primary…` to `/blue-door`. Swap to cobalt primary classes.
5. **`src/pages/pps/PPSForLeaders.tsx`** lines 289–291 — Button `bg-primary…` to `/blue-door`. Swap to cobalt primary classes.
6. **`src/pages/pps/partner/IgnitePathAlt.tsx`** lines 459–460 — Button `bg-primary…` to `/blue-door`. Swap to cobalt primary classes.
7. **`src/pages/pps/partner/AmplifyPathAlt.tsx`** lines 447–450 — secondary Button to `/blue-door` using generic `variant="outline"`. Swap to cobalt outline classes.
8. **`src/pages/pps/partner/amplify/AmplifyWorkshops.tsx`** lines 270–271 — Button `border-primary text-primary…` to `/blue-door`. Swap to cobalt outline classes.
9. **`src/pages/pps/partner/amplify/AmplifySprints.tsx`** lines 217–218 — Button `border-primary text-primary…` to `/blue-door`. Swap to cobalt outline classes.

## Out of scope

- Archive files (`*Archive.tsx`, `_archive-v1.0/**`, `HeroPreview*`).
- `PPSHomeVerbatim.tsx` (Draft / deprecated).
- `PPSHomeAlt.tsx` (alternate, not in live nav).
- `HowToChooseSection.tsx`, `ParallaxCTA.tsx`, `HeroSectionAlt.tsx`, `PPSHome.tsx` — already cobalt-compliant.
- Decorative uses of `text-bluedoor` / `bg-bluedoor/10` for icons, pills, accents — already correct, no change needed.

## Verification

After edits, run:
```
rg -n -B1 -A2 '"/blue-door"' src -g '*.tsx' | rg -B2 "bg-(primary|gold|navy|teal|raspberry|lime)|isPrimary: true|variant=\"outline\"|border-primary"
```
should return zero hits outside of archive paths.
