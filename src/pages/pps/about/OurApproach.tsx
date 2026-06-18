import { Link } from "react-router-dom";
import { CheckCircle, X, ArrowRight, Compass, Users, Rocket, Repeat } from "lucide-react";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import ParallaxCTA from "@/components/pps/ParallaxCTA";
import PartnershipPromise from "@/components/pps/PartnershipPromise";
import approachHero from "@/assets/heroes/approach-hero.jpg";
import blueDoorHero from "@/assets/blue-door-hero.jpg";

// Certification badges
import workingGeniusBadge from "@/assets/certifications/working-genius.png";
import prosciChangeBadge from "@/assets/certifications/prosci-change-practitioner.png";
import scrumPsdBadge from "@/assets/certifications/scrum-psd.png";
import csiBadge from "@/assets/certifications/csi.png";
import changeNavigatorBadge from "@/assets/certifications/change-navigator.png";
import leanChangeAgentBadge from "@/assets/certifications/lean-change-agent.png";
import leanChangeAiBadge from "@/assets/certifications/lean-change-ai.png";
import mawFacilitatorBadge from "@/assets/certifications/maw-facilitator.png";
import discFacilitatorBadge from "@/assets/certifications/disc-facilitator.png";
import eq360Badge from "@/assets/certifications/eq360.png";
import emotionallyEffectiveBadge from "@/assets/certifications/emotionally-effective-leader.png";
import wpcRecommendedBadge from "@/assets/certifications/wpc-recommended.png";
import acmpMemberBadge from "@/assets/certifications/acmp-member.png";
import asaMemberBadge from "@/assets/certifications/asa-member.png";

const pathStages = [
  {
    letter: "P",
    word: "Prepare",
    subtitle: "The clarity phase",
    icon: Compass,
    border: "border-primary",
    accent: "text-primary",
    bg: "bg-primary/5",
    iconBg: "bg-primary/10",
    body: "Understand reality before commitment. Get honest about people, systems, and culture before the next shIFt starts.\u00a0Clarify what matters, why it matters, what realities already exist, and what may need strengthening before action begins.",
    outcome: "A shared, clear-eyed picture of where you stand and what's needed next.",
    isPhaseZero: true,
  },
  {
    letter: "A",
    word: "Align",
    subtitle: "The agreement phase",
    icon: Users,
    border: "border-raspberry",
    accent: "text-raspberry",
    bg: "bg-raspberry/5",
    iconBg: "bg-raspberry/10",
    body: "Create shared understanding. Align leadership, teams, stakeholders, expectations, priorities, and communication around a common direction. Healthy disagreement gets surfaced here, not after launch.",
    outcome: "A coalition that owns the work, not just approves it.",
  },
  {
    letter: "T",
    word: "Take Off",
    subtitle: "The launch phase",
    icon: Rocket,
    border: "border-gold",
    accent: "text-gold",
    bg: "bg-gold/5",
    iconBg: "bg-gold/10",
    body: "Move intentionally. The new change initiative begins with the right people, sequence, and support in place. Launch with clarity, purpose, and awareness of what success requires. Communication is clear. Course corrections are expected. Momentum is paced, not panicked.",
    outcome: "Launch energy that holds past the first 90 days.",
  },
  {
    letter: "H",
    word: "Habits",
    subtitle: "The staying-power phase",
    icon: Repeat,
    border: "border-lime",
    accent: "text-lime",
    bg: "bg-lime/5",
    iconBg: "bg-lime/10",
    body: "Reinforce what works. Strengthen habits, behaviors, systems, and practices until they become part of how your organization operates.\u00a0Because sustainable change is rarely the result of a single initiative; it's the result of repeatedly strengthening the conditions that allow progress to continue.",
    outcome: "A team that can navigate future challenges with confidence and clarity.",
  },
];

