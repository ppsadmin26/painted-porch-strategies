## Goal

Continue the color-contrast audit on `src/pages/pps/PPSHome.tsx`. After the recent reorder, the lower half of the page has three white sections sitting back-to-back-to-back, so the Pillars, the nested P.A.T.H. Way Forward block, and the Discover P.A.T.H.way cards all blend into one undifferentiated white expanse.

## Current background rhythm (top → bottom)

```text
Hero                        dark video
"Lot of shIFt happening"    white
Research stats              navy
How We Meet You             muted
Phase Zero CTA              dark gradient
3AM Questions               navy            ← updated last turn
Blue Door                   muted
Pillars                     white  ┐
  └ P.A.T.H. Way Forward    white  │  three whites in a row
Discover Your P.A.T.H.way   white  ┘
Partnership Promise         navy
Insights                    white
Final CTA                   parallax dark
```

The two collisions:
1. The P.A.T.H. "Way Forward" subsection is nested inside the Pillars `<section className="bg-white">`, so the pillar cards and the road/steps read as one long white block with no breathing point.
2. "Discover Your P.A.T.H.way" is also `bg-white`, butting straight up against the white Pillars section above it.

## Proposed changes

Restore alternation so every adjacent pair of sections contrasts. New rhythm:

```text
Blue Door                   muted
Pillars                     white
P.A.T.H. Way Forward        muted   ← new standalone section
Discover Your P.A.T.H.way   muted-tinted OR keep white if Way Forward is muted
Partnership Promise         navy
```

### Change 1 — Lift "The Way Forward" out of the Pillars section

In `PPSHome.tsx` (~lines 458–587):
- Close the Pillars `<section className="bg-white">` right after the three pillar cards grid ends (~line 492).
- Promote the nested `<section id="the-way-forward">` to a top-level sibling section with `className="py-16 md:py-24 bg-muted"` so it sits in its own light-gray band between the white Pillars and the next section.
- Keep all internal markup of the Way Forward block (eyebrow, heading, intro copy, SVG roads, P.A.T.H. step `<ol>`) unchanged. The white P.A.T.H. step cards (`bg-white shadow-sm`) will now read clearly against the muted backdrop, which actually strengthens the road metaphor.

### Change 2 — Differentiate "Discover Your P.A.T.H.way"

With the Way Forward block now muted, the Discover section (~line 592) can stay `bg-white` and the rhythm becomes muted → white → muted → white → navy. This is the cleanest fix and requires no change to the Discover section itself.

If we'd rather keep Discover muted (matching its inner `bg-muted` cards looks heavy), we'd instead recolor its inner cards. Default recommendation: leave Discover as `bg-white`.

### Change 3 — No other sections need recoloring

The rest of the page (Hero, ShIFt-happening white, navy stats, muted How-We-Meet-You, dark Phase Zero CTA, navy 3AM, muted Blue Door, navy Partnership, white Insights, dark Final CTA) already alternates correctly. No edits needed there.

## Files touched

- `src/pages/pps/PPSHome.tsx` — restructure lines ~458–587 to split the Pillars `<section>` and the Way Forward `<section>` into two sibling sections with `bg-white` and `bg-muted` respectively.

## Out of scope

- No copy changes.
- No token, typography, or component changes.
- No edits to ParallaxCTA, Partnership Promise, or any section above the Blue Door.
