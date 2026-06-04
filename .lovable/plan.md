## Goal

Add a looping equalizer animation along the bottom of the Master Your Message hero (`/communication`) that mimics a classic broadcast/studio sound meter — dense, segmented LED-style bars with a green → yellow → orange → red vertical gradient, like the reference images.

## What you'll see

- Hero image and headline stay exactly as they are.
- A horizontal row of ~40–60 thin, segmented vertical bars sits flush along the bottom edge of the hero, behind the dark gradient.
- Each bar is made of small stacked rectangles ("LED segments") that light up from bottom to top.
- Segment colors run green at the bottom, yellow in the middle, orange/red at the top — matching the reference equalizer image.
- Bars rise and fall independently in a smooth, looping pattern (no audio input — purely visual choreography).
- Unlit segments stay dim (low-opacity charcoal) so the meter shape is always visible, like a real VU meter.
- Soft fade on the left edge so the headline stays fully legible; soft fade on the right edge for polish.
- `prefers-reduced-motion`: bars freeze at mid-level instead of animating.

## Implementation

- New component: `src/components/pps/SoundMeter.tsx`
  - Props: `barCount` (default 56), `className`.
  - Renders a flex row of bars; each bar is a stack of ~16 segment divs.
  - A single CSS keyframe drives bar height; per-bar `animation-delay` and `animation-duration` (varied via deterministic pseudo-random offsets) create the choreographed rise/fall.
  - Segments use a 4-stop color map: green (#70A300 lime), yellow (#FFB900), orange (#FF8000), raspberry (#DB0043). Lit/unlit state is controlled by a CSS variable `--lit-count` set per-bar by the keyframe.
- Wire into hero in `src/pages/pps/programs/MasterYourMessage.tsx`:
  - Insert `<SoundMeter className="absolute inset-x-0 bottom-0 z-[1] opacity-70 mix-blend-screen" />` between the `<img>` and the dark gradient overlay.
  - Keep existing `from-black/70 via-black/50 to-transparent` gradient so the headline retains contrast.
- No new dependencies. Pure CSS keyframes + Tailwind.

## Out of scope

- No changes to the hero image, headline, badge, or CTA button.
- No audio.
- No edits elsewhere on the page (pricing, FAQ, CTA stay as-is).
