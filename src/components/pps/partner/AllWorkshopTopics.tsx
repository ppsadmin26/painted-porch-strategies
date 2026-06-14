import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic } from "lucide-react";

type Row = {
  offering_key: string;
  name: string;
  blurb: string | null;
  anchor_id: string | null;
  facilitator: string | null;
  topic: string | null;
};

const FACILITATOR_FULL_NAME: Record<string, string> = {
  Amy: "Amy Yackowski",
  Rob: "Rob Hunter",
  Sierra: "Sierra Ramm Cantrell",
};
const fullName = (f: string | null) => (f ? FACILITATOR_FULL_NAME[f] ?? f : "");

/**
 * Full, canonical list of every workshop topic in the P.A.T.H.finder catalog.
 * Lives in a collapsible accordion so it doesn't overwhelm the featured cards
 * above, while still giving quiz recommendations a real anchor to land on.
 */
export function AllWorkshopTopics({ excludeKeys = [] }: { excludeKeys?: string[] } = {}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const { hash } = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // NOTE: do NOT filter by is_live here. For workshop rows, `is_live` means
      // "has a dedicated standalone page" (most don't — they live on this hub).
      // The accordion IS the canonical home, so we show every workshop row.
      const { data, error } = await supabase
        .from("path_finder_offerings")
        .select("offering_key, name, blurb, anchor_id, facilitator, current_url, is_live")
        .eq("current_url", "/partner/amplify/workshops")
        .order("name", { ascending: true });
      if (error || !data || cancelled) return;
      setRows(data as Row[]);
    })();
    return () => { cancelled = true; };
  }, []);

  // Filter out anything already featured as a card on the page (by offering_key or anchor_id).
  const visibleRows = useMemo(() => {
    const skip = new Set(excludeKeys);
    return rows.filter((r) => !skip.has(r.offering_key) && !(r.anchor_id && skip.has(r.anchor_id)));
  }, [rows, excludeKeys]);

  // Open the accordion item that matches the URL hash, and scroll to it.
  useEffect(() => {
    if (!hash || visibleRows.length === 0) return;
    const target = hash.replace(/^#/, "");
    const match = visibleRows.find((r) => (r.anchor_id || r.offering_key) === target);
    if (!match) return;
    setOpenItems((prev) => (prev.includes(target) ? prev : [...prev, target]));
    // Give DOM a tick to expand, then scroll.
    setTimeout(() => {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  }, [hash, visibleRows]);

  const grouped = useMemo(() => {
    return visibleRows.map((r) => ({
      id: r.anchor_id || r.offering_key,
      ...r,
    }));
  }, [visibleRows]);

  if (visibleRows.length === 0) return null;

  return (
    <div className="mt-12 scroll-mt-24" id="all-workshop-topics">
      <div className="text-center mb-6">
        <h3 className="text-2xl md:text-3xl font-poppins font-bold text-navy mb-2">
          Browse All Workshop Topics
        </h3>
        <p className="text-foreground/80 max-w-2xl mx-auto">
          The full catalog. Many also work as a 60-minute keynote or expand into a 2+ hour interactive workshop, tailored to your team.
        </p>
      </div>

      <Accordion
        type="multiple"
        value={openItems}
        onValueChange={setOpenItems}
        className="bg-white border border-border rounded-xl divide-y divide-border"
      >
        {grouped.map((r) => (
          <AccordionItem
            key={r.offering_key}
            value={r.id}
            id={r.id}
            className="scroll-mt-24 border-0 px-4 sm:px-6"
          >
            <AccordionTrigger className="text-left hover:no-underline py-4">
              <div className="flex-1 pr-3">
                <div className="font-poppins font-semibold text-navy text-base sm:text-lg">
                  {r.name}
                </div>
                {r.facilitator && (
                  <div className="text-xs text-foreground/60 mt-0.5">
                    Facilitated by {fullName(r.facilitator)}
                  </div>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5">
              {r.blurb && (
                <p className="text-sm sm:text-base text-foreground mb-4">{r.blurb}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to={`/contact?scope=organization&interest=workshops&message=${encodeURIComponent(
                    `I'm interested in the "${r.name}" workshop for our team.`
                  )}`}
                  className="w-full sm:w-auto"
                >
                  <Button className="bg-teal text-white hover:bg-teal/90 w-full sm:w-auto h-11 px-5 text-sm">
                    Inquire About This Topic <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/speaking" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="border-2 border-teal text-teal hover:bg-teal hover:text-white w-full sm:w-auto h-11 px-5 text-sm"
                  >
                    <Mic className="mr-1 h-4 w-4" /> Also Available as a Keynote
                  </Button>
                </Link>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
