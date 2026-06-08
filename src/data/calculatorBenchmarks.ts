/**
 * Calculator benchmarks — single source of truth for the Cost-of-Skipping calculator.
 *
 * All figures are sourced from publicly available research (2022-2025).
 * Refresh annually alongside `costOfSkippingStats.ts`.
 */

export type IndustryKey =
  | "tech"
  | "healthcare"
  | "manufacturing"
  | "finserv"
  | "pro-services"
  | "education"
  | "nonprofit"
  | "other";

export type IndustryBenchmark = {
  key: IndustryKey;
  label: string;
  /** Avg fully-loaded annual salary (BLS 2024 + benefits markup ~1.3x). */
  avgLoadedSalary: number;
  /** Typical project schedule overrun (decimal, e.g. 0.30 = +30%). */
  overrunRate: number;
  /** Probability transformation fails / writes off (decimal). */
  failureRate: number;
  sources: { label: string; url: string }[];
};

export const INDUSTRY_BENCHMARKS: Record<IndustryKey, IndustryBenchmark> = {
  tech: {
    key: "tech",
    label: "Technology / Software",
    avgLoadedSalary: 165000,
    overrunRate: 0.45, // McKinsey: tech projects often 45%+ over schedule
    failureRate: 0.70,
    sources: [
      { label: "BLS Software Developer 2024 + 30% benefits", url: "https://www.bls.gov/oes/current/oes151252.htm" },
      { label: "McKinsey, Delivering large-scale IT projects (2024)", url: "https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/delivering-large-scale-it-projects-on-time-on-budget-and-on-value" },
    ],
  },
  healthcare: {
    key: "healthcare",
    label: "Healthcare",
    avgLoadedSalary: 105000,
    overrunRate: 0.35,
    failureRate: 0.65,
    sources: [
      { label: "BLS Healthcare Management 2024", url: "https://www.bls.gov/ooh/management/medical-and-health-services-managers.htm" },
      { label: "Gartner Healthcare IT Survey (2023)", url: "https://www.gartner.com/en/industries/healthcare-providers" },
    ],
  },
  manufacturing: {
    key: "manufacturing",
    label: "Manufacturing / Industrial",
    avgLoadedSalary: 95000,
    overrunRate: 0.30,
    failureRate: 0.70,
    sources: [
      { label: "BLS Industrial Production Managers 2024", url: "https://www.bls.gov/ooh/management/industrial-production-managers.htm" },
      { label: "BCG Manufacturing Transformation (2024)", url: "https://www.bcg.com/industries/industrial-goods" },
    ],
  },
  finserv: {
    key: "finserv",
    label: "Financial Services",
    avgLoadedSalary: 145000,
    overrunRate: 0.40,
    failureRate: 0.68,
    sources: [
      { label: "BLS Financial Managers 2024", url: "https://www.bls.gov/ooh/management/financial-managers.htm" },
      { label: "Deloitte Banking Transformation (2024)", url: "https://www.deloitte.com/global/en/Industries/financial-services.html" },
    ],
  },
  "pro-services": {
    key: "pro-services",
    label: "Professional Services",
    avgLoadedSalary: 130000,
    overrunRate: 0.30,
    failureRate: 0.65,
    sources: [
      { label: "BLS Management Analysts 2024", url: "https://www.bls.gov/ooh/business-and-financial/management-analysts.htm" },
    ],
  },
  education: {
    key: "education",
    label: "Education",
    avgLoadedSalary: 85000,
    overrunRate: 0.30,
    failureRate: 0.72,
    sources: [
      { label: "BLS Postsecondary Education Administrators 2024", url: "https://www.bls.gov/ooh/management/postsecondary-education-administrators.htm" },
      { label: "EDUCAUSE Top 10 Issues (2024)", url: "https://www.educause.edu/research-and-publications/research/top-10-it-issues-technologies-and-trends" },
    ],
  },
  nonprofit: {
    key: "nonprofit",
    label: "Nonprofit / Mission-Driven",
    avgLoadedSalary: 75000,
    overrunRate: 0.30,
    failureRate: 0.70,
    sources: [
      { label: "GuideStar Nonprofit Compensation Report 2024", url: "https://learn.candid.org/" },
    ],
  },
  other: {
    key: "other",
    label: "Other / Mixed",
    avgLoadedSalary: 110000,
    overrunRate: 0.33,
    failureRate: 0.70,
    sources: [
      { label: "McKinsey, Losing from Day One (2023)", url: "https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/losing-from-day-one-why-even-successful-transformations-fall-short" },
    ],
  },
};

export type SizeKey = "small" | "mid" | "enterprise";

export type SizePreset = {
  key: SizeKey;
  label: string;
  description: string;
  teamSize: number;
  /** Default monthly tech/license cost per seat in USD. */
  techCostPerSeat: number;
};

