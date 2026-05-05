import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Handshake, Target, BookOpen, Shield } from "lucide-react";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import approachHero from "@/assets/heroes/approach-hero.jpg";
import PartnershipPromise from "@/components/pps/PartnershipPromise";

const coreValues = [
  {
    number: "01",
    title: "Purpose",
    description: "Our noble purpose is to transform the ways in which we design, define, and connect with ourselves and our work to achieve optimal fulfillment, resiliency, and success.",
    detail: "We do this by helping develop mindful and resilient leaders and learners, collaborative teams, and communication that creates a meaningful, lasting impact.",
    color: "bg-strategic/10",
    borderColor: "border-strategic",
  },
  {
    number: "02",
    title: "Partnership",
    description: "You are the expert of your life and work. Rather than telling you what to do, we share our best insights and methods to help you design your path toward fulfilling your goals and objectives — and make them stick.",
    detail: "We serve as your guide, advisor, and partner on your transformation journey. Together, we empower you to realize amazing changes — even after we're gone.",
    color: "bg-primary/10",
    borderColor: "border-primary",
  },
  {
    number: "03",
    title: "Stewardship",
    description: "Our approach, guidance, and methodologies center on the principles of shared commitment, trust, and accountability to achieve desired success.",
    detail: "We believe that optimal results are realized when — together — we are focused on doing good work that is not only financially rewarding, but where personal ability, purpose, and contribution are maximized.",
    color: "bg-lime/10",
    borderColor: "border-lime",
  },
];

