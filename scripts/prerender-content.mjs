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
    title: "The Blue Door (Coming Soon) | Painted Porch Strategies",
    description:
      "Coming Soon: The Blue Door, a $1,500 strategic organizational appraisal and prerequisite for engagement. Reserve now and we will email your access link on launch day.",
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
  {
    path: "/partner/amplify/workshops",
    title: "AMPLIFY Workshops | Painted Porch Strategies",
    description:
      "Live, cohort-based leadership and change workshops inside AMPLIFY. Architect Change, communication architecture, change readiness, and more.",
    h1: "AMPLIFY Workshops",
    intro:
      "Cohort-based workshops that open AMPLIFY engagements or run as targeted capability builds. Every workshop is anchored in Phase Zero™ and The Painted Porch Pillars™ so the work sticks after the room clears.",
    links: [
      { href: "/partner/amplify", label: "AMPLIFY overview" },
      { href: "/partner/amplify/sprints", label: "AMPLIFY sprints" },
      { href: "/partner/amplify/labs", label: "AMPLIFY labs" },
      { href: "/partner/amplify/stractical-leader", label: "Stractical Leader Intensive" },
      { href: "/blue-door", label: "The Blue Door (prerequisite)" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/partner/amplify/sprints",
    title: "AMPLIFY Sprints | Painted Porch Strategies",
    description:
      "90-day AMPLIFY sprints that drive focused execution across leadership, communication, and operational capacity.",
    h1: "AMPLIFY Sprints",
    intro:
      "AMPLIFY sprints are 90-day focused execution engagements. Each sprint is designed around a specific transformation target surfaced by the Blue Door and structured through the P.A.T.H.™ methodology.",
    links: [
      { href: "/partner/amplify", label: "AMPLIFY overview" },
      { href: "/partner/amplify/workshops", label: "AMPLIFY workshops" },
      { href: "/partner/amplify/labs", label: "AMPLIFY labs" },
      { href: "/blue-door", label: "The Blue Door (prerequisite)" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/partner/amplify/labs",
    title: "AMPLIFY Labs | Painted Porch Strategies",
    description:
      "AMPLIFY labs deepen specific capabilities — team dynamics, change readiness, communication systems — through hands-on practice.",
    h1: "AMPLIFY Labs",
    intro:
      "AMPLIFY labs are hands-on, capability-specific engagements. They pair with workshops and sprints to deepen the muscles a specific transformation needs.",
    links: [
      { href: "/partner/amplify", label: "AMPLIFY overview" },
      { href: "/partner/amplify/workshops", label: "AMPLIFY workshops" },
      { href: "/partner/amplify/sprints", label: "AMPLIFY sprints" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/partner/amplify/stractical-leader",
    title: "The Stractical Leader 6-Week Intensive | Painted Porch Strategies",
    description:
      "A 6-week intensive that turns tactical managers into stractical leaders combining strategic thinking with practical execution.",
    h1: "The Stractical Leader — 6-Week Intensive",
    intro:
      "The Stractical Leader Intensive is a 6-week AMPLIFY program that builds strategic-plus-tactical (stractical) leadership capacity. Live cohort sessions, applied assignments, and direct coaching from Amy Yackowski.",
    links: [
      { href: "/resources/stractical-mini", label: "Stractical mini guide (free)" },
      { href: "/partner/amplify", label: "AMPLIFY overview" },
      { href: "/blue-door", label: "The Blue Door (prerequisite)" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/partner/ignite/courses",
    title: "IGNITE Courses | Painted Porch Strategies",
    description:
      "Self-paced leadership and change courses inside the IGNITE tier of Painted Porch Strategies.",
    h1: "IGNITE Courses",
    intro:
      "Self-paced courses covering change origination, leadership fundamentals, communication architecture, and Stoic practical wisdom for modern leaders.",
    links: [
      { href: "/partner/ignite", label: "IGNITE overview" },
      { href: "/partner/ignite/assessments", label: "IGNITE assessments" },
      { href: "/partner/ignite/masterclasses", label: "IGNITE masterclasses" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/partner/ignite/assessments",
    title: "IGNITE Assessments | Painted Porch Strategies",
    description:
      "Individual and team assessments inside IGNITE: Working Genius, EQ-i, change readiness, and elemental style.",
    h1: "IGNITE Assessments",
    intro:
      "A library of individual and team assessments that surface how you and your people are wired for change: Working Genius, EQ-i 2.0, change readiness, elemental style, and team health.",
    links: [
      { href: "/partner/ignite", label: "IGNITE overview" },
      { href: "/eq", label: "EQ-i 2.0 assessment" },
      { href: "/partner/ignite/assessments/working-genius", label: "Working Genius" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/partner/ignite/masterclasses",
    title: "IGNITE Masterclasses | Painted Porch Strategies",
    description:
      "Live and on-demand masterclasses on change origination, leadership, communication, and Stoic wisdom.",
    h1: "IGNITE Masterclasses",
    intro:
      "Live and on-demand masterclasses on the topics leaders wrestle with most: originating change, leading through uncertainty, designing communication that lands, and applying Stoic practical wisdom.",
    links: [
      { href: "/partner/ignite", label: "IGNITE overview" },
      { href: "/partner/ignite/courses", label: "IGNITE courses" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/speaking",
    title: "Speaking & Workshops | Painted Porch Strategies",
    description:
      "Book Amy Yackowski, Rob Yackowski, or the Painted Porch team for keynotes, workshops, and executive sessions on change origination.",
    h1: "Speaking & Workshops",
    intro:
      "Amy Yackowski and the Painted Porch team deliver keynotes, workshops, and executive sessions on change origination, Phase Zero™ strategy, Stoic leadership, and communication architecture.",
    links: [
      { href: "/speaking/topics", label: "Talk topics" },
      { href: "/speaking/amy", label: "Amy Yackowski (speaker)" },
      { href: "/speaking/rob", label: "Rob Yackowski (speaker)" },
      { href: "/speaking/media", label: "As seen on" },
      { href: "/contact", label: "Book a session" },
    ],
  },
  {
    path: "/speaking/topics",
    title: "Speaking Topics | Painted Porch Strategies",
    description:
      "Signature talk and workshop topics from Painted Porch Strategies: Phase Zero, Stractical Leadership, Stoic leadership, and change origination.",
    h1: "Speaking Topics",
    intro:
      "Signature keynote and workshop topics from the Painted Porch team, ranging from Phase Zero™ strategic authorship to Stoic practical wisdom for modern leaders.",
    links: [
      { href: "/speaking", label: "Speaking overview" },
      { href: "/contact", label: "Book a session" },
    ],
  },
  {
    path: "/speaking/amy",
    title: "Amy Yackowski, Speaker | Painted Porch Strategies",
    description:
      "Book Amy Yackowski, Founder of Painted Porch Strategies, for keynotes and workshops on change origination and Stoic leadership.",
    h1: "Amy Yackowski — Keynote Speaker",
    intro:
      "Amy Yackowski delivers keynotes and workshops on change origination, Phase Zero™ strategy, and Stoic practical wisdom for modern executives. 20+ years inside real transformations, no theater.",
    links: [
      { href: "/speaking", label: "All speakers" },
      { href: "/speaking/topics", label: "Talk topics" },
      { href: "/contact", label: "Book Amy" },
    ],
  },
  {
    path: "/speaking/rob",
    title: "Rob Yackowski, Speaker | Painted Porch Strategies",
    description:
      "Book Rob Yackowski, Master of Communication at Painted Porch Strategies, for keynotes on change communication architecture.",
    h1: "Rob Yackowski — Keynote Speaker",
    intro:
      "Rob Yackowski speaks on communication architecture, the six communicator styles, and how to make change legible inside complex organizations.",
    links: [
      { href: "/speaking", label: "All speakers" },
      { href: "/6-communicator-styles", label: "Six Communicator Styles" },
      { href: "/contact", label: "Book Rob" },
    ],
  },
  {
    path: "/speaking/media",
    title: "As Seen On | Painted Porch Strategies",
    description:
      "Media appearances, podcasts, and press coverage featuring Painted Porch Strategies.",
    h1: "As Seen On",
    intro:
      "Podcasts, press, and media appearances featuring Amy Yackowski and the Painted Porch team on change origination, leadership, and Stoic practical wisdom.",
    links: commonLinks,
  },
  {
    path: "/contact",
    title: "Contact Painted Porch Strategies",
    description:
      "Get in touch with Painted Porch Strategies to discuss partnership, the Blue Door, speaking, or workshops.",
    h1: "Contact Painted Porch Strategies",
    intro:
      "Ready to talk? Send us a message and we will respond within one business day. For engagement inquiries, we recommend starting with The Blue Door, our $1,500 strategic organizational appraisal and prerequisite for partnership.",
    links: [
      { href: "/blue-door", label: "Start with the Blue Door" },
      { href: "/partner", label: "Partner With Us" },
      { href: "/speaking", label: "Speaking & workshops" },
    ],
  },
  {
    path: "/start-here",
    title: "Start Here | Painted Porch Strategies",
    description:
      "New to Painted Porch Strategies? Take the P.A.T.H. Compass quiz to find your best entry point across IGNITE, AMPLIFY, and EMBODY.",
    h1: "Start Here — Discover Your P.A.T.H.way",
    intro:
      "A short guided quiz that maps your situation to the right Painted Porch entry point: IGNITE, AMPLIFY, EMBODY, or the Blue Door, so you're not guessing what to do next.",
    links: commonLinks,
  },
  {
    path: "/phase-zero",
    title: "Phase Zero | Painted Porch Strategies",
    description:
      "Phase Zero is the strategic authorship phase before implementation, where leaders determine what change to lead and design the architecture to sustain it.",
    h1: "Phase Zero™ — The Work Before the Work",
    intro:
      "Phase Zero™ is Painted Porch Strategies' signature framework. It's the strategic authorship phase where leaders determine what change to lead, assess whether they're structurally capable of leading it, and design the architecture required to sustain that leadership before a single tool gets launched.",
    links: commonLinks,
  },
  {
    path: "/eq",
    title: "EQ-i 2.0 Assessment | Painted Porch Strategies",
    description:
      "Take the EQ-i 2.0 emotional intelligence assessment with debrief and coaching from a certified Painted Porch practitioner.",
    h1: "EQ-i 2.0 Emotional Intelligence Assessment",
    intro:
      "The EQ-i 2.0 is the world's most established emotional intelligence assessment. Painted Porch offers certified administration, debrief, and coaching, individually or for teams.",
    links: [
      { href: "/partner/ignite/assessments", label: "All assessments" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/resources/youtube",
    title: "YouTube | Painted Porch Strategies",
    description:
      "Watch Painted Porch Strategies videos: change origination, Phase Zero, Stoic leadership, and practical wisdom for modern executives.",
    h1: "Painted Porch on YouTube",
    intro:
      "Short-form and long-form video on change origination, Phase Zero™, Stoic leadership, and the mechanics of building organizations that lead their markets.",
    links: commonLinks,
  },
  {
    path: "/resources/stractical-mini",
    title: "The Stractical Leader Mini Guide (Free) | Painted Porch Strategies",
    description:
      "Free mini guide: how strategic-plus-tactical (stractical) leaders think, decide, and execute. From the Stractical Leader Intensive.",
    h1: "The Stractical Leader Mini Guide",
    intro:
      "A free mini guide adapted from the Stractical Leader 6-Week Intensive. How strategic-plus-tactical leaders think about direction, decisions, and execution, without collapsing into either extreme.",
    links: [
      { href: "/partner/amplify/stractical-leader", label: "Full 6-week Intensive" },
      { href: "/resources", label: "All resources" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    path: "/kick-the-habit",
    title: "Kick the Habit | Painted Porch Strategies",
    description:
      "A free session on breaking the habits that keep leaders stuck in reactive change management.",
    h1: "Kick the Habit",
    intro:
      "A free session on the specific habits that keep smart leaders stuck in reactive change management, and how to break them.",
    links: commonLinks,
  },
  {
    path: "/stoic-field-guide",
    title: "The Stoic Field Guide | Painted Porch Strategies",
    description:
      "A practical Stoic field guide for modern leaders: apply Marcus Aurelius, Epictetus, and Seneca to your actual calendar.",
    h1: "The Stoic Field Guide",
    intro:
      "A practical Stoic field guide built for modern leaders. Marcus Aurelius, Epictetus, and Seneca translated into decisions you can make on Monday morning.",
    links: commonLinks,
  },
  {
    path: "/6-communicator-styles",
    title: "The Six Communicator Styles | Painted Porch Strategies",
    description:
      "The Six Communicator Styles, Rob Yackowski's framework for making change communication land inside complex organizations.",
    h1: "The Six Communicator Styles",
    intro:
      "Rob Yackowski's framework for change communication. Six distinct styles that shape how people receive, interpret, and act on organizational messages.",
    links: commonLinks,
  },
  {
    path: "/burnout",
    title: "Burnout Resources | Painted Porch Strategies",
    description:
      "Free resources for leaders and teams recovering from burnout: practical tools and reframes from Painted Porch Strategies.",
    h1: "Burnout Resources",
    intro:
      "A free resource pack for leaders and teams working through burnout. Practical tools, honest reframes, and a path back to sustainable capacity.",
    links: commonLinks,
  },
  {
    path: "/terms",
    title: "Terms & Conditions | Painted Porch Strategies",
    description:
      "Terms and conditions, privacy policy, and cookie policy for Painted Porch Strategies.",
    h1: "Terms & Conditions",
    intro:
      "The legal terms governing use of Painted Porch Strategies programs, products, and this website, plus our privacy and cookie policies.",
    links: commonLinks,
  },
  {
    path: "/sitemap",
    title: "Sitemap | Painted Porch Strategies",
    description:
      "Full sitemap of Painted Porch Strategies: every public page, organized by section.",
    h1: "Sitemap",
    intro:
      "Every public page on the Painted Porch Strategies site, organized by section: About, Partnership tiers, Resources, Speaking, and lead-magnet landing pages.",
    links: commonLinks,
  },
];

export { SITE };
