## Goal
Make the Final CTA section on `/phase-zero` and `/about/approach` (Our Approach) visually echo the Blue Door hero — same blue-door imagery and navy treatment — so the "Open the Blue Door" CTA feels like a direct continuation of that page.

## Changes

### 1. `src/pages/pps/PhaseZero.tsx`
- Swap the Final CTA `backgroundImage` from `homeHero` to the Blue Door hero asset (`@/assets/blue-door-hero.jpg`, same file the Blue Door page uses).
- Set `overlayTone="navy"` so the dark navy gradient matches the Blue Door hero's `navy/85 → navy/70` wash (instead of the current teal default).
- Remove the now-unused `homeHero` import if no other section references it.

### 2. `src/pages/pps/about/OurApproach.tsx`
- Same swap: change `backgroundImage` from `approachHero` to the Blue Door hero asset.
- Add `overlayTone="navy"` for the matching dark navy treatment.
- Leave `approachHero` import in place only if still used elsewhere on the page; otherwise remove.

### Not changing
- Copy, headlines, eyebrows, CTA buttons, ordering, or the `PartnershipPromise` block on Our Approach.
- The Blue Door hero itself.
- The `ParallaxCTA` component (it already supports `overlayTone="navy"`).

### Verification
- View `/phase-zero` and `/about/approach` in the preview, confirm the Final CTA shows the blue door image with a navy overlay, white headline/description remain AA-legible, and the cobalt "Open the Blue Door" + secondary outline buttons render unchanged.
