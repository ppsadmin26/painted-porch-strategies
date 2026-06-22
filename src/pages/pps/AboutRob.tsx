import { Link } from "react-router-dom";
import {
  Mic,
  Coffee,
  ExternalLink,
  ArrowRight,
  Podcast,
  Youtube,
} from "lucide-react";
import { YouTubeCarousel } from "@/components/pps/YouTubeCarousel";

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
    href: "https://onthepaintedporch.com/communication",
    external: true,
    color: "teal",
  },
  {
    emoji: "🎤",
    title: "Speaking & Keynotes",
    description:
      "From High-Fidelity Communication to On-Air Ready Confidence, Rob delivers sessions that sharpen how teams speak, connect, and lead.",
    href: "/speaking/rob",
    color: "purple",
  },
  {
    emoji: "💡",
    title: "6 Communicator Styles",
    description:
      "Discover your natural communication style and learn how to connect more effectively with every audience.",
    href: "https://onthepaintedporch.com/6-communicator-styles",
    external: true,
    color: "gold",
  },
  {
    emoji: "🎙",
    title: "1:1 Get C.L.E.A.R. Coaching",
    description:
      "Personal coaching sessions to master your messaging, presence, and delivery, from boardrooms to breakouts.",
    href: "https://robhunter.me/whiteboard",
    external: true,
    color: "lime",
  },
  {
    emoji: "📼",
    title: "Cassette Tape Stories",
    description:
      "An online storytelling course built from 27 years behind the mic. Learn how to turn your experiences into unforgettable narratives that capture attention and drive results.",
    href: "https://robhunter.me/cassette-tape-stories",
    external: true,
    color: "purple",
  },
  {
    emoji: "🎯",
    title: "Communication Masterclasses & Mini-Workshops",
    description:
      "On-demand and live sessions to sharpen how you speak, listen, and lead through every conversation.",
    href: "https://onthepaintedporch.com/partner/ignite/masterclasses?category=Communication%20%26%20Connection",
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
  { emoji: "📢", label: "Master Your Message Online Program", href: "/communication" },
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
    href: "https://open.spotify.com/show/5lYP2GwhZU71rVNEufvm3U",
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

/* ── Equal Matters YouTube videos ──────────────────────────────────────── */

interface YouTubeVideoItem {
  id: string;
  title: string;
}

const equalMattersVideos: YouTubeVideoItem[] = [
  { id: "Yuv00QC0bmg", title: "One Word Almost Cost Me Everything. Until I rewrote my story." },
  { id: "ciB457c8ToQ", title: "One Word Almost Cost Me Everything. How to Rewrite Your Life Story." },
  { id: "5Tqms7WJD2k", title: "Everything is Fake. Propaganda is everywhere." },
  { id: "b4ROlvC1Dfs", title: "You're Being Played by AI (And You've Been Played Before)" },
  { id: "7LssTPXg-lw", title: "You're the Quarterback of Your Life (And Here's Why That Matters)" },
  { id: "9GXYOul7CsU", title: "Are You Grinding Your Career Away or Going All In on Yourself?" },
  { id: "GUYqtpDgMrw", title: "Confessions of a Talk Show Host: How Language is Used to Divide Us and Who Gets Rich" },
  { id: "K9_GIn40OIU", title: "You are the Quarterback of your life." },
];

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

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-navy">
            It's Time to Get C.L.E.A.R.
          </h1>

          <p className="text-body mx-auto mt-4 max-w-xl text-foreground/70">
            You have 8 seconds to Capture &amp; Keep someone's attention. Get your point across <strong className="text-navy">Quicker</strong> &amp; <strong className="text-navy">Clearer</strong>.
          </p>

          <p className="text-body mx-auto mt-6 max-w-2xl leading-relaxed text-foreground/80">
            Hi, I'm <strong className="text-navy">Rob Hunter</strong>. For 27 years, I honed my communication as a talk radio broadcaster, finding ways to connect with listeners… and keep them tuning in every day, retiring with #1 ratings. Now, I partner with emerging leaders and executives to master their message and broadcast with clarity, to stand out, be heard, inspire action, and make an impact.
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


      {/* ── WHAT I DO ────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy">
              What I Do
            </h2>
            <p className="text-body mx-auto mt-4 max-w-2xl text-foreground/70">
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
                      <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy group-hover:text-primary transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-body mt-2 -sm leading-relaxed text-foreground/70">
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

      {/* ── EQUAL MATTERS ON YOUTUBE ─────────────────────────────────── */}
      <section className="py-16 md:py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy">
              Equal Matters on YouTube
            </h2>
            <p className="text-body mx-auto mt-3 max-w-xl text-foreground/60">
              Raw takes on communication, culture, and the stories that shape how we connect.
            </p>
          </div>

          <YouTubeCarousel
            videos={equalMattersVideos}
            getHref={(video) =>
              `https://www.youtube.com/watch?v=${video.id}`
            }
          />


          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://www.youtube.com/@EqualMatters"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-destructive px-6 py-3 font-poppins font-semibold text-white transition hover:opacity-90"
            >
              <Youtube className="h-5 w-5" />
              Subscribe on YouTube
            </a>
            <a
              href="https://www.youtube.com/@EqualMatters"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-navy px-6 py-3 font-poppins font-semibold text-navy transition hover:bg-navy hover:text-white"
            >
              View Channel
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── QUICK LINKS ──────────────────────────────────────────────── */}
      <section className="bg-muted/50 py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="text-3xl md:text-4xl text-center font-poppins font-bold text-navy">
            Explore & Connect
          </h2>
          <p className="text-body mt-3 text-center text-foreground/60">
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
          <h2 className="text-3xl md:text-4xl text-center font-poppins font-bold text-white">
            Listen In
          </h2>
          <p className="text-body mt-3 text-center text-white/60">
            Equal Matters Podcast
          </p>

          <div className="mt-10 flex justify-center">
            <div className="flex flex-col items-center justify-center rounded-xl bg-white/10 p-8 text-center w-full max-w-md">
              <div className="mb-4 w-full overflow-hidden rounded-xl shadow-lg">
                <iframe
                  src="https://open.spotify.com/embed/show/5lYP2GwhZU71rVNEufvm3U"
                  width="100%"
                  height="232"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title="Equal Matters Spotify Podcast"
                  className="rounded-xl"
                />
              </div>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-white">
                Equal Matters
              </h3>
              <p className="text-body mt-2 -sm text-white/60">
                Rob Hunter
              </p>
              <a
                href="https://open.spotify.com/show/5lYP2GwhZU71rVNEufvm3U"
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
            <h2 className="text-3xl md:text-4xl mt-4 font-poppins font-bold text-navy">
              Ready to Get C.L.E.A.R.?
            </h2>
            <p className="text-body mx-auto mt-4 max-w-md text-foreground/70">
              Whether you want to sharpen your speaking skills, master your message, or build communication confidence, let's talk.
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