const certifications = [
  { name: "Working Genius Certified", badge: workingGeniusBadge },
  { name: "Prosci Change Practitioner", badge: prosciChangeBadge },
  { name: "Scrum.org PSD", badge: scrumPsdBadge },
  { name: "CSI Certified", badge: csiBadge },
  { name: "Change Navigator", badge: changeNavigatorBadge },
  { name: "Lean Change Agent", badge: leanChangeAgentBadge },
  { name: "Lean Change AI", badge: leanChangeAiBadge },
  { name: "MAW Facilitator", badge: mawFacilitatorBadge },
  { name: "DiSC Facilitator", badge: discFacilitatorBadge },
  { name: "EQ-360 Certified", badge: eq360Badge },
  { name: "Emotionally Effective Leader", badge: emotionallyEffectiveBadge },
  { name: "WPC Recommended", badge: wpcRecommendedBadge },
  { name: "ACMP Member", badge: acmpMemberBadge },
  { name: "ASA Member", badge: asaMemberBadge },
];


const coreValues = [
  {
    number: "01",
    title: "Purpose",
    description:
      "We exist to change how people design, define, and connect with their work, so they can lead with more clarity, more strength, and more meaning.",
    detail:
      "That shows up as mindful leaders, resilient teams, and communication that actually lands.",
    color: "bg-strategic/10",
    borderColor: "border-strategic",
  },
  {
    number: "02",
    title: "Partnership",
    description:
      "You are the expert of you (and your teams and organization). We bring frameworks, genuine curiosity, and outside perspective. You bring the context only you can see.",
    detail:
      "We act as a guide and advisor, not a vendor. The win is when you can carry the work without us.",
    color: "bg-primary/10",
    borderColor: "border-primary",
  },
  {
    number: "03",
    title: "Stewardship",
    description:
      "Real results come from shared commitment, trust, and clear accountability from both seats on the porch.",
    detail:
      "We are here to do good work that is financially worth it and personally worth it, where talent, purpose, and contribution all line up.",
    color: "bg-lime/10",
    borderColor: "border-lime",
  },
];

const beliefs = [
  "People are the most critical infrastructure of every transformation.",
  "Clarity comes before strategy, not after it.",
  "Curious questions are more useful than confident answers.",
  "Frameworks are tools, not religions.",
  "Change that does not respect culture will not hold.",
];

const rejects = [
  "Change theater that looks busy but moves nothing.",
  "One-size playbooks dropped on a unique organization.",
  "Treating people like obstacles to manage.",
  "Tech rollouts that skip the human work.",
  "Speed for its own sake.",
];

const createConditions = [
  "Leaders who can name what they are really trying to build.",
  "Teams who can disagree well and decide together.",
  "Systems that match how work actually flows.",
  "Cultures where the next change does not feel like the first.",
];

const foundationalAbilities = [
  "Show up strong, confident, and resilient when uncertainty or change shows up.",
  "Share ideas and challenge well-worn norms and habits.",
  "Spot and solve problems proactively and openly.",
  "Work in healthy, collaborative, accountable teams.",
  "Communicate with clarity, consistency, and impact.",
];

