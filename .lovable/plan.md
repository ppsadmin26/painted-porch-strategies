## New Home Page + Top Navigation Restructure

Two coordinated changes shipped together: cinematic editorial home page (from `Homepage.md`) and a restructured top navigation (from `Revised_Sitemap.md`). Strictly inside the existing PPS brand system (light-only, Poppins/Montserrat, no new tokens).

---

### Part A — New Home Page

**Archive current**
- Rename `src/pages/pps/PPSHome.tsx` → `PPSHomeArchive.tsx`. New `PPSHome.tsx` becomes `/`, **Live**.
- Add `/home-archive` route (Draft, admin-only) + `page_status` row + Sitemap entry.

**Hero — Cinematic full-bleed with opaque image (v3 selected)**
- Reuse the existing `src/assets/heroes/home-hero.jpg` so the visual character matches today's homepage.
- Treatment: full-bleed image + heavy opacity overlay so the photo reads as muted texture, not a literal scene. Layered:
  - Navy `#00006B/85` left-to-right gradient (matches current `bg-navy/50` density but pushed darker for editorial mood).
  - Cream `#FDFBF7/30` warm bottom wash for porch-light glow.
  - Thin gold `#E8A231` hairline above eyebrow + lime/teal accent strip bottom-right.
- Content: eyebrow "PHASE ZERO™ : THE WORK BEFORE THE WORK", H1 "It's Time to Do Epic Sh**IF**t" (raspberry IF), supporting paragraph, two CTAs ("Open the Blue Door" cobalt → `/blue-door`, "Discover Your P.A.T.H.way" gold → `/start-here`).
- Min-height ~85vh. Subtle slow `animate-fade-in` on copy.

**Aesthetic for the rest of the page** — Tonal cream/sand/navy bands, soft radial brand-hue washes, Poppins display 56–96px, italic pull-quotes, fade-up via `useScrollAnimation`. Pillars carry teal/lime/raspberry left-rules.

**Trademark on this page** — Phase Zero™ only (first hero mention + final CTA). Strip ™ from Blue Door, P.A.T.H., Painted Porch Pillars, Fortified Porch within page copy.

**11 sections (verbatim from Homepage.md)**
```
Hero (cinematic, opaque image) · Shift Happening · Phase Zero · Blue Door
P.A.T.H.ways · Foundation · Partnership · Insights (useFeaturedPosts(3))
ClientLogoMarquee · Final Exhale (ParallaxCTA → /blue-door)
```

CTA routing: "Exploring for Yourself" → `/start-here` · "for Your Team" → `/blue-door`.

---

### Part B — Top Navigation Restructure

New top-level order (`src/components/pps/PPSNavigation.tsx`):

```
HOME           /
PHASE ZERO     /phase-zero        (NEW · Draft)
THE BLUE DOOR  /blue-door
P.A.T.H.ways   /partner           (label change only)
  ├─ Ignite ShIFt    /partner/ignite
  ├─ Amplify ShIFt   /partner/amplify
  └─ Embody ShIFt    /partner/embody
INSIGHTS       /resources         (directional hub: ResourcesHub)
  ├─ Insights        /resources/insights
  ├─ YouTube         /resources/youtube
  ├─ Media           /speaking/media
  ├─ Free Resources  /resources/free
  └─ FAQ             /resources/faq
SPEAKING       /speaking
  ├─ Amy             /speaking/amy
  ├─ Rob             /speaking/rob
  ├─ Sierra          /speaking/sierra
  └─ As Seen On      /speaking/media
ABOUT          /about
  ├─ Our Approach    /about/approach
  └─ Our Impact      /about/impact

Persistent CTA: "Discover Your P.A.T.H.way" → /start-here   (unchanged)
```

- **No ™ in nav labels** — both PHASE ZERO and THE BLUE DOOR appear plain (™ stays on the destination pages).
- Removed from nav: `/for-leaders`, `/for-teams`, `/services`, `/business-programs`, `/programs`, standalone `/start-here` link (CTA covers it), top-level `/speaking/media` (now nested).
- Mobile menu mirrors the same structure (existing accordion pattern).

---

### Part C — New /phase-zero page (Draft)

- New `src/pages/pps/PhaseZero.tsx` — philosophical framing scaffold using manifesto-style copy from `Homepage.md` §3 + Brand Bible. Hero + 3 editorial sections + ParallaxCTA → `/blue-door`. The single ™ on this page is Phase Zero™.
- Route added in `App.tsx`. Listed in Sitemap. Migration inserts `page_status = 'draft'`.
- Copy is a starting scaffold; user refines after launch.

---

### Part D — Legacy redirects (SEO preservation)

Add a `<LegacyRedirects />` route group in `App.tsx` using react-router `<Navigate replace>` (Lovable SPA hosting has no server-side 301s; this is the equivalent on the client):

```
/for-leaders        → /start-here
/for-teams          → /blue-door
/services           → /partner
/business-programs  → /partner
/programs           → /partner/ignite
```

Page components remain in the repo for now; routing simply replaces them with redirects. Sitemap entries removed; `page_status` rows deleted.

---

### Files

**Created**
- `src/pages/pps/PPSHome.tsx` (composition)
- `src/pages/pps/PhaseZero.tsx`
- `src/components/pps/home/{Hero,ShiftHappening,PhaseZero,BlueDoor,Pathway,Foundation,Partnership,Insights,FinalExhale}Section.tsx` (9 files)

**Renamed**
- `PPSHome.tsx` → `PPSHomeArchive.tsx`

**Edited**
- `src/components/pps/PPSNavigation.tsx` — full nav rewrite (desktop + mobile)
- `src/App.tsx` — new routes (`/phase-zero`, `/home-archive`), 5 legacy `<Navigate>` redirects, route removals
- `src/pages/pps/Sitemap.tsx` — add new, remove legacy
- New migration — insert `page_status` for `/phase-zero` (draft), `/home-archive` (draft); delete rows for the 5 legacy routes

**Reused** — `home-hero.jpg`, `ClientLogoMarquee`, `ParallaxCTA`, `useFeaturedPosts`, `useScrollAnimation`, `useDocumentSeo`

### QA
- `npm run brand:validate` — confirm ≤2 ™ on home, 0 ™ in nav.
- Click every nav item including dropdowns on desktop + mobile.
- Hit each legacy URL, confirm redirect lands on intended page.
- `/phase-zero` while logged out → PageGate "coming soon"; while admin → renders.
