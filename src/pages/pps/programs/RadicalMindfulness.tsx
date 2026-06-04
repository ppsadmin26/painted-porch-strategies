import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart, Brain, BookOpen, Users, Star, Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ParallaxCTA } from "@/components/pps/ParallaxCTA";
import LazyHeroVideo from "@/components/pps/LazyHeroVideo";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { FAQSection } from "@/components/pps/FAQSection";
import heroImg from "@/assets/programs/radical-mindfulness-emojis.jpg.asset.json";
import businessCtaImg from "@/assets/programs/radical-mindfulness-business-cta.jpg.asset.json";
import sierraHeadshot from "@/assets/team/sierra-ramm-cantrell.jpg";

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </div>
  );
}

const highlights = [
  { icon: Sparkles, title: "Embrace Your Inner Power", description: "Through mindfulness teaching and tools to ignite your inner strength and resilience to what is out of your control." },
  { icon: Heart, title: "Take Hold of Emotions", description: "From the Stoic philosophy, as well as modern neuroscience, you'll discover new perspectives and approaches to emotional health." },
  { icon: Star, title: "Discover Gratitude & Grace", description: "Find small ways to spark joy, appreciation, and gratitude for yourself and others." },
];

const modules = [
  { title: "Module 1: Your Transformative Journey Begins Now", description: "Begin by looking back to events or periods in your life where transformation appeared, and set your intention for the course." },
  { title: "Module 2: A Stoic Primer", description: "Learn the origins of the Stoic philosophy and how its ancient lessons can guide you toward controlling your emotional perceptions and reactions." },
  { title: "Module 3: The Power of Your Mind", description: "Dive into understanding how powerful the mind is in impacting your perceptions, stories, and actions (or inaction)." },
  { title: "Module 4: The Mind/Body Connection", description: "Learn how the mind can influence your body's response to positive or negative emotions and thoughts." },
  { title: "Module 5: Your Authentic Voice", description: "Learn how to connect with and express your absolute truth." },
  { title: "Module 6: Grow with the Flow", description: "Tap into your Growth Mindset, as well as find and share appreciation and gratitude with yourself and others." },
  { title: "Module 7: From Obstacle to Opportunity", description: "Discover ways to turn perceived problems or roadblocks into new ideas and opportunities." },
  { title: "Module 8: Design a Radically New You", description: "The culmination of your hard work, where you will design your new Blueprint for mindfulness, contentment, and growth." },
];

const programDetails = [
  { icon: BookOpen, title: "Learn", description: "Over 8 hours of on-demand, self-paced videos, exercises, and supporting materials to help you develop emotional resilience and mindfulness, and harness your inner power to take hold of your emotions." },
  { icon: Users, title: "Connect", description: "Through a private, online community you'll connect with Sierra and your fellow students to share ideas on how you can integrate the lessons into your own life — both at home and at work." },
  { icon: Brain, title: "Grow", description: "Attend monthly, live video coaching calls with Sierra (optional, add-on) and fellow students to dive deeper into what you've learned and explore additional insights and methods to expand your knowledge." },
];

const faqs = [
  { q: "How is this online course structured?", a: "The Radical Mindfulness online course is organized into 8 modules, each with about 5–7 lessons. Each video lesson is about 15 minutes or less and includes supporting documentation and action guides to make it stick. Each week, a new module will be released to you; however, go at your own pace and as your schedule allows." },
  { q: "How long will I have access to the course?", a: "You will have lifetime access to the course. Upon purchase, you'll receive an email to access the Painted Porch Academy and any courses or coaching you've purchased or signed up for." },
  { q: "This 14-Day Money Back Guarantee...what's the catch?", a: "There's no catch. If you purchased the Radical Mindfulness program and it's not what you're looking for or expected, simply email us at support@paintedporchstrategies.com within 14 days of your original purchase and we'll refund your payment. No questions asked." },
  { q: "Where is the Private Community located?", a: "Our community is hosted on a private platform called Mighty Networks — a completely private network away from data scraping and advertisers, consisting of only our members. It's free to join and easy to use." },
  { q: "What is Painted Porch Strategies?", a: "We want you to Become the Architect of Your Life. Our teachers and programs show you how to design your own, personal Blueprint for mastering the power of your mind, the confidence of your communications, and the strength of your teams & relationships." },
];

