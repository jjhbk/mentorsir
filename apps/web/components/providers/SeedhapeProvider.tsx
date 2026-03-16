"use client";

import { SeedhaPeProvider } from "@seedhape/react";
import type { CreateOrderOptions, OrderData } from "@seedhape/sdk";
import type { ReactNode } from "react";

// Thin client wrapper so @seedhape/react is never evaluated server-side.
export function SeedhapeProvider({
  children,
  onCreateOrder,
}: {
  children: ReactNode;
  onCreateOrder: (opts: CreateOrderOptions) => Promise<OrderData>;
}) {
  return (
    <SeedhaPeProvider
      onCreateOrder={onCreateOrder}
      baseUrl={process.env.NEXT_PUBLIC_SEEDHAPE_API_URL ?? "https://api.seedhape.com"}
    >
      {children}
    </SeedhaPeProvider>
  );
}
