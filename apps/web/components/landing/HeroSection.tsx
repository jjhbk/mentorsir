export default function HeroSection() {
  return (
    <section
      className="relative flex flex-col justify-end overflow-hidden"
      style={{ backgroundColor: "#1A1410", minHeight: "100svh", paddingTop: "56px" }}
    >
      {/* Ghost watermark — the 118 score */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
      >
        <span
          className="font-display font-black leading-none select-none"
          style={{
            fontSize: "clamp(160px, 28vw, 420px)",
            color: "transparent",
            WebkitTextStroke: "1px rgba(255,255,255,0.04)",
            letterSpacing: "-0.06em",
          }}
        >
          118+
        </span>
      </div>

      {/* Bottom fade */}
      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(26,20,16,1) 0%, transparent 100%)" }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-20 pt-32 w-full">
        <p
          className="anim-fade-in text-xs font-semibold uppercase mb-8"
          style={{ color: "#9C6B2E", letterSpacing: "0.22em" }}
        >
          PTP 2.0 — UPSC Prelims 2026
        </p>

        <h1
          className="font-display font-bold anim-fade-up d-100"
          style={{
            fontSize: "clamp(42px, 7vw, 96px)",
            lineHeight: 1.04,
            letterSpacing: "-0.035em",
            color: "#FDFBF7",
            maxWidth: "14ch",
          }}
        >
          The structure to{" "}
          <em style={{ color: "#9C6B2E", fontStyle: "italic" }}>crack</em>{" "}
          Prelims.
        </h1>

        <p
          className="anim-fade-up d-200 mt-8 text-lg leading-relaxed"
          style={{ color: "rgba(253,251,247,0.5)", maxWidth: "54ch" }}
        >
          Mentorship by 118+ scorers and IIT/IIM graduates — GS, CSAT, and Current
          Affairs with a daily accountability system built for serious aspirants.
        </p>

        <div className="anim-fade-up d-300 mt-10 flex flex-wrap items-center gap-6">
          <a
            href="/enroll"
            className="inline-flex items-center gap-2.5 font-semibold text-sm transition-colors hover:bg-[#7A5222]"
            style={{
              backgroundColor: "#9C6B2E",
              color: "#FDFBF7",
              padding: "16px 32px",
              borderRadius: "4px",
              textDecoration: "none",
            }}
          >
            Begin enrollment <span>→</span>
          </a>
          <a
            href="#program"
            className="text-sm font-medium transition-colors hover:text-[rgba(253,251,247,0.75)]"
            style={{
              color: "rgba(253,251,247,0.4)",
              textDecoration: "none",
              borderBottom: "1px solid rgba(253,251,247,0.12)",
              paddingBottom: "2px",
            }}
          >
            See the program
          </a>
        </div>

        {/* Proof strip */}
        <div
          className="anim-fade-up d-400 mt-16 pt-8 flex flex-wrap gap-x-12 gap-y-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {[
            ["118+", "Top Prelims score by our faculty"],
            ["3", "Selected candidates as mentors"],
            ["12 wk", "Structured programme"],
            ["₹6,999", "All-inclusive pricing"],
          ].map(([val, label]) => (
            <div key={val}>
              <p className="font-display font-bold text-2xl" style={{ color: "#FDFBF7", letterSpacing: "-0.04em" }}>
                {val}
              </p>
              <p className="text-xs mt-1 font-medium" style={{ color: "rgba(253,251,247,0.3)" }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
