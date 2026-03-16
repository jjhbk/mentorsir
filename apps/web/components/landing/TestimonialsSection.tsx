const TESTIMONIALS = [
  {
    quote: "The daily accountability log changed everything. I finally stopped lying to myself about how many hours I actually studied.",
    name: "Priya S.",
    detail: "UPSC Aspirant · 2nd Attempt",
  },
  {
    quote: "Rohit Sir's mindset sessions helped me stop panicking in mock tests. My score went from 72 to 91 in 6 weeks.",
    name: "Rahul M.",
    detail: "UPSC Aspirant · 1st Attempt",
  },
  {
    quote: "I was terrified of CSAT. The IIT faculty broke it down so simply that I'm now consistently scoring 80+ in practice tests.",
    name: "Ananya K.",
    detail: "Engineering background",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      style={{ backgroundColor: "#FDFBF7", borderBottom: "1px solid #E4DCCF" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-24">
        {/* Label */}
        <p
          className="text-xs font-semibold uppercase mb-16"
          style={{ color: "#9C6B2E", letterSpacing: "0.22em" }}
        >
          Student voices
        </p>

        <div className="grid md:grid-cols-3 gap-0">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="py-4"
              style={{
                paddingRight: i < 2 ? "clamp(20px, 4vw, 48px)" : 0,
                paddingLeft: i > 0 ? "clamp(20px, 4vw, 48px)" : 0,
                borderRight: i < 2 ? "1px solid #E4DCCF" : "none",
              }}
            >
              {/* Opening quote as design element */}
              <p
                className="font-display font-black leading-none mb-6 select-none"
                style={{ fontSize: "80px", color: "#F0EBE1", lineHeight: 0.8 }}
                aria-hidden
              >
                &ldquo;
              </p>
              <p
                className="font-display font-medium leading-relaxed mb-8"
                style={{ fontSize: "clamp(16px, 1.6vw, 20px)", color: "#1C1710", letterSpacing: "-0.01em" }}
              >
                {t.quote}
              </p>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1C1710" }}>{t.name}</p>
                <p className="text-xs mt-0.5" style={{ color: "#8B7B6E" }}>{t.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
