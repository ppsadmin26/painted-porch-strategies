import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { BlobReader, BlobWriter, ZipWriter } from "https://deno.land/x/zipjs@v2.7.45/index.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-cron-secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const CRON_SECRET = Deno.env.get("BACKUP_CRON_SECRET") ?? "";
const AUTO_BACKUP_FUNCTION_URL = `${SUPABASE_URL}/functions/v1/auto-backup`;

const TABLES = [
  "access_tokens",
  "blog_categories",
  "blog_post_categories",
  "blog_posts",
  "email_send_log",
  "email_send_state",
  "email_unsubscribe_tokens",
  "media_appearance_categories",
  "media_appearances",
  "page_status",
  "profiles",
  "site_video_slots",
  "site_videos",
  "suppressed_emails",
  "youtube_video_categories",
  "youtube_videos",
];

const STORAGE_BUCKETS = ["blog-images", "email-assets", "site-videos"];
const DEFAULT_RETENTION_WEEKLY = 30;
const DEFAULT_RETENTION_MONTHLY = 60;
// Process ONE storage object per invocation to stay well under the edge worker's
// memory limit (the function was OOM-ing when batching large videos together).
const STORAGE_COPY_BATCH = 1;
// Per-bucket cap for the download+upload fallback path (used when server-side copy fails).
// The fallback loads the entire file into memory as a Blob, so the cap MUST stay
// well under the edge runtime's per-invocation memory budget (~150MB observed).
// Anything larger is recorded in the manifest and re-uploaded out-of-band.
const MAX_FALLBACK_DOWNLOAD_BYTES_DEFAULT = 40 * 1024 * 1024;
const MAX_FALLBACK_DOWNLOAD_BYTES_BY_BUCKET: Record<string, number> = {
  "site-videos": 40 * 1024 * 1024,
};
function fallbackCapFor(bucket: string): number {
  return MAX_FALLBACK_DOWNLOAD_BYTES_BY_BUCKET[bucket] ?? MAX_FALLBACK_DOWNLOAD_BYTES_DEFAULT;
}
// Kept for state/manifest reporting (default cap).
const MAX_FALLBACK_DOWNLOAD_BYTES = MAX_FALLBACK_DOWNLOAD_BYTES_DEFAULT;

type LogEntry = { ts: string; level: "info" | "warn" | "error"; message: string; ms?: number };
type FailedSteps = {
  tables: string[];
  storage: { bucket: string; path: string }[];
};
type StorageObject = {
  bucket: string;
  path: string;
  size: number;
  updated_at: string | null;
};
type BackupState = {
  version: number;
  run_id: string;
  kind: string;
  folder: string;
  started_at: string;
  is_retry: boolean;
  parent_run_id: string | null;
  stage: "tables" | "storage" | "finalize" | "done" | "failed";
  tables_remaining: string[];
  storage_mode: "full" | "restrict" | "none";
  bucket_queue: string[];
  storage_queue: StorageObject[];
  row_counts: Record<string, number>;
  failed_tables: string[];
  failed_storage: { bucket: string; path: string }[];
  storage_object_count: number;
  size_bytes: number;
  skipped_fallback_large: { bucket: string; path: string; size: number }[];
  storage_manifest: {
    generated_at: string;
    copy_mode: "folder";
    max_fallback_download_bytes: number;
    buckets: Record<string, unknown>;
  };
  logs: LogEntry[];
};

function admin() {
  return createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function errorText(error: unknown): string {
  if (error instanceof Error) {
    const name = error.name && error.name !== "Error" ? `${error.name}: ` : "";
    const stack = error.stack ? `\n${error.stack.split("\n").slice(0, 6).join("\n")}` : "";
    return `${name}${error.message}${stack}`;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function statePath(folder: string) {
  return `${folder}/__state.json`;
}

function isInternalRequest(req: Request) {
  const cronSecret = req.headers.get("x-cron-secret");
  return !!CRON_SECRET && cronSecret === CRON_SECRET;
}

function makeFolderName(kind: string, isRetry: boolean) {
  const startedAt = new Date();
  const stamp = startedAt
    .toISOString()
    .replace(/[:.]/g, "-")
    .replace("T", "_")
    .slice(0, 19) + "Z";
  const suffix = crypto.randomUUID().slice(0, 8);
  return {
    startedAt,
    folder: `pps-backup-${kind}${isRetry ? "-retry" : ""}-${stamp}-${suffix}`,
  };
}

function logState(state: BackupState, level: LogEntry["level"], message: string) {
  const startedMs = new Date(state.started_at).getTime();
  state.logs.push({
    ts: new Date().toISOString(),
    level,
    message,
    ms: Math.max(0, Date.now() - startedMs),
  });
}

function buildGroupedManifest(entries: StorageObject[]) {
  const buckets: Record<string, { count: number; total_bytes: number; objects: { name: string; size: number; updated_at: string | null; folder: string }[] }> = {};
  for (const entry of entries) {
    if (!buckets[entry.bucket]) {
      buckets[entry.bucket] = { count: 0, total_bytes: 0, objects: [] };
    }
    buckets[entry.bucket].count += 1;
    buckets[entry.bucket].total_bytes += entry.size || 0;
    buckets[entry.bucket].objects.push({
      name: entry.path,
      size: entry.size || 0,
      updated_at: entry.updated_at,
      folder: entry.path.includes("/") ? entry.path.slice(0, entry.path.lastIndexOf("/")) : "",
    });
  }
  return buckets;
}

async function getRetentionPolicy(
  sb: ReturnType<typeof admin>,
): Promise<{ weekly: number; monthly: number }> {
  const { data, error } = await sb
    .from("backup_settings")
    .select("retention_days_weekly, retention_days_monthly")
    .eq("id", true)
    .maybeSingle();
  if (error || !data) {
    return { weekly: DEFAULT_RETENTION_WEEKLY, monthly: DEFAULT_RETENTION_MONTHLY };
  }
  return {
    weekly: Number(data.retention_days_weekly) || DEFAULT_RETENTION_WEEKLY,
    monthly: Number(data.retention_days_monthly) || DEFAULT_RETENTION_MONTHLY,
  };
}

async function isCallerAdmin(req: Request): Promise<boolean> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) return false;
  const token = auth.slice(7);
  const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: u } = await userClient.auth.getUser();
  if (!u?.user) return false;
  const { data, error } = await admin()
    .from("profiles")
    .select("role")
    .eq("id", u.user.id)
    .maybeSingle();
  if (error) return false;
  return data?.role === "admin";
}

