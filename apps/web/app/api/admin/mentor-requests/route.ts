import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await request.formData();
  const requestId = formData.get("requestId")?.toString();
  const userId = formData.get("userId")?.toString();
  const decision = formData.get("decision")?.toString();
  const reason = formData.get("reason")?.toString() ?? null;

  if (!requestId || !userId || (decision !== "approve" && decision !== "reject")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const now = new Date();

  if (decision === "approve") {
    await prisma.$executeRaw`
      UPDATE mentor_access_requests
      SET
        status = 'approved'::"MentorRequestStatus",
        reviewed_at = ${now},
        reviewed_by = ${user.id}::uuid,
        rejection_reason = NULL
      WHERE id = ${requestId}::uuid
    `;

    await prisma.$executeRaw`
      INSERT INTO profiles (id, role)
      VALUES (${userId}::uuid, 'mentor'::"Role")
      ON CONFLICT (id)
      DO UPDATE SET role = 'mentor'::"Role"
    `;
  } else {
    await prisma.$executeRaw`
      UPDATE mentor_access_requests
      SET
        status = 'rejected'::"MentorRequestStatus",
        reviewed_at = ${now},
        reviewed_by = ${user.id}::uuid,
        rejection_reason = ${reason}
      WHERE id = ${requestId}::uuid
    `;
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
