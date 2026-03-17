import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function toInt(value: FormDataEntryValue | null, fallback = 0): number {
  const parsed = Number.parseInt(value?.toString() ?? "", 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toFloat(value: FormDataEntryValue | null, fallback = 0): number {
  const parsed = Number.parseFloat(value?.toString() ?? "");
  return Number.isFinite(parsed) ? parsed : fallback;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await request.formData();
  const testName = form.get("testName")?.toString().trim();
  const date = form.get("date")?.toString() ?? new Date().toISOString().slice(0, 10);
  const score = toFloat(form.get("score"));
  const totalQuestions = toInt(form.get("totalQuestions"));

  if (!testName) return NextResponse.json({ error: "Test name required" }, { status: 400 });

  await prisma.$executeRaw`
    INSERT INTO test_results (
      user_id,
      test_name,
      date,
      score,
      total_questions,
      mistake_conceptual,
      mistake_recall,
      mistake_reading,
      mistake_elimination,
      mistake_decision_making,
      mistake_silly,
      mistake_psychological,
      mistake_pattern_misjudgment
    )
    VALUES (
      ${user.id}::uuid,
      ${testName},
      ${date}::date,
      ${score},
      ${totalQuestions},
      ${toInt(form.get("mistakeConceptual"))},
      ${toInt(form.get("mistakeRecall"))},
      ${toInt(form.get("mistakeReading"))},
      ${toInt(form.get("mistakeElimination"))},
      ${toInt(form.get("mistakeDecisionMaking"))},
      ${toInt(form.get("mistakeSilly"))},
      ${toInt(form.get("mistakePsychological"))},
      ${toInt(form.get("mistakePatternMisjudgment"))}
    )
  `;

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
