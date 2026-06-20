import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Users, ArrowRight, Flame } from "lucide-react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import { Eyebrow } from "@/components/pps/Eyebrow";
import { ParallaxCTA } from "@/components/pps/ParallaxCTA";
import speakingHero from "@/assets/heroes/speaking-hero.jpg";

// Topic images (existing assets). Keyed by normalized base name.
import aiEiOh from "@/assets/speaking/keynote-ai-ei-oh.png.asset.json";
import stoicism from "@/assets/speaking/keynote-cover-stoicism.png.asset.json";
import speedOfChange from "@/assets/speaking/keynote-cover-speed-of-change.png.asset.json";
import alice from "@/assets/speaking/alice-principles.png.asset.json";
import dontPanic from "@/assets/speaking/dont-panic-hitchhiker.png.asset.json";
import dysfunctionToDynamic from "@/assets/speaking/dysfunction-to-dynamic.png.asset.json";
import shiftHappens from "@/assets/speaking/shift-happens.png.asset.json";
import heroesAssemble from "@/assets/speaking/amy-heroes-assemble.png";
import goldilocks from "@/assets/speaking/amy-goldilocks-leadership.png";

type Row = {
  offering_key: string;
  name: string;
  blurb: string | null;
  description: string | null;
  topic: string | null;
  facilitator: string | null;
  current_url: string;
  anchor_id: string | null;
};

type MergedTopic = {
  key: string;
  baseName: string;
  blurb: string;
  topic: string;
  facilitator: string;
  formats: ("Speaking" | "Workshop")[];
  image?: string;
};

const UNTAGGED = "More";

function displayTopic(raw: string | null): string {
  const t = raw?.trim() || UNTAGGED;
  if (t === "Resilience" || t === "Wellbeing" || t === "Mindset & Resilience") return "Mindset & Resilience";
  if (t === "Innovation" || t === "Change" || t === "Change & Innovation") return "Change & Innovation";
  if (t === "Comms" || t === "Communication") return "Communication";
  if (t === "Leadership & EQ") return "Leadership & EQ";
  if (t === "Teams") return "Teams";
  if (t === "Philosophy") return "Philosophy";
  return t;
}

const FACILITATOR_FULL: Record<string, string> = {
  Amy: "Amy Yackowski",
  Rob: "Rob Hunter",
  Sierra: "Sierra Ramm Cantrell",
  "Painted Porch Team": "Painted Porch Team",
};

