import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Upload, Loader2, AlertTriangle } from "lucide-react";

type BucketListing = Record<string, { path: string; size: number }[]>;

interface BackupFolder {
  name: string;
  manifest?: { tables?: Record<string, number>; buckets?: BucketListing };
}

interface BackupZip {
  name: string;
  size: number;
}

function formatBytes(b: number) {
  if (!b) return "0 B";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0;
  while (b >= 1024 && i < u.length - 1) { b /= 1024; i++; }
  return `${b.toFixed(1)} ${u[i]}`;
}

const COPY_BATCH = 8; // files per edge call, keeps each call well under CPU limit

async function invoke<T = any>(fn: string, body: any): Promise<T> {
  const { data, error } = await supabase.functions.invoke(fn, { body });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as T;
}

export default function MigrateManager() {
  // EXPORT state
  const [exporting, setExporting] = useState(false);
  const [exportLog, setExportLog] = useState<string[]>([]);
  const [exportFolder, setExportFolder] = useState<string | null>(null);

  // IMPORT state
  const [folders, setFolders] = useState<BackupFolder[]>([]);
  const [zips, setZips] = useState<BackupZip[]>([]);
  const [sourceKind, setSourceKind] = useState<"folder" | "zip">("folder");
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [selectedZip, setSelectedZip] = useState<string>("");
  const [upsert, setUpsert] = useState(true);
  const [skipStorage, setSkipStorage] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importLog, setImportLog] = useState<string[]>([]);

  const log = (set: typeof setExportLog) => (msg: string) =>
    set((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const loadFolders = async () => {
    const { data, error } = await supabase.storage
      .from("backups")
      .list("", { limit: 200, sortBy: { column: "created_at", order: "desc" } });
    if (error) { toast.error(`List failed: ${error.message}`); return; }
    const all = data ?? [];
    const folderNames = all
      .filter((f) => f.id === null && f.name.startsWith("pps-migrate-"))
      .map((f) => ({ name: f.name } as BackupFolder));
    const zipFiles = all
      .filter((f) => f.id !== null && f.name.startsWith("pps-backup-") && f.name.endsWith(".zip"))
      .map((f) => ({ name: f.name, size: (f.metadata as any)?.size ?? 0 } as BackupZip));
    setFolders(folderNames);
    setZips(zipFiles);
    if (folderNames[0] && !selectedFolder) setSelectedFolder(folderNames[0].name);
    if (zipFiles[0] && !selectedZip) setSelectedZip(zipFiles[0].name);
  };

  useEffect(() => { loadFolders(); }, []);

  // ============ EXPORT ============
  const runExport = async () => {
    setExporting(true);
    setExportLog([]);
    setExportFolder(null);
    const L = log(setExportLog);
    try {
      L("Phase 1: dumping tables…");
      const r1 = await invoke<{ folder: string; table_rows: Record<string, number>; buckets: BucketListing }>(
        "migrate-export", { phase: "tables" }
      );
      setExportFolder(r1.folder);
      L(`Folder: ${r1.folder}`);
      L(`Tables: ${Object.entries(r1.table_rows).map(([t, n]) => `${t}(${n})`).join(", ")}`);

      L("Phase 2: copying storage files…");
      for (const [bucket, objs] of Object.entries(r1.buckets)) {
        if (!objs.length) { L(`  ${bucket}: 0 files`); continue; }
        L(`  ${bucket}: ${objs.length} files`);
        let done = 0;
        for (let i = 0; i < objs.length; i += COPY_BATCH) {
          const batch = objs.slice(i, i + COPY_BATCH).map((o) => o.path);
          const r = await invoke<{ copied: number; failed: number; errors: string[] }>(
            "migrate-export", { phase: "copy_batch", folder: r1.folder, bucket, paths: batch }
          );
          done += r.copied;
          if (r.failed) L(`    ⚠ ${r.failed} failed (${r.errors.slice(0, 2).join("; ")})`);
          L(`    ${done}/${objs.length}`);
        }
      }

      L("Phase 2.5: dumping full schema (enums, tables, fns, triggers, policies, indexes)…");
      const audit = await invoke<{ complete: boolean; expected: any; found: any; missing: any; bytes: number }>(
        "migrate-export", { phase: "schema", folder: r1.folder }
      );
      L(`  schema.sql: ${audit.bytes} bytes`);
      L(`  expected: ${JSON.stringify(audit.expected)}`);
      L(`  found:    ${JSON.stringify(audit.found)}`);
      if (audit.complete) {
        L(`  ✅ schema audit PASSED, dump is complete`);
      } else {
        L(`  ⚠ schema audit MISMATCH: ${JSON.stringify(audit.missing)}`);
      }

      L("Phase 2.6: dumping non-secret config (storage buckets, RLS, realtime)…");
      try {
        const c = await invoke<{ bytes: number }>(
          "migrate-export", { phase: "config", folder: r1.folder }
        );
        L(`  config.sql: ${c.bytes} bytes`);
      } catch (e: any) {
        L(`  ⚠ config dump failed (non-fatal): ${e.message || e}`);
      }

      L("Phase 3: writing manifest…");
      await invoke("migrate-export", {
        phase: "finalize", folder: r1.folder,
        table_rows: r1.table_rows, buckets: r1.buckets,
      });
      L(`✅ Done. Saved to backups/${r1.folder}/`);
      toast.success("Export complete");
      loadFolders();
    } catch (e: any) {
      L(`❌ ${e.message || e}`);
      toast.error(`Export failed: ${e.message || e}`);
    } finally {
      setExporting(false);
    }
  };

  // ============ IMPORT (folder = pps-migrate-* with storage) ============
  const runImport = async () => {
    if (!selectedFolder) { toast.error("Pick a folder first"); return; }
    if (!confirm(
      `Import "${selectedFolder}" into THIS project?\n\n` +
      `Tables will be ${upsert ? "upserted by id" : "inserted"}.\n` +
      `Storage files ${skipStorage ? "will be SKIPPED" : "will overwrite existing files"}.`
    )) return;

    setImporting(true);
    setImportLog([]);
    const L = log(setImportLog);
    try {
      L("Reading manifest…");
      const m = await invoke<{ manifest: any; table_order: string[] }>(
        "migrate-import", { phase: "manifest", folder: selectedFolder }
      );
      L(`Manifest v${m.manifest.version}, ${Object.keys(m.manifest.tables ?? {}).length} tables, ${Object.keys(m.manifest.buckets ?? {}).length} buckets`);

      if (m.manifest.schema_sql) {
        L("Applying full schema dump (enums, tables, fns, triggers, policies, indexes)…");
        try {
          const s = await invoke<{ post_counts: any; bytes: number }>(
            "migrate-import", { phase: "schema", folder: selectedFolder, sqlPath: m.manifest.schema_sql }
          );
          L(`  ✅ schema applied (${s.bytes} bytes). Now: ${JSON.stringify(s.post_counts)}`);
        } catch (e: any) {
          L(`  ❌ schema apply failed: ${e.message || e}`);
          throw e;
        }
      } else {
        L("⚠ Manifest has no schema.sql, skipping schema apply (older export).");
      }

      L("Applying non-secret config (storage buckets, RLS, realtime)…");
      try {
        const c = await invoke<{ skipped?: boolean; bytes?: number }>(
          "migrate-import", { phase: "config", folder: selectedFolder, sqlPath: m.manifest.config_sql }
        );
        L(c.skipped ? "  ⚠ no config.sql in this backup (older export)" : `  ✅ config applied (${c.bytes} bytes)`);
      } catch (e: any) {
        L(`  ⚠ config apply failed (non-fatal): ${e.message || e}`);
      }

      L("Importing tables…");
      for (const t of m.table_order) {
        try {
          const r = await invoke<{ rows: number }>(
            "migrate-import", { phase: "table", folder: selectedFolder, table: t, upsert }
          );
          L(`  ${t}: ${r.rows} rows`);
        } catch (e: any) {
          L(`  ❌ ${t}: ${e.message || e}`);
        }
      }

      if (!skipStorage) {
        L("Copying storage files…");
        const buckets: BucketListing = m.manifest.buckets ?? {};
        for (const [bucket, objs] of Object.entries(buckets)) {
          if (!objs.length) { L(`  ${bucket}: 0 files`); continue; }
          L(`  ${bucket}: ${objs.length} files`);
          let done = 0, fail = 0;
          for (let i = 0; i < objs.length; i += COPY_BATCH) {
            const batch = objs.slice(i, i + COPY_BATCH).map((o) => o.path);
            const r = await invoke<{ copied: number; failed: number; errors: string[] }>(
              "migrate-import", { phase: "copy_batch", folder: selectedFolder, bucket, paths: batch }
            );
            done += r.copied; fail += r.failed;
            if (r.failed) L(`    ⚠ ${r.failed} failed (${r.errors.slice(0, 2).join("; ")})`);
            L(`    ${done}/${objs.length}`);
          }
          L(`  ${bucket}: ✅ ${done} copied, ${fail} failed`);
        }
      } else {
        L("Storage skipped.");
      }

      L("✅ Import complete");
      toast.success("Import finished");
    } catch (e: any) {
      L(`❌ ${e.message || e}`);
      toast.error(`Import failed: ${e.message || e}`);
    } finally {
      setImporting(false);
    }
  };

  // ============ IMPORT (zip = pps-backup-*.zip from auto-backup; DB only) ============
  const runZipImport = async () => {
    if (!selectedZip) { toast.error("Pick a zip first"); return; }
    if (!confirm(
      `Import "${selectedZip}" into THIS project?\n\n` +
      `Tables will be ${upsert ? "upserted by id" : "inserted"}.\n` +
      `Note: auto-backup zips contain DB rows + a storage manifest only, storage binaries are NOT included.`
    )) return;

    setImporting(true);
    setImportLog([]);
    const L = log(setImportLog);
    try {
      L("Reading zip manifest…");
      const m = await invoke<{
        tables: string[]; extras: string[]; table_rows: Record<string, number>;
        snapshot: any; storage_manifest: any;
      }>("migrate-import", { phase: "zip_manifest", zipPath: selectedZip });
      if (m.snapshot?.lovable_project_id) {
        L(`Source Lovable project: ${m.snapshot.lovable_project_id}`);
      }
      L(`Tables found: ${m.tables.join(", ")}`);
      if (m.extras.length) L(`⚠ Extra tables not in import order (skipped): ${m.extras.join(", ")}`);

      L("Importing tables…");
      for (const t of m.tables) {
        try {
          const r = await invoke<{ rows: number; skipped?: boolean }>(
            "migrate-import", { phase: "zip_table", zipPath: selectedZip, table: t, upsert }
          );
          L(`  ${t}: ${r.rows} rows${r.skipped ? " (skipped)" : ""}`);
        } catch (e: any) {
          L(`  ❌ ${t}: ${e.message || e}`);
        }
      }

      if (m.storage_manifest?.buckets) {
        L("Storage manifest (no binaries, re-upload originals manually):");
        for (const [b, info] of Object.entries(m.storage_manifest.buckets)) {
          const c = (info as any)?.count;
          if (typeof c === "number") L(`  ${b}: ${c} files listed`);
        }
      }

      L("✅ Zip import complete");
      toast.success("Zip import finished");
    } catch (e: any) {
      L(`❌ ${e.message || e}`);
      toast.error(`Zip import failed: ${e.message || e}`);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy">Project Migration</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Phased export of all DB rows + storage files into the <code>backups</code> bucket, then import into a freshly remixed project.
        </p>
      </div>

      {/* EXPORT */}
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Download className="h-5 w-5 text-primary mt-1" />
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-navy">Export</h2>
            <p className="text-sm text-muted-foreground">
              Runs in small batches to stay under edge-function CPU limits. Files are stored in <code>backups/&lt;folder&gt;/</code>, not zipped.
            </p>
          </div>
        </div>

        <Button onClick={runExport} disabled={exporting}>
          {exporting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Exporting…</> : "Run Export"}
        </Button>

        {exportLog.length > 0 && (
          <pre className="text-xs bg-muted/40 rounded p-3 max-h-80 overflow-auto whitespace-pre-wrap">
            {exportLog.join("\n")}
          </pre>
        )}
        {exportFolder && !exporting && (
          <div className="text-sm">
            Download via the storage UI: <code>backups/{exportFolder}/</code>
          </div>
        )}
      </Card>

      {/* IMPORT */}
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Upload className="h-5 w-5 text-primary mt-1" />
          <div className="flex-1">
            <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-navy">Import</h2>
            <p className="text-sm text-muted-foreground">
              Run this in the <strong>destination</strong> project after copying the export folder into its <code>backups</code> bucket.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-900 rounded p-3 text-sm">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <div>
            Profiles import only succeeds for users whose <code>auth.users</code> row already exists in the destination project, re-invite team first.
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Source</Label>
          <div className="flex gap-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="source-kind"
                checked={sourceKind === "folder"}
                onChange={() => setSourceKind("folder")}
              />
              Migration folder (DB + storage)
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="source-kind"
                checked={sourceKind === "zip"}
                onChange={() => setSourceKind("zip")}
              />
              Auto-backup .zip (DB only)
            </label>
          </div>
        </div>

        {sourceKind === "folder" ? (
          <div className="space-y-2">
            <Label className="text-sm">Folder in <code>backups</code></Label>
            <div className="flex gap-2">
              <select
                className="flex-1 border rounded px-3 py-2 text-sm bg-background"
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
              >
                <option value="">— select —</option>
                {folders.map((f) => <option key={f.name} value={f.name}>{f.name}</option>)}
              </select>
              <Button variant="outline" onClick={loadFolders}>Refresh</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Label className="text-sm">Zip in <code>backups</code></Label>
            <div className="flex gap-2">
              <select
                className="flex-1 border rounded px-3 py-2 text-sm bg-background"
                value={selectedZip}
                onChange={(e) => setSelectedZip(e.target.value)}
              >
                <option value="">— select —</option>
                {zips.map((z) => (
                  <option key={z.name} value={z.name}>
                    {z.name} {z.size ? `(${formatBytes(z.size)})` : ""}
                  </option>
                ))}
              </select>
              <Button variant="outline" onClick={loadFolders}>Refresh</Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this for <code>pps-backup-*.zip</code> snapshots produced by the automated backup. These contain DB rows + a storage manifest only, storage binaries must be re-uploaded separately.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Checkbox id="upsert" checked={upsert} onCheckedChange={(v) => setUpsert(!!v)} />
            <Label htmlFor="upsert" className="text-sm cursor-pointer">Upsert (overwrite by id)</Label>
          </div>
          {sourceKind === "folder" && (
            <div className="flex items-center gap-2">
              <Checkbox id="skip-storage" checked={skipStorage} onCheckedChange={(v) => setSkipStorage(!!v)} />
              <Label htmlFor="skip-storage" className="text-sm cursor-pointer">Skip storage files (DB only)</Label>
            </div>
          )}
        </div>

        {sourceKind === "folder" ? (
          <Button onClick={runImport} disabled={importing || !selectedFolder}>
            {importing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing…</> : "Run Import"}
          </Button>
        ) : (
          <Button onClick={runZipImport} disabled={importing || !selectedZip}>
            {importing ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Importing…</> : "Run Zip Import"}
          </Button>
        )}

        {importLog.length > 0 && (
          <pre className="text-xs bg-muted/40 rounded p-3 max-h-80 overflow-auto whitespace-pre-wrap">
            {importLog.join("\n")}
          </pre>
        )}
      </Card>
    </div>
  );
}
