import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Info, Download, Compass, PencilRuler, Map } from "lucide-react";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { FAQSection, type FAQCategory } from "@/components/pps/FAQSection";
import { ParallaxCTA } from "@/components/pps/ParallaxCTA";
import { BLUE_DOOR_PRICE_DISPLAY } from "@/config/blueDoor";
import amplifyFinalCtaBg from "@/assets/amplify-final-cta-bg.jpg";

/**
 * Strategic Sprints — focused 90-day Phase Zero partnership.
 *
 * Refactored per the wireframe (.lovable/wireframes/embody-and-sprints-revised.md):
 *  - Timeline labels: Diagnose → Design → Roadmap (no "Deliver"; nothing is
 *    actually implemented in 90 days; the output is a plan + roadmap).
 *  - Kept "Common Applications" (helps tactical self-qualification).
 *  - NEW contrast strip: "Not a traditional implementation engagement".
 *  - Merged Blue Door prerequisite into the Investment row.
 *  - Sprints Playbook PDF = "Coming soon".
 */

const sprintFaqCategories: FAQCategory[] = [
  {
    name: "General",
    faqs: [
      {
        question: "How is AMPLIFY different from IGNITE?",
        answer:
          "IGNITE is self-paced individual development. AMPLIFY is team-based learning (workshops, sprints, cohorts). IGNITE builds your capacity. AMPLIFY builds team or organizational capacity.",
      },
      {
        question: "What's included in the investment?",
        answer:
          "Pre-work, facilitation, frameworks and tools, post-workshop resources, and ongoing advisory sessions for questions and continued guidance.",
      },
    ],
  },
  {
    name: "Strategic Sprints",
    faqs: [
      {
        question: "Do we need the Blue Door before a Strategic Sprint?",
        answer:
          "Yes. The Blue Door is required for Strategic Sprints. It gives us (and you) the strategic clarity needed to focus your sprint investment.",
      },
      {
        question: "How long is a Strategic Sprint?",
        answer:
          "90 days, in three focused stages: Diagnose (weeks 1–2), Design (weeks 3–8), and Roadmap (weeks 9–12).",
      },
      {
        question: "Will we have implemented anything by the end?",
        answer:
          "You will have implemented a whole new approach to how you prepare for and design future strategic initiatives and direction. A Sprint is the Phase Zero work that comes before broad implementation. You'll leave with an architecture blueprint and a clear roadmap of what to build, in what order, and why. Many teams continue with an EMBODY partnership through implementation.",
      },
      {
        question: "What if our team is geographically distributed?",
        answer:
          "We run virtual sprints effectively. In-person is ideal when possible, but not required.",
      },
      {
        question: "What happens after a Strategic Sprint ends?",
        answer:
          "You'll have an architecture blueprint and a launch-ready roadmap for what you'll implement. Many teams move into an EMBODY partnership for ongoing advisory through implementation.",
      },
    ],
  },
];

const sprintPhases = [
  {
    icon: Compass,
    weeks: "Weeks 1–2",
    title: "Diagnose",
    activities: [
      "Stakeholder interviews and context gathering",
      "Painted Porch Pillars capacity assessment",
      "Phase Zero gap analysis",
    ],
    deliverable: "A clear-eyed organizational appraisal of where you really stand",
  },
  {
    icon: PencilRuler,
    weeks: "Weeks 3–8",
    title: "Design",
    activities: [
      "3–6 strategic design sessions with your leadership team",
      "Framework application and tool creation",
      "Async advisory access between sessions",
    ],
    deliverable: "Your transformation architecture blueprint",
  },
  {
    icon: Map,
    weeks: "Weeks 9–12",
    title: "Roadmap",
    activities: [
      "Stakeholder alignment sessions",
      "Rollout sequencing and communication strategy",
      "Handoff to your team, or transition into an EMBODY partnership",
    ],
    deliverable: "A launch-ready roadmap for what you'll implement next",
  },
];

