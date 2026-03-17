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
  const scheduledAtRaw = form.get("scheduledAt")?.toString();
  const studentIdInput = form.get("studentId")?.toString();
  const mode = toText(form.get("mode"));
  const meetingLink = toText(form.get("meetingLink"));
  const agenda = toText(form.get("agenda"));

  if (!scheduledAtRaw) {
    return NextResponse.json({ error: "scheduledAt is required" }, { status: 400 });
  }
  const scheduledAt = new Date(scheduledAtRaw);
  if (Number.isNaN(scheduledAt.getTime())) {
    return NextResponse.json({ error: "Invalid date/time" }, { status: 400 });
  }
  if (meetingLink && !/^https?:\/\//i.test(meetingLink)) {
    return NextResponse.json({ error: "Meeting link must start with http:// or https://" }, { status: 400 });
  }

  const roleRows = await prisma.$queryRaw<{ role: "student" | "mentor" | null }[]>`
    SELECT role::text AS role
    FROM profiles
    WHERE id = ${user.id}::uuid
    LIMIT 1
  `;
  const role = roleRows[0]?.role;
  if (role !== "student" && role !== "mentor") {
    return NextResponse.json({ error: "Only mentors/students can schedule meetings" }, { status: 403 });
  }

  let mentorId: string | null = null;
  let studentId: string | null = null;

  if (role === "student") {
    const rows = await prisma.$queryRaw<{ mentorId: string | null; studentId: string }[]>`
      SELECT
        mentor_id AS "mentorId",
        id AS "studentId"
      FROM profiles
      WHERE id = ${user.id}::uuid
        AND role = 'student'::"Role"
      LIMIT 1
    `;
    mentorId = rows[0]?.mentorId ?? null;
    studentId = rows[0]?.studentId ?? null;
    if (!mentorId || !studentId) {
      return NextResponse.json({ error: "Assigned mentor not found" }, { status: 400 });
    }
  } else {
    if (!studentIdInput) {
      return NextResponse.json({ error: "studentId is required for mentors" }, { status: 400 });
    }
    const rows = await prisma.$queryRaw<{ mentorId: string; studentId: string }[]>`
      SELECT
        mentor_id AS "mentorId",
        id AS "studentId"
      FROM profiles
      WHERE id = ${studentIdInput}::uuid
        AND role = 'student'::"Role"
        AND mentor_id = ${user.id}::uuid
      LIMIT 1
    `;
    mentorId = rows[0]?.mentorId ?? null;
    studentId = rows[0]?.studentId ?? null;
    if (!mentorId || !studentId) {
      return NextResponse.json({ error: "Student is not assigned to this mentor" }, { status: 403 });
    }
  }

  await prisma.$executeRaw`
    INSERT INTO mentor_meetings (
      mentor_id,
      student_id,
      scheduled_at,
      mode,
      meeting_link,
      agenda,
      created_by
    )
    VALUES (
      ${mentorId}::uuid,
      ${studentId}::uuid,
      ${scheduledAt},
      ${mode},
      ${meetingLink},
      ${agenda},
      ${user.id}::uuid
    )
  `;

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
