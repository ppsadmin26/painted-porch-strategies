import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle, ExternalLink, Calendar, Users } from "lucide-react";
import { PPSBreadcrumb } from "@/components/pps/PPSBreadcrumb";
import { FAQSection, type FAQCategory } from "@/components/pps/FAQSection";
import dualGearsIcon from "@/assets/icons/dual-gears.svg";
import widgetImage from "@/assets/working-genius-widget.png.asset.json";
import heroBg from "@/assets/working-genius-hero-bg.jpg";
import certifiedBadge from "@/assets/working-genius-certified-badge.png.asset.json";


const wgFaqCategories: FAQCategory[] = [
  {
    name: "About Working Genius",
    faqs: [
      {
        question: "Is the Working Genius assessment for me?",
        answer:
          "If you've ever wondered why some work energizes you while other tasks drain you (even when you're good at them), Working Genius is for you. It's a 10-minute assessment that helps anyone, in any role, understand the kinds of work that fit their natural gifts and the kinds that frustrate them. It's especially powerful for leaders, teams, and anyone wanting to do work that brings them joy.",
      },
      {
        question: "How long does the assessment take?",
        answer:
          "The online Working Genius assessment takes about 10 minutes to complete. There are no right or wrong answers. You'll answer questions about how you naturally think and work, and you'll receive a personalized report identifying your two areas of genius, two areas of competency, and two areas of frustration.",
      },
      {
        question: "What are the 6 Types of Working Genius?",
        answer:
          "The 6 types spell out the acronym W.I.D.G.E.T.: Wonder (asking the big questions), Invention (generating new ideas and solutions), Discernment (evaluating ideas and giving feedback), Galvanizing (rallying people to action), Enablement (jumping in to help), and Tenacity (driving work across the finish line). Everyone has two types they're naturally great at (their genius), two they can do but find draining, and two that frustrate them.",
      },
      {
        question: "Who created Working Genius?",
        answer:
          "Working Genius was created by Patrick Lencioni and The Table Group. Painted Porch Strategies is a Working Genius Certified Facilitator, which means we're trained and licensed to apply Working Genius results with individuals and teams.",
      },
    ],
  },
  {
    name: "Purchase & Logistics",
    faqs: [
      {
        question: "What's the difference between the $25 option and the $297 option?",
        answer:
          "The $25 option is the basic Working Genius assessment purchased directly from The Table Group. You complete the assessment and receive your personalized PDF report on your own. The $297 option adds a 45-minute one-on-one debrief call with our team, where we help you understand your results, see how your genius shows up in your real-world work, and design an action plan to lean into your strengths and protect your energy.",
      },
      {
        question: "What should I expect after I purchase?",
        answer:
          "If you purchase the assessment only directly from Working Genius, you'll receive access to immediately complete your assessment. Results will be delivered immediately thereafter. If you purchase from us, you'll receive a custom link to complete your Working Genius assessment within 24 hours. Then, once completed, you'll receive an email to book your debrief. The report will be delivered as part of the debrief session.",
      },
      {
        question: "Can my whole team take this together?",
        answer: (
          <>
            Yes. Working Genius is built for teams. We can run it as a team or organizational package with an optional 2 to 4 hour facilitated workshop where we map your team's collective genius, identify gaps, and redesign how work flows so people spend more time in their genius. Reach out through our{" "}
            <Link to="/contact" className="text-primary underline hover:text-primary/80">contact form</Link> to design the right package for your team.
          </>
        ),
      },
    ],
  },
];

const sixTypes = [
  {
    letter: "W",
    name: "Wonder",
    description: "The natural gift of pondering the possibility of greater potential and opportunity. People with Wonder ask the big questions.",
  },
  {
    letter: "I",
    name: "Invention",
    description: "The natural gift of creating original and novel ideas and solutions. People with Invention love a blank page and a hard problem.",
  },
  {
    letter: "D",
    name: "Discernment",
    description: "The natural gift of intuitively and instinctively evaluating ideas and situations. People with Discernment have a good gut.",
  },
  {
    letter: "G",
    name: "Galvanizing",
    description: "The natural gift of rallying, inspiring, and organizing others to take action. People with Galvanizing are the spark plug of a team.",
  },
  {
    letter: "E",
    name: "Enablement",
    description: "The natural gift of providing encouragement and assistance for an idea or project. People with Enablement are the responsive partner.",
  },
  {
    letter: "T",
    name: "Tenacity",
    description: "The natural gift of pushing projects and tasks to completion to achieve results. People with Tenacity make sure work gets done.",
  },
];

