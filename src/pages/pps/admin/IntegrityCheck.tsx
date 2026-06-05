import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, AlertTriangle, Loader2, Play, Download } from "lucide-react";

type TableRow = {
  table: string;
  expected: number;
  actual: number;
  diff: number;
  status: "ok" | "missing" | "extra" | "error";
  error?: string;
};
type BucketRow = {
  bucket: string;
  expected: number;
  actual: number;
  diff: number;
  expected_bytes?: number;
  actual_bytes?: number;
  status: "ok" | "missing" | "extra" | "unknown" | "error";
  error?: string;
};
type VerifyResult = {
  source: "folder" | "zip";
  tables: TableRow[];
  buckets: BucketRow[];
  summary: {
    tables_checked: number; tables_ok: number; tables_mismatch: number;
    buckets_checked: number; buckets_ok: number; buckets_mismatch: number;
  };
};

function fmt(b?: number) {
  if (!b) return ", ";
  const u = ["B", "KB", "MB", "GB"]; let i = 0; let v = b;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(1)} ${u[i]}`;
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    ok: "bg-[hsl(96_100%_32%)]/10 text-[hsl(96_60%_25%)] border-[hsl(96_100%_32%)]/30",
    missing: "bg-destructive/10 text-destructive border-destructive/30",
    extra: "bg-amber-100 text-amber-900 border-amber-300",
    unknown: "bg-muted text-muted-foreground border-border",
    error: "bg-destructive/10 text-destructive border-destructive/30",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${map[status] ?? map.unknown}`}>
      {status}
    </span>
  );
}

