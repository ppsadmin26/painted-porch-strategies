import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  ArrowRight, CheckCircle2, Shield, Search, Gem, Check, Users, Calendar,
  PlayCircle, Target, MessageSquare, Compass, FileText, Sparkles, Clock, Bell
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSmoothScroll } from "@/hooks/useSmoothScroll";
import amyPhoto from "@/assets/team/amy-yackowski.png";
import { FAQSection, type FAQCategory } from "@/components/pps/FAQSection";
import { stracticalFaqCategories } from "./stracticalFaqs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WORKSHOP_START_DATE, WORKSHOP_DATE_LABEL, WORKSHOP_DATE_SHORT } from "./stracticalConfig";

/* ──────────────────── COUNTDOWN HOOK ──────────────────── */
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft(targetDate)), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

function calculateTimeLeft(target: Date) {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    expired: false,
  };
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
                <Checkbox id="waitlist-newsletter-ws" checked={newsletter} onCheckedChange={(v) => setNewsletter(v === true)} className="mt-0.5" />
                <label htmlFor="waitlist-newsletter-ws" className="text-sm text-foreground/70 cursor-pointer leading-tight">
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
            <h3 className="font-poppins font-bold text-2xl text-navy mb-2">You're on the List!</h3>
            <p className="text-foreground/80">We'll let you know as soon as the next Stractical Leader Lab is scheduled.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/* ──────────────────── PAGE DATA ──────────────────── */
const pillars = [
  {
    icon: Shield,
    emoji: "🦁",
    title: "COURAGE",
    subtitle: "Empowering Strategic Influence",
    color: "text-gold",
    bg: "bg-gold/10",
    border: "border-gold/30",
    intro: "Stop waiting for permission to contribute. Learn to:",
    bullets: [
      "Voice insights that challenge assumptions (without being confrontational)",
      "Speak up when you see misalignment between strategy and operational reality",
      'Ask "What problem are we really trying to solve?" before executing directives',
      "Position yourself and your team as critical thinkers invested in organizational outcomes",
    ],
    closing: "Courage doesn't mean you're always right. It means you trust that your perspective deserves consideration.",
  },
  {
    icon: Search,
    emoji: "👥",
    title: "CURIOSITY",
    subtitle: "Ask the Questions No One Else Is Asking",
    color: "text-strategic",
    bg: "bg-strategic/10",
    border: "border-strategic/30",
    intro: "Transform from directive follower to strategic partner by mastering the art of asking questions that:",
    bullets: [
      "Force articulation of urgency and value",
      "Ensure diverse perspectives",
      "Prompt explicit priority choices",
      "Encourage systemic thinking",
    ],
    closing: "These aren't challenging questions. They're clarifying questions. You're not being difficult; you're being thorough.",
  },
  {
    icon: Gem,
    emoji: "💎",
    title: "CLARITY",
    subtitle: "Translating Vision into Team Impact",
    color: "text-bluedoor",
    bg: "bg-bluedoor/10",
    border: "border-bluedoor/30",
    intro: "Master the art of bridging boardroom vision and execution reality:",
    bullets: [
      "Connect team tasks directly to strategic objectives (make the invisible visible)",
      "Surface assumptions and eliminate ambiguity",
      'Show the "golden thread" from strategy to team goals to individual work to daily tasks',
      "Become the translator who prevents expensive missteps",
    ],
    closing: "When you provide clarity, colleagues start seeking your insights before making decisions.",
  },
];

const outcomes = [
  { icon: MessageSquare, title: "Practical Strategic Questions", description: "A toolkit of questions that demonstrate strategic thinking and position you as a contributor who cares about outcomes, not just outputs." },
  { icon: Sparkles, title: "Strategic Language Patterns", description: 'Learn to shift from "What do you want us to do?" to "What outcome are we driving toward?" Small language changes that signal strategic leadership.' },
  { icon: Compass, title: "The Stractical Spectrum", description: "Understand where you currently operate (tactical, stractical, or strategic) and exactly how to develop into each zone." },
  { icon: FileText, title: "Your Personal Blueprint", description: "A step-by-step action plan for immediate application. Identify upcoming decisions, craft your questions, practice courage, and document impact." },
  { icon: Target, title: "Real-World Application", description: "Work through actual scenarios from your organization, not generic case studies. Apply the framework to decisions you're facing right now." },
];

