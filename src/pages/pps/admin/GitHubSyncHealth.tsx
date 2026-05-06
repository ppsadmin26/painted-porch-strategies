import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Github, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface SyncStatus {
  status: string;
  last_success_at: string | null;
  last_failure_at: string | null;
  last_check_at: string | null;
  last_error_message: string | null;
  last_alert_sent_at: string | null;
  details: any;
  updated_at: string;
}

interface SyncEvent {
  id: string;
  source: string;
  event_type: string;
  status: string;
  message: string | null;
  created_at: string;
}

export default function GitHubSyncHealth() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [events, setEvents] = useState<SyncEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  const load = async () => {
    setLoading(true);
    const [s, e] = await Promise.all([
      supabase.from("github_sync_status").select("*").eq("id", 1).maybeSingle(),
      supabase.from("github_sync_events").select("*").order("created_at", { ascending: false }).limit(25),
    ]);
    if (s.data) setStatus(s.data as any);
    if (e.data) setEvents(e.data as any);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const runCheck = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("github-sync-check");
      if (error) throw error;
      if ((data as any)?.ok) {
        toast.success("Check complete: " + ((data as any).message ?? "healthy"));
      } else {
        toast.error("Check found a problem: " + ((data as any)?.error ?? (data as any)?.message ?? "unknown"));
      }
      await load();
    } catch (err: any) {
      toast.error(err?.message ?? "Check failed");
    } finally {
      setChecking(false);
    }
  };

  const statusBadge = () => {
    const s = status?.status ?? "unknown";
    if (s === "healthy") return <Badge className="bg-[#70A300] text-white">Healthy</Badge>;
    if (s === "warning") return <Badge className="bg-[#E8A231] text-white">Warning</Badge>;
    if (s === "error") return <Badge className="bg-[#DB0043] text-white">Sync issue</Badge>;
    return <Badge variant="secondary">{s}</Badge>;
  };

  return (
    <div className="px-6 py-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-[#00006B]">
            <Github className="h-6 w-6" /> GitHub Sync Health
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor whether the website repo is staying in sync with Lovable.
          </p>
        </div>
        <Button onClick={runCheck} disabled={checking} variant="default">
          {checking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Run check now
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            Current status {statusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : status ? (
            <>
              <div className="grid sm:grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Last successful event:</span>{" "}
                  {status.last_success_at ? <span className="font-medium">{formatDistanceToNow(new Date(status.last_success_at), { addSuffix: true })}</span> : "never"}
                </div>
                <div><span className="text-muted-foreground">Last failure:</span>{" "}
                  {status.last_failure_at ? <span className="font-medium">{formatDistanceToNow(new Date(status.last_failure_at), { addSuffix: true })}</span> : "none"}
                </div>
                <div><span className="text-muted-foreground">Last check:</span>{" "}
                  {status.last_check_at ? formatDistanceToNow(new Date(status.last_check_at), { addSuffix: true }) : "never"}
                </div>
                <div><span className="text-muted-foreground">Last alert email:</span>{" "}
                  {status.last_alert_sent_at ? formatDistanceToNow(new Date(status.last_alert_sent_at), { addSuffix: true }) : "none"}
                </div>
              </div>
              {status.last_error_message && (
                <div className="mt-3 p-3 rounded-md bg-[#DB0043]/10 text-[#DB0043] text-sm flex gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{status.last_error_message}</span>
                </div>
              )}
            </>
          ) : (
            <p>No status yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent events</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {events.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground p-4">No events yet. Run a check or wait for GitHub to push an event.</p>
            )}
            {events.map(ev => (
              <div key={ev.id} className="flex items-start gap-3 p-3 text-sm">
                {ev.status === "success" ? <CheckCircle2 className="h-4 w-4 text-[#70A300] mt-0.5 shrink-0" />
                  : ev.status === "failure" ? <AlertTriangle className="h-4 w-4 text-[#DB0043] mt-0.5 shrink-0" />
                  : <RefreshCw className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{ev.message ?? ev.event_type}</div>
                  <div className="text-xs text-muted-foreground">
                    {ev.source} • {ev.event_type} • {formatDistanceToNow(new Date(ev.created_at), { addSuffix: true })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Setup</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p>To enable real-time push detection, add this URL as a GitHub webhook (events: <code>push</code>, <code>workflow_run</code>, <code>check_suite</code>):</p>
          <code className="block p-2 bg-muted rounded text-xs break-all">
            https://{import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/github-webhook
          </code>
          <p>Use the <code>GITHUB_WEBHOOK_SECRET</code> value as the webhook secret. A daily commit-freshness check also runs in the background as a backstop.</p>
        </CardContent>
      </Card>
    </div>
  );
}
