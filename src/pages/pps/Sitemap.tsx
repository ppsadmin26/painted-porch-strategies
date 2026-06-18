import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { usePageStatuses, type PageStatusMap, type PageStatusRecord } from "@/hooks/usePageStatuses";
import { resolvePageStatus, resolvePageStatusEntry } from "@/config/pageStatus";
import {
  CATEGORY_META,
  getDefaultCategoryForPath,
  type PageCategory,
} from "@/config/pageCategories";
import { isLovableEditorPreview } from "@/lib/lovablePreview";
import { supabase } from "@/integrations/supabase/client";
import ComingSoon from "@/pages/pps/ComingSoon";
import { Settings2 } from "lucide-react";

/** Resolve effective category for a path: DB row wins, else URL heuristic. */
function resolveCategory(path: string, map: PageStatusMap): PageCategory {
  return (map[path]?.category as PageCategory | undefined) ?? getDefaultCategoryForPath(path);
}

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
              { label: "Working Genius", path: "/partner/ignite/assessments/working-genius" },
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
      { label: "Terms, Privacy & Cookies", path: "/terms" },
      { label: "Privacy Policy (tab)", path: "/privacy", note: "Redirects to /terms?tab=privacy" },
      { label: "Cookie Policy (tab)", path: "/cookies", note: "Redirects to /terms?tab=cookies" },
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
      { label: "Policy Notifications", path: "/admin/policy-notifications", note: "Email subscribers when Terms/Privacy/Cookies change" },
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
 * Read-only sitemap tree.
 *
 * - Public visitors: drafts AND non-public categories are filtered out entirely.
 * - Staff: drafts render with a DRAFT pill; non-public categories render with
 *   their category pill. All writes (status, category, SEO/AEO) live on
 *   `/admin/pages`.
 */
function SitemapBranch({
  node,
  depth = 0,
  isStaff,
  statusMap,
}: {
  node: SitemapNode;
  depth?: number;
  isStaff: boolean;
  statusMap: PageStatusMap;
}) {
  const indent = depth * 20;
  const draftEntry = node.path ? resolvePageStatusEntry(node.path, statusMap) : undefined;
  const isDraft = draftEntry?.status === "draft";
  const category: PageCategory = node.path ? resolveCategory(node.path, statusMap) : "public";
  const isNonPublic = category !== "public";

  // Hide drafts AND non-public categories from the public.
  if ((isDraft || isNonPublic) && !isStaff) return null;

  // Filter children too.
  const visibleChildren = node.children?.filter((child) => {
    if (!child.path) return true;
    if (isStaff) return true;
    if (resolvePageStatus(child.path, statusMap) === "draft") return false;
    if (resolveCategory(child.path, statusMap) !== "public") return false;
    return true;
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
        {isStaff && node.path && category !== "public" && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-poppins font-bold uppercase tracking-wide ${CATEGORY_META[category].pillClass}`}
            title={CATEGORY_META[category].description}
          >
            {CATEGORY_META[category].label}
          </span>
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
              statusMap={statusMap}
            />
          ))}
        </ul>
      )}
    </li>
  );
}


export default function Sitemap() {
  useDocumentSeo({
    title: "Sitemap | Painted Porch Strategies",
    description: "Complete list of all pages on the Painted Porch Strategies website, organized by section.",
  });

  const { user, loading: authLoading } = useAuth();
  const { isAdmin } = useUserRole();
  const { map: rawStatusMap, loading: statusLoading, setStatus, clearStatus } = usePageStatuses();
  const [notesById, setNotesById] = useState<Record<string, string | null>>({});
  const isStaff = !!user;
  const isEditorPreview = isLovableEditorPreview();

  // The `note` column is admin-only at the DB grant level; admins hydrate it
  // here so draft-note tooltips and inline editors still work in the sitemap.
  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase.rpc("admin_list_page_status_notes");
      if (cancelled || error || !data) return;
      const next: Record<string, string | null> = {};
      for (const row of data as Array<{ id: string; note: string | null }>) {
        next[row.id] = row.note;
      }
      setNotesById(next);
    })();
    return () => { cancelled = true; };
  }, [isAdmin]);

  // Merge admin-only notes into the status map so downstream renders read .note as expected.
  const statusMap = useMemo<PageStatusMap>(() => {
    if (!isAdmin) return rawStatusMap;
    const merged: PageStatusMap = {};
    for (const [path, entry] of Object.entries(rawStatusMap) as Array<[string, PageStatusRecord]>) {
      merged[path] = { ...entry, note: notesById[entry.id] ?? null };
    }
    return merged;
  }, [rawStatusMap, notesById, isAdmin]);

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
          <p className="font-montserrat text-pps-charcoal text-lead">
            All {totalLinks} pages on the Painted Porch Strategies website, organized by section.
          </p>
        </header>

        {isStaff && (
          <div className="mb-8 p-4 rounded-lg bg-pps-gold/10 border border-pps-gold/30">
            <p className="font-poppins font-semibold text-body-sm text-pps-navy mb-1">
              Staff view active
            </p>
            <p className="font-montserrat text-caption text-pps-charcoal">
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
          <p className="font-montserrat text-body-sm text-pps-charcoal/70">
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

