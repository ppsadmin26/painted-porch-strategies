import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import mcMasterMessage from "@/assets/masterclass/6-communicator-styles-cover.jpg";

export default function CommunicatorStyles() {
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
      const { error } = await supabase.functions.invoke("submit-communicator-styles-optin", {
        body: { name: name.trim(), email: email.trim() },
      });
      if (error) throw error;
      sessionStorage.setItem("communicator_styles_access", "1");
      localStorage.setItem("communicator_styles_access", "1");
      navigate("/6-communicator-styles-watch");
    } catch (err) {
      console.error("Communicator Styles opt-in error:", err);
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
          <p className="text-sm font-semibold tracking-widest text-teal uppercase mb-4">
            Grow on the Porch Training Series
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-navy leading-tight mb-6">
            The{" "}
            <span className="text-raspberry italic">6 Communicator Styles</span>
            <br />
            Training Replay
          </h1>
          <p className="text-foreground max-w-2xl mx-auto mb-8">
            A training session led by Painted Porch Strategies' "M.C." (Master of Communication), Rob Hunter, on how to create stronger connections and communicate with impact by understanding the 6 styles of Communicators in your life and work.
          </p>
          <a href="#get-access">
            <Button className="bg-raspberry hover:bg-raspberry/90 text-white font-semibold text-base px-8 py-5 rounded-full">
              Access Free Training Replay
            </Button>
          </a>
        </div>
      </section>

      {/* Preview Image */}
      <section className="bg-navy py-12">
        <div className="container max-w-3xl mx-auto px-6">
          <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-xl">
            <img
              src={mcMasterMessage}
              alt="The 6 Communicator Styles to Master Your Message"
              className="w-full h-full object-cover"
            />
          </div>
          <p className="text-center text-white/70 text-sm mt-4">
            Sign up below for full access to the training replay and one-page reference sheet.
          </p>
        </div>
      </section>

      {/* Why this matters */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="container max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6">
            We all struggle at times to be seen, heard, and connect with others.
          </h2>
          <p className="text-foreground mb-4">
            Even if you're an introvert, your ideas, your perspectives, and your voice matter. While not all of us want to be on a stage sharing our ideas or giving a presentation, we should each have the tools to be heard, to have a seat at the table, even if it's simply in conversation or collaboration with a friend, family member, or colleague.
          </p>
          <p className="text-foreground">
            Join Painted Porch's Master of Communication ("M.C."), Rob Hunter, for an insightful and empowering training session focused on showing you ways to understand your "audience" and create better connections and clarity in your communication.
          </p>
        </div>
      </section>

      {/* Content + Form */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Left: What you'll learn */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-navy mb-6">
                During this training session, you will learn how...
              </h2>
              <ul className="space-y-4 text-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">💡</span>
                  <span>Each of us communicates (speaks, listens, asks) differently</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">☝</span>
                  <span>To spot each person's dominant Communicator Style (including your own!)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">🏁</span>
                  <span>Simple ways you can start to know your "audience" and craft communication that is heard and understood</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-xl leading-none mt-0.5">✨</span>
                  <span>...and more!</span>
                </li>
              </ul>
            </div>

            {/* Right: Form */}
            <div id="get-access">
              <h2 className="text-2xl md:text-3xl font-bold text-navy mb-4">
                Get Instant Access
              </h2>
              <p className="text-foreground text-sm mb-2">
                Please provide your information below to receive immediate access to the training replay.
              </p>
              <p className="text-foreground text-sm mb-6">
                You will also receive an email with a link to the training video and downloadable one-page reference sheet.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-muted border-border"
                />
                <Input
                  type="email"
                  placeholder="Email"
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
