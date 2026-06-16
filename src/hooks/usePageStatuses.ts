import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PageStatus = "live" | "draft";

export interface PageStatusRecord {
  id: string;
  path: string;
  status: PageStatus;
  /** Admin-only field. Always null when fetched via this hook (column is
   *  revoked for anon + authenticated). Admin screens hydrate it separately
   *  via the `admin_list_page_status_notes` RPC. */
  note: string | null;
  updated_at: string;
}

export type PageStatusMap = Record<string, PageStatusRecord>;

/**
 * Loads all page-status overrides from the database (single source of truth)
 * and exposes helpers to read + flip individual paths.
 *
 * - All visitors can read (used by PageGate to redirect drafts to ComingSoon).
 * - Only admins can write (RLS enforces this; UI hides the switch otherwise).
 * - The `note` column is admin-only at the column-grant level, so it is never
 *   selected here. Admin screens fetch notes via the dedicated RPC.
 */
export function usePageStatuses() {
  const [map, setMap] = useState<PageStatusMap>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("page_status")
      .select("id, path, status, updated_at");
    if (data) {
      const next: PageStatusMap = {};
      for (const row of data as Array<Omit<PageStatusRecord, "note">>) {
        next[row.path] = { ...row, note: null };
      }
      setMap(next);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();

    // Live updates so flipping a switch in /admin/pages reflects everywhere.
    const channel = supabase
      .channel("page_status_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "page_status" },
        () => {
          load();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  /** Set or upsert a page's status. Admins only (enforced by RLS). */
  const setStatus = useCallback(
    async (path: string, status: PageStatus, note?: string | null) => {
      const existing = map[path];
      if (existing) {
        const { error } = await supabase
          .from("page_status")
          .update({ status, note: note ?? null })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("page_status")
          .insert({ path, status, note: note ?? null });
        if (error) throw error;
      }
      await load();
    },
    [map, load],
  );

  /** Remove an override entirely (page reverts to default Live). */
  const clearStatus = useCallback(
    async (path: string) => {
      const existing = map[path];
      if (!existing) return;
      const { error } = await supabase.from("page_status").delete().eq("id", existing.id);
      if (error) throw error;
      await load();
    },
    [map, load],
  );

  return { map, loading, setStatus, clearStatus, refresh: load };
}
