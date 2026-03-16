"use client";

import { useState } from "react";
import { PaymentButton, SeedhaPeProvider } from "@seedhape/react";
import { useRouter } from "next/navigation";
import type { CreateOrderOptions, OrderData, PaymentResult } from "@seedhape/sdk";

export default function DashboardTopBar({
  roleLabel,
  showBuyPlans,
  initialOpen = false,
}: {
  roleLabel: string;
  showBuyPlans: boolean;
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const router = useRouter();

  const createOrder = async (opts: CreateOrderOptions): Promise<OrderData> => {
    setCheckoutError(null);
    const response = await fetch("/api/payments/seedhape/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });

    const data = (await response.json().catch(() => null)) as (OrderData & { error?: string }) | null;

    if (!response.ok || !data?.id) {
      throw new Error(data?.error ?? "Could not start payment");
    }

    return data;
  };

  const handleSuccess = () => {
    setCheckoutError(null);
    setOpen(false);
    router.refresh();
  };

  const handleExpired = () => {
    setCheckoutError("Payment session expired. Please try again.");
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-6">
          <span className="font-display text-2xl font-bold tracking-tight text-text">MentorSir</span>
          <div className="flex items-center gap-3 sm:gap-5">
            {showBuyPlans && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-primary-dark"
              >
                Buy Plans
              </button>
            )}
            <span className="rounded-full border border-border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">
              {roleLabel}
            </span>
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="cursor-pointer text-sm font-medium text-text-muted transition hover:text-text"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      {open && (
        <SeedhaPeProvider onCreateOrder={createOrder}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4" role="dialog" aria-modal="true">
            <div className="w-full max-w-xl rounded-3xl border border-border bg-white p-6 shadow-2xl sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Buy Plans</p>
                  <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-text">Choose a plan</h2>
                  <p className="mt-1 text-sm text-text-muted">
                    Secure checkout powered by SeedhaPe. Access activates after verified payment.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:text-text"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <PlanPaymentCard
                  amount={599900}
                  title="Pre Training Program"
                  subtitle="3 Months · UPSC Prelims track"
                  priceLabel="₹5,999"
                  description="Pre Training Program subscription"
                  metadata={{ planCode: "ptp_3m" }}
                  onSuccess={handleSuccess}
                  onExpired={handleExpired}
                />
                <PlanPaymentCard
                  amount={1199900}
                  title="Mains Training Program 2.0"
                  subtitle="3 Months · Answer writing track"
                  priceLabel="₹11,999"
                  description="Mains Training Program 2.0 subscription"
                  metadata={{ planCode: "mtp_2_3m" }}
                  onSuccess={handleSuccess}
                  onExpired={handleExpired}
                />
              </div>
              {checkoutError && <p className="mt-4 text-xs font-medium text-danger">{checkoutError}</p>}
            </div>
          </div>
        </SeedhaPeProvider>
      )}
    </>
  );
}

function PlanPaymentCard({
  amount,
  title,
  subtitle,
  priceLabel,
  description,
  metadata,
  onSuccess,
  onExpired,
}: {
  amount: number;
  title: string;
  subtitle: string;
  priceLabel: string;
  description: string;
  metadata: Record<string, unknown>;
  onSuccess: (result: PaymentResult) => void;
  onExpired: (orderId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-sm font-semibold text-text">{title}</p>
      <p className="mt-1 text-xs text-text-muted">{subtitle}</p>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-text">{priceLabel}</p>
      <PaymentButton
        amount={amount}
        description={description}
        metadata={metadata}
        onSuccess={onSuccess}
        onExpired={onExpired}
        className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark"
      >
        Buy Now
      </PaymentButton>
    </div>
  );
}
