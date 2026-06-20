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
// Workshop thumbs (already in use on /partner/amplify/workshops)
import architectChangeThumb from "@/assets/workshops/architect-change-thumb.jpg";
import resilienceThumb from "@/assets/workshops/change-resilience-thumb.jpg";
import leadershipOpThumb from "@/assets/workshops/leadership-operating-thumb.jpg";
import communicationThumb from "@/assets/workshops/communication-architecture-thumb.jpg";
import mindfulnessThumb from "@/assets/workshops/mindfulness-leadership-thumb.jpg";
// Newly generated topic covers
import changeForGoodBranded from "@/assets/speaking/topics/change-for-good-branded.jpg.asset.json";
import drivingChange3Shifts from "@/assets/speaking/topics/driving-change-3-shifts.jpg.asset.json";
import conflictToConnection from "@/assets/speaking/topics/conflict-to-connection.jpg.asset.json";
import geniusAtWork from "@/assets/speaking/topics/genius-at-work.jpg.asset.json";
import eightByEight from "@/assets/speaking/topics/eight-by-eight.jpg.asset.json";
import borderlessComm from "@/assets/speaking/topics/borderless-communication.jpg.asset.json";
import getClear from "@/assets/speaking/topics/get-clear-be-heard.jpg.asset.json";
import highFidelity from "@/assets/speaking/topics/high-fidelity-communication.jpg.asset.json";
import onAir from "@/assets/speaking/topics/on-air-confidence.jpg.asset.json";
import sixStyles from "@/assets/speaking/topics/six-communicator-styles.jpg.asset.json";
import findingJoy from "@/assets/speaking/topics/finding-joy-at-work.jpg.asset.json";
import passengerToPilot from "@/assets/speaking/topics/passenger-to-pilot.jpg.asset.json";
import moveShakeInnovate from "@/assets/speaking/topics/move-shake-innovate.jpg.asset.json";
import reignitingResilience from "@/assets/speaking/topics/reigniting-resilience.jpg.asset.json";
import fiveMinKeynote from "@/assets/speaking/topics/five-minute-keynote.jpg.asset.json";

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
  facilitators: string[];
  formats: ("Speaking" | "Workshop")[];
  image?: string;
};

const UNTAGGED = "More";

/** Manual topic overrides for rows whose DB topic should be remapped. */
const TOPIC_OVERRIDES: Record<string, string> = {
  "from passenger to pilot": "Mindset & Resilience",
  "cultivating change resilience": "Change & Innovation",
  "stoicism in the workplace": "Leadership & EQ",
};

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

