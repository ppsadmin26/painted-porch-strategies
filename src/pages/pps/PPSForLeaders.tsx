import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Brain, MessageSquare, Users, Target, TrendingUp, Heart, Shield, Zap } from "lucide-react";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import leadersHero from "@/assets/heroes/leaders-hero.jpg";

const painPoints = [
  { icon: Zap, label: "Burnout" },
  { icon: Heart, label: "Disconnect" },
  { icon: Shield, label: "Lack of Control" },
  { icon: TrendingUp, label: "High Stress" },
];

const blueprintOutcomes = [
  "Become resilient, mindful, and capable of handling any challenge or change",
  "Communicate confidently and effectively",
  "Create supportive, connected, and collaborative tribes and teams",
  "Find calm and peace among the chaos life (and work) can sometimes throw at you",
  "Stand strong in your True, Authentic Self",
];

const stats = [
  { value: "69%", label: "of workers are burned out" },
  { value: "+50min", label: "average workday increase" },
  { value: "30%+", label: "adults experienced anxiety or depression" },
  { value: "$1T", label: "global cost of lost productivity" },
];

const programs = [
  {
    icon: Brain,
    title: "Radical Mindfulness",
    subtitle: "Discover Unshakable Resiliency",
    description: "A journey of transformation starts with understanding the beliefs, behaviors, and traits that have defined you and the ways in which you interpret the world.",
    details: "Become a master of your mindset and emotional intelligence (E.Q.) through Mindfulness techniques and Stoic teachings. Learn how to show up mindfully, intentionally, and purposefully, with ways to manage stress, burnout, surprises, obstacles, or changes… with ease.",
  },
  {
    icon: MessageSquare,
    title: "Master Your Message",
    subtitle: "Speak with Clarity and Influence",
    description: "Communication is the #1 skill desired by business leaders around the globe. It's also a skill that can be strengthened, sharpened, and refined through practice.",
    details: "Learn how to craft and deliver confident, clear, and concise messages that inspire action and build alignment. Develop executive presence and stakeholder management skills.",
  },
  {
    icon: Users,
    title: "Create Extraordinary Teams",
    subtitle: "Build Connected, Collaborative Tribes",
    description: "Discover how to understand team dynamics, navigate different 'elemental' styles, and foster healthy conflict that drives innovation.",
    details: "Learn frameworks for building open expression, facilitating productive disagreement, and creating teams that thrive through change together.",
  },
  {
    icon: Target,
    title: "From Vision to Action",
    subtitle: "Design Your Mission for Crystal Clear Direction",
    description: "Transform your vision into a concrete roadmap for fulfillment. Stop spinning your wheels and start moving with purpose.",
    details: "Develop strategic clarity, set aligned goals, and create accountability structures that ensure consistent progress toward what matters most.",
  },
];

const testimonials = [
  {
    quote: "Amy provides what I call mental massages. She offers new ideas and tools for dealing with life stress and boosting productivity.",
    author: "Wayne R.",
    role: "Business Leader",
  },
  {
    quote: "The frameworks and insights have transformed how I lead my team through uncertainty. I feel more grounded and capable than ever.",
    author: "Bruce H.",
    role: "Executive",
  },
  {
    quote: "This work gave me the tools to not just survive change, but to lead it with confidence and authenticity.",
    author: "Cindy Y.",
    role: "Senior Manager",
  },
];

