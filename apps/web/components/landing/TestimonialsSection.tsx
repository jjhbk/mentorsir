import Image from "next/image";

const TESTIMONIALS = [
  {
    quote:
      "The daily accountability log changed everything. I finally stopped lying to myself about how many hours I actually studied.",
    name: "Priya Sharma",
    detail: "UPSC Aspirant · 2nd Attempt",
    score: "GS mocks +14 points",
    image: "/testimonials/priya.svg",
  },
  {
    quote:
      "Mindset sessions helped me stop panicking in mocks. My score moved from 72 to 91 in six weeks.",
    name: "Rahul Menon",
    detail: "UPSC Aspirant · 1st Attempt",
    score: "72 → 91",
    image: "/testimonials/rahul.svg",
  },
  {
    quote:
      "I feared CSAT. The way mentors broke it down made me consistently score 80+ in practice.",
    name: "Ananya Kulkarni",
    detail: "Engineering background",
    score: "CSAT now 80+",
    image: "/testimonials/ananya.svg",
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
              <div className="flex items-center gap-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 rounded-2xl border border-border object-cover"
                />
                <div>
                  <p className="font-semibold text-text">{testimonial.name}</p>
                  <p className="text-xs text-text-muted">{testimonial.detail}</p>
                  <p className="mt-1 inline-flex rounded-full bg-primary-light px-2.5 py-1 text-[11px] font-semibold text-primary">
                    {testimonial.score}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-base leading-relaxed text-text sm:text-lg">“{testimonial.quote}”</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
