import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { SpeakingTopic } from "@/pages/pps/speaking/SpeakerDetailPage";
import {
  canonicalTopicKey,
  cleanTopicName,
  pickCanonicalTitle,
  slugifyTopicName,
} from "@/data/speakingTopics";

// Re-export for any legacy importers.
export { canonicalTopicKey };

/**
 * Fetches every topic for a given facilitator (Amy / Rob / Sierra) from
 * path_finder_offerings, grouping by `topic_slug` so paired keynote/workshop/
 * lab rows collapse into a single card. The DB trigger guarantees
 * blurb/description/image_url are already in sync across siblings, so we
 * just take the first non-empty value.
 *
 * Falls back to `canonicalTopicKey(name)` for legacy rows where topic_slug
 * is somehow missing.
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
        .select(
          "name, description, blurb, image_url, topic_slug, is_keynote, include_in_workshops, include_on_speaker_page, sort_order",
        )
        .ilike("facilitator", `%${facilitator}%`)
        .eq("include_on_speaker_page", true)
        .order("sort_order", { ascending: true });

      if (cancelled) return;
      if (error || !data) {
        setTopics([]);
        return;
      }

      // Group by topic_slug (preferred) or canonical key (fallback).
      const groups = new Map<
        string,
        { names: string[]; description: string; image?: string }
      >();
      for (const r of data) {
        const key =
          (r as { topic_slug?: string | null }).topic_slug ||
          canonicalTopicKey(r.name);
        const desc = ((r.description || r.blurb) ?? "") as string;
        const existing = groups.get(key);
        if (existing) {
          existing.names.push(r.name);
          if (!existing.description && desc) existing.description = desc;
          if (!existing.image && r.image_url) existing.image = r.image_url;
        } else {
          groups.set(key, {
            names: [r.name],
            description: desc,
            image: r.image_url ?? undefined,
          });
        }
      }

      const list: SpeakingTopic[] = Array.from(groups.values()).map((g) => {
        const title = pickCanonicalTitle(g.names);
        return {
          slug: slugifyTopicName(title),
          title,
          description: g.description,
          image: g.image,
        };
      });
      setTopics(list);
    })();
    return () => {
      cancelled = true;
    };
  }, [facilitator]);

  return topics;
}

// Keep `cleanTopicName` exported for any caller that imported it from here.
export { cleanTopicName };
