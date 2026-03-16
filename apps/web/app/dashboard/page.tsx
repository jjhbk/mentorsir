import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface Profile {
  role: "student" | "mentor";
  name: string | null;
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

async function StudentDashboard({ profile }: { profile: Profile }) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: log }, { data: upcoming }, { data: tests }] = await Promise.all([
    supabase.from("daily_logs").select("*").eq("date", today).maybeSingle(),
    supabase.from("schedule_entries").select("*").gte("date", today).order("date").limit(5),
    supabase.from("test_results").select("*").order("date", { ascending: false }).limit(5),
  ]);

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
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCell
          label="Study today"
          value={log ? `${log.study_hours}` : "-"}
          unit={log ? "h" : ""}
          status={log ? "Logged" : "Not logged"}
        />
        <MetricCell
          label="Tasks"
          value={log?.task_completed ?? "-"}
          status={log ? "Today's task status" : "Pending"}
        />
        <MetricCell
          label="Last test"
          value={tests?.[0] ? `${tests[0].score}` : "-"}
          unit={tests?.[0] ? `/${tests[0].total_questions}` : ""}
          status={tests?.[0]?.test_name}
        />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Panel title="Upcoming">
          {upcoming && upcoming.length > 0 ? (
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
          {tests && tests.length > 0 ? (
            <ul className="space-y-3">
              {tests.map((test) => {
                const pct = Math.round((test.score / test.total_questions) * 100);
                return (
                  <li key={test.id} className="rounded-2xl border border-border bg-surface p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-text">{test.test_name}</p>
                        <p className="text-xs text-text-muted">{test.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl font-bold tracking-tight text-text">
                          {test.score}
                          <span className="ml-1 text-sm font-medium text-text-muted">
                            /{test.total_questions}
                          </span>
                        </p>
                        <p className="text-xs font-semibold text-accent">{pct}%</p>
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
    </div>
  );
}

async function MentorDashboard({ profile }: { profile: Profile }) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().slice(0, 10);

  const [{ data: students }, { data: recentLogs }] = await Promise.all([
    supabase.from("profiles").select("id, name, mobile").eq("role", "student").order("name"),
    supabase
      .from("daily_logs")
      .select("user_id, date, study_hours")
      .gte("date", yesterday),
  ]);

  type LogRow = { user_id: string; date: string; study_hours: number };
  const logMap = new Map<string, LogRow>();
  (recentLogs ?? []).forEach((log) => logMap.set(log.user_id, log as LogRow));
  const loggedToday = (students ?? []).filter((student) => logMap.get(student.id)?.date === today).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-6 sm:py-12">
      <header className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Mentor Console</p>
        <h1 className="mt-3 font-display text-5xl font-bold tracking-tight text-text">{profile.name}</h1>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCell label="Total students" value={String(students?.length ?? 0)} />
        <MetricCell label="Logged today" value={String(loggedToday)} />
        <MetricCell
          label="Not logged"
          value={String((students?.length ?? 0) - loggedToday)}
        />
      </div>

      <Panel title="All Students">
        {(students ?? []).length === 0 ? (
          <p className="text-sm text-text-muted">No students enrolled yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full min-w-[620px] text-sm">
              <thead className="bg-surface-soft">
                <tr className="text-left text-xs uppercase tracking-[0.12em] text-text-muted">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Last activity</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {(students ?? []).map((student) => {
                  const log = logMap.get(student.id);
                  const active = log?.date === today;

                  return (
                    <tr key={student.id} className="border-t border-border bg-white">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-text">{student.name ?? "-"}</p>
                        <p className="text-xs text-text-muted">{student.mobile ?? ""}</p>
                      </td>
                      <td className="px-4 py-3 text-text-muted">
                        {log ? `${log.date} · ${log.study_hours}h` : "No log"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                            active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
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
    </div>
  );
}

function DashboardNav({ profile }: { profile: Profile }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-5 sm:px-6">
        <span className="font-display text-2xl font-bold tracking-tight text-text">MentorSir</span>
        <div className="flex items-center gap-4 sm:gap-6">
          <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
            {profile.role}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="cursor-pointer text-sm font-medium text-text-muted transition hover:text-text"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/enroll");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .single<Profile>();

  if (!profile) redirect("/enroll");

  return (
    <div className="min-h-screen">
      <DashboardNav profile={profile} />
      {profile.role === "mentor" ? (
        <MentorDashboard profile={profile} />
      ) : (
        <StudentDashboard profile={profile} />
      )}
    </div>
  );
}
