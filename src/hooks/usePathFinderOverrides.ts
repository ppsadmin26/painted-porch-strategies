import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Returns a map: offering_key -> resolved URL.
// If is_live=true and dedicated_url is set, that wins. Otherwise current_url.
// Anchor_id, when present, is appended (#anchor).
export function usePathFinderOverrides() {
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("path_finder_offerings")
        .select("offering_key, current_url, dedicated_url, anchor_id, is_live");
      if (error || !data || cancelled) return;
      const map: Record<string, string> = {};
      for (const row of data) {
        let url = row.is_live && row.dedicated_url ? row.dedicated_url : row.current_url;
        if (!url) continue;
        if (row.anchor_id && !url.includes("#")) {
          url = `${url}#${row.anchor_id}`;
        }
        map[row.offering_key] = url;
      }
      setOverrides(map);
    })();
    return () => { cancelled = true; };
  }, []);

  return overrides;
}
