import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function toText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text ? text : null;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const meetingId = form.get("meetingId")?.toString();
  const note = toText(form.get("note"));

  if (!meetingId) return NextResponse.json({ error: "meetingId is required" }, { status: 400 });

  const roleRows = await prisma.$queryRaw<{ role: "student" | "mentor" | null }[]>`
    SELECT role::text AS role
    FROM profiles
    WHERE id = ${user.id}::uuid
    LIMIT 1
  `;
  const role = roleRows[0]?.role;
  if (role !== "student" && role !== "mentor") {
    return NextResponse.json({ error: "Only mentors/students can update notes" }, { status: 403 });
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
  if (!meeting) return NextResponse.json({ error: "Meeting not found or forbidden" }, { status: 404 });

  if (role === "mentor") {
    if (meeting.mentorId !== user.id) {
      return NextResponse.json({ error: "Only assigned mentor can edit mentor notes" }, { status: 403 });
    }
    await prisma.$executeRaw`
      UPDATE mentor_meetings
      SET mentor_notes = ${note},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${meetingId}::uuid
    `;
  } else {
    if (meeting.studentId !== user.id) {
      return NextResponse.json({ error: "Only assigned student can edit student notes" }, { status: 403 });
    }
    await prisma.$executeRaw`
      UPDATE mentor_meetings
      SET student_notes = ${note},
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${meetingId}::uuid
    `;
  }

  return NextResponse.json({ ok: true });
}
