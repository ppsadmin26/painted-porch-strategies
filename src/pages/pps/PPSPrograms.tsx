import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import ClientLogoMarquee from "@/components/pps/ClientLogoMarquee";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import programsHero from "@/assets/programs-hero.jpg";
import radicalMindfulness from "@/assets/programs/radical-mindfulness.jpg";
import masterYourMessage from "@/assets/programs/master-your-message.jpg";
import extraordinaryTeams from "@/assets/programs/extraordinary-teams.jpg";
import eqLeadership from "@/assets/programs/eq-leadership.jpg";
import changeReadyMini from "@/assets/programs/change-ready-mini.jpg";
import workFromHome from "@/assets/programs/work-from-home.jpg";
import stoicismGuide from "@/assets/programs/stoicism-guide.jpg";

const signaturePrograms = [
  {
    title: "Radical Mindfulness",
    description:
      "Tap into your inner power to take control of your emotions, find peace among the obstacles in life and work, and build up resiliency to what's outside of your control.",
    image: radicalMindfulness,
    link: "/partner/ignite",
  },
  {
    title: "Master Your Message",
    description:
      "Eliminate the static from your internal and external messaging in order to communicate from your true voice, with clarity, confidence, and influence.",
    image: masterYourMessage,
    link: "/partner/ignite",
  },
  {
    title: "Extraordinary Teams",
    description:
      "Better connect, collaborate, and handle conflict with your fellow humans, in the teams and people you interact with both at work and in life.",
    image: extraordinaryTeams,
    link: "/partner/ignite",
  },
];

const additionalPrograms = [
  {
    title: "Change-Ready Leadership Mini Course",
    description:
      "Take a test drive of our Change-Ready Leadership Program! This mini-course features a few lessons from our signature Change-Ready Leadership training and advisory program.",
    image: changeReadyMini,
    cta: "Get Started",
    link: "/partner/ignite/courses",
  },
  {
    title: "Become a Work From Home Pro!",
    description:
      "Sign up for our FREE Mini-Course focused on helping you tackle your Work From Home day, with your family, your colleagues, and yourself.",
    image: workFromHome,
    cta: "Get FREE Access",
    free: true,
    link: "/partner/ignite/courses",
  },
  {
    title: "A Beginner's Guide to Stoicism",
    description:
      'Join our online community, where we explore how to become a Stoic through 52 weekly lesson reflections from A Handbook for New Stoics.',
    image: stoicismGuide,
    cta: "Get FREE Access",
    free: true,
    link: "/partner/ignite/courses",
  },
];