const reportIncludes = [
  {
    tag: "DISCOVER YOUR GENIUS",
    title: "Your Two Areas of Genius",
    description:
      "Your personalized report shows the two types of work that bring you joy and energy. These are the activities you should be doing more of.",
    items: [
      "Why these two types fit you naturally",
      "How they show up at work and in life",
      "How to protect time for genius work",
    ],
    note: "When you spend more time in your genius, you do better work, feel more alive, and get more done in less time.",
  },
  {
    tag: "NAME YOUR COMPETENCY",
    title: "Your Two Areas of Competency",
    description:
      "These are the types of work you can do, and may even be good at, but they don't energize you. In small doses they're fine. Long stretches will burn you out.",
    items: [
      "Where you can contribute without burning out",
      "How to recognize when you've had enough",
      "How to hand these off when you can",
    ],
  },
  {
    tag: "PROTECT YOUR ENERGY",
    title: "Your Two Areas of Frustration",
    description:
      "These are the types of work that drain you. Doing too much of them leads to guilt, shame, and burnout. The report names them so you can stop blaming yourself.",
    items: [
      "Why these types feel so heavy",
      "How to stop apologizing for not loving them",
      "How to partner with people whose genius fills your gap",
    ],
    note: "People don't resist work. They resist being asked to live outside their genius.",
  },
  {
    tag: "APPLY WITH A GUIDE",
    title: "Your 45-Minute Debrief Call (Optional Package)",
    description:
      "With our $297 package, you sit down with our team to make the report real for your life and work. We'll work with you to:",
    items: [
      "Read your results in plain English",
      "See where your current role fits or fights your genius",
      "Design two or three shifts you can make this month",
      "Spot the genius gaps on your team",
    ],
  },
];

const stats = [
  {
    stat: "20%",
    text: "of Working Genius is personality. The other 80% is about what kind of work fits you and what kind drains you.",
  },
  {
    stat: "10 min",
    text: "to complete the assessment. You'll get a personalized report that explains your genius, your competency, and your frustration.",
  },
  {
    stat: "6 Types",
    text: "make up every kind of work: Wonder, Invention, Discernment, Galvanizing, Enablement, and Tenacity. You have two of each kind.",
  },
];

