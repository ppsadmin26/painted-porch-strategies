import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Upload, Video as VideoIcon, Loader2, Trash2, Play, Download, Link2, Plus, Pencil, X, Wand2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { transcodeHeroVideo, formatMB } from "@/lib/transcodeHeroVideo";

interface SiteVideo {
  id: string;
  slot_key: string;
  video_url: string;
  poster_url: string | null;
  storage_path: string | null;
  poster_path: string | null;
  updated_at: string;
}

// Map upload mime/extension to a normalized video kind for picking the best
// poster-extraction strategy. Browsers can decode MP4/WebM natively; MOV
// frame extraction depends on the platform codec, so we fall back gracefully.
function detectVideoKind(file: File): "mp4" | "webm" | "mov" | "other" {
  const t = (file.type || "").toLowerCase();
  const name = file.name.toLowerCase();
  if (t.includes("mp4") || name.endsWith(".mp4")) return "mp4";
  if (t.includes("webm") || name.endsWith(".webm")) return "webm";
  if (t.includes("quicktime") || name.endsWith(".mov")) return "mov";
  return "other";
}

// Capture a single frame from a video file and return it as a JPEG blob.
// Resolves with `null` when the browser can't decode the codec (e.g. some MOV
// files on non-Safari browsers) so the caller can skip the poster gracefully.
async function extractPosterFrame(file: File): Promise<Blob | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.src = url;

    let settled = false;
    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
    };
    const finish = (blob: Blob | null) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve(blob);
    };

    // Hard timeout so the upload flow never hangs on a stubborn codec
    const timeout = setTimeout(() => finish(null), 8000);

    video.addEventListener("loadedmetadata", () => {
      // Seek ~1s in (or 10% of total) to skip black intro frames
      const target = Math.min(1, (video.duration || 2) * 0.1);
      try {
        video.currentTime = isFinite(target) && target > 0 ? target : 0;
      } catch {
        // Some MOV files throw on seek, bail out
        clearTimeout(timeout);
        finish(null);
      }
    });

    video.addEventListener("seeked", () => {
      try {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (!w || !h) {
          clearTimeout(timeout);
          finish(null);
          return;
        }
        // Cap poster width to keep file size small
        const maxW = 1280;
        const scale = Math.min(1, maxW / w);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          clearTimeout(timeout);
          finish(null);
          return;
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            clearTimeout(timeout);
            finish(blob);
          },
          "image/jpeg",
          0.82
        );
      } catch {
        clearTimeout(timeout);
        finish(null);
      }
    });

    video.addEventListener("error", () => {
      clearTimeout(timeout);
      finish(null);
    });
  });
}

interface SiteVideoSlot {
  id: string;
  slot_key: string;
  label: string;
  description: string | null;
  sort_order: number;
}

const SLOT_KEY_PATTERN = /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/;

