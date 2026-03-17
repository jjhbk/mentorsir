import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { autoAssignMentorIfMissing } from "@/lib/mentorAssignment";
import {
  MAINS_TEST_SERIES,
  OPTIONAL_SUBJECT_OPTIONS,
  PRELIMS_PYQ_OPTIONS,
  PRELIMS_TEST_SERIES_OPTIONS,
  RESOURCE_OPTIONS_BY_ROW,
  RESOURCE_MAPPING_TEMPLATE,
} from "@/lib/resourceMappingTemplate";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";
import StudyTimerPanel from "@/components/dashboard/StudyTimerPanel";
import MeetingNotesEditor from "@/components/dashboard/MeetingNotesEditor";
import {
  DailySubmissionsList,
  TestSubmissionsList,
} from "@/components/dashboard/MentorSubmissionsList";

interface Profile {
  role: "student" | "mentor";
  name: string | null;
}

interface ProfileWithMentorId extends Profile {
  mentor_id: string | null;
  mobile: string | null;
  telegram_id: string | null;
  telegram_group_link: string | null;
  whatsapp_group_link: string | null;
}

interface MentorSummary {
  id: string;
  name: string | null;
  mobile: string | null;
  telegramId: string | null;
}

interface MentorRequestRecord {
  id: string;
  userId: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
}

interface ContactSubmissionRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: Date;
}

interface PlanSubscriptionRecord {
  id: string;
  userId: string;
  planCode: "ptp_3m" | "mtp_2_3m";
  planName: string;
  amountInr: number;
  active: boolean;
  createdAt: Date;
}

interface MentorProfileRecord {
  id: string;
  name: string | null;
  mobile: string | null;
  telegramId: string | null;
}

interface StudentMentorAssignmentRecord {
  id: string;
  name: string | null;
  mobile: string | null;
  telegramId: string | null;
  mentorId: string | null;
  mentorName: string | null;
}

interface StudentTodayLogRecord {
  studyHours: number;
  sleepHours: number;
  meditationMinutes: number;
  sleepTime: string | null;
  wakeTime: string | null;
  afternoonNapMinutes: number;
  reasonNotStudying: string | null;
  feelingToday: string | null;
  relaxationActivity: string | null;
  taskCompleted: "yes" | "no" | "partial" | null;
}

interface StudentScheduleRecord {
  id: string;
  subject: string | null;
  syllabus: string | null;
  date: string;
}

interface StudentTestRecord {
  id: string;
  testName: string;
  date: string;
  score: number | null;
  totalQuestions: number | null;
  mistakeConceptual: number;
  mistakeRecall: number;
  mistakeReading: number;
  mistakeElimination: number;
  mistakeDecisionMaking: number;
  mistakeSilly: number;
  mistakePsychological: number;
  mistakePatternMisjudgment: number;
}

interface StudySessionRecord {
  id: string;
  subject: "polity" | "geography" | "economy" | "csat" | "prelims" | "mains" | "interview";
  status: "active" | "paused" | "completed";
  startedAt: string;
  segmentStartedAt: string | null;
  accumulatedSeconds: number;
  endedAt: string | null;
}

interface StudentDailyHistoryRecord {
  id: string;
  date: string;
  studyHours: number;
  sleepHours: number;
  meditationMinutes: number;
  sleepTime: string | null;
  wakeTime: string | null;
  afternoonNapMinutes: number;
  reasonNotStudying: string | null;
  feelingToday: string | null;
  relaxationActivity: string | null;
  taskCompleted: "yes" | "no" | "partial" | null;
}

interface YearlyPlanRecord {
  id: string;
  month: string;
  subject1: string | null;
  subject2: string | null;
  subject3: string | null;
  notes: string | null;
  isLocked: boolean;
  studentEditRequestPending: boolean;
  studentEditRequestNote: string | null;
}

interface AlternateScheduleRecord {
  id: string;
  date: string;
  focus: string | null;
  note: string | null;
}

interface StudentAuditViewRecord {
  strongAcademicSubjects: string[];
  weakAcademicSubjects: string[];
  strongPersonalityTraits: string[];
  weakPersonalityTraits: string[];
}

interface MentorResourceViewRecord {
  ownerId?: string;
  rowKey: string;
  resource: string | null;
  prelimsPyqPractice: string | null;
  prelimsTestSeries: string | null;
  mainsPyq: string | null;
}

interface MentorStudentLogRecord {
  id: string;
  studentName: string | null;
  date: string;
  studyHours: number;
  sleepHours: number;
  meditationMinutes: number;
  sleepTime: string | null;
  wakeTime: string | null;
  afternoonNapMinutes: number;
  reasonNotStudying: string | null;
  feelingToday: string | null;
  relaxationActivity: string | null;
  taskCompleted: string | null;
}

interface MentorStudentTestRecord {
  id: string;
  studentName: string | null;
  testName: string;
  date: string;
  score: number | null;
  totalQuestions: number | null;
  mistakeConceptual: number;
  mistakeRecall: number;
  mistakeReading: number;
  mistakeElimination: number;
  mistakeDecisionMaking: number;
  mistakeSilly: number;
  mistakePsychological: number;
  mistakePatternMisjudgment: number;
}

interface MentorStudentPlanRecord {
  id: string;
  userId: string;
  studentName: string | null;
  month: string;
  subject1: string | null;
  subject2: string | null;
  subject3: string | null;
  notes: string | null;
  isLocked: boolean;
  studentEditRequestPending: boolean;
  studentEditRequestNote: string | null;
}

interface StudentMeetingRecord {
  id: string;
  scheduledAt: string;
  status: "pending" | "approved" | "rejected";
  mode: string | null;
  meetingLink: string | null;
  agenda: string | null;
  studentNotes: string | null;
  studentNotesAudioUrls: string[];
  rejectionReason: string | null;
}

interface MentorMeetingRecord {
  id: string;
  studentId: string;
  studentName: string | null;
  scheduledAt: string;
  status: "pending" | "approved" | "rejected";
  mode: string | null;
  meetingLink: string | null;
  agenda: string | null;
  mentorNotes: string | null;
  mentorNotesAudioUrls: string[];
  rejectionReason: string | null;
}

const RESOURCE_PAPER_ORDER = [
  "GS 1",
  "GS 2",
  "GS 3",
  "GS 4",
  "CSAT",
  "Optional",
  "Current Affairs",
] as const;

const RESOURCE_TEMPLATE_GROUPS = RESOURCE_PAPER_ORDER.map((paper) => ({
  paper,
  rows: RESOURCE_MAPPING_TEMPLATE.filter((row) => row.paper === paper),
})).filter((group) => group.rows.length > 0);

function groupTemplateRowsBySubject(rows: (typeof RESOURCE_MAPPING_TEMPLATE)[number][]) {
  const map = new Map<string, (typeof RESOURCE_MAPPING_TEMPLATE)[number][]>();
  rows.forEach((row) => {
    const list = map.get(row.subject) ?? [];
    list.push(row);
    map.set(row.subject, list);
  });
  return Array.from(map.entries()).map(([subject, subjectRows]) => ({
    subject,
    rows: subjectRows,
  }));
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-white/95 p-6 sm:p-7">
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MetricCell({
  label,
  value,
  unit,
  status,
}: {
  label: string;
  value: string;
  unit?: string;
  status?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">{label}</p>
      <p className="mt-2 font-display text-5xl font-bold tracking-tight text-text">
        {value}
        {unit && <span className="ml-1 text-xl font-medium text-text-muted">{unit}</span>}
      </p>
      {status && <p className="mt-2 text-xs text-text-muted">{status}</p>}
    </div>
  );
}

function SectionTag({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "student" | "mentor" | "shared";
  children: React.ReactNode;
}) {
  const toneClass =
    tone === "student"
      ? "bg-blue-100 text-blue-700"
      : tone === "mentor"
        ? "bg-amber-100 text-amber-700"
        : tone === "shared"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-surface-soft text-text-muted";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${toneClass}`}>
      {children}
    </span>
  );
}

function SectionLead({
  title,
  subtitle,
  tag,
  tone = "neutral",
}: {
  title: string;
  subtitle: string;
  tag?: string;
  tone?: "neutral" | "student" | "mentor" | "shared";
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
      <div>
        <h3 className="text-base font-semibold text-text">{title}</h3>
        <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
      </div>
      {tag ? <SectionTag tone={tone}>{tag}</SectionTag> : null}
    </div>
  );
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "-";
  if (Array.isArray(value)) return value.length ? value.join(", ") : "-";
  if (typeof value === "object") return JSON.stringify(value);
  const text = String(value);
  return text.trim() ? text : "-";
}

function StudyHoursHistoryGraph({
  points,
}: {
  points: Array<{ date: string; studyHours: number }>;
}) {
  const width = 760;
  const height = 220;
  const padding = 30;
  const maxY = Math.max(1, ...points.map((item) => item.studyHours));
  const denominator = Math.max(1, points.length - 1);

  const plotPoints = points.map((item, index) => {
    const x = padding + (index / denominator) * (width - padding * 2);
    const y = height - padding - (item.studyHours / maxY) * (height - padding * 2);
    return { ...item, x, y };
  });
  const polyline = plotPoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="mb-4 rounded-2xl border border-border bg-surface p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
        Study Hours Trend
      </p>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-56 min-w-[760px] w-full">
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d6d6d8" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d6d6d8" strokeWidth="1" />
          <polyline fill="none" stroke="#0ea5e9" strokeWidth="2.5" points={polyline} />
          {plotPoints.map((point) => (
            <g key={`${point.date}-${point.x}`}>
              <circle cx={point.x} cy={point.y} r="3.5" fill="#0ea5e9" />
              <text x={point.x} y={height - padding + 14} textAnchor="middle" fontSize="10" fill="#6b7280">
                {point.date.slice(5)}
              </text>
            </g>
          ))}
          <text x={padding - 8} y={padding + 4} textAnchor="end" fontSize="10" fill="#6b7280">
            {maxY}h
          </text>
          <text x={padding - 8} y={height - padding + 4} textAnchor="end" fontSize="10" fill="#6b7280">
            0h
          </text>
        </svg>
      </div>
    </div>
  );
}

