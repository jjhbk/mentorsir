import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function toFloat(value: FormDataEntryValue | null, fallback = 0): number {
  const parsed = Number.parseFloat(value?.toString() ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toInt(value: FormDataEntryValue | null, fallback = 0): number {
  const parsed = Number.parseInt(value?.toString() ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

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
  const date = form.get("date")?.toString() ?? new Date().toISOString().slice(0, 10);
  const studyHours = toFloat(form.get("studyHours"));
  const sleepHours = toFloat(form.get("sleepHours"));
  const meditationMinutes = toInt(form.get("meditationMinutes"));
  const sleepTime = toText(form.get("sleepTime"));
  const wakeTime = toText(form.get("wakeTime"));
  const afternoonNapMinutes = toInt(form.get("afternoonNapMinutes"));
  const reasonNotStudying = toText(form.get("reasonNotStudying"));
  const feelingToday = toText(form.get("feelingToday"));
  const relaxationActivity = toText(form.get("relaxationActivity"));
  const taskCompletedRaw = form.get("taskCompleted")?.toString() ?? "";
  const taskCompleted =
    taskCompletedRaw === "yes" || taskCompletedRaw === "no" || taskCompletedRaw === "partial"
      ? taskCompletedRaw
      : null;

  await prisma.$executeRaw`
    INSERT INTO daily_logs (
      user_id,
      date,
      study_hours,
      sleep_hours,
      meditation_minutes,
      sleep_time,
      wake_time,
      task_completed,
      afternoon_nap_minutes,
      reason_not_studying,
      feeling_today,
      relaxation_activity
    )
    VALUES (
      ${user.id}::uuid,
      ${date}::date,
      ${studyHours},
      ${sleepHours},
      ${meditationMinutes},
      ${sleepTime},
      ${wakeTime},
      ${taskCompleted}::"TaskStatus",
      ${afternoonNapMinutes},
      ${reasonNotStudying},
      ${feelingToday},
      ${relaxationActivity}
    )
    ON CONFLICT (user_id, date)
    DO UPDATE SET
      study_hours = EXCLUDED.study_hours,
      sleep_hours = EXCLUDED.sleep_hours,
      meditation_minutes = EXCLUDED.meditation_minutes,
      sleep_time = EXCLUDED.sleep_time,
      wake_time = EXCLUDED.wake_time,
      task_completed = EXCLUDED.task_completed,
      afternoon_nap_minutes = EXCLUDED.afternoon_nap_minutes,
      reason_not_studying = EXCLUDED.reason_not_studying,
      feeling_today = EXCLUDED.feeling_today,
      relaxation_activity = EXCLUDED.relaxation_activity
  `;

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
