import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PLAN_DETAILS, isPlanCode, type PlanCode } from "@/lib/plans";

type SeedhaPeWebhookEvent =
  | "order.verified"
  | "order.expired"
  | "order.disputed"
  | "order.resolved";

type SeedhaPeWebhookPayload = {
  event: SeedhaPeWebhookEvent;
  timestamp?: string;
  data?: {
    orderId?: string;
    externalOrderId?: string;
    amount?: number;
    status?: string;
    verifiedAt?: string;
    metadata?: Record<string, unknown>;
  };
};

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  if (!signature.startsWith("sha256=")) return false;
  const expected =
    "sha256=" + crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

function toOrderStatus(
  event: SeedhaPeWebhookEvent,
  rawStatus?: string
): "created" | "pending" | "verified" | "disputed" | "resolved" | "expired" | "rejected" {
  const normalized = rawStatus?.toLowerCase();

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

  if (event === "order.verified") return "verified";
  if (event === "order.expired") return "expired";
  if (event === "order.disputed") return "disputed";
  return "resolved";
}

function isResolvedSuccess(rawStatus?: string): boolean {
  const normalized = rawStatus?.toLowerCase();
  return normalized === "resolved" || normalized === "verified" || !normalized;
}

export async function POST(request: Request) {
  const webhookSecret = process.env.SEEDHAPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("SeedhaPe webhook secret missing");
    return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
  }

  const signature = request.headers.get("x-seedhape-signature") ?? "";
  const rawBody = await request.text();

  if (!verifySignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: SeedhaPeWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as SeedhaPeWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { event, data } = payload;
  const orderId = data?.orderId;
  if (!event || !orderId) {
    return NextResponse.json({ error: "Missing event or orderId" }, { status: 400 });
  }

  const seedhaStatus =
    event === "order.resolved" && data?.status?.toLowerCase() === "rejected"
      ? "rejected"
      : toOrderStatus(event, data?.status);

  try {
    const order =
      (await prisma.seedhaPeOrder.findUnique({ where: { seedhapeOrderId: orderId } })) ??
      (data?.externalOrderId
        ? await prisma.seedhaPeOrder.findUnique({
            where: { externalOrderId: data.externalOrderId },
          })
        : null);

    if (!order) {
      console.warn("SeedhaPe webhook: order not found", { event, orderId });
      return NextResponse.json({ received: true });
    }

    await prisma.seedhaPeOrder.update({
      where: { id: order.id },
      data: {
        status: seedhaStatus,
        verifiedAt:
          seedhaStatus === "verified" || seedhaStatus === "resolved"
            ? data?.verifiedAt
              ? new Date(data.verifiedAt)
              : order.verifiedAt ?? new Date()
            : order.verifiedAt,
      },
    });

    const shouldActivate =
      event === "order.verified" ||
      (event === "order.resolved" && isResolvedSuccess(data?.status));

    if (shouldActivate) {
      const metadataPlanCode =
        typeof data?.metadata?.planCode === "string" ? data.metadata.planCode : undefined;
      const metadataUserId =
        typeof data?.metadata?.userId === "string" ? data.metadata.userId : undefined;

      const planCode: PlanCode | null = isPlanCode(order.planCode)
        ? order.planCode
        : metadataPlanCode && isPlanCode(metadataPlanCode)
          ? metadataPlanCode
          : null;

      const userId = order.userId ?? metadataUserId ?? null;

      if (planCode && userId) {
        const plan = PLAN_DETAILS[planCode];
        await prisma.planSubscription.upsert({
          where: { userId_planCode: { userId, planCode } },
          update: {
            active: true,
            planName: plan.planName,
            amountInr: plan.amountInr,
          },
          create: {
            userId,
            planCode,
            planName: plan.planName,
            amountInr: plan.amountInr,
            active: true,
          },
        });
      } else {
        console.warn("SeedhaPe webhook: could not activate plan (missing user/plan)", {
          orderId,
          planCode,
          userId,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("SeedhaPe webhook handling failed", error);
    return NextResponse.json({ error: "Webhook handling failed" }, { status: 500 });
  }
}
