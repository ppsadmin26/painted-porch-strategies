# Post-Go-Live Checklist

Things to do **once the site is officially launched** (custom domain cut over,
DNS pointed at production, public traffic flowing).

Until then, edits go straight to the live `pps-website.lovable.app` URL because
there's effectively no audience yet — staging isn't worth the overhead.

---

## 1. Stand up a staging environment

**Why wait:** Pre-launch, the "live" site has no real visitors, so editing
directly is fine and faster. Once the custom domain is live and people are
actually landing on the site, every change becomes a public-facing risk and
needs a review step.

**What to set up** (see earlier chat on "staging site" for full reasoning):

- [ ] **Enable GitHub Branch Switching** in Lovable Labs
  (Account → Labs → "GitHub Branch Switching").
- [ ] In GitHub, create a `staging` branch off `main`.
- [ ] In Lovable, switch the project to the `staging` branch for day-to-day
      edits. The `id-preview--…lovable.app` URL becomes the staging preview.
- [ ] Document the workflow in a `STAGING.md` at the repo root:
  1. Edits happen in Lovable on the `staging` branch.
  2. Review on the preview URL.
  3. Open a PR from `staging` → `main` in GitHub.
  4. Merge → production rebuilds → custom domain reflects changes.
- [ ] Decide a database-change rule and write it into `STAGING.md`:
  - Schema changes (migrations) hit the **shared** Lovable Cloud DB
    immediately, regardless of branch. So:
    - Only make **additive, backwards-compatible** migrations while on
      `staging` (new tables, new nullable columns, new RLS policies).
    - Avoid destructive changes (drop column, rename, narrow type) until
      after the staging→main merge, and run a backup first
      (`/admin/backups`).
  - Edge function code also deploys immediately on save — treat the same way.
- [ ] Run a `/admin/backups` snapshot before the first staging→main merge,
      and keep a rolling weekly backup going forward.

**Alternative (if branch switching is too clunky):** remix the project into a
second Lovable project wired to its own `staging` branch and its own Cloud
backend. Heavier setup, fully isolated DB. Revisit only if option above
causes friction.

---

## 2. Other launch-day items

(Add as they come up — leaving this section as a placeholder so the
checklist grows over time.)

- [ ] Confirm custom domain SSL is Active in Project Settings → Domains.
- [ ] Update `BASE_URL` in `scripts/generate-sitemap.ts` (and anywhere else
      hardcoded) from `pps-website.lovable.app` to the real production domain.
- [ ] Resubmit `sitemap.xml` to Google Search Console under the new domain.
- [ ] Update GHL, Stripe, and any other webhook URLs that reference the old
      preview/lovable.app URL.
- [ ] Update OG image / social share previews if they reference the old URL.
- [ ] Verify analytics (if any) is firing on the production domain.
