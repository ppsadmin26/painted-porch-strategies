import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Download } from "lucide-react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { Eyebrow } from "@/components/pps/Eyebrow";

import ppsLogo from "@/assets/pps-logo.png";
import ppsLogoWhite from "@/assets/pps-logo-white.png";

import acmp from "@/assets/certifications/acmp-member.png";
import asaMember from "@/assets/certifications/asa-member.png";
import changeNavigator from "@/assets/certifications/change-navigator.png";
import csi from "@/assets/certifications/csi.png";
import discFacilitator from "@/assets/certifications/disc-facilitator.png";
import eqLeader from "@/assets/certifications/emotionally-effective-leader.png";
import eq360 from "@/assets/certifications/eq360.png";
import leanChangeAgent from "@/assets/certifications/lean-change-agent.png";
import leanChangeAi from "@/assets/certifications/lean-change-ai.png";
import mawFacilitator from "@/assets/certifications/maw-facilitator.png";
import prosci from "@/assets/certifications/prosci-change-practitioner.png";
import scrumPsd from "@/assets/certifications/scrum-psd.png";
import workingGenius from "@/assets/certifications/working-genius.png";
import wpcRecommended from "@/assets/certifications/wpc-recommended.png";

import homeHero from "@/assets/heroes/home-hero.jpg";
import aboutHero from "@/assets/heroes/about-hero.jpg";
import approachHero from "@/assets/heroes/approach-hero.jpg";
import phaseZeroHero from "@/assets/heroes/phase-zero-hero.jpg";
import speakingHero from "@/assets/heroes/speaking-hero.jpg";
import startHereHero from "@/assets/heroes/start-here-hero.jpg";
import blueDoorHero from "@/assets/blue-door-hero.jpg";
import paintedBoards from "@/assets/painted-boards-accent.jpg";

/* ---------------------------------------------------------------- data ---- */

type Swatch = {
  name: string;
  hex: string;
  token: string;
  usage: string;
  /** Use white text when previewing large blocks of this color. */
  dark?: boolean;
};

const CORE_COLORS: Swatch[] = [
  { name: "Teal Blue", hex: "#007697", token: "primary / pps-teal", usage: "Primary brand color. Main CTAs, links, headings accent.", dark: true },
  { name: "Navy", hex: "#00006B", token: "navy / pps-navy", usage: "Deep authority. Headers, footer background, EMBODY tier.", dark: true },
  { name: "Cobalt (Blue Door)", hex: "#0057AE", token: "bluedoor", usage: "Reserved for The Blue Door. Every /blue-door CTA uses cobalt.", dark: true },
  { name: "Raspberry", hex: "#DB0043", token: "raspberry / pps-raspberry", usage: "Pain, cost, emphasis. The IF in shIFt when framing a problem.", dark: true },
  { name: "Lime Green", hex: "#70A300", token: "lime / pps-lime", usage: "Success, partnership promise, positive proof points.", dark: true },
  { name: "Gold", hex: "#E8A231", token: "gold / pps-gold", usage: "Warm accent, value propositions, IGNITE tier.", },
  { name: "Purple", hex: "#523387", token: "strategic / pps-purple", usage: "Strategic and thoughtful content. AMPLIFY tier.", dark: true },
  { name: "Charcoal Gray", hex: "#545454", token: "foreground", usage: "Primary body text across the site.", dark: true },
  { name: "White", hex: "#FFFFFF", token: "background", usage: "Dominant background. Generous whitespace is part of the brand." },
];

type Asset = {
  name: string;
  src: string;
  download: string;
  note?: string;
  /** Preview on a dark tile. */
  dark?: boolean;
};

type Group = {
  title: string;
  blurb: string;
  items: Asset[];
  tile?: "square" | "landscape" | "wide";
};

