import { useLocation } from "react-router-dom";
import { usePageStatuses } from "@/hooks/usePageStatuses";
import { useUserRole } from "@/hooks/useUserRole";
import { resolvePageStatus } from "@/config/pageStatus";
import { isLovableEditorPreview } from "@/lib/lovablePreview";
import ComingSoon from "@/pages/pps/ComingSoon";

interface PageGateProps {
  children: React.ReactNode;
}

/**
 * Inspects the current pathname against the live page-status map (DB).
 * - "live" routes render normally.
 * - "draft" routes show <ComingSoon /> to the public.
 * - Only admin or editor roles bypass and see the real page. Other
 *   authenticated users (contributors, authors, public assessment users) are
 *   treated as visitors and see <ComingSoon />.
 * - The Lovable editor preview iframe always bypasses (preview-only).
 *
 * Wrap this around <Outlet /> in PPSLayout so every route is gated centrally.
 */
export default function PageGate({ children }: PageGateProps) {
  const { pathname } = useLocation();
  const { map, loading: statusLoading } = usePageStatuses();
  const { role, loading: roleLoading } = useUserRole();
  const status = resolvePageStatus(pathname, map);

  if (status === "live") return <>{children}</>;

  // Lovable editor preview iframe always bypasses gating (preview-only).
  if (isLovableEditorPreview()) return <>{children}</>;

  // Avoid a flash of "Coming Soon" before role + status resolve.
  if (roleLoading || statusLoading) return null;

  // Only admins and editors can preview draft pages.
  if (role === "admin" || role === "editor") return <>{children}</>;

  return <ComingSoon />;
}
