import { z } from "zod";

export const intakeFormSchema = z.object({
  // Step 1 — Basic Info
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().email("Enter a valid email address"),
  medium: z.enum(["English", "Hindi", "Other"], {
    required_error: "Please select your medium",
  }),
  graduationStream: z.enum(
    [
      "Arts / Humanities",
      "Commerce",
      "Engineering",
      "Law",
      "Medical",
      "Science",
      "Other",
    ],
    { required_error: "Please select your graduation stream" }
  ),
  notes: z.string().optional(),

  // Step 2 — Prelims Background
  prelimsExperience: z.enum(
    [
      "Preparing for Prelims 2026 – First attempt",
      "Appeared in Prelims earlier but did not clear",
      "Cleared Prelims earlier (now preparing again)",
      "Preparing for Prelims 2027 – First Attempt",
    ],
    { required_error: "Please select your Prelims experience" }
  ),
  attemptCount: z.coerce
    .number()
    .min(0, "Cannot be negative")
    .max(20, "Please enter a realistic number"),
  gsScoreBand: z.enum(
    [
      "NA (First attempt / never appeared)",
      "Below 60",
      "60–75",
      "75–85",
      "85+",
    ],
    { required_error: "Please select your GS score band" }
  ),
  personalDifficulties: z.string().optional(),

  // Step 3 — Subject Comfort
  strongGSSubjects: z
    .array(z.string())
    .min(1, "Select at least one strong subject"),
  weakGSSubjects: z.array(z.string()).min(1, "Select at least one weak subject"),
  currentAffairsSource: z.enum(
    [
      "Monthly magazine",
      "Newspaper + notes",
      "Coaching notes",
      "Multiple sources but inconsistent",
      "Not following regularly",
    ],
    { required_error: "Please select your CA source" }
  ),
  csatStrongArea: z.enum(
    [
      "Quantitative Aptitude (Maths)",
      "Comprehension (English)",
      "Reasoning / Data Interpretation",
    ],
    { required_error: "Please select your CSAT strong area" }
  ),
  csatWeakArea: z.enum(
    [
      "Quantitative Aptitude (Maths)",
      "Comprehension (English)",
      "Reasoning / Data Interpretation",
    ],
    { required_error: "Please select your CSAT weak area" }
  ),
  csatScoreBand: z.enum(
    [
      "NA / Never tested seriously",
      "Weak / Fear of CSAT (Below 60)",
      "Borderline (65–80)",
      "Confident (80+ in mocks)",
    ],
    { required_error: "Please select your CSAT score band" }
  ),

  // Step 4 — Test & Study Habits
  mockFrequency: z.enum(["Regularly", "Sometimes", "Never"], {
    required_error: "Please select your mock frequency",
  }),
  testAnalysis: z.enum(["Full analysis", "Partial analysis", "Just check score"], {
    required_error: "Please select your test analysis approach",
  }),
  wrongQuestionRevision: z.enum(
    ["Yes, regularly", "Sometimes", "Rarely", "Never"],
    { required_error: "Please select your revision habit" }
  ),
  pyqPractice: z.enum(
    [
      "Yes, multiple times under time limit",
      "Yes, but not strictly timed",
      "Solved (topic-wise)",
      "Never solved PYQs seriously",
    ],
    { required_error: "Please select your PYQ practice style" }
  ),
  planConsistency: z.enum(["Yes, consistently", "Irregular", "No clear plan"], {
    required_error: "Please select your plan consistency",
  }),
  dailyStudyHours: z.enum(
    ["Less than 4 hours", "4–6 hours", "6–8 hours", "8+ hours"],
    { required_error: "Please select your daily study hours" }
  ),
  revisionCount: z.enum(
    [
      "0–1 time",
      "2 times",
      "3 times",
      "4+ times",
      "Not sure / No structured revision",
    ],
    { required_error: "Please select revision count" }
  ),
  sourcesPerSubject: z.enum(
    [
      "1 primary source",
      "2 sources",
      "3 sources",
      "4 or more sources",
      "I keep changing sources",
    ],
    { required_error: "Please select sources per subject" }
  ),

  // Step 5 — Challenges & Expectations
  coreChallenges: z
    .array(z.string())
    .min(1, "Select at least one challenge"),
  mentorshipExpectations: z
    .array(z.string())
    .min(1, "Select at least one expectation")
    .max(3, "Select up to 3 expectations"),
  discoveryPlatform: z.enum(
    [
      "Youtube",
      "Telegram",
      "Instagram",
      "Friends/Student Referral",
      "Google Search / Website",
      "Other",
    ],
    { required_error: "Please tell us how you found us" }
  ),
});

export type IntakeFormData = z.infer<typeof intakeFormSchema>;

// Step field mapping for per-step validation
export const STEP_FIELDS: Record<number, (keyof IntakeFormData)[]> = {
  1: ["fullName", "mobile", "email", "medium", "graduationStream"],
  2: ["prelimsExperience", "attemptCount", "gsScoreBand"],
  3: [
    "strongGSSubjects",
    "weakGSSubjects",
    "currentAffairsSource",
    "csatStrongArea",
    "csatWeakArea",
    "csatScoreBand",
  ],
  4: [
    "mockFrequency",
    "testAnalysis",
    "wrongQuestionRevision",
    "pyqPractice",
    "planConsistency",
    "dailyStudyHours",
    "revisionCount",
    "sourcesPerSubject",
  ],
  5: ["coreChallenges", "mentorshipExpectations", "discoveryPlatform"],
  6: [],
};
