## Goal
Make the Final CTA overlay on `/phase-zero` and `/about/approach` noticeably lighter so the blue door image shows through more and the section separates cleanly from the navy footer.

## Current State
Both pages use `overlayTone="navy"`, which renders:
```
bg-gradient-to-b from-navy/90 via-navy/85 to-navy/85
```

## Proposed Change
Switch both Final `<ParallaxCTA>` components to a custom `overlayClass`:
```
bg-gradient-to-b from-navy/55 via-navy/35 to-navy/20
```

This drops the top from 90% to 55%, middle from 85% to 35%, and bottom from 85% to 20% — letting the door image breathe while keeping text readable via the component's built-in `drop-shadow` on headline and description.

## Files
- `src/pages/pps/PhaseZero.tsx` — Final CTA
- `src/pages/pps/about/OurApproach.tsx` — Final CTA

Both will change from `overlayTone="navy"` to the lighter `overlayClass` above.