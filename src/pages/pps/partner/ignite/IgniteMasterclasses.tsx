import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, ArrowLeft, X } from "lucide-react";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { FAQSection } from "@/components/pps/FAQSection";
import { LaunchListCTA } from "@/components/pps/LaunchListCTA";
import { igniteFaqCategories } from "./igniteFaqs";

import mcElementsOfTeam from "@/assets/masterclass/elements-of-team.jpg";
import mcSuperpowersOfTeam from "@/assets/masterclass/superpowers-of-a-team.jpg";
import mcLeadingChange from "@/assets/masterclass/leading-change.jpg";

import mcMasterYourMessage from "@/assets/masterclass/master-your-message.jpg";
import mcTalkingToStrangers from "@/assets/masterclass/talking-to-strangers.jpg";
import mcJournalingChallenge from "@/assets/masterclass/journaling-challenge.jpg";
import mcRadicalMindfulness from "@/assets/masterclass/radical-mindfulness.jpg";
import mcMeditationChallenge from "@/assets/masterclass/meditation-challenge.jpg";
import mcGratitudeChallenge from "@/assets/masterclass/gratitude-challenge.jpg";

type Category = "Leadership & Change" | "Communication & Connection" | "Mindfulness & Resilience";

interface MasterclassItem {
  title: string;
  leader: string | null;
  themeColor: string;
  image: string;
  description?: string;
  price?: number;
  category: Category;
  /** Live, hosted landing page (e.g. /talking-to-strangers). */
  href?: string;
  /** Launch-list slug in course_launch_status for items still in pre-launch. */
  launchSlug?: string;
}

const CATEGORIES: Category[] = [
  "Leadership & Change",
  "Communication & Connection",
  "Mindfulness & Resilience",
];

const categoryColors: Record<Category, { bg: string; text: string; border: string; activeBg: string }> = {
  "Leadership & Change": { bg: "bg-primary/10", text: "text-primary", border: "border-primary", activeBg: "bg-primary" },
  "Communication & Connection": { bg: "bg-navy/10", text: "text-navy", border: "border-navy", activeBg: "bg-navy" },
  "Mindfulness & Resilience": { bg: "bg-gold/10", text: "text-gold", border: "border-gold", activeBg: "bg-gold" },
};

const allMasterclasses: MasterclassItem[] = [
  { title: "The Elements of a Team", leader: "Amy Yackowski", themeColor: "primary", image: mcElementsOfTeam, category: "Leadership & Change", launchSlug: "mc-elements-of-team" },
  { title: "Superpowers of a Team Challenge", leader: "Amy Yackowski", themeColor: "primary", image: mcSuperpowersOfTeam, description: "A 5-day challenge to uncover your team's hidden superpowers and turn everyday differences into your biggest competitive edge.", price: 27, category: "Leadership & Change", href: "/team-superpowers", launchSlug: "mc-team-superpowers" },
  { title: "Leading Change Mini Course", leader: "Amy Yackowski", themeColor: "strategic", image: mcLeadingChange, category: "Leadership & Change", launchSlug: "mc-leading-change-mini" },

  { title: "Master Your Message Mini Course", leader: "Rob Hunter", image: mcMasterYourMessage, themeColor: "foreground", category: "Communication & Connection", launchSlug: "mc-master-your-message-mini" },
  { title: "Talking to Strangers", leader: "Rob Hunter", image: mcTalkingToStrangers, themeColor: "primary", description: "A 5-day challenge to help you start better conversations, with strangers, colleagues, and everyone in between.", price: 27, category: "Communication & Connection", href: "/talking-to-strangers", launchSlug: "mc-talking-to-strangers" },
  { title: "Master Your Message Journaling Challenge", leader: "Rob Hunter", image: mcJournalingChallenge, themeColor: "primary", description: "A 5-day journaling challenge to reconnect, rediscover, and reignite your true voice, five short prompts, on your time.", price: 15, category: "Communication & Connection", href: "/mym-journal-challenge", launchSlug: "mc-mym-journal-challenge" },
  { title: "Radical Mindfulness Mini Course", leader: "Sierra Ramm Cantrell", image: mcRadicalMindfulness, themeColor: "gold", category: "Mindfulness & Resilience", launchSlug: "mc-radical-mindfulness-mini" },
  { title: "Meditation Challenge", leader: "Sierra Ramm Cantrell", image: mcMeditationChallenge, themeColor: "gold", price: 15, category: "Mindfulness & Resilience", launchSlug: "mc-meditation-challenge" },
  { title: "Gratitude Challenge", leader: "Sierra Ramm Cantrell", image: mcGratitudeChallenge, themeColor: "gold", price: 15, category: "Mindfulness & Resilience", launchSlug: "mc-gratitude-challenge" },
];

