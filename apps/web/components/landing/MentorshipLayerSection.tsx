import { MENTORSHIP_FEATURES } from "@/lib/constants";

export default function MentorshipLayerSection() {
  return (
    <section
      id="mentorship"
      style={{ backgroundColor: "#1A1410", borderBottom: "1px solid #2E2820" }}
    >
      <div className="max-w-6xl mx-auto px-6 py-24">
        {/* Header */}
        <div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 pb-8"
          style={{ borderBottom: "1px solid #2E2820" }}
        >
          <div>
            <p
              className="text-xs font-semibold uppercase mb-4"
              style={{ color: "#9C6B2E", letterSpacing: "0.22em" }}
            >
              The mentorship layer
            </p>
            <h2
              className="font-display font-bold"
              style={{
                fontSize: "clamp(32px, 5vw, 60px)",
                color: "#FDFBF7",
                letterSpacing: "-0.03em",
                lineHeight: 1.08,
              }}
            >
              Content alone<br />
              won&apos;t clear Prelims.
            </h2>
          </div>
          <p
            className="text-base leading-relaxed max-w-xs"
            style={{ color: "rgba(253,251,247,0.4)" }}
          >
            Direction, daily discipline, and a mentor who actually tracks you — that&apos;s what separates those who clear from those who just study.
          </p>
        </div>

        {/* Feature list — numbered */}
        <div className="grid md:grid-cols-2 gap-0">
          {MENTORSHIP_FEATURES.map((f, i) => (
            <div
              key={f.title}
              className="py-8"
              style={{
                paddingRight: i % 2 === 0 ? "clamp(20px, 4vw, 64px)" : 0,
                paddingLeft: i % 2 === 1 ? "clamp(20px, 4vw, 64px)" : 0,
                borderRight: i % 2 === 0 ? "1px solid #2E2820" : "none",
                borderBottom: i < 2 ? "1px solid #2E2820" : "none",
              }}
            >
              <p
                className="font-display font-bold mb-4"
                style={{
                  fontSize: "clamp(40px, 5vw, 52px)",
                  color: "#9C6B2E",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  opacity: 0.2,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </p>
              <h3
                className="font-display font-semibold mb-3"
                style={{ fontSize: "20px", color: "#FDFBF7", letterSpacing: "-0.02em" }}
              >
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "rgba(253,251,247,0.45)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
