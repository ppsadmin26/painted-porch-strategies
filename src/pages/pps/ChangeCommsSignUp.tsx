import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, CheckCircle2, Sparkles, Megaphone } from "lucide-react";
import guidePreview from "@/assets/change-comms-guide-preview.jpg";
import heroBg from "@/assets/change-comms-hero-bg.jpg";

export default function ChangeCommsSignUp() {
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
          lastName: cleanLast || "—",
          email: cleanEmail,
          newsletter,
          tags: ["ChangeComms"],
          message: "Requested the 4 Critical Steps for Effective Change Communication guide",
        },
      });
      if (error) throw error;

      try {
        const idempotencyKey = `change-comms-${cleanEmail.toLowerCase()}-${Date.now()}`;
        const emailRes = await supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "change-comms-guide",
            recipientEmail: cleanEmail,
            idempotencyKey,
            templateData: { firstName: cleanFirst },
          },
        });
        if (emailRes.error) console.error("Change Comms email send failed:", emailRes.error);
      } catch (sendErr) {
        console.error("Change Comms email exception:", sendErr);
      }

      navigate("/change-comms-thank-you");
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
      <section
        className="relative text-white py-20 px-4 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-navy/85 via-navy/80 to-teal/80" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />
            FREE PLANNING & ACTION GUIDE
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold mb-6">
            4 Critical Steps for <span className="text-gold">Effective Change Communication</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
            A must-use tool to plan messaging that drives change awareness, understanding, and adoption.
          </p>
        </div>
      </section>

      {/* Content + Form */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          {/* Left */}
          <div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">
              Get a free copy of our guide.
            </h2>
            <p className="text-lg text-charcoal mb-6">
              This is a <strong className="text-navy">must-use tool</strong> before you craft and send ANY communication to change-impacted audiences — both internal and external — to ensure change <strong className="text-navy">understanding, clarity, confidence, and adoption</strong>.
            </p>
            <p className="text-lg text-charcoal mb-6">
              This practical guide will help you get change-ready and prepared by intentionally and concisely planning your messaging for your organization's upcoming change project.
            </p>

            <a
              href="/downloads/Critical_Steps_for_Effective_Change_Communication_Painted_Porch_Strategies.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-8 rounded-xl overflow-hidden border-2 border-border shadow-md hover:shadow-xl transition-shadow bg-white"
              aria-label="Preview the 4 Critical Steps guide"
            >
              <img
                src={guidePreview}
                alt="Cover of the 4 Critical Steps for Effective Change Communication guide"
                className="w-full h-auto block"
                loading="lazy"
              />
            </a>

            <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy mb-4">What's inside:</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <Megaphone className="w-6 h-6 text-teal flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  <strong className="text-navy">4 critical steps</strong> for crafting clear, effective change messaging
                </span>
              </li>
              <li className="flex gap-3">
                <MessageCircle className="w-6 h-6 text-lime-green flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  <strong className="text-navy">Audience planning prompts</strong> for both internal and external stakeholders
                </span>
              </li>
              <li className="flex gap-3">
                <CheckCircle2 className="w-6 h-6 text-purple flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  <strong className="text-navy">An action checklist</strong> to keep messaging concise, consistent, and on point
                </span>
              </li>
              <li className="flex gap-3">
                <Sparkles className="w-6 h-6 text-raspberry flex-shrink-0 mt-1" />
                <span className="text-charcoal">
                  Built to drive <strong className="text-navy">awareness, understanding, and adoption</strong> before kickoff
                </span>
              </li>
            </ul>
          </div>

          {/* Form */}
          <div className="bg-white border-2 border-border rounded-2xl shadow-lg p-8 md:sticky md:top-8">
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-2">Send My Free Guide Now</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Drop your info below and we'll email it over right away.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
              </div>

              <div className="flex items-start gap-2 pt-2">
                <Checkbox id="newsletter" checked={newsletter} onCheckedChange={(v) => setNewsletter(v === true)} className="mt-1" />
                <Label htmlFor="newsletter" className="text-sm font-normal text-charcoal cursor-pointer">
                  Yes, send me the occasional Painted Porch newsletter with tips and resources.
                </Label>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal hover:bg-teal/90 text-white text-lg py-6 rounded-full"
              >
                {submitting ? "Sending..." : "Send My Free Guide Now"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                We won't send spam. Unsubscribe at any time.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
