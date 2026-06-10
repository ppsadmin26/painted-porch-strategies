import { Link } from "react-router-dom";
import {
  Heart,
  Coffee,
  ExternalLink,
  ArrowRight,
  Podcast,
} from "lucide-react";
import sierraPhoto from "@/assets/team/sierra-ramm-cantrell.jpg";

/* ── Offering categories ─────────────────────────────────────────────── */

interface OfferingCard {
  emoji: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
  color: "teal" | "gold" | "purple" | "lime" | "raspberry";
}

const offerings: OfferingCard[] = [
  {
    emoji: "💥",
    title: "Radical Mindfulness",
    description:
      "Beat burnout and stress with science-backed mindfulness practices designed for real life, not just the meditation cushion.",
    href: "/radical-mindfulness",
    color: "gold",
  },
  {
    emoji: "🎤",
    title: "Speaking & Keynotes",
    description:
      "From resilience and joy at work to mindful leadership, Sierra delivers sessions that recharge, refocus, and reconnect teams.",
    href: "/speaking/sierra",
    color: "purple",
  },
  {
    emoji: "✈️",
    title: "From Passenger to Pilot",
    description:
      "A free training to help you take the driver's seat in your life, stop reacting and start leading with intention.",
    href: "/pilot-training",
    color: "teal",
  },
  {
    emoji: "🙂",
    title: "1:1 Mindset & Mindfulness Coaching",
    description:
      "Personal coaching to help you manage energy, build resilience, and lead a more joyful, authentic life.",
    href: "/contact?scope=Yourself&interest=1on1-advisory&message=I'm interested in 1:1 coaching with Sierra.",
    color: "lime",
  },
  {
    emoji: "⚡",
    title: "IGNITE: Self-Led Growth",
    description:
      "Masterclasses and self-paced courses designed to reignite resilience and build mindfulness habits that stick.",
    href: "/partner/ignite",
    color: "raspberry",
  },
  {
    emoji: "🧘",
    title: "Mindfulness for Teams",
    description:
      "Guided workshops that bring calm, clarity, and connection into the workplace, even in high-pressure environments.",
    href: "/partner/amplify",
    color: "gold",
  },
];

/* ── Quick links ─────────────────────────────────────────────────────── */

interface QuickLink {
  emoji: string;
  label: string;
  href: string;
  external?: boolean;
}

const quickLinks: QuickLink[] = [
  { emoji: "💥", label: "Beat Burnout with Radical Mindfulness", href: "/radical-mindfulness" },
  { emoji: "🎤", label: "Book Sierra to Speak", href: "/speaking/sierra" },
  { emoji: "📝", label: "Read the Latest from the Porch", href: "/resources/insights" },
  {
    emoji: "🦙",
    label: "Follow Mindfulness.Sherpa on Instagram",
    href: "https://www.instagram.com/mindfulness.sherpa/reels/",
    external: true,
  },
  {
    emoji: "💪",
    label: "Tips to Stay Present on TikTok",
    href: "https://www.tiktok.com/@mindfulnesssherpa",
    external: true,
  },
  {
    emoji: "📺",
    label: "Radical Mindfulness on YouTube",
    href: "https://youtube.com/playlist?list=PLhdPibIQvwhH4j94ohc0BsOJqUud4xzoL",
    external: true,
  },
  {
    emoji: "🕰",
    label: "Mindful Moments on Facebook",
    href: "https://www.facebook.com/watch/110840023956370/372261090552283",
    external: true,
  },
];

/* ── Color helpers ───────────────────────────────────────────────────── */

const colorMap: Record<OfferingCard["color"], string> = {
  teal: "border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10",
  gold: "border-secondary/30 hover:border-secondary bg-secondary/5 hover:bg-secondary/10",
  purple: "border-strategic/30 hover:border-strategic bg-strategic/5 hover:bg-strategic/10",
  lime: "border-accent/30 hover:border-accent bg-accent/5 hover:bg-accent/10",
  raspberry: "border-destructive/30 hover:border-destructive bg-destructive/5 hover:bg-destructive/10",
};

const dotColorMap: Record<OfferingCard["color"], string> = {
  teal: "bg-primary",
  gold: "bg-secondary",
  purple: "bg-strategic",
  lime: "bg-accent",
  raspberry: "bg-destructive",
};

/* ── Component ───────────────────────────────────────────────────────── */

