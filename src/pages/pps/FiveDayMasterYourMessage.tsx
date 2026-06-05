import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MessageCircle, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import mcTalkingToStrangers from "@/assets/masterclass/talking-to-strangers.jpg";
import ctaBackground from "@/assets/talking-to-strangers-cta.jpg";
import LazyPreviewVideo from "@/components/pps/LazyPreviewVideo";

// TODO: Replace with the live GoHighLevel checkout URL when ready.
const GHL_CHECKOUT_URL = "https://link.paintedporchstrategies.com/widget/form/PLACEHOLDER";

const dailyLessons = [
  {
    day: "Day 1",
    title: "Read the Room",
    description: "Spot who you're really talking to and what they actually need to hear.",
  },
  {
    day: "Day 2",
    title: "Open the Door",
    description: "Simple, low-pressure ways to start a conversation with anyone.",
  },
  {
    day: "Day 3",
    title: "Match Their Style",
    description: "Tune your delivery to their communicator style so the message lands.",
  },
  {
    day: "Day 4",
    title: "Go a Layer Deeper",
    description: "Move past small talk into real conversation — without it feeling forced.",
  },
  {
    day: "Day 5",
    title: "Land and Leave Well",
    description: "Wrap up with warmth, follow up with intention, keep the connection alive.",
  },
];

const learnings = [
  "Walk into any room and start a conversation without freezing up",
  "Turn small talk into real connection in just a few minutes",
  "Read body language and tone so you know when to lean in or pull back",
  "Build rapport with people who don't think, talk, or work like you",
  "Walk away with a simple framework you'll use in every conversation",
];

export default function FiveDayMasterYourMessage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-16 md:py-20">
        <div className="container max-w-5xl mx-auto px-6">
          <Link
            to="/partner/ignite/masterclasses"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Masterclasses
          </Link>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-navy/10 text-navy mb-4">
                5-Day Challenge
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-6">
                Master Your Message:{" "}
                <span className="text-primary italic">Talking to Strangers</span>{" "}
                Challenge
              </h1>
              <p className="text-lg text-foreground mb-8">
                Five days. Five short lessons. One braver, more confident communicator — you. Led by Rob Hunter, Painted Porch's Master of Communication.
              </p>
              <Button
                disabled
                className="bg-primary text-white font-semibold text-base px-8 py-5 rounded-full opacity-60 cursor-not-allowed"
              >
                Coming Soon
              </Button>
              <p className="text-sm mt-3">
                <Link to="/partner/ignite/masterclasses" className="text-primary hover:underline font-medium">
                  Join the launch list →
                </Link>
              </p>
              <p className="text-xs text-muted-foreground mt-3">
                Delivered as 5 short daily lessons. Go at the pace of the challenge.
              </p>
            </div>

            <LazyPreviewVideo
              slotKey="talking-to-strangers-preview"
              fallbackVideoUrl=""
              fallbackPosterUrl={mcTalkingToStrangers}
              playButtonClassName="bg-primary"
              ariaLabel="Play Talking to Strangers preview"
            />
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block text-gold font-semibold text-sm uppercase tracking-wide mb-2">
              What You'll Walk Away With
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy">
              Conversation that actually connects
            </h2>
          </div>
          <ul className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {learnings.map((item) => (
              <li key={item} className="flex items-start gap-3 bg-white p-4 rounded-lg shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <span className="text-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* The 5 Days */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block text-gold font-semibold text-sm uppercase tracking-wide mb-2">
              Inside the Challenge
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy">
              Five days. Five small shifts.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {dailyLessons.map((lesson) => (
              <div
                key={lesson.day}
                className="bg-muted rounded-xl p-5 border-t-4 border-primary flex flex-col"
              >
                <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                  <Calendar className="w-4 h-4" />
                  {lesson.day}
                </div>
                <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-2 leading-tight">
                  {lesson.title}
                </h3>
                <p className="text-sm text-foreground">{lesson.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
              Who this is for
            </h2>
            <p className="text-foreground max-w-2xl mx-auto">
              Anyone who has ever spotted someone across the room and thought, "I should go say hi…" and then absolutely did not.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-xl md:text-2xl font-bold text-navy mb-2">Leaders</h3>
              <p className="text-sm text-foreground">
                Who walk into rooms full of new faces and want to actually build relationships, not just collect business cards.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-xl md:text-2xl font-bold text-navy mb-2">Networkers</h3>
              <p className="text-sm text-foreground">
                Tired of awkward openers and small talk that goes nowhere fast.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-xl md:text-2xl font-bold text-navy mb-2">Anyone</h3>
              <p className="text-sm text-foreground">
                Who wants to feel a little less awkward and a lot more confident with strangers, colleagues, and everyone in between.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 md:py-28 text-white overflow-hidden">
        <img
          src={ctaBackground}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy/85 via-navy/70 to-navy/40" />
        <div className="relative container max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to start better conversations?
          </h2>
          <p className="text-white/90 mb-8 text-lg">
            Five days from now you could be walking into any room with more ease, more curiosity, and a whole lot more confidence. Let's go.
          </p>
          <a
            href={GHL_CHECKOUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Enroll in the Master Your Message: Talking to Strangers Challenge"
          >
            <Button className="bg-gold hover:bg-gold/90 text-navy font-semibold text-base px-8 py-5 rounded-full shadow-lg">
              Enroll Now
            </Button>
          </a>
          <p className="text-xs text-white/70 mt-4">
            Questions? <Link to="/contact" className="underline hover:text-white">Contact us</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