export const SIZE_PRESETS: Record<SizeKey, SizePreset> = {
  small: {
    key: "small",
    label: "Small",
    description: "~10 on the core project team",
    teamSize: 10,
    techCostPerSeat: 75,
  },
  mid: {
    key: "mid",
    label: "Mid-Size",
    description: "~35 on the core project team",
    teamSize: 35,
    techCostPerSeat: 125,
  },
  enterprise: {
    key: "enterprise",
    label: "Enterprise",
    description: "100+ on the core project team",
    teamSize: 100,
    techCostPerSeat: 175,
  },
};

export const DURATION_OPTIONS = [3, 6, 12, 18, 24] as const;
export type DurationMonths = typeof DURATION_OPTIONS[number];

/**
 * Impact scope multiplier — adjusts exposure (overrun + write-off) based on
 * the blast radius of the change. Broader scope = more coordination, more
 * stakeholder friction, higher chance of failure compounding.
 * Source: BCG "Flipping the Odds" and Prosci Best Practices in Change
 * Management — failure rates rise ~1.3-1.6x for enterprise-wide/customer-
 * facing change vs. single-team initiatives.
 */
export type ImpactScopeKey = "team" | "department" | "org" | "customer";

export type ImpactScope = {
  key: ImpactScopeKey;
  label: string;
  description: string;
  multiplier: number;
};

export const IMPACT_SCOPES: Record<ImpactScopeKey, ImpactScope> = {
  team: {
    key: "team",
    label: "Single team",
    description: "Contained to one team or function",
    multiplier: 1.0,
  },
  department: {
    key: "department",
    label: "Department",
    description: "Multiple teams in one business unit",
    multiplier: 1.2,
  },
  org: {
    key: "org",
    label: "Org-wide",
    description: "Touches most of the organization",
    multiplier: 1.4,
  },
  customer: {
    key: "customer",
    label: "Customer-facing",
    description: "Changes customer or partner experience",
    multiplier: 1.6,
  },
};

/**
 * Change type — what kind of change is being attempted.
 *
 * Selection rules (enforced in UI):
 *   • operational   — always on (every change touches process/people).
 *   • tech          — selecting this forces operational on.
 *   • mna           — selecting this forces operational AND tech on.
 *   • regulatory    — selecting this forces operational on; tech is optional add.
 *   • cultural      — independent toggle.
 *
 * When multiple types are active, effective overrun/failure rates use the
 * MAX across selected types (worst-case honest read), and replace the
 * industry baseline if higher.
 *
 * Sources:
 *   • McKinsey "Delivering large-scale IT projects" (tech 45–70% overrun, 70%+ fail)
 *   • BCG/HBR M&A integration studies (50–80% PMI overrun, 70–83% fail)
 *   • Prosci Best Practices in Change Management (operational/cultural rates)
 *   • Gartner regulatory program benchmarks (compliance: deadline-driven, lower fail)
 */
export type ChangeTypeKey =
  | "operational"
  | "tech"
  | "mna"
  | "regulatory"
  | "cultural";

export type ChangeType = {
  key: ChangeTypeKey;
  label: string;
  shortLabel: string;
  description: string;
  overrunRate: number;
  failureRate: number;
  /** Other change types automatically activated when this one is selected. */
  forces: ChangeTypeKey[];
};

export const CHANGE_TYPES: Record<ChangeTypeKey, ChangeType> = {
  operational: {
    key: "operational",
    label: "Operational / Process",
    shortLabel: "Operational",
    description: "Restructure, workflow redesign, new operating model",
    overrunRate: 0.32,
    failureRate: 0.62,
    forces: [],
  },
  tech: {
    key: "tech",
    label: "Technology / Digital",
    shortLabel: "Technology",
    description: "ERP, platform migration, AI rollout, system replacement",
    overrunRate: 0.55,
    failureRate: 0.72,
    forces: ["operational"],
  },
  mna: {
    key: "mna",
    label: "M&A / Post-Merger Integration",
    shortLabel: "M&A / PMI",
    description: "Acquisition, merger, divestiture integration",
    overrunRate: 0.65,
    failureRate: 0.78,
    forces: ["operational", "tech"],
  },
  regulatory: {
    key: "regulatory",
    label: "Regulatory / Compliance",
    shortLabel: "Regulatory",
    description: "Deadline-driven compliance program (HIPAA, SOX, etc.)",
    overrunRate: 0.22,
    failureRate: 0.35,
    forces: ["operational"],
  },
  cultural: {
    key: "cultural",
    label: "Cultural / Leadership",
    shortLabel: "Cultural",
    description: "Values shift, leadership transition, mindset reset",
    overrunRate: 0.28,
    failureRate: 0.55,
    forces: [],
  },
};

/**
 * Conservative range of exposure reduction a Blue Door + Phase Zero
 * engagement is expected to deliver, based on McKinsey "Losing from Day One"
 * and BCG "Flipping the Odds" research showing well-architected pre-work
 * reduces failure/overrun exposure by ~10-15%.
 */
export const PHASE_ZERO_IMPACT = {
  min: 0.10,
  max: 0.15,
} as const;

/** % of team labor budget actually applied to the initiative (vs. day job). */
export const PROJECT_TIME_ALLOCATION = 0.65;

/** Average annual working hours used for hourly rate conversion. */
export const ANNUAL_WORKING_HOURS = 2080;
