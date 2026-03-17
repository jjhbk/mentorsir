import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

interface GroupMessageRow {
  id: string;
  mentorId: string;
  senderId: string;
  senderName: string | null;
  message: string;
  createdAt: string;
}

async function resolveGroupAccess(userId: string): Promise<{
  role: "student" | "mentor";
  mentorId: string;
  telegramGroupLink: string | null;
  whatsappGroupLink: string | null;
} | null> {
  const roleRows = await prisma.$queryRaw<{ role: "student" | "mentor" | null }[]>`
    SELECT role::text AS role
    FROM profiles
    WHERE id = ${userId}::uuid
    LIMIT 1
  `;
  const role = roleRows[0]?.role;

  if (role === "mentor") {
    const rows = await prisma.$queryRaw<{ id: string; telegramGroupLink: string | null; whatsappGroupLink: string | null }[]>`
      SELECT
        id,
        telegram_group_link AS "telegramGroupLink",
        whatsapp_group_link AS "whatsappGroupLink"
      FROM profiles
      WHERE id = ${userId}::uuid
      LIMIT 1
    `;
    if (!rows[0]) return null;
    return {
      role,
      mentorId: rows[0].id,
      telegramGroupLink: rows[0].telegramGroupLink,
      whatsappGroupLink: rows[0].whatsappGroupLink,
    };
  }

  if (role === "student") {
    const rows = await prisma.$queryRaw<{
      mentorId: string | null;
      telegramGroupLink: string | null;
      whatsappGroupLink: string | null;
    }[]>`
      SELECT
        p.mentor_id AS "mentorId",
        mentor.telegram_group_link AS "telegramGroupLink",
        mentor.whatsapp_group_link AS "whatsappGroupLink"
      FROM profiles p
      LEFT JOIN profiles mentor ON mentor.id = p.mentor_id
      WHERE p.id = ${userId}::uuid
        AND p.role = 'student'::"Role"
      LIMIT 1
    `;
    const mentorId = rows[0]?.mentorId ?? null;
    if (!mentorId) return null;
    return {
      role,
      mentorId,
      telegramGroupLink: rows[0]?.telegramGroupLink ?? null,
      whatsappGroupLink: rows[0]?.whatsappGroupLink ?? null,
    };
  }

  return null;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const access = await resolveGroupAccess(user.id);
  if (!access) {
    return NextResponse.json({ error: "Group chat unavailable" }, { status: 403 });
  }

  const messages = await prisma.$queryRaw<GroupMessageRow[]>`
    SELECT
      m.id,
      m.mentor_id AS "mentorId",
      m.sender_id AS "senderId",
      p.name AS "senderName",
      m.message,
      m.created_at::text AS "createdAt"
    FROM mentor_group_messages m
    LEFT JOIN profiles p ON p.id = m.sender_id
    WHERE m.mentor_id = ${access.mentorId}::uuid
    ORDER BY m.created_at ASC
    LIMIT 500
  `;

  return NextResponse.json({
    role: access.role,
    mentorId: access.mentorId,
    telegramGroupLink: access.telegramGroupLink,
    whatsappGroupLink: access.whatsappGroupLink,
    messages,
  });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { message?: string } | null;
  const message = body?.message?.trim();

  if (!message) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const access = await resolveGroupAccess(user.id);
  if (!access) {
    return NextResponse.json({ error: "Group chat unavailable" }, { status: 403 });
  }

  const rows = await prisma.$queryRaw<GroupMessageRow[]>`
    INSERT INTO mentor_group_messages (
      mentor_id,
      sender_id,
      message
    )
    VALUES (
      ${access.mentorId}::uuid,
      ${user.id}::uuid,
      ${message}
    )
    RETURNING
      id,
      mentor_id AS "mentorId",
      sender_id AS "senderId",
      (SELECT name FROM profiles WHERE id = sender_id) AS "senderName",
      message,
      created_at::text AS "createdAt"
  `;

  return NextResponse.json({ message: rows[0] });
}
