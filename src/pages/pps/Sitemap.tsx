import { useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { usePageStatuses, type PageStatusMap } from "@/hooks/usePageStatuses";
import { resolvePageStatus, resolvePageStatusEntry } from "@/config/pageStatus";
import { isLovableEditorPreview } from "@/lib/lovablePreview";
import ComingSoon from "@/pages/pps/ComingSoon";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface SitemapNode {
  label: string;
  path?: string;
  children?: SitemapNode[];
  note?: string;
}

/** Flat list of every path in the sitemap tree (deduped). */
export function collectSitemapPaths(nodes: SitemapNode[] = sitemapData): string[] {
  const out = new Set<string>();
  const walk = (ns: SitemapNode[]) => {
    for (const n of ns) {
      if (n.path) out.add(n.path);
      if (n.children) walk(n.children);
    }
  };
  walk(nodes);
  return Array.from(out).sort();
}

export const sitemapData: SitemapNode[] = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "Phase Zero",
    path: "/phase-zero",
  },
  {
    label: "Home (Archive)",
    path: "/home-archive",
    note: "Previous home page kept for reference",
  },
  {
    label: "Home (Verbatim)",
    path: "/home-verbatim",
    note: "Alt home — verbatim copy with numbered 3AM strip",
  },
  {
    label: "About",
    path: "/about",
    children: [
      { label: "Our Approach", path: "/about/approach" },
      { label: "Our Impact", path: "/about/impact" },
    ],
  },
  {
    label: "Partner With Us (P.A.T.H. Hub)",
    path: "/partner",
    children: [
      {
        label: "IGNITE",
        path: "/partner/ignite",
        children: [
          {
            label: "Courses",
            path: "/partner/ignite/courses",
            children: [
              { label: "Radical Mindfulness", path: "/radical-mindfulness", note: "Top-level URL kept for ease of sharing" },
              { label: "Master Your Message", path: "/communication", note: "Top-level URL kept for ease of sharing" },
              { label: "Extraordinary Teams", path: "/extraordinary-teams", note: "Top-level URL kept for ease of sharing" },
            ],
          },
          {
            label: "Assessments",
            path: "/partner/ignite/assessments",
            children: [
              { label: "EQ Assessment", path: "/eq", note: "Top-level URL kept for ease of sharing" },
              { label: "EQ Change Leader", path: "/eq-change-leader", note: "Top-level URL kept for ease of sharing" },
            ],
          },
          {
            label: "Masterclasses",
            path: "/partner/ignite/masterclasses",
            children: [
              { label: "Talking to Strangers (5-Day MYM)", path: "/talking-to-strangers", note: "Top-level URL kept for ease of sharing" },
              { label: "Team Superpowers Challenge", path: "/team-superpowers", note: "Top-level URL kept for ease of sharing" },
              { label: "MYM Journal Challenge", path: "/mym-journal-challenge", note: "Top-level URL kept for ease of sharing" },
              {
                label: "WFH Sign Up",
                path: "/wfh-sign-up",
                note: "Top-level URL kept for ease of sharing",
                children: [
                  { label: "WFH Thank You (post opt-in)", path: "/wfh-thank-you" },
                ],
              },
              { label: "Elements Mini", path: "/elements-mini", note: "Top-level URL kept for ease of sharing" },
            ],
          },
        ],
      },
      {
        label: "AMPLIFY",
        path: "/partner/amplify",
        children: [
          { label: "Workshops", path: "/partner/amplify/workshops" },
          { label: "Sprints", path: "/partner/amplify/sprints" },
          {
            label: "Labs",
            path: "/partner/amplify/labs",
            children: [
              { label: "Stractical Leader Workshop", path: "/partner/amplify/stractical-leader" },
              { label: "Stractical Leader Enrollment", path: "/partner/amplify/stractical-leader/enroll" },
            ],
          },
        ],
      },
      {
        label: "EMBODY",
        path: "/partner/embody",
      },
    ],
  },
  {
    label: "Resources",
    path: "/resources",
    children: [
      {
        label: "Free Resources",
        path: "/resources/free",
        children: [
          {
            label: "Kick the Habit",
            path: "/kick-the-habit",
            note: "Top-level URL kept for ease of sharing",
            children: [
              { label: "Kick the Habit Watch (post opt-in)", path: "/kick-the-habit-watch" },
            ],
          },
          {
            label: "Stoic Field Guide",
            path: "/stoic-field-guide",
            note: "Top-level URL kept for ease of sharing",
            children: [
              { label: "Stoic Field Guide Access (post opt-in)", path: "/stoic-field-guide-access" },
            ],
          },
          {
            label: "Pilot Training",
            path: "/pilot-training",
            note: "Top-level URL kept for ease of sharing",
            children: [
              { label: "Pilot Training Watch (post opt-in)", path: "/pilot-training-watch" },
            ],
          },
          {
            label: "6 Communicator Styles",
            path: "/6-communicator-styles",
            note: "Top-level URL kept for ease of sharing",
            children: [
              { label: "6 Communicator Styles Watch (post opt-in)", path: "/6-communicator-styles-watch" },
            ],
          },
          {
            label: "Change Canvas",
            path: "/change-canvas",
            note: "Top-level URL kept for ease of sharing",
            children: [
              { label: "Change Canvas Thank You (post opt-in)", path: "/thank-you-change-canvas" },
            ],
          },
          {
            label: "Change Roadmap",
            path: "/change-roadmap",
            note: "Top-level URL kept for ease of sharing",
            children: [
              { label: "Change Roadmap Thank You (post opt-in)", path: "/thank-you-change-roadmap" },
            ],
          },
          {
            label: "Change Comms Guide",
            path: "/change-comms",
            note: "Top-level URL kept for ease of sharing",
            children: [
              { label: "Change Comms Thank You (post opt-in)", path: "/change-comms-thank-you" },
            ],
          },
          { label: "Change-Ready Team Assessment", path: "/change-ready-team-assessment", note: "Top-level URL kept for ease of sharing" },
          { label: "Change-Ready Leader Assessment", path: "/change-ready-leader-assessment", note: "Top-level URL kept for ease of sharing" },
          { label: "Elemental Style Assessment", path: "/elemental-style-assessment", note: "Top-level URL kept for ease of sharing" },
          { label: "Team Health Assessment", path: "/team-health-assessment", note: "Top-level URL kept for ease of sharing" },
          {
            label: "Stractical Leader Mini Guide",
            path: "/resources/stractical-mini",
            note: "Top-level URL kept for ease of sharing",
            children: [
              { label: "Stractical Mini Thank You (post opt-in)", path: "/stractical-mini-thank-you" },
            ],
          },
          {
            label: "Burnout Opt-In",
            path: "/burnout",
            note: "Top-level URL kept for ease of sharing",
            children: [
              { label: "Burnout Resources (gated, post opt-in)", path: "/burnout-access" },
            ],
          },
        ],
      },
      { label: "Insights (Blog)", path: "/resources/insights" },
      { label: "YouTube", path: "/resources/youtube" },
      { label: "FAQ", path: "/resources/faq" },
    ],
  },
  {
    label: "Speaking",
    path: "/speaking",
    children: [
      { label: "Amy Yackowski", path: "/speaking/amy" },
      { label: "Rob Yackowski", path: "/speaking/rob" },
      { label: "Sierra", path: "/speaking/sierra" },
      { label: "As Seen On (Media)", path: "/speaking/media" },
    ],
  },
  {
    label: "The Blue Door",
    path: "/blue-door",
    children: [
      { label: "Purchase", path: "/blue-door/purchase" },
      { label: "Success (post purchase)", path: "/blue-door/success" },
    ],
  },
  {
    label: "Start Here (P.A.T.H. Quiz)",
    path: "/start-here",
  },
  {
    label: "Contact & Legal",
    children: [
      { label: "Contact Us", path: "/contact" },
      { label: "Terms & Conditions", path: "/terms" },
      { label: "Unsubscribe", path: "/unsubscribe" },
      { label: "404 / Not Found", path: "/404", note: "Shown for any unknown URL" },
    ],
  },
  {
    label: "Personal Hubs (Standalone)",
    children: [
      { label: "Amy", path: "/amy" },
      { label: "Rob", path: "/rob" },
      { label: "Sierra", path: "/sierra" },
      { label: "Team Overview", path: "/overview" },
    ],
  },
  {
    label: "Administrative (Staff Only)",
    children: [
      { label: "Admin Login", path: "/admin/login", note: "Sign-in page for staff" },
      { label: "Reset Password", path: "/reset-password" },
      { label: "Admin Dashboard", path: "/admin" },
      { label: "Blog Posts", path: "/admin/posts" },
      { label: "Users", path: "/admin/users" },
      { label: "Media Appearances", path: "/admin/media" },
      { label: "YouTube Videos", path: "/admin/youtube" },
      { label: "Site Videos", path: "/admin/videos" },
      { label: "Page Status", path: "/admin/pages", note: "Mark pages as Live or Draft" },
      { label: "Account Settings", path: "/admin/account" },
    ],
  },
  {
    label: "Utility Pages",
    children: [
      { label: "Sitemap (this page)", path: "/sitemap" },
      { label: "Found It (Easter Egg)", path: "/found-it", note: "Hidden form linked secretly inside Terms & Conditions" },
    ],
  },
];

