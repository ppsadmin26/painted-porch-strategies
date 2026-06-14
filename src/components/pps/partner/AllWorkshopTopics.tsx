import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic } from "lucide-react";

type Row = {
  offering_key: string;
  name: string;
  blurb: string | null;
  description: string | null;
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

const UNTAGGED = "More";

/** Map raw DB topics into merged display tabs. */
function displayTopic(raw: string | null): string {
  const t = raw?.trim() || UNTAGGED;
  if (t === "Resilience" || t === "Wellbeing") return "Resilience & Wellbeing";
  if (t === "Innovation" || t === "Change") return "Change & Innovation";
  return t;
}

/**
 * Full, canonical catalog of every workshop topic. Grouped into topic tabs
 * so it doesn't overwhelm, with each workshop as an accordion item inside its
 * tab. Quiz deep-links (URL hash) auto-select the right tab AND open the item.
 */
export function AllWorkshopTopics({ excludeKeys = [] }: { excludeKeys?: string[] } = {}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [openItems, setOpenItems] = useState<string[]>([]);
  const { hash } = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("path_finder_offerings")
        .select("offering_key, name, blurb, description, anchor_id, facilitator, current_url, is_live, topic")
        .eq("current_url", "/partner/amplify/workshops")
        .order("name", { ascending: true });
      if (error || !data || cancelled) return;
      setRows(data as Row[]);
    })();
    return () => { cancelled = true; };
  }, []);

  const visibleRows = useMemo(() => {
    const skip = new Set(excludeKeys);
    return rows.filter((r) => !skip.has(r.offering_key) && !(r.anchor_id && skip.has(r.anchor_id)));
  }, [rows, excludeKeys]);

  // Build merged topic groups (alphabetical), with an "All" tab first.
  const topics = useMemo(() => {
    const set = new Set<string>();
    visibleRows.forEach((r) => set.add(displayTopic(r.topic)));
    return Array.from(set).sort((a, b) => {
      if (a === UNTAGGED) return 1;
      if (b === UNTAGGED) return -1;
      return a.localeCompare(b);
    });
  }, [visibleRows]);

  const rowsForTab = useMemo(() => {
    if (activeTab === "all") return visibleRows;
    return visibleRows.filter((r) => displayTopic(r.topic) === activeTab);
  }, [visibleRows, activeTab]);

  // Hash deep-link: switch to the matching merged topic tab and open the item.
  useEffect(() => {
    if (!hash || visibleRows.length === 0) return;
    const target = hash.replace(/^#/, "");
    const match = visibleRows.find((r) => (r.anchor_id || r.offering_key) === target);
    if (!match) return;
    setActiveTab(displayTopic(match.topic));
    setOpenItems((prev) => (prev.includes(target) ? prev : [...prev, target]));
    setTimeout(() => {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
  }, [hash, visibleRows]);

  if (visibleRows.length === 0) return null;

  return (
    <div className="mt-12 scroll-mt-24" id="all-workshop-topics">
      <div className="text-center mb-6">
        <h3 className="text-2xl md:text-3xl font-poppins font-bold text-navy mb-2">
          Browse All Workshop Topics
        </h3>
        <p className="text-foreground/80 max-w-2xl mx-auto">
          Pick a topic to explore. Many also work as a 60-minute keynote or expand into a 2+ hour interactive workshop, tailored to your team.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto justify-center gap-1 bg-muted/50 p-1 mb-5">
          <TabsTrigger value="all" className="data-[state=active]:bg-teal data-[state=active]:text-white text-xs sm:text-sm">
            All ({visibleRows.length})
          </TabsTrigger>
          {topics.map((t) => {
            const count = visibleRows.filter((r) => displayTopic(r.topic) === t).length;
            return (
              <TabsTrigger
                key={t}
                value={t}
                className="data-[state=active]:bg-teal data-[state=active]:text-white text-xs sm:text-sm"
              >
                {t} ({count})
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeTab} forceMount>
          <Accordion
            type="multiple"
            value={openItems}
            onValueChange={setOpenItems}
            className="bg-white border border-border rounded-xl divide-y divide-border"
          >
            {rowsForTab.map((r) => {
              const id = r.anchor_id || r.offering_key;
              return (
                <AccordionItem
                  key={r.offering_key}
                  value={id}
                  id={id}
                  className="scroll-mt-24 border-0 px-4 sm:px-6"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    <div className="flex-1 pr-3">
                      <div className="font-poppins font-semibold text-navy text-base sm:text-lg">
                        {r.name}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {r.topic && (
                          <span className="inline-flex items-center rounded-full bg-teal/10 text-teal px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                            {displayTopic(r.topic)}
                          </span>
                        )}
                        {r.facilitator && (
                          <span className="text-xs text-foreground/60">
                            Facilitated by {fullName(r.facilitator)}
                          </span>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    {(r.description || r.blurb) && (
                      <p className="text-sm sm:text-base text-foreground mb-4">{r.description || r.blurb}</p>
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
              );
            })}
          </Accordion>
        </TabsContent>
      </Tabs>
    </div>
  );
}
