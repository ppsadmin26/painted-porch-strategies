import { Link } from "react-router-dom";
import {
  ExternalLink,
  ArrowRight,
  Podcast,
  Users,
  BookOpen,
} from "lucide-react";
import ppsLogo from "@/assets/pps-logo.png";

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
    emoji: "🧘",
    title: "Radical Mindfulness",
    description:
      "Find peace and power with the obstacles & opportunities in life and work, and build resilience to life's challenges.",
    href: "/radical-mindfulness",
    color: "gold",
  },
  {
    emoji: "📢",
    title: "Master Your Message",
    description:
      "Eliminate the static from your internal & external messaging to communicate with clarity, confidence, and influence.",
    href: "/master-your-message",
    color: "teal",
  },
  {
    emoji: "🤝",
    title: "Extraordinary Teams",
    description:
      "Better connect and collaborate with the teams & people you interact with in life and work.",
    href: "/extraordinary-teams",
    color: "purple",
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
  { emoji: "🧩", label: "Discover Your Elemental Style", href: "https://paintedporchstrategies.aidaform.com/your-elemental-style-free", external: true },
  { emoji: "🚪", label: "Open the Blue Door, Free Organizational Appraisal", href: "/blue-door" },
  { emoji: "🧭", label: "Not Sure Where to Start? Start Here", href: "/start-here" },
  { emoji: "🤝", label: "Partner With Us", href: "/partner" },
  { emoji: "🎤", label: "Book a Speaker", href: "/speaking" },
  { emoji: "📺", label: "Learn How to Thrive Through Change on YouTube", href: "/resources/youtube" },
  { emoji: "📝", label: "Read the Latest from the Porch", href: "/resources/insights" },
  { emoji: "📥", label: "Free Downloads & Resources", href: "/resources/free" },
  { emoji: "📧", label: "Get in Touch", href: "/contact?interest=general" },
];

/* ── Meet the team ───────────────────────────────────────────────────── */

interface TeamLink {
  name: string;
  title: string;
  href: string;
  accent: string;
}

const teamLinks: TeamLink[] = [
  { name: "Amy Yackowski", title: "Founder & Organizational Shift Strategist", href: "/amy", accent: "border-strategic/30 hover:border-strategic" },
  { name: "Rob Hunter", title: "Master of Communication", href: "/rob", accent: "border-primary/30 hover:border-primary" },
  { name: "Sierra Ramm Cantrell", title: "Mindfulness Sherpa", href: "/sierra", accent: "border-secondary/30 hover:border-secondary" },
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

export default function PPSOverview() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center md:pt-28 md:pb-16">
          {/* Logo */}
          <div className="mx-auto mb-8 flex justify-center">
            <img
              src={ppsLogo}
              alt="Painted Porch Strategies"
              className="h-36 w-auto md:h-44"
              loading="eager"
            />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy">
            Welcome to the Painted Porch!
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-lead leading-relaxed text-foreground/80">
            Master the foundational skills for modern-day leadership and successful change in this ever-evolving and demanding world.
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-body text-foreground/60">
            Our stoically-inspired training and advisory programs partner with leaders, learners, and organizations to achieve excellence through developing emotional resilience, quality connections, strong communication skills, and a mission-centered purpose and strategy.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/start-here"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-poppins font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <BookOpen className="h-4 w-4" />
              Start Here
            </Link>
            <Link
              to="/contact?interest=general"
              className="inline-flex items-center gap-2 rounded-lg bg-muted-foreground px-6 py-3 font-poppins font-semibold text-white transition hover:opacity-90"
            >
              <Users className="h-4 w-4" />
              Connect With Us
            </Link>
          </div>
        </div>
      </section>

      {/* ── INTRO VIDEO ──────────────────────────────────────────────── */}
      <section className="bg-navy py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white">
            What Is Painted Porch Strategies?
          </h2>
          <p className="mt-2 text-white/70">Porch Perspectives</p>
          <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-xl shadow-2xl">
            <div className="relative aspect-video">
              <iframe
                src="https://www.youtube.com/embed/JKCEO-hGbcI"
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="What Is Painted Porch Strategies? | Porch Perspectives"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── SIGNATURE PROGRAMS ───────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy">
              Our Signature Programs
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-foreground/70">
              Foundational programs designed to build capacity, clarity, and connection across your life and work.
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
                    <p className="mt-2 text-body-sm leading-relaxed text-foreground/70">
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
            Resources, programs, and ways to get started
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

      {/* ── MEET THE TEAM ────────────────────────────────────────────── */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl md:text-4xl text-center font-poppins font-bold text-navy">
            Meet the Team
          </h2>
          <p className="mt-3 text-center text-foreground/60">
            Get to know the people behind the Porch
          </p>

          <div className="mt-10 flex flex-col gap-3">
            {teamLinks.map((member) => (
              <Link
                key={member.name}
                to={member.href}
                className={`group flex items-center gap-4 rounded-lg border-2 bg-background px-5 py-4 shadow-sm transition-all hover:shadow-md ${member.accent}`}
              >
                <div className="flex-1">
                  <p className="font-poppins font-semibold text-navy">{member.name}</p>
                  <p className="text-body-sm text-foreground/60">{member.title}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PODCAST ──────────────────────────────────────────────────── */}
      <section className="bg-navy py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-3xl md:text-4xl text-center font-poppins font-bold text-white">
            Listen In
          </h2>
          <p className="mt-3 text-center text-white/60">
            Podcasts from the Painted Porch
          </p>

          <div className="mt-10 grid gap-8 md:grid-cols-2">
            {/* Equal Matters */}
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-8 text-center">
              <div className="mb-4 overflow-hidden rounded-xl shadow-lg">
                <img
                  src="https://images.pod.co/BDojqLokk-XUwSn0QlNHrCPZfjqFkeyZ3jUw3RlidmM/resize:fill:300:300/plain/artwork/0a538a7b-cc6a-4bb9-b9d5-4a0b290dadc1/equalmatters.jpg"
                  alt="Equal Matters podcast artwork"
                  className="h-40 w-40 rounded-xl object-cover"
                  loading="lazy"
                />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-white">
                Equal Matters
              </h3>
              <p className="mt-2 text-body-sm text-white/60">
                Rob Hunter
              </p>
              <a
                href="https://podcasts.apple.com/us/podcast/equal-matters/id1693631305"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition hover:opacity-90"
              >
                <Podcast className="h-4 w-4" />
                Listen Now
              </a>
            </div>

            {/* Life & Logos */}
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
              <p className="mt-2 text-body-sm text-white/60">
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

      {/* ── FINAL CTA ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 px-8 py-12 md:px-12">
            <span className="text-5xl">🏛️</span>
            <h2 className="text-3xl md:text-4xl mt-4 font-poppins font-bold text-navy">
              Ready to ShIFt?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-foreground/70">
              Whether you're exploring change for yourself, your team, or your entire organization, we'd love to hear from you.
            </p>
            <Link
              to="/contact?interest=general"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 font-poppins font-semibold text-white transition hover:opacity-90"
            >
              Let's Connect
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
