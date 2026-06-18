import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Compass, Map, Target, Sparkles } from "lucide-react";
import canvasPreview from "@/assets/strategic-change-canvas-preview.jpg";

export default function StrategicCanvasSignUp() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      toast({ title: "Missing info", description: "Please add your name and email.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const cleanFirst = firstName.trim();
      const cleanLast = lastName.trim();
      const cleanEmail = email.trim();

      const { error } = await supabase.functions.invoke("submit-ghl-lead", {
        body: {
          firstName: cleanFirst,
          lastName: cleanLast || "Unknown",
          email: cleanEmail,
          newsletter,
          tags: ["Strategic Canvas"],
          message: "Requested the Strategic Change Canvas",
        },
      });
      if (error) throw error;

      // Send the canvas via email (don't block navigation if it errors)
      try {
        const idempotencyKey = `strategic-canvas-${cleanEmail.toLowerCase()}-${Date.now()}`;
        const emailRes = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "strategic-canvas",
            recipientEmail: cleanEmail,
            idempotencyKey,
            templateData: { firstName: cleanFirst },
          },
        });
        if (emailRes.error) {
          console.error("Strategic Canvas email send failed:", emailRes.error);
        }
      } catch (sendErr) {
        console.error("Strategic Canvas email exception:", sendErr);
      }

      navigate("/thank-you-change-canvas");
    } catch (err) {
      console.error(err);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy to-teal text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            FREE STRATEGIC PLANNING TOOL
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold mb-6">
            The <span className="text-gold">Strategic Change Canvas</span>
          </h1>
          <p className="text-lead text-white/90 max-w-3xl mx-auto">
            A one-page planning tool to architect change before you build it, so your next shIFt actually sticks.
          </p>
        </div>
      </section>

      {/* Content + Form */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Left: What you get */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">
              Plan smarter. ShIFt with intention.
            </h2>
            <p className="text-lead text-charcoal mb-6">
              Most change plans skip the most important step: the thinking <em>before</em> the doing. The
              <strong className="text-navy"> Strategic Change Canvas</strong> walks you through the questions
              that turn good ideas into grounded action.
            </p>

            {/* Canvas preview */}
            <a
              href="/downloads/Strategic_Change_Canvas_Painted_Porch_Strategies.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-8 rounded-xl overflow-hidden border-2 border-border shadow-md hover:shadow-xl transition-shadow"
              aria-label="Preview the Strategic Change Canvas"
            >
              <img
                src={canvasPreview}
                alt="Preview of the one-page Strategic Change Canvas planning worksheet"
                className="w-full h-auto block"
                loading="lazy"
              />
            </a>

            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-4">What's inside:</h3>
            <ul className="space-y-4">
              <li className="text-body flex gap-3">
                <Compass className="w-6 h-6 text-teal flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  <strong className="text-navy">A clear north star</strong>, name the shift you're trying to lead
                </span>
              </li>
              <li className="text-body flex gap-3">
                <Map className="w-6 h-6 text-lime-green flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  <strong className="text-navy">Phase Zero prompts</strong> to surface what's missing before kickoff
                </span>
              </li>
              <li className="text-body flex gap-3">
                <Target className="w-6 h-6 text-purple flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  <strong className="text-navy">A one-page worksheet</strong> you can take into your next leadership meeting
                </span>
              </li>
              <li className="text-body flex gap-3">
                <Sparkles className="w-6 h-6 text-raspberry flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  Built on 20+ years of <strong className="text-navy">organizational change</strong> work
                </span>
              </li>
            </ul>
          </div>

          {/* Right: Form */}
          <div className="bg-white border-2 border-border rounded-2xl shadow-lg p-8 md:sticky md:top-8">
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-2">Send Me the Canvas</h3>
            <p className="text-body-sm text-muted-foreground mb-6">
              Drop your info below and we'll email it over right away.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="newsletter"
                  checked={newsletter}
                  onCheckedChange={(v) => setNewsletter(v === true)}
                  className="mt-1"
                />
                <Label htmlFor="newsletter" className="text-sm font-normal text-charcoal cursor-pointer">
                  Yes, send me the occasional Painted Porch newsletter with tips and resources.
                </Label>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal hover:bg-teal/90 text-white text-lg py-6 rounded-full"
              >
                {submitting ? "Sending..." : "Send Me the Canvas"}
              </Button>

              <p className="text-caption text-muted-foreground text-center">
                We won't send spam. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