function topicFor(key: string, rawTopic: string | null): string {
  return TOPIC_OVERRIDES[key] ?? displayTopic(rawTopic);
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

/** Aliases that collapse keynote/workshop variants with different wording into one card. */
const KEY_ALIASES: Record<string, string> = {
  "8:8 — capturing & keeping attention": "8:8",
  "ai, ei, oh!": "ai, ei, oh! guiding change and ai adoption",
  "get c.l.e.a.r. & be heard": "get c.l.e.a.r., be heard",
  "heroes assemble!": "heroes assemble",
  "speaking with style — 6 communicator styles":
    "speaking with style: the 6 communicator styles for influence & impact",
  "radical mindfulness": "radically mindful leadership",
  "the alice principles: down the rabbit hole of transformation": "the alice principles",
  "your 5-minute keynote": "5-minute keynote",
  "the 5-minute keynote": "5-minute keynote",
};

/** Preferred display name for canonical keys (overrides whichever row was seen first). */
const CANONICAL_NAME: Record<string, string> = {
  "8:8": "8:8 — Capturing & Keeping Attention",
  "ai, ei, oh! guiding change and ai adoption": "AI, EI, Oh! Guiding Change & AI Adoption",
  "get c.l.e.a.r., be heard": "Get C.L.E.A.R., Be Heard",
  "heroes assemble": "Heroes Assemble",
  "speaking with style: the 6 communicator styles for influence & impact":
    "Speaking with Style: The 6 Communicator Styles",
  "radically mindful leadership": "Radically Mindful Leadership",
  "the alice principles": "The Alice Principles",
  "5-minute keynote": "The 5-Minute Keynote",
};

function canonicalKey(name: string): string {
  const k = normalizeKey(name);
  return KEY_ALIASES[k] ?? k;
}

/** Topics we never want to show on this page. */
const EXCLUDE_KEYS = new Set<string>([
  "architect change (strategic design intensive)",
  "architect change",
]);

// Image map keyed by normalized base name
const IMAGE_MAP: Record<string, string> = {
  "ai, ei, oh! guiding change and ai adoption": aiEiOh.url,
  "ai, ei, oh!": aiEiOh.url,
  "stoicism in the workplace": stoicism.url,
  "lead at the speed of change": speedOfChange.url,
  "the alice principles": alice.url,
  "don't panic! navigating a changing world": dontPanic.url,
  "from dysfunction to dynamic teams": dysfunctionToDynamic.url,
  "shift happens. be ready.": shiftHappens.url,
  "heroes assemble": heroesAssemble,
  "heroes assemble!": heroesAssemble,
  "goldilocks leadership": goldilocks,
  // Existing workshop thumbs from /partner/amplify/workshops
  "architect change (strategic design intensive)": architectChangeThumb,
  "architect change": architectChangeThumb,
  "cultivating change resilience": resilienceThumb,
  "leadership operating model": leadershipOpThumb,
  "master your message": communicationThumb,
  "master your message (b2b)": communicationThumb,
  "radically mindful leadership": mindfulnessThumb,
  "radical mindfulness (b2b)": mindfulnessThumb,
  "radical mindfulness": mindfulnessThumb,
  // Newly generated topic covers
  "change for good: immunity to change": changeForGoodBranded.url,
  "change for good": changeForGoodBranded.url,
  "driving change: the 3 shifts": drivingChange3Shifts.url,
  "from conflict to connection": conflictToConnection.url,
  "genius at work": geniusAtWork.url,
  "8:8": eightByEight.url,
  "8:8 — capturing & keeping attention": eightByEight.url,
  "borderless communication": borderlessComm.url,
  "get c.l.e.a.r., be heard": getClear.url,
  "get c.l.e.a.r. & be heard": getClear.url,
  "high-fidelity communication": highFidelity.url,
  "on-air ready confidence": onAir.url,
  "speaking with style: the 6 communicator styles for influence & impact": sixStyles.url,
  "speaking with style — 6 communicator styles": sixStyles.url,
  "finding joy at work": findingJoy.url,
  "from passenger to pilot": passengerToPilot.url,
  "move, shake, innovate": moveShakeInnovate.url,
  "reigniting resilience": reignitingResilience.url,
  "5-minute keynote": fiveMinKeynote.url,
  "your 5-minute keynote": fiveMinKeynote.url,
  "the 5-minute keynote": fiveMinKeynote.url,
};

/**
 * Manual blurb overrides keyed by canonical key. Wins over DB merge.
 * Source of truth = the description used on the speaker / workshop page itself.
 * Keep in sync with src/pages/pps/speaking/{Amy,Rob,Sierra}Speaker.tsx and
 * src/pages/pps/partner/amplify/AmplifyWorkshops.tsx.
 */
const BLURB_OVERRIDES: Record<string, string> = {
  // ── Amy (Speaker page) ──
  "heroes assemble":
    "Unite your team through shared purpose, candor, and trust. Learn how to build stronger dynamics by fostering healthy conflict and innovative thinking.",
  "lead at the speed of change":
    "Change is inevitable, chaos isn't. Learn how to lead adaptively, align around what matters most, and keep moving forward when the ground shifts beneath you.",
  "shift happens. be ready.":
    "Using our P.A.T.H.™ method, discover a proven roadmap to navigate change that's on time, on budget, and on purpose.",
  "goldilocks leadership":
    "Is your leadership style \"too hot\" or \"too cold\"? Find the emotional intelligence sweet spot that turns you into a \"just-right\" transformational leader.",
  "stoicism in the workplace":
    "Discover how ancient Stoic principles can transform modern leadership. Learn to focus on what you can control, build resilience, and lead with clarity and purpose, even when everything around you is shifting.",
  "from dysfunction to dynamic teams":
    "Turn struggling teams into high-performing powerhouses. Learn how to break through silos, rebuild trust, and create the kind of collaboration that drives extraordinary results.",
  "ai, ei, oh! guiding change and ai adoption":
    "AI is here, but your people aren't ready. Discover how emotional intelligence is the missing link to successful AI adoption, and learn to lead your team through tech-driven change without leaving anyone behind.",
  "the alice principles":
    "What can Alice's adventures teach us about navigating organizational change? Explore how curiosity, adaptability, and questioning the status quo, inspired by Lewis Carroll's timeless tale, can transform the way your team approaches uncertainty and growth.",
  "don't panic! navigating a changing world":
    "Grab your towel and don't panic, because change, much like the galaxy, is vast, unpredictable, and mostly harmless. Using Douglas Adams' Hitchhiker's Guide as a lens, discover how humor, perspective, and a good guide can turn overwhelming transformation into an adventure worth taking.",

  // ── Rob (Speaker page) ──
  "high-fidelity communication":
    "The way you speak your thoughts is your brand. Learn the three pillars of clear communication: preparation, conciseness, and attentiveness.",
  "8:8":
    "Capturing & Keeping Attention in a Distracted World. In today's distracted world, attention spans are shrinking. Discover how to hook, hold, and inspire your audience fast, before they scroll away.",
  "the power of story":
    "Our brains are wired for stories. Learn how and when to use narrative to persuade, connect, and be unforgettable.",
  "get c.l.e.a.r., be heard":
    "Clarity. Language. Energy. Attention. Relevance. Master this framework to simplify your message and boost team engagement and retention.",
  "borderless communication":
    "Great leaders don't just talk, they communicate with intention. Learn how to create a culture of ownership and follow-through.",
  "on-air ready confidence":
    "Tame the nerves and take the mic. From boardrooms to breakouts, learn how to show up prepared, polished, and powerful, every time you speak.",
  "5-minute keynote":
    "Every leader needs a signature message they can deliver at a moment's notice. Learn how to craft and deliver a powerful 5-minute keynote that leaves a lasting impression.",
  "speaking with style: the 6 communicator styles for influence & impact":
    "There are six distinct communicator styles, and knowing yours changes everything. Discover your natural style and learn to flex across all six to connect with any audience.",

  // ── Sierra (Speaker page) ──
  "from passenger to pilot":
    "Tough times call for inner strength. Discover how to bounce back from challenges and prevent burnout using simple, science-backed resilience tools.",
  "move, shake, innovate":
    "Movement sparks creativity and connection. Explore how physical motion supports innovation, problem-solving, and present-moment awareness.",
  "finding joy at work":
    "Work doesn't have to feel like a grind. Learn how to infuse your day with purpose, presence, and a little play, even in high-pressure environments.",
  "reigniting resilience":
    "When the tank is empty, resilience is the fuel. Learn a framework to simplify your energy management and boost team engagement and retention.",
  "radically mindful leadership":
    "Practical mindfulness techniques for executives who don't have time for mindfulness. Lead with calm, clarity, and intentional presence.",

  // ── AMPLIFY Workshops (Leadership & Team Development) ──
  "create extraordinary teams":
    "Why most team-building fails, and what high-performing teams actually do differently. Move beyond trust falls to build teams that collaborate, challenge, and create together.",
  "master your message":
    "Beyond the announcement email: How to design communication that actually drives behavior change. Build the messaging infrastructure that makes change stick.",
  "master your message (b2b)":
    "Beyond the announcement email: How to design communication that actually drives behavior change. Build the messaging infrastructure that makes change stick.",
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

// Match blog/insights category color scheme so topics stay visually consistent.
const TOPIC_BADGE: Record<string, string> = {
  "Leadership & EQ": "bg-primary/10 text-primary",
  "Change & Innovation": "bg-strategic/10 text-strategic",
  "Communication": "bg-lime/10 text-lime",
  "Mindset & Resilience": "bg-raspberry/10 text-raspberry",
  "Teams": "bg-navy/10 text-navy",
  "Philosophy": "bg-purple/10 text-purple",
  [UNTAGGED]: "bg-navy/10 text-navy",
};

// Topics that should always appear as BOTH a keynote and a workshop, even if
// the database only has one row for them.
const ALWAYS_BOTH = new Set<string>([
  "driving change: the 3 shifts",
  "the architecture of organization",
  "the p.a.t.h. to lasting change",
]);


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

  // Merge keynote + workshop rows that share a base name (after alias resolution).
  const merged: MergedTopic[] = useMemo(() => {
    const map = new Map<string, MergedTopic>();
    for (const r of rows) {
      const rawKey = normalizeKey(r.name);
      if (EXCLUDE_KEYS.has(rawKey)) continue;
      const key = canonicalKey(r.name);
      const baseName = CANONICAL_NAME[key] ?? cleanName(r.name);
      const isKeynote = r.current_url.startsWith("/speaking/") || /\(Keynote\)/i.test(r.name);
      const isWorkshop = r.current_url === "/partner/amplify/workshops";
      const existing = map.get(key);
      if (existing) {
        if (isKeynote && !existing.formats.includes("Speaking")) existing.formats.push("Speaking");
        if (isWorkshop && !existing.formats.includes("Workshop")) existing.formats.push("Workshop");
        // Prefer workshop's topic tag (more detailed)
        if (isWorkshop && r.topic) existing.topic = topicFor(key, r.topic);
        // Prefer the longer / more complete blurb (workshop blurbs are usually richer)
        const incomingBlurb = (r.description || r.blurb || "") as string;
        if (incomingBlurb && incomingBlurb.length > (existing.blurb || "").length) {
          existing.blurb = incomingBlurb;
        }
        if (r.facilitator && !existing.facilitators.includes(r.facilitator)) existing.facilitators.push(r.facilitator);
        // Lock in canonical name if defined
        if (CANONICAL_NAME[key]) existing.baseName = CANONICAL_NAME[key];
        continue;
      }
      map.set(key, {
        key,
        baseName,
        blurb: (r.description || r.blurb || "") as string,
        topic: topicFor(key, r.topic),
        facilitators: r.facilitator ? [r.facilitator] : [],
        formats: [isKeynote ? "Speaking" : isWorkshop ? "Workshop" : "Speaking"],
        image: IMAGE_MAP[key] ?? IMAGE_MAP[rawKey],
      });
    }
    // Force "both formats" for designated topics
    for (const m of map.values()) {
      if (ALWAYS_BOTH.has(m.key)) {
        if (!m.formats.includes("Speaking")) m.formats.push("Speaking");
        if (!m.formats.includes("Workshop")) m.formats.push("Workshop");
      }
      // Apply manual blurb overrides
      if (BLURB_OVERRIDES[m.key]) m.blurb = BLURB_OVERRIDES[m.key];
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
    merged.forEach((m) => m.facilitators.forEach((f) => f && set.add(f)));
    return Array.from(set).sort();
  }, [merged]);

  const visible = useMemo(() => {
    return merged.filter((m) => {
      if (topicFilter !== "all" && m.topic !== topicFilter) return false;
      if (speakerFilter !== "all" && !m.facilitators.includes(speakerFilter)) return false;
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
                        <div className="mb-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${TOPIC_BADGE[m.topic] ?? TOPIC_BADGE[UNTAGGED]}`}>
                            {m.topic}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {m.formats.includes("Speaking") && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-lime-green">
                              <Mic className="w-3 h-3" /> Keynote
                            </span>
                          )}
                          {m.formats.includes("Workshop") && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-navy">
                              <Users className="w-3 h-3" /> Workshop
                            </span>
                          )}
                        </div>
                        <h4 className="font-poppins font-bold text-navy text-lg mb-1.5 leading-snug">{m.baseName}</h4>
                        {m.facilitators.length > 0 && (
                          <div className="text-caption text-foreground/60 mb-2 flex items-center gap-1.5">
                            <Flame className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            {m.facilitators.map((f) => FACILITATOR_FULL[f] ?? f).join(" & ")}
                          </div>
                        )}
                        {m.blurb && <p className="text-body-sm text-foreground/85 mb-4 flex-1">{m.blurb}</p>}
                        <Link
                          to={`/contact?interest=speaking&message=${encodeURIComponent(`I'm interested in "${m.baseName}" as a ${m.formats.length === 2 ? "keynote or workshop" : m.formats[0] === "Speaking" ? "keynote" : "workshop"}.`)}`}
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
        description="Every topic above adapts to your audience, your industry, and your current shIFt. Tell us where you are and we'll recommend the right format: keynote, workshop, or a combination that creates lasting change."
        overlayTone="teal"
        actions={[
          { label: "Contact Us", to: "/contact?interest=speaking&message=I'd like to talk about a speaking or workshop topic for our team.", variant: "primary" },
          { label: "Meet Our Speakers", to: "/speaking", variant: "secondary" },
        ]}
      />
    </div>
  );
}
