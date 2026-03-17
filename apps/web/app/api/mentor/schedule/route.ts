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
  const studentId = form.get("studentId")?.toString();
  const date = form.get("date")?.toString();
  const entryType = form.get("entryType")?.toString() ?? "study";

  if (!studentId || !date) {
    return NextResponse.json({ error: "Student and date are required" }, { status: 400 });
  }

  const mentorRole = await prisma.$queryRaw<{ role: string }[]>`
    SELECT role::text AS role FROM profiles WHERE id = ${user.id}::uuid LIMIT 1
  `;
  if (mentorRole[0]?.role !== "mentor") {
    return NextResponse.json({ error: "Only mentors can assign schedules" }, { status: 403 });
  }

  const relation = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id
    FROM profiles
    WHERE id = ${studentId}::uuid
      AND role = 'student'::"Role"
      AND mentor_id = ${user.id}::uuid
    LIMIT 1
  `;

  if (!relation[0]) {
    return NextResponse.json({ error: "Student is not assigned to this mentor" }, { status: 403 });
  }

  const normalizedType =
    entryType === "study" ||
    entryType === "ca-test" ||
    entryType === "sectional-test" ||
    entryType === "mentor-connect"
      ? entryType
      : "study";

  await prisma.$executeRaw`
    INSERT INTO schedule_entries (
      user_id,
      date,
      subject,
      syllabus,
      primary_source,
      entry_type
    )
    VALUES (
      ${studentId}::uuid,
      ${date}::date,
      ${toText(form.get("subject"))},
      ${toText(form.get("syllabus"))},
      ${toText(form.get("primarySource"))},
      ${normalizedType}::"EntryType"
    )
  `;

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