export default function IgniteMasterclasses() {
  const [activeFilter, setActiveFilter] = useState<Category | null>(null);

  const filtered = activeFilter
    ? allMasterclasses.filter((m) => m.category === activeFilter)
    : allMasterclasses;

  return (
    <div>
      <PPSBreadcrumb
        segments={[
          { label: "Partner", href: "/partner" },
          { label: "IGNITE", href: "/partner/ignite" },
          { label: "Masterclasses" },
        ]}
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <Link
            to="/partner/ignite"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to IGNITE Overview
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy mb-4">
              Masterclasses & Mini-Workshops
            </h1>
            <p className="text-body text-foreground max-w-3xl mx-auto">
              Focused, expert-led sessions designed to deepen your transformation capacity. Each masterclass is a 30–90 minute experience you can attend live or watch on replay.
            </p>
            <p className="text-body -sm text-primary max-w-3xl mx-auto mt-3">
              New sessions drop throughout the year. Click "Join the Launch List" on any course below to be the first to know when it goes live.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
            {CATEGORIES.map((cat) => {
              const isActive = activeFilter === cat;
              const colors = categoryColors[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(isActive ? null : cat)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 transition-all ${
                    isActive
                      ? `${colors.activeBg} text-white ${colors.border}`
                      : `${colors.bg} ${colors.text} ${colors.border}`
                  }`}
                >
                  {cat}
                  {isActive && <X className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>

          {/* Masterclass Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((item) => {
              const colors = categoryColors[item.category];
              return (
                <div key={item.title} id={item.launchSlug} className={`bg-muted rounded-xl border-t-4 border-${item.themeColor} transition-all hover:shadow-lg flex flex-col overflow-hidden scroll-mt-24`}>
                  <div className="relative">
                    {item.href ? (
                      <Link to={item.href}>
                        <img src={item.image} alt={item.title} className="w-full h-40 object-cover hover:opacity-90 transition-opacity" />
                      </Link>
                    ) : (
                      <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
                    )}
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-navy/90 text-white shadow-sm">
                      <Video className="w-3 h-3" /> Replay
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} mb-2`}>
                        {item.category}
                      </span>
                      {item.href ? (
                        <Link to={item.href}>
                          <h3 className={`text-xl md:text-2xl font-poppins font-bold text-${item.themeColor} leading-tight hover:underline`}>
                            {item.title}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className={`text-xl md:text-2xl font-poppins font-bold text-${item.themeColor} leading-tight`}>
                          {item.title}
                        </h3>
                      )}
                      {item.leader && <p className="text-body -sm font-medium text-navy mt-1">Led by {item.leader}</p>}
                      {item.description && <p className="text-body text-foreground mt-2">{item.description}</p>}
                    </div>
                    <div className="mt-auto pt-4">
                      <p className="text-body -sm font-bold text-navy mb-2">${item.price ?? 36}</p>
                      {item.launchSlug ? (
                        <LaunchListCTA
                          slug={item.launchSlug}
                          courseName={item.title}
                          liveLabel="Enroll"
                          layout="block"
                          buttonClasses={`border-2 border-${item.themeColor} text-${item.themeColor} hover:bg-${item.themeColor} hover:text-white transition-colors`}
                          textColorClass={`text-${item.themeColor}`}
                        />
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className={`border-2 border-${item.themeColor} text-${item.themeColor} w-full opacity-60 cursor-not-allowed`}
                        >
                          Coming Soon
                        </Button>
                      )}
                      {item.href && (
                        <Link to={item.href} className={`block text-center text-xs mt-2 text-${item.themeColor} hover:underline`}>
                          Learn more →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <FAQSection
        tierName="IGNITE"
        categories={igniteFaqCategories.filter(c => c.name === "Masterclasses" || c.name === "General")}
      />
    </div>
  );
}
