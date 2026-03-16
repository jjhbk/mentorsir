import { NextResponse } from "next/server";
import type { OrderData } from "@seedhape/sdk";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { PLAN_DETAILS, isPlanCode } from "@/lib/plans";
import { createOrder as createSeedhapeOrder } from "@/lib/seedhape";

function mapSeedhaPeStatus(status: string) {
  const normalized = status.toLowerCase();
  if (
    normalized === "created" ||
    normalized === "pending" ||
    normalized === "verified" ||
    normalized === "disputed" ||
    normalized === "resolved" ||
    normalized === "expired" ||
    normalized === "rejected"
  ) {
    return normalized;
  }
  return "pending";
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json().catch(() => null)) as
      | {
          amount?: number;
          description?: string;
          customerEmail?: string;
          customerPhone?: string;
          expectedSenderName?: string;
          metadata?: Record<string, unknown>;
          planCode?: string;
        }
      | null;
    const metadataPlanCode =
      typeof body?.metadata?.planCode === "string" ? body.metadata.planCode : undefined;
    const planCode = body?.planCode ?? metadataPlanCode;

    if (!planCode || !isPlanCode(planCode)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name")
      .eq("id", user.id)
      .maybeSingle<{ name: string | null }>();

    const plan = PLAN_DETAILS[planCode];
    const externalOrderId = `${planCode}_${user.id}_${Date.now()}`;

    const order = await createSeedhapeOrder({
      amount: plan.amountPaise,
      description: body?.description?.trim() || `${plan.planName} subscription`,
      externalOrderId,
      expectedSenderName:
        body?.expectedSenderName?.trim() ||
        profile?.name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        undefined,
      customerEmail: body?.customerEmail?.trim() || user.email || undefined,
      customerPhone: body?.customerPhone?.trim() || undefined,
      metadata: {
        userId: user.id,
        planCode,
        ...(body?.metadata ?? {}),
      },
      expiresInMinutes: 20,
    });

    await prisma.seedhaPeOrder.create({
      data: {
        userId: user.id,
        planCode,
        planName: plan.planName,
        amountPaise: plan.amountPaise,
        externalOrderId,
        seedhapeOrderId: order.id,
        status: mapSeedhaPeStatus(order.status) as
          | "created"
          | "pending"
          | "verified"
          | "disputed"
          | "resolved"
          | "expired"
          | "rejected",
        upiUri: order.upiUri,
        qrCode: order.qrCode,
        expiresAt: order.expiresAt ? new Date(order.expiresAt) : null,
      },
    });

    const orderData: OrderData = {
      id: order.id,
      amount: typeof order.amount === "number" ? order.amount : plan.amountPaise,
      originalAmount: typeof order.originalAmount === "number" ? order.originalAmount : plan.amountPaise,
      currency: order.currency ?? "INR",
      description: order.description ?? `${plan.planName} subscription`,
      status:
        (order.status?.toUpperCase() as OrderData["status"]) ?? "PENDING",
      upiUri: order.upiUri ?? "",
      qrCode: order.qrCode ?? "",
      expiresAt: order.expiresAt ?? new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      createdAt: order.createdAt ?? new Date().toISOString(),
      expectedSenderName:
        order.expectedSenderName ??
        profile?.name ??
        (user.user_metadata?.full_name as string | undefined) ??
        (user.user_metadata?.name as string | undefined) ??
        null,
    };

    return NextResponse.json(orderData);
  } catch (error) {
    console.error("Create order API failed", error);
    return NextResponse.json({ error: "Could not start payment" }, { status: 500 });
  }
}
