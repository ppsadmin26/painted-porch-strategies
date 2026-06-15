import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Heart } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import businessHero from "@/assets/heroes/business-programs-hero.jpg";
import radicalMindfulness from "@/assets/programs/radical-mindfulness.jpg";
import masterYourMessage from "@/assets/programs/master-your-message.jpg";
import extraordinaryTeams from "@/assets/programs/extraordinary-teams.jpg";
import missionUnstoppable from "@/assets/programs/mission-unstoppable.jpg";
import operationsOnPurpose from "@/assets/programs/operations-on-purpose.jpg";

// Team photos
import amyPhoto from "@/assets/team/amy-yackowski.png";
import sierraPhoto from "@/assets/team/sierra-ramm-cantrell.jpg";
import robPhoto from "@/assets/team/rob-hunter.jpg";

const peoplePrograms = [
  {
    title: "Radical Mindfulness",
    description:
      "Eliminate burnout & decrease turnover through a program built to guide employees on how to take control of their emotions, find opportunities among the obstacles in life and work, and build up resiliency to what's outside of their control.",
    image: radicalMindfulness,
    link: "/partner/amplify",
  },
  {
    title: "Master Your Message",
    description:
      "Communication is one of the most impactful, yet least practiced skills. Employees learn how to best deliver a message, in any setting or environment, to inspire collaboration and innovation, with clarity, confidence, and influence.",
    image: masterYourMessage,
    link: "/partner/amplify",
  },
  {
    title: "Extraordinary Teams",
    description:
      "Transform teams from dysfunctional to healthy and effective. By focusing on flexibility, trust, and accountability, teams discover ways to turn obstacles or problems into opportunities and solutions, creating a mission-focused unit.",
    image: extraordinaryTeams,
    link: "/partner/amplify",
  },
];

const operationalPrograms = [
  {
    title: "Mission: Unstoppable",
    description:
      "Eliminate strategic goal and mission inconsistency. Create a crystal clear mission and strategies to provide direction for your teams to realize operational excellence and strategic success.",
    image: missionUnstoppable,
    link: "/partner/amplify",
  },
  {
    title: "Operations on Purpose",
    description:
      "Inefficient processes and misaligned roles result in lost time, money, resources, and revenue. Tap into the hidden talents of your team to create flexible, future-ready people who can maximize your outcomes and meet whatever shIFt happens next.",
    image: operationsOnPurpose,
    link: "/partner/amplify",
  },
];

const pricingTiers = [
  {
    name: "On Demand",
    price: "$9,997",
    features: [
      "One Year of access to online, self-paced lessons and exercises for everyone in your organization",
      "Live Advisory Calls",
      "Executive Sponsor 1:1 Check-ins",
      "Access to Private, Interactive Community",
    ],
    color: "border-primary",
    accent: "text-primary",
    bg: "bg-primary/5",
  },
  {
    name: "Virtual (Live)",
    price: "$12,497",
    popular: true,
    features: [
      "Live, interactive training delivered via video calls",
      "6 Month access to on-demand lessons for everyone in your organization",
      "Live Group Advisory Calls",
      "Executive Sponsor 1:1 Check-ins",
      "Access to Private, Interactive Community",
    ],
    color: "border-gold",
    accent: "text-gold",
    bg: "bg-gold/5",
  },
  {
    name: "On-Site",
    price: "$14,997",
    features: [
      "Live, interactive program delivered onsite",
      "6 Month access to on-demand lessons for everyone in your organization",
      "Live Group Advisory Calls",
      "Executive Sponsor 1:1 Check-Ins",
      "Access to Private, Interactive Community",
      "All-inclusive, flat pricing (Travel included)",
    ],
    color: "border-strategic",
    accent: "text-strategic",
    bg: "bg-strategic/5",
  },
];

const experts = [
  {
    name: "Sierra Ramm Cantrell",
    specialty: "Mindfulness",
    experience: "12+ years",
    description:
      "Want to develop a custom mindfulness program or initiative for your business? Work one-on-one with Sierra to design a program to guide your teams go from Overwhelm to Om.",
    photo: sierraPhoto,
    color: "bg-lime/10 border-lime/20",
    accent: "text-lime",
  },
  {
    name: "Rob Hunter",
    specialty: "Communication",
    experience: "25+ years",
    description:
      "Have an upcoming presentation or big announcement? Do you simply want to improve your speaking skills & confidence? Rob can guide you to master your messaging to maximize impact, comprehension, and clarity.",
    photo: robPhoto,
    color: "bg-primary/10 border-primary/20",
    accent: "text-primary",
  },
  {
    name: "Amy Yackowski",
    specialty: "Teams & Operations",
    experience: "18+ years",
    description:
      "Struggling with team collaboration and cohesion? Need guidance on effective operational change or transformation? Amy can guide you to develop strong, healthy, and collaborative teams.",
    photo: amyPhoto,
    color: "bg-gold/10 border-gold/20",
    accent: "text-gold",
  },
];

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({ threshold: 0.15 });
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}
    >
      {children}
    </div>
  );
}

