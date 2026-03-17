import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { autoAssignMentorIfMissing } from "@/lib/mentorAssignment";
import DashboardTopBar from "@/components/dashboard/DashboardTopBar";

interface Profile {
  role: "student" | "mentor";
  name: string | null;
}

interface ProfileWithMentorId extends Profile {
  mentor_id: string | null;
  mobile: string | null;
  telegram_id: string | null;
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
}

interface StudentDailyHistoryRecord {
  date: string;
  studyHours: number;
  sleepHours: number;
  meditationMinutes: number;
  taskCompleted: "yes" | "no" | "partial" | null;
}

interface YearlyPlanRecord {
  id: string;
  month: string;
  subject1: string | null;
  subject2: string | null;
  subject3: string | null;
  notes: string | null;
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
  id: string;
  subject: string;
  part: string | null;
  resource: string | null;
  prelimsPyqPractice: string | null;
  mainsPyq: string | null;
}

interface MentorStudentLogRecord {
  id: string;
  studentName: string | null;
  date: string;
  studyHours: number;
  sleepHours: number;
  taskCompleted: string | null;
}

interface MentorStudentTestRecord {
  id: string;
  studentName: string | null;
  testName: string;
  date: string;
  score: number | null;
  totalQuestions: number | null;
}

interface MentorStudentPlanRecord {
  id: string;
  studentName: string | null;
  month: string;
  subject1: string | null;
  subject2: string | null;
  subject3: string | null;
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

