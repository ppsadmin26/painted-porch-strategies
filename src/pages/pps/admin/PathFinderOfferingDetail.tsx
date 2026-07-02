import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import OfferingEditor, { type OfferingRow, type LaunchOption } from "./offerings/OfferingEditor";

export default function PathFinderOfferingDetail() {
  const { offeringKey = "" } = useParams();
  const { toast } = useToast();
  const [row, setRow] = useState<OfferingRow | null>(null);
  const [launches, setLaunches] = useState<LaunchOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      const [offRes, launchRes] = await Promise.all([
        supabase
          .from("path_finder_offerings")
          .select("id, offering_key, name, facilitator, tier, engagement_tier, delivery_format, blurb, description, current_url, dedicated_url, anchor_id, is_live, is_published, sort_order, topic, topic_slug, include_in_workshops, is_featured_in_quiz, is_keynote, include_on_speaker_page, image_url, launch_slug, b2c_rt_pools, b2b_rt_pools, blue_door_required")
          .eq("offering_key", offeringKey)
          .maybeSingle(),
        supabase.from("course_launch_status").select("slug, course_name, status, program_type").order("course_name"),
      ]);
      if (cancelled) return;
      if (offRes.error) {
        toast({ title: "Failed to load", description: offRes.error.message, variant: "destructive" });
      }
      if (!offRes.data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setRow(offRes.data as OfferingRow);
      setLaunches((launchRes.data ?? []) as LaunchOption[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [offeringKey, toast]);

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <Link to="/admin/offerings" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
        <ArrowLeft className="w-4 h-4" /> All offerings
      </Link>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin" /></div>
      ) : notFound || !row ? (
        <div className="border rounded-lg bg-white p-8 text-center">
          <h1 className="text-xl font-poppins font-bold text-navy mb-2">Offering not found</h1>
          <p className="text-sm text-muted-foreground mb-4">No offering with key <code>{offeringKey}</code>.</p>
          <Link to="/admin/offerings" className="text-primary hover:underline">Back to offerings</Link>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h1 className="text-2xl font-poppins font-bold text-navy leading-tight">{row.name}</h1>
            <p className="text-xs text-muted-foreground mt-1">
              <code>{row.offering_key}</code>
            </p>
          </div>
          <OfferingEditor
            row={row}
            launches={launches}
            onSaved={(u) => setRow(u)}
          />
        </>
      )}
    </div>
  );
}
