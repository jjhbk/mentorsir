"use client";

import { useMemo, useState, useEffect } from "react";

type StudySubject =
  | "polity"
  | "geography"
  | "economy"
  | "csat"
  | "prelims"
  | "mains"
  | "interview";

type StudySessionStatus = "active" | "paused" | "completed";

interface StudySessionItem {
  id: string;
  subject: StudySubject;
  status: StudySessionStatus;
  startedAt: string;
  segmentStartedAt: string | null;
  accumulatedSeconds: number;
  endedAt: string | null;
}

const SUBJECT_OPTIONS: Array<{ value: StudySubject; label: string }> = [
  { value: "polity", label: "Polity" },
  { value: "geography", label: "Geography" },
  { value: "economy", label: "Economy" },
  { value: "csat", label: "CSAT" },
  { value: "prelims", label: "Prelims" },
  { value: "mains", label: "Mains" },
  { value: "interview", label: "Interview" },
];

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((totalSeconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

function formatTime(value: string | null): string {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function computeSessionSeconds(session: StudySessionItem, nowMs: number): number {
  if (session.status === "active" && session.segmentStartedAt) {
    const segmentStartMs = new Date(session.segmentStartedAt).getTime();
    if (Number.isFinite(segmentStartMs)) {
      const running = Math.max(0, Math.floor((nowMs - segmentStartMs) / 1000));
      return session.accumulatedSeconds + running;
    }
  }
  return session.accumulatedSeconds;
}

export default function StudyTimerPanel({
  initialSessions,
}: {
  initialSessions: StudySessionItem[];
}) {
  const [sessions, setSessions] = useState<StudySessionItem[]>(initialSessions);
  const [selectedSubject, setSelectedSubject] = useState<StudySubject>("polity");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(Date.now());

  const activeSession = useMemo(
    () => sessions.find((session) => session.status === "active" || session.status === "paused") ?? null,
    [sessions]
  );

  useEffect(() => {
    if (!activeSession || activeSession.status !== "active") return;
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  const stopwatchSeconds = activeSession
    ? computeSessionSeconds(activeSession, nowMs)
    : 0;

  const todayTotalSeconds = sessions
    .filter((session) => session.status === "completed")
    .reduce((sum, session) => sum + session.accumulatedSeconds, 0);

  const runAction = async (
    action: "start" | "pause" | "resume" | "stop",
    extras?: { subject?: StudySubject; sessionId?: string }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/study-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extras }),
      });
      const payload = (await response.json().catch(() => null)) as
        | { sessions?: StudySessionItem[]; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Action failed");
      }

      setSessions(payload?.sessions ?? []);
      setNowMs(Date.now());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Action failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">Study Timer</p>
          <p className="mt-1 font-display text-4xl font-bold tracking-tight text-text">
            {formatDuration(stopwatchSeconds)}
          </p>
          <p className="mt-1 text-xs text-text-muted">Today&apos;s completed total: {formatDuration(todayTotalSeconds)}</p>
        </div>
        {!activeSession ? (
          <div className="grid gap-2 sm:min-w-[220px]">
            <label className="grid gap-1 text-xs uppercase tracking-[0.08em] text-text-muted">
              Subject
              <select
                value={selectedSubject}
                onChange={(event) => setSelectedSubject(event.target.value as StudySubject)}
                className="rounded-xl border border-border bg-white px-3 py-2 text-sm text-text"
              >
                {SUBJECT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={loading}
              onClick={() => void runAction("start", { subject: selectedSubject })}
              className="inline-flex rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Start Timer
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {activeSession.status === "active" ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => void runAction("pause", { sessionId: activeSession.id })}
                className="inline-flex rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-text disabled:cursor-not-allowed disabled:opacity-60"
              >
                Pause
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={() => void runAction("resume", { sessionId: activeSession.id })}
                className="inline-flex rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-text disabled:cursor-not-allowed disabled:opacity-60"
              >
                Resume
              </button>
            )}
            <button
              type="button"
              disabled={loading}
              onClick={() => void runAction("stop", { sessionId: activeSession.id })}
              className="inline-flex rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Stop
            </button>
          </div>
        )}
      </div>

      {activeSession ? (
        <p className="mt-2 text-xs text-text-muted">
          Current session: {SUBJECT_OPTIONS.find((option) => option.value === activeSession.subject)?.label ?? activeSession.subject} ({activeSession.status})
        </p>
      ) : null}
      {error ? <p className="mt-2 text-xs text-danger">{error}</p> : null}

      <div className="mt-4 overflow-x-auto rounded-xl border border-border bg-white">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-surface-soft">
            <tr className="text-left text-xs uppercase tracking-[0.08em] text-text-muted">
              <th className="px-3 py-2">Subject</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Start</th>
              <th className="px-3 py-2">End</th>
              <th className="px-3 py-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-3 text-xs text-text-muted">
                  No sessions yet today.
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session.id} className="border-t border-border">
                  <td className="px-3 py-2 text-xs text-text">
                    {SUBJECT_OPTIONS.find((option) => option.value === session.subject)?.label ?? session.subject}
                  </td>
                  <td className="px-3 py-2 text-xs text-text-muted">{session.status}</td>
                  <td className="px-3 py-2 text-xs text-text-muted">{formatTime(session.startedAt)}</td>
                  <td className="px-3 py-2 text-xs text-text-muted">{formatTime(session.endedAt)}</td>
                  <td className="px-3 py-2 text-xs font-semibold text-text">
                    {formatDuration(computeSessionSeconds(session, nowMs))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
