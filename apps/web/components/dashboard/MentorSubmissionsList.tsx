"use client";

import { useState } from "react";

export interface DailySubmissionItem {
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

export interface TestSubmissionItem {
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

export function DailySubmissionsList({ items }: { items: DailySubmissionItem[] }) {
  const [selected, setSelected] = useState<DailySubmissionItem | null>(null);

  if (items.length === 0) {
    return <p className="text-sm text-text-muted">No daily submissions yet.</p>;
  }

  return (
    <>
      <ul className="space-y-2">
        {items.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => setSelected(row)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-left text-xs text-text-muted transition hover:border-primary"
            >
              <span className="font-semibold text-text">{row.date}</span> · {row.studentName ?? "-"} · Study{" "}
              {row.studyHours}h
              <span className="ml-2 text-primary">View details</span>
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Daily Submission</p>
                <h3 className="mt-2 font-display text-3xl font-bold tracking-tight text-text">
                  {selected.studentName ?? "Student"}
                </h3>
                <p className="mt-1 text-sm text-text-muted">{selected.date}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:text-text"
              >
                Close
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <DetailCard label="Study Hours" value={`${selected.studyHours}h`} />
              <DetailCard label="Sleep Hours" value={`${selected.sleepHours}h`} />
              <DetailCard label="Meditation" value={`${selected.meditationMinutes}m`} />
              <DetailCard label="Task Status" value={selected.taskCompleted ?? "-"} />
              <DetailCard label="Sleep Time" value={selected.sleepTime ?? "-"} />
              <DetailCard label="Wake Time" value={selected.wakeTime ?? "-"} />
              <DetailCard label="Afternoon Nap" value={`${selected.afternoonNapMinutes}m`} />
              <DetailCard label="Feeling Today" value={selected.feelingToday ?? "-"} />
              <DetailCard label="Reason Not Studying" value={selected.reasonNotStudying ?? "-"} />
              <DetailCard label="Relaxation Activity" value={selected.relaxationActivity ?? "-"} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function TestSubmissionsList({ items }: { items: TestSubmissionItem[] }) {
  const [selected, setSelected] = useState<TestSubmissionItem | null>(null);

  if (items.length === 0) {
    return <p className="text-sm text-text-muted">No test submissions yet.</p>;
  }

  return (
    <>
      <ul className="space-y-2">
        {items.map((row) => (
          <li key={row.id}>
            <button
              type="button"
              onClick={() => setSelected(row)}
              className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-left text-xs text-text-muted transition hover:border-primary"
            >
              <span className="font-semibold text-text">{row.date}</span> · {row.studentName ?? "-"} ·{" "}
              {row.testName}
              <span className="ml-2 text-primary">View details</span>
            </button>
          </li>
        ))}
      </ul>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Test Submission</p>
                <h3 className="mt-2 font-display text-3xl font-bold tracking-tight text-text">
                  {selected.studentName ?? "Student"}
                </h3>
                <p className="mt-1 text-sm text-text-muted">
                  {selected.testName} · {selected.date}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:text-text"
              >
                Close
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <DetailCard label="Score" value={selected.score ?? "-"} />
              <DetailCard label="Total Questions" value={selected.totalQuestions ?? "-"} />
              <DetailCard label="Conceptual Mistakes" value={selected.mistakeConceptual} />
              <DetailCard label="Recall Mistakes" value={selected.mistakeRecall} />
              <DetailCard label="Reading Mistakes" value={selected.mistakeReading} />
              <DetailCard label="Elimination Mistakes" value={selected.mistakeElimination} />
              <DetailCard label="Decision-Making Errors" value={selected.mistakeDecisionMaking} />
              <DetailCard label="Silly Mistakes" value={selected.mistakeSilly} />
              <DetailCard label="Psychological Mistakes" value={selected.mistakePsychological} />
              <DetailCard
                label="Pattern Misjudgment"
                value={selected.mistakePatternMisjudgment}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DetailCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">{label}</p>
      <p className="mt-1 text-base font-semibold text-text">{value}</p>
    </div>
  );
}
