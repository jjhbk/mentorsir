// ─── Form Option Arrays ────────────────────────────────────────────────────

export const MEDIUM_OPTIONS = ["English", "Hindi", "Other"] as const;

export const GRADUATION_STREAMS = [
  "Arts / Humanities",
  "Commerce",
  "Engineering",
  "Law",
  "Medical",
  "Science",
  "Other",
] as const;

export const PRELIMS_EXPERIENCE_OPTIONS = [
  "Preparing for Prelims 2026 – First attempt",
  "Appeared in Prelims earlier but did not clear",
  "Cleared Prelims earlier (now preparing again)",
  "Preparing for Prelims 2027 – First Attempt",
] as const;

export const GS_SCORE_BANDS = [
  "NA (First attempt / never appeared)",
  "Below 60",
  "60–75",
  "75–85",
  "85+",
] as const;

export const GS_SUBJECTS = [
  "Polity",
  "Economy",
  "History",
  "Geography",
  "Environment",
  "Science & Tech",
  "Current Affairs (with static linkage)",
] as const;

export const CA_SOURCE_OPTIONS = [
  "Monthly magazine",
  "Newspaper + notes",
  "Coaching notes",
  "Multiple sources but inconsistent",
  "Not following regularly",
] as const;

export const CSAT_AREAS = [
  "Quantitative Aptitude (Maths)",
  "Comprehension (English)",
  "Reasoning / Data Interpretation",
] as const;

export const CSAT_SCORE_BANDS = [
  "NA / Never tested seriously",
  "Weak / Fear of CSAT (Below 60)",
  "Borderline (65–80)",
  "Confident (80+ in mocks)",
] as const;

export const MOCK_FREQUENCY_OPTIONS = ["Regularly", "Sometimes", "Never"] as const;

export const TEST_ANALYSIS_OPTIONS = [
  "Full analysis",
  "Partial analysis",
  "Just check score",
] as const;

export const WRONG_Q_REVISION_OPTIONS = [
  "Yes, regularly",
  "Sometimes",
  "Rarely",
  "Never",
] as const;

export const PYQ_PRACTICE_OPTIONS = [
  "Yes, multiple times under time limit",
  "Yes, but not strictly timed",
  "Solved (topic-wise)",
  "Never solved PYQs seriously",
] as const;

export const PLAN_CONSISTENCY_OPTIONS = [
  "Yes, consistently",
  "Irregular",
  "No clear plan",
] as const;

export const DAILY_STUDY_HOURS_OPTIONS = [
  "Less than 4 hours",
  "4–6 hours",
  "6–8 hours",
  "8+ hours",
] as const;

export const REVISION_COUNT_OPTIONS = [
  "0–1 time",
  "2 times",
  "3 times",
  "4+ times",
  "Not sure / No structured revision",
] as const;

export const SOURCES_PER_SUBJECT_OPTIONS = [
  "1 primary source",
  "2 sources",
  "3 sources",
  "4 or more sources",
  "I keep changing sources",
] as const;

export const CORE_CHALLENGES = [
  "Low accuracy",
  "Excessive guesswork",
  "Poor elimination skills",
  "Silly mistakes",
  "Information overload",
  "Poor revision",
  "Anxiety during exam",
] as const;

export const MENTORSHIP_EXPECTATIONS = [
  "GS + CSAT test series",
  "Test analysis & mistake tracking",
  "Elimination & smart guessing techniques",
  "Accountability & discipline",
  "Motivation & emotional support",
  "Structured daily targets",
] as const;

export const DISCOVERY_PLATFORMS = [
  "Youtube",
  "Telegram",
  "Instagram",
  "Friends/Student Referral",
  "Google Search / Website",
  "Other",
] as const;

// ─── Mentor Data ───────────────────────────────────────────────────────────

export const MENTORS = [
  {
    name: "Abhishek Tiwari",
    credentials: "2 UPSC Interviews · IIM NIT · TEDx Speaker",
    role: "GS + CSAT Mentor",
    subjects: ["GS", "CSAT", "Strategy"],
    bio: "Brings the mindset of a two-time interview candidate and the clarity of an IIM graduate to help students cut through noise and focus on what matters.",
  },
  {
    name: "Abhishek Goswami",
    credentials: "118+ in Prelims · 3 CSE + 2 IFoS Mains",
    role: "GS Faculty & MCQ Strategy",
    subjects: ["GS", "MCQ Techniques", "PYQ Analysis"],
    bio: "Scored 118+ in Prelims — one of the highest scores among active coaches. Teaches smart MCQ solving backed by deep PYQ pattern analysis.",
  },
  {
    name: "Rohit Patel",
    credentials: "IIT Roorkee · CSE & IFoS Mains · Certified Counsellor",
    role: "UPSC Strategy + Psychological Support",
    subjects: ["Strategy", "Mindset", "CSAT"],
    bio: "An IIT Roorkee alumnus and certified counsellor who combines strategic UPSC guidance with exam-stress management to keep students confident and focused.",
  },
] as const;

// ─── Pricing ───────────────────────────────────────────────────────────────

