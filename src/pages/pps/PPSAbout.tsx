import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import ParallaxCTA from "@/components/pps/ParallaxCTA";
import teamCtaPuzzles from "@/assets/team/team-cta-puzzles.jpg";
import letsChangeImg from "@/assets/about/lets-change.png";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import aboutHero from "@/assets/heroes/about-hero.jpg";
import paintedPorchImg from "@/assets/about/painted-porch-temple.jpg";

// Team photos
import amyPhoto from "@/assets/team/amy-yackowski.png";
import sierraPhoto from "@/assets/team/sierra-ramm-cantrell.jpg";
import robPhoto from "@/assets/team/rob-hunter.jpg";

const team = [
  {
    name: "Amy Yackowski",
    title: "Founder | Chief Evolution Officer | Organizational Shift Strategist",
    experience: "Over 20 Years Experience",
    description: "Amy has spent nearly two decades designing programs that connect people and processes to purpose. Her expertise spans organizational development, change management, and strategic transformation.",
    specialties: ["Organizational Design", "Change Management", "Strategic Planning", "Team Development"],
    color: "bg-primary/10",
    accent: "text-primary",
    photo: amyPhoto,
  },
  {
    name: "Sierra Ramm Cantrell",
    title: "Chief Joy Officer | M.B.A. - Mind-Body Architect | Mindfulness Sherpa",
    experience: "Over 15 Years Experience",
    description: "Sierra brings over a decade of experience teaching yoga and meditation, focused on authentic living and energy balance. She helps leaders develop the mindfulness practices essential for resilient leadership.",
    specialties: ["Mindfulness Training", "Yoga & Meditation", "Authentic Leadership", "Energy Management"],
    color: "bg-gold/10",
    accent: "text-gold",
    photo: sierraPhoto,
  },
  {
    name: "Rob Hunter",
    title: "Chief Storytelling Officer | M.C. - Master of Communication",
    experience: "Over 25 Years Experience",
    description: "As a 27-year award-winning radio broadcaster and #1 rated talk show host, Rob is a specialist in effective messaging and influence. He helps leaders craft compelling narratives that inspire action and drive change.",
    specialties: ["Strategic Messaging", "Public Speaking", "Influence & Persuasion", "Brand Voice"],
    color: "bg-muted",
    accent: "text-muted-foreground",
    photo: robPhoto,
  },
];


