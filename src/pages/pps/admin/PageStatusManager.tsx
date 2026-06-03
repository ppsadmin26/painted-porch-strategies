import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { usePageStatuses } from "@/hooks/usePageStatuses";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FileWarning, RefreshCw } from "lucide-react";
import { collectSitemapPaths } from "@/pages/pps/Sitemap";
import { supabase } from "@/integrations/supabase/client";

/**
 * Admin-only manager for page publish status. Lets admins:
 *   - See every override in the page_status table at a glance
 *   - Flip Live/Draft with a switch
 *   - Edit the optional internal note
 *   - Add a brand-new override for any path (e.g. an in-progress URL)
 *   - Remove an override entirely (page reverts to Live default)
 *
 * The sitemap (/sitemap) shows the same controls inline. This page is a
 * focused, scrollable list when you have many drafts to manage.
 */
export default function PageStatusManager() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { map, loading, setStatus, clearStatus } = usePageStatuses();
  const { toast } = useToast();

  const [newPath, setNewPath] = useState("");
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const syncFromSitemap = async () => {
    setSyncing(true);
    try {
      const paths = collectSitemapPaths();
      const missing = paths.filter((p) => !map[p]);
      if (missing.length === 0) {
        toast({ title: "Already in sync", description: "Every sitemap route has a row." });
        return;
      }
      const rows = missing.map((path) => ({
        path,
        status: "live" as const,
        note: "Synced from sitemap",
      }));
      const { error } = await supabase.from("page_status").insert(rows);
      if (error) throw error;
      toast({
        title: "Sitemap synced",
        description: `Added ${missing.length} missing path${missing.length === 1 ? "" : "s"} as Live.`,
      });
    } catch (err) {
      toast({ title: "Sync failed", description: String(err), variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const overrides = useMemo(
    () =>
      Object.values(map).sort((a, b) => {
        if (a.status !== b.status) return a.status === "draft" ? -1 : 1;
        return a.path.localeCompare(b.path);
      }),
    [map],
  );

  if (authLoading || roleLoading) return null;
  if (!user) return <Navigate to="/admin/login" replace />;
  if (!isAdmin) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="p-6 border-pps-raspberry/30 bg-pps-raspberry/5">
          <div className="flex items-start gap-3">
            <FileWarning className="w-5 h-5 text-pps-raspberry mt-0.5" />
            <div>
              <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-pps-navy mb-1">Admins only</h2>
              <p className="font-montserrat text-sm text-pps-charcoal">
                Page status changes are limited to admin accounts. Reach out to an admin if you
                need a page flipped between Live and Draft.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const addOverride = async () => {
    const path = newPath.trim();
    if (!path.startsWith("/")) {
      toast({
        title: "Invalid path",
        description: "Path must start with / (e.g. /new-offering).",
        variant: "destructive",
      });
      return;
    }
    setAdding(true);
    try {
      await setStatus(path, "draft", newNote.trim() || null);
      setNewPath("");
      setNewNote("");
      toast({ title: "Override added", description: `${path} is now a draft.` });
    } catch (err) {
      toast({ title: "Failed to add", description: String(err), variant: "destructive" });
    } finally {
      setAdding(false);
    }
  };

  const draftCount = overrides.filter((o) => o.status === "draft").length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-pps-navy">Page Status</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mark pages as Live or Draft. Drafts are hidden from navigation and
            footer, replaced with a "Coming Soon" badge on cards and CTAs that
            link to them, and show a friendly Coming Soon page if visited
            directly. Signed-in admins and editors still see everything.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={syncFromSitemap}
          disabled={syncing}
          className="shrink-0"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing…" : "Sync from sitemap"}
        </Button>
      </div>

      <Card className="p-5 mb-6">
        <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-pps-navy mb-3">
          Add a new override
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={newPath}
            onChange={(e) => setNewPath(e.target.value)}
            placeholder="/new-offering"
            className="sm:max-w-xs"
          />
          <Input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Optional internal note"
            className="flex-1"
          />
          <Button onClick={addOverride} disabled={adding || !newPath.trim()}>
            <Plus className="w-4 h-4 mr-1" /> Add as Draft
          </Button>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Tip: every URL is Live by default. You only need to add an entry here when you want to
          hide something from the public.
        </p>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-pps-navy">
          Overrides {overrides.length > 0 && (
            <span className="text-muted-foreground font-normal">
              ({draftCount} draft, {overrides.length - draftCount} live)
            </span>
          )}
        </h2>
        <Link to="/sitemap" className="text-xs text-pps-teal hover:underline">
          View full sitemap →
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : overrides.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="font-montserrat text-sm text-pps-charcoal">
            No overrides yet. Every page on the site is currently Live.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {overrides.map((entry) => (
            <Card key={entry.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      to={entry.path}
                      className="font-poppins font-semibold text-pps-navy hover:text-pps-teal hover:underline text-sm"
                    >
                      {entry.path}
                    </Link>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-poppins font-bold uppercase tracking-wide ${
                        entry.status === "draft"
                          ? "bg-pps-gold/20 text-pps-navy border border-pps-gold/40"
                          : "bg-pps-lime/20 text-pps-navy border border-pps-lime/40"
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                  <NoteEditor
                    initial={entry.note ?? ""}
                    onSave={async (note) => {
                      await setStatus(entry.path, entry.status, note || null);
                      toast({ title: "Note saved" });
                    }}
                  />
                </div>
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <label className="flex items-center gap-2 text-xs text-pps-charcoal">
                    <span>Draft</span>
                    <Switch
                      checked={entry.status === "draft"}
                      onCheckedChange={async (checked) => {
                        await setStatus(entry.path, checked ? "draft" : "live", entry.note);
                        toast({
                          title: checked ? "Marked as draft" : "Marked as live",
                          description: entry.path,
                        });
                      }}
                    />
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-pps-raspberry hover:text-pps-raspberry hover:bg-pps-raspberry/10"
                    onClick={async () => {
                      await clearStatus(entry.path);
                      toast({ title: "Override removed", description: entry.path });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NoteEditor({ initial, onSave }: { initial: string; onSave: (note: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(initial);
          setEditing(true);
        }}
        className="text-xs text-pps-charcoal/70 hover:text-pps-teal text-left mt-1 italic"
      >
        {initial ? `Note: ${initial}` : "+ Add internal note"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-1">
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Internal note"
        className="h-7 text-xs"
        autoFocus
      />
      <Button
        size="sm"
        className="h-7 text-xs"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          try {
            await onSave(draft.trim());
            setEditing(false);
          } finally {
            setBusy(false);
          }
        }}
      >
        Save
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-7 text-xs"
        onClick={() => setEditing(false)}
      >
        Cancel
      </Button>
    </div>
  );
}
