# Plan: Unified Terms / Privacy / Cookies + Policy Update Notifier

## 1. Single page, three tabs at `/terms`

Rebuild `src/pages/pps/TermsAndConditions.tsx` as one page with a tab switcher (shadcn `Tabs` component) so a single link + checkbox satisfies purchase acknowledgement flows.

Tabs:
- **Terms of Service** (existing content, tightened — acceptable use, DMCA, expanded arbitration, class-action waiver + 30-day opt-out, jury trial waiver, small-claims/IP carve-outs)
- **Privacy Policy** (full GDPR + UK GDPR + CCPA/CPRA + PIPEDA + Québec Law 25 coverage)
- **Cookie Policy** (no banner — disclosure + browser-management guidance + GA disclosure)

Shared header: "Last Updated: June 3, 2026" (replaces "Effective"). Deep links: `?tab=privacy`, `?tab=cookies`, `?tab=terms` so external acknowledgement links can land on a specific tab.

`/privacy` and `/cookies` routes will redirect to `/terms?tab=privacy` and `/terms?tab=cookies` so any link out in the wild still resolves.

## 2. Unified policy contact

All terms / privacy / cookie / DMCA / data-subject-rights inquiries route to **policies@onthepaintedporch.com**. Replace every prior email reference (privacy@, dmca@, legal@) in the drafts with this single address.

## 3. Sub-processors list (expanded + corrected)

| Sub-processor | Purpose | Region |
|---|---|---|
| Lovable Cloud (Supabase infra) | Hosting, database, auth, storage | US |
| Stripe | Payments (Blue Door, future products) | US |
| GoHighLevel | CRM, lead capture, course access & delivery, email/SMS automation | US |
| AidaForm | Assessment intake forms | EU |
| Anthropic (Claude) | AI-assisted analysis of assessment responses | US |
| Resend / Lovable Emails (Mailgun) | Transactional email delivery | US/EU |
| YouTube (Google) | Video embeds | US |
| Sanity | Content management (if/where used) | US/EU |
| Firecrawl | LinkedIn article import (admin-only, no end-user PII) | US |
| Google Analytics | Site analytics — see Cookie tab | US |
| ClickUp | Project management & support ticketing *(only if client PII lands in tasks — confirm before including)* |

I'll mark ClickUp pending your confirmation. The rest get full entries with purpose + data categories + region.

## 4. Google Analytics handling (no banner yet)

Per discussion above, going with **Option 2**:
- Disclose GA in Cookie tab (cookies set, data collected, retention, opt-out link to Google's browser add-on).
- Disclose in Privacy tab under "Analytics" with legitimate-interest basis (EU) / disclosed collection (CA).
- Add a TODO note in the page header comment to revisit when marketing pixels are added — that's when we add the real consent banner.
- **Recommend** (not in this plan, separate task if you want): tighten GA config to Consent Mode v2 + anonymize IP + disable Google Signals.

## 5. Voice & easter eggs (preserved + new)

Keep Amy's "huggable bear" voice throughout. Existing eggs preserved. New ones planted:
- *sine ira et studio* (Stoic nod)
- "interpretive dance" (arbitration section)
- "a very alert cup of coffee" (data retention)
- "apologies to anyone who came here looking for actual baked goods" (Cookie tab opener)
- "The Dude would not abide" + "Inconceivable" (Acceptable Use)
- **Updated closing easter egg paragraph** — donate $25 language, refreshed riddle, still routes to `/found-it`

## 6. Policy-update email notifier

**The trigger problem:** you'll likely save 3–5 times in a session before a change is "really" done. So we don't auto-fire on save.

**Solution: Explicit "Notify subscribers" admin action.**

- New admin route: `/admin/policy-notifications` (admin-only, gated by `PageGate`)
- Lists past notifications (date sent, recipient count, which tab(s) changed, who triggered)
- Big button: **"Send Policy Update Notification"** with:
  - Checkbox group: which sections changed (Terms / Privacy / Cookies / All)
  - Text field: short plain-English summary of what changed (goes in the email)
  - Preview button (renders the email)
  - Confirm dialog: "This will email **N** recipients. Continue?"

**Recipients:** all addresses currently in `suppressed_emails` are excluded automatically. Source list = union of:
- `email_unsubscribe_tokens` table (everyone we've ever sent transactional mail to)
- *(optionally)* GHL contacts — flag this for later, since GHL is the source of truth for your real audience and we'd want a dedicated edge function

**New pieces required:**
- New table: `policy_update_notifications` (id, sent_at, sent_by, sections jsonb, summary, recipient_count) — admin RLS only
- New transactional email template: `policy-update-notification.tsx` in `_shared/transactional-email-templates/` + registry entry
- New edge function: `send-policy-update-notification` (admin-auth-gated, iterates recipients in batches, calls existing `send-transactional-email`, writes the row)
- Admin page component + sidebar link

The email itself: branded (navy/teal/gold), plain English, explains what changed, links to `/terms?tab=<changed>`, includes one-click unsubscribe (auto-appended by existing infra).

## 7. Routing & sitemap

- `/terms` — existing route, now hosts all three tabs
- `/privacy` — new redirect → `/terms?tab=privacy`
- `/cookies` — new redirect → `/terms?tab=cookies`
- Sitemap (`/sitemap`) + `page_status` rows: add `/privacy` and `/cookies` as **Live** (per memory rule — confirming below)
- `/admin/policy-notifications` — Draft / admin-only

## 8. Footer

Add Privacy and Cookies links alongside the existing Terms link in `PPSFooter.tsx`, all pointing into the appropriate tab.

---

## Open confirmations before I build

1. **ClickUp** — does any client/user PII (names, emails, support messages) actually land in ClickUp tasks? If yes, include it; if no, skip.
2. **GA Consent Mode tightening** — want me to do that in a follow-up task, or leave GA as-is?
3. **Sitemap** — confirm `/privacy` and `/cookies` redirects should be **Live** on the sitemap page.
4. **GHL recipients for notifier** — start with just our internal email list (`email_unsubscribe_tokens`), or wire up GHL contacts now?
5. **Draft document review** — last round you asked for the drafts before I built. Want me to produce the **final merged document** (all three tabs in one markdown doc) for one more red-line pass before I write code?

## Technical notes

- Tabs implemented with shadcn `Tabs` + URL sync via `useSearchParams` so deep links work and tab state survives refresh.
- Redirects via React Router `<Navigate>` (preserves query strings).
- The notifier edge function uses the existing pgmq queue path (one enqueue per recipient with idempotency key = `policy-update-{notification_id}-{email}`) so the queue's retry/suppression/throttle logic just works.
- DB migration: new `policy_update_notifications` table with GRANTs + RLS (admin select/insert only).
