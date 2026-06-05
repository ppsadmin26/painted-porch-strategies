import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import teamsHero from "@/assets/heroes/teams-hero.jpg";
import { 
  Users, 
  Target, 
  Lightbulb, 
  Settings, 
  CheckCircle, 
  ArrowRight,
  Brain,
  MessageSquare,
  Compass,
  Cog,
  TrendingUp,
  Heart,
  Shield,
  Zap
} from "lucide-react";

const painPoints = [
  { stat: "70%", label: "of change initiatives fail" },
  { stat: "69%", label: "of employees report burnout symptoms" },
  { stat: "20%", label: "of salary lost to poor communication" },
];

const pillars = [
  {
    icon: Lightbulb,
    title: "Mindset",
    subtitle: "Build Grit & Resiliency",
    description: "Develop the mental fortitude and adaptability your team needs to thrive through uncertainty and change.",
    color: "strategic",
  },
  {
    icon: MessageSquare,
    title: "Messaging",
    subtitle: "Master Communication",
    description: "Create clarity and alignment through effective communication strategies that unite your organization.",
    color: "primary",
  },
  {
    icon: Compass,
    title: "Mission",
    subtitle: "Become Growth Ready",
    description: "Align your team around a clear purpose and strategic direction that drives meaningful progress.",
    color: "lime",
  },
  {
    icon: Cog,
    title: "Methods",
    subtitle: "Simplify Your Systems",
    description: "Streamline processes and establish frameworks that make change sustainable and scalable.",
    color: "gold",
  },
];

const programs = [
  {
    icon: TrendingUp,
    title: "Organizational Change Readiness",
    subtitle: "Assess & Prepare",
    description: "Comprehensive assessments and best practices to evaluate your organization's current state and readiness for transformation.",
    details: "Identify gaps, strengths, and opportunities before embarking on major change initiatives. Get a clear roadmap for success.",
  },
  {
    icon: Shield,
    title: "Become Ready for Change",
    subtitle: "The P.A.T.H. Toolkit",
    description: "A proven framework for execution and adoption that gives your team the tools they need to navigate change successfully.",
    details: "Practical strategies for building buy-in, managing resistance, and sustaining momentum through every phase of transformation.",
  },
  {
    icon: Brain,
    title: "E.Q. Leadership",
    subtitle: "Emotional Intelligence & Resilience",
    description: "Develop the emotional intelligence capabilities that enable leaders to guide their teams through uncertainty with confidence.",
    details: "Build self-awareness, empathy, and relationship management skills that create open expression and trust.",
  },
  {
    icon: Users,
    title: "Team Resilience & Excellence",
    subtitle: "Accountable & Collaborative Teams",
    description: "Transform team dynamics to create accountable, collaborative, and high-performing units ready for any challenge.",
    details: "Practical workshops and ongoing support to build the habits and culture that sustain excellence over time.",
  },
];

const testimonials = [
  {
    quote: "The Painted Porch team helped us build a culture of resilience that has transformed how we approach every challenge.",
    author: "Director of Operations",
    company: "Healthcare Organization",
  },
  {
    quote: "Our team's ability to communicate and collaborate during change has improved dramatically. The results speak for themselves.",
    author: "VP of Human Resources",
    company: "Technology Company",
  },
];

