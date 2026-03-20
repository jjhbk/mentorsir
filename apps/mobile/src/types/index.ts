export type UserRole = 'student' | 'mentor' | 'admin';
export type StudentStatus = 'on-track' | 'at-risk' | 'inactive';
export type TaskCompletion = 'yes' | 'no' | 'partial';

export interface DailyLog {
  date: string;
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
  date: string;
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
  date: string;
  score: number;
  totalQuestions: number;
  mistakes: MistakeBreakdown;
}

export interface StudySession {
  id: string;
  subject: 'polity' | 'geography' | 'economy' | 'csat' | 'prelims' | 'mains' | 'interview';
  status: 'active' | 'paused' | 'completed';
  startedAt: string;
  segmentStartedAt: string | null;
  accumulatedSeconds: number;
  endedAt: string | null;
}

export interface YearlyPlanEntry {
  id: string;
  month: string;
  subject1: string;
  subject2: string;
  subject3: string;
  notes: string;
  isLocked: boolean;
  studentEditRequestPending: boolean;
  studentEditRequestNote: string;
}

export interface MeetingEntry {
  id: string;
  mentorId: string;
  studentId: string;
  scheduledAt: string;
  status: 'pending' | 'approved' | 'rejected';
  mode: string;
  meetingLink: string;
  agenda: string;
  studentNotes: string;
  mentorNotes: string;
  rejectionReason: string;
  studentName: string | null;
  mentorName: string | null;
}

export interface ChatPeer {
  id: string;
  name: string | null;
  mobile: string | null;
  telegramId: string | null;
  kind: 'mentor' | 'student';
}

export interface ChatMessage {
  id: string;
  mentorId: string;
  studentId: string;
  senderId: string;
  message: string;
  createdAt: string;
}

export interface GroupMessage {
  id: string;
  mentorId: string;
  senderId: string;
  senderName: string | null;
  message: string;
  createdAt: string;
}

export interface ResourceMappingValue {
  id: string;
  rowKey: string;
  resource: string;
  prelimsPyqPractice: string;
  prelimsTestSeries: string;
  mainsPyq: string;
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
  strongAcademicSubjects: string[];
  weakAcademicSubjects: string[];
  strongPersonalityTraits: string[];
  weakPersonalityTraits: string[];
}

export type RootStackParamList = {
  RoleSelect: undefined;
  StudentTabs: undefined;
  MentorTabs: undefined;
  AdminTabs: undefined;
};

export type StudentTabParamList = {
  Today: undefined;
  Schedule: undefined;
  Tests: undefined;
  Connect: undefined;
  Me: undefined;
};

export type MentorTabParamList = {
  Dashboard: undefined;
  Students: undefined;
  Tools: undefined;
  Connect: undefined;
};

export type MentorDashboardStackParamList = {
  MentorHome: undefined;
  Alerts: undefined;
};

export type AdminTabParamList = {
  Overview: undefined;
  Mentors: undefined;
  Students: undefined;
  Settings: undefined;
};

export type MentorStudentsStackParamList = {
  StudentsList: undefined;
  StudentDetail: { studentId: string };
};
