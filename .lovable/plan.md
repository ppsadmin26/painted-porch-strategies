## Goal

Restore an editorial section between the hero and "The work before the work" on `/phase-zero`, with copy that does NOT duplicate the home page hero or home's Phase Zero band.

## Why the previous draft failed

`PPSHome.tsx` already carries:
- "You aren't short on vision, resolve, or experience. What's harder to find is clarity..." (hero, lines 107-108)
- "The clarity that accelerates your next big shIFt" (line 300)
- "Phase Zero exists to create clarity before your next major decision hardens into execution... the threshold work that helps your organization see itself clearly" (lines 300-309)

So clarity/threshold/"see itself clearly" framing is taken. We need a different angle.

## The fresh angle: the cost of skipping Phase Zero

The verbatim has copy that home did NOT absorb (lines 342-351): the idea that **not every opportunity strengthens the organization pursuing it**, and that organizations become exhausted not from lack of effort but from the **accumulated weight of unfinished work, competing priorities, and fragmented initiatives**. That is unique territory and is the natural bridge between the hero and "the work before the work."

## Where

`src/pages/pps/PhaseZero.tsx`, inserted between `TierHeroSection` and the existing "The work before the work" section.

## New section: "Why Phase Zero Exists"

Single-column editorial. `bg-muted/40`, `max-w-3xl`, FadeIn wrapper. Cadence matches the existing sections.

- **Eyebrow** (raspberry, uppercase, tracking-[0.2em]): `Why Phase Zero Exists`
- **H2** (navy, font-poppins, font-bold): `Not every opportunity strengthens the organization chasing it.`
- **Body p1**: "And not every change creates the conditions needed to sustain what comes after it."
- **Body p2**: "Some organizations get worn down not from a lack of effort, but from the weight that builds up underneath it. Unfinished work. Competing priorities. Fragmented initiatives. Directions that never fully aligned in the first place."
- **Body p3** (with raspberry bold): "Pushing harder in the wrong direction does not change the direction. It just **compounds the cost of getting there**."
- **Body p4**: "Phase Zero is the pause that prevents that cost. A deliberate stop, before the next big <ShIFt /> hardens into execution, to look honestly at what your organization can carry and what it cannot."
- **Pull-quote** (gold left-border, navy italic, mt-10): `"The frustration that surfaces in moments like this is rarely random. It is a signal."`

## Constraints honored

- No em-dashes. Replace verbatim's `&ndash;` with periods/colons.
- 6th-grade plain English.
- `™` already lives on this page's hero; this section uses plain "Phase Zero."
- `<ShIFt />` component for the brand word.
- Semantic tokens only (`text-navy`, `text-gold`, `text-raspberry`, `bg-muted`, `border-gold`).
- No new components, no schema changes, no route changes, no CTA inside the section.

## Out of scope

Home, verbatim, EMBODY, Approach, About, page_status, sitemap. Only `PhaseZero.tsx` changes.
