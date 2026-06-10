import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Droplet, TreePine, Flame, Mountain, Cog, Sparkles, Users, BookOpen, Compass, Check, Building2 } from "lucide-react";

const COURSE_CHECKOUT_URL =
  "https://i2leoa0csotwxi24twnb.app.clientclub.net/courses/offers/1696d978-d270-4429-acb6-da09febe8c31";

const elements = [
  {
    name: "Water",
    icon: Droplet,
    color: "text-teal",
    bg: "bg-teal/10",
    desc: "Deep, reflective, and emotionally attuned. Learn how Waters thrive and reset when overwhelmed.",
  },
  {
    name: "Wood",
    icon: TreePine,
    color: "text-lime-green",
    bg: "bg-lime-green/10",
    desc: "Decisive, driven, and fearless. Support Woods when stress makes them rigid or reactive.",
  },
  {
    name: "Fire",
    icon: Flame,
    color: "text-raspberry",
    bg: "bg-raspberry/10",
    desc: "Expressive, energetic, and the spark of joy. Channel Fire's enthusiasm and recognize overwhelm.",
  },
  {
    name: "Earth",
    icon: Mountain,
    color: "text-gold",
    bg: "bg-gold/10",
    desc: "Compassionate and grounding. Help Earths set boundaries and speak up when stress takes over.",
  },
  {
    name: "Metal",
    icon: Cog,
    color: "text-purple",
    bg: "bg-purple/10",
    desc: "Principled, analytical, and driven by purpose. Support Metals when stress triggers overthinking.",
  },
];

const lessons = [
  { num: "1", title: "Getting in Your Element", desc: "Explore the Five Element framework and uncover your dominant Elemental Style." },
  { num: "2", title: "Go with the Flow (of Water)", desc: "Deep, reflective, emotionally attuned. How Waters thrive and reset." },
  { num: "3", title: "The [Wood] Roots of Progress", desc: "Decisive and driven. How Woods lead and how to support them under stress." },
  { num: "4", title: "Fire'd Up!", desc: "Expressive and energetic. Channel Fire's spark and spot overwhelm." },
  { num: "5", title: "Getting Grounded (with Earth)", desc: "Compassionate and harmonizing. Help Earths set boundaries." },
  { num: "6", title: "A Metal's Mettle", desc: "Principled and analytical. Support Metals when stress triggers rigidity." },
  { num: "7", title: "'Element'-ary Evaluations", desc: "Map your team's Elemental Styles and build balance, resilience, and connection." },
];

const individualIncludes = [
  "7 fast-paced lessons (under an hour total)",
  "Lifetime access to the full course library",
  "Guided worksheets and reflection prompts",
  "Use it in 1:1s, team meetings, and conflict moments",
];

const teamIncludes = [
  "Group seats for your whole team",
  "Custom kickoff and debrief options",
  "Team-wide Elemental Style mapping",
  "Optional facilitated workshop add-on",
];

