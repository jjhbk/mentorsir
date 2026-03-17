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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const name = normalizeText(formData.get("name"));
  const mobile = normalizeText(formData.get("mobile"));
  const telegramId = normalizeText(formData.get("telegramId"));

  if (mobile && !isValidIndianMobile(mobile)) {
    return NextResponse.json(
      { error: "Invalid mobile number. Use a valid 10-digit Indian number." },
      { status: 400 }
    );
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
      },
    });
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
