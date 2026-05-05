import { Link } from "react-router-dom";
import {
  Mic,
  Coffee,
  ExternalLink,
  ArrowRight,
  Podcast,
} from "lucide-react";
import robPhoto from "@/assets/team/rob-hunter.jpg";

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
    emoji: "📢",
    title: "Master Your Message",
    description:
      "An online program designed to sharpen your communication skills and broadcast your ideas with clarity and confidence.",
    href: "/master-your-message",
    color: "teal",
  },
  {
    emoji: "🎤",
    title: "Speaking & Keynotes",
    description:
      "From High-Fidelity Communication to Radio-Ready Confidence, Rob delivers sessions that sharpen how teams speak, connect, and lead.",
    href: "/speaking/rob",
    color: "purple",
  },
  {
    emoji: "💡",
    title: "Get C.L.E.A.R. Framework",
    description:
      "Clarity. Language. Energy. Attention. Relevance. Download the free framework to simplify your message and boost engagement.",
    href: "/resources/downloads",
    color: "gold",
  },
  {
    emoji: "🎙",
    title: "1:1 Get C.L.E.A.R. Coaching",
    description:
      "Personal coaching sessions to master your messaging, presence, and delivery — from boardrooms to breakouts.",
    href: "/contact?scope=Yourself&interest=1on1-advisory&message=I'm interested in 1:1 coaching with Rob.",
    color: "lime",
  },
  {
    emoji: "🚀",
    title: "AMPLIFY: Communication Workshops",
    description:
      "Focused team workshops and sprints that build compound momentum in communication clarity and confidence.",
    href: "/partner/amplify",
    color: "raspberry",
  },
  {
    emoji: "🎯",
    title: "5-Day Master Your Message Challenge",
    description:
      "A quick-start challenge to transform how you communicate — in just five days.",
    href: "https://www.paintedporchstrategies.com/talking-to-strangers",
    external: true,
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
  { emoji: "📢", label: "Master Your Message Online Program", href: "/master-your-message" },
  { emoji: "🎤", label: "Book Rob to Speak", href: "/speaking/rob" },
  { emoji: "📝", label: "Read the Latest from the Porch", href: "/resources/insights" },
  {
    emoji: "🗽",
    label: "Read Equal Matters on Substack",
    href: "https://robhunter.substack.com/",
    external: true,
  },
  {
    emoji: "🎧",
    label: "Listen to Equal Matters Podcast",
    href: "https://podcasts.apple.com/us/podcast/equal-matters/id1693631305",
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

export default function AboutRob() {
  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-muted/50 to-background">
        <div className="mx-auto max-w-4xl px-6 pt-20 pb-12 text-center md:pt-28 md:pb-16">
          {/* Photo */}
          <div className="mx-auto mb-8 h-44 w-44 overflow-hidden rounded-full border-4 border-muted-foreground shadow-lg md:h-56 md:w-56">
            <img
              src={robPhoto}
              alt="Rob Hunter"
              className="h-full w-full object-cover"
              loading="eager"
            />
          </div>

          <h1 className="font-poppins text-4xl font-bold text-navy md:text-5xl">
            It's Time to Get C.L.E.A.R.
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-base text-foreground/70">
            You have 8 seconds to Capture &amp; Keep someone's attention. Get your point across <strong className="text-navy">Quicker</strong> &amp; <strong className="text-navy">Clearer</strong>.
          </p>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-foreground/80">
            Hi, I'm <strong className="text-navy">Rob Hunter</strong>. For 27 years, I honed my communication as a talk radio broadcaster, finding ways to connect with listeners… and keep them tuning in every day, retiring with #1 ratings. Now, I partner with emerging leaders and executives to master their message and broadcast with clarity — to stand out, be heard, inspire action, and make an impact.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact?interest=general&message=I'd like to connect with Rob."
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-poppins font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Coffee className="h-4 w-4" />
              Let's Connect
            </Link>
            <Link
              to="/speaking/rob"
              className="inline-flex items-center gap-2 rounded-lg bg-muted-foreground px-6 py-3 font-poppins font-semibold text-white transition hover:opacity-90"
            >
              <Mic className="h-4 w-4" />
              Book Rob to Speak
            </Link>
          </div>
        </div>
      </section>

      {/* ── YOUTUBE EMBED ────────────────────────────────────────────── */}
      <section className="bg-navy py-12 md:py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-poppins text-2xl font-bold text-white md:text-3xl">
            Communication: The Key to Your Success
          </h2>
          <p className="mt-2 text-white/70">Porch Perspectives</p>
          <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-xl shadow-2xl">
            <div className="relative aspect-video">
              <iframe
                src="https://www.youtube.com/embed/xmja3NjSL8A"
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Communication: The Key to Your Success | Porch Perspectives"
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
            <h2 className="font-poppins text-3xl font-bold text-navy md:text-4xl">
              What I Do
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-foreground/70">
              From frameworks to 1:1 coaching, here's how we can work together to master your message and make it matter.
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
                      <h3 className="font-poppins text-lg font-semibold text-navy group-hover:text-primary transition-colors">
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
          <h2 className="text-center font-poppins text-3xl font-bold text-navy md:text-4xl">
            Explore & Connect
          </h2>
          <p className="mt-3 text-center text-foreground/60">
            Resources, insights, and community
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

      {/* ── EQUAL MATTERS PODCAST ─────────────────────────────────────── */}
      <section className="bg-navy py-16 md:py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center font-poppins text-3xl font-bold text-white md:text-4xl">
            Listen In
          </h2>
          <p className="mt-3 text-center text-white/60">
            Equal Matters Podcast &amp; Life &amp; Logos on The Painted Porch
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
              <h3 className="font-poppins text-xl font-bold text-white">
                Equal Matters
              </h3>
              <p className="mt-2 text-sm text-white/60">
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
              <h3 className="font-poppins text-xl font-bold text-white">
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
            <span className="text-5xl">🎙</span>
            <h2 className="mt-4 font-poppins text-3xl font-bold text-navy">
              Ready to Get C.L.E.A.R.?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-foreground/70">
              Whether you want to sharpen your speaking skills, master your message, or build communication confidence — let's talk.
            </p>
            <Link
              to="/contact?interest=general&message=I'd like to connect with Rob."
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