export default function ElementsMiniSignUp() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy to-purple text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            MINI COURSE
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold mb-6">
            The Elements of <span className="text-gold">Your Team</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-6">
            Discover the ancient wisdom and modern insights behind what truly drives your team, through the lens of the Five Elements.
          </p>
          <p className="text-lg font-poppins font-semibold text-gold mb-8">
            Water · Wood · Fire · Earth · Metal
          </p>
          <a href="#pricing">
            <Button className="bg-raspberry hover:bg-raspberry/90 text-white text-base sm:text-lg py-4 sm:py-6 px-6 sm:px-10 rounded-full max-w-full whitespace-normal h-auto">
              See Pricing & Get Access
            </Button>
          </a>
        </div>
      </section>

      {/* Why */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-6">
            People + Diverse Styles = Tension... or Teamwork.
          </h2>
          <p className="text-lg text-charcoal mb-4">
            Unclear communication and unchecked stress responses can derail even the most talented teams.
          </p>
          <p className="text-lg text-charcoal mb-4">
            But when you understand what drives each person, tension turns into trust.
          </p>
          <p className="text-lg text-charcoal">
            <strong className="text-navy">The Elements of Your Team Mini Course</strong> partners with you to decode behavior and build connection fast.
          </p>
        </div>
      </section>

      {/* Five Elements grid */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy text-center mb-12">
            Meet the <span className="text-teal">Five Elements</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {elements.map((el) => {
              const Icon = el.icon;
              return (
                <div
                  key={el.name}
                  className="bg-white border-2 border-border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full ${el.bg} mb-4`}>
                    <Icon className={`w-7 h-7 ${el.color}`} />
                  </div>
                  <h3 className={`text-xl md:text-2xl font-poppins font-bold mb-2 ${el.color}`}>{el.name}</h3>
                  <p className="text-sm text-charcoal">{el.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* What you'll learn */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-8 text-center">
            In this mini course, you'll discover how to:
          </h2>
          <ul className="space-y-5 mt-8 max-w-3xl mx-auto">
            <li className="flex gap-3">
              <Users className="w-6 h-6 text-teal flex-shrink-0 mt-1" />
              <span className="text-charcoal">
                <strong className="text-navy">Understand what drives each team member</strong>, how the Five Elemental Styles shape motivation, communication, and reactions under pressure.
              </span>
            </li>
            <li className="flex gap-3">
              <Compass className="w-6 h-6 text-lime-green flex-shrink-0 mt-1" />
              <span className="text-charcoal">
                <strong className="text-navy">Define the Elements of a Team</strong>, spot the subtle signs of stress and strength so you can respond with empathy and insight.
              </span>
            </li>
            <li className="flex gap-3">
              <Sparkles className="w-6 h-6 text-purple flex-shrink-0 mt-1" />
              <span className="text-charcoal">
                <strong className="text-navy">Create more flow, less friction</strong>, use a simple, powerful framework to build team harmony, improve collaboration, and support well-being.
              </span>
            </li>
            <li className="flex gap-3">
              <BookOpen className="w-6 h-6 text-raspberry flex-shrink-0 mt-1" />
              <span className="text-charcoal">
                <strong className="text-navy">Apply it immediately</strong>, walk away with guided worksheets and reflection prompts you can use in 1:1s, team meetings, and conflict moments.
              </span>
            </li>
          </ul>
          <p className="mt-8 text-charcoal italic text-center">
            Perfect for leaders, coaches, and collaborators who want more alignment and less guessing.
          </p>
        </div>
      </section>

      {/* Pricing, Two Tiers */}
      <section id="pricing" className="py-16 px-4 bg-secondary/30 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-3">
              Choose Your <span className="text-teal">P.A.T.H.way</span>
            </h2>
            <p className="text-lg text-charcoal">
              Built for individuals who want to grow, and teams ready to shift together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Individual */}
            <div className="bg-white border-2 border-teal rounded-2xl shadow-lg p-8 flex flex-col">
              <div className="inline-flex items-center gap-2 bg-teal/10 text-teal px-3 py-1 rounded-full text-xs font-semibold w-fit mb-4">
                <Users className="w-3.5 h-3.5" />
                INDIVIDUAL
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-2">For You</h3>
              <p className="text-charcoal mb-6">
                Self-paced access for one learner. Perfect for leaders, coaches, and curious humans.
              </p>
              <div className="mb-6">
                <span className="font-poppins font-bold text-5xl text-navy">$99</span>
                <span className="text-muted-foreground ml-2">one-time</span>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {individualIncludes.map((item) => (
                  <li key={item} className="flex gap-2 items-start text-charcoal">
                    <Check className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <a href={COURSE_CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-teal hover:bg-teal/90 text-white text-lg py-6 rounded-full">
                  Get Instant Access, $99
                </Button>
              </a>
            </div>

            {/* Team */}
            <div className="bg-white border-2 border-purple rounded-2xl shadow-lg p-8 flex flex-col">
              <div className="inline-flex items-center gap-2 bg-purple/10 text-purple px-3 py-1 rounded-full text-xs font-semibold w-fit mb-4">
                <Building2 className="w-3.5 h-3.5" />
                TEAM
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-2">For Your Team</h3>
              <p className="text-charcoal mb-6">
                Bring the Five Elements to your whole team with custom pricing and optional facilitation.
              </p>
              <div className="mb-6">
                <span className="font-poppins font-bold text-5xl text-navy">Let's Chat</span>
                <span className="block text-muted-foreground mt-1">custom pricing</span>
              </div>
              <ul className="space-y-3 mb-8 flex-grow">
                {teamIncludes.map((item) => (
                  <li key={item} className="flex gap-2 items-start text-charcoal">
                    <Check className="w-5 h-5 text-purple flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full bg-purple hover:bg-purple/90 text-white text-lg py-6 rounded-full">
                  <Link to="/contact?interest=elements-mini-team">Contact Us for Team Pricing</Link>
                </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Lessons */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-3">
              Discover. Decode. Align.
            </h2>
            <p className="text-lg text-charcoal">
              7 fast-paced lessons. All in under an hour.
            </p>
          </div>

          <div className="space-y-4">
            {lessons.map((lesson) => (
              <div
                key={lesson.num}
                className="bg-white border-2 border-border rounded-xl p-6 flex gap-5 items-start shadow-sm"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal/10 text-teal font-poppins font-bold text-xl flex items-center justify-center">
                  {lesson.num}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-1">{lesson.title}</h3>
                  <p className="text-charcoal">{lesson.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <a href="#pricing">
              <Button className="bg-teal hover:bg-teal/90 text-white text-base sm:text-lg py-4 sm:py-6 px-6 sm:px-10 rounded-full max-w-full whitespace-normal h-auto">
                See Pricing & Get Access
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 bg-gradient-to-br from-navy to-purple text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4">
            Ready to unlock the hidden dynamics of your team?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            At Painted Porch, we don't just teach leadership, we embody it. This isn't passive training.
            You'll engage your mind, body, heart, and instincts to uncover what really drives your team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={COURSE_CHECKOUT_URL} target="_blank" rel="noopener noreferrer">
              <Button className="bg-gold hover:bg-gold/90 text-navy font-bold text-lg py-6 px-10 rounded-full w-full sm:w-auto">
                Start the Mini Course, $99
              </Button>
            </a>
            <Button asChild
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-navy text-lg py-6 px-10 rounded-full w-full sm:w-auto"
              >
                  <Link to="/contact?interest=elements-mini-team">Team Pricing</Link>
                </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
