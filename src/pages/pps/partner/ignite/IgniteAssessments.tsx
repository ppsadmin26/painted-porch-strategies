import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ExternalLink, ArrowLeft, Heart } from "lucide-react";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { FAQSection } from "@/components/pps/FAQSection";
import { LaunchListCTA } from "@/components/pps/LaunchListCTA";
import { igniteFaqCategories } from "./igniteFaqs";
import { TierBadge } from "@/components/pps/TierBadge";
import { TIERS } from "@/config/tiers";

import brainEqIcon from "@/assets/icons/brain-eq.svg";
import dualGearsIcon from "@/assets/icons/dual-gears.svg";
import dnaHelixIcon from "@/assets/icons/dna-helix.svg";
import shiftArchitectIcon from "@/assets/icons/shift-architect.svg";



const assessments = [
  {
    title: "EQ-i 2.0",
    subtitle: "Emotional Intelligence",
    tagline: "Emotional Intelligence for Leadership and Life",
    description: "Intelligence gets you in the room. Emotional intelligence determines what happens next. The EQ-i 2.0 reveals the invisible patterns that determine whether you connect or clash, inspire or irritate, lead or manage, the competencies behind every powerful connection, brilliant decision under pressure, and moment you've truly been heard.",
    investment: "Starting at $897 | Team pricing available",
    link: "/eq",
    isInternal: true,
    color: "bg-raspberry/10",
    borderColor: "border-raspberry",
    iconColor: "text-raspberry",
    pillColor: "bg-raspberry text-white",
    hoverBg: "hover:bg-raspberry",
    icon: "brain-eq",
  },
  {
    title: "Working Genius",
    subtitle: "Optimal Productivity",
    tagline: "Discover Where You Thrive in Team Work",
    description: "Some work gives you energy. Some drains it, no matter how competent or skilled you are. Working Genius identifies your natural gifts and frustrations across six essential types of work, so you understand when you're operating in genius versus outside it.",
    investment: "Starting at $25 | Team pricing available",
    link: "/partner/ignite/assessments/working-genius",
    isInternal: true,
    color: "bg-primary/10",
    borderColor: "border-primary",
    iconColor: "text-primary",
    pillColor: "bg-primary text-white",
    hoverBg: "hover:bg-primary",
    icon: "dual-gears",
  },
  {
    title: "Performance DNA",
    subtitle: "Your Success Blueprint",
    tagline: "Decode What Makes You Extraordinary",
    description: "You came without an instruction manual. Performance DNA creates it. Discover your unique success formula, what makes you extraordinary at work and in life, by decoding your natural strengths, decision patterns, work preferences, and conditions where you excel.",
    investment: "Starting at $69 | Team pricing available",
    link: "#",
    launchSlug: "performance-dna",
    color: "bg-lime/10",
    borderColor: "border-lime",
    iconColor: "text-lime",
    pillColor: "bg-lime text-white",
    hoverBg: "hover:bg-lime",
    icon: "dna",
  },
  {
    title: "Shift Architect",
    subtitle: "Change Leadership Capacity",
    tagline: "Reveal Your Capacity to Architect Change",
    description: "Most leaders learn change the hard way, mid-crisis, mid-implementation. Shift Architect surfaces how you currently think about, prepare for, and lead through change so you can build the strategic capacity required to architect transformation instead of react to it.",
    investment: "Coming Soon | Pricing TBD",
    link: "#",
    launchSlug: "shift-architect",
    color: "bg-strategic/10",
    borderColor: "border-strategic",
    iconColor: "text-strategic",
    pillColor: "bg-strategic text-white",
    hoverBg: "hover:bg-strategic",
    icon: "shift-architect",
  },
];


function AssessmentIcon({ icon }: { icon: string }) {
  const iconClass = "w-8 h-8";
  const invertFilter = { filter: "brightness(0) invert(1)" };
  switch (icon) {
    case "brain-eq":
      return <img src={brainEqIcon} alt="EQ-i 2.0" className={iconClass} style={invertFilter} />;
    case "dual-gears":
      return <img src={dualGearsIcon} alt="Working Genius" className={iconClass} style={invertFilter} />;
    case "dna":
      return <img src={dnaHelixIcon} alt="Performance DNA" className={iconClass} style={invertFilter} />;
    case "shift-architect":
      return <img src={shiftArchitectIcon} alt="Shift Architect" className={iconClass} style={invertFilter} />;
    default:
      return <Heart className={`${iconClass} text-white`} />;
  }
}

export default function IgniteAssessments() {
  return (
    <div>
      <PPSBreadcrumb
        segments={[
          { label: "Partner", href: "/partner" },
          { label: "IGNITE", href: "/partner/ignite" },
          { label: "Strategic Assessments" },
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
              Uncover Your Talents. Architect Your Future.
            </h1>
            <p className="text-body text-foreground max-w-3xl mx-auto">
              Decode what makes you shine, assessments that reveal your transformation architect capacity, emotional intelligence, unique talents, and success patterns. Discover the blueprint for your extraordinary performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {assessments.map((assessment, index) => {
              const anchorSlug =
                assessment.launchSlug ??
                assessment.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
              return (
              <div
                key={index}
                id={anchorSlug}
                className={`bg-white p-8 rounded-xl border-t-4 ${assessment.borderColor} transition-all hover:shadow-xl flex flex-col shadow-md scroll-mt-24`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${assessment.pillColor} mb-2`}>
                      {assessment.subtitle}
                    </span>
                    <h2 className={`text-3xl md:text-4xl font-poppins font-bold ${assessment.iconColor}`}>
                      {assessment.title}
                    </h2>
                  </div>
                  <div className={`w-14 h-14 rounded-full ${assessment.color} flex items-center justify-center`}>
                    <AssessmentIcon icon={assessment.icon} />
                  </div>
                </div>
                <p className="text-body -sm font-semibold text-foreground/80 mb-3">{assessment.tagline}</p>
                <p className="text-body -sm text-foreground mb-6 flex-grow">{assessment.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-bold text-navy">{assessment.investment}</span>
                  {assessment.link !== "#" ? (
                    assessment.isInternal ? (
                      <Link to={assessment.link}>
                        <Button variant="outline" size="sm" className={`border-2 ${assessment.borderColor} ${assessment.iconColor} ${assessment.hoverBg} hover:text-white transition-colors`}>
                          Explore <ExternalLink className="ml-2 w-3 h-3" />
                        </Button>
                      </Link>
                    ) : (
                      <a href={assessment.link} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className={`border-2 ${assessment.borderColor} ${assessment.iconColor} ${assessment.hoverBg} hover:text-white transition-colors`}>
                          Explore <ExternalLink className="ml-2 w-3 h-3" />
                        </Button>
                      </a>
                    )
                  ) : (
                    <LaunchListCTA
                      slug={assessment.launchSlug ?? ""}
                      courseName={assessment.title}
                      liveLabel="Explore"
                      buttonClasses={`border-2 ${assessment.borderColor} ${assessment.iconColor} ${assessment.hoverBg} hover:text-white transition-colors`}
                      textColorClass={assessment.iconColor}
                    />
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </section>

      <FAQSection
        tierName="IGNITE"
        categories={igniteFaqCategories.filter(c => c.name === "Assessments" || c.name === "General")}
      />
    </div>
  );
}