async function fetchAllRows(
  sb: ReturnType<typeof admin>,
  table: string,
): Promise<Record<string, unknown>[]> {
  const PAGE = 1000;
  const RETRY_DELAYS_MS = [500, 1500, 4000];
  const all: Record<string, unknown>[] = [];
  let from = 0;
  while (true) {
    let data: Record<string, unknown>[] | null = null;
    let lastError: unknown = null;
    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
      try {
        const response = await sb.from(table).select("*").range(from, from + PAGE - 1);
        if (response.error) {
          throw new Error(response.error.message);
        }
        data = response.data ?? [];
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        const message = errorText(error).toLowerCase();
        const isTransient =
          message.includes("unexpected token '<'") ||
          message.includes("is not valid json") ||
          message.includes("<html") ||
          message.includes("bad gateway") ||
          message.includes("gateway timeout") ||
          message.includes("timed out") ||
          message.includes("timeout") ||
          message.includes("connection") ||
          message.includes("fetch failed") ||
          message.includes("service unavailable") ||
          message.includes("internal server error");

        if (!isTransient || attempt === RETRY_DELAYS_MS.length) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
      }
    }

    if (lastError) throw new Error(`Fetch ${table}: ${errorText(lastError)}`);
    if (!data || !data.length) break;
    all.push(...data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

async function listBucketObjects(
  sb: ReturnType<typeof admin>,
  bucket: string,
  prefix = "",
) {
  const all: { name: string; size: number; updated_at: string | null; folder: string }[] = [];
  async function walk(currentPrefix: string) {
    let offset = 0;
    while (true) {
      let data: any = null;
      let lastErr: any = null;
      for (let attempt = 0; attempt < 4; attempt++) {
        try {
          const res = await sb.storage
            .from(bucket)
            .list(currentPrefix, { limit: 1000, offset, sortBy: { column: "name", order: "asc" } });
          if (res.error) {
            lastErr = res.error;
          } else {
            data = res.data;
            lastErr = null;
            break;
          }
        } catch (e) {
          lastErr = e;
        }
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt)));
      }
      if (lastErr) {
        const msg = (lastErr as any)?.message ?? String(lastErr);
        // Storage gateway sometimes returns HTML on transient failures; skip this prefix instead of failing the whole run.
        if (/is not valid JSON|<html/i.test(msg)) {
          console.warn(`auto-backup list skipped ${bucket}/${currentPrefix}: ${msg}`);
          break;
        }
        throw new Error(`List ${bucket}/${currentPrefix}: ${msg}`);
      }
      if (!data || !data.length) break;
      for (const obj of data) {
        if (obj.id === null) {
          await walk(currentPrefix ? `${currentPrefix}/${obj.name}` : obj.name);
        } else {
          all.push({
            name: currentPrefix ? `${currentPrefix}/${obj.name}` : obj.name,
            size: (obj.metadata?.size as number) ?? 0,
            updated_at: obj.updated_at ?? null,
            folder: currentPrefix,
          });
        }
      }
      if (data.length < 1000) break;
      offset += 1000;
    }
  }
  await walk(prefix);
  return all;
}

async function saveState(sb: ReturnType<typeof admin>, state: BackupState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const { error } = await sb.storage
    .from("backups")
    .upload(statePath(state.folder), blob, { contentType: "application/json", upsert: true });
  if (error) throw new Error(`Save state: ${error.message}`);
}

class StateMissingError extends Error {
  constructor(folder: string) {
    super(`State file missing for ${folder}`);
    this.name = "StateMissingError";
  }
}

async function loadState(sb: ReturnType<typeof admin>, folder: string): Promise<BackupState> {
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await sb.storage.from("backups").download(statePath(folder));
    if (!error && data) {
      const text = await data.text();
      try {
        return JSON.parse(text) as BackupState;
      } catch {
        lastError = new Error(`Invalid backup state JSON for ${folder}`);
      }
    } else {
      lastError = error ?? new Error(`Missing backup state for ${folder}`);
    }

    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 300 * Math.pow(2, attempt)));
    }
  }

  if (lastError instanceof Error && /invalid backup state json/i.test(lastError.message)) {
    throw lastError;
  }

  throw new StateMissingError(folder);
}

async function updateRunProgress(
  sb: ReturnType<typeof admin>,
  state: BackupState,
  patch: Record<string, unknown> = {},
) {
  const { error } = await sb
    .from("backup_runs")
    .update({
      logs: state.logs as unknown as Record<string, unknown>[],
      table_row_counts: state.row_counts,
      storage_object_count: state.storage_object_count,
      size_bytes: state.size_bytes,
      ...patch,
    })
    .eq("id", state.run_id);
  if (error) throw new Error(`Update run ${state.run_id}: ${error.message}`);
}

async function removePathsInChunks(sb: ReturnType<typeof admin>, paths: string[]) {
  for (let i = 0; i < paths.length; i += 100) {
    const chunk = paths.slice(i, i + 100);
    const { error } = await sb.storage.from("backups").remove(chunk);
    if (error) throw new Error(`Remove backup files: ${error.message}`);
  }
}

async function removeBackupArtifact(sb: ReturnType<typeof admin>, path: string) {
  if (path.endsWith(".zip") || path.endsWith(".json")) {
    const { error } = await sb.storage.from("backups").remove([path]);
    if (error) throw new Error(`Remove ${path}: ${error.message}`);
    return;
  }
  const files = await listBucketObjects(sb, "backups", path);
  const paths = files.map((file) => file.name);
  if (paths.length) {
    await removePathsInChunks(sb, paths);
  }
}

async function pruneOldBackups(sb: ReturnType<typeof admin>) {
  const policy = await getRetentionPolicy(sb);
  const now = Date.now();
  const cutoffWeekly = new Date(now - policy.weekly * 86400000).toISOString();
  const cutoffMonthly = new Date(now - policy.monthly * 86400000).toISOString();

  const { data: weeklyOld } = await sb
    .from("backup_runs")
    .select("id, storage_path")
    .in("kind", ["weekly", "manual"])
    .lt("created_at", cutoffWeekly);
  const { data: monthlyOld } = await sb
    .from("backup_runs")
    .select("id, storage_path")
    .eq("kind", "monthly")
    .lt("created_at", cutoffMonthly);

  const all = [...(weeklyOld ?? []), ...(monthlyOld ?? [])];
  if (!all.length) {
    return { deleted: 0, retention_days_weekly: policy.weekly, retention_days_monthly: policy.monthly };
  }
  for (const row of all) {
    if (row.storage_path) await removeBackupArtifact(sb, row.storage_path);
  }
  await sb.from("backup_runs").delete().in("id", all.map((r) => r.id));
  return { deleted: all.length, retention_days_weekly: policy.weekly, retention_days_monthly: policy.monthly };
}

function takeStorageBatch(queue: StorageObject[]) {
  // One file per invocation — keeps memory predictable and avoids OOM on large videos.
  return queue.slice(0, 1);
}

// Retry policy for the server-side storage.copy() call before resorting to download+re-upload.
// Many copy failures are transient (network blips, brief 5xx from the storage API, rate limits).
// Backoff: 500ms → 1500ms → 4000ms (total ~6s worst-case before fallback).
const COPY_RETRY_DELAYS_MS = [500, 1500, 4000];

// Errors we should NOT retry — they will not get better by waiting.
function isPermanentCopyError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("not found") ||
    m.includes("does not exist") ||
    m.includes("already exists") ||
    m.includes("duplicate") ||
    m.includes("invalid") ||
    m.includes("unauthorized") ||
    m.includes("forbidden") ||
    m.includes("permission")
  );
}

