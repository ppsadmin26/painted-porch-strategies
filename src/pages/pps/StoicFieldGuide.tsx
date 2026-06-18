import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import stoicFieldGuideCover from "@/assets/stoic-field-guide-cover.jpg";
import { Eyebrow } from "@/components/pps/Eyebrow";

export default function StoicFieldGuide() {
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
      const { error } = await supabase.functions.invoke("submit-stoic-field-guide-optin", {
        body: { name: name.trim(), email: email.trim() },
      });
      if (error) throw error;
      sessionStorage.setItem("stoic_field_guide_access", "1");
      localStorage.setItem("stoic_field_guide_access", "1");
      navigate("/stoic-field-guide-access");
    } catch (err) {
      console.error("Stoic PDF opt-in error:", err);
      toast({ title: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy to-[#001a4d] py-16 md:py-24 overflow-hidden">
        <div className="container max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left: Copy */}
            <div className="text-center md:text-left">
              <Eyebrow variant="pill" tone="gold">Free Download</Eyebrow>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                The{" "}
                <span className="text-gold italic">Stoic Leader's</span>
                <br />
                Field Guide
              </h1>
              <p className="text-lead text-white/80 italic font-poppins mb-6">
                Ancient Grit for the Modern Grind
              </p>
              <p className="text-body text-white/85 max-w-xl mx-auto md:mx-0 mb-8">
                An introduction to applying timeless Stoic principles in modern leadership. Daily practices, reflection prompts, and practical tools to lead with clarity, courage, and calm.
              </p>
              <a href="#get-access">
                <Button className="bg-gold hover:bg-gold/90 text-navy font-semibold text-base px-8 py-5 rounded-full">
                  Get the Field Guide
                </Button>
              </a>
            </div>

            {/* Right: Cover image */}
            <div className="flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-gold/30 via-teal/20 to-raspberry/20 rounded-2xl blur-2xl" aria-hidden="true" />
                <img
                  src={stoicFieldGuideCover}
                  alt="The Stoic Leader's Field Guide cover, a vibrantly painted porch in teal, lime, raspberry, and gold"
                  className="relative w-full max-w-sm md:max-w-md rounded-lg shadow-2xl ring-1 ring-white/10 rotate-[-2deg] hover:rotate-0 transition-transform duration-500"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content + Form */}
      <section className="py-16 md:py-20 bg-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            {/* Left: What's inside */}
            <div>
              <div className="inline-flex p-3 rounded-lg bg-gold/10 text-gold mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
                Inside this Field Guide, you will...
              </h2>
              <ul className="space-y-3 text-foreground">
                {[
                  "Discover core Stoic principles and how they apply to leading people through change",
                  "Learn daily practices to build resilience, focus, and emotional steadiness",
                  "Use reflection prompts to sharpen your judgment and self-awareness",
                  "Spot the difference between what you control and what you don't (and lead accordingly)",
                  "Build a simple, repeatable rhythm for thoughtful, grounded leadership",
                  "And more!",
                ].map((item) => (
                  <li key={item} className="text-body flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-gold mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Form */}
            <div id="get-access">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-4">
                Get Immediate Access
              </h2>
              <p className="text-foreground text-body-sm mb-2">
                Please provide your information below to get instant access to download The Stoic Leader Field Guide.
              </p>
              <p className="text-foreground text-body-sm mb-6">
                You will also receive an email with a link to download the field guide so you can come back to it any time.
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
                  className="w-auto bg-gold hover:bg-gold/90 text-navy font-semibold px-8 py-5 rounded-full disabled:opacity-50"
                >
                  {submitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Download className="mr-2 w-4 h-4" /> Get the Field Guide
                    </>
                  )}
                </Button>
              </form>
              <p className="text-caption text-muted-foreground mt-4">
                Providing your email will subscribe you to receive relevant Porch materials, newsletters, and insights. We hate SPAM too. You may unsubscribe at any time.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
