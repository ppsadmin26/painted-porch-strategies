## What changes

Update the "The clarity that accelerates your next big ShIFt" Phase Zero CTA section on `src/pages/pps/PPSHome.tsx` (the section currently styled `bg-gradient-strategic text-white`) to use a brand-aligned background image evoking clarity and readiness, with a heavy purple/navy overlay so the current look is preserved and text contrast is maintained.

## Steps

1. **Generate background image** (`imagegen` standard tier, 1920x1024):
   - Abstract light & geometry: soft luminous gradient washes in deep purple/navy with subtle geometric line work (thin gold/light scaffolding lines, faint architectural grid, gentle light bloom from one side).
   - Brand palette: Strategic Purple (#523387), Navy (#00006B), a whisper of Gold (#E8A231) for warmth.
   - Save to `src/assets/phase-zero-clarity-bg.jpg`.

2. **Wire it into the section** in `src/pages/pps/PPSHome.tsx`:
   - Import the image.
   - Replace the flat `bg-gradient-strategic` section with a `relative` section that has the image as an absolutely-positioned background (`bg-cover bg-center`).
   - Layer a heavy overlay on top: `bg-gradient-strategic` at `~88–92%` opacity (so the image reads as a subtle texture rather than a focal photo).
   - Keep all text content, the gold pill badge, headline, paragraphs, and the gold "Explore Phase Zero" CTA exactly as-is, wrapped in a `relative z-10` container.

3. **Verify**: read the file back, confirm text contrast still passes against the dark overlay, and confirm no layout shifts.

## Technical details

- Section currently at `src/pages/pps/PPSHome.tsx` around lines 328–352.
- Pattern mirrors `TierHeroSection` background image usage already in the codebase (image + overlay), keeping it consistent.
- No new route, no nav change, no copy change.
- Image stays as a local `src/assets/*.jpg` import (standard for hero/section backgrounds in this project).

## Out of scope

- No changes to other sections of the home page.
- No copy edits.
- No changes to the `/phase-zero` page itself (user specified home page).