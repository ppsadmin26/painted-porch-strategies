/**
 * Per-route prerender content.
 *
 * Each entry becomes a static `dist/<path>/index.html` at build time so
 * crawlers (ChatGPT, Perplexity, Google, Bing) see real content instead
 * of the empty SPA shell. Real users still get the SPA — since main.tsx
 * uses `createRoot`, React replaces `#root` children on mount and there
 * is no hydration mismatch.
 *
 * Keep each body concise (150–400 words). It is search fodder, not the
 * live UI — the real UI takes over the instant JS loads.
 */

const SITE = "https://onthepaintedporch.com";

/** @typedef {{
 *   path: string;
 *   title: string;
 *   description: string;
 *   h1: string;
 *   intro: string;
 *   sections?: Array<{ h2: string; body: string; }>;
 *   links?: Array<{ href: string; label: string; }>;
 *   ogImage?: string;
 * }} RouteContent */

const commonLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Painted Porch Strategies" },
  { href: "/blue-door", label: "The Blue Door (organizational appraisal)" },
  { href: "/partner", label: "Partner With Us" },
  { href: "/partner/ignite", label: "IGNITE — self-led programs" },
  { href: "/partner/amplify", label: "AMPLIFY — 3–6 month partnership" },
  { href: "/partner/embody", label: "EMBODY — embedded partnership" },
  { href: "/resources", label: "Resources hub" },
  { href: "/contact", label: "Contact us" },
];