export default function PPSForLeaders() {
  return (
    <div>
      {/* Hero */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-strategic text-white font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            For Leaders
          </span>
        }
        headline={<>Change is Coming.<br /><span className="text-strategic">Prepare to Lead it.</span></>}
        description="Change is never easy. It challenges us to leave behind what we know in pursuit of something new, something unfamiliar. Be prepared for what's next."
        ctas={[
          { label: "Take the Assessment", href: "/contact?scope=Yourself&interest=assessments&message=I'm interested in a leadership assessment.", isPrimary: true, icon: <ArrowRight className="ml-2 w-5 h-5" /> },
          { label: "View Programs", href: "/programs" },
        ]}
        background={{ type: "image", src: leadersHero }}
        overlayClass="bg-navy/50"
      />

      {/* Blueprint for Success */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                Design Your Blueprint for Change Success
              </h2>
              <p className="text-lg text-foreground mb-8">
                Through our Online Training & Coaching Programs you'll discover how to:
              </p>
              <ul className="space-y-4">
                {blueprintOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-strategic flex-shrink-0 mt-0.5" />
                    <span className="text-foreground">{outcome}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/programs">
                  <Button className="bg-primary border-2 border-primary text-white hover:bg-transparent hover:text-primary text-lg py-5 px-8 transition-colors">
                    Get Started <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-muted rounded-2xl p-8">
              <blockquote className="text-xl italic text-navy mb-4">
                "How long are you going to wait before you demand the best for yourself?"
              </blockquote>
              <p className="text-strategic font-semibold">Epictetus</p>
              <p className="text-sm text-muted-foreground mt-1">Stoic teacher & Former slave</p>
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  The Painted Porch draws its name and philosophy from the Stoa Poikile, the painted porch where Stoicism was born over 2,300 years ago.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20 bg-navy">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-strategic font-semibold text-sm uppercase tracking-wider">The Numbers Don't Lie</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2">
              The Time for Change is Now
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center bg-white/5 rounded-xl p-6">
                <div className="text-3xl md:text-4xl font-bold text-strategic mb-2">{stat.value}</div>
                <p className="text-white/80 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-strategic font-semibold text-sm uppercase tracking-wider">Our Programs</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4">
              Build a Foundation for Transformation & Success
            </h2>
            <p className="text-lg text-foreground max-w-3xl mx-auto">
              We help you develop the mindset, communication practices, and collaboration strategies that empower you to not only survive, but thrive in this ever-changing world of life and work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-strategic/10 rounded-lg flex items-center justify-center">
                    <program.icon className="w-6 h-6 text-strategic" />
                  </div>
                  <div>
                    <span className="text-sm text-strategic font-semibold uppercase tracking-wider">{program.title}</span>
                    <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy">{program.subtitle}</h3>
                  </div>
                </div>
                <p className="text-foreground mb-4">{program.description}</p>
                <p className="text-muted-foreground text-sm">{program.details}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/programs">
              <Button className="bg-strategic border-2 border-strategic text-white hover:bg-transparent hover:text-strategic text-lg py-5 px-8 transition-colors">
                Explore All Programs <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-strategic font-semibold text-sm uppercase tracking-wider">Friends of The Porch</span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mt-2">
              What Leaders Are Saying
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-muted p-8 rounded-xl">
                <blockquote className="text-foreground mb-6 italic">
                  "{testimonial.quote}"
                </blockquote>
                <div>
                  <p className="font-semibold text-navy">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Philosophy */}
      <section className="py-16 md:py-24 bg-strategic/5">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                Transparent, Flat-Fee Pricing
              </h2>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                We believe in transparency. Our engagements are priced as flat fees so you know exactly what you're investing before we begin. No surprise bills, no scope creep charges.
              </p>
              <p className="text-lg text-foreground leading-relaxed mb-6">
                Every engagement begins with a discovery conversation to understand your needs and determine the right approach.
              </p>
              <p className="text-lg font-semibold text-lime">
                5% of every fee is donated to a charity of your choice.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-6">
                Start with Discovery
              </h3>
              <p className="text-foreground mb-6">
                A complimentary conversation to understand your situation, explore fit, and discuss potential approaches.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-lime" />
                  <span>30-minute initial conversation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-lime" />
                  <span>No obligation assessment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-lime" />
                  <span>Clear next steps and pricing</span>
                </li>
              </ul>
              <Button asChild className="w-full bg-primary border-2 border-primary text-white hover:bg-transparent hover:text-primary text-lg py-5 transition-colors">
                  <Link to="/contact?scope=Yourself&interest=assessments&message=I'm interested in a leadership assessment.">Contact Us</Link>
                </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Blue Door CTA */}
      <section className="py-16 md:py-24 bg-gradient-strategic text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Phase Zero™ Assessment
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Not Sure Where to Start?
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            The Blue Door is our Phase Zero assessment tool. In less than 30 minutes, discover which strategic shifts align with your organizational capability.
          </p>
          <Link to="/blue-door">
            <Button className="bg-bluedoor border-2 border-bluedoor text-white hover:bg-white hover:text-bluedoor text-lg py-5 px-8 transition-colors">
              Take the Blue Door
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
