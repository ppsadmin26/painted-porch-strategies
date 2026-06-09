## Goal

Eliminate quiz-vs-page drift by making the AMPLIFY Workshops and AMPLIFY Labs pages, and the P.A.T.H.finder Quiz catalog, all read from one canonical registry. After this work, every quiz recommendation will resolve to a real card on the destination page, and any future workshop/lab is added in exactly one place.

## Scope (this pass)

In scope:
- `/partner/amplify/workshops` — all workshop cards
- `/partner/amplify/labs` — all lab cards
- P.A.T.H.finder Quiz B2B catalog entries that point to those two pages
- Deep-link anchors (e.g. `/partner/amplify/workshops#ai-ei-oh`) so quiz cards jump straight to the card

Out of scope (deliberately, to keep the change reviewable):
- IGNITE masterclasses / courses / assessments registries
- B2C offering pages (Radical Mindfulness, Master Your Message, etc.)
- Visual redesign of the cards themselves

## The Registry

New file: `src/data/amplifyOfferings.ts`

```ts
export interface AmplifyOffering {
  slug: string;                  // url-safe id, also the anchor (#slug)
  kind: "workshop" | "lab";
  title: string;
  facilitator: "Amy" | "Rob" | "Sierra" | "Painted Porch Team";
  category: string;              // e.g. "Change Leadership", "Communication", "Team Health"
  shortBlurb: string;            // 1 line, used by quiz + card
  longDescription: string;       // card body
  learnings?: string[];
  outcomes?: string[];
  pillar?: "Foundational" | "Operational" | "Human";
  featured?: boolean;            // appears in the top "signature" row
  status?: "live" | "waitlist";
}
```

One exported `AMPLIFY_OFFERINGS: AmplifyOffering[]` array, ordered for page display. Helpers:

- `getWorkshops()` / `getLabs()` — page consumers
- `getOfferingBySlug(slug)` — quiz consumers
- `getOfferingsByFacilitator(name)` — speaker pages later

## Page changes

**`AmplifyWorkshops.tsx`** — replace the hard-coded workshop arrays with `getWorkshops()`. Group by `category`. Keep the existing card visual layout. Each card gets `id={slug}` so anchor scroll works.

**`AmplifyLabs.tsx`** — same pattern with `getLabs()`.

Existing scroll-to-hash logic in `PPSLayout` already handles `#anchor` deep-linking, so no router changes.

## Quiz changes (`src/data/pathFinderQuiz.ts`)

- Remove the duplicated workshop/lab entries from `OFFERINGS` for anything that belongs to AMPLIFY.
- Replace them with thin proxies generated from the registry:
  ```ts
  ...buildOfferingsFromRegistry(AMPLIFY_OFFERINGS)
  ```
  Each becomes `{ key: slug, name: title, blurb: shortBlurb, url: '/partner/amplify/{workshops|labs}#{slug}', tier: 'Pathway B'|'AMPLIFY' }`.
- Quiz recommendation logic keeps using the same keys; we just rename a handful to match new slugs and remove the ones that referenced nonexistent offerings.

## Filling in the missing offerings

For the audit gap, the user gets to decide per offering: add a real card to the registry, or remove the quiz reference. I will produce one short follow-up question with the gap list grouped (clear adds vs. likely-drop) before writing any card copy. I will NOT invent long-form descriptions without that confirmation.

Minimum two new cards confirmed already:
- **AI, EI, Oh** (workshop) — registry + card
- **AI, EI, Oh! Lab** — registry + card

## Validation

After the refactor I will:
1. Run a CI-style audit script (the one used above) and confirm zero `MISSING` rows for the two AMPLIFY pages.
2. Visually inspect `/partner/amplify/workshops#ai-ei-oh` and `/partner/amplify/labs#ai-ei-oh` in the preview to confirm anchor scrolls land on the right cards.
3. Take the quiz with the same answers the user used last time and confirm every recommended card opens to a real card.

## Technical notes (skip if non-technical)

- Registry lives in `src/data/` (matches existing conventions).
- No DB migration needed — pure code refactor.
- Slugs are stable; once chosen they cannot change without breaking saved quiz-result links.
- Card visuals on the pages stay byte-identical for offerings that already exist; only the data source changes.

## Deliverables order

1. Confirm gap-resolution choices (1 quick question with grouped list).
2. Build `amplifyOfferings.ts` registry with all current cards + AI, EI, Oh additions.
3. Refactor `AmplifyWorkshops.tsx` and `AmplifyLabs.tsx` to consume the registry.
4. Refactor `pathFinderQuiz.ts` to consume the registry; remove dead entries.
5. Run audit script, walk the preview, report results.
