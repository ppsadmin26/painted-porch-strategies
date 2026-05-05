# Migration Runbook: Lovable Cloud → Standalone Supabase

This is your escape hatch. Even if you never use it, having it written down
removes the "what if this happens again" anxiety.

**Audience:** You (Amy), or any future dev. Plain English, every command spelled out.

---

## What you're keeping vs. rebuilding

| Thing | Status in migration |
|---|---|
| Database tables + rows | ✅ Exported via `/admin/backups` zip |
| Storage files (blog images, videos, email assets) | ✅ Now included as binaries inside the zip under `storage/<bucket>/...` (files >75MB listed in `skipped_large_files` for manual fetch) |
| Auth users (passwords) | ❌ Cannot be exported. Team gets re-invited. |
| Edge Functions code | ✅ Already in repo (`supabase/functions/`) — redeploys cleanly |
| RLS policies + DB functions | ✅ Already in repo (`supabase/migrations/`) — runs cleanly on a fresh project |
| Edge Function secrets | ⚠️ Re-entered manually (you have the values; list below) |
| Cloud auth email templates | ⚠️ Reconfigured in new project's Auth dashboard (templates live in `supabase/functions/auth-email-hook/`) |

**Bottom line:** the code, schema, and data are portable. Only auth passwords
and a handful of secrets need human re-entry.

---

## Phase 0 — Before you start (do this once, today)

1. Go to `/admin/backups`, click **Run Backup Now**.
2. Click the download icon on the new row → save the `.zip` somewhere safe.
3. Open the zip and confirm you see `csv/`, `json/`, `storage-manifest.json`, `lovable-snapshot.json`, and `README.txt`.

That's it. You now have a recoverable copy. You can stop here.

---

## Getting the code: Option A vs. Option B

The backup zip holds your **data**. To rebuild, you also need the **code**
(React app, edge functions, SQL migrations). There are two ways to get it.

### Option A - Clone the GitHub repo (recommended)

Best when: you want a live, version-controlled copy you can keep editing.

1. In Lovable: **Connectors** (sidebar) → **GitHub** → **Connect project**.
   This pushes the current codebase to a repo under your GitHub account.
2. On your laptop:
   ```bash
   git clone https://github.com/<your-account>/<repo-name>.git
   cd <repo-name>
   ```
3. You now have everything: `src/`, `supabase/migrations/`, `supabase/functions/`,
   `package.json`, configs. Every later phase assumes you have this.

Why this is recommended:
- Two-way sync stays live; future Lovable edits keep flowing in.
- `git pull` brings updates without re-downloading.
- Branches and history are preserved.

### Option B - Download ZIP from GitHub

Best when: you just want a one-time snapshot of the code, no Git workflow.

1. Connect to GitHub the same way (Step 1 above).
2. Open the GitHub repo in your browser → green **Code** button → **Download ZIP**.
3. Unzip it locally. Same folders as Option A, just no `.git` history.

Trade-offs:
- No sync. Future Lovable changes won't appear unless you re-download.
- No `git pull`, no branches.
- Fine for "I just need the files to migrate once" scenarios.

### Which gives you what

| Source | Contents |
|---|---|
| **GitHub repo (A or B)** | All source code, edge function code, SQL migrations, configs |
| **Backup zip (`/admin/backups`)** | Database rows (CSV+JSON), storage binaries, snapshot, schema diagram |

You need **both** to fully rebuild. Repo = code + schema. Zip = data + files.

---

## Phase 1 — Stand up a new Supabase project (~30 min)

1. Go to https://supabase.com → create account (use the email you want to own this).
2. Create a new project. Pick a region near your users (US East is fine).
3. Save the **project ref** (the string in the URL like `abcdxyz`) and the **service_role key** (Settings → API). You'll need both.
4. Install the Supabase CLI locally if you don't have it:
   ```bash
   brew install supabase/tap/supabase
   supabase login
   ```

---

## Phase 2 — Push the schema (~15 min)

The repo already contains every migration that built the current database.
You just point the CLI at the new project and run them.

```bash
cd /path/to/this/repo
supabase link --project-ref <NEW_PROJECT_REF>
supabase db push
```

This creates every table, RLS policy, function, trigger, and the
`pgmq` / `pg_cron` extensions used by the email queue. No manual SQL needed.

If `db push` complains about `pgmq` or `pg_cron`, enable them once in the
Supabase Dashboard → Database → Extensions, then re-run.

---

## Phase 3 — Restore your data (~30 min)

From the backup zip:

```bash
unzip pps-backup-manual-*.zip -d backup/
```

Then for each table, import the JSON file. Easiest path: Supabase Dashboard
→ Table Editor → pick table → "Insert" → "Import data from CSV" and upload
the matching `csv/<table>.csv`.

