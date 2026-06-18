import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, ClipboardCheck, Users, Brain, Sparkles } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import servicesHero from "@/assets/heroes/services-hero.jpg";
import { Eyebrow } from "@/components/pps/Eyebrow";

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </div>
  );
}

const services = [
  {
    icon: Search,
    title: "Assess Your Change Readiness",
    description:
      "Often to evolve your business or prepare for change, it's important to understand where you're at today, right now, in the present. We'll partner with you to assess the change readiness of your organization, providing guidance and recommendations on ways to turn any identified obstacles into opportunities for growth and transformation.",
    cta: { label: "Schedule a Discovery Call", href: "/contact?scope=organization&interest=organizational-advisory&message=I'm interested in a change readiness assessment." },
  },
  {
    icon: ClipboardCheck,
    title: "Plan & Prepare Your Organization For Change",
    description:
      "As a Lean Change, Change Style Indicator, Change Navigator, Immunity to Change, and Prosci©-certified Change Practitioner, Amy Yackowski and the Painted Porch team work alongside your organization to develop an effective change readiness plan to reduce change risk and promote change engagement, ownership, accountability, and adoption by ALL impacted stakeholders and teams.",
    cta: { label: "Schedule a Discovery Call", href: "/contact?scope=organization&interest=organizational-advisory&message=I'm interested in change readiness planning." },
  },
  {
    icon: Users,
    title: "Develop Innovative, Change-Ready Leaders & Teams",
    description:
      "Our training programs are designed to be delivered on-demand (self-paced), online (virtual, live calls), or on-site with your teams. Each program is centered on activating the hidden potential and strength of your people and creating a foundation for organizational transformation, change, growth, and success.",
    cta: { label: "Explore Our Programs", href: "/programs" },
  },
  {
    icon: Brain,
    title: "Build Emotionally-Intelligent Leaders & Teams",
    description:
      "Emotional Intelligence (EI or EQ) has been shown to account for 27–45% of job success. Business is, at its core, about leadership, teamwork, customer service, and sales. Each of these is driven by human interactions. As certified EQ-i 2.0© and EQ360© practitioners, we offer EQ assessments, 360s, workshops, and coaching to develop emotionally resilient and effective leaders and teams.",
    cta: { label: "Learn More About E.Q.", href: "/eq" },
  },
];

const experts = [
  {
    name: "Sierra Ramm Cantrell",
    role: "Mindfulness",
    description:
      "Want to develop a custom mindfulness program or initiative for your business? Work one-on-one with Sierra Ramm Cantrell, a 12+ yr. Yoga, Mindfulness, and Movement expert, to design a program to help your teams go from Overwhelm to Om.",
    link: "/sierra",
    linkLabel: "Get to Know Sierra",
  },
  {
    name: "Rob Hunter",
    role: "Communication",
    description:
      "Have an upcoming presentation or big announcement? Do you simply want to improve your speaking skills & confidence? 25+ yr. Radio, TV, and Podcast veteran, Rob Hunter, can help you master your messaging to maximize impact, comprehension, and clarity.",
    link: "/rob",
    linkLabel: "Get to Know Rob",
  },
  {
    name: "Amy Yackowski",
    role: "Teams & Operations",
    description:
      "Struggling with team collaboration and cohesion? Need guidance on effective operational change or transformation? Amy Yackowski's 20+ yrs. of advising the Healthcare Staffing industry can help you develop strong, healthy, and collaborative teams.",
    link: "/amy",
    linkLabel: "Get to Know Amy",
  },
];

