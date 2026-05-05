import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Activity,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle2,
  Clock,
  Ban,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

type Stats = {
  since: string;
  total: number;
  sent: number;
  pending: number;
  failed: number;
  bounced: number;
  complained: number;
  suppressed: number;
  by_template: Record<string, number>;
  suppression_total: number;
  checked_at: string;
};

type LogRow = {
  message_id: string;
  template_name: string;
  recipient_email: string;
  status: string;
  error_message: string | null;
  created_at: string;
};

type Suppression = {
  email: string;
  reason: string;
  created_at: string;
  metadata: any;
};

const RANGES = [
  { label: "Last 24h", hours: 24 },
  { label: "Last 7 days", hours: 24 * 7 },
  { label: "Last 30 days", hours: 24 * 30 },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "sent", label: "Sent" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "bounced", label: "Bounced" },
  { value: "complained", label: "Complained" },
  { value: "suppressed", label: "Suppressed" },
];

function fmt(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString();
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    sent: "bg-green-100 text-green-700 border-green-300",
    pending: "bg-amber-100 text-amber-700 border-amber-300",
    failed: "bg-red-100 text-red-700 border-red-300",
    dlq: "bg-red-100 text-red-700 border-red-300",
    bounced: "bg-orange-100 text-orange-700 border-orange-300",
    complained: "bg-purple-100 text-purple-700 border-purple-300",
    suppressed: "bg-gray-100 text-gray-700 border-gray-300",
  };
  const cls = map[status] ?? "bg-muted text-foreground border";
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${cls}`}>
      {status}
    </span>
  );
}

export default function EmailHealth() {
  const [hours, setHours] = useState(24 * 7);
  const [stats, setStats] = useState<Stats | null>(null);
  const [rows, setRows] = useState<LogRow[]>([]);
  const [suppressions, setSuppressions] = useState<Suppression[]>([]);
  const [template, setTemplate] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const since = useMemo(
    () => new Date(Date.now() - hours * 3600 * 1000).toISOString(),
    [hours],
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, logRes, supRes] = await Promise.all([
        supabase.rpc("admin_email_stats", { _since: since }),
        supabase.rpc("admin_email_log", {
          _since: since,
          _template: template === "all" ? null : template,
          _status: status === "all" ? null : status,
          _search: search.trim() || null,
          _limit: 100,
          _offset: page * 100,
        }),
        supabase.rpc("admin_email_suppressions", { _limit: 200 }),
      ]);
      if (statsRes.error) throw statsRes.error;
      if (logRes.error) throw logRes.error;
      if (supRes.error) throw supRes.error;
      setStats(statsRes.data as Stats);
      setRows((logRes.data as LogRow[]) ?? []);
      setSuppressions((supRes.data as Suppression[]) ?? []);
    } catch (e: any) {
      const msg = e?.message ?? "Failed to load email health";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [since, template, status, search, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Light auto-refresh every 60s
  useEffect(() => {
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const templateOptions = useMemo(() => {
    const names = new Set<string>(Object.keys(stats?.by_template ?? {}));
    rows.forEach((r) => names.add(r.template_name));
    return Array.from(names).sort();
  }, [stats, rows]);

  const sentRate = stats && stats.total > 0
    ? Math.round((stats.sent / stats.total) * 100)
    : null;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-navy flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" /> Email Health
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Live view of every send going through{" "}
            <code className="text-xs">notify.onthepaintedporch.com</code>. Tracks successful sends,
            failures, bounces, complaints, and the active suppression list.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={String(hours)} onValueChange={(v) => setHours(Number(v))}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGES.map((r) => (
                <SelectItem key={r.hours} value={String(r.hours)}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Card className="p-4 mb-4 border-destructive/50 bg-destructive/5 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 text-destructive" />
            <div>
              <div className="font-semibold">Could not load email health</div>
              <div className="text-muted-foreground">{error}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <Stat icon={<Activity className="h-4 w-4" />} label="Total" value={stats?.total ?? 0} />
        <Stat
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Sent"
          value={stats?.sent ?? 0}
          sub={sentRate != null ? `${sentRate}% delivery` : undefined}
          tone="ok"
        />
        <Stat
          icon={<Clock className="h-4 w-4" />}
          label="Pending"
          value={stats?.pending ?? 0}
          tone={stats?.pending ? "warn" : "ok"}
        />
        <Stat
          icon={<AlertCircle className="h-4 w-4" />}
          label="Failed"
          value={(stats?.failed ?? 0) + (stats?.bounced ?? 0) + (stats?.complained ?? 0)}
          sub={
            stats
              ? `${stats.failed} failed · ${stats.bounced} bounced · ${stats.complained} complaints`
              : undefined
          }
          tone={
            (stats?.failed ?? 0) + (stats?.bounced ?? 0) + (stats?.complained ?? 0) > 0
              ? "warn"
              : "ok"
          }
        />
        <Stat
          icon={<Shield className="h-4 w-4" />}
          label="Suppressed"
          value={stats?.suppression_total ?? 0}
          sub="addresses blocked"
        />
      </div>

      <Tabs defaultValue="log" className="space-y-4">
        <TabsList>
          <TabsTrigger value="log">Send log</TabsTrigger>
          <TabsTrigger value="suppression">
            Suppression list ({suppressions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="log" className="space-y-3">
          <Card className="p-3 flex flex-col md:flex-row gap-2 md:items-center">
            <form
              className="relative flex-1 min-w-[220px]"
              onSubmit={(e) => {
                e.preventDefault();
                setPage(0);
                setSearch(searchInput);
              }}
            >
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search recipient email…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9 h-9"
              />
            </form>
            <Select
              value={template}
              onValueChange={(v) => {
                setPage(0);
                setTemplate(v);
              }}
            >
              <SelectTrigger className="w-[220px] h-9">
                <SelectValue placeholder="All templates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All templates</SelectItem>
                {templateOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={status}
              onValueChange={(v) => {
                setPage(0);
                setStatus(v);
              }}
            >
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Card>

          <Card className="overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <div className="col-span-3">Recipient</div>
              <div className="col-span-3">Template</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Sent</div>
              <div className="col-span-2">Error</div>
            </div>
            {loading && rows.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">Loading send log…</div>
            ) : rows.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                No emails in this window match your filters.
              </div>
            ) : (
              rows.map((r) => (
                <div
                  key={r.message_id}
                  className="grid grid-cols-12 gap-3 px-4 py-2.5 border-b last:border-b-0 text-sm items-center hover:bg-muted/30"
                >
                  <div className="col-span-3 truncate font-medium text-navy">
                    {r.recipient_email}
                  </div>
                  <div className="col-span-3 truncate text-xs text-muted-foreground">
                    {r.template_name}
                  </div>
                  <div className="col-span-2">{statusBadge(r.status)}</div>
                  <div className="col-span-2 text-xs text-muted-foreground">
                    {fmt(r.created_at)}
                  </div>
                  <div
                    className="col-span-2 text-xs text-red-600 truncate"
                    title={r.error_message ?? ""}
                  >
                    {r.error_message ?? "—"}
                  </div>
                </div>
              ))
            )}
          </Card>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {rows.length} email{rows.length === 1 ? "" : "s"} (deduplicated by
              message_id)
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 0 || loading}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={rows.length < 100 || loading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="suppression">
          <Card className="overflow-hidden">
            <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              <div className="col-span-5">Email</div>
              <div className="col-span-3">Reason</div>
              <div className="col-span-4">Added</div>
            </div>
            {suppressions.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                No suppressed addresses. All recipients are eligible to receive mail.
              </div>
            ) : (
              suppressions.map((s) => (
                <div
                  key={`${s.email}-${s.created_at}`}
                  className="grid grid-cols-12 gap-3 px-4 py-2.5 border-b last:border-b-0 text-sm items-center"
                >
                  <div className="col-span-5 truncate font-medium text-navy flex items-center gap-2">
                    <Ban className="h-3.5 w-3.5 text-muted-foreground" />
                    {s.email}
                  </div>
                  <div className="col-span-3">
                    <Badge variant="outline" className="capitalize">
                      {s.reason}
                    </Badge>
                  </div>
                  <div className="col-span-4 text-xs text-muted-foreground">
                    {fmt(s.created_at)}
                  </div>
                </div>
              ))
            )}
          </Card>
          <p className="mt-3 text-xs text-muted-foreground">
            Suppressed addresses are blocked automatically. Bounces and complaints are reported by
            the email provider; unsubscribes happen through the one-click footer link.
          </p>
        </TabsContent>
      </Tabs>

      {stats && (
        <p className="mt-6 text-[11px] text-muted-foreground">
          Auto-refreshes every 60 seconds. Last checked {fmt(stats.checked_at)}.
        </p>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  tone = "ok",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub?: string;
  tone?: "ok" | "warn";
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div
        className={`text-2xl font-bold font-poppins mt-1 ${
          tone === "warn" ? "text-amber-600" : "text-navy"
        }`}
      >
        {value.toLocaleString()}
      </div>
      {sub && <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>}
    </Card>
  );
}
