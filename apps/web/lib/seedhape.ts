import "server-only";
import { SeedhaPe } from "@seedhape/sdk";

function getClient(): SeedhaPe {
  if (!process.env.SEEDHAPE_API_KEY) throw new Error("SEEDHAPE_API_KEY is not set");
  return new SeedhaPe({
    apiKey: process.env.SEEDHAPE_API_KEY,
    baseUrl: process.env.SEEDHAPE_BASE_URL,
  });
}

export interface CreateOrderParams {
  amount: number;
  description?: string;
  externalOrderId?: string;
  expectedSenderName?: string;
  customerEmail?: string;
  customerPhone?: string;
  expiresInMinutes?: number;
  metadata?: Record<string, unknown>;
}

export async function createOrder(params: CreateOrderParams) {
  return getClient().createOrder(params);
}

export async function getOrderStatus(orderId: string) {
  return getClient().getOrderStatus(orderId);
}
