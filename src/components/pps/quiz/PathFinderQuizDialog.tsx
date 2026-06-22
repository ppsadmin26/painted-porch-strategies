import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Compass, Loader2, Mail, Mic, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePathFinderOverrides, usePathFinderRtPools } from "@/hooks/usePathFinderOverrides";
import {
  PQ1, PQ2_B2C, B2C_QUESTIONS, ORG_PQ2, TEAM_BRANCH, CHANGE_BRANCH, CAP_BRANCH, STRATEGIC_BRANCH,
  buildResult, type Answers, type Question, type QuizResult, type Track, type Offering,
} from "@/data/pathFinderQuiz";
import { saveQuizContactPrefill, clearQuizContactPrefill } from "./quizContactPrefill";
import { useQuizRelatedContent } from "./useQuizRelatedContent";

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

const SESSION_KEY = "pps:pathfinder:state:v1";

type PersistedState = {
  answers: Answers;
  index: number;
  showResult: boolean;
};

function BoldShiftName({ name }: { name: string }) {
  if (!name.toLowerCase().includes("shift")) return <>{name}</>;

  // Match shIFt or ShIFt
  const match = name.match(/([sS])hIFt/);
  if (!match) return <>{name}</>;

  const [before, after] = name.split(match[0]);
  return (
    <>
      {before}{match[1]}h<span className="font-bold">IF</span>t{after}
    </>
  );
}

function BlueDoorInlineLink({ text }: { text: string }) {
  const phrase = "The Blue Door Organizational Appraisal";
  const parts = text.split(phrase);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <Link
              to="/blue-door"
              className="font-bold text-bluedoor hover:underline"
            >
              {phrase}
            </Link>
          )}
        </span>
      ))}
    </>
  );
}

function loadPersisted(): PersistedState | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Build the /contact deep link for the B2B quiz "Contact Us to Learn More" CTA.
 * Prefills scope + interests from the result and packs a human-readable summary
 * of the quiz outcome (headline, topic area, top picks, Strongest Next Step)
 * into the contact form `message` field so the submit-ghl-lead edge function
 * forwards it into the GHL opportunity's `contact_form_details` custom field.
 */
function formatAnswersText(questions: Question[], answers: Answers): string {
  const lines: string[] = [];
  questions.forEach((q, i) => {
    const ans = answers[q.id];
    if (ans === undefined) return;
    const ids = Array.isArray(ans) ? ans : [ans];
    const labels = ids.map((id) => q.options.find((o) => o.id === id)?.label ?? id);
    lines.push(`${i + 1}. ${q.prompt}`);
    labels.forEach((l) => lines.push(`   • ${l}`));
  });
  return lines.join("\n");
}

function buildQuizPrefillPayload(
  result: QuizResult,
  questions: Question[],
  answers: Answers,
): { scope?: string; interest?: string; message: string; answersText: string; resultHeadline: string } {
  const picks = (result.primaryGroup?.offerings ?? []).map((o) => `• ${o.name}`).join("\n");
  const strongest = result.strongestNextStep ? `\nStrongest Next Step: ${result.strongestNextStep.offering.name}` : "";
  const lines = [
    `Result: ${result.headline}${result.topicArea ? ` (${result.topicArea})` : ""}${strongest}`,
    ``,
    `Featured picks the quiz surfaced:`,
    picks || "• (none)",
  ];
  return {
    scope: result.contactPrefill?.scope,
    interest: result.contactPrefill?.interests?.length ? result.contactPrefill.interests.join(",") : undefined,
    message: lines.join("\n"),
    answersText: formatAnswersText(questions, answers),
    resultHeadline: result.headline,
  };
}

function buildContactHref(result: QuizResult, firstName: string, email: string): string {
  const payload = buildQuizPrefillPayload(result, [], {});
  const params = new URLSearchParams();
  if (payload.scope) params.set("scope", payload.scope);
  if (payload.interest) params.set("interest", payload.interest);
  // Note: quiz responses/recommendations are NOT pushed into the message URL
  // param. They live in sessionStorage and the contact form offers an opt-in
  // checkbox to include them, so the message field defaults to empty.
  if (firstName) params.set("firstName", firstName);
  if (email) params.set("email", email);
  const qs = params.toString();
  return qs ? `/contact?${qs}` : "/contact";
}


