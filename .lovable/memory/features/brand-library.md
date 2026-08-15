---
name: Brand Library Page
description: Internal-only /brand-library page with logos, colors, typography, imagery, voice/tone and terminology rules; Draft + internal category, noindex
type: feature
---

- Route: `/brand-library` → `src/pages/pps/BrandLibrary.tsx`.
- Not publicly discoverable: `page_status` row is `status='draft'`, `category='internal'`, page sets `robots: "noindex, nofollow"`, and `/brand-library` is Disallowed in `public/robots.txt` (also auto-generated from DB at build time).
- Only admin/editor roles (or the Lovable editor preview) can view it; everyone else sees Coming Soon via `PageGate`.
- Contents: brand colors with click-to-copy hex + token names, Poppins/Montserrat type specimens, logo files (light + reversed), favicon, 14 certification badges, hero imagery, Do/Never voice rules, and terminology rules (shIFt, Phase Zero™, P.A.T.H.™, Pillars, Blue Door, one ™ per page).
- Every asset card has a direct `download` link. Add new assets by extending the `GROUPS` array.
