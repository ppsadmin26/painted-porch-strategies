import { Mic } from "lucide-react";
import robPhoto from "@/assets/team/rob-hunter.jpg";
import SpeakerDetailPage, { type SpeakerData } from "./SpeakerDetailPage";
import fiveMinKeynote from "@/assets/speaking/topics/five-minute-keynote.jpg.asset.json";
import highFidelity from "@/assets/speaking/topics/high-fidelity-communication.jpg.asset.json";
import eightByEight from "@/assets/speaking/topics/eight-by-eight.jpg.asset.json";
import getClear from "@/assets/speaking/topics/get-clear-be-heard.jpg.asset.json";
import borderlessComm from "@/assets/speaking/topics/borderless-communication.jpg.asset.json";
import onAir from "@/assets/speaking/topics/on-air-confidence.jpg.asset.json";
import sixStyles from "@/assets/speaking/topics/six-communicator-styles.jpg.asset.json";

const rob: SpeakerData = {
  name: "Rob Hunter",
  firstName: "Rob",
  title: "Chief Storytelling Officer | M.C., Master of Communication",
  seriesName: "The Clear & Courageous Communication Series",
  seriesIntro:
    "In a world full of noise, leaders who communicate with clarity and conviction rise above the rest. Rob Hunter, a #1-rated radio host and journalist turned communication impact strategist, teaches high-fidelity messaging practices to help you speak so your signal is clear, and people act.",
  bio: [
    "Most people know me as a radio host, communicator, and storyteller. But at my core, I'm someone who believes that clear, confident communication is the most powerful leadership tool we have.",
    "Over the past 27 years, I've hosted top-rated radio shows across the country, and I've learned what it takes to cut through the noise and truly connect. Now, I partner with leaders to do the same in meetings, keynotes, and high-stakes moments.",
    "I bring together the science of messaging, the rhythm of broadcasting, and the art of storytelling to help teams speak with impact, listen with intention, and lead with presence.",
    "If you're ready to master your message and make it matter, I've got you.",
  ],
  closingLine: "Let's cut through your communication static and broadcast with clarity and impact!",
  photo: robPhoto,
  topics: [
    {
      slug: "high-fidelity-communication",
      title: "High-Fidelity Communication",
      description:
        "The way you speak your thoughts is your brand. Learn the three pillars of clear communication: preparation, conciseness, and attentiveness.",
    },
    {
      slug: "8-8",
      title: "8:8",
      description:
        "Capturing & Keeping Attention in a Distracted World. In today's distracted world, attention spans are shrinking. Discover how to hook, hold, and inspire your audience fast, before they scroll away.",
    },
    {
      slug: "the-power-of-story",
      title: "The Power of Story",
      description:
        "Our brains are wired for stories. Learn how and when to use narrative to persuade, connect, and be unforgettable.",
    },
    {
      slug: "get-clear-be-heard",
      title: "Get C.L.E.A.R. & Be Heard",
      description:
        "Clarity. Language. Energy. Attention. Relevance. Master this framework to simplify your message and boost team engagement and retention.",
    },
    {
      slug: "borderless-communication",
      title: "Borderless Communication",
      description:
        "Great leaders don't just talk, they communicate with intention. Learn how to create a culture of ownership and follow-through.",
    },
    {
      slug: "on-air-ready-confidence",
      title: "On-Air Ready Confidence",
      description:
        "Tame the nerves and take the mic. From boardrooms to breakouts, learn how to show up prepared, polished, and powerful, every time you speak.",
    },
    {
      slug: "your-5-minute-keynote",
      title: "Your 5-Minute Keynote",
      image: fiveMinKeynote.url,
      description:
        "Every leader needs a signature message they can deliver at a moment's notice. Learn how to craft and deliver a powerful 5-minute keynote that leaves a lasting impression.",
    },
    {
      slug: "speaking-with-style-the-6-communicator-styles-for-influence-impact",
      title: "Speaking with Style: The 6 Communicator Styles for Influence & Impact",
      description:
        "There are six distinct communicator styles, and knowing yours changes everything. Discover your natural style and learn to flex across all six to connect with any audience.",
    },
  ],
  outcomesHeading: "Speak with Clarity. Lead with Confidence.",
  outcomesIntro:
    "Rob blends the science of storytelling, the discipline of broadcast, and the art of presence to help professionals eliminate static, inspire trust, and deliver messages that move people.",
  outcomes: [
    "Share your ideas with clarity, purpose, and power",
    "Capture attention in any room (or Zoom)",
    "Elevate your confidence, influence, and executive presence",
  ],
  outcomesClosing: "Your message matters. Let's make it land.",
  workshopHeading: "Continue the Work: Team Workshops & Strategy Sessions",
  workshopIntro:
    "Take your team beyond theory and into practice with dynamic workshops led by Rob Hunter. These sessions equip leaders and teams to apply high-impact communication frameworks that build clarity, connection, and confidence.",
  workshopDetails: [
    "Pre-session message audit or needs discovery",
    "Hands-on exercises to sharpen delivery and presence",
    "Live coaching with actionable feedback",
    "Frameworks like C.L.E.A.R. and \"You Have 8 Minutes…\"",
    "Safe, fun space to build confidence and team connection",
  ],
  workshopClosing: "Let's turn clarity into impact.",
  themeColor: "border-muted-foreground",
  badgeColor: "bg-muted-foreground text-white",
  icon: Mic,
  trustSignals: {
    heading: <>Rob On the Air &amp; In The Room</>,
    logos: [
      { name: "ProjectWorld", src: "/logos/projectworld.png", href: "https://www.pmbaconferences.com/" },
      { name: "Project Summit", src: "/logos/project-summit.png", href: "https://www.pmbaconferences.com/" },
      { name: "PMBA Global", src: "/logos/pmba-global.png", href: "https://www.pmbaconferences.com/" },
      { name: "PMBA Conferences", src: "/logos/pmba.png", href: "https://www.pmbaconferences.com/" },
      { name: "WSKY 97.3", src: "/logos/wsky-973.png", href: "https://www.audacy.com/thesky973" },
      { name: "88.9 WERS", src: "/logos/wers-889.png", href: "https://wers.org/" },
      { name: "690 WTIX", src: "/logos/wtix-690.png", href: "https://www.wtix690am.com/" },
      { name: "KTAR 92.3", src: "/logos/ktar-923.png", href: "https://ktar.com/" },
      { name: "WSB 95.5", src: "/logos/wsb-955.png", href: "https://www.wsbradio.com/" },
      { name: "98.5 WKTK", src: "/logos/wktk-985.png", href: "https://www.audacy.com/ktk985" },
      { name: "1390 KENN", src: "/logos/kenn-1390.png", href: "https://tunein.com/radio/KENN-1390-s32480/" },
      { name: "96.9 KRWN", src: "/logos/krwn-969.png", href: "https://www.krwn.com/" },
      { name: "Glenn Beck", src: "/logos/glenn-beck.png", href: "https://glennbeck.com/listen" },
      { name: "550 KFYI", src: "/logos/kfyi-550.png", href: "https://kfyi.iheart.com/" },
      { name: "City of Chandler", src: "/logos/city-of-chandler.png", href: "https://www.chandleraz.gov" },
      { name: "AZ Tech Week", src: "/logos/az-tech-week.jpg", href: "https://www.azcommerce.com/az-tech-week/" },
      { name: "Co+Hoots", src: "/logos/co-hoots.png", href: "https://cohoots.com/" },
    ],
    testimonials: [
      { quote: "[Rob testimonial placeholder #1]", name: "[Name]", title: "[Title]", organization: "[Organization]" },
      { quote: "[Rob testimonial placeholder #2]", name: "[Name]", title: "[Title]", organization: "[Organization]" },
    ],
  },
};

export default function RobSpeaker() {
  return <SpeakerDetailPage speaker={rob} />;
}
