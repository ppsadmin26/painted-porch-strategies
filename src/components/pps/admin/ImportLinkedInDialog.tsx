import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Linkedin, Loader2, Link2 } from "lucide-react";

interface ImportLinkedInDialogProps {
  onImported?: (slug: string) => void;
}

export default function ImportLinkedInDialog({ onImported }: ImportLinkedInDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleImport = async () => {
    if (!url.includes("linkedin.com/pulse/")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a LinkedIn article (pulse) URL.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "import-linkedin-article",
        { body: { url } }
      );

      if (error) throw error;

      if (data?.error) {
        if (data.slug) {
          toast({
            title: "Already imported",
            description: `This article already exists as "${data.slug}".`,
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      toast({
        title: "Article imported!",
        description: `"${data.title}" saved as approved — ready for review.`,
      });

      setUrl("");
      setOpen(false);
      onImported?.(data.slug);
    } catch (err: any) {
      console.error("Import error:", err);
      toast({
        title: "Import failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        "scan-linkedin-articles"
      );

      if (error) throw error;

      if (data?.error) throw new Error(data.error);

      const msg = data.imported > 0
        ? `Imported ${data.imported} new article(s): ${data.imported_slugs.join(", ")}`
        : `No new articles found. ${data.skipped} already imported.`;

      toast({
        title: data.imported > 0 ? "New articles imported!" : "All caught up",
        description: msg,
      });

      if (data.imported > 0) {
        setOpen(false);
        onImported?.("");
      }
    } catch (err: any) {
      console.error("Scan error:", err);
      toast({
        title: "Scan failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Linkedin className="h-4 w-4 mr-1" /> Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import LinkedIn Article</DialogTitle>
          <DialogDescription>
            Paste a URL to import a single article, or scan for all new posts.
            Articles are saved as <strong>Approved</strong> for review before publishing.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Single URL import */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Single Article URL</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://linkedin.com/pulse/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading || scanning}
              />
              <Button
                onClick={handleImport}
                disabled={loading || scanning || !url}
                size="sm"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Scan all */}
          <Button
            onClick={handleScan}
            disabled={loading || scanning}
            variant="secondary"
            className="w-full"
          >
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning LinkedIn...
              </>
            ) : (
              <>
                <Linkedin className="h-4 w-4 mr-2" />
                Scan for New Articles
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