export default function IntegrityCheck() {
  const [zips, setZips] = useState<{ name: string; size: number }[]>([]);
  const [folders, setFolders] = useState<string[]>([]);
  const [sourceKind, setSourceKind] = useState<"zip" | "folder">("zip");
  const [selectedZip, setSelectedZip] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<VerifyResult | null>(null);

  const loadSources = async () => {
    const { data, error } = await supabase.storage
      .from("backups")
      .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) { toast.error(`List failed: ${error.message}`); return; }
    const all = data ?? [];
    const z = all
      .filter((f) => f.id !== null && (f.name.startsWith("pps-backup-") || f.name.startsWith("pps-restore-")) && f.name.endsWith(".zip"))
      .map((f) => ({ name: f.name, size: (f.metadata as any)?.size ?? 0 }));
    const fo = all.filter((f) => f.id === null && f.name.startsWith("pps-")).map((f) => f.name);
    setZips(z);
    setFolders(fo);
    if (z[0] && !selectedZip) setSelectedZip(z[0].name);
    if (fo[0] && !selectedFolder) setSelectedFolder(fo[0]);
  };

  useEffect(() => { loadSources(); }, []);

  const runCheck = async () => {
    setRunning(true);
    setResult(null);
    try {
      const body = sourceKind === "zip"
        ? { phase: "verify", zipPath: selectedZip }
        : { phase: "verify", folder: selectedFolder };
      const { data, error } = await supabase.functions.invoke("migrate-import", { body });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setResult(data as VerifyResult);
      const s = (data as VerifyResult).summary;
      if (s.tables_mismatch === 0 && s.buckets_mismatch === 0) {
        toast.success(`All clear: ${s.tables_ok}/${s.tables_checked} tables, ${s.buckets_ok}/${s.buckets_checked} buckets match`);
      } else {
        toast.warning(`Mismatches: ${s.tables_mismatch} tables, ${s.buckets_mismatch} buckets`);
      }
    } catch (e: any) {
      toast.error(`Verify failed: ${e.message || e}`);
    } finally {
      setRunning(false);
    }
  };

  const exportJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `integrity-${sourceKind === "zip" ? selectedZip : selectedFolder}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy">Integrity Check</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Compare row counts and storage object counts in <strong>this</strong> project against a backup manifest. Mismatches are flagged so you can re-run a restore phase.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Backup source</Label>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={sourceKind === "zip"} onChange={() => setSourceKind("zip")} disabled={running} />
              Backup zip
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={sourceKind === "folder"} onChange={() => setSourceKind("folder")} disabled={running} />
              Migration folder
            </label>
          </div>
        </div>

        {sourceKind === "zip" ? (
          <div className="flex gap-2">
            <select
              className="flex-1 border rounded px-3 py-2 text-sm bg-background"
              value={selectedZip}
              onChange={(e) => setSelectedZip(e.target.value)}
              disabled={running}
            >
              <option value="">,  select zip , </option>
              {zips.map((z) => <option key={z.name} value={z.name}>{z.name} ({fmt(z.size)})</option>)}
            </select>
            <Button variant="outline" onClick={loadSources} disabled={running}>Refresh</Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <select
              className="flex-1 border rounded px-3 py-2 text-sm bg-background"
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              disabled={running}
            >
              <option value="">,  select folder , </option>
              {folders.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <Button variant="outline" onClick={loadSources} disabled={running}>Refresh</Button>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={runCheck}
            disabled={running || (sourceKind === "zip" ? !selectedZip : !selectedFolder)}
          >
            {running
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Checking…</>
              : <><Play className="h-4 w-4 mr-2" /> Run integrity check</>}
          </Button>
          {result && (
            <Button variant="outline" onClick={exportJson}>
              <Download className="h-4 w-4 mr-2" /> Export report
            </Button>
          )}
        </div>
      </Card>

      {result && (
        <>
          <Card className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-xs text-muted-foreground">Tables OK</div>
                <div className="text-2xl font-semibold text-navy">
                  {result.summary.tables_ok}/{result.summary.tables_checked}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Tables mismatched</div>
                <div className={`text-2xl font-semibold ${result.summary.tables_mismatch ? "text-destructive" : "text-navy"}`}>
                  {result.summary.tables_mismatch}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Buckets OK</div>
                <div className="text-2xl font-semibold text-navy">
                  {result.summary.buckets_ok}/{result.summary.buckets_checked}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Buckets mismatched</div>
                <div className={`text-2xl font-semibold ${result.summary.buckets_mismatch ? "text-destructive" : "text-navy"}`}>
                  {result.summary.buckets_mismatch}
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-navy">Tables</h2>
              <span className="text-xs text-muted-foreground">expected = backup · actual = this project</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2">Table</th>
                    <th className="text-right px-3 py-2">Expected</th>
                    <th className="text-right px-3 py-2">Actual</th>
                    <th className="text-right px-3 py-2">Diff</th>
                    <th className="text-left px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.tables.map((t) => (
                    <tr key={t.table} className="border-t">
                      <td className="px-3 py-2 font-mono text-xs">{t.table}</td>
                      <td className="px-3 py-2 text-right">{t.expected}</td>
                      <td className="px-3 py-2 text-right">{t.actual}</td>
                      <td className={`px-3 py-2 text-right font-medium ${t.diff === 0 ? "text-muted-foreground" : t.diff < 0 ? "text-destructive" : "text-amber-700"}`}>
                        {t.diff > 0 ? `+${t.diff}` : t.diff}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <StatusPill status={t.status} />
                          {t.error && <span className="text-xs text-destructive truncate max-w-xs" title={t.error}>{t.error}</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-navy">Storage buckets</h2>
              <span className="text-xs text-muted-foreground">file counts and total bytes</span>
            </div>
            {result.source === "zip" && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-900 rounded p-3 text-xs">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                Auto-backup zips don't include storage binaries. Use a migration folder to verify storage counts.
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="text-left px-3 py-2">Bucket</th>
                    <th className="text-right px-3 py-2">Expected files</th>
                    <th className="text-right px-3 py-2">Actual files</th>
                    <th className="text-right px-3 py-2">Diff</th>
                    <th className="text-right px-3 py-2">Expected size</th>
                    <th className="text-right px-3 py-2">Actual size</th>
                    <th className="text-left px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.buckets.map((b) => (
                    <tr key={b.bucket} className="border-t">
                      <td className="px-3 py-2 font-mono text-xs">{b.bucket}</td>
                      <td className="px-3 py-2 text-right">{b.expected || ", "}</td>
                      <td className="px-3 py-2 text-right">{b.actual}</td>
                      <td className={`px-3 py-2 text-right font-medium ${b.diff === 0 ? "text-muted-foreground" : b.diff < 0 ? "text-destructive" : "text-amber-700"}`}>
                        {b.status === "unknown" ? ", " : b.diff > 0 ? `+${b.diff}` : b.diff}
                      </td>
                      <td className="px-3 py-2 text-right text-xs text-muted-foreground">{fmt(b.expected_bytes)}</td>
                      <td className="px-3 py-2 text-right text-xs text-muted-foreground">{fmt(b.actual_bytes)}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <StatusPill status={b.status} />
                          {b.error && <span className="text-xs text-destructive truncate max-w-xs" title={b.error}>{b.error}</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {result.summary.tables_mismatch === 0 && result.summary.buckets_mismatch === 0 && (
            <Card className="p-6 flex items-center gap-3 bg-[hsl(96_100%_32%)]/5 border-[hsl(96_100%_32%)]/30">
              <CheckCircle2 className="h-6 w-6 text-[hsl(96_100%_32%)]" />
              <div>
                <div className="font-poppins font-semibold text-navy">All counts match the backup</div>
                <div className="text-xs text-muted-foreground">Restore looks complete. Spot-check a few records and storage URLs to confirm.</div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
