import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, BookOpen, Users, Brain, Briefcase, Home, BookOpenCheck, ArrowRight } from "lucide-react";
import { TierBadge, TIERS } from "@/components/pps/TierBadge";

const programs = [
  {
    icon: Brain,
    title: "Radical Mindfulness",
    category: "Mindset",
    description: "Build the mental resilience and clarity needed to lead through uncertainty. Combine ancient Stoic practices with modern mindfulness techniques.",
    features: ["Self-paced modules", "Guided meditation exercises", "Leadership application frameworks"],
    color: "bg-strategic/10",
    iconColor: "text-strategic",
  },
  {
    icon: BookOpen,
    title: "Master Your Message",
    category: "Communication",
    description: "Develop the skills to craft compelling narratives that align stakeholders and inspire action. Learn the architecture of persuasive communication.",
    features: ["Message design templates", "Storytelling frameworks", "Presentation skills development"],
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: Users,
    title: "Extraordinary Teams",
    category: "Team Development",
    description: "Transform your team's dynamics and performance. Build open expression, improve collaboration, and develop shared accountability.",
    features: ["Team assessment tools", "Collaboration exercises", "Performance metrics"],
    color: "bg-lime/10",
    iconColor: "text-lime",
  },
  {
    icon: Briefcase,
    title: "EQ Leadership",
    category: "Emotional Intelligence",
    description: "Develop the emotional intelligence competencies that distinguish exceptional leaders. Build self-awareness, empathy, and relationship management skills.",
    features: ["EQ assessment", "Self-regulation techniques", "Relationship building strategies"],
    color: "bg-gold/10",
    iconColor: "text-gold",
  },
  {
    icon: Home,
    title: "Work-From-Home Pro",
    category: "Remote Excellence",
    description: "Master the unique challenges and opportunities of remote and hybrid work. Build systems for productivity, connection, and work-life integration.",
    features: ["Productivity systems", "Virtual collaboration tools", "Boundary management"],
    color: "bg-raspberry/10",
    iconColor: "text-raspberry",
  },
  {
    icon: BookOpenCheck,
    title: "Stoicism Beginner's Guide",
    category: "Foundation",
    description: "An introduction to Stoic philosophy and its application to modern leadership. Learn the foundational principles that guide all our work.",
    features: ["Core philosophy overview", "Practical exercises", "Daily practices"],
    color: "bg-navy/10",
    iconColor: "text-navy",
  },
];

const features = [
  "On-demand video courses",
  "Downloadable templates & frameworks",
  "Self-assessment tools",
  "Community forum access",
  "Email support",
  "Progress tracking",
];

export default function IgnitePath() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-navy py-16 md:py-24">
        <div className="container max-w-6xl mx-auto px-6">
        <div className="max-w-3xl">
            <TierBadge tier={TIERS.IGNITE} className="mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Self-Led Learning for Change-Ready Leaders
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              Build your change-readiness skills at your own pace with our signature programs. Each program combines timeless Stoic principles with practical modern application.
            </p>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-12 bg-gold/10">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-navy mb-4">What's Included in IGNITE</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-sm text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Available Programs
            </h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              Choose the programs that match your development goals.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div key={index} className={`${program.color} p-8 rounded-xl transition-all hover:shadow-lg`}>
                <program.icon className={`w-12 h-12 ${program.iconColor} mb-4`} />
                <span className={`text-sm font-medium ${program.iconColor}`}>
                  {program.category}
                </span>
                <h3 className="font-poppins font-semibold text-xl text-navy mt-2 mb-3">
                  {program.title}
                </h3>
                <p className="text-foreground mb-6 text-sm leading-relaxed">
                  {program.description}
                </p>
                <ul className="space-y-2">
                  {program.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-foreground/50" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Upgrade Path */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            Ready for More?
          </h2>
          <p className="text-lg text-foreground mb-8 max-w-2xl mx-auto">
            Upgrade to AMPLIFY for live workshops and expert facilitation, or EMBODY for embedded advisory support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/partner/amplify">
              <Button className="bg-primary border-2 border-primary text-white hover:bg-transparent hover:text-primary transition-colors">
                Explore Amplify <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/partner-with-us">
              <Button className="bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors">
                Compare All Paths
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gradient-strategic text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Start Your IGNITE Journey
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Get started with self-paced learning today.
          </p>
          <Link to="/contact?scope=Yourself&interest=self-paced&message=I'm interested in IGNITE self-paced learning.">
            <Button className="bg-gold border-2 border-gold text-white hover:bg-white hover:text-gold text-lg py-5 px-8 transition-colors">
              Get Started
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
