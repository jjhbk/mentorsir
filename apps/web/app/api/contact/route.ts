import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(30),
  email: z.string().trim().email().max(160),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please provide valid contact details." },
        { status: 400 }
      );
    }

    const { name, phone, email, message } = parsed.data;

    await prisma.$executeRaw`
      INSERT INTO contact_submissions (name, phone, email, message)
      VALUES (${name}, ${phone}, ${email}, ${message})
    `;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Contact submission failed", error);
    return NextResponse.json(
      { error: "Could not submit message right now. Please try again." },
      { status: 500 }
    );
  }
}