export default function WorkingGeniusAssessment() {
  return (
    <div>
      <PPSBreadcrumb
        segments={[
          { label: "Partner", href: "/partner" },
          { label: "IGNITE", href: "/partner/ignite" },
          { label: "Assessments", href: "/partner/ignite/assessments" },
          { label: "Working Genius" },
        ]}
      />

      {/* Back link */}

      {/* Hero */}
      <section className="relative py-20 md:py-28 text-white overflow-hidden isolate">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
          aria-hidden="true"
        />
        {/* Overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/30" aria-hidden="true" />

        <div className="container max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <img src={dualGearsIcon} alt="" className="w-6 h-6" style={{ filter: "brightness(0) invert(1)" }} />
              <span className="text-sm font-semibold">The 6 Types of Working Genius</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold mb-6">
              Discover your gifts. Transform your work.
            </h1>
            <p className="text-lead mb-8 text-white/90">
              Some work gives you energy. Some drains it. Working Genius names the kinds of work that fit your natural gifts so you can spend more time doing what brings you joy and impact.
            </p>
            <a href="#get-started">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold text-lg px-8">
                Get Started
              </Button>
            </a>
          </div>
        </div>
      </section>


      {/* What is it */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold tracking-widest text-primary uppercase">
              What Is Working Genius
            </span>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mt-2 mb-6">
              20% Personality. 80% Productivity.
            </h2>
            <p className="text-lead text-foreground max-w-3xl mx-auto">
              Created by Patrick Lencioni and The Table Group, Working Genius is a model and assessment that names the six kinds of work every project needs. Most of us have two we're great at, two we can do, and two that wear us out. When you know yours, work gets lighter and teams get stronger.
            </p>
          </div>

          <div className="max-w-2xl mx-auto mb-10">
            <p className="text-foreground mb-4 font-medium">
              People who understand their genius:
            </p>
            <ul className="space-y-3">
              {[
                "Show up to work happier and more energized",
                "Stop feeling guilty about work that drains them",
                "Make better hiring, role, and team decisions",
                "Get more done in less time, with less burnout",
                "Build teams that fit together instead of fighting each other",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Stat Callout */}
      <section className="py-16 bg-navy text-white text-center">
        <div className="container max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4">
            What do you crave? What are you crushed by?
          </h2>
          <p className="text-lead text-white/80 mb-6">
            Working Genius answers both. In about 10 minutes you'll know which work to lean into and which to stop blaming yourself for.
          </p>
          <a href="#get-started">
            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-navy focus-ring-on-dark">
              Get Started
            </Button>
          </a>
        </div>
      </section>

      {/* Why It Matters Stats */}
      <section className="py-16 bg-muted/40">
        <div className="container max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy text-center mb-12">
            Why It Matters
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-xl p-8 shadow-md text-center border-t-4 border-primary">
                <p className="text-4xl font-bold text-primary mb-3">{s.stat}</p>
                <p className="text-body-sm text-foreground">{s.text}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-foreground mt-8 max-w-2xl mx-auto">
            When people work in their genius, they don't just do more. They feel more alive doing it.
          </p>
        </div>
      </section>

      {/* The 6 Types */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
              W.I.D.G.E.T.
            </span>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mt-2 mb-4">
              The 6 Types of Working Genius
            </h2>
            <p className="text-foreground max-w-3xl mx-auto leading-relaxed">
              Every project, big or small, moves through these six stages. You (and the people on your team) have natural gifts in two of them. Knowing which two changes everything - in how you show up, speak, and get shIFt done.
            </p>
          </div>

          <div className="max-w-3xl mx-auto mb-12">
            <img
              src={widgetImage.url}
              alt="The 6 Types of Working Genius shown as gears spelling W I D G E T: Wonder, Invention, Discernment, Galvanizing, Enablement, Tenacity"
              loading="lazy"
              className="w-full h-auto rounded-xl shadow-lg"
            />
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sixTypes.map((t) => (
              <div
                key={t.letter}
                className="bg-white rounded-xl border border-border shadow-md p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-poppins font-bold text-primary">{t.letter}</span>
                  </div>
                  <h3 className="text-xl font-poppins font-bold text-navy">{t.name}</h3>
                </div>
                <p className="text-body-sm text-foreground">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy text-center mb-12">
            What's Included In Your Working Genius Report
          </h2>
          <div className="space-y-8">
            {reportIncludes.map((section, i) => (
              <div key={i} className="bg-white rounded-xl p-8 shadow-md">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{i + 1}</span>
                  </div>
                  <span className="text-xs font-semibold tracking-widest text-primary uppercase">
                    {section.tag}
                  </span>
                </div>
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-3">
                  {section.title}
                </h3>
                <p className="text-foreground mb-4">{section.description}</p>
                <ul className="space-y-2 mb-3">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                {section.note && (
                  <p className="text-body-sm text-muted-foreground italic">{section.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Is For You If */}
      <section className="py-16 bg-primary text-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-8">
            Working Genius Is For You If...
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              "You wonder why some work lights you up and other work wears you out",
              "You want to lead a team where people fit their roles, not fight them",
              "You're tired of feeling guilty about work you can do but don't love",
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <CheckCircle className="w-8 h-8 mx-auto mb-3 text-white/90" />
                <p className="text-body-sm text-white/90">{item}</p>
              </div>
            ))}
          </div>
          <a href="#get-started">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-semibold">
              Yes, Show Me My Genius
            </Button>
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section id="get-started" className="py-16 md:py-24 bg-white scroll-mt-24">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold tracking-widest text-primary uppercase">
              Get Started Today
            </span>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mt-2">
              Discover Your Working Genius
            </h2>
            <p className="text-foreground mt-3 max-w-2xl mx-auto">
              Two ways to take the assessment. One is just the report. The other adds a guide.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Basic Assessment */}
            <div className="bg-white rounded-xl border border-border shadow-md p-8 flex flex-col">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-1">
                Working Genius Assessment
              </h3>
              <p className="text-4xl font-bold text-primary mb-4">$25</p>
              <p className="text-body-sm font-medium text-foreground mb-4">
                Take the assessment on your own.
              </p>
              <ul className="space-y-2 mb-8 flex-grow">
                {[
                  "10-minute online assessment",
                  "Your personalized Working Genius report",
                  "Names your 2 areas of genius, 2 of competency, and 2 of frustration",
                  "Purchased directly through The Table Group",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-body-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://www.workinggenius.com/the-assessment"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary hover:text-white whitespace-normal h-auto py-3 text-sm">
                  Buy on WorkingGenius.com <ExternalLink className="ml-2 w-4 h-4 flex-shrink-0" />
                </Button>
              </a>
              <p className="text-caption text-muted-foreground mt-3 text-center">
                Cheaper than what we'd charge (due to additional administrative set-up). No reason to mark it up.
              </p>
            </div>

            {/* Assessment + Debrief */}
            <div className="bg-white rounded-xl border-2 border-primary shadow-xl p-8 flex flex-col relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-4 py-1 rounded-full">
                Most Popular
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-1">
                Assessment + 1:1 Debrief
              </h3>
              <p className="text-4xl font-bold text-primary mb-4">$297</p>
              <p className="text-body-sm font-medium text-foreground mb-4">
                Make the report real with a guide.
              </p>
              <ul className="space-y-2 mb-8 flex-grow">
                {[
                  "Everything in the basic assessment",
                  "45-minute one-on-one debrief call with our team",
                  "Plain-English read of your results",
                  "An action plan to lean into your genius this month",
                  "Tips for spotting genius gaps on your team",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-body-sm text-foreground">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a
                href="https://explore.onthepaintedporch.com/payment-link/6a21dc6771a0aa761e4630c7"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                  Purchase <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </div>

            {/* Team / Org */}
            <div className="bg-muted/40 rounded-xl border border-border shadow-md p-8 flex flex-col">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-1">
                Team or Organization
              </h3>
              <p className="text-2xl font-bold text-navy mb-4">Let's Talk</p>
              <p className="text-body-sm text-foreground mb-4">
                Bring Working Genius to your whole team with an optional 2 to 4 hour workshop:
              </p>
              <ul className="space-y-2 mb-8 flex-grow">
                {[
                  "Group pricing for the assessment",
                  "Optional 2 to 4 hour facilitated workshop",
                  "Team genius map and gap analysis",
                  "Practical shifts to how work flows",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-body-sm text-foreground">
                    <Users className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="w-full border-navy text-navy hover:bg-navy hover:text-white">
                  <Link to="/contact?scope=Team&interest=Working+Genius&message=I%27m+interested+in+a+Working+Genius+team+or+organization+package.">Contact Us <Calendar className="ml-2 w-4 h-4" /></Link>
                </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <img
              src={certifiedBadge.url}
              alt="The 6 Types of Working Genius Certified Badge"
              className="w-40 h-40 md:w-48 md:h-48 flex-shrink-0"
              loading="lazy"
            />
            <div>
              <h2 className="font-poppins font-bold text-2xl md:text-3xl text-navy mb-3">
                A Certified Working Genius Facilitator
              </h2>
              <p className="font-montserrat text-charcoal-gray text-lead">
                Painted Porch Strategies is a certified Working Genius Facilitator through The Table Group. That means when you work with us, you're getting more than an assessment - you're getting trained guidance to turn your results into real shIFt in how you and your team show up, collaborate, and get work done.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FAQSection tierName="Working Genius" categories={wgFaqCategories} />
    </div>
  );
}
