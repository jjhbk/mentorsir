import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

type YearlyPlanAction = "save" | "lock" | "request-edit" | "approve-edit";

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
  const action = (form.get("action")?.toString() ?? "save") as YearlyPlanAction;
  const targetUserIdInput = form.get("targetUserId")?.toString().trim() ?? "";
  const targetUserId = targetUserIdInput || user.id;
  const month = (form.get("month")?.toString() ?? "").trim().toUpperCase();

  if (
    action !== "save" &&
    action !== "lock" &&
    action !== "request-edit" &&
    action !== "approve-edit"
  ) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  if (!month) {
    return NextResponse.json({ error: "Month is required" }, { status: 400 });
  }

  const roleRows = await prisma.$queryRaw<{ role: "student" | "mentor" | null }[]>`
    SELECT role::text AS role
    FROM profiles
    WHERE id = ${user.id}::uuid
    LIMIT 1
  `;
  const actorRole = roleRows[0]?.role ?? "student";
  const actingOnOtherUser = targetUserId !== user.id;

  if (actingOnOtherUser) {
    if (actorRole !== "mentor") {
      return NextResponse.json({ error: "Only mentors can edit student yearly plans" }, { status: 403 });
    }

    const relation = await prisma.$queryRaw<{ id: string }[]>`
      SELECT id
      FROM profiles
      WHERE id = ${targetUserId}::uuid
        AND role = 'student'::"Role"
        AND mentor_id = ${user.id}::uuid
      LIMIT 1
    `;
    if (!relation[0]) {
      return NextResponse.json({ error: "Student is not assigned to this mentor" }, { status: 403 });
    }
  }

  const existingRows = await prisma.$queryRaw<{
    id: string;
    isLocked: boolean;
    studentEditRequestPending: boolean;
  }[]>`
    SELECT
      id,
      is_locked AS "isLocked",
      student_edit_request_pending AS "studentEditRequestPending"
    FROM yearly_plan_entries
    WHERE user_id = ${targetUserId}::uuid
      AND month = ${month}
    LIMIT 1
  `;
  const existing = existingRows[0];

  if (action === "request-edit") {
    if (actorRole !== "student" || actingOnOtherUser) {
      return NextResponse.json({ error: "Only students can request yearly-plan edits" }, { status: 403 });
    }
    if (!existing) {
      return NextResponse.json({ error: "Create a month plan first" }, { status: 400 });
    }
    if (!existing.isLocked) {
      return NextResponse.json({ error: "This month plan is not fixed yet" }, { status: 400 });
    }

    await prisma.$executeRaw`
      UPDATE yearly_plan_entries
      SET
        student_edit_request_pending = true,
        student_edit_request_note = ${toText(form.get("requestNote"))},
        student_edit_request_requested_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user.id}::uuid
        AND month = ${month}
    `;
    return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
  }

  if (action === "approve-edit") {
    if (actorRole !== "mentor" || !actingOnOtherUser) {
      return NextResponse.json({ error: "Only assigned mentors can approve edit requests" }, { status: 403 });
    }
    if (!existing) {
      return NextResponse.json({ error: "Yearly plan entry not found" }, { status: 404 });
    }

    await prisma.$executeRaw`
      UPDATE yearly_plan_entries
      SET
        is_locked = false,
        student_edit_request_pending = false,
        student_edit_request_note = NULL,
        student_edit_request_requested_at = NULL,
        student_edit_request_reviewed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${targetUserId}::uuid
        AND month = ${month}
    `;
    return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
  }

  if (action === "lock") {
    if (!existing) {
      return NextResponse.json({ error: "Create a month plan before fixing it" }, { status: 400 });
    }

    await prisma.$executeRaw`
      UPDATE yearly_plan_entries
      SET
        is_locked = true,
        student_edit_request_pending = false,
        student_edit_request_note = NULL,
        student_edit_request_requested_at = NULL,
        student_edit_request_reviewed_at = CURRENT_TIMESTAMP,
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${targetUserId}::uuid
        AND month = ${month}
    `;
    return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
  }

  if (actorRole === "student" && !actingOnOtherUser && existing?.isLocked) {
    return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
  }

  const mentorSave = actorRole === "mentor" && actingOnOtherUser;
  await prisma.$executeRaw`
    INSERT INTO yearly_plan_entries (
      user_id,
      month,
      subject_1,
      subject_2,
      subject_3,
      notes
    )
    VALUES (
      ${targetUserId}::uuid,
      ${month},
      ${toText(form.get("subject1"))},
      ${toText(form.get("subject2"))},
      ${toText(form.get("subject3"))},
      ${toText(form.get("notes"))}
    )
    ON CONFLICT (user_id, month)
    DO UPDATE SET
      subject_1 = EXCLUDED.subject_1,
      subject_2 = EXCLUDED.subject_2,
      subject_3 = EXCLUDED.subject_3,
      notes = EXCLUDED.notes,
      student_edit_request_pending = CASE
        WHEN ${mentorSave} THEN false
        ELSE yearly_plan_entries.student_edit_request_pending
      END,
      student_edit_request_note = CASE
        WHEN ${mentorSave} THEN NULL
        ELSE yearly_plan_entries.student_edit_request_note
      END,
      student_edit_request_requested_at = CASE
        WHEN ${mentorSave} THEN NULL
        ELSE yearly_plan_entries.student_edit_request_requested_at
      END,
      student_edit_request_reviewed_at = CASE
        WHEN ${mentorSave} THEN CURRENT_TIMESTAMP
        ELSE yearly_plan_entries.student_edit_request_reviewed_at
      END,
      updated_at = CURRENT_TIMESTAMP
  `;

  return NextResponse.redirect(new URL("/dashboard", request.url), { status: 303 });
}
