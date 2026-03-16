const TESTIMONIALS = [
  {
    quote:
      "The daily accountability log changed everything. I finally stopped lying to myself about how many hours I actually studied.",
    name: "Priya S.",
    detail: "UPSC Aspirant · 2nd Attempt",
  },
  {
    quote:
      "Mindset sessions helped me stop panicking in mocks. My score moved from 72 to 91 in six weeks.",
    name: "Rahul M.",
    detail: "UPSC Aspirant · 1st Attempt",
  },
  {
    quote:
      "I feared CSAT. The way mentors broke it down made me consistently score 80+ in practice.",
    name: "Ananya K.",
    detail: "Engineering background",
  },
] as const;

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="px-5 py-20 sm:px-6 sm:py-24">
      <div className="mx-auto w-full max-w-6xl">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Student voices</p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <article key={testimonial.name} className="glass rounded-3xl p-7 sm:p-8">
              <p className="font-display text-6xl leading-none text-primary/25" aria-hidden>
                “
              </p>
              <p className="mt-2 text-base leading-relaxed text-text sm:text-lg">{testimonial.quote}</p>
              <div className="mt-7 border-t border-border pt-4">
                <p className="font-semibold text-text">{testimonial.name}</p>
                <p className="text-xs text-text-muted">{testimonial.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