export default function OurApproach() {
  useDocumentSeo({
    title: "Our Approach | The P.A.T.H. & Phase Zero Method",
    description: "How we partner with leaders to architect change. The P.A.T.H. method, foundational abilities, and the conditions that make epic shIFt stick.",
    ogImage: approachHero,
  });
  return (
    <div>
      {/* Hero */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            How We Work
          </span>
        }
        headline="Our Approach"
        description={
          <>
            <p className="mb-4 font-semibold">
              Sustainable change is designed, not declared.
            </p>
            <p className="mb-4">
              Execution is the visible part of change.&nbsp;The thinking, alignment, communication, leadership, and culture beneath it often determine whether it lasts.
            </p>
            <p className="mb-4">
              Our approach strengthens those foundations through a deliberate sequence:
            </p>
            <p className="mb-4">
              Understand reality.<br />
              Align people.<br />
              Launch intentionally.<br />
              Reinforce what works.
            </p>
            <p className="mb-4">
              It's how you move from reacting to external demands to authoring direction.
            </p>
            <p>
              <strong>That's the P.A.T.H.</strong>
            </p>
          </>
        }
        ctas={[
          { label: "Partner With Us", href: "/partner", isPrimary: true },
        ]}
        background={{ type: "video", src: "", poster: approachHero, slotKey: "approach-hero" }}
        overlayClass="bg-navy/50"
        minHeightClass="min-h-[60vh]"
      />

      {/* Where We Fit */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-3xl mx-auto px-6">
          <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-primary mb-4">
            Where We Fit
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            Upstream of the rollout.
          </h2>
          <div className="text-lg text-foreground leading-relaxed mb-6">
            <p className="mb-9">Every initiative is built on a series of assumptions.</p>
            <div className="mb-8 space-y-0">
              <p className="mb-0">About leadership.</p>
              <p className="mb-0">About communication.</p>
              <p className="mb-0">About priorities.</p>
              <p className="mb-0">About culture.</p>
              <p className="mb-0">About what people understand, believe, and are capable of doing.</p>
            </div>
            <p className="mb-8">Our work surfaces those assumptions before they become expensive realities. Because&nbsp;</p>
            <div className="space-y-0">
              <p className="mb-0">This is the work that preceeds the rollout.</p>
              <p className="mb-0">The thinking beneath the plan.</p>
              <p className="mb-0">The examination that influences everything that follows.</p>
            </div>
          </div>
          <p className="text-lg text-foreground leading-relaxed">
            That is the work we call <Link to="/phase-zero" className="text-primary font-semibold hover:underline">Phase Zero</Link>.
          </p>
        </div>
      </section>


      {/* Manifesto: What we believe / reject */}
      <section className="py-16 md:py-24 bg-muted/60">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-primary mb-3">
              Our Manifesto
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              What we stand for, and what we will not do.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-7 border-t-4 border-lime shadow-sm">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-lime mb-4">
                What we believe:
              </h3>
              <ul className="space-y-3">
                {beliefs.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-foreground leading-relaxed">
                    <CheckCircle className="w-5 h-5 text-lime flex-shrink-0 mt-1" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl p-7 border-t-4 border-raspberry shadow-sm">
              <h3 className="text-xl md:text-2xl font-poppins font-semibold text-raspberry mb-4">
                What we reject:
              </h3>
              <ul className="space-y-3">
                {rejects.map((r) => (
                  <li key={r} className="flex items-start gap-3 text-foreground leading-relaxed">
                    <X className="w-5 h-5 text-raspberry flex-shrink-0 mt-1" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-gold mb-3">
              How We Show Up
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Our Core Values
            </h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto">
              Three values that decide how we show up in every partnership.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {coreValues.map((value, index) => (
              <div
                key={index}
                className={`${value.color} p-8 rounded-xl border-t-4 ${value.borderColor}`}
              >
                <span className="text-4xl font-bold text-navy/20 font-poppins">
                  {value.number}
                </span>
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mt-2 mb-4">
                  {value.title}
                </h3>
                <p className="text-foreground leading-relaxed mb-4">
                  {value.description}
                </p>
                <p className="text-foreground/80 text-sm leading-relaxed">
                  {value.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* R.L.P.V. - How we think */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-primary mb-3">
              How We Think
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              The Decision Filter Behind Every Recommendation
            </h2>
            <p className="text-lg text-foreground max-w-2xl mx-auto whitespace-pre-line">
              Our Stoic operating system. Every recommendation, challenge, observation, and strategic conversation passes through the same four principles.

              Not because frameworks matter, but because disciplined thinking does.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { letter: "R", word: "Reason", bold: "Reality before assumptions.", desc: " Clear, logical thinking drives every recommendation.", bg: "bg-strategic" },
              { letter: "L", word: "Logic", bold: "Structure before activity.", desc: " Structured frameworks that produce consistent results.", bg: "bg-primary" },
              { letter: "P", word: "Purpose", bold: "Meaning before movement.", desc: " Every engagement tied to meaningful outcomes.", bg: "bg-lime" },
              { letter: "V", word: "Virtue", bold: "Integrity over convenience.", desc: " Integrity and ethics at the center of our work.", bg: "bg-gold" },
            ].map((v) => (
              <div key={v.letter} className="bg-white rounded-xl p-6 shadow-sm">
                <div className={`w-12 h-12 rounded-full ${v.bg} flex items-center justify-center mb-4`}>
                  <span className="text-white font-poppins font-bold text-xl">{v.letter}</span>
                </div>
                <h3 className="font-poppins font-bold text-navy text-lg mb-2">{v.word}</h3>
                <p className="text-sm text-foreground leading-relaxed">
                  <span className="font-bold">{v.bold}</span>
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What our work makes possible - two-column: people + org */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center mb-12 max-w-3xl mx-auto">
            <p className="text-xs font-poppins font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-gold mb-3">
              WHAT OUR WORK MAKES POSSIBLE
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              The Conditions That Shape Every Outcome
            </h2>
            <div className="text-lg text-foreground leading-relaxed space-y-8">
              <p>
                Meaningful change rarely succeeds because of a framework alone. It succeeds because the conditions required for success already exist or are intentionally reinforced.
              </p>
              <p>
                We do not own change on your behalf. We fortify the conditions that allow the right change to take off, in your people and across your organization.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* What we build in people */}
            <div className="bg-muted/40 rounded-xl p-7 border-t-4 border-gold">
              <p className="text-xs font-poppins font-semibold uppercase tracking-[0.15em] text-gold mb-2">
                In your people
              </p>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-5">
                Five foundational abilities.
              </h3>
              <ul className="space-y-3">
                {foundationalAbilities.map((a) => (
                  <li key={a} className="flex items-start gap-3 text-foreground leading-relaxed">
                    <CheckCircle className="w-5 h-5 text-gold flex-shrink-0 mt-1" />
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What we build in the org */}
            <div className="bg-muted/40 rounded-xl p-7 border-t-4 border-primary">
              <p className="text-xs font-poppins font-semibold uppercase tracking-[0.15em] text-primary mb-2">
                In your organization
              </p>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-5">
                Four conditions that hold.
              </h3>
              <ul className="space-y-3">
                {createConditions.map((c) => (
                  <li key={c} className="flex items-start gap-3 text-foreground leading-relaxed">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Our Methodology: The P.A.T.H. */}
      <section id="path" className="py-20 md:py-28 bg-white scroll-mt-24">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-gold mb-3">
              Our Methodology
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-5">
              The P.A.T.H.<sup className="text-[0.4em] align-super">™</sup> to Sustainable Change
            </h2>
            <p className="text-lg text-foreground leading-relaxed">
              Stoicism is the GPS for how we think. P.A.T.H. is the roadmap for how we work. Four stages that move a change from clarity to commitment to launch to lasting habits.
            </p>
          </div>

          {/* P.A.T.H. visual: winding road + lettered cards (mirrors home page) */}
          <div className="max-w-5xl mx-auto mb-12">
            <div className="relative pb-10 md:pb-14 mb-2 px-6 sm:px-8 md:px-12">
              {/* Mobile road */}
              <svg
                viewBox="0 0 1200 200"
                className="sm:hidden absolute top-[42%] -translate-y-1/2 inset-x-0 w-full h-[120%] pointer-events-none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <path id="ppsApproachRoadMobile" d="M 0 100 C 100 100, 200 70, 300 100 S 500 130, 600 100 S 800 70, 900 100 S 1100 130, 1200 100" />
                  <clipPath id="ppsApproachRoadMobileClip1"><rect x="0" y="0" width="300" height="200" /></clipPath>
                  <clipPath id="ppsApproachRoadMobileClip2"><rect x="300" y="0" width="300" height="200" /></clipPath>
                  <clipPath id="ppsApproachRoadMobileClip3"><rect x="600" y="0" width="300" height="200" /></clipPath>
                  <clipPath id="ppsApproachRoadMobileClip4"><rect x="900" y="0" width="300" height="200" /></clipPath>
                </defs>
                <g fill="none" strokeWidth="20" strokeLinecap="butt" opacity="0.4">
                  <use href="#ppsApproachRoadMobile" stroke="hsl(var(--primary))" clipPath="url(#ppsApproachRoadMobileClip1)" />
                  <use href="#ppsApproachRoadMobile" stroke="hsl(var(--raspberry))" clipPath="url(#ppsApproachRoadMobileClip2)" />
                  <use href="#ppsApproachRoadMobile" stroke="hsl(var(--gold))" clipPath="url(#ppsApproachRoadMobileClip3)" />
                  <use href="#ppsApproachRoadMobile" stroke="hsl(var(--lime))" clipPath="url(#ppsApproachRoadMobileClip4)" />
                </g>
                <use href="#ppsApproachRoadMobile" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="6 6" strokeLinecap="round" opacity="0.6" />
              </svg>

              {/* Desktop road */}
              <svg
                viewBox="0 0 1200 200"
                className="hidden sm:block absolute top-[42%] -translate-y-1/2 inset-x-0 w-full h-[140%] pointer-events-none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <defs>
                  <path id="ppsApproachRoadDesktop" d="M 0 100 C 100 100, 200 50, 300 100 S 500 150, 600 100 S 800 50, 900 100 S 1100 150, 1200 100" />
                  <clipPath id="ppsApproachRoadDesktopClip1"><rect x="0" y="0" width="300" height="200" /></clipPath>
                  <clipPath id="ppsApproachRoadDesktopClip2"><rect x="300" y="0" width="300" height="200" /></clipPath>
                  <clipPath id="ppsApproachRoadDesktopClip3"><rect x="600" y="0" width="300" height="200" /></clipPath>
                  <clipPath id="ppsApproachRoadDesktopClip4"><rect x="900" y="0" width="300" height="200" /></clipPath>
                </defs>
                <g fill="none" strokeWidth="28" strokeLinecap="butt" opacity="0.6">
                  <use href="#ppsApproachRoadDesktop" stroke="hsl(var(--primary))" clipPath="url(#ppsApproachRoadDesktopClip1)" />
                  <use href="#ppsApproachRoadDesktop" stroke="hsl(var(--raspberry))" clipPath="url(#ppsApproachRoadDesktopClip2)" />
                  <use href="#ppsApproachRoadDesktop" stroke="hsl(var(--gold))" clipPath="url(#ppsApproachRoadDesktopClip3)" />
                  <use href="#ppsApproachRoadDesktop" stroke="hsl(var(--lime))" clipPath="url(#ppsApproachRoadDesktopClip4)" />
                </g>
                <use href="#ppsApproachRoadDesktop" fill="none" stroke="white" strokeWidth="2" strokeDasharray="8 8" strokeLinecap="round" opacity="0.7" />
              </svg>

              <ol className="relative grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-3">
                {[
                  { letter: "P", word: "Prepare", border: "border-primary", text: "text-primary", bg: "bg-primary", dot: "bg-primary" },
                  { letter: "A", word: "Align", border: "border-raspberry", text: "text-raspberry", bg: "bg-raspberry", dot: "bg-raspberry" },
                  { letter: "T", word: "Take Off", border: "border-gold", text: "text-gold", bg: "bg-gold", dot: "bg-gold" },
                  { letter: "H", word: "Habits", border: "border-lime", text: "text-lime", bg: "bg-lime", dot: "bg-lime" },
                ].map((step, idx, arr) => (
                  <li
                    key={step.letter}
                    className={`relative flex flex-col items-center justify-center py-4 rounded-xl border-2 bg-white shadow-sm ${step.border}`}
                    aria-label={`Step ${idx + 1} of ${arr.length}: ${step.letter}, ${step.word}`}
                  >
                    <span aria-hidden="true" className={`absolute -top-3 left-1/2 -translate-x-1/2 w-0.5 h-3 ${step.bg} opacity-60`} />
                    <span aria-hidden="true" className={`absolute -top-[14px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ring-2 ring-white ${step.dot}`} />
                    <span className={`font-poppins font-bold text-2xl ${step.text}`} aria-hidden="true">{step.letter}</span>
                    <span className={`text-[10px] md:text-xs font-poppins font-semibold uppercase tracking-widest mt-1 ${step.text}`} aria-hidden="true">{step.word}</span>
                    <span aria-hidden="true" className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-0.5 h-3 ${step.bg} opacity-60`} />
                    <span aria-hidden="true" className={`absolute -bottom-[14px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ring-2 ring-white ${step.dot}`} />
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {pathStages.map((s, i) => (
              <div
                key={s.letter}
                className={`${s.bg} rounded-xl border-t-4 ${s.border} p-6 flex flex-col`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 ${s.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <s.icon className={`w-6 h-6 ${s.accent}`} />
                  </div>
                  <div>
                    <p className={`font-poppins font-bold text-3xl leading-none ${s.accent}`}>{s.letter}</p>
                    <p className={`font-poppins font-semibold text-sm uppercase tracking-wider ${s.accent}`}>
                      {s.word}
                    </p>
                  </div>
                </div>
                <p className="text-xs font-poppins font-semibold uppercase tracking-[0.15em] text-navy/60 mb-3">
                  Stage {i + 1} &middot; {s.subtitle}
                </p>
                <p className="text-sm text-foreground leading-relaxed mb-4 flex-grow">
                  {s.body}
                </p>
                <div className="pt-4 border-t border-navy/10">
                  <p className="text-xs font-poppins font-semibold uppercase tracking-wider text-navy/70 mb-1">
                    You walk away with
                  </p>
                  <p className={`text-sm font-semibold ${s.accent}`}>{s.outcome}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Prepare = Phase Zero callout */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-l-4 border-primary rounded-xl p-6 md:p-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="flex-shrink-0 w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center">
                <Compass className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                  Where Our Work Begins
                </p>
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-2">
                  Prepare is Phase Zero.
                </h3>
                <p className="text-foreground leading-relaxed">
                  Prepare is where we begin. It's the work before the work - the point where you decide whether a direction is worth committing to and what it will require to do it well.
                </p>
              </div>
              <Link
                to="/phase-zero"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-primary text-white font-poppins font-semibold px-5 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Explore Phase Zero <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Certifications & Credentials */}
      <section id="certifications" className="py-16 md:py-20 bg-muted scroll-mt-24">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-primary mb-3">
              The Credentials Behind The Method
            </p>
            <h2 className="text-2xl md:text-3xl font-bold text-navy mb-4">
              Trained, certified, and accountable.
            </h2>
            <p className="text-foreground leading-relaxed">
              Our team brings recognized certifications across change
              management, team dynamics, communication, and emotional
              intelligence, so the P.A.T.H. you walk is grounded in proven
              practice, not opinion.
            </p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-4 md:gap-6">
            {certifications.map((cert) => (
              <div
                key={cert.name}
                className="bg-white rounded-lg p-3 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow h-20 md:h-24"
                title={cert.name}
              >
                <img
                  src={cert.badge}
                  alt={cert.name}
                  className="max-h-14 md:max-h-18 max-w-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Painted Porch Promise */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-3xl mx-auto px-6">
          <div className="bg-gradient-to-br from-navy to-navy/90 text-white rounded-2xl p-8 md:p-12 border-b-4 border-gold shadow-xl text-center">
            <p className="text-xs font-poppins font-semibold uppercase tracking-[0.2em] text-gold mb-3">
              The Painted Porch Promise
            </p>
            <h3 className="text-xl md:text-3xl font-poppins font-bold mb-5">
              You will not need us forever.
            </h3>
            <p className="text-white/90 leading-relaxed mb-4 max-w-xl mx-auto">
              The point of partnership is not a long contract. It's your team
              becoming the people who can author your next change on their own.
            </p>
            <p className="text-gold font-semibold max-w-xl mx-auto">
              Success is when your next major decision no longer requires us in the room.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <ParallaxCTA
        backgroundImage={blueDoorHero}
        overlayClass="bg-gradient-to-b from-navy/75 via-navy/60 to-navy/45"
        eyebrow="Start Here"
        headline="The Blue Door is the simplest place to begin."
        description="It's our structured appraisal that creates clarity before your next major decision hardens into action."
        actions={[
          { label: "Open the Blue Door", to: "/blue-door", variant: "bluedoor" },
          { label: "Find Your P.A.T.H.way", to: "/start-here", variant: "secondary" },
        ]}
      />

      <PartnershipPromise />
    </div>
  );
}
