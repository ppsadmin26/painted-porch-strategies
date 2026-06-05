import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LazyPreviewVideo from "@/components/pps/LazyPreviewVideo";

export default function PilotTraining() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast({ title: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-pilot-training-optin", {
        body: { name: name.trim(), email: email.trim() },
      });
      if (error) throw error;
      sessionStorage.setItem("pilot_training_access", "1");
      localStorage.setItem("pilot_training_access", "1");
      navigate("/pilot-training-watch");
    } catch (err) {
      console.error("Pilot Training opt-in error:", err);
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const features = [
    {
      title: "Show Up Strong",
      description: "Learn simple ways to re-energize your mind and body to be strong in any situation or environment.",
    },
    {
      title: "Be Fully Present",
      description: "Through the power of listening, discover how to be fully present, for yourself and others.",
    },
    {
      title: "Re-Connect",
      description: "Refocus, recalibrate, and reconnect with yourself to take control of your path and purpose.",
    },
  ];

  const learnings = [
    "Understand what may be impacting your ability to be present in the moment",
    "Use small, simple, and practical tools to reconnect with yourself",
    "Re-energize when feelings of fatigue or overwhelm occur",
    "Show up strong, in control, and present",
    "Refocus on what's most important to you",
    "And more!",
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-16 md:py-20 text-center">
        <div className="container max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-6">
            Access the{" "}
            <span className="text-primary inline-flex items-center gap-2">
              <Plane className="w-8 h-8 md:w-10 md:h-10" /> From Passenger to Pilot <Plane className="w-8 h-8 md:w-10 md:h-10" />
            </span>
            <br />
            Training Replay
          </h1>
          <p className="text-foreground max-w-2xl mx-auto mb-8">
            Access a replay of our recent training session led by Painted Porch Strategies Chief Joy Officer &amp; Mindfulness Coach, Sierra Ramm Cantrell, where she shares simple tools you can use to shift from being on auto-pilot to seizing the controls and steering the direction of your life and work.
          </p>
          <a href="#get-access">
            <Button className="bg-primary hover:bg-primary/90 text-white font-semibold text-base px-8 py-5 rounded-full">
              Access Free Training Replay
            </Button>
          </a>
        </div>
      </section>

      {/* Preview video, lazy mounted, click to play */}
      <section className="bg-white pb-12 md:pb-16">
        <div className="container max-w-3xl mx-auto px-6">
          <LazyPreviewVideo
            slotKey="pilot-training-preview"
            fallbackVideoUrl=""
            playButtonClassName="bg-primary/95"
            ariaLabel="Play From Passenger to Pilot preview"
            className="border border-border"
          />
          <p className="text-center text-sm text-muted-foreground mt-3 italic">
            A quick preview of what's inside the training.
          </p>
        </div>
      </section>

      {/* Auto-pilot intro */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
            For many of us, it can often feel as though we're on auto-pilot, simply going through the motions.
          </h2>
          <div className="space-y-4 text-foreground max-w-2xl mx-auto">
            <p>You may feel dissatisfied, disconnected, or as though you're a passenger in your own life and work.</p>
            <p>Being fully present, active, and in control of what's happening in your life may feel difficult.</p>
          </div>
          <p className="italic text-foreground max-w-2xl mx-auto mt-8">
            Get instant access to a replay of Chief Joy Officer Sierra Ramm Cantrell's interactive, insightful, and empowering training session focused on guiding you on a path toward presence and purpose, where you are at the controls.
          </p>
        </div>
      </section>

      {/* Three pillars */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="text-center bg-muted/20 rounded-xl p-8 border-t-4 border-gold">
                <h3 className="text-xl md:text-2xl font-bold text-navy mb-3">{f.title}</h3>
                <p className="text-foreground text-sm">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learnings + Form */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Left: learnings */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                During this training session, you will learn to...
              </h2>
              <ul className="space-y-3 text-foreground">
                {learnings.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: form */}
            <div id="get-access">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
                Get Immediate Access
              </h2>
              <p className="text-foreground text-sm mb-2">
                Please provide your information below to receive immediate access to this 'Grow on the Porch' training session.
              </p>
              <p className="text-foreground text-sm mb-6">
                You will also receive an email notification with a link to access the training video.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-white border-border"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white border-border"
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-auto bg-primary hover:bg-primary/90 text-white font-semibold px-8 py-5 rounded-full disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Access Training"}
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-4">
                Providing your email will subscribe you to receive relevant Porch materials, newsletters, and insights. We hate SPAM too. You may unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
