import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  Download,
  Play,
  RefreshCw,
  Database,
  CheckCircle2,
  XCircle,
  Calendar,
  AlertTriangle,
  Trash2,
  Clock,
  FileText,
  RotateCw,
  FolderOpen,
  Package,
  FileCode,
  ListChecks,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FailedSteps {
  tables?: string[];
  storage?: { bucket: string; path: string }[];
}
interface LogEntry {
  ts: string;
  level: "info" | "warn" | "error";
  message: string;
  ms?: number;
}
interface BackupRun {
  id: string;
  storage_path: string;
  kind: string;
  status: string; // running | success | partial | failed
  size_bytes: number | null;
  storage_object_count: number | null;
  table_row_counts: Record<string, number> | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  duration_ms: number | null;
  failed_steps: FailedSteps | null;
  parent_run_id: string | null;
  log_count?: number;
  last_log?: { message: string; level: string; ts: string } | null;
  progress?: {
    phase: "queued" | "tables" | "storage" | "finalize" | "done" | "failed";
    tables_done: number;
    tables_total: number;
    tables_failed: number;
    storage_done: number;
    storage_buckets_total: number;
    storage_failed: number;
    is_complete: boolean;
  };
}

interface ScheduleRow {
  jobid: number;
  jobname: string;
  schedule: string;
  active: boolean;
  next_run: string | null;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ", ";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function totalRows(counts: Record<string, number> | null): number {
  if (!counts) return 0;
  return Object.values(counts).reduce((a, b) => a + b, 0);
}

// The two backup schedules we manage. Render rows for these even when the
// admin RPC returns nothing, so admins always have a visible toggle/status.
const KNOWN_SCHEDULES: { jobname: string; label: string }[] = [
  { jobname: "auto-backup-weekly", label: "Every Sunday at 03:00 UTC" },
  { jobname: "auto-backup-monthly", label: "1st of each month at 03:30 UTC" },
];

// Friendly cron schedule label (only the two known patterns).
function describeSchedule(jobname: string, schedule: string): string {
  if (jobname === "auto-backup-weekly") return "Every Sunday at 03:00 UTC";
  if (jobname === "auto-backup-monthly") return "1st of each month at 03:30 UTC";
  return schedule;
}

// Compute the next firing time for our two known cron expressions in UTC.
// Avoids needing an extra dependency just for this page.
function nextRunFor(jobname: string): Date | null {
  const now = new Date();
  if (jobname === "auto-backup-weekly") {
    // Sunday (0) at 03:00 UTC
    const next = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      3, 0, 0, 0,
    ));
    const dow = next.getUTCDay();
    let daysUntilSun = (7 - dow) % 7;
    if (daysUntilSun === 0 && next.getTime() <= now.getTime()) daysUntilSun = 7;
    next.setUTCDate(next.getUTCDate() + daysUntilSun);
    return next;
  }
  if (jobname === "auto-backup-monthly") {
    // 1st of month at 03:30 UTC
    let year = now.getUTCFullYear();
    let month = now.getUTCMonth();
    const candidate = new Date(Date.UTC(year, month, 1, 3, 30, 0, 0));
    if (candidate.getTime() <= now.getTime()) {
      month += 1;
      if (month > 11) { month = 0; year += 1; }
      return new Date(Date.UTC(year, month, 1, 3, 30, 0, 0));
    }
    return candidate;
  }
  return null;
}

