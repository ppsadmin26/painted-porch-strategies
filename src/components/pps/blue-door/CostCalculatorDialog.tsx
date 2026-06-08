import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calculator,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BLUE_DOOR_PRICE_DISPLAY } from "@/config/blueDoor";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SourcedTooltip from "@/components/pps/SourcedTooltip";
import {
  INDUSTRY_BENCHMARKS,
  SIZE_PRESETS,
  IMPACT_SCOPES,
  CHANGE_TYPES,
  DURATION_OPTIONS,
  PHASE_ZERO_IMPACT,
  PROJECT_TIME_ALLOCATION,
  type IndustryKey,
  type SizeKey,
  type ImpactScopeKey,
  type ChangeTypeKey,
  type DurationMonths,
} from "@/data/calculatorBenchmarks";

interface CostCalculatorDialogProps {
  /** Override the default trigger button styling/copy. */
  triggerLabel?: string;
  triggerVariant?: "outline" | "default";
  triggerClassName?: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(n));

export default function CostCalculatorDialog({
  triggerLabel = "Calculate Your ROI",
  triggerVariant = "outline",
  triggerClassName,
}: CostCalculatorDialogProps = {}) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  // Inputs
  const [industry, setIndustry] = useState<IndustryKey>("tech");
  const [size, setSize] = useState<SizeKey>("mid");
  const [impactScope, setImpactScope] = useState<ImpactScopeKey>("department");
  const [duration, setDuration] = useState<DurationMonths>(12);

  // Change type — user toggles (operational is always on; others may force operational/tech on)
  const [userTech, setUserTech] = useState(false);
  const [userMna, setUserMna] = useState(false);
  const [userRegulatory, setUserRegulatory] = useState(false);
  const [userCultural, setUserCultural] = useState(false);

  // Derived active set with locking rules
  const techActive = userTech;
  const operationalActive = true; // always
  const regulatoryActive = userRegulatory;
  const mnaActive = userMna;
  const culturalActive = userCultural;
  const techLocked = false;
  const operationalLocked = true; // always on

  const activeTypes: ChangeTypeKey[] = [
    "operational",
    ...(techActive ? (["tech"] as ChangeTypeKey[]) : []),
    ...(mnaActive ? (["mna"] as ChangeTypeKey[]) : []),
    ...(regulatoryActive ? (["regulatory"] as ChangeTypeKey[]) : []),
    ...(culturalActive ? (["cultural"] as ChangeTypeKey[]) : []),
  ];

  // Advanced
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [salaryOverride, setSalaryOverride] = useState<string>("");
  const [outsideConsultants, setOutsideConsultants] = useState(false);

  // Lead form
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");

  const calc = useMemo(() => {
    const ind = INDUSTRY_BENCHMARKS[industry];
    const preset = SIZE_PRESETS[size];
    const scope = IMPACT_SCOPES[impactScope];
    const salary = parseFloat(salaryOverride) || ind.avgLoadedSalary;

    // Effective overrun/failure = MAX across industry baseline and all active change types
    const typeOverruns = activeTypes.map((k) => CHANGE_TYPES[k].overrunRate);
    const typeFailures = activeTypes.map((k) => CHANGE_TYPES[k].failureRate);
    const effOverrun = Math.max(ind.overrunRate, ...typeOverruns);
    const effFailure = Math.max(ind.failureRate, ...typeFailures);

    const teamLaborMonthly = preset.teamSize * (salary / 12) * PROJECT_TIME_ALLOCATION;
    const techMonthly = preset.teamSize * preset.techCostPerSeat;
    const outsideMonthly = outsideConsultants ? 3 * 48 * 200 : 0; // 3 consultants × ~48 hrs/mo × $200

    const monthlyBurn = teamLaborMonthly + techMonthly + outsideMonthly;
    const plannedTotal = monthlyBurn * duration;

    // Range using effective overrun rate ± 10%, scaled by impact scope
    const overrunLow = plannedTotal * Math.max(0, effOverrun - 0.10) * scope.multiplier;
    const overrunHigh = plannedTotal * (effOverrun + 0.10) * scope.multiplier;

    const failureWriteOff = plannedTotal * effFailure * scope.multiplier;

    const exposureLow = (overrunLow + failureWriteOff) * PHASE_ZERO_IMPACT.min;
    const exposureHigh = (overrunHigh + failureWriteOff) * PHASE_ZERO_IMPACT.max;

    return {
      ind,
      preset,
      scope,
      salary,
      effOverrun,
      effFailure,
      plannedTotal,
      overrunLow,
      overrunHigh,
      failureWriteOff,
      exposureLow,
      exposureHigh,
    };
  }, [industry, size, impactScope, duration, salaryOverride, outsideConsultants, activeTypes.join("|")]);

  const resultsForPayload = () => ({
    industry: calc.ind.label,
    industryKey: industry,
    size: calc.preset.label,
    sizeKey: size,
    teamSize: calc.preset.teamSize,
    impactScope: calc.scope.label,
    impactScopeKey: impactScope,
    impactMultiplier: calc.scope.multiplier,
    changeTypes: activeTypes.map((k) => CHANGE_TYPES[k].shortLabel),
    changeTypeKeys: activeTypes,
    effectiveOverrunRate: Number(calc.effOverrun.toFixed(2)),
    effectiveFailureRate: Number(calc.effFailure.toFixed(2)),
    durationMonths: duration,
    avgLoadedSalary: calc.salary,
    outsideConsultants,
    plannedTotal: Math.round(calc.plannedTotal),
    overrunLow: Math.round(calc.overrunLow),
    overrunHigh: Math.round(calc.overrunHigh),
    failureWriteOff: Math.round(calc.failureWriteOff),
    exposureLow: Math.round(calc.exposureLow),
    exposureHigh: Math.round(calc.exposureHigh),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      const { error } = await supabase.functions.invoke("submit-calculator-results", {
        body: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          company: company.trim() || undefined,
          role: role.trim() || undefined,
          results: resultsForPayload(),
        },
      });
      if (error) throw error;
      setSubmitted(true);
      toast({
        title: "Results sent.",
        description: "Check your inbox in the next minute or two.",
      });
    } catch (err) {
      console.error("submit-calculator-results failed", err);
      toast({
        title: "Something went sideways.",
        description: "We couldn't send the email just now. Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => {
      setOpen(o);
      if (!o) {
        // reset lead form on close so it's fresh next time
        setShowLeadForm(false);
        setSubmitted(false);
      }
    }}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          className={
            triggerClassName ??
            "mt-6 border-raspberry text-raspberry hover:bg-raspberry hover:text-white transition-all"
          }
        >
          <Calculator className="w-4 h-4 mr-2" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-navy flex items-center gap-2 font-poppins">
            <AlertTriangle className="w-5 h-5 text-raspberry" />
            The Cost of Skipping Phase Zero
          </DialogTitle>
          <DialogDescription>
            Pick three things. We'll estimate what's at risk and how a Blue Door
            operational appraisal can provide the clarity needed to reduce that exposure.
          </DialogDescription>
        </DialogHeader>

        {/* INPUTS */}
        <div className="space-y-5 py-2">
          {/* Industry */}
          <div className="space-y-2">
            <Label htmlFor="industry" className="text-navy font-semibold">
              Industry
            </Label>
            <select
              id="industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value as IndustryKey)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {Object.values(INDUSTRY_BENCHMARKS).map((b) => (
                <option key={b.key} value={b.key}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div className="space-y-2">
            <Label className="text-navy font-semibold">Core project team size</Label>
            <p className="text-xs text-muted-foreground -mt-1">
              People actively working on the initiative (not total impacted stakeholders).
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(SIZE_PRESETS).map((p) => {
                const active = size === p.key;
                return (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => setSize(p.key)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      active
                        ? "border-strategic bg-strategic/10 ring-2 ring-strategic/30"
                        : "border-input hover:border-strategic/50"
                    }`}
                  >
                    <div className="font-semibold text-sm text-navy">{p.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Impact scope */}
          <div className="space-y-2">
            <Label className="text-navy font-semibold">Impact scope</Label>
            <p className="text-xs text-muted-foreground -mt-1">
              How wide is the blast radius? Broader scope means more coordination and higher failure exposure.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(IMPACT_SCOPES).map((s) => {
                const active = impactScope === s.key;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setImpactScope(s.key)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      active
                        ? "border-strategic bg-strategic/10 ring-2 ring-strategic/30"
                        : "border-input hover:border-strategic/50"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-sm text-navy">{s.label}</div>
                      <div className="text-[10px] font-semibold text-strategic">
                        {s.multiplier.toFixed(1)}x
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {s.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Change type — multi-select with auto-inclusion rules */}
          <div className="space-y-2">
            <Label className="text-navy font-semibold">Change type</Label>
            <p className="text-xs text-muted-foreground -mt-1">
              Most changes are layered. Selecting Tech auto-includes Operational underneath. M&amp;A always includes Operational; you can add Tech if it applies.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["operational", "tech", "mna", "regulatory", "cultural"] as ChangeTypeKey[]).map((key) => {
                const ct = CHANGE_TYPES[key];
                let active = false;
                let locked = false;
                let onClick: () => void = () => {};
                if (key === "operational") {
                  active = true;
                  locked = true;
                } else if (key === "tech") {
                  active = techActive;
                  locked = techLocked;
                  onClick = () => !techLocked && setUserTech((v) => !v);
                } else if (key === "mna") {
                  active = mnaActive;
                  onClick = () => setUserMna((v) => !v);
                } else if (key === "regulatory") {
                  active = regulatoryActive;
                  onClick = () => setUserRegulatory((v) => !v);
                } else if (key === "cultural") {
                  active = culturalActive;
                  onClick = () => setUserCultural((v) => !v);
                }
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={onClick}
                    aria-pressed={active}
                    disabled={locked}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      active
                        ? "border-strategic bg-strategic/10 ring-2 ring-strategic/30"
                        : "border-input hover:border-strategic/50"
                    } ${locked ? "cursor-not-allowed opacity-95" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-sm text-navy">{ct.shortLabel}</div>
                      {locked && (
                        <div className="text-[9px] font-semibold uppercase tracking-wider text-strategic/70">
                          Included
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {ct.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>


          {/* Duration */}
          <div className="space-y-2">
            <Label className="text-navy font-semibold">
              Duration ({duration} months)
            </Label>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((m) => {
                const active = duration === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDuration(m)}
                    className={`px-4 py-1.5 rounded-full text-sm border transition-colors ${
                      active
                        ? "border-strategic bg-strategic text-white"
                        : "border-input text-navy hover:border-strategic/50"
                    }`}
                  >
                    {m} mo
                  </button>
                );
              })}
            </div>
          </div>

          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className="text-xs text-strategic font-semibold inline-flex items-center gap-1 hover:underline"
          >
            <ChevronDown
              className={`w-3 h-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
            />
            Advanced options
          </button>

          {showAdvanced && (
            <div className="space-y-3 p-3 rounded-lg bg-muted/40 border border-border/60">
              <div className="space-y-1">
                <Label htmlFor="salaryOverride" className="text-xs">
                  Override fully-loaded annual salary (USD)
                </Label>
                <Input
                  id="salaryOverride"
                  type="number"
                  placeholder={`Default: ${fmt(calc.ind.avgLoadedSalary)}`}
                  value={salaryOverride}
                  onChange={(e) => setSalaryOverride(e.target.value)}
                  min={0}
                />
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={outsideConsultants}
                  onChange={(e) => setOutsideConsultants(e.target.checked)}
                  className="rounded border-input"
                />
                <span>Include outside consultants (3 × ~48 hrs/mo × $200)</span>
              </label>
            </div>
          )}
        </div>

        {/* RESULTS */}
        <div className="space-y-3 border-t pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="p-3 rounded-lg bg-navy/5 border border-navy/15">
              <p className="text-[0.65rem] uppercase tracking-wider text-navy/70 font-poppins font-semibold">
                Planned investment
              </p>
              <p className="text-xl font-bold text-navy mt-1 tabular-nums">
                {fmt(calc.plannedTotal)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-gold/10 border border-gold/30">
              <p className="text-[0.65rem] uppercase tracking-wider text-gold font-poppins font-semibold">
                Likely overrun
              </p>
              <p className="text-xl font-bold text-gold mt-1 tabular-nums">
                {fmt(calc.overrunLow)}–{fmt(calc.overrunHigh)}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-raspberry/10 border border-raspberry/30">
              <p className="text-[0.65rem] uppercase tracking-wider text-raspberry font-poppins font-semibold">
                Failure write-off
              </p>
              <p className="text-xl font-bold text-raspberry mt-1 tabular-nums">
                {fmt(calc.failureWriteOff)}
              </p>
            </div>
          </div>

          {/* Phase Zero impact hero strip */}
          <div className="p-4 rounded-lg bg-[hsl(216,100%,30%)]/5 border-2 border-[hsl(216,100%,30%)]/30">
            <p className="text-xs uppercase tracking-wider text-[hsl(216,100%,30%)] font-poppins font-semibold">
              The Blue Door impact
            </p>
            <p className="text-base text-navy mt-1 leading-snug">
              A <span className="font-bold text-[hsl(216,100%,30%)]">{BLUE_DOOR_PRICE_DISPLAY} Blue Door</span>{" "}
              operational appraisal can provide the clarity needed to reduce the risked{" "}
              <span className="font-bold text-[hsl(216,100%,30%)] tabular-nums">
                {fmt(calc.exposureLow)}–{fmt(calc.exposureHigh)}
              </span>{" "}
              of this exposure.
            </p>
            <Button
              asChild
              className="mt-3 bg-bluedoor text-white hover:bg-bluedoor/90 h-12 px-8 text-base"
            >
              <Link to="/blue-door" onClick={() => setOpen(false)}>
                Step Through the Blue Door <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* How we calculated this */}
          <details className="text-xs text-muted-foreground">
            <summary className="cursor-pointer font-semibold hover:text-foreground">
              How we calculated this
            </summary>
            <div className="mt-2 space-y-2 leading-relaxed">
              <p>
                <span className="font-semibold">Planned investment</span> = team size
                × (loaded salary ÷ 12) × {Math.round(PROJECT_TIME_ALLOCATION * 100)}%
                allocation + tech/license + (optional) outside consultants, over the
                selected duration.
              </p>
              <p>
                <span className="font-semibold">Likely overrun</span> = planned ×
                effective overrun rate ({Math.round((calc.effOverrun - 0.1) * 100)}–
                {Math.round((calc.effOverrun + 0.1) * 100)}%), the worst-case across{" "}
                {calc.ind.label} and the selected change types (
                {activeTypes.map((k) => CHANGE_TYPES[k].shortLabel).join(", ")}).
              </p>
              <p>
                <span className="font-semibold">Failure write-off</span> = planned ×
                effective failure rate ({Math.round(calc.effFailure * 100)}%), same
                worst-case logic.
              </p>
              <p>
                <span className="font-semibold">Blue Door impact</span> = (overrun +
                failure) × {Math.round(PHASE_ZERO_IMPACT.min * 100)}–
                {Math.round(PHASE_ZERO_IMPACT.max * 100)}% (McKinsey + BCG research
                on Phase Zero exposure reduction).
              </p>
              <div className="pt-2">
                <p className="font-semibold mb-1">Industry sources:</p>
                <ul className="space-y-1 pl-3">
                  {calc.ind.sources.map((s, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span>•</span>
                      <span>
                        {s.label}{" "}
                        <SourcedTooltip
                          source={s.label}
                          sourceUrl={s.url}
                          size="xs"
                        />
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </div>

        {/* LEAD CAPTURE */}
        <div className="border-t pt-4 mt-2">
          {!submitted && !showLeadForm && (
            <button
              type="button"
              onClick={() => setShowLeadForm(true)}
              className="w-full text-center py-2 px-4 rounded-lg border-2 border-dashed border-strategic/40 text-strategic font-semibold hover:bg-strategic/5 transition-colors text-sm"
            >
              📧 Email me these results
            </button>
          )}

          {submitted && (
            <div className="flex items-center gap-2 text-sm text-lime font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              Sent. Check your inbox.
            </div>
          )}

          {showLeadForm && !submitted && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <p className="text-sm text-navy font-semibold">
                Get these results in your inbox
              </p>
              <p className="text-xs text-muted-foreground">
                Great for sharing with your team or championing the case
                internally.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  required
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  maxLength={60}
                />
                <Input
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  maxLength={60}
                />
              </div>
              <Input
                required
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Company (optional)"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  maxLength={100}
                />
                <Input
                  placeholder="Role (optional)"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  maxLength={80}
                />
              </div>
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-strategic text-white hover:bg-strategic/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending...
                  </>
                ) : (
                  <>Send me my results</>
                )}
              </Button>
              <p className="text-[0.65rem] text-muted-foreground">
                We'll send your results plus occasional Phase Zero insights. Unsubscribe anytime.
              </p>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
