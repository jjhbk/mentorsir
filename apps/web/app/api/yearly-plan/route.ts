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
  const month = (form.get("month")?.toString() ?? "").trim().toUpperCase();

  if (!month) {
    return NextResponse.json({ error: "Month is required" }, { status: 400 });
  }

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
      ${user.id}::uuid,
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
      updated_at = CURRENT_TIMESTAMP
  `;

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