const coaches = [
  {
    name: "Sierra Ramm Cantrell",
    specialty: "Mindfulness",
    description:
      "Struggling with finding the joy along this journey of life? Work one-on-one with Sierra Ramm Cantrell, a 10+ yr. Yoga, Mindfulness, and Movement expert, to discover ways to stand in your power, joyful, peaceful, and authentic, and kick those old stories to the curb...for good.",
    link: "/sierra",
    color: "bg-strategic/10 border-strategic/20",
    accent: "text-strategic",
  },
  {
    name: "Rob Hunter",
    specialty: "Communication",
    description:
      "Have a podcast you'd like to launch? Or a big presentation coming up? Or do you simply want to improve your speaking skills & confidence? 20+ yr. Radio, TV, and Podcast veteran, Rob Hunter, can guide you to master your messaging and tune into your true voice.",
    link: "/rob",
    color: "bg-primary/10 border-primary/20",
    accent: "text-primary",
  },
  {
    name: "Amy Yackowski",
    specialty: "Teams & Operations",
    description:
      "Dealing with people feeling like a battle? Unable to create the connection and cohesion you're looking for with the people in your life? Amy Yackowski's 15 yrs. of working & leading remotely can guide you to develop strong teams in all areas of your life & work.",
    link: "/amy",
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

export default function PPSPrograms() {
  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[520px] md:min-h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img
            src={programsHero}
            alt="Colorful origami cranes"
            className="w-full h-full object-cover"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy/80 via-navy/60 to-transparent" />
        </div>
        <div className="container max-w-6xl mx-auto px-6 relative z-10 py-20">
          <div className="max-w-2xl">
            <span className="inline-block bg-gold text-navy font-poppins font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-full mb-6">
              Join Us on the Porch
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-poppins leading-tight">
              Programs &amp; More
            </h1>
            <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8">
              Our complete list of all programs, assessments, and coaching services to
              help you <strong>tap into your inner power</strong>,{" "}
              <strong>tackle burnout</strong>{" "}
              <em>(or occasional overwhelm)</em>,{" "}
              <strong>collaborate</strong> with others,{" "}
              <strong>communicate</strong> with clarity, and{" "}
              <strong>lead</strong> with courage, curiosity, and confidence.
            </p>
            <a href="#signature-programs">
              <Button className="bg-lime hover:bg-lime/90 text-navy font-semibold text-base sm:text-lg py-4 sm:py-6 px-6 sm:px-10 rounded-lg transition-all hover:scale-[1.02] max-w-full whitespace-normal h-auto">
                Explore Programs &amp; Services
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Trusted By Marquee */}
      <ClientLogoMarquee
        heading="Trusted By"
        showTestimonials={false}
      />

      {/* Signature Programs */}
      <section id="signature-programs" className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 font-poppins">
                Signature Programs
              </h2>
              <p className="text-lg text-foreground leading-relaxed">
                <strong>There is untapped potential and power in you</strong>, to stand{" "}
                <strong>strong</strong> and resilient among the obstacles in life, to find authentic
                and <strong>virtuous connections</strong> with others, and to{" "}
                <strong>share your message</strong> by eliminating the static interfering with your
                true, confident voice.
              </p>
              <p className="text-lg text-foreground leading-relaxed mt-4">
                Our 3 Signature Programs represent a{" "}
                <strong>holistic approach to transformation</strong> and leadership excellence.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {signaturePrograms.map((program, index) => (
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

      {/* EQ Leadership */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <img
                  src={eqLeadership}
                  alt="Emotional Intelligence Leadership"
                  className="rounded-xl shadow-lg w-full"
                  loading="lazy"
                  width={1024}
                  height={768}
                />
              </div>
              <div className="order-1 md:order-2">
                <span className="inline-block bg-raspberry/10 text-raspberry font-poppins font-semibold text-xs uppercase tracking-wider px-4 py-2 rounded-full mb-4">
                  Emotional Intelligence
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 font-poppins">
                  Become an Emotionally-Intelligent Leader
                </h2>
                <p className="text-lg text-foreground leading-relaxed mb-8">
                  Develop the awareness and capabilities to lead in the 21st century through
                  Emotional Intelligence (EQ). Uncover your own strengths and opportunities to show
                  up, be heard, connect, drive change, and have resilience to the challenges
                  presented in life, work, and anywhere in between.
                </p>
                <Link to="/partner/ignite/assessments/eq">
                  <Button className="bg-raspberry hover:bg-raspberry/90 text-white font-semibold text-lg py-5 px-8 rounded-lg transition-all hover:scale-[1.02]">
                    Get Started
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Additional Programs */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 font-poppins">
                Additional Programs
              </h2>
              <p className="text-lg text-foreground leading-relaxed">
                We've assembled some of our favorite lessons and insights into a few low-price or{" "}
                <strong>absolutely free</strong> programs! It's a great way to take your first step
                in joining us <em>on the Porch</em> and see what we're all about.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {additionalPrograms.map((program) => (
              <AnimatedSection key={program.title}>
                <Link
                  to={program.link}
                  className="group block bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={program.image}
                      alt={program.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      width={1024}
                      height={768}
                    />
                    {program.free && (
                      <span className="absolute top-4 right-4 bg-lime text-navy font-poppins font-bold text-xs uppercase px-3 py-1 rounded-full">
                        Free
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-3 group-hover:text-primary transition-colors">
                      {program.title}
                    </h3>
                    <p className="text-foreground text-sm leading-relaxed mb-4">
                      {program.description}
                    </p>
                    <span className="text-primary font-semibold text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      {program.cta} <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* One-on-One Advisory */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <AnimatedSection>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6 font-poppins">
                One-on-One Advisory &amp; Guidance
              </h2>
              <p className="text-lg text-foreground leading-relaxed">
                The Painted Porch team is made up of experts across multiple industries including{" "}
                <strong>Movement &amp; Mindfulness</strong>,{" "}
                <strong>Media &amp; Broadcasting</strong>,{" "}
                <strong>Staffing Operations</strong>, and{" "}
                <strong>Software Development</strong>.
              </p>
              <p className="text-lg text-foreground leading-relaxed mt-4">
                Through additional one-on-one guidance, we're committed to partnering with you to
                achieve your next level of leadership in your life, with others, and at work.
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {coaches.map((coach) => (
              <AnimatedSection key={coach.name}>
                <div className={`rounded-xl border ${coach.color} p-8 h-full flex flex-col`}>
                  <span className={`font-poppins font-bold text-xs uppercase tracking-wider ${coach.accent} mb-2`}>
                    {coach.specialty}
                  </span>
                  <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-4">
                    {coach.name}
                  </h3>
                  <p className="text-foreground text-sm leading-relaxed mb-6 flex-1">
                    {coach.description}
                  </p>
                  <Link
                    to={coach.link}
                    className={`${coach.accent} font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all`}
                  >
                    Learn More <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Business CTA */}
      <section className="py-16 md:py-24 bg-navy text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">
              Interested in Our Programs for Your Company?
            </h2>
            <blockquote className="text-xl md:text-2xl italic text-white/80 mb-8 leading-relaxed">
              "You don't build a business. You build people, and people build the business."
              <span className="block text-base mt-2 not-italic text-white/60">Zig Ziglar</span>
            </blockquote>
            <p className="text-lg text-white/90 leading-relaxed mb-10 max-w-2xl mx-auto">
              Success starts at the foundation: <strong>Your People</strong>. When you invest in
              your people and the way work is executed, your organization can achieve amazing
              things. We've taken our signature programs and put a business twist on them to{" "}
              <strong>activate your business growth</strong> through <em>preparation</em>,{" "}
              <em>purpose</em>, and <em>prosperity</em> for your people and those you serve.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/partner">
                <Button className="bg-gold hover:bg-gold/90 text-navy font-semibold text-base sm:text-lg py-4 sm:py-6 px-6 sm:px-10 rounded-lg transition-all hover:scale-[1.02] max-w-full whitespace-normal h-auto">
                  Explore Partnership Options
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact?scope=organization&interest=organizational-advisory&message=I'm interested in your programs.">
                <Button variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-navy font-semibold text-base sm:text-lg py-4 sm:py-6 px-6 sm:px-10 rounded-lg transition-all max-w-full whitespace-normal h-auto">
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