  const [todayLogs, upcoming, tests, dailyHistory, yearlyPlan, alternateSchedule] = await Promise.all([
    prisma.$queryRaw<StudentTodayLogRecord[]>`
      SELECT
        study_hours AS "studyHours",
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
        total_questions AS "totalQuestions"
      FROM test_results
      WHERE user_id = ${userId}::uuid
      ORDER BY date DESC
      LIMIT 7
    `,
    prisma.$queryRaw<StudentDailyHistoryRecord[]>`
      SELECT
        date::text AS "date",
        study_hours::float AS "studyHours",
        sleep_hours::float AS "sleepHours",
        meditation_minutes AS "meditationMinutes",
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
        notes
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
  ]);
  const log = todayLogs[0];
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
    assignedMentor
      ? prisma.$queryRaw<MentorResourceViewRecord[]>`
          SELECT
            id,
            subject,
            part,
            resource,
            prelims_pyq_practice AS "prelimsPyqPractice",
            mains_pyq AS "mainsPyq"
          FROM resource_mapping_entries
          WHERE owner_id = ${assignedMentor.id}::uuid
          ORDER BY created_at DESC
          LIMIT 20
        `
      : Promise.resolve([] as MentorResourceViewRecord[]),
  ]);
  const studentAudit = studentAuditRows[0];

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
                defaultValue={0}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
              Meditation Minutes
              <input
                type="number"
                min="0"
                name="meditationMinutes"
                defaultValue={0}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
              Sleep Time
              <input
                name="sleepTime"
                placeholder="11:30 PM"
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
              Wake Time
              <input
                name="wakeTime"
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
                defaultValue={0}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              />
            </label>
            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-text-muted">
              <input type="checkbox" name="hadMentorDiscussion" className="h-4 w-4 rounded border-border" />
              1-to-1 Discussion Done
            </label>
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted md:col-span-3">
              Relaxation Activity
              <input
                name="relaxationActivity"
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

        <div className="grid gap-5 md:grid-cols-2">
          <Panel title="Upcoming">
            <SectionLead
              title="2. Mentor Schedule"
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
              title="3. Previous Test Records"
              subtitle="Your submitted tests and score trend."
              tag="Shared"
              tone="shared"
            />
            {tests.length > 0 ? (
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
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-text-muted">No tests recorded yet.</p>
            )}
          </Panel>
        </div>

        <Panel title="Prelims Mistake Analysis Entry">
          <SectionLead
            title="4. Mistake Analysis Submission"
            subtitle="Enter your latest mock analysis across all 8 mistake categories."
            tag="You Fill"
            tone="student"
          />
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
            <div className="md:col-span-3">
              <button type="submit" className="inline-flex rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white">
                Save Test Analysis
              </button>
            </div>
          </form>
        </Panel>

        <div className="grid gap-5 md:grid-cols-2">
          <Panel title="Yearly Plan">
            <SectionLead
              title="5. Yearly Plan"
              subtitle="Month-wise plan so mentor can track macro direction."
              tag="You Fill"
              tone="student"
            />
            <form action="/api/yearly-plan" method="post" className="grid gap-2">
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
                  <span className="font-semibold text-text">{entry.month}</span>{" "}
                  {formatValue([entry.subject1, entry.subject2, entry.subject3].filter(Boolean))}
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Alternate Schedule">
            <SectionLead
              title="6. Alternate Schedule"
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
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[700px] text-sm">
                <thead className="bg-surface-soft">
                  <tr className="text-left text-xs uppercase tracking-[0.12em] text-text-muted">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Study</th>
                    <th className="px-4 py-3">Sleep</th>
                    <th className="px-4 py-3">Meditation</th>
                    <th className="px-4 py-3">Task</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyHistory.map((row) => (
                    <tr key={row.date} className="border-t border-border bg-white">
                      <td className="px-4 py-3">{row.date}</td>
                      <td className="px-4 py-3">{row.studyHours}h</td>
                      <td className="px-4 py-3">{row.sleepHours}h</td>
                      <td className="px-4 py-3">{row.meditationMinutes}m</td>
                      <td className="px-4 py-3">{row.taskCompleted ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="grid gap-5 md:grid-cols-2">
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

          <Panel title="Mentor Resource Mapping">
            <SectionLead
              title="Mentor Resources"
              subtitle="Curated subject/topic resources from your mentor."
              tag="Mentor Fills"
              tone="mentor"
            />
            {mentorResources.length === 0 ? (
              <p className="text-sm text-text-muted">No mentor resources shared yet.</p>
            ) : (
              <ul className="space-y-2">
                {mentorResources.map((row) => (
                  <li key={row.id} className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-muted">
                    <p className="font-semibold text-text">{row.subject}</p>
                    <p className="mt-1">{row.part ?? "-"} · {row.resource ?? "-"}</p>
                    <p className="mt-1">Prelims PYQ: {row.prelimsPyqPractice ?? "-"}</p>
                    <p className="mt-1">Mains PYQ: {row.mainsPyq ?? "-"}</p>
                  </li>
                ))}
              </ul>
            )}
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

  const [students, recentLogs, recentSchedules, resourceMappings, studentLogs, studentTests, studentPlans] = await Promise.all([
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
    prisma.$queryRaw<{ id: string; subject: string; part: string | null; resource: string | null }[]>`
      SELECT
        id,
        subject,
        part,
        resource
      FROM resource_mapping_entries
      WHERE owner_id = ${mentorId}::uuid
      ORDER BY created_at DESC
      LIMIT 20
    `,
    prisma.$queryRaw<MentorStudentLogRecord[]>`
      SELECT
        l.id,
        p.name AS "studentName",
        l.date::text AS "date",
        l.study_hours::float AS "studyHours",
        l.sleep_hours::float AS "sleepHours",
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
        t.total_questions AS "totalQuestions"
      FROM test_results t
      JOIN profiles p ON p.id = t.user_id
      WHERE p.mentor_id = ${mentorId}::uuid
      ORDER BY t.date DESC
      LIMIT 20
    `,
    prisma.$queryRaw<MentorStudentPlanRecord[]>`
      SELECT
        y.id,
        p.name AS "studentName",
        y.month,
        y.subject_1 AS "subject1",
        y.subject_2 AS "subject2",
        y.subject_3 AS "subject3"
      FROM yearly_plan_entries y
      JOIN profiles p ON p.id = y.user_id
      WHERE p.mentor_id = ${mentorId}::uuid
      ORDER BY y.updated_at DESC
      LIMIT 20
    `,
  ]);

  const logMap = new Map<string, { userId: string; date: string; studyHours: number }>();
  recentLogs.forEach((log) => logMap.set(log.userId, log));
  const loggedToday = students.filter((student) => logMap.get(student.id)?.date === today).length;

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

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Panel title="Resource Mapping">
          <SectionLead
            title="3. Add Resource Mapping"
            subtitle="Build a reusable subject-part-resource knowledge base."
            tag="You Fill"
            tone="mentor"
          />
          <form action="/api/resource-mapping" method="post" className="grid gap-2">
            <input name="subject" required placeholder="Subject" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
            <input name="part" placeholder="Part / Topic" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
            <input name="resource" placeholder="Resource" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
            <input name="prelimsPyqPractice" placeholder="Prelims PYQ practice" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
            <input name="mainsPyq" placeholder="Mains PYQ" className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text" />
            <button type="submit" className="mt-1 inline-flex rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white">
              Add Mapping
            </button>
          </form>
          <ul className="mt-4 space-y-2">
            {resourceMappings.map((row) => (
              <li key={row.id} className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-muted">
                <span className="font-semibold text-text">{row.subject}</span> · {row.part ?? "-"} · {row.resource ?? "-"}
              </li>
            ))}
          </ul>
        </Panel>

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
          {studentLogs.length === 0 ? (
            <p className="text-sm text-text-muted">No daily submissions yet.</p>
          ) : (
            <ul className="space-y-2">
              {studentLogs.map((row) => (
                <li key={row.id} className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-muted">
                  <span className="font-semibold text-text">{row.date}</span> · {row.studentName ?? "-"} · Study {row.studyHours}h · Sleep {row.sleepHours}h · Task {row.taskCompleted ?? "-"}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Student Test Submissions">
          <SectionLead
            title="5. Student Test Analysis"
            subtitle="Latest mock performance and analysis submitted by students."
            tag="Student Fills"
            tone="student"
          />
          {studentTests.length === 0 ? (
            <p className="text-sm text-text-muted">No test submissions yet.</p>
          ) : (
            <ul className="space-y-2">
              {studentTests.map((row) => (
                <li key={row.id} className="rounded-xl border border-border bg-surface px-3 py-2 text-xs text-text-muted">
                  <span className="font-semibold text-text">{row.date}</span> · {row.studentName ?? "-"} · {row.testName} · {row.score ?? "-"}{row.totalQuestions ? `/${row.totalQuestions}` : ""}
                </li>
              ))}
            </ul>
          )}
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
                </tr>
              </thead>
              <tbody>
                {studentPlans.map((row) => (
                  <tr key={row.id} className="border-t border-border bg-white">
                    <td className="px-4 py-3">{row.studentName ?? "-"}</td>
                    <td className="px-4 py-3">{row.month}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {formatValue([row.subject1, row.subject2, row.subject3].filter(Boolean))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
    .select("role, name, mobile, telegram_id, mentor_id")
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

  if (admin) {
    return (
      <div className="min-h-screen">
        <DashboardTopBar
          roleLabel="admin"
          showBuyPlans={false}
          profileName={safeProfile.name}
          profileMobile={existingProfile?.mobile ?? null}
          profileTelegramId={existingProfile?.telegram_id ?? null}
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
      return (
        <div className="min-h-screen">
          <DashboardTopBar
            roleLabel={safeProfile.role}
            showBuyPlans
            profileName={safeProfile.name}
            profileMobile={existingProfile?.mobile ?? null}
            profileTelegramId={existingProfile?.telegram_id ?? null}
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

  return (
    <div className="min-h-screen">
      <DashboardTopBar
        roleLabel={safeProfile.role}
        showBuyPlans
        profileName={safeProfile.name}
        profileMobile={existingProfile?.mobile ?? null}
        profileTelegramId={existingProfile?.telegram_id ?? null}
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
