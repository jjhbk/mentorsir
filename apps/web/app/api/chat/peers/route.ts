import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

interface PeerRow {
  id: string;
  name: string | null;
  mobile: string | null;
  telegramId: string | null;
  unreadCount: number;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roleRows = await prisma.$queryRaw<{ role: "student" | "mentor" | null }[]>`
    SELECT role::text AS role
    FROM profiles
    WHERE id = ${user.id}::uuid
    LIMIT 1
  `;
  const role = roleRows[0]?.role;

  if (role === "student") {
    const mentorRows = await prisma.$queryRaw<PeerRow[]>`
      SELECT
        mentor.id,
        mentor.name,
        mentor.mobile,
        mentor.telegram_id AS "telegramId",
        COALESCE((
          SELECT COUNT(*)::int
          FROM chat_messages m
          WHERE m.mentor_id = mentor.id
            AND m.student_id = ${user.id}::uuid
            AND m.sender_id = mentor.id
            AND m.read_at IS NULL
        ), 0) AS "unreadCount"
      FROM profiles student
      JOIN profiles mentor ON mentor.id = student.mentor_id
      WHERE student.id = ${user.id}::uuid
        AND mentor.role = 'mentor'::"Role"
      LIMIT 1
    `;
    const totalUnread = mentorRows.reduce((sum, row) => sum + (row.unreadCount ?? 0), 0);
    return NextResponse.json({
      role,
      peers: mentorRows.map((row) => ({ ...row, kind: "mentor" })),
      totalUnread,
    });
  }

  if (role === "mentor") {
    const studentRows = await prisma.$queryRaw<PeerRow[]>`
      SELECT
        id,
        name,
        mobile,
        telegram_id AS "telegramId",
        COALESCE((
          SELECT COUNT(*)::int
          FROM chat_messages m
          WHERE m.mentor_id = ${user.id}::uuid
            AND m.student_id = profiles.id
            AND m.sender_id = profiles.id
            AND m.read_at IS NULL
        ), 0) AS "unreadCount"
      FROM profiles
      WHERE role = 'student'::"Role"
        AND mentor_id = ${user.id}::uuid
      ORDER BY name ASC NULLS LAST, created_at ASC
    `;
    const totalUnread = studentRows.reduce((sum, row) => sum + (row.unreadCount ?? 0), 0);
    return NextResponse.json({
      role,
      peers: studentRows.map((row) => ({ ...row, kind: "student" })),
      totalUnread,
    });
  }

  return NextResponse.json({ role, peers: [], totalUnread: 0 });
}
