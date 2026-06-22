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
  tier: "IGNITE" | "AMPLIFY" | "Workshop" | "Blue Door" | "Free" | "Assessment" | "Speaking";
  blurb: string;
  url: string;
}

export const OFFERINGS = {
  // ===== B2C IGNITE =====
  radicalMindfulness: { key: "radicalMindfulness", name: "Radical Mindfulness", facilitator: "Sierra", tier: "IGNITE", url: "/partner/ignite/courses#radical-mindfulness", blurb: "8-week self-paced program building conscious awareness, emotional regulation, and reflective capacity." },
  radicalMindfulnessMini: { key: "radicalMindfulnessMini", name: "Radical Mindfulness Mini Course", facilitator: "Sierra", tier: "IGNITE", url: "/partner/ignite/masterclasses#mc-radical-mindfulness-mini", blurb: "Condensed entry point before the full 8-week commitment." },
  passengerToPilot: { key: "passengerToPilot", name: "Passenger to Pilot (Masterclass)", facilitator: "Sierra", tier: "IGNITE", url: "/pilot-training", blurb: "Shift from reactive to proactive leadership." },
  masterYourMessage: { key: "masterYourMessage", name: "Master Your Message", facilitator: "Rob", tier: "IGNITE", url: "/partner/ignite/courses#master-your-message", blurb: "6-week self-paced program: authentic communication and influence without authority." },
  masterYourMessageMini: { key: "masterYourMessageMini", name: "Master Your Message Mini Course", facilitator: "Rob", tier: "IGNITE", url: "/partner/ignite/masterclasses#mc-master-your-message-mini", blurb: "Core framework condensed." },
  talkingToStrangers: { key: "talkingToStrangers", name: "Talking to Strangers (Masterclass)", facilitator: "Rob", tier: "IGNITE", url: "/partner/ignite/masterclasses#mc-talking-to-strangers", blurb: "Authentic connection in unfamiliar contexts." },
  createExtraordinaryTeams: { key: "createExtraordinaryTeams", name: "Create Extraordinary Teams", facilitator: "Painted Porch Team", tier: "IGNITE", url: "/partner/ignite/courses#create-extraordinary-teams", blurb: "Deep, comprehensive program on team dynamics that work." },
  elementsOfATeam: { key: "elementsOfATeam", name: "Elements of a Team (Masterclass)", facilitator: "Amy", tier: "IGNITE", url: "/partner/ignite/masterclasses#mc-elements-of-team", blurb: "Core components of team health. Strong as precursor or standalone." },
  leadingChangeMini: { key: "leadingChangeMini", name: "Leading Change Mini Course", facilitator: "Amy", tier: "IGNITE", url: "/partner/ignite/masterclasses#mc-leading-change-mini", blurb: "Change leadership fundamentals: how change works, where resistance comes from." },

  // ===== B2C AMPLIFY Labs =====
  conflictToConnectionLab: { key: "conflictToConnectionLab", name: "From Conflict to Connection Lab", facilitator: "Amy", tier: "AMPLIFY", url: "/partner/amplify/labs#lab-conflict-to-connection", blurb: "Peer cohort tackling team friction at the relational and structural root." },
  goldilocksLab: { key: "goldilocksLab", name: "Goldilocks Leadership Lab", facilitator: "Amy", tier: "AMPLIFY", url: "/partner/amplify/labs#lab-goldilocks-leadership", blurb: "Calibrated, context-sensitive EQ that makes team leadership feel like design." },
  leadingChangeLab: { key: "leadingChangeLab", name: "Leading Change / P.A.T.H. Lab", facilitator: "Amy", tier: "AMPLIFY", url: "/partner/amplify/labs#lab-leading-change", blurb: "Cohort lab applying the full P.A.T.H. framework to real change challenges." },
  stracticalLeaderLab: { key: "stracticalLeaderLab", name: "Stractical Leader Lab", facilitator: "Amy", tier: "AMPLIFY", url: "/partner/amplify/stractical-leader", blurb: "Strategic vision and tactical execution integration at the leadership-team level." },
  stoicismLab: { key: "stoicismLab", name: "Stoicism in the Workplace Lab", facilitator: "Amy", tier: "AMPLIFY", url: "/partner/amplify/labs#lab-stoicism-workplace", blurb: "Philosophical grounding made permanent." },
  aiEiOhLab: { key: "aiEiOhLab", name: "AI, EI, Oh! Lab", facilitator: "Amy", tier: "AMPLIFY", url: "/partner/amplify/labs#lab-ai-ei-oh", blurb: "Leading AI adoption with human wisdom." },

  // ===== B2B Workshop tier =====
  fromConflictToConnection: { key: "fromConflictToConnection", name: "From Conflict to Connection", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Addresses team friction at the relational and structural root, not the symptom." },
  fromDysfunctionToDynamic: { key: "fromDysfunctionToDynamic", name: "From Dysfunction to Dynamic", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Structural redesign of team patterns: decision rights, accountability, interaction design." },
  geniusAtWork: { key: "geniusAtWork", name: "Genius at Work", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Working Genius assessment-based session surfacing how your team contributes." },
  heroesAssemble: { key: "heroesAssemble", name: "Heroes Assemble", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Activating individual strengths in service of collective performance." },
  pathToLastingChange: { key: "pathToLastingChange", name: "The P.A.T.H. to Lasting Change", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Full P.A.T.H. framework applied to sustained organizational transformation." },
  leadAtSpeed: { key: "leadAtSpeed", name: "Lead at the Speed of Change", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Leadership capacity to drive change at organizational velocity without sacrificing trust." },
  drivingChange3Shifts: { key: "drivingChange3Shifts", name: "Driving Change: The 3 Shifts", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Three leadership shifts that separate transformations that hold from those that evaporate." },
  changeForGood: { key: "changeForGood", name: "Change for Good: Immunity to Change", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Surfacing the hidden competing commitments quietly defeating your change efforts." },
  cultivatingChangeResilience: { key: "cultivatingChangeResilience", name: "Cultivating Change Resilience", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Resilience as organizational infrastructure: distributed across systems and culture." },
  kickTheHabit: { key: "kickTheHabit", name: "Kick the Habit", facilitator: "Amy", tier: "Workshop", url: "/resources/kick-the-habit", blurb: "Addressing the behavioral patterns and mental models that make change fail to stick." },
  aiEiOh: { key: "aiEiOh", name: "AI, EI, Oh", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Leading AI integration with the emotional intelligence and organizational wisdom it requires." },
  architectureOfOrganizationalShift: { key: "architectureOfOrganizationalShift", name: "The Architecture of Organizational ShIFt", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Building organizational systems designed to navigate uncertainty rather than react to it. Diagnoses and reinforces the three Painted Porch Pillars™: Cultural Cornerstone, Operational Frame, and Living Ecosystem as one fortified foundation." },
  goldilocks: { key: "goldilocks", name: "Goldilocks Leadership", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Calibrated, context-sensitive EQ in leadership." },
  stracticalLeader: { key: "stracticalLeader", name: "The Stractical Leader", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/stractical-leader", blurb: "Integrating strategic vision with tactical execution for leadership teams." },
  leadershipOM: { key: "leadershipOM", name: "Leadership OM: A 21st-Century Operating Model for Organizational Evolution", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Redesigning the leadership operating model for 21st-century organizational evolution, distributing decisions and accountability." },

  // Rob Hunter
  communicateWithStyle: { key: "communicateWithStyle", name: "Communicate with Style", facilitator: "Rob", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Style awareness and adaptation across different team members and contexts." },
  powerOfStory: { key: "powerOfStory", name: "The Power of Story", facilitator: "Rob", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Using narrative to create shared understanding and team cohesion." },
  eightByEight: { key: "eightByEight", name: "8:8", facilitator: "Rob", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "The eight things leaders need to know before they communicate and the eight ways to make it land." },
  masterYourMessageB2B: { key: "masterYourMessageB2B", name: "Master Your Message (B2B)", facilitator: "Rob", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Communication architecture that makes leadership messaging land across the organization." },
  highFidelityCommunication: { key: "highFidelityCommunication", name: "High-Fidelity Communication", facilitator: "Rob", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Ensuring message and meaning arrive intact." },
  getClearBeHeard: { key: "getClearBeHeard", name: "Get C.L.E.A.R., Be Heard", facilitator: "Rob", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Practical communication frameworks for leaders navigating complex change." },

  // Sierra
  reignitingResilience: { key: "reignitingResilience", name: "Reigniting Resilience", facilitator: "Sierra", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Rebuilding genuine resilience capacity in depleted teams and leaders." },
  findingJoyAtWork: { key: "findingJoyAtWork", name: "Finding Joy at Work", facilitator: "Sierra", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Designing conditions that make sustainable engagement possible." },
  fromPassengerToPilot: { key: "fromPassengerToPilot", name: "From Passenger to Pilot", facilitator: "Sierra", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Reclaiming individual agency within team and organizational systems." },
  radicalMindfulnessB2B: { key: "radicalMindfulnessB2B", name: "Radical Mindfulness (B2B)", facilitator: "Sierra", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Mindfulness as a leadership practice for organizational wellbeing." },

  // Rob — additional Workshop
  borderlessCommunication: { key: "borderlessCommunication", name: "Borderless Communication", facilitator: "Rob", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Communication across cultures, geographies, and modalities without losing signal." },

  // Sierra — additional Workshop
  moveShakeInnovate: { key: "moveShakeInnovate", name: "Move, Shake, Innovate", facilitator: "Sierra", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Reawakening creative capacity and innovation culture in teams that have gone flat." },

  // Amy — additional Workshop
  architectChange: { key: "architectChange", name: "Architect Change (Strategic Design Intensive)", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Phase Zero™ strategic design — author what you're about to build before you build it." },
  
  stoicismB2B: { key: "stoicismB2B", name: "Stoicism in the Workplace (Workshop)", facilitator: "Amy", tier: "Workshop", url: "/partner/amplify/workshops", blurb: "Stoic philosophy translated into leadership and team practice at the organizational level." },

  // Pre-Blue-Door scoping
  currentStateLight: { key: "currentStateLight", name: "Current State Analysis — Light", tier: "Assessment", url: "/blue-door", blurb: "Lightweight organizational snapshot. Quick read on where the architecture stands." },
  currentStateDeep: { key: "currentStateDeep", name: "Current State Analysis — Deep", tier: "Assessment", url: "/blue-door", blurb: "Deeper organizational diagnostic. For leaders who already know something structural needs to shift." },

  // Assessments / Free
  eqi: { key: "eqi", name: "EQ-i 2.0 Assessment", tier: "Assessment", url: "/eq", blurb: "Emotional intelligence baseline. Data on where reflective and relational capacity sits." },
  eq360: { key: "eq360", name: "EQ360 Assessment", tier: "Assessment", url: "/eq", blurb: "Multi-perspective EQ feedback." },
  workingGenius: { key: "workingGenius", name: "Working Genius Assessment", tier: "Assessment", url: "/partner/ignite/assessments/working-genius", blurb: "Natural contribution style surfaces gaps you may not have named yet." },
  performanceDNA: { key: "performanceDNA", name: "Performance DNA Assessment", tier: "Assessment", url: "/partner/ignite/assessments#performance-dna", blurb: "Behavioral architecture at the elevation level." },

  // IGNITE Challenges (B2C)
  meditationChallenge: { key: "meditationChallenge", name: "Meditation Challenge", facilitator: "Sierra", tier: "IGNITE", url: "/partner/ignite/masterclasses#mc-meditation-challenge", blurb: "Short daily meditation practice to build the reflective muscle." },
  gratitudeChallenge: { key: "gratitudeChallenge", name: "Gratitude Challenge", facilitator: "Sierra", tier: "IGNITE", url: "/partner/ignite/masterclasses#mc-gratitude-challenge", blurb: "Daily gratitude practice that resets perspective and steadies the inner game." },
  journalingChallenge: { key: "journalingChallenge", name: "Journaling Challenge", facilitator: "Rob", tier: "IGNITE", url: "/partner/ignite/masterclasses#mc-mym-journal-challenge", blurb: "Daily journaling prompts that sharpen how you think, speak, and write as a leader." },
  kickTheHabitB2C: { key: "kickTheHabitB2C", name: "Kick the Habit (Masterclass)", facilitator: "Amy", tier: "IGNITE", url: "/kick-the-habit", blurb: "Short masterclass on the behavioral patterns that quietly keep change from sticking." },

  // Free Resources
  fiftyTwoStoicism: { key: "fiftyTwoStoicism", name: "52 Weeks of Stoicism", tier: "Free", url: "https://youtube.com/playlist?list=PLhdPibIQvwhHBAdRRSuk2JmGT9GO7lNBs&si=5gSyg-aAllEOSCSr", blurb: "Weekly Stoic principles for leadership. Free YouTube playlist." },
  burnoutResources: { key: "burnoutResources", name: "Burnout Resources", tier: "Free", url: "/burnout", blurb: "If exhaustion is part of your reality, start here. Free." },
  strategicChangeCanvas: { key: "strategicChangeCanvas", name: "Strategic Change Canvas", tier: "Free", url: "/change-canvas", blurb: "Visual planning tool for mapping change before you launch it. Free." },
  communicatingChangeWorkbook: { key: "communicatingChangeWorkbook", name: "Communicating Change Workbook", tier: "Free", url: "/change-comms", blurb: "Templates for the conversations that make or break transformation. Free." },
  stracticalMini: { key: "stracticalMini", name: "Stractical Leader Mini Workbook", tier: "Free", url: "/resources/stractical-mini", blurb: "Taste of the strategic-tactical integration work. Free." },
  resolutionRemix: { key: "resolutionRemix", name: "Resolution Remix", facilitator: "Sierra", tier: "IGNITE", url: "/partner/ignite/masterclasses", blurb: "Reframe annual resolutions into sustainable leadership practices." },
  workFromHomePro: { key: "workFromHomePro", name: "Become a Work-From-Home Pro", tier: "Free", url: "/wfh-sign-up", blurb: "Practical guide to remote-work rhythm, focus, and energy. Free." },
  stoicLeaderFieldGuide: { key: "stoicLeaderFieldGuide", name: "The Stoic Leader Field Guide", facilitator: "Amy", tier: "Free", url: "/stoic-field-guide", blurb: "Stoic principles translated into daily leadership practice. Free download." },

  // Blue Door
  blueDoor: { key: "blueDoor", name: "The Blue Door Organizational Appraisal", tier: "Blue Door", url: "/blue-door", blurb: "About 20 minutes. Produces the P.A.T.H. Compass: architecture, capacity signal, Move Now Map, Reinforce First priorities. No prerequisites." },

  // ===== Speaking Topics =====
  // Amy
  speakingHeroesAssemble: { key: "speakingHeroesAssemble", name: "Heroes Assemble! (Keynote)", facilitator: "Amy", tier: "Speaking", url: "/speaking/amy#topic-heroes-assemble", blurb: "Unite your team through shared purpose, candor, and trust." },
  speakingLeadAtSpeed: { key: "speakingLeadAtSpeed", name: "Lead at the Speed of Change (Keynote)", facilitator: "Amy", tier: "Speaking", url: "/speaking/amy#topic-lead-at-the-speed-of-change", blurb: "Lead adaptively when the ground shifts beneath you." },
  speakingShIFtHappens: { key: "speakingShIFtHappens", name: "ShIFt Happens. Be Ready. (Keynote)", facilitator: "Amy", tier: "Speaking", url: "/speaking/amy#topic-shift-happens-be-ready", blurb: "The P.A.T.H.™ method as a roadmap for change that's on time, on budget, and on purpose." },
  speakingGoldilocks: { key: "speakingGoldilocks", name: "Goldilocks Leadership (Keynote)", facilitator: "Amy", tier: "Speaking", url: "/speaking/amy#topic-goldilocks-leadership", blurb: "Find the emotional intelligence sweet spot for just-right leadership." },
  speakingStoicism: { key: "speakingStoicism", name: "Stoicism in the Workplace (Keynote)", facilitator: "Amy", tier: "Speaking", url: "/speaking/amy#topic-stoicism-in-the-workplace", blurb: "Ancient Stoic principles for modern leadership and resilience." },
  speakingFromDysfunction: { key: "speakingFromDysfunction", name: "From Dysfunction to Dynamic Teams (Keynote)", facilitator: "Amy", tier: "Speaking", url: "/speaking/amy#topic-from-dysfunction-to-dynamic-teams", blurb: "Turn struggling teams into high-performing powerhouses." },
  speakingAiEiOh: { key: "speakingAiEiOh", name: "AI, EI, Oh! (Keynote)", facilitator: "Amy", tier: "Speaking", url: "/speaking/amy#topic-ai-ei-oh-guiding-change-and-ai-adoption", blurb: "Emotional intelligence as the missing link in AI adoption." },
  speakingAlicePrinciples: { key: "speakingAlicePrinciples", name: "The Alice Principles (Keynote)", facilitator: "Amy", tier: "Speaking", url: "/speaking/amy#topic-the-alice-principles-down-the-rabbit-hole-of-transformation", blurb: "Curiosity and adaptability as the lens for navigating transformation." },
  speakingDontPanic: { key: "speakingDontPanic", name: "Don't Panic! Navigating a Changing World (Keynote)", facilitator: "Amy", tier: "Speaking", url: "/speaking/amy#topic-dont-panic-navigating-a-changing-world", blurb: "Humor, perspective, and a good guide for overwhelming change." },

  // Rob
  speakingHighFidelity: { key: "speakingHighFidelity", name: "High-Fidelity Communication (Keynote)", facilitator: "Rob", tier: "Speaking", url: "/speaking/rob#topic-high-fidelity-communication", blurb: "Preparation, conciseness, and attentiveness as the three pillars of clear communication." },
  speaking88: { key: "speaking88", name: "8:8 — Capturing & Keeping Attention (Keynote)", facilitator: "Rob", tier: "Speaking", url: "/speaking/rob#topic-8-8", blurb: "Hook, hold, and inspire your audience before they scroll away." },
  speakingPowerOfStory: { key: "speakingPowerOfStory", name: "The Power of Story (Keynote)", facilitator: "Rob", tier: "Speaking", url: "/speaking/rob#topic-the-power-of-story", blurb: "Narrative to persuade, connect, and be unforgettable." },
  speakingGetClear: { key: "speakingGetClear", name: "Get C.L.E.A.R. & Be Heard (Keynote)", facilitator: "Rob", tier: "Speaking", url: "/speaking/rob#topic-get-clear-be-heard", blurb: "Clarity, Language, Energy, Attention, Relevance." },
  speakingBorderlessKeynote: { key: "speakingBorderlessKeynote", name: "Borderless Communication (Keynote)", facilitator: "Rob", tier: "Speaking", url: "/speaking/rob#topic-borderless-communication", blurb: "Create a culture of ownership and follow-through." },
  speakingOnAir: { key: "speakingOnAir", name: "On-Air Ready Confidence (Keynote)", facilitator: "Rob", tier: "Speaking", url: "/speaking/rob#topic-on-air-ready-confidence", blurb: "Tame the nerves and take the mic." },
  speakingFiveMin: { key: "speakingFiveMin", name: "Your 5-Minute Keynote", facilitator: "Rob", tier: "Speaking", url: "/speaking/rob#topic-your-5-minute-keynote", blurb: "Craft a signature message you can deliver at a moment's notice." },
  speakingCommStyle: { key: "speakingCommStyle", name: "Speaking with Style — 6 Communicator Styles (Keynote)", facilitator: "Rob", tier: "Speaking", url: "/speaking/rob#topic-speaking-with-style-the-6-communicator-styles-for-influence-impact", blurb: "Discover your style and flex across all six to connect with any audience." },

  // Sierra
  speakingFromPassengerToPilot: { key: "speakingFromPassengerToPilot", name: "From Passenger to Pilot (Keynote)", facilitator: "Sierra", tier: "Speaking", url: "/speaking/sierra#topic-from-passenger-to-pilot", blurb: "Bounce back from challenges and prevent burnout with science-backed resilience tools." },
  speakingMoveShakeInnovate: { key: "speakingMoveShakeInnovate", name: "Move, Shake, Innovate (Keynote)", facilitator: "Sierra", tier: "Speaking", url: "/speaking/sierra#topic-move-shake-innovate", blurb: "Physical motion that sparks creativity, problem-solving, and presence." },
  speakingFindingJoy: { key: "speakingFindingJoy", name: "Finding Joy at Work (Keynote)", facilitator: "Sierra", tier: "Speaking", url: "/speaking/sierra#topic-finding-joy-at-work", blurb: "Infuse your day with purpose, presence, and a little play." },
  speakingReignitingResilience: { key: "speakingReignitingResilience", name: "Reigniting Resilience (Keynote)", facilitator: "Sierra", tier: "Speaking", url: "/speaking/sierra#topic-reigniting-resilience", blurb: "Simplify energy management and boost team engagement." },
  speakingRadicallyMindful: { key: "speakingRadicallyMindful", name: "Radically Mindful Leadership (Keynote)", facilitator: "Sierra", tier: "Speaking", url: "/speaking/sierra#topic-radically-mindful-leadership", blurb: "Practical mindfulness for executives who don't have time for mindfulness." },
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
    prompt: "When you look at the people and relationships around your work, what's most true right now?",
    options: [
      { id: "A", label: "I'm focused on the foundation — how I show up before I worry about shaping how others work together." },
      { id: "B", label: "Building real collaboration is harder than individual relationships — the group dynamic is where I get stuck." },
      { id: "C", label: "There's real friction in play. Things aren't functioning the way they should." },
      { id: "D", label: "Relationships and dynamics are working well. I'm more focused on my own depth than on fixing them." },
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

export interface ContentItem {
  kind: "blog" | "media";
  title: string;
  url: string;
  excerpt?: string;
  thumbnail?: string;
  date?: string;
  source?: string; // media show name
}

export interface QuizResult {
  track: Track;
  resultType: ResultType;
  headline: string;
  subhead?: string;
  narrative: string;
  /** Short, specific bridge that explains why the picked offerings address the gap the quiz surfaced. Rendered as a callout above the primary group. */
  whyThisFits?: string;
  primaryGroup?: RecommendationGroup;
  groups: RecommendationGroup[];
  strongestNextStep?: { kind: "workshop" | "blueDoor"; offering: Offering; label: string };
  crossoverNote?: string;
  whatComesNext: string;
  /** Plain-English topic area for the result (used in "we also offer additional sessions in {topic}" note). B2B only. */
  topicArea?: string;
  /** Suggested contact-form prefill values for the "Contact Us to Learn More" CTA. */
  contactPrefill?: { scope: string; interests: string[] };
  /** Optional blog/media items related to this result, loaded async in the dialog. */
  relatedContent?: ContentItem[];
}

/**
 * Maps each result type to relevant blog_categories slugs. Used by the dialog
 * to fetch related blog posts and media appearances (media uses the same
 * blog_categories table via media_appearance_categories).
 */
export const RT_TO_CONTENT_CATEGORIES: Record<ResultType, string[]> = {
  // B2C
  RT1: ["resilience-wellbeing", "stoicism-philosophy"],
  RT2: ["communication"],
  RT3: ["team-dynamics", "leadership-culture"],
  RT4: ["change-innovation"],
  RT5: ["leadership-culture", "change-innovation", "stoicism-philosophy"],
  RT6: ["resilience-wellbeing", "stoicism-philosophy"],
  // B2B
  "RT-A": ["team-dynamics", "communication"],
  "RT-B": ["change-innovation"],
  "RT-C": ["leadership-culture"],
  "RT-D": ["change-innovation", "workplace-operations"],
  "RT-E": ["leadership-culture", "change-innovation"],
};

export interface BuildResultOptions {
  /**
   * Allowlist of offering keys the admin has marked as having a real,
   * clickable destination today (is_live = true AND a URL or anchor set in
   * /admin/path-finder-offerings). When provided, recommendations on BOTH
   * tracks are narrowed to this set. Falls back gracefully if filtering
   * would leave a result blank.
   */
  viewableKeys?: Set<string>;
  /**
   * Admin-managed RT-pool overrides loaded from path_finder_offerings.
   * Shape: { "RT1": { free: [offeringKey, ...] }, "RT-A": { free: [...], speaking: [...] } }.
   * When present, replaces the hard-coded FREE_RESOURCES_BY_RT / SPEAKING_BY_RT
   * pools and the B2C inline "Free Starting Points" / "Free Tools" groups.
   */
  rtPools?: Partial<Record<ResultType, { free?: OfferingKey[]; speaking?: OfferingKey[] }>>;
  /**
   * Offering keys flagged "Prioritize in quiz" by the admin. When an offering
   * in this set is already in the primary recommendation group for the matched
   * result, it gets pinned to position 1. Does not force offerings into lists
   * they aren't already in (use RT pools / primary lists for that).
   */
  featuredKeys?: Set<string>;
}

const O = OFFERINGS;
const grp = (heading: string, ...keys: OfferingKey[]): RecommendationGroup => ({
  heading, offerings: keys.map((k) => O[k]),
});

// Safe fallback for B2B if filtering would otherwise empty a primary pick.
const SAFE_B2B_FALLBACK: OfferingKey[] = [
  "architectureOfOrganizationalShift",
  "pathToLastingChange",
  "architectChange",
  "blueDoor",
];

// Safe fallback for B2C primary picks when filtering would empty the group.
const SAFE_B2C_FALLBACK: OfferingKey[] = [
  "radicalMindfulness",
  "masterYourMessage",
  "createExtraordinaryTeams",
];

// Speaking-topic candidates per B2B result type. Only surfaced when admin has
// marked the row Live + clickable in /admin/path-finder-offerings.
const SPEAKING_BY_RT: Record<B2BResultType, OfferingKey[]> = {
  "RT-A": ["speakingHeroesAssemble", "speakingFromDysfunction", "speakingPowerOfStory", "speakingFindingJoy", "speakingReignitingResilience"],
  "RT-B": ["speakingShIFtHappens", "speakingLeadAtSpeed", "speakingAiEiOh", "speakingAlicePrinciples", "speakingDontPanic", "speakingFromPassengerToPilot"],
  "RT-C": ["speakingGoldilocks", "speakingStoicism", "speakingGetClear", "speaking88", "speakingCommStyle", "speakingRadicallyMindful"],
  "RT-D": ["speakingShIFtHappens", "speakingAlicePrinciples", "speakingStoicism"],
  "RT-E": ["speakingHeroesAssemble", "speakingShIFtHappens", "speakingGoldilocks"],
};

// Free-resource candidates per B2B result type. Up to 2 surface in results,
// filtered to admin-eligible (Live + URL/anchor) rows.
const FREE_RESOURCES_BY_RT: Record<B2BResultType, OfferingKey[]> = {
  "RT-A": ["communicatingChangeWorkbook", "stoicLeaderFieldGuide", "fiftyTwoStoicism", "burnoutResources"],
  "RT-B": ["strategicChangeCanvas", "communicatingChangeWorkbook", "fiftyTwoStoicism"],
  "RT-C": ["stoicLeaderFieldGuide", "stracticalMini", "fiftyTwoStoicism", "communicatingChangeWorkbook"],
  "RT-D": ["strategicChangeCanvas", "stoicLeaderFieldGuide", "communicatingChangeWorkbook", "stracticalMini"],
  "RT-E": ["strategicChangeCanvas", "stoicLeaderFieldGuide", "burnoutResources", "fiftyTwoStoicism"],
};

// Post-process a result to drop offerings not in the viewable set. Keeps
// the original group as a fallback if filtering would empty it, so results
// never display a blank section.
function applyViewableFilter(r: QuizResult, viewable?: Set<string>): QuizResult {
  if (!viewable || viewable.size === 0) return r;
  const filterGroup = (g: RecommendationGroup): RecommendationGroup => {
    const offerings = g.offerings.filter((o) => viewable.has(o.key));
    return offerings.length > 0 ? { ...g, offerings } : g;
  };
  const filteredGroups = r.groups
    .map((g) => ({ ...g, offerings: g.offerings.filter((o) => viewable.has(o.key)) }))
    .filter((g) => g.offerings.length > 0);
  return {
    ...r,
    primaryGroup: r.primaryGroup ? filterGroup(r.primaryGroup) : undefined,
    groups: filteredGroups.length > 0 ? filteredGroups : r.groups,
    strongestNextStep: r.strongestNextStep && viewable.has(r.strongestNextStep.offering.key)
      ? r.strongestNextStep
      : undefined,
  };
}

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
        whyThisFits: "Your gap is foundation, not tactics — so we're pointing at the one program built to install it. Radical Mindfulness is the self-paced course that develops the self-awareness and reflective capacity every later capability (communication, team leadership, change) is built on. The free Stoicism prompts and Burnout resources are there to keep the practice alive between sessions.",
        groups: [
          grp("Also Worth Exploring", "radicalMindfulnessMini", "passengerToPilot", "eqi"),
          grp("Free Starting Points", "stoicLeaderFieldGuide", "fiftyTwoStoicism", "burnoutResources"),
        ],
        whatComesNext: "Once this foundation is in place, two directions open: strengthening how you communicate, or building toward leading others. The AMPLIFY Leadership Labs are available whenever you're ready.",
      };
    case "RT2":
      return {
        track: "b2c", resultType: rt, headline: "Build Communication Power",
        subhead: "IGNITE — Self-Paced",
        narrative: "You have the self-awareness. You can read a room. The gap is in the translation: getting what's in your head to consistently land the way you intend. Closing this gap is about mastering the instrument you already have.",
        primaryGroup: grp("Your Starting Point — IGNITE", "masterYourMessage"),
        whyThisFits: "Your gap is the translation layer — the space between what you mean and how it lands. Master Your Message is built specifically for that gap: how you frame, deliver, and adapt your message so it consistently reaches the room you're actually in. The companion picks sharpen the same instrument (style awareness, hard conversations, your natural working genius).",
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
        whyThisFits: cohort
          ? "You told us you want a live, cohort-based experience — so we picked the two Labs that target the team dynamics most leaders trip on: navigating conflict productively (Conflict to Connection) and calibrating expectations and accountability (Goldilocks). Both put you in a peer cohort where the work is the team, not the theory."
          : "You told us you want a self-paced path — so we picked the one course designed to give you the team-leadership playbook end to end. Create Extraordinary Teams covers the conditions, rhythms, and decisions that turn a group of capable people into a team that consistently performs.",
        groups: [
          grp("Also Worth Exploring", "elementsOfATeam", "workingGenius", "kickTheHabit"),
          grp("Free Starting Points", "stoicLeaderFieldGuide"),
        ],
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
        whyThisFits: cohort
          ? "Your gap is having a repeatable framework for change — and you want it in a live cohort. The Leading Change Lab walks you through the P.A.T.H.™ method (Prepare, Align, Take Off, Habit) with peers running real initiatives, so the framework becomes muscle memory, not a slide deck."
          : "Your gap is having a repeatable framework for change — and you want it self-paced. The Leading Change mini-course gives you the P.A.T.H.™ method (Prepare, Align, Take Off, Habit) in short, finishable lessons. The free Strategic Change Canvas and Communicating Change workbook are the working tools you'll use on your next initiative.",
        groups: [
          grp("Also Worth Exploring", "aiEiOhLab"),
          grp("Free Tools", "strategicChangeCanvas", "communicatingChangeWorkbook", "stoicLeaderFieldGuide"),
        ],
        whatComesNext: "Leaders who do this work often reach a point where the change challenges they're navigating personally are also challenges their organization faces at scale. When it stops being about your development and starts being about the architecture your organization needs, there's a different conversation available.",
      };
    }
    case "RT5": {
      // Score Labs against Q1–Q5 signals so RT5 narrows to the 2 most relevant
      // Labs instead of dumping the full 6-Lab slate.
      const q1 = val(answers, "Q1"), q2 = val(answers, "Q2"), q3 = val(answers, "Q3"),
            q4 = val(answers, "Q4"), q5 = val(answers, "Q5");
      const score: Record<OfferingKey, number> = {
        stracticalLeaderLab: 0, leadingChangeLab: 0, conflictToConnectionLab: 0,
        goldilocksLab: 0, stoicismLab: 0, aiEiOhLab: 0,
      } as Record<OfferingKey, number>;
      // Q1 — primary gap
      if (q1 === "A") { score.stoicismLab += 3; score.goldilocksLab += 1; }
      if (q1 === "B") { score.goldilocksLab += 3; score.conflictToConnectionLab += 1; }
      if (q1 === "C") { score.conflictToConnectionLab += 3; score.goldilocksLab += 2; }
      if (q1 === "D") { score.leadingChangeLab += 3; score.stracticalLeaderLab += 2; }
      // Q2 — message-landing struggle = EQ calibration signal
      if (q2 === "B" || q2 === "C") score.goldilocksLab += 1;
      if (q2 === "D") { score.goldilocksLab += 2; score.conflictToConnectionLab += 1; }
      // Q3 — secondary friction
      if (q3 === "B") score.conflictToConnectionLab += 1;
      if (q3 === "C") { score.conflictToConnectionLab += 2; score.goldilocksLab += 1; }
      if (q3 === "D") { score.stoicismLab += 2; score.stracticalLeaderLab += 1; }
      // Q4 — change history
      if (q4 === "B") score.leadingChangeLab += 1;
      if (q4 === "C") { score.leadingChangeLab += 2; score.stracticalLeaderLab += 1; }
      if (q4 === "D") { score.stracticalLeaderLab += 2; score.leadingChangeLab += 1; }
      // Q5 — integration depth
      if (q5 === "C") score.leadingChangeLab += 1;
      if (q5 === "D") { score.stracticalLeaderLab += 2; score.stoicismLab += 1; }
      // Stable order for ties (matches existing visual ordering)
      const labOrder: OfferingKey[] = ["stracticalLeaderLab", "leadingChangeLab", "conflictToConnectionLab", "goldilocksLab", "stoicismLab", "aiEiOhLab"];
      const ranked = labOrder.slice().sort((a, b) => (score[b] - score[a]) || (labOrder.indexOf(a) - labOrder.indexOf(b)));
      const primaryLabs = ranked.slice(0, 2);
      const secondaryLabs = ranked.slice(2);
      return {
        track: "b2c", resultType: rt, headline: "Ready for Advanced Partnership",
        subhead: "AMPLIFY — Leadership Labs",
        narrative: "You're not looking for a starting point. You're looking for depth: real challenge, peer-level conversation, an environment where the work pushes you rather than walks you through basics. The AMPLIFY Leadership Labs are built for exactly that — and based on your answers, two pull harder than the rest.",
        primaryGroup: grp("Your Starting Point — The Two Labs Your Answers Point At", ...primaryLabs),
        whyThisFits: "You have range and you're hungry for depth, so instead of handing you the full slate we narrowed to the two Labs your Q1–Q5 signals point at most directly. The remaining Labs are listed below if a different terrain pulls you. Every Lab is peer cohort, live, and built to push.",
        groups: [
          grp("Also Worth Exploring — The Other Labs", ...secondaryLabs),
          grp("Micro Starting Points", "stracticalMini", "performanceDNA"),
          grp("Free Starting Points", "stoicLeaderFieldGuide", "fiftyTwoStoicism"),
        ],
        whatComesNext: "Some leaders reach a point where the work they're doing for themselves starts to feel like the work their whole organization needs. When you find yourself asking 'how do I build an organization that can hold what I'm trying to create' — we're here for that conversation.",
      };
    }
    case "RT6":
      return {
        track: "b2c", resultType: rt, headline: "Explore Before Committing",
        subhead: "Start on Your Terms",
        narrative: "You're paying attention, and that's the move. Nothing in your answers pointed sharply at one gap, which means the right starting point isn't a program. It's one small, finishable thing that gives you a real win and helps the next answer get clearer. Start here. Finish it. Then come back to the quiz.",
        primaryGroup: grp("Start Here", "kickTheHabitB2C"),
        whyThisFits: "Your answers didn't point sharply at one gap — so committing to a full program right now would be guessing. Kick the Habit is short, free, and finishable in a week. It gives you a real win and surfaces what actually trips you up, so the next time you take the quiz the signal is clearer. The free Starting Points are there if you want to sample other terrains.",
        groups: [
          grp("Free Starting Points", "stoicLeaderFieldGuide", "fiftyTwoStoicism", "burnoutResources", "stracticalMini"),
        ],
        whatComesNext: "Retake the P.A.T.H. Finder in 60 to 90 days once you have more signal. Or reach out directly. Sometimes the right starting point is a conversation, not a quiz.",
      };
  }
}

// Per-result-type metadata for narrowed results: plain-English topic area shown
// in the "we also offer additional sessions in {topic}" note, plus the contact
// form prefill (scope + interests) used by the "Contact Us to Learn More" CTA.
const B2B_RESULT_META: Record<B2BResultType, { topicArea: string; scope: string; interests: string[] }> = {
  "RT-A": { topicArea: "Team Dynamics & People",         scope: "Team / Department", interests: ["workshops"] },
  "RT-B": { topicArea: "Change & Transformation",        scope: "Company",           interests: ["workshops"] },
  "RT-C": { topicArea: "Leadership Capability",          scope: "Team / Department", interests: ["workshops"] },
  "RT-D": { topicArea: "Strategic / Architectural Work", scope: "Company",           interests: ["blue-door", "strategic-partnership"] },
  "RT-E": { topicArea: "Organizational Development",     scope: "Team / Department", interests: ["workshops"] },
};

function b2bResult(rt: B2BResultType, answers: Answers, strongest: "workshop" | "blueDoor" | "equal", opts?: BuildResultOptions): QuizResult {
  const blueDoorOff = O.blueDoor;

  // Secondary-signal flags (any branch)
  const sec = [...vals(answers, "Q3Team"), ...vals(answers, "Q3Change"), ...vals(answers, "Q3Cap"), ...vals(answers, "Q2Strategic")];
  const commOn = sec.includes("comm");
  const resOn = sec.includes("resilience");

  // Crossover note for Cap
  const crossover = (val(answers, "Q1Cap") === "B" && val(answers, "Q2Cap") === "C")
    ? "Your situation also includes an individual-leader development thread. The Stractical Leader Lab (AMPLIFY, individual track) is built for exactly that strategic-tactical integration work. Have those individual leaders take the P.A.T.H. Finder on their own track."
    : undefined;

  let headline = "", narrative = "", primaryHeading = "", primaryKeys: OfferingKey[] = [], whyThisFits = "";
  const extra: RecommendationGroup[] = [];

  if (rt === "RT-A") {
    headline = "Team & People";
    narrative = "Your responses point clearly to the team. Not the strategy, not the systems — the people dynamics underneath the work. Whether it's conflict that keeps surfacing, collaboration that's harder than it should be, or team patterns that are costing more than you want to admit, this is addressable. A workshop is a strong starting point. The Blue Door Organizational Appraisal is the prerequisite for any deeper, multi-team engagement and gives you the architecture map before you commit.";
    primaryHeading = "Team Dynamics — Conflict, Friction, and Collaboration";
    primaryKeys = ["masterYourMessageB2B", "radicalMindfulnessB2B", "stoicismB2B"];
    whyThisFits = "Your signal is people dynamics, not strategy or systems — so we picked workshops that work directly on the team-level behaviors driving the friction. Master Your Message addresses how people talk to each other (the most common source of repeat conflict). Radical Mindfulness installs the self-awareness teams need to stop reacting and start responding. Stoicism gives a shared operating system for handling disagreement well. Blue Door is the prerequisite when you're ready to address what's underneath those dynamics structurally.";
  } else if (rt === "RT-B") {
    headline = "Change & Transformation";
    narrative = "Your organization is moving through something significant, or about to. The question isn't whether the change is necessary, but whether your leaders and your organization have the architecture to carry it. A workshop can get traction quickly. The Blue Door Organizational Appraisal is the prerequisite for any deeper engagement and surfaces the structural readiness gaps a workshop alone won't address.";
    primaryHeading = "Change Leadership — Frameworks for Leading Transformation";
    primaryKeys = ["pathToLastingChange", "architectureOfOrganizationalShift", "cultivatingChangeResilience"];
    whyThisFits = "Your signal is active or imminent change — so we picked the three workshops that give your leaders the frameworks change actually requires. The P.A.T.H.™ to Lasting Change is the end-to-end method (Prepare, Align, Take Off, Habit). Architecture of Organizational ShIFt builds the structural lens for what holds and what breaks. Cultivating Change Resilience addresses the human cost of sustained change. Blue Door surfaces the readiness gaps a workshop alone will paper over.";
  } else if (rt === "RT-C") {
    headline = "Leadership Capability";
    narrative = "The challenge you're describing is a capability gap. Your leaders need to develop, and you need a way to build that capacity that actually holds rather than fades after the training day ends. A workshop is a good first move. The Blue Door Organizational Appraisal is the prerequisite for any deeper engagement and shows you which capabilities the architecture is quietly blocking.";
    primaryHeading = "Leadership Capability — How Leaders Show Up";
    primaryKeys = ["leadershipOM", "stracticalLeader", "architectureOfOrganizationalShift"];
    whyThisFits = "Your signal is leadership capability — how your leaders actually show up. So we picked workshops that target the three biggest gaps we see: a clear operating model for leadership (Leadership OM), the strategy-to-tactics translation most leaders struggle with (Stractical Leader), and the structural lens that separates leaders who build durability from leaders who only manage activity (Architecture of Organizational ShIFt). Blue Door shows which of those gaps your architecture is quietly creating.";
  } else if (rt === "RT-D") {
    headline = "Strategic / Architectural";
    narrative = "What you're describing isn't a program gap or training need. It's an architectural question: whether your organization's current identity is built to carry what you're trying to create. The Blue Door Organizational Appraisal is where organizations at strategic inflection points begin, and it's the prerequisite for any deeper engagement with us.";
    primaryHeading = "Workshops — Activate Your Team While the Appraisal Work Is Underway";
    primaryKeys = ["architectChange", "architectureOfOrganizationalShift", "pathToLastingChange"];
    whyThisFits = "Your signal is architectural — which is why Blue Door is the real next step, not a workshop. The workshops we picked are the ones that activate your team in parallel with that appraisal work, so momentum doesn't stall: Architect Change builds the design discipline, Architecture of Organizational ShIFt gives leaders the structural lens, and the P.A.T.H.™ to Lasting Change gives the org a shared method. None of them replace the appraisal — they make the most of the time it takes.";
  } else {
    // RT-E
    headline = "Exploring Your Options";
    narrative = "You're in the right place even if you're not sure exactly what you need yet. Organizational development rarely announces itself with a clear brief. Start with a defined experience that gives your team traction and a shared framework. When you're ready to go deeper, the Blue Door Organizational Appraisal is the prerequisite for any larger engagement and the fastest way to see your architecture clearly.";
    primaryHeading = "Workshops to Start With";
    primaryKeys = ["pathToLastingChange", "architectureOfOrganizationalShift", "leadershipOM"];
    whyThisFits = "You don't have a sharp signal yet — so committing to a deep engagement now would be guessing. The workshops we picked are the three highest-leverage starting points across most organizations: a shared change method (P.A.T.H.™ to Lasting Change), a structural lens (Architecture of Organizational ShIFt), and a leadership operating model (Leadership OM). Any of them gives your team traction and surfaces which signal is actually loudest. Blue Door is there when that signal sharpens.";
  }

  // `extra` and secondary-signal flags are intentionally not surfaced —
  // we keep results narrow.
  void extra; void commOn; void resOn;

  // Eligibility is admin-driven: the dialog passes the set of offering keys
  // that are Live AND have a URL or anchor configured in
  // /admin/path-finder-offerings. We narrow primary picks to that set,
  // falling back gracefully so a result never goes blank.
  const viewable = opts?.viewableKeys;
  const filterable = viewable && viewable.size > 0 ? viewable : null;
  const filteredPrimary = filterable
    ? (primaryKeys.filter((k) => filterable.has(k)) as OfferingKey[])
    : primaryKeys;
  const safeFallback = (filterable
    ? SAFE_B2B_FALLBACK.filter((k) => filterable.has(k))
    : SAFE_B2B_FALLBACK) as OfferingKey[];
  const usableKeys = filteredPrimary.length > 0
    ? filteredPrimary
    : safeFallback.length > 0
      ? safeFallback
      : primaryKeys;
  const trimmedPrimary = usableKeys.slice(0, 3);

  // Speaking-topic candidates per RT. Only surfaced when admin has marked the
  // row Live + clickable; otherwise the group disappears entirely.
  // Admin RT-pool overrides (from path_finder_offerings.b2b_rt_pools) win over the constant.
  const speakingCandidates = opts?.rtPools?.[rt]?.speaking ?? SPEAKING_BY_RT[rt] ?? [];
  const eligibleSpeaking = (filterable
    ? speakingCandidates.filter((k) => filterable.has(k))
    : speakingCandidates).slice(0, 3) as OfferingKey[];

  const strongestNextStep =
    strongest === "blueDoor"
      ? { kind: "blueDoor" as const, offering: blueDoorOff, label: "Strongest Next Step — The Blue Door" }
      : strongest === "workshop"
        ? { kind: "workshop" as const, offering: O[trimmedPrimary[0]], label: "Strongest Next Step — Workshop" }
        : undefined;

  const meta = B2B_RESULT_META[rt];

  const groups: RecommendationGroup[] = [
    grp("Deeper Option — Blue Door Organizational Appraisal", "blueDoor"),
  ];
  if (eligibleSpeaking.length > 0) {
    groups.push(grp("Speaking Topics — Bookable Keynotes", ...eligibleSpeaking));
  }

  // Free Resources — up to 2, filtered to admin-eligible rows.
  // Admin RT-pool overrides win over the constant.
  const freeCandidates = opts?.rtPools?.[rt]?.free ?? FREE_RESOURCES_BY_RT[rt] ?? [];
  const eligibleFree = (filterable
    ? freeCandidates.filter((k) => filterable.has(k))
    : freeCandidates).slice(0, 2) as OfferingKey[];
  if (eligibleFree.length > 0) {
    groups.push(grp("Free Resources to Start Today", ...eligibleFree));
  }

  return {
    track: "b2b",
    resultType: rt,
    headline,
    subhead: rt === "RT-D" ? "Blue Door™ Primary | Workshops Alongside" : "Workshops | Blue Door™",
    narrative,
    whyThisFits,
    primaryGroup: grp(primaryHeading, ...trimmedPrimary),
    groups,
    strongestNextStep,
    crossoverNote: crossover,
    topicArea: meta?.topicArea,
    contactPrefill: meta ? { scope: meta.scope, interests: meta.interests } : undefined,
    whatComesNext: rt === "RT-D"
      ? "Blue Door produces your P.A.T.H. Compass — the organizational roadmap that informs everything that follows. From there, qualified organizations move to Architect Change and then into AMPLIFY or EMBODY partnership."
      : "A workshop is a powerful starting point. Organizations that go deeper often find the work surfaces something more structural that a single workshop addresses symptomatically but not architecturally. The Blue Door is there when you're ready for that conversation.",
  };
}

// Replace any B2C group whose heading starts with "Free " using the admin RT-pool
// override. Filtering against viewable keys happens later via applyViewableFilter.
function applyB2cFreePoolOverride(r: QuizResult, rt: B2CResultType, opts?: BuildResultOptions): QuizResult {
  const overrideKeys = opts?.rtPools?.[rt]?.free;
  if (!overrideKeys || overrideKeys.length === 0) return r;
  const newGroups = r.groups.map((g) =>
    /^Free\b/i.test(g.heading)
      ? { ...g, offerings: overrideKeys.map((k) => O[k]).filter(Boolean) }
      : g
  );
  return { ...r, groups: newGroups };
}

// Pin admin-featured offerings to position 1 of the primary group, when they
// already appear there. Stable for everything else.
function applyFeaturedPin(r: QuizResult, opts?: BuildResultOptions): QuizResult {
  const featured = opts?.featuredKeys;
  if (!featured || featured.size === 0 || !r.primaryGroup) return r;
  const offerings = r.primaryGroup.offerings;
  const pinIdx = offerings.findIndex((o) => featured.has(o.key));
  if (pinIdx <= 0) return r;
  const reordered = [offerings[pinIdx], ...offerings.slice(0, pinIdx), ...offerings.slice(pinIdx + 1)];
  return { ...r, primaryGroup: { ...r.primaryGroup, offerings: reordered } };
}

export function buildResult(track: Track, answers: Answers, opts?: BuildResultOptions): QuizResult {
  if (track === "b2c") {
    const { resultType } = scoreB2C(answers);
    const base = applyB2cFreePoolOverride(b2cResult(resultType, answers), resultType, opts);
    // Post-process to drop offerings the admin hasn't marked clickable.
    // For B2C the primary group falls back to a safe default if filtered empty.
    const filtered = applyViewableFilter(base, opts?.viewableKeys);
    if (filtered.primaryGroup && filtered.primaryGroup.offerings.length === 0 && opts?.viewableKeys) {
      const safe = SAFE_B2C_FALLBACK.filter((k) => opts.viewableKeys!.has(k)) as OfferingKey[];
      if (safe.length > 0) {
        filtered.primaryGroup = grp(filtered.primaryGroup.heading, ...safe);
      }
    }
    return applyFeaturedPin(filtered, opts);
  }
  const { resultType, strongest } = scoreB2B(answers);
  return applyFeaturedPin(b2bResult(resultType, answers, strongest, opts), opts);
}

