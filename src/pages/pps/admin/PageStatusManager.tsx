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
import {
  Plus,
  Trash2,
  FileWarning,
  RefreshCw,
  Search,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { collectSitemapPaths } from "@/pages/pps/Sitemap";
import { supabase } from "@/integrations/supabase/client";
import PageSeoEditorDialog from "@/components/pps/admin/PageSeoEditorDialog";
import CanonicalAuditCard from "@/components/pps/admin/CanonicalAuditCard";
import BulkSeoGenerator from "@/components/pps/admin/BulkSeoGenerator";
import {
  CATEGORY_META,
  PAGE_CATEGORIES,
  getDefaultCategoryForPath,
  type PageCategory,
} from "@/config/pageCategories";
import {
  LOCATION_META,
  resolveLocation,
  type LocationKind,
} from "@/config/pageLocation";

interface SeoSummary {
  hasTitle: boolean;
  hasDescription: boolean;
  hasCanonical: boolean;
  hasAeo: boolean;
  title: string | null;
}

type StatusFilter = "all" | "live" | "draft";
type CategoryFilter = "all" | PageCategory;
type LocationFilter = "all" | LocationKind;
type SeoFilter = "all" | "custom" | "missing";

/**
 * Unified manager for every route's:
 *   - Live/Draft status (page_status)
 *   - Category (public/internal/archived) (page_status)
 *   - Location in the site tree (derived from sitemapData)
 *   - SEO/AEO overrides (page_seo)
 *   - Admin-only note (page_status.note via SECURITY DEFINER RPC)
 *
 * The visible site tree lives at `/sitemap` (read-only). All writes happen here.
 */
export default function PageStatusManager() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { map, loading, setStatus, setCategory, clearStatus } = usePageStatuses();
  const { toast } = useToast();

  const [newPath, setNewPath] = useState("");
  const [newNote, setNewNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [seoByPath, setSeoByPath] = useState<Record<string, SeoSummary>>({});
  const [seoEditPath, setSeoEditPath] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [locationFilter, setLocationFilter] = useState<LocationFilter>("all");
  const [seoFilter, setSeoFilter] = useState<SeoFilter>("all");
  const [showAdmin, setShowAdmin] = useState(false);

  /** Admin-only notes for page_status rows (column is revoked at the grant
   *  level, so we hydrate via the dedicated SECURITY DEFINER RPC). */
  const [notesById, setNotesById] = useState<Record<string, string | null>>({});

  const loadSeo = async () => {
    const { data } = await supabase
      .from("page_seo")
      .select("path,title,description,canonical,aeo_summary,aeo_faqs");
    if (!data) return;
    const next: Record<string, SeoSummary> = {};
    for (const row of data) {
      const aeoFaqs = row.aeo_faqs as unknown;
      const hasAeoFaqs = Array.isArray(aeoFaqs) && aeoFaqs.length > 0;
      next[row.path] = {
        hasTitle: !!row.title,
        hasDescription: !!row.description,
        hasCanonical: !!row.canonical,
        hasAeo: !!row.aeo_summary || hasAeoFaqs,
        title: row.title ?? null,
      };
    }
    setSeoByPath(next);
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
    loadSeo();
    loadAdminNotes();
  }, []);

  const sitemapPaths = useMemo(() => collectSitemapPaths(), []);
  const sitemapPathsNoAdmin = useMemo(
    () => sitemapPaths.filter((p) => !p.startsWith("/admin")),
    [sitemapPaths],
  );
  const knownRouteSet = useMemo(() => new Set(sitemapPaths), [sitemapPaths]);

  // Union of every known path: sitemap + page_status + page_seo.
  const allPaths = useMemo(() => {
    const s = new Set<string>(sitemapPaths);
    for (const path of Object.keys(map)) s.add(path);
    for (const path of Object.keys(seoByPath)) s.add(path);
    return Array.from(s).sort();
  }, [sitemapPaths, map, seoByPath]);

  const syncFromSitemap = async () => {
    setSyncing(true);
    try {
      const missing = sitemapPathsNoAdmin.filter((p) => !map[p]);
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

  // Build one row per path, then apply filters.
  type Row = {
    path: string;
    status: "live" | "draft";
    statusFromDb: boolean;
    category: PageCategory;
    categoryFromDb: boolean;
    location: ReturnType<typeof resolveLocation>;
    seo: SeoSummary | undefined;
    note: string | null;
    rowId: string | undefined;
  };

  const rows = useMemo<Row[]>(() => {
    return allPaths.map((path) => {
      const entry = map[path];
      const status = entry?.status ?? "live";
      const category = (entry?.category as PageCategory | undefined) ?? getDefaultCategoryForPath(path);
      const location = resolveLocation(path, { knownRoutePaths: knownRouteSet });
      const seo = seoByPath[path];
      const note = entry ? notesById[entry.id] ?? null : null;
      return {
        path,
        status,
        statusFromDb: !!entry,
        category,
        categoryFromDb: !!entry,
        location,
        seo,
        note,
        rowId: entry?.id,
      };
    });
  }, [allPaths, map, seoByPath, notesById, knownRouteSet]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (!showAdmin && r.path.startsWith("/admin")) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false;
      if (locationFilter !== "all" && r.location.kind !== locationFilter) return false;
      if (seoFilter === "custom" && !r.seo) return false;
      if (seoFilter === "missing" && r.seo) return false;
      if (q) {
        const hay = `${r.path} ${r.seo?.title ?? ""} ${r.note ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, statusFilter, categoryFilter, locationFilter, seoFilter, showAdmin]);

  // Counts for header
  const draftCount = rows.filter((r) => r.status === "draft" && !r.path.startsWith("/admin")).length;
  const seoCount = rows.filter((r) => r.seo).length;

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
                Page status, category, and SEO changes are limited to admin accounts.
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

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-pps-navy">
            Pages &amp; SEO
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            One table for every route: status (Live/Draft), category (public /
            internal / archived), location in the site tree, SEO/AEO overrides,
            and admin notes. The read-only visible tree lives on{" "}
            <Link to="/sitemap" className="text-pps-teal underline hover:text-pps-navy">
              /sitemap
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Button variant="outline" onClick={syncFromSitemap} disabled={syncing}>
            <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
            {syncing ? "Syncing…" : "Sync from sitemap"}
          </Button>
          <span className="text-xs text-muted-foreground">
            {rows.length} routes · {draftCount} draft · {seoCount} SEO custom
          </span>
        </div>
      </header>

      {/* Filters bar */}
      <Card className="p-4 mb-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search path, title, or note"
              className="pl-9"
            />
          </div>
          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v as StatusFilter)}
            options={[
              { value: "all", label: "All status" },
              { value: "live", label: "Live" },
              { value: "draft", label: "Draft" },
            ]}
          />
          <FilterSelect
            label="Category"
            value={categoryFilter}
            onChange={(v) => setCategoryFilter(v as CategoryFilter)}
            options={[
              { value: "all", label: "All categories" },
              ...PAGE_CATEGORIES.map((c) => ({ value: c, label: CATEGORY_META[c].label })),
            ]}
          />
          <FilterSelect
            label="Location"
            value={locationFilter}
            onChange={(v) => setLocationFilter(v as LocationFilter)}
            options={[
              { value: "all", label: "All locations" },
              { value: "main-nav", label: "Main Nav" },
              { value: "subpage", label: "Subpage" },
              { value: "standalone", label: "Standalone" },
              { value: "unlisted", label: "Unlisted" },
            ]}
          />
          <FilterSelect
            label="SEO"
            value={seoFilter}
            onChange={(v) => setSeoFilter(v as SeoFilter)}
            options={[
              { value: "all", label: "All SEO" },
              { value: "custom", label: "Has override" },
              { value: "missing", label: "Default only" },
            ]}
          />
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-pps-charcoal">
            <Switch checked={showAdmin} onCheckedChange={setShowAdmin} />
            Show /admin routes
          </label>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAddPanel((v) => !v)}>
              {showAddPanel ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
              Add new path
            </Button>
            <span className="text-xs text-muted-foreground">
              {filteredRows.length} of {rows.length} shown
            </span>
          </div>
        </div>
        {showAddPanel && (
          <div className="pt-3 border-t border-pps-navy/10 flex flex-col sm:flex-row gap-2">
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
        )}
      </Card>

      {/* Unified table */}
      <Card className="overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-pps-navy/[0.04] text-left">
              <tr className="font-poppins text-[11px] uppercase tracking-wide text-pps-charcoal/70">
                <th className="px-4 py-3">Path / Title</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Location</th>
                <th className="px-3 py-3">SEO / AEO</th>
                <th className="px-3 py-3">Note</th>
                <th className="px-3 py-3 w-px"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pps-navy/[0.06]">
              {loading ? (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No routes match these filters.</td></tr>
              ) : (
                filteredRows.map((r) => (
                  <PageRow
                    key={r.path}
                    row={r}
                    onToggleStatus={async (next) => {
                      await setStatus(r.path, next, r.note);
                      toast({
                        title: next === "draft" ? "Marked as draft" : "Marked as live",
                        description: r.path,
                      });
                    }}
                    onCategoryChange={async (next) => {
                      await setCategory(r.path, next);
                      toast({
                        title: `Category → ${CATEGORY_META[next].label}`,
                        description: r.path,
                      });
                    }}
                    onEditSeo={() => setSeoEditPath(r.path)}
                    onSaveNote={async (note) => {
                      await setStatus(r.path, r.status, note || null);
                      if (r.rowId) {
                        setNotesById((m) => ({ ...m, [r.rowId!]: note || null }));
                      } else {
                        // brand-new row will appear on next refresh; refetch notes
                        await loadAdminNotes();
                      }
                      toast({ title: "Note saved" });
                    }}
                    onClear={async () => {
                      await clearStatus(r.path);
                      toast({ title: "Override removed", description: r.path });
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Advanced tooling collapsed by default */}
      <Card className="p-4 mb-6">
        <button
          type="button"
          onClick={() => setShowAdvanced((v) => !v)}
          className="w-full flex items-center justify-between text-left"
        >
          <span className="font-poppins font-semibold text-pps-navy">
            Advanced SEO tools
          </span>
          {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
        {showAdvanced && (
          <div className="mt-4 space-y-4">
            <BulkSeoGenerator
              sitemapPaths={sitemapPathsNoAdmin}
              seoPaths={new Set(Object.keys(seoByPath))}
              onChanged={loadSeo}
            />
            <CanonicalAuditCard sitemapPaths={sitemapPathsNoAdmin} onChanged={loadSeo} />
          </div>
        )}
      </Card>

      <PageSeoEditorDialog
        path={seoEditPath}
        open={seoEditPath !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSeoEditPath(null);
            loadSeo();
          }
        }}
      />
    </div>
  );
}

/* ============================================================== Row */

function PageRow({
  row,
  onToggleStatus,
  onCategoryChange,
  onEditSeo,
  onSaveNote,
  onClear,
}: {
  row: {
    path: string;
    status: "live" | "draft";
    statusFromDb: boolean;
    category: PageCategory;
    location: ReturnType<typeof resolveLocation>;
    seo: SeoSummary | undefined;
    note: string | null;
    rowId: string | undefined;
  };
  onToggleStatus: (next: "live" | "draft") => Promise<void>;
  onCategoryChange: (next: PageCategory) => Promise<void>;
  onEditSeo: () => void;
  onSaveNote: (note: string) => Promise<void>;
  onClear: () => Promise<void>;
}) {
  const isAdminRoute = row.path.startsWith("/admin");
  const loc = row.location;

  return (
    <tr className="hover:bg-pps-navy/[0.02]">
      <td className="px-4 py-3 align-top">
        <div className="flex flex-col gap-0.5 min-w-0">
          <Link
            to={row.path}
            target="_blank"
            rel="noreferrer"
            className="font-poppins font-semibold text-pps-navy hover:text-pps-teal hover:underline text-sm inline-flex items-center gap-1 truncate"
          >
            {row.path}
            <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
          </Link>
          {row.seo?.title && (
            <span className="text-xs text-pps-charcoal/70 truncate">{row.seo.title}</span>
          )}
        </div>
      </td>
      <td className="px-3 py-3 align-top">
        {isAdminRoute ? (
          <span className="text-[10px] uppercase tracking-wide text-pps-charcoal/50">Always live</span>
        ) : (
          <label className="inline-flex items-center gap-2 text-xs text-pps-charcoal">
            <Switch
              checked={row.status === "draft"}
              onCheckedChange={(checked) => onToggleStatus(checked ? "draft" : "live")}
              aria-label={`Toggle draft for ${row.path}`}
            />
            <span className={row.status === "draft" ? "text-pps-navy font-semibold" : "text-pps-charcoal/70"}>
              {row.status === "draft" ? "Draft" : "Live"}
            </span>
          </label>
        )}
      </td>
      <td className="px-3 py-3 align-top">
        <CategoryPicker value={row.category} onChange={onCategoryChange} />
      </td>
      <td className="px-3 py-3 align-top">
        <div className="flex flex-col gap-0.5">
          <span
            className={`inline-flex w-fit items-center px-2 py-0.5 rounded-full text-[10px] font-poppins font-bold uppercase tracking-wide ${LOCATION_META[loc.kind].pillClass}`}
            title={LOCATION_META[loc.kind].description}
          >
            {LOCATION_META[loc.kind].label}
          </span>
          {loc.kind === "subpage" && loc.parentLabel && (
            <span className="text-[10px] text-pps-charcoal/60">↳ {loc.parentLabel}</span>
          )}
          {loc.kind === "main-nav" && loc.sectionLabel && (
            <span className="text-[10px] text-pps-charcoal/60">{loc.sectionLabel}</span>
          )}
        </div>
      </td>
      <td className="px-3 py-3 align-top">
        <button
          type="button"
          onClick={onEditSeo}
          className="inline-flex items-center gap-1.5 group"
          title="Edit SEO / AEO"
        >
          <Sparkles className="w-3.5 h-3.5 text-pps-teal" />
          {row.seo ? (
            <span className="flex flex-wrap gap-1">
              <SeoChip on={row.seo.hasTitle} label="T" title="Title" />
              <SeoChip on={row.seo.hasDescription} label="D" title="Description" />
              <SeoChip on={row.seo.hasCanonical} label="C" title="Canonical" />
              <SeoChip on={row.seo.hasAeo} label="A" title="AEO (summary or FAQs)" />
            </span>
          ) : (
            <span className="text-xs text-pps-charcoal/60 group-hover:text-pps-teal underline-offset-2 group-hover:underline">
              Default
            </span>
          )}
        </button>
      </td>
      <td className="px-3 py-3 align-top max-w-[240px]">
        <NoteEditor initial={row.note ?? ""} onSave={onSaveNote} />
      </td>
      <td className="px-3 py-3 align-top">
        {row.statusFromDb && !isAdminRoute && (
          <Button
            variant="ghost"
            size="sm"
            className="text-pps-raspberry hover:text-pps-raspberry hover:bg-pps-raspberry/10"
            onClick={onClear}
            title="Remove status + note override (SEO is kept)"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </td>
    </tr>
  );
}

function SeoChip({ on, label, title }: { on: boolean; label: string; title: string }) {
  return (
    <span
      title={title + (on ? "" : " — not set")}
      className={`inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-poppins font-bold ${
        on
          ? "bg-pps-teal/15 text-pps-teal border border-pps-teal/40"
          : "bg-pps-charcoal/5 text-pps-charcoal/40 border border-pps-charcoal/15"
      }`}
    >
      {label}
    </span>
  );
}

/** Inline note editor — click to edit, save on button or blur. */
function NoteEditor({ initial, onSave }: { initial: string; onSave: (note: string) => Promise<void> }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);

  useEffect(() => setDraft(initial), [initial]);

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setDraft(initial);
          setEditing(true);
        }}
        className="text-xs text-pps-charcoal/70 hover:text-pps-teal text-left italic line-clamp-2"
      >
        {initial || "+ Add note"}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Internal note"
        className="h-7 text-xs"
        autoFocus
      />
      <Button
        size="sm"
        className="h-7 px-2 text-xs"
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
      <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={() => setEditing(false)}>
        Cancel
      </Button>
    </div>
  );
}

/** Compact 3-way segmented control for Public / Internal / Archived. */
function CategoryPicker({
  value,
  onChange,
}: {
  value: PageCategory;
  onChange: (next: PageCategory) => Promise<void> | void;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Page category"
      className="inline-flex rounded-md border border-pps-navy/15 overflow-hidden text-[10px] font-poppins font-semibold"
    >
      {PAGE_CATEGORIES.map((cat) => {
        const active = cat === value;
        return (
          <button
            key={cat}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              if (!active) void onChange(cat);
            }}
            title={CATEGORY_META[cat].description}
            className={`px-2 py-1 uppercase tracking-wide transition-colors ${
              active
                ? `${CATEGORY_META[cat].pillClass} z-[1]`
                : "bg-white text-pps-charcoal/70 hover:bg-pps-navy/[0.04]"
            }`}
          >
            {CATEGORY_META[cat].label}
          </button>
        );
      })}
    </div>
  );
}

/** Minimal labeled select for the filter bar. */
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="inline-flex flex-col gap-0.5 min-w-[140px]">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 px-2 rounded-md border border-pps-navy/15 bg-white text-xs font-poppins text-pps-navy focus:outline-none focus:ring-2 focus:ring-pps-teal/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}