export default function SiteVideosManager() {
  const { toast } = useToast();
  const [videos, setVideos] = useState<Record<string, SiteVideo>>({});
  const [slots, setSlots] = useState<SiteVideoSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [transcodeProgress, setTranscodeProgress] = useState(0);
  const [transcodePhase, setTranscodePhase] = useState<"idle" | "transcoding" | "uploading">("idle");
  const [optimize, setOptimize] = useState(true);
  const [migrateSlot, setMigrateSlot] = useState<string | null>(null);
  const [migrateUrl, setMigrateUrl] = useState("");
  const [migrating, setMigrating] = useState(false);
  // New / edit slot dialog state
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [slotForm, setSlotForm] = useState({ slot_key: "", label: "", description: "" });
  const [savingSlot, setSavingSlot] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = async () => {
    setLoading(true);
    const [videosRes, slotsRes] = await Promise.all([
      supabase.from("site_videos").select("*"),
      supabase
        .from("site_video_slots")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("slot_key", { ascending: true }),
    ]);
    if (videosRes.error) {
      toast({ title: "Failed to load videos", description: videosRes.error.message, variant: "destructive" });
    } else {
      const map: Record<string, SiteVideo> = {};
      (videosRes.data ?? []).forEach((v: any) => (map[v.slot_key] = v));
      setVideos(map);
    }
    if (slotsRes.error) {
      toast({ title: "Failed to load slots", description: slotsRes.error.message, variant: "destructive" });
    } else {
      setSlots((slotsRes.data ?? []) as SiteVideoSlot[]);
    }
    setLoading(false);
  };


  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (slotKey: string, file: File) => {
    if (!file.type.startsWith("video/")) {
      toast({ title: "Please choose a video file (MP4, WebM, MOV).", variant: "destructive" });
      return;
    }
    setUploadingKey(slotKey);
    setTranscodeProgress(0);
    setTranscodePhase("idle");
    try {
      // 1. Optional: transcode in the browser to the standard hero-loop spec
      //    (1280×720 max, 24fps, ≤10s, CRF 30, no audio, faststart). This
      //    keeps every uploaded hero on a consistent footprint (~2–4 MB).
      let workingFile = file;
      let originalSize = file.size;
      if (optimize) {
        setTranscodePhase("transcoding");
        const result = await transcodeHeroVideo(file, slotKey, {
          onProgress: (p) => setTranscodeProgress(p),
        });
        workingFile = result.file;
        toast({
          title: "Optimized",
          description: `${formatMB(originalSize)} → ${formatMB(result.sizeBytes)} (720p / 24fps / muted / 10s)`,
        });
      }
      setTranscodePhase("uploading");

      const kind = detectVideoKind(workingFile);
      const ext = workingFile.name.split(".").pop() || (kind === "webm" ? "webm" : kind === "mov" ? "mov" : "mp4");
      const stamp = Date.now();
      const path = `${slotKey}/${stamp}.${ext}`;

      // 2. Try to grab a poster frame from the (possibly transcoded) file
      const posterBlob = await extractPosterFrame(workingFile);
      let posterUrl: string | null = null;
      let posterPath: string | null = null;

      if (posterBlob) {
        posterPath = `${slotKey}/${stamp}-poster.jpg`;
        const { error: posterErr } = await supabase.storage
          .from("site-videos")
          .upload(posterPath, posterBlob, {
            cacheControl: "31536000",
            upsert: false,
            contentType: "image/jpeg",
          });
        if (!posterErr) {
          posterUrl = supabase.storage.from("site-videos").getPublicUrl(posterPath).data.publicUrl;
        } else {
          console.warn("Poster upload failed, continuing without poster:", posterErr);
          posterPath = null;
        }
      }

      // 3. Upload the video itself
      const { error: upErr } = await supabase.storage
        .from("site-videos")
        .upload(path, workingFile, { cacheControl: "3600", upsert: false, contentType: workingFile.type });
      if (upErr) throw upErr;

      const publicUrl = supabase.storage.from("site-videos").getPublicUrl(path).data.publicUrl;

      const existing = videos[slotKey];
      const { data: userRes } = await supabase.auth.getUser();
      const updated_by = userRes.user?.id ?? null;

      const row = {
        video_url: publicUrl,
        storage_path: path,
        poster_url: posterUrl,
        poster_path: posterPath,
        updated_by,
      };

      if (existing) {
        const { error: updErr } = await supabase
          .from("site_videos")
          .update(row)
          .eq("slot_key", slotKey);
        if (updErr) throw updErr;

        // Best-effort cleanup of the old video + poster
        const stale = [existing.storage_path, existing.poster_path].filter(Boolean) as string[];
        if (stale.length) {
          await supabase.storage.from("site-videos").remove(stale);
        }
      } else {
        const { error: insErr } = await supabase
          .from("site_videos")
          .insert({ slot_key: slotKey, ...row });
        if (insErr) throw insErr;
      }

      toast({
        title: "Video uploaded",
        description: posterUrl
          ? `Detected ${kind.toUpperCase()}. Generated preview frame and saved.`
          : `Detected ${kind.toUpperCase()}. Saved without auto preview frame (codec couldn't be decoded in this browser).`,
      });
      await load();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Upload failed",
        description: err.message ?? "Try a smaller file or different format.",
        variant: "destructive",
      });
    } finally {
      setUploadingKey(null);
      setTranscodePhase("idle");
      setTranscodeProgress(0);
      if (fileRefs.current[slotKey]) fileRefs.current[slotKey]!.value = "";
    }
  };

  const handleDelete = async (slotKey: string) => {
    const current = videos[slotKey];
    if (!current) return;
    if (!confirm(`Remove the video for "${slotKey}"? The page will fall back to its placeholder until you upload a new one.`)) return;

    try {
      const stale = [current.storage_path, current.poster_path].filter(Boolean) as string[];
      if (stale.length) {
        await supabase.storage.from("site-videos").remove(stale);
      }
      const { error } = await supabase.from("site_videos").delete().eq("slot_key", slotKey);
      if (error) throw error;
      toast({ title: "Video removed", description: `Cleared "${slotKey}".` });
      await load();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Delete failed",
        description: err.message ?? "Try again.",
        variant: "destructive",
      });
    }
  };

  const triggerUpload = (slotKey: string) => {
    fileRefs.current[slotKey]?.click();
  };

  const handleDownload = async (slotKey: string) => {
    const current = videos[slotKey];
    if (!current?.video_url) return;
    try {
      const res = await fetch(current.video_url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      // Best-effort filename: use storage_path basename, else slot key + extension from mime
      const fromPath = current.storage_path?.split("/").pop();
      const extFromMime = (blob.type.split("/")[1] || "mp4").split(";")[0];
      const filename = fromPath || `${slotKey}.${extFromMime}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Download failed",
        description: err.message ?? "Try again.",
        variant: "destructive",
      });
    }
  };

  const openMigrate = (slotKey: string) => {
    setMigrateSlot(slotKey);
    setMigrateUrl("");
  };

  const handleMigrate = async () => {
    if (!migrateSlot || !migrateUrl.trim()) return;
    setMigrating(true);
    // Resolve relative paths (e.g. "/__l5e/assets-v1/...") against the current
    // browser origin so the edge function always receives an absolute URL.
    let src = migrateUrl.trim();
    if (src.startsWith("/")) src = window.location.origin + src;
    try {
      const { data, error } = await supabase.functions.invoke(
        "migrate-video-from-url",
        { body: { slot_key: migrateSlot, source_url: src } },
      );
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const sizeMb = (data as any)?.size_bytes
        ? ((data as any).size_bytes / 1024 / 1024).toFixed(1)
        : null;
      toast({
        title: "Video migrated to your bucket",
        description: sizeMb
          ? `Stored ${sizeMb} MB at ${(data as any).storage_path}. Repo untouched.`
          : "Stored in site-videos bucket. Repo untouched.",
      });
      setMigrateSlot(null);
      setMigrateUrl("");
      await load();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Migration failed",
        description: err.message ?? "Check the URL is publicly reachable and try again.",
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
    }
  };

  const openNewSlot = () => {
    setEditingSlotId(null);
    setSlotForm({ slot_key: "", label: "", description: "" });
    setSlotDialogOpen(true);
  };

  const openEditSlot = (slot: SiteVideoSlot) => {
    setEditingSlotId(slot.id);
    setSlotForm({
      slot_key: slot.slot_key,
      label: slot.label,
      description: slot.description ?? "",
    });
    setSlotDialogOpen(true);
  };

  const handleSaveSlot = async () => {
    const slot_key = slotForm.slot_key.trim().toLowerCase();
    const label = slotForm.label.trim();
    const description = slotForm.description.trim() || null;

    if (!label) {
      toast({ title: "Label is required", variant: "destructive" });
      return;
    }
    if (!editingSlotId && !SLOT_KEY_PATTERN.test(slot_key)) {
      toast({
        title: "Invalid slot key",
        description: "Use lowercase letters, numbers, and hyphens only (e.g. new-page-hero).",
        variant: "destructive",
      });
      return;
    }

    setSavingSlot(true);
    try {
      if (editingSlotId) {
        // Editing: only label + description are mutable (changing slot_key would break page references)
        const { error } = await supabase
          .from("site_video_slots")
          .update({ label, description })
          .eq("id", editingSlotId);
        if (error) throw error;
        toast({ title: "Slot updated" });
      } else {
        const { data: userRes } = await supabase.auth.getUser();
        const { error } = await supabase.from("site_video_slots").insert({
          slot_key,
          label,
          description,
          sort_order: (slots.at(-1)?.sort_order ?? 0) + 10,
          created_by: userRes.user?.id ?? null,
        });
        if (error) throw error;
        toast({
          title: "Slot created",
          description: `Page code can now reference "${slot_key}". Upload a video any time.`,
        });
      }
      setSlotDialogOpen(false);
      await load();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Save failed",
        description: err.message ?? "That slot key may already exist.",
        variant: "destructive",
      });
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (slot: SiteVideoSlot) => {
    const hasVideo = !!videos[slot.slot_key];
    const warning = hasVideo
      ? `"${slot.slot_key}" still has a video uploaded. Deleting the slot will also remove the video file. Continue?`
      : `Delete the "${slot.slot_key}" slot? Pages referencing this key will fall back to their placeholder.`;
    if (!confirm(warning)) return;

    try {
      // Remove video file + registry row first (so we don't orphan storage objects)
      const v = videos[slot.slot_key];
      if (v) {
        const stale = [v.storage_path, v.poster_path].filter(Boolean) as string[];
        if (stale.length) await supabase.storage.from("site-videos").remove(stale);
        await supabase.from("site_videos").delete().eq("slot_key", slot.slot_key);
      }
      const { error } = await supabase.from("site_video_slots").delete().eq("id", slot.id);
      if (error) throw error;
      toast({ title: "Slot removed" });
      await load();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Delete failed",
        description: err.message ?? "Try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy">Site Videos</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Each row is a video slot used on a landing page. Add new slots when building new pages, then upload anytime.
          </p>
        </div>
        <Button type="button" onClick={openNewSlot} className="shrink-0">
          <Plus className="h-4 w-4 mr-1.5" /> New slot
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      ) : slots.length === 0 ? (
        <Card className="p-8 text-center text-sm text-muted-foreground">
          No video slots yet. Click <strong>New slot</strong> to create one.
        </Card>
      ) : (
        <Card className="divide-y divide-border overflow-hidden">
          {/* Header row */}
          <div className="hidden md:grid grid-cols-[112px_1fr_auto] gap-4 px-4 py-2.5 bg-muted/50 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Preview</span>
            <span>Slot &amp; Path</span>
            <span className="text-right pr-1">Actions</span>
          </div>

          {slots.map((slot) => {
            const current = videos[slot.slot_key];
            const isUploading = uploadingKey === slot.slot_key;
            return (
              <div
                key={slot.id}
                className="grid grid-cols-[96px_1fr_auto] md:grid-cols-[112px_1fr_auto] gap-4 px-4 py-3 items-center hover:bg-muted/30 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-24 md:w-28 rounded-md overflow-hidden border border-border bg-muted shrink-0">
                  {current ? (
                    current.poster_url ? (
                      <>
                        <img
                          src={current.poster_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="h-5 w-5 text-white drop-shadow fill-white" />
                        </div>
                      </>
                    ) : (
                      <video
                        key={current.video_url}
                        src={current.video_url}
                        preload="metadata"
                        muted
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <VideoIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>

                {/* Title + path */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl md:text-2xl font-semibold text-navy truncate">{slot.label}</h3>
                    <code className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {slot.slot_key}
                    </code>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{slot.description}</p>
                  {current ? (
                    <a
                      href={current.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-primary hover:underline truncate block mt-1 max-w-full"
                      title={current.video_url}
                    >
                      {current.video_url.replace(/^https?:\/\/[^/]+\/storage\/v1\/object\/public\//, "")}
                    </a>
                  ) : (
                    <p className="text-[11px] text-muted-foreground italic mt-1">No video uploaded yet</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    ref={(el) => (fileRefs.current[slot.slot_key] = el)}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    disabled={isUploading}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUpload(slot.slot_key, f);
                    }}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => triggerUpload(slot.slot_key)}
                    disabled={isUploading}
                    title={current ? "Replace video" : "Upload video"}
                    className="h-8 w-8 p-0"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openMigrate(slot.slot_key)}
                    disabled={isUploading}
                    title="Migrate from URL (e.g. a Lovable-generated video)"
                    className="h-8 w-8 p-0"
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(slot.slot_key)}
                    disabled={isUploading || !current}
                    title="Download backup"
                    className="h-8 w-8 p-0 disabled:opacity-30"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(slot.slot_key)}
                    disabled={isUploading || !current}
                    title="Delete uploaded video (slot remains)"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="w-px h-5 bg-border mx-0.5" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditSlot(slot)}
                    disabled={isUploading}
                    title="Edit slot label / description"
                    className="h-8 w-8 p-0"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSlot(slot)}
                    disabled={isUploading}
                    title="Remove this slot entirely"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </Card>
      )}
      <div className="mt-3 space-y-2">
        <p className="text-xs text-muted-foreground">
          MP4, WebM, or MOV. Max 500MB. For best load speed, keep videos under 50MB.
        </p>
        <div className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-navy">Safe workflow for AI-generated videos</p>
          <p>
            When Lovable generates a video into <code className="font-mono text-[11px] px-1 bg-background rounded">src/assets/</code>, it will sync to GitHub and bloat the repo. To avoid that:
          </p>
          <ol className="list-decimal pl-5 space-y-0.5">
            <li>Right-click the generated video in chat &rarr; copy its URL.</li>
            <li>Click the <Link2 className="inline h-3 w-3 align-text-bottom" /> icon on the target slot &amp; paste the URL.</li>
            <li>The video gets streamed server-side into your <code className="font-mono text-[11px] px-1 bg-background rounded">site-videos</code> bucket. The repo file can then be safely deleted.</li>
          </ol>
        </div>
      </div>

      <Dialog open={!!migrateSlot} onOpenChange={(o) => !o && setMigrateSlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Migrate video from URL</DialogTitle>
            <DialogDescription>
              Paste a public video URL (Lovable CDN, generator output, anywhere). It will be downloaded server-side and stored in your <code className="font-mono text-xs">site-videos</code> bucket for slot{" "}
              <code className="font-mono text-xs">{migrateSlot}</code>. Your repo is never touched.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="migrate-url">Source video URL</Label>
            <Input
              id="migrate-url"
              type="url"
              placeholder="https://..."
              value={migrateUrl}
              onChange={(e) => setMigrateUrl(e.target.value)}
              disabled={migrating}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMigrateSlot(null)}
              disabled={migrating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleMigrate}
              disabled={migrating || !migrateUrl.trim()}
            >
              {migrating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Migrating...
                </>
              ) : (
                "Migrate to bucket"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={slotDialogOpen} onOpenChange={(o) => !o && setSlotDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSlotId ? "Edit slot" : "New video slot"}</DialogTitle>
            <DialogDescription>
              {editingSlotId
                ? "Label and description are editable. The slot key is locked because pages may reference it in code."
                : "Define a new slot that page code can reference. You don't need to upload a video right now, the slot will appear in the list above and accept uploads any time."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="slot-key">
                Slot key <span className="text-xs text-muted-foreground font-normal">(used in page code, e.g. <code className="font-mono">useSiteVideo("my-page-hero")</code>)</span>
              </Label>
              <Input
                id="slot-key"
                placeholder="my-page-hero"
                value={slotForm.slot_key}
                onChange={(e) => setSlotForm((s) => ({ ...s, slot_key: e.target.value }))}
                disabled={savingSlot || !!editingSlotId}
                className="font-mono text-sm mt-1"
              />
              {!editingSlotId && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  Lowercase letters, numbers, and hyphens only. Cannot be changed later.
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="slot-label">Label</Label>
              <Input
                id="slot-label"
                placeholder="My Page Hero"
                value={slotForm.label}
                onChange={(e) => setSlotForm((s) => ({ ...s, label: e.target.value }))}
                disabled={savingSlot}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="slot-description">Description</Label>
              <Textarea
                id="slot-description"
                placeholder="Where this video appears on the site."
                value={slotForm.description}
                onChange={(e) => setSlotForm((s) => ({ ...s, description: e.target.value }))}
                disabled={savingSlot}
                rows={2}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setSlotDialogOpen(false)}
              disabled={savingSlot}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveSlot} disabled={savingSlot}>
              {savingSlot ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...
                </>
              ) : editingSlotId ? (
                "Save changes"
              ) : (
                "Create slot"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