function TestProgressGraph({
  points,
  benchmarkPercent,
  highestScorerPercent,
}: {
  points: Array<{ label: string; percent: number | null }>;
  benchmarkPercent: number;
  highestScorerPercent: number | null;
}) {
  if (points.length === 0) return null;

  const width = 760;
  const height = 220;
  const padding = 30;
  const denominator = Math.max(1, points.length - 1);
  const toY = (value: number) => height - padding - (value / 100) * (height - padding * 2);
  const benchmarkY = toY(Math.max(0, Math.min(100, benchmarkPercent)));
  const highestY =
    highestScorerPercent === null ? null : toY(Math.max(0, Math.min(100, highestScorerPercent)));

  const plotPoints = points.map((item, index) => {
    const x = padding + (index / denominator) * (width - padding * 2);
    const y = item.percent === null ? null : toY(Math.max(0, Math.min(100, item.percent)));
    return { ...item, x, y };
  });
  const linePoints = plotPoints
    .filter((point): point is typeof point & { y: number } => point.y !== null)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  return (
    <div className="mb-4 rounded-2xl border border-border bg-surface p-3">
      <div className="mb-2 flex flex-wrap items-center gap-3 text-xs">
        <p className="font-semibold uppercase tracking-[0.08em] text-text-muted">
          Test-Wise Marks Progression
        </p>
        <span className="font-medium text-sky-700">● Your score%</span>
        <span className="font-medium text-emerald-700">● Benchmark {benchmarkPercent}%</span>
        {highestScorerPercent !== null ? (
          <span className="font-medium text-amber-700">
            ● Highest scorer {Math.round(highestScorerPercent)}%
          </span>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-56 min-w-[760px] w-full">
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#d6d6d8" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#d6d6d8" strokeWidth="1" />
          <line x1={padding} y1={benchmarkY} x2={width - padding} y2={benchmarkY} stroke="#16a34a" strokeWidth="1.5" strokeDasharray="5 4" />
          {highestY !== null ? (
            <line x1={padding} y1={highestY} x2={width - padding} y2={highestY} stroke="#d97706" strokeWidth="1.5" strokeDasharray="5 4" />
          ) : null}
          {linePoints ? <polyline fill="none" stroke="#0ea5e9" strokeWidth="2.5" points={linePoints} /> : null}
          {plotPoints.map((point) => (
            <g key={`${point.label}-${point.x}`}>
              {point.y !== null ? <circle cx={point.x} cy={point.y} r="3.5" fill="#0ea5e9" /> : null}
              <text x={point.x} y={height - padding + 14} textAnchor="middle" fontSize="10" fill="#6b7280">
                {point.label}
              </text>
            </g>
          ))}
          <text x={padding - 8} y={padding + 4} textAnchor="end" fontSize="10" fill="#6b7280">
            100%
          </text>
          <text x={padding - 8} y={height - padding + 4} textAnchor="end" fontSize="10" fill="#6b7280">
            0%
          </text>
        </svg>
      </div>
    </div>
  );
}

function MistakeBreakdownChart({
  items,
}: {
  items: Array<{ label: string; value: number }>;
}) {
  if (items.length === 0) {
    return <p className="text-xs text-text-muted">No mistakes data available yet.</p>;
  }

  const maxValue = Math.max(1, ...items.map((item) => item.value));
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-[11px] text-text-muted">
            <span>{item.label}</span>
            <span className="font-semibold text-text">{item.value}</span>
          </div>
          <div className="h-2 rounded-full bg-surface-soft">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${Math.max(4, Math.round((item.value / maxValue) * 100))}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function IntakeField({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</p>
      <p className="mt-1 text-sm text-text">{formatValue(value)}</p>
    </div>
  );
}

async function StudentDashboard({
  userId,
  profile,
  assignedMentor,
  boughtPlan,
}: {
  userId: string;
  profile: Profile;
  assignedMentor: MentorSummary | null;
  boughtPlan?: string;
}) {
  const today = new Date().toISOString().slice(0, 10);

  const [todayLogs, upcoming, tests, studySessions, dailyHistory, yearlyPlan, alternateSchedule, meetings, highestScorerRows] = await Promise.all([
    prisma.$queryRaw<StudentTodayLogRecord[]>`
      SELECT
        study_hours::float AS "studyHours",
        sleep_hours::float AS "sleepHours",
        meditation_minutes AS "meditationMinutes",
        sleep_time AS "sleepTime",
        wake_time AS "wakeTime",
        afternoon_nap_minutes AS "afternoonNapMinutes",
        reason_not_studying AS "reasonNotStudying",
        feeling_today AS "feelingToday",
        relaxation_activity AS "relaxationActivity",
        task_completed::text AS "taskCompleted"
      FROM daily_logs
      WHERE user_id = ${userId}::uuid
        AND date = ${today}::date
      LIMIT 1
    `,
    prisma.$queryRaw<StudentScheduleRecord[]>`
      SELECT
        id,
        subject,
        syllabus,
        date::text AS "date"
      FROM schedule_entries
      WHERE user_id = ${userId}::uuid
        AND date >= ${today}::date
      ORDER BY date ASC
      LIMIT 7
    `,
    prisma.$queryRaw<StudentTestRecord[]>`
      SELECT
        id,
        test_name AS "testName",
        date::text AS "date",
        score::float AS "score",
        total_questions AS "totalQuestions",
        mistake_conceptual AS "mistakeConceptual",
        mistake_recall AS "mistakeRecall",
        mistake_reading AS "mistakeReading",
        mistake_elimination AS "mistakeElimination",
        mistake_decision_making AS "mistakeDecisionMaking",
        mistake_silly AS "mistakeSilly",
        mistake_psychological AS "mistakePsychological",
        mistake_pattern_misjudgment AS "mistakePatternMisjudgment"
      FROM test_results
      WHERE user_id = ${userId}::uuid
      ORDER BY date DESC, created_at DESC
      LIMIT 200
    `,
    prisma.$queryRaw<StudySessionRecord[]>`
      SELECT
        id,
        subject::text AS "subject",
        status::text AS "status",
        started_at::text AS "startedAt",
        segment_started_at::text AS "segmentStartedAt",
        accumulated_seconds AS "accumulatedSeconds",
        ended_at::text AS "endedAt"
      FROM study_sessions
      WHERE user_id = ${userId}::uuid
        AND started_at::date = ${today}::date
      ORDER BY started_at DESC
      LIMIT 100
    `,
    prisma.$queryRaw<StudentDailyHistoryRecord[]>`
      SELECT
        id,
        date::text AS "date",
        study_hours::float AS "studyHours",
        sleep_hours::float AS "sleepHours",
        meditation_minutes AS "meditationMinutes",
        sleep_time AS "sleepTime",
        wake_time AS "wakeTime",
        afternoon_nap_minutes AS "afternoonNapMinutes",
        reason_not_studying AS "reasonNotStudying",
        feeling_today AS "feelingToday",
        relaxation_activity AS "relaxationActivity",
        task_completed::text AS "taskCompleted"
      FROM daily_logs
      WHERE user_id = ${userId}::uuid
      ORDER BY date DESC
      LIMIT 7
    `,
    prisma.$queryRaw<YearlyPlanRecord[]>`
      SELECT
        id,
        month,
        subject_1 AS "subject1",
        subject_2 AS "subject2",
        subject_3 AS "subject3",
        notes,
        is_locked AS "isLocked",
        student_edit_request_pending AS "studentEditRequestPending",
        student_edit_request_note AS "studentEditRequestNote"
      FROM yearly_plan_entries
      WHERE user_id = ${userId}::uuid
      ORDER BY month ASC
      LIMIT 12
    `,
    prisma.$queryRaw<AlternateScheduleRecord[]>`
      SELECT
        id,
        date::text AS "date",
        focus,
        note
      FROM alternate_schedule_entries
      WHERE user_id = ${userId}::uuid
      ORDER BY date DESC, created_at DESC
      LIMIT 10
    `,
    prisma.$queryRaw<StudentMeetingRecord[]>`
      SELECT
        id,
        scheduled_at::text AS "scheduledAt",
        status::text AS "status",
        mode,
        meeting_link AS "meetingLink",
        agenda,
        student_notes AS "studentNotes",
        COALESCE((
          SELECT array_agg(a.url ORDER BY a.created_at DESC)
          FROM mentor_meeting_note_audios a
          WHERE a.meeting_id = mentor_meetings.id
            AND a.role = 'student'::"MeetingNoteAudioRole"
        ), ARRAY[]::text[]) AS "studentNotesAudioUrls",
        rejection_reason AS "rejectionReason"
      FROM mentor_meetings
      WHERE student_id = ${userId}::uuid
      ORDER BY scheduled_at DESC
      LIMIT 12
    `,
    prisma.$queryRaw<{ highestPercent: number | null }[]>`
      SELECT
        MAX((score::float / NULLIF(total_questions, 0)) * 100) AS "highestPercent"
      FROM test_results
      WHERE score IS NOT NULL
        AND total_questions IS NOT NULL
        AND total_questions > 0
    `,
  ]);
  const log = todayLogs[0];
  const highestScorerPercent = highestScorerRows[0]?.highestPercent ?? null;
  const testsChronological = [...tests].reverse();
  const benchmarkPercent = 66;
  const testProgressPoints = testsChronological.map((test, index) => ({
    label: `T${index + 1}`,
    percent:
      test.score !== null && test.totalQuestions && test.totalQuestions > 0
        ? (test.score / test.totalQuestions) * 100
        : null,
  }));
  const mistakeTotals = [
    { label: "Conceptual", value: tests.reduce((sum, test) => sum + test.mistakeConceptual, 0) },
    { label: "Recall", value: tests.reduce((sum, test) => sum + test.mistakeRecall, 0) },
    { label: "Reading", value: tests.reduce((sum, test) => sum + test.mistakeReading, 0) },
    { label: "Elimination", value: tests.reduce((sum, test) => sum + test.mistakeElimination, 0) },
    { label: "Decision-Making", value: tests.reduce((sum, test) => sum + test.mistakeDecisionMaking, 0) },
    { label: "Silly", value: tests.reduce((sum, test) => sum + test.mistakeSilly, 0) },
    { label: "Psychological", value: tests.reduce((sum, test) => sum + test.mistakePsychological, 0) },
    { label: "Pattern", value: tests.reduce((sum, test) => sum + test.mistakePatternMisjudgment, 0) },
  ]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const [studentAuditRows, mentorResources] = await Promise.all([
    prisma.$queryRaw<StudentAuditViewRecord[]>`
      SELECT
        strong_academic_subjects AS "strongAcademicSubjects",
        weak_academic_subjects AS "weakAcademicSubjects",
        strong_personality_traits AS "strongPersonalityTraits",
        weak_personality_traits AS "weakPersonalityTraits"
      FROM student_audits
      WHERE user_id = ${userId}::uuid
      LIMIT 1
    `,
    prisma.$queryRaw<MentorResourceViewRecord[]>`
      SELECT
        row_key AS "rowKey",
        resource,
        prelims_pyq_practice AS "prelimsPyqPractice",
        prelims_test_series AS "prelimsTestSeries",
        mains_pyq AS "mainsPyq"
      FROM resource_mapping_values
      WHERE owner_id = ${userId}::uuid
    `,
  ]);
  const studentAudit = studentAuditRows[0];
  const mentorResourceByRowKey = new Map(
    mentorResources.map((row) => [row.rowKey, row] as const)
  );

  const firstName = profile.name?.split(" ")[0] ?? "Scholar";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">PTP 2.0</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-text">
          {greeting}, {firstName}
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="mt-3 text-sm text-text-muted">
          Track your day, submit test analysis, and keep your mentor updated in one place.
        </p>
        {boughtPlan && (
          <p className="mt-4 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
            Plan activated: {boughtPlan}
          </p>
        )}
        <Link
          href="/dashboard?intent=mentor"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-text transition hover:border-primary"
        >
          Request Mentor Access <span aria-hidden>→</span>
        </Link>
      </header>

      <Panel title="Assigned Mentor">
        <SectionLead
          title="Mentor Connection"
          subtitle="Contact and guidance details shared by your assigned mentor."
          tag="Mentor Shared"
          tone="mentor"
        />
        {assignedMentor ? (
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-sm font-semibold text-text">{assignedMentor.name ?? "Mentor"}</p>
            <p className="mt-1 text-xs text-text-muted">
              {assignedMentor.mobile ? `Phone: ${assignedMentor.mobile}` : "Phone not added yet"}
            </p>
            <p className="mt-1 text-xs text-text-muted">
              {assignedMentor.telegramId
                ? `Telegram: ${assignedMentor.telegramId}`
                : "Telegram ID not added yet"}
            </p>
            <div className="mt-3 flex items-center gap-2">
              {assignedMentor.mobile ? (
                <a
                  href={`https://wa.me/${assignedMentor.mobile.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-[#25D366] transition hover:border-[#25D366]"
                  title="Chat on WhatsApp"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M13.601 2.326A7.85 7.85 0 0 0 12.041 2C7.65 2 4.07 5.58 4.07 9.972c0 1.4.366 2.768 1.062 3.976L4 18l4.159-1.09a7.9 7.9 0 0 0 3.882 1.017h.003c4.39 0 7.97-3.58 7.97-7.972a7.93 7.93 0 0 0-2.413-5.629zM12.044 16.5h-.002a6.5 6.5 0 0 1-3.313-.908l-.237-.14-2.469.647.659-2.407-.154-.247a6.48 6.48 0 0 1-.995-3.473c0-3.584 2.924-6.5 6.517-6.5a6.47 6.47 0 0 1 4.622 1.91 6.46 6.46 0 0 1 1.91 4.607c-.001 3.584-2.925 6.511-6.538 6.511zm3.558-4.844c-.195-.098-1.154-.57-1.333-.635-.18-.066-.31-.098-.44.098-.13.196-.505.635-.619.766-.114.13-.228.147-.423.049-.195-.098-.823-.303-1.568-.967-.58-.517-.971-1.154-1.085-1.35-.114-.196-.012-.302.086-.4.088-.087.195-.228.293-.342.098-.114.13-.196.195-.326.065-.131.033-.245-.016-.343-.049-.098-.44-1.06-.603-1.452-.159-.382-.32-.33-.44-.336l-.375-.006a.72.72 0 0 0-.522.245c-.18.196-.685.668-.685 1.63s.701 1.891.799 2.022c.098.13 1.38 2.107 3.344 2.954.467.201.832.321 1.116.411.469.149.896.128 1.234.078.376-.056 1.154-.472 1.317-.929.163-.457.163-.848.114-.929-.049-.081-.179-.13-.374-.228z" />
                  </svg>
                </a>
              ) : null}
              {assignedMentor.telegramId ? (
                <a
                  href={`https://t.me/${assignedMentor.telegramId.replace(/^@/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-[#229ED9] transition hover:border-[#229ED9]"
                  title="Open Telegram"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                    <path d="M21.5 4.6 18.4 19c-.2 1-.8 1.3-1.6.8l-4.5-3.4-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.7 8.6-7.8c.4-.4-.1-.5-.6-.2L6.8 13 2.4 11.6c-1-.3-1-.9.2-1.4l17-6.6c.8-.3 1.5.2 1.3 1Z" />
                  </svg>
                </a>
              ) : null}
              <span className="ml-1 text-xs text-text-muted">Use “Talk to Mentor Now” for private in-app chat.</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-muted">
            Your mentor will be assigned shortly. Please check back in a moment.
          </p>
        )}
      </Panel>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCell
          label="Study today"
          value={log ? `${log.studyHours}` : "-"}
          unit={log ? "h" : ""}
          status={log ? "Logged" : "Not logged"}
        />
        <MetricCell
          label="Tasks"
          value={log?.taskCompleted ?? "-"}
          status={log ? "Today's task status" : "Pending"}
        />
        <MetricCell
          label="Last test"
          value={tests[0]?.score !== null && tests[0]?.score !== undefined ? `${tests[0].score}` : "-"}
          unit={tests[0]?.totalQuestions ? `/${tests[0].totalQuestions}` : ""}
          status={tests[0]?.testName}
        />
      </div>

      <div className="mt-6 grid gap-5">
        <Panel title="Daily Accountability">
          <SectionLead
            title="1. Daily Accountability"
            subtitle="Fill this once every day so your mentor can review consistency, routine, and execution."
            tag="You Fill"
            tone="student"
          />
          <form action="/api/daily-logs" method="post" className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
              Date
              <input
                type="date"
                name="date"
                defaultValue={today}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
              Study Hours
              <input
                type="number"
                step="0.5"
                min="0"
                name="studyHours"
                defaultValue={log?.studyHours ?? 0}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
              Sleep Hours
              <input
                type="number"
                step="0.5"
                min="0"
                name="sleepHours"
                defaultValue={log?.sleepHours ?? 0}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
              Meditation Minutes
              <input
                type="number"
                min="0"
                name="meditationMinutes"
                defaultValue={log?.meditationMinutes ?? 0}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
              Sleep Time
              <input
                name="sleepTime"
                defaultValue={log?.sleepTime ?? ""}
                placeholder="11:30 PM"
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
              Wake Time
              <input
                name="wakeTime"
                defaultValue={log?.wakeTime ?? ""}
                placeholder="6:00 AM"
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
              Task Completed
              <select
                name="taskCompleted"
                defaultValue={log?.taskCompleted ?? ""}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              >
                <option value="">Select</option>
                <option value="yes">Yes</option>
                <option value="partial">Partial</option>
                <option value="no">No</option>
              </select>
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
              Afternoon Nap (Min)
              <input
                type="number"
                min="0"
                name="afternoonNapMinutes"
                defaultValue={log?.afternoonNapMinutes ?? 0}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
              How Are You Feeling Today?
              <input
                name="feelingToday"
                defaultValue={log?.feelingToday ?? ""}
                placeholder="Focused / tired / stressed / motivated..."
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
              Reason for Not Studying Today (if any)
              <input
                name="reasonNotStudying"
                defaultValue={log?.reasonNotStudying ?? ""}
                placeholder="Travel, health issue, family work..."
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted md:col-span-3">
              Relaxation Activity
              <input
                name="relaxationActivity"
                defaultValue={log?.relaxationActivity ?? ""}
                placeholder="Journalling, workout, walk..."
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              />
            </label>
            <div className="md:col-span-3">
              <button
                type="submit"
                className="inline-flex rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white"
              >
                Save Daily Log
              </button>
            </div>
          </form>
        </Panel>

        <Panel title="Study Tracker">
          <SectionLead
            title="2. Study Timer / Tracker"
            subtitle="Select subject and run stopwatch sessions with start, pause, resume, and stop."
            tag="You Fill"
            tone="student"
          />
          <StudyTimerPanel initialSessions={studySessions} />
        </Panel>

        <div className="grid gap-5 md:grid-cols-2">
          <Panel title="Upcoming">
            <SectionLead
              title="3. Mentor Schedule"
              subtitle="These are your upcoming schedule entries assigned by mentor."
              tag="Mentor Fills"
              tone="mentor"
            />
            {upcoming.length > 0 ? (
              <ul className="space-y-3">
                {upcoming.map((entry) => (
                  <li key={entry.id} className="rounded-2xl border border-border bg-surface p-4">
                    <p className="text-sm font-semibold text-text">{entry.subject}</p>
                    <p className="mt-1 text-xs text-text-muted">{entry.syllabus}</p>
                    <p className="mt-2 text-xs font-semibold text-primary">{entry.date}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-text-muted">No upcoming entries.</p>
            )}
          </Panel>

        <Panel title="Test History">
            <SectionLead
              title="4. Previous Test Records"
              subtitle="Every new test is appended automatically. Track marks progression against benchmark and highest scorer."
              tag="Shared"
              tone="shared"
            />
            {tests.length > 0 ? (
              <div>
                <TestProgressGraph
                  points={testProgressPoints}
                  benchmarkPercent={benchmarkPercent}
                  highestScorerPercent={highestScorerPercent}
                />
                <p className="mb-3 text-xs text-text-muted">
                  Total tests recorded: {tests.length}
                </p>
                <ul className="space-y-3">
                {tests.map((test) => {
                  const pct =
                    test.score !== null && test.totalQuestions
                      ? Math.round((test.score / test.totalQuestions) * 100)
                      : null;
                  return (
                  <li key={test.id} className="rounded-2xl border border-border bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-text">{test.testName}</p>
                          <p className="text-xs text-text-muted">{test.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-2xl font-bold tracking-tight text-text">
                            {test.score ?? "-"}
                            {test.totalQuestions ? (
                              <span className="ml-1 text-sm font-medium text-text-muted">
                                /{test.totalQuestions}
                              </span>
                            ) : null}
                          </p>
                          {pct !== null ? (
                            <p className="text-xs font-semibold text-accent">{pct}%</p>
                          ) : null}
                      </div>
                    </div>
                    <details className="mt-3 rounded-xl border border-border bg-white p-3">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                        Full Mistake Breakdown
                      </summary>
                      <div className="mt-2 grid gap-2 text-xs text-text-muted sm:grid-cols-2">
                        <p>Conceptual: {test.mistakeConceptual}</p>
                        <p>Recall: {test.mistakeRecall}</p>
                        <p>Reading: {test.mistakeReading}</p>
                        <p>Elimination: {test.mistakeElimination}</p>
                        <p>Decision-Making: {test.mistakeDecisionMaking}</p>
                        <p>Silly: {test.mistakeSilly}</p>
                        <p>Psychological: {test.mistakePsychological}</p>
                        <p>Pattern: {test.mistakePatternMisjudgment}</p>
                      </div>
                    </details>
                  </li>
                );
              })}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-text-muted">No tests recorded yet.</p>
            )}
          </Panel>
        </div>

        <Panel title="Prelims Mistake Analysis Entry">
          <SectionLead
            title="5. Mistake Analysis Submission"
            subtitle="Enter your latest mock analysis across all 8 mistake categories."
            tag="You Fill"
            tone="student"
          />
          <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
            <form action="/api/tests" method="post" className="grid gap-3 md:grid-cols-3">
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
                Test Name
                <input name="testName" required className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
              </label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
                Date
                <input type="date" name="date" defaultValue={today} className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
              </label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
                Score
                <input type="number" step="0.5" min="0" name="score" defaultValue={0} className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
              </label>
              <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
                Total Questions
                <input type="number" min="0" name="totalQuestions" defaultValue={100} className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
              </label>
              {[
                ["mistakeConceptual", "Conceptual"],
                ["mistakeRecall", "Recall"],
                ["mistakeReading", "Reading"],
                ["mistakeElimination", "Elimination"],
                ["mistakeDecisionMaking", "Decision-Making"],
                ["mistakeSilly", "Silly"],
                ["mistakePsychological", "Psychological"],
                ["mistakePatternMisjudgment", "Pattern"],
              ].map(([name, label]) => (
                <label key={name} className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
                  {label}
                  <input
                    type="number"
                    min="0"
                    name={name}
                    defaultValue={0}
                    className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
                  />
                </label>
              ))}
              <div className="md:col-span-3 flex flex-wrap gap-2">
                <button type="submit" className="inline-flex rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white">
                  Save Test Analysis
                </button>
                <button
                  type="button"
                  disabled
                  className="inline-flex rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted disabled:cursor-not-allowed disabled:opacity-70"
                  title="Import will be enabled in upcoming update"
                >
                  Import CSV (Soon)
                </button>
              </div>
            </form>
            <div className="rounded-2xl border border-border bg-surface p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Top Mistakes Analytics
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Combined across all saved test records.
              </p>
              <div className="mt-3">
                <MistakeBreakdownChart items={mistakeTotals} />
              </div>
            </div>
          </div>
        </Panel>

        <div className="grid gap-5 md:grid-cols-2">
          <Panel title="Yearly Plan">
            <SectionLead
              title="6. Yearly Plan"
              subtitle="Month-wise plan so mentor can track macro direction."
              tag="You Fill"
              tone="student"
            />
            <form action="/api/yearly-plan" method="post" className="grid gap-2">
              <input type="hidden" name="action" value="save" />
              <input name="month" placeholder="JAN / FEB / MAR" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
              <input name="subject1" placeholder="Subject 1" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
              <input name="subject2" placeholder="Subject 2" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
              <input name="subject3" placeholder="Subject 3" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
              <input name="notes" placeholder="Notes" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
              <button type="submit" className="mt-1 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white">
                Save Month Plan
              </button>
            </form>
            <ul className="mt-4 space-y-2">
              {yearlyPlan.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-muted">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-text">{entry.month}</span>
                    <span>
                      {formatValue([entry.subject1, entry.subject2, entry.subject3].filter(Boolean))}
                    </span>
                    {entry.isLocked ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700">
                        Fixed
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                        Editable
                      </span>
                    )}
                    {entry.studentEditRequestPending ? (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700">
                        Edit Request Pending
                      </span>
                    ) : null}
                  </div>
                  {entry.notes ? <p className="mt-1 text-[11px] text-text-muted">{entry.notes}</p> : null}
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {!entry.isLocked ? (
                      <form action="/api/yearly-plan" method="post">
                        <input type="hidden" name="action" value="lock" />
                        <input type="hidden" name="month" value={entry.month} />
                        <button
                          type="submit"
                          className="inline-flex rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text"
                        >
                          Fix This Month
                        </button>
                      </form>
                    ) : (
                      <form action="/api/yearly-plan" method="post" className="flex flex-wrap items-center gap-2">
                        <input type="hidden" name="action" value="request-edit" />
                        <input type="hidden" name="month" value={entry.month} />
                        <input
                          name="requestNote"
                          placeholder="Why do you need an edit?"
                          className="rounded-xl border border-border bg-white px-2 py-1 text-[11px] text-text"
                        />
                        <button
                          type="submit"
                          className="inline-flex rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text"
                        >
                          Request Edit
                        </button>
                      </form>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Alternate Schedule">
            <SectionLead
              title="7. Alternate Schedule"
              subtitle="Use this when your routine changes and you need fallback planning."
              tag="You Fill"
              tone="student"
            />
            <form action="/api/alternate-schedule" method="post" className="grid gap-2">
              <input type="date" name="date" defaultValue={today} className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
              <input name="focus" placeholder="Focus area" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
              <input name="note" placeholder="Note" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
              <button type="submit" className="mt-1 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white">
                Add Alternate Plan
              </button>
            </form>
            <ul className="mt-4 space-y-2">
              {alternateSchedule.map((entry) => (
                <li key={entry.id} className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-muted">
                  <span className="font-semibold text-text">{entry.date}</span> · {entry.focus ?? "-"} · {entry.note ?? "-"}
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Upcoming Meetings">
          <SectionLead
            title="8. Upcoming Meetings"
            subtitle="You can request meetings. Final confirmation happens only after mentor approval."
            tag="Shared"
            tone="shared"
          />
          <div className="space-y-3">
            {meetings.length === 0 ? (
              <p className="text-sm text-text-muted">No meetings scheduled yet.</p>
            ) : (
              meetings.map((meeting) => (
                <details key={meeting.id} className="rounded-2xl border border-border bg-surface p-4">
                  <summary className="cursor-pointer">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-text">
                        {new Date(meeting.scheduledAt).toLocaleString("en-IN")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {meeting.status === "approved" ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                            Approved
                          </span>
                        ) : null}
                        {meeting.status === "pending" ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700">
                            Awaiting Mentor Approval
                          </span>
                        ) : null}
                        {meeting.status === "rejected" ? (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-rose-700">
                            Rejected
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </summary>
                  <div className="mt-3">
                    <p className="text-xs text-text-muted">
                      {meeting.mode ?? "Mode not specified"} · {meeting.agenda ?? "No agenda"}
                    </p>
                    {meeting.status === "rejected" && meeting.rejectionReason ? (
                      <p className="mt-1 text-xs text-danger">Reason: {meeting.rejectionReason}</p>
                    ) : null}
                    {meeting.meetingLink ? (
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline"
                      >
                        Open Meeting Link
                      </a>
                    ) : null}
                    <details className="mt-3 rounded-xl border border-border bg-white p-3">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                        Private Notes
                      </summary>
                      <div className="mt-3">
                        <MeetingNotesEditor
                          meetingId={meeting.id}
                          defaultNote={meeting.studentNotes ?? ""}
                          defaultAudioUrls={meeting.studentNotesAudioUrls}
                        />
                      </div>
                    </details>
                  </div>
                </details>
              ))
            )}
          </div>
        </Panel>

        <Panel title="Recent Daily Logs">
          <SectionLead
            title="Recent Accountability History"
            subtitle="Quick view of your latest submissions."
            tag="Shared"
            tone="shared"
          />
          {dailyHistory.length === 0 ? (
            <p className="text-sm text-text-muted">No daily logs yet.</p>
          ) : (
            <div>
              <StudyHoursHistoryGraph
                points={[...dailyHistory]
                  .reverse()
                  .map((row) => ({ date: row.date, studyHours: row.studyHours }))}
              />
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full min-w-[1100px] text-sm">
                  <thead className="bg-surface-soft">
                    <tr className="text-left text-xs uppercase tracking-[0.12em] text-text-muted">
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Study</th>
                      <th className="px-4 py-3">Sleep</th>
                      <th className="px-4 py-3">Meditation</th>
                      <th className="px-4 py-3">Task</th>
                      <th className="px-4 py-3">Sleep Time</th>
                      <th className="px-4 py-3">Wake Time</th>
                      <th className="px-4 py-3">Nap</th>
                      <th className="px-4 py-3">Feeling</th>
                      <th className="px-4 py-3">Reason Not Studying</th>
                      <th className="px-4 py-3">Relaxation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dailyHistory.map((row) => (
                      <tr key={row.id} className="border-t border-border bg-white">
                        <td className="px-4 py-3">{row.date}</td>
                        <td className="px-4 py-3">{row.studyHours}h</td>
                        <td className="px-4 py-3">{row.sleepHours}h</td>
                        <td className="px-4 py-3">{row.meditationMinutes}m</td>
                        <td className="px-4 py-3">{row.taskCompleted ?? "-"}</td>
                        <td className="px-4 py-3">{row.sleepTime ?? "-"}</td>
                        <td className="px-4 py-3">{row.wakeTime ?? "-"}</td>
                        <td className="px-4 py-3">{row.afternoonNapMinutes}m</td>
                        <td className="px-4 py-3">{row.feelingToday ?? "-"}</td>
                        <td className="px-4 py-3">{row.reasonNotStudying ?? "-"}</td>
                        <td className="px-4 py-3">{row.relaxationActivity ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Panel>

        <Panel title="Mentor Academic & Personality Audit">
          <SectionLead
            title="Mentor Audit Notes"
            subtitle="Mentor-entered strengths, weaknesses, and behavioral feedback."
            tag="Mentor Fills"
            tone="mentor"
          />
          {studentAudit ? (
            <div className="grid gap-2 text-xs">
              <div className="rounded-xl border border-border bg-surface px-3 py-2">
                <p className="font-semibold text-text">Strong Subjects</p>
                <p className="mt-1 text-text-muted">{formatValue(studentAudit.strongAcademicSubjects)}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-3 py-2">
                <p className="font-semibold text-text">Subjects to Improve</p>
                <p className="mt-1 text-text-muted">{formatValue(studentAudit.weakAcademicSubjects)}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-3 py-2">
                <p className="font-semibold text-text">Strong Traits</p>
                <p className="mt-1 text-text-muted">{formatValue(studentAudit.strongPersonalityTraits)}</p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-3 py-2">
                <p className="font-semibold text-text">Traits to Improve</p>
                <p className="mt-1 text-text-muted">{formatValue(studentAudit.weakPersonalityTraits)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-muted">Your mentor has not added audit notes yet.</p>
          )}
        </Panel>

        <div className="mt-5">
          <Panel title="Mentor Resource Mapping">
            <SectionLead
              title="Mentor Resources"
              subtitle="Curated subject/topic resources from your mentor."
              tag="Mentor Fills"
              tone="mentor"
            />
            <div className="max-h-[420px] space-y-2 overflow-auto rounded-2xl border border-border bg-surface-soft p-2">
              {RESOURCE_TEMPLATE_GROUPS.map((group) => (
                <details
                  key={`student-resource-group-${group.paper}`}
                  open={group.paper === "GS 1"}
                  className="rounded-xl border border-border bg-white"
                >
                  <summary className="cursor-pointer px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-text">
                    {group.paper} <span className="text-text-muted">({group.rows.length} rows)</span>
                  </summary>
                  <div className="space-y-2 border-t border-border p-2">
                    {groupTemplateRowsBySubject(group.rows).map((subjectGroup, subjectIndex) => (
                      <details
                        key={`student-resource-group-${group.paper}-${subjectGroup.subject}`}
                        open={subjectIndex === 0}
                        className="rounded-lg border border-border"
                      >
                        <summary className="cursor-pointer bg-surface px-3 py-2 text-xs font-semibold text-text">
                          {subjectGroup.subject}{" "}
                          <span className="text-text-muted">({subjectGroup.rows.length})</span>
                        </summary>
                        <div className="overflow-x-auto border-t border-border">
                          <table className="w-full min-w-[800px] text-xs">
                            <thead className="bg-surface-soft">
                              <tr className="text-left uppercase tracking-[0.1em] text-text-muted">
                                <th className="px-3 py-2">Part</th>
                                <th className="px-3 py-2">Resource</th>
                                <th className="px-3 py-2">Prelims PYQ</th>
                                <th className="px-3 py-2">Prelims Test Series</th>
                                <th className="px-3 py-2">Mains Test Series</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subjectGroup.rows.map((templateRow) => {
                                const row = mentorResourceByRowKey.get(templateRow.rowKey);
                                return (
                                  <tr key={templateRow.rowKey} className="border-t border-border bg-white align-top">
                                    <td className="px-3 py-2 text-text">{templateRow.part}</td>
                                    <td className="px-3 py-2 text-text-muted">{row?.resource ?? "-"}</td>
                                    <td className="px-3 py-2 text-text-muted">{row?.prelimsPyqPractice ?? "-"}</td>
                                    <td className="px-3 py-2 text-text-muted">{row?.prelimsTestSeries ?? "-"}</td>
                                    <td className="px-3 py-2 text-text-muted">{row?.mainsPyq ?? "-"}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

async function MentorDashboard({
  profile,
  mentorId,
  boughtPlan,
}: {
  profile: Profile;
  mentorId: string;
  boughtPlan?: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  const [students, recentLogs, recentSchedules, resourceMappings, studentLogs, studentTests, studentPlans, mentorMeetings] = await Promise.all([
    prisma.$queryRaw<{ id: string; name: string | null; mobile: string | null; telegramId: string | null }[]>`
      SELECT
        id,
        name,
        mobile,
        telegram_id AS "telegramId"
      FROM profiles
      WHERE role = 'student'::"Role"
        AND mentor_id = ${mentorId}::uuid
      ORDER BY name ASC NULLS LAST, created_at ASC
    `,
    prisma.$queryRaw<{ userId: string; date: string; studyHours: number }[]>`
      SELECT
        user_id AS "userId",
        date::text AS "date",
        study_hours::float AS "studyHours"
      FROM daily_logs
      WHERE user_id IN (
        SELECT id FROM profiles WHERE mentor_id = ${mentorId}::uuid AND role = 'student'::"Role"
      )
        AND date >= ${yesterday}::date
    `,
    prisma.$queryRaw<{ id: string; studentName: string | null; date: string; subject: string | null }[]>`
      SELECT
        s.id,
        p.name AS "studentName",
        s.date::text AS "date",
        s.subject
      FROM schedule_entries s
      JOIN profiles p ON p.id = s.user_id
      WHERE p.mentor_id = ${mentorId}::uuid
      ORDER BY s.date DESC
      LIMIT 10
    `,
    prisma.$queryRaw<MentorResourceViewRecord[]>`
      SELECT
        owner_id AS "ownerId",
        row_key AS "rowKey",
        resource,
        prelims_pyq_practice AS "prelimsPyqPractice",
        prelims_test_series AS "prelimsTestSeries",
        mains_pyq AS "mainsPyq"
      FROM resource_mapping_values
      WHERE owner_id IN (
        SELECT id
        FROM profiles
        WHERE role = 'student'::"Role"
          AND mentor_id = ${mentorId}::uuid
      )
    `,
    prisma.$queryRaw<MentorStudentLogRecord[]>`
      SELECT
        l.id,
        p.name AS "studentName",
        l.date::text AS "date",
        l.study_hours::float AS "studyHours",
        l.sleep_hours::float AS "sleepHours",
        l.meditation_minutes AS "meditationMinutes",
        l.sleep_time AS "sleepTime",
        l.wake_time AS "wakeTime",
        l.afternoon_nap_minutes AS "afternoonNapMinutes",
        l.reason_not_studying AS "reasonNotStudying",
        l.feeling_today AS "feelingToday",
        l.relaxation_activity AS "relaxationActivity",
        l.task_completed::text AS "taskCompleted"
      FROM daily_logs l
      JOIN profiles p ON p.id = l.user_id
      WHERE p.mentor_id = ${mentorId}::uuid
      ORDER BY l.date DESC
      LIMIT 20
    `,
    prisma.$queryRaw<MentorStudentTestRecord[]>`
      SELECT
        t.id,
        p.name AS "studentName",
        t.test_name AS "testName",
        t.date::text AS "date",
        t.score::float AS "score",
        t.total_questions AS "totalQuestions",
        t.mistake_conceptual AS "mistakeConceptual",
        t.mistake_recall AS "mistakeRecall",
        t.mistake_reading AS "mistakeReading",
        t.mistake_elimination AS "mistakeElimination",
        t.mistake_decision_making AS "mistakeDecisionMaking",
        t.mistake_silly AS "mistakeSilly",
        t.mistake_psychological AS "mistakePsychological",
        t.mistake_pattern_misjudgment AS "mistakePatternMisjudgment"
      FROM test_results t
      JOIN profiles p ON p.id = t.user_id
      WHERE p.mentor_id = ${mentorId}::uuid
      ORDER BY t.date DESC
      LIMIT 20
    `,
    prisma.$queryRaw<MentorStudentPlanRecord[]>`
      SELECT
        y.id,
        y.user_id AS "userId",
        p.name AS "studentName",
        y.month,
        y.subject_1 AS "subject1",
        y.subject_2 AS "subject2",
        y.subject_3 AS "subject3",
        y.notes,
        y.is_locked AS "isLocked",
        y.student_edit_request_pending AS "studentEditRequestPending",
        y.student_edit_request_note AS "studentEditRequestNote"
      FROM yearly_plan_entries y
      JOIN profiles p ON p.id = y.user_id
      WHERE p.mentor_id = ${mentorId}::uuid
      ORDER BY y.updated_at DESC
      LIMIT 20
    `,
    prisma.$queryRaw<MentorMeetingRecord[]>`
      SELECT
        m.id,
        m.student_id AS "studentId",
        p.name AS "studentName",
        m.scheduled_at::text AS "scheduledAt",
        m.status::text AS "status",
        m.mode,
        m.meeting_link AS "meetingLink",
        m.agenda,
        m.mentor_notes AS "mentorNotes",
        COALESCE((
          SELECT array_agg(a.url ORDER BY a.created_at DESC)
          FROM mentor_meeting_note_audios a
          WHERE a.meeting_id = m.id
            AND a.role = 'mentor'::"MeetingNoteAudioRole"
        ), ARRAY[]::text[]) AS "mentorNotesAudioUrls",
        m.rejection_reason AS "rejectionReason"
      FROM mentor_meetings m
      JOIN profiles p ON p.id = m.student_id
      WHERE m.mentor_id = ${mentorId}::uuid
      ORDER BY m.scheduled_at DESC
      LIMIT 20
    `,
  ]);

  const logMap = new Map<string, { userId: string; date: string; studyHours: number }>();
  recentLogs.forEach((log) => logMap.set(log.userId, log));
  const loggedToday = students.filter((student) => logMap.get(student.id)?.date === today).length;
  const resourceMapByStudentRowKey = new Map(
    resourceMappings.map((row) => [`${row.ownerId ?? ""}:${row.rowKey}`, row] as const)
  );

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Mentor Console</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-text">{profile.name}</h1>
        {boughtPlan && (
          <p className="mt-4 inline-flex rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-emerald-700">
            Plan activated: {boughtPlan}
          </p>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCell label="Total students" value={String(students?.length ?? 0)} />
        <MetricCell label="Logged today" value={String(loggedToday)} />
        <MetricCell label="Not logged" value={String((students?.length ?? 0) - loggedToday)} />
      </div>

      <Panel title="Assigned Students">
        <SectionLead
          title="Assigned Students Snapshot"
          subtitle="Core roster with latest activity status."
          tag="Shared View"
          tone="shared"
        />
        {students.length === 0 ? (
          <p className="text-sm text-text-muted">No students assigned yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-surface-soft">
                <tr className="text-left text-xs uppercase tracking-[0.12em] text-text-muted">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Telegram</th>
                  <th className="px-4 py-3">Last activity</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const log = logMap.get(student.id);
                  const active = log?.date === today;

                  return (
                    <tr key={student.id} className="border-t border-border bg-white">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-text">{student.name ?? "-"}</p>
                        <p className="text-xs text-text-muted">{student.mobile ?? ""}</p>
                      </td>
                      <td className="px-4 py-3 text-text-muted">{student.telegramId ?? "-"}</td>
                      <td className="px-4 py-3 text-text-muted">
                        {log ? `${log.date} · ${log.studyHours}h` : "No log"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Panel title="Schedule by Mentor">
          <SectionLead
            title="1. Create Schedule Entry"
            subtitle="Assign day-wise tasks, syllabus and source for any assigned student."
            tag="You Fill"
            tone="mentor"
          />
          <form action="/api/mentor/schedule" method="post" className="grid gap-2">
            <select name="studentId" required className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text">
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name ?? student.id}
                </option>
              ))}
            </select>
            <input type="date" name="date" defaultValue={today} className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
            <input name="subject" placeholder="Subject" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
            <input name="syllabus" placeholder="Syllabus" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
            <input name="primarySource" placeholder="Primary source" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
            <select name="entryType" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text">
              <option value="study">Study</option>
              <option value="ca-test">CA Test</option>
              <option value="sectional-test">Sectional Test</option>
              <option value="mentor-connect">Mentor Connect</option>
            </select>
            <button type="submit" className="mt-1 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white">
              Assign Schedule
            </button>
          </form>
        </Panel>

        <Panel title="Personality & Academic Audit">
          <SectionLead
            title="2. Update Student Audit"
            subtitle="Document strengths, weak areas and personality traits for each student."
            tag="You Fill"
            tone="mentor"
          />
          <form action="/api/mentor/student-audit" method="post" className="grid gap-2">
            <select name="studentId" required className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text">
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name ?? student.id}
                </option>
              ))}
            </select>
            <input name="strongAcademicSubjects" placeholder="Strong subjects (comma separated)" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
            <input name="weakAcademicSubjects" placeholder="Weak subjects (comma separated)" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
            <input name="strongPersonalityTraits" placeholder="Strong traits (comma separated)" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
            <input name="weakPersonalityTraits" placeholder="Traits to improve (comma separated)" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
            <button type="submit" className="mt-1 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white">
              Save Audit
            </button>
          </form>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Resource Mapping">
          <SectionLead
            title="3. Resource Mapping Grid"
            subtitle="Student-specific mapping. Choose a student, then edit GS/Subject rows."
            tag="You Fill"
            tone="mentor"
          />
          <div className="max-h-[70vh] space-y-2 overflow-auto rounded-2xl border border-border bg-surface-soft p-2">
            {students.length === 0 ? (
              <p className="px-2 py-3 text-sm text-text-muted">No assigned students yet.</p>
            ) : (
              students.map((student, studentIndex) => (
                <details
                  key={`mentor-student-resource-group-${student.id}`}
                  open={studentIndex === 0}
                  className="rounded-xl border border-border bg-white"
                >
                  <summary className="cursor-pointer px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-text">
                    {student.name ?? "Unnamed Student"}{" "}
                    <span className="text-text-muted">({student.mobile ?? "No mobile"})</span>
                  </summary>
                  <div className="space-y-2 border-t border-border p-2">
                    {RESOURCE_TEMPLATE_GROUPS.map((group) => (
                      <details
                        key={`mentor-resource-group-${student.id}-${group.paper}`}
                        open={group.paper === "GS 1"}
                        className="rounded-lg border border-border"
                      >
                        <summary className="cursor-pointer bg-surface px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-text">
                          {group.paper} <span className="text-text-muted">({group.rows.length} rows)</span>
                        </summary>
                        <div className="space-y-2 border-t border-border p-2">
                          {groupTemplateRowsBySubject(group.rows).map((subjectGroup, subjectIndex) => (
                            <details
                              key={`mentor-resource-group-${student.id}-${group.paper}-${subjectGroup.subject}`}
                              open={subjectIndex === 0}
                              className="rounded-lg border border-border"
                            >
                              <summary className="cursor-pointer bg-white px-3 py-2 text-xs font-semibold text-text">
                                {subjectGroup.subject}{" "}
                                <span className="text-text-muted">({subjectGroup.rows.length})</span>
                              </summary>
                              <div className="overflow-x-auto border-t border-border">
                                <table className="w-full min-w-[980px] text-xs">
                                  <thead className="bg-surface-soft">
                                    <tr className="text-left uppercase tracking-[0.1em] text-text-muted">
                                      <th className="px-3 py-2">Part</th>
                                      <th className="px-3 py-2">Resource (Editable)</th>
                                      <th className="px-3 py-2">Prelims PYQ</th>
                                      <th className="px-3 py-2">Prelims Test Series</th>
                                      <th className="px-3 py-2">Mains Test Series</th>
                                      <th className="px-3 py-2">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {subjectGroup.rows.map((templateRow) => {
                                      const row = resourceMapByStudentRowKey.get(`${student.id}:${templateRow.rowKey}`);
                                      const isCustomOptionalResource =
                                        templateRow.rowKey === "optional" &&
                                        !!row?.resource &&
                                        !(OPTIONAL_SUBJECT_OPTIONS as readonly string[]).includes(row.resource);
                                      return (
                                        <tr key={`${student.id}-${templateRow.rowKey}`} className="border-t border-border bg-white align-top">
                                          <td className="px-3 py-2 text-text">{templateRow.part}</td>
                                          <td colSpan={4} className="px-3 py-2">
                                            <form action="/api/resource-mapping" method="post" className="grid gap-2 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
                                              <input type="hidden" name="rowKey" value={templateRow.rowKey} />
                                              <input type="hidden" name="targetUserId" value={student.id} />
                                              {templateRow.rowKey === "optional" ? (
                                                <div className="grid gap-1">
                                                  <select
                                                    name="resource"
                                                    defaultValue={isCustomOptionalResource ? "Other" : (row?.resource ?? "")}
                                                    className="rounded-xl border border-border bg-white px-3 py-2 text-xs text-text"
                                                  >
                                                    <option value="">Select optional subject</option>
                                                    {OPTIONAL_SUBJECT_OPTIONS.map((option) => (
                                                      <option key={`optional-subject-${option}`} value={option}>
                                                        {option}
                                                      </option>
                                                    ))}
                                                    <option value="Other">Other</option>
                                                  </select>
                                                  <input
                                                    name="optionalOtherResource"
                                                    defaultValue={isCustomOptionalResource ? (row?.resource ?? "") : ""}
                                                    placeholder="Other optional subject (if selected)"
                                                    className="rounded-xl border border-border bg-white px-3 py-2 text-xs text-text"
                                                  />
                                                </div>
                                              ) : (
                                                <input
                                                  name="resource"
                                                  defaultValue={row?.resource ?? ""}
                                                  placeholder="Resource notes"
                                                  list={`resource-options-${templateRow.rowKey}`}
                                                  className="rounded-xl border border-border bg-white px-3 py-2 text-xs text-text"
                                                />
                                              )}
                                              <datalist id={`resource-options-${templateRow.rowKey}`}>
                                                {(RESOURCE_OPTIONS_BY_ROW[templateRow.rowKey] ?? []).map((option) => (
                                                  <option key={`${templateRow.rowKey}-resource-${option}`} value={option} />
                                                ))}
                                              </datalist>
                                              <select
                                                name="prelimsPyqPractice"
                                                defaultValue={row?.prelimsPyqPractice ?? ""}
                                                className="rounded-xl border border-border bg-white px-3 py-2 text-xs text-text"
                                              >
                                                <option value="">Select</option>
                                                {PRELIMS_PYQ_OPTIONS.map((option) => (
                                                  <option key={`${templateRow.rowKey}-pyq-${option}`} value={option}>
                                                    {option}
                                                  </option>
                                                ))}
                                              </select>
                                              <select
                                                name="prelimsTestSeries"
                                                defaultValue={row?.prelimsTestSeries ?? ""}
                                                className="rounded-xl border border-border bg-white px-3 py-2 text-xs text-text"
                                              >
                                                <option value="">Select</option>
                                                {PRELIMS_TEST_SERIES_OPTIONS.map((option) => (
                                                  <option key={`${templateRow.rowKey}-pts-${option}`} value={option}>
                                                    {option}
                                                  </option>
                                                ))}
                                              </select>
                                              <select
                                                name="mainsPyq"
                                                defaultValue={row?.mainsPyq ?? ""}
                                                className="rounded-xl border border-border bg-white px-3 py-2 text-xs text-text"
                                              >
                                                <option value="">Select</option>
                                                {MAINS_TEST_SERIES.map((option) => (
                                                  <option key={`${templateRow.rowKey}-mains-${option}`} value={option}>
                                                    {option}
                                                  </option>
                                                ))}
                                              </select>
                                              <button
                                                type="submit"
                                                className="inline-flex rounded-full bg-primary px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white"
                                              >
                                                Save
                                              </button>
                                            </form>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </details>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <Panel title="Recent Schedule Entries">
          <SectionLead
            title="Recently Assigned Schedules"
            subtitle="Most recent assignments across your students."
            tag="Shared"
            tone="shared"
          />
          <ul className="space-y-2">
            {recentSchedules.map((row) => (
              <li key={row.id} className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-muted">
                <span className="font-semibold text-text">{row.date}</span> · {row.studentName ?? "-"} · {row.subject ?? "-"}
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Panel title="Student Daily Submissions">
          <SectionLead
            title="4. Student Daily Logs"
            subtitle="What students submitted in accountability tracking."
            tag="Student Fills"
            tone="student"
          />
          <DailySubmissionsList items={studentLogs} />
        </Panel>

        <Panel title="Student Test Submissions">
          <SectionLead
            title="5. Student Test Analysis"
            subtitle="Latest mock performance and analysis submitted by students."
            tag="Student Fills"
            tone="student"
          />
          <TestSubmissionsList items={studentTests} />
        </Panel>
      </div>

      <Panel title="Student Yearly Plans">
        <SectionLead
          title="6. Student Yearly Plans"
          subtitle="Month-wise macro plans entered by students."
          tag="Student Fills"
          tone="student"
        />
        {studentPlans.length === 0 ? (
          <p className="text-sm text-text-muted">No yearly plans submitted yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-surface-soft">
                <tr className="text-left text-xs uppercase tracking-[0.12em] text-text-muted">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Subjects</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentPlans.map((row) => (
                  <tr key={row.id} className="border-t border-border bg-white">
                    <td className="px-4 py-3">{row.studentName ?? "-"}</td>
                    <td className="px-4 py-3">{row.month}</td>
                    <td className="px-4 py-3 text-text-muted">
                      <form action="/api/yearly-plan" method="post" className="grid gap-2">
                        <input type="hidden" name="action" value="save" />
                        <input type="hidden" name="targetUserId" value={row.userId} />
                        <input type="hidden" name="month" value={row.month} />
                        <input
                          name="subject1"
                          defaultValue={row.subject1 ?? ""}
                          placeholder="Subject 1"
                          className="rounded-xl border border-border bg-white px-2 py-1 text-xs text-text"
                        />
                        <input
                          name="subject2"
                          defaultValue={row.subject2 ?? ""}
                          placeholder="Subject 2"
                          className="rounded-xl border border-border bg-white px-2 py-1 text-xs text-text"
                        />
                        <input
                          name="subject3"
                          defaultValue={row.subject3 ?? ""}
                          placeholder="Subject 3"
                          className="rounded-xl border border-border bg-white px-2 py-1 text-xs text-text"
                        />
                        <input
                          name="notes"
                          defaultValue={row.notes ?? ""}
                          placeholder="Notes"
                          className="rounded-xl border border-border bg-white px-2 py-1 text-xs text-text"
                        />
                        <button
                          type="submit"
                          className="inline-flex w-fit rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text"
                        >
                          Save Mentor Edit
                        </button>
                      </form>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.isLocked ? (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700">
                            Fixed
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                            Editable
                          </span>
                        )}
                        {row.studentEditRequestPending ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-blue-700">
                            Request Pending
                          </span>
                        ) : null}
                      </div>
                      {row.studentEditRequestNote ? (
                        <p className="mt-1 text-[11px] text-text-muted">{row.studentEditRequestNote}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {row.studentEditRequestPending ? (
                          <form action="/api/yearly-plan" method="post">
                            <input type="hidden" name="action" value="approve-edit" />
                            <input type="hidden" name="targetUserId" value={row.userId} />
                            <input type="hidden" name="month" value={row.month} />
                            <button
                              type="submit"
                              className="inline-flex rounded-full bg-primary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-white"
                            >
                              Approve Edit Request
                            </button>
                          </form>
                        ) : null}
                        {!row.isLocked ? (
                          <form action="/api/yearly-plan" method="post">
                            <input type="hidden" name="action" value="lock" />
                            <input type="hidden" name="targetUserId" value={row.userId} />
                            <input type="hidden" name="month" value={row.month} />
                            <button
                              type="submit"
                              className="inline-flex rounded-full border border-border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-text"
                            >
                              Fix Month Plan
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Upcoming Meetings">
        <SectionLead
          title="7. Upcoming Meetings"
          subtitle="Review student requests, confirm your available time, then approve or reject."
          tag="Shared"
          tone="shared"
        />
        <div className="space-y-3">
          {mentorMeetings.length === 0 ? (
            <p className="text-sm text-text-muted">No meetings scheduled yet.</p>
          ) : (
            mentorMeetings.map((meeting) => (
              <details key={meeting.id} className="rounded-2xl border border-border bg-surface p-4">
                <summary className="cursor-pointer">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-text">
                      {meeting.studentName ?? "-"} · {new Date(meeting.scheduledAt).toLocaleString("en-IN")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {meeting.status === "approved" ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                          Approved
                        </span>
                      ) : null}
                      {meeting.status === "pending" ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-amber-700">
                          Student Request Pending
                        </span>
                      ) : null}
                      {meeting.status === "rejected" ? (
                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-rose-700">
                          Rejected
                        </span>
                      ) : null}
                    </div>
                  </div>
                </summary>
                <div className="mt-3">
                  <p className="text-xs text-text-muted">
                    {meeting.mode ?? "Mode not specified"} · {meeting.agenda ?? "No agenda"}
                  </p>
                  {meeting.status === "rejected" && meeting.rejectionReason ? (
                    <p className="mt-1 text-xs text-danger">Reason: {meeting.rejectionReason}</p>
                  ) : null}
                  {meeting.status === "pending" ? (
                    <div className="mt-3 grid gap-2 rounded-xl border border-border bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                        Confirm Availability
                      </p>
                      <form action="/api/meetings" method="post" className="grid gap-2">
                        <input type="hidden" name="action" value="approve" />
                        <input type="hidden" name="meetingId" value={meeting.id} />
                        <input
                          type="datetime-local"
                          name="scheduledAt"
                          defaultValue={new Date(meeting.scheduledAt).toISOString().slice(0, 16)}
                          required
                          className="rounded-xl border border-border bg-white px-3 py-2 text-xs text-text"
                        />
                        <input
                          name="mode"
                          defaultValue={meeting.mode ?? ""}
                          placeholder="call / online / in-person"
                          className="rounded-xl border border-border bg-white px-3 py-2 text-xs text-text"
                        />
                        <input
                          name="meetingLink"
                          type="url"
                          defaultValue={meeting.meetingLink ?? ""}
                          placeholder="https://meet.google.com/..."
                          className="rounded-xl border border-border bg-white px-3 py-2 text-xs text-text"
                        />
                        <input
                          name="agenda"
                          defaultValue={meeting.agenda ?? ""}
                          placeholder="Discussion topics"
                          className="rounded-xl border border-border bg-white px-3 py-2 text-xs text-text"
                        />
                        <button
                          type="submit"
                          className="inline-flex w-fit rounded-full bg-primary px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white"
                        >
                          Approve Meeting
                        </button>
                      </form>
                      <form action="/api/meetings" method="post" className="grid gap-2">
                        <input type="hidden" name="action" value="reject" />
                        <input type="hidden" name="meetingId" value={meeting.id} />
                        <input
                          name="rejectionReason"
                          placeholder="Reason for rejection (optional)"
                          className="rounded-xl border border-border bg-white px-3 py-2 text-xs text-text"
                        />
                        <button
                          type="submit"
                          className="inline-flex w-fit rounded-full border border-border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-text"
                        >
                          Reject Meeting
                        </button>
                      </form>
                    </div>
                  ) : null}
                  {meeting.meetingLink ? (
                    <a
                      href={meeting.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-xs font-semibold text-primary hover:underline"
                    >
                      Open Meeting Link
                    </a>
                  ) : null}
                  <details className="mt-3 rounded-xl border border-border bg-white p-3">
                    <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                      Private Notes
                    </summary>
                    <div className="mt-3">
                      <MeetingNotesEditor
                        meetingId={meeting.id}
                        defaultNote={meeting.mentorNotes ?? ""}
                        defaultAudioUrls={meeting.mentorNotesAudioUrls}
                      />
                    </div>
                  </details>
                </div>
                </details>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}

async function AdminDashboard() {
  const [forms, mentorRequests, reviewerProfiles, mentors, studentMentorAssignments, contactSubmissions, activeSubscriptions] =
    await Promise.all([
    prisma.intakeForm.findMany({
      include: {
        profile: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.$queryRaw<MentorRequestRecord[]>`
      SELECT
        id,
        user_id AS "userId",
        status::text AS "status",
        requested_at AS "requestedAt",
        reviewed_at AS "reviewedAt",
        reviewed_by AS "reviewedBy",
        rejection_reason AS "rejectionReason"
      FROM mentor_access_requests
      ORDER BY requested_at DESC
      LIMIT 200
    `,
    prisma.profile.findMany({
      select: { id: true, name: true },
    }),
    prisma.$queryRaw<MentorProfileRecord[]>`
      SELECT
        id,
        name,
        mobile,
        telegram_id AS "telegramId"
      FROM profiles
      WHERE role = 'mentor'::"Role"
      ORDER BY name ASC NULLS LAST, created_at ASC
    `,
    prisma.$queryRaw<StudentMentorAssignmentRecord[]>`
      SELECT
        student.id,
        student.name,
        student.mobile,
        student.telegram_id AS "telegramId",
        student.mentor_id AS "mentorId",
        mentor.name AS "mentorName"
      FROM profiles AS student
      LEFT JOIN profiles AS mentor ON mentor.id = student.mentor_id
      WHERE student.role = 'student'::"Role"
      ORDER BY student.name ASC NULLS LAST, student.created_at ASC
      LIMIT 1000
    `,
      prisma.$queryRaw<ContactSubmissionRecord[]>`
      SELECT
        id,
        name,
        phone,
        email,
        message,
        created_at AS "createdAt"
      FROM contact_submissions
      ORDER BY created_at DESC
      LIMIT 200
    `,
      prisma.$queryRaw<PlanSubscriptionRecord[]>`
      SELECT
        id,
        user_id AS "userId",
        plan_code::text AS "planCode",
        plan_name AS "planName",
        amount_inr AS "amountInr",
        active,
        created_at AS "createdAt"
      FROM plan_subscriptions
      WHERE active = true
      ORDER BY created_at DESC
      LIMIT 500
    `,
    ]);

  const nameById = new Map(reviewerProfiles.map((profile) => [profile.id, profile.name]));

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Admin</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-text">Control Center</h1>
        <p className="mt-2 text-sm text-text-muted">
          Intake submissions: {forms.length} · Mentor requests: {mentorRequests.length} · Contact enquiries: {contactSubmissions.length} · Active subscribers: {activeSubscriptions.length}
        </p>
      </header>

      <div className="grid gap-5">
        <Panel title="Student Management">
          {studentMentorAssignments.length === 0 ? (
            <p className="text-sm text-text-muted">No students available yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-surface-soft">
                  <tr className="text-left text-xs uppercase tracking-[0.12em] text-text-muted">
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Telegram ID</th>
                    <th className="px-4 py-3">Assigned mentor</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentMentorAssignments.map((student) => (
                    <tr key={student.id} className="border-t border-border bg-white">
                      <td className="px-4 py-3 align-top text-xs text-text-muted">{student.id}</td>
                      <td className="px-4 py-3 align-top">
                        <input
                          form={`student-management-${student.id}`}
                          name="name"
                          defaultValue={student.name ?? ""}
                          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
                          placeholder="Student name"
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <input
                          form={`student-management-${student.id}`}
                          name="mobile"
                          defaultValue={student.mobile ?? ""}
                          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
                          placeholder="Phone number"
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <input
                          form={`student-management-${student.id}`}
                          name="telegramId"
                          defaultValue={student.telegramId ?? ""}
                          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
                          placeholder="@telegram"
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <select
                          form={`student-management-${student.id}`}
                          name="mentorId"
                          defaultValue={student.mentorId ?? ""}
                          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
                        >
                          <option value="">Unassigned</option>
                          {mentors.map((mentor) => (
                            <option key={mentor.id} value={mentor.id}>
                              {mentor.name ?? mentor.id}
                            </option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-text-muted">{student.mentorName ?? "Unassigned"}</p>
                      </td>
                      <td className="px-4 py-3 text-right align-top">
                        <form
                          id={`student-management-${student.id}`}
                          action="/api/admin/profile-management"
                          method="post"
                          className="inline-flex"
                        >
                          <input type="hidden" name="profileId" value={student.id} />
                          <input type="hidden" name="targetRole" value="student" />
                          <button
                            type="submit"
                            className="inline-flex shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-primary-dark"
                          >
                            Save
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Mentor Management">
          {mentors.length === 0 ? (
            <p className="text-sm text-text-muted">No mentors available yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-surface-soft">
                  <tr className="text-left text-xs uppercase tracking-[0.12em] text-text-muted">
                    <th className="px-4 py-3">Mentor</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Telegram ID</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {mentors.map((mentor) => (
                    <tr key={mentor.id} className="border-t border-border bg-white">
                      <td className="px-4 py-3 text-xs text-text-muted">{mentor.id}</td>
                      <td className="px-4 py-3">
                        <input
                          form={`mentor-management-${mentor.id}`}
                          name="name"
                          defaultValue={mentor.name ?? ""}
                          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
                          placeholder="Mentor name"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          form={`mentor-management-${mentor.id}`}
                          name="mobile"
                          defaultValue={mentor.mobile ?? ""}
                          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
                          placeholder="Phone number"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          form={`mentor-management-${mentor.id}`}
                          name="telegramId"
                          defaultValue={mentor.telegramId ?? ""}
                          className="w-full rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
                          placeholder="@telegram"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <form
                          id={`mentor-management-${mentor.id}`}
                          action="/api/admin/profile-management"
                          method="post"
                          className="inline-flex"
                        >
                          <input type="hidden" name="profileId" value={mentor.id} />
                          <input type="hidden" name="targetRole" value="mentor" />
                          <button
                            type="submit"
                            className="inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-primary-dark"
                          >
                            Save
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Mentor Access Requests">
          {mentorRequests.length === 0 ? (
            <p className="text-sm text-text-muted">No mentor requests yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-surface-soft">
                  <tr className="text-left text-xs uppercase tracking-[0.12em] text-text-muted">
                    <th className="px-4 py-3">Requested</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Reviewed By</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mentorRequests.map((request) => (
                    <tr key={request.id} className="border-t border-border bg-white">
                      <td className="px-4 py-3 text-text-muted">
                        {new Date(request.requestedAt).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-text">{nameById.get(request.userId) ?? "-"}</p>
                        <p className="text-xs text-text-muted">{request.userId}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            request.status === "approved"
                              ? "bg-emerald-100 text-emerald-700"
                              : request.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {request.reviewedBy
                          ? nameById.get(request.reviewedBy) ?? request.reviewedBy
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-text-muted">{request.rejectionReason ?? "-"}</td>
                      <td className="px-4 py-3 text-right">
                        {request.status === "pending" ? (
                          <div className="inline-flex items-center gap-2">
                            <form action="/api/admin/mentor-requests" method="post">
                              <input type="hidden" name="requestId" value={request.id} />
                              <input type="hidden" name="userId" value={request.userId} />
                              <input type="hidden" name="decision" value="approve" />
                              <button
                                type="submit"
                                className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                            </form>
                            <form action="/api/admin/mentor-requests" method="post">
                              <input type="hidden" name="requestId" value={request.id} />
                              <input type="hidden" name="userId" value={request.userId} />
                              <input type="hidden" name="decision" value="reject" />
                              <input type="hidden" name="reason" value="Rejected by admin" />
                              <button
                                type="submit"
                                className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </form>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted">No action</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Contact Enquiries">
          {contactSubmissions.length === 0 ? (
            <p className="text-sm text-text-muted">No contact enquiries yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-surface-soft">
                  <tr className="text-left text-xs uppercase tracking-[0.12em] text-text-muted">
                    <th className="px-4 py-3">Received</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {contactSubmissions.map((submission) => (
                    <tr key={submission.id} className="border-t border-border bg-white align-top">
                      <td className="px-4 py-3 text-text-muted">
                        {new Date(submission.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 font-semibold text-text">{submission.name}</td>
                      <td className="px-4 py-3 text-text-muted">{submission.email}</td>
                      <td className="px-4 py-3 text-text-muted">{submission.phone}</td>
                      <td className="px-4 py-3 text-text-muted">
                        <p className="max-w-md whitespace-pre-wrap leading-relaxed">{submission.message}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Active Subscribers">
          {activeSubscriptions.length === 0 ? (
            <p className="text-sm text-text-muted">No active subscribers yet.</p>
          ) : (
            <div className="max-h-96 overflow-auto rounded-2xl border border-border">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="sticky top-0 bg-surface-soft">
                  <tr className="text-left text-xs uppercase tracking-[0.12em] text-text-muted">
                    <th className="px-4 py-3">Subscribed</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">User ID</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {activeSubscriptions.map((subscription) => (
                    <tr key={subscription.id} className="border-t border-border bg-white">
                      <td className="px-4 py-3 text-text-muted">
                        {new Date(subscription.createdAt).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 font-semibold text-text">
                        {nameById.get(subscription.userId) ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-text-muted">{subscription.userId}</td>
                      <td className="px-4 py-3 text-text-muted">{subscription.planName}</td>
                      <td className="px-4 py-3 text-text-muted">
                        ₹{subscription.amountInr.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Full Intake Form Responses">
          {forms.length === 0 ? (
            <p className="text-sm text-text-muted">No intake forms found yet.</p>
          ) : (
            <div className="grid gap-4">
              {forms.map((form) => (
                <details key={form.id} className="rounded-2xl border border-border bg-white p-4 open:bg-surface-soft/30">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text">{form.profile?.name ?? "Unknown user"}</p>
                      <p className="text-xs text-text-muted">{form.email ?? "No email"} · {form.mobile ?? "No mobile"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Submitted</p>
                      <p className="text-xs text-text-muted">{new Date(form.createdAt).toLocaleString("en-IN")}</p>
                    </div>
                  </summary>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <IntakeField label="Full Name" value={form.profile?.name} />
                    <IntakeField label="Mobile" value={form.mobile} />
                    <IntakeField label="Email" value={form.email} />
                    <IntakeField label="Medium" value={form.medium} />
                    <IntakeField label="Graduation Stream" value={form.graduationStream} />
                    <IntakeField label="Prelims Experience" value={form.prelimsExperience} />
                    <IntakeField label="Attempt Count" value={form.attemptCount} />
                    <IntakeField label="GS Score Band" value={form.gsScoreBand} />
                    <IntakeField label="Personal Difficulties" value={form.personalDifficulties} />
                    <IntakeField label="GS Strong Subjects" value={form.strongGsSubjects} />
                    <IntakeField label="GS Weak Subjects" value={form.weakGsSubjects} />
                    <IntakeField label="Current Affairs Source" value={form.currentAffairsSource} />
                    <IntakeField label="CSAT Strong Area" value={form.csatStrongArea} />
                    <IntakeField label="CSAT Weak Area" value={form.csatWeakArea} />
                    <IntakeField label="CSAT Score Band" value={form.csatScoreBand} />
                    <IntakeField label="Mock Frequency" value={form.mockFrequency} />
                    <IntakeField label="Test Analysis" value={form.testAnalysis} />
                    <IntakeField label="Wrong Q Revision" value={form.wrongQuestionRevision} />
                    <IntakeField label="PYQ Practice" value={form.pyqPractice} />
                    <IntakeField label="Plan Consistency" value={form.planConsistency} />
                    <IntakeField label="Daily Study Hours" value={form.dailyStudyHours} />
                    <IntakeField label="Revision Count" value={form.revisionCount} />
                    <IntakeField label="Sources Per Subject" value={form.sourcesPerSubject} />
                    <IntakeField label="Core Challenges" value={form.coreChallenges} />
                    <IntakeField label="Mentorship Expectations" value={form.mentorshipExpectations} />
                    <IntakeField label="Discovery Platform" value={form.discoveryPlatform} />
                    <IntakeField label="Notes" value={form.notes} />
                  </div>
                </details>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function MentorAccessPending({ request }: { request: MentorRequestRecord }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-16 sm:px-6">
      <div className="rounded-3xl border border-border bg-white p-8 text-center sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Mentor Access</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-text">
          Request {request.status === "rejected" ? "Updated" : "Submitted"}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-text-muted">
          {request.status === "pending"
            ? "Your mentor access request is pending admin approval. You can access mentor dashboard once approved."
            : "Your previous request was rejected. A fresh request has been submitted for admin review."}
        </p>
        <p className="mt-2 text-xs text-text-muted">
          Requested at: {new Date(request.requestedAt).toLocaleString("en-IN")}
        </p>
        {request.rejectionReason && (
          <p className="mt-2 text-xs font-medium text-danger">Last rejection note: {request.rejectionReason}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-text transition hover:border-primary"
          >
            Continue as Student
          </Link>
          <Link
            href="/dashboard?intent=mentor"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Refresh Request Status
          </Link>
        </div>
      </div>
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string; bought?: string }>;
}) {
  const params = await searchParams;
  const intent = params.intent;
  const bought = params.bought;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/enroll");

  const admin = isAdminEmail(user.email);

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("role, name, mobile, telegram_id, telegram_group_link, whatsapp_group_link, mentor_id")
    .eq("id", user.id)
    .maybeSingle<ProfileWithMentorId>();

  let safeProfile: Profile =
    (existingProfile
      ? {
          role: existingProfile.role,
          name: existingProfile.name,
        }
      : null) ??
    ({
      role: "student",
      name:
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        user.email ??
        "User",
    } as Profile);

  if (!existingProfile) {
    const { error: createProfileError } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        role: "student",
        name: safeProfile.name,
      },
      { onConflict: "id" }
    );

    if (createProfileError) {
      console.error("Creating profile on dashboard failed", createProfileError);
    }
  }

  let assignedMentor: MentorSummary | null = null;
  const getUnreadCount = async (role: "student" | "mentor") => {
    if (role === "mentor") {
      const rows = await prisma.$queryRaw<{ unread: number }[]>`
        SELECT COUNT(*)::int AS unread
        FROM chat_messages
        WHERE mentor_id = ${user.id}::uuid
          AND sender_id <> ${user.id}::uuid
          AND read_at IS NULL
      `;
      return rows[0]?.unread ?? 0;
    }

    const rows = await prisma.$queryRaw<{ unread: number }[]>`
      SELECT COUNT(*)::int AS unread
      FROM chat_messages
      WHERE student_id = ${user.id}::uuid
        AND sender_id <> ${user.id}::uuid
        AND read_at IS NULL
    `;
    return rows[0]?.unread ?? 0;
  };

  if (admin) {
    return (
      <div className="min-h-screen">
        <DashboardTopBar
          roleLabel="admin"
          showBuyPlans={false}
          showChat={false}
          currentUserId={user.id}
          initialUnreadCount={0}
          profileName={safeProfile.name}
          profileMobile={existingProfile?.mobile ?? null}
          profileTelegramId={existingProfile?.telegram_id ?? null}
          profileTelegramGroupLink={existingProfile?.telegram_group_link ?? null}
          profileWhatsappGroupLink={existingProfile?.whatsapp_group_link ?? null}
        />
        <AdminDashboard />
      </div>
    );
  }

  if (intent === "mentor" && safeProfile.role !== "mentor") {
    let request = (
      await prisma.$queryRaw<MentorRequestRecord[]>`
        SELECT
          id,
          user_id AS "userId",
          status::text AS "status",
          requested_at AS "requestedAt",
          reviewed_at AS "reviewedAt",
          reviewed_by AS "reviewedBy",
          rejection_reason AS "rejectionReason"
        FROM mentor_access_requests
        WHERE user_id = ${user.id}::uuid
        LIMIT 1
      `
    )[0];

    if (!request || request.status === "rejected") {
      const rows = await prisma.$queryRaw<MentorRequestRecord[]>`
        INSERT INTO mentor_access_requests (
          user_id,
          status,
          requested_at,
          reviewed_at,
          reviewed_by,
          rejection_reason
        )
        VALUES (
          ${user.id}::uuid,
          'pending'::"MentorRequestStatus",
          NOW(),
          NULL,
          NULL,
          NULL
        )
        ON CONFLICT (user_id)
        DO UPDATE SET
          status = 'pending'::"MentorRequestStatus",
          requested_at = NOW(),
          reviewed_at = NULL,
          reviewed_by = NULL,
          rejection_reason = NULL
        RETURNING
          id,
          user_id AS "userId",
          status::text AS "status",
          requested_at AS "requestedAt",
          reviewed_at AS "reviewedAt",
          reviewed_by AS "reviewedBy",
          rejection_reason AS "rejectionReason"
      `;
      request = rows[0];
    }

    if (request.status === "approved") {
      safeProfile = { ...safeProfile, role: "mentor" };
      await prisma.profile.update({
        where: { id: user.id },
        data: { role: "mentor" },
      });
    } else {
      const pendingUnreadCount = await getUnreadCount(safeProfile.role);
      return (
        <div className="min-h-screen">
          <DashboardTopBar
            roleLabel={safeProfile.role}
            showBuyPlans
            showChat
            currentUserId={user.id}
            initialUnreadCount={pendingUnreadCount}
            profileName={safeProfile.name}
            profileMobile={existingProfile?.mobile ?? null}
            profileTelegramId={existingProfile?.telegram_id ?? null}
            profileTelegramGroupLink={existingProfile?.telegram_group_link ?? null}
            profileWhatsappGroupLink={existingProfile?.whatsapp_group_link ?? null}
          />
          <MentorAccessPending
            request={{
              id: request.id,
              userId: request.userId,
              status: request.status,
              requestedAt: request.requestedAt,
              reviewedAt: request.reviewedAt,
              reviewedBy: request.reviewedBy,
              rejectionReason: request.rejectionReason,
            }}
          />
        </div>
      );
    }
  }

  if (safeProfile.role === "student") {
    const assignedMentorId =
      existingProfile?.mentor_id ?? (await autoAssignMentorIfMissing(user.id));

    if (assignedMentorId) {
      const { data: mentorProfile } = await supabase
        .from("profiles")
        .select("id, name, mobile, telegram_id")
        .eq("id", assignedMentorId)
        .maybeSingle<{
          id: string;
          name: string | null;
          mobile: string | null;
          telegram_id: string | null;
        }>();
      assignedMentor = mentorProfile
        ? {
            id: mentorProfile.id,
            name: mentorProfile.name,
            mobile: mentorProfile.mobile,
            telegramId: mentorProfile.telegram_id,
          }
        : null;
    }
  }
  const chatUnreadCount = await getUnreadCount(safeProfile.role);

  return (
    <div className="min-h-screen">
      <DashboardTopBar
        roleLabel={safeProfile.role}
        showBuyPlans
        showChat
        currentUserId={user.id}
        initialUnreadCount={chatUnreadCount}
        profileName={safeProfile.name}
        profileMobile={existingProfile?.mobile ?? null}
        profileTelegramId={existingProfile?.telegram_id ?? null}
        profileTelegramGroupLink={existingProfile?.telegram_group_link ?? null}
        profileWhatsappGroupLink={existingProfile?.whatsapp_group_link ?? null}
      />
      {safeProfile.role === "mentor" ? (
        <MentorDashboard profile={safeProfile} mentorId={user.id} boughtPlan={bought} />
      ) : (
        <StudentDashboard
          userId={user.id}
          profile={safeProfile}
          assignedMentor={assignedMentor}
          boughtPlan={bought}
        />
      )}
    </div>
  );
}