async function copyStorageObject(
  sb: ReturnType<typeof admin>,
  state: BackupState,
  entry: StorageObject,
) {
  const destination = `${state.folder}/storage/${entry.bucket}/${entry.path}`;

  // Try server-side copy with exponential backoff before falling back.
  let lastError: { message?: string } | null = null;
  for (let attempt = 0; attempt <= COPY_RETRY_DELAYS_MS.length; attempt++) {
    const copyResult = await sb.storage
      .from(entry.bucket)
      .copy(entry.path, destination, { destinationBucket: "backups" } as any);

    if (!copyResult.error) {
      state.storage_object_count += 1;
      state.size_bytes += entry.size || 0;
      logState(
        state,
        "info",
        attempt === 0
          ? `storage:${entry.bucket}/${entry.path} copied (${entry.size || 0}b)`
          : `storage:${entry.bucket}/${entry.path} copied (${entry.size || 0}b) after ${attempt} retr${attempt === 1 ? "y" : "ies"}`,
      );
      return;
    }

    lastError = copyResult.error;
    const message = copyResult.error.message ?? "unknown";

    // Don't waste retries on errors that won't recover.
    if (isPermanentCopyError(message)) {
      logState(
        state,
        "warn",
        `storage:${entry.bucket}/${entry.path} server-side copy failed permanently (${message}) — skipping retries, attempting download fallback`,
      );
      break;
    }

    // Out of retry budget? Stop the loop and proceed to fallback.
    if (attempt === COPY_RETRY_DELAYS_MS.length) {
      logState(
        state,
        "warn",
        `storage:${entry.bucket}/${entry.path} server-side copy failed after ${COPY_RETRY_DELAYS_MS.length} retries (${message}) — attempting download fallback`,
      );
      break;
    }

    const delay = COPY_RETRY_DELAYS_MS[attempt];
    logState(
      state,
      "info",
      `storage:${entry.bucket}/${entry.path} server-side copy failed (${message}); retrying in ${delay}ms (attempt ${attempt + 1}/${COPY_RETRY_DELAYS_MS.length})`,
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  // After retries exhausted, fall through to existing download+re-upload path below.
  const copyResult = { error: lastError ?? { message: "unknown copy failure" } };

  const cap = fallbackCapFor(entry.bucket);
  if ((entry.size || 0) > cap) {
    state.failed_storage.push({ bucket: entry.bucket, path: entry.path });
    state.skipped_fallback_large.push({ bucket: entry.bucket, path: entry.path, size: entry.size || 0 });
    logState(
      state,
      "error",
      `storage:${entry.bucket}/${entry.path} failed: ${copyResult.error.message}; fallback blocked for files larger than ${cap} bytes`,
    );
    return;
  }

  let blob: Blob | null = null;
  try {
    const { data, error: downloadError } = await sb.storage.from(entry.bucket).download(entry.path);
    if (downloadError || !data) {
      state.failed_storage.push({ bucket: entry.bucket, path: entry.path });
      logState(
        state,
        "error",
        `storage:${entry.bucket}/${entry.path} failed: ${downloadError?.message ?? copyResult.error.message}`,
      );
      return;
    }
    blob = data;
  } catch (err) {
    // supabase-js throws if the storage CDN returns a non-JSON error page (HTML 413/502/504),
    // which is common for very large files. Record as failed and move on instead of 500-ing.
    state.failed_storage.push({ bucket: entry.bucket, path: entry.path });
    logState(
      state,
      "error",
      `storage:${entry.bucket}/${entry.path} fallback download threw: ${errorText(err)}`,
    );
    return;
  }

  try {
    const { error: uploadError } = await sb.storage
      .from("backups")
      .upload(destination, blob, { upsert: true, contentType: blob.type || "application/octet-stream" });
    if (uploadError) {
      state.failed_storage.push({ bucket: entry.bucket, path: entry.path });
      logState(state, "error", `storage:${entry.bucket}/${entry.path} failed: ${uploadError.message}`);
      return;
    }
  } catch (err) {
    state.failed_storage.push({ bucket: entry.bucket, path: entry.path });
    logState(state, "error", `storage:${entry.bucket}/${entry.path} fallback upload threw: ${errorText(err)}`);
    return;
  }

  state.storage_object_count += 1;
  state.size_bytes += blob.size;
  logState(state, "warn", `storage:${entry.bucket}/${entry.path} copied via download fallback (${blob.size}b)`);
}

async function scheduleProcess(runId: string) {
  if (!CRON_SECRET) throw new Error("BACKUP_CRON_SECRET is required for backup scheduling");
  const response = await fetch(AUTO_BACKUP_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-cron-secret": CRON_SECRET,
    },
    body: JSON.stringify({ action: "process", run_id: runId }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Schedule process failed (${response.status}): ${text || response.statusText}`);
  }
}

async function processNextRunningRun() {
  const sb = admin();
  const { data: nextRun, error } = await sb
    .from("backup_runs")
    .select("id")
    .eq("status", "running")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(`Load next running backup: ${error.message}`);
  if (!nextRun?.id) return { ok: true, processed: false };

  return await processBackupRun(nextRun.id);
}

async function startBackupRun(
  kind: string,
  options: { parentRunId?: string; restrictTo?: FailedSteps } = {},
) {
  const sb = admin();
  const isRetry = !!options.parentRunId;
  const { startedAt, folder } = makeFolderName(kind, isRetry);
  const tablesToRun = options.restrictTo ? options.restrictTo.tables ?? [] : TABLES;
  const storageEntries = options.restrictTo?.storage?.map((entry) => ({
    bucket: entry.bucket,
    path: entry.path,
    size: 0,
    updated_at: null,
  })) ?? [];
  const storageMode: BackupState["storage_mode"] = options.restrictTo
    ? storageEntries.length > 0
      ? "restrict"
      : "none"
    : "full";

  const state: BackupState = {
    version: 1,
    run_id: "",
    kind,
    folder,
    started_at: startedAt.toISOString(),
    is_retry: isRetry,
    parent_run_id: options.parentRunId ?? null,
    stage: "tables",
    tables_remaining: [...tablesToRun],
    storage_mode: storageMode,
    bucket_queue: storageMode === "full" ? [...STORAGE_BUCKETS] : [],
    storage_queue: storageMode === "restrict" ? [...storageEntries] : [],
    row_counts: {},
    failed_tables: [],
    failed_storage: [],
    storage_object_count: 0,
    size_bytes: 0,
    skipped_fallback_large: [],
    storage_manifest: {
      generated_at: startedAt.toISOString(),
      copy_mode: "folder",
      max_fallback_download_bytes: MAX_FALLBACK_DOWNLOAD_BYTES,
      buckets: storageMode === "restrict" ? buildGroupedManifest(storageEntries) : {},
    },
    logs: [],
  };

  logState(
    state,
    "info",
    `Backup started (kind=${kind}, retry=${isRetry}, tables=${tablesToRun.length}, storage=${storageMode === "full" ? "all buckets" : storageEntries.length + " file(s)"})`,
  );

  const { data: runRow, error: insertError } = await sb
    .from("backup_runs")
    .insert({
      storage_path: folder,
      kind,
      status: "running",
      started_at: startedAt.toISOString(),
      logs: state.logs as unknown as Record<string, unknown>[],
      parent_run_id: options.parentRunId ?? null,
    })
    .select()
    .single();

  if (insertError) throw new Error(`Log insert: ${insertError.message}`);

  state.run_id = runRow.id;
  await saveState(sb, state);
  await updateRunProgress(sb, state);

  await scheduleProcess(runRow.id);

  return {
    ok: true,
    started: true,
    run_id: runRow.id,
    kind,
    storage_path: folder,
  };
}

async function finalizeBackup(sb: ReturnType<typeof admin>, state: BackupState) {
  const hasFailures = state.failed_tables.length > 0 || state.failed_storage.length > 0;
  const finalStatus = hasFailures ? "partial" : "success";
  const finishedAt = new Date().toISOString();

  const manifest = {
    version: 3,
    format: "folder",
    generated_at: finishedAt,
    kind: state.kind,
    status: finalStatus,
    tables: state.row_counts,
    storage_object_count: state.storage_object_count,
    bytes_copied: state.size_bytes,
    failed_tables: state.failed_tables,
    failed_storage: state.failed_storage,
    skipped_fallback_large: state.skipped_fallback_large,
    buckets: state.storage_manifest.buckets,
    is_retry: state.is_retry,
    parent_run_id: state.parent_run_id,
  };

  const snapshot = {
    generated_at: finishedAt,
    backup_kind: state.kind,
    backup_format: "folder",
    is_retry: state.is_retry,
    parent_run_id: state.parent_run_id,
    lovable_project_id: "83b2bcb4-f37b-4b89-9c23-b8cb9254f586",
    supabase_url: SUPABASE_URL,
    supabase_project_ref: (() => {
      try {
        return new URL(SUPABASE_URL).hostname.split(".")[0];
      } catch {
        return null;
      }
    })(),
    tables_included: Object.keys(state.row_counts),
    storage_buckets_manifested: Object.keys(state.storage_manifest.buckets),
    table_row_counts: state.row_counts,
    storage_object_count: state.storage_object_count,
    failed_tables: state.failed_tables,
    failed_storage: state.failed_storage,
  };

  const readme = `Painted Porch Strategies - Automated Backup
Format:      folder
Kind:        ${state.kind}${state.is_retry ? " (retry)" : ""}
Generated:   ${finishedAt}
Tables:      ${Object.keys(state.row_counts).length}
Total rows:  ${Object.values(state.row_counts).reduce((a, b) => a + b, 0)}
Storage objects copied: ${state.storage_object_count}
Failures:    ${state.failed_tables.length} table(s), ${state.failed_storage.length} storage file(s)
${state.parent_run_id ? `Parent run:  ${state.parent_run_id}\n` : ""}
Open manifest.json and lovable-snapshot.json for details.
`;

  // ---- Auth users export (id + email + metadata) for cross-project restore ----
  // We export only what is needed to recreate users + remap profile FKs in the
  // destination project. Passwords/sessions are NEVER exported.
  try {
    const authUsers: { id: string; email: string | null; full_name: string | null; avatar_url: string | null; raw_user_meta_data: any; created_at: string | null }[] = [];
    let page = 1;
    while (true) {
      const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) { logState(state, "warn", `auth-users page ${page} failed: ${error.message}`); break; }
      const users = data?.users ?? [];
      for (const u of users) {
        authUsers.push({
          id: u.id,
          email: u.email ?? null,
          full_name: (u.user_metadata as any)?.full_name ?? null,
          avatar_url: (u.user_metadata as any)?.avatar_url ?? null,
          raw_user_meta_data: u.user_metadata ?? null,
          created_at: u.created_at ?? null,
        });
      }
      if (users.length < 1000) break;
      page++;
    }
    await sb.storage.from("backups").upload(
      `${state.folder}/auth-users.json`,
      new Blob([JSON.stringify(authUsers, null, 2)], { type: "application/json" }),
      { contentType: "application/json", upsert: true },
    );
    logState(state, "info", `auth-users exported (${authUsers.length} users)`);
    (manifest as any).auth_user_count = authUsers.length;
    (snapshot as any).auth_user_count = authUsers.length;
  } catch (err) {
    logState(state, "warn", `auth-users export failed: ${errorText(err)}`);
  }

  await sb.storage.from("backups").upload(
    `${state.folder}/manifest.json`,
    new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json" }),
    { contentType: "application/json", upsert: true },
  );
  await sb.storage.from("backups").upload(
    `${state.folder}/lovable-snapshot.json`,
    new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" }),
    { contentType: "application/json", upsert: true },
  );
  await sb.storage.from("backups").upload(
    `${state.folder}/README.txt`,
    new Blob([readme], { type: "text/plain" }),
    { contentType: "text/plain", upsert: true },
  );

  logState(state, "info", `Backup ${finalStatus} in ${Date.now() - new Date(state.started_at).getTime()}ms`);
  state.stage = "done";
  await saveState(sb, state);
  await updateRunProgress(sb, state, {
    status: finalStatus,
    finished_at: finishedAt,
    duration_ms: Date.now() - new Date(state.started_at).getTime(),
    failed_steps: hasFailures
      ? ({ tables: state.failed_tables, storage: state.failed_storage } as unknown as Record<string, unknown>)
      : null,
    error_message: hasFailures
      ? `${state.failed_tables.length} table(s) and ${state.failed_storage.length} file(s) failed`
      : null,
  });
  await sb.storage.from("backups").remove([statePath(state.folder)]);

  const pruned = await pruneOldBackups(sb);
  return {
    ok: true,
    run_id: state.run_id,
    storage_path: state.folder,
    size_bytes: state.size_bytes,
    status: finalStatus,
    failed_tables: state.failed_tables,
    failed_storage: state.failed_storage,
    pruned: pruned.deleted,
  };
}

async function failBackupRun(sb: ReturnType<typeof admin>, state: BackupState, error: unknown) {
  state.stage = "failed";
  logState(state, "error", `Fatal: ${errorText(error)}`);
  await saveState(sb, state);
  await updateRunProgress(sb, state, {
    status: "failed",
    error_message: errorText(error),
    finished_at: new Date().toISOString(),
    duration_ms: Date.now() - new Date(state.started_at).getTime(),
    failed_steps: {
      tables: state.failed_tables,
      storage: state.failed_storage,
    } as unknown as Record<string, unknown>,
  });
}

async function processBackupRun(runId: string) {
  const sb = admin();
  const { data: runRow, error: runError } = await sb
    .from("backup_runs")
    .select("id, storage_path, status")
    .eq("id", runId)
    .maybeSingle();
  if (runError) throw new Error(`Load run: ${runError.message}`);
  if (!runRow || runRow.status !== "running") {
    return { ok: true, skipped: true };
  }

  let state: BackupState;
  try {
    state = await loadState(sb, runRow.storage_path);
  } catch (err) {
    if (err instanceof StateMissingError) {
      // State file missing. This can happen in two cases:
      //  1. A concurrent call already finalized the run and deleted the state file.
      //     In that case the row's status is no longer "running" — just exit cleanly.
      //  2. A truly orphaned run whose state was lost. Mark it as failed.
      const { data: latest } = await sb
        .from("backup_runs")
        .select("status")
        .eq("id", runId)
        .maybeSingle();
      if (latest && latest.status !== "running") {
        return { ok: true, already_finalized: true, run_id: runId, status: latest.status };
      }
      // Conditional update: only flip to failed if still running.
      await sb
        .from("backup_runs")
        .update({
          status: "failed",
          error_message: "Backup state file missing (orphaned run). Marked as failed.",
          finished_at: new Date().toISOString(),
        })
        .eq("id", runId)
        .eq("status", "running");
      return { ok: true, orphaned: true, run_id: runId };
    }
    throw err;
  }

  try {
    if (state.stage === "tables") {
      if (state.tables_remaining.length > 0) {
        const table = state.tables_remaining.shift()!;
        try {
          const rows = await fetchAllRows(sb, table);
          const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
          const { error } = await sb.storage
            .from("backups")
            .upload(`${state.folder}/tables/${table}.json`, blob, {
              contentType: "application/json",
              upsert: true,
            });
          if (error) throw new Error(error.message);
          state.row_counts[table] = rows.length;
          state.size_bytes += blob.size;
          logState(state, "info", `table:${table} ok (${rows.length} rows)`);
        } catch (error) {
          state.failed_tables.push(table);
          logState(state, "error", `table:${table} failed: ${errorText(error)}`);
        }
      }

      if (state.tables_remaining.length === 0) {
        state.stage = "storage";
        if (state.storage_mode === "none") {
          logState(state, "info", "Table export complete; no storage files scheduled");
        } else {
          logState(state, "info", "Table export complete; starting storage copy");
        }
      }

      await saveState(sb, state);
      await updateRunProgress(sb, state);
    }

    if (state.stage === "storage") {
      if (state.storage_mode === "none") {
        state.stage = "finalize";
      } else {
        if (state.storage_queue.length === 0) {
          if (state.storage_mode === "restrict") {
            state.stage = "finalize";
          } else {
            const nextBucket = state.bucket_queue.shift();
            if (!nextBucket) {
              state.stage = "finalize";
            } else {
              const listed = await listBucketObjects(sb, nextBucket);
              state.storage_manifest.buckets[nextBucket] = {
                count: listed.length,
                total_bytes: listed.reduce((sum, item) => sum + (item.size || 0), 0),
                objects: listed,
              };
              state.storage_queue = listed.map((item) => ({
                bucket: nextBucket,
                path: item.name,
                size: item.size || 0,
                updated_at: item.updated_at ?? null,
              }));
              logState(state, "info", `bucket:${nextBucket} listed (${listed.length} objects)`);
            }
          }
        }

        if (state.stage === "storage" && state.storage_queue.length > 0) {
          const batch = takeStorageBatch(state.storage_queue);
          state.storage_queue = state.storage_queue.slice(batch.length);
          for (const entry of batch) {
            await copyStorageObject(sb, state, entry);
          }
        }

        if (state.stage === "storage") {
          const nothingLeft = state.storage_queue.length === 0 && state.bucket_queue.length === 0;
          if (state.storage_mode === "restrict" && state.storage_queue.length === 0) {
            state.stage = "finalize";
          } else if (state.storage_mode === "full" && nothingLeft) {
            state.stage = "finalize";
          }
        }
      }

      await saveState(sb, state);
      await updateRunProgress(sb, state);
    }

    if (state.stage === "finalize") {
      return await finalizeBackup(sb, state);
    }

    return { ok: true, stage: state.stage };
  } catch (error) {
    await failBackupRun(sb, state, error);
    throw error;
  }
}

function normalizeFailedSteps(value: unknown): FailedSteps | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as { tables?: unknown; storage?: unknown };
  return {
    tables: Array.isArray(candidate.tables)
      ? candidate.tables.filter((item): item is string => typeof item === "string")
      : [],
    storage: Array.isArray(candidate.storage)
      ? candidate.storage.filter(
          (item): item is { bucket: string; path: string } =>
            !!item &&
            typeof item === "object" &&
            typeof (item as { bucket?: unknown }).bucket === "string" &&
            typeof (item as { path?: unknown }).path === "string",
        )
      : [],
  };
}

// Names of secrets the new (external) Supabase project will need to set.
// VALUES ARE NOT INCLUDED — only names — so this is safe to ship in a backup zip.
const REQUIRED_SECRET_NAMES = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_JWKS",
  "SUPABASE_DB_URL",
  "BACKUP_CRON_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "GHL_API_KEY",
  "GHL_LOCATION_ID",
  "ADMIN_NOTIFICATION_EMAIL",
  "YOUTUBE_API_KEY",
  "ANTHROPIC_API_KEY",
  "ANTHROPIC_MODEL",
  "FIRECRAWL_API_KEY",
  "LOVABLE_API_KEY",
];

function buildSecretsChecklist(): string {
  const lines: string[] = [];
  lines.push("# Secrets checklist for the new Supabase project");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("Add each of the following secret NAMES in your new Supabase project");
  lines.push("(Project Settings → Edge Functions → Secrets, or `supabase secrets set`).");
  lines.push("Values are intentionally NOT included for security — copy them from your");
  lines.push("source-of-truth (Lovable Cloud → Settings → Secrets, or your password manager).");
  lines.push("");
  for (const name of REQUIRED_SECRET_NAMES) {
    lines.push(`- [ ] \`${name}\``);
  }
  lines.push("");
  lines.push("## Notes");
  lines.push("- `SUPABASE_*` values are auto-provided when running on Supabase — only set them locally.");
  lines.push("- `LOVABLE_API_KEY` and `FIRECRAWL_API_KEY` are only needed if you keep using those features.");
  lines.push("- After adding secrets, re-deploy edge functions so they pick up the new env.");
  return lines.join("\n") + "\n";
}

// Auth provider settings cannot be reliably read via SQL (they live in GoTrue
// config + the Supabase dashboard), so we ship a checklist instead. No secrets.
function buildAuthConfigNotes(): string {
  const lines = [
    "# Auth provider configuration checklist",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "Auth provider settings live in the Supabase **dashboard** (not in SQL),",
    "so they are not auto-restored. Re-create them in your new project under",
    "**Authentication → Providers / URL Configuration / Email Templates**.",
    "",
    "## Email / password",
    "- [ ] Enable Email provider",
    "- [ ] Confirm email: ON (recommended)",
    "- [ ] Secure password change: ON",
    "- [ ] Leaked password protection (HIBP): ON",
    "",
    "## Google OAuth",
    "- [ ] Enable Google provider",
    "- [ ] Paste Client ID + Client Secret from Google Cloud Console",
    "- [ ] Add authorized redirect URL: `https://<new-project-ref>.supabase.co/auth/v1/callback`",
    "",
    "## URL Configuration",
    "- [ ] Site URL: production domain (e.g. https://paintedporch.com)",
    "- [ ] Redirect URLs: add preview/staging domains + http://localhost:8080",
    "",
    "## Email templates",
    "- [ ] Re-upload custom templates (confirm, magic link, recovery, invite)",
    "- [ ] Configure SMTP / Resend if using a custom sender",
    "",
    "## Sessions / security",
    "- [ ] JWT expiry, refresh token rotation: keep defaults unless customized",
    "- [ ] Anonymous sign-ins: OFF (this project does not use them)",
    "",
    "## What IS auto-restored",
    "- All `public` schema tables, RLS policies, functions, triggers, indexes (`schema.sql`)",
    "- Storage buckets + storage.objects RLS policies (`config.sql`)",
    "- Realtime publication membership (`config.sql`)",
    "- Auth user records (id, email, name) via the restore wizard's `auth_users` phase",
    "",
  ];
  return lines.join("\n") + "\n";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const url = new URL(req.url);
  const internalRequest = isInternalRequest(req);

  try {
    let action = url.searchParams.get("action") ?? "";
    let kind = url.searchParams.get("kind") ?? "";
    let path = "";
    let runId = "";

    let bodyBucket = "";
    if (req.method === "POST") {
      try {
        const body = await req.json();
        action = body.action ?? action;
        kind = body.kind ?? kind;
        path = body.path ?? "";
        runId = body.run_id ?? "";
        bodyBucket = body.bucket ?? "";
      } catch {
        // no body
      }
    }
    if (!action && (kind || internalRequest)) action = "run";

    const callerIsAdmin = internalRequest ? false : await isCallerAdmin(req);

    const requireAdmin = () => {
      if (!callerIsAdmin) throw new Error("Forbidden");
    };
    const requireAdminOrInternal = () => {
      if (!(callerIsAdmin || internalRequest)) throw new Error("Forbidden");
    };
    const requireInternal = () => {
      if (!internalRequest) throw new Error("Forbidden");
    };

    const sb = admin();

    if (action === "list") {
      requireAdmin();
      const { data, error } = await sb
        .from("backup_runs")
        .select("id, storage_path, kind, status, size_bytes, storage_object_count, table_row_counts, error_message, created_at, started_at, finished_at, duration_ms, failed_steps, parent_run_id, logs")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      const TABLES_TOTAL = TABLES.length;
      const BUCKETS_TOTAL = STORAGE_BUCKETS.length;
      const runs = (data ?? []).map((r: any) => {
        const logs = Array.isArray(r.logs) ? r.logs : [];
        const last = logs.length > 0 ? logs[logs.length - 1] : null;
        const rowCounts = r.table_row_counts ?? {};
        const tablesDone = Object.keys(rowCounts).length;
        const failedTables = Array.isArray(r.failed_steps?.tables) ? r.failed_steps.tables.length : 0;
        const failedStorage = Array.isArray(r.failed_steps?.storage) ? r.failed_steps.storage.length : 0;
        const lastMsg: string = last?.message ?? "";

        let phase: "queued" | "tables" | "storage" | "finalize" | "done" | "failed" = "queued";
        if (r.status === "success" || r.status === "partial") phase = "done";
        else if (r.status === "failed") phase = "failed";
        else if (lastMsg.startsWith("table:")) phase = "tables";
        else if (lastMsg.startsWith("bucket:") || lastMsg.startsWith("storage:") || lastMsg.includes("starting storage")) phase = "storage";
        else if (lastMsg.includes("no storage files scheduled") || lastMsg.startsWith("Backup ")) phase = "finalize";
        else if (lastMsg.startsWith("Backup started")) phase = tablesDone > 0 ? "tables" : "queued";

        const isComplete =
          r.status === "success" &&
          tablesDone === TABLES_TOTAL &&
          failedTables === 0 &&
          failedStorage === 0;

        const { logs: _omit, ...rest } = r;
        return {
          ...rest,
          log_count: logs.length,
          last_log: last ? { message: last.message, level: last.level, ts: last.ts } : null,
          progress: {
            phase,
            tables_done: tablesDone,
            tables_total: TABLES_TOTAL,
            tables_failed: failedTables,
            storage_done: r.storage_object_count ?? 0,
            storage_buckets_total: BUCKETS_TOTAL,
            storage_failed: failedStorage,
            is_complete: isComplete,
          },
        };
      });
      return jsonResponse({ runs });
    }

    if (action === "cancel") {
      requireAdmin();
      if (!runId) return jsonResponse({ error: "run_id required" }, 400);
      const { data: run, error: fetchErr } = await sb
        .from("backup_runs")
        .select("id, status, started_at, logs")
        .eq("id", runId)
        .maybeSingle();
      if (fetchErr) throw fetchErr;
      if (!run) return jsonResponse({ error: "Run not found" }, 404);
      if (run.status !== "running") {
        return jsonResponse({ ok: true, already: run.status });
      }
      const startedMs = run.started_at ? new Date(run.started_at).getTime() : Date.now();
      const finishedAt = new Date().toISOString();
      const newLogs = Array.isArray(run.logs) ? [...run.logs] : [];
      newLogs.push({
        ts: finishedAt,
        level: "warn",
        message: "Run cancelled by admin",
      });
      const { error: updateErr } = await sb
        .from("backup_runs")
        .update({
          status: "failed",
          finished_at: finishedAt,
          duration_ms: Date.now() - startedMs,
          error_message: "Cancelled by admin",
          logs: newLogs,
        })
        .eq("id", runId);
      if (updateErr) throw updateErr;
      return jsonResponse({ ok: true });
    }

    if (action === "logs") {
      requireAdmin();
      if (!runId) return jsonResponse({ error: "run_id required" }, 400);
      const { data, error } = await sb
        .from("backup_runs")
        .select("id, status, logs, failed_steps, started_at, finished_at, duration_ms, error_message")
        .eq("id", runId)
        .maybeSingle();
      if (error) throw error;
      return jsonResponse({ run: data });
    }

    if (action === "signed-url") {
      requireAdmin();
      if (!path) return jsonResponse({ error: "path required" }, 400);
      // If a full file path is given (zip/json/anything with a dot in last segment), sign it directly.
      const last = path.split("/").pop() ?? "";
      const isFile = path.endsWith(".zip") || last.includes(".");
      const targetPath = isFile ? path : `${path}/manifest.json`;
      const { data, error } = await sb.storage.from("backups").createSignedUrl(targetPath, 600);
      if (error) throw error;
      return jsonResponse({
        url: data.signedUrl,
        expires_in: 600,
        path: targetPath,
        format: path.endsWith(".zip") ? "zip" : isFile ? "file" : "folder-manifest",
      });
    }

    if (action === "list-files") {
      requireAdmin();
      // Allow listing from any bucket (e.g. blog-images, site-videos, email-assets)
      // for cross-project storage migration. Defaults to "backups".
      const targetBucket = (bodyBucket || "backups").trim();
      if (!path && targetBucket === "backups") return jsonResponse({ error: "path required" }, 400);
      const listPath = path || "";
      // Single-file artifact (zip): return just itself with a signed URL.
      if (targetBucket === "backups" && (listPath.endsWith(".zip") || listPath.endsWith(".json"))) {
        const { data, error } = await sb.storage.from("backups").createSignedUrl(listPath, 600);
        if (error) throw error;
        return jsonResponse({
          folder: listPath,
          bucket: targetBucket,
          files: [{ name: listPath, size: 0, url: data.signedUrl }],
          expires_in: 600,
        });
      }
      const files = await listBucketObjects(sb, targetBucket, listPath);
      // Sign in batches of 100 (createSignedUrls supports arrays).
      const out: { name: string; size: number; url: string | null; updated_at: string | null }[] = [];
      for (let i = 0; i < files.length; i += 100) {
        const batch = files.slice(i, i + 100);
        const { data, error } = await sb.storage
          .from(targetBucket)
          .createSignedUrls(batch.map((f) => f.name), 600);
        if (error) throw error;
        batch.forEach((f, idx) => {
          out.push({
            name: f.name,
            size: f.size,
            updated_at: f.updated_at,
            url: data?.[idx]?.signedUrl ?? null,
          });
        });
      }
      out.sort((a, b) => a.name.localeCompare(b.name));
      return jsonResponse({ folder: listPath, bucket: targetBucket, files: out, expires_in: 600 });
    }

    if (action === "prepare-restore-zip") {
      requireAdmin();
      // Build a portable restore zip from the DB artifacts and metadata only.
      // Large storage binaries are intentionally excluded because the restore
      // import flow consumes table JSON + manifests, and inlining files like
      // videos causes the edge worker to exceed memory limits.
      let folder = path;
      if (!folder) {
        const { data, error } = await sb
          .from("backup_runs")
          .select("storage_path, status")
          .in("status", ["success", "partial"])
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) throw error;
        if (!data?.storage_path) {
          return jsonResponse({ error: "No completed backup runs found" }, 404);
        }
        folder = data.storage_path;
      }
      if (folder.endsWith(".zip") || folder.endsWith(".json")) {
        return jsonResponse({ error: "path must be a backup folder, not a file" }, 400);
      }

      const zipBlobWriter = new BlobWriter("application/zip");
      const zipWriter = new ZipWriter(zipBlobWriter, { level: 0 });
      let added = 0;
      let totalBytes = 0;
      const failures: { path: string; error: string }[] = [];
      let manifestJson: Record<string, unknown> | null = null;
      let snapshotJson: Record<string, unknown> | null = null;

      async function addBlob(targetPath: string, blob: Blob) {
        await zipWriter.add(targetPath, new BlobReader(blob), { level: 0 });
        added++;
        totalBytes += blob.size;
      }

      async function addStoredFile(sourcePath: string, targetPath = sourcePath) {
        const { data: blob, error } = await sb.storage.from("backups").download(sourcePath);
        if (error || !blob) throw new Error(error?.message ?? "download failed");
        await addBlob(targetPath, blob);
        return blob;
      }

      try {
        const blob = await addStoredFile(`${folder}/manifest.json`, "manifest.json");
        manifestJson = JSON.parse(await blob.text());
      } catch (err) {
        failures.push({ path: `${folder}/manifest.json`, error: errorText(err) });
      }

      try {
        const blob = await addStoredFile(`${folder}/lovable-snapshot.json`, "lovable-snapshot.json");
        snapshotJson = JSON.parse(await blob.text());
      } catch (err) {
        failures.push({ path: `${folder}/lovable-snapshot.json`, error: errorText(err) });
      }

      try {
        await addStoredFile(`${folder}/auth-users.json`, "auth-users.json");
      } catch (err) {
        failures.push({ path: `${folder}/auth-users.json`, error: errorText(err) });
      }

      let tableCount = 0;
      for (const table of TABLES) {
        try {
          await addStoredFile(`${folder}/tables/${table}.json`, `json/${table}.json`);
          tableCount++;
        } catch (err) {
          failures.push({ path: `${folder}/tables/${table}.json`, error: errorText(err) });
        }
      }
      if (tableCount === 0) {
        throw new Error(`No table exports found in ${folder}/tables/`);
      }

      try {
        const storageManifest = {
          generated_at:
            (snapshotJson?.generated_at as string | undefined) ??
            (manifestJson?.generated_at as string | undefined) ??
            new Date().toISOString(),
          copy_mode: "folder",
          max_fallback_download_bytes: MAX_FALLBACK_DOWNLOAD_BYTES,
          buckets: (manifestJson?.buckets as Record<string, unknown> | undefined) ?? {},
        };
        await addBlob(
          "storage-manifest.json",
          new Blob([JSON.stringify(storageManifest, null, 2)], { type: "application/json" }),
        );
      } catch (err) {
        failures.push({ path: "storage-manifest.json", error: errorText(err) });
      }

      try {
        const { data: schemaSql } = await sb.rpc("admin_dump_schema");
        if (typeof schemaSql === "string" && schemaSql.length) {
          await addBlob("schema.sql", new Blob([schemaSql], { type: "application/sql" }));
        }
      } catch (err) {
        failures.push({ path: "schema.sql", error: errorText(err) });
      }
      try {
        const { data: configSql, error: configErr } = await sb.rpc("admin_dump_config");
        if (configErr) {
          failures.push({ path: "config.sql", error: configErr.message });
        } else if (typeof configSql === "string" && configSql.length) {
          await addBlob("config.sql", new Blob([configSql], { type: "application/sql" }));
        } else {
          failures.push({ path: "config.sql", error: `empty result (type=${typeof configSql})` });
        }
      } catch (err) {
        failures.push({ path: "config.sql", error: errorText(err) });
      }
      try {
        await addBlob(
          "auth-config.md",
          new Blob([buildAuthConfigNotes()], { type: "text/markdown" }),
        );
      } catch (err) {
        failures.push({ path: "auth-config.md", error: errorText(err) });
      }
      try {
        await addBlob(
          "secrets-checklist.md",
          new Blob([buildSecretsChecklist()], { type: "text/markdown" }),
        );
      } catch (err) {
        failures.push({ path: "secrets-checklist.md", error: errorText(err) });
      }

      const readme = `Painted Porch Strategies - Restore Package
Source backup folder: ${folder}
Generated: ${new Date().toISOString()}
Included: table JSON, auth-users.json, lovable-snapshot.json, storage-manifest.json, schema.sql, config.sql, auth-config.md, secrets-checklist.md
Excluded: storage binaries (re-upload those separately when needed)
`;
      await addBlob("README.txt", new Blob([readme], { type: "text/plain" }));

      const zipBlob = await zipWriter.close();
      const zipName = `pps-restore-${folder}.zip`;
      const { error: upErr } = await sb.storage
        .from("backups")
        .upload(zipName, zipBlob, { contentType: "application/zip", upsert: true });
      if (upErr) throw new Error(`Upload restore zip: ${upErr.message}`);
      const { data: signed, error: sigErr } = await sb.storage
        .from("backups")
        .createSignedUrl(zipName, 3600);
      if (sigErr) throw sigErr;
      return jsonResponse({
        ok: true,
        folder,
        zip_path: zipName,
        files_added: added,
        bytes: totalBytes,
        zip_bytes: zipBlob.size,
        failures,
        url: signed.signedUrl,
        expires_in: 3600,
      });
    }

    if (action === "export-schema-sql") {
      requireAdmin();
      const { data, error } = await sb.rpc("admin_dump_schema");
      if (error) throw error;
      const sql = typeof data === "string" ? data : "";
      if (!sql.length) return jsonResponse({ error: "Empty schema" }, 500);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const name = `pps-schema-${stamp}.sql`;
      const { error: upErr } = await sb.storage
        .from("backups")
        .upload(name, new Blob([sql], { type: "application/sql" }), {
          contentType: "application/sql",
          upsert: true,
        });
      if (upErr) throw new Error(`Upload schema sql: ${upErr.message}`);
      const { data: signed, error: sigErr } = await sb.storage
        .from("backups")
        .createSignedUrl(name, 3600);
      if (sigErr) throw sigErr;
      return jsonResponse({
        ok: true,
        path: name,
        bytes: sql.length,
        url: signed.signedUrl,
        expires_in: 3600,
      });
    }

    if (action === "export-config-sql") {
      requireAdmin();
      const { data, error } = await sb.rpc("admin_dump_config");
      if (error) throw error;
      const sql = typeof data === "string" ? data : "";
      if (!sql.length) return jsonResponse({ error: "Empty config" }, 500);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      const name = `pps-config-${stamp}.sql`;
      const { error: upErr } = await sb.storage
        .from("backups")
        .upload(name, new Blob([sql], { type: "application/sql" }), {
          contentType: "application/sql",
          upsert: true,
        });
      if (upErr) throw new Error(`Upload config sql: ${upErr.message}`);
      const { data: signed, error: sigErr } = await sb.storage
        .from("backups")
        .createSignedUrl(name, 3600);
      if (sigErr) throw sigErr;
      return jsonResponse({
        ok: true,
        path: name,
        bytes: sql.length,
        url: signed.signedUrl,
        expires_in: 3600,
      });
    }

    if (action === "auth-config-notes") {
      requireAdmin();
      return jsonResponse({
        ok: true,
        filename: "auth-config.md",
        content: buildAuthConfigNotes(),
      });
    }

    if (action === "secrets-checklist") {
      requireAdmin();
      const md = buildSecretsChecklist();
      return jsonResponse({
        ok: true,
        filename: "secrets-checklist.md",
        content: md,
        names: REQUIRED_SECRET_NAMES,
      });
    }

    if (action === "secrets-status") {
      requireAdmin();
      // Categorize each required secret + report whether it is present in the
      // CURRENT (source) project env. Values are never returned.
      const CATEGORIES: Record<string, { category: string; description: string; required: boolean }> = {
        SUPABASE_URL: { category: "Supabase Core", description: "Auto-provided by Supabase runtime.", required: true },
        SUPABASE_ANON_KEY: { category: "Supabase Core", description: "Auto-provided by Supabase runtime.", required: true },
        SUPABASE_SERVICE_ROLE_KEY: { category: "Supabase Core", description: "Auto-provided by Supabase runtime.", required: true },
        SUPABASE_PUBLISHABLE_KEY: { category: "Supabase Core", description: "New publishable key format.", required: false },
        SUPABASE_JWKS: { category: "Supabase Core", description: "Used for in-function JWT validation.", required: false },
        SUPABASE_DB_URL: { category: "Supabase Core", description: "Direct Postgres URL.", required: false },
        BACKUP_CRON_SECRET: { category: "Internal", description: "Shared secret for cron-triggered backups.", required: true },
        
        STRIPE_SECRET_KEY: { category: "Payments", description: "Stripe live/test secret key.", required: true },
        STRIPE_WEBHOOK_SECRET: { category: "Payments", description: "Stripe webhook signing secret.", required: true },
        GHL_API_KEY: { category: "GoHighLevel", description: "GoHighLevel private integration token.", required: true },
        GHL_LOCATION_ID: { category: "GoHighLevel", description: "GoHighLevel location ID.", required: true },
        ADMIN_NOTIFICATION_EMAIL: { category: "Internal", description: "Where backup/admin alerts are sent.", required: true },
        YOUTUBE_API_KEY: { category: "YouTube", description: "YouTube Data API v3 key.", required: false },
        ANTHROPIC_API_KEY: { category: "AI", description: "Anthropic API key (assessment analysis).", required: false },
        ANTHROPIC_MODEL: { category: "AI", description: "Anthropic model identifier.", required: false },
        FIRECRAWL_API_KEY: { category: "Connectors", description: "Firecrawl key (LinkedIn import).", required: false },
        LOVABLE_API_KEY: { category: "AI", description: "Lovable AI Gateway key (only on Lovable Cloud).", required: false },
      };
      const items = REQUIRED_SECRET_NAMES.map((name) => {
        const meta = CATEGORIES[name] ?? { category: "Other", description: "", required: false };
        const value = Deno.env.get(name) ?? "";
        return {
          name,
          category: meta.category,
          description: meta.description,
          required: meta.required,
          present_in_source: value.length > 0,
          length: value.length,
        };
      });
      return jsonResponse({
        ok: true,
        generated_at: new Date().toISOString(),
        items,
      });
    }

    if (action === "run") {
      requireAdminOrInternal();
      const selectedKind = ["weekly", "monthly", "manual"].includes(kind) ? kind : "manual";
      const result = await startBackupRun(selectedKind);
      return jsonResponse(result, 202);
    }

    if (action === "process") {
      requireAdminOrInternal();
      if (!runId) return jsonResponse({ error: "run_id required" }, 400);
      const result = await processBackupRun(runId);
      return jsonResponse(result, 202);
    }

    if (action === "process-queue") {
      requireAdminOrInternal();
      const result = await processNextRunningRun();
      return jsonResponse(result, 202);
    }

    if (action === "retry") {
      requireAdmin();
      if (!runId) return jsonResponse({ error: "run_id required" }, 400);
      const { data: orig, error: originalError } = await sb
        .from("backup_runs")
        .select("id, kind, failed_steps")
        .eq("id", runId)
        .maybeSingle();
      if (originalError) throw originalError;
      if (!orig) return jsonResponse({ error: "Run not found" }, 404);

      const failed = normalizeFailedSteps(orig.failed_steps);
      const restrictTo =
        failed && (failed.tables.length > 0 || failed.storage.length > 0)
          ? failed
          : undefined;
      const result = await startBackupRun(orig.kind, {
        parentRunId: orig.id,
        restrictTo,
      });
      return jsonResponse(
        {
          ...result,
          retrying_run_id: orig.id,
          tables: restrictTo?.tables.length ?? "all",
          storage_files: restrictTo?.storage.length ?? "all",
        },
        202,
      );
    }

    if (action === "delete") {
      requireAdmin();
      if (!path) return jsonResponse({ error: "path required" }, 400);
      await removeBackupArtifact(sb, path);
      await sb.from("backup_runs").delete().eq("storage_path", path);
      return jsonResponse({ ok: true });
    }

    if (action === "prune") {
      requireAdmin();
      const result = await pruneOldBackups(sb);
      return jsonResponse({ ok: true, ...result });
    }

    return jsonResponse({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("auto-backup error", error);
    const message = errorText(error);
    const status = message === "Forbidden" ? 403 : 500;
    return jsonResponse({ error: message }, status);
  }
});
