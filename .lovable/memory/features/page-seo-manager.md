---
name: page-seo-manager
description: Admin UI + DB-backed per-page SEO override system. Lives at /admin/pages alongside Page Status. DB values win over hardcoded useDocumentSeo() args.
type: feature
---

# Page SEO Manager

## Where
- Admin UI: `/admin/pages` (PageStatusManager.tsx). Sidebar label: "Pages & SEO".
- Dialog: `src/components/pps/admin/PageSeoEditorDialog.tsx` — tabbed (Basic / Social / Advanced / JSON-LD).
- Table: `public.page_seo` keyed by `path` (unique). Anyone can read (public site needs it). Admins+editors can insert/update; admins can delete.
- Triggered on every status-override row AND on every sitemap route via a searchable list section below the override list.

## How it merges
`src/hooks/useDocumentSeo.ts` fetches a row from `page_seo` matching `useLocation().pathname` and merges with this precedence:
**DB override > inline hook arg > built-in default.**

Hook also exports `invalidateSeoOverrideCache(path?)` — the dialog calls this on save/delete so the live site picks up changes without reload.

## Fields
title, description, og_title, og_description, og_image, canonical, keywords (text[]), robots, jsonld (Json). All nullable; blank = fall back to code.

## Gotchas
- Override is async, so initial render uses hardcoded values, then DB swaps in. No flicker for crawlers that execute JS.
- Social preview crawlers (LinkedIn, Slack, Facebook) only see static `index.html` head — DB overrides only affect JS-executing crawlers and the on-page rendered head.
- Do NOT migrate page_seo to a code-generated source of truth; the whole point is admin editability.