const weeks = [
  { week: 1, title: "Understanding Your Role in Strategy & Tactics", description: 'Break free from the "just a manager" trap. Discover why combination profiles create distinct behavioral patterns and how to use your unique position.' },
  { week: 2, title: "Stractical Pillar #1: COURAGE", description: "Build the conviction to voice insights that matter. Learn to challenge assumptions respectfully and speak up about misalignment without being difficult." },
  { week: 3, title: "Stractical Pillar #2: CURIOSITY", description: "Master the strategic questions that open conversations and uncover hidden opportunities. Move from accepting directives to exploring alternatives." },
  { week: 4, title: "Stractical Pillar #3: CLARITY", description: "Become the bridge between vision and execution. Learn to translate complex strategic goals into clear team action while conveying ground-level realities upward." },
  { week: 5, title: "Draft Your Stractical Blueprint™", description: "Synthesize everything into your personal framework. Create your action plan for consistently operating in the strategic integration zone." },
  { week: 6, title: "One-Month Check-In (Bonus)", description: "Review, reflect, and refine. Share wins, troubleshoot challenges, and make sure your transformation sticks.", bonus: true },
];

const forYouItems = [
  "You're a mid-level leader navigating organizational change",
  "You feel your team's expertise is overlooked in strategic planning",
  "You want to influence business decisions, not just execute them",
  "You're tired of being seen primarily as a directive executor",
  "You're ready to claim your seat at the table for transformation decisions",
  "You want to position yourself as a trusted collaborator, not just a strategy executor",
];