export default function AboutSierra() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center md:pt-28 md:pb-16">
          {/* Photo */}
          <div className="mx-auto mb-8 h-44 w-44 overflow-hidden rounded-full border-4 border-gold shadow-lg md:h-56 md:w-56">
            <img
              src={sierraPhoto}
              alt="Sierra Ramm Cantrell"
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy">
            Hi! I'm Sierra
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground/80">
            I am that zany, madcap person in your life who makes animal noises, breaks out into song, and will guide you to balance your energy. I've taught yoga and meditation for over 12 years, traveled all 50 states, and only recently learned how to ride a bike. While I'm a quadruple threat (dancer/actor/singer/director), childhood development guide, homeschool teacher, mindfulness sherpa, and mom (of a very active child!), my true life purpose is to guide everyone I cross paths with to lead a more <strong className="text-navy">joyful, authentic life</strong>.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact?interest=general&message=I'd like to connect with Sierra."
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-poppins font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Coffee className="h-4 w-4" />
              Let's Connect
            </Link>
            <Link
              to="/speaking/sierra"
              className="inline-flex items-center gap-2 rounded-lg bg-gold px-6 py-3 font-poppins font-semibold text-navy transition hover:opacity-90"
            >
              <Heart className="h-4 w-4" />
              Book Sierra to Speak
            </Link>
          </div>
        </div>
      </section>

      {/* ── YOUTUBE EMBED ────────────────────────────────────────────── */}
      <section className="bg-navy py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white">
            Radical Mindfulness in Action
          </h2>
          <p className="mt-2 text-white/70">How to Celebrate Presence (Birthday Candle Breath)</p>
          <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-xl shadow-2xl">
            <div className="relative aspect-video">
              <iframe
                src="https://www.youtube.com/embed/QC_6yGQAPz0"
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Radical Mindfulness | How to Celebrate Presence"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── WHAT I DO ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy">
              What I Do
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-foreground/70">
              From mindfulness coaching to team workshops, here's how we can work together to build resilience and lead with joy.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map((card) => {
              const isExternal = card.external;
              const Wrapper = isExternal ? "a" : Link;
              const wrapperProps = isExternal
                ? { href: card.href, target: "_blank", rel: "noopener noreferrer" }
                : { to: card.href };

              return (
                <Wrapper
                  key={card.title}
                  {...(wrapperProps as any)}
                  className={`group relative rounded-xl border-2 p-6 transition-all duration-300 ${colorMap[card.color]}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{card.emoji}</span>
                    <div>
                      <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy group-hover:text-primary transition-colors">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                        {card.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    {isExternal ? "Visit" : "Explore"} <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                  <span
                    className={`absolute top-4 right-4 h-2 w-2 rounded-full ${dotColorMap[card.color]}`}
                  />
                </Wrapper>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ──────────────────────────────────────────────── */}
      <section className="bg-muted/50 py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl md:text-4xl text-center font-poppins font-bold text-navy">
            Explore & Connect
          </h2>
          <p className="mt-3 text-center text-foreground/60">
            Resources, inspiration, and community
          </p>

          <div className="mt-10 flex flex-col gap-3">
            {quickLinks.map((link) => {
              const isExternal = link.external;
              const Component = isExternal ? "a" : Link;
              const props = isExternal
                ? { href: link.href, target: "_blank", rel: "noopener noreferrer" }
                : { to: link.href };

              return (
                <Component
                  key={link.label}
                  {...(props as any)}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-background px-5 py-4 font-medium text-navy shadow-sm transition-all hover:border-primary hover:shadow-md"
                >
                  <span className="text-lg">{link.emoji}</span>
                  <span className="flex-1">{link.label}</span>
                  {isExternal ? (
                    <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  )}
                </Component>
              );
            })}
          </div>
        </div>
      </section>


      {/* ── COFFEE CTA ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="rounded-2xl border-2 border-gold/20 bg-gold/5 px-8 py-12 md:px-12">
            <span className="text-5xl">🧘</span>
            <h2 className="text-3xl md:text-4xl mt-4 font-poppins font-bold text-navy">
              Ready to Lead with More Joy?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-foreground/70">
              Whether you're navigating burnout, building resilience, or simply seeking more joy in your work and life, let's chat.
            </p>
            <Link
              to="/contact?interest=general&message=I'd like to connect with Sierra."
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gold px-8 py-4 font-poppins font-semibold text-navy transition hover:opacity-90"
            >
              <Coffee className="h-5 w-5" />
              Let's Connect
              <ArrowRight className="h-4 w-4 opacity-60" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
