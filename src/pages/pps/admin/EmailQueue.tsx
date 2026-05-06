import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Inbox,
  RefreshCw,
  Search,
  AlertTriangle,
  Clock,
  AlertCircle,
  MoreVertical,
  Trash2,
  RotateCcw,
  PlayCircle,
  Skull,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type Msg = {
  msg_id: number;
  enqueued_at: string;
  vt: string | null;
  read_ct: number;
  recipient: string | null;
  template: string | null;
  subject: string | null;
  message: any;
};

type QueueGroup = {
  queue: string;
  kind: "active" | "dlq";
  table: string;
  messages: Msg[];
};

type Response = {
  queues: QueueGroup[];
  auth_email_ttl_minutes: number;
  transactional_email_ttl_minutes: number;
  max_attempts: number;
  checked_at: string;
};

const QUEUE_OPTIONS = [
  { value: "all", label: "All queues" },
  { value: "transactional_emails", label: "transactional_emails" },
  { value: "auth_emails", label: "auth_emails" },
];

const KIND_OPTIONS = [
  { value: "all", label: "Active + DLQ" },
  { value: "active", label: "Active only" },
  { value: "dlq", label: "DLQ only" },
];

const RANGES = [
  { label: "Last 1h", hours: 1 },
  { label: "Last 24h", hours: 24 },
  { label: "Last 7 days", hours: 24 * 7 },
  { label: "All time", hours: 0 },
];

const TTL_OPTIONS = [
  { value: "all", label: "All ages" },
  { value: "expired", label: "TTL expired only" },
  { value: "fresh", label: "Within TTL only" },
];

function fmt(iso: string) {
  return new Date(iso).toLocaleString();
}

function ageMinutes(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / 60000;
}

