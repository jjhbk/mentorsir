import Link from "next/link";

interface Props {
  searchParams: Promise<{ name?: string }>;
}

const nextSteps = [
  "We review your intake form (within 24 hours)",
  "You receive a WhatsApp message with payment link",
  "Complete payment to unlock the full program",
  "Start your personalized study plan in the app",
] as const;

export default async function EnrollSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const name = params.name ?? "there";

  return (
    <div className="min-h-screen px-4 py-12 sm:py-16">
      <div className="mx-auto w-full max-w-2xl rounded-[2rem] border border-border bg-surface p-7 text-center shadow-xl shadow-black/5 sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-3xl">
          🎉
        </div>

        <h1 className="font-display text-4xl font-bold tracking-tight text-text sm:text-5xl">
          Welcome, {decodeURIComponent(name)}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-muted sm:text-base">
          Your application has been received. We will review your details and contact you
          on WhatsApp within 24 hours with your onboarding and payment instructions.
        </p>

        <div className="mt-8 rounded-3xl border border-border bg-white p-5 text-left sm:p-6">
          {nextSteps.map((step, idx) => (
            <div
              key={step}
              className={`flex items-start gap-3 py-3 ${
                idx < nextSteps.length - 1 ? "border-b border-border/70" : ""
              }`}
            >
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                {idx + 1}
              </span>
              <p className="text-sm leading-relaxed text-text-muted">{step}</p>
            </div>
          ))}
        </div>

        <a
          href="https://wa.me/918826629459?text=Hi%2C%20I%20just%20filled%20the%20PTP%202.0%20enrollment%20form%20for%20MentorSir!"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#24A148] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1f8e3f]"
        >
          Message us on WhatsApp <span aria-hidden>→</span>
        </a>

        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-7 py-3.5 text-sm font-semibold text-text transition hover:border-primary"
        >
          Go to Dashboard <span aria-hidden>→</span>
        </Link>

        <Link
          href="/"
          className="mt-5 block text-sm font-medium text-text-muted transition hover:text-text"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