export default function OurApproach() {
  return (
    <div>
      {/* Hero */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Ancient Practices for Modern Life
          </span>
        }
        headline="Our Approach"
        description={
          <>
            <p className="mb-4">The most successful people and organizations are those committed to developing <span className="font-semibold text-gold">emotional resilience</span>, <span className="font-semibold text-gold">quality connections</span>, and <span className="font-semibold text-gold">strong communication skills</span> to achieve lasting change, growth, and fulfillment.</p>
            <p className="italic">It's what the Roman orator Cicero called <span className="font-semibold text-gold">Summum Bonum</span> — "the highest good."</p>
          </>
        }
        ctas={[
          { label: "Partner With Us", href: "/partner", isPrimary: true },
        ]}
        background={{ type: "image", src: approachHero }}
        overlayClass="bg-navy/50"
        minHeightClass="min-h-[60vh]"
      />


      {/* Core Values */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Core Values for Success
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className={`${value.color} p-8 rounded-xl border-t-4 ${value.borderColor}`}
              >
                <span className="text-4xl font-bold text-navy/20 font-poppins">
                  {value.number}
                </span>
                <h3 className="font-poppins font-bold text-2xl text-navy mt-2 mb-4">
                  {value.title}
                </h3>
                <p className="text-foreground leading-relaxed mb-4">
                  {value.description}
                </p>
                <p className="text-foreground/80 text-sm leading-relaxed">
                  {value.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Sets Our Approach Apart */}
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              What Sets Our Approach Apart
            </h2>
            <p className="text-lg text-foreground max-w-3xl mx-auto">
              Five principles that guide every partnership, every engagement, every conversation.
            </p>
          </div>

          <div className="space-y-16">
            {[
              {
                icon: Building2,
                number: "01",
                title: "We Begin Before the Becoming",
                subtitle: "Phase Zero™",
                description: "Most change work starts at launch. Ours starts in the moment you're still deciding what change to lead. That critical Phase Zero window — before decisions are locked, before initiatives are scoped — is where real transformation is authored.",
                accent: "bg-primary/10 border-primary",
                iconBg: "bg-primary/15",
                iconColor: "text-primary",
              },
              {
                icon: Handshake,
                number: "02",
                title: "We Co-Design, Never Dictate",
                subtitle: "Partnership Model",
                description: "You are the expert of your organizational context, culture, and constraints. We bring transformation architecture. Together, we build something that actually works in your reality — not a templated solution dropped in from the outside.",
                accent: "bg-gold/10 border-gold",
                iconBg: "bg-gold/15",
                iconColor: "text-gold",
              },
              {
                icon: Target,
                number: "03",
                title: "We Architect Capacity, Not Dependencies",
                subtitle: "Sustainable Transformation",
                description: "Our goal isn't to make this one change successful — it's to build your capacity to lead any change. When we're done, you've become transformation architects yourselves. We design ourselves out of the equation.",
                accent: "bg-lime/10 border-lime",
                iconBg: "bg-lime/15",
                iconColor: "text-lime",
              },
              {
                icon: BookOpen,
                number: "04",
                title: "We're Grounded in 2,300 Years of Wisdom",
                subtitle: "Stoic Foundation",
                description: "While most leadership development chases trendy frameworks, we're built on Stoic philosophy — time-tested principles of strategic preparation, resilience, and conscious design. Premeditatio Malorum: prepare for adversity before pressure demands it.",
                accent: "bg-strategic/10 border-strategic",
                iconBg: "bg-strategic/15",
                iconColor: "text-strategic",
              },
              {
                icon: Shield,
                number: "05",
                title: "We Focus on People First, Always",
                subtitle: "Human-Centered Architecture",
                description: "Technology is an enabler, not a savior. Process is a vehicle, not a destination. Every engagement begins and ends with the people navigating the shift — because transformation succeeds or fails at the human level.",
                accent: "bg-raspberry/10 border-raspberry",
                iconBg: "bg-raspberry/15",
                iconColor: "text-raspberry",
              },
            ].map((item, index) => {
              const isEven = index % 2 === 1;
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isEven ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-12`}
                >
                  {/* Icon / Number side */}
                  <div className={`flex-shrink-0 w-full md:w-2/5 ${item.accent} rounded-2xl p-10 flex flex-col items-center justify-center text-center border`}>
                    <div className={`w-16 h-16 rounded-full ${item.iconBg} flex items-center justify-center mb-4`}>
                      <item.icon className={`w-8 h-8 ${item.iconColor}`} />
                    </div>
                    <span className="text-5xl font-bold text-navy/10 font-poppins">{item.number}</span>
                  </div>

                  {/* Text side */}
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary/60 mb-2">{item.subtitle}</p>
                    <h3 className="font-poppins font-bold text-xl md:text-2xl text-navy mb-3">{item.title}</h3>
                    <p className="text-foreground leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge-strategic mb-4 inline-block">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                The Painted Porch Story
              </h2>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                With over 20 years of combined experience in healthcare staffing and digital transformation, we discovered a consistent truth: long-term success requires people to be <span className="font-semibold text-primary">change-ready</span>.
              </p>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                Organizations that thrive through transformation share common traits: <span className="font-semibold">resilience</span> in the face of uncertainty, the ability to engage in <span className="font-semibold">healthy conflict</span>, and <span className="font-semibold">clear communication</span> that aligns everyone toward shared goals.
              </p>
              <p className="text-lg text-foreground leading-relaxed">
                The name "Painted Porch" comes from the Stoa Poikile in ancient Athens — where Stoic philosophers gathered to discuss ideas that shaped Western civilization. We bring those timeless principles to modern business.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <h3 className="font-poppins font-semibold text-xl text-navy mb-6">
                What Makes Us Different
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-strategic flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">R</span>
                  </div>
                  <div>
                    <span className="font-semibold text-navy">Reason</span>
                    <p className="text-foreground text-sm">Clear, logical thinking drives every recommendation</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">L</span>
                  </div>
                  <div>
                    <span className="font-semibold text-navy">Logic</span>
                    <p className="text-foreground text-sm">Structured frameworks that produce consistent results</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-lime flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">P</span>
                  </div>
                  <div>
                    <span className="font-semibold text-navy">Purpose</span>
                    <p className="text-foreground text-sm">Every engagement tied to meaningful outcomes</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">V</span>
                  </div>
                  <div>
                    <span className="font-semibold text-navy">Virtue</span>
                    <p className="text-foreground text-sm">Integrity and ethics at the center of our work</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-strategic text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Transformation Journey?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Let's discuss how Stoic principles can transform your organization.
          </p>
          <Link to="/contact?scope=organization&interest=organizational-advisory&message=I'm interested in learning more about your approach.">
            <Button className="bg-primary border-2 border-primary text-white hover:bg-white hover:text-primary text-lg py-5 px-8 transition-colors">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>

      <PartnershipPromise />
    </div>
  );
}
