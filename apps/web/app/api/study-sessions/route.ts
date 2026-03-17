import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type StudySessionAction = "start" | "pause" | "resume" | "stop";
type StudySubject =
  | "polity"
  | "geography"
  | "economy"
  | "csat"
  | "prelims"
  | "mains"
  | "interview";

const VALID_SUBJECTS: StudySubject[] = [
  "polity",
  "geography",
  "economy",
  "csat",
  "prelims",
  "mains",
  "interview",
];

interface StudySessionRow {
  id: string;
  subject: StudySubject;
  status: "active" | "paused" | "completed";
  startedAt: string;
  segmentStartedAt: string | null;
  accumulatedSeconds: number;
  endedAt: string | null;
}

async function listTodaySessions(userId: string, date: string) {
  const sessions = await prisma.$queryRaw<StudySessionRow[]>`
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
      AND started_at::date = ${date}::date
    ORDER BY started_at DESC
    LIMIT 100
  `;

  const totalSeconds = sessions
    .filter((session) => session.status === "completed")
    .reduce((sum, session) => sum + session.accumulatedSeconds, 0);

  return { sessions, totalSeconds };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { action?: StudySessionAction; subject?: string; sessionId?: string }
    | null;

  const action = body?.action;
  if (action !== "start" && action !== "pause" && action !== "resume" && action !== "stop") {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const roleRows = await prisma.$queryRaw<{ role: "student" | "mentor" | null }[]>`
    SELECT role::text AS role
    FROM profiles
    WHERE id = ${user.id}::uuid
    LIMIT 1
  `;
  if (roleRows[0]?.role !== "student") {
    return NextResponse.json({ error: "Only students can use study timer" }, { status: 403 });
  }

  const today = new Date().toISOString().slice(0, 10);

  if (action === "start") {
    const subject = (body?.subject ?? "").toLowerCase() as StudySubject;
    if (!VALID_SUBJECTS.includes(subject)) {
      return NextResponse.json({ error: "Invalid subject" }, { status: 400 });
    }

    const runningRows = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM study_sessions
      WHERE user_id = ${user.id}::uuid
        AND status IN ('active'::"StudySessionStatus", 'paused'::"StudySessionStatus")
      LIMIT 1
    `;
    if (runningRows[0]) {
      return NextResponse.json({ error: "Finish current session before starting another" }, { status: 400 });
    }

    await prisma.$executeRaw`
      INSERT INTO study_sessions (
        user_id,
        subject,
        status,
        started_at,
        segment_started_at,
        accumulated_seconds
      )
      VALUES (
        ${user.id}::uuid,
        ${subject}::"StudySubject",
        'active'::"StudySessionStatus",
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        0
      )
    `;

    const payload = await listTodaySessions(user.id, today);
    return NextResponse.json({ ok: true, ...payload });
  }

  const sessionId = body?.sessionId;
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const sessionRows = await prisma.$queryRaw<{
    id: string;
    status: "active" | "paused" | "completed";
    segmentStartedAt: string | null;
  }[]>`
    SELECT
      id,
      status::text AS "status",
      segment_started_at::text AS "segmentStartedAt"
    FROM study_sessions
    WHERE id = ${sessionId}::uuid
      AND user_id = ${user.id}::uuid
    LIMIT 1
  `;
  const session = sessionRows[0];
  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (action === "pause") {
    if (session.status !== "active") {
      return NextResponse.json({ error: "Only active sessions can be paused" }, { status: 400 });
    }
    await prisma.$executeRaw`
      UPDATE study_sessions
      SET
        accumulated_seconds = accumulated_seconds + GREATEST(0, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - segment_started_at)))::int,
        segment_started_at = NULL,
        status = 'paused'::"StudySessionStatus",
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionId}::uuid
    `;
  }

  if (action === "resume") {
    if (session.status !== "paused") {
      return NextResponse.json({ error: "Only paused sessions can be resumed" }, { status: 400 });
    }
    await prisma.$executeRaw`
      UPDATE study_sessions
      SET
        segment_started_at = CURRENT_TIMESTAMP,
        status = 'active'::"StudySessionStatus",
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionId}::uuid
    `;
  }

  if (action === "stop") {
    if (session.status === "completed") {
      return NextResponse.json({ error: "Session already stopped" }, { status: 400 });
    }
    await prisma.$executeRaw`
      UPDATE study_sessions
      SET
        accumulated_seconds = accumulated_seconds + CASE
          WHEN status = 'active'::"StudySessionStatus" AND segment_started_at IS NOT NULL
            THEN GREATEST(0, EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - segment_started_at)))::int
          ELSE 0
        END,
        segment_started_at = NULL,
        status = 'completed'::"StudySessionStatus",
        ended_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${sessionId}::uuid
    `;
  }

  const payload = await listTodaySessions(user.id, today);
  return NextResponse.json({ ok: true, ...payload });
}
