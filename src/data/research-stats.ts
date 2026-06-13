/**
 * Centralized research stats — single source of truth for all cited data on the site.
 * Add a new stat once here, reference by id everywhere.
 */

export type ResearchStat = {
  id: string;
  /** Big-number display (e.g. "86%", "2 in 3", "$10T") */
  figure: string;
  /** Short label that follows the figure (used in cards/marquee) */
  label: string;
  /** Longer one-liner used in editorial settings */
  long?: string;
  /** Source attribution shown to the reader */
  source: string;
  /** Optional URL for the citation footnote */
  sourceUrl?: string;
  /** Year of the cited research */
  year?: string;
};

export const RESEARCH_STATS: Record<string, ResearchStat> = {
  // ── McKinsey: The State of Organizations 2026 ─────────────────────────
  mck_ai_readiness: {
    id: "mck_ai_readiness",
    figure: "86%",
    label: "of organizations aren't ready to adopt AI at scale",
    long: "86% of organizations aren't ready to adopt AI at scale.",
    source: "McKinsey, The State of Organizations 2026",
    sourceUrl: "https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/the-state-of-organizations-2026",
    year: "2026",
  },
  mck_complexity: {
    id: "mck_complexity",
    figure: "2 in 3",
    label: "leaders say their organization is overly complex and inefficient",
    long: "2 in 3 leaders say their organization is overly complex and inefficient.",
    source: "McKinsey, The State of Organizations 2026",
    sourceUrl: "https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/the-state-of-organizations-2026",
    year: "2026",
  },

  // ── Gartner: Change adoption + trust ───────────────────────────────────
  gartner_adoption: {
    id: "gartner_adoption",
    figure: "Only 32%",
    label: "of leaders say their last change effort actually stuck",
    long: "Only 32% of mid-to-senior leaders report their last change initiative achieved healthy adoption.",
    source: "Gartner, Change Management Research",
    year: "2024",
  },
  gartner_trust: {
    id: "gartner_trust",
    figure: "79%",
    label: "of employees have low trust in change",
    long: "79% of employees report low trust in the change happening around them.",
    source: "Gartner, Workforce Change Fatigue",
    year: "2024",
  },

  // ── Gallup: Engagement + economic cost ────────────────────────────────
  gallup_engagement: {
    id: "gallup_engagement",
    figure: "20%",
    label: "global employee engagement — its lowest level since 2020",
    long: "Global employee engagement fell to 20% in 2025, its lowest level since 2020.",
    source: "Gallup, State of the Global Workplace 2026",
    sourceUrl: "https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx",
    year: "2026",
  },
  gallup_cost: {
    id: "gallup_cost",
    figure: "$10T",
    label: "in lost productivity each year. That's 9% of global GDP",
    long: "Disengagement costs the global economy an estimated $10 trillion a year, or 9% of global GDP.",
    source: "Gallup, State of the Global Workplace 2026",
    sourceUrl: "https://www.gallup.com/workplace/349484/state-of-the-global-workplace.aspx",
    year: "2026",
  },

  // ── McKinsey Health: Burnout ──────────────────────────────────────────
  mck_health_burnout: {
    id: "mck_health_burnout",
    figure: "1 in 4",
    label: "employees report burnout symptoms",
    long: "1 in 4 employees report experiencing burnout symptoms at work.",
    source: "McKinsey Health Institute, Global Employee Wellbeing Survey",
    year: "2023",
  },

  // ── Deloitte: Wellbeing ────────────────────────────────────────────────
  deloitte_exhausted: {
    id: "deloitte_exhausted",
    figure: "52% / 49%",
    label: "of employees feel 'always' or 'often' exhausted or stressed",
    long: "About half of employees report feeling 'always' or 'often' exhausted (52%) or stressed (49%).",
    source: "Deloitte, Workplace Wellbeing Research",
    year: "2024",
  },
};

export const getStat = (id: keyof typeof RESEARCH_STATS) => RESEARCH_STATS[id];