export default function PPSBusinessPrograms() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[520px] md:min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img
            src={businessHero}
            alt="Colorful architectural ceiling"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/65 to-navy/30" />
        </div>
        <div className="container max-w-7xl mx-auto px-6 relative z-10 py-20">
          <div className="max-w-2xl">
            <span className="inline-block bg-gold text-navy font-poppins font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full mb-6">
              A System for Lasting Change &amp; Growth
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-poppins leading-tight">
              Training Programs
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8">
              Our training programs are designed to activate your employees' inner power,{" "}
              <strong>tackle burnout</strong>{" "}
              <em>(or occasional overwhelm)</em>,{" "}
              <strong>effectively collaborate</strong> with others,{" "}
              <strong>communicate with confidence</strong>, and create{" "}
              <strong>operational success and change that sticks</strong>.
            </p>
            <a
              href="https://meet.paintedporchstrategies.com/discovery/discoverycall"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-gold hover:bg-gold/90 text-navy font-semibold text-lg py-6 px-10 rounded-lg transition-all hover:scale-[1.02]">
                Schedule a Discovery Call
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Zig Ziglar Quote */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <blockquote className="text-xl md:text-2xl italic text-gold leading-relaxed font-poppins">
            "You don't build a business. You build people, and people build the business."
          </blockquote>
          <p className="text-muted-foreground mt-3 font-semibold">Zig Ziglar</p>
        </div>
      </section>

      {/* People Success Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 font-poppins">
                People Success
              </h2>
              <p className="text-lg text-foreground leading-relaxed">
                Most business programs focus on just one area of struggle or improvement{" "}
                <em>(e.g., Teamwork or Leadership)</em>. We believe that in order for you to have a
                truly great business{" "}
                <em>(where people are dedicated, growth-minded, and sticking around)</em> requires a{" "}
                <strong>holistic approach to people success:</strong>
              </p>
              <p className="text-xl font-poppins font-semibold text-navy mt-6">
                Individual Mindset, Effective Communication, and Collaborative Teams.
              </p>
              <p className="text-lg text-foreground leading-relaxed mt-6">
                There is <strong>untapped potential</strong> and power in your employees to{" "}
                <strong>stand strong and resilient</strong> among the obstacles in life and work,{" "}
                <strong>develop productive, trusting collaborations</strong>, and{" "}
                <strong>communicate effectively</strong>, confidently, and with impact.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {peoplePrograms.map((program) => (
              <AnimatedSection key={program.title}>
                <Link
                  to={program.link}
                  className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      width={1024}
                      height={768}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-3 group-hover:text-primary transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-foreground text-sm leading-relaxed mb-4">
                      {program.description}
                    </p>
                    <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Details <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Peter Drucker Quote */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <blockquote className="text-xl md:text-2xl italic text-strategic leading-relaxed font-poppins">
            "The relevant question is not simply what shall we do tomorrow, but rather what shall we do today in order to get ready for tomorrow."
          </blockquote>
          <p className="text-muted-foreground mt-3 font-semibold">Peter Drucker</p>
        </div>
      </section>

      {/* Operational Success */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 font-poppins">
                Operational Success
              </h2>
              <p className="text-lg text-foreground leading-relaxed">
                Eliminate the <strong>operational weight</strong> that is{" "}
                <strong>slowing down your growth</strong> and <strong>change</strong> initiatives.
                Learn to shift from outdated or wasteful processes to focus on{" "}
                <strong>delivering value</strong> and clear outcomes.{" "}
                <strong>Never need a consultant again</strong> by creating your own{" "}
                <strong>internal network</strong> of engaged, knowledgeable experts and problem
                solvers, <strong>invested</strong> in your <strong>mission</strong>, your{" "}
                <strong>clients</strong>, and your company's <strong>success</strong>.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {operationalPrograms.map((program) => (
              <AnimatedSection key={program.title}>
                <Link
                  to={program.link}
                  className="group block bg-muted rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      width={1024}
                      height={768}
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-3 group-hover:text-primary transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-foreground text-sm leading-relaxed mb-4">
                      {program.description}
                    </p>
                    <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Details <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Invest in People Banner */}
      <section className="py-12 md:py-16 bg-navy text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-xl md:text-2xl font-bold font-poppins">
            Great companies invest in developing their people. When your people are strong, your business will thrive.
          </h3>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 font-poppins">
                Flexible &amp; Transparent Pricing
              </h2>
              <p className="text-lg text-foreground leading-relaxed mb-4">
                We like to do things differently here, in our diversity of experts across multiple
                industries, our people-first programs, and our pricing.
              </p>
              <p className="text-lg text-foreground leading-relaxed mb-4">
                <strong>Having flexibility</strong> in what programs and services are available to
                you, based on your <strong>budget</strong>, <strong>resources</strong>, desired{" "}
                <strong>outcomes</strong>, and <strong>schedule</strong>, is important. That's why
                you have your choice of <strong>three methods of program delivery</strong> to align
                with your needs.
              </p>
              <p className="text-foreground leading-relaxed">
                Our programs are designed to benefit <strong>EVERYONE</strong> in your company, not
                just those in official leadership roles. We want you to be able to{" "}
                <strong>invest in your Company's success</strong>, not just certain individuals.
              </p>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Prices below are per program. Multi-program discounts are available.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingTiers.map((tier) => (
              <AnimatedSection key={tier.name}>
                <div
                  className={`${tier.bg} border-2 ${tier.color} rounded-xl p-8 h-full flex flex-col relative`}
                >
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold text-navy font-poppins font-bold text-xs uppercase px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <h3 className={`text-xl md:text-2xl font-poppins font-bold ${tier.accent} mb-2`}>
                    {tier.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-navy">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">*</span>
                  </div>
                  <ul className="space-y-3 flex-1 mb-8">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground">
                        <CheckCircle className={`w-5 h-5 ${tier.accent} flex-shrink-0 mt-0.5`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="https://meet.paintedporchstrategies.com/discovery/discoverycall"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className={`w-full bg-navy hover:bg-navy/90 text-white font-semibold py-5 rounded-lg transition-all`}>
                      Schedule a Discovery Call
                    </Button>
                  </a>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Team */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 font-poppins">
                One-on-One Guidance, Coaching, and Advisory
              </h2>
              <p className="text-lg text-foreground leading-relaxed">
                The Painted Porch team is made up of experts across multiple industries including{" "}
                <strong>Movement &amp; Mindfulness</strong>,{" "}
                <strong>Media &amp; Broadcasting</strong>, and{" "}
                <strong>Staffing Operations &amp; System Development</strong>.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {experts.map((expert) => (
              <AnimatedSection key={expert.name}>
                <div className={`${expert.color} border rounded-xl p-8 h-full flex flex-col`}>
                  <div className="w-20 h-20 rounded-full mb-4 overflow-hidden">
                    <img
                      src={expert.photo}
                      alt={expert.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <span className={`font-poppins font-bold text-xs uppercase tracking-wider ${expert.accent} mb-1`}>
                    {expert.specialty}
                  </span>
                  <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-1">
                    {expert.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    {expert.experience} Experience
                  </p>
                  <p className="text-foreground text-sm leading-relaxed mb-4 flex-1">
                    {expert.description}
                  </p>
                  <Link
                    to={expert.name === "Amy Yackowski" ? "/amy" : "/about/team"}
                    className={`text-sm font-semibold ${expert.accent} hover:underline flex items-center gap-1`}
                  >
                    Learn More About {expert.name.split(" ")[0]}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Virtuous Cycle / Charity */}
      <section className="py-16 md:py-24 bg-strategic/10">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <Heart className="w-12 h-12 text-strategic mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 font-poppins">
              A Virtuous Cycle
            </h2>
            <p className="text-lg text-foreground leading-relaxed mb-4">
              Painted Porch Strategies was created to model the Stoic principles of{" "}
              <em>Reason, Logic, Purpose, and Virtue</em>. We believe that when your company has a{" "}
              <strong>resilient, mindful workforce</strong> and <strong>noble mission</strong>, your{" "}
              <strong>people, processes, and strategies can align to do amazing work</strong>.
            </p>
            <p className="text-lg text-foreground leading-relaxed mb-6">
              Since we intend to always live by the Stoic philosopher, Seneca's, advice of{" "}
              <em>"works not words"</em>, we believe that in order{" "}
              <strong>
                to do <em>well</em>
              </strong>
              , we must also{" "}
              <strong>
                do <em>good</em>
              </strong>
              .
            </p>
            <div className="bg-white rounded-xl p-8 shadow-sm inline-block">
              <p className="text-xl font-poppins font-bold text-strategic">
                5% of your fee will be donated to a charity of your choice, in your company's name.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Individual CTA */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 font-poppins">
              Interested in our programs for yourself?
            </h2>
            <p className="text-lg text-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
              <strong>Eliminating burnout</strong>, building up emotional{" "}
              <strong>resiliency</strong>, developing <strong>strong teams</strong> &amp;
              connections, and <strong>finding your true voice</strong> when communicating are not
              just for the workplace.{" "}
              <strong>Be the Architect of Your Life</strong> and discover the{" "}
              <em>power</em> of your purpose, <em>confidence</em> in your communication, and the{" "}
              <em>strength</em> of your relationships.
            </p>
            <Link to="/programs">
              <Button className="bg-strategic hover:bg-strategic/90 text-white font-semibold text-lg py-6 px-10 rounded-lg transition-all hover:scale-[1.02]">
                Explore Programs for Yourself
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 bg-navy text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
              Ready to Build Change-Ready Teams?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Reach out to learn more about how we can partner with your organization to build a
              foundation for lasting change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://meet.paintedporchstrategies.com/discovery/discoverycall"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-gold hover:bg-gold/90 text-navy font-semibold text-lg py-6 px-10 rounded-lg transition-all hover:scale-[1.02]">
                  Schedule a Discovery Call
                </Button>
              </a>
              <Link to="/contact?scope=organization&interest=organizational-advisory&message=I'm interested in business programs.">
                <Button
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-navy font-semibold text-lg py-6 px-10 rounded-lg transition-all"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
