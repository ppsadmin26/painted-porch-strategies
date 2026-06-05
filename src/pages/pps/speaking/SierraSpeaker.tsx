import { Heart } from "lucide-react";
import sierraPhoto from "@/assets/team/sierra-ramm-cantrell.jpg";
import SpeakerDetailPage, { type SpeakerData } from "./SpeakerDetailPage";

const sierra: SpeakerData = {
  name: "Sierra Cantrell",
  firstName: "Sierra",
  title: "Chief Joy Officer | M.B.A., Mind-Body Architect | Mindfulness Sherpa",
  seriesName: "The Radical Mindfulness Series",
  seriesIntro:
    "Seventy-five percent of employees report burnout, but it doesn't have to be that way. In this uplifting speaker series, Sierra guides teams to recharge, refocus, and reconnect through mindfulness-based strategies that boost resilience and well-being.",
  bio: [
    "Most people know me as a mindfulness coach, speaker, and wellness leader. But what truly lights me up is guiding people from overwhelmed to \"Om\", even in the middle of chaos.",
    "For over 15 years, I've guided teams, leaders, and mission-driven humans through the stress, burnout, and pressure that come with constant change. My mission is to reconnect you with your energy, your purpose, and your inner calm, so you can lead and live with more joy.",
    "Through simple, science-backed practices, I teach people how to pause with intention, lead with presence, and build resilience that lasts.",
    "If you're ready to stop surviving and start thriving, I'm here for it.",
  ],
  closingLine: "Let's breathe new life into the way you work and lead.",
  photo: sierraPhoto,
  topics: [
    {
      title: "From Passenger to Pilot",
      description:
        "Tough times call for inner strength. Discover how to bounce back from challenges and prevent burnout using simple, science-backed resilience tools.",
    },
    {
      title: "Move, Shake, Innovate",
      description:
        "Movement sparks creativity and connection. Explore how physical motion supports innovation, problem-solving, and present-moment awareness.",
    },
    {
      title: "Finding Joy at Work",
      description:
        "Work doesn't have to feel like a grind. Learn how to infuse your day with purpose, presence, and a little play, even in high-pressure environments.",
    },
    {
      title: "Reigniting Resilience",
      description:
        "When the tank is empty, resilience is the fuel. Learn a framework to simplify your energy management and boost team engagement and retention.",
    },
    {
      title: "The Mindful Leader",
      description:
        "Practical mindfulness techniques for executives who don't have time for mindfulness. Lead with calm, clarity, and intentional presence.",
    },
    {
      title: "Stress to Strength",
      description:
        "Tame the nerves and reclaim your power. From high-pressure meetings to high-stakes moments, learn to show up centered and confident.",
    },
  ],
  outcomesHeading: "Reclaim Your Energy. Lead with Joy.",
  outcomesIntro:
    "Blending science, joy, and practicality, Sierra guides audiences to shift from stressed to centered, so they can lead with purpose and show up fully for themselves and others.",
  outcomes: [
    "Reduce stress and stay calm under pressure",
    "Increase mindfulness, creativity, and emotional agility",
    "Build cultures of wellness that thrive through change",
  ],
  outcomesClosing: "It's time to stop running on empty, and start leading from within.",
  workshopHeading: "Continue the Work: Mindfulness Workshops & Wellness Sessions",
  workshopIntro:
    "Turn inspiration into transformation with follow-up experiences designed to help your team integrate calm, clarity, and resilience into everyday life and leadership.",
  workshopDetails: [
    "Guided mindfulness practices to reset and refocus",
    "Personalized tools to manage burnout and emotional fatigue",
    "Embodied activities (like movement or breathwork) to recharge creativity",
    "Group reflection that builds empathy, connection, and joy",
  ],
  workshopClosing: "Let's go from surviving to thriving, mindfully.",
  themeColor: "border-gold",
  badgeColor: "bg-gold text-navy",
  icon: Heart,
  trustSignals: {
    heading: <>Where Sierra Has Spoken</>,
    logos: [
      { name: "American Staffing Association", src: "/logos/asa.png", href: "https://americanstaffing.net/" },
      { name: "ProjectWorld", src: "/logos/projectworld.png", href: "https://www.pmbaconferences.com/" },
      { name: "Project Summit", src: "/logos/project-summit.png", href: "https://www.pmbaconferences.com/" },
      { name: "PMBA Global", src: "/logos/pmba-global.png", href: "https://www.pmbaconferences.com/" },
      { name: "Fairmont Scottsdale Princess", src: "/logos/fairmont-scottsdale.png", href: "https://www.scottsdaleprincess.com/" },
    ],
    testimonials: [
      { quote: "[Sierra testimonial placeholder #1]", name: "[Name]", title: "[Title]", organization: "[Organization]" },
      { quote: "[Sierra testimonial placeholder #2]", name: "[Name]", title: "[Title]", organization: "[Organization]" },
    ],
  },
};

export default function SierraSpeaker() {
  return <SpeakerDetailPage speaker={sierra} />;
}