const pricingTiers = [
  {
    name: "Mini-Course",
    price: "$57",
    subtitle: "60 Minutes to Radical Mindfulness",
    features: [
      "Key lessons from Sierra's Radical Mindfulness course (~60 min of learning)",
      "Lifetime Access",
      "7-day 100% Money Back Guarantee",
    ],
    cta: "Purchase Mini-Course",
    popular: false,
  },
  {
    name: "Self-Paced Program",
    price: "$767",
    subtitle: "Complete Program at Your Own Pace",
    features: [
      "Complete Radical Mindfulness program (over 8 hours of On-Demand Video)",
      "Private, Interactive Radical Mindfulness Community",
      "Lifetime Access",
      "14-day 100% Money Back Guarantee",
    ],
    cta: "Purchase Program",
    popular: true,
  },
];

export default function RadicalMindfulness() {
  return (
    <div>
      <PPSBreadcrumb
        segments={[
          { label: "Home", href: "/" },
          { label: "IGNITE", href: "/partner/ignite" },
          { label: "Courses", href: "/partner/ignite/courses" },
          { label: "Radical Mindfulness" },
        ]}
      />
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <LazyHeroVideo
            slotKey="radical-mindfulness"
            posterUrl={heroImg.url}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <span className="inline-block text-pps-gold font-poppins font-semibold text-sm tracking-widest uppercase mb-4">
            From Overwhelm to Om
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-6">
            Radical Mindfulness
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed mb-8">
            Tap into your <strong>inner power</strong> to <strong>take control of your emotions</strong>, find{" "}
            <strong>peace among the obstacles</strong> in life and work, and <strong>build up emotional resilience</strong>{" "}
            to what's outside of your control.
          </p>
          <Button asChild size="lg" className="bg-pps-orange hover:bg-pps-orange/90 text-white font-poppins font-semibold rounded-lg px-8">
            <a href="#pricing">Join the Program <ArrowRight className="ml-2 h-5 w-5" /></a>
          </Button>
        </div>
      </section>

      {/* Problem Statement */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-pps-orange mb-6">
              Stress. Emotional Ups & Downs. Lack of Control.
            </h2>
            <p className="text-lg text-charcoal leading-relaxed">
              Each of these (and more) can empty your emotional and energetic energy tanks, sapping you from showing up fully, authentically, and in control.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Highlights */}
      <AnimatedSection>
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-navy text-center mb-4">
              During our Radical Mindfulness program, you'll discover ways to:
            </h3>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              {highlights.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.title} className="bg-white rounded-2xl border border-border p-8 text-center hover:shadow-lg transition-shadow">
                    <div className="w-16 h-16 bg-pps-lime/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-8 w-8 text-pps-lime" />
                    </div>
                    <h4 className="text-base md:text-lg font-poppins font-bold text-pps-navy mb-3">{h.title}</h4>
                    <p className="text-charcoal text-sm leading-relaxed">{h.description}</p>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-12">
              <Button asChild size="lg" className="bg-pps-orange hover:bg-pps-orange/90 text-white font-poppins font-semibold rounded-lg px-8">
                <a href="#pricing">Join the Program <ArrowRight className="ml-2 h-5 w-5" /></a>
              </Button>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* What is Radical Mindfulness? */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-pps-navy mb-6">
              What is Radical Mindfulness?
            </h2>
            <p className="text-lg text-charcoal leading-relaxed">
              At the Painted Porch, <strong>we like to do things a little differently</strong>. You'll be up and moving, participating fully in mind, body, heart, and spirit — <strong>intentionally</strong>; and <strong>actively making decisions</strong> about how to show up as your authentic self — who you want and <em>choose</em> to be — and <strong>how to make that happen</strong>.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Program Outline */}
      <section className="py-20 bg-pps-navy text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4">
                Program Outline & Approach
              </h2>
              <p className="text-lg text-white/80 max-w-3xl mx-auto">
                This program is grouped into <strong>8 Modules</strong> delivered over <strong>6 Weeks</strong>{" "}
                (<em>8 hours of on-demand content!</em>), and includes lessons and exercises for you to watch and reflect on.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-12">
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-gold mb-4">Watch. Reflect. Discuss.</h3>
              <p className="text-white/80 leading-relaxed">
                We believe that <strong>real learning and transformation is not a spectator sport</strong>. Through per-lesson discussion boards and a <strong>Private Community</strong>, <strong>PLUS Monthly, Live Group Video Calls</strong> <em>(optional, add-on)</em>, you can connect with Sierra and your fellow "Mindful Radicals" to share your takeaways, insights, ah-has, and more to shift from knowing to <strong>doing</strong> and <strong>becoming</strong>.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-4">
            {modules.map((mod, i) => (
              <AnimatedSection key={mod.title}>
                <div className="bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-colors">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-10 h-10 rounded-full bg-pps-gold/20 text-pps-gold font-poppins font-bold text-sm flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <h4 className="text-base md:text-lg font-poppins font-semibold text-white mb-2">{mod.title}</h4>
                      <p className="text-white/70 text-sm leading-relaxed">{mod.description}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="bg-pps-orange hover:bg-pps-orange/90 text-white font-poppins font-semibold rounded-lg px-8">
              <a href="#pricing">Join the Program <ArrowRight className="ml-2 h-5 w-5" /></a>
            </Button>
          </div>
        </div>
      </section>

      {/* Program Details: Learn, Connect, Grow */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-pps-navy text-center mb-16">
              Program Details
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {programDetails.map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.title} className="text-center">
                    <div className="w-20 h-20 bg-pps-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-10 w-10 text-pps-teal" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-navy mb-4">{d.title}</h3>
                    <p className="text-charcoal leading-relaxed">{d.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* About Sierra */}
      <AnimatedSection>
        <section className="py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border border-border p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
                <img
                  src={sierraHeadshot}
                  alt="Sierra Ramm Cantrell, Chief Joy Officer at Painted Porch Strategies"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover flex-shrink-0 shadow-md"
                />
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-navy mb-2">
                    Hi! I'm Sierra, your Painted Porch Guide!
                  </h3>
                  <p className="text-pps-gold font-poppins font-semibold text-sm mb-6">
                    Sierra Ramm Cantrell · Chief Joy Officer
                  </p>
                  <p className="text-charcoal leading-relaxed mb-6">
                    Middle of the road is for painted lines…I'm that zany, madcap person in your life who makes animal noises, breaks out into song, and will help you balance your energy. I've taught yoga for 10+ years, traveled all 50 states, and as an early childhood development guide and mom, my true life purpose is to help everyone I cross paths with lead a more joyful, authentic life.
                  </p>
                  <Button asChild variant="outline" className="border-pps-teal text-pps-teal hover:bg-pps-teal/10 font-poppins font-semibold rounded-lg">
                    <Link to="/sierra">More About Sierra <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-4">
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-pps-navy mb-4">
                Pricing
              </h2>
              <p className="text-lg text-charcoal max-w-2xl mx-auto leading-relaxed">
                Choose the option that fits your journey.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8 mt-12 items-stretch">
            {pricingTiers.map((tier) => (
              <AnimatedSection key={tier.name} className="h-full">
                <div className={`h-full flex flex-col rounded-2xl border-2 p-8 relative ${tier.popular ? "border-pps-teal shadow-lg" : "border-border"}`}>
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pps-teal text-white text-xs font-poppins font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-navy mb-1">{tier.name}</h3>
                  <p className="text-4xl font-poppins font-bold text-pps-navy mb-2">{tier.price}</p>
                  <p className="text-sm text-charcoal mb-6">{tier.subtitle}</p>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-charcoal">
                        <Check className="h-4 w-4 text-pps-lime flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className={`w-full mt-auto font-poppins font-semibold rounded-lg ${tier.popular ? "bg-pps-teal hover:bg-pps-teal/90 text-white" : "bg-pps-navy hover:bg-pps-navy/90 text-white"}`}>
                    <Link to="/contact?scope=Yourself&interest=self-paced&message=I'm interested in the Radical Mindfulness program.">{tier.cta}</Link>
                  </Button>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <AnimatedSection>
        <FAQSection
          tierName="Radical Mindfulness"
          subheadline="Everything you need to know about the Radical Mindfulness course"
          faqs={faqs.map((f) => ({ question: f.q, answer: f.a }))}
        />
      </AnimatedSection>

      {/* Virtuous Cycle */}
      <AnimatedSection>
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-navy mb-4">A Virtuous Cycle</h3>
            <p className="text-charcoal leading-relaxed mb-4">
              Painted Porch Strategies was created to model the Stoic principles of <em>Reason, Logic, Purpose, and Virtue</em>.
              Since we intend to live by the Stoic philosopher Seneca's advice of "<em>works not words</em>", we believe that in order{" "}
              <strong>to do <em>well</em></strong>, we must also <strong>do <em>good</em></strong>.
            </p>
            <p className="text-pps-teal font-poppins font-bold text-lg">
              5% of your purchase will be donated to charity.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Business CTA */}
      <ParallaxCTA
        backgroundImage={businessCtaImg.url}
        overlayTone="purple"
        headline="Interested in Radical Mindfulness for your Business?"
        description="Bring mindfulness and emotional resilience training to your teams. Explore our business programs to create a foundation for lasting organizational transformation."
        actions={[{ label: "Contact Us", to: "/contact", variant: "primary" }]}
      />
    </div>
  );
}
