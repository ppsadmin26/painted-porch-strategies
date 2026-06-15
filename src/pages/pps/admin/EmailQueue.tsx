import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  X,
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

function selKey(table: string, msgId: number) {
  return `${table}-${msgId}`;
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

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkConfirm, setBulkConfirm] = useState<
    | null
    | { action: "requeue" | "delete"; queue: string; kind: "active" | "dlq"; ids: number[] }
  >(null);

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

  const bulkRequeue = async (queue: string, ids: number[]) => {
    setBusy("bulk-requeue");
    try {
      const { data: res, error } = await sb.rpc("admin_email_requeue_dlq_batch", {
        _queue: queue,
        _msg_ids: ids,
      });
      if (error) throw error;
      const requeued = res?.requeued ?? ids.length;
      toast.success(`Requeued ${requeued} message${requeued === 1 ? "" : "s"}`);
      setSelected(new Set());
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Bulk requeue failed");
    } finally {
      setBusy(null);
      setBulkConfirm(null);
    }
  };

  const bulkDelete = async (queue: string, kind: "active" | "dlq", ids: number[]) => {
    setBusy("bulk-delete");
    try {
      const { data: res, error } = await sb.rpc("admin_email_delete_message_batch", {
        _queue: queue,
        _kind: kind,
        _msg_ids: ids,
      });
      if (error) throw error;
      const deleted = res?.deleted ?? ids.length;
      toast.success(`Deleted ${deleted} message${deleted === 1 ? "" : "s"}`);
      setSelected(new Set());
      await load();
    } catch (e: any) {
      toast.error(e?.message ?? "Bulk delete failed");
    } finally {
      setBusy(null);
      setBulkConfirm(null);
    }
  };

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

  const selectedByGroup = useMemo(() => {
    const map = new Map<string, { queue: string; kind: "active" | "dlq"; ids: number[] }>();
    for (const key of selected) {
      const [table, ...rest] = key.split("-");
      const msgId = Number(rest.join("-"));
      const g = filteredGroups.find((x) => x.table === table);
      if (!g) continue;
      const existing = map.get(g.table);
      if (existing) {
        existing.ids.push(msgId);
      } else {
        map.set(g.table, { queue: g.queue, kind: g.kind, ids: [msgId] });
      }
    }
    return map;
  }, [selected, filteredGroups]);

  const allSelectedAreDlq = useMemo(() => {
    for (const [, info] of selectedByGroup) {
      if (info.kind !== "dlq") return false;
    }
    return selected.size > 0;
  }, [selectedByGroup, selected.size]);

  const toggleSelect = (table: string, msgId: number, checked: boolean) => {
    const key = selKey(table, msgId);
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(key);
      else next.delete(key);
      return next;
    });
  };

  const toggleGroup = (g: QueueGroup, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const m of g.messages) {
        const key = selKey(g.table, m.msg_id);
        if (checked) next.add(key);
        else next.delete(key);
      }
      return next;
    });
  };

  const anyGroupSelected = selected.size > 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy flex items-center gap-2">
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
            aria-label="Search emails" placeholder="Search recipient, template, subject…"
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

      {anyGroupSelected && (
        <Card className="p-3 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-primary/30 bg-primary/5">
          <div className="text-sm font-medium text-navy">
            {selected.size} message{selected.size === 1 ? "" : "s"} selected
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {allSelectedAreDlq && selectedByGroup.size === 1 && (
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-primary text-primary hover:bg-primary/10"
                disabled={busy === "bulk-requeue"}
                onClick={() => {
                  const [table, info] = selectedByGroup.entries().next().value as [string, ReturnType<typeof selectedByGroup.get>] & { 1: NonNullable<ReturnType<typeof selectedByGroup.get>> };
                  if (info) setBulkConfirm({ action: "requeue", queue: info.queue, kind: info.kind, ids: info.ids });
                }}
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Requeue selected
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs border-destructive text-destructive hover:bg-destructive/10"
              disabled={busy === "bulk-delete"}
              onClick={() => {
                const [table, info] = selectedByGroup.entries().next().value as [string, ReturnType<typeof selectedByGroup.get>] & { 1: NonNullable<ReturnType<typeof selectedByGroup.get>> };
                if (info) setBulkConfirm({ action: "delete", queue: info.queue, kind: info.kind, ids: info.ids });
              }}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Delete selected
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={() => setSelected(new Set())}
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              Clear
            </Button>
          </div>
        </Card>
      )}

      {loading && !data ? (
        <Card className="p-6 text-sm text-muted-foreground">Loading queue…</Card>
      ) : filteredGroups.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">No queues to show.</Card>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((g) => {
            const ttl = ttlFor(g.queue);
            const allInGroupChecked =
              g.messages.length > 0 &&
              g.messages.every((m) => selected.has(selKey(g.table, m.msg_id)));
            const someInGroupChecked =
              g.messages.some((m) => selected.has(selKey(g.table, m.msg_id))) &&
              !allInGroupChecked;

            return (
              <Card key={`${g.queue}-${g.kind}`} className="overflow-hidden">
                <div className="px-4 py-2.5 border-b bg-muted/30 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {g.messages.length > 0 && (
                      <Checkbox
                        checked={allInGroupChecked}
                        className={someInGroupChecked ? "opacity-80" : ""}
                        onCheckedChange={(checked) => toggleGroup(g, checked === true)}
                        aria-label={`Select all ${g.queue} ${g.kind} messages`}
                      />
                    )}
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
                      <div className="col-span-1">Age</div>
                      <div className="col-span-2">Attempts</div>
                      <div className="col-span-1 text-right">Actions</div>
                    </div>
                    {g.messages.map((m) => {
                      const age = ageMinutes(m.enqueued_at);
                      const expired = age > ttl;
                      const isSelected = selected.has(selKey(g.table, m.msg_id));
                      return (
                        <div
                          key={`${g.table}-${m.msg_id}`}
                          className={`grid grid-cols-12 gap-3 px-4 py-2.5 border-b last:border-b-0 text-sm items-center hover:bg-muted/20 ${
                            isSelected ? "bg-primary/5" : ""
                          }`}
                        >
                          <div className="col-span-3 flex items-center gap-2">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) =>
                                toggleSelect(g.table, m.msg_id, checked === true)
                              }
                              aria-label={`Select message ${m.msg_id}`}
                            />
                            <span className="truncate font-medium text-navy">
                              {m.recipient ?? <span className="text-muted-foreground">-</span>}
                            </span>
                          </div>
                          <div className="col-span-3 truncate text-xs text-muted-foreground">
                            <div className="truncate">{m.template ?? "-"}</div>
                            {m.subject && (
                              <div className="truncate text-[11px]">{m.subject}</div>
                            )}
                          </div>
                          <div className="col-span-2 text-xs text-muted-foreground">
                            {fmt(m.enqueued_at)}
                          </div>
                          <div
                            className={`col-span-1 text-xs font-medium ${
                              expired ? "text-red-600" : "text-muted-foreground"
                            }`}
                          >
                            {Math.round(age)}m{expired ? " ·exp" : ""}
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
                          <div className="col-span-1 flex justify-end">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0"
                                  disabled={busy?.endsWith(`-${m.msg_id}`)}
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-56 bg-background">
                                {g.kind === "dlq" ? (
                                  <DropdownMenuItem onClick={() => requeue(g.queue, m.msg_id)}>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Requeue to active
                                  </DropdownMenuItem>
                                ) : (
                                  <>
                                    <DropdownMenuItem onClick={() => releaseStuck(g.queue, m.msg_id)}>
                                      <PlayCircle className="h-4 w-4 mr-2" />
                                      Release (retry now)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => moveToDlq(g.queue, m.msg_id)}>
                                      <Skull className="h-4 w-4 mr-2" />
                                      Force-move to DLQ
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600 focus:text-red-600"
                                  onClick={() => deleteMsg(g.queue, g.kind, m.msg_id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete permanently
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

      <AlertDialog open={!!purgeTarget} onOpenChange={(o) => !o && setPurgeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Purge {purgeTarget} DLQ?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes every message in the {purgeTarget} dead-letter
              queue. They will not be sent and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                const t = purgeTarget;
                setPurgeTarget(null);
                if (t) purgeDlq(t);
              }}
            >
              Purge all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!bulkConfirm}
        onOpenChange={(o) => !o && setBulkConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {bulkConfirm?.action === "requeue"
                ? "Requeue selected messages?"
                : "Delete selected messages?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {bulkConfirm?.action === "requeue"
                ? `This will move ${bulkConfirm?.ids.length ?? 0} selected dead-letter message${
                    (bulkConfirm?.ids.length ?? 0) === 1 ? "" : "s"
                  } back to the active queue for retry.`
                : `This will permanently delete ${bulkConfirm?.ids.length ?? 0} selected message${
                    (bulkConfirm?.ids.length ?? 0) === 1 ? "" : "s"
                  }. They cannot be recovered.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                bulkConfirm?.action === "delete"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-primary hover:bg-primary/90"
              }
              onClick={() => {
                if (!bulkConfirm) return;
                if (bulkConfirm.action === "requeue") {
                  bulkRequeue(bulkConfirm.queue, bulkConfirm.ids);
                } else {
                  bulkDelete(bulkConfirm.queue, bulkConfirm.kind, bulkConfirm.ids);
                }
              }}
            >
              {bulkConfirm?.action === "requeue" ? "Requeue" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
