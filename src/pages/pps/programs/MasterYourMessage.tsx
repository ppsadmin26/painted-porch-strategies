import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mic, MessageSquare, HelpCircle, BookOpen, Users, Brain, Check } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { FAQSection } from "@/components/pps/FAQSection";
import { ParallaxCTA } from "@/components/pps/ParallaxCTA";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import heroImg from "@/assets/programs/master-your-message-hero.jpg";
import mymCtaImg from "@/assets/programs/master-your-message.jpg";
import robHeadshot from "@/assets/team/rob-hunter.jpg";

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </div>
  );
}

const highlights = [
  { icon: Mic, title: "Eliminate Internal Static", description: "Assess your mind's inner dialogue and its power in controlling how and what is said — to yourself and others." },
  { icon: MessageSquare, title: "Prepare for Impact", description: "Understand how the power of language (spoken and non-verbal), word choice, and mood impacts the messages being broadcast." },
  { icon: HelpCircle, title: "Harness the Power of Why", description: "Master the message and art of effective inquiry to maximize influence, clarity, and confidence for success." },
];

const modules = [
  { title: "Module 1: Mind Playing Tricks on Me", description: "Begin by examining your internal communication — how you speak to yourself — to identify the 'static' that is interfering with speaking in and from your true voice." },
  { title: "Module 2: The Way We Talk", description: "Learn about the ways in which you talk to others — how emotions impact where you communicate from, how the words you use can impact your message, and core communication style." },
  { title: "Module 3: Stop, Collaborate & Listen", description: "Dive into the power of listening FIRST and explore ways to eliminate distractions or barriers to being fully present when communicating." },
  { title: "Module 4: Tell Me Why", description: "Learn about the power of Questions — how to ask, what to ask — and how curiosity can lead to incredible ideas and solutions." },
  { title: "Module 5: Da Art of Storytellin'", description: "Explore the elements of what makes a great story and learn how to craft compelling narratives." },
  { title: "Module 6: Breaking Down Barriers", description: "Discuss common communication barriers: judgment and disputes. Both can become major roadblocks to effective communication." },
  { title: "Module 7: Breakin' Old Habits", description: "Bring awareness to and then reduce or eliminate poor speaking habits (\"um's, ah's, so's, like's\", etc.)." },
  { title: "Module 8: The Blueprint", description: "The culmination of your hard work, where you will design your new Blueprint for Mastering Your Messaging and communicating with confidence, clarity, and influence." },
];

const programDetails = [
  { icon: BookOpen, title: "Learn", description: "Over 8 hours of lessons, exercises, and supporting materials to help you develop communication, presentation, and meeting skills to promote clarity and consistency of message, confident delivery, and effective collaboration." },
  { icon: Users, title: "Connect", description: "Through a private, online community you'll connect with Rob and your fellow students to share ideas on how you can integrate the lessons into your own life — both at home and at work." },
  { icon: Brain, title: "Grow", description: "Attend monthly, live video coaching calls with Rob (optional, add-on) and fellow students to dive deeper into what you've learned and explore additional insights and methods to expand your knowledge and grow in your practice." },
];

const pricingTiers = [
  {
    name: "Self-Paced Program",
    price: "$697",
    subtitle: "Go at Your Own Pace",
    features: [
      "Private, Interactive Community",
      "On-Demand Video Lessons & Exercises (8+ hrs.)",
      "Lifetime Access",
      "14-day 100% Money Back Guarantee",
    ],
    cta: "Purchase Program",
    popular: true,
  },
];

const faqs = [
  { q: "How is this online course structured?", a: "The Master Your Message online course is organized into 8 modules, each with about 5 lessons. Each video lesson is about 20 minutes or less and includes supporting documentation and action guides to make it stick. Each week, a new module will be released to you; however, go at your own pace and as your schedule allows." },
  { q: "How long will I have access to the course?", a: "You will have lifetime access to the course. Upon purchase, you'll receive an email to access the Painted Porch Academy and any courses or coaching you've purchased or signed up for." },
  { q: "This 14-Day Money Back Guarantee...what's the catch?", a: "There's no catch. If you purchased the Master Your Message program and it's not what you're looking for or expected, simply reach out to us through our <a href='/contact' class='text-pps-teal underline'>contact page</a> within 14 days of your original purchase and we'll refund your payment. No questions asked." },
  { q: "Where is the Private Community located?", a: "Our community is hosted on a private platform called Mighty Networks — a completely private network away from data scraping and advertisers, consisting of only our members. It's free to join and easy to use." },
  { q: "What is Painted Porch Strategies?", a: "We want you to Become the Architect of Your Life. Our teachers and programs show you how to design your own, personal Blueprint for mastering the power of your mind, the confidence of your communications, and the strength of your teams & relationships." },
];

