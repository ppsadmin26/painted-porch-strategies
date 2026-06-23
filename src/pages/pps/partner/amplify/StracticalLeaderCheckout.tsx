import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  ArrowRight, Check, CheckCircle2, Shield, Calendar, PlayCircle,
  FileText, Users, Mail, Sparkles, Target, Clock, BookOpen, Bell
} from "lucide-react";
import { Link } from "react-router-dom";
import { FAQSection, type FAQCategory } from "@/components/pps/FAQSection";
import { stracticalFaqCategories } from "./stracticalFaqs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WORKSHOP_START_DATE, WORKSHOP_DATE_LABEL, WORKSHOP_DATE_SHORT, WORKSHOP_PRICE_DISPLAY } from "./stracticalConfig";

/* ──────────────────── COUNTDOWN HOOK ──────────────────── */
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const diff = targetDate.getTime() - Date.now();
    return { expired: diff <= 0 };
  });

  useEffect(() => {
    const check = () => {
      const diff = targetDate.getTime() - Date.now();
      setTimeLeft({ expired: diff <= 0 });
    };
    const timer = setInterval(check, 60000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

/* ──────────────────── WAITLIST DIALOG ──────────────────── */
function WaitlistDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;
    setLoading(true);

    try {
      const waitlistId = crypto.randomUUID();
      const { error } = await supabase.functions.invoke("submit-ghl-lead", {
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          tags: ["stractical-waitlist"],
          newsletter,
          skipOpportunity: true,
        },
      });

      if (error) throw error;

      // Send confirmation email (fire-and-forget)
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "stractical-waitlist",
          recipientEmail: email.trim(),
          idempotencyKey: `stractical-waitlist-${waitlistId}`,
          templateData: { firstName: firstName.trim() },
        },
      }).catch((err) => console.error("Waitlist email error:", err));

      setSubmitted(true);
    } catch (err) {
      console.error("Waitlist submission error:", err);
      toast({
        title: "Something went wrong",
        description: "Please try again or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (val: boolean) => {
    if (!val) { setSubmitted(false); setFirstName(""); setLastName(""); setEmail(""); setNewsletter(false); }
    onOpenChange(val);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {!submitted ? (
          <>
            <DialogHeader>
              <DialogTitle className="font-poppins text-2xl text-navy">Get Notified of the Next Lab</DialogTitle>
              <DialogDescription className="text-foreground/80">
                Be the first to know when we announce the next Stractical Leader Lab dates.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required maxLength={100} className="h-12" />
                <Input placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} maxLength={100} className="h-12" />
              </div>
              <Input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={255} className="h-12" />
              <div className="flex items-start gap-2">
                <Checkbox id="waitlist-newsletter" checked={newsletter} onCheckedChange={(v) => setNewsletter(v === true)} className="mt-0.5" />
                <label htmlFor="waitlist-newsletter" className="text-sm text-foreground/70 cursor-pointer leading-tight">
                  Yes, also sign me up for insights and updates from the Porch.
                </label>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-gold border-2 border-gold text-navy font-poppins font-semibold text-base h-12 hover:bg-transparent hover:text-gold transition-colors">
                {loading ? "Signing Up..." : "JOIN THE WAITLIST"}{!loading && <Bell className="ml-2 w-4 h-4" />}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center py-6">
            <CheckCircle2 className="w-16 h-16 text-lime mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-2">You're on the List!</h3>
            <p className="text-body text-foreground/80">We'll let you know as soon as the next Stractical Leader Lab is scheduled.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────── DATA ──────────────────── */
const included = [
  { icon: Users, title: "6 Live Interactive Sessions (60 minutes each)", desc: "Master the 3-pillar Stractical Blueprint™: Courage, Curiosity, and Clarity" },
  { icon: PlayCircle, title: "Recorded Sessions with 60-Day Access", desc: "Review key concepts and strategies on your schedule" },
  { icon: FileText, title: "The Stractical Toolkit", desc: "Strategic questions, language patterns, and frameworks you'll use immediately" },
  { icon: Target, title: "Real-Time Application", desc: "Work through actual scenarios from your organization, not generic case studies" },
  { icon: BookOpen, title: "Personal Blueprint Development", desc: "Create your custom action plan for sustained strategic influence" },
  { icon: Calendar, title: "One-Month Follow-Up Session", desc: "Review wins, troubleshoot challenges, ensure transformation sticks" },
];

const outcomes = [
  'You stop feeling like "just a manager"',
  "Your insights shape business decisions",
  "Colleagues seek your perspective before making moves",
  "Your team's expertise influences organizational strategy",
  "You become the critical link between vision and execution",
];

const nextSteps = [
  {
    phase: "Immediately after enrollment",
    items: [
      "You'll receive a confirmation email with Zoom links and calendar invites",
    ],
  },
  {
    phase: "Before Session 1",
    items: ["Brief intake questionnaire about your current challenges"],
  },
  {
    phase: "During the Program",
    items: [
      "Weekly live sessions every Wednesday at 11am MST/PT (2pm ET)",
      "Weekly reflection prompts and application exercises",
      "60-day access to all session recordings",
    ],
  },
  {
    phase: "After Completion",
    items: ["Certificate of completion"],
  },
];

/* ──────────────────── COMPONENT ──────────────────── */
export default function StracticalLeaderCheckout() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const { expired: isExpired } = useCountdown(WORKSHOP_START_DATE);

  return (
    <div>
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />

      {/* ═══ HERO ═══ */}
      <section className="bg-navy py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/95 to-strategic/20" />
        <div className="container max-w-4xl mx-auto px-6 relative z-10 text-center">
           <span className="inline-block bg-gold text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            6-Week Intensive Leader Lab
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-4 leading-tight">
            {isExpired ? (
              <>Next <span className="text-gold">Stractical Leader</span> Lab Coming Soon</>
            ) : (
              <>Transforming Your <span className="text-gold">Leadership Impact</span></>
            )}
          </h1>
          <p className="text-body font-poppins font-medium text-white/90 mb-2">
            The Stractical Leader Workshop
          </p>
          {isExpired ? (
            <p className="text-body text-gold/70">
              Our latest cohort kicked off {WORKSHOP_DATE_SHORT}. New dates are on the way!
            </p>
          ) : (
            <p className="text-body text-white/60">
              6 Live Sessions &nbsp;|&nbsp; Wednesdays 11:00 AM - 12:00 PM MST/PT (2:00 PM - 3:00 PM ET) &nbsp;|&nbsp; Starting {WORKSHOP_DATE_SHORT}
            </p>
          )}
        </div>
      </section>

      {/* ═══ WHAT YOU'RE GETTING ═══ */}
      <section className="py-14 md:py-20 bg-white">
        <div className="container max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy text-center mb-10">
            What You're Getting
          </h2>
          <div className="grid md:grid-cols-2 gap-5">
            {included.map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-5 rounded-xl bg-muted border border-border/30">
                <div className="w-10 h-10 rounded-lg bg-gold/15 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy leading-snug">{item.title}</h3>
                  <p className="text-body -sm text-foreground/70 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ INVESTMENT + TRANSFORMATION ═══ */}
      <section className="py-14 md:py-20 bg-muted">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Investment Card */}
            <div className="bg-white rounded-2xl shadow-lg border border-border/40 overflow-hidden">
              <div className="bg-navy p-6 text-center">
                <p className="text-body text-gold font-poppins font-semibold uppercase tracking-wider mb-1">
                  {isExpired ? "Workshop Investment" : "Your Investment"}
                </p>
                <p className="text-body text-5xl font-poppins font-bold text-white">{WORKSHOP_PRICE_DISPLAY}</p>
              </div>
              <div className="p-6 text-center">
                <p className="text-body -sm text-foreground/70 mb-6">
                  {isExpired
                    ? "This is more than a workshop. It's a fundamental shift in how you show up, how you're perceived, and how you influence decisions. Join the waitlist to secure early access to the next cohort."
                    : "This is more than a workshop. It's a fundamental shift in how you show up, how you're perceived, and how you influence decisions."
                  }
                </p>
                {isExpired ? (
                  <Button
                    onClick={() => setWaitlistOpen(true)}
                    className="bg-gold border-2 border-gold text-navy font-poppins font-bold text-base py-5 px-10 rounded-lg hover:bg-transparent hover:text-gold transition-colors w-full"
                  >
                    JOIN THE WAITLIST <Bell className="ml-2 w-5 h-5" />
                  </Button>
                ) : (
                  <a
                    href="https://access.onthepaintedporch.com/courses/offers/1ddc8725-0210-4183-a20e-c7d505379fa1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-gold border-2 border-gold text-navy font-poppins font-bold text-base py-5 px-10 rounded-lg hover:bg-transparent hover:text-gold transition-colors w-full">
                      COMPLETE ENROLLMENT <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </a>
                )}
                <div className="flex items-center justify-center gap-2 text-xs text-foreground/50 mt-4">
                  <Users className="w-3.5 h-3.5" />
                  <span>Capped at 25 participants</span>
                </div>
              </div>
            </div>

            {/* What Changes */}
            <div>
              <h3 className="text-xl md:text-2xl font-poppins font-bold text-navy mb-4">
                What changes when you complete this program:
              </h3>
              <div className="space-y-3">
                {outcomes.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <ArrowRight className="w-4 h-4 text-gold mt-1 shrink-0" />
                    <p className="text-body -sm text-foreground/80">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHAT HAPPENS NEXT ═══ */}
      {!isExpired && (
        <section className="py-14 md:py-20 bg-white">
          <div className="container max-w-3xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy text-center mb-10">
              What Happens Next
            </h2>
            <div className="space-y-6">
              {nextSteps.map((step, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white font-poppins font-bold text-xs">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-xl md:text-2xl font-poppins font-semibold text-navy">{step.phase}</h3>
                    <ul className="mt-2 space-y-1.5">
                      {step.items.map((item, j) => (
                        <li key={j} className="text-body flex items-start gap-2 -sm text-foreground/80">
                          <Check className="w-4 h-4 text-lime mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ GUARANTEE ═══ */}
      <section className="py-14 md:py-20 bg-muted">
        <div className="container max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-2xl p-8 md:p-10 border border-lime/30 text-center">
            <div className="w-14 h-14 rounded-full bg-lime/15 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-7 h-7 text-lime" />
            </div>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-3">
              100% Confidence Guarantee
            </h2>
            <p className="text-body text-foreground/80 leading-relaxed max-w-xl mx-auto mb-4">
              If after Session 1 you don't feel this workshop will transform your strategic impact, simply let us know and we'll refund your full investment.
            </p>
            <p className="text-body -sm text-foreground/60 italic">
              We're confident because we've seen this framework work. When managers embrace the Stractical Blueprint, they stop executing directives and start shaping strategy.
            </p>
          </div>
        </div>
      </section>

      <FAQSection
        tierName="Stractical Leader"
        categories={stracticalFaqCategories}
        subheadline="Everything you need to know about the Stractical Leader workshop"
        contactUrl="/contact?scope=Yourself&interest=leadership-lab&message=I%20have%20questions%20about%20your%20Stractical%20Leader%20Lab"
      />

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-16 md:py-24 bg-navy relative">
        <div className="container max-w-3xl mx-auto px-6 text-center relative z-10">
          {isExpired ? (
            <>
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-4">
                Don't Miss the Next Cohort
              </h2>
              <p className="text-body text-white/70 mb-8">
                Our latest Stractical Leader Lab has kicked off. Join the waitlist to get early access when new dates are announced.
              </p>
              <Button
                onClick={() => setWaitlistOpen(true)}
                className="bg-gold border-2 border-gold text-navy font-poppins font-bold text-lg py-6 px-12 rounded-lg hover:bg-white hover:text-gold transition-colors"
              >
                JOIN THE WAITLIST <Bell className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-body -sm text-white/50 mt-4">Waitlist members get early access before public enrollment.</p>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-4">
                Secure Your Spot Now
              </h2>
              <p className="text-body text-white/70 mb-2">
                Capped at 25 participants for maximum interaction and personalized feedback.
              </p>
              <p className="text-body text-white/50 mb-1 font-poppins uppercase tracking-wider">Total Investment</p>
              <p className="text-body text-5xl font-poppins font-bold text-gold mb-8">{WORKSHOP_PRICE_DISPLAY}</p>
              <a
                href="https://access.onthepaintedporch.com/courses/offers/1ddc8725-0210-4183-a20e-c7d505379fa1"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-gold border-2 border-gold text-navy font-poppins font-bold text-lg py-6 px-12 rounded-lg hover:bg-white hover:text-gold transition-colors">
                  COMPLETE ENROLLMENT <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </>
          )}
          <p className="text-body -sm text-white/50 mt-6">
            Questions before enrolling? <a href="/contact?scope=Yourself&interest=leadership-lab&message=I%20have%20questions%20about%20your%20Stractical%20Leader%20Lab" className="text-gold hover:text-gold/80 underline">Contact Us</a>
          </p>
          {!isExpired && (
            <p className="text-body text-gold font-poppins font-semibold mt-8">
              You're ready. Your team is ready. Let's make this transformation real.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
