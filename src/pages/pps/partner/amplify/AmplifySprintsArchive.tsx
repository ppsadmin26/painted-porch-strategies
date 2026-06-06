import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Info } from "lucide-react";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { FAQSection, type FAQCategory } from "@/components/pps/FAQSection";
import { BLUE_DOOR_PRICE_DISPLAY } from "@/config/blueDoor";

const sprintFaqCategories: FAQCategory[] = [
  {
    name: "General",
    faqs: [
      {
        question: "How is AMPLIFY different from IGNITE?",
        answer: "IGNITE is self-paced individual development. AMPLIFY is team-based learning (workshops, sprints, cohorts). IGNITE builds your capacity. AMPLIFY builds team or organizational capacity.",
      },
      {
        question: "What's included in the investment?",
        answer: "Pre-work, facilitation, frameworks/tools, post-workshop resources, and ongoing advisory sessions for questions and continued guidance.",
      },
    ],
  },
  {
    name: "Strategic Sprints",
    faqs: [
      {
        question: "Do we need the Blue Door before a Strategic Sprint?",
        answer: "Yes. The Blue Door is required for Strategic Sprints. It provides the strategic clarity needed to focus your sprint investment effectively.",
      },
      {
        question: "Can we do a workshop first, then decide on a Strategic Sprint?",
        answer: "Absolutely. Many teams start with a workshop to test fit, then progress to sprint if deeper partnership makes sense.",
      },
      {
        question: "What if our team is geographically distributed?",
        answer: "We facilitate virtual sprints effectively. In-person is ideal when possible, but not required.",
      },
      {
        question: "How long is a Strategic Sprint?",
        answer: "Strategic Sprints are 90-day partnerships with three phases: Diagnose (weeks 1-2), Decide (weeks 3-8), and Design (weeks 9-12).",
      },
      {
        question: "What happens after a Strategic Sprint ends?",
        answer: "You'll have a complete transformation architecture blueprint and launch readiness plan. Many teams move to an EMBODY partnership for ongoing advisory during implementation.",
      },
    ],
  },
];

const sprintPhases = [
  {
    phase: "1",
    title: "Diagnose",
    timeline: "Week 1-2",
    activities: [
      "Initial assessment of transformation challenge",
      "Stakeholder interviews & context gathering",
      "Painted Porch Pillars™ capacity assessment",
      "Phase Zero gap analysis",
    ],
    deliverable: "Strategic diagnostic report",
  },
  {
    phase: "2",
    title: "Decide",
    timeline: "Week 3-8",
    activities: [
      "3-6 strategic design sessions with leadership team",
      "Framework application & tool creation",
      "Ongoing access to Amy Yackowski and the Painted Porch team of advisors between sessions",
      "Phase Zero architecture co-design",
    ],
    deliverable: "Transformation architecture blueprint",
  },
  {
    phase: "3",
    title: "Design",
    timeline: "Week 9-12",
    activities: [
      "Stakeholder alignment sessions",
      "Communication strategy & rollout planning",
      "Final Phase Zero checkpoint",
      "Handoff to implementation (or EMBODY partnership if ongoing advisory needed)",
    ],
    deliverable: "Launch readiness plan",
  },
];

const sprintApplications = [
  { lead: "Major Technology Implementation", detail: "Architecture Phase Zero before selecting technology or planning implementation strategy" },
  { lead: "Organizational Restructure", detail: "Design structural changes consciously before announcing" },
  { lead: "Cultural Transformation", detail: "Architect cultural shifts before launching programs" },
  { lead: "Strategic Planning", detail: "Build Phase Zero foundations before 3-5 year plan" },
  { lead: "Leadership Transition", detail: "Prepare organization for new leadership before arrival" },
];

