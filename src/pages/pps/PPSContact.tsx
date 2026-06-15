import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDocumentSeo } from "@/hooks/useDocumentSeo";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { TierHeroSection } from "@/components/pps/TierHeroSection";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import contactHero from "@/assets/heroes/contact-hero.jpg";
import { loadQuizContactPrefill, clearQuizContactPrefill } from "@/components/pps/quiz/quizContactPrefill";
import { X } from "lucide-react";

const allInterestOptions = [
  { value: "assessments", label: "Assessments" },
  { value: "self-paced", label: "Self-Paced Learning" },
  { value: "leadership-lab", label: "Leadership Lab" },
  { value: "blue-door", label: "Blue Door Organizational Appraisal" },
  { value: "workshops", label: "Team Workshops" },
  { value: "strategic-partnership", label: "Strategic Partnership" },
  { value: "organizational-advisory", label: "Organizational Advisory" },
  { value: "1on1-advisory", label: "1:1 Coaching" },
  { value: "speaking", label: "Speaking (Event, Keynote, Podcast, Other)" },
  { value: "general", label: "General Inquiry/Other" },
];

// Options hidden when "Yourself" is selected in scope
const hiddenForYourself = new Set([
  "workshops",
  "blue-door",
  "strategic-partnership",
  "organizational-advisory",
]);

// Interests that trigger the budget range question
const budgetTriggerInterests = new Set([
  "workshops",
  "speaking",
  "organizational-advisory",
  "1on1-advisory",
]);

const scopeOptions = [
  { value: "Yourself", label: "Myself" },
  { value: "Team / Department", label: "Team / Department" },
  { value: "Company", label: "Company" },
  { value: "Someone Else", label: "Someone Else" },
];

const budgetRangeOptions = [
  { value: "less-than-1000", label: "Less than $1,000" },
  { value: "1000-4999", label: "$1,000 – $4,999" },
  { value: "5000-7999", label: "$5,000 – $7,999" },
  { value: "8000-14999", label: "$8,000 – $14,999" },
  { value: "15000-plus", label: "$15,000+" },
];

