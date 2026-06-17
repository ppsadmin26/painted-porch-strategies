import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { usePageStatuses } from "@/hooks/usePageStatuses";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, FileWarning, RefreshCw, Search, Sparkles } from "lucide-react";
import { collectSitemapPaths } from "@/pages/pps/Sitemap";
import { supabase } from "@/integrations/supabase/client";
import PageSeoEditorDialog from "@/components/pps/admin/PageSeoEditorDialog";
import CanonicalAuditCard from "@/components/pps/admin/CanonicalAuditCard";
import BulkSeoGenerator from "@/components/pps/admin/BulkSeoGenerator";

/**
 * Admin-only manager for page publish status + per-page SEO overrides.
 * Status (Live/Draft) lives in `page_status`; SEO overrides live in `page_seo`.
 * Either can be edited per route, independently.
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

  const [seoPaths, setSeoPaths] = useState<Set<string>>(new Set());
  const [seoEditPath, setSeoEditPath] = useState<string | null>(null);
  const [pageSearch, setPageSearch] = useState("");
  /** Admin-only notes for page_status rows (column is revoked at the grant
   *  level, so we hydrate via the dedicated SECURITY DEFINER RPC). */
  const [notesById, setNotesById] = useState<Record<string, string | null>>({});

  const loadSeoPaths = async () => {
    const { data } = await supabase.from("page_seo").select("path");
    if (data) setSeoPaths(new Set(data.map((r) => r.path)));
  };
  const loadAdminNotes = async () => {
    const { data, error } = await supabase.rpc("admin_list_page_status_notes");
    if (error || !data) return;
    const next: Record<string, string | null> = {};
    for (const row of data as Array<{ id: string; note: string | null }>) {
      next[row.id] = row.note;
    }
    setNotesById(next);
  };
  useEffect(() => {
    loadSeoPaths();
    loadAdminNotes();
  }, []);

  const sitemapPaths = useMemo(
    () => collectSitemapPaths().filter((p) => !p.startsWith("/admin")),
    [],
  );

  const syncFromSitemap = async () => {
    setSyncing(true);
    try {
      const missing = sitemapPaths.filter((p) => !map[p]);
      if (missing.length === 0) {
        toast({ title: "Already in sync", description: "Every sitemap route has a row." });
        return;
      }
      const rows = missing.map((path) => ({
        path,
        status: "draft" as const,
        note: "Synced from sitemap",
      }));
      const { error } = await supabase.from("page_status").insert(rows);
      if (error) throw error;
      toast({
        title: "Sitemap synced",
        description: `Added ${missing.length} missing path${missing.length === 1 ? "" : "s"} as Draft.`,
      });
    } catch (err) {
      toast({ title: "Sync failed", description: String(err), variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const overrides = useMemo(
    () =>
      Object.values(map)
        .filter((entry) => !entry.path.startsWith("/admin"))
        .sort((a, b) => {
          if (a.status !== b.status) return a.status === "draft" ? -1 : 1;
          return a.path.localeCompare(b.path);
        }),
    [map],
  );

  const filteredSitemap = useMemo(() => {
    const q = pageSearch.trim().toLowerCase();
    if (!q) return sitemapPaths;
    return sitemapPaths.filter((p) => p.toLowerCase().includes(q));
  }, [sitemapPaths, pageSearch]);

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
                Page status and SEO changes are limited to admin accounts. Reach out to an admin if you
                need a page flipped between Live and Draft, or its SEO updated.
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
    if (path === "/admin" || path.startsWith("/admin/")) {
      toast({
        title: "Admin pages can't be drafts",
        description: "Admin routes are always live and not gated by page status.",
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
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-pps-navy">Pages</h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Manage page publish status and per-page SEO. Drafts hide pages from
            navigation and replace CTAs with a Coming Soon badge. SEO overrides
            replace the hardcoded title, description, OG tags, canonical, and
            JSON-LD on the public page.
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
          Add a new status override
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
          Tip: every new URL is Draft by default. Flip it to Live here (or on the
          sitemap) when it's ready for the public.
        </p>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-pps-navy">
          Status overrides {overrides.length > 0 && (
            <span className="text-muted-foreground font-normal text-base">
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
        <Card className="p-6 text-center mb-10">
          <p className="font-montserrat text-sm text-pps-charcoal">
            No status overrides yet. Every page on the site is currently Live.
          </p>
        </Card>
      ) : (
        <div className="space-y-2 mb-10">
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
                    {seoPaths.has(entry.path) && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-poppins font-semibold bg-pps-teal/10 text-pps-teal border border-pps-teal/30">
                        SEO
                      </span>
                    )}
                  </div>
                  <NoteEditor
                    initial={notesById[entry.id] ?? ""}
                    onSave={async (note) => {
                      await setStatus(entry.path, entry.status, note || null);
                      setNotesById((m) => ({ ...m, [entry.id]: note || null }));
                      toast({ title: "Note saved" });
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSeoEditPath(entry.path)}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> SEO
                  </Button>
                  <label className="flex items-center gap-2 text-xs text-pps-charcoal">
                    <span>Draft</span>
                    <Switch
                      checked={entry.status === "draft"}
                      onCheckedChange={async (checked) => {
                        await setStatus(entry.path, checked ? "draft" : "live", notesById[entry.id] ?? null);
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

      {/* ============= Bulk canonical audit ============= */}
      <CanonicalAuditCard sitemapPaths={sitemapPaths} onChanged={loadSeoPaths} />

      {/* ============= SEO browser for every sitemap page ============= */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-3xl md:text-4xl font-poppins font-semibold text-pps-navy">
          SEO by page{" "}
          <span className="text-muted-foreground font-normal text-base">
            ({seoPaths.size} customized)
          </span>
        </h2>
      </div>
      <Card className="p-4 mb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={pageSearch}
            onChange={(e) => setPageSearch(e.target.value)}
            placeholder="Search routes (e.g. /partner)"
            className="pl-9"
          />
        </div>
      </Card>
      <Card className="divide-y max-h-[480px] overflow-y-auto">
        {filteredSitemap.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground text-center">No matching routes.</p>
        ) : (
          filteredSitemap.map((path) => {
            const hasSeo = seoPaths.has(path);
            const statusEntry = map[path];
            return (
              <div key={path} className="flex items-center gap-3 px-4 py-2.5">
                <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                  <Link
                    to={path}
                    className="font-poppins text-sm text-pps-navy hover:text-pps-teal hover:underline truncate"
                  >
                    {path}
                  </Link>
                  {statusEntry?.status === "draft" && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-poppins font-bold uppercase tracking-wide bg-pps-gold/20 text-pps-navy border border-pps-gold/40">
                      draft
                    </span>
                  )}
                  {hasSeo && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-poppins font-semibold bg-pps-teal/10 text-pps-teal border border-pps-teal/30">
                      SEO set
                    </span>
                  )}
                </div>
                <Button
                  variant={hasSeo ? "outline" : "ghost"}
                  size="sm"
                  onClick={() => setSeoEditPath(path)}
                  className="shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1" />
                  {hasSeo ? "Edit SEO" : "Add SEO"}
                </Button>
              </div>
            );
          })
        )}
      </Card>

      <PageSeoEditorDialog
        path={seoEditPath}
        open={seoEditPath !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSeoEditPath(null);
            loadSeoPaths();
          }
        }}
      />
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
