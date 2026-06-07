/**
 * "Cost of Skipping Phase Zero" data points.
 *
 * Each row pairs a qualitative cost with a sourceable, publicly available
 * statistic from the last 3 years (2022-2025). Stats are kept short for
 * use inline in tables; full citations live in `source` + `sourceUrl`.
 *
 * NOTE: Refresh annually. When updating, prefer the most recent McKinsey,
 * Gartner, BCG, IDC, or HBR publications.
 */

export type CostOfSkippingItem = {
  text: string;
  stat: string;
  source: string;
  sourceUrl: string;
};

export const costOfSkippingStats: CostOfSkippingItem[] = [
  {
    text: "Transformation initiative fumbles (delays), fizzles (descoped), or failures",
    stat: "~70% of transformations fall short of their goals",
    source: "McKinsey, Losing from day one (2023)",
    sourceUrl:
      "https://www.mckinsey.com/capabilities/people-and-organizational-performance/our-insights/losing-from-day-one-why-even-successful-transformations-fall-short",
  },
  {
    text: "Millions invested in technology that isn't fully adopted or ROI realized",
    stat: "~$1.3T spent on digital transformation in 2024; ~70% delivers no ROI",
    source: "IDC Worldwide Digital Transformation Spending Guide (2024) + HBR",
    sourceUrl:
      "https://www.idc.com/getdoc.jsp?containerId=prUS52254824",
  },
  {
    text: "Leadership teams misaligned, working in different directions",
    stat: "Misaligned leadership teams are 2x more likely to miss strategic goals",
    source: "LSA Global Leadership Alignment Research (2023)",
    sourceUrl:
      "https://lsaglobal.com/blog/the-high-cost-of-misalignment-in-the-workplace/",
  },
  {
    text: "Employee burnout and turnover from constant change without clarity",
    stat: "Employee willingness to support change fell from 74% (2016) to 38% (2022)",
    source: "Gartner HR Research, Change Fatigue (2023)",
    sourceUrl:
      "https://www.gartner.com/en/newsroom/press-releases/2023-01-25-gartner-hr-research-shows-organizations-are-experiencing-change-fatigue",
  },
  {
    text: "Change theater: activity without real transformation",
    stat: "Only ~12% of change programs deliver lasting value",
    source: "BCG, Flipping the Odds of Change (2024)",
    sourceUrl:
      "https://www.bcg.com/publications/2020/perspectives-from-change-management-survey",
  },
];