/** Strip "(Keynote)", "(Workshop)", "(B2B)" suffixes; collapse to lowercase key. */
function normalizeKey(name: string): string {
  return name
    .replace(/\s*\((Keynote|Workshop|B2B|Lab|Masterclass|Mini Course)\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function cleanName(name: string): string {
  return name
    .replace(/\s*\((Keynote|Workshop|B2B|Lab|Masterclass|Mini Course)\)\s*$/i, "")
    .trim();
}

// Image map keyed by normalized base name
const IMAGE_MAP: Record<string, string> = {
  "ai, ei, oh! guiding change and ai adoption": aiEiOh.url,
  "ai, ei, oh!": aiEiOh.url,
  "stoicism in the workplace": stoicism.url,
  "lead at the speed of change": speedOfChange.url,
  "the alice principles: down the rabbit hole of transformation": alice.url,
  "the alice principles": alice.url,
  "don't panic! navigating a changing world": dontPanic.url,
  "from dysfunction to dynamic teams": dysfunctionToDynamic.url,
  "shift happens. be ready.": shiftHappens.url,
  "heroes assemble": heroesAssemble,
  "heroes assemble!": heroesAssemble,
  "goldilocks leadership": goldilocks,
};

// Color accent per topic for the image placeholder when no image exists
const TOPIC_ACCENT: Record<string, string> = {
  "Leadership & EQ": "from-primary/80 to-navy",
  "Change & Innovation": "from-purple/80 to-navy",
  "Communication": "from-gold/80 to-navy",
  "Mindset & Resilience": "from-bluedoor/80 to-navy",
  "Teams": "from-primary/80 to-purple",
  "Philosophy": "from-navy to-bluedoor",
  [UNTAGGED]: "from-navy to-charcoal",
};

export default function SpeakingWorkshopTopics() {
  useDocumentSeo({
    title: "Speaking & Workshop Topics | Painted Porch Strategies",
    description:
      "Every speaking and workshop topic we offer, filterable by theme and speaker. Each topic can be delivered as a keynote, an interactive workshop, or both.",
    ogImage: speakingHero,
  });

  const [rows, setRows] = useState<Row[]>([]);
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [speakerFilter, setSpeakerFilter] = useState<string>("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("path_finder_offerings")
        .select("offering_key,name,blurb,description,topic,facilitator,current_url,anchor_id")
        .or(
          "current_url.eq./partner/amplify/workshops,current_url.eq./speaking/amy,current_url.eq./speaking/rob,current_url.eq./speaking/sierra",
        )
        .order("name", { ascending: true });
      if (!cancelled && !error && data) setRows(data as Row[]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Merge keynote + workshop rows that share a base name.
  const merged: MergedTopic[] = useMemo(() => {
    const map = new Map<string, MergedTopic>();
    for (const r of rows) {
      const key = normalizeKey(r.name);
      const baseName = cleanName(r.name);
      const isKeynote = r.current_url.startsWith("/speaking/") || /\(Keynote\)/i.test(r.name);
      const isWorkshop = r.current_url === "/partner/amplify/workshops";
      const existing = map.get(key);
      if (existing) {
        if (isKeynote && !existing.formats.includes("Speaking")) existing.formats.push("Speaking");
        if (isWorkshop && !existing.formats.includes("Workshop")) existing.formats.push("Workshop");
        // Prefer workshop's topic tag (more detailed)
        if (isWorkshop && r.topic) existing.topic = displayTopic(r.topic);
        if (!existing.blurb && (r.description || r.blurb)) existing.blurb = (r.description || r.blurb) as string;
        if (!existing.facilitator && r.facilitator) existing.facilitator = r.facilitator;
        return;
      }
      map.set(key, {
        key,
        baseName,
        blurb: (r.description || r.blurb || "") as string,
        topic: displayTopic(r.topic),
        facilitator: r.facilitator || "",
        formats: [isKeynote ? "Speaking" : isWorkshop ? "Workshop" : "Speaking"],
        image: IMAGE_MAP[key],
      });
    }
    return Array.from(map.values()).sort((a, b) => a.baseName.localeCompare(b.baseName));
  }, [rows]);

  const topics = useMemo(() => {
    const set = new Set<string>();
    merged.forEach((m) => set.add(m.topic));
    return Array.from(set).sort((a, b) => (a === UNTAGGED ? 1 : b === UNTAGGED ? -1 : a.localeCompare(b)));
  }, [merged]);

  const speakers = useMemo(() => {
    const set = new Set<string>();
    merged.forEach((m) => m.facilitator && set.add(m.facilitator));
    return Array.from(set).sort();
  }, [merged]);

  const visible = useMemo(() => {
    return merged.filter((m) => {
      if (topicFilter !== "all" && m.topic !== topicFilter) return false;
      if (speakerFilter !== "all" && m.facilitator !== speakerFilter) return false;
      return true;
    });
  }, [merged, topicFilter, speakerFilter]);

  // Group visible by topic
  const grouped = useMemo(() => {
    const byTopic = new Map<string, MergedTopic[]>();
    for (const t of topics) byTopic.set(t, []);
    for (const m of visible) {
      if (!byTopic.has(m.topic)) byTopic.set(m.topic, []);
      byTopic.get(m.topic)!.push(m);
    }
    return Array.from(byTopic.entries()).filter(([, items]) => items.length > 0);
  }, [visible, topics]);

  return (
    <div>
      <TierHeroSection
        customBadge={<Eyebrow tone="gold">Speaking & Workshop Topics</Eyebrow>}
        headline="What We Speak About. What We Build Together."
        description="Every topic below can show up as a 60-minute keynote, an interactive workshop, or both. Speaking ignites the spark. The workshop turns it into action and lasting change."
        ctas={[
          { label: "Meet Our Speakers", href: "/speaking", isPrimary: true },
          { label: "Inquire About a Topic", href: "/contact?interest=speaking&message=I'm interested in one of your speaking or workshop topics.", isPrimary: false },
        ]}
        background={{ type: "image", src: speakingHero }}
        overlayClass="bg-navy/55"
        minHeightClass="min-h-[55vh]"
      />

      {/* Intro / philosophy */}
      <section className="py-14 md:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <Eyebrow tone="teal">Why these topics?</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mt-3 mb-4">
              We don't talk about change. We help you author it.
            </h2>
            <p className="text-lead text-foreground">
              Our topics live where strategy, Stoic philosophy, and human capacity meet. They come from 20+ years of partnering with leaders at the moment of strategic authorship, when teams stop reacting to change competitors have already launched and start designing the shIFt they want to lead.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="rounded-xl border border-border bg-muted/30 p-6">
              <div className="text-sm font-poppins font-semibold text-teal uppercase tracking-wide mb-2">Foundational</div>
              <p className="text-body-sm text-foreground">Leadership, culture, and the Stoic mindset required to lead change instead of survive it.</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-6">
              <div className="text-sm font-poppins font-semibold text-lime-green uppercase tracking-wide mb-2">Operational</div>
              <p className="text-body-sm text-foreground">Communication, team dynamics, and workflow shifts that make new direction stick.</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-6">
              <div className="text-sm font-poppins font-semibold text-raspberry uppercase tracking-wide mb-2">Human</div>
              <p className="text-body-sm text-foreground">Resilience, mindfulness, and emotional intelligence so your people thrive through the shIFt, not just survive it.</p>
            </div>
          </div>
          <div className="mt-10 rounded-2xl bg-navy text-white p-6 md:p-8 text-center">
            <p className="text-body text-white/90">
              <strong className="text-gold">Speaking ignites. Workshops activate.</strong> Every topic below can be delivered as a keynote, expanded into a 2+ hour workshop, or sequenced as both: a keynote to spark the room, then a workshop to turn insight into shared practice.
            </p>
          </div>
        </div>
      </section>

      {/* Filters + grid */}
      <section className="py-12 md:py-16 bg-muted/20">
        <div className="container max-w-7xl mx-auto px-6">
          {/* Filters */}
          <div className="bg-white border border-border rounded-xl p-4 md:p-5 mb-8 shadow-sm space-y-4">
            <div>
              <div className="text-xs font-poppins font-semibold text-navy uppercase tracking-wide mb-2">Filter by Topic</div>
              <Tabs value={topicFilter} onValueChange={setTopicFilter}>
                <TabsList className="flex flex-wrap h-auto justify-start gap-1 bg-muted/50 p-1">
                  <TabsTrigger value="all" className="data-[state=active]:bg-teal data-[state=active]:text-white text-xs sm:text-sm">
                    All ({merged.length})
                  </TabsTrigger>
                  {topics.map((t) => {
                    const count = merged.filter((m) => m.topic === t).length;
                    return (
                      <TabsTrigger key={t} value={t} className="data-[state=active]:bg-teal data-[state=active]:text-white text-xs sm:text-sm">
                        {t} ({count})
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
            <div>
              <div className="text-xs font-poppins font-semibold text-navy uppercase tracking-wide mb-2">Filter by Speaker</div>
              <Tabs value={speakerFilter} onValueChange={setSpeakerFilter}>
                <TabsList className="flex flex-wrap h-auto justify-start gap-1 bg-muted/50 p-1">
                  <TabsTrigger value="all" className="data-[state=active]:bg-navy data-[state=active]:text-white text-xs sm:text-sm">
                    All Speakers
                  </TabsTrigger>
                  {speakers.map((s) => (
                    <TabsTrigger key={s} value={s} className="data-[state=active]:bg-navy data-[state=active]:text-white text-xs sm:text-sm">
                      {FACILITATOR_FULL[s] ?? s}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>

          {/* Grouped grid */}
          {grouped.length === 0 ? (
            <div className="text-center py-12 text-foreground/70">
              <p className="text-body">No topics match those filters yet. Try another combination.</p>
            </div>
          ) : (
            grouped.map(([topic, items]) => (
              <div key={topic} className="mb-12">
                <div className="flex items-end justify-between mb-4">
                  <h3 className="text-2xl md:text-3xl font-poppins font-bold text-navy">{topic}</h3>
                  <span className="text-caption text-foreground/60">{items.length} topic{items.length === 1 ? "" : "s"}</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {items.map((m) => (
                    <article key={m.key} className="bg-white border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow flex flex-col">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        {m.image ? (
                          <img src={m.image} alt={m.baseName} loading="lazy" className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${TOPIC_ACCENT[m.topic] ?? TOPIC_ACCENT[UNTAGGED]} flex items-center justify-center p-4`}>
                            <span className="text-white/90 font-poppins font-semibold text-center text-lg leading-tight">{m.baseName}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1 flex flex-col">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-flex items-center rounded-full bg-teal/10 text-teal px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                            {m.topic}
                          </span>
                          {m.formats.includes("Speaking") && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 text-gold px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                              <Mic className="w-3 h-3" /> Speaking
                            </span>
                          )}
                          {m.formats.includes("Workshop") && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple/15 text-purple px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide">
                              <Users className="w-3 h-3" /> Workshop
                            </span>
                          )}
                        </div>
                        <h4 className="font-poppins font-bold text-navy text-lg mb-1.5 leading-snug">{m.baseName}</h4>
                        {m.facilitator && (
                          <div className="text-caption text-foreground/60 mb-2 flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-primary" />
                            {FACILITATOR_FULL[m.facilitator] ?? m.facilitator}
                          </div>
                        )}
                        {m.blurb && <p className="text-body-sm text-foreground/85 mb-4 flex-1">{m.blurb}</p>}
                        <Link
                          to={`/contact?interest=speaking&message=${encodeURIComponent(`I'm interested in "${m.baseName}" as a ${m.formats.length === 2 ? "keynote or workshop" : m.formats[0].toLowerCase()}.`)}`}
                          className="mt-auto"
                        >
                          <Button className="bg-teal text-white hover:bg-teal/90 w-full h-10 text-sm">
                            Inquire About This Topic <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Final CTA */}
      <ParallaxCTA
        eyebrow="Bring a Topic to Your Team"
        headline="Pick a topic. We'll shape it to your moment."
        description="Every topic above adapts to your audience, your industry, and your current shIFt. Tell us where you are and we'll recommend the right format. keynote, workshop, or a combination that creates lasting change."
        overlayTone="teal"
        actions={[
          { label: "Contact Us", to: "/contact?interest=speaking&message=I'd like to talk about a speaking or workshop topic for our team.", variant: "primary" },
          { label: "Meet Our Speakers", to: "/speaking", variant: "secondary" },
        ]}
      />
    </div>
  );
}