export const PRICING = {
  original: 24997,
  returning: 5999,
  new: 6999,
  discount: 72,
  modules: [
    { name: "GS with Test Series", price: 10999 },
    { name: "CSAT", price: 7999 },
    { name: "Current Affairs", price: 5999 },
  ],
} as const;

// ─── Program Pillars ────────────────────────────────────────────────────────

export const PILLARS = [
  {
    id: "gs",
    icon: "📚",
    title: "General Studies",
    subtitle: "PYQ-first · Concept-driven · Exam-oriented",
    points: [
      "PYQ-first, concept-driven coverage of all GS subjects",
      "Static + current integration with examiner's mindset",
      "Daily & weekly MCQs with detailed option-wise explanations",
      "Mentor Connect sessions for smart MCQ solving",
    ],
  },
  {
    id: "csat",
    icon: "🧮",
    title: "CSAT",
    subtitle: "No fear · Clear strategy · Consistent practice",
    points: [
      "Taught by IIT & IIM graduate faculty",
      "Step-by-step aptitude, reasoning & comprehension",
      "Special support for non-maths background students",
      "PYQ-based practice & exam-hall question selection strategy",
    ],
  },
  {
    id: "ca",
    icon: "🗞️",
    title: "Current Affairs",
    subtitle: "Relevant · Linked · Limited",
    points: [
      "1.5 years Prelims-oriented current affairs coverage",
      "Monthly + thematic linkage with static GS topics",
      "Clear focus on what to read & what to skip",
      "Concise notes, MCQs & structured revision plans",
    ],
  },
] as const;

// ─── Mentorship Features ───────────────────────────────────────────────────

export const MENTORSHIP_FEATURES = [
  {
    icon: "🗺️",
    title: "Personal Study Planning",
    desc: "Custom study plan built on your intake profile — your subjects, your schedule, your pace.",
  },
  {
    icon: "📊",
    title: "Performance Review & Course Correction",
    desc: "Regular test analysis sessions to identify patterns in your mistakes and fix them before exam day.",
  },
  {
    icon: "🧠",
    title: "Exam Stress & Mindset Counselling",
    desc: "Rohit Sir (IIT Roorkee + certified counsellor) guides you through mental blocks and exam anxiety.",
  },
  {
    icon: "🎯",
    title: "Accountability & Honest Feedback",
    desc: "No sugar-coating — you get direct feedback on what's working and what needs to change.",
  },
] as const;

// ─── Problem / Solution ────────────────────────────────────────────────────

export const PROBLEMS = [
  "Generic content with no personalisation",
  "No one tracking your actual study hours",
  "Skipped tests with zero follow-up",
  "Inflated claims about past results",
  "Nowhere to share exam anxiety honestly",
  "No structured revision or mistake analysis",
] as const;

export const SOLUTIONS = [
  "Mentorship built on your intake profile & weak areas",
  "Daily accountability log reviewed by your mentor",
  "Automated test participation tracking + alerts",
  "Transparent track record — no inflated numbers",
  "Safe space for psych support with a certified counsellor",
  "8-category mistake tracker to eliminate repeat errors",
] as const;

// ─── FAQ ──────────────────────────────────────────────────────────────────

export const FAQS = [
  {
    q: "Is PTP 2.0 suitable for first-time UPSC aspirants?",
    a: "Yes. The program is designed for both first-timers and repeat aspirants. The intake form helps us understand your baseline, and the mentorship is personalised accordingly.",
  },
  {
    q: "What if I have a non-maths background and fear CSAT?",
    a: "CSAT is taught step-by-step by IIT & IIM graduates who specialise in making it accessible to non-maths students. We have a dedicated track for building confidence from scratch.",
  },
  {
    q: "I work a job. Can I manage PTP 2.0 alongside it?",
    a: "Yes. During intake, you tell us your daily study hours and we build a schedule around them. The minimum recommended time is 4 hours per day, but we adapt.",
  },
  {
    q: "What does the weekly schedule look like?",
    a: "Typically: Mon–Fri subject study + daily CSAT, Thursday CA test, Friday sectional test (GS+CSAT), Sunday live Mentor Connect session. All tracked in the app.",
  },
  {
    q: "How is this different from just buying a test series?",
    a: "A test series gives you questions. PTP 2.0 gives you a mentor who tracks your mistakes across 8 categories, spots patterns, and corrects your approach before the exam.",
  },
  {
    q: "What is the refund policy?",
    a: "We offer a 7-day refund window from the date of enrollment if you feel the program is not right for you. Contact us via the WhatsApp group to initiate.",
  },
  {
    q: "Will I get access to recorded lectures?",
    a: "Yes. The program includes lecture access for GS, CSAT, and Current Affairs along with PDF notes, MCQ sets, and PYQ booklets.",
  },
  {
    q: "What language is the content delivered in?",
    a: "Content is available in both English and Hindi. During enrollment, you select your preferred medium and all guidance, notes, and sessions are adapted accordingly.",
  },
] as const;

// ─── Step Labels ────────────────────────────────────────────────────────────

export const STEP_LABELS = [
  "Basic Info",
  "Prelims Background",
  "Subject Comfort",
  "Test & Study Habits",
  "Challenges & Goals",
  "Review & Pay",
] as const;
