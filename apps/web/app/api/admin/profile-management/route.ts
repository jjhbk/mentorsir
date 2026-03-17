import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

function normalizeText(value: FormDataEntryValue | null): string | null {
  const text = value?.toString().trim() ?? "";
  return text ? text : null;
}

function isValidIndianMobile(value: string): boolean {
  return /^(?:\+91[\s-]?)?[6-9]\d{9}$/.test(value);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const formData = await request.formData();
  const profileId = formData.get("profileId")?.toString();
  const targetRole = formData.get("targetRole")?.toString();
  const name = normalizeText(formData.get("name"));
  const mobile = normalizeText(formData.get("mobile"));
  const telegramId = normalizeText(formData.get("telegramId"));
  const mentorIdInput = normalizeText(formData.get("mentorId"));

  if (!profileId || (targetRole !== "student" && targetRole !== "mentor")) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (mobile && !isValidIndianMobile(mobile)) {
    return NextResponse.json(
      { error: "Invalid mobile number. Use a valid 10-digit Indian number." },
      { status: 400 }
    );
  }

  const existing = await prisma.profile.findUnique({
    where: { id: profileId },
    select: { id: true, role: true },
  });

  if (!existing || existing.role !== targetRole) {
    return NextResponse.json({ error: "Profile role mismatch" }, { status: 400 });
  }

  if (targetRole === "student") {
    if (mentorIdInput === profileId) {
      return NextResponse.json({ error: "Student cannot mentor themselves" }, { status: 400 });
    }

    let validatedMentorId: string | null = null;
    if (mentorIdInput) {
      const mentor = await prisma.profile.findUnique({
        where: { id: mentorIdInput },
        select: { id: true, role: true },
      });
      if (!mentor || mentor.role !== "mentor") {
        return NextResponse.json({ error: "Invalid mentor" }, { status: 400 });
      }
      validatedMentorId = mentor.id;
    }

    await prisma.profile.update({
      where: { id: profileId },
      data: {
        name,
        mobile,
        telegramId,
        mentorId: validatedMentorId,
      },
    });
  } else {
    await prisma.profile.update({
      where: { id: profileId },
      data: {
        name,
        mobile,
        telegramId,
      },
    });
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
