import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
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

  const roleRows = await prisma.$queryRaw<{ role: string }[]>`
    SELECT role::text AS role FROM profiles WHERE id = ${user.id}::uuid LIMIT 1
  `;
  const role = roleRows[0]?.role;
  const isAdmin = isAdminEmail(user.email);
  if (!isAdmin && role !== "mentor") {
    return NextResponse.json({ error: "Only mentors/admin can update resources" }, { status: 403 });
  }

  const form = await request.formData();
  const subject = toText(form.get("subject"));
  if (!subject) {
    return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  }

  await prisma.$executeRaw`
    INSERT INTO resource_mapping_entries (
      owner_id,
      subject,
      part,
      resource,
      prelims_pyq_practice,
      mains_pyq
    )
    VALUES (
      ${user.id}::uuid,
      ${subject},
      ${toText(form.get("part"))},
      ${toText(form.get("resource"))},
      ${toText(form.get("prelimsPyqPractice"))},
      ${toText(form.get("mainsPyq"))}
    )
  `;

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
