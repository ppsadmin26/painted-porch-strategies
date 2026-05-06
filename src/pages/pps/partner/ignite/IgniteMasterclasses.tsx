import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, ArrowLeft, X } from "lucide-react";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { FAQSection } from "@/components/pps/FAQSection";
import { igniteFaqCategories } from "./igniteFaqs";

import mcElementsOfTeam from "@/assets/masterclass/elements-of-team.jpg";
import mcSuperpowersOfTeam from "@/assets/masterclass/superpowers-of-a-team.jpg";
import mcLeadingChange from "@/assets/masterclass/leading-change.jpg";
import mcKickTheHabit from "@/assets/masterclass/kick-the-habit.jpg";
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
  href?: string;
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
  { title: "The Elements of a Team", leader: "Amy", themeColor: "primary", image: mcElementsOfTeam, category: "Leadership & Change" },
  { title: "Superpowers of a Team Challenge", leader: "Amy", themeColor: "primary", image: mcSuperpowersOfTeam, description: "A 5-day challenge to uncover your team's hidden superpowers and turn everyday differences into your biggest competitive edge.", price: 27, category: "Leadership & Change", href: "/team-superpowers" },
  { title: "Leading Change Mini Course", leader: "Amy", themeColor: "strategic", image: mcLeadingChange, category: "Leadership & Change" },
  { title: "Kick the Habit", leader: null, themeColor: "primary", image: mcKickTheHabit, description: "Learn to spot negative thinking patterns, challenge habitual ways of doing, and develop a Change-ready mindset.", price: 10, category: "Leadership & Change" },
  { title: "Master Your Message Mini Course", leader: "Rob", image: mcMasterYourMessage, themeColor: "foreground", category: "Communication & Connection" },
  { title: "Talking to Strangers", leader: "Rob", image: mcTalkingToStrangers, themeColor: "primary", description: "A 5-day challenge to help you start better conversations — with strangers, colleagues, and everyone in between.", price: 27, category: "Communication & Connection", href: "/talking-to-strangers" },
  { title: "Master Your Message Journaling Challenge", leader: "Rob", image: mcJournalingChallenge, themeColor: "primary", description: "A 5-day journaling challenge to reconnect, rediscover, and reignite your true voice — five short prompts, on your time.", price: 15, category: "Communication & Connection", href: "/mym-journal-challenge" },
  { title: "Radical Mindfulness Mini Course", leader: "Sierra", image: mcRadicalMindfulness, themeColor: "gold", category: "Mindfulness & Resilience" },
  { title: "Meditation Challenge", leader: "Sierra", image: mcMeditationChallenge, themeColor: "gold", price: 15, category: "Mindfulness & Resilience" },
  { title: "Gratitude Challenge", leader: "Sierra", image: mcGratitudeChallenge, themeColor: "gold", price: 15, category: "Mindfulness & Resilience" },
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
        <div className="container max-w-6xl mx-auto px-6">
          <Link
            to="/partner/ignite"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to IGNITE Overview
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Masterclasses & Mini-Workshops
            </h1>
            <p className="text-lg text-foreground max-w-3xl mx-auto">
              Focused, expert-led sessions designed to deepen your transformation capacity. Each masterclass is a 30–90 minute experience you can attend live or watch on replay.
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
                <div key={item.title} className={`bg-muted rounded-xl border-t-4 border-${item.themeColor} transition-all hover:shadow-lg flex flex-col overflow-hidden`}>
                  <img src={item.image} alt={item.title} className="w-full h-40 object-cover" style={item.title === "Kick the Habit" ? { objectPosition: "center 60%" } : undefined} />
                  <div className="p-5 flex flex-col flex-1">
                    <div className="mb-3">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} mb-2`}>
                        {item.category}
                      </span>
                      <h3 className={`font-poppins font-bold text-base text-${item.themeColor} leading-tight`}>
                        {item.title}
                      </h3>
                      {item.leader && <p className="text-sm font-medium text-navy mt-1">Led by {item.leader}</p>}
                      {item.description && <p className="text-xs text-foreground mt-2">{item.description}</p>}
                    </div>
                    <div className="mt-auto pt-4">
                      <p className="text-sm font-bold text-navy mb-2">${item.price ?? 36}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled
                        className={`border-2 border-${item.themeColor} text-${item.themeColor} hover:bg-${item.themeColor} hover:text-white w-full opacity-60 cursor-not-allowed`}
                      >
                        Coming Soon
                      </Button>
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
