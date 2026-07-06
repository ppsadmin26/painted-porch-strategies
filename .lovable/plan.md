# Prerender key public routes for crawlers

## Goal
After `vite build`, generate real static HTML for a curated set of high-value routes so crawlers (ChatGPT, Perplexity, Google, Bing) see full content instead of an empty `<div id="root"></div>`. Real users still get the SPA — hydration takes over on load.

## Approach
A new `scripts/prerender.mjs` runs as a `postbuild` step. It:

1. Starts `vite preview` on a local port (SPA fallback built in, serves `dist/`).
2. Launches headless Chromium via Playwright (already a dev dep).
3. Visits each route, waits for network idle + a short settle, snapshots the fully rendered HTML.
4. Rewrites `dist/<route>/index.html` with the snapshotted `<head>` (real title/meta/canonical/OG) and pre-rendered `<div id="root">…</div>` body. The existing `<script type="module">` bundle stays, so the SPA hydrates on top.
5. Shuts down the preview server.

Non-prerendered routes keep working exactly as today (SPA shell).

## Routes to prerender (v1)
- `/` — home
- `/about`, `/about/approach`, `/about/impact`
- `/amy`, `/rob`, `/sierra`
- `/blue-door`
- `/partner`
- `/partner/ignite`, `/partner/amplify`, `/partner/embody`
- `/resources`, `/resources/free`, `/resources/faq`, `/resources/insights`

Blog post detail pages (`/resources/insights/:slug`) are out of scope for v1 — dynamic slugs need a Supabase fetch to enumerate. Easy to add later.

## Technical notes
- `package.json` gets a `postbuild` script: `node scripts/prerender.mjs`. Skippable via `PRERENDER=0` env for fast dev builds.
- Script gates on `NODE_ENV === 'production'` / presence of `dist/` — no-op otherwise.
- Playwright already installed; script uses `chromium.launch({ headless: true })`.
- Auth-gated routes are excluded; only fully public pages are prerendered.
- If a route errors or times out (10s), the script logs a warning and leaves the original shell in place — build never fails on prerender issues.
- Meta tags set by `useDocumentSeo` are captured because Playwright waits for React to run.
- No source changes to components required.

## Verification
After build, `curl -s dist/blue-door/index.html | grep -c "Blue Door"` should return >0 hits (vs. 0 today). CI stays green because prerender failures degrade gracefully.

## Follow-ups (not in this change)
- Add blog post slugs by fetching from Supabase during prerender.
- Add `/partner/amplify/workshops`, `/partner/amplify/sprints`, `/partner/ignite/masterclasses` once v1 is validated.