export default function BackupsManager() {
  const [runs, setRuns] = useState<BackupRun[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);
  const [togglingJob, setTogglingJob] = useState<string | null>(null);
  const [retentionWeekly, setRetentionWeekly] = useState<number>(30);
  const [retentionMonthly, setRetentionMonthly] = useState<number>(60);
  const [retentionWeeklyInput, setRetentionWeeklyInput] = useState<string>("30");
  const [retentionMonthlyInput, setRetentionMonthlyInput] = useState<string>("60");
  const [savingRetention, setSavingRetention] = useState(false);
  const [pruning, setPruning] = useState(false);
  const [retrying, setRetrying] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [preparingZip, setPreparingZip] = useState<string | null>(null);
  const [exportingSchema, setExportingSchema] = useState(false);
  const [downloadingSnapshot, setDownloadingSnapshot] = useState(false);
  const [snapshotInfo, setSnapshotInfo] = useState<
    | { uploaded_at: string; size_bytes: number; file_count: number; filename: string }
    | null
    | "missing"
  >(null);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
  const [, setNowTick] = useState(0);
  const processQueueInFlightRef = useRef(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [logsRun, setLogsRun] = useState<BackupRun | null>(null);
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [filesOpen, setFilesOpen] = useState(false);
  const [filesRun, setFilesRun] = useState<BackupRun | null>(null);
  const [filesList, setFilesList] = useState<{ name: string; size: number; url: string | null }[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const { toast } = useToast();
  const pollRef = useRef<number | null>(null);

  // Quietly fetch just the runs list (no global loading flag, no schedule/settings refetch).
  // Used by background polling so only the row data updates rather than the whole widget.
  const refreshRunsQuiet = useCallback(async () => {
    try {
      const runsRes = await supabase.functions.invoke("auto-backup", {
        body: { action: "list" },
      });
      if (runsRes.error) return;
      const next = Array.isArray(runsRes.data?.runs) ? runsRes.data.runs : [];
      setRuns((prev) => {
        // Avoid re-rendering if nothing changed (shallow compare on key fields)
        if (prev.length === next.length) {
          let same = true;
          for (let i = 0; i < prev.length; i++) {
            const a = prev[i], b = next[i];
            const aMsg = a.last_log?.message ?? null;
            const bMsg = b.last_log?.message ?? null;
            if (
              a.id !== b.id ||
              a.status !== b.status ||
              a.finished_at !== b.finished_at ||
              a.size_bytes !== b.size_bytes ||
              a.log_count !== b.log_count ||
              aMsg !== bMsg
            ) {
              same = false;
              break;
            }
          }
          if (same) return prev;
        }
        return next;
      });
    } catch {
      // swallow, quiet poll
    }
  }, []);

  const tickRunningBackups = useCallback(async () => {
    if (processQueueInFlightRef.current) return;
    processQueueInFlightRef.current = true;
    try {
      await supabase.functions.invoke("auto-backup", {
        body: { action: "process-queue" },
      });
    } catch {
      // best-effort nudge only
    } finally {
      processQueueInFlightRef.current = false;
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      // Backup runs via edge function (uses service role to read backup_runs)
      const runsRes = await supabase.functions.invoke("auto-backup", {
        body: { action: "list" },
      });
      if (runsRes.error) throw runsRes.error;
      setRuns(Array.isArray(runsRes.data?.runs) ? runsRes.data.runs : []);

      // Schedules via SECURITY DEFINER RPC (admin-only)
      const schedRes = await supabase.rpc("admin_list_backup_schedules");
      if (schedRes.error) throw schedRes.error;
      setSchedules((schedRes.data ?? []) as ScheduleRow[]);

      // Retention setting (admin-readable via RLS)
      const setRes = await supabase
        .from("backup_settings")
        .select("retention_days_weekly, retention_days_monthly")
        .eq("id", true)
        .maybeSingle();
      if (!setRes.error && setRes.data) {
        const w = Number((setRes.data as any).retention_days_weekly) || 30;
        const m = Number((setRes.data as any).retention_days_monthly) || 60;
        setRetentionWeekly(w);
        setRetentionMonthly(m);
        setRetentionWeeklyInput(String(w));
        setRetentionMonthlyInput(String(m));
      }
    } catch (e: any) {
      toast({
        title: "Could not load backups",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // Poll while any run is still in 'running' state so the UI reflects
  // background progress without the admin needing to click Refresh.
  // Uses refreshRunsQuiet so only the row data updates, the surrounding
  // widget never enters its loading skeleton state.
  useEffect(() => {
    const hasRunning = runs.some((r) => r.status === "running");
    if (!hasRunning) {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    if (pollRef.current) return;
    tickRunningBackups();
    pollRef.current = window.setInterval(() => {
      tickRunningBackups();
      refreshRunsQuiet();
    }, 4000);
    return () => {
      if (pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [runs, refreshRunsQuiet, tickRunningBackups]);

  // Re-render every second while any backup is running so elapsed timers tick.
  useEffect(() => {
    const hasRunning = runs.some((r) => r.status === "running");
    if (!hasRunning) return;
    const id = window.setInterval(() => setNowTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, [runs]);

  const cancelRun = async (run: BackupRun) => {
    setCancelling(run.id);
    try {
      const { error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "cancel", run_id: run.id },
      });
      if (error) throw error;
      toast({ title: "Backup cancelled" });
      await loadAll();
    } catch (e: any) {
      toast({
        title: "Cancel failed",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setCancelling(null);
    }
  };

  const openLogs = async (run: BackupRun) => {
    setLogsRun(run);
    setLogEntries([]);
    setLogsOpen(true);
    setLogsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "logs", run_id: run.id },
      });
      if (error) throw error;
      const entries = (data?.run?.logs ?? []) as LogEntry[];
      setLogEntries(Array.isArray(entries) ? entries : []);
    } catch (e: any) {
      toast({
        title: "Could not load logs",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setLogsLoading(false);
    }
  };

  const retryRun = async (run: BackupRun) => {
    setRetrying(run.id);
    try {
      const { data, error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "retry", run_id: run.id },
      });
      if (error) throw error;
      const t = typeof data?.tables === "number" ? `${data.tables} table(s)` : "all tables";
      const s = typeof data?.storage_files === "number" ? `${data.storage_files} file(s)` : "all storage";
      toast({
        title: "Retry started",
        description: `Re-running ${t} and ${s} in the background.`,
      });
      await loadAll();
    } catch (e: any) {
      toast({
        title: "Retry failed to start",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setRetrying(null);
    }
  };

  const runBackup = async (kind: "weekly" | "monthly" | "manual") => {
    setRunning(kind);
    try {
      const { data, error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "run", kind },
      });
      if (error) throw error;
      toast({
        title: "Backup started",
        description:
          "Running in smaller background steps now. Refresh history to watch progress.",
      });
      await loadAll();
    } catch (e: any) {
      toast({
        title: "Backup failed",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setRunning(null);
    }
  };

  const downloadBackup = async (path: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "signed-url", path },
      });
      if (error) throw error;
      const url = data?.url;
      if (!url) throw new Error("No signed URL returned");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast({
        title: "Download failed",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    }
  };

  const openFiles = async (run: BackupRun) => {
    setFilesRun(run);
    setFilesList([]);
    setFilesOpen(true);
    setFilesLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "list-files", path: run.storage_path },
      });
      if (error) throw error;
      setFilesList(Array.isArray(data?.files) ? data.files : []);
    } catch (e: any) {
      toast({
        title: "Could not list files",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setFilesLoading(false);
    }
  };

  const prepareRestoreZip = async (path?: string) => {
    const key = path ?? "__latest__";
    setPreparingZip(key);
    try {
      toast({
        title: "Preparing restore zip…",
        description: "Bundling restore data and metadata into one portable zip.",
      });
      const { data, error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "prepare-restore-zip", ...(path ? { path } : {}) },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const url = data?.url;
      if (!url) throw new Error("No signed URL returned");
      const failures = Array.isArray(data?.failures) ? data.failures.length : 0;
      const filename = data?.zipName || data?.path?.split("/").pop() || `pps-restore-${Date.now()}.zip`;
      toast({
        title: "Restore zip ready",
        description: `${data.files_added} files bundled${failures ? `, ${failures} failed` : ""}. Starting download…`,
      });
      // Force a real download (popup blockers swallow window.open from async handlers).
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
      } catch (dlErr) {
        // Fallback: same-tab navigation always works even if popups are blocked.
        window.location.href = url;
      }
      await loadAll();
    } catch (e: any) {
      toast({
        title: "Could not prepare restore zip",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setPreparingZip(null);
    }
  };

  const exportSchemaSql = async () => {
    setExportingSchema(true);
    try {
      toast({ title: "Exporting full schema SQL…" });
      const { data, error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "export-schema-sql" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (!data?.url) throw new Error("No signed URL returned");
      toast({
        title: "Schema SQL ready",
        description: `${(data.bytes / 1024).toFixed(1)} KB. Paste into your personal Supabase SQL editor.`,
      });
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      toast({
        title: "Could not export schema",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setExportingSchema(false);
    }
  };

  // Fetch the source-snapshot manifest so the UI can show "last refreshed"
  const loadSnapshotInfo = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "signed-url", path: "source-snapshots/latest.json" },
      });
      if (error || !data?.url) {
        setSnapshotInfo("missing");
        return;
      }
      const res = await fetch(data.url);
      if (!res.ok) {
        setSnapshotInfo("missing");
        return;
      }
      const json = await res.json();
      setSnapshotInfo(json);
    } catch {
      setSnapshotInfo("missing");
    }
  }, []);

  useEffect(() => {
    loadSnapshotInfo();
  }, [loadSnapshotInfo]);

  const downloadSourceSnapshot = async () => {
    setDownloadingSnapshot(true);
    try {
      const { data, error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "signed-url", path: "source-snapshots/latest.zip" },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("No snapshot available yet. Ask Lovable in chat to generate one.");
      window.open(data.url, "_blank", "noopener,noreferrer");
      toast({
        title: "Source snapshot download started",
        description: "Save it somewhere outside Lovable (Drive, Dropbox, local disk).",
      });
    } catch (e: any) {
      toast({
        title: "Could not download snapshot",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setDownloadingSnapshot(false);
    }
  };

  const downloadSecretsChecklist = async () => {
    setLoadingChecklist(true);
    try {
      const { data, error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "secrets-checklist" },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const blob = new Blob([data.content], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename ?? "secrets-checklist.md";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast({
        title: "Secrets checklist downloaded",
        description: `${data.names?.length ?? 0} secret names listed.`,
      });
    } catch (e: any) {
      toast({
        title: "Could not generate checklist",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setLoadingChecklist(false);
    }
  };
  const deleteBackup = async (path: string) => {
    try {
      const { error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "delete", path },
      });
      if (error) throw error;
      toast({ title: "Backup deleted" });
      await loadAll();
    } catch (e: any) {
      toast({
        title: "Delete failed",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    }
  };

  const saveRetention = async () => {
    const w = Math.floor(Number(retentionWeeklyInput));
    const m = Math.floor(Number(retentionMonthlyInput));
    const valid = (n: number) => Number.isFinite(n) && n >= 1 && n <= 3650;
    if (!valid(w) || !valid(m)) {
      toast({
        title: "Invalid retention",
        description: "Enter a number of days between 1 and 3650 for each.",
        variant: "destructive",
      });
      return;
    }
    setSavingRetention(true);
    try {
      const { error } = await supabase
        .from("backup_settings")
        .update({
          retention_days_weekly: w,
          retention_days_monthly: m,
          updated_at: new Date().toISOString(),
        } as any)
        .eq("id", true);
      if (error) throw error;
      setRetentionWeekly(w);
      setRetentionMonthly(m);
      toast({
        title: "Retention saved",
        description: `Weekly kept ${w} days, monthly kept ${m} days. Applies on the next prune.`,
      });
    } catch (e: any) {
      toast({
        title: "Could not save retention",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setSavingRetention(false);
    }
  };

  const applyRetentionNow = async () => {
    setPruning(true);
    try {
      const { data, error } = await supabase.functions.invoke("auto-backup", {
        body: { action: "prune" },
      });
      if (error) throw error;
      const deleted = data?.deleted ?? 0;
      const w = data?.retention_days_weekly ?? retentionWeekly;
      const m = data?.retention_days_monthly ?? retentionMonthly;
      toast({
        title: deleted ? "Old backups removed" : "Nothing to prune",
        description: deleted
          ? `Deleted ${deleted} backup${deleted === 1 ? "" : "s"} (weekly > ${w}d, monthly > ${m}d).`
          : `No backups older than the policy (weekly ${w}d, monthly ${m}d).`,
      });
      await loadAll();
    } catch (e: any) {
      toast({
        title: "Prune failed",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setPruning(false);
    }
  };

  const toggleSchedule = async (jobname: string, active: boolean) => {
    setTogglingJob(jobname);
    try {
      const { error } = await supabase.rpc("admin_set_backup_schedule_active", {
        _jobname: jobname,
        _active: active,
      });
      if (error) throw error;
      toast({
        title: active ? "Schedule enabled" : "Schedule paused",
        description: jobname.replace("auto-backup-", "") + " backup",
      });
      await loadAll();
    } catch (e: any) {
      toast({
        title: "Could not change schedule",
        description: e?.message ?? String(e),
        variant: "destructive",
      });
    } finally {
      setTogglingJob(null);
    }
  };

  const lastSuccess = runs.find((r) => r.status === "success");
  const lastFailure = runs.find((r) => r.status === "failed");

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy mb-2 flex items-center gap-3">
            <Database className="w-8 h-8 text-primary" />
            Backups
          </h1>
          <p className="text-muted-foreground font-montserrat max-w-2xl">
            Snapshots of database tables and storage manifests. Old backups
            are removed automatically based on your retention policy below.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => prepareRestoreZip()}
            disabled={preparingZip !== null}
            title="Bundle the latest successful backup into one downloadable restore zip"
          >
            {preparingZip ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Package className="w-4 h-4 mr-2" />
            )}
            Prepare restore zip
          </Button>
          <Button
            variant="outline"
            onClick={exportSchemaSql}
            disabled={exportingSchema}
            title="Export full database schema as a single .sql file (paste into your personal Supabase SQL editor)"
          >
            {exportingSchema ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileCode className="w-4 h-4 mr-2" />
            )}
            Export schema SQL
          </Button>
          <Button
            variant="outline"
            onClick={downloadSecretsChecklist}
            disabled={loadingChecklist}
            title="Download a markdown checklist of every secret name the new project needs"
          >
            {loadingChecklist ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ListChecks className="w-4 h-4 mr-2" />
            )}
            Secrets checklist
          </Button>
          <Button
            onClick={() => runBackup("manual")}
            disabled={running !== null}
            className="bg-primary hover:bg-primary/90"
          >
            {running ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Run backup now
          </Button>
        </div>
      </div>

      {/* Quick status cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-montserrat mb-1">
            Last successful backup
          </div>
          {lastSuccess ? (
            <>
              <div className="font-poppins font-semibold text-navy">
                {new Date(lastSuccess.created_at).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground font-montserrat">
                {lastSuccess.kind} · {formatBytes(lastSuccess.size_bytes)} ·{" "}
                {totalRows(lastSuccess.table_row_counts).toLocaleString()} rows
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No successful backups yet</div>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-montserrat mb-1">
            Last failure
          </div>
          {lastFailure ? (
            <>
              <div className="font-poppins font-semibold text-[#DB0043]">
                {new Date(lastFailure.created_at).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground font-montserrat truncate">
                {lastFailure.error_message ?? "Unknown error"}
              </div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">No failures recorded</div>
          )}
        </Card>
        <Card className="p-4">
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-montserrat mb-1">
            Total backups stored
          </div>
          <div className="font-poppins font-semibold text-navy text-2xl">
            {runs.filter((r) => r.status === "success").length}
            <span className="text-sm text-muted-foreground font-normal"> stored</span>
          </div>
        </Card>
      </div>

      {/* Source code snapshot info */}
      <Card className="p-6 mb-8 border-l-4 border-l-navy bg-navy/5">
        <div className="flex items-center gap-3 mb-3">
          <FileCode className="w-5 h-5 text-navy" />
          <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-navy">
            Source Code Snapshots <span className="text-xs font-normal text-muted-foreground">(disaster recovery)</span>
          </h2>
        </div>
        <div className="text-sm font-montserrat text-muted-foreground space-y-2">
          <p>
            The backups on this page capture your <strong className="text-navy">database and storage buckets</strong>{" "}
           , they do <strong className="text-navy">not</strong> include your React frontend or edge function source code. That code lives in
            Lovable + GitHub.
          </p>
          <p>
            <strong className="text-navy">If GitHub sync ever breaks</strong> (like the recent oversized-video incident),
            ask Lovable in chat:{" "}
            <em className="text-navy font-semibold">"Generate a source code snapshot zip of the current Lovable filesystem."</em>
          </p>
          <p>
            Lovable will package the live <code className="text-xs bg-muted px-1 rounded">src/</code>,{" "}
            <code className="text-xs bg-muted px-1 rounded">public/</code>,{" "}
            <code className="text-xs bg-muted px-1 rounded">supabase/functions/</code>, and config files into a downloadable
            zip, independent of GitHub. Excludes <code className="text-xs bg-muted px-1 rounded">node_modules</code>,{" "}
            <code className="text-xs bg-muted px-1 rounded">.git</code>, builds, and any video files (so the original problem
            can't repeat).
          </p>
          <p className="text-xs italic">
            Recommended cadence: before any risky change, and weekly during normal operation. Store the zip somewhere outside
            Lovable (Google Drive, Dropbox, local disk).
          </p>
        </div>

        {/* Download button + last-refreshed status */}
        <div className="mt-5 pt-5 border-t border-navy/20 flex flex-wrap items-center gap-4">
          <Button
            onClick={downloadSourceSnapshot}
            disabled={downloadingSnapshot || snapshotInfo === "missing"}
            className="bg-navy hover:bg-navy/90 text-white"
          >
            {downloadingSnapshot ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download Source Snapshot
          </Button>
          <div className="text-xs font-montserrat text-muted-foreground">
            {snapshotInfo === null && "Checking latest snapshot…"}
            {snapshotInfo === "missing" && (
              <span className="text-[#DB0043]">
                No snapshot uploaded yet. Ask Lovable in chat: <em>"Refresh the source snapshot."</em>
              </span>
            )}
            {snapshotInfo && typeof snapshotInfo === "object" && (
              <>
                <strong className="text-navy">Last refreshed:</strong>{" "}
                {new Date(snapshotInfo.uploaded_at).toLocaleString()}
                {" · "}
                {formatBytes(snapshotInfo.size_bytes)}
                {" · "}
                {snapshotInfo.file_count.toLocaleString()} files
              </>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Clock className="w-5 h-5 text-primary" />
          <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-navy">
            Retention policy
          </h2>
        </div>
        <p className="text-sm text-muted-foreground font-montserrat mb-4">
          Weekly and monthly backups are kept for different periods. Anything
          older is deleted automatically each time a new backup runs. You can
          also apply the policy now.
        </p>
        <div className="flex items-end gap-3 flex-wrap">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="retention-weekly"
              className="text-xs font-montserrat text-muted-foreground"
            >
              Keep weekly backups for (days)
            </label>
            <Input
              id="retention-weekly"
              type="number"
              min={1}
              max={3650}
              value={retentionWeeklyInput}
              onChange={(e) => setRetentionWeeklyInput(e.target.value)}
              className="w-36"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="retention-monthly"
              className="text-xs font-montserrat text-muted-foreground"
            >
              Keep monthly backups for (days)
            </label>
            <Input
              id="retention-monthly"
              type="number"
              min={1}
              max={3650}
              value={retentionMonthlyInput}
              onChange={(e) => setRetentionMonthlyInput(e.target.value)}
              className="w-36"
            />
          </div>
          <Button
            onClick={saveRetention}
            disabled={
              savingRetention ||
              !retentionWeeklyInput ||
              !retentionMonthlyInput ||
              (Number(retentionWeeklyInput) === retentionWeekly &&
                Number(retentionMonthlyInput) === retentionMonthly)
            }
          >
            {savingRetention && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save
          </Button>
          <Button
            variant="outline"
            onClick={applyRetentionNow}
            disabled={pruning}
          >
            {pruning ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            Apply now
          </Button>
          <span className="text-xs text-muted-foreground font-montserrat ml-auto">
            Current: weekly {retentionWeekly}d / monthly {retentionMonthly}d
          </span>
        </div>
      </Card>

      {/* Schedules */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-navy">Automated schedule</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAll}
            disabled={loading}
            className="font-montserrat"
          >
            <RefreshCw className={`w-3 h-3 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        <div className="space-y-3">
          {KNOWN_SCHEDULES.map((known) => {
            const found = schedules.find((s) => s.jobname === known.jobname);
            const isUnknown = !found;
            const active = found?.active ?? false;
            const computedNext = nextRunFor(known.jobname);
            return (
              <div
                key={known.jobname}
                className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-card flex-wrap"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-poppins font-semibold text-navy capitalize">
                    {known.jobname.replace("auto-backup-", "")} backup
                  </div>
                  <div className="text-sm text-muted-foreground font-montserrat">
                    {known.label}
                  </div>
                  {isUnknown ? (
                    <div className="text-xs text-[#DB0043] font-montserrat mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Status unavailable, click Refresh or sign in as an admin.
                    </div>
                  ) : active && computedNext ? (
                    <div className="text-xs text-muted-foreground/80 font-montserrat mt-1">
                      Next run: {computedNext.toLocaleString()}
                    </div>
                  ) : !active ? (
                    <div className="text-xs text-[#DB0043] font-montserrat mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Schedule is paused
                    </div>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground font-montserrat">
                    {isUnknown ? ", " : active ? "On" : "Off"}
                  </span>
                  <Switch
                    checked={active}
                    disabled={togglingJob === known.jobname || isUnknown}
                    onCheckedChange={(v) => toggleSchedule(known.jobname, v)}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground font-montserrat">
          Weekly runs every Sunday at 03:00 UTC. Monthly runs on the 1st at 03:30 UTC. Toggle a schedule off to pause it without deleting it.
        </p>
      </Card>

      {/* History */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 pb-3 flex items-center justify-between">
          <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-navy">Backup history</h2>
          <span className="text-xs text-muted-foreground font-montserrat">
            Showing last {runs.length}
          </span>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : runs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground font-montserrat">
            No backups yet. Click "Run backup now" to create the first one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Kind</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Size</TableHead>
                  <TableHead className="text-right">Rows</TableHead>
                  <TableHead className="text-right">Files</TableHead>
                  <TableHead>Phase / progress</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-montserrat text-sm whitespace-nowrap">
                      {new Date(r.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="capitalize text-sm">{r.kind}</TableCell>
                    <TableCell>
                      {r.status === "success" ? (
                        <Badge variant="outline" className="border-[#70A300] text-[#70A300] gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Success
                        </Badge>
                      ) : r.status === "running" ? (
                        <Badge variant="outline" className="border-primary text-primary gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" /> Running
                        </Badge>
                      ) : r.status === "partial" ? (
                        <Badge variant="outline" className="border-[#E8A231] text-[#E8A231] gap-1">
                          <AlertTriangle className="w-3 h-3" /> Partial
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-[#DB0043] text-[#DB0043] gap-1">
                          <XCircle className="w-3 h-3" /> Failed
                        </Badge>
                      )}
                      {r.parent_run_id && (
                        <div className="text-[10px] text-muted-foreground mt-1">retry</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {formatBytes(r.size_bytes)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {totalRows(r.table_row_counts).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {r.storage_object_count ?? ", "}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground max-w-xs">
                      {r.status === "running" ? (
                        (() => {
                          const lastTs = r.last_log?.ts
                            ? new Date(r.last_log.ts).getTime()
                            : r.started_at
                              ? new Date(r.started_at).getTime()
                              : Date.now();
                          const idleSec = Math.floor((Date.now() - lastTs) / 1000);
                          const elapsedSec = r.started_at
                            ? Math.floor((Date.now() - new Date(r.started_at).getTime()) / 1000)
                            : 0;
                          const stuck = idleSec >= 60;
                          const p = r.progress;
                          const phaseLabel =
                            p?.phase === "tables" ? `📋 Database tables (${p.tables_done}/${p.tables_total})` :
                            p?.phase === "storage" ? `🗂 Storage files (${p.storage_done} copied)` :
                            p?.phase === "finalize" ? "📦 Writing manifest & snapshot" :
                            p?.phase === "queued" ? "⏳ Queued" :
                            "⏳ Starting…";
                          return (
                            <>
                              <div className={`font-semibold ${stuck ? "text-[#DB0043]" : "text-primary"}`}>
                                {stuck && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                                {phaseLabel}
                              </div>
                              <div className="truncate text-muted-foreground" title={r.last_log?.message ?? ""}>
                                {r.last_log?.message ?? "Starting…"}
                              </div>
                              <div className={`text-[10px] ${stuck ? "text-[#DB0043]" : "text-muted-foreground/70"}`}>
                                {r.started_at ? `${elapsedSec}s elapsed · ${r.log_count ?? 0} steps` : "queued"}
                                {stuck && ` · stuck ${idleSec}s, no progress`}
                              </div>
                            </>
                          );
                        })()
                      ) : (
                        (() => {
                          const p = r.progress;
                          const isFailed = r.status === "failed" || r.status === "partial";
                          return (
                            <>
                              {isFailed ? (
                                <div className="truncate text-[#DB0043]" title={r.error_message ?? ""}>
                                  ⚠ {r.error_message ?? "Unknown error"}
                                </div>
                              ) : p?.is_complete ? (
                                <div className="text-[#70A300] font-semibold">
                                  ✓ Complete (database + storage + manifest)
                                </div>
                              ) : (
                                <div className="text-[#E8A231] font-semibold">
                                  ⚠ Incomplete
                                </div>
                              )}
                              {p && (
                                <div className="text-[10px] text-muted-foreground/80">
                                  Tables: {p.tables_done}/{p.tables_total}
                                  {p.tables_failed > 0 && ` (${p.tables_failed} failed)`}
                                  {" · "}Storage: {p.storage_done} files
                                  {p.storage_failed > 0 && ` (${p.storage_failed} failed)`}
                                </div>
                              )}
                              <div className="truncate text-[10px] text-muted-foreground/60" title={r.storage_path}>
                                {r.storage_path}
                              </div>
                              {r.duration_ms != null && (
                                <div className="text-[10px] text-muted-foreground/70">
                                  {(r.duration_ms / 1000).toFixed(1)}s
                                </div>
                              )}
                            </>
                          );
                        })()
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        title="View logs"
                        onClick={() => openLogs(r)}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      {(r.status === "failed" || r.status === "partial") && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="Retry failed steps"
                          onClick={() => retryRun(r)}
                          disabled={retrying === r.id}
                        >
                          {retrying === r.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCw className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      {r.status === "running" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[#DB0043] hover:text-[#DB0043]"
                          title="Cancel this backup"
                          onClick={() => cancelRun(r)}
                          disabled={cancelling === r.id}
                        >
                          {cancelling === r.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                        </Button>
                      )}
                      {(r.status === "success" || r.status === "partial") && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Browse & download backup files"
                            onClick={() => openFiles(r)}
                          >
                            <FolderOpen className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Download backup manifest"
                            onClick={() => downloadBackup(r.storage_path)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-[#DB0043] hover:text-[#DB0043]" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this backup?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This permanently removes the backup file and its history record.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-[#DB0043] hover:bg-[#DB0043]/90"
                              onClick={() => deleteBackup(r.storage_path)}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Logs dialog */}
      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-poppins">
              Backup logs
              {logsRun && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {logsRun.kind} · {new Date(logsRun.created_at).toLocaleString()}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {logsRun?.failed_steps && (logsRun.failed_steps.tables?.length || logsRun.failed_steps.storage?.length) ? (
                <span>
                  Failed: {logsRun.failed_steps.tables?.length ?? 0} table(s),{" "}
                  {logsRun.failed_steps.storage?.length ?? 0} storage file(s).
                  Use the retry button to re-run only these.
                </span>
              ) : (
                <span>Step-by-step log captured during the run.</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/40 rounded-md p-3 max-h-[60vh] overflow-y-auto font-mono text-xs">
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : logEntries.length === 0 ? (
              <div className="text-muted-foreground py-4 text-center">No log entries.</div>
            ) : (
              logEntries.map((e, i) => (
                <div
                  key={i}
                  className={
                    "whitespace-pre-wrap break-words " +
                    (e.level === "error"
                      ? "text-[#DB0043]"
                      : e.level === "warn"
                      ? "text-[#E8A231]"
                      : "text-foreground/80")
                  }
                >
                  <span className="text-muted-foreground/70">
                    [{new Date(e.ts).toLocaleTimeString()}{e.ms != null ? ` +${e.ms}ms` : ""}]
                  </span>{" "}
                  <span className="uppercase">{e.level}</span> · {e.message}
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Files dialog */}
      <Dialog open={filesOpen} onOpenChange={setFilesOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-poppins">
              Backup files
              {filesRun && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  {filesRun.kind} · {new Date(filesRun.created_at).toLocaleString()}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>
              {filesRun?.storage_path && (
                <span className="font-mono text-xs">backups/{filesRun.storage_path}/</span>
              )}{" "}
              · Download links expire in 10 minutes.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted/40 rounded-md p-3 max-h-[60vh] overflow-y-auto text-xs">
            {filesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : filesList.length === 0 ? (
              <div className="text-muted-foreground py-4 text-center">No files found.</div>
            ) : (
              <div className="space-y-1">
                <div className="text-muted-foreground mb-2">
                  {filesList.length} file(s) · {formatBytes(filesList.reduce((s, f) => s + (f.size || 0), 0))} total
                </div>
                {filesList.map((f) => {
                  const display = filesRun?.storage_path
                    ? f.name.replace(`${filesRun.storage_path}/`, "")
                    : f.name;
                  return (
                    <div key={f.name} className="flex items-center justify-between gap-2 py-1 border-b border-border/40">
                      <span className="font-mono break-all flex-1">{display}</span>
                      <span className="text-muted-foreground shrink-0">{formatBytes(f.size)}</span>
                      {f.url ? (
                        <a
                          href={f.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="text-primary hover:underline shrink-0 inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Download
                        </a>
                      ) : (
                        <span className="text-muted-foreground shrink-0">, </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
