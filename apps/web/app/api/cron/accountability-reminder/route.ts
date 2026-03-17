import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function getIstDateAndHour(now = new Date()): { date: string; hour: number } {
  const dateParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const year = dateParts.find((part) => part.type === "year")?.value ?? "1970";
  const month = dateParts.find((part) => part.type === "month")?.value ?? "01";
  const day = dateParts.find((part) => part.type === "day")?.value ?? "01";
  const date = `${year}-${month}-${day}`;

  const hourText = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    hour12: false,
  }).format(now);

  return { date, hour: Number.parseInt(hourText, 10) };
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const expectedToken = process.env.CRON_SECRET;

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get("force") === "1";
  const now = new Date();
  const { date: istDate, hour: istHour } = getIstDateAndHour(now);

  if (!force && istHour !== 22) {
    return NextResponse.json({
      ok: true,
      skipped: true,
      reason: "Outside 10-11 PM IST window",
      istDate,
      istHour,
    });
  }

  const reminderMessage = "Reminder: Please fill today's daily accountability log before you sleep.";

  const inserted = await prisma.$executeRaw`
    INSERT INTO chat_messages (
      mentor_id,
      student_id,
      sender_id,
      message
    )
    SELECT
      student.mentor_id,
      student.id,
      student.mentor_id,
      ${reminderMessage}
    FROM profiles AS student
    WHERE student.role = 'student'::"Role"
      AND student.mentor_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1
        FROM daily_logs AS d
        WHERE d.user_id = student.id
          AND d.date = ${istDate}::date
      )
      AND NOT EXISTS (
        SELECT 1
        FROM chat_messages AS c
        WHERE c.student_id = student.id
          AND c.sender_id = student.mentor_id
          AND c.message = ${reminderMessage}
          AND c.created_at::date = ${istDate}::date
      )
  `;

  return NextResponse.json({
    ok: true,
    skipped: false,
    istDate,
    istHour,
    remindersInserted: inserted,
  });
}