export default function AmplifySprints() {
  return (
    <div>
      <PPSBreadcrumb
        segments={[
          { label: "Partner", href: "/partner" },
          { label: "AMPLIFY", href: "/partner/amplify" },
          { label: "Strategic Sprints" },
        ]}
      />

      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <Link
            to="/partner/amplify"
            className="inline-flex items-center gap-2 text-sm text-strategic hover:underline mb-8"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to AMPLIFY Overview
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy mb-4">
              Strategic Sprints: Phase Zero Partnership for Your Next Shift
            </h1>
            <p className="text-lg text-foreground max-w-3xl mx-auto">
              Strategic Sprints provide focused 90-day partnerships to architect Phase Zero foundations for your next shift, building strategic clarity and organizational capacity before implementation begins.
            </p>
          </div>

          {/* Sprint Phases */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {sprintPhases.map((phase, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-border shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center">
                    <span className="text-lime font-bold">{phase.phase}</span>
                  </div>
                  <div>
                    <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy">{phase.title}</h2>
                    <p className="text-sm text-primary">{phase.timeline}</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {phase.activities.map((activity, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-lime flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{activity}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t pt-4">
                  <p className="text-xs text-navy font-semibold">Deliverable:</p>
                  <p className="text-sm text-foreground">{phase.deliverable}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Common Applications */}
          <div className="bg-white p-8 rounded-xl mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-6 text-center">
              Common Strategic Sprint Applications
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {sprintApplications.map((application, index) => (
                <div key={index} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-lime">
                    {index + 1}
                  </span>
                  <span className="text-foreground"><span className="font-bold text-navy">{application.lead}:</span> {application.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sprint Investment */}
          <div className="bg-lime/10 p-8 rounded-xl border-t-4 border-lime mb-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-2">Strategic Sprint Investment</h2>
                <p className="text-3xl font-bold text-lime mb-4">Starting at $36,000</p>
                <p className="text-sm text-foreground">(based on scope and timeline; Prerequisite: <span className="font-bold text-bluedoor">Blue Door</span>)</p>
              </div>
              <div className="bg-white p-6 rounded-lg">
                <p className="text-sm font-semibold text-navy mb-3">Includes:</p>
                <ul className="space-y-2">
                  <li className="text-sm text-foreground">• Initial diagnostic</li>
                  <li className="text-sm text-foreground">• 3-6 strategic design sessions</li>
                  <li className="text-sm text-foreground">• Framework tools & templates</li>
                  <li className="text-sm text-foreground">• Ongoing advisory</li>
                  <li className="text-sm text-foreground">• Launch preparation partnership</li>
                </ul>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link to="/contact?scope=organization&interest=organizational-advisory&message=I'm interested in exploring a Strategic Sprint for our organization.">
                <Button variant="outline" className="border-lime text-lime hover:bg-lime hover:text-white transition-colors">
                  Contact Us to Explore Strategic Sprint
                </Button>
              </Link>
            </div>
          </div>

          {/* Blue Door Callout */}
          <div className="bg-bluedoor/5 border border-bluedoor/20 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-5 h-5 text-bluedoor" />
                <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy">About The <span className="text-bluedoor">Blue Door</span></h3>
              </div>
              <p className="text-sm text-foreground mb-2">
                The <span className="font-bold text-bluedoor">Blue Door</span> is our strategic appraisal (less than 30 minutes) that reveals where your organization stands on the path to transformation, and what's blocking progress.
              </p>
              <p className="text-sm text-foreground/70 italic mb-3">
                Required for Strategic Sprints and workshops. Not needed for Leadership Labs.
              </p>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold text-navy">{BLUE_DOOR_PRICE_DISPLAY}</span>
                <span className="text-foreground/70">|</span>
                <span className="text-foreground/70">Less than 30 minutes</span>
              </div>
            </div>
            <Link to="/blue-door">
              <Button variant="outline" className="bg-transparent border-2 border-bluedoor text-bluedoor hover:bg-bluedoor hover:text-white whitespace-nowrap transition-colors">
                Learn More <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <FAQSection
        tierName="AMPLIFY"
        categories={sprintFaqCategories}
        subheadline="Common questions about AMPLIFY Strategic Sprints"
      />
    </div>
  );
}