export default function MasterYourMessage() {
  return (
    <div>
      <PPSBreadcrumb
        segments={[
          { label: "Home", href: "/" },
          { label: "IGNITE", href: "/partner/ignite" },
          { label: "Courses", href: "/partner/ignite/courses" },
          { label: "Master Your Message" },
        ]}
      />
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Master Your Message" className="w-full h-full object-cover" width={1920} height={800} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <span className="inline-block text-pps-gold font-poppins font-semibold text-sm tracking-widest uppercase mb-4">
            Ignite Your True Voice
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-6">
            Master Your Message
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed mb-8">
            <strong>Eliminate the static</strong> from your internal and external messaging in order to{" "}
            <strong>communicate with clarity</strong>, <strong>confidence</strong>, and <strong>influence</strong>.
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
              Communication is one of your most impactful, yet least practiced, skills.
            </h2>
            <p className="text-lg text-charcoal leading-relaxed">
              Words have tremendous power — what we say, how, when. They can <strong>Inspire</strong>. They can <strong>Incite</strong>. They can <strong>Be Ignored</strong>. Understanding how to <strong>best deliver a message</strong> — <strong>tone</strong>, <strong>language</strong>, <strong>presentation</strong> and <strong>state</strong> — can have a transformative effect on the ability to <strong>lead</strong> and best <strong>share ideas</strong> and insights.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Highlights */}
      <AnimatedSection>
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-navy text-center mb-12">
              During our Master Your Message program, you'll discover ways to:
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {highlights.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.title} className="bg-white rounded-2xl border border-border p-8 text-center hover:shadow-lg transition-shadow">
                    <div className="w-16 h-16 bg-pps-purple/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-8 w-8 text-pps-purple" />
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

      {/* What is Master Your Message? */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-pps-navy mb-6">
              What is Master Your Message?
            </h2>
            <p className="text-lg text-charcoal leading-relaxed">
              At the Painted Porch, <strong>we like to do things a little differently</strong>. You will be <strong>up and moving</strong>, participating fully in mind, body, heart, and spirit — <strong>intentionally</strong>. You'll be <strong>actively evaluating</strong> and <strong>practicing</strong> how to communicate in your true voice — the voice that is <strong>confident</strong>, <strong>clear</strong>, <strong>rational</strong>, and <strong>effective</strong>.
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
                <strong>Set Your Path for Communication Mastery!</strong> This program is grouped into{" "}
                <strong>8 Modules</strong> delivered over <strong>6 Weeks</strong> (<em>8 hours of on-demand content!</em>).
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-12">
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-gold mb-4">Watch. Reflect. Discuss.</h3>
              <p className="text-white/80 leading-relaxed">
                We believe that <strong>real learning and transformation is not a spectator sport</strong>. Through per-lesson discussion boards and a <strong>Private Community</strong>, <strong>PLUS Monthly, Live Group Video Coaching Calls</strong> <em>(optional, add-on)</em>, you can connect with Rob and your fellow M.C.s (<em>Masters of Communication</em>) in the making to share your takeaways, insights, ah-has, and more to shift from knowing to <strong>doing</strong> and <strong>becoming</strong>.
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

      {/* Program Details */}
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

      {/* About Rob */}
      <AnimatedSection>
        <section className="py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border border-border p-8 md:p-12">
              <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
                <img
                  src={robHeadshot}
                  alt="Rob Hunter, Master of Communication at Painted Porch Strategies"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover flex-shrink-0 shadow-md"
                />
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-navy mb-2">
                    Hi! I'm Rob, your Painted Porch Guide!
                  </h3>
                  <p className="text-pps-gold font-poppins font-semibold text-sm mb-6">
                    Rob Hunter · M.C. (Master of Communication)
                  </p>
                  <p className="text-charcoal leading-relaxed mb-6">
                    Hi, I'm Rob. And I love words. Not just any words, though…ones that create connection and meaningful, lasting impact. Over my 25+ yr. career as a radio broadcaster, I've learned that communication is the most important — yet underrated — skill. When you communicate effectively, you will master your influence and inspire others.
                  </p>
                  <Button asChild variant="outline" className="border-pps-teal text-pps-teal hover:bg-pps-teal/10 font-poppins font-semibold rounded-lg">
                    <Link to="/rob">More About Rob <ArrowRight className="ml-2 h-4 w-4" /></Link>
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

          <div className="grid md:grid-cols-1 gap-8 mt-12 max-w-lg mx-auto">
            {pricingTiers.map((tier) => (
              <AnimatedSection key={tier.name}>
                <div className={`rounded-2xl border-2 p-8 relative ${tier.popular ? "border-pps-teal shadow-lg" : "border-border"}`}>
                  {tier.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-pps-teal text-white text-xs font-poppins font-bold uppercase tracking-wider px-4 py-1 rounded-full">
                      Best Value
                    </span>
                  )}
                  <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-navy mb-1">{tier.name}</h3>
                  <div className="flex items-baseline gap-2 mb-2">
                    <p className="text-4xl font-poppins font-bold text-pps-navy">{tier.price}</p>
                  </div>
                  <p className="text-sm text-charcoal mb-6">{tier.subtitle}</p>
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-charcoal">
                        <Check className="h-4 w-4 text-pps-lime flex-shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button asChild className={`w-full font-poppins font-semibold rounded-lg ${tier.popular ? "bg-pps-teal hover:bg-pps-teal/90 text-white" : "bg-pps-navy hover:bg-pps-navy/90 text-white"}`}>
                    <Link to="/contact?scope=Yourself&interest=self-paced&message=I'm interested in the Master Your Message program.">{tier.cta}</Link>
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
          tierName="Master Your Message"
          subheadline="Everything you need to know about the Master Your Message program."
          faqs={faqs.map((f) => ({ question: f.q, answer: <span dangerouslySetInnerHTML={{ __html: f.a }} /> }))}
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
      <section className="py-20 bg-pps-navy text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-6">
            Interested in Master Your Message for your Business?
          </h2>
          <p className="text-lg text-white/80 leading-relaxed mb-8">
            Bring communication mastery training to your teams. Explore our business programs to build confident, clear, and influential communicators across your organization.
          </p>
          <Button asChild size="lg" className="bg-pps-gold hover:bg-pps-gold/90 text-pps-navy font-poppins font-semibold rounded-lg px-8">
            <Link to="/business-programs">Explore Business Programs <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
