"use client";

import { useRef, useState } from "react";
import { PaymentButton } from "@seedhape/react";
import { useRouter } from "next/navigation";
import type { PaymentResult } from "@seedhape/sdk";

export default function DashboardTopBar({
  roleLabel,
  showBuyPlans,
  profileName,
  profileMobile,
  profileTelegramId,
  initialOpen = false,
}: {
  roleLabel: string;
  showBuyPlans: boolean;
  profileName?: string | null;
  profileMobile?: string | null;
  profileTelegramId?: string | null;
  initialOpen?: boolean;
}) {
  const [plansOpen, setPlansOpen] = useState(initialOpen);
  const [profileOpen, setProfileOpen] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const handledSuccessRef = useRef(false);
  const router = useRouter();

  const handleSuccess = () => {
    if (handledSuccessRef.current) return;
    handledSuccessRef.current = true;
    setCheckoutError(null);
    setPlansOpen(false);
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
                onClick={() => {
                  handledSuccessRef.current = false;
                  setPlansOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-primary-dark"
              >
                Buy Plans
              </button>
            )}
            <button
              type="button"
              onClick={() => setProfileOpen(true)}
              aria-label="Open profile"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-text-muted transition hover:border-primary hover:text-text"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-4.5 w-4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21a8 8 0 0 0-16 0" />
                <circle cx="12" cy="8" r="4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {profileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-white p-6 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Profile</p>
                <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-text">Edit details</h2>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-text-muted">
                  {roleLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setProfileOpen(false)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:text-text"
              >
                Close
              </button>
            </div>

            <form action="/api/profile" method="post" className="mt-6 grid gap-3">
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Name
                <input
                  name="name"
                  defaultValue={profileName ?? ""}
                  placeholder="Full name"
                  className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-text"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Phone
                <input
                  name="mobile"
                  type="tel"
                  defaultValue={profileMobile ?? ""}
                  placeholder="Phone number"
                  pattern="(?:\+91[\s-]?)?[6-9][0-9]{9}"
                  title="Enter a valid 10-digit Indian mobile number (optional +91)"
                  className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-text"
                />
              </label>
              <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                Telegram ID
                <input
                  name="telegramId"
                  defaultValue={profileTelegramId ?? ""}
                  placeholder="@username"
                  className="rounded-xl border border-border bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-text"
                />
              </label>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  className="inline-flex rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-primary-dark"
                >
                  Save Profile
                </button>
              </div>
            </form>

            <div className="mt-5 border-t border-border pt-5">
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="inline-flex rounded-full border border-border px-5 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-text transition hover:border-primary"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {plansOpen && (
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
                onClick={() => setPlansOpen(false)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text-muted transition hover:text-text"
              >
                Close
              </button>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <PlanPaymentCard
                amount={200}
                title="Pre Training Program"
                subtitle="3 Months · UPSC Prelims track"
                priceLabel="₹5,999"
                description="Pre Training Program subscription"
                metadata={{ planCode: "ptp_3m" }}
                onSuccess={handleSuccess}
                onExpired={handleExpired}
              />
              <PlanPaymentCard
                amount={300}
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