export default function PPSAbout() {
  useDocumentSeo({
    title: "About Painted Porch Strategies | Our Story & Team",
    description: "Meet the team behind Painted Porch Strategies. We partner with leaders to architect epic shIFt through Phase Zero work, before momentum outruns alignment.",
    ogImage: aboutHero,
  });
  return (
    <div>
      {/* Hero */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Ancient Practices for Modern Life
          </span>
        }
        headline="About Us"
        description={
          <>
            <p className="mb-4">
              Change doesn't fail because people stop caring. It fails when organizations lose clarity about who they're becoming.
            </p>
            <p className="mb-4">
              The most important decisions are rarely made in the middle of execution.
            </p>
            <p>
              We create the space for organizations to examine identity, direction, leadership, and culture before the next major shift begins.
            </p>
          </>
        }
        ctas={[
          { label: "Start Your Journey", href: "/start-here", isPrimary: true },
        ]}
        background={{ type: "image", src: aboutHero }}
        overlayClass="bg-navy/50"
        minHeightClass="min-h-[60vh]"
      />

      {/* What's a Painted Porch (moved up: ground the brand right after the hero) */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge-strategic mb-4 inline-block bg-gold">Our Philosophy</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                What's a "Painted Porch"?
              </h2>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                In ancient Greece, philosophers gathered at the Stoa Poikile, also known as the "Painted Porch," to discuss ideas that would shape Western thought. Those Stoic principles of reason, logic, purpose, and virtue still hold up today.
              </p>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                We bring these timeless principles to modern business, helping leaders and teams build the mental and organizational architecture needed to navigate change successfully.
              </p>
              <p className="text-lg font-semibold text-primary">
                Eudaimonia: prosperity and well-being through purposeful action.
              </p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <img
                src={paintedPorchImg}
                alt="A warm painted porch with colorful Adirondack chairs in teal, lime, orange, and gold"
                className="w-full h-full object-cover"
                loading="lazy"
                width={1024}
                height={768}
              />
            </div>
          </div>
        </div>
      </section>

      {/* On Becoming */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            On Becoming
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            We are not in the business of fixing you.
          </h2>
          <div className="space-y-4 text-lg text-foreground leading-relaxed text-left md:text-center">
            <p>
              Most of the leaders we work with are already capable, already
              experienced, and already carrying a lot. What they are looking
              for is not another framework. It is a place to think clearly
              about who their organization is trying to become.
            </p>
            <p>
              Becoming is slower than fixing. It asks for clarity about
              culture, leadership, and capacity. It asks for room to choose
              what to lead, instead of just reacting to what is happening.
            </p>
            <p>
              That is the work we partner on. If you want to see how we
              think about that work in practice,{" "}
              <Link
                to="/about/approach"
                className="font-semibold text-primary hover:underline"
              >
                read Our Approach
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Our Story - Opening */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="rounded-xl overflow-hidden shadow-lg md:order-1">
              <img
                src={letsChangeImg}
                alt="Let's Change neon sign on a classic building facade"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="md:order-2">
              <span className="badge-strategic mb-4 inline-block bg-gold">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                We Saw What Was Missing.
              </h2>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                After spending 20 years working alongside healthcare staffing firms to implement digital transformation, we recognized a missing, critical piece to long-term success: the <span className="font-semibold text-primary">confidence, capability, and change-readiness</span> of the people who can make or break any change initiative.
              </p>
              <p className="text-lg text-foreground leading-relaxed">
                The patterns of change struggle and failure (in work <em>and</em> in life) repeatedly boiled down to a few missing or underdeveloped foundational principles.
              </p>
            </div>
          </div>
        </div>
      </section>




      {/* Transformation Partners Intro */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block bg-primary/10 text-primary font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Your Transformation Partners
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            Meet the Painted Porch Team.
          </h2>
          <p className="text-lg text-foreground leading-relaxed italic">
            Many think of the Stoics as a bunch of boring old men, with stiff upper lips and no sense of fun. <span className="not-italic font-semibold">Not us.</span> We created Painted Porch Strategies because we believe <span className="font-semibold text-navy">work done right</span>, and <span className="font-semibold text-navy">for the right reasons, can be fun</span>. We'll show you how leaning on <span className="font-semibold text-navy">the principles of Stoicism</span> can not only <span className="font-semibold text-navy">be very rewarding</span>, but you'll discover simple ways to <span className="font-semibold text-navy">shift your mindset</span> from business and life as usual to one that is <span className="font-semibold text-navy">incredible</span> and <span className="font-semibold text-navy">expansive</span>. We'll show you just how <span className="font-semibold text-navy">freeing the concept of control can truly be</span>.
          </p>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => {
              const isAmy = member.name === "Amy Yackowski";

              return (
                <div key={index} className={isAmy ? "bg-strategic/10 p-8 rounded-xl" : `${member.color} p-8 rounded-xl`}>
                  <div className="w-24 h-24 rounded-full mb-4 overflow-hidden">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xl md:text-2xl font-poppins font-semibold mb-1 text-navy">
                    {member.name}
                  </h3>
                  <p className={`text-sm font-medium mb-1 ${isAmy ? "text-strategic" : member.accent}`}>
                    {member.title}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    {member.experience}
                  </p>
                  <p className="text-foreground text-sm leading-relaxed mb-4">
                    {member.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {member.specialties.map((specialty, i) => (
                      <span key={i} className="text-xs bg-white/60 px-2 py-1 rounded">
                        {specialty}
                      </span>
                    ))}
                  </div>
                  {member.name === "Amy Yackowski" && (
                    <Link
                      to="/amy"
                      className="text-sm font-semibold text-strategic hover:underline flex items-center gap-1"
                    >
                      About Amy <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  {member.name === "Rob Hunter" && (
                    <Link
                      to="/rob"
                      className="text-sm font-semibold text-muted-foreground hover:underline flex items-center gap-1"
                    >
                      About Rob <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  {member.name === "Sierra Ramm Cantrell" && (
                    <Link
                      to="/sierra"
                      className="text-sm font-semibold text-gold hover:underline flex items-center gap-1"
                    >
                      About Sierra <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Signals */}
      <ClientLogoMarquee />

      {/* Bridge to How we think / How we work */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            How We Think + How We Work
          </p>
          <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
            By leaning on over <span className="font-semibold text-navy">50 years of our team's combined experience</span> and real-world solutions, we developed (and continually evolve) training, coaching, and advisory programs to partner with you in taking <span className="font-semibold text-primary">definitive, purposeful action</span> to prepare yourself and others to lean in, embrace, adopt, and make change stick.
          </p>
          <p className="text-base text-foreground/80">
            See the framework that holds it together in{" "}
            <Link to="/about/approach#path" className="font-semibold text-primary hover:underline">
              our P.A.T.H. methodology
            </Link>
            , backed by{" "}
            <Link to="/about/approach#certifications" className="font-semibold text-primary hover:underline">
              our certifications
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <ParallaxCTA
        backgroundImage={teamCtaPuzzles}
        overlayTone="teal"
        eyebrow="Begin"
        headline="Ready to start your transformation journey?"
        description="Reach out to learn more about how we can partner with you to get started."
        actions={[
          { label: "Find Your P.A.T.H.way", to: "/start-here", variant: "primary" },
          {
            label: "Contact Us",
            to: "/contact?interest=general&message=I'd like to learn more about partnering with Painted Porch Strategies.",
            variant: "secondary",
          },
        ]}
      />
    </div>
  );
}
