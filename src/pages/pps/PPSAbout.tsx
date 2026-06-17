import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import ParallaxCTA from "@/components/pps/ParallaxCTA";
import paintedPorchChairs from "@/assets/about/painted-porch-chairs.jpg";
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
    experience: "",
    description: "\n\nAmy believes most organizations don't struggle because they lack ambition, but because important decisions are often made before leaders have enough clarity about what they're building, why it matters, and what it will require.\n\nAfter two decades leading strategic initiatives, organizational transformation efforts, and complex change across industries, she founded Painted Porch Strategies around a simple idea: better questions often create better outcomes than faster answers.\n\nShe brings strategic clarity, organizational insight, and a talent for helping leaders see what others overlook.",
    specialties: ["Organizational Design", "Change Management", "Strategic Planning", "Team Development"],
    color: "bg-primary/10",
    accent: "text-primary",
    photo: amyPhoto,
  },
  {
    name: "Sierra Ramm Cantrell",
    title: "Chief Joy Officer | M.B.A. - Mind-Body Architect | Mindfulness Sherpa",
    experience: "",
    description: "\n\nSierra believes sustainable progress begins with the people experiencing it. The quality of our attention, resilience, and self-awareness shapes how we navigate uncertainty, growth, and change.\n\n\n\n\nDrawing from her years of work in mindfulness, resilience, and human development, she explores the conditions that allow individuals and teams to remain grounded, adaptable, and engaged when complexity increases.\n\n\n\n\nShe brings perspective, presence, and a deep appreciation for the human experience behind organizational success.",
    specialties: ["Growth Mindset", "Yoga & Meditation", "Mindful Leadership", "Energy Management"],
    color: "bg-gold/10",
    accent: "text-gold",
    photo: sierraPhoto,
  },
  {
    name: "Rob Hunter",
    title: "Chief Storytelling Officer | M.C. - Master of Communication",
    experience: "",
    description: "\n\nRob believes people rarely move because they receive more information. They move when information becomes meaningful.\n\n\n\n\nAs a 27 year, award winning, #1 rated radio talk show host (iHeartPhoenix), his background in communication, storytelling, breaking news, and audience engagement has shown him that clarity isn't simply about what is said—it's about what is understood, remembered, and acted upon.\n\n\n\n\nHe brings narrative insight, strategic communication expertise, and a gift for turning complex ideas into conversations people can connect with.",
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
              <strong>The most important decisions are rarely made in the middle of execution.</strong>
            </p>
            <p className="mb-4">
              Painted Porch Strategies exists for the moments before a major decision hardens into action - when leaders need space to think, question assumptions, examine direction, and decide what is truly worth pursuing.&nbsp;
            </p>
            <p>
              The porch is a place to pause long enough to see clearly what comes next, before momentum makes the decision feel inevitable.&nbsp;&nbsp;Because whatever shIFt happens next is often determined long before execution begins.
            </p>
          </>
        }
        ctas={[]}
        background={{ type: "video", src: "", poster: aboutHero, slotKey: "about-hero" }}
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
                The original Painted Porch was a gathering place where people wrestled with questions about how to live, lead, and act with intention.
                <br /><br />
                It wasn't a place for quick answers. It was a place for thoughtful conversation, reflection, and wisdom.
                <br /><br />
                We chose the name because organizations need spaces like that, too.
                <br /><br />
                Not places to move faster. Places <strong>to think better</strong>.
                <br /><br />
                Not places to react. Places <strong>to decide deliberately</strong> what comes next.
              </p>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                We bring these timeless principles to modern business, so leaders and teams can build the mental and organizational architecture needed to navigate what they are becoming next successfully.
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
              experienced, and already carrying a lot. What they're looking
              for is not another framework. It's a place to think clearly
              about who their organization is trying to become.
            </p>
            <p>
              Fixing seeks relief. Reflection creates direction.&nbsp;It asks for clarity about
              culture, leadership, and capacity. It asks for room to choose
              what to lead, instead of just reacting to what's happening.
            </p>
            <p>
              That's the work we partner on. If you want to see how we
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
                We Saw the Same Pattern Everywhere.
              </h2>
              <div className="text-lg text-foreground leading-relaxed mb-6 space-y-4">
                <p>
                  Across transformation efforts, growth initiatives, leadership transitions, and organizational change, one pattern kept emerging.
                </p>
                <p>
                  The challenge was rarely a lack of effort. It was a <strong>lack of space</strong>.
                </p>
                <p>
                  Space <strong>to think</strong>.<br />
                  Space <strong>to question assumptions</strong>.<br />
                  Space <strong>to examine what was driving the decision</strong> before resources, time, and energy were committed.
                </p>
                <p>
                  Everyone was focused on execution. Very few were examining the thinking underneath it.
                </p>
                <p>
                  That observation became Painted Porch Strategies.
                </p>
                <p>
                  A place dedicated to the work before the work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>




      {/* Transformation Partners Intro */}
      <section className="pt-16 md:pt-20 pb-8 md:pb-10 bg-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block bg-primary/10 text-primary font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Meet the Team
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            Different Disciplines. Shared Conviction.
          </h2>
          <div className="text-lg text-foreground leading-relaxed space-y-8">
            <p>
              Painted Porch brings together expertise in leadership, organizational strategy,
              <br className="hidden md:block" /> communication, behavioral change, and human performance.
            </p>

            <p>
              Different perspectives.
              <br />
              Different experiences.
            </p>

            <p>
              One shared belief:
              <br />
              <strong>The best decisions are rarely made under pressure.</strong>
              <br />
              <strong>They're made when people have the clarity to see what matters most.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="pt-8 md:pt-10 pb-16 md:pb-24 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member, index) => {
              const isAmy = member.name === "Amy Yackowski";

              return (
                <div key={index} className={`flex flex-col ${isAmy ? "bg-strategic/10 p-8 rounded-xl" : `${member.color} p-8 rounded-xl`}`}>
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
                  {member.experience && (
                    <p className="text-xs text-muted-foreground mb-4">
                      {member.experience}
                    </p>
                  )}
                  <div className="text-foreground text-sm leading-relaxed mb-4">
                    {member.description.split('\n\n').map((text, i) => (
                      <p key={i} className={i > 0 ? "mt-4" : ""}>
                        {text}
                      </p>
                    ))}
                  </div>
                  <div className="mt-auto">
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
            WHAT WE BELIEVE
          </p>
          <div className="text-lg md:text-xl text-foreground leading-relaxed mb-6 space-y-8">
            <p className="whitespace-pre-line">
              Organizations become what they repeatedly practice.{"\n\n"}
              That's why we pay attention to the conditions beneath change, not just the outcomes through it.
            </p>
            <p className="font-bold whitespace-pre-line">
              Clarity.{"\n"}
              Communication.{"\n"}
              Trust.{"\n"}
              Leadership.{"\n"}
              Capacity for reflection.
            </p>
            <p>
              These aren't soft skills. They're the foundations that determine whether change takes root or cracks and collapses under its own weight.
            </p>
          </div>
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
        backgroundImage={paintedPorchChairs}
        overlayTone="teal"
        eyebrow="PULL UP A CHAIR ON OUR PORCH"
        headline="What conversation needs a bit of porch perspective right now?"
        description="Whether you're exploring what's next, weighing a major decision, or simply trying to make sense of increasing complexity, every meaningful shIFt begins with a better question."
        actions={[
          { label: "Discover Your P.A.T.H.way", to: "/start-here", variant: "primary" },
          {
            label: "Open the Blue Door",
            to: "/blue-door",
            variant: "bluedoor",
          },
        ]}
      />
    </div>
  );
}
