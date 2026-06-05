import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { CheckCircle2, Circle, Loader2, AlertTriangle, RotateCcw, Play, Pause } from "lucide-react";

type ZipFile = { name: string; size: number };
type StepStatus = "pending" | "running" | "done" | "error" | "skipped";
type Step = {
  key: string;
  label: string;
  status: StepStatus;
  detail?: string;
  attempts?: number;
  error?: string;
};

const COPY_BATCH = 8;
const MAX_RETRIES = 3;
const OLD_SOURCE_FUNCTIONS_URL = "https://kzbcudiorvnsqqgyzusl.functions.supabase.co";
const OLD_ADMIN_TOKEN_SNIPPET = "JSON.parse(localStorage.getItem('sb-kzbcudiorvnsqqgyzusl-auth-token') || '{}').access_token";

function fmt(b: number) {
  if (!b) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
  return `${b.toFixed(1)} ${u[i]}`;
}

async function invoke<T = any>(fn: string, body: any): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}

async function withRetry<T>(fn: () => Promise<T>, onAttempt: (n: number, err?: any) => void): Promise<T> {
  let lastErr: any;
  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      onAttempt(i);
      return await fn();
    } catch (e) {
      lastErr = e;
      onAttempt(i, e);
      if (i < MAX_RETRIES) await new Promise((r) => setTimeout(r, 800 * i));
    }
  }
  throw lastErr;
}

