import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Mail, Search, RefreshCw, Send, Code2, Eye, AlertCircle, Copy, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type EmailItem = {
  key: string;
  kind: "auth" | "transactional";
  displayName: string;
  subject: string;
  file: string;
  status: "ready" | "preview_data_required" | "render_failed";
  error?: string;
  html?: string;
  source?: string;
  lastUpdated?: string | null;
  trigger?: string;
};

function formatRelative(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  const diff = Date.now() - d.getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString();
}

const KIND_LABEL: Record<EmailItem["kind"], string> = {
  auth: "User authentication",
  transactional: "App email",
};

export default function SiteEmails() {
  const [items, setItems] = useState<EmailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "auth" | "transactional">("all");
  const [active, setActive] = useState<EmailItem | null>(null);
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error: fnErr } = await supabase.functions.invoke("admin-list-emails", {
      body: {},
    });
    if (fnErr) {
      setError(fnErr.message);
      setLoading(false);
      return;
    }
    setItems((data?.items as EmailItem[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // Pre-fill test email with current admin user
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.email) setTestEmail(data.user.email);
    });
  }, []);

  const filtered = useMemo(() => {
    return items
      .filter((i) => filter === "all" || i.kind === filter)
      .filter((i) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          i.displayName.toLowerCase().includes(q) ||
          i.key.toLowerCase().includes(q) ||
          i.subject.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (a.kind !== b.kind) return a.kind === "auth" ? -1 : 1;
        return a.displayName.localeCompare(b.displayName);
      });
  }, [items, filter, search]);

  const counts = useMemo(
    () => ({
      total: items.length,
      auth: items.filter((i) => i.kind === "auth").length,
      tx: items.filter((i) => i.kind === "transactional").length,
      issues: items.filter((i) => i.status !== "ready").length,
    }),
    [items],
  );

  async function sendTest(item: EmailItem) {
    if (!testEmail.trim()) {
      toast.error("Enter a recipient email first");
      return;
    }
    setSending(true);
    try {
      if (item.kind === "auth") {
        // Only password recovery is safely triggerable as a sample.
        // Other auth flows fire from real signup/invite/etc.
        if (item.key === "recovery") {
          const { error: e } = await supabase.auth.resetPasswordForEmail(testEmail.trim(), {
            redirectTo: `${window.location.origin}/admin/reset-password`,
          });
          if (e) throw e;
          toast.success("Recovery email queued");
        } else {
          toast.info(
            "Auth emails (signup, invite, magic link, email change, reauth) fire only from real Supabase Auth flows. Use the corresponding flow to test live delivery.",
          );
        }
      } else {
        const { data, error: e } = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: item.key,
            recipientEmail: testEmail.trim(),
            idempotencyKey: `admin-test-${item.key}-${Date.now()}`,
            templateData: {}, // server falls back to minimal defaults; preview data not always safe to resend
          },
        });
        if (e || !data?.success) {
          throw new Error(e?.message ?? data?.error ?? data?.reason ?? "send failed");
        }
        toast.success(`Test sent · message_id ${data.message_id?.slice(0, 8) ?? "queued"}`);
      }
    } catch (err: any) {
      toast.error(`Send failed: ${err?.message ?? "unknown"}`);
    } finally {
      setSending(false);
    }
  }

  function copySource(item: EmailItem) {
    if (!item.source) return;
    navigator.clipboard.writeText(item.source).then(
      () => toast.success("Template source copied"),
      () => toast.error("Copy failed"),
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-navy flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" /> Site Emails
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Every email this site sends, in one place. Click any row to preview the rendered email,
            view the underlying template source, and send a test. To change copy, structure, or
            styling, ask in the Lovable chat and the template file will be updated.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/emails/health">
              <Activity className="h-4 w-4 mr-2" /> Email health
            </Link>
          </Button>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Total" value={counts.total} />
        <StatCard label="Auth" value={counts.auth} />
        <StatCard label="App" value={counts.tx} />
        <StatCard label="Issues" value={counts.issues} tone={counts.issues ? "warn" : "ok"} />
      </div>

      <Card className="p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, key, or subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="auth">Auth</TabsTrigger>
              <TabsTrigger value="transactional">App</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </Card>

      {error && (
        <Card className="p-4 mb-4 border-destructive/50 bg-destructive/5 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 text-destructive" />
            <div>
              <div className="font-semibold">Failed to load email registry</div>
              <div className="text-muted-foreground">{error}</div>
            </div>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Name</div>
          <div className="col-span-3">Subject</div>
          <div className="col-span-3">Triggered when</div>
          <div className="col-span-1">Updated</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading templates…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No emails match your filters.</div>
        ) : (
          filtered.map((item) => (
            <button
              key={`${item.kind}-${item.key}`}
              onClick={() => setActive(item)}
              className="w-full text-left grid grid-cols-12 gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-muted/40 transition-colors items-start"
            >
              <div className="col-span-2 pt-0.5">
                <Badge
                  variant="outline"
                  className={
                    item.kind === "auth"
                      ? "border-cobalt/40 text-cobalt"
                      : "border-primary/40 text-primary"
                  }
                >
                  {KIND_LABEL[item.kind]}
                </Badge>
              </div>
              <div className="col-span-2">
                <div className="font-medium text-sm text-navy">{item.displayName}</div>
                <code className="text-[10px] text-muted-foreground">{item.key}</code>
              </div>
              <div className="col-span-3 text-xs text-muted-foreground truncate pt-0.5">
                {item.subject || <span className="italic">(dynamic)</span>}
              </div>
              <div className="col-span-3 text-xs text-muted-foreground pt-0.5">
                {item.trigger || <span className="italic">Not documented</span>}
              </div>
              <div className="col-span-1 text-xs text-muted-foreground pt-0.5 flex flex-col gap-1">
                <span>{formatRelative(item.lastUpdated)}</span>
                <StatusPill status={item.status} />
              </div>
              <div className="col-span-1 text-right pt-0.5">
                <Eye className="h-4 w-4 text-muted-foreground inline" />
              </div>
            </button>
          ))
        )}
      </Card>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" /> {active?.displayName}
              {active && (
                <Badge variant="outline" className="ml-2">
                  {KIND_LABEL[active.kind]}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
              <span>
                <strong>Subject:</strong> {active?.subject || "(dynamic)"}
              </span>
              <span>
                <strong>Triggered when:</strong>{" "}
                {active?.trigger || <em>Not documented</em>}
              </span>
              <span>
                <strong>Key:</strong> <code>{active?.key}</code>
              </span>
              <span>
                <strong>File:</strong> <code className="text-[10px]">{active?.file}</code>
              </span>
            </DialogDescription>
          </DialogHeader>

          {active && (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="flex flex-wrap items-end gap-2 mb-3 p-3 rounded-md border bg-muted/30">
                <div className="flex-1 min-w-[220px]">
                  <label className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                    Send test to
                  </label>
                  <Input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1 h-9"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={() => sendTest(active)}
                  disabled={sending || !testEmail.trim() || active.status === "render_failed"}
                >
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  {sending ? "Sending…" : "Send test"}
                </Button>
                {active.source && (
                  <Button size="sm" variant="outline" onClick={() => copySource(active)}>
                    <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy source
                  </Button>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground -mt-2 mb-3">
                {active.kind === "auth" && active.key !== "recovery"
                  ? "Auth emails (signup, invite, magic link, email change, reauth) only fire from real Supabase Auth flows. Trigger the matching flow to test live delivery."
                  : "Sends the currently rendered template to the address above using sample data."}
              </p>

              {active.status === "render_failed" && (
                <Card className="p-3 mb-3 border-destructive/50 bg-destructive/5 text-xs">
                  <div className="font-semibold text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Render failed
                  </div>
                  <div className="text-muted-foreground mt-1">{active.error}</div>
                </Card>
              )}
              {active.status === "preview_data_required" && (
                <Card className="p-3 mb-3 border-amber-500/40 bg-amber-50 text-xs">
                  This template needs runtime data and has no preview defaults. Source is shown
                  below — request a preview-data block in chat to enable in-app preview.
                </Card>
              )}

              <Tabs defaultValue="preview" className="flex-1 overflow-hidden flex flex-col">
                <TabsList className="self-start">
                  <TabsTrigger value="preview">
                    <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview
                  </TabsTrigger>
                  <TabsTrigger value="source">
                    <Code2 className="h-3.5 w-3.5 mr-1.5" /> Source (TSX)
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="preview" className="flex-1 overflow-hidden mt-3">
                  {active.html ? (
                    <iframe
                      title={`Preview of ${active.displayName}`}
                      srcDoc={active.html}
                      className="w-full h-[60vh] border rounded bg-white"
                      sandbox=""
                    />
                  ) : (
                    <div className="p-6 text-sm text-muted-foreground border rounded">
                      No preview available.
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="source" className="flex-1 overflow-auto mt-3">
                  {active.source ? (
                    <pre className="text-xs p-4 bg-muted/40 rounded border overflow-auto max-h-[60vh]">
                      <code>{active.source}</code>
                    </pre>
                  ) : (
                    <div className="p-6 text-sm text-muted-foreground border rounded">
                      Source not available.
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <p className="mt-3 text-xs text-muted-foreground">
                To edit content, structure, or styling: ask in the Lovable chat (e.g. “update the{" "}
                <code>{active.key}</code> email subject and CTA color”).
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "ok",
}: {
  label: string;
  value: number;
  tone?: "ok" | "warn";
}) {
  return (
    <Card className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={`text-2xl font-bold font-poppins ${
          tone === "warn" ? "text-amber-600" : "text-navy"
        }`}
      >
        {value}
      </div>
    </Card>
  );
}

function StatusPill({ status }: { status: EmailItem["status"] }) {
  if (status === "ready")
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
        Ready
      </span>
    );
  if (status === "preview_data_required")
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300">
        Needs data
      </span>
    );
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
      Error
    </span>
  );
}
