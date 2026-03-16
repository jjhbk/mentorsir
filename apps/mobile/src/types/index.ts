export type UserRole = 'student' | 'mentor';
export type StudentStatus = 'on-track' | 'at-risk' | 'inactive';
export type TaskCompletion = 'yes' | 'no' | 'partial';

export interface DailyLog {
  date: string; // YYYY-MM-DD
  studyHours: number;
  sleepHours: number;
  meditationMinutes: number;
  sleepTime: string;
  wakeTime: string;
  taskCompleted: TaskCompletion;
  afternoonNapMinutes: number;
  hadMentorDiscussion: boolean;
  relaxationActivity: string;
}

export interface ScheduleEntry {
  id: string;
  date: string; // YYYY-MM-DD
  subject: string;
  syllabus: string;
  primarySource: string;
  completed: boolean;
  revision1: boolean;
  revision2: boolean;
  revision3: boolean;
  entryType: 'study' | 'ca-test' | 'sectional-test' | 'mentor-connect';
}

export interface MistakeBreakdown {
  conceptual: number;
  recall: number;
  reading: number;
  elimination: number;
  decisionMaking: number;
  silly: number;
  psychological: number;
  patternMisjudgment: number;
}

export interface TestResult {
  id: string;
  testName: string;
  date: string; // YYYY-MM-DD
  score: number;
  totalQuestions: number;
  mistakes: MistakeBreakdown;
}

export interface StudentProfile {
  id: string;
  name: string;
  mobile: string;
  email: string;
  medium: string;
  graduationStream: string;
  prelimsExperience: string;
  attemptCount: number;
  gsScoreBand: string;
  strongGSSubjects: string[];
  weakGSSubjects: string[];
  csatStrongArea: string;
  csatWeakArea: string;
  csatScoreBand: string;
  dailyStudyHoursTarget: string;
  coreChallenges: string[];
  // Mentor-filled audit
  strongAcademicSubjects: string[];
  weakAcademicSubjects: string[];
  strongPersonalityTraits: string[];
  weakPersonalityTraits: string[];
}

// Navigation param types
export type RootStackParamList = {
  RoleSelect: undefined;
  StudentTabs: undefined;
  MentorTabs: undefined;
};

export type StudentTabParamList = {
  Today: undefined;
  Schedule: undefined;
  Tests: undefined;
  Me: undefined;
};

export type MentorTabParamList = {
  Dashboard: undefined;
  Students: undefined;
  Alerts: undefined;
};

export type MentorStudentsStackParamList = {
  StudentsList: undefined;
  StudentDetail: { studentId: string };
};