export default function RestoreWizard() {
  const [zips, setZips] = useState<ZipFile[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [sourceKind, setSourceKind] = useState<"zip" | "folder">("zip");
  const [selectedZip, setSelectedZip] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [upsert, setUpsert] = useState(true);
  const [skipStorage, setSkipStorage] = useState(false);
  const [restoreAuthUsers, setRestoreAuthUsers] = useState(true);
  const [sendInvites, setSendInvites] = useState(true);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [steps, setSteps] = useState<Step[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [idMap, setIdMap] = useState<Record<string, string>>({});

  // Cross-project pull state
  const [pullOpen, setPullOpen] = useState(false);
  const [sourceUrl, setSourceUrl] = useState(OLD_SOURCE_FUNCTIONS_URL);
  const [sourceToken, setSourceToken] = useState("");
  const [sourcePath, setSourcePath] = useState("");
  const [sourceBucket, setSourceBucket] = useState<"backups" | "blog-images" | "site-videos" | "email-assets">("backups");
  const [pulling, setPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState<{ done: number; total: number; bytes: number; failed: number } | null>(null);
  const PULL_BATCH = 2;

  const appendLog = (m: string) =>
    setLog((p) => [...p, `[${new Date().toLocaleTimeString()}] ${m}`]);

  const updateStep = (key: string, patch: Partial<Step>) =>
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  const loadSources = async () => {
    const { data, error } = await supabase.storage
      .from("backups")
      .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) { toast.error(`List failed: ${error.message}`); return; }
    const all = data ?? [];
    const z = all
      .filter((f) => f.id !== null && f.name.toLowerCase().endsWith(".zip"))
      .map((f) => ({ name: f.name, size: (f.metadata as any)?.size ?? 0 }));
    const fo = all
      .filter((f) => f.id === null && f.name.startsWith("pps-migrate-"))
      .map((f) => f.name);
    setZips(z);
    setFolders(fo);
    if (z[0] && (!selectedZip || !z.some((file) => file.name === selectedZip))) setSelectedZip(z[0].name);
    if (fo[0] && (!selectedFolder || !fo.includes(selectedFolder))) setSelectedFolder(fo[0]);
  };

  useEffect(() => { loadSources(); }, []);

  const progress = useMemo(() => {
    if (!steps.length) return 0;
    const done = steps.filter((s) => s.status === "done" || s.status === "skipped").length;
    return Math.round((done / steps.length) * 100);
  }, [steps]);

  const waitWhilePaused = async () => {
    while (paused) await new Promise((r) => setTimeout(r, 300));
  };

  const runZip = async () => {
    setRunning(true);
    setPaused(false);
    setLog([]);
    setSteps([{ key: "manifest", label: "Read backup manifest", status: "pending" }]);
    try {
      // ---- Phase: manifest
      updateStep("manifest", { status: "running" });
      appendLog(`Reading manifest for ${selectedZip}…`);
      const m = await withRetry(
        () => invoke<{ tables: string[]; extras: string[]; storage_manifest: any; snapshot: any }>(
          "migrate-import", { phase: "zip_manifest", zipPath: selectedZip }),
        (n, err) => {
          updateStep("manifest", { attempts: n, error: err ? String(err.message || err) : undefined });
          if (err) appendLog(`  manifest attempt ${n} failed: ${err.message || err}`);
        },
      );
      updateStep("manifest", {
        status: "done",
        detail: `${m.tables.length} tables${m.extras?.length ? `, ${m.extras.length} extras skipped` : ""}`,
      });

      // Build dynamic step list
      const authStep: Step[] = restoreAuthUsers
        ? [{ key: "auth", label: `Restore auth users (${sendInvites ? "invite" : "create"})`, status: "pending" }]
        : [];
      const tableSteps: Step[] = m.tables.map((t) => ({ key: `t:${t}`, label: `Restore table: ${t}`, status: "pending" }));
      const buckets = (!skipStorage && m.storage_manifest?.buckets)
        ? Object.entries<any>(m.storage_manifest.buckets).filter(([, info]) => (info?.count ?? 0) > 0)
        : [];
      const bucketSteps: Step[] = buckets.map(([b, info]) => ({
        key: `b:${b}`,
        label: `Storage manifest only: ${b} (${info.count} files)`,
        status: "pending",
      }));
      setSteps((prev) => [...prev, ...authStep, ...tableSteps, ...bucketSteps]);

      // ---- Phase: auth users
      let map: Record<string, string> = {};
      if (restoreAuthUsers) {
        await waitWhilePaused();
        updateStep("auth", { status: "running" });
        try {
          const r = await withRetry(
            () => invoke<{ idMap: Record<string, string>; created: number; matched: number; skipped: number; total: number; failures: any[] }>(
              "migrate-import", { phase: "zip_auth_users", zipPath: selectedZip, sendInvites }),
            (n, err) => err && appendLog(`  auth-users attempt ${n} failed: ${err.message || err}`),
          );
          map = r.idMap || {};
          setIdMap(map);
          const detail = `${r.matched} matched, ${r.created} ${sendInvites ? "invited" : "created"}, ${r.skipped} skipped${r.failures?.length ? `, ${r.failures.length} failed` : ""}`;
          updateStep("auth", { status: "done", detail });
          appendLog(`  auth-users: ${detail}`);
          if (r.failures?.length) for (const f of r.failures.slice(0, 5)) appendLog(`    ⚠ ${f.email}: ${f.error}`);
        } catch (e: any) {
          updateStep("auth", { status: "error", error: e.message || String(e) });
          appendLog(`  ❌ auth-users: ${e.message || e}`);
        }
      }

      // ---- Phase: zip_table per table
      for (const t of m.tables) {
        await waitWhilePaused();
        const key = `t:${t}`;
        updateStep(key, { status: "running" });
        try {
          const r = await withRetry(
            () => invoke<{ rows: number; skipped?: boolean; dropped_unmapped?: number }>(
              "migrate-import", { phase: "zip_table", zipPath: selectedZip, table: t, upsert, idMap: map }),
            (n, err) => {
              updateStep(key, { attempts: n, error: err ? String(err.message || err) : undefined });
              if (err) appendLog(`  ${t} attempt ${n} failed: ${err.message || err}`);
            },
          );
          const dd = r.dropped_unmapped ? ` (${r.dropped_unmapped} dropped, no auth match)` : "";
          updateStep(key, {
            status: r.skipped ? "skipped" : "done",
            detail: r.skipped ? "no data in zip" : `${r.rows} rows${dd}`,
          });
          appendLog(`  ${t}: ${r.skipped ? "skipped" : `${r.rows} rows${dd}`}`);
        } catch (e: any) {
          updateStep(key, { status: "error", error: e.message || String(e) });
          appendLog(`  ❌ ${t}: ${e.message || e}`);
        }
      }

      // ---- Storage manifest note (zips don't include binaries)
      for (const [b, info] of buckets) {
        updateStep(`b:${b}`, { status: "skipped", detail: `${info.count} files listed, re-upload originals` });
      }

      appendLog("✅ Restore wizard complete");
      toast.success("Restore complete");
    } catch (e: any) {
      appendLog(`❌ ${e.message || e}`);
      toast.error(`Restore failed: ${e.message || e}`);
    } finally {
      setRunning(false);
    }
  };

  const runFolder = async () => {
    setRunning(true);
    setPaused(false);
    setLog([]);
    setSteps([{ key: "manifest", label: "Read migration manifest", status: "pending" }]);
    try {
      updateStep("manifest", { status: "running" });
      const m = await withRetry(
        () => invoke<{ manifest: any; table_order: string[] }>(
          "migrate-import", { phase: "manifest", folder: selectedFolder }),
        (n, err) => {
          updateStep("manifest", { attempts: n, error: err ? String(err.message || err) : undefined });
          if (err) appendLog(`  manifest attempt ${n} failed: ${err.message || err}`);
        },
      );
      const tableNames = (m.table_order || []).filter((t) => (m.manifest?.tables ?? {})[t] !== undefined || true);
      const buckets: Record<string, { path: string }[]> = m.manifest?.buckets ?? {};
      updateStep("manifest", {
        status: "done",
        detail: `${tableNames.length} tables, ${Object.keys(buckets).length} buckets`,
      });

      const authStep: Step[] = restoreAuthUsers
        ? [{ key: "auth", label: `Restore auth users (${sendInvites ? "invite" : "create"})`, status: "pending" }]
        : [];
      const tableSteps: Step[] = tableNames.map((t) => ({ key: `t:${t}`, label: `Restore table: ${t}`, status: "pending" }));
      const bucketSteps: Step[] = (skipStorage ? [] : Object.entries(buckets))
        .filter(([, objs]) => objs?.length)
        .map(([b, objs]) => ({ key: `b:${b}`, label: `Copy bucket: ${b} (${objs.length} files)`, status: "pending" }));
      setSteps((prev) => [...prev, ...authStep, ...tableSteps, ...bucketSteps]);

      // auth users
      let map: Record<string, string> = {};
      if (restoreAuthUsers) {
        await waitWhilePaused();
        updateStep("auth", { status: "running" });
        try {
          const r = await withRetry(
            () => invoke<{ idMap: Record<string, string>; created: number; matched: number; skipped: number; failures: any[] }>(
              "migrate-import", { phase: "auth_users", folder: selectedFolder, sendInvites }),
            (n, err) => err && appendLog(`  auth-users attempt ${n} failed: ${err.message || err}`),
          );
          map = r.idMap || {};
          setIdMap(map);
          const detail = `${r.matched} matched, ${r.created} ${sendInvites ? "invited" : "created"}, ${r.skipped} skipped${r.failures?.length ? `, ${r.failures.length} failed` : ""}`;
          updateStep("auth", { status: "done", detail });
          appendLog(`  auth-users: ${detail}`);
          if (r.failures?.length) for (const f of r.failures.slice(0, 5)) appendLog(`    ⚠ ${f.email}: ${f.error}`);
        } catch (e: any) {
          updateStep("auth", { status: "error", error: e.message || String(e) });
        }
      }

      // tables
      for (const t of tableNames) {
        await waitWhilePaused();
        const key = `t:${t}`;
        updateStep(key, { status: "running" });
        try {
          const r = await withRetry(
            () => invoke<{ rows: number; dropped_unmapped?: number }>(
              "migrate-import", { phase: "table", folder: selectedFolder, table: t, upsert, idMap: map }),
            (n, err) => {
              updateStep(key, { attempts: n, error: err ? String(err.message || err) : undefined });
              if (err) appendLog(`  ${t} attempt ${n} failed: ${err.message || err}`);
            },
          );
          const dd = r.dropped_unmapped ? ` (${r.dropped_unmapped} dropped, no auth match)` : "";
          updateStep(key, { status: "done", detail: `${r.rows} rows${dd}` });
        } catch (e: any) {
          updateStep(key, { status: "error", error: e.message || String(e) });
          appendLog(`  ❌ ${t}: ${e.message || e}`);
        }
      }

      // storage
      if (!skipStorage) {
        for (const [bucket, objs] of Object.entries(buckets)) {
          if (!objs?.length) continue;
          await waitWhilePaused();
          const key = `b:${bucket}`;
          updateStep(key, { status: "running", detail: `0/${objs.length}` });
          let copied = 0, failed = 0;
          for (let i = 0; i < objs.length; i += COPY_BATCH) {
            await waitWhilePaused();
            const batch = objs.slice(i, i + COPY_BATCH).map((o) => o.path);
            try {
              const r = await withRetry(
                () => invoke<{ copied: number; failed: number; errors: string[] }>(
                  "migrate-import", { phase: "copy_batch", folder: selectedFolder, bucket, paths: batch }),
                (n, err) => {
                  if (err) appendLog(`  ${bucket} batch attempt ${n} failed: ${err.message || err}`);
                },
              );
              copied += r.copied; failed += r.failed;
              if (r.failed) appendLog(`    ⚠ ${bucket}: ${r.failed} failed (${r.errors.slice(0, 2).join("; ")})`);
            } catch (e: any) {
              failed += batch.length;
              appendLog(`  ❌ ${bucket} batch: ${e.message || e}`);
            }
            updateStep(key, { detail: `${copied}/${objs.length}${failed ? ` (${failed} failed)` : ""}` });
          }
          updateStep(key, {
            status: failed ? "error" : "done",
            detail: `${copied}/${objs.length}${failed ? ` (${failed} failed)` : ""}`,
            error: failed ? `${failed} files failed` : undefined,
          });
        }
      }

      appendLog("✅ Folder restore complete");
      toast.success("Restore complete");
    } catch (e: any) {
      appendLog(`❌ ${e.message || e}`);
      toast.error(`Restore failed: ${e.message || e}`);
    } finally {
      setRunning(false);
    }
  };

  const retryFailed = async () => {
    const failed = steps.filter((s) => s.status === "error");
    if (!failed.length) { toast.info("Nothing to retry"); return; }
    setRunning(true);
    setPaused(false);
    try {
      for (const s of failed) {
        if (s.key.startsWith("t:")) {
          const t = s.key.slice(2);
          updateStep(s.key, { status: "running", error: undefined });
          try {
            const body = sourceKind === "zip"
              ? { phase: "zip_table", zipPath: selectedZip, table: t, upsert, idMap }
              : { phase: "table", folder: selectedFolder, table: t, upsert, idMap };
            const r = await withRetry(
              () => invoke<{ rows: number }>("migrate-import", body),
              (n, err) => err && appendLog(`  retry ${t} attempt ${n}: ${err.message || err}`),
            );
            updateStep(s.key, { status: "done", detail: `${r.rows} rows (retried)` });
          } catch (e: any) {
            updateStep(s.key, { status: "error", error: e.message || String(e) });
          }
        }
      }
    } finally {
      setRunning(false);
    }
  };

  const reset = () => { setSteps([]); setLog([]); };

  const pullFromSource = async () => {
    if (!sourceUrl || !sourceToken) {
      toast.error("Source URL and admin token are required");
      return;
    }
    if (sourceBucket === "backups" && !sourcePath) {
      toast.error("Source path is required for the backups bucket");
      return;
    }
    setPulling(true);
    setPullProgress({ done: 0, total: 0, bytes: 0, failed: 0 });
    const label = sourceBucket === "backups"
      ? `backups/${sourcePath}`
      : `${sourceBucket}/${sourcePath || "(entire bucket)"}`;
    appendLog(`🔄 Pulling ${label} from source project…`);
    try {
      const list = await invoke<{ files: { name: string; size: number; url: string }[]; folder: string; total: number }>(
        "migrate-import",
        { phase: "pull_list", sourceUrl, sourceToken, path: sourcePath, sourceBucket },
      );
      const files = list.files || [];
      if (!files.length) {
        toast.error("No files found at that path in the source project");
        setPulling(false);
        return;
      }
      appendLog(`  Found ${files.length} file(s). Streaming into ${sourceBucket} bucket on this project…`);
      setPullProgress({ done: 0, total: files.length, bytes: 0, failed: 0 });

      const items = files.map((f) => ({ url: f.url, destPath: f.name }));

      let done = 0, bytes = 0, failed = 0;
      for (let i = 0; i < items.length; i += PULL_BATCH) {
        const batch = items.slice(i, i + PULL_BATCH);
        const r = await invoke<{ copied: number; failed: number; bytes: number; errors: string[] }>(
          "migrate-import",
          { phase: "pull_batch", files: batch, upsert: true, destBucket: sourceBucket },
        );
        done += r.copied;
        failed += r.failed;
        bytes += r.bytes;
        if (r.errors?.length) for (const e of r.errors.slice(0, 3)) appendLog(`    ⚠ ${e}`);
        setPullProgress({ done: done + failed, total: items.length, bytes, failed });
      }
      appendLog(`✅ Pull complete: ${done} copied, ${failed} failed, ${fmt(bytes)} transferred`);
      toast.success(`Pulled ${done}/${items.length} files into ${sourceBucket}`);

      // Only refresh / auto-select wizard sources when we pulled into the backups bucket.
      if (sourceBucket === "backups") {
        await loadSources();
        if (sourcePath.endsWith(".zip")) {
          setSourceKind("zip");
          setSelectedZip(sourcePath);
        } else {
          setSourceKind("folder");
          setSelectedFolder(sourcePath);
        }
      }
    } catch (e: any) {
      appendLog(`❌ Pull failed: ${e.message || e}`);
      toast.error(`Pull failed: ${e.message || e}`);
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy">Restore Wizard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Step-by-step restore from a backup (zip or migration folder) into <strong>this</strong> project. Each phase shows progress and retries on failure.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-900 rounded p-3 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            Run this in the <strong>destination</strong> project after copying the backup file/folder into its <code>backups</code> bucket. The wizard will re-create auth users from <code>auth-users.json</code> (passwords/sessions are never exported) and remap profile / author IDs automatically.
          </div>
        </div>

        <div className="border rounded-md">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-navy hover:bg-muted/40"
            onClick={() => setPullOpen((o) => !o)}
            disabled={pulling}
          >
            <span>📥 Pull backup from another project (auto copy into this project's bucket)</span>
            <span className="text-xs text-muted-foreground">{pullOpen ? "Hide" : "Show"}</span>
          </button>
          {pullOpen && (
            <div className="px-3 pb-3 pt-1 space-y-2 text-sm border-t">
              <p className="text-xs text-muted-foreground">
                No Cloud storage download is needed. In the OLD project, sign in as admin, open DevTools console, run&nbsp;
                <code className="text-[10px] break-all">{OLD_ADMIN_TOKEN_SNIPPET}</code>,
                then paste the token below with the backup folder or zip name.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs">Source functions URL</Label>
                  <input
                    className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                    placeholder="https://<source-ref>.functions.supabase.co"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value.trim())}
                    disabled={pulling}
                  />
                </div>
                <div>
                  <Label className="text-xs">Source admin token (JWT)</Label>
                  <input
                    type="password"
                    className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                    placeholder="eyJhbGciOi…"
                    value={sourceToken}
                    onChange={(e) => setSourceToken(e.target.value.trim())}
                    disabled={pulling}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Source bucket</Label>
                  <select
                    className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                    value={sourceBucket}
                    onChange={(e) => setSourceBucket(e.target.value as any)}
                    disabled={pulling}
                  >
                    <option value="backups">backups (DB zip / migration folder)</option>
                    <option value="blog-images">blog-images (live storage)</option>
                    <option value="site-videos">site-videos (live storage)</option>
                    <option value="email-assets">email-assets (live storage)</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs">
                    {sourceBucket === "backups"
                      ? "Source path (folder name or pps-restore-*.zip)"
                      : "Path prefix (optional, leave blank for entire bucket)"}
                  </Label>
                  <input
                    className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                    placeholder={sourceBucket === "backups"
                      ? "pps-backup-2026-05-05T... or pps-restore-pps-backup-...zip"
                      : "leave blank for entire bucket, or e.g. uploads/"}
                    value={sourcePath}
                    onChange={(e) => setSourcePath(e.target.value.trim())}
                    disabled={pulling}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={pullFromSource} disabled={pulling || !sourceUrl || !sourceToken || (sourceBucket === "backups" && !sourcePath)}>
                  {pulling
                    ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Pulling…</>
                    : <>Pull into this project</>}
                </Button>
                {pullProgress && (
                  <span className="text-xs text-muted-foreground">
                    {pullProgress.done}/{pullProgress.total} files
                    {pullProgress.failed ? ` (${pullProgress.failed} failed)` : ""}
                    {pullProgress.bytes ? ` · ${fmt(pullProgress.bytes)}` : ""}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tip: pick <strong>blog-images</strong>, <strong>site-videos</strong>, or <strong>email-assets</strong> to copy live storage binaries directly into this project's matching bucket. Use <strong>backups</strong> for DB zips / migration folders.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Source type</Label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={sourceKind === "zip"} onChange={() => setSourceKind("zip")} disabled={running} />
              Auto-backup .zip (DB only)
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={sourceKind === "folder"} onChange={() => setSourceKind("folder")} disabled={running} />
              Migration folder (DB + storage)
            </label>
          </div>
        </div>

        {sourceKind === "zip" ? (
          <div className="space-y-2">
            <Label className="text-sm">Backup zip</Label>
            <div className="flex gap-2">
              <select
                className="flex-1 border rounded px-3 py-2 text-sm bg-background"
                value={selectedZip}
                onChange={(e) => setSelectedZip(e.target.value)}
                disabled={running}
              >
                <option value="">— select —</option>
                {zips.map((z) => (
                  <option key={z.name} value={z.name}>{z.name} {z.size ? `(${fmt(z.size)})` : ""}</option>
                ))}
              </select>
              <Button variant="outline" onClick={loadSources} disabled={running}>Refresh</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-sm">Migration folder</Label>
            <div className="flex gap-2">
              <select
                className="flex-1 border rounded px-3 py-2 text-sm bg-background"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                disabled={running}
              >
                <option value="">— select —</option>
                {folders.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
              <Button variant="outline" onClick={loadSources} disabled={running}>Refresh</Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Checkbox id="upsert" checked={upsert} onCheckedChange={(v) => setUpsert(!!v)} disabled={running} />
            <Label htmlFor="upsert" className="text-sm cursor-pointer">Upsert (overwrite by id)</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="skip-storage" checked={skipStorage} onCheckedChange={(v) => setSkipStorage(!!v)} disabled={running} />
            <Label htmlFor="skip-storage" className="text-sm cursor-pointer">Skip storage (DB only)</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="restore-auth" checked={restoreAuthUsers} onCheckedChange={(v) => setRestoreAuthUsers(!!v)} disabled={running} />
            <Label htmlFor="restore-auth" className="text-sm cursor-pointer">
              Restore auth users from <code className="text-xs">auth-users.json</code> (recreates accounts &amp; remaps profile IDs)
            </Label>
          </div>
          <div className="flex items-center gap-2 pl-6">
            <Checkbox id="send-invites" checked={sendInvites} onCheckedChange={(v) => setSendInvites(!!v)} disabled={running || !restoreAuthUsers} />
            <Label htmlFor="send-invites" className="text-sm cursor-pointer">
              Send password-set invite email (uncheck to create silently with no password)
            </Label>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={sourceKind === "zip" ? runZip : runFolder}
            disabled={running || (sourceKind === "zip" ? !selectedZip : !selectedFolder)}
          >
            {running ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Running…</> : <><Play className="h-4 w-4 mr-2" /> Start restore</>}
          </Button>
          {running && (
            <Button variant="outline" onClick={() => setPaused((p) => !p)}>
              {paused ? <><Play className="h-4 w-4 mr-2" /> Resume</> : <><Pause className="h-4 w-4 mr-2" /> Pause</>}
            </Button>
          )}
          <Button variant="outline" onClick={retryFailed} disabled={running || !steps.some((s) => s.status === "error")}>
            <RotateCcw className="h-4 w-4 mr-2" /> Retry failed
          </Button>
          <Button variant="ghost" onClick={reset} disabled={running}>Clear</Button>
        </div>
      </Card>

      {steps.length > 0 && (
        <Card className="p-6 space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-navy">Progress</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <ul className="divide-y border rounded">
            {steps.map((s) => (
              <li key={s.key} className="flex items-start gap-3 p-3 text-sm">
                <span className="mt-0.5">
                  {s.status === "done" && <CheckCircle2 className="h-4 w-4 text-[hsl(96_100%_32%)]" />}
                  {s.status === "skipped" && <CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
                  {s.status === "running" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                  {s.status === "pending" && <Circle className="h-4 w-4 text-muted-foreground" />}
                  {s.status === "error" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-navy break-words">{s.label}</div>
                  {s.detail && <div className="text-xs text-muted-foreground break-words">{s.detail}</div>}
                  {s.error && <div className="text-xs text-destructive break-words">⚠ {s.error}</div>}
                </div>
                {s.attempts && s.attempts > 1 && (
                  <span className="text-xs text-muted-foreground shrink-0">×{s.attempts}</span>
                )}
              </li>
            ))}
          </ul>

          {log.length > 0 && (
            <pre className="text-xs bg-muted/40 rounded p-3 max-h-64 overflow-auto whitespace-pre-wrap">
              {log.join("\n")}
            </pre>
          )}
        </Card>
      )}
    </div>
  );
}
