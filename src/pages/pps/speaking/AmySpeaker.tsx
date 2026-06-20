import { Flame } from "lucide-react";
import amyPhoto from "@/assets/team/amy-speaking-portrait.jpg";
import heroesAssemble from "@/assets/speaking/amy-heroes-assemble.png";
import alicePrinciples from "@/assets/speaking/alice-principles.png.asset.json";
import dontPanic from "@/assets/speaking/dont-panic-hitchhiker.png.asset.json";
import dysfunctionToDynamic from "@/assets/speaking/dysfunction-to-dynamic.png.asset.json";
import stoicismWorkplace from "@/assets/speaking/keynote-cover-stoicism.png.asset.json";
import keynoteAiEiOh from "@/assets/speaking/keynote-ai-ei-oh.png.asset.json";
import keynoteLeadSpeedOfChange from "@/assets/speaking/keynote-cover-speed-of-change.png.asset.json";
import colorfulPath from "@/assets/colorful-path.jpg";
import goldilocksLeadership from "@/assets/speaking/amy-goldilocks-leadership.png";
import SpeakerDetailPage, { type SpeakerData } from "./SpeakerDetailPage";

const amy: SpeakerData = {
  name: "Amy Yackowski",
  firstName: "Amy",
  title: "Founder | Chief Evolution Officer | Organizational Shift Strategist",
  seriesName: "The Evolution of Change Leadership Series",
  heroBadgeLabel: "It's Time to Do Epic ShIFt",
  seriesIntro:
    "Change doesn't have to suck. In this empowering speaker series, Amy Yackowski equips modern leaders with Stoic tools, real-world frameworks, and emotional intelligence practices that keep teams grounded and united through transformation.",
  bio: [
    "Most people know me as a change strategist, coach, and founder of Painted Porch Strategies. But really? I'm just someone who believes that change doesn't have to suck.",
    "For over 20 years, I've partnered with teams and leaders in fast-paced industries like staffing, wellness, and healthcare, turning burnout into boldness and uncertainty into aligned action.",
    "I blend Stoic philosophy with practical tools to navigate chaos with clarity, lead with emotional intelligence, and build change-ready cultures that don't fall apart when things get hard.",
    "If you're ready to stop fighting change and start leading it, I'm your person.",
  ],
  closingLine: "Let's do this together!",
  photo: amyPhoto,
  topics: [
    {
      slug: "heroes-assemble",
      title: "Heroes Assemble!",
      image: heroesAssemble,
      description:
        "Unite your team through shared purpose, candor, and trust. Learn how to build stronger dynamics by fostering healthy conflict and innovative thinking.",
    },
    {
      slug: "lead-at-the-speed-of-change",
      title: "Lead at the Speed of Change",
      image: leadSpeedOfChange.url,
      description:
        "Change is inevitable, chaos isn't. Learn how to lead adaptively, align around what matters most, and keep moving forward when the ground shifts beneath you.",
    },
    {
      slug: "shift-happens-be-ready",
      title: "ShIFt Happens. Be Ready.",
      image: colorfulPath,
      description:
        "Using our P.A.T.H.™ method, discover a proven roadmap to navigate change that's on time, on budget, and on purpose.",
    },
    {
      slug: "goldilocks-leadership",
      title: "Goldilocks Leadership",
      image: goldilocksLeadership,
      description:
        "Is your leadership style \"too hot\" or \"too cold\"? Find the emotional intelligence sweet spot that turns you into a \"just-right\" transformational leader.",
    },
    {
      slug: "stoicism-in-the-workplace",
      title: "Stoicism in the Workplace",
      image: stoicismWorkplace.url,
      description:
        "Discover how ancient Stoic principles can transform modern leadership. Learn to focus on what you can control, build resilience, and lead with clarity and purpose, even when everything around you is shifting.",
    },
    {
      slug: "from-dysfunction-to-dynamic-teams",
      title: "From Dysfunction to Dynamic Teams",
      image: dysfunctionToDynamic.url,
      description:
        "Turn struggling teams into high-performing powerhouses. Learn how to break through silos, rebuild trust, and create the kind of collaboration that drives extraordinary results.",
    },
    {
      slug: "ai-ei-oh-guiding-change-and-ai-adoption",
      title: "AI, EI, Oh! Guiding Change and AI Adoption",
      image: keynoteAiEiOh.url,
      description:
        "AI is here, but your people aren't ready. Discover how emotional intelligence is the missing link to successful AI adoption, and learn to lead your team through tech-driven change without leaving anyone behind.",
    },
    {
      slug: "the-alice-principles-down-the-rabbit-hole-of-transformation",
      title: "The Alice Principles: Down the Rabbit Hole of Transformation",
      image: alicePrinciples.url,
      description:
        "What can Alice's adventures teach us about navigating organizational change? Explore how curiosity, adaptability, and questioning the status quo, inspired by Lewis Carroll's timeless tale, can transform the way your team approaches uncertainty and growth.",
    },
    {
      slug: "dont-panic-navigating-a-changing-world",
      title: "Don't Panic! Navigating a Changing World",
      image: dontPanic.url,
      description:
        "Grab your towel and don't panic, because change, much like the galaxy, is vast, unpredictable, and mostly harmless. Using Douglas Adams' Hitchhiker's Guide as a lens, discover how humor, perspective, and a good guide can turn overwhelming transformation into an adventure worth taking.",
    },
  ],
  outcomesHeading: "Lead Through Uncertainty With Clarity & Courage",
  outcomesIntro:
    "Change doesn't have to suck. In this empowering speaker series, Amy equips modern leaders with Stoic tools, real-world frameworks, and emotional intelligence practices that keep teams grounded and united through transformation.",
  outcomes: [
    "Lead through change with purpose and presence",
    "Build trust and candor across your team",
    "Turn chaos into clarity and action",
  ],
  outcomesClosing: "It's time to stop reacting and start leading with intention.",
  workshopHeading: "Continue the Work: Team Workshops & Strategy Sessions",
  workshopIntro:
    "Bring the keynote to life with immersive follow-up workshops designed to help your team apply Amy's change-readiness frameworks in real-time. These sessions go beyond inspiration, they're where strategy meets execution.",
  workshopDetails: [
    "Pre-session alignment survey",
    "Custom journaling prompts to deepen reflection",
    "Live facilitation that blends Stoic insight with business practicality",
    "Space for authentic dialogue, problem-solving, and action planning",
  ],
  workshopClosing: "Let's turn the message into momentum.",
  themeColor: "border-primary",
  badgeColor: "bg-primary text-white",
  icon: Flame,
  trustSignals: {
    heading: <>Where Amy Has Spoken</>,
    logos: [
      { name: "ProjectWorld", src: "/logos/projectworld.png", href: "https://www.pmbaconferences.com/" },
      { name: "Project Summit", src: "/logos/project-summit.png", href: "https://www.pmbaconferences.com/" },
      { name: "PMBA Global", src: "/logos/pmba-global.png", href: "https://www.pmbaconferences.com/" },
      { name: "Petra Coach", src: "/logos/petra.png", href: "https://petracoach.com/" },
      { name: "AtWork", src: "/logos/atwork.jpg", href: "https://www.atwork.com/" },
      { name: "Newbury Partners", src: "/logos/newbury-partners.jpg", href: "https://newburypartners.com/" },
      { name: "American Staffing Association", src: "/logos/asa.png", href: "https://americanstaffing.net/" },
      { name: "WIIN", src: "/logos/wiin.jpg", href: "https://www.linkedin.com/feed/update/urn:li:activity:6785998694400565248/" },
      { name: "NextUp Phoenix", src: "/logos/nextup-phoenix.png", href: "https://www.nextupisnow.org/regions/phoenix/" },
      { name: "Junior League of Phoenix", src: "/logos/junior-league-phoenix.png", href: "https://www.jlp.org/" },
      { name: "ASA Thrive Live", src: "/logos/asa-thrive-live.png", href: "https://learn.americanstaffing.net/products/thrivex" },
      { name: "Toastmasters International", src: "/logos/toastmasters.png", href: "https://www.toastmasters.org/" },
      { name: "Apex Systems", src: "/logos/apex-systems.png", href: "https://www.apexsystems.com/" },
      { name: "Staffing Industry Analysts", src: "/logos/sia.png", href: "https://www.staffingindustry.com/" },
      { name: "City of Chandler", src: "/logos/city-of-chandler.png", href: "https://www.chandleraz.gov" },
      { name: "AZ Tech Week", src: "/logos/az-tech-week.jpg", href: "https://www.azcommerce.com/az-tech-week/" },
      { name: "Co+Hoots", src: "/logos/co-hoots.png", href: "https://cohoots.com/" },
      { name: "APC Canada", src: "/logos/apc-canada.jpg", href: "https://www.apccanada.com/" },
    ],
  },
};

export default function AmySpeaker() {
  return <SpeakerDetailPage speaker={amy} />;
}
