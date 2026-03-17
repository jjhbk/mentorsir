import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const meetingId = form.get("meetingId")?.toString();
  const file = form.get("audio");

  if (!meetingId) {
    return NextResponse.json({ error: "meetingId is required" }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "audio file is required" }, { status: 400 });
  }

  if (!file.type.startsWith("audio/")) {
    return NextResponse.json({ error: "Only audio files are supported" }, { status: 400 });
  }

  if (file.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "Audio file too large (max 25MB)" }, { status: 400 });
  }

  const roleRows = await prisma.$queryRaw<{ role: "student" | "mentor" | null }[]>`
    SELECT role::text AS role
    FROM profiles
    WHERE id = ${user.id}::uuid
    LIMIT 1
  `;
  const role = roleRows[0]?.role;
  if (role !== "student" && role !== "mentor") {
    return NextResponse.json({ error: "Only mentors/students can upload meeting audio" }, { status: 403 });
  }

  const accessRows = await prisma.$queryRaw<{ id: string; mentorId: string; studentId: string }[]>`
    SELECT
      id,
      mentor_id AS "mentorId",
      student_id AS "studentId"
    FROM mentor_meetings
    WHERE id = ${meetingId}::uuid
      AND (${user.id}::uuid = mentor_id OR ${user.id}::uuid = student_id)
    LIMIT 1
  `;
  const meeting = accessRows[0];
  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found or forbidden" }, { status: 404 });
  }

  if (role === "mentor" && meeting.mentorId !== user.id) {
    return NextResponse.json({ error: "Only assigned mentor can upload mentor audio" }, { status: 403 });
  }
  if (role === "student" && meeting.studentId !== user.id) {
    return NextResponse.json({ error: "Only assigned student can upload student audio" }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Missing BLOB_READ_WRITE_TOKEN" }, { status: 500 });
  }

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "webm";
  const safeExt = ext?.replace(/[^a-zA-Z0-9]/g, "") || "webm";
  const path = `meeting-notes/${meetingId}/${role}/${Date.now()}.${safeExt}`;

  const blob = await put(path, file, {
    access: "public",
    contentType: file.type,
    addRandomSuffix: true,
  });

  await prisma.$executeRaw`
    INSERT INTO mentor_meeting_note_audios (
      meeting_id,
      role,
      url
    )
    VALUES (
      ${meetingId}::uuid,
      ${role}::"MeetingNoteAudioRole",
      ${blob.url}
    )
  `;

  return NextResponse.json({ ok: true, audioUrl: blob.url });
}
