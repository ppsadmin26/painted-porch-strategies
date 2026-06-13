import { Link } from "react-router-dom";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  Compass,
  Target,
  Layers,
  ArrowRight,
  Sparkles,
  Landmark,
  Clock,
  Video,
  FileText,
  BarChart3,
  Lightbulb,
  Monitor,
} from "lucide-react";
import { TierBadge, TIERS } from "@/components/pps/TierBadge";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import { FAQSection } from "@/components/pps/FAQSection";
import { ExploreBeforeCommitSection } from "@/components/pps/partner/ExploreBeforeCommitSection";
import { ParallaxCTA } from "@/components/pps/ParallaxCTA";
import { igniteFaqCategories } from "./ignite/igniteFaqs";

// Hero background - colorful flame for IGNITE spark theme
import igniteHeroFlame from "@/assets/ignite-hero-flame.jpg";
import igniteCtaBg from "@/assets/ignite-final-cta-bg.jpg";

// Archetype cards data
const archetypes = [
  {
    title: "The Curious Explorer",
    icon: Compass,
    traits: [
      "You're curious about Phase Zero concepts",
      "You want to test before full commitment",
      "You're asking \"Could this work for me?\"",
      "You prefer self-paced learning",
    ],
    color: "bg-gold/10",
    iconColor: "text-gold",
    iconBg: "bg-gold/20",
    textColor: "text-gold",
    borderColor: "border-gold/30",
  },
  {
    title: "The Individual Innovator",
    icon: Lightbulb,
    traits: [
      "You're investing in your own development",
      "Your organization doesn't sponsor training",
      "You want to build capacity independently",
      "You're ready to architect your own transformation",
    ],
    color: "bg-primary/10",
    iconColor: "text-primary",
    iconBg: "bg-primary/20",
    textColor: "text-primary",
    borderColor: "border-primary/30",
  },
  {
    title: "The Strategic Seeker",
    icon: Target,
    traits: [
      "You want to test with small group first",
      "Your organization is exploring options",
      "You need proof-of-concept before larger investment",
      "You're building the case for broader adoption",
    ],
    color: "bg-lime/10",
    iconColor: "text-lime",
    iconBg: "bg-lime/20",
    textColor: "text-lime",
    borderColor: "border-lime/30",
  },
  {
    title: "The Foundation Fortifier",
    icon: Layers,
    traits: [
      "You've tried tactical solutions that didn't stick",
      "You recognize you need strategic capacity first",
      "You want frameworks, not just tips",
      "You're ready for Phase Zero architecture",
    ],
    color: "bg-strategic/10",
    iconColor: "text-strategic",
    iconBg: "bg-strategic/20",
    textColor: "text-strategic",
    borderColor: "border-strategic/30",
  },
];

// Data arrays moved to subpages: IgniteCourses, IgniteAssessments, IgniteMasterclasses




