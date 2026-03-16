import { PRICING } from "@/lib/constants";

export default function PricingSection() {
  return (
    <section id="pricing" className="px-5 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Pricing</p>
        <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.3rem)] font-bold leading-[1.02] tracking-tight text-text">
          One plan. Everything included.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-muted sm:text-base">
          GS, CSAT, current affairs, and personalized guidance are bundled together.
          Compared with separate purchases, this is a {PRICING.discount}% value advantage.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <article className="rounded-3xl border border-border bg-white p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Returning students</p>
            <p className="mt-3 font-display text-[clamp(2.6rem,6vw,4rem)] font-bold tracking-tight text-text">
              ₹{PRICING.returning.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Save ₹{(PRICING.original - PRICING.returning).toLocaleString("en-IN")} compared to standalone modules.
            </p>
            <a
              href="/enroll"
              className="mt-7 inline-flex w-full items-center justify-center rounded-full border border-text px-6 py-3 text-sm font-semibold text-text transition-colors hover:bg-text hover:text-white"
            >
              Continue as returning student
            </a>
          </article>

          <article className="rounded-3xl bg-text p-8 text-white shadow-xl shadow-black/10">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">New students</p>
              <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white">
                Recommended
              </span>
            </div>
            <p className="mt-3 font-display text-[clamp(2.6rem,6vw,4rem)] font-bold tracking-tight text-white">
              ₹{PRICING.new.toLocaleString("en-IN")}
            </p>
            <p className="mt-2 text-sm text-white/70">
              Save ₹{(PRICING.original - PRICING.new).toLocaleString("en-IN")} compared to standalone modules.
            </p>
            <a
              href="/enroll"
              className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-dark"
            >
              Join this cohort
            </a>
          </article>
        </div>

        <div className="mt-6 rounded-2xl border border-border bg-surface p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Included modules</p>
          <div className="mt-3 flex flex-wrap gap-3">
            {PRICING.modules.map((module) => (
              <span key={module.name} className="rounded-full border border-border px-3 py-1 text-xs text-text-muted">
                {module.name} · <span className="line-through">₹{module.price.toLocaleString("en-IN")}</span>
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs text-text-muted">7-day refund window for serious aspirants.</p>
        </div>
      </div>
    </section>
  );
}
