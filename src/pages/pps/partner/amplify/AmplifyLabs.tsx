import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { FAQSection, type FAQCategory } from "@/components/pps/FAQSection";
import { LaunchListCTA } from "@/components/pps/LaunchListCTA";
import { WORKSHOP_START_DATE, WORKSHOP_DATE_LABEL } from "./stracticalConfig";
import stracticalImg from "@/assets/labs/stractical-leadership.jpg";
import leadingChangeImg from "@/assets/labs/leading-change.jpg";
import dysfunctionImg from "@/assets/labs/dysfunction-to-dynamic.jpg";
import goldilocksImg from "@/assets/labs/goldilocks-leadership.jpg";
import missionImg from "@/assets/labs/mission-unstoppable.jpg";
import operationsImg from "@/assets/labs/operations-on-purpose.jpg";
import aiEiOhImg from "@/assets/labs/ai-ei-oh.jpg";
import conflictConnectionImg from "@/assets/labs/conflict-to-connection.jpg";
import stoicismImg from "@/assets/labs/stoicism-workplace.jpg";

const labFaqCategories: FAQCategory[] = [
  {
    name: "Leadership Labs",
    faqs: [
      {
        question: "What's the format for Leadership Labs?",
        answer: "Leadership Labs are 6-12 week cohort-style programs with bi-weekly or monthly sessions, peer accountability, and individual coaching touchpoints. Each lab focuses on a specific theme (Stractical Leadership, Leading Change, etc.) and is capped at 25 leaders from different organizations.",
      },
      {
        question: "How do I know if a Leadership Lab is right for me?",
        answer: "Leadership Labs are designed for individual leaders ready to deepen their transformation capacity through peer learning, whether you're developing yourself before bringing concepts to your team or investing in your own leadership independent of organizational initiatives.",
      },
      {
        question: "Can I join a Leadership Lab if I'm also bringing my team to a workshop?",
        answer: "Absolutely. Many leaders participate in labs for their own development while separately engaging their teams in workshops or sprints. Leadership Labs focus on individual leadership capacity; workshops/sprints focus on team alignment.",
      },
      {
        question: "Do I need the Blue Door before joining a Leadership Lab?",
        answer: "No. The Blue Door is not required for Leadership Labs. Labs are designed for individual leaders and don't require an organizational assessment.",
      },
      {
        question: "What if I'm not in an official leadership capacity?",
        answer: "We believe leadership isn't based on your title or role. It's based on your ambition, attitude, and desire. We welcome all - official \"capital L\" Leaders, as well as those aspiring to lead themselves and others with courage, curiosity, clarity, and the capacity to make shIFt happen.",
      },
    ],
  },
  {
    name: "Waitlist & Upcoming Cohorts",
    faqs: [
      {
        question: "When is the next cohort?",
        answer: "We run Leadership Labs a few times per year. Join the waitlist and you'll be the first to know when new dates are announced.",
      },
      {
        question: "What happens after I join the waitlist?",
        answer: "You'll receive a confirmation that you're on the list. When we schedule the next cohort, waitlist members get first access and priority enrollment before we open spots to the public.",
      },
      {
        question: "Is there any cost to join the waitlist?",
        answer: "No. Joining the waitlist is completely free and there's no obligation. It simply ensures you're notified first when enrollment opens.",
      },
      {
        question: "I missed the last cohort. Will the content be the same?",
        answer: "The core frameworks and exercises stay consistent, but each cohort benefits from fresh examples, updated case studies, and the unique dynamics of a new group of leaders. No two cohorts are exactly alike.",
      },
    ],
  },
  {
    name: "General",
    faqs: [
      {
        question: "How is AMPLIFY different from IGNITE?",
        answer: "IGNITE is self-paced individual development. AMPLIFY is team-based learning (workshops, sprints, cohorts). IGNITE builds your capacity. AMPLIFY builds team or organizational capacity.",
      },
    ],
  },
];