export default function PathFinderQuizDialog({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const persisted = typeof window !== "undefined" ? loadPersisted() : null;
  const [answers, setAnswers] = useState<Answers>(persisted?.answers ?? {});
  const [index, setIndex] = useState(persisted?.index ?? 0);
  const [showResult, setShowResult] = useState(persisted?.showResult ?? false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [viewableKeys, setViewableKeys] = useState<Set<string> | null>(null);
  const [comingSoonKeys, setComingSoonKeys] = useState<Set<string>>(new Set());
  const [featuredKeys, setFeaturedKeys] = useState<Set<string>>(new Set());

  const { questions, track } = useMemo(() => buildQuestionPath(answers), [answers]);
  const current = questions[index];

  // Persist progress per session so closing/reopening resumes where they left off.
  useEffect(() => {
    try {
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ answers, index, showResult } satisfies PersistedState),
      );
    } catch {
      /* ignore */
    }
  }, [answers, index, showResult]);

  // Fetch the admin-curated "eligible" allowlist once the dialog opens.
  // Rule: an offering is recommendable if is_live=true AND it has a URL or
  // anchor configured in /admin/path-finder-offerings. Failures fall back
  // to the unfiltered list so quiz results never go blank.
  useEffect(() => {
    if (!open || viewableKeys) return;
    let cancelled = false;
    (async () => {
      const [offeringsRes, draftsRes, launchRes] = await Promise.all([
        supabase
          .from("path_finder_offerings")
          .select("offering_key, is_live, current_url, dedicated_url, anchor_id, launch_slug, is_featured_in_quiz"),
        supabase
          .from("page_status")
          .select("path")
          .eq("status", "draft"),
        supabase
          .from("course_launch_status")
          .select("slug, status"),
      ]);
      if (cancelled) return;
      if (offeringsRes.error || !offeringsRes.data) {
        setViewableKeys(new Set());
        return;
      }
      const draftPaths = new Set<string>(
        (draftsRes.data ?? [])
          .map((r: { path: string | null }) => (r.path ?? "").trim())
          .filter(Boolean),
      );
      const launchStatusBySlug = new Map<string, string>(
        (launchRes.data ?? []).map((r: { slug: string; status: string | null }) => [r.slug, r.status ?? ""]),
      );
      const comingSoonSlugs = new Set<string>(
        Array.from(launchStatusBySlug.entries())
          .filter(([, s]) => s === "coming_soon")
          .map(([slug]) => slug),
      );
      const pathOf = (url: string | null): string | null => {
        if (!url) return null;
        const trimmed = url.trim();
        if (!trimmed) return null;
        if (/^https?:\/\//i.test(trimmed)) return null;
        const noHash = trimmed.split("#")[0].split("?")[0];
        return noHash || null;
      };
      const lastSegment = (url: string | null): string | null => {
        const p = pathOf(url);
        if (!p) return null;
        const parts = p.split("/").filter(Boolean);
        return parts[parts.length - 1] ?? null;
      };
      const isDraftDest = (
        currentUrl: string | null,
        dedicatedUrl: string | null,
      ): boolean => {
        const p1 = pathOf(currentUrl);
        const p2 = pathOf(dedicatedUrl);
        // Only drop the card when there is no live destination at all.
        // If the dedicated page is draft but current_url (parent page) is live,
        // the URL resolver will fall back to current_url + anchor so users can
        // still find the offering's launch-list card on the parent page.
        const currentDraft = p1 ? draftPaths.has(p1) : !p1;
        const dedicatedDraft = p2 ? draftPaths.has(p2) : !p2;
        if (!p1 && !p2) return true;
        if (!p1) return dedicatedDraft;
        if (!p2) return currentDraft;
        return currentDraft && dedicatedDraft;
      };

      const matchesComingSoon = (
        anchor: string | null,
        currentUrl: string | null,
        dedicatedUrl: string | null,
      ): boolean => {
        if (anchor && comingSoonSlugs.has(anchor.trim())) return true;
        const seg1 = lastSegment(dedicatedUrl);
        if (seg1 && comingSoonSlugs.has(seg1)) return true;
        const seg2 = lastSegment(currentUrl);
        if (seg2 && comingSoonSlugs.has(seg2)) return true;
        return false;
      };
      const eligible: string[] = [];
      const soon = new Set<string>();
      const featured = new Set<string>();
      for (const r of offeringsRes.data as Array<{
        offering_key: string;
        is_live: boolean;
        current_url: string | null;
        dedicated_url: string | null;
        anchor_id: string | null;
        launch_slug: string | null;
        is_featured_in_quiz: boolean | null;
      }>) {
        const hasDest =
          (r.current_url && r.current_url.trim().length > 0) ||
          (r.dedicated_url && r.dedicated_url.trim().length > 0) ||
          (r.anchor_id && r.anchor_id.trim().length > 0);
        if (!hasDest) continue;

        // Linked launch is the single source of truth when present; otherwise
        // fall back to the offering's own is_live flag.
        const linkedStatus = r.launch_slug ? launchStatusBySlug.get(r.launch_slug) : undefined;
        const effectiveLive =
          linkedStatus === "live" ||
          (!linkedStatus && r.is_live);
        const effectiveComingSoon =
          linkedStatus === "coming_soon" ||
          (!linkedStatus && r.is_live && matchesComingSoon(r.anchor_id, r.current_url, r.dedicated_url));

        if (!effectiveLive && !effectiveComingSoon) continue;
        if (isDraftDest(r.current_url, r.dedicated_url)) continue;

        eligible.push(r.offering_key);
        if (effectiveComingSoon && !effectiveLive) {
          soon.add(r.offering_key);
        }
        if (r.is_featured_in_quiz) featured.add(r.offering_key);
      }
      setViewableKeys(new Set(eligible));
      setComingSoonKeys(soon);
      setFeaturedKeys(featured);
    })();
    return () => { cancelled = true; };
  }, [open, viewableKeys]);

  const overrides = usePathFinderOverrides();
  const rtPools = usePathFinderRtPools();

  const applyOverrides = (o: Offering): Offering =>
    overrides[o.key] ? { ...o, url: overrides[o.key] } : o;

  const annotate = (o: Offering): Offering & { isComingSoon: boolean } => ({
    ...applyOverrides(o),
    isComingSoon: comingSoonKeys.has(o.key),
  });

  // Prioritize offerings that are live & accessible now, push coming-soon last.
  const prioritize = <T extends { isComingSoon: boolean }>(items: T[]): T[] => {
    const live = items.filter((o) => !o.isComingSoon);
    const soon = items.filter((o) => o.isComingSoon);
    return [...live, ...soon];
  };

  const result: QuizResult | null = useMemo(() => {
    if (!showResult || !track) return null;
    const r = buildResult(track, answers, { viewableKeys: viewableKeys ?? undefined, rtPools, featuredKeys });
    // If the Strongest Next Step is coming-soon but a live primary pick exists,
    // promote the first live primary pick into the strongest slot so users get
    // something they can begin right now.
    let strongest = r.strongestNextStep
      ? { ...r.strongestNextStep, offering: annotate(r.strongestNextStep.offering) }
      : undefined;
    if (
      strongest &&
      strongest.kind !== "blueDoor" &&
      strongest.offering.isComingSoon &&
      r.primaryGroup
    ) {
      const livePrimary = r.primaryGroup.offerings
        .map(annotate)
        .find((o) => !o.isComingSoon);
      if (livePrimary) {
        strongest = { ...strongest, offering: livePrimary };
      }
    }
    return {
      ...r,
      primaryGroup: r.primaryGroup
        ? { ...r.primaryGroup, offerings: prioritize(r.primaryGroup.offerings.map(annotate)) }
        : undefined,
      groups: r.groups.map((g) => ({ ...g, offerings: prioritize(g.offerings.map(annotate)) })),
      strongestNextStep: strongest,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult, track, answers, overrides, viewableKeys, comingSoonKeys, rtPools, featuredKeys]);
  const { items: relatedContent } = useQuizRelatedContent(result?.resultType ?? null);


  // Persist the prefill payload so /contact can hydrate from quiz context even
  // if the user navigates to a recommended workshop / Blue Door page first and
  // reaches the contact form later.
  useEffect(() => {
    if (result) saveQuizContactPrefill(buildQuizPrefillPayload(result, questions, answers));
  }, [result]);




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
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* ignore */ }
    clearQuizContactPrefill();
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
          relatedContent,
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
            P.A.T.H.finder {showResult ? "Quiz Results" : "Quiz"}
          </DialogTitle>
          <DialogDescription className="text-foreground">
            {showResult ? "Your starting point and what's available when you're ready for more." : "About 3 minutes. You'll know exactly where to step onto the Porch."}
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
            <p className="text-caption uppercase tracking-wider text-primary font-semibold mb-2">
              Question {index + 1} of {questions.length}
            </p>
            <h3 className="font-poppins text-xl text-navy mb-1">{current.prompt}</h3>
            {current.helper && <p className="text-body-sm text-foreground/70 mb-4">{current.helper}</p>}

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
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
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
              <p className="text-caption uppercase tracking-wider text-primary font-semibold mb-1">
                {result.subhead}
              </p>
            )}
            <h2 className="font-poppins text-3xl text-navy mb-4">{result.headline}</h2>
            <p className="text-body text-foreground leading-relaxed mb-6">{result.narrative}</p>

            {result.whyThisFits && (
              <div className="mb-6 p-4 rounded-lg border-l-4 border-primary bg-primary/5">
                <p className="text-caption uppercase tracking-wider text-primary font-semibold mb-1">Why this fits your answers</p>
                <p className="text-body-sm text-navy leading-relaxed">{result.whyThisFits}</p>
              </div>
            )}

            {result.strongestNextStep && (
              <div className={`p-4 rounded-lg border-2 mb-6 ${
                result.strongestNextStep.kind === "blueDoor"
                  ? "border-bluedoor bg-bluedoor/5"
                  : "border-primary bg-primary/5"
              }`}>
                <p className={`text-caption uppercase tracking-wider font-bold mb-1 ${
                  result.strongestNextStep.kind === "blueDoor" ? "text-bluedoor" : "text-primary"
                }`}>
                  {result.strongestNextStep.label}
                </p>
                <p className="font-poppins text-lead text-navy font-semibold mb-2">
                  <BoldShiftName name={result.strongestNextStep.offering.name} />
                </p>
                {(result.strongestNextStep.offering as { isComingSoon?: boolean }).isComingSoon && (
                  <p className="text-caption font-semibold text-gold mb-2">
                    Launching soon — join the launch list on the card to be notified.
                  </p>
                )}
                <Button asChild className={
                  result.strongestNextStep.kind === "blueDoor"
                    ? "bg-bluedoor text-white hover:bg-bluedoor/90"
                    : "bg-primary text-white hover:bg-primary/90"
                }>
                  <Link to={result.strongestNextStep.offering.url} onClick={() => onOpenChange(false)}>
                    {(result.strongestNextStep.offering as { isComingSoon?: boolean }).isComingSoon
                      ? "See Details & Join List"
                      : "Learn More"} <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            )}

            {result.crossoverNote && (
              <div className="mb-6 p-4 rounded-lg bg-purple/5 border border-purple/20">
                <p className="text-body-sm text-navy"><strong>Individual + Team crossover:</strong> {result.crossoverNote}</p>
              </div>
            )}

            {result.primaryGroup && (
              <RecGroup heading={result.primaryGroup.heading} offerings={result.primaryGroup.offerings} onClose={() => onOpenChange(false)} primary />
            )}

            {result.groups.map((g, i) => (
              <RecGroup key={i} heading={g.heading} offerings={g.offerings} onClose={() => onOpenChange(false)} />
            ))}

            {relatedContent.length > 0 && (
              <div className="mt-6">
                <h4 className="font-poppins text-base font-semibold text-navy mb-2">From the Porch — Related Reading</h4>
                <div className="grid gap-2">
                  {relatedContent.map((c) => {
                    const isExternal = /^https?:\/\//i.test(c.url);
                    const Icon = c.kind === "media" ? Mic : BookOpen;
                    const label = c.kind === "media" ? (c.source ? `Media · ${c.source}` : "Media") : "Blog";
                    const inner = (
                      <div className="flex items-start gap-3">
                        <Icon className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-body font-semibold text-navy">{c.title}</p>
                          {c.excerpt && (
                            <p className="text-body-sm text-foreground/70 mt-0.5 line-clamp-2">{c.excerpt}</p>
                          )}
                          <span className="text-[10px] uppercase tracking-wider font-bold text-primary mt-1 inline-block">{label}</span>
                        </div>
                      </div>
                    );
                    const className = "block p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
                    if (isExternal) {
                      return (
                        <a key={`${c.kind}-${c.url}`} href={c.url} target="_blank" rel="noopener noreferrer" onClick={() => onOpenChange(false)} className={className}>
                          {inner}
                        </a>
                      );
                    }
                    return (
                      <Link key={`${c.kind}-${c.url}`} to={c.url} onClick={() => onOpenChange(false)} className={className}>
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}


            {/* Topic note + Contact CTA — B2B only, suppressed in Scout Mode */}
            {result.track === "b2b" && result.topicArea && !/Scout Mode/i.test(result.subhead ?? "") && (
              <div className="mt-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
                <p className="text-body-sm text-foreground mb-3">
                  We also offer additional <strong>speaking</strong> and <strong>workshop</strong> sessions
                  in <strong className="text-primary">{result.topicArea}</strong>. The right fit depends on your team,
                  timing, and goals — let's discuss on a quick call.
                </p>
                <Button asChild className="bg-primary text-white hover:bg-primary/90">
                  <Link
                    to={buildContactHref(result, firstName, email)}
                    onClick={() => onOpenChange(false)}
                  >
                    Contact Us to Learn More <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            )}




            <div className="mt-6 p-4 rounded-lg bg-muted">
              <p className="text-caption uppercase tracking-wider text-foreground/70 font-semibold mb-1">What Comes Next</p>
              <p className="text-body-sm text-foreground">{result.whatComesNext}</p>
            </div>


            {/* Email form */}
            <div className="mt-8 pt-6 border-t border-border">
              {submitted ? (
                <div className="flex items-center gap-3 text-navy">
                  <CheckCircle2 className="w-5 h-5 text-lime" />
                  <p className="text-body font-poppins font-semibold">Sent! Check your inbox for your results.</p>
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

function RecGroup({ heading, offerings, onClose, primary }: { heading: string; offerings: { key: string; name: string; blurb: string; url: string; tier: string; isComingSoon?: boolean }[]; onClose: () => void; primary?: boolean }) {
  return (
    <div className={`mt-4 ${primary ? "" : ""}`}>
      <h4 className="font-poppins text-base font-semibold text-navy mb-2">{heading}</h4>
      <div className="grid gap-2">
        {offerings.map((o) => {
          const isExternal = /^https?:\/\//i.test(o.url);
          const className = "block p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-primary/5 transition-all group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
          const inner = (
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-body font-semibold text-navy -sm">
                  <BoldShiftName name={o.name} />
                </p>
                <p className="text-body text-foreground/70 mt-0.5">{o.blurb}</p>
                {o.isComingSoon && (
                  <p className="text-body text-[11px] font-semibold text-gold mt-1">
                    Launching soon — join the launch list on the card.
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 whitespace-nowrap">
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary mt-0.5">{o.tier}</span>
                {o.isComingSoon && (
                  <span className="text-[10px] uppercase tracking-wider font-bold text-gold">Coming soon</span>
                )}
              </div>
            </div>
          );
          if (isExternal) {
            return (
              <a
                key={o.key}
                href={o.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className={className}
              >
                {inner}
              </a>
            );
          }
          return (
            <Link key={o.key} to={o.url} onClick={onClose} className={className}>
              {inner}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

