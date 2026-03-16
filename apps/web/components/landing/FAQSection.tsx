import { FAQS } from "@/lib/constants";

export default function FAQSection() {
  return (
    <section
      id="faq"
      style={{ backgroundColor: "#F6F2EB", borderBottom: "1px solid #E4DCCF" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div
          className="grid md:grid-cols-[280px_1fr] gap-16"
        >
          {/* Sticky label column */}
          <div>
            <p
              className="text-xs font-semibold uppercase mb-4"
              style={{ color: "#9C6B2E", letterSpacing: "0.22em" }}
            >
              FAQ
            </p>
            <h2
              className="font-display font-bold"
              style={{ fontSize: "clamp(28px, 4vw, 44px)", color: "#1C1710", letterSpacing: "-0.03em", lineHeight: 1.1 }}
            >
              Common questions
            </h2>
          </div>

          {/* Accordion column */}
          <div>
            {FAQS.map((faq, i) => (
              <details
                key={faq.q}
                className="group"
                style={{ borderTop: "1px solid #E4DCCF" }}
              >
                <summary
                  className="flex items-start justify-between gap-6 py-5 cursor-pointer list-none"
                  style={{ userSelect: "none" }}
                >
                  <span
                    className="text-base font-medium leading-snug"
                    style={{ color: "#1C1710" }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="shrink-0 mt-0.5 text-lg leading-none transition-transform duration-200 group-open:rotate-45"
                    style={{ color: "#8B7B6E" }}
                  >
                    +
                  </span>
                </summary>
                <div
                  className="pb-6 text-sm leading-relaxed"
                  style={{ color: "#8B7B6E" }}
                >
                  {faq.a}
                </div>
              </details>
            ))}
            <div style={{ borderTop: "1px solid #E4DCCF" }} />
          </div>
        </div>
      </div>
    </section>
  );
}
