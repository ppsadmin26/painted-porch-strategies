import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { OfferingKey, ResultType } from "@/data/pathFinderQuiz";

export type RtPoolOverrides = Partial<
  Record<ResultType, { free?: OfferingKey[]; speaking?: OfferingKey[] }>
>;

interface OverridesResult {
  urls: Record<string, string>;
  rtPools: RtPoolOverrides;
}

// Returns a map: offering_key -> resolved URL, plus admin-managed RT-pool
// overrides (which offerings appear in which result-type pools).
// If is_live=true and dedicated_url is set, that wins. Otherwise current_url.
// Anchor_id, when present, is appended (#anchor).
export function usePathFinderOverrides(): Record<string, string> & { __full?: OverridesResult } {
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

// New: fetch RT-pool mappings from path_finder_offerings.b2c_rt_pools / b2b_rt_pools.
// Returns a structure the quiz engine can consume via BuildResultOptions.rtPools.
export function usePathFinderRtPools(): RtPoolOverrides {
  const [pools, setPools] = useState<RtPoolOverrides>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase
        .from("path_finder_offerings")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .select("offering_key, b2c_rt_pools, b2b_rt_pools") as any);
      if (error || !data || cancelled) return;
      const out: RtPoolOverrides = {};
      const append = (rt: string, pool: string, key: string) => {
        const rtKey = rt as ResultType;
        const slot = (out[rtKey] ??= {});
        if (pool === "free") {
          (slot.free ??= []).push(key as OfferingKey);
        } else if (pool === "speaking") {
          (slot.speaking ??= []).push(key as OfferingKey);
        }
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const row of data as any[]) {
        const key = row.offering_key as string;
        for (const [rt, poolsArr] of Object.entries(row.b2c_rt_pools ?? {})) {
          if (!Array.isArray(poolsArr)) continue;
          for (const p of poolsArr as string[]) append(rt, p, key);
        }
        for (const [rt, poolsArr] of Object.entries(row.b2b_rt_pools ?? {})) {
          if (!Array.isArray(poolsArr)) continue;
          for (const p of poolsArr as string[]) append(rt, p, key);
        }
      }
      setPools(out);
    })();
    return () => { cancelled = true; };
  }, []);

  return pools;
}