const GROUPS: Group[] = [
  {
    title: "Logos",
    blurb:
      "The full Painted Porch Strategies lockup. Keep clear space around the logo, never rotate, skew, recolor, or add effects. Minimum size 150px digital / 1 inch print.",
    tile: "wide",
    items: [
      { name: "pps-logo.png", src: ppsLogo, download: "pps-logo.png", note: "Primary · light backgrounds" },
      { name: "pps-logo-white.png", src: ppsLogoWhite, download: "pps-logo-white.png", note: "Reversed · dark backgrounds", dark: true },
    ],
  },
  {
    title: "Favicon & App Icon",
    blurb: "Browser tab, bookmark, and app icon. Use the square mark only, never the full lockup, at these sizes.",
    tile: "square",
    items: [
      { name: "favicon.png", src: "/favicon.png", download: "favicon.png", note: "PNG master" },
      { name: "favicon.ico", src: "/favicon.ico", download: "favicon.ico", note: "Legacy ICO" },
    ],
  },
  {
    title: "Certifications & Credentials",
    blurb:
      "Badges Amy is licensed to display. Use only on pages where the credential is relevant, and never alter the badge artwork.",
    tile: "square",
    items: [
      { name: "prosci-change-practitioner.png", src: prosci, download: "prosci-change-practitioner.png" },
      { name: "change-navigator.png", src: changeNavigator, download: "change-navigator.png" },
      { name: "lean-change-agent.png", src: leanChangeAgent, download: "lean-change-agent.png" },
      { name: "lean-change-ai.png", src: leanChangeAi, download: "lean-change-ai.png" },
      { name: "working-genius.png", src: workingGenius, download: "working-genius.png" },
      { name: "disc-facilitator.png", src: discFacilitator, download: "disc-facilitator.png" },
      { name: "eq360.png", src: eq360, download: "eq360.png" },
      { name: "emotionally-effective-leader.png", src: eqLeader, download: "emotionally-effective-leader.png" },
      { name: "maw-facilitator.png", src: mawFacilitator, download: "maw-facilitator.png" },
      { name: "scrum-psd.png", src: scrumPsd, download: "scrum-psd.png" },
      { name: "acmp-member.png", src: acmp, download: "acmp-member.png" },
      { name: "asa-member.png", src: asaMember, download: "asa-member.png" },
      { name: "csi.png", src: csi, download: "csi.png" },
      { name: "wpc-recommended.png", src: wpcRecommended, download: "wpc-recommended.png" },
    ],
  },
  {
    title: "Signature Imagery",
    blurb:
      "Hero and section photography in use across the site. Warm, natural light. Real people, collaboration, and architectural metaphors. No stock-looking handshakes or generic boardrooms.",
    tile: "landscape",
    items: [
      { name: "home-hero.jpg", src: homeHero, download: "home-hero.jpg", note: "Home" },
      { name: "blue-door-hero.jpg", src: blueDoorHero, download: "blue-door-hero.jpg", note: "Blue Door" },
      { name: "phase-zero-hero.jpg", src: phaseZeroHero, download: "phase-zero-hero.jpg", note: "Phase Zero" },
      { name: "about-hero.jpg", src: aboutHero, download: "about-hero.jpg", note: "About" },
      { name: "approach-hero.jpg", src: approachHero, download: "approach-hero.jpg", note: "Approach" },
      { name: "start-here-hero.jpg", src: startHereHero, download: "start-here-hero.jpg", note: "Start Here" },
      { name: "speaking-hero.jpg", src: speakingHero, download: "speaking-hero.jpg", note: "Speaking" },
      { name: "painted-boards-accent.jpg", src: paintedBoards, download: "painted-boards-accent.jpg", note: "Texture accent" },
    ],
  },
];

const VOICE_DO = [
  "Conversational yet authoritative. Wise but never stuffy.",
  "Plain English at roughly a 6th-grade reading level.",
  "Partner, co-design, activate, architect, guide.",
  "People > Process > Tech, always.",
  "Name the difference between change (the event) and transition (the human adaptation).",
  "Signature phrases: “When the shIFt hits the fan,” “ShIFt Happens,” “Do Epic ShIFt.”",
];

const VOICE_DONT = [
  "Never em-dashes (—). Use a comma, colon, or period.",
  "No servant language: help, assist, support, deliver, provide.",
  "No academic filler: leverage, facilitate, orchestrate, deploy, optimize.",
  "Never position technology as the silver bullet.",
  "No “Schedule a Discovery Call.” The CTA is always “Contact Us.”",
  "Never present change as linear, tidy, or painless.",
];

