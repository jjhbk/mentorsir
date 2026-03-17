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
  const date = form.get("date")?.toString();
  if (!date) {
    return NextResponse.json({ error: "Date is required" }, { status: 400 });
  }

  await prisma.$executeRaw`
    INSERT INTO alternate_schedule_entries (
      user_id,
      date,
      focus,
      note
    )
    VALUES (
      ${user.id}::uuid,
      ${date}::date,
      ${toText(form.get("focus"))},
      ${toText(form.get("note"))}
    )
  `;

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
