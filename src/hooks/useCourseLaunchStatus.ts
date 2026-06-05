import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CourseLaunchStatus {
  slug: string;
  course_name: string;
  status: "coming_soon" | "live";
  checkout_url: string | null;
  course_path: string;
  notified_at: string | null;
  notified_count: number;
}

/**
 * Reads the launch status for a given course slug.
 * Falls back to `coming_soon` while loading or if the row is missing,
 * so the UI never accidentally shows a Purchase button it shouldn't.
 */
export function useCourseLaunchStatus(slug: string) {
  const [data, setData] = useState<CourseLaunchStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data: row } = await supabase
        .from("course_launch_status")
        .select("slug, course_name, status, checkout_url, course_path, notified_at, notified_count")
        .eq("slug", slug)
        .maybeSingle();
      if (!active) return;
      setData((row as CourseLaunchStatus) ?? null);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const isLive = data?.status === "live" && !!data?.checkout_url;
  return { data, loading, isLive };
}
