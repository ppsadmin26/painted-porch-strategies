import { Link } from "react-router-dom";
import {
  Mic,
  Coffee,
  ExternalLink,
  ArrowRight,
  Podcast,
} from "lucide-react";

const amyPhoto =
  "https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2150151357/settings_images/fce7a8-d552-0faa-8bf-26ba8ece8d6_Amy_Yackowski_-_NEW_round_.png";

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
    emoji: "🚪",
    title: "The Blue Door Diagnostic",
    description:
      "A strategic 11-question assessment that reveals where your organization stands — and what shift you're positioned to lead.",
    href: "/blue-door",
    color: "teal",
  },
  {
    emoji: "🎤",
    title: "Speaking & Keynotes",
    description:
      "From Stoicism in the Workplace to AI adoption, Amy delivers transformational talks that move audiences from insight to action.",
    href: "/speaking/amy",
    color: "purple",
  },
  {
    emoji: "⚡",
    title: "IGNITE: Self-Led Growth",
    description:
      "Masterclasses, assessments, and self-paced courses designed to light the fire of transformation — on your terms.",
    href: "/partner/ignite",
    color: "gold",
  },
  {
    emoji: "🚀",
    title: "AMPLIFY: Workshops & Labs",
    description:
      "Focused partnership through workshops, sprints, and labs that shape excellence and build compound momentum.",
    href: "/partner/amplify",
    color: "lime",
  },
  {
    emoji: "🏛️",
    title: "EMBODY: Strategic Partnership",
    description:
      "Embedded executive advisory and full transformation architecture for C-suite leaders ready to build unshakeable foundations.",
    href: "/partner/embody",
    color: "raspberry",
  },
  {
    emoji: "🧠",
    title: "EQ & Assessments",
    description:
      "Curious about how to 'Do E.Q.' and lead in life & work? Explore our emotional intelligence tools and assessments.",
    href: "/eq",
    color: "teal",
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
  { emoji: "🔼", label: "Are You Ready for the Next Big Shift?", href: "/blue-door" },
  { emoji: "📈", label: "Develop a Shift-Ready Organization", href: "/partner" },
  { emoji: "🤼‍♀️", label: "Create Extraordinary Teams", href: "/extraordinary-teams" },
  { emoji: "🧭", label: "Explore Stoic Wisdom & Resources", href: "/radical-mindfulness" },
  { emoji: "📝", label: "Read the Latest from the Porch", href: "/resources/insights" },
  {
    emoji: "👋",
    label: "Connect with me on LinkedIn",
    href: "https://www.linkedin.com/in/ayackowski/",
    external: true,
  },
  {
    emoji: "📖",
    label: "Follow me on Medium",
    href: "https://medium.com/@amyyack",
    external: true,
  },
  {
    emoji: "🎵",
    label: "Join our Dance Party on Spotify",
    href: "https://open.spotify.com/playlist/1F6mkBYTllBzwawCXDEmry",
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

export default function AboutAmy() {
  return (
    <>

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center md:pt-28 md:pb-16">
          {/* Photo */}
          <div className="mx-auto mb-8 h-44 w-44 overflow-hidden rounded-full border-4 border-primary shadow-lg md:h-56 md:w-56">
            <img
              src={amyPhoto}
              alt="Amy Yackowski"
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy">
            Hi! I'm Amy
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground/80">
            <strong className="text-navy">Welcome to the Painted Porch!</strong>{" "}
            You can call me Amy Yack; my friends do. I've spent over 20 years
            seeking out and partnering with leaders and learners to design
            strategies and programs that connect people and systems to a clear
            purpose, optimized process, and noble mission. Through challenging
            business as usual with courage, curiosity, and a little play, we can
            confidently navigate the sea of change — one small shift at a time.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact?interest=general&message=I'd like to connect with Amy."
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-poppins font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Coffee className="h-4 w-4" />
              Let's Connect
            </Link>
            <Link
              to="/speaking/amy"
              className="inline-flex items-center gap-2 rounded-lg bg-secondary px-6 py-3 font-poppins font-semibold text-secondary-foreground transition hover:opacity-90"
            >
              <Mic className="h-4 w-4" />
              Book Amy to Speak
            </Link>
          </div>
        </div>
      </section>

      {/* ── SPEAKER REEL ─────────────────────────────────────────────── */}
      <section className="bg-navy py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white">
            See Amy in Action
          </h2>
          <p className="mt-2 text-white/70">Expert Speaker Reel</p>
          <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-xl shadow-2xl">
            <div className="relative aspect-video">
              <iframe
                src="https://newvector.vids.io/videos/d390d3b51b1be0c35a/embed"
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="Amy Yackowski Speaker Reel"
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
              From strategic diagnostics to embedded partnerships, here's how we
              can work together to architect extraordinary outcomes.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {offerings.map((card) => (
              <Link
                key={card.title}
                to={card.href}
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
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </div>
                <span
                  className={`absolute top-4 right-4 h-2 w-2 rounded-full ${dotColorMap[card.color]}`}
                />
              </Link>
            ))}
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
            Quick links to resources, insights, and community
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

      {/* ── YOUTUBE EMBED ────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy">
            From the Porch
          </h2>
          <p className="mt-3 text-foreground/60">
            How to take a Stoic perspective to conflict
          </p>
          <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-xl shadow-lg">
            <div className="relative aspect-video">
              <iframe
                src="https://www.youtube.com/embed/9aumBiSDyOg"
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="How to Take a Stoic Perspective to Conflict"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SPOTIFY + PODCAST ────────────────────────────────────────── */}
      <section className="bg-navy py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl md:text-4xl text-center font-poppins font-bold text-white">
            Listen In
          </h2>
          <p className="mt-3 text-center text-white/60">
            Our dance party playlist & podcast
          </p>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {/* Spotify */}
            <div className="overflow-hidden rounded-xl shadow-lg">
              <iframe
                src="https://open.spotify.com/embed/playlist/1F6mkBYTllBzwawCXDEmry?utm_source=generator&theme=0"
                width="100%"
                height="352"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl border-0"
                title="Painted Porch Playlist on Spotify"
              />
            </div>

            {/* Podcast */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-8 text-center">
              <div className="mb-4 overflow-hidden rounded-xl shadow-lg">
                <img
                  src="https://images.pod.co/-Cj9qH3q7WsT68E1m-CVTQZQSgUHyTatyn5EJWF8SY4/resize:fill:300:300/plain/artwork/1c402a42-483b-4573-be65-f154ea2bee00/on-the-porch.jpg"
                  alt="Life & Logos on The Painted Porch podcast artwork"
                  className="h-40 w-40 rounded-xl object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-white">
                Life & Logos on The Painted Porch
              </h3>
              <p className="mt-2 text-sm text-white/60">
                The Team at Painted Porch Strategies
              </p>
              <a
                href="https://pod.co/life-logos-on-the-painted-porch"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition hover:opacity-90"
              >
                <Podcast className="h-4 w-4" />
                Listen Now
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── COFFEE CTA ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 px-8 py-12 md:px-12">
            <span className="text-5xl">☕</span>
            <h2 className="text-3xl md:text-4xl mt-4 font-poppins font-bold text-navy">
              Meet for a Virtual Coffee or Cocktail
            </h2>
            <p className="mx-auto mt-4 max-w-md text-foreground/70">
              Ready to explore how we might work together? Let's chat — no
              pressure, just a genuine conversation about where you are and where
              you want to be.
            </p>
            <Link
              to="/contact?interest=general&message=I'd like to connect with Amy."
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 font-poppins font-semibold text-white transition hover:opacity-90"
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
