## Goal

Make `/admin/offerings` (the existing P.A.T.H. Finder Offerings page) the **single source of truth** for every speaking/workshop topic. One save there updates `/topics`, `/partner/amplify/workshops`, `/speaking/amy`, `/speaking/rob`, and `/speaking/sierra` simultaneously — including description, topic tag, speaker, workshop/keynote flag, and image.

## What changes

### 1. Database (one migration)

Add two columns to `path_finder_offerings`:

- `image_url text` — public URL or `/src/assets/...` path for the topic card image.
- `is_keynote boolean default false` — paired with the existing `include_in_workshops` flag, this gives you the Workshop / Keynote chips.

Backfill `image_url` from current `IMAGE_MAP` entries in `SpeakingWorkshopTopics.tsx`, and backfill `is_keynote = true` for the rows currently marked Speaking-only.

### 2. Admin (extend the existing offerings card)

On every row in `/admin/offerings`, add four controls already grouped under a new "Topic card" section:

- **Speaker** dropdown (Amy / Rob / Sierra / none) — writes to `facilitator`.
- **Workshop** switch (writes `include_in_workshops`).
- **Keynote** switch (writes new `is_keynote`).
- **Topic tag** (already exists — stays).
- **Description** textarea (already exists as `description` — surfaced more clearly).
- **Image** — URL input + small preview, with an "Upload" button that pushes to the existing `site-images` bucket and pastes the resulting public URL.

Saving the row uses the existing save handler — no new save logic.

### 3. Pages become readers, not authors

`SpeakingWorkshopTopics.tsx`, `RobSpeaker.tsx`, `AmySpeaker.tsx`, `SierraSpeaker.tsx` each replace their hardcoded `topics` arrays / `BLURB_OVERRIDES` / `IMAGE_MAP` with a single query:

```ts
supabase.from("path_finder_offerings")
  .select("name, topic, description, facilitator, image_url, include_in_workshops, is_keynote")
  .or("include_in_workshops.eq.true,is_keynote.eq.true")
```

Each page then filters:
- `/topics` → everything returned.
- `/speaking/<name>` → rows where `facilitator = '<Name>'`.
- `/partner/amplify/workshops` → rows where `include_in_workshops = true`.

The existing chip logic (Workshop = navy icon, Keynote = green icon) reads `include_in_workshops` / `is_keynote` directly. A topic that is both shows both chips.

The local `*.jpg.asset.json` imports stay on disk so any URL already pointing at them keeps rendering — the DB simply stores that same URL string.

### 4. Cleanup

Remove `BLURB_OVERRIDES` and `IMAGE_MAP` from `SpeakingWorkshopTopics.tsx` once the backfill is verified.

## Out of scope

- No changes to quiz routing, RT pools, or the broader offerings schema.
- No new admin page — everything lives on the offerings admin you already use.
- Topic-card design on the public pages stays exactly as-is.

## Technical notes

- Migration adds columns + a `set updated_at` is already handled by existing trigger.
- `image_url` is plain text (no FK). Free-form so it can hold a Supabase storage URL, a CDN URL, or a `/src/assets/...` path resolved at build time.
- Speaker pages currently sort topics manually; after the switch they'll sort by `sort_order` from the table (already used by the admin).
