import Link from "next/link";

const plans = [
  {
    code: "ptp_3m",
    title: "Prelims Mentoring Program 2.0",
    subtitle: "Experience the power of right mentorship",
    duration: "3 Months",
    description:
      "A holistic, exam-oriented UPSC Prelims program designed to take you safely from uncertainty in Prelims (60–80 zone) to confident 100+ score.",
    features: [
      "GS: PYQ-first GS preparation with mentor connect & smart elimination strategies",
      "CSAT: IIT & IIM-led CSAT ensuring safe qualification with confidence",
      "Current Affairs: 1.5-year integrated, Prelims-focused current affairs with smart revision",
      "Mentorship: Guidance by selected candidates with psychology support for exam resilience",
    ],
    oldPrice: "₹11,999",
    currentPrice: "₹6,999",
    featured: false,
  },
  {
    code: "mtp_2_3m",
    title: "Mains Training Program 2.0",
    subtitle: "Experience the power of right mentorship",
    duration: "3 Months",
    description:
      "MentorSir MTP 2.0 blends answer writing, mentorship & mindfulness to build clarity, focus, and discipline - guiding aspirants to write better and grow consistently.",
    features: [
      "Mentorship",
      "Techniques of Answer Writing",
      "Daily Tracking",
      "Thematic Test",
      "Peer Group Learning",
      "Meditation",
    ],
    oldPrice: "₹24,000",
    currentPrice: "₹11,999",
    featured: true,
  },
] as const;

export default function PricingSection() {
  return (
    <section id="pricing" className="px-5 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Plans & Pricing</p>
        <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.3rem)] font-bold leading-[1.02] tracking-tight text-text">
          Two focused tracks. One mentorship philosophy.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          Pick the right plan for your preparation stage. You can enroll from here or activate
          directly from your dashboard.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.code}
              className={plan.featured ? "rounded-3xl bg-text p-8 text-white shadow-xl shadow-black/10" : "rounded-3xl border border-border bg-white p-8"}
            >
              <div className="flex items-center justify-between gap-4">
                <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${plan.featured ? "text-white/70" : "text-text-muted"}`}>
                  {plan.duration}
                </p>
                {plan.featured && (
                  <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                    Popular
                  </span>
                )}
              </div>

              <h3 className={`mt-3 font-display text-4xl font-bold tracking-tight ${plan.featured ? "text-white" : "text-text"}`}>
                {plan.title}
              </h3>
              <p className={`mt-1 text-sm ${plan.featured ? "text-white/75" : "text-text-muted"}`}>{plan.subtitle}</p>

              <p className={`mt-4 text-sm leading-relaxed ${plan.featured ? "text-white/75" : "text-text-muted"}`}>
                {plan.description}
              </p>

              <ul className="mt-5 space-y-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className={`flex items-start gap-2 text-sm ${plan.featured ? "text-white/90" : "text-text"}`}>
                    <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${plan.featured ? "bg-white/85" : "bg-primary"}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-end gap-3">
                <span className={`text-sm line-through ${plan.featured ? "text-white/55" : "text-text-muted"}`}>{plan.oldPrice}</span>
                <span className={`font-display text-[clamp(2.6rem,6vw,4rem)] font-bold tracking-tight ${plan.featured ? "text-white" : "text-text"}`}>
                  {plan.currentPrice}
                </span>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <Link
                  href={`/dashboard?buy=${plan.code}`}
                  className={plan.featured ? "inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition hover:bg-accent-dark" : "inline-flex items-center justify-center gap-2 rounded-full bg-text px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark"}
                >
                  Enroll Now <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/dashboard"
                  className={plan.featured ? "inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10" : "inline-flex items-center justify-center gap-2 rounded-full border border-text px-6 py-3 text-sm font-semibold text-text transition hover:bg-text hover:text-white"}
                >
                  Buy from Dashboard
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
