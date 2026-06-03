## Goal

When a page is set to Draft in `/admin/pages` (or via the inline switch on `/sitemap`), it should disappear from navigation and any internal links to it should become non-clickable with a "Coming Soon" treatment — instead of relying solely on `PageGate` to redirect visitors *after* they click.

Admins (logged-in users with admin role) continue to see and use draft links normally so they can preview.

## Approach

Build a small, shared layer on top of the existing `usePageStatuses` hook + `resolvePageStatus` resolver, then apply it in three places.

### 1. New hook: `useIsPageLive(path)`

`src/hooks/useIsPageLive.ts`
- Wraps `usePageStatuses` + `resolvePageStatus`.
- Returns `{ isLive, isDraft, isAdmin, loading }`.
- `isAdmin` comes from the existing auth/profile context so admins always get `isLive: true` (preview behavior).
- Also expose a batch variant `useArePagesLive(paths[])` to avoid repeated work in nav menus.

### 2. New shared component: `<SmartLink>` / `<SmartCTA>`

`src/components/pps/SmartLink.tsx`
- Props: same as `Link` plus optional `comingSoonLabel` (default "Coming Soon") and `variant` (`"link" | "button" | "card"`).
- Resolves the `to`/`href` against `useIsPageLive`.
- If live (or viewer is admin): renders a normal `<Link>` / `<Button asChild>`.
- If draft:
  - `variant="link"`: render plain `<span>` styled muted, no navigation, with a small "Coming Soon" badge.
  - `variant="button"`: render disabled `<Button>` with label replaced by "Coming Soon" (or appended badge).
  - `variant="card"`: render the card as non-interactive (no `<Link>` wrapper, `cursor-default`, reduced opacity), overlay a "Coming Soon" ribbon/badge in the top-right using the gold token.
- Tooltip on hover: "This page isn't published yet."

### 3. Apply in three layers

**a. Navigation (`src/components/pps/PPSNavigation.tsx`)**
- Filter out top-level items and sub-links whose path resolves to draft (for non-admins).
- If a dropdown becomes empty after filtering, hide the dropdown entirely.
- Admins see everything with a small "Draft" pill.

**b. Footer (`src/components/pps/PPSFooter.tsx`)**
- Same filter logic for link columns.

**c. In-page cards & CTAs**
- Replace `<Link>` / `<Button asChild><Link>` usages that point to gated internal routes with `<SmartLink variant="...">` on the high-traffic hubs first:
  - Home (`src/pages/pps/Index.tsx`) hero/secondary CTAs
  - P.A.T.H. Hub, Partner Hub, Resources Hub, Speaking Hub card grids
  - `ParallaxCTA` component (so every final-CTA section inherits the behavior)
- Leave shared "always-live" routes (`/contact`, `/sitemap`, `/admin/*`, `/blue-door`) alone — they're already in `ALWAYS_LIVE_PREFIXES` and will always resolve to live.

### 4. Admin affordance

- On `/sitemap` and `/admin/pages`, when admin toggles a page to Draft, show a small inline hint: "Hidden from nav and shown as 'Coming Soon' on cards/CTAs for visitors."

### 5. Tests

Extend `src/test/privacy-cookies-routing.test.ts` (or a new file) with:
- `resolvePageStatus` returns `draft` → `SmartLink` renders disabled "Coming Soon".
- `resolvePageStatus` returns `live` → `SmartLink` renders a normal anchor.
- Nav filter helper removes draft paths for non-admin viewers and keeps them for admins.

## Files touched

- New: `src/hooks/useIsPageLive.ts`, `src/components/pps/SmartLink.tsx`, test file
- Edited: `PPSNavigation.tsx`, `PPSFooter.tsx`, `ParallaxCTA.tsx`, hub pages (Index, P.A.T.H., Partner, Resources, Speaking), `Sitemap.tsx` + `PageStatusManager.tsx` (admin hint copy)

## Open question

Do you want the "Coming Soon" badge to also block **external** mentions (e.g. text-only references in body copy that aren't links)? My plan covers links/cards/CTAs only — body prose stays untouched unless you'd like a follow-up sweep.