Or, scripted with `psql` (faster for big tables):

```bash
export PGURL="postgresql://postgres:<DB_PASSWORD>@db.<NEW_REF>.supabase.co:5432/postgres"

for t in profiles blog_categories blog_posts blog_post_categories \
         media_appearances media_appearance_categories \
         youtube_videos youtube_video_categories \
         site_video_slots site_videos page_status \
         access_tokens suppressed_emails email_unsubscribe_tokens; do
  psql "$PGURL" -c "\copy public.$t FROM 'backup/csv/$t.csv' WITH CSV HEADER"
done
```

(Skip `email_send_log` and `email_send_state` — those are runtime tables and
will repopulate on their own.)

---

## Phase 4 — Re-upload storage files (~1 hr, mostly waiting)

The backup contains a **manifest** (`storage-manifest.json`) listing every
file in every bucket — names, sizes, paths — but **not the binaries**
(those would balloon the zip past 1 GB).

You re-upload from your originals:

1. In the new Supabase Dashboard → Storage, create the four buckets:
   - `blog-images` (public)
   - `email-assets` (public)
   - `site-videos` (public)
   - `backups` (private)
2. For blog images: re-upload from your local copies, or use the manifest
   to fetch each file from the OLD project's public URL and re-upload to
   the new one. A 10-line Node script can do this in batch — ask Lovable
   for help if needed.
3. For site videos: same approach. The `/admin/videos` page lets you
   re-add them via "Migrate from URL" once the new project is connected.

---

## Phase 5 — Set Edge Function secrets (~10 min)

In the new Supabase Dashboard → Edge Functions → Manage secrets, add these
(values you already have — copy them from the current Cloud project, or
from your password manager / GHL / Stripe / Anthropic dashboards):

```
ANTHROPIC_API_KEY
ANTHROPIC_MODEL
GHL_API_KEY
GHL_LOCATION_ID
YOUTUBE_API_KEY
RESEND_API_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
FIRECRAWL_API_KEY
ADMIN_NOTIFICATION_EMAIL
BACKUP_CRON_SECRET     # generate a fresh random string, update pg_cron job to match
LOVABLE_API_KEY        # only needed if you keep the preview-email function
```

`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`,
`SUPABASE_JWKS`, `SUPABASE_DB_URL` are auto-injected by Supabase — don't
set them manually.

---

## Phase 6 — Deploy Edge Functions (~5 min)

```bash
supabase functions deploy --project-ref <NEW_PROJECT_REF>
```

This pushes every function in `supabase/functions/` to the new project.

---

## Phase 7 — Point the frontend at the new project (~5 min)

1. Update `.env` (or the equivalent in your hosting):
   ```
   VITE_SUPABASE_URL=https://<NEW_REF>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=<new anon key>
   VITE_SUPABASE_PROJECT_ID=<NEW_REF>
   ```
2. Rebuild and redeploy the site (Vercel / Netlify / wherever).
3. Smoke test: load `/`, log into `/admin`, check `/resources/blog`.

---

## Phase 8 — Re-invite the team (~15 min)

Go to `/admin/users` and re-invite each teammate. They'll receive a fresh
sign-up link from the new project. Their roles need to be re-set in the
`profiles` table (already restored in Phase 3, so this is mostly automatic
once they sign up with the same email).

---

## Phase 9 — Reconfigure auth email templates (~10 min)

In the new Supabase Dashboard → Authentication → Email Templates, paste the
HTML from `supabase/functions/_shared/email-templates/` for:
- Confirm signup
- Magic link
- Invite user
- Reset password
- Change email
- Reauthentication

Or, if you keep the `auth-email-hook` Edge Function (already in repo), point
the Auth webhook at it and the templates serve themselves.

---

## Phase 10 — Final cutover (~5 min)

1. Update GHL webhooks, Stripe webhook URLs, and any external integrations
   to point at the new project's edge function URLs.
2. Update the custom domain DNS if applicable.
3. Disable the old Lovable Cloud project (or leave it read-only as a backup
   for 30 days).

---

## Estimated total time: 3-4 hours of focused work

Most of it is waiting for uploads. The actual decision-making is minimal
because every command is spelled out above.

## If you get stuck

- Schema push fails → enable extensions manually in Dashboard, retry
- Data import fails on one table → import that table via Dashboard UI
- Edge function won't deploy → check `supabase/config.toml` for missing
  function-specific blocks
- Auth users can't log in → confirm `profiles` table populated, then
  re-invite

The whole point of this runbook is that you can hand it to anyone (or
future-you at 11pm) and they can execute it without re-deriving the steps.