const TERMINOLOGY = [
  { term: "shIFt", rule: "Capital IF, always. Raspberry when framing a problem or cost; otherwise it inherits the page's brand color (Cobalt on Blue Door, Gold on IGNITE, Purple on AMPLIFY, Navy on EMBODY)." },
  { term: "Phase Zero™", rule: "The strategic authorship stage before execution begins. Trademark on first use." },
  { term: "P.A.T.H.™", rule: "Prepare, Align, Take Off, Habit. The execution methodology." },
  { term: "The Painted Porch Pillars™", rule: "Cultural Cornerstone, Operational Frame, Living Ecosystem. Never the deprecated names." },
  { term: "The Blue Door", rule: "$1,500 organizational appraisal. Bold and cobalt. Prerequisite for organizational engagements." },
  { term: "Trademarks", rule: "One ™ per page total, on the primary mention of that page's main concept. Never in shared components." },
];

/* ------------------------------------------------------------ component ---- */

export default function BrandLibrary() {
  useDocumentSeo({
    title: "Brand Library | Painted Porch Strategies",
    description:
      "Internal brand library for Painted Porch Strategies: logos, colors, typography, imagery, voice, and terminology rules.",
    robots: "noindex, nofollow",
  });

  const totalAssets = GROUPS.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
          <Eyebrow tone="teal" variant="pill">
            Internal · Not Publicly Listed
          </Eyebrow>
          <h1 className="font-poppins text-4xl md:text-6xl font-bold text-navy mt-4 mb-5">
            The Brand Library
          </h1>
          <p className="text-lead max-w-3xl">
            Every logo, color, typeface, image, and language rule for Painted Porch Strategies in one
            place. Share this with designers, printers, event organizers, and partners who need our
            assets, so everything that carries our name looks and sounds like us.
          </p>
          <p className="text-caption mt-5">
            {totalAssets} downloadable assets · {CORE_COLORS.length} brand colors · 2 typefaces
          </p>
          <nav className="mt-8 flex flex-wrap gap-x-6 gap-y-2">
            {["Colors", "Typography", ...GROUPS.map((g) => g.title), "Voice & Tone", "Terminology"].map(
              (label) => (
                <a
                  key={label}
                  href={`#${slug(label)}`}
                  className="text-body-sm text-primary underline underline-offset-4 hover:text-navy"
                >
                  {label}
                </a>
              ),
            )}
          </nav>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-14 md:py-20 space-y-20">
        {/* Colors */}
        <section id="colors" className="scroll-mt-28">
          <SectionHeading title="Colors" count={`${CORE_COLORS.length} swatches`} />
          <p className="text-body max-w-3xl mb-8">
            White dominates. Teal carries action. Every other color has a job, so use them with
            intent rather than decoration. Click any hex value to copy it.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {CORE_COLORS.map((c) => (
              <SwatchCard key={c.hex + c.name} swatch={c} />
            ))}
          </div>
        </section>

        {/* Typography */}
        <section id="typography" className="scroll-mt-28">
          <SectionHeading title="Typography" count="2 typefaces" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-border bg-white p-7">
              <p className="text-caption mb-3">Headings · Poppins · Bold &amp; SemiBold</p>
              <p className="font-poppins text-4xl font-bold text-navy leading-tight">
                Do Epic ShIFt
              </p>
              <p className="font-poppins text-2xl font-semibold text-primary mt-3">
                Architect the shIFt
              </p>
              <p className="text-body-sm mt-5">
                Use Poppins for every heading, eyebrow, and button label. Bold for H1 and H2,
                SemiBold for smaller headings.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-white p-7">
              <p className="text-caption mb-3">Body · Montserrat · Regular &amp; Bold</p>
              <p className="font-montserrat text-lg text-foreground leading-relaxed">
                Change is external. Transition is human. Success lives in the transition, and that is
                where we partner with you.
              </p>
              <p className="text-body-sm mt-5">
                Montserrat Regular for all body copy, Bold for key phrases. Size body text with the
                site tokens: <code className="font-mono text-xs">.text-lead</code>,{" "}
                <code className="font-mono text-xs">.text-body</code>,{" "}
                <code className="font-mono text-xs">.text-body-sm</code>,{" "}
                <code className="font-mono text-xs">.text-caption</code>.
              </p>
            </div>
          </div>
        </section>

        {/* Asset groups */}
        {GROUPS.map((g) => (
          <section key={g.title} id={slug(g.title)} className="scroll-mt-28">
            <SectionHeading title={g.title} count={`${g.items.length} files`} />
            <p className="text-body max-w-3xl mb-8">{g.blurb}</p>
            <div
              className={
                g.tile === "wide"
                  ? "grid grid-cols-1 md:grid-cols-2 gap-6"
                  : g.tile === "landscape"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5"
              }
            >
              {g.items.map((a) => (
                <AssetCard key={a.name} asset={a} tile={g.tile ?? "square"} />
              ))}
            </div>
          </section>
        ))}

        {/* Voice & Tone */}
        <section id="voice-tone" className="scroll-mt-28">
          <SectionHeading title="Voice & Tone" count="Huggable bear" />
          <p className="text-body max-w-3xl mb-8">
            We come in with kindness and stay long enough to ask the uncomfortable question.
            Supportive and challenging at the same time.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border-2 border-lime bg-lime/5 p-7">
              <p className="font-poppins font-semibold text-navy mb-4">Do this</p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                {VOICE_DO.map((item) => (
                  <li key={item} className="text-body-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border-2 border-raspberry bg-raspberry/5 p-7">
              <p className="font-poppins font-semibold text-navy mb-4">Never this</p>
              <ul className="list-disc pl-5 space-y-1 mb-2">
                {VOICE_DONT.map((item) => (
                  <li key={item} className="text-body-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Terminology */}
        <section id="terminology" className="scroll-mt-28">
          <SectionHeading title="Terminology" count={`${TERMINOLOGY.length} rules`} />
          <div className="rounded-xl border border-border bg-white divide-y divide-border">
            {TERMINOLOGY.map((t) => (
              <div key={t.term} className="p-6 md:flex md:gap-8">
                <p className="font-poppins font-semibold text-navy md:w-64 shrink-0 mb-2 md:mb-0">
                  {t.term}
                </p>
                <p className="text-body-sm">{t.rule}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-white">
        <div className="container mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-caption">
            Painted Porch Strategies · Brand Library · Internal reference, not indexed
          </p>
          <Link to="/" className="text-body-sm text-primary underline underline-offset-4 hover:text-navy">
            Back to the site
          </Link>
        </div>
      </footer>
    </div>
  );
}

/* --------------------------------------------------------------- pieces ---- */

function SectionHeading({ title, count }: { title: string; count: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 border-b border-border pb-3 mb-6">
      <h2 className="font-poppins text-2xl md:text-3xl font-bold text-navy">{title}</h2>
      <span className="text-caption shrink-0">{count}</span>
    </div>
  );
}

function SwatchCard({ swatch }: { swatch: Swatch }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(swatch.hex);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden flex flex-col">
      <div
        className="h-28 w-full border-b border-border"
        style={{ backgroundColor: swatch.hex }}
        aria-hidden="true"
      />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <p className="font-poppins font-semibold text-navy text-sm">{swatch.name}</p>
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-2 font-mono text-xs text-foreground/80 hover:text-primary transition-colors self-start"
          aria-label={`Copy hex value ${swatch.hex}`}
        >
          {swatch.hex}
          {copied ? (
            <Check className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>
        <p className="font-mono text-[11px] text-foreground/50">{swatch.token}</p>
        <p className="text-body-sm mt-1">{swatch.usage}</p>
      </div>
    </div>
  );
}

function AssetCard({ asset, tile }: { asset: Asset; tile: "square" | "landscape" | "wide" }) {
  const aspect =
    tile === "landscape" ? "aspect-[16/9]" : tile === "wide" ? "aspect-[16/7]" : "aspect-square";

  return (
    <figure className="flex flex-col">
      <div
        className={`${aspect} w-full overflow-hidden rounded-lg border border-border flex items-center justify-center p-4 ${
          asset.dark ? "bg-navy" : "bg-white"
        }`}
      >
        <img
          src={asset.src}
          alt={asset.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain"
        />
      </div>
      <figcaption className="mt-3 flex flex-col gap-1">
        <span className="font-mono text-[11px] text-foreground truncate">{asset.name}</span>
        {asset.note && <span className="text-caption">{asset.note}</span>}
        <a
          href={asset.src}
          download={asset.download}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-md border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors py-2 text-xs font-poppins font-semibold uppercase tracking-wide"
        >
          <Download className="h-3.5 w-3.5" aria-hidden="true" />
          Download
        </a>
      </figcaption>
    </figure>
  );
}

function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