export default function PPSContact() {
  useDocumentSeo({
    title: "Contact Painted Porch Strategies | Start the Conversation",
    description: "Tell us about your shIFt. We partner with leaders, teams, and organizations ready to architect change that lasts. Start the conversation here.",
    ogImage: contactHero,
  });
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [inquiryFor, setInquiryFor] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [budgetAuthority, setBudgetAuthority] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [timeline, setTimeline] = useState("");
  const [specificDate, setSpecificDate] = useState<Date>();
  const [newsletter, setNewsletter] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [quizPrefillHeadline, setQuizPrefillHeadline] = useState<string | null>(null);

  // Pre-populate from URL query params (e.g. ?scope=Yourself&interest=leadership-lab&message=...)
  // Falls back to a P.A.T.H.finder quiz prefill saved in sessionStorage when
  // no URL params are present, so quiz context survives if the user visited a
  // recommended workshop or the Blue Door page before reaching /contact.
  useEffect(() => {
    const urlScope = searchParams.get("scope");
    const urlInterest = searchParams.get("interest");
    const urlMsg = searchParams.get("message");

    const fromQuiz = !urlScope && !urlInterest && !urlMsg ? loadQuizContactPrefill() : null;

    const scope = urlScope ?? fromQuiz?.scope ?? null;
    const interest = urlInterest ?? fromQuiz?.interest ?? null;
    const msg = urlMsg ?? fromQuiz?.message ?? null;

    if (scope) {
      const scopes = scope.split(",").filter((s) =>
        scopeOptions.some((o) => o.value === s)
      );
      if (scopes.length > 0) setInquiryFor(scopes);
    }
    if (interest) {
      const interests = interest.split(",").filter((i) =>
        allInterestOptions.some((o) => o.value === i)
      );
      if (interests.length > 0) setInterests(interests);
    }
    if (msg) setMessage(msg);
    if (fromQuiz) setQuizPrefillHeadline(fromQuiz.resultHeadline);
  }, []);

  const removeQuizPrefill = () => {
    clearQuizContactPrefill();
    setQuizPrefillHeadline(null);
    setMessage("");
    setInterests([]);
    setInquiryFor([]);
  };

  const hasScope = inquiryFor.length > 0;
  const isIndividualOnly = inquiryFor.length > 0 && inquiryFor.every((v) => v === "Yourself" || v === "Someone Else");

  // Progressive: show Organization only if scope includes Team/Department or Company
  const showOrganization = hasScope && !isIndividualOnly;

  // Progressive: show interests only after scope is selected
  const showInterests = hasScope;

  const visibleInterestOptions = useMemo(() => {
    if (isIndividualOnly) {
      return allInterestOptions.filter((o) => !hiddenForYourself.has(o.value));
    }
    return allInterestOptions;
  }, [isIndividualOnly]);

  const hasInterests = interests.length > 0;

  // Progressive: budget fields only after interests selected
  const isStrategicPartnershipOnly = interests.length === 1 && interests[0] === "strategic-partnership";
  const showBudgetAuthority = hasInterests && !isIndividualOnly && !isStrategicPartnershipOnly;
  const showBudgetRange = hasInterests && !isStrategicPartnershipOnly && interests.some((i) => budgetTriggerInterests.has(i));

  // Progressive: message/submit only after interests selected
  const showMessageAndSubmit = hasInterests;

  const toggleInterest = (value: string) => {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // When scope changes, clean up any now-hidden interests
  const toggleScope = (value: string) => {
    setInquiryFor((prev) => {
      const next = prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value];

      // If switching to individual-only (Yourself/Someone Else), remove hidden interests
      const nextIsIndividualOnly = next.length > 0 && next.every((v) => v === "Yourself" || v === "Someone Else");
      if (nextIsIndividualOnly) {
        setInterests((cur) => cur.filter((i) => !hiddenForYourself.has(i)));
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, boolean> = {};

    // Always-required fields
    if (!firstName.trim()) errors.firstName = true;
    if (!lastName.trim()) errors.lastName = true;
    if (!email.trim()) errors.email = true;
    if (!inquiryFor.length) errors.inquiryFor = true;
    if (!interests.length) errors.interests = true;
    if (!message.trim()) errors.message = true;

    // Conditionally-required fields, only validate if displayed
    if (showOrganization && !company.trim()) errors.company = true;
    if (showBudgetAuthority && !budgetAuthority) errors.budgetAuthority = true;
    if (showBudgetRange && !budgetRange) errors.budgetRange = true;
    if (showBudgetRange && !timeline) errors.timeline = true;

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-ghl-lead", {
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          company: company.trim() || undefined,
          interests,
          inquiryFor,
          message: message.trim(),
          budgetAuthority: showBudgetAuthority ? budgetAuthority : undefined,
          budgetRange: showBudgetRange ? budgetRange : undefined,
          timeline: showBudgetRange ? timeline : undefined,
          specificDate: specificDate ? format(specificDate, "yyyy-MM-dd") : undefined,
          newsletter,
          tags: ["contact-form"],
          source: "Painted Porch Website - Contact Form",
        },
      });

      if (error) throw error;

      // Send confirmation email to submitter and notification to team
      const emailData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        inquiryFor,
        interests,
        message: message.trim(),
        budgetAuthority: showBudgetAuthority ? budgetAuthority : undefined,
        budgetRange: showBudgetRange ? budgetRange : undefined,
        timeline: showBudgetRange ? timeline : undefined,
        specificDate: specificDate ? format(specificDate, "PPP") : undefined,
        newsletter,
      };

      const submissionId = crypto.randomUUID();

      // Fire both emails in parallel (non-blocking, don't fail the form if emails fail)
      Promise.allSettled([
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "contact-confirmation",
            recipientEmail: email.trim(),
            idempotencyKey: `contact-confirm-${submissionId}`,
            templateData: emailData,
          },
        }),
        supabase.functions.invoke("send-transactional-email", {
          body: {
            templateName: "contact-notification",
            recipientEmail: "explore@onthepaintedporch.com",
            idempotencyKey: `contact-notify-${submissionId}`,
            templateData: emailData,
          },
        }),
      ]).catch((err) => console.error("Email sending error:", err));

      setSubmitted(true);
      toast({ title: "Message sent!", description: "We'll be in touch soon." });
    } catch (err) {
      console.error("Contact form error:", err);
      toast({
        title: "Something went wrong",
        description: "Please try again or email us directly.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <TierHeroSection
        customBadge={
          <span className="inline-block bg-gold/90 text-navy font-poppins font-semibold text-sm px-4 py-1.5 rounded-full mb-6">
            Get In Touch
          </span>
        }
        headline="Let's Start a Conversation"
        description="Whether you're exploring possibilities or ready to move forward, we'd love to hear from you to determine next steps for partnering together on the Painted Porch."
        ctas={[
          { label: "Contact Us", href: "#contact-options", isAnchor: true, isPrimary: true },
        ]}
        background={{ type: "image", src: contactHero }}
        overlayClass="bg-navy/50"
        minHeightClass="min-h-[60vh]"
      />

      {/* Contact Form */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-6xl mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-bold text-navy mb-3">
                Drop Us a Line
              </h2>
              <p className="text-muted-foreground">
                You've got questions. We've got answers. Send us a message with the form below and we'll start a conversation on the porch.
              </p>
            </div>

            {submitted ? (
              <div className="bg-lime/10 border border-lime/30 rounded-xl p-12 text-center">
                <h3 className="text-xl md:text-2xl font-bold text-navy mb-3">Thank You!</h3>
                <p className="text-foreground mb-2">
                  Your message has been received. We'll review it and get back to you soon.
                </p>
                <p className="text-sm text-muted-foreground">
                  In the meantime, feel free to explore our{" "}
                  <a href="/partner" className="text-primary underline">partnership options</a>.
                </p>
              </div>
            ) : (
              <div className="bg-muted p-8 rounded-xl">
                {quizPrefillHeadline && (
                  <div className="mb-6 flex items-start gap-3 rounded-lg border border-teal/30 bg-teal/5 p-4">
                    <div className="flex-1 text-sm text-navy">
                      <p className="font-semibold">Including your P.A.T.H.finder quiz results</p>
                      <p className="text-foreground/80 mt-1">
                        Result: <span className="font-medium">{quizPrefillHeadline}</span>. Your answers and recommended next steps are prefilled in the message below so the team has full context.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeQuizPrefill}
                      className="flex-shrink-0 rounded p-1 text-foreground/60 hover:bg-teal/10 hover:text-navy focus:outline-none focus:ring-2 focus:ring-teal"
                      aria-label="Remove quiz prefill"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                  {/* Name */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        First Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        className={cn("w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary", fieldErrors.firstName ? "border-destructive" : "border-border")}
                        placeholder="Marcus"
                        value={firstName}
                        onChange={(e) => { setFirstName(e.target.value); setFieldErrors(prev => ({ ...prev, firstName: false })); }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        Last Name <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        className={cn("w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary", fieldErrors.lastName ? "border-destructive" : "border-border")}
                        placeholder="Aurelius"
                        value={lastName}
                        onChange={(e) => { setLastName(e.target.value); setFieldErrors(prev => ({ ...prev, lastName: false })); }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Email Address <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                        className={cn("w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary", fieldErrors.email ? "border-destructive" : "border-border")}
                        placeholder="marcus@romanempire.gov"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setFieldErrors(prev => ({ ...prev, email: false })); }}
                      />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      className="w-full px-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="(555) 867-5309"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>

                  {/* Who is this for? (moved up, right after phone) */}
                  <div>
                    <label className="block text-sm font-medium text-navy mb-2">
                      Who is this for? <span className="text-destructive">*</span>{" "}
                      <span className="text-muted-foreground font-normal">(select all that apply)</span>
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {scopeOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={inquiryFor.includes(option.value)}
                            onChange={() => { toggleScope(option.value); setFieldErrors(prev => ({ ...prev, inquiryFor: false })); }}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-foreground">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {fieldErrors.inquiryFor && <p className="text-xs text-destructive mt-1">Please select at least one option</p>}
                  </div>

                  {/* Organization (hidden for Yourself-only) */}
                  {showOrganization && (
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        Organization <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary ${fieldErrors.company ? "border-destructive" : "border-border"}`}
                        placeholder="Initech"
                        value={company}
                        onChange={(e) => { setCompany(e.target.value); setFieldErrors((prev) => ({ ...prev, company: false })); }}
                      />
                    </div>
                  )}

                  {/* What are you curious about? (shown after scope selected) */}
                  {showInterests && (
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        What are you curious about? <span className="text-destructive">*</span>{" "}
                        <span className="text-muted-foreground font-normal">(select all that apply)</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {visibleInterestOptions.map((option) => (
                          <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={interests.includes(option.value)}
                            onChange={() => { toggleInterest(option.value); setFieldErrors(prev => ({ ...prev, interests: false })); }}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                          />
                          <span className="text-sm text-foreground">{option.label}</span>
                        </label>
                      ))}
                    </div>
                    {fieldErrors.interests && <p className="text-xs text-destructive mt-1">Please select at least one interest</p>}
                  </div>
                  )}

                  {/* Budgetary authority */}
                  {showBudgetAuthority && (
                    <div>
                      <label className="block text-sm font-medium text-navy mb-2">
                        Do you have budgetary/purchasing authority? <span className="text-destructive">*</span>
                      </label>
                      <select
                        name="budget-authority"
                        className={cn("w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary", fieldErrors.budgetAuthority ? "border-destructive" : "border-border")}
                        value={budgetAuthority}
                        onChange={(e) => { setBudgetAuthority(e.target.value); setFieldErrors(prev => ({ ...prev, budgetAuthority: false })); }}
                      >
                        <option value="" disabled>Select one</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </div>
                  )}

                  {/* Budget range */}
                  {showBudgetRange && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">
                          What's your budget? <span className="text-destructive">*</span>
                        </label>
                        <p className="text-xs text-muted-foreground mb-2">
                          If unknown, select a reasonable estimated amount. Our Workshops, Speaking, and Advisory/Coaching start at $5,000.
                        </p>
                        <select
                          name="budget-range"
                          className={cn("w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary", fieldErrors.budgetRange ? "border-destructive" : "border-border")}
                          value={budgetRange}
                          onChange={(e) => { setBudgetRange(e.target.value); setFieldErrors(prev => ({ ...prev, budgetRange: false })); }}
                        >
                          <option value="" disabled>Select a range</option>
                          {budgetRangeOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">
                          What's your timeframe? <span className="text-destructive">*</span>
                        </label>
                        <select
                          name="timeline"
                          className={cn("w-full px-4 py-3 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary", fieldErrors.timeline ? "border-destructive" : "border-border")}
                          value={timeline}
                          onChange={(e) => {
                            setTimeline(e.target.value);
                            setFieldErrors(prev => ({ ...prev, timeline: false }));
                            if (e.target.value !== "specific-date") setSpecificDate(undefined);
                          }}
                        >
                          <option value="" disabled>Select a timeframe</option>
                          <option value="specific-date">I have a specific date</option>
                          <option value="within-30">Within 30 Days</option>
                          <option value="31-90">Next 31–90 Days</option>
                          <option value="3-6-months">In 3–6 Months</option>
                          <option value="6-plus">Greater than 6 Months</option>
                          <option value="unknown">I don't know yet</option>
                        </select>

                        {timeline === "specific-date" && (
                          <div className="mt-3">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className={cn(
                                    "w-full flex items-center gap-2 px-4 py-3 rounded-lg border border-border bg-background text-left focus:outline-none focus:ring-2 focus:ring-primary",
                                    !specificDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="h-4 w-4 opacity-50" />
                                  {specificDate ? format(specificDate, "PPP") : "Pick a date"}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={specificDate}
                                  onSelect={setSpecificDate}
                                  disabled={(date) => date < new Date()}
                                  initialFocus
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Message, Newsletter, Submit, shown after interests selected */}
                  {showMessageAndSubmit && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-navy mb-2">
                          Give Us the details <span className="text-destructive">*</span>
                        </label>
                      <textarea
                          rows={5}
                          className={cn("w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary", fieldErrors.message ? "border-destructive" : "border-border")}
                          placeholder="Tell us what's on your mind, the questions you have, or whatever else will help color in the conversation..."
                          value={message}
                          onChange={(e) => { setMessage(e.target.value); setFieldErrors(prev => ({ ...prev, message: false })); }}
                        />
                      </div>

                      <div>
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newsletter}
                            onChange={(e) => setNewsletter(e.target.checked)}
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary mt-0.5"
                          />
                          <span className="text-sm text-foreground">
                            Subscribe to stay up to date on Porch insights & happenings.
                            <span className="block text-xs text-muted-foreground mt-1">We will NOT SPAM you. Unsubscribe at any time.</span>
                          </span>
                        </label>
                      </div>

                      <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-primary border-2 border-primary text-white hover:bg-transparent hover:text-primary text-lg py-5 transition-colors"
                      >
                        {submitting ? "Sending..." : "Send Message"}
                      </Button>
                    </>
                  )}

                </form>
              </div>
            )}
          </div>

          <div className="max-w-3xl mx-auto mt-6">
            <div className="p-6 bg-lime/10 border border-lime/30 rounded-lg">
              <p className="text-lime font-semibold text-lg mb-2">Our Partnership Promise</p>
              <p className="text-sm text-foreground">
                We only work with organizations where we believe we can make a meaningful impact. If we're not the right fit, we'll tell you and try to point you in the right direction.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