const cohorts = [
  {
    title: "Stractical Leadership",
    slug: "lab-stractical-leadership",
    tagline: "Balance vision with execution",
    description: "Learn to operate at both strategic and tactical levels simultaneously.",
    image: stracticalImg,
    link: "/stracticalleader",
    showUpcomingCohort: true,
  },
  {
    title: "Leading Change",
    slug: "lab-leading-change",
    tagline: "Architect transformation",
    description: "Develop Phase Zero™ foundations before implementation begins.",
    image: leadingChangeImg,
    comingSoon: true,
  },
  {
    title: "From Dysfunction to Dynamic",
    slug: "lab-dysfunction-to-dynamic",
    tagline: "Build high-performing cultures",
    description: "Design team operating models and sustainable capacity.",
    image: dysfunctionImg,
    comingSoon: true,
  },
  {
    title: "Goldilocks Leadership",
    slug: "lab-goldilocks-leadership",
    tagline: "Lead with Emotional Intelligence",
    description: "Is your leadership style 'too hot' or 'too cold'? Unlock the power of Emotional Intelligence to find the right balance and lead your teams 'just right.'",
    image: goldilocksImg,
    comingSoon: true,
  },
  {
    title: "Mission: Unstoppable",
    slug: "lab-mission-unstoppable",
    tagline: "Align goals and strategy",
    description: "Eliminate strategic goal and mission inconsistency. Create a crystal clear mission and strategies to provide direction for your teams to realize operational excellence and strategic success.",
    image: missionImg,
    comingSoon: true,
  },
  {
    title: "Operations on Purpose",
    slug: "lab-operations-on-purpose",
    tagline: "Cut bloat, maximize outcomes",
    description: "Inefficient processes and misaligned roles result in lost time, money, resources, and revenue. Tap into the hidden talents of your team to create flexible, future-ready people who can maximize your outcomes and meet whatever shIFt happens next.",
    image: operationsImg,
    comingSoon: true,
  },
  {
    title: "AI, EI, Oh!",
    slug: "lab-ai-ei-oh",
    tagline: "Lead AI adoption with human wisdom",
    description: "AI is changing how work gets done. The leaders who get this right pair AI fluency with the emotional intelligence and organizational judgment it takes to roll it out without breaking trust, culture, or people.",
    image: aiEiOhImg,
    comingSoon: true,
  },
  {
    title: "From Conflict to Connection",
    slug: "lab-conflict-to-connection",
    tagline: "Address friction at the root",
    description: "Peer cohort for leaders ready to stop managing the same recurring conflict and start redesigning the conditions underneath it. Relational skill paired with structural redesign.",
    image: conflictConnectionImg,
    comingSoon: true,
  },
  {
    title: "Stoicism in the Workplace",
    slug: "lab-stoicism-workplace",
    tagline: "Ancient wisdom, modern leadership",
    description: "A grounded, philosophy-led cohort for leaders who want a steadier inner game and a sharper sense of what they can actually control at work. Stoic practice translated into daily leadership.",
    image: stoicismImg,
    comingSoon: true,
  },
];