/** @type {RouteContent[]} */
export const routes = [
  {
    path: "/",
    title: "Painted Porch Strategies | Architect Extraordinary Outcomes",
    description:
      "Painted Porch Strategies partners with leaders to architect extraordinary outcomes through Phase Zero™ strategic positioning and organizational transformation.",
    h1: "Painted Porch Strategies — Architect Extraordinary Outcomes",
    intro:
      "Painted Porch Strategies partners with leaders and organizations at the moment of strategic authorship — before decisions are made, before initiatives get scoped. Founded by Amy Yackowski, PPS brings 20+ years of change origination experience to executives ready to architect market-leading transformation.",
    sections: [
      {
        h2: "What we do",
        body: "We partner with C-suite leaders and teams through three signature frameworks: Phase Zero™ (strategic positioning and architectural design before implementation), P.A.T.H.™ — Prepare, Align, Take Off, Habit (execution methodology for sustained change), and The Painted Porch Pillars™ — Cultural Cornerstone, Operational Frame, and Living Ecosystem (the load-bearing structure of adaptive organizations).",
      },
      {
        h2: "The three-track ecosystem",
        body: "The Blue Door ($1,500) is a strategic organizational appraisal and prerequisite for engagement. IGNITE is a self-led track of courses, assessments, and masterclasses. AMPLIFY is a 3–6 month partnership with workshops, sprints, and labs. EMBODY is a 6–12+ month embedded partnership including executive advisory.",
      },
    ],
    links: commonLinks,
  },
  {
    path: "/about",
    title: "About Painted Porch Strategies | Amy Yackowski, Founder",
    description:
      "Painted Porch Strategies was founded by Amy Yackowski to help organizations architect change instead of react to it. Meet the team and learn our story.",
    h1: "About Painted Porch Strategies",
    intro:
      "Painted Porch Strategies is a change-origination consultancy founded by Amy Yackowski. Named for the ancient stoa poikile — the painted porch where Zeno taught Stoicism — PPS applies practical Stoic wisdom to modern organizational transformation.",
    sections: [
      {
        h2: "Our story",
        body: "Amy Yackowski spent 20+ years inside change initiatives that failed for the same reason: leaders were reacting to change rather than authoring it. Painted Porch Strategies exists to change that. We partner with executives before decisions are locked, before programs are scoped, before initiatives start burning cash. That upstream moment — Phase Zero™ — is where market leadership is actually decided.",
      },
      {
        h2: "The team",
        body: "Amy Yackowski (Founder & Organizational Shift Strategist), Rob Yackowski (Master of Communication), and Sierra (Chief Joy Officer) lead client engagements. Each brings distinct strengths across strategy, communication architecture, and human capacity.",
      },
    ],
    links: [
      { href: "/amy", label: "Meet Amy Yackowski" },
      { href: "/rob", label: "Meet Rob Yackowski" },
      { href: "/sierra", label: "Meet Sierra" },
      { href: "/about/approach", label: "Our approach and philosophy" },
      { href: "/about/impact", label: "Our impact" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/about/approach",
    title: "Our Approach | Painted Porch Strategies",
    description:
      "The Painted Porch approach: five intentional shifts that move organizations from reactive to regenerative, adequate to extraordinary, transaction to transformation.",
    h1: "Our Approach",
    intro:
      "Real transformation requires movement across five intentional shifts. Each one represents a strategic choice about market position, not just operational improvement.",
    sections: [
      {
        h2: "The five shifts",
        body: "Reactive to Regenerative (from responding to originating). Resistant to Resilient (from blocking to adapting). Adequate to Extraordinary (from good enough to market-leading). Transaction to Transformation (from surface to structural). Insulated to Integrated (from siloed to cohesive). Every engagement is a coordinated push across these five dimensions.",
      },
    ],
    links: commonLinks,
  },
  {
    path: "/about/impact",
    title: "Our Impact | Painted Porch Strategies",
    description:
      "Painted Porch Strategies gives 5% of every engagement to nonprofit partners. See the causes we support and the organizations we've partnered with.",
    h1: "Our Impact",
    intro:
      "Painted Porch Strategies commits 5% of every client engagement to nonprofit partners chosen for their work with mental health, youth development, veterans, and animal welfare.",
    links: commonLinks,
  },
  {
    path: "/amy",
    title: "Amy Yackowski, Founder | Painted Porch Strategies",
    description:
      "Amy Yackowski is the Founder and Organizational Shift Strategist at Painted Porch Strategies. 20+ years architecting change across industries.",
    h1: "Amy Yackowski — Founder & Organizational Shift Strategist",
    intro:
      "Amy Yackowski is the Founder and Organizational Shift Strategist at Painted Porch Strategies. With 20+ years of experience architecting organizational change, she helps leaders design the capacity for market leadership through Phase Zero™ strategic positioning and The Painted Porch Pillars™ framework.",
    sections: [
      {
        h2: "How Amy partners",
        body: "Amy works with C-suite executives at the moment of strategic authorship — when leaders are determining what change to lead rather than reacting to change competitors have launched. She brings Stoic philosophy to modern transformation and refuses to accept 'change theater' or 'lift and shift' as substitutes for real architecture.",
      },
    ],
    links: [
      { href: "/about", label: "About Painted Porch Strategies" },
      { href: "/rob", label: "Meet Rob Yackowski" },
      { href: "/blue-door", label: "The Blue Door" },
      { href: "/contact", label: "Contact Amy" },
    ],
  },
  {
    path: "/rob",
    title: "Rob Yackowski, Master of Communication | Painted Porch Strategies",
    description:
      "Rob Yackowski is the Master of Communication at Painted Porch Strategies, designing change communication architecture that lands.",
    h1: "Rob Yackowski — Master of Communication",
    intro:
      "Rob Yackowski leads communication architecture at Painted Porch Strategies. He designs the messaging systems that make change legible, believable, and adoptable inside complex organizations.",
    links: commonLinks,
  },
  {
    path: "/sierra",
    title: "Sierra, Chief Joy Officer | Painted Porch Strategies",
    description:
      "Sierra is the Chief Joy Officer at Painted Porch Strategies — the team's reminder that joy is a strategic asset.",
    h1: "Sierra — Chief Joy Officer",
    intro:
      "Sierra is the Chief Joy Officer at Painted Porch Strategies. Every serious change initiative needs a joy anchor. Sierra is ours.",
    links: commonLinks,
  },
  {
    path: "/blue-door",
    title: "The Blue Door | Painted Porch Strategies",
    description:
      "The Blue Door is a $1,500 strategic organizational appraisal and prerequisite for engagement. Opens the door to sustainable, market-leading shift.",
    h1: "The Blue Door — Opening the Door to Strategic, Sustainable Shift",
    intro:
      "The Blue Door is a $1,500 strategic organizational appraisal and the required entry point for every Painted Porch engagement. It surfaces the strategic authorship gap — what shift your organization is positioned to lead, and whether you have the infrastructure to sustain it.",
    sections: [
      {
        h2: "What you get",
        body: "A structured diagnostic session, a personalized executive brief (PDF), and a clear read on which of the three Painted Porch Pillars™ — Cultural Cornerstone, Operational Frame, or Living Ecosystem — needs the most attention next. The output is direction, not just data.",
      },
      {
        h2: "Why it comes first",
        body: "Most consulting engagements start with a solution. The Blue Door starts with the question: what change could you credibly lead in your market? Without that answer, every downstream initiative is guesswork. With it, IGNITE, AMPLIFY, and EMBODY partnerships have a target.",
      },
    ],
    links: [
      { href: "/partner", label: "Partner with us" },
      { href: "/partner/amplify", label: "AMPLIFY partnership" },
      { href: "/partner/embody", label: "EMBODY partnership" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/partner",
    title: "Partner With Us | Painted Porch Strategies",
    description:
      "Three-tier partnership: IGNITE (self-led), AMPLIFY (3–6 months), EMBODY (6–12+ months). Start with the Blue Door to find your fit.",
    h1: "Partner With Painted Porch Strategies",
    intro:
      "Our partnership follows a three-tier progression. You start with the Blue Door — a $1,500 strategic organizational appraisal — and then choose the tier that matches your ambition and readiness.",
    sections: [
      {
        h2: "IGNITE — light the fire",
        body: "Self-led tools, masterclasses, and frameworks for leaders who want to test transformation before full commitment.",
      },
      {
        h2: "AMPLIFY — build compound momentum",
        body: "3–6 month partnership including workshops, sprints, labs, and targeted capability building for teams ready to shape excellence.",
      },
      {
        h2: "EMBODY — make it permanent",
        body: "6–12+ month embedded partnership and executive advisory for C-suites building unshakeable foundations for market leadership.",
      },
    ],
    links: [
      { href: "/blue-door", label: "Start with the Blue Door" },
      { href: "/partner/ignite", label: "Explore IGNITE" },
      { href: "/partner/amplify", label: "Explore AMPLIFY" },
      { href: "/partner/embody", label: "Explore EMBODY" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/partner/ignite",
    title: "IGNITE | Painted Porch Strategies",
    description:
      "IGNITE is the self-led Painted Porch track: courses, assessments, and masterclasses for leaders ready to test transformation.",
    h1: "IGNITE — Light the Fire",
    intro:
      "IGNITE is the entry-tier Painted Porch partnership. Self-led programs, assessments, and masterclasses designed for leaders and small teams who want to prove transformation works here before committing to a full engagement.",
    sections: [
      {
        h2: "What's inside IGNITE",
        body: "Self-paced leadership courses, individual and team assessments (including Working Genius and EQ-i), and live masterclasses on change communication, leadership development, and Stoic practical wisdom. Everything is built to move quickly and produce visible wins.",
      },
    ],
    links: [
      { href: "/partner/ignite/courses", label: "IGNITE courses" },
      { href: "/partner/ignite/assessments", label: "IGNITE assessments" },
      { href: "/partner/ignite/masterclasses", label: "IGNITE masterclasses" },
      { href: "/blue-door", label: "The Blue Door (prerequisite)" },
      { href: "/partner/amplify", label: "AMPLIFY partnership" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/partner/amplify",
    title: "AMPLIFY | Painted Porch Strategies",
    description:
      "AMPLIFY is a 3–6 month Painted Porch partnership: workshops, sprints, and labs that build compound momentum for teams ready to shape excellence.",
    h1: "AMPLIFY — Build Compound Momentum",
    intro:
      "AMPLIFY is the mid-tier Painted Porch partnership. A 3–6 month engagement combining workshops, sprints, and labs to build compound momentum across leadership, communication, and operational capacity.",
    sections: [
      {
        h2: "How AMPLIFY works",
        body: "AMPLIFY engagements typically stack: a targeted workshop opens the work, a 90-day sprint drives execution, and labs deepen specific capabilities. Every AMPLIFY track starts with The Blue Door so we design for your actual position, not a template.",
      },
      {
        h2: "Signature AMPLIFY programs",
        body: "Architect Change (Phase Zero™ strategic design), the Stractical Leader 6-Week Intensive, Leadership Development workshops, Communication Architecture sprints, and targeted labs on team dynamics and change readiness.",
      },
    ],
    links: [
      { href: "/partner/amplify/workshops", label: "AMPLIFY workshops" },
      { href: "/partner/amplify/sprints", label: "AMPLIFY sprints" },
      { href: "/partner/amplify/labs", label: "AMPLIFY labs" },
      {
        href: "/partner/amplify/stractical-leader",
        label: "Stractical Leader Intensive",
      },
      { href: "/blue-door", label: "The Blue Door (prerequisite)" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/partner/embody",
    title: "EMBODY | Painted Porch Strategies",
    description:
      "EMBODY is a 6–12+ month embedded partnership: full transformation architecture and executive advisory for C-suites building unshakeable foundations.",
    h1: "EMBODY — Make It Permanent",
    intro:
      "EMBODY is the deepest tier of Painted Porch partnership. A 6–12+ month embedded engagement including full transformation architecture and executive advisory for C-suites determined to build unshakeable foundations for sustained market leadership.",
    sections: [
      {
        h2: "What EMBODY includes",
        body: "Ongoing executive advisory, board-level strategic sessions, transformation architecture design, leadership team development, and hands-on coaching across all three Painted Porch Pillars™: Cultural Cornerstone, Operational Frame, and Living Ecosystem.",
      },
    ],
    links: [
      { href: "/blue-door", label: "The Blue Door (prerequisite)" },
      { href: "/partner/amplify", label: "AMPLIFY partnership" },
      { href: "/about", label: "About PPS" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/resources",
    title: "Resources | Painted Porch Strategies",
    description:
      "Free tools, guides, insights, FAQs, and a full media library from Painted Porch Strategies. Practical wisdom for change origination.",
    h1: "Resources",
    intro:
      "A growing library of free tools, insights, and guides on change origination, Phase Zero™ strategic positioning, leadership development, and Stoic practical wisdom applied to modern transformation.",
    links: [
      { href: "/resources/free", label: "Free tools and guides" },
      { href: "/resources/insights", label: "Insights and thought leadership" },
      { href: "/resources/faq", label: "Frequently asked questions" },
      { href: "/resources/youtube", label: "YouTube channel" },
      { href: "/resources/stractical-mini", label: "Stractical Leader mini guide" },
      { href: "/blue-door", label: "The Blue Door" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/resources/free",
    title: "Free Tools & Guides | Painted Porch Strategies",
    description:
      "Downloadable guides, calculators, and worksheets from Painted Porch Strategies. Practical Phase Zero™ tools you can use today.",
    h1: "Free Tools & Guides",
    intro:
      "Downloadable guides, calculators, and worksheets — practical Phase Zero™ tools you can use today. Includes the Stractical Leader mini guide, the Cost of Skipping calculator, burnout resources, and more.",
    links: [
      { href: "/resources/stractical-mini", label: "Stractical Leader mini guide" },
      { href: "/resources/insights", label: "Insights and thought leadership" },
      { href: "/blue-door", label: "The Blue Door" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/resources/faq",
    title: "FAQ | Painted Porch Strategies",
    description:
      "Frequently asked questions about Painted Porch Strategies: engagements, pricing, the Blue Door, partnership tiers, and how to work with Amy.",
    h1: "Frequently Asked Questions",
    intro:
      "Answers to the questions we hear most often about Painted Porch Strategies, our engagements, the Blue Door prerequisite, and how our IGNITE / AMPLIFY / EMBODY partnership tiers work.",
    links: commonLinks,
  },
  {
    path: "/resources/insights",
    title: "Insights | Painted Porch Strategies",
    description:
      "Thought leadership from Painted Porch Strategies on change origination, Phase Zero™ strategy, Stoic leadership, and organizational architecture.",
    h1: "Insights & Thought Leadership",
    intro:
      "Long-form thought leadership on change origination, Phase Zero™ strategic positioning, Stoic leadership, communication architecture, and the mechanics of building organizations that lead their markets.",
    links: commonLinks,
  },
];

export { SITE };