/**
 * When `isStaff` is false, draft branches are filtered out entirely so the
 * public never sees in-progress URLs. When true, the DRAFT pill renders.
 * When `canManage` is true, an inline switch + note editor appears.
 */
function SitemapBranch({
  node,
  depth = 0,
  isStaff,
  canManage,
  statusMap,
  onSetStatus,
  onClearStatus,
}: {
  node: SitemapNode;
  depth?: number;
  isStaff: boolean;
  canManage: boolean;
  statusMap: PageStatusMap;
  onSetStatus: (path: string, status: "live" | "draft", note?: string | null) => Promise<void>;
  onClearStatus: (path: string) => Promise<void>;
}) {
  const indent = depth * 20;
  const draftEntry = node.path ? resolvePageStatusEntry(node.path, statusMap) : undefined;
  const isDraft = draftEntry?.status === "draft";

  // Hide drafts from the public.
  if (isDraft && !isStaff) return null;

  // Filter children too.
  const visibleChildren = node.children?.filter((child) => {
    if (!child.path) return true;
    return isStaff || resolvePageStatus(child.path, statusMap) !== "draft";
  });

  return (
    <li className="my-1.5" style={{ marginLeft: depth === 0 ? 0 : indent }}>
      <div className="flex items-baseline gap-2 flex-wrap">
        {depth > 0 && <span className="text-pps-teal/60">↳</span>}
        {node.path ? (
          <Link
            to={node.path}
            className="text-pps-navy hover:text-pps-teal hover:underline font-montserrat"
          >
            <span className={depth === 0 ? "font-poppins font-semibold text-base" : "text-sm"}>
              {node.label}
            </span>
            <span className="text-pps-charcoal/60 text-xs ml-2">{node.path}</span>
          </Link>
        ) : (
          <span className="font-poppins font-semibold text-base text-pps-navy">{node.label}</span>
        )}
        {isDraft && isStaff && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-poppins font-bold uppercase tracking-wide bg-pps-gold/20 text-pps-navy border border-pps-gold/40"
            title={draftEntry?.note ?? "Hidden from the public"}
          >
            Draft
          </span>
        )}
        {canManage && node.path && (
          <InlineStatusControl
            path={node.path}
            entry={draftEntry}
            onSetStatus={onSetStatus}
            onClearStatus={onClearStatus}
          />
        )}
      </div>
      {node.note && (
        <div className="ml-6 text-xs text-pps-charcoal/60 italic font-montserrat">
          {node.note}
        </div>
      )}
      {isDraft && isStaff && draftEntry?.note && (
        <div className="ml-6 text-xs text-pps-navy/70 italic font-montserrat">
          Draft note: {draftEntry.note}
        </div>
      )}
      {visibleChildren && visibleChildren.length > 0 && (
        <ul className="mt-1 border-l-2 border-pps-teal/20 pl-3">
          {visibleChildren.map((child) => (
            <SitemapBranch
              key={child.label}
              node={child}
              depth={depth + 1}
              isStaff={isStaff}
              canManage={canManage}
              statusMap={statusMap}
              onSetStatus={onSetStatus}
              onClearStatus={onClearStatus}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Compact admin-only control: a Live/Draft switch + optional inline note.
 * Hidden from non-admins entirely (UI mirrors the DB RLS rule).
 */
function InlineStatusControl({
  path,
  entry,
  onSetStatus,
  onClearStatus,
}: {
  path: string;
  entry?: ReturnType<typeof resolvePageStatusEntry>;
  onSetStatus: (path: string, status: "live" | "draft", note?: string | null) => Promise<void>;
  onClearStatus: (path: string) => Promise<void>;
}) {
  const { toast } = useToast();
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(entry?.note ?? "");
  const [busy, setBusy] = useState(false);

  const isDraft = entry?.status === "draft";

  const flip = async (next: boolean) => {
    setBusy(true);
    try {
      await onSetStatus(path, next ? "draft" : "live", entry?.note ?? null);
      toast({
        title: next ? "Marked as draft" : "Marked as live",
        description: path,
      });
    } catch (err) {
      toast({ title: "Update failed", description: String(err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const saveNote = async () => {
    setBusy(true);
    try {
      await onSetStatus(path, isDraft ? "draft" : "live", noteDraft.trim() || null);
      setEditingNote(false);
      toast({ title: "Note saved" });
    } catch (err) {
      toast({ title: "Save failed", description: String(err), variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <span className="inline-flex items-center gap-2 ml-2 px-2 py-0.5 rounded bg-pps-navy/[0.03] border border-pps-navy/10">
      <span className="text-[10px] font-poppins uppercase tracking-wide text-pps-charcoal/70">
        Draft
      </span>
      <Switch
        checked={!!isDraft}
        onCheckedChange={flip}
        disabled={busy}
        aria-label={`Toggle draft status for ${path}`}
      />
      {!editingNote ? (
        <button
          type="button"
          onClick={() => {
            setNoteDraft(entry?.note ?? "");
            setEditingNote(true);
          }}
          className="text-pps-charcoal/60 hover:text-pps-teal"
          title="Edit note"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
      ) : (
        <span className="inline-flex items-center gap-1">
          <Input
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
            placeholder="Optional note"
            className="h-6 text-xs w-44 px-2"
            autoFocus
          />
          <Button size="sm" className="h-6 px-2 text-xs" onClick={saveNote} disabled={busy}>
            Save
          </Button>
          <button
            type="button"
            onClick={() => setEditingNote(false)}
            className="text-pps-charcoal/60 hover:text-pps-charcoal"
            aria-label="Cancel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      )}
      {entry && (
        <button
          type="button"
          onClick={async () => {
            setBusy(true);
            try {
              await onClearStatus(path);
              toast({ title: "Override cleared", description: path });
            } catch (err) {
              toast({ title: "Clear failed", description: String(err), variant: "destructive" });
            } finally {
              setBusy(false);
            }
          }}
          className="text-[10px] text-pps-charcoal/60 hover:text-pps-raspberry underline"
          disabled={busy}
        >
          reset
        </button>
      )}
    </span>
  );
}

export default function Sitemap() {
  useDocumentSeo({
    title: "Sitemap | Painted Porch Strategies",
    description: "Complete list of all pages on the Painted Porch Strategies website, organized by section.",
  });

  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useUserRole();
  const { map: statusMap, loading: statusLoading, setStatus, clearStatus } = usePageStatuses();
  const isStaff = !!user;
  const isEditorPreview = isLovableEditorPreview();

  // Sitemap is for internal admin/management use only. Allow access when:
  //   1. User is signed in as staff, OR
  //   2. App is running inside the Lovable editor preview iframe.
  // Everyone else (public visitors on the published site or custom domain)
  // sees the friendly Coming Soon page so the route isn't enumerable.
  if (authLoading || statusLoading) return null;
  if (!isStaff && !isEditorPreview) return <ComingSoon />;

  // Count visible (live + admin-only-drafts-when-staff) links.
  const countVisible = (node: SitemapNode): number => {
    if (node.path && resolvePageStatus(node.path, statusMap) === "draft" && !isStaff) return 0;
    const self = node.path ? 1 : 0;
    const childCount = node.children?.reduce((s, c) => s + countVisible(c), 0) ?? 0;
    return self + childCount;
  };
  const totalLinks = sitemapData.reduce((acc, n) => acc + countVisible(n), 0);

  const draftCount = Object.values(statusMap).filter((e) => e.status === "draft").length;

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-pps-navy mb-3">
            Sitemap
          </h1>
          <p className="font-montserrat text-pps-charcoal text-lg">
            All {totalLinks} pages on the Painted Porch Strategies website, organized by section.
          </p>
        </header>

        {isStaff && (
          <div className="mb-8 p-4 rounded-lg bg-pps-gold/10 border border-pps-gold/30">
            <p className="font-poppins font-semibold text-sm text-pps-navy mb-1">
              Staff view active
            </p>
            <p className="font-montserrat text-xs text-pps-charcoal">
              You're seeing {draftCount} draft page{draftCount === 1 ? "" : "s"} marked with a{" "}
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-poppins font-bold uppercase bg-pps-gold/20 text-pps-navy border border-pps-gold/40">
                Draft
              </span>{" "}
              pill. The public never sees these.{" "}
              {isAdmin ? (
                <>
                  As an admin, you can flip any page between Live and Draft using the inline switch
                  next to each link, or open the dedicated{" "}
                  <Link to="/admin/pages" className="text-pps-teal underline hover:text-pps-navy">
                    Page Status manager
                  </Link>
                  .
                </>
              ) : (
                <>Only admins can change page status.</>
              )}
            </p>
          </div>
        )}

        <div className="space-y-8">
          {sitemapData.map((section) => (
            <section key={section.label}>
              <ul className="space-y-1">
                <SitemapBranch
                  node={section}
                  isStaff={isStaff}
                  canManage={isAdmin}
                  statusMap={statusMap}
                  onSetStatus={setStatus}
                  onClearStatus={clearStatus}
                />
              </ul>
            </section>
          ))}
        </div>
        <footer className="mt-16 pt-8 border-t border-pps-charcoal/10">
          <p className="font-montserrat text-sm text-pps-charcoal/70">
            Looking for the XML sitemap for search engines?{" "}
            <a href="/sitemap.xml" className="text-pps-teal hover:underline">
              View sitemap.xml
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}

