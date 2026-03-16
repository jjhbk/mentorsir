"use client";
export default function CTAFooterSection() {
  return (
    <footer style={{ backgroundColor: "#1A1410" }}>
      {/* CTA block */}
      <div className="max-w-6xl mx-auto px-6 py-28">
        <p
          className="text-xs font-semibold uppercase mb-6"
          style={{ color: "#9C6B2E", letterSpacing: "0.22em" }}
        >
          Enrollment open
        </p>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <h2
            className="font-display font-bold"
            style={{
              fontSize: "clamp(36px, 6vw, 80px)",
              color: "#FDFBF7",
              letterSpacing: "-0.035em",
              lineHeight: 1.05,
              maxWidth: "16ch",
            }}
          >
            Ready to join the{" "}
            <em style={{ color: "#9C6B2E" }}>118+ Club?</em>
          </h2>

          <div className="flex flex-col gap-5 md:items-end shrink-0">
            <p
              className="text-base leading-relaxed max-w-xs"
              style={{ color: "rgba(253,251,247,0.4)" }}
            >
              Seats are limited to ensure every student gets personalised attention. Enrollment takes five minutes.
            </p>
            <a
              href="/enroll"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "#9C6B2E",
                color: "#FDFBF7",
                padding: "16px 32px",
                borderRadius: "4px",
                fontWeight: 600,
                fontSize: "15px",
                textDecoration: "none",
                transition: "background-color 0.15s ease",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#7A5222")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#9C6B2E")}
            >
              Begin enrollment <span style={{ fontSize: "18px" }}>→</span>
            </a>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <div
        className="max-w-6xl mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-4"
        style={{ borderTop: "1px solid #2E2820" }}
      >
        <p className="text-sm font-display font-bold" style={{ color: "rgba(253,251,247,0.25)", letterSpacing: "-0.02em" }}>
          MentorSir
        </p>
        <div className="flex flex-wrap gap-6">
          {[
            ["YouTube", "#"],
            ["Telegram", "#"],
            ["Instagram", "#"],
            ["FAQ", "#faq"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="text-xs transition-colors"
              style={{ color: "rgba(253,251,247,0.25)", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(253,251,247,0.6)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(253,251,247,0.25)")}
            >
              {label}
            </a>
          ))}
        </div>
        <p className="text-xs" style={{ color: "rgba(253,251,247,0.2)" }}>
          © 2026 MentorSir. Smart Structure. Right Guidance. Confident Prelims.
        </p>
      </div>
    </footer>
  );
}
