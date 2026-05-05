import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import {
  ListChecks,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Loader2,
  MailCheck,
  Send,
  Globe,
  Plus,
  Trash2,
  Copy,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ItemStatus = "todo" | "done" | "skip" | "na";

type Item = {
  id: string;
  label: string;
  detail?: string;
  /** "moved" = automated by our tooling; "manual" = user must do it; "skipped" = intentionally NOT migrated */
  kind: "moved" | "manual" | "skipped";
  /** Optional in-app helper route */
  href?: string;
  /** Optional external doc link */
  external?: { label: string; url: string };
};

type Phase = {
  id: string;
  number: number;
  title: string;
  goal: string;
  items: Item[];
};

const PHASES: Phase[] = [
  {
    id: "phase-1",
    number: 1,
    title: "Provision the new Supabase project",
    goal: "Stand up an empty personal-Supabase project ready to receive data.",
    items: [
      { id: "p1-create", kind: "manual", label: "Create new project at supabase.com", external: { label: "supabase.com/dashboard", url: "https://supabase.com/dashboard" } },
      { id: "p1-region", kind: "manual", label: "Pick a region close to your users", detail: "Match or beat current Lovable Cloud region for latency parity." },
      { id: "p1-db-password", kind: "manual", label: "Save the database password in your password manager" },
      { id: "p1-keys", kind: "manual", label: "Copy project ref, URL, anon key, service-role key", detail: "From Project Settings → API. You'll need all four for Phase 6." },
      { id: "p1-billing", kind: "manual", label: "Enable billing if you'll exceed free tier", detail: "Storage + edge function invocations are the usual culprits." },
    ],
  },
  {
    id: "phase-2",
    number: 2,
    title: "Take a clean source backup",
    goal: "Generate the latest export from this Lovable Cloud project.",
    items: [
      { id: "p2-run", kind: "moved", label: "Run a fresh manual backup", href: "/admin/backups", detail: "Tables + storage objects snapshotted to the backups bucket." },
      { id: "p2-zip", kind: "moved", label: "Click \"Prepare restore zip\"", href: "/admin/backups", detail: "Bundles tables, storage manifest, schema.sql, config.sql, secrets-checklist.md, auth-config.md." },
      { id: "p2-schema", kind: "moved", label: "Export schema.sql", href: "/admin/backups" },
      { id: "p2-config", kind: "moved", label: "Export config.sql (storage buckets, RLS, realtime)", href: "/admin/backups" },
      { id: "p2-checklist", kind: "moved", label: "Download secrets-checklist.md", href: "/admin/backups" },
      { id: "p2-download", kind: "manual", label: "Download the restore zip locally as belt-and-suspenders" },
    ],
  },
  {
    id: "phase-3",
    number: 3,
    title: "Apply schema and config to the new project",
    goal: "Recreate every table, function, trigger, policy, bucket, and realtime publication.",
    items: [
      { id: "p3-schema", kind: "moved", label: "Run schema.sql in new project's SQL editor", detail: "Recreates enums, tables, functions, triggers, policies, indexes." },
      { id: "p3-config", kind: "moved", label: "Run config.sql in new project's SQL editor", detail: "Recreates storage buckets, storage RLS, supabase_realtime publication." },
      { id: "p3-verify-tables", kind: "moved", label: "Spot-check tables exist in Table Editor" },
      { id: "p3-verify-buckets", kind: "moved", label: "Confirm buckets list matches: blog-images, email-assets, site-videos, backups" },
    ],
  },
  {
    id: "phase-4",
    number: 4,
    title: "Stand up the new frontend (so the Restore Wizard exists)",
    goal: "Remix this codebase into a fresh Lovable project pointed at your personal Supabase. The Restore Wizard, Verify, and Secrets Handoff pages live in /admin and only become usable here once this is done.",
    items: [
      { id: "p4f-remix", kind: "manual", label: "Remix this Lovable project into a NEW project", detail: "Use the project's three-dot menu → Remix. Do NOT enable Lovable Cloud on the new project." },
      { id: "p4f-connect", kind: "manual", label: "Connect the new Lovable project to your personal Supabase", detail: "In the new project: Connectors → Supabase → connect to the project you provisioned in Phase 1." },
      { id: "p4f-env", kind: "manual", label: "Confirm VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY point at the NEW project", detail: "Auto-written into .env by the Supabase integration." },
      { id: "p4f-types", kind: "manual", label: "Wait for src/integrations/supabase/types.ts to regenerate", detail: "Auto-generated against the new Supabase schema you applied in Phase 3." },
      { id: "p4f-secrets-min", kind: "manual", label: "Set the minimum secrets needed for restore tooling", href: "/admin/secrets-handoff", detail: "At minimum: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL — plus the SOURCE_* equivalents pointing at the OLD Lovable Cloud project so the wizard can pull from it. Full secrets handoff happens in Phase 7." },
      { id: "p4f-deploy-restore", kind: "manual", label: "Confirm restore-related edge functions deployed", detail: "auto-backup, migrate-export, migrate-import deploy automatically when the new project builds. Check Cloud → Functions in the new project." },
      { id: "p4f-admin-login", kind: "manual", label: "Sign in to /admin on the NEW project as an admin", detail: "You'll need to sign up fresh (auth users don't migrate) and grant yourself the admin role via SQL on the new Supabase." },
    ],
  },
  {
    id: "phase-5",
    number: 5,
    title: "Restore data and storage objects (run from the NEW project)",
    goal: "Move every row and every file out of the source and into the target. All links below open the wizard in THIS project — run them from the equivalent routes in your NEW project.",
    items: [
      { id: "p5-tables", kind: "moved", label: "Restore table rows via Restore Wizard", href: "/admin/restore", detail: "Auth user IDs are remapped where applicable." },
      { id: "p5-storage", kind: "moved", label: "Restore storage objects via Restore Wizard", href: "/admin/restore", detail: "Signed-URL helper streams files from old → new project." },
      { id: "p5-non-user-auth", kind: "moved", label: "Restore profiles, roles, page_status, access_tokens", href: "/admin/restore", detail: "Non-user auth-adjacent tables included in standard restore." },
      { id: "p5-integrity", kind: "moved", label: "Run Integrity Check", href: "/admin/verify", detail: "Compares restored row + object counts against the manifest." },
    ],
  },
  {
    id: "phase-6",
    number: 6,
    title: "Configure auth providers (manual)",
    goal: "Recreate auth provider settings — these are NOT in SQL and cannot be exported.",
    items: [
      { id: "p6-email", kind: "manual", label: "Enable Email provider + set confirm-email policy", detail: "Currently: signups require email confirmation, no auto-confirm." },
      { id: "p6-google", kind: "manual", label: "Re-add Google OAuth client ID + secret", detail: "Create new OAuth app in Google Cloud or reuse existing one with new redirect URI." },
      { id: "p6-redirects", kind: "manual", label: "Add Site URL + redirect allowlist", detail: "Include production domain, preview domains, and localhost." },
      { id: "p6-templates-code", kind: "moved", label: "Branded auth email templates (auth-email-hook + _shared/email-templates/*.tsx)", detail: "These live in the repo and travel with the Phase 4 remix. They redeploy automatically — no copy/paste needed." },
      { id: "p6-email-infra", kind: "moved", label: "Email infrastructure ready (pgmq queues, send log, suppression, cron)", detail: "Auto-checked: pgmq + pg_cron extensions, q_auth_emails / q_transactional_emails queues, email_send_log / email_send_state / suppressed_emails / email_unsubscribe_tokens tables, enqueue_email RPC, and the process-email-queue cron job. Re-runs automatically when you re-configure the email domain." },
      { id: "p6-email-domain", kind: "manual", label: "Re-add the sender domain (e.g. notify.paintedporch.com) and verify DNS", detail: "Lovable Cloud's per-project NS delegation means the new project needs its own domain setup + DNS records at your registrar." },
      { id: "p6-templates-fallback", kind: "manual", label: "(Optional) Re-paint Supabase's built-in Auth → Email Templates", detail: "Only matters if you ever disable auth-email-hook. The branded TSX templates above are the active path." },
      { id: "p6-hibp", kind: "manual", label: "Enable Leaked Password Protection (HIBP)" },
      { id: "p6-jwt", kind: "manual", label: "Verify JWT secret + JWKS are healthy", detail: "New project gets new keys; that's expected." },
    ],
  },
  {
    id: "phase-7",
    number: 7,
    title: "Re-enter remaining secrets and finalize edge functions",
    goal: "Complete the full secret set and wire up scheduled / external integrations in the new project.",
    items: [
      { id: "p7-secrets", kind: "manual", label: "Add every remaining required secret in the new project", href: "/admin/secrets-handoff", detail: "Use the Secrets Handoff page to track presence + completion. Restore-only secrets from Phase 4 already counted." },
      { id: "p7-deploy", kind: "manual", label: "Confirm all edge functions deployed (not just restore ones)", detail: "Auto-deployed by Lovable when the new project builds. Spot-check Cloud → Functions." },
      { id: "p7-cron", kind: "manual", label: "Re-create cron jobs (auto-backup-weekly, auto-backup-monthly)", detail: "Schedule them in Database → Cron in the new Supabase." },
      { id: "p7-webhooks", kind: "manual", label: "Re-register webhook endpoints with Stripe + GHL", detail: "URLs change because the project ref changes." },
      { id: "p7-smoke", kind: "manual", label: "Smoke test: login, blog list, admin dashboard, contact form" },
    ],
  },
  {
    id: "phase-8",
    number: 8,
    title: "Cutover + decommission",
    goal: "Flip DNS, then safely retire the old project.",
    items: [
      { id: "p8-dns", kind: "manual", label: "Update DNS / custom domain to point at the new Lovable project" },
      { id: "p8-monitor", kind: "manual", label: "Monitor logs + Sentry / analytics for 48 hours" },
      { id: "p8-final-backup", kind: "manual", label: "Take one final backup of the OLD project before pausing" },
      { id: "p8-pause", kind: "manual", label: "Pause (don't delete) the old Lovable Cloud project", detail: "Keep it paused for 30 days as a recovery safety net." },
      { id: "p8-rotate", kind: "manual", label: "Rotate any secrets shared between old and new (Stripe, GHL, Resend)" },
    ],
  },
  {
    id: "not-migrated",
    number: 0,
    title: "Intentionally NOT migrated",
    goal: "Things we deliberately leave behind — recreate or replace by hand if needed.",
    items: [
      { id: "skip-auth-users", kind: "skipped", label: "auth.users records (passwords, sessions)", detail: "Supabase password hashes are not portable. Users will need to reset their password OR sign in via Google to be re-provisioned." },
      { id: "skip-sessions", kind: "skipped", label: "Active sessions and refresh tokens", detail: "All users will be signed out at cutover. Communicate this." },
      { id: "skip-mfa", kind: "skipped", label: "MFA factors / TOTP enrollments", detail: "Users must re-enroll MFA in the new project." },
      { id: "skip-secret-values", kind: "skipped", label: "Secret VALUES (only names exported)", detail: "Security-by-design. Re-enter values from your password manager." },
      { id: "skip-vault", kind: "skipped", label: "Supabase Vault entries", detail: "Vault is not currently used by this project." },
      { id: "skip-realtime-state", kind: "skipped", label: "In-flight realtime channel state" },
      { id: "skip-edge-logs", kind: "skipped", label: "Historical edge function logs + analytics", detail: "Stay in the old project. Take a screenshot if you need them." },
      { id: "skip-pgmq", kind: "skipped", label: "In-flight pgmq email queue messages", detail: "Drain the queue in the old project before cutover, or accept some emails will need manual resend." },
      { id: "skip-cron-history", kind: "skipped", label: "pg_cron job run history" },
      { id: "skip-db-backups", kind: "skipped", label: "Supabase-managed PITR / daily backups", detail: "Those live in the old project. Our restore zip is the portable equivalent." },
    ],
  },
];

const LS_KEY = "pps.migration-checklist.v1";

// Build-time detection of branded auth-email-hook + shared templates.
// Vite resolves these globs against the repo at build time. If the files
// are missing in the new (remixed) project, the maps will be empty.
const AUTH_HOOK_FILES = import.meta.glob(
  "/supabase/functions/auth-email-hook/*",
  { eager: true, query: "?raw", import: "default" },
) as Record<string, string>;
const EMAIL_TEMPLATE_FILES = import.meta.glob(
  "/supabase/functions/_shared/email-templates/*.tsx",
  { eager: true, query: "?raw", import: "default" },
) as Record<string, string>;

const REQUIRED_TEMPLATES = [
  "signup",
  "recovery",
  "magic-link",
  "invite",
  "email-change",
  "reauthentication",
] as const;

function detectAuthEmailFiles() {
  const hookKeys = Object.keys(AUTH_HOOK_FILES);
  const hasHookIndex = hookKeys.some((k) => k.endsWith("/index.ts"));
  const hookSrc = hookKeys
    .filter((k) => k.endsWith("/index.ts"))
    .map((k) => AUTH_HOOK_FILES[k])
    .join("\n");
  const usesQueue = /enqueue_email/.test(hookSrc);

  const templateKeys = Object.keys(EMAIL_TEMPLATE_FILES);
  const presentTemplates = REQUIRED_TEMPLATES.filter((name) =>
    templateKeys.some((k) => k.endsWith(`/${name}.tsx`)),
  );
  const missingTemplates = REQUIRED_TEMPLATES.filter(
    (name) => !presentTemplates.includes(name),
  );

  return {
    hasHookIndex,
    usesQueue,
    presentTemplates,
    missingTemplates,
    allPresent:
      hasHookIndex && usesQueue && missingTemplates.length === 0,
  };
}

function loadState(): Record<string, ItemStatus> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
function saveState(s: Record<string, ItemStatus>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {
    /* noop */
  }
}

const KIND_META: Record<Item["kind"], { label: string; className: string }> = {
  moved: { label: "Auto-migrated", className: "border-green-600 text-green-700" },
  manual: { label: "Manual step", className: "border-amber-600 text-amber-700" },
  skipped: { label: "Not migrated", className: "border-rose-600 text-rose-700" },
};

export default function MigrationChecklist() {
  const [state, setState] = useState<Record<string, ItemStatus>>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  function toggle(id: string, kind: Item["kind"]) {
    setState((prev) => {
      const cur = prev[id] ?? "todo";
      // For "skipped" items, cycling goes todo -> na -> todo (acknowledged vs not)
      if (kind === "skipped") {
        return { ...prev, [id]: cur === "na" ? "todo" : "na" };
      }
      return { ...prev, [id]: cur === "done" ? "todo" : "done" };
    });
  }

  const totals = useMemo(() => {
    const all = PHASES.flatMap((p) => p.items);
    const trackable = all.filter((i) => i.kind !== "skipped");
    const skipped = all.filter((i) => i.kind === "skipped");
    const done = trackable.filter((i) => state[i.id] === "done").length;
    const ackd = skipped.filter((i) => state[i.id] === "na").length;
    return {
      trackable: trackable.length,
      done,
      pct: trackable.length ? Math.round((done / trackable.length) * 100) : 0,
      skipped: skipped.length,
      ackd,
    };
  }, [state]);

  function resetAll() {
    if (confirm("Reset all checklist progress?")) setState({});
  }
  function markPhaseDone(phase: Phase) {
    setState((prev) => {
      const next = { ...prev };
      for (const i of phase.items) {
        next[i.id] = i.kind === "skipped" ? "na" : "done";
      }
      return next;
    });
  }

  const [detecting, setDetecting] = useState(false);
  const [detectedAt, setDetectedAt] = useState<string>("");
  const [detectedNotes, setDetectedNotes] = useState<string[]>([]);

  type EmailInfraReport = {
    ok: boolean;
    extensions: Record<string, boolean>;
    queues: Record<string, boolean>;
    tables: Record<string, boolean>;
    rpc: Record<string, boolean>;
    cron: { exists: boolean; active: boolean; schedule: string | null };
    send_state: Record<string, unknown> | null;
    activity_24h: { total: number; pending: number; failed: number };
    checked_at: string;
  };
  const [emailInfra, setEmailInfra] = useState<EmailInfraReport | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  type EmailTestResult = {
    ok: boolean;
    stage: "invoke" | "enqueue" | "log" | "dispatch";
    message: string;
    messageId?: string;
    template: "auth-recovery" | "transactional";
    recipient: string;
    invokeMs?: number;
    invokeStatus?: number;
    enqueued?: boolean;
    finalStatus?: string;
    errorDetail?: string;
    pollMs?: number;
    checkedAt: string;
  };
  const [testResult, setTestResult] = useState<EmailTestResult | null>(null);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");

  // ---- DNS records form (sender domain) ----
  type DnsRecord = {
    id: string;
    type: "MX" | "TXT" | "CNAME" | "NS" | "A" | "SPF" | "DKIM" | "DMARC";
    host: string;
    value: string;
    ttl?: string;
    priority?: string;
    notes?: string;
    done: boolean;
  };
  type DnsState = {
    senderDomain: string;
    rootDomain: string;
    registrar: string;
    records: DnsRecord[];
  };
  const DNS_LS_KEY = "pps.migration-checklist.dns.v1";
  const defaultDns = (): DnsState => ({
    senderDomain: "notify.paintedporch.com",
    rootDomain: "paintedporch.com",
    registrar: "",
    records: [
      { id: "ns1", type: "NS", host: "notify", value: "ns3.lovable.cloud", ttl: "3600", notes: "Lovable nameserver delegation (subdomain)", done: false },
      { id: "ns2", type: "NS", host: "notify", value: "ns4.lovable.cloud", ttl: "3600", notes: "Lovable nameserver delegation (subdomain)", done: false },
    ],
  });
  const [dns, setDns] = useState<DnsState>(() => {
    try {
      const raw = localStorage.getItem(DNS_LS_KEY);
      return raw ? { ...defaultDns(), ...JSON.parse(raw) } : defaultDns();
    } catch {
      return defaultDns();
    }
  });
  useEffect(() => {
    try { localStorage.setItem(DNS_LS_KEY, JSON.stringify(dns)); } catch { /* noop */ }
  }, [dns]);

  // Validation: each required record type must be present, non-empty, and marked done.
  // SPF/DKIM/DMARC are commonly TXT records, so we sniff value/host too.
  const dnsValidation = (() => {
    const filled = dns.records.filter((r) => r.host.trim() && r.value.trim());
    const isMx = (r: DnsRecord) => r.type === "MX" && !!r.priority?.trim();
    const isSpf = (r: DnsRecord) =>
      r.type === "SPF" || (r.type === "TXT" && /v=spf1/i.test(r.value));
    const isDkim = (r: DnsRecord) =>
      r.type === "DKIM" ||
      ((r.type === "TXT" || r.type === "CNAME") &&
        (/domainkey/i.test(r.host) || /v=DKIM1/i.test(r.value)));
    const isDmarc = (r: DnsRecord) =>
      r.type === "DMARC" ||
      (r.type === "TXT" && (/_dmarc/i.test(r.host) || /v=DMARC1/i.test(r.value)));
    const checks = {
      MX: filled.some(isMx),
      SPF: filled.some(isSpf),
      DKIM: filled.some(isDkim),
      DMARC: filled.some(isDmarc),
    };
    const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);
    const allDoneFlag = dns.records.length > 0 && dns.records.every((r) => r.done);
    const requiredDone = (["MX", "SPF", "DKIM", "DMARC"] as const).every((k) =>
      filled.some((r) => {
        if (!r.done) return false;
        if (k === "MX") return isMx(r);
        if (k === "SPF") return isSpf(r);
        if (k === "DKIM") return isDkim(r);
        return isDmarc(r);
      }),
    );
    return { checks, missing, allDoneFlag, requiredDone, valid: missing.length === 0 };
  })();
  const dnsAllDone = dnsValidation.allDoneFlag && dnsValidation.requiredDone;
  useEffect(() => {
    if (dnsAllDone) {
      setState((prev) => (prev["p6-email-domain"] === "done" ? prev : { ...prev, "p6-email-domain": "done" }));
    }
  }, [dnsAllDone]);

  function updateRecord(id: string, patch: Partial<DnsRecord>) {
    setDns((d) => ({ ...d, records: d.records.map((r) => (r.id === id ? { ...r, ...patch } : r)) }));
  }
  function addRecord() {
    setDns((d) => ({
      ...d,
      records: [
        ...d.records,
        { id: `r${Date.now()}`, type: "TXT", host: "", value: "", ttl: "3600", done: false },
      ],
    }));
  }
  function removeRecord(id: string) {
    setDns((d) => ({ ...d, records: d.records.filter((r) => r.id !== id) }));
  }
  function copyDnsSummary() {
    const lines = [
      `# DNS for sender domain: ${dns.senderDomain}`,
      `Root domain: ${dns.rootDomain}`,
      `Registrar: ${dns.registrar || "(not set)"}`,
      "",
      "Type | Host | Value | TTL | Priority | Done | Notes",
      "---- | ---- | ----- | --- | -------- | ---- | -----",
      ...dns.records.map((r) =>
        `${r.type} | ${r.host} | ${r.value} | ${r.ttl ?? ""} | ${r.priority ?? ""} | ${r.done ? "✓" : "✗"} | ${r.notes ?? ""}`,
      ),
    ].join("\n");
    navigator.clipboard.writeText(lines).then(
      () => toast.success("DNS summary copied to clipboard"),
      () => toast.error("Copy failed"),
    );
  }

  useEffect(() => {
    if (testEmail) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setTestEmail(data.user.email);
    });
  }, [testEmail]);

  async function sendTestEmail(mode: "transactional" | "auth-recovery") {
    if (!testEmail || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(testEmail)) {
      toast.error("Enter a valid recipient email");
      return;
    }
    setTesting(true);
    const checkedAt = new Date().toISOString();
    try {
      if (mode === "auth-recovery") {
        const t0 = performance.now();
        const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
          redirectTo: `${window.location.origin}/admin`,
        });
        const invokeMs = Math.round(performance.now() - t0);
        if (error) {
          setTestResult({
            ok: false, stage: "invoke", template: "auth-recovery",
            recipient: testEmail, invokeMs, message: "Auth recovery request failed",
            errorDetail: error.message, checkedAt,
          });
          toast.error(`Auth recovery failed: ${error.message}`);
          return;
        }
        // Poll auth_emails queue activity via email_send_log (template_name = 'auth_emails')
        const since = new Date(Date.now() - 60_000).toISOString();
        let finalStatus: string | undefined;
        let pollMs = 0;
        const t1 = performance.now();
        for (let i = 0; i < 12; i++) {
          await new Promise((r) => setTimeout(r, 1500));
          const { data: rows } = await supabase
            .from("email_send_log")
            .select("status, error_message, created_at")
            .eq("recipient_email", testEmail.toLowerCase())
            .eq("template_name", "auth_emails")
            .gte("created_at", since)
            .order("created_at", { ascending: false })
            .limit(1);
          const r0 = rows?.[0];
          if (r0) {
            finalStatus = r0.status as string;
            if (["sent", "failed", "dlq", "bounced", "suppressed"].includes(finalStatus)) {
              pollMs = Math.round(performance.now() - t1);
              break;
            }
          }
        }
        if (!pollMs) pollMs = Math.round(performance.now() - t1);
        const ok = finalStatus === "sent";
        setTestResult({
          ok, stage: ok ? "dispatch" : (finalStatus ? "dispatch" : "log"),
          template: "auth-recovery", recipient: testEmail, invokeMs, pollMs,
          finalStatus: finalStatus ?? "no log row found in 60s window",
          message: ok
            ? "Auth recovery email enqueued and sent ✓"
            : finalStatus === "pending"
              ? "Enqueued but dispatcher hasn't sent it yet (cron may be slow)"
              : "Auth recovery email did not reach 'sent' status",
          checkedAt,
        });
        ok
          ? toast.success("Auth recovery email sent ✓")
          : toast.warning(`Auth recovery: ${finalStatus ?? "no log row"}`);
        return;
      }

      // transactional path — use the contact-confirmation template (always present after scaffold)
      const t0 = performance.now();
      const { data, error } = await supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "contact-confirmation",
          recipientEmail: testEmail,
          idempotencyKey: `migration-test-${Date.now()}`,
          templateData: { name: "Migration Test" },
        },
      });
      const invokeMs = Math.round(performance.now() - t0);
      if (error || !data?.success) {
        setTestResult({
          ok: false, stage: "invoke", template: "transactional",
          recipient: testEmail, invokeMs,
          message: "send-transactional-email rejected the request",
          errorDetail: error?.message ?? data?.error ?? data?.reason ?? "unknown",
          checkedAt,
        });
        toast.error(`Send failed: ${error?.message ?? data?.error ?? "unknown"}`);
        return;
      }
      const messageId = data.message_id as string | undefined;
      // Poll email_send_log for terminal status
      let finalStatus: string | undefined;
      let errorDetail: string | undefined;
      const t1 = performance.now();
      let pollMs = 0;
      for (let i = 0; i < 12; i++) {
        await new Promise((r) => setTimeout(r, 1500));
        const q = supabase
          .from("email_send_log")
          .select("status, error_message, created_at")
          .order("created_at", { ascending: false })
          .limit(1);
        const { data: rows } = messageId
          ? await q.eq("message_id", messageId)
          : await q.eq("recipient_email", testEmail.toLowerCase()).eq("template_name", "contact-confirmation");
        const r0 = rows?.[0];
        if (r0) {
          finalStatus = r0.status as string;
          errorDetail = (r0.error_message as string) ?? undefined;
          if (["sent", "failed", "dlq", "bounced", "suppressed"].includes(finalStatus)) {
            pollMs = Math.round(performance.now() - t1);
            break;
          }
        }
      }
      if (!pollMs) pollMs = Math.round(performance.now() - t1);
      const ok = finalStatus === "sent";
      setTestResult({
        ok,
        stage: ok ? "dispatch" : finalStatus ? "dispatch" : "enqueue",
        template: "transactional", recipient: testEmail,
        messageId, invokeMs, pollMs, enqueued: true,
        finalStatus: finalStatus ?? "no terminal status within 18s",
        errorDetail,
        message: ok
          ? "Transactional test email sent ✓"
          : finalStatus === "pending"
            ? "Enqueued but dispatcher hasn't drained it yet (check cron)"
            : finalStatus === "suppressed"
              ? "Recipient is on the suppression list"
              : "Test email did not reach 'sent' status",
        checkedAt,
      });
      ok
        ? toast.success("Test email sent ✓")
        : toast.warning(`Test email status: ${finalStatus ?? "pending"}`);
    } catch (err: any) {
      setTestResult({
        ok: false, stage: "invoke", template: mode,
        recipient: testEmail, message: "Unexpected error",
        errorDetail: err?.message ?? String(err), checkedAt,
      });
      toast.error(err?.message ?? "Test send failed");
    } finally {
      setTesting(false);
    }
  }

  async function checkEmailInfra(silent = false): Promise<EmailInfraReport | null> {
    if (!silent) setCheckingEmail(true);
    try {
      const { data, error } = await (supabase as any).rpc("admin_check_email_infra");
      if (error) throw error;
      const report = data as EmailInfraReport;
      setEmailInfra(report);
      if (report.ok) {
        setState((prev) => (prev["p6-email-infra"] === "done" ? prev : { ...prev, "p6-email-infra": "done" }));
        if (!silent) toast.success("Email infrastructure ready ✓");
      } else if (!silent) {
        const missing: string[] = [];
        for (const [k, v] of Object.entries(report.queues)) if (!v) missing.push(`queue:${k}`);
        for (const [k, v] of Object.entries(report.tables)) if (!v) missing.push(`table:${k}`);
        for (const [k, v] of Object.entries(report.rpc)) if (!v) missing.push(`rpc:${k}`);
        if (!report.cron.exists) missing.push("cron:process-email-queue");
        else if (!report.cron.active) missing.push("cron:inactive");
        toast.warning(`Email infra not ready: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? "…" : ""}`);
      }
      return report;
    } catch (err: any) {
      if (!silent) toast.error(err?.message ?? "Email infra check failed");
      return null;
    } finally {
      if (!silent) setCheckingEmail(false);
    }
  }

  async function autoDetect() {
    setDetecting(true);
    const detected: Record<string, true> = {};
    const notes: string[] = [];
    try {
      const { data: runs, error: runsErr } = await supabase
        .from("backup_runs")
        .select("id, status, storage_path, storage_object_count, table_row_counts, finished_at, failed_steps")
        .order("created_at", { ascending: false })
        .limit(1);
      if (runsErr) throw runsErr;
      const latest = runs?.[0];
      if (latest && (latest.status === "success" || latest.status === "partial")) {
        detected["p2-run"] = true;
        const tableCount = Object.keys((latest.table_row_counts as Record<string, unknown>) ?? {}).length;
        const storageCount = latest.storage_object_count ?? 0;
        notes.push(
          `Latest backup ${latest.status} · ${tableCount} tables · ${storageCount} storage objects` +
            (latest.finished_at ? ` · ${new Date(latest.finished_at).toLocaleString()}` : ""),
        );
      } else {
        notes.push("No completed backup run found yet.");
      }

      const { data: rootFiles, error: rootErr } = await supabase.storage
        .from("backups")
        .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
      if (rootErr) throw rootErr;
      const names = (rootFiles ?? []).map((f) => f.name);
      const hasZip = names.some((n) => n.startsWith("pps-restore-") && n.endsWith(".zip"));
      const hasSchema = names.some((n) => n.startsWith("pps-schema-") && n.endsWith(".sql"));
      const hasConfig = names.some((n) => n.startsWith("pps-config-") && n.endsWith(".sql"));
      if (hasZip) { detected["p2-zip"] = true; notes.push("Restore zip found in backups bucket."); }
      if (hasSchema) { detected["p2-schema"] = true; notes.push("schema.sql export found."); }
      if (hasConfig) { detected["p2-config"] = true; notes.push("config.sql export found."); }

      try {
        const handoff = localStorage.getItem("pps.secrets-handoff.target-status.v1");
        if (handoff && handoff !== "{}") {
          detected["p2-checklist"] = true;
          notes.push("Secrets handoff progress detected in this browser.");
        }
      } catch { /* noop */ }

      if (latest?.storage_path) {
        const { data: folderFiles, error: folderErr } = await supabase.storage
          .from("backups")
          .list(latest.storage_path, { limit: 200 });
        if (!folderErr) {
          const folderNames = (folderFiles ?? []).map((f) => f.name);
          if (folderNames.includes("manifest.json")) {
            notes.push(`Backup manifest present at ${latest.storage_path}/manifest.json.`);
          }
        }
      }

      // Email infrastructure readiness
      const emailReport = await checkEmailInfra(true);
      if (emailReport) {
        if (emailReport.ok) {
          detected["p6-email-infra"] = true;
          notes.push(
            `Email infra ready · queues + cron (${emailReport.cron.schedule ?? "?"}) · ${emailReport.activity_24h.total} sends in last 24h`,
          );
        } else {
          const missing: string[] = [];
          for (const [k, v] of Object.entries(emailReport.queues)) if (!v) missing.push(`queue:${k}`);
          for (const [k, v] of Object.entries(emailReport.tables)) if (!v) missing.push(`table:${k}`);
          if (!emailReport.cron.exists) missing.push("cron:process-email-queue");
          else if (!emailReport.cron.active) missing.push("cron inactive");
          notes.push(`Email infra NOT ready · missing: ${missing.slice(0, 4).join(", ")}${missing.length > 4 ? "…" : ""}`);
        }
      } else {
        notes.push("Email infra check failed (admin role required).");
      }

      // Branded auth email templates (file-system check via Vite glob)
      const authFiles = detectAuthEmailFiles();
      if (authFiles.allPresent) {
        detected["p6-templates-code"] = true;
        notes.push(
          `Auth email templates present · auth-email-hook (queue-based) + ${authFiles.presentTemplates.length}/${REQUIRED_TEMPLATES.length} templates`,
        );
      } else {
        const issues: string[] = [];
        if (!authFiles.hasHookIndex) issues.push("auth-email-hook/index.ts missing");
        else if (!authFiles.usesQueue) issues.push("auth-email-hook not using enqueue_email (old direct-send pattern)");
        if (authFiles.missingTemplates.length) {
          issues.push(`missing templates: ${authFiles.missingTemplates.join(", ")}`);
        }
        notes.push(`Auth email templates NOT ready · ${issues.join(" · ")}`);
      }

      setDetectedAt(new Date().toISOString());
      setDetectedNotes(notes);

      let newlyMarked = 0;
      setState((prev) => {
        const next = { ...prev };
        for (const id of Object.keys(detected)) {
          if (next[id] !== "done") { newlyMarked++; next[id] = "done"; }
        }
        return next;
      });
      toast.success(
        newlyMarked
          ? `Auto-detected ${newlyMarked} completed item${newlyMarked === 1 ? "" : "s"}`
          : "No new completed items detected",
      );
    } catch (err: any) {
      toast.error(err?.message ?? "Auto-detect failed");
    } finally {
      setDetecting(false);
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ListChecks className="h-7 w-7" /> Migration Checklist
          </h1>
          <p className="text-muted-foreground mt-1 max-w-3xl">
            Every setting and data item moved (or intentionally left behind) when restoring this
            Lovable Cloud project into your personal Supabase. Phases 1–8, end to end.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={autoDetect} disabled={detecting}>
            {detecting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Auto-detect progress
          </Button>
          <Button variant="outline" onClick={() => checkEmailInfra(false)} disabled={checkingEmail}>
            {checkingEmail ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MailCheck className="h-4 w-4 mr-2" />}
            Check email infra
          </Button>
          <Button variant="outline" onClick={resetAll}>
            <RefreshCw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>
      </div>

      <Card className="p-4 border-primary/30">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Sender domain DNS records</span>
          {dnsAllDone && <CheckCircle2 className="h-4 w-4 text-green-600" />}
          <span className="ml-auto text-xs text-muted-foreground">
            {dns.records.filter((r) => r.done).length} / {dns.records.length} marked done
          </span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Track every DNS record you add at your registrar so the new project's sender domain
          (e.g. <code>notify.paintedporch.com</code>) verifies. Auto-completion requires
          MX, SPF, DKIM, and DMARC records to be present, non-empty, and checked off.
        </p>
        <div className="flex flex-wrap gap-2 mb-3 text-xs">
          {(["MX", "SPF", "DKIM", "DMARC"] as const).map((k) => {
            const ok = dnsValidation.checks[k];
            return (
              <span
                key={k}
                className={`px-2 py-1 rounded border ${ok ? "border-green-600 text-green-700 bg-green-50" : "border-amber-500 text-amber-700 bg-amber-50"}`}
              >
                {ok ? "✓" : "•"} {k}
              </span>
            );
          })}
          {!dnsValidation.valid && (
            <span className="text-muted-foreground self-center">
              Missing: {dnsValidation.missing.join(", ")}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <Label className="text-xs">Sender domain (FQDN)</Label>
            <Input
              value={dns.senderDomain}
              onChange={(e) => setDns((d) => ({ ...d, senderDomain: e.target.value }))}
              placeholder="notify.example.com"
            />
          </div>
          <div>
            <Label className="text-xs">Root domain</Label>
            <Input
              value={dns.rootDomain}
              onChange={(e) => setDns((d) => ({ ...d, rootDomain: e.target.value }))}
              placeholder="example.com"
            />
          </div>
          <div>
            <Label className="text-xs">Registrar / DNS provider</Label>
            <Input
              value={dns.registrar}
              onChange={(e) => setDns((d) => ({ ...d, registrar: e.target.value }))}
              placeholder="Cloudflare, GoDaddy, Namecheap…"
            />
          </div>
        </div>

        <div className="space-y-2">
          {dns.records.map((r) => (
            <div
              key={r.id}
              className={`grid grid-cols-12 gap-2 items-start p-2 rounded border ${r.done ? "bg-green-600/5 border-green-600/30" : "bg-card/40"}`}
            >
              <div className="col-span-12 md:col-span-1 flex md:justify-center pt-2">
                <Checkbox
                  checked={r.done}
                  onCheckedChange={(v) => updateRecord(r.id, { done: !!v })}
                />
              </div>
              <div className="col-span-4 md:col-span-1">
                <Label className="text-[10px] uppercase">Type</Label>
                <select
                  value={r.type}
                  onChange={(e) => updateRecord(r.id, { type: e.target.value as DnsRecord["type"] })}
                  className="w-full h-9 rounded-md border bg-background px-2 text-xs"
                >
                  {(["MX", "TXT", "CNAME", "NS", "A", "SPF", "DKIM", "DMARC"] as const).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-8 md:col-span-2">
                <Label className="text-[10px] uppercase">Host / Name</Label>
                <Input
                  value={r.host}
                  onChange={(e) => updateRecord(r.id, { host: e.target.value })}
                  placeholder="notify"
                  className="h-9 text-xs"
                />
              </div>
              <div className="col-span-12 md:col-span-4">
                <Label className="text-[10px] uppercase">Value</Label>
                <Input
                  value={r.value}
                  onChange={(e) => updateRecord(r.id, { value: e.target.value })}
                  placeholder="ns3.lovable.cloud"
                  className="h-9 text-xs font-mono"
                />
              </div>
              <div className="col-span-4 md:col-span-1">
                <Label className="text-[10px] uppercase">TTL</Label>
                <Input
                  value={r.ttl ?? ""}
                  onChange={(e) => updateRecord(r.id, { ttl: e.target.value })}
                  placeholder="3600"
                  className="h-9 text-xs"
                />
              </div>
              <div className="col-span-4 md:col-span-1">
                <Label className="text-[10px] uppercase">Priority</Label>
                <Input
                  value={r.priority ?? ""}
                  onChange={(e) => updateRecord(r.id, { priority: e.target.value })}
                  placeholder={r.type === "MX" ? "10" : ""}
                  className="h-9 text-xs"
                />
              </div>
              <div className="col-span-4 md:col-span-1 flex md:justify-end pt-5">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeRecord(r.id)}
                  title="Remove record"
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                </Button>
              </div>
              <div className="col-span-12 md:col-span-11 md:col-start-2">
                <Input
                  value={r.notes ?? ""}
                  onChange={(e) => updateRecord(r.id, { notes: e.target.value })}
                  placeholder="Notes (optional) — e.g. 'added at Cloudflare 5/5/26'"
                  className="h-8 text-xs"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <Button size="sm" variant="outline" onClick={addRecord}>
            <Plus className="h-4 w-4 mr-1" /> Add record
          </Button>
          <Button size="sm" variant="outline" onClick={copyDnsSummary}>
            <Copy className="h-4 w-4 mr-1" /> Copy summary
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              if (confirm("Reset DNS form to defaults? Your entries will be lost.")) {
                setDns(defaultDns());
              }
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" /> Reset DNS form
          </Button>
        </div>
      </Card>

      <Card className="p-4 border-primary/30">
        <div className="flex items-center gap-2 mb-2">
          <Send className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Send a test email through this project's setup</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Round-trips a sample email end-to-end: invokes the function, enqueues into pgmq, waits for the
          dispatcher cron to drain it, then reports the terminal status from <code>email_send_log</code>. Run this
          on the NEW project after Phase 6 to confirm sending actually works.
        </p>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="recipient@example.com"
            className="max-w-xs"
          />
          <Button size="sm" onClick={() => sendTestEmail("transactional")} disabled={testing}>
            {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Send transactional test
          </Button>
          <Button size="sm" variant="outline" onClick={() => sendTestEmail("auth-recovery")} disabled={testing}>
            {testing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MailCheck className="h-4 w-4 mr-2" />}
            Send auth recovery test
          </Button>
        </div>
        {testResult && (
          <div className={`rounded border p-3 text-xs space-y-1 ${testResult.ok ? "border-green-600/40 bg-green-600/5" : "border-amber-600/40 bg-amber-600/5"}`}>
            <div className="flex items-center gap-2 font-semibold text-sm">
              {testResult.ok ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              )}
              {testResult.ok ? "PASS" : "FAIL"} · {testResult.template} · {testResult.message}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-0.5 text-muted-foreground">
              <div>Recipient: <code className="text-foreground">{testResult.recipient}</code></div>
              <div>Stage reached: <code className="text-foreground">{testResult.stage}</code></div>
              {testResult.invokeMs !== undefined && <div>Invoke: <code className="text-foreground">{testResult.invokeMs}ms</code></div>}
              {testResult.pollMs !== undefined && <div>Dispatcher wait: <code className="text-foreground">{testResult.pollMs}ms</code></div>}
              {testResult.finalStatus && <div>Log status: <code className="text-foreground">{testResult.finalStatus}</code></div>}
              {testResult.messageId && <div className="md:col-span-2 truncate">message_id: <code className="text-foreground">{testResult.messageId}</code></div>}
            </div>
            {testResult.errorDetail && (
              <div className="text-rose-700 break-all">Error: {testResult.errorDetail}</div>
            )}
            <div className="text-[10px] text-muted-foreground">{new Date(testResult.checkedAt).toLocaleString()}</div>
          </div>
        )}
      </Card>

      {emailInfra && (
        <Card className="p-4 border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            {emailInfra.ok ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            )}
            <span className="font-semibold text-sm">
              Email infrastructure {emailInfra.ok ? "ready" : "incomplete"}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              {new Date(emailInfra.checked_at).toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {[
              { title: "Extensions", entries: emailInfra.extensions },
              { title: "Queues", entries: emailInfra.queues },
              { title: "Tables", entries: emailInfra.tables },
              { title: "RPC", entries: emailInfra.rpc },
            ].map((group) => (
              <div key={group.title}>
                <div className="font-semibold mb-1">{group.title}</div>
                <ul className="space-y-0.5">
                  {Object.entries(group.entries).map(([k, v]) => (
                    <li key={k} className="flex items-center gap-1.5">
                      {v ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                      ) : (
                        <XCircle className="h-3 w-3 text-rose-600 shrink-0" />
                      )}
                      <code className="truncate">{k}</code>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <div className="font-semibold mb-1">Cron</div>
              <ul className="space-y-0.5">
                <li className="flex items-center gap-1.5">
                  {emailInfra.cron.exists ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 text-rose-600 shrink-0" />
                  )}
                  process-email-queue
                </li>
                <li className="flex items-center gap-1.5">
                  {emailInfra.cron.active ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 text-rose-600 shrink-0" />
                  )}
                  active {emailInfra.cron.schedule && `(${emailInfra.cron.schedule})`}
                </li>
              </ul>
            </div>
            <div className="md:col-span-3">
              <div className="font-semibold mb-1">Activity (24h)</div>
              <div className="text-muted-foreground">
                Total: <strong className="text-foreground">{emailInfra.activity_24h.total}</strong>
                {" · "}Pending: <strong className="text-foreground">{emailInfra.activity_24h.pending}</strong>
                {" · "}Failed: <strong className={emailInfra.activity_24h.failed > 0 ? "text-rose-600" : "text-foreground"}>
                  {emailInfra.activity_24h.failed}
                </strong>
              </div>
            </div>
          </div>
        </Card>
      )}

      {detectedNotes.length > 0 && (
        <Card className="p-4 border-primary/30">
          <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Auto-detected {detectedAt && `· ${new Date(detectedAt).toLocaleString()}`}
          </div>
          <ul className="text-sm space-y-1 list-disc pl-5">
            {detectedNotes.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="text-sm">
            <span className="font-semibold">{totals.done}</span>
            <span className="text-muted-foreground"> / {totals.trackable} actionable steps complete</span>
            <span className="text-muted-foreground"> · {totals.ackd} / {totals.skipped} not-migrated items acknowledged</span>
          </div>
          <Badge variant={totals.pct === 100 ? "default" : "secondary"}>
            {totals.pct}%
          </Badge>
        </div>
        <Progress value={totals.pct} className="mt-3" />
      </Card>

      <div className="space-y-6">
        {PHASES.map((phase) => {
          const phaseDone = phase.items.every((i) =>
            i.kind === "skipped" ? state[i.id] === "na" : state[i.id] === "done",
          );
          return (
            <Card key={phase.id} className="p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    {phase.number > 0 ? `Phase ${phase.number}: ` : ""}
                    {phase.title}
                    {phaseDone && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">{phase.goal}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => markPhaseDone(phase)}>
                  Mark phase complete
                </Button>
              </div>

              <div className="space-y-2">
                {phase.items.map((item) => {
                  const status = state[item.id] ?? "todo";
                  const checked =
                    item.kind === "skipped" ? status === "na" : status === "done";
                  const meta = KIND_META[item.kind];
                  return (
                    <label
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded border bg-card/40 hover:bg-muted/40 cursor-pointer"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggle(item.id, item.kind)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`font-medium ${checked ? "line-through text-muted-foreground" : ""}`}
                          >
                            {item.label}
                          </span>
                          <Badge variant="outline" className={meta.className}>
                            {item.kind === "skipped" ? (
                              <XCircle className="h-3 w-3 mr-1" />
                            ) : item.kind === "manual" ? (
                              <AlertTriangle className="h-3 w-3 mr-1" />
                            ) : (
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                            )}
                            {meta.label}
                          </Badge>
                          {item.href && (
                            <Link
                              to={item.href}
                              className="text-xs text-primary underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Open helper
                            </Link>
                          )}
                          {item.external && (
                            <a
                              href={item.external.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-primary underline inline-flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {item.external.label}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {item.detail && (
                          <p className="text-xs text-muted-foreground mt-1">{item.detail}</p>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
