import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

function normalizeText(value: unknown): string | null {
  const text = typeof value === "string" ? value.trim() : "";
  return text ? text : null;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const roleRows = await prisma.$queryRaw<{ role: "student" | "mentor" | null }[]>`
    SELECT role::text AS role
    FROM profiles
    WHERE id = ${user.id}::uuid
    LIMIT 1
  `;
  if (roleRows[0]?.role !== "mentor") {
    return NextResponse.json({ error: "Only mentors can update group links" }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as
    | { telegramGroupLink?: string; whatsappGroupLink?: string }
    | null;

  const telegramGroupLink = normalizeText(body?.telegramGroupLink);
  const whatsappGroupLink = normalizeText(body?.whatsappGroupLink);

  await prisma.profile.update({
    where: { id: user.id },
    data: {
      telegramGroupLink,
      whatsappGroupLink,
    },
  });

  return NextResponse.json({ ok: true, telegramGroupLink, whatsappGroupLink });
}