export default function EmailQueue() {
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [queue, setQueue] = useState<string>("all");
  const [kind, setKind] = useState<string>("all");
  const [hours, setHours] = useState<number>(24);
  const [ttlFilter, setTtlFilter] = useState<string>("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.rpc("admin_email_queue_messages", {
        _queue: queue === "all" ? null : queue,
        _kind: kind,
        _limit: 200,
      });
      if (error) throw error;
      setData(data as unknown as Response);
    } catch (e: any) {
      const msg = e?.message ?? "Failed to load email queue";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [queue, kind]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const [busy, setBusy] = useState<string | null>(null);
  const [purgeTarget, setPurgeTarget] = useState<string | null>(null);

  const runAction = async (
    key: string,
    label: string,
    fn: () => Promise<any>,
  ) => {
    setBusy(key);
    try {
      const { error } = (await fn()) ?? {};
      if (error) throw error;
      toast.success(label);
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? `${label} failed`);
    } finally {
      setBusy(null);
    }
  };

  const sb = supabase as any;

  const requeue = (queue: string, msgId: number) =>
    runAction(`requeue-${msgId}`, "Requeued to active queue", () =>
      sb.rpc("admin_email_requeue_dlq", { _queue: queue, _msg_id: msgId }),
    );

  const deleteMsg = (queue: string, kind: "active" | "dlq", msgId: number) =>
    runAction(`del-${msgId}`, "Message deleted", () =>
      sb.rpc("admin_email_delete_message", {
        _queue: queue,
        _kind: kind,
        _msg_id: msgId,
      }),
    );

  const releaseStuck = (queue: string, msgId: number) =>
    runAction(`release-${msgId}`, "Released for immediate retry", () =>
      sb.rpc("admin_email_reset_stuck", {
        _queue: queue,
        _msg_id: msgId,
        _action: "release",
      }),
    );

  const moveToDlq = (queue: string, msgId: number) =>
    runAction(`movedlq-${msgId}`, "Moved to DLQ", () =>
      sb.rpc("admin_email_reset_stuck", {
        _queue: queue,
        _msg_id: msgId,
        _action: "move_to_dlq",
      }),
    );

  const purgeDlq = (queue: string) =>
    runAction(`purge-${queue}`, `Purged ${queue} DLQ`, () =>
      sb.rpc("admin_email_purge_dlq", { _queue: queue }),
    );

  const ttlFor = useCallback(
    (q: string) =>
      q === "auth_emails"
        ? data?.auth_email_ttl_minutes ?? 15
        : data?.transactional_email_ttl_minutes ?? 60,
    [data],
  );

  const filteredGroups = useMemo(() => {
    if (!data) return [] as QueueGroup[];
    const term = search.trim().toLowerCase();
    return data.queues.map((g) => {
      const ttl = ttlFor(g.queue);
      const messages = g.messages.filter((m) => {
        if (hours > 0 && ageMinutes(m.enqueued_at) > hours * 60) return false;
        if (ttlFilter === "expired" && ageMinutes(m.enqueued_at) <= ttl) return false;
        if (ttlFilter === "fresh" && ageMinutes(m.enqueued_at) > ttl) return false;
        if (term) {
          const hay = `${m.recipient ?? ""} ${m.template ?? ""} ${m.subject ?? ""}`.toLowerCase();
          if (!hay.includes(term)) return false;
        }
        return true;
      });
      return { ...g, messages };
    });
  }, [data, hours, ttlFilter, search, ttlFor]);

  const totalShown = filteredGroups.reduce((a, g) => a + g.messages.length, 0);
  const totalDlq = filteredGroups
    .filter((g) => g.kind === "dlq")
    .reduce((a, g) => a + g.messages.length, 0);
  const totalActive = filteredGroups
    .filter((g) => g.kind === "active")
    .reduce((a, g) => a + g.messages.length, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-poppins font-bold text-navy flex items-center gap-2">
            <Inbox className="h-6 w-6 text-primary" /> Email Queue
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Inspect active and dead-letter messages across both email queues. Filter by
            queue, status, TTL expiry, and time enqueued.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {error && (
        <Card className="p-4 mb-4 border-destructive/50 bg-destructive/5 text-sm">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 mt-0.5 text-destructive" />
            <div>
              <div className="font-semibold">Could not load queue</div>
              <div className="text-muted-foreground">{error}</div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Active messages" value={totalActive} />
        <StatCard label="DLQ messages" value={totalDlq} tone={totalDlq > 0 ? "danger" : "ok"} />
        <StatCard
          label="Auth TTL"
          value={data?.auth_email_ttl_minutes ?? 0}
          sub="minutes"
        />
        <StatCard
          label="Transactional TTL"
          value={data?.transactional_email_ttl_minutes ?? 0}
          sub="minutes"
        />
      </div>

      <Card className="p-3 mb-4 flex flex-col md:flex-row gap-2 md:items-center flex-wrap">
        <form
          className="relative flex-1 min-w-[220px]"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput);
          }}
        >
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recipient, template, subject…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9 h-9"
          />
        </form>
        <Select value={queue} onValueChange={setQueue}>
          <SelectTrigger className="w-[200px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUEUE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KIND_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ttlFilter} onValueChange={setTtlFilter}>
          <SelectTrigger className="w-[180px] h-9">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TTL_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(hours)} onValueChange={(v) => setHours(Number(v))}>
          <SelectTrigger className="w-[140px] h-9">
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
      </Card>

      {loading && !data ? (
        <Card className="p-6 text-sm text-muted-foreground">Loading queue…</Card>
      ) : filteredGroups.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">No queues to show.</Card>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((g) => {
            const ttl = ttlFor(g.queue);
            return (
              <Card key={`${g.queue}-${g.kind}`} className="overflow-hidden">
                <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {g.kind === "dlq" ? (
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-primary" />
                    )}
                    <div className="font-poppins font-semibold text-navy text-sm">
                      {g.queue}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                        g.kind === "dlq"
                          ? "bg-red-100 text-red-700 border-red-300"
                          : "bg-blue-100 text-blue-700 border-blue-300"
                      }`}
                    >
                      {g.kind === "dlq" ? "DLQ" : "ACTIVE"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-muted-foreground">
                      {g.messages.length} message{g.messages.length === 1 ? "" : "s"} · TTL {ttl}m
                    </div>
                    {g.kind === "dlq" && g.messages.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-50"
                        disabled={busy === `purge-${g.queue}`}
                        onClick={() => setPurgeTarget(g.queue)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Purge DLQ
                      </Button>
                    )}
                  </div>
                </div>
                {g.messages.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    No messages match the filters.
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      <div className="col-span-3">Recipient</div>
                      <div className="col-span-3">Template / subject</div>
                      <div className="col-span-2">Enqueued</div>
                      <div className="col-span-2">Age</div>
                      <div className="col-span-2">Attempts</div>
                    </div>
                    {g.messages.map((m) => {
                      const age = ageMinutes(m.enqueued_at);
                      const expired = age > ttl;
                      return (
                        <div
                          key={`${g.table}-${m.msg_id}`}
                          className="grid grid-cols-12 gap-3 px-4 py-2.5 border-b last:border-b-0 text-sm items-center hover:bg-muted/20"
                        >
                          <div className="col-span-3 truncate font-medium text-navy">
                            {m.recipient ?? <span className="text-muted-foreground">—</span>}
                          </div>
                          <div className="col-span-3 truncate text-xs text-muted-foreground">
                            <div className="truncate">{m.template ?? "—"}</div>
                            {m.subject && (
                              <div className="truncate text-[11px]">{m.subject}</div>
                            )}
                          </div>
                          <div className="col-span-2 text-xs text-muted-foreground">
                            {fmt(m.enqueued_at)}
                          </div>
                          <div
                            className={`col-span-2 text-xs font-medium ${
                              expired ? "text-red-600" : "text-muted-foreground"
                            }`}
                          >
                            {Math.round(age)}m {expired ? "· expired" : ""}
                          </div>
                          <div className="col-span-2 text-xs">
                            <span
                              className={
                                m.read_ct >= (data?.max_attempts ?? 5)
                                  ? "text-red-600 font-semibold"
                                  : "text-muted-foreground"
                              }
                            >
                              {m.read_ct} / {data?.max_attempts ?? 5}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <div className="text-xs text-muted-foreground mt-4">
        Showing {totalShown} message{totalShown === 1 ? "" : "s"} across{" "}
        {filteredGroups.length} queue group{filteredGroups.length === 1 ? "" : "s"}.
        {data?.checked_at && <> Checked at {fmt(data.checked_at)}.</>}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone = "ok",
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: "ok" | "danger";
}) {
  const toneClass = tone === "danger" ? "text-red-600" : "text-navy";
  return (
    <div className="rounded-md border bg-card p-3">
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
