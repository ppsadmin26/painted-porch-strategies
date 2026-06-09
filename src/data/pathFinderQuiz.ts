// P.A.T.H. Finder™ quiz data, branching, and scoring.
// Mirrors spec: PPS-PATH-Finder-Quiz-v4-2026-06-09.

export type Track = "b2c" | "b2b";

export type B2CResultType = "RT1" | "RT2" | "RT3" | "RT4" | "RT5" | "RT6";
export type B2BResultType = "RT-A" | "RT-B" | "RT-C" | "RT-D" | "RT-E";
export type ResultType = B2CResultType | B2BResultType;

export interface Option {
  id: string; // "A" | "B" | "C" | "D" or short slug for secondary signals
  label: string;
}

export interface Question {
  id: string;
  prompt: string;
  helper?: string;
  multi?: boolean; // multi-select for secondary signals
  options: Option[];
}

// Catalog of offerings referenced by result pages.
// `url` points to the best available on-site destination.
export interface Offering {
  key: string;
  name: string;
  facilitator?: "Amy" | "Rob" | "Sierra" | "Painted Porch Team";
  tier: "IGNITE" | "AMPLIFY" | "Pathway B" | "Blue Door" | "Free" | "Assessment";
  blurb: string;
  url: string;
}

export const OFFERINGS = {
  // ===== B2C IGNITE =====
  radicalMindfulness: { key: "radicalMindfulness", name: "Radical Mindfulness", facilitator: "Sierra", tier: "IGNITE", url: "/radical-mindfulness", blurb: "8-week self-paced program building conscious awareness, emotional regulation, and reflective capacity." },
  radicalMindfulnessMini: { key: "radicalMindfulnessMini", name: "Radical Mindfulness Mini Course", facilitator: "Sierra", tier: "IGNITE", url: "/radical-mindfulness", blurb: "Condensed entry point before the full 8-week commitment." },
  passengerToPilot: { key: "passengerToPilot", name: "Passenger to Pilot (Masterclass)", facilitator: "Sierra", tier: "IGNITE", url: "/partner/ignite/masterclasses", blurb: "Shift from reactive to proactive leadership." },
  masterYourMessage: { key: "masterYourMessage", name: "Master Your Message", facilitator: "Rob", tier: "IGNITE", url: "/master-your-message", blurb: "6-week self-paced program: authentic communication and influence without authority." },
  masterYourMessageMini: { key: "masterYourMessageMini", name: "Master Your Message Mini Course", facilitator: "Rob", tier: "IGNITE", url: "/master-your-message", blurb: "Core framework condensed." },
  talkingToStrangers: { key: "talkingToStrangers", name: "Talking to Strangers (Masterclass)", facilitator: "Rob", tier: "IGNITE", url: "/talking-to-strangers", blurb: "Authentic connection in unfamiliar contexts." },
  createExtraordinaryTeams: { key: "createExtraordinaryTeams", name: "Create Extraordinary Teams", facilitator: "Painted Porch Team", tier: "IGNITE", url: "/extraordinary-teams", blurb: "Deep, comprehensive program on team dynamics that work." },
  elementsOfATeam: { key: "elementsOfATeam", name: "Elements of a Team (Masterclass)", facilitator: "Amy", tier: "IGNITE", url: "/partner/ignite/masterclasses", blurb: "Core components of team health. Strong as precursor or standalone." },
  leadingChangeMini: { key: "leadingChangeMini", name: "Leading Change Mini Course", facilitator: "Amy", tier: "IGNITE", url: "/partner/ignite/courses", blurb: "Change leadership fundamentals: how change works, where resistance comes from." },

  // ===== B2C AMPLIFY Labs =====
  conflictToConnectionLab: { key: "conflictToConnectionLab", name: "From Conflict to Connection Lab", facilitator: "Amy", tier: "AMPLIFY", url: "/partner/amplify/labs", blurb: "Peer cohort tackling team friction at the relational and structural root." },
  goldilocksLab: { key: "goldilocksLab", name: "Goldilocks Leadership Lab", facilitator: "Amy", tier: "AMPLIFY", url: "/partner/amplify/labs", blurb: "Calibrated, context-sensitive EQ that makes team leadership feel like design." },
  leadingChangeLab: { key: "leadingChangeLab", name: "Leading Change / P.A.T.H. Lab", facilitator: "Amy", tier: "AMPLIFY", url: "/partner/amplify/labs", blurb: "Cohort lab applying the full P.A.T.H. framework to real change challenges." },
  stracticalLeaderLab: { key: "stracticalLeaderLab", name: "Stractical Leader Lab", facilitator: "Amy", tier: "AMPLIFY", url: "/partner/amplify/stractical-leader", blurb: "Strategic vision and tactical execution integration at the leadership-team level." },
  stoicismLab: { key: "stoicismLab", name: "Stoicism in the Workplace Lab", facilitator: "Amy", tier: "AMPLIFY", url: "/partner/amplify/labs", blurb: "Philosophical grounding made permanent." },
  aiEiOhLab: { key: "aiEiOhLab", name: "AI, EI, Oh! Lab", facilitator: "Amy", tier: "AMPLIFY", url: "/partner/amplify/labs", blurb: "Leading AI adoption with human wisdom." },

  // ===== B2B Pathway B Workshops =====
  fromConflictToConnection: { key: "fromConflictToConnection", name: "From Conflict to Connection", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Addresses team friction at the relational and structural root, not the symptom." },
  fromDysfunctionToDynamic: { key: "fromDysfunctionToDynamic", name: "From Dysfunction to Dynamic", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Structural redesign of team patterns: decision rights, accountability, interaction design." },
  geniusAtWork: { key: "geniusAtWork", name: "Genius at Work", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Working Genius assessment-based session surfacing how your team contributes." },
  heroesAssemble: { key: "heroesAssemble", name: "Heroes Assemble", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Activating individual strengths in service of collective performance." },
  pathToLastingChange: { key: "pathToLastingChange", name: "The P.A.T.H. to Lasting Change", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Full P.A.T.H. framework applied to sustained organizational transformation." },
  leadAtSpeed: { key: "leadAtSpeed", name: "Lead at the Speed of Change", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Leadership capacity to drive change at organizational velocity without sacrificing trust." },
  drivingChange3Shifts: { key: "drivingChange3Shifts", name: "Driving Change: The 3 Shifts", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Three leadership shifts that separate transformations that hold from those that evaporate." },
  changeForGood: { key: "changeForGood", name: "Change for Good: Immunity to Change", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Surfacing the hidden competing commitments quietly defeating your change efforts." },
  cultivatingChangeResilience: { key: "cultivatingChangeResilience", name: "Cultivating Change Resilience", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Resilience as organizational infrastructure: distributed across systems and culture." },
  kickTheHabit: { key: "kickTheHabit", name: "Kick the Habit", facilitator: "Amy", tier: "Pathway B", url: "/resources/kick-the-habit", blurb: "Addressing the behavioral patterns and mental models that make change fail to stick." },
  aiEiOh: { key: "aiEiOh", name: "AI, EI, Oh", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Leading AI integration with the EI and organizational wisdom it requires." },
  architectureOfAdaptability: { key: "architectureOfAdaptability", name: "The Architecture of Adaptability", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Building organizational systems designed to navigate uncertainty rather than react to it." },
  goldilocks: { key: "goldilocks", name: "Goldilocks Leadership", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Calibrated, context-sensitive EQ in leadership." },
  pillarsOfLastingChange: { key: "pillarsOfLastingChange", name: "The Pillars of Lasting Change & Continuous Innovation", facilitator: "Painted Porch Team", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Culture, operations, and human capacity as one living system." },
  stracticalLeader: { key: "stracticalLeader", name: "The Stractical Leader", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/stractical-leader", blurb: "Integrating strategic vision with tactical execution for leadership teams." },
  leadershipOM: { key: "leadershipOM", name: "Leadership OM", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Redesigning the leadership operating model to distribute decisions and accountability." },

  // Rob Hunter
  communicateWithStyle: { key: "communicateWithStyle", name: "Communicate with Style", facilitator: "Rob", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Style awareness and adaptation across different team members and contexts." },
  powerOfStory: { key: "powerOfStory", name: "The Power of Story", facilitator: "Rob", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Using narrative to create shared understanding and team cohesion." },
  eightByEight: { key: "eightByEight", name: "8:8", facilitator: "Rob", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "The eight things leaders need to know before they communicate and the eight ways to make it land." },
  masterYourMessageB2B: { key: "masterYourMessageB2B", name: "Master Your Message (B2B)", facilitator: "Rob", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Communication architecture that makes leadership messaging land across the organization." },
  highFidelityCommunication: { key: "highFidelityCommunication", name: "High-Fidelity Communication", facilitator: "Rob", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Ensuring message and meaning arrive intact." },
  getClearBeHeard: { key: "getClearBeHeard", name: "Get C.L.E.A.R., Be Heard", facilitator: "Rob", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Practical communication frameworks for leaders navigating complex change." },

  // Sierra
  reignitingResilience: { key: "reignitingResilience", name: "Reigniting Resilience", facilitator: "Sierra", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Rebuilding genuine resilience capacity in depleted teams and leaders." },
  findingJoyAtWork: { key: "findingJoyAtWork", name: "Finding Joy at Work", facilitator: "Sierra", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Designing conditions that make sustainable engagement possible." },
  fromPassengerToPilot: { key: "fromPassengerToPilot", name: "From Passenger to Pilot", facilitator: "Sierra", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Reclaiming individual agency within team and organizational systems." },
  radicalMindfulnessB2B: { key: "radicalMindfulnessB2B", name: "Radical Mindfulness (B2B)", facilitator: "Sierra", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Mindfulness as a leadership practice for organizational wellbeing." },

  // Rob — additional Pathway B
  borderlessCommunication: { key: "borderlessCommunication", name: "Borderless Communication", facilitator: "Rob", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Communication across cultures, geographies, and modalities without losing signal." },
  fiveMinuteKeynote: { key: "fiveMinuteKeynote", name: "The 5-Minute Keynote", facilitator: "Rob", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Crafting the high-stakes short message that has to land in a hallway, a board room, or an elevator." },

  // Sierra — additional Pathway B
  moveShakeInnovate: { key: "moveShakeInnovate", name: "Move, Shake, Innovate", facilitator: "Sierra", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Reawakening creative capacity and innovation culture in teams that have gone flat." },

  // Amy — additional Pathway B
  architectChange: { key: "architectChange", name: "Architect Change (Strategic Design Intensive)", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Phase Zero™ strategic design — author what you're about to build before you build it." },
  pillarsReinforcement: { key: "pillarsReinforcement", name: "Painted Porch Pillars™ Organizational Reinforcement", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Workshop that diagnoses and reinforces the three Pillars: Foundational Architecture, Operational Intelligence, Human Capacity." },
  stoicismB2B: { key: "stoicismB2B", name: "Stoicism in the Workplace (Workshop)", facilitator: "Amy", tier: "Pathway B", url: "/partner/amplify/workshops", blurb: "Stoic philosophy translated into leadership and team practice at the organizational level." },

  // Pre-Blue-Door scoping
  currentStateLight: { key: "currentStateLight", name: "Current State Analysis — Light", tier: "Assessment", url: "/blue-door", blurb: "Lightweight organizational snapshot. Quick read on where the architecture stands." },
  currentStateDeep: { key: "currentStateDeep", name: "Current State Analysis — Deep", tier: "Assessment", url: "/blue-door", blurb: "Deeper organizational diagnostic. For leaders who already know something structural needs to shift." },

  // Assessments / Free
  eqi: { key: "eqi", name: "EQ-i 2.0 Assessment", tier: "Assessment", url: "/eq", blurb: "Emotional intelligence baseline. Data on where reflective and relational capacity sits." },
  eq360: { key: "eq360", name: "EQ360 Assessment", tier: "Assessment", url: "/eq", blurb: "Multi-perspective EQ feedback." },
  workingGenius: { key: "workingGenius", name: "Working Genius Assessment", tier: "Assessment", url: "/partner/ignite/assessments/working-genius", blurb: "Natural contribution style surfaces gaps you may not have named yet." },
  performanceDNA: { key: "performanceDNA", name: "Performance DNA Assessment", tier: "Assessment", url: "/partner/ignite/assessments", blurb: "Behavioral architecture at the elevation level." },

  // IGNITE Challenges (B2C)
  meditationChallenge: { key: "meditationChallenge", name: "Meditation Challenge", facilitator: "Sierra", tier: "IGNITE", url: "/resources/free", blurb: "Short daily meditation practice to build the reflective muscle." },
  gratitudeChallenge: { key: "gratitudeChallenge", name: "Gratitude Challenge", facilitator: "Sierra", tier: "IGNITE", url: "/resources/free", blurb: "Daily gratitude practice that resets perspective and steadies the inner game." },
  journalingChallenge: { key: "journalingChallenge", name: "Journaling Challenge", facilitator: "Rob", tier: "IGNITE", url: "/mym-journal-challenge", blurb: "Daily journaling prompts that sharpen how you think, speak, and write as a leader." },
  kickTheHabitB2C: { key: "kickTheHabitB2C", name: "Kick the Habit (Masterclass)", facilitator: "Amy", tier: "IGNITE", url: "/kick-the-habit", blurb: "Short masterclass on the behavioral patterns that quietly keep change from sticking." },

  // Free Resources
  fiftyTwoStoicism: { key: "fiftyTwoStoicism", name: "52 Weeks of Stoicism", tier: "Free", url: "/resources/free", blurb: "Weekly Stoic principles for leadership. Free." },
  burnoutResources: { key: "burnoutResources", name: "Burnout Resources", tier: "Free", url: "/resources/burnout", blurb: "If exhaustion is part of your reality, start here. Free." },
  strategicChangeCanvas: { key: "strategicChangeCanvas", name: "Strategic Change Canvas", tier: "Free", url: "/change-canvas", blurb: "Visual planning tool for mapping change before you launch it. Free." },
  communicatingChangeWorkbook: { key: "communicatingChangeWorkbook", name: "Communicating Change Workbook", tier: "Free", url: "/change-comms", blurb: "Templates for the conversations that make or break transformation. Free." },
  stracticalMini: { key: "stracticalMini", name: "Stractical Leader Mini Workbook", tier: "Free", url: "/resources/stractical-mini", blurb: "Taste of the strategic-tactical integration work. Free." },
  resolutionRemix: { key: "resolutionRemix", name: "Resolution Remix", tier: "Free", url: "/resources/free", blurb: "Reframe annual resolutions into sustainable leadership practices. Free." },
  workFromHomePro: { key: "workFromHomePro", name: "Become a Work-From-Home Pro", tier: "Free", url: "/wfh-sign-up", blurb: "Practical guide to remote-work rhythm, focus, and energy. Free." },

  // Blue Door
  blueDoor: { key: "blueDoor", name: "The Blue Door Organizational Appraisal", tier: "Blue Door", url: "/blue-door", blurb: "About 20 minutes. Produces the P.A.T.H. Compass: architecture, capacity signal, Move Now Map, Reinforce First priorities. No prerequisites." },
} as const satisfies Record<string, Offering>;

export type OfferingKey = keyof typeof OFFERINGS;

// ===================================================
// QUESTIONS
// ===================================================
export const PQ1: Question = {
  id: "PQ1",
  prompt: "I'm here because I'm thinking about…",
  options: [
    { id: "A", label: "My own leadership development — building my capacity, clarity, and capability as a leader." },
    { id: "B", label: "Leadership development or transformation for my team or organization." },
  ],
};

export const PQ2_B2C: Question = {
  id: "PQ2",
  prompt: "Which best describes where you are right now?",
  options: [
    { id: "current", label: "I'm currently in a leadership role." },
    { id: "aspiring", label: "I'm an aspiring leader, building toward leading others." },
  ],
};

// --- B2C Quiz Questions ---
export const B2C_QUESTIONS: Question[] = [
  {
    id: "Q1",
    prompt: "If you're honest with yourself, what's the thing most getting in your way as a leader right now?",
    options: [
      { id: "A", label: "My own inner game — I react when I want to respond. I need to slow down and lead from a steadier place." },
      { id: "B", label: "How I communicate — I have the ideas but don't always land them the way I intend." },
      { id: "C", label: "The people around me — building real collaboration and getting a team moving is harder than it looks." },
      { id: "D", label: "Change — I'm navigating more complexity and transformation than I have clear frameworks for." },
    ],
  },
  {
    id: "Q2",
    prompt: "Think about the last time you had to deliver a message that mattered. What actually happened?",
    options: [
      { id: "A", label: "It landed. I felt clear and confident, and it went the way I intended." },
      { id: "B", label: "It mostly worked, but something was off." },
      { id: "C", label: "I held back. I knew what I wanted to say but didn't say all of it." },
      { id: "D", label: "It's consistently a challenge. Getting what's in my head to land is something I'm still working on." },
    ],
  },
  {
    id: "Q3",
    prompt: "When it comes to the people side of leadership, where are you right now?",
    options: [
      { id: "A", label: "I'm not yet leading others, but it's where I'm headed and I want to be ready." },
      { id: "B", label: "I lead people, but team dynamics is harder than individual relationships." },
      { id: "C", label: "I'm dealing with real friction. The team isn't functioning the way it should." },
      { id: "D", label: "My team works well. I'm more focused on my own depth than on fixing dynamics." },
    ],
  },
  {
    id: "Q4",
    prompt: "Think about the last time significant change came through your organization. Where did you find yourself?",
    options: [
      { id: "A", label: "Navigating it more than leading it. I was figuring out my own footing." },
      { id: "B", label: "Leading pieces of it but improvising. I had instinct but not a clear framework." },
      { id: "C", label: "In the thick of it, leading others through it. I want better architecture for next time." },
      { id: "D", label: "I've led significant change well. I'm looking for depth and peer conversation." },
    ],
  },
  {
    id: "Q5",
    prompt: "Which best describes the leadership season you're in right now?",
    options: [
      { id: "A", label: "Laying the groundwork. Building the foundation of who I am as a leader." },
      { id: "B", label: "In active development. I know my gaps and I'm ready to close them." },
      { id: "C", label: "Leading through complexity. My team or organization is navigating real change." },
      { id: "D", label: "At an integration point. I want to embed, deepen, and lead alongside peers." },
    ],
  },
  {
    id: "Q6",
    prompt: "Where are you right now in terms of readiness to invest in your development?",
    options: [
      { id: "A", label: "Still exploring. I want to understand what's here before I commit." },
      { id: "B", label: "Ready to start something self-paced. A course I can work through on my own terms." },
      { id: "C", label: "Ready to invest alongside other leaders. A cohort or lab environment sounds right." },
      { id: "D", label: "Fully committed and looking for the deepest level of engagement available." },
    ],
  },
];

// --- B2B Org Questions ---
export const ORG_PQ2: Question = {
  id: "OrgPQ2",
  prompt: "What's the primary challenge driving your exploration?",
  options: [
    { id: "A", label: "My team — dynamics, collaboration, or conflict are getting in the way of performance." },
    { id: "B", label: "Change — we're navigating a restructure, new direction, or transformation that needs better leadership." },
    { id: "C", label: "Leadership capability — our leaders need to develop. We need to build capacity." },
    { id: "D", label: "Something bigger — we're at a strategic inflection point. The architecture of our organization needs to change." },
  ],
};

const SECONDARY_SIGNALS: Option[] = [
  { id: "comm", label: "Communication — how leaders message, align, and influence is breaking down." },
  { id: "resilience", label: "Resilience / wellbeing — the team is depleted, disengaged, or running on empty." },
  { id: "neither", label: "Neither — that's not the focus." },
];

const Q4_DECISION_MAKER: Question = {
  id: "Q4DM",
  prompt: "Who's driving this exploration?",
  options: [
    { id: "A", label: "Just me — I'm exploring options before bringing a recommendation to others." },
    { id: "B", label: "Me and one or two others — a small group is evaluating what's needed." },
    { id: "C", label: "A leadership team decision — we're aligned that something needs to happen." },
    { id: "D", label: "Executive or board level — there's an organizational mandate behind this." },
  ],
};

const ORG_PQ3: Question = {
  id: "OrgPQ3",
  prompt: "What level of engagement feels right right now?",
  options: [
    { id: "A", label: "We want to start with something defined — a workshop, keynote, or team session." },
    { id: "B", label: "We want a deeper look first — understanding our organizational readiness before committing." },
    { id: "C", label: "We're not sure yet — we want to see what's available before deciding." },
  ],
};

// --- Team branch ---
export const TEAM_BRANCH: Question[] = [
  {
    id: "Q1Team",
    prompt: "What's the most accurate description of what's happening with your team?",
    options: [
      { id: "A", label: "Conflict and friction — tension between people or groups that's affecting performance." },
      { id: "B", label: "Collaboration gaps — people work fine individually but don't pull together as a team." },
      { id: "C", label: "Inconsistent performance — capability, accountability, or follow-through is the challenge." },
      { id: "D", label: "The team is changing — growth, restructure, or new composition." },
    ],
  },
  {
    id: "Q2Team",
    prompt: "Who is this work primarily for?",
    options: [
      { id: "A", label: "A specific team or leadership team." },
      { id: "B", label: "Leaders across the organization who need shared frameworks." },
      { id: "C", label: "The whole organization — culture and team dynamics need to shift at scale." },
    ],
  },
  { id: "Q3Team", prompt: "Are either of these also part of what you're seeing?", helper: "Select all that apply, or Neither.", multi: true, options: SECONDARY_SIGNALS },
  Q4_DECISION_MAKER,
  ORG_PQ3,
];

export const CHANGE_BRANCH: Question[] = [
  {
    id: "Q1Change",
    prompt: "What best describes the change you're navigating?",
    options: [
      { id: "A", label: "A specific initiative — restructure, new direction, system implementation, or merger." },
      { id: "B", label: "Change velocity — the pace of change itself is the challenge, not one specific initiative." },
      { id: "C", label: "Change isn't sticking — initiatives launch but don't hold, resistance keeps surfacing." },
      { id: "D", label: "AI adoption — technology transformation and the human leadership questions it surfaces." },
    ],
  },
  {
    id: "Q2Change",
    prompt: "Where is the breakdown most visible in how your organization is navigating this?",
    options: [
      { id: "A", label: "In our leaders — they don't have a consistent framework for leading change." },
      { id: "B", label: "In our people — resistance, disengagement, or exhaustion is getting in the way." },
      { id: "C", label: "In our communication — change messages aren't landing or building alignment." },
      { id: "D", label: "Across all of these — it's a systemic challenge, not one specific gap." },
    ],
  },
  { id: "Q3Change", prompt: "Are either of these also part of what you're seeing?", helper: "Select all that apply, or Neither.", multi: true, options: SECONDARY_SIGNALS },
  Q4_DECISION_MAKER,
  ORG_PQ3,
];

export const CAP_BRANCH: Question[] = [
  {
    id: "Q1Cap",
    prompt: "What's the primary capability gap in your leadership team?",
    options: [
      { id: "A", label: "Emotional intelligence — how leaders show up in high-stakes moments." },
      { id: "B", label: "Strategic thinking — leaders are strong tactically but struggle with the bigger picture." },
      { id: "C", label: "Communication — leaders can't consistently influence, align, or move people." },
      { id: "D", label: "Resilience — leaders and teams are depleted and struggling to sustain performance." },
    ],
  },
  {
    id: "Q2Cap",
    prompt: "What format works best for your context?",
    options: [
      { id: "A", label: "A single workshop or keynote — a shared experience to create alignment." },
      { id: "B", label: "A series or multi-session program — sustained capability building over time." },
      { id: "C", label: "Individual leader development alongside team-level work — both are needed." },
    ],
  },
  { id: "Q3Cap", prompt: "Are either of these also part of what you're navigating?", helper: "Select all that apply, or Neither.", multi: true, options: SECONDARY_SIGNALS },
  Q4_DECISION_MAKER,
  ORG_PQ3,
];

export const STRATEGIC_BRANCH: Question[] = [
  {
    id: "Q1Strategic",
    prompt: "What best describes the strategic inflection point you're navigating?",
    options: [
      { id: "A", label: "Identity and culture — who we're becoming doesn't match how we currently operate." },
      { id: "B", label: "Leadership architecture — how decisions get made and accountability flows needs to change." },
      { id: "C", label: "Technology transformation — AI or systems change is forcing an organizational identity question." },
      { id: "D", label: "Scale or restructure — growth, merger, or reorganization requires a different design." },
    ],
  },
  { id: "Q2Strategic", prompt: "Are either of these also showing up in this inflection point?", helper: "Select all that apply, or Neither.", multi: true, options: SECONDARY_SIGNALS },
  Q4_DECISION_MAKER,
  ORG_PQ3,
];

// ===================================================
// ANSWERS & SCORING
// ===================================================
export type Answers = Record<string, string | string[]>;

function val(a: Answers, id: string): string {
  const v = a[id];
  return Array.isArray(v) ? "" : (v ?? "");
}
function vals(a: Answers, id: string): string[] {
  const v = a[id];
  return Array.isArray(v) ? v : (v ? [v] : []);
}

// ---- B2C scoring per Section 6 ----
type Zone = "PREPARE" | "ALIGN" | "TAKE_OFF_TEAM" | "TAKE_OFF_CHANGE" | "HABITS" | "NONE";

function b2cZoneFor(qid: string, opt: string): Zone {
  // Q1
  if (qid === "Q1") return ({ A: "PREPARE", B: "ALIGN", C: "TAKE_OFF_TEAM", D: "TAKE_OFF_CHANGE" } as Record<string, Zone>)[opt] ?? "NONE";
  if (qid === "Q2") return ({ A: "NONE", B: "ALIGN", C: "ALIGN", D: "ALIGN" } as Record<string, Zone>)[opt] ?? "NONE";
  if (qid === "Q3") return ({ A: "PREPARE", B: "TAKE_OFF_TEAM", C: "TAKE_OFF_TEAM", D: "HABITS" } as Record<string, Zone>)[opt] ?? "NONE";
  if (qid === "Q4") return ({ A: "PREPARE", B: "TAKE_OFF_CHANGE", C: "TAKE_OFF_CHANGE", D: "HABITS" } as Record<string, Zone>)[opt] ?? "NONE";
  if (qid === "Q5") return ({ A: "PREPARE", B: "NONE", C: "TAKE_OFF_TEAM", D: "HABITS" } as Record<string, Zone>)[opt] ?? "NONE";
  return "NONE";
}

export function scoreB2C(answers: Answers): { resultType: B2CResultType; zones: Record<Zone, number> } {
  const q6 = val(answers, "Q6");
  if (q6 === "A") {
    return { resultType: "RT6", zones: {} as Record<Zone, number> };
  }
  const zones: Record<Zone, number> = { PREPARE: 0, ALIGN: 0, TAKE_OFF_TEAM: 0, TAKE_OFF_CHANGE: 0, HABITS: 0, NONE: 0 };
  for (const qid of ["Q1", "Q2", "Q3", "Q4", "Q5"]) {
    const z = b2cZoneFor(qid, val(answers, qid));
    zones[z]++;
  }
  // HABITS dominant + Q6=C/D → RT5
  const q4 = val(answers, "Q4"), q5 = val(answers, "Q5");
  if ((q4 === "D" || q5 === "D") && (q6 === "C" || q6 === "D") && zones.HABITS >= 1) {
    return { resultType: "RT5", zones };
  }
  // Pick dominant zone
  const order: Zone[] = ["PREPARE", "ALIGN", "TAKE_OFF_TEAM", "TAKE_OFF_CHANGE", "HABITS"];
  let max = 0;
  for (const z of order) if (zones[z] > max) max = zones[z];
  const top = order.filter((z) => zones[z] === max);
  // Tie-breakers
  let winner: Zone = top[0];
  if (top.includes("PREPARE")) winner = "PREPARE";
  else if (top.includes("TAKE_OFF_TEAM") && top.includes("TAKE_OFF_CHANGE")) {
    winner = val(answers, "Q1") === "D" ? "TAKE_OFF_CHANGE" : "TAKE_OFF_TEAM";
  }

  switch (winner) {
    case "PREPARE": return { resultType: "RT1", zones };
    case "ALIGN": return { resultType: "RT2", zones };
    case "TAKE_OFF_TEAM": return { resultType: "RT3", zones };
    case "TAKE_OFF_CHANGE": return { resultType: "RT4", zones };
    case "HABITS": return { resultType: q6 === "C" || q6 === "D" ? "RT5" : "RT4", zones };
    default: return { resultType: "RT6", zones };
  }
}

// ---- B2B routing per Section 4 ----
export function scoreB2B(answers: Answers): { resultType: B2BResultType; strongest: "workshop" | "blueDoor" | "equal" } {
  const pq2 = val(answers, "OrgPQ2"); // A/B/C/D
  const pq3 = val(answers, "OrgPQ3"); // A/B/C
  const typeMap: Record<string, B2BResultType> = { A: "RT-A", B: "RT-B", C: "RT-C", D: "RT-D" };

  // Strategic track → always Blue Door primary
  if (pq2 === "D") {
    return { resultType: "RT-D", strongest: "blueDoor" };
  }

  // Escalation signals
  const q2Team = val(answers, "Q2Team");
  const q2Change = val(answers, "Q2Change");
  if (pq2 === "A" && q2Team === "C") return { resultType: "RT-A", strongest: "blueDoor" };
  if (pq2 === "B" && q2Change === "D") return { resultType: "RT-B", strongest: "blueDoor" };

  // PQ3=C with clear diagnostic signal → equal; ambiguous → RT-E
  if (pq3 === "C") {
    if (pq2 && typeMap[pq2]) return { resultType: typeMap[pq2], strongest: "equal" };
    return { resultType: "RT-E", strongest: "equal" };
  }

  // Standard: PQ3 chooses
  const rt = typeMap[pq2] ?? "RT-E";
  return { resultType: rt, strongest: pq3 === "B" ? "blueDoor" : "workshop" };
}

// ===================================================
// RECOMMENDATION RESOLVER
// ===================================================
export interface RecommendationGroup {
  heading: string;
  offerings: Offering[];
}

export interface QuizResult {
  track: Track;
  resultType: ResultType;
  headline: string;
  subhead?: string;
  narrative: string;
  primaryGroup?: RecommendationGroup;
  groups: RecommendationGroup[];
  strongestNextStep?: { kind: "workshop" | "blueDoor"; offering: Offering; label: string };
  crossoverNote?: string;
  whatComesNext: string;
}

const O = OFFERINGS;
const grp = (heading: string, ...keys: OfferingKey[]): RecommendationGroup => ({
  heading, offerings: keys.map((k) => O[k]),
});

function b2cResult(rt: B2CResultType, answers: Answers): QuizResult {
  const q6 = val(answers, "Q6");
  const aspiring = val(answers, "PQ2") === "aspiring";

  switch (rt) {
    case "RT1":
      return {
        track: "b2c", resultType: rt, headline: "Start with Foundations",
        subhead: "IGNITE — Self-Paced",
        narrative: aspiring
          ? "You're building something real, and you're thinking about it the right way. The leaders who get this right build the foundation — self-awareness, reflective capacity, inner steadiness — before the complexity arrives. That's exactly where you are."
          : "The clearest thing your responses show is that the foundation needs to come first. Not because your capability is in question. Leaders who build self-awareness and reflective capacity before they try to go wider are the ones who stop exhausting themselves in the process.",
        primaryGroup: grp("Your Starting Point — IGNITE", "radicalMindfulness"),
        groups: [
          grp("Also Worth Exploring", "radicalMindfulnessMini", "passengerToPilot", "eqi"),
          grp("Free Starting Points", "fiftyTwoStoicism", "burnoutResources"),
        ],
        whatComesNext: "Once this foundation is in place, two directions open: strengthening how you communicate, or building toward leading others. The AMPLIFY Leadership Labs are available whenever you're ready.",
      };
    case "RT2":
      return {
        track: "b2c", resultType: rt, headline: "Build Communication Power",
        subhead: "IGNITE — Self-Paced",
        narrative: "You have the self-awareness. You can read a room. The gap is in the translation: getting what's in your head to consistently land the way you intend. Closing this gap is about mastering the instrument you already have.",
        primaryGroup: grp("Your Starting Point — IGNITE", "masterYourMessage"),
        groups: [grp("Also Worth Exploring", "masterYourMessageMini", "talkingToStrangers", "workingGenius")],
        whatComesNext: "Communication work is the direct prerequisite for leading teams through complexity. Create Extraordinary Teams and the AMPLIFY Leadership Labs are the natural next terrain.",
      };
    case "RT3": {
      const cohort = q6 === "C" || q6 === "D";
      return {
        track: "b2c", resultType: rt, headline: "Elevate Team Leadership",
        subhead: cohort ? "AMPLIFY — Leadership Lab" : "IGNITE — Self-Paced",
        narrative: aspiring
          ? "You're thinking ahead, and that's the right instinct. The leaders who build team-leadership capacity before they need it are the ones who don't get caught flat-footed when a team lands in their lap."
          : "You've built real individual capacity. What leadership is testing you on now is the team: building conditions where a group consistently does its best work together. That's a different skill set.",
        primaryGroup: cohort
          ? grp("Your Starting Point — AMPLIFY Lab", "conflictToConnectionLab", "goldilocksLab")
          : grp("Your Starting Point — IGNITE", "createExtraordinaryTeams"),
        groups: [grp("Also Worth Exploring", "elementsOfATeam", "workingGenius", "kickTheHabit")],
        whatComesNext: "As you build team-leadership capacity, two signals often emerge: toward change architecture, or toward organizational scale. When what you're building for your team is something your whole organization needs, that's a different conversation. We're ready for it.",
      };
    }
    case "RT4": {
      const cohort = q6 === "C" || q6 === "D";
      return {
        track: "b2c", resultType: rt, headline: "Master Change Architecture",
        subhead: cohort ? "AMPLIFY — Leadership Lab" : "IGNITE — Self-Paced",
        narrative: "You've been in the middle of change, probably more than once, and navigated it with more skill than you give yourself credit for. What you're looking for is the framework that makes what you've been doing by instinct something you can do by design. Not managing change. Architecting it.",
        primaryGroup: cohort
          ? grp("Your Starting Point — AMPLIFY Lab", "leadingChangeLab")
          : grp("Your Starting Point — IGNITE", "leadingChangeMini"),
        groups: [
          grp("Also Worth Exploring", "aiEiOhLab"),
          grp("Free Tools", "strategicChangeCanvas", "communicatingChangeWorkbook"),
        ],
        whatComesNext: "Leaders who do this work often reach a point where the change challenges they're navigating personally are also challenges their organization faces at scale. When it stops being about your development and starts being about the architecture your organization needs, there's a different conversation available.",
      };
    }
    case "RT5":
      return {
        track: "b2c", resultType: rt, headline: "Ready for Advanced Partnership",
        subhead: "AMPLIFY — Leadership Labs",
        narrative: "You're not looking for a starting point. You're looking for depth: real challenge, peer-level conversation, an environment where the work pushes you rather than walks you through basics. The AMPLIFY Leadership Labs are built for exactly that.",
        primaryGroup: grp("Your Starting Point — Pick the Lab that pulls you most", "stracticalLeaderLab", "leadingChangeLab", "conflictToConnectionLab", "goldilocksLab", "stoicismLab", "aiEiOhLab"),
        groups: [grp("Also Worth Exploring", "stracticalMini", "performanceDNA", "eq360")],
        whatComesNext: "Some leaders reach a point where the work they're doing for themselves starts to feel like the work their whole organization needs. When you find yourself asking 'how do I build an organization that can hold what I'm trying to create' — we're here for that conversation.",
      };
    case "RT6":
      return {
        track: "b2c", resultType: rt, headline: "Explore Before Committing",
        subhead: "Start on Your Terms",
        narrative: "You're paying attention, and that matters. Something is pulling you toward this work even if you're not yet sure what you need. That's a reasonable place to be. Start here. Take your time. There's no pressure to commit before you're ready, and there's a lot here that's free.",
        groups: [
          grp("If your inner game is the gap", "fiftyTwoStoicism", "burnoutResources", "meditationChallenge", "gratitudeChallenge"),
          grp("If communication is the gap", "communicatingChangeWorkbook", "journalingChallenge"),
          grp("If team or change leadership is on your mind", "strategicChangeCanvas", "stracticalMini", "kickTheHabitB2C"),
          grp("Quick daily resets", "resolutionRemix", "workFromHomePro"),
          grp("When you're ready to go deeper", "radicalMindfulnessMini", "masterYourMessageMini", "leadingChangeMini"),
        ],
        whatComesNext: "Retake the P.A.T.H. Finder in 60–90 days. Or reach out directly. Sometimes the right starting point is a conversation, not a quiz.",
      };
  }
}

function b2bResult(rt: B2BResultType, answers: Answers, strongest: "workshop" | "blueDoor" | "equal"): QuizResult {
  const blueDoorOff = O.blueDoor;

  // Secondary-signal flags (any branch)
  const sec = [...vals(answers, "Q3Team"), ...vals(answers, "Q3Change"), ...vals(answers, "Q3Cap"), ...vals(answers, "Q2Strategic")];
  const commOn = sec.includes("comm");
  const resOn = sec.includes("resilience");

  // Crossover note for Cap
  const crossover = (val(answers, "Q1Cap") === "B" && val(answers, "Q2Cap") === "C")
    ? "Your situation also includes an individual-leader development thread. The Stractical Leader Lab (AMPLIFY, individual track) is built for exactly that strategic-tactical integration work. Have those individual leaders take the P.A.T.H. Finder on their own track."
    : undefined;

  let headline = "", narrative = "", primaryHeading = "", primaryKeys: OfferingKey[] = [];
  const extra: RecommendationGroup[] = [];

  if (rt === "RT-A") {
    headline = "Team & People";
    narrative = "Your responses point clearly to the team. Not the strategy, not the systems — the people dynamics underneath the work. Whether it's conflict that keeps surfacing, collaboration that's harder than it should be, or team patterns that are costing more than you want to admit, this is addressable.";
    const q1 = val(answers, "Q1Team");
    primaryHeading = "Team Dynamics — Conflict, Friction, and Collaboration";
    if (q1 === "A" || q1 === "D") primaryKeys = ["fromConflictToConnection", "fromDysfunctionToDynamic", "elementsOfATeam"];
    else if (q1 === "B") primaryKeys = ["fromDysfunctionToDynamic", "fromConflictToConnection", "elementsOfATeam"];
    else primaryKeys = ["heroesAssemble", "geniusAtWork", "fromConflictToConnection"];
    extra.push(grp("Team Performance — Contribution, Capability, and Cohesion", "geniusAtWork", "heroesAssemble"));
  } else if (rt === "RT-B") {
    headline = "Change & Transformation";
    narrative = "Your organization is moving through something significant, or about to. The question isn't whether the change is necessary. It's whether your leaders and your organization have the architecture to carry it.";
    const q1 = val(answers, "Q1Change");
    primaryHeading = "Change Leadership — Frameworks for Leading Transformation";
    if (q1 === "A") primaryKeys = ["pathToLastingChange", "leadAtSpeed", "drivingChange3Shifts"];
    else if (q1 === "B") primaryKeys = ["leadAtSpeed", "architectureOfAdaptability"];
    else if (q1 === "C") primaryKeys = ["changeForGood", "kickTheHabit", "cultivatingChangeResilience"];
    else primaryKeys = ["aiEiOh", "architectureOfAdaptability"];
    extra.push(grp("Change Resilience — When Resistance and Exhaustion Are Part of It", "changeForGood", "cultivatingChangeResilience", "kickTheHabit"));
    extra.push(grp("AI & Technology Transformation", "aiEiOh", "architectureOfAdaptability"));
  } else if (rt === "RT-C") {
    headline = "Leadership Capability";
    narrative = "The challenge you're describing is a capability gap. Your leaders need to develop, and you need a way to build that capacity that actually holds rather than fades after the training day ends.";
    const q1 = val(answers, "Q1Cap");
    primaryHeading = "Emotional Intelligence — How Leaders Show Up";
    if (q1 === "A") primaryKeys = ["goldilocks", "fromConflictToConnection", "pillarsOfLastingChange"];
    else if (q1 === "B") primaryKeys = ["stracticalLeader", "architectureOfAdaptability", "leadershipOM"];
    else if (q1 === "C") primaryKeys = ["masterYourMessageB2B", "highFidelityCommunication", "communicateWithStyle"];
    else primaryKeys = ["reignitingResilience", "fromPassengerToPilot", "findingJoyAtWork"];
    extra.push(grp("Strategic Capability — Thinking and Execution", "stracticalLeader", "leadershipOM", "architectureOfAdaptability"));
  } else if (rt === "RT-D") {
    headline = "Strategic / Architectural";
    narrative = "What you're describing isn't a program gap or training need. It's an architectural question: whether your organization's current identity is built to carry what you're trying to create. The Blue Door is where organizations at strategic inflection points begin.";
    const q1 = val(answers, "Q1Strategic");
    primaryHeading = "Pathway B Workshops — Activate Your Team While the Appraisal Work Is Underway";
    if (q1 === "A") primaryKeys = ["architectChange", "pillarsReinforcement", "architectureOfAdaptability"];
    else if (q1 === "B") primaryKeys = ["leadershipOM", "stracticalLeader", "architectChange"];
    else if (q1 === "C") primaryKeys = ["aiEiOh", "architectureOfAdaptability", "architectChange"];
    else primaryKeys = ["architectChange", "architectureOfAdaptability", "pathToLastingChange"];
    extra.push(grp("Pre-Blue-Door Scoping", "currentStateLight", "currentStateDeep"));
    extra.push(grp("Stoic Grounding for the Senior Team", "stoicismB2B"));
  } else {
    // RT-E
    headline = "Exploring Your Options";
    narrative = "You're in the right place even if you're not sure exactly what you need yet. Organizational development rarely announces itself with a clear brief. Start with a defined experience that gives your team traction and a shared framework. The right next step will become clearer from there.";
    primaryHeading = "Team Dynamics & People";
    primaryKeys = ["fromConflictToConnection", "fromDysfunctionToDynamic", "heroesAssemble"];
    extra.push(grp("Change & Transformation", "leadAtSpeed", "pathToLastingChange", "cultivatingChangeResilience"));
    extra.push(grp("Leadership Capability", "goldilocks", "stracticalLeader", "pillarsOfLastingChange"));
    extra.push(grp("Strategic Design", "architectChange", "pillarsReinforcement"));
  }

  if (commOn) extra.push(grp("If Communication Is Part of the Challenge — Rob Hunter", "masterYourMessageB2B", "powerOfStory", "eightByEight", "communicateWithStyle", "borderlessCommunication", "fiveMinuteKeynote"));
  if (resOn) extra.push(grp("If Resilience or Wellbeing Is Part of the Challenge — Sierra Ramm Cantrell", "reignitingResilience", "fromPassengerToPilot", "findingJoyAtWork", "moveShakeInnovate"));

  const strongestNextStep =
    strongest === "blueDoor"
      ? { kind: "blueDoor" as const, offering: blueDoorOff, label: "Strongest Next Step — The Blue Door" }
      : strongest === "workshop"
        ? { kind: "workshop" as const, offering: O[primaryKeys[0]], label: "Strongest Next Step — Workshop" }
        : undefined;

  return {
    track: "b2b",
    resultType: rt,
    headline,
    subhead: rt === "RT-D" ? "Blue Door™ Primary | Pathway B Alongside" : "Pathway B Workshops | Blue Door™",
    narrative,
    primaryGroup: grp(primaryHeading, ...primaryKeys),
    groups: [
      ...extra,
      grp("Deeper Option — Blue Door Organizational Appraisal", "blueDoor"),
    ],
    strongestNextStep,
    crossoverNote: crossover,
    whatComesNext: rt === "RT-D"
      ? "Blue Door produces your P.A.T.H. Compass — the organizational roadmap that informs everything that follows. From there, qualified organizations move to Architect Change and then into AMPLIFY or EMBODY partnership."
      : "A workshop is a powerful starting point. Organizations that go deeper often find the work surfaces something more structural that a single workshop addresses symptomatically but not architecturally. The Blue Door is there when you're ready for that conversation.",
  };
}

export function buildResult(track: Track, answers: Answers): QuizResult {
  if (track === "b2c") {
    const { resultType } = scoreB2C(answers);
    return b2cResult(resultType, answers);
  }
  const { resultType, strongest } = scoreB2B(answers);
  return b2bResult(resultType, answers, strongest);
}
