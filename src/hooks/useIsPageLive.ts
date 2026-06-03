import { usePageStatuses } from "@/hooks/usePageStatuses";
import { useUserRole } from "@/hooks/useUserRole";
import { resolvePageStatus } from "@/config/pageStatus";

/**
 * Resolves whether a given internal route is currently Live for the viewer.
 *
 * - Admins and editors always see pages as "live" (so they can preview drafts
 *   in nav, cards, and CTAs just like they do on the actual page via PageGate).
 * - Everyone else sees the resolved DB status.
 * - External URLs / hashes / empty paths are always treated as Live.
 */
export function useIsPageLive(path?: string | null) {
  const { map, loading: statusLoading } = usePageStatuses();
  const { role, loading: roleLoading } = useUserRole();

  const canPreview = role === "admin" || role === "editor";
  const isInternal = typeof path === "string" && path.startsWith("/");

  if (!isInternal) {
    return { isLive: true, isDraft: false, canPreview, loading: false };
  }

  const status = resolvePageStatus(path, map);
  const effectiveLive = canPreview ? true : status === "live";

  return {
    isLive: effectiveLive,
    isDraft: status === "draft" && !canPreview,
    canPreview,
    loading: statusLoading || roleLoading,
  };
}

/** Batch helper for filtering nav/footer link arrays. */
export function useArePagesLive(paths: string[]) {
  const { map, loading: statusLoading } = usePageStatuses();
  const { role, loading: roleLoading } = useUserRole();
  const canPreview = role === "admin" || role === "editor";

  const result: Record<string, boolean> = {};
  for (const p of paths) {
    if (!p || !p.startsWith("/")) {
      result[p] = true;
      continue;
    }
    if (canPreview) {
      result[p] = true;
      continue;
    }
    result[p] = resolvePageStatus(p, map) === "live";
  }
  return { liveMap: result, canPreview, loading: statusLoading || roleLoading };
}