/* ──────────────────── MAIN COMPONENT ──────────────────── */
export default function StracticalLeaderWorkshop() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const navigate = useNavigate();
  const { scrollToId } = useSmoothScroll({ offset: 32 });
  const countdown = useCountdown(WORKSHOP_START_DATE);

  const isExpired = countdown.expired;

  const goToEnroll = () => {
    navigate("/partner/amplify/stractical-leader/enroll");
  };

  const scrollToRegister = () => scrollToId("register-section");

  return (
    <div>
      <WaitlistDialog open={waitlistOpen} onOpenChange={setWaitlistOpen} />

      {/* ═══ HERO ═══ */}
      <section className="bg-navy py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy via-navy/95 to-strategic/20" />
        <div className="container max-w-5xl mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-block bg-gold text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
              6-Week Intensive Leader Lab
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-white mb-4 leading-tight">
              Become a <span className="text-gold">Stractical Leader</span>
            </h1>
            <p className="text-xl md:text-2xl font-poppins font-medium text-white/90 mb-8">
              Stop Executing Directives. Start Shaping Strategy.
            </p>
            <div className="space-y-4 text-lg text-white/80 leading-relaxed mb-10">
              <p className="font-semibold text-white text-xl">
                Are you stuck in the "Just a Manager" trap?
              </p>
              <p>
                You sit in meetings thinking <em>"I'm just a manager."</em>
              </p>
              <p>
                Your team has the deepest knowledge of how things actually work on the ground, yet somehow you have the least influence on strategic direction.
              </p>
              <p>
                You're waving your arms about critical risks and opportunities you see clearly from the front lines, but everyone's looking elsewhere.
              </p>
              <p className="text-white/60">
                You possess vital insights. But your influence feels limited.
              </p>
              <p className="text-white font-semibold text-xl pt-2">
                This 6-week intensive leader lab changes that dynamic forever.
              </p>
            </div>

            {isExpired ? (
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-gold/20 text-gold font-poppins font-semibold text-sm px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4" /> Our latest cohort has begun
                </div>
                <div>
                  <Button
                    onClick={() => setWaitlistOpen(true)}
                    className="bg-gold border-2 border-gold text-navy font-poppins font-bold text-lg py-6 px-10 rounded-lg hover:bg-white hover:text-gold transition-colors"
                  >
                    JOIN THE WAITLIST <Bell className="ml-2 w-5 h-5" />
                  </Button>
                  <p className="text-white/50 text-sm mt-3">Be the first to know when the next lab is scheduled.</p>
                </div>
              </div>
            ) : (
              <Button
                onClick={scrollToRegister}
                className="bg-gold border-2 border-gold text-navy font-poppins font-bold text-lg py-6 px-10 rounded-lg hover:bg-white hover:text-gold transition-colors"
              >
                CLAIM YOUR SPOT <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* ═══ WHAT IS STRACTICAL ═══ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy mb-4">
            From Directive Taker to Strategic Influencer
          </h2>
          <p className="text-lg text-foreground/80 leading-relaxed mb-8 max-w-3xl mx-auto">
            The Stractical Leader Lab teaches you to operate in the <span className="font-semibold text-gold">integration zone</span> between strategic vision and tactical execution, the space where high-impact leadership happens.
          </p>
          <div className="bg-muted rounded-2xl p-8 md:p-12 max-w-2xl mx-auto border border-border/40">
            <p className="text-2xl md:text-3xl font-poppins font-bold text-navy mb-3">
              Stractical = <span className="text-primary">Strategic</span> + <span className="text-gold">Tactical</span>
            </p>
            <p className="text-foreground/80 italic text-lg leading-relaxed">
              "The ability to see and speak to the trees while envisioning and guiding the forest."
            </p>
          </div>
          <div className="mt-8 space-y-4 text-lg text-foreground/80 leading-relaxed max-w-3xl mx-auto text-left">
            <p>
              This isn't about choosing between strategy and tactics. It's about mastering both simultaneously, translating fluidly between operational detail and organizational vision.
            </p>
            <p className="font-semibold text-navy">
              When you're stractical, you become the critical link everyone needs but few can provide.
            </p>
            <p className="font-bold text-navy text-xl">
              When you're stractical, you become indispensable.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ THREE PILLARS ═══ */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block bg-primary/10 text-primary font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
              Your Framework
            </span>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy">
              The Stractical Blueprint: Your 3-Pillar Framework
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {pillars.map((pillar) => (
              <div key={pillar.title} className={`${pillar.bg} rounded-2xl p-8 border ${pillar.border} flex flex-col`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{pillar.emoji}</span>
                  <div>
                    <p className={`text-xs font-poppins font-semibold uppercase tracking-wider ${pillar.color}`}>Pillar</p>
                    <h3 className={`text-2xl font-poppins font-bold ${pillar.color}`}>{pillar.title}</h3>
                  </div>
                </div>
                <p className="font-poppins font-semibold text-navy mb-3">{pillar.subtitle}</p>
                <p className="text-foreground/80 text-sm mb-3">{pillar.intro}</p>
                <ul className="space-y-2 mb-4 flex-1">
                  {pillar.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${pillar.color}`} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <p className={`text-sm italic border-t border-border/30 pt-4 font-semibold ${pillar.color}`}>{pillar.closing}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WHAT YOU'LL WALK AWAY WITH ═══ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy">
              What You'll Walk Away With
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {outcomes.map((item, i) => (
              <div key={i} className="bg-muted rounded-xl p-6 border border-border/30">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-poppins font-semibold text-navy">{item.title}</h3>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ WORKSHOP STRUCTURE ═══ */}
      <section className="py-16 md:py-24 bg-navy">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="text-center mb-4">
            <span className="inline-block bg-gold/20 text-gold font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
              Leader Lab Workshop Structure
            </span>
            <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-2">
              6 Live Sessions
            </h2>
            <p className="text-white/70 text-lg">
              Wednesdays from 11:00 AM - 12:00 PM MST/PT (2:00pm - 3:00pm ET)
            </p>
            {isExpired ? (
              <p className="text-gold/70 font-poppins font-medium mt-2">
                Our latest cohort kicked off {WORKSHOP_DATE_SHORT}. New dates coming soon!
              </p>
            ) : (
              <>
                <p className="text-gold font-poppins font-semibold mt-2">
                  Next series kicks off {WORKSHOP_DATE_SHORT}
                </p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  {[
                    { label: "Days", value: countdown.days },
                    { label: "Hours", value: countdown.hours },
                    { label: "Mins", value: countdown.minutes },
                    { label: "Secs", value: countdown.seconds },
                  ].map((unit) => (
                    <div key={unit.label} className="flex flex-col items-center">
                      <span className="text-2xl md:text-3xl font-poppins font-bold text-gold tabular-nums">{String(unit.value).padStart(2, "0")}</span>
                      <span className="text-xs text-white/50 uppercase tracking-wider">{unit.label}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          <div className="mt-12 space-y-4">
            {weeks.map((w) => (
              <div key={w.week} className={`rounded-xl p-6 border ${w.bonus ? "bg-gold/10 border-gold/30" : "bg-white/5 border-white/10"}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 font-poppins font-bold text-sm ${w.bonus ? "bg-gold text-navy" : "bg-white/10 text-white"}`}>
                    {w.bonus ? "★" : `W${w.week}`}
                  </div>
                  <div>
                    <h3 className="font-poppins font-semibold text-white text-lg">{w.title}</h3>
                    <p className="text-white/70 text-sm mt-1 leading-relaxed">{w.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-8 text-white/60 text-sm">
            <span className="flex items-center gap-2"><PlayCircle className="w-4 h-4" /> All sessions recorded</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 60-day access after completion</span>
          </div>
        </div>
      </section>

      {/* ═══ THIS IS FOR YOU IF ═══ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-4xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold text-navy text-center mb-10">
            This Leader Lab Is For You If...
          </h2>
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {forYouItems.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-lime mt-0.5 shrink-0" />
                <p className="text-foreground/80">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REGISTER / PRICING ═══ */}
      <section id="register-section" className="py-16 md:py-24 bg-muted">
        <div className="container max-w-3xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg border border-border/40 overflow-hidden">
            {isExpired ? (
              /* ── WAITLIST MODE ── */
              <>
                <div className="bg-navy p-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Bell className="w-5 h-5 text-gold" />
                    <span className="text-gold font-poppins font-semibold text-sm">Next Cohort Coming Soon</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white">
                    Our Latest Lab Has Kicked Off
                  </h2>
                  <p className="text-white/70 mt-2">
                    Registration for this round is closed, but the next one is around the corner. Join the waitlist to be the first to know when new dates are announced.
                  </p>
                </div>
                <div className="p-8 md:p-12 text-center">
                  <p className="text-foreground/80 mb-6 max-w-md mx-auto">
                    The Stractical Leader Lab is an intimate, highly interactive experience capped at 25 participants. Spots fill quickly, and waitlist members get early access before public enrollment opens.
                  </p>
                  <Button
                    onClick={() => setWaitlistOpen(true)}
                    className="bg-gold border-2 border-gold text-navy font-poppins font-bold text-lg py-6 px-12 rounded-lg hover:bg-transparent hover:text-gold transition-colors w-full md:w-auto"
                  >
                    JOIN THE WAITLIST <Bell className="ml-2 w-5 h-5" />
                  </Button>
                  <p className="text-xs text-foreground/50 mt-4">We'll notify you as soon as new dates are scheduled.</p>
                </div>
              </>
            ) : (
              /* ── ACTIVE ENROLLMENT MODE ── */
              <>
                <div className="bg-navy p-8 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-gold" />
                    <span className="text-gold font-poppins font-semibold text-sm">Capped at 25 Participants</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white">
                    Claim Your Spot
                  </h2>
                  <p className="text-white/70 mt-2">
                    This is an intimate, highly interactive workshop. You won't be lectured at. You'll work through real scenarios, practice new language patterns, and receive direct feedback on your strategic positioning.
                  </p>
                </div>
                <div className="p-8 md:p-12 text-center">
                  <p className="text-sm text-foreground/60 font-poppins uppercase tracking-wider mb-1">Investment</p>
                  <p className="text-5xl font-poppins font-bold text-navy mb-6">$1,997</p>
                  <div className="space-y-3 text-left max-w-md mx-auto mb-8 text-sm text-foreground/80">
                    <p className="flex items-start gap-2"><Check className="w-4 h-4 text-lime mt-0.5 shrink-0" /> Your organization gains a leader who shapes strategy.</p>
                    <p className="flex items-start gap-2"><Check className="w-4 h-4 text-lime mt-0.5 shrink-0" /> Your team gains a voice in decisions that affect them.</p>
                    <p className="flex items-start gap-2"><Check className="w-4 h-4 text-lime mt-0.5 shrink-0" /> You gain the influence you've been building toward.</p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-foreground/60 mb-6">
                    <Calendar className="w-4 h-4" />
                    <span>Next series begins: <span className="font-semibold text-navy">{WORKSHOP_DATE_LABEL}</span></span>
                  </div>
                  <Button
                    onClick={goToEnroll}
                    className="bg-gold border-2 border-gold text-navy font-poppins font-bold text-lg py-6 px-12 rounded-lg hover:bg-transparent hover:text-gold transition-colors w-full md:w-auto"
                  >
                    CLAIM YOUR SPOT <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <p className="text-xs text-foreground/50 mt-4">Capped at 25 participants per cohort</p>
                  <div className="border-t border-border/40 mt-8 pt-6">
                    <p className="text-sm text-foreground/60 mb-2">Not ready to begin?</p>
                    <button
                      onClick={() => setWaitlistOpen(true)}
                      className="text-primary font-poppins font-semibold text-sm underline underline-offset-4 hover:text-primary/80 transition-colors"
                    >
                      Sign up to receive updates on future workshop dates
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ═══ MEET YOUR GUIDE ═══ */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-4xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
            <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden shrink-0 border-4 border-gold/30">
              <img src={amyPhoto} alt="Amy Yackowski" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="inline-block bg-gold/10 text-gold font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-4">
                Meet Your Guide
              </span>
              <h2 className="text-2xl md:text-3xl font-poppins font-bold text-navy mb-1">
                Amy Yackowski
              </h2>
              <p className="text-primary font-poppins font-medium mb-4">
                Chief Evolution Officer, Painted Porch Strategies
              </p>
              <div className="space-y-3 text-foreground/80 leading-relaxed">
                <p>
                  Amy specializes in Phase Zero, the critical preparation before change activation and implementation that most organizations skip. She partners with leaders and teams to develop the change-readiness, emotional intelligence, and strategic communication needed to make transformation stick.
                </p>
                <p>
                  Her approach blends ancient Stoic wisdom with modern organizational development, creating frameworks that are both philosophically grounded and immediately actionable.
                </p>
              </div>
              <blockquote className="mt-6 pl-4 border-l-4 border-gold italic text-foreground/70">
                "You are the expert of you. My role is to uncover and activate that expertise and position it stratically."
              </blockquote>
            </div>
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
                The Next Lab Is Coming Soon
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-3">
                Our latest Stractical Leader Lab has started, but new dates are on the way.
              </p>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                Join the waitlist and be the first to know when enrollment opens for the next cohort.
              </p>
              <Button
                onClick={() => setWaitlistOpen(true)}
                className="bg-gold border-2 border-gold text-navy font-poppins font-bold text-lg py-6 px-12 rounded-lg hover:bg-white hover:text-gold transition-colors"
              >
                JOIN THE WAITLIST <Bell className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-white/50 text-sm mt-4">Waitlist members get early access before public enrollment.</p>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-poppins font-bold text-white mb-4">
                Your Next Step
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-3">
                Transformation happens through consistent small actions that compound over time.
              </p>
              <p className="text-white/80 text-lg leading-relaxed mb-8">
                This workshop gives you the framework, the practice, and the accountability to make that transformation real.
              </p>
              <p className="text-gold font-poppins font-semibold text-xl mb-8">
                Stop feeling like "just a manager."<br />Start shaping the next big sh<span className="text-raspberry font-bold">IF</span>t for your organization.
              </p>
              <Button
                onClick={goToEnroll}
                className="bg-gold border-2 border-gold text-navy font-poppins font-bold text-lg py-6 px-12 rounded-lg hover:bg-white hover:text-gold transition-colors"
              >
                CLAIM YOUR SPOT <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-white/50 text-sm mt-4">Capped at 25 participants</p>
            </>
          )}
          <div className="mt-10 pt-8 border-t border-white/10 space-y-2 text-white/50 text-sm">
            <p>
              Questions? <a href="/contact?scope=Yourself&interest=leadership-lab&message=I%20have%20questions%20about%20your%20Stractical%20Leader%20Lab" className="text-gold hover:text-gold/80 underline">Contact Us</a>
            </p>
            <p className="text-white/40 italic mt-4">
              Sh<span className="text-raspberry font-bold">IF</span>t happens. The question is: are you ready?
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
