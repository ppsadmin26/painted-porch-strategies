import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Puzzle, Target, BookOpen, Users, Brain, Check, Bell } from "lucide-react";
import { CourseLaunchListDialog } from "@/components/pps/CourseLaunchListDialog";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { FAQSection } from "@/components/pps/FAQSection";
import heroImg from "@/assets/programs/extraordinary-teams-hero.jpg";
import ctaBg from "@/assets/team/team-cta-puzzles.jpg";
import amyPhoto from "@/assets/team/amy-yackowski.png";
import { ParallaxCTA } from "@/components/pps/ParallaxCTA";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";

function AnimatedSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, isVisible } = useScrollAnimation({ threshold: 0.1 });
  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${className}`}>
      {children}
    </div>
  );
}

const highlights = [
  { icon: Shield, title: "Develop Healthy Conflict", description: "Tackle assumptions, frustrations, disagreements, and misalignments using rational, logical, and practical methods for conflict resolution." },
  { icon: Puzzle, title: "Define the Elements of a Team", description: "Learn each team member's Elemental style that — when healthy — can overcome any obstacle that arises; but, when stressed, can turn Hero into Villain." },
  { icon: Target, title: "Design a Blueprint for Success", description: "Establish a clear, mission-focused, and aligned operating model so each team member can contribute and succeed." },
];

const modules = [
  { title: "Module 1: The State of Your (Team) Union", description: "Begin by doing a quick assessment of the health of your team. This serves as a way to set the baseline for team growth." },
  { title: "Module 2: The Mind of Your Team", description: "Dive deeper into how you and your team thinks — and what presumptions, frustrations, and habits tend to interfere with team excellence." },
  { title: "Module 3: Team Motivation", description: "Understand what motivates (and de-motivates) your team; what and how your personal values and beliefs influence team dynamics." },
  { title: "Module 4: Get in Your Element", description: "Learn about your own core elemental style, as well as those of your team members. Each 'element' has traits where you can shine, and others that can dull performance." },
  { title: "Module 5: Conflict is NOT a 4-Letter Word", description: "Explore how to turn conflict into constructive debate and decision making." },
  { title: "Module 6: Trusty Teams", description: "Dive into ways to build trust and accountability within your teams." },
  { title: "Module 7: The Obstacle is the Way", description: "Discover ways to turn perceived problems or roadblocks into new ideas and opportunities." },
  { title: "Module 8: A Treaty for Teamwork", description: "The culmination of your hard work, where you will design your new Team Blueprint for connection, collaboration, and growth." },
];

const programDetails = [
  { icon: BookOpen, title: "Learn", description: "Over 8 hours of on-demand, self-paced videos, exercises, and supporting materials to help you develop strong connections and mission-focused, aligned teams." },
  { icon: Users, title: "Connect", description: "Through a private, online community you'll connect with Amy and your fellow students to share ideas on how you can integrate the lessons into your own life — both at home and at work." },
  { icon: Brain, title: "Grow", description: "Attend monthly, live video coaching calls with Amy (optional, add-on) and fellow students to dive deeper into what you've learned and explore additional insights and methods to expand your knowledge and grow in your people dynamics." },
];

const pricingTiers = [
  {
    name: "Self-Paced Bundle",
    price: "$1,297",
    subtitle: "Go at Your Own Pace",
    features: [
      "Access to Master Your Message, Radical Mindfulness, and Create Extraordinary Teams",
      "Private, Interactive Communities",
      "On-Demand Video Lessons & Exercises (over 24 hrs of content)",
      "Lifetime Access",
      "45-day 100% Money Back Guarantee",
    ],
    cta: "Purchase Bundle",
    popular: true,
  },
];

const faqs = [
  { question: "How is this online course bundle structured?", answer: "This bundle includes key lessons from our THREE signature, on-demand programs: Radical Mindfulness, Master Your Message, and Create Extraordinary Teams. Each program contains about 8 hours of video lessons and supporting workbook exercises. Each lesson is about 20 minutes or less in length with action guides. You'll start with Master Your Message, then Radical Mindfulness, then Create Extraordinary Teams." },
  { question: "How long will I have access to the course?", answer: "You will have lifetime access to the courses included in this bundle. Upon purchase, you'll receive an email to access the Painted Porch Academy." },
  { question: "This 45-Day Money Back Guarantee...what's the catch?", answer: "There's no catch. If you purchased the course bundle and it's not what you're looking for or expected, simply <a href='/refund-request' class='text-pps-teal underline'>submit a refund request</a> within 45 days and we'll process your refund promptly. No questions asked." },
  { question: "Where are the Private Communities located?", answer: "Our communities are hosted on Go High Level (our course platform), a completely private network away from data scraping and advertisers, consisting of only our members. It's free to join and easy to use." },
  { question: "What is Painted Porch Strategies?", answer: "Painted Porch Strategies is a partnership for leaders and teams ready to design real, lasting change. We guide you through Phase Zero, the strategic thinking that happens before a project kicks off, so the change you build is the one you actually want to lead. Through our P.A.T.H. approach (Prepare, Align, Take Off, Habit) and The Painted Porch Pillars, we co-design the leadership, systems, and human capacity that turn good intentions into extraordinary outcomes." },
];

export default function ExtraordinaryTeams() {
  const [launchOpen, setLaunchOpen] = useState(false);
  return (
    <div>
      <CourseLaunchListDialog
        open={launchOpen}
        onOpenChange={setLaunchOpen}
        courseName="Create Extraordinary Teams"
        courseSlug="extraordinary-teams"
      />

      <PPSBreadcrumb
        segments={[
          { label: "Home", href: "/" },
          { label: "IGNITE", href: "/partner/ignite" },
          { label: "Courses", href: "/partner/ignite/courses" },
          { label: "Create Extraordinary Teams" },
        ]}
      />
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Create Extraordinary Teams" className="w-full h-full object-cover" width={1920} height={800} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <span className="inline-block text-pps-gold font-poppins font-semibold text-sm tracking-widest uppercase mb-4">
            From Conflict to Connection
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-6">
            Create Extraordinary Teams
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed mb-8">
            Better <strong>connect</strong>, <strong>collaborate</strong>, and <strong>handle conflict</strong> with your fellow humans — with the teams and people you interact with both at work and in life.
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
              People + Diverse Ideas = Conflict.
            </h2>
            <p className="text-lg text-charcoal leading-relaxed">
              Whenever you're <strong>collaborating</strong> with other people, <strong>conflict</strong> can and most likely <strong>will arise</strong>. Whether a <em>team</em> equals your work colleagues, your family, your friends, or others, creating an <strong>extraordinary team where healthy conflict thrives</strong> means learning how to become an Extraordinary Team member.
            </p>
          </div>
        </section>
      </AnimatedSection>

      {/* Highlights */}
      <AnimatedSection>
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-navy text-center mb-12">
              During our Create Extraordinary Teams program, you'll discover ways to:
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              {highlights.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.title} className="bg-white rounded-2xl border border-border p-8 text-center hover:shadow-lg transition-shadow">
                    <div className="w-16 h-16 bg-pps-raspberry/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-8 w-8 text-pps-raspberry" />
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

      {/* What is Create Extraordinary Teams? */}
      <AnimatedSection>
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-pps-navy mb-6">
              How to Create Extraordinary Teams
            </h2>
            <p className="text-lg text-charcoal leading-relaxed">
              At the Painted Porch, <strong>we like to do things a little differently</strong>. You'll be <strong>up and moving</strong>, participating fully in mind, body, heart, and spirit — <strong>intentionally</strong>; and <strong>actively making decisions</strong> about how to approach and resolve conflict, overcome obstacles as a team unit, and design a blueprint for <strong>how to make that happen</strong>.
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
                This program is grouped into <strong>8 Modules</strong> delivered over <strong>6 Weeks</strong> (<em>8 hours of on-demand content!</em>).
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-white/5 rounded-2xl border border-white/10 p-8 mb-12">
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-gold mb-4">Watch. Reflect. Discuss.</h3>
              <p className="text-white/80 leading-relaxed">
                We believe that <strong>real learning and transformation is not a spectator sport</strong>. Through per-lesson discussion boards and a <strong>Private Community</strong>, <strong>PLUS Monthly, Live Group Video Coaching Calls</strong> <em>(optional, add-on)</em>, you can connect with us and your fellow "Extraordinary Team" members to share your takeaways, insights, ah-has, and more to shift from knowing to <strong>doing</strong> and <strong>becoming</strong>.
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

      {/* About Amy */}
      <AnimatedSection>
        <section className="py-20 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-2xl border border-border p-8 md:p-12">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <img
                  src={amyPhoto}
                  alt="Amy Yackowski, Founder & Organizational Shift Strategist"
                  className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover shadow-md flex-shrink-0 mx-auto md:mx-0"
                />
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-poppins font-bold text-pps-navy mb-2">
                    Hi! I'm Amy, your Painted Porch Guide!
                  </h3>
                  <p className="text-pps-gold font-poppins font-semibold text-sm mb-6">
                    Amy Yackowski · Founder & Organizational Shift Strategist
                  </p>
                  <p className="text-charcoal leading-relaxed mb-6">
                    Welcome to the Porch! You can call me Amy Yack — my friends do. I've spent the last 20+ years seeking out and partnering with organizations to design programs that <strong>connect</strong> people and <strong>process</strong> to a <strong>clear purpose</strong>, strategic vision, and noble <strong>mission</strong>. Through <strong>challenging business as usual</strong>, we can navigate the sea of change and build amazing teams, focused on <strong>contribution</strong>, <strong>service</strong>, and <strong>connection</strong>.
                  </p>
                  <Button asChild variant="outline" className="border-pps-teal text-pps-teal hover:bg-pps-teal hover:text-white font-poppins font-semibold rounded-lg">
                    <Link to="/amy">More About Amy <ArrowRight className="ml-2 h-4 w-4" /></Link>
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
                Become a Mindful Leader!
              </h2>
              <p className="text-lg text-charcoal max-w-3xl mx-auto leading-relaxed">
                We're bundling our <strong>Create Extraordinary Teams</strong> program with our{" "}
                <Link to="/radical-mindfulness" className="text-pps-teal underline">Radical Mindfulness</Link> &{" "}
                <Link to="/communication" className="text-pps-teal underline">Master Your Message</Link> programs so that you can create the foundation for long-term growth, success, and fulfillment.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-1 gap-8 mt-12 max-w-md mx-auto">
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
                  <Button disabled className="w-full font-poppins font-semibold rounded-lg bg-gray-300 text-gray-600 cursor-not-allowed">
                    {tier.cta}
                  </Button>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Launch list note */}
          <AnimatedSection>
            <div className="mt-10 max-w-3xl mx-auto text-center bg-pps-teal/5 border border-pps-teal/20 rounded-2xl p-6 md:p-8">
              <p className="text-charcoal leading-relaxed mb-5">
                Our courses will be re-launching soon as we move our learning and community to a new course platform. If you'd like to be the first to know when the <strong>Create Extraordinary Teams</strong> bundle is ready, join our launch list.
              </p>
              <Button
                onClick={() => setLaunchOpen(true)}
                className="bg-gold border-2 border-gold text-pps-navy font-poppins font-semibold hover:bg-transparent hover:text-gold transition-colors"
              >
                Join the Launch List <Bell className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>


      {/* FAQ */}
      <AnimatedSection>
        <FAQSection
          tierName="Create Extraordinary Teams"
          faqs={faqs.map((f) => ({ question: f.question, answer: <span dangerouslySetInnerHTML={{ __html: f.answer }} /> }))}
          subheadline="Everything you need to know about the Create Extraordinary Teams bundle."
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
        backgroundImage={ctaBg}
        eyebrow="For Your Organization"
        headline={<>Interested in Creating Extraordinary Teams for Your Company?</>}
        description="Bring team-building and conflict resolution training to your organization. Explore our business programs to build connected, collaborative, mission-focused teams."
        actions={[
          { label: "Explore Workshop Options", to: "/partner/amplify/workshops#building-extraordinary-teams", variant: "primary" },
          { label: "Contact Us", to: "/contact?interest=general", variant: "secondary" },
        ]}
        overlayClass="bg-gradient-to-b from-navy/75 via-navy/70 to-navy/80"
      />
    </div>
  );
}
