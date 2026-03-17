import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

interface ChatMessageRow {
  id: string;
  mentorId: string;
  studentId: string;
  senderId: string;
  message: string;
  createdAt: string;
}

async function getRole(userId: string): Promise<"student" | "mentor" | null> {
  const rows = await prisma.$queryRaw<{ role: "student" | "mentor" | null }[]>`
    SELECT role::text AS role
    FROM profiles
    WHERE id = ${userId}::uuid
    LIMIT 1
  `;
  return rows[0]?.role ?? null;
}

async function resolveConversation(
  userId: string,
  peerId: string,
  role: "student" | "mentor"
): Promise<{ mentorId: string; studentId: string } | null> {
  if (role === "student") {
    const rows = await prisma.$queryRaw<{ mentorId: string; studentId: string }[]>`
      SELECT
        mentor_id AS "mentorId",
        id AS "studentId"
      FROM profiles
      WHERE id = ${userId}::uuid
        AND role = 'student'::"Role"
        AND mentor_id = ${peerId}::uuid
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  const rows = await prisma.$queryRaw<{ mentorId: string; studentId: string }[]>`
    SELECT
      mentor_id AS "mentorId",
      id AS "studentId"
    FROM profiles
    WHERE id = ${peerId}::uuid
      AND role = 'student'::"Role"
      AND mentor_id = ${userId}::uuid
    LIMIT 1
  `;
  return rows[0] ?? null;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const peerId = request.nextUrl.searchParams.get("peerId");
  if (!peerId) return NextResponse.json({ error: "peerId is required" }, { status: 400 });

  const role = await getRole(user.id);
  if (role !== "student" && role !== "mentor") {
    return NextResponse.json({ error: "Chat only available for mentors/students" }, { status: 403 });
  }

  const conversation = await resolveConversation(user.id, peerId, role);
  if (!conversation) return NextResponse.json({ error: "Forbidden conversation" }, { status: 403 });

  const messages = await prisma.$queryRaw<ChatMessageRow[]>`
    SELECT
      id,
      mentor_id AS "mentorId",
      student_id AS "studentId",
      sender_id AS "senderId",
      message,
      created_at::text AS "createdAt"
    FROM chat_messages
    WHERE mentor_id = ${conversation.mentorId}::uuid
      AND student_id = ${conversation.studentId}::uuid
    ORDER BY created_at ASC
    LIMIT 500
  `;

  await prisma.$executeRaw`
    UPDATE chat_messages
    SET read_at = CURRENT_TIMESTAMP
    WHERE mentor_id = ${conversation.mentorId}::uuid
      AND student_id = ${conversation.studentId}::uuid
      AND sender_id <> ${user.id}::uuid
      AND read_at IS NULL
  `;

  return NextResponse.json({ role, ...conversation, messages });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { peerId?: string; message?: string } | null;
  const peerId = body?.peerId?.trim();
  const message = body?.message?.trim();

  if (!peerId || !message) {
    return NextResponse.json({ error: "peerId and message are required" }, { status: 400 });
  }
  if (message.length > 4000) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const role = await getRole(user.id);
  if (role !== "student" && role !== "mentor") {
    return NextResponse.json({ error: "Chat only available for mentors/students" }, { status: 403 });
  }

  const conversation = await resolveConversation(user.id, peerId, role);
  if (!conversation) return NextResponse.json({ error: "Forbidden conversation" }, { status: 403 });

  const rows = await prisma.$queryRaw<ChatMessageRow[]>`
    INSERT INTO chat_messages (
      mentor_id,
      student_id,
      sender_id,
      message
    )
    VALUES (
      ${conversation.mentorId}::uuid,
      ${conversation.studentId}::uuid,
      ${user.id}::uuid,
      ${message}
    )
    RETURNING
      id,
      mentor_id AS "mentorId",
      student_id AS "studentId",
      sender_id AS "senderId",
      message,
      created_at::text AS "createdAt"
  `;

  return NextResponse.json({ message: rows[0] });
}