// FAQ data imported from shared file
export default function IgnitePathAlt() {
  useDocumentSeo({
    title: "IGNITE P.A.T.H.way | Self-Led Phase Zero | Painted Porch",
    description: "Spark new shIFt. Build Phase Zero foundations at your own pace with IGNITE: assessments, courses, and masterclasses for change-curious leaders.",
    ogImage: igniteHeroFlame,
  });
  return (
    <div>
      {/* SECTION 1: HERO */}
      <TierHeroSection
        tier={TIERS.IGNITE}
        badgeLabel="IGNITE P.A.T.H.way"
        headline="Spark New ShIFt. Build Phase Zero™ Foundations at Your Own Pace."
        headlineHighlight="IF"
        description={<>IGNITE is self-led strategic development: courses, assessments, and Phase Zero frameworks you can work through at your own pace, on your own terms. Whether you're investing in yourself or exploring before an organizational commitment, this is where the spark for extraordinary sh<span className="font-bold text-gold">IF</span>t begins.</>}
        ctas={[
          {
            label: "Browse IGNITE",
            href: "#experience",
            isPrimary: true,
            isAnchor: true,
          },
          {
            label: "Discover Your P.A.T.H.way",
            href: "/start-here",
          },
        ]}
        background={{
          type: "video",
          src: igniteHeroFlame,
          poster: igniteHeroFlame,
          slotKey: "ignite-hero",
        }}
      />

      {/* SECTION 2: WHO IGNITE IS FOR */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Ready to IGNITE Your Next Sh<span className="text-gold font-bold">IF</span>t?
            </h2>
            <p className="text-lg text-foreground max-w-3xl mx-auto mb-2">
              IGNITE is the self-led entry point onto the Painted Porch, designed to spark clarity, build confidence, and prove transformative sh<span className="text-gold font-bold">IF</span>t is possible.
            </p>
            <p className="text-lg text-foreground max-w-3xl mx-auto">
              You might be ready for IGNITE if you're…
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {archetypes.map((archetype, index) => (
              <div 
                key={index} 
                className={`${archetype.color} p-6 rounded-xl border ${archetype.borderColor} transition-all hover:shadow-lg`}
              >
                <div className="flex flex-row lg:flex-col items-center lg:items-start gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-full ${archetype.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <archetype.icon className={`w-5 h-5 ${archetype.iconColor}`} />
                  </div>
                  <h3 className={`text-xl font-poppins font-bold leading-tight min-w-0 break-words ${archetype.textColor}`}>
                    {archetype.title}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {archetype.traits.map((trait, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className={`w-4 h-4 ${archetype.iconColor} flex-shrink-0 mt-0.5`} />
                      <span>{trait}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <p className="text-lg text-foreground mb-6">
              <strong>If any of these spark a "Sh<span className="text-gold font-bold">IF</span>t Yeah!", then stepping onto the IGNITE P.A.T.H.way is just right for you.</strong>
            </p>
            <p className="text-foreground mb-8 max-w-2xl mx-auto">
              Take our free P.A.T.H.finder quiz to discover which programs fit your specific development priorities.
            </p>
            <Button asChild className="bg-primary border-2 border-primary text-white hover:bg-transparent hover:text-primary transition-colors">
              <Link to="/start-here">Take Free P.A.T.H.finder Quiz</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 3: THE IGNITE EXPERIENCE */}
      <section id="experience" className="py-16 md:py-24 bg-muted scroll-mt-20">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Three Ways to Spark Sh<span className="text-gold font-bold">IF</span>t
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Column 1: Self-Led Courses */}
            <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm flex flex-col min-w-0">

              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Monitor className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-4">
                Self-Led Courses
              </h3>
              <p className="text-foreground mb-6 leading-relaxed">
                Transform how you lead, on your schedule. These courses teach you to architect change, communicate with clarity, build resilience, and develop teams where everyone shines.
              </p>
              <p className="text-sm font-semibold text-navy mb-2">What's Inside:</p>
              <ul className="space-y-1 flex-grow">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                  Video lessons & frameworks
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                  Workbooks & exercises
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                  Lifetime access
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                  Practical application tools
                </li>
              </ul>
              <div className="mt-6">
                <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white transition-colors text-sm px-2">
                  <Link to="/partner/ignite/courses">Explore Courses →</Link>
                </Button>

              </div>
            </div>

            {/* Column 2: Strategic Assessments */}
            <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm flex flex-col min-w-0">

              <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-4">
                Strategic Assessments
              </h3>
              <p className="text-foreground mb-6 leading-relaxed">
                Decode what drives your success. These assessments reveal your emotional intelligence, unique strengths, and the talents that make you extraordinary.
              </p>
              <p className="text-sm font-semibold text-navy mb-2">What's Inside:</p>
              <ul className="space-y-1 flex-grow">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                  Comprehensive report
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                  Personal debrief session*
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                  Action recommendations
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <CheckCircle className="w-4 h-4 text-lime flex-shrink-0" />
                  Development roadmap
                </li>
              </ul>
              <p className="text-xs text-muted-foreground mt-3 italic">*Optional, based on assessment</p>
              <div className="mt-6">
                <Button asChild variant="outline" className="w-full border-gold text-gold hover:bg-gold hover:text-white transition-colors text-sm px-2">
                  <Link to="/partner/ignite/assessments">Explore Assessments →</Link>
                </Button>

              </div>
            </div>

            {/* Column 3: Masterclasses */}
            <div className="bg-white p-6 lg:p-8 rounded-xl shadow-sm flex flex-col min-w-0">
              <div className="w-12 h-12 rounded-full bg-strategic/10 flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-strategic" />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-4">
                Masterclasses
              </h3>
              <p className="text-foreground mb-6 leading-relaxed">
                Strategic insights in under 90 minutes. These mini-workshops illuminate Phase Zero strategic architecture, transformation design, and conscious leadership, one small shift at a time.
              </p>
              <p className="text-sm font-semibold text-navy mb-3">What's Inside:</p>
              <ul className="space-y-2 mb-6 flex-grow">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Clock className="w-4 h-4 text-strategic flex-shrink-0" />
                  30-90 minute focused sessions
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Video className="w-4 h-4 text-strategic flex-shrink-0" />
                  Live + recorded access
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <FileText className="w-4 h-4 text-strategic flex-shrink-0" />
                  Specific Phase Zero concepts
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <Lightbulb className="w-4 h-4 text-strategic flex-shrink-0" />
                  Immediately actionable insights
                </li>
              </ul>
              <div className="mt-6">
                <Button asChild variant="outline" className="w-full border-strategic text-strategic hover:bg-strategic hover:text-white transition-colors text-sm px-2">
                  <Link to="/partner/ignite/masterclasses">Explore Masterclasses →</Link>
                </Button>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BREATHING SECTION: Quote Strip */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <blockquote className="text-2xl md:text-3xl font-poppins font-semibold text-navy italic leading-relaxed">
            "The secret of change is to focus all of your energy not on fighting the old, but on building the new."
          </blockquote>
          <p className="mt-4 text-muted-foreground text-sm">Socrates</p>
        </div>
      </section>

      {/* SECTION 6: WHAT HAPPENS AFTER IGNITE? */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              From Spark to Momentum
            </h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              IGNITE sparks your capacity to sh<span className="text-gold font-bold">IF</span>t. When you're ready for more depth or team engagement, here's where to go next.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Path 1: Nurture the Spark */}
            <div className="bg-gold/10 p-8 rounded-xl border-t-4 border-gold flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                  <TIERS.IGNITE.icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-gold">Nurture the Spark</h3>
              </div>
              <p className="text-sm font-medium text-foreground/80 mb-4">
                Stay in IGNITE, go deeper
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                  Complete additional courses
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                  Take strategic assessments
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                  Join upcoming masterclasses
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                  Build comprehensive strategic capacity
                </li>
              </ul>
              <p className="text-xs text-muted-foreground italic">
                Best for: Leaders who want continued self-paced development
              </p>
            </div>

            {/* Path 2: Amplify What You've Started */}
            <div className="bg-strategic/10 p-8 rounded-xl border-t-4 border-strategic">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-strategic/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-strategic" />
                </div>
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-strategic">Amplify What You've Started</h3>
              </div>
              <p className="text-sm font-medium text-foreground/80 mb-4">
                Join cohorts or bring your team
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-strategic" />
                  Leadership cohorts for peer learning
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-strategic" />
                  Custom workshops for your team
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-strategic" />
                  Strategic sprints for focused challenges
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-strategic" />
                  Deeper Phase Zero exploration
                </li>
              </ul>
              <p className="text-xs text-muted-foreground italic mb-4">
                Best for: Leaders ready for community engagement or team development
              </p>
              <Button asChild className="bg-transparent border-2 border-strategic text-strategic hover:bg-strategic hover:text-white w-full transition-colors text-sm px-2">
                  <Link to="/partner/amplify">Explore AMPLIFY <ArrowRight className="ml-2 w-4 h-4" /></Link>
                </Button>

            </div>

            {/* Path 3: Open the Blue Door */}
            <div className="bg-bluedoor/10 p-8 rounded-xl border-t-4 border-bluedoor">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-bluedoor/20 flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-bluedoor" />
                </div>
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-bluedoor">Open the Door to Strategic Shift</h3>
              </div>
              <p className="text-sm font-medium text-foreground/80 mb-4">
                Organizational Clarity Before Implementation Commitment
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-bluedoor" />
                  Comprehensive organizational assessment
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-bluedoor" />
                  Identify shifts you're built to lead
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-bluedoor" />
                  Painted Porch Pillars analysis
                </li>
                <li className="flex items-center gap-2 text-sm text-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-bluedoor" />
                  Determines AMPLIFY or EMBODY fit
                </li>
              </ul>
              <p className="text-xs text-muted-foreground italic mb-4">
                Best for: Executives exploring what shift to lead next
              </p>
              <Button asChild className="bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor w-full transition-colors">
                  <Link to="/blue-door">Open the Blue Door</Link>
                </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: TESTIMONIALS — removed; reintroduce when real quotes are available */}



      {/* SECTION 8: FAQ */}
      <FAQSection 
        tierName="IGNITE" 
        categories={igniteFaqCategories}
      />

      {/* SECTION 8.5: EXPLORE BEFORE YOU COMMIT */}
      <ExploreBeforeCommitSection />

      {/* SECTION 9: FINAL CTA */}
      <ParallaxCTA
        backgroundImage={igniteCtaBg}
        overlayTone="teal"
        headline={<>What Sh<span className="text-gold font-bold">IF</span>t Will You Ignite First?</>}
        description={<><strong>Your Phase Zero journey starts with one program, one assessment, or one decision to invest in your transformation capacity.</strong></>}
        footnote="Not sure where to start? Take our P.A.T.H.finder quiz to get personalized recommendations based on your development priorities."
        actions={[
          { label: "Take Free P.A.T.H.finder Quiz", to: "/start-here", variant: "primary" },
        ]}
      />
    </div>
  );
}
