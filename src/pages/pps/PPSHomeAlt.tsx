import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Target, Lightbulb, Settings } from "lucide-react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";

const pillars = [
  {
    icon: Lightbulb,
    title: "Mindset",
    subtitle: "Grit & Resiliency",
    description: "Build the mental fortitude needed to lead through uncertainty and change.",
    color: "text-strategic",
    bgColor: "bg-strategic/10",
  },
  {
    icon: Target,
    title: "Messaging",
    subtitle: "Communication",
    description: "Craft clear, compelling narratives that align teams and stakeholders.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Users,
    title: "Mission",
    subtitle: "Growth Ready",
    description: "Define purpose-driven direction that inspires action and commitment.",
    color: "text-lime",
    bgColor: "bg-lime/10",
  },
  {
    icon: Settings,
    title: "Methods",
    subtitle: "Systems & Processes",
    description: "Implement sustainable systems that support lasting transformation.",
    color: "text-gold",
    bgColor: "bg-gold/10",
  },
];

const stats = [
  { value: "74%", label: "of change initiatives fail without proper preparation" },
  { value: "2.5x", label: "more revenue for highly engaged organizations" },
  { value: "Phase Zero™", label: "The strategic work before the work begins" },
];

export default function PPSHomeAlt() {
  useDocumentSeo({
    title: "Home (Alt Archive) | Painted Porch Strategies",
    description: "Archived alternate home page kept for internal reference.",
    robots: "noindex, nofollow",
  });
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-navy via-navy to-strategic py-20 md:py-28">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
              Change-Ready Leadership
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Building Change-Ready Leaders and Teams Through Stoic Principles
            </h1>
            <p className="text-lead md:text-xl text-white/90 mb-8 leading-relaxed">
              Most transformation fails before it starts. We help you build the foundation for lasting change through Phase Zero, the strategic preparation that makes implementation possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/for-leaders">
                <Button className="bg-primary border-2 border-primary text-white hover:bg-white hover:text-primary text-lg py-5 px-8 transition-colors">
                  For Leaders <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/for-teams">
                <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-navy text-lg py-5 px-8 transition-colors">
                  For Teams <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Stats Section */}
      <section className="py-12 bg-muted">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <p className="text-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Four Pillars */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="badge-gold mb-4 inline-block">The Painted Porch Pillars</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Four Pillars of Change-Readiness
            </h2>
            <p className="text-lead text-foreground max-w-2xl mx-auto">
              Every successful transformation rests on these four foundational elements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillars.map((pillar, index) => (
              <div
                key={index}
                className={`${pillar.bgColor} p-6 rounded-xl transition-all hover:shadow-lg`}
              >
                <pillar.icon className={`w-10 h-10 ${pillar.color} mb-4`} />
                <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-1">
                  {pillar.title}
                </h3>
                <p className={`text-sm font-medium ${pillar.color} mb-3`}>
                  {pillar.subtitle}
                </p>
                <p className="text-foreground text-body-sm leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Phase Zero CTA */}
      <section className="py-16 md:py-24 bg-gradient-strategic text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Phase Zero
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            The Strategic Work Before the Work
          </h2>
          <p className="text-lead text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Implementation comes last. Before you can transform your organization, you need to assess readiness, build alignment, and architect the path forward. That's Phase Zero.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/blue-door">
              <Button className="bg-primary border-2 border-primary text-white hover:bg-white hover:text-primary text-lg py-5 px-8 transition-colors">
                Take the Blue Door
              </Button>
            </Link>
            <Link to="/contact?interest=general">
              <Button className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-navy text-lg py-5 px-8 transition-colors">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              How We Help
            </h2>
            <p className="text-lead text-foreground max-w-2xl mx-auto">
              From individual leadership coaching to enterprise-wide team development.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-muted p-8 rounded-xl">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-3">
                Learning
              </h3>
              <p className="text-foreground mb-4">
                Self-paced courses and resources to build change-readiness skills at your own pace.
              </p>
              <Link to="/programs" className="text-primary font-semibold hover:underline">
                Explore Programs →
              </Link>
            </div>

            <div className="bg-muted p-8 rounded-xl">
              <div className="w-12 h-12 bg-strategic/20 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-strategic" />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-3">
                Coaching
              </h3>
              <p className="text-foreground mb-4">
                One-on-one executive coaching to develop your leadership capacity for change.
              </p>
              <Link to="/services#coaching" className="text-primary font-semibold hover:underline">
                Learn More →
              </Link>
            </div>

            <div className="bg-muted p-8 rounded-xl">
              <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-gold" />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-3">
                Advisory
              </h3>
              <p className="text-foreground mb-4">
                Strategic advisory services for organizations planning significant transformation.
              </p>
              <Link to="/services#advisory" className="text-primary font-semibold hover:underline">
                Get Started →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