export default function AmplifyLabs() {
  const hasUpcomingCohort = WORKSHOP_START_DATE.getTime() > Date.now();

  return (
    <div>
      <PPSBreadcrumb
        segments={[
          { label: "Partner", href: "/partner" },
          { label: "AMPLIFY", href: "/partner/amplify" },
          { label: "Leadership Labs" },
        ]}
      />

      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-6">
          <Link
            to="/partner/amplify"
            className="inline-flex items-center gap-2 text-sm text-strategic hover:underline mb-8"
          >
            <ArrowRight className="w-4 h-4 rotate-180" /> Back to AMPLIFY Overview
          </Link>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy mb-4">
              Leadership Labs: Peer-Driven Acceleration
            </h1>
            <p className="text-body text-foreground max-w-3xl mx-auto">
              Explore Phase Zero concepts with other leaders navigating similar challenges. Each Leadership Lab is a 6–12 week cohort-style program with peer accountability, monthly group sessions, and individual coaching touchpoints.
            </p>
          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {cohorts.map((cohort, index) => {
              const showCohortBanner = cohort.showUpcomingCohort && hasUpcomingCohort;
              return (
                <div key={index} id={cohort.slug} className="bg-white rounded-xl overflow-hidden flex flex-col shadow-sm scroll-mt-24">
                  <div className="aspect-[16/9] bg-strategic/10 flex items-center justify-center">
                    <img src={cohort.image} alt={cohort.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h2 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-1 leading-tight">{cohort.title}</h2>
                    <p className="text-body -sm font-semibold text-strategic mb-2">{cohort.tagline}</p>
                    <p className="text-body -sm text-foreground mb-4 flex-1">{cohort.description}</p>
                    {showCohortBanner && (
                      <div className="mb-4 flex items-start gap-2 bg-strategic/10 border border-strategic/30 text-navy px-3 py-2 rounded-md">
                        <Calendar className="w-4 h-4 text-strategic mt-0.5 shrink-0" />
                        <span className="text-xs leading-snug">
                          Our next cohort starts on{" "}
                          <span className="font-semibold text-strategic">{WORKSHOP_DATE_LABEL}</span>
                        </span>
                      </div>
                    )}
                    <div className="mt-auto">
                      {cohort.comingSoon ? (
                        <LaunchListCTA
                          slug={cohort.slug}
                          courseName={`${cohort.title} Lab`}
                          layout="block"
                          liveLabel="Enroll"
                          textColorClass="text-strategic"
                          buttonClasses="border-strategic text-strategic hover:bg-strategic hover:text-white"
                        />
                      ) : (
                        <>
                          <Button asChild variant="outline" className="w-full border-strategic text-strategic hover:bg-strategic hover:text-white transition-colors">
                            <Link to={cohort.link!}>Learn More</Link>
                          </Button>
                          {/* Spacer to match launch list link height on sibling cards */}
                          <div className="text-sm mt-1 invisible" aria-hidden="true">&nbsp;</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

          </div>

          {/* Investment Info */}
          <div className="bg-strategic/10 p-8 rounded-xl border-t-4 border-strategic text-center">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-2">Leadership Lab Investment</h2>
            <div className="text-2xl font-bold text-strategic mb-2">$2,000 - $5,000 per participant</div>
            <p className="text-body -sm text-foreground mb-6">6-12 week cohort | Capped at 25 leaders per cohort</p>
            <p className="text-body -sm text-foreground/80 max-w-2xl mx-auto mb-6 italic">
              A full application process is coming soon. In the meantime, reach out with any questions and we'll point you toward the right cohort.
            </p>
            <Link to="/contact?scope=Yourself&interest=leadership-lab&message=I have questions about your Leadership Labs.">
              <Button className="bg-strategic border-2 border-strategic text-white hover:bg-transparent hover:text-strategic transition-colors">
                Inquire About Leadership Labs <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Team & Event Offerings */}
      <section className="py-16 bg-white border-t border-border/50">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">
            Want to bring one of these labs into your team, organization, or event?
          </h2>
          <p className="text-body text-foreground mb-8 max-w-2xl mx-auto">
            We offer several of these (and more!) as team and leadership workshops and keynotes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/workshops">
              <Button className="bg-strategic border-2 border-strategic text-white hover:bg-transparent hover:text-strategic transition-colors px-8">
                View Workshops <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/speaking">
              <Button variant="outline" className="border-strategic text-strategic hover:bg-strategic hover:text-white transition-colors px-8">
                View Speaking <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <FAQSection
        tierName="AMPLIFY"
        categories={labFaqCategories}
        subheadline="Common questions about AMPLIFY Leadership Labs"
      />
    </div>
  );
}
