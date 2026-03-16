import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

interface Profile {
  role: 'student' | 'mentor';
  name: string | null;
}

// ── Student dashboard ─────────────────────────────────────────────────────────
async function StudentDashboard({ profile }: { profile: Profile }) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: log }, { data: upcoming }, { data: tests }] = await Promise.all([
    supabase.from('daily_logs').select('*').eq('date', today).maybeSingle(),
    supabase.from('schedule_entries').select('*').gte('date', today).order('date').limit(5),
    supabase.from('test_results').select('*').order('date', { ascending: false }).limit(5),
  ]);

  const firstName = profile.name?.split(' ')[0] ?? 'Scholar';
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* Page header */}
      <div className="mb-16">
        <p className="text-sm font-semibold tracking-[0.18em] uppercase text-amber-700 mb-3">
          PTP 2.0
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-stone-900">
          {timeGreeting}, {firstName}
        </h1>
        <p className="text-stone-500 mt-2 text-base">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Today's numbers */}
      <div className="grid grid-cols-3 gap-px bg-stone-200 border border-stone-200 rounded-xl overflow-hidden mb-12">
        <MetricCell
          label="Study today"
          value={log ? `${log.study_hours}` : '—'}
          unit={log ? 'h' : ''}
          status={log ? 'logged' : 'not logged'}
        />
        <MetricCell
          label="Tasks"
          value={log?.task_completed ?? '—'}
          unit=""
          status={log ? undefined : 'pending'}
        />
        <MetricCell
          label="Last test"
          value={tests?.[0] ? `${tests[0].score}` : '—'}
          unit={tests?.[0] ? `/${tests[0].total_questions}` : ''}
          status={tests?.[0]?.test_name}
        />
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Upcoming schedule */}
        <section>
          <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-stone-400 mb-6">
            Upcoming
          </h2>
          {upcoming && upcoming.length > 0 ? (
            <ul className="space-y-0">
              {upcoming.map((entry, i) => (
                <li
                  key={entry.id}
                  className={`flex items-start gap-4 py-4 ${i < upcoming.length - 1 ? 'border-b border-stone-100' : ''}`}
                >
                  <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${
                    entry.completed ? 'bg-emerald-600' : 'bg-amber-600'
                  }`} />
                  <div className="min-w-0">
                    <p className="font-semibold text-stone-900 text-sm">{entry.subject}</p>
                    <p className="text-stone-400 text-xs mt-0.5 truncate">{entry.syllabus}</p>
                  </div>
                  <span className="ml-auto text-xs text-stone-400 shrink-0">{entry.date}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-stone-400">No upcoming entries.</p>
          )}
        </section>

        {/* Recent tests */}
        <section>
          <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-stone-400 mb-6">
            Test history
          </h2>
          {tests && tests.length > 0 ? (
            <ul className="space-y-0">
              {tests.map((t, i) => {
                const pct = Math.round((t.score / t.total_questions) * 100);
                return (
                  <li
                    key={t.id}
                    className={`flex items-center gap-4 py-4 ${i < tests.length - 1 ? 'border-b border-stone-100' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 text-sm truncate">{t.test_name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{t.date}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-extrabold text-stone-900 leading-none">
                        {t.score}<span className="text-sm font-medium text-stone-400">/{t.total_questions}</span>
                      </p>
                      <p className="text-xs font-semibold text-amber-700 mt-0.5">{pct}%</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-stone-400">No tests recorded yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}

// ── Mentor dashboard ──────────────────────────────────────────────────────────
async function MentorDashboard({ profile }: { profile: Profile }) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: students }, { data: recentLogs }] = await Promise.all([
    supabase.from('profiles').select('id, name, mobile').eq('role', 'student').order('name'),
    supabase.from('daily_logs').select('user_id, date, study_hours, task_completed')
      .gte('date', new Date(Date.now() - 86400000).toISOString().slice(0, 10)),
  ]);

  type LogRow = { user_id: string; date: string; study_hours: number; task_completed: string };
  const logMap = new Map<string, LogRow>();
  (recentLogs ?? []).forEach((l) => logMap.set(l.user_id, l as LogRow));
  const loggedToday = (students ?? []).filter((s) => logMap.get(s.id)?.date === today).length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <div className="mb-16">
        <p className="text-sm font-semibold tracking-[0.18em] uppercase text-amber-700 mb-3">
          Mentor
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight text-stone-900">
          {profile.name}
        </h1>
      </div>

      {/* Numbers */}
      <div className="grid grid-cols-3 gap-px bg-stone-200 border border-stone-200 rounded-xl overflow-hidden mb-14">
        <MetricCell label="Total students" value={String(students?.length ?? 0)} unit="" />
        <MetricCell label="Logged today" value={String(loggedToday)} unit="" />
        <MetricCell label="Not logged" value={String((students?.length ?? 0) - loggedToday)} unit="" />
      </div>

      {/* Student table */}
      <section>
        <h2 className="text-xs font-bold tracking-[0.18em] uppercase text-stone-400 mb-6">
          All students
        </h2>
        <div className="border border-stone-200 rounded-xl overflow-hidden">
          {(students ?? []).length === 0 ? (
            <p className="text-sm text-stone-400 p-6">No students enrolled yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 tracking-wider">Student</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-stone-400 tracking-wider">Last activity</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-stone-400 tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody>
                {(students ?? []).map((s, i) => {
                  const log = logMap.get(s.id);
                  const active = log?.date === today;
                  return (
                    <tr key={s.id} className={`${i < (students?.length ?? 0) - 1 ? 'border-b border-stone-100' : ''}`}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-stone-900">{s.name ?? '—'}</p>
                        <p className="text-stone-400 text-xs">{s.mobile ?? ''}</p>
                      </td>
                      <td className="px-5 py-4 text-stone-500">
                        {log ? `${log.date} · ${log.study_hours}h` : 'No log'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          active ? 'text-emerald-700' : 'text-red-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-600' : 'bg-red-500'}`} />
                          {active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

// ── Shared components ─────────────────────────────────────────────────────────
function MetricCell({ label, value, unit, status }: {
  label: string; value: string; unit?: string; status?: string;
}) {
  return (
    <div className="bg-white px-7 py-8">
      <p className="text-xs font-semibold tracking-[0.14em] uppercase text-stone-400 mb-4">{label}</p>
      <p className="text-5xl font-extrabold tracking-tight text-stone-900 leading-none">
        {value}
        {unit && <span className="text-xl font-medium text-stone-400 ml-1">{unit}</span>}
      </p>
      {status && <p className="text-xs text-stone-400 mt-3 font-medium">{status}</p>}
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
async function DashboardNav({ profile }: { profile: Profile }) {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <span className="font-extrabold text-stone-900 tracking-tight">MentorSir</span>
        <div className="flex items-center gap-6">
          <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
            {profile.role}
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/enroll');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, name')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) redirect('/enroll');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F6F2EB' }}>
      <DashboardNav profile={profile} />
      {profile.role === 'mentor'
        ? <MentorDashboard profile={profile} />
        : <StudentDashboard profile={profile} />}
    </div>
  );
}
