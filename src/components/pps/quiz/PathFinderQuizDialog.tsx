import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, Loader2, Mail, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  PQ1, PQ2_B2C, B2C_QUESTIONS, ORG_PQ2, TEAM_BRANCH, CHANGE_BRANCH, CAP_BRANCH, STRATEGIC_BRANCH,
  buildResult, type Answers, type Question, type QuizResult, type Track,
} from "@/data/pathFinderQuiz";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function buildQuestionPath(answers: Answers): { questions: Question[]; track: Track | null } {
  const pq1 = answers["PQ1"];
  if (!pq1) return { questions: [PQ1], track: null };

  if (pq1 === "A") {
    // B2C
    return { questions: [PQ1, PQ2_B2C, ...B2C_QUESTIONS], track: "b2c" };
  }
  // B2B
  const base: Question[] = [PQ1, ORG_PQ2];
  const pq2 = answers["OrgPQ2"];
  if (!pq2) return { questions: base, track: "b2b" };
  const branch =
    pq2 === "A" ? TEAM_BRANCH :
    pq2 === "B" ? CHANGE_BRANCH :
    pq2 === "C" ? CAP_BRANCH :
    STRATEGIC_BRANCH;
  return { questions: [...base, ...branch], track: "b2b" };
}

export default function PathFinderQuizDialog({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { questions, track } = useMemo(() => buildQuestionPath(answers), [answers]);
  const current = questions[index];

  // Reset on close
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => {
        setAnswers({}); setIndex(0); setShowResult(false);
        setEmail(""); setFirstName(""); setSubscribe(false); setSubmitted(false);
      }, 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  const result: QuizResult | null = useMemo(() => {
    if (!showResult || !track) return null;
    return buildResult(track, answers);
  }, [showResult, track, answers]);

  const setAnswer = (qid: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  };

  const onMultiToggle = (qid: string, optId: string) => {
    const prev = (answers[qid] as string[] | undefined) ?? [];
    let next: string[];
    if (optId === "neither") {
      next = prev.includes("neither") ? [] : ["neither"];
    } else {
      next = prev.filter((v) => v !== "neither");
      next = next.includes(optId) ? next.filter((v) => v !== optId) : [...next, optId];
    }
    setAnswer(qid, next);
  };

  const canAdvance = current
    ? current.multi
      ? ((answers[current.id] as string[] | undefined)?.length ?? 0) > 0
      : !!answers[current.id]
    : false;

  const isLast = index === questions.length - 1;

  const onNext = () => {
    if (!canAdvance) return;
    if (isLast) {
      setShowResult(true);
    } else {
      setIndex((i) => i + 1);
    }
  };
  const onBack = () => {
    if (index > 0) setIndex((i) => i - 1);
  };

  const onRetake = () => {
    setAnswers({}); setIndex(0); setShowResult(false);
    setSubmitted(false); setEmail(""); setFirstName(""); setSubscribe(false);
  };

  const onEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !firstName.trim() || !email.trim()) {
      toast({ title: "Please add your first name and email." });
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-path-finder-quiz", {
        body: {
          firstName: firstName.trim(),
          email: email.trim(),
          subscribe,
          track: result.track,
          resultType: result.resultType,
          headline: result.headline,
          subhead: result.subhead,
          answers,
          recommendations: [
            ...(result.primaryGroup ? [result.primaryGroup] : []),
            ...result.groups,
          ].map((g) => ({
            heading: g.heading,
            items: g.offerings.map((o) => ({ name: o.name, url: o.url, blurb: o.blurb, tier: o.tier })),
          })),
          strongestNextStep: result.strongestNextStep
            ? { name: result.strongestNextStep.offering.name, url: result.strongestNextStep.offering.url, label: result.strongestNextStep.label }
            : null,
        },
      });
      if (error) throw error;
      setSubmitted(true);
      toast({ title: "Sent! Check your inbox in a minute or two." });
    } catch (err) {
      console.error(err);
      toast({ title: "Couldn't send", description: "Please try again in a moment.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // --- progress ---
  const progressPct = Math.min(100, Math.round(((index + (showResult ? 1 : 0)) / Math.max(questions.length, 1)) * 100));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-white">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="font-poppins text-2xl text-navy flex items-center gap-2">
            <Compass className="w-6 h-6 text-primary" />
            P.A.T.H. Finder<sup className="text-xs">™</sup>
          </DialogTitle>
          <DialogDescription className="text-foreground">
            {showResult ? "Your starting point and what's available when you're ready for more." : "About 3 minutes. You'll leave knowing exactly where to start."}
          </DialogDescription>
          {!showResult && (
            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
            </div>
          )}
        </DialogHeader>

        {/* Body */}
        {!showResult && current && (
          <div className="px-6 pb-6">
            <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-2">
              Question {index + 1} of {questions.length}
            </p>
            <h3 className="font-poppins text-xl text-navy mb-1">{current.prompt}</h3>
            {current.helper && <p className="text-sm text-foreground/70 mb-4">{current.helper}</p>}

            <div className="space-y-2 mt-4">
              {current.options.map((opt) => {
                const isSelected = current.multi
                  ? ((answers[current.id] as string[] | undefined) ?? []).includes(opt.id)
                  : answers[current.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      current.multi
                        ? onMultiToggle(current.id, opt.id)
                        : setAnswer(current.id, opt.id)
                    }
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${isSelected ? "border-primary bg-primary" : "border-border"}`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-sm text-foreground">{opt.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button variant="ghost" onClick={onBack} disabled={index === 0}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button onClick={onNext} disabled={!canAdvance} className="bg-primary text-white hover:bg-primary/90">
                {isLast ? "See My Results" : "Next"} <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Result */}
        {showResult && result && (
          <div className="px-6 pb-6">
            {result.subhead && (
              <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">
                {result.subhead}
              </p>
            )}
            <h2 className="font-poppins text-3xl text-navy mb-4">{result.headline}</h2>
            <p className="text-foreground leading-relaxed mb-6">{result.narrative}</p>

            {result.strongestNextStep && (
              <div className={`p-4 rounded-lg border-2 mb-6 ${
                result.strongestNextStep.kind === "blueDoor"
                  ? "border-bluedoor bg-bluedoor/5"
                  : "border-primary bg-primary/5"
              }`}>
                <p className={`text-xs uppercase tracking-wider font-bold mb-1 ${
                  result.strongestNextStep.kind === "blueDoor" ? "text-bluedoor" : "text-primary"
                }`}>
                  {result.strongestNextStep.label}
                </p>
                <p className="font-poppins text-lg text-navy font-semibold mb-2">
                  {result.strongestNextStep.offering.name}
                </p>
                <Button asChild className={
                  result.strongestNextStep.kind === "blueDoor"
                    ? "bg-bluedoor text-white hover:bg-bluedoor/90"
                    : "bg-primary text-white hover:bg-primary/90"
                }>
                  <Link to={result.strongestNextStep.offering.url} onClick={() => onOpenChange(false)}>
                    Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            )}

            {result.primaryGroup && (
              <RecGroup heading={result.primaryGroup.heading} offerings={result.primaryGroup.offerings} onClose={() => onOpenChange(false)} primary />
            )}

            {result.groups.map((g, i) => (
              <RecGroup key={i} heading={g.heading} offerings={g.offerings} onClose={() => onOpenChange(false)} />
            ))}

            {result.crossoverNote && (
              <div className="mt-4 p-4 rounded-lg bg-purple/5 border border-purple/20">
                <p className="text-sm text-navy"><strong>Individual + Team crossover:</strong> {result.crossoverNote}</p>
              </div>
            )}

            <div className="mt-6 p-4 rounded-lg bg-muted">
              <p className="text-xs uppercase tracking-wider text-foreground/70 font-semibold mb-1">What Comes Next</p>
              <p className="text-sm text-foreground">{result.whatComesNext}</p>
            </div>

            {/* Email form */}
            <div className="mt-8 pt-6 border-t border-border">
              {submitted ? (
                <div className="flex items-center gap-3 text-navy">
                  <CheckCircle2 className="w-5 h-5 text-lime" />
                  <p className="font-poppins font-semibold">Sent! Check your inbox for your results.</p>
                </div>
              ) : (
                <form onSubmit={onEmailSubmit} className="space-y-3">
                  <h4 className="font-poppins text-lg text-navy flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" /> Email me these results
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="pf-firstName">First Name</Label>
                      <Input id="pf-firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="pf-email">Email</Label>
                      <Input id="pf-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                  </div>
                  <label className="flex items-start gap-2 text-sm text-foreground cursor-pointer">
                    <Checkbox checked={subscribe} onCheckedChange={(v) => setSubscribe(v === true)} className="mt-0.5" />
                    <span>Also subscribe me to updates on programs, resources, and insights.</span>
                  </label>
                  <Button type="submit" disabled={submitting} className="bg-primary text-white hover:bg-primary/90">
                    {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Mail className="w-4 h-4 mr-1" />}
                    Send my results
                  </Button>
                </form>
              )}
            </div>

            <div className="flex justify-between items-center mt-6">
              <Button variant="ghost" onClick={onRetake}>
                <RotateCcw className="w-4 h-4 mr-1" /> Retake
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RecGroup({ heading, offerings, onClose, primary }: { heading: string; offerings: { key: string; name: string; blurb: string; url: string; tier: string }[]; onClose: () => void; primary?: boolean }) {
  return (
    <div className={`mt-4 ${primary ? "" : ""}`}>
      <h4 className="font-poppins text-base font-semibold text-navy mb-2">{heading}</h4>
      <div className="grid gap-2">
        {offerings.map((o) => (
          <Link
            key={o.key}
            to={o.url}
            onClick={onClose}
            className="block p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-semibold text-navy text-sm">{o.name}</p>
                <p className="text-xs text-foreground/70 mt-0.5">{o.blurb}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-primary whitespace-nowrap mt-0.5">{o.tier}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
