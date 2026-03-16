"use client";
import { PRICING } from "@/lib/constants";

export default function PricingSection() {
  return (
    <section
      id="pricing"
      style={{ backgroundColor: "#F6F2EB", borderBottom: "1px solid #E4DCCF" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-24">
        {/* Header */}
        <p
          className="text-xs font-semibold uppercase mb-4"
          style={{ color: "#9C6B2E", letterSpacing: "0.22em" }}
        >
          Pricing
        </p>
        <h2
          className="font-display font-bold mb-6"
          style={{
            fontSize: "clamp(32px, 5vw, 60px)",
            color: "#1C1710",
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
          }}
        >
          One price.<br />Everything included.
        </h2>
        <p className="text-base mb-16" style={{ color: "#8B7B6E", maxWidth: "54ch" }}>
          GS + CSAT + Current Affairs + personalised mentorship. What would cost{" "}
          <span style={{ textDecoration: "line-through", color: "#C4B8AA" }}>
            ₹{PRICING.original.toLocaleString("en-IN")}
          </span>{" "}
          individually is bundled at a {PRICING.discount}% reduction.
        </p>

        {/* Pricing layout */}
        <div
          className="grid md:grid-cols-2 gap-0 border"
          style={{ borderColor: "#E4DCCF", borderRadius: "4px", overflow: "hidden" }}
        >
          {/* Previous batch */}
          <div
            className="p-10 flex flex-col justify-between"
            style={{ borderRight: "1px solid #E4DCCF", backgroundColor: "#FDFBF7" }}
          >
            <div>
              <p className="text-xs font-semibold uppercase mb-8" style={{ color: "#8B7B6E", letterSpacing: "0.16em" }}>
                Previous batch students
              </p>
              <div className="flex items-baseline gap-2 mb-3">
                <span
                  className="font-display font-bold"
                  style={{ fontSize: "clamp(52px, 7vw, 72px)", color: "#1C1710", letterSpacing: "-0.04em", lineHeight: 1 }}
                >
                  ₹{PRICING.returning.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-sm mb-10" style={{ color: "#8B7B6E" }}>
                Save ₹{(PRICING.original - PRICING.returning).toLocaleString("en-IN")} from individual pricing
              </p>
            </div>
            <a
              href="/enroll"
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px 24px",
                border: "1.5px solid #1C1710",
                borderRadius: "4px",
                fontWeight: 600,
                fontSize: "14px",
                color: "#1C1710",
                textDecoration: "none",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#1C1710";
                e.currentTarget.style.color = "#FDFBF7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#1C1710";
              }}
            >
              Enroll now
            </a>
          </div>

          {/* New students — featured */}
          <div
            className="p-10 flex flex-col justify-between"
            style={{ backgroundColor: "#1A1410" }}
          >
            <div>
              <div className="flex items-center justify-between mb-8">
                <p className="text-xs font-semibold uppercase" style={{ color: "#9C6B2E", letterSpacing: "0.16em" }}>
                  New students
                </p>
                <span
                  className="text-xs font-bold px-3 py-1"
                  style={{
                    backgroundColor: "#9C6B2E",
                    color: "#FDFBF7",
                    borderRadius: "2px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  Recommended
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span
                  className="font-display font-bold"
                  style={{ fontSize: "clamp(52px, 7vw, 72px)", color: "#FDFBF7", letterSpacing: "-0.04em", lineHeight: 1 }}
                >
                  ₹{PRICING.new.toLocaleString("en-IN")}
                </span>
              </div>
              <p className="text-sm mb-10" style={{ color: "rgba(253,251,247,0.4)" }}>
                Save ₹{(PRICING.original - PRICING.new).toLocaleString("en-IN")} from individual pricing
              </p>
            </div>
            <a
              href="/enroll"
              style={{
                display: "block",
                textAlign: "center",
                padding: "14px 24px",
                backgroundColor: "#9C6B2E",
                borderRadius: "4px",
                fontWeight: 600,
                fontSize: "14px",
                color: "#FDFBF7",
                textDecoration: "none",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7A5222")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#9C6B2E")}
            >
              Join the 118+ Club
            </a>
          </div>
        </div>

        {/* Module breakdown */}
        <div
          className="mt-8 flex flex-wrap gap-3 items-center"
          style={{ paddingTop: "24px", borderTop: "1px solid #E4DCCF" }}
        >
          <p className="text-xs" style={{ color: "#C4B8AA", marginRight: "8px" }}>Included:</p>
          {PRICING.modules.map((m) => (
            <div key={m.name} className="flex items-center gap-2">
              <span className="text-xs font-medium" style={{ color: "#8B7B6E" }}>{m.name}</span>
              <span className="text-xs" style={{ color: "#C4B8AA", textDecoration: "line-through" }}>
                ₹{m.price.toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-4" style={{ color: "#C4B8AA" }}>
          7-day refund window · Only for serious aspirants
        </p>
      </div>
    </section>
  );
}
