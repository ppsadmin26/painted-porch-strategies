import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import mcKickTheHabitAsset from "@/assets/masterclass/kick-the-habit.jpg.asset.json";
import LazyPreviewVideo from "@/components/pps/LazyPreviewVideo";

export default function KickTheHabit() {
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
      const { error } = await supabase.functions.invoke("submit-kick-habit-optin", {
        body: { name: name.trim(), email: email.trim() },
      });
      if (error) throw error;
      sessionStorage.setItem("kick_habit_access", "1");
      localStorage.setItem("kick_habit_access", "1");
      navigate("/kick-the-habit-watch");
    } catch (err) {
      console.error("Kick Habit opt-in error:", err);
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-white py-16 md:py-20 text-center">
        <div className="container max-w-4xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-navy leading-tight mb-6">
            Access the{" "}
            <span className="text-raspberry italic">Kick the Habit</span>
            <br />
            Training Replay
          </h1>
          <p className="text-body text-foreground max-w-2xl mx-auto mb-8">
            Access a replay of our free training session led by Painted Porch Strategies Founder &amp; Organizational Shift Strategist, Amy Yackowski.
          </p>
          <a href="#get-access">
            <Button className="bg-raspberry hover:bg-raspberry/90 text-white font-semibold text-base px-8 py-5 rounded-full">
              Access Free Training Replay
            </Button>
          </a>
        </div>
      </section>

      {/* Video Preview - YouTube embed */}
      <section className="bg-navy py-12">
        <div className="container max-w-3xl mx-auto px-6">
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-xl">
            <iframe
              src="https://www.youtube.com/embed/lhTnIrFUJyc?rel=0"
              title="Kick the Habit: Develop a Change-Ready Mindset"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
          <p className="text-body text-center text-white/70 -sm mt-4">
            A short preview of the full masterclass replay. Sign up below for full access.
          </p>
        </div>
      </section>

      {/* Content + Form */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Left: What you'll learn */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                During this training session, you will learn to...
              </h2>
              <ul className="space-y-3 text-foreground">
                <li className="text-body flex items-start gap-2">
                  <span className="text-raspberry mt-1">•</span>
                  <span>Understand what's impacting well-intended change efforts</span>
                </li>
                <li className="text-body flex items-start gap-2">
                  <span className="text-raspberry mt-1">•</span>
                  <span>Spot negative thinking patterns</span>
                </li>
                <li className="text-body flex items-start gap-2">
                  <span className="text-raspberry mt-1">•</span>
                  <span>Challenge habitual ways of doing</span>
                </li>
                <li className="text-body flex items-start gap-2">
                  <span className="text-raspberry mt-1">•</span>
                  <span>Use curiosity and play to spot innovative ideas</span>
                </li>
                <li className="text-body flex items-start gap-2">
                  <span className="text-raspberry mt-1">•</span>
                  <span>Develop a Change-ready mindset</span>
                </li>
                <li className="text-body flex items-start gap-2">
                  <span className="text-raspberry mt-1">•</span>
                  <span>and more!</span>
                </li>
              </ul>
            </div>

            {/* Right: Form */}
            <div id="get-access">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
                Get Immediate Access
              </h2>
              <p className="text-body text-foreground -sm mb-2">
                Please provide your information below to receive immediate access to this masterclass training session.
              </p>
              <p className="text-body text-foreground -sm mb-6">
                You will also receive an email notification with a link to access the training video and downloadable Action Guide.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  aria-label="Full name" placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-muted border-border"
                />
                <Input
                  type="email"
                  aria-label="Email address" placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-muted border-border"
                />
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-auto bg-raspberry hover:bg-raspberry/90 text-white font-semibold px-8 py-5 rounded-full disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Access Training"}
                </Button>
              </form>
              <p className="text-body text-muted-foreground mt-4">
                Providing your email will subscribe you to receive relevant Porch materials, newsletters, and insights. We hate SPAM too. You may unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
