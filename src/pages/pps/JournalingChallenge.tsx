import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, BookOpen, Calendar, Sparkles, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import LazyPreviewVideo from "@/components/pps/LazyPreviewVideo";
import journalingHero from "@/assets/masterclass/journaling-challenge.jpg";
import ctaBackground from "@/assets/journaling-challenge-cta.jpg";

// TODO: Replace with the live GoHighLevel checkout URL when ready.
const GHL_CHECKOUT_URL = "https://link.paintedporchstrategies.com/widget/form/PLACEHOLDER";

const dailyLessons = [
  {
    day: "Day 1",
    title: "Reconnect",
    description: "Settle in, slow down, and reconnect with yourself through a short, guided prompt.",
  },
  {
    day: "Day 2",
    title: "Reflect",
    description: "Look back on your day and spot the wins, the lessons, and the small moments worth keeping.",
  },
  {
    day: "Day 3",
    title: "Rediscover",
    description: "Uncover the values, beliefs, and patterns shaping how you show up and speak to yourself.",
  },
  {
    day: "Day 4",
    title: "Reframe",
    description: "Shift the inner narrative — the one you don't always realize is running in the background.",
  },
  {
    day: "Day 5",
    title: "Reignite",
    description: "Walk away with a simple journaling rhythm you'll actually keep — and a clearer voice to lead with.",
  },
];

const learnings = [
  "Build a 5-minute daily journaling habit you'll actually stick with",
  "Quiet the mental noise so you can hear your own voice again",
  "Spot the patterns, beliefs, and self-talk shaping your days",
  "Reconnect with what matters most — to you, not everyone else",
  "Walk away with simple prompts you can use long after the challenge ends",
];

export default function JournalingChallenge() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-16 md:py-20">
        <div className="container max-w-5xl mx-auto px-6">
          <Link
            to="/partner/ignite/masterclasses"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Masterclasses
          </Link>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-navy/10 text-navy mb-4">
                <PenLine className="w-3.5 h-3.5" /> 5-Day Challenge
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-6">
                Do the{" "}
                <span className="text-primary italic">Write</span>{" "}
                Thing: Journaling Challenge
              </h1>
              <p className="text-lg text-foreground mb-8">
                Five days. Five short prompts. Reconnect, rediscover, and reignite your true voice — one quiet page at a time. Led by Rob Hunter, Painted Porch's Master of Communication.
              </p>
              <Button
                disabled
                className="bg-primary text-white font-semibold text-base px-8 py-5 rounded-full opacity-60 cursor-not-allowed"
              >
                Coming Soon
              </Button>
              <p className="text-sm mt-3">
                <Link to="/partner/ignite/masterclasses" className="text-primary hover:underline font-medium">
                  Join the launch list →
                </Link>
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                On-demand. 5 short daily prompts. Go at your own pace, anytime.
              </p>
            </div>

            <LazyPreviewVideo
              slotKey="journaling-challenge-teaser"
              fallbackVideoUrl=""
              fallbackPosterUrl={journalingHero}
            />

          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block text-gold font-semibold text-sm uppercase tracking-wide mb-2">
              What You'll Walk Away With
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy">
              A few quiet minutes can change a whole lot.
            </h2>
          </div>
          <ul className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {learnings.map((item) => (
              <li key={item} className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The 5 Days */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block text-gold font-semibold text-sm uppercase tracking-wide mb-2">
              Inside the Challenge
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy">
              Five days. Five small prompts.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {dailyLessons.map((lesson) => (
              <div
                key={lesson.day}
                className="bg-muted rounded-xl p-5 border-t-4 border-primary flex flex-col"
              >
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                  <Calendar className="w-4 h-4" />
                  {lesson.day}
                </div>
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-2 leading-tight">
                  {lesson.title}
                </h3>
                <p className="text-sm text-foreground">{lesson.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Who this is for
            </h2>
            <p className="text-foreground max-w-2xl mx-auto">
              Anyone who's been meaning to "start journaling" for a while now — and could use a small, doable nudge to actually begin.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <BookOpen className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-xl md:text-2xl font-bold text-navy mb-2">Busy Leaders</h3>
              <p className="text-sm text-foreground">
                Who run from meeting to meeting and rarely get five quiet minutes to think their own thoughts.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-xl md:text-2xl font-bold text-navy mb-2">Reflective Doers</h3>
              <p className="text-sm text-foreground">
                Who know self-reflection matters but haven't found a rhythm that actually sticks.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <PenLine className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-xl md:text-2xl font-bold text-navy mb-2">Anyone Curious</h3>
              <p className="text-sm text-foreground">
                Who wants a simple, low-pressure way to slow down and hear their own voice again.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 md:py-28 text-white overflow-hidden">
        <img
          src={ctaBackground}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/70 to-navy/40" />
        <div className="relative container max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
            Ready to do the Write thing?
          </h2>
          <p className="text-white/90 mb-8 text-lg drop-shadow">
            Five days from now you could have a simple daily rhythm, a quieter mind, and a much clearer sense of your own voice. Let's go.
          </p>
          <a
            href={GHL_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Enroll in the Master Your Message Journaling Challenge"
          >
            <Button className="bg-gold hover:bg-gold/90 text-navy font-semibold text-base px-8 py-5 rounded-full shadow-xl">
              Enroll Now
            </Button>
          </a>
          <p className="text-xs text-white/80 mt-4">
            Questions? <Link to="/contact" className="underline hover:text-white">Contact us</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
