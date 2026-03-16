import { FAQS } from "@/lib/constants";

export default function FAQSection() {
  return (
    <section id="faq" className="px-5 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-[280px_1fr]">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">FAQ</p>
          <h2 className="mt-4 font-display text-[clamp(2rem,5vw,3.1rem)] font-bold leading-[1.04] tracking-tight text-text">
            Answers before you commit.
          </h2>
        </div>

        <div className="rounded-3xl border border-border bg-white/90 p-2 sm:p-3">
          {FAQS.map((faq) => (
            <details key={faq.q} className="group rounded-2xl px-4 py-3 open:bg-surface-soft/70">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left">
                <span className="text-sm font-semibold text-text sm:text-base">{faq.q}</span>
                <span className="mt-0.5 text-lg font-light leading-none text-text-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="pt-3 text-sm leading-relaxed text-text-muted">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
