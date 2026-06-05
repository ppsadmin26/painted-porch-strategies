import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Users, Calendar, Sparkles, Zap, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { verifySiteVideoUrl } from "@/lib/verifySiteVideo";
import VideoFallback from "@/components/pps/VideoFallback";
import mcSuperpowersOfTeam from "@/assets/masterclass/superpowers-of-a-team.jpg";
import ctaBackground from "@/assets/team-superpowers-cta.jpg";

// TODO: Replace with the live GoHighLevel checkout URL when ready.
const GHL_CHECKOUT_URL = "https://link.paintedporchstrategies.com/widget/form/PLACEHOLDER";

const dailyLessons = [
  {
    day: "Day 1",
    title: "Find Your Superpower",
    description: "Pinpoint the natural strength you bring to every team you're on — and how to lean into it on purpose.",
  },
  {
    day: "Day 2",
    title: "Spot Everyone Else's",
    description: "Learn to see the hidden superpowers your teammates already have but rarely get credit for.",
  },
  {
    day: "Day 3",
    title: "Stack Your Strengths",
    description: "Combine different superpowers so the team gets stronger together instead of stepping on each other.",
  },
  {
    day: "Day 4",
    title: "Cover the Kryptonite",
    description: "Name the gaps and blind spots — then build simple ways to back each other up.",
  },
  {
    day: "Day 5",
    title: "Suit Up Your Team",
    description: "Walk away with a simple team playbook that puts everyone's superpowers to work, every week.",
  },
];

const learnings = [
  "Identify the unique superpower you bring to every team",
  "Spot the strengths your teammates have been hiding in plain sight",
  "Turn personality differences into your team's biggest competitive edge",
  "Reduce friction without flattening what makes each person great",
  "Walk away with a simple superpowers playbook for your team",
];

export default function TeamChallenge() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string>(mcSuperpowersOfTeam);
  const [resolved, setResolved] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let cancelled = false;
    setResolved(false);
    supabase
      .from("site_videos")
      .select("video_url, poster_url")
      .eq("slot_key", "superpowers-of-a-team-hero")
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        if (data?.video_url) setVideoUrl(data.video_url);
        if (data?.poster_url) setPosterUrl(data.poster_url);
        setResolved(true);
        verifySiteVideoUrl("superpowers-of-a-team-hero", data?.video_url ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [retryToken]);

  const handleRetry = () => {
    setVideoFailed(false);
    setIsPlaying(false);
    setRetryToken((n) => n + 1);
  };

  const handlePlay = async () => {
    setIsPlaying(true);

    try {
      await videoRef.current?.play();
    } catch (error) {
      console.error("Video preview failed to play", error);
      setIsPlaying(false);
    }
  };

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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-navy/10 text-navy mb-4">
                <Zap className="w-3.5 h-3.5" /> 5-Day Challenge
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-6">
                The{" "}
                <span className="text-primary italic">Superpowers</span>{" "}
                of a Team Challenge
              </h1>
              <p className="text-lg text-foreground mb-8">
                Five days. Five short lessons. One stronger, more aligned team — yours. Led by Amy Yackowski, Founder &amp; Organizational Shift Strategist.
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

            <div className="relative isolate aspect-video rounded-xl overflow-hidden shadow-lg bg-navy group" data-testid="team-challenge-video">
              {videoFailed ? (
                <VideoFallback variant="card" state="error" onRetry={handleRetry} />
              ) : !resolved ? (
                <VideoFallback variant="card" state="loading" />
              ) : !videoUrl ? (
                <VideoFallback variant="card" state="empty" />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    src={videoUrl ?? undefined}
                    poster={posterUrl}
                    controls={isPlaying}
                    playsInline
                    preload="metadata"
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onError={() => setVideoFailed(true)}
                    className="w-full h-full object-cover"
                  />
                  {!isPlaying && (
                    <button
                      type="button"
                      onClick={handlePlay}
                      aria-label="Watch preview"
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy/30 hover:bg-navy/40 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center justify-center w-20 h-20 rounded-full bg-primary text-white shadow-lg group-hover:scale-105 transition-transform">
                        <Play className="w-8 h-8 ml-1 fill-current" />
                      </span>
                      <span className="text-white font-semibold text-lg drop-shadow-md">
                        Watch Preview
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>
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
              Every team has superpowers. Most teams never use them.
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
              Anyone who's tired of teams being labeled "good" or "bad" — and is ready to find the real superpowers hiding underneath.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <Users className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-xl md:text-2xl font-bold text-navy mb-2">Team Leaders</h3>
              <p className="text-sm text-foreground">
                Who want to stop guessing what motivates each person and start leading with their actual strengths.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-xl md:text-2xl font-bold text-navy mb-2">Cross-Functional Teams</h3>
              <p className="text-sm text-foreground">
                Tired of personality clashes and ready to turn their differences into a real edge.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <Zap className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-xl md:text-2xl font-bold text-navy mb-2">Anyone on a Team</h3>
              <p className="text-sm text-foreground">
                Who wants to know their own superpower and bring out the best in everyone around them.
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
        <div className="absolute inset-0 bg-gradient-to-b from-navy/85 via-navy/70 to-navy/40" />
        <div className="relative container max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 drop-shadow-lg">
            Ready to suit up your team?
          </h2>
          <p className="text-white/90 mb-8 text-lg drop-shadow">
            Five days from now your team could know their superpowers, cover their kryptonite, and finally feel like they're playing on the same side. Let's go.
          </p>
          <Button
            disabled
            className="bg-gold text-navy font-semibold text-base px-8 py-5 rounded-full shadow-xl opacity-70 cursor-not-allowed"
          >
            Coming Soon
          </Button>
          <p className="text-sm text-white/90 mt-4">
            <Link to="/partner/ignite/masterclasses" className="underline hover:text-white font-medium">
              Join the launch list →
            </Link>
          </p>
          <p className="text-xs text-white/80 mt-4">
            Questions? <Link to="/contact" className="underline hover:text-white">Contact us</Link>.
          </p>
        </div>
      </section>
    </div>
  );
}
