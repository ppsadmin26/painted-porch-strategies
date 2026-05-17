import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import teamCtaPuzzles from "@/assets/team/team-cta-puzzles.jpg";
import letsChangeImg from "@/assets/about/lets-change.png";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import aboutHero from "@/assets/heroes/about-hero.jpg";
import paintedPorchImg from "@/assets/about/painted-porch-temple.jpg";

// Team photos
import amyPhoto from "@/assets/team/amy-yackowski.png";
import sierraPhoto from "@/assets/team/sierra-ramm-cantrell.jpg";
import robPhoto from "@/assets/team/rob-hunter.jpg";

// Certification badges
import workingGeniusBadge from "@/assets/certifications/working-genius.png";
import prosciChangeBadge from "@/assets/certifications/prosci-change-practitioner.png";
import scrumPsdBadge from "@/assets/certifications/scrum-psd.png";
import csiBadge from "@/assets/certifications/csi.png";
import changeNavigatorBadge from "@/assets/certifications/change-navigator.png";
import leanChangeAgentBadge from "@/assets/certifications/lean-change-agent.png";
import leanChangeAiBadge from "@/assets/certifications/lean-change-ai.png";
import mawFacilitatorBadge from "@/assets/certifications/maw-facilitator.png";
import discFacilitatorBadge from "@/assets/certifications/disc-facilitator.png";
import eq360Badge from "@/assets/certifications/eq360.png";
import emotionallyEffectiveBadge from "@/assets/certifications/emotionally-effective-leader.png";
import wpcRecommendedBadge from "@/assets/certifications/wpc-recommended.png";
import acmpMemberBadge from "@/assets/certifications/acmp-member.png";
import asaMemberBadge from "@/assets/certifications/asa-member.png";

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

const certifications = [
  { name: "Working Genius Certified", badge: workingGeniusBadge },
  { name: "Prosci Change Practitioner", badge: prosciChangeBadge },
  { name: "Scrum.org PSD", badge: scrumPsdBadge },
  { name: "CSI Certified", badge: csiBadge },
  { name: "Change Navigator", badge: changeNavigatorBadge },
  { name: "Lean Change Agent", badge: leanChangeAgentBadge },
  { name: "Lean Change AI", badge: leanChangeAiBadge },
  { name: "MAW Facilitator", badge: mawFacilitatorBadge },
  { name: "DiSC Facilitator", badge: discFacilitatorBadge },
  { name: "EQ-360 Certified", badge: eq360Badge },
  { name: "Emotionally Effective Leader", badge: emotionallyEffectiveBadge },
  { name: "WPC Recommended", badge: wpcRecommendedBadge },
  { name: "ACMP Member", badge: acmpMemberBadge },
  { name: "ASA Member", badge: asaMemberBadge },
];

export default function PPSAbout() {
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
              We help leaders and organizations build three things that make
              change actually hold:{" "}
              <span className="font-semibold text-gold">emotional resilience</span>,{" "}
              <span className="font-semibold text-gold">quality connection</span>,
              and{" "}
              <span className="font-semibold text-gold">clear communication</span>.
            </p>
            <p>
              Old wisdom. Modern work. That is what the porch is for.
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
              Becoming is slower than fixing. It asks for honesty about
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
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
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
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src={letsChangeImg}
                alt="Let's Change neon sign on a classic building facade"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* The Patterns We Found - breathing section */}
      <section className="py-14 md:py-20 bg-lime">
        <div className="container max-w-4xl mx-auto px-6">
          <p className="text-center text-white/80 font-poppins text-sm uppercase tracking-widest mb-8">
            The Foundational Abilities That Make Change Stick
          </p>
          <div className="space-y-5">
            {[
              "Show up strong, confident, energized, and resilient when uncertainty or change is presented",
              "Share ideas and challenge well-worn norms and habits",
              "Spot and solve problems proactively and honestly",
              "Work in healthy, collaborative, accountable teams",
              "Communicate with clarity, consistency, and impact",
            ].map((ability, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gold font-poppins font-bold text-sm">{i + 1}</span>
                </div>
                <p className="text-white/90 text-lg leading-relaxed">{ability}</p>
              </div>
            ))}
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
        <div className="container max-w-6xl mx-auto px-6">
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
                  <h3 className="font-poppins font-semibold text-xl mb-1 text-navy">
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

      {/* What Makes Us Different */}
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-6">
          <h3 className="font-poppins font-semibold text-xl text-navy mb-8 text-center">
            What Makes Us Different
          </h3>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-strategic flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">R</span>
              </div>
              <div>
                <span className="font-semibold text-navy">Reason</span>
                <p className="text-foreground text-sm">Clear, logical thinking drives every recommendation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">L</span>
              </div>
              <div>
                <span className="font-semibold text-navy">Logic</span>
                <p className="text-foreground text-sm">Structured frameworks that produce consistent results</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-lime flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">P</span>
              </div>
              <div>
                <span className="font-semibold text-navy">Purpose</span>
                <p className="text-foreground text-sm">Every engagement tied to meaningful outcomes</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">V</span>
              </div>
              <div>
                <span className="font-semibold text-navy">Virtue</span>
                <p className="text-foreground text-sm">Integrity and ethics at the center of our work</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Response */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <p className="text-lg md:text-xl text-foreground leading-relaxed mb-6">
            By leaning on over <span className="font-semibold text-navy">50 years of our team's combined experience</span> and real-world solutions, we developed (and continually evolve) training, coaching, and advisory programs to partner with you in taking <span className="font-semibold text-primary">definitive, purposeful action</span> to prepare yourself and others to lean in, embrace, adopt, and make change stick.
          </p>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-12 md:py-16 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-navy">Our Certifications & Credentials</h3>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 md:gap-6">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-3 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow h-20 md:h-24"
                title={cert.name}
              >
                <img
                  src={cert.badge}
                  alt={cert.name}
                  className="max-h-14 md:max-h-18 max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's a Painted Porch */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge-strategic mb-4 inline-block bg-gold">Our Philosophy</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                What's a "Painted Porch"?
              </h2>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                In ancient Greece, philosophers gathered at the Stoa Poikile — the "Painted Porch" — to discuss ideas that would shape Western thought. These Stoic principles of reason, logic, purpose, and virtue remain as relevant today as they were 2,300 years ago.
              </p>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                We bring these timeless principles to modern business, helping leaders and teams build the mental and organizational architecture needed to navigate change successfully.
              </p>
              <p className="text-lg font-semibold text-primary">
                Eudaimonia — prosperity and well-being through purposeful action.
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

      {/* CTA */}
      <section className="relative isolate py-16 md:py-24 text-white overflow-hidden">
        <img
          src={teamCtaPuzzles}
          alt="Colorful puzzle pieces interlocking, symbolizing collaboration"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-navy/60" />
        <div className="container max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Transformation Journey?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Reach out to learn more about how we can partner with you to get started.
          </p>
          <Link to="/contact?interest=general&message=I'd like to learn more about partnering with Painted Porch Strategies.">
            <Button className="bg-primary border-2 border-primary text-white hover:bg-white hover:text-primary text-lg py-5 px-8 transition-colors">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
