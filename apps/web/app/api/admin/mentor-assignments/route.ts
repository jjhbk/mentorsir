import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

interface ProfileRoleRow {
  id: string;
  role: "student" | "mentor";
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await request.formData();
  const studentId = formData.get("studentId")?.toString();
  const mentorIdRaw = formData.get("mentorId")?.toString() ?? "";
  const mentorIdValue = mentorIdRaw.trim();
  const mentorId = mentorIdValue ? mentorIdValue : null;

  if (!studentId) {
    return NextResponse.json({ error: "Missing student id" }, { status: 400 });
  }

  const studentRows = await prisma.$queryRaw<ProfileRoleRow[]>`
    SELECT id, role::text AS "role"
    FROM profiles
    WHERE id = ${studentId}::uuid
    LIMIT 1
  `;
  const student = studentRows[0];

  if (!student || student.role !== "student") {
    return NextResponse.json({ error: "Invalid student id" }, { status: 400 });
  }

  if (mentorId) {
    if (mentorId === studentId) {
      return NextResponse.json({ error: "Student cannot mentor themselves" }, { status: 400 });
    }

    const mentorRows = await prisma.$queryRaw<ProfileRoleRow[]>`
      SELECT id, role::text AS "role"
      FROM profiles
      WHERE id = ${mentorId}::uuid
      LIMIT 1
    `;
    const mentor = mentorRows[0];

    if (!mentor || mentor.role !== "mentor") {
      return NextResponse.json({ error: "Invalid mentor id" }, { status: 400 });
    }

    await prisma.$executeRaw`
      UPDATE profiles
      SET mentor_id = ${mentorId}::uuid
      WHERE id = ${studentId}::uuid
    `;
  } else {
    await prisma.$executeRaw`
      UPDATE profiles
      SET mentor_id = NULL
      WHERE id = ${studentId}::uuid
    `;
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
