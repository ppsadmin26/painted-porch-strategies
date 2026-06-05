import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ImportResult {
  url: string;
  status: "pending" | "fetching" | "saving" | "done" | "error" | "duplicate";
  title?: string;
  error?: string;
}

interface BulkYouTubeImportDialogProps {
  onImported?: () => void;
}

export function BulkYouTubeImportDialog({ onImported }: BulkYouTubeImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [urls, setUrls] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>([]);
  const abortRef = useRef(false);
  const { toast } = useToast();

  const extractVideoId = (url: string): string | null => {
    const m = url.match(
      /(?:youtube\.com\/watch\?.*v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    );
    return m ? m[1] : null;
  };

  const handleImport = async () => {
    const lines = urls
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (lines.length === 0) {
      toast({ title: "Paste at least one YouTube URL", variant: "destructive" });
      return;
    }

    // Deduplicate by video ID
    const seen = new Set<string>();
    const uniqueLines: string[] = [];
    for (const line of lines) {
      const vid = extractVideoId(line);
      if (!vid) {
        uniqueLines.push(line); // will fail gracefully
        continue;
      }
      if (!seen.has(vid)) {
        seen.add(vid);
        uniqueLines.push(line);
      }
    }

    // Check existing videos in DB
    const { data: existing } = await supabase
      .from("youtube_videos")
      .select("youtube_video_id");
    const existingIds = new Set((existing || []).map((e) => e.youtube_video_id));

    const initial: ImportResult[] = uniqueLines.map((url) => {
      const vid = extractVideoId(url);
      if (vid && existingIds.has(vid)) {
        return { url, status: "duplicate" as const, title: "Already in database" };
      }
      return { url, status: "pending" as const };
    });

    setResults(initial);
    setImporting(true);
    abortRef.current = false;

    let doneCount = 0;
    let errorCount = 0;

    for (let i = 0; i < initial.length; i++) {
      if (abortRef.current) break;
      if (initial[i].status === "duplicate") continue;

      // Update to fetching
      setResults((prev) =>
        prev.map((r, idx) => (idx === i ? { ...r, status: "fetching" } : r))
      );

      try {
        const { data, error } = await supabase.functions.invoke("fetch-youtube-metadata", {
          body: { url: initial[i].url },
        });

        if (error || data?.error) {
          throw new Error(data?.error || error?.message || "Fetch failed");
        }

        // Update to saving
        setResults((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, status: "saving", title: data.title } : r))
        );

        const { error: insertError } = await supabase.from("youtube_videos").insert({
          title: data.title,
          description: data.description || null,
          youtube_url: initial[i].url,
          youtube_video_id: data.youtube_video_id,
          thumbnail_url: data.thumbnail_url || null,
          duration: data.duration || null,
          published_date: data.published_date || null,
          channel_title: data.channel_title || null,
        });

        if (insertError) throw new Error(insertError.message);

        setResults((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, status: "done" } : r))
        );
        doneCount++;
      } catch (e: any) {
        setResults((prev) =>
          prev.map((r, idx) => (idx === i ? { ...r, status: "error", error: e.message } : r))
        );
        errorCount++;
      }

      // Brief delay to avoid rate limits
      if (i < initial.length - 1) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    setImporting(false);
    const dupCount = initial.filter((r) => r.status === "duplicate").length;
    toast({
      title: "Bulk import complete",
      description: `${doneCount} imported, ${dupCount} duplicates skipped, ${errorCount} errors`,
    });
    if (doneCount > 0) onImported?.();
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && importing) {
      abortRef.current = true;
    }
    if (!isOpen) {
      setUrls("");
      setResults([]);
    }
    setOpen(isOpen);
  };

  const statusIcon = (status: ImportResult["status"]) => {
    switch (status) {
      case "pending":
        return <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />;
      case "fetching":
      case "saving":
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
      case "done":
        return <CheckCircle2 className="h-4 w-4 text-lime" />;
      case "error":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "duplicate":
        return <AlertCircle className="h-4 w-4 text-secondary" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Upload className="h-4 w-4 mr-1" /> Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Bulk Import YouTube Videos</DialogTitle>
        </DialogHeader>

        {results.length === 0 ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">
                YouTube URLs (one per line)
              </label>
              <Textarea
                value={urls}
                onChange={(e) => setUrls(e.target.value)}
                placeholder={`https://www.youtube.com/watch?v=abc123\nhttps://youtu.be/def456\nhttps://www.youtube.com/watch?v=ghi789`}
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Supports youtube.com/watch, youtu.be, and youtube.com/shorts URLs. Duplicates are automatically skipped.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleClose(false)}>
                Cancel
              </Button>
              <Button onClick={handleImport}>
                <Upload className="h-4 w-4 mr-1" /> Import Videos
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <ScrollArea className="h-[300px] border rounded-lg">
              <div className="divide-y">
                {results.map((r, i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-2.5 text-sm">
                    <div className="mt-0.5 shrink-0">{statusIcon(r.status)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{r.title || r.url}</p>
                      {r.status === "fetching" && (
                        <p className="text-xs text-muted-foreground">Fetching metadata...</p>
                      )}
                      {r.status === "saving" && (
                        <p className="text-xs text-muted-foreground">Saving...</p>
                      )}
                      {r.status === "error" && (
                        <p className="text-xs text-destructive">{r.error}</p>
                      )}
                      {r.status === "duplicate" && (
                        <p className="text-xs text-muted-foreground">Already exists, skipped</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-2">
              {importing ? (
                <Button variant="destructive" size="sm" onClick={() => (abortRef.current = true)}>
                  Stop
                </Button>
              ) : (
                <Button onClick={() => handleClose(false)}>Done</Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