export default function PPSServices() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <img src={servicesHero} alt="Colorful painted mural" className="w-full h-full object-cover" width={1920} height={800} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Eyebrow variant="plain" tone="gold">What We Do</Eyebrow>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-6">
            Our Services
          </h1>
          <p className="text-lead text-white/90 max-w-2xl leading-relaxed mb-8">
            Our services are centered around providing your business with everything it needs to{" "}
            <strong>fortify the strength and value</strong> of your people, processes, and systems for{" "}
            <strong>resilience</strong>, <strong>change</strong> adaptability, and <strong>growth</strong>.
          </p>
          <Button asChild size="lg" className="bg-pps-orange hover:bg-pps-orange/90 text-white font-poppins font-semibold rounded-lg px-8">
            <Link to="/contact?scope=organization&interest=organizational-advisory&message=I'm interested in your services.">Schedule a Discovery Call <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>

      {/* Trusted By */}
      <ClientLogoMarquee heading="Trusted By" />

      {/* Our Focus */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Eyebrow variant="plain" tone="teal">The Painted Porch Way</Eyebrow>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-pps-navy mb-6">
              Our Focus
            </h2>
            <p className="text-lead text-charcoal leading-relaxed mb-8">
              In order to create a <strong>strong, resilient company</strong>, we take a holistic approach to{" "}
              <strong>business transformation and lasting change</strong>.
            </p>
            <p className="text-lead text-charcoal leading-relaxed mb-8">
              A <strong>healthy organization</strong> is focused on fortifying four elements to ensure{" "}
              <strong>balance</strong> and a <strong>centered strength:</strong>
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              {["People", "Process", "Strategy", "Mission"].map((item) => (
                <div
                  key={item}
                  className="bg-pps-navy/5 border border-pps-navy/10 rounded-xl px-8 py-4"
                >
                  <span className="font-poppins font-bold text-xl text-pps-navy">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Our Services */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <Eyebrow variant="plain" tone="teal">The Painted Porch System</Eyebrow>
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-pps-navy mb-6">
                Our Services
              </h2>
              <p className="text-lead text-charcoal max-w-3xl mx-auto leading-relaxed">
                Change presents itself in many ways, sizes, and purposes. Having the mindset, messaging, teams, and mission dialed in are critical to adoption and execution of any new idea. Whether your change initiative is small or company-wide, our training and advisory services are centered around{" "}
                <strong>preparing your leaders and teams for ANY change</strong>…and making it stick.
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-12">
            {services.map((service, i) => {
              const Icon = service.icon;
              const isEven = i % 2 === 0;
              return (
                <AnimatedSection key={service.title}>
                  <div className={`bg-white rounded-2xl shadow-sm border border-border overflow-hidden md:flex ${isEven ? "" : "md:flex-row-reverse"}`}>
                    <div className="md:w-24 flex items-center justify-center bg-pps-navy/5 p-6 md:p-8">
                      <Icon className="h-12 w-12 text-pps-teal" />
                    </div>
                    <div className="flex-1 p-8 md:p-10">
                      <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-navy mb-4">
                        {service.title}
                      </h3>
                      <p className="text-body text-charcoal leading-relaxed mb-6">{service.description}</p>
                      <Button asChild className="bg-pps-teal hover:bg-pps-teal/90 text-white font-poppins font-semibold rounded-lg">
                        <Link to={service.cta.href}>
                          {service.cta.label} <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </AnimatedSection>
              );
            })}
          </div>
        </div>
      </section>

      {/* One-on-One Guidance */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-pps-navy mb-6">
                One-on-One Guidance, Coaching, and Advisory
              </h2>
              <p className="text-lead text-charcoal max-w-3xl mx-auto leading-relaxed">
                The Painted Porch team is made up of experts across multiple industries including{" "}
                <strong>Movement & Mindfulness</strong>, <strong>Media & Broadcasting</strong>, and{" "}
                <strong>Staffing Operations & System Development</strong>.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {experts.map((expert) => (
                <div
                  key={expert.name}
                  className="bg-muted/30 rounded-2xl border border-border p-8 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-16 h-16 bg-pps-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Sparkles className="h-8 w-8 text-pps-teal" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-navy mb-1">{expert.role}</h3>
                  <p className="text-body-sm text-pps-gold font-semibold mb-4">{expert.name}</p>
                  <p className="text-charcoal text-body-sm leading-relaxed mb-6">{expert.description}</p>
                  <Button asChild variant="outline" className="border-pps-teal text-pps-teal hover:bg-pps-teal/10 font-poppins font-semibold rounded-lg">
                    <Link to={expert.link}>{expert.linkLabel} <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Individual CTA */}
      <AnimatedSection>
        <section className="py-20 bg-pps-navy text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-6">
              Interested in our programs for yourself?
            </h2>
            <p className="text-lead text-white/80 leading-relaxed mb-8">
              <strong>Eliminating burnout</strong>, building up emotional <strong>resiliency</strong>, developing{" "}
              <strong>strong teams</strong> & connections, and <strong>finding your true voice</strong> are not just
              for the workplace. Discover how to tap into your inner power and{" "}
              <strong>become the Architect of Your Life</strong>.
            </p>
            <Button asChild size="lg" className="bg-pps-gold hover:bg-pps-gold/90 text-pps-navy font-poppins font-semibold rounded-lg px-8">
              <Link to="/programs">Explore Individual Programs <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
          </div>
        </section>
      </AnimatedSection>
    </div>
  );
}
