import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

  if (!user) {
    return NextResponse.redirect(new URL("/enroll", request.url), { status: 303 });
  }

  const formData = await request.formData();
  const name = normalizeText(formData.get("name"));
  const mobile = normalizeText(formData.get("mobile"));
  const telegramId = normalizeText(formData.get("telegramId"));
  const telegramGroupLink = normalizeText(formData.get("telegramGroupLink"));
  const whatsappGroupLink = normalizeText(formData.get("whatsappGroupLink"));

  if (mobile && !isValidIndianMobile(mobile)) {
    return NextResponse.redirect(new URL("/dashboard?profileError=invalid_mobile", request.url), {
      status: 303,
    });
  }

  const existingProfile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (existingProfile) {
    await prisma.profile.update({
      where: { id: user.id },
      data: {
        name,
        mobile,
        telegramId,
        telegramGroupLink,
        whatsappGroupLink,
      },
    });
  } else {
    await prisma.profile.create({
      data: {
        id: user.id,
        role: "student",
        name:
          name ??
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email ??
          "User",
        mobile,
        telegramId,
        telegramGroupLink,
        whatsappGroupLink,
      },
    });
  }

  return NextResponse.redirect(new URL("/dashboard?profileSaved=1", request.url), { status: 303 });
}
