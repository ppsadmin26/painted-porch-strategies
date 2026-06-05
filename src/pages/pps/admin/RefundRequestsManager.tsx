import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, Mail } from "lucide-react";

type Status = "new" | "in_review" | "approved" | "rejected";

interface RefundRow {
  id: string;
  name: string;
  email: string;
  program: string;
  purchase_date: string;
  reason: string | null;
  status: Status;
  admin_notes: string | null;
  processed_at: string | null;
  created_at: string;
}

const STATUS_LABEL: Record<Status, string> = {
  new: "New",
  in_review: "In Review",
  approved: "Approved",
  rejected: "Rejected",
};

const STATUS_BADGE: Record<Status, string> = {
  new: "bg-cobalt/10 text-cobalt border-cobalt/30",
  in_review: "bg-gold/10 text-gold border-gold/30",
  approved: "bg-lime/10 text-lime-700 border-lime/30",
  rejected: "bg-raspberry/10 text-raspberry border-raspberry/30",
};

const FILTERS: { value: "all" | Status; label: string }[] = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "in_review", label: "In Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function RefundRequestsManager() {
  const { user, loading: authLoading } = useAuth();
  const { role, isAdmin, loading: roleLoading } = useUserRole();
  const isEditor = role === "editor";
  const { toast } = useToast();

  const [rows, setRows] = useState<RefundRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const [drafts, setDrafts] = useState<Record<string, { status: Status; notes: string }>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const canAccess = isAdmin || isEditor;

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("refund_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Failed to load refund requests", description: error.message, variant: "destructive" });
    } else {
      setRows((data || []) as RefundRow[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (canAccess) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAccess]);

  const filtered = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length, new: 0, in_review: 0, approved: 0, rejected: 0 };
    rows.forEach((r) => { c[r.status] = (c[r.status] || 0) + 1; });
    return c;
  }, [rows]);

  const getDraft = (r: RefundRow) =>
    drafts[r.id] ?? { status: r.status, notes: r.admin_notes ?? "" };

  const updateDraft = (id: string, patch: Partial<{ status: Status; notes: string }>) =>
    setDrafts((d) => ({ ...d, [id]: { ...(d[id] ?? { status: rows.find((r) => r.id === id)!.status, notes: rows.find((r) => r.id === id)!.admin_notes ?? "" }), ...patch } }));

  const save = async (r: RefundRow) => {
    const draft = getDraft(r);
    setSavingId(r.id);
    try {
      const { data, error } = await supabase.functions.invoke("update-refund-status", {
        body: { id: r.id, status: draft.status, adminNotes: draft.notes || null },
      });
      if (error) throw error;
      toast({
        title: "Refund request updated",
        description: (data as any)?.emailed
          ? "Customer has been notified by email."
          : "Saved.",
      });
      setDrafts((d) => { const n = { ...d }; delete n[r.id]; return n; });
      await load();
    } catch (e: any) {
      toast({ title: "Update failed", description: e?.message ?? "Try again.", variant: "destructive" });
    } finally {
      setSavingId(null);
    }
  };

  if (authLoading || roleLoading) return <div className="p-6">Loading…</div>;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!canAccess) return <Navigate to="/admin" replace />;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-poppins font-bold text-navy">
            Refund Requests
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review, update, and notify customers about refund decisions.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
            <span className="ml-2 text-xs opacity-70">
              {counts[f.value] ?? 0}
            </span>
          </Button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No refund requests in this view.
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((r) => {
            const draft = getDraft(r);
            const dirty = draft.status !== r.status || (draft.notes || "") !== (r.admin_notes || "");
            const willEmail = (draft.status === "approved" || draft.status === "rejected") && draft.status !== r.status;
            return (
              <Card key={r.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-poppins font-semibold text-navy text-lg">
                        {r.name}
                      </h3>
                      <Badge variant="outline" className={STATUS_BADGE[r.status]}>
                        {STATUS_LABEL[r.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      <a href={`mailto:${r.email}`} className="underline">{r.email}</a>
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    <div>Submitted {format(new Date(r.created_at), "MMM d, yyyy h:mm a")}</div>
                    {r.processed_at && (
                      <div>Processed {format(new Date(r.processed_at), "MMM d, yyyy h:mm a")}</div>
                    )}
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3 text-sm mb-4">
                  <div>
                    <div className="text-xs uppercase text-muted-foreground">Program</div>
                    <div>{r.program}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-muted-foreground">Purchase date</div>
                    <div>{r.purchase_date}</div>
                  </div>
                  <div>
                    <div className="text-xs uppercase text-muted-foreground">Request ID</div>
                    <div className="font-mono text-xs">{r.id.slice(0, 8)}…</div>
                  </div>
                </div>

                {r.reason && (
                  <div className="mb-4">
                    <div className="text-xs uppercase text-muted-foreground mb-1">Reason</div>
                    <p className="text-sm whitespace-pre-wrap">{r.reason}</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-[200px_1fr] gap-3 items-start">
                  <div>
                    <label className="text-xs uppercase text-muted-foreground block mb-1">Status</label>
                    <Select
                      value={draft.status}
                      onValueChange={(v) => updateDraft(r.id, { status: v as Status })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_review">In Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs uppercase text-muted-foreground block mb-1">
                      Internal / customer notes
                    </label>
                    <Textarea
                      rows={3}
                      placeholder="Optional note. Included in the email if status is Approved or Rejected."
                      value={draft.notes}
                      onChange={(e) => updateDraft(r.id, { notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-4">
                  {willEmail && (
                    <span className="text-xs text-muted-foreground inline-flex items-center">
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      Customer will be emailed
                    </span>
                  )}
                  <Button
                    size="sm"
                    disabled={!dirty || savingId === r.id}
                    onClick={() => save(r)}
                  >
                    {savingId === r.id ? "Saving…" : "Save"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