export default function PPSForTeams() {
  return (
    <div>
      {/* Hero Section */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            For Teams & Organizations
          </span>
        }
        headline={<>Most Change Fails.<br /><span className="text-gold">Let's Fix That.</span></>}
        description="Build teams that are resilient, mindful, and mission-focused. Our training and advisory programs create the foundation for lasting organizational change."
        ctas={[
          { label: "Take the Free Assessment", href: "/blue-door", buttonClassName: "bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor", icon: <ArrowRight className="ml-2 w-5 h-5" /> },
          { label: "Contact Us", href: "/contact?scope=organization&interest=workshops&message=I'm interested in team development." },
        ]}
        background={{ type: "image", src: teamsHero }}
        overlayClass="bg-navy/50"
      />

      {/* Pain Points / Stats */}
      <section className="py-12 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {painPoints.map((point, index) => (
              <div key={index} className="p-6">
                <p className="text-4xl md:text-5xl font-bold text-raspberry mb-2">{point.stat}</p>
                <p className="text-foreground font-medium">{point.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Four Pillars */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-strategic/10 text-strategic font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
              Our Framework
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              The Four Pillars of Change-Readiness™
            </h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              Every successful transformation is built on these four foundational pillars. We help your organization master each one.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, index) => {
              const Icon = pillar.icon;
              return (
                <div 
                  key={index} 
                  className={`bg-${pillar.color}/5 border border-${pillar.color}/20 p-6 rounded-xl hover:shadow-lg transition-shadow`}
                >
                  <div className={`w-12 h-12 bg-${pillar.color}/10 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-${pillar.color}`} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-1">{pillar.title}</h3>
                  <p className={`text-sm font-medium text-${pillar.color} mb-3`}>{pillar.subtitle}</p>
                  <p className="text-foreground text-sm leading-relaxed">{pillar.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
              Our Programs
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Team Development Programs
            </h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              Comprehensive training and advisory to prepare your organization for lasting change.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {programs.map((program, index) => {
              const Icon = program.icon;
              return (
                <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy">{program.title}</h3>
                      <p className="text-sm font-medium text-primary">{program.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-foreground mb-4 leading-relaxed">{program.description}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{program.details}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link to="/programs">
              <Button className="bg-primary border-2 border-primary text-white hover:bg-transparent hover:text-primary text-lg py-5 px-8 transition-colors">
                View All Programs <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Philosophy */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block bg-gold/10 text-gold font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
                Our Philosophy
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                Outcomes Over Hours
              </h2>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                We believe in transparent, flat-fee pricing. You'll know exactly what you're investing before we begin — no surprise bills, no scope creep charges. Our focus is on delivering results, not billing hours.
              </p>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                Every engagement begins with a discovery conversation to understand your unique needs and determine the right approach for your organization.
              </p>
              <div className="flex items-center gap-3 p-4 bg-lime/10 rounded-lg">
                <Heart className="w-6 h-6 text-lime flex-shrink-0" />
                <p className="text-foreground font-medium">
                  <span className="text-lime font-semibold">A Virtuous Cycle:</span> 5% of every fee is donated to a charity of your choice.
                </p>
              </div>
            </div>
            <div className="bg-muted p-8 rounded-xl shadow-lg">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-6">
                Start with Discovery
              </h3>
              <p className="text-foreground mb-6">
                A complimentary conversation to understand your situation, explore fit, and discuss potential approaches.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-lime flex-shrink-0" />
                  <span className="text-foreground">30-minute initial conversation</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-lime flex-shrink-0" />
                  <span className="text-foreground">No obligation assessment</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-lime flex-shrink-0" />
                  <span className="text-foreground">Clear next steps and transparent pricing</span>
                </li>
              </ul>
              <Button asChild className="w-full bg-primary border-2 border-primary text-white hover:bg-transparent hover:text-primary text-lg py-5 transition-colors">
                  <Link to="/contact?scope=organization&interest=workshops&message=I'm interested in team development.">Contact Us</Link>
                </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              What Organizations Are Saying
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                <p className="text-lg text-foreground italic mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-navy">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Blue Door CTA */}
      <section className="py-20 md:py-28 bg-gradient-strategic text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Phase Zero Assessment
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Not Sure Where to Start?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            The Blue Door is our Phase Zero assessment tool. In less than 30 minutes, discover which strategic shifts align with your organizational capability and readiness.
          </p>
          <Link to="/blue-door">
            <Button className="bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor text-lg py-5 px-8 shadow-lg transition-colors">
              Take the Blue Door <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
