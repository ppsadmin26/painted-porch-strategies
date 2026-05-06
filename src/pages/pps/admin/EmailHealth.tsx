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
  Inbox,
  AlertTriangle,
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

function QueueStat({
  label,
  value,
  sub,
  tone = "ok",
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: "ok" | "warn" | "danger";
}) {
  const toneClass =
    tone === "danger"
      ? "text-red-600"
      : tone === "warn"
      ? "text-amber-600"
      : "text-navy";
  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
        {label}
      </div>
      <div className={`text-xl font-bold font-poppins mt-0.5 ${toneClass}`}>
        {value.toLocaleString()}
      </div>
      {sub && <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

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

type QueueHealth = {
  queue: string;
  pending: number;
  dlq: number;
  oldest_pending: string | null;
  oldest_dlq: string | null;
  last_error: {
    recipient: string;
    template: string;
    status: string;
    error: string;
    at: string;
  } | null;
};

type DlqMessage = {
  msg_id: number;
  enqueued_at: string;
  read_ct: number;
  recipient: string | null;
  template: string | null;
  subject: string | null;
  message: any;
};

type DlqQueue = {
  queue: string;
  dlq: string;
  messages: DlqMessage[];
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
  const [queueHealth, setQueueHealth] = useState<QueueHealth[]>([]);
  const [dlq, setDlq] = useState<DlqQueue[]>([]);
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
      const [statsRes, logRes, supRes, queueRes, dlqRes] = await Promise.all([
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
        supabase.rpc("admin_email_queue_health"),
        supabase.rpc("admin_email_dlq_list", { _limit: 50 }),
      ]);
      if (statsRes.error) throw statsRes.error;
      if (logRes.error) throw logRes.error;
      if (supRes.error) throw supRes.error;
      if (queueRes.error) throw queueRes.error;
      if (dlqRes.error) throw dlqRes.error;
      setStats(statsRes.data as Stats);
      setRows((logRes.data as LogRow[]) ?? []);
      setSuppressions((supRes.data as Suppression[]) ?? []);
      const qData = queueRes.data as { queues?: QueueHealth[] } | null;
      setQueueHealth(qData?.queues ?? []);
      const dData = dlqRes.data as { queues?: DlqQueue[] } | null;
      setDlq(dData?.queues ?? []);
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

  const totalDlq = queueHealth.reduce((a, q) => a + q.dlq, 0);
  const failureCount =
    (stats?.failed ?? 0) + (stats?.bounced ?? 0) + (stats?.complained ?? 0);
  const failureRate =
    stats && stats.total >= 10 ? failureCount / stats.total : 0;
  const failureThresholdHit =
    stats && stats.total >= 10 && failureRate > 0.05;
  const alertActive = totalDlq > 0 || failureThresholdHit;
  const rangeLabel =
    RANGES.find((r) => r.hours === hours)?.label.toLowerCase() ?? "selected window";

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

      {alertActive && (
        <Card className="p-4 mb-4 border-red-300 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-0.5 text-red-600 shrink-0" />
            <div className="text-sm flex-1">
              <div className="font-poppins font-semibold text-red-700">
                Email delivery alert
              </div>
              <ul className="mt-1 text-red-700/90 list-disc pl-5 space-y-0.5">
                {totalDlq > 0 && (
                  <li>
                    <span className="font-semibold">{totalDlq}</span> message
                    {totalDlq === 1 ? "" : "s"} stuck in the dead-letter queue. Review
                    the DLQ tab for details.
                  </li>
                )}
                {failureThresholdHit && (
                  <li>
                    Failure rate is{" "}
                    <span className="font-semibold">
                      {Math.round(failureRate * 100)}%
                    </span>{" "}
                    over the {rangeLabel} ({failureCount} of {stats?.total}). Threshold
                    is 5% with at least 10 sends.
                  </li>
                )}
              </ul>
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
          <TabsTrigger value="queue">
            Queue health
            {queueHealth.reduce((a, q) => a + q.dlq, 0) > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                {queueHealth.reduce((a, q) => a + q.dlq, 0)}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="dlq">
            DLQ
            {totalDlq > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                {totalDlq}
              </span>
            )}
          </TabsTrigger>
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

        <TabsContent value="queue" className="space-y-3">
          {queueHealth.length === 0 ? (
            <Card className="p-6 text-sm text-muted-foreground">
              Queue health is loading…
            </Card>
          ) : (
            queueHealth.map((q) => {
              const isAuth = q.queue === "auth_emails";
              const hasDlq = q.dlq > 0;
              return (
                <Card key={q.queue} className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className="font-poppins font-semibold text-navy flex items-center gap-2">
                        <Inbox className="h-4 w-4 text-primary" />
                        {isAuth ? "Auth emails queue" : "Transactional emails queue"}
                        <code className="text-[11px] font-mono text-muted-foreground">
                          ({q.queue})
                        </code>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isAuth
                          ? "High-priority queue. Drained first by the dispatcher."
                          : "Normal-priority queue. Drained after auth emails."}
                      </p>
                    </div>
                    {hasDlq && (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-300"
                      >
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Needs attention
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                    <QueueStat
                      label="Pending"
                      value={q.pending}
                      sub={
                        q.oldest_pending
                          ? `Oldest: ${fmt(q.oldest_pending)}`
                          : "Queue empty"
                      }
                      tone={q.pending > 0 ? "warn" : "ok"}
                    />
                    <QueueStat
                      label="In DLQ"
                      value={q.dlq}
                      sub={
                        q.oldest_dlq
                          ? `Oldest: ${fmt(q.oldest_dlq)}`
                          : "No dead letters"
                      }
                      tone={hasDlq ? "danger" : "ok"}
                    />
                  </div>

                  {q.last_error ? (
                    <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs">
                      <div className="font-semibold text-red-700 flex items-center gap-1.5 mb-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Most recent failure
                      </div>
                      <div className="text-muted-foreground">
                        <span className="font-medium text-navy">{q.last_error.recipient}</span>
                        {" · "}
                        <span>{q.last_error.template}</span>
                        {" · "}
                        {statusBadge(q.last_error.status)}
                        <span className="ml-1">{fmt(q.last_error.at)}</span>
                      </div>
                      <div className="mt-1.5 text-red-700 break-words">
                        {q.last_error.error}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      No recent failures recorded for this queue.
                    </div>
                  )}
                </Card>
              );
            })
          )}
          <p className="text-[11px] text-muted-foreground">
            Messages move to the dead-letter queue (DLQ) after 5 failed delivery attempts or once
            their TTL expires. Drain or inspect DLQ contents from the database if a backlog appears.
          </p>
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