const sprintApplications = [
  { lead: "Major Technology Implementation", detail: "Architect Phase Zero before you pick the tech or plan the rollout." },
  { lead: "Organizational Restructure", detail: "Design the structural changes before you announce them." },
  { lead: "Cultural Transformation", detail: "Architect the cultural shift before you launch any programs." },
  { lead: "Strategic Planning", detail: "Build the Phase Zero foundation before your 3–5 year plan." },
  { lead: "Leadership Transition", detail: "Prepare the organization for new leadership before they arrive." },
];

const differenceRows = [
  {
    traditional: "Starts at: \"What tool or vendor should we pick?\"",
    sprint: "Starts at: \"What shift, and are we built to lead it?\"",
  },
  {
    traditional: "Sells you their playbook to execute.",
    sprint: "Installs a new way for your team to prepare and design every shift that follows.",
  },
  {
    traditional: "Optimizes for go-live.",
    sprint: "Optimizes for the decade after go-live.",
  },
  {
    traditional: "You hand off and hope.",
    sprint: "Your team walks out owning the architecture and the approach behind it.",
  },
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

      {/* HERO */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl mx-auto px-6 text-center">
          <p className="text-sm font-poppins font-semibold tracking-widest text-primary uppercase mb-4">
            AMPLIFY · Strategic Sprints
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy mb-6">
            A 90-day Phase Zero<span className="align-super text-xs ml-0.5">™</span> partnership for your next sh<span className="text-raspberry">IF</span>t.
          </h1>
          <p className="text-lg md:text-xl text-foreground max-w-3xl mx-auto mb-8">
            Focused. Time-boxed. Built to architect the foundation <em>before</em> implementation begins, so what you build next actually lasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link to="/contact?scope=organization&interest=organizational-advisory&message=I'm interested in exploring a Strategic Sprint for our organization.">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                Contact Us <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              disabled
              aria-disabled="true"
              className="border-navy/30 text-navy/60 cursor-not-allowed"
              title="The Sprints Playbook is being drafted."
            >
              <Download className="mr-2 w-4 h-4" /> Sprints Playbook (Coming Soon)
            </Button>
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className="py-16 md:py-24 bg-muted/40">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">
              What to expect, week by week
            </h2>
            <p className="text-base text-foreground">
              A Strategic Sprint follows our <Link to="/approach" className="font-semibold text-primary hover:underline">P.A.T.H.</Link> framework, but compresses the architectural work into a focused 90-day window. Here's what your team can expect at each stage.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10">
            {sprintPhases.map((phase) => {
              const Icon = phase.icon;
              return (
                <div
                  key={phase.title}
                  className="bg-white p-6 rounded-xl border border-border shadow-md flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-lime/20 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-lime" aria-hidden="true" />
                    </div>
                    <div>
                      <p className="text-xs font-poppins font-semibold tracking-wider text-primary uppercase">
                        {phase.weeks}
                      </p>
                      <h3 className="text-2xl font-poppins font-bold text-navy">{phase.title}</h3>
                    </div>
                  </div>
                  <ul className="space-y-2 mb-4 flex-1">
                    {phase.activities.map((a) => (
                      <li key={a} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-lime flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{a}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t pt-4">
                    <p className="text-xs font-poppins font-semibold text-navy uppercase tracking-wider mb-1">
                      What you walk out with
                    </p>
                    <p className="text-sm text-foreground">{phase.deliverable}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center text-sm text-foreground/80 italic max-w-2xl mx-auto">
            You will have implemented a new approach to how you prepare for and design strategic initiatives. You'll also have a clear, owned plan for what you'll build next, in what order, and why.
          </p>
        </div>
      </section>

      {/* COMMON APPLICATIONS */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">
              Where Strategic Sprints typically fit
            </h2>
            <p className="text-base text-foreground max-w-2xl mx-auto">
              Sprints usually architect the front-end of one of these shifts. If yours isn't listed, the Blue Door will tell us whether a Sprint is the right fit.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {sprintApplications.map((application, index) => (
              <div key={application.lead} className="flex items-start gap-3 bg-muted/40 p-4 rounded-lg">
                <span className="w-7 h-7 rounded-full bg-lime/20 flex items-center justify-center flex-shrink-0 text-sm font-bold text-lime">
                  {index + 1}
                </span>
                <span className="text-foreground">
                  <span className="font-bold text-navy">{application.lead}:</span> {application.detail}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DIFFERENCE STRIP */}
      <section className="py-16 md:py-24 bg-navy text-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-poppins font-semibold tracking-widest text-gold uppercase mb-3">
              Different by design
            </p>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4">
              This isn't a traditional implementation engagement.
            </h2>
            <p className="text-base text-white/85 max-w-2xl mx-auto">
              Most consultancies sell you their playbook and optimize for go-live. A Strategic Sprint is an advisory partnership that builds <em>your</em> architecture, so what comes after go-live actually holds.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-white/15 rounded-xl overflow-hidden border border-white/15">
            <div className="bg-navy p-6">
              <p className="text-xs font-poppins font-semibold tracking-widest text-white/70 uppercase mb-4">
                Traditional implementation consulting
              </p>
              <ul className="space-y-3">
                {differenceRows.map((row) => (
                  <li key={row.traditional} className="text-sm text-white/85">
                    {row.traditional}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-primary/95 p-6">
              <p className="text-xs font-poppins font-semibold tracking-widest text-white uppercase mb-4">
                A Strategic Sprint with Painted Porch
              </p>
              <ul className="space-y-3">
                {differenceRows.map((row) => (
                  <li key={row.sprint} className="text-sm text-white font-medium">
                    {row.sprint}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* INVESTMENT + BLUE DOOR */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="bg-lime/10 p-8 md:p-10 rounded-xl border-t-4 border-lime">
            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-3">
                  Investment
                </h2>
                <p className="text-3xl font-poppins font-bold text-lime mb-4">
                  Starting at $36,000
                </p>
                <p className="text-sm text-foreground mb-6">
                  Based on scope and timeline. Includes:
                </p>
                <ul className="space-y-2">
                  <li className="text-sm text-foreground">• Initial organizational appraisal and strategic brief</li>
                  <li className="text-sm text-foreground">• 3–6 strategic design sessions</li>
                  <li className="text-sm text-foreground">• Framework tools and templates</li>
                  <li className="text-sm text-foreground">• Launch-ready roadmap</li>
                </ul>
              </div>
              <div className="bg-bluedoor/5 border border-bluedoor/20 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Info className="w-5 h-5 text-bluedoor" />
                  <h3 className="text-xl font-poppins font-semibold text-navy">
                    Prerequisite: The <span className="text-bluedoor">Blue Door</span>
                  </h3>
                </div>
                <p className="text-sm text-foreground mb-4">
                  Our short organizational appraisal (under 30 minutes) that reveals where you really stand on the path to transformation, and what's blocking progress. Required before any Strategic Sprint.
                </p>
                <div className="flex items-center gap-3 text-sm mb-4">
                  <span className="font-semibold text-navy">{BLUE_DOOR_PRICE_DISPLAY}</span>
                  <span className="text-foreground/70">·</span>
                  <span className="text-foreground/70">Under 30 minutes</span>
                </div>
                <Link to="/blue-door">
                  <Button
                    variant="outline"
                    className="bg-transparent border-2 border-bluedoor text-bluedoor hover:bg-bluedoor hover:text-white transition-colors w-full"
                  >
                    Start with the Blue Door <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link to="/contact?scope=organization&interest=organizational-advisory&message=I'm interested in exploring a Strategic Sprint for our organization.">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                  Contact Us to Explore a Sprint <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FAQSection
        tierName="AMPLIFY"
        categories={sprintFaqCategories}
        subheadline="Common questions about AMPLIFY Strategic Sprints"
      />

      <ParallaxCTA
        backgroundImage={amplifyFinalCtaBg}
        overlayTone="teal"
        eyebrow="Architect first"
        headline={
          <>
            Architect the sh<span className="text-gold">IF</span>t before you implement it.
          </>
        }
        description="A 90-day Strategic Sprint gives you the architecture, the roadmap, and the clarity to lead what comes next."
        actions={[
          { label: "Contact Us", to: "/contact?scope=organization&interest=organizational-advisory" },
          { label: "Start with the Blue Door", to: "/blue-door", variant: "bluedoor" },
        ]}
      />
    </div>
  );
}
