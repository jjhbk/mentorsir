import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function toList(value: FormDataEntryValue | null): string[] {
  return (value?.toString() ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const studentId = form.get("studentId")?.toString();
  if (!studentId) {
    return NextResponse.json({ error: "Student is required" }, { status: 400 });
  }

  const mentorRole = await prisma.$queryRaw<{ role: string }[]>`
    SELECT role::text AS role FROM profiles WHERE id = ${user.id}::uuid LIMIT 1
  `;
  if (mentorRole[0]?.role !== "mentor") {
    return NextResponse.json({ error: "Only mentors can update audits" }, { status: 403 });
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

  await prisma.$executeRaw`
    INSERT INTO student_audits (
      user_id,
      strong_academic_subjects,
      weak_academic_subjects,
      strong_personality_traits,
      weak_personality_traits
    )
    VALUES (
      ${studentId}::uuid,
      ${toList(form.get("strongAcademicSubjects"))}::text[],
      ${toList(form.get("weakAcademicSubjects"))}::text[],
      ${toList(form.get("strongPersonalityTraits"))}::text[],
      ${toList(form.get("weakPersonalityTraits"))}::text[]
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      strong_academic_subjects = EXCLUDED.strong_academic_subjects,
      weak_academic_subjects = EXCLUDED.weak_academic_subjects,
      strong_personality_traits = EXCLUDED.strong_personality_traits,
      weak_personality_traits = EXCLUDED.weak_personality_traits,
      updated_at = CURRENT_TIMESTAMP
  `;

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
