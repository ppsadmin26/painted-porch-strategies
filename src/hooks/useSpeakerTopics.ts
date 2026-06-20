import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SpeakingTopic } from "@/pages/pps/speaking/SpeakerDetailPage";

/** Strip "(Keynote)", "(Workshop)" etc. suffixes and normalize whitespace/case. */
export function canonicalTopicKey(name: string): string {
  return name
    .replace(/\s*\((Keynote|Workshop|B2B|Lab|Masterclass|Mini Course)\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanTopicName(name: string): string {
  return name
    .replace(/\s*\((Keynote|Workshop|B2B|Lab|Masterclass|Mini Course)\)\s*$/i, "")
    .trim();
}

function slugify(name: string): string {
  return cleanTopicName(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Fetches every topic for a given facilitator (Amy / Rob / Sierra) from
 * path_finder_offerings, deduping keynote + workshop rows that share a base
 * name. Prefers the longest description (keynote rows usually have richer
 * marketing copy) and the first non-null image_url.
 *
 * Returns null until the first fetch completes so callers can decide whether
 * to render a fallback (hardcoded) topic list.
 */
export function useSpeakerTopics(facilitator: string): SpeakingTopic[] | null {
  const [topics, setTopics] = useState<SpeakingTopic[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("path_finder_offerings")
        .select("name, description, blurb, image_url, is_keynote, include_in_workshops, sort_order")
        .eq("facilitator", facilitator)
        .or("is_keynote.eq.true,include_in_workshops.eq.true")
        .order("sort_order", { ascending: true });

      if (cancelled) return;
      if (error || !data) {
        setTopics([]);
        return;
      }

      const map = new Map<string, SpeakingTopic & { _len: number }>();
      for (const r of data) {
        const key = canonicalTopicKey(r.name);
        const title = cleanTopicName(r.name);
        const desc = (r.description || r.blurb || "") as string;
        const existing = map.get(key);
        if (existing) {
          if (desc.length > existing._len) {
            existing.description = desc;
            existing._len = desc.length;
          }
          if (!existing.image && r.image_url) existing.image = r.image_url;
        } else {
          map.set(key, {
            slug: slugify(r.name),
            title,
            description: desc,
            image: r.image_url ?? undefined,
            _len: desc.length,
          });
        }
      }
      const list = Array.from(map.values()).map(({ _len, ...t }) => t);
      setTopics(list);
    })();
    return () => {
      cancelled = true;
    };
  }, [facilitator]);

  return topics;
}
